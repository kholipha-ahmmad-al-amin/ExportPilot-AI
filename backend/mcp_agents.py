"""Five-stage trade pipeline with FastMCP tool registration when available."""

import asyncio
import json
import logging
import math
import re
import time
import uuid
from copy import deepcopy
from pathlib import Path
from typing import Any, AsyncIterator

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, ConfigDict, Field, model_validator
from starlette.concurrency import run_in_threadpool

from backend.auth import get_current_active_user
from backend.database import SessionLocal
from backend.hybrid_rag import knowledge_graph
from backend.models import ComplianceAudit, GlobalBuyer, TradeDeal, User
from backend.open_source_parsers import clean_studio_image, extract_pdf_data
from backend.seed_data import PRESETS_DATA
from backend.sovereignty import mask_bangla_pii

logger = logging.getLogger("exportpilot.pipeline")
router = APIRouter(prefix="/export", tags=["Trade Analysis"])
pipeline_router = APIRouter(prefix="/mcp", tags=["FastMCP Autonomous Agents"])
BASE_DIR = Path(__file__).resolve().parent.parent
MAX_UPLOAD_BYTES = 10 * 1024 * 1024

try:
    from fastmcp import FastMCP

    mcp_server = FastMCP("ExportPilot Trade Agents")
except ImportError:
    FastMCP = None
    mcp_server = None


class PipelineRequest(BaseModel):
    model_config = ConfigDict(extra="allow", str_strip_whitespace=True)

    preset_id: str | None = Field(default=None, max_length=100)
    deal_data: dict[str, Any] | None = None
    voice_text_bn: str | None = Field(default=None, max_length=20000)

    @model_validator(mode="after")
    def limit_payload_size(self):
        if len(json.dumps(self.model_dump(), ensure_ascii=False, default=str).encode("utf-8")) > 64000:
            raise ValueError("Pipeline request exceeds the 64 KB limit")
        return self


def _numeric(value: Any, default: float = 0.0, *, minimum: float | None = None) -> float:
    try:
        result = float(value)
    except (TypeError, ValueError, OverflowError):
        return default
    if not math.isfinite(result) or (minimum is not None and result < minimum):
        return default
    return result


def _preset_for(preset_id: str | None) -> dict:
    selected_id = preset_id or PRESETS_DATA[0]["preset_id"]
    for preset in PRESETS_DATA:
        if preset["preset_id"] == selected_id:
            return deepcopy(preset)
    raise HTTPException(status_code=404, detail="Trade preset not found")


def _deal_from_request(req: PipelineRequest) -> tuple[dict, str, dict[str, str]]:
    outer = req.model_dump(exclude_none=True)
    supplied = dict(outer.pop("deal_data", {}) or {})
    supplied.update(outer)
    preset_id = supplied.get("preset_id") or req.preset_id or PRESETS_DATA[0]["preset_id"]
    deal = _preset_for(preset_id)

    # Product and audit fields can be changed by the caller. Buyer catalog entries remain server-owned.
    for field in ("title_bn", "title_en", "hs_chapter_name"):
        if field in supplied:
            value = supplied[field]
            if not isinstance(value, str) or len(value) > 500:
                raise HTTPException(status_code=422, detail=f"{field} must be text of at most 500 characters")
            deal[field] = value

    if "hs_code_8digit" in supplied:
        code = supplied["hs_code_8digit"]
        digits = re.sub(r"\D", "", str(code))
        if not isinstance(code, str) or not re.fullmatch(r"[0-9.\-\s]{6,20}", code) or len(digits) not in {6, 8, 10}:
            raise HTTPException(status_code=422, detail="hs_code_8digit must contain a 6, 8, or 10 digit tariff code")
        deal["hs_code_8digit"] = code

    numeric_limits = {
        "unit_cost_bdt": (1_000_000_000_000, False),
        "buying_house_offer_bdt": (1_000_000_000_000, False),
        "recommended_fob_price_usd": (1_000_000_000_000, False),
        "recommended_fob_price_bdt": (1_000_000_000_000, False),
        "monthly_capacity_units": (1_000_000_000, True),
        "middleman_margin_saved_pct": (100, False),
        "extra_profit_per_shipment_usd": (1_000_000_000_000, False),
        "cbam_scope2_co2_kg_per_unit": (1_000_000_000, False),
        "eu_benchmark_co2_kg_per_unit": (1_000_000_000, False),
        "compliance_readiness_score": (100, True),
    }
    for field, (maximum, integer_value) in numeric_limits.items():
        if field in supplied:
            value = _numeric(supplied[field], math.nan, minimum=0)
            if not math.isfinite(value) or value > maximum or (integer_value and not value.is_integer()):
                raise HTTPException(status_code=422, detail=f"{field} is outside the supported range")
            deal[field] = int(value) if integer_value else value

    if "required_certificates" in supplied:
        certificates = supplied["required_certificates"]
        if not isinstance(certificates, list) or len(certificates) > 100 or any(
            not isinstance(item, str) or len(item) > 300 for item in certificates
        ):
            raise HTTPException(status_code=422, detail="required_certificates must be a list of short text values")
        deal["required_certificates"] = certificates

    if "uploaded_doc_metrics" in supplied:
        metrics = supplied["uploaded_doc_metrics"]
        metric_keys = {
            "peak_kwh",
            "offpeak_kwh",
            "total_kwh",
            "power_factor",
            "grid_emission_factor_kg_per_kwh",
            "scope2_total_kg_co2e",
            "scope2_per_unit_kg_co2e",
            "eu_cbam_benchmark_limit_kg",
            "net_payable_bdt",
        }
        if not isinstance(metrics, dict):
            raise HTTPException(status_code=422, detail="uploaded_doc_metrics must be an object")
        deal["uploaded_doc_metrics"] = {
            key: _numeric(value, 0, minimum=0)
            for key, value in metrics.items()
            if key in metric_keys
        }
    voice_text = supplied.get("voice_text_bn") or ""
    if not isinstance(voice_text, str):
        raise HTTPException(status_code=422, detail="voice_text_bn must be text")
    if len(voice_text) > 20000:
        raise HTTPException(status_code=413, detail="Voice text exceeds the 20 KB limit")
    private_fields = {}
    for field in ("factory_name", "owner_name", "owner_email", "owner_phone", "trade_license", "bank_account"):
        value = supplied.get(field)
        if isinstance(value, str) and len(value) <= 1000:
            private_fields[field] = value
    return deal, voice_text, private_fields


def _local_redaction(value: str) -> tuple[str, int]:
    redacted, count, _entities = mask_bangla_pii(value)
    email_pattern = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)
    phone_pattern = re.compile(r"(?<!\w)(?:\+?\d[\d ()-]{7,}\d)(?!\w)")
    redacted, email_count = email_pattern.subn("[REDACTED_EMAIL]", redacted)
    redacted, phone_count = phone_pattern.subn("[REDACTED_PHONE]", redacted)
    return redacted, count + email_count + phone_count


async def agent_1_data_sovereignty(context: dict[str, Any]) -> dict:
    """Redact identity and contact information locally before downstream agents run."""
    voice = context.get("voice_text_bn", "")
    redacted_voice, pii_count = _local_redaction(voice)
    private_fields = ("factory_name", "owner_name", "owner_email", "owner_phone", "trade_license", "bank_account")
    redacted_fields: dict[str, str] = {}
    for field in private_fields:
        value = context.get(field)
        if isinstance(value, str) and value:
            if field == "owner_name":
                redacted_value, field_count = "[REDACTED_PERSON]", 1
            elif field in {"trade_license", "bank_account"}:
                redacted_value, field_count = f"[REDACTED_{field.upper()}]", 1
            else:
                redacted_value, field_count = _local_redaction(value)
            redacted_fields[field] = redacted_value
            pii_count += field_count
    return {
        "agent_id": 1,
        "agent_name": "Data Sovereignty and KYC Redactor",
        "status": "COMPLETED",
        "summary": "Sensitive identity and contact values were screened and redacted locally before matching.",
        "redacted_voice_text": redacted_voice,
        "redacted_fields": redacted_fields,
        "pii_redactions": pii_count,
        "processing_location": "local",
    }


async def agent_2_hs_tariff_classifier(context: dict[str, Any]) -> dict:
    """Validate the supplied HS candidate against the local product catalog."""
    deal = context["deal"]
    raw_code = str(deal.get("hs_code_8digit") or "")
    digits = re.sub(r"\D", "", raw_code)
    valid = len(digits) in {6, 8, 10}
    expected_digits = re.sub(r"\D", "", str(context["preset"].get("hs_code_8digit", "")))
    heading_match = valid and len(digits) >= 6 and digits[:6] == expected_digits[:6]
    catalog_match = valid and len(digits) >= 8 and digits[:8] == expected_digits[:8]
    buyers = context["preset"].get("matched_buyers", []) if catalog_match else []
    tariff_options = [
        {
            "buyer_id": buyer.get("buyer_id"),
            "market": buyer.get("country_code"),
            "trade_scheme": buyer.get("trade_scheme"),
            "estimated_tariff_pct": _numeric(buyer.get("tariff_for_bangladesh_pct")),
            "catalog_source": "configured_exportpilot_catalog",
        }
        for buyer in buyers
    ]
    return {
        "agent_id": 2,
        "agent_name": "WCO HS Code and Tariff Classifier",
        "status": "COMPLETED",
        "summary": "The HS candidate and configured destination tariff rows were checked against the local catalog.",
        "hs_code_candidate": raw_code,
        "wco_hs_6_digit": digits[:6] if len(digits) >= 6 else None,
        "national_extension": digits[6:] if len(digits) > 6 else None,
        "classification_status": "catalog_match" if catalog_match else ("national_extension_required" if heading_match else "review_required"),
        "catalog_match": catalog_match,
        "confidence": 0.98 if catalog_match else (0.72 if heading_match else (0.35 if valid else 0.0)),
        "tariff_options": tariff_options,
        "source_note": "Indicative catalog data only. Confirm the national tariff line, origin rule, and current preference eligibility with customs authorities.",
    }


def _read_catalog_buyers(hs_code: str, fallback: list[dict]) -> list[dict]:
    expected = re.sub(r"\D", "", hs_code)
    try:
        with SessionLocal() as db:
            records = db.query(GlobalBuyer).all()
            matches = [
                {
                    "buyer_id": row.id,
                    "company_name": row.company_name,
                    "city": row.city,
                    "country": row.country,
                    "country_code": row.country_code,
                    "tariff_for_bangladesh_pct": row.tariff_for_bangladesh_pct,
                    "tariff_for_competitors_pct": row.tariff_for_competitors_pct,
                    "trade_scheme": row.trade_scheme,
                    "typical_moq_units": row.typical_moq_units,
                    "target_fob_usd": row.target_fob_usd,
                    "annual_import_usd": row.annual_import_usd,
                }
                for row in records
                if re.sub(r"\D", "", row.hs_code_8digit)[:8] == expected[:8] and len(expected) >= 8
            ]
            return matches or deepcopy(fallback)
    except Exception:
        logger.exception("Buyer catalog lookup failed; using configured preset buyers")
        return deepcopy(fallback)


async def agent_3_graphrag_buyer_matchmaker(context: dict[str, Any]) -> dict:
    """Resolve likely catalog buyers and produce the product trade subgraph."""
    deal = context["deal"]
    preset = context["preset"]
    expected = re.sub(r"\D", "", str(preset.get("hs_code_8digit", "")))
    supplied = re.sub(r"\D", "", str(deal.get("hs_code_8digit", "")))
    code_match = len(supplied) >= 8 and supplied[:8] == expected[:8]
    fallback = preset.get("matched_buyers", []) if code_match else []
    buyer_lookup = asyncio.to_thread(_read_catalog_buyers, str(deal.get("hs_code_8digit", "")), fallback)
    if code_match:
        buyers, graph = await asyncio.gather(
            buyer_lookup,
            asyncio.to_thread(knowledge_graph.get_react_flow_subgraph, preset["preset_id"]),
        )
    else:
        buyers = await buyer_lookup
        graph = {"root_node": None, "total_nodes": 0, "total_edges": 0, "nodes": [], "edges": []}
    return {
        "agent_id": 3,
        "agent_name": "GraphRAG Buyer Matchmaker",
        "status": "COMPLETED",
        "summary": f"The local trade graph was traversed and {len(buyers)} catalog buyer matches were prepared.",
        "buyers_count": len(buyers),
        "matched_buyers": buyers,
        "graph_data": graph,
        "hs_catalog_match": code_match,
        "match_source": "local_trade_graph_and_configured_catalog",
    }


async def agent_4_cbam_esg_auditor(context: dict[str, Any]) -> dict:
    """Screen configured emissions data and ESG evidence against the local benchmark."""
    deal = context["deal"]
    emissions = _numeric(deal.get("cbam_scope2_co2_kg_per_unit"), minimum=0)
    benchmark = _numeric(deal.get("eu_benchmark_co2_kg_per_unit"), minimum=0)
    has_benchmark = benchmark > 0
    within_benchmark = has_benchmark and emissions <= benchmark
    return {
        "agent_id": 4,
        "agent_name": "EU CBAM Carbon and ESG Auditor",
        "status": "COMPLETED",
        "summary": "Scope 2 intensity and the configured product benchmark were compared; applicability and evidence remain subject to review.",
        "scope2_co2_kg_per_unit": emissions,
        "benchmark_co2_kg_per_unit": benchmark,
        "verdict": "WITHIN_CONFIGURED_BENCHMARK" if within_benchmark else "REVIEW_REQUIRED",
        "compliance_readiness_score": int(_numeric(deal.get("compliance_readiness_score"), 0, minimum=0)),
        "required_certificates": deal.get("required_certificates", []),
        "applicability_note": "This is a screening result, not a legal CBAM determination. Confirm CN code coverage, reporting boundaries, and current EU rules.",
    }


async def agent_5_invoice_contract_synthesizer(context: dict[str, Any]) -> dict:
    """Draft offer language, invoice fields, and non-binding deal terms."""
    deal = context["deal"]
    buyers = context.get("matched_buyers", [])
    primary_buyer = buyers[0] if buyers else {}
    buyer_name = primary_buyer.get("company_name", "Purchase Team")
    product_name = deal.get("title_en", "Export Product")
    fob_price = _numeric(deal.get("recommended_fob_price_usd"), minimum=0)
    capacity = int(_numeric(deal.get("monthly_capacity_units"), minimum=0))
    carbon = _numeric(deal.get("cbam_scope2_co2_kg_per_unit"), minimum=0)
    scheme = primary_buyer.get("trade_scheme", "applicable trade preference, subject to verification")
    pitch = {
        "english": (
            f"Subject: Direct Bangladesh FOB Offer: {product_name}\n\n"
            f"Dear {buyer_name},\n\nWe invite you to review a direct factory offer for {product_name}. "
            f"Indicative price is USD {fob_price:.2f} per unit FOB Chattogram, with stated capacity of {capacity:,} units per month. "
            f"The listed tariff program is {scheme}; eligibility must be confirmed for the final HS code and origin documents. "
            f"Configured Scope 2 intensity is {carbon:.3f} kg CO2e per unit.\n\nRegards,\nExport Team"
        ),
        "german": (
            f"Betreff: Direktes FOB-Angebot aus Bangladesch: {product_name}\n\n"
            f"Sehr geehrtes Einkaufsteam von {buyer_name},\n\nwir bieten {product_name} zu einem Richtpreis von "
            f"USD {fob_price:.2f} pro Einheit FOB Chattogram an. Mengen, Lieferzeit und Zollpraeferenzen sind vor Vertragsabschluss zu bestaetigen.\n\nMit freundlichen Gruessen"
        ),
        "japanese": (
            f"件名: バングラデシュからのFOB参考見積: {product_name}\n\n"
            f"{buyer_name} 御中\n\n{product_name}を1点あたりUSD {fob_price:.2f} FOB Chattogramでご提案します。"
            "数量、納期、関税優遇の適用は正式契約前に確認が必要です。\n\nよろしくお願いいたします。"
        ),
    }
    deal_id = deal.get("preset_id", "trade-deal")
    return {
        "agent_id": 5,
        "agent_name": "Proforma Invoice and Deal Contract Synthesizer",
        "status": "COMPLETED",
        "summary": "A multilingual buyer offer and structured, non-binding invoice and contract draft were prepared.",
        "pitch_templates": pitch,
        "proforma_invoice_draft": {
            "seller": deal.get("factory_name", "Factory details to be completed"),
            "buyer": buyer_name,
            "product": product_name,
            "hs_code_candidate": deal.get("hs_code_8digit"),
            "quantity": None,
            "unit_price_usd": fob_price,
            "incoterm": "FOB Chattogram, Incoterms edition to be confirmed",
            "payment_terms": "To be agreed by both parties",
            "delivery_date": "To be agreed by both parties",
            "draft_only": True,
        },
        "contract_terms_draft": {
            "parties": {"seller": "Factory details to be completed", "buyer": buyer_name},
            "product": product_name,
            "price_basis": "FOB Chattogram",
            "unit_price_usd": fob_price,
            "quantity": "To be agreed",
            "quality_and_inspection": "Specification and inspection process to be agreed in writing",
            "origin_and_tariff": "Subject to HS classification, origin qualification, and buyer-country customs confirmation",
            "governing_law_and_dispute_resolution": "To be agreed by both parties",
            "draft_only": True,
            "deal_reference": deal_id,
        },
        "pdf_downloads": {
            "proforma_invoice": f"/api/v1/reports/download/proforma_invoice/{deal_id}",
            "cbam_certificate": f"/api/v1/reports/download/cbam_certificate/{deal_id}",
            "buyer_catalog": f"/api/v1/reports/download/buyer_catalog/{deal_id}",
        },
    }


_agent_steps = [
    (agent_1_data_sovereignty, "Local KYC screening is starting."),
    (agent_2_hs_tariff_classifier, "HS code candidate and tariff catalog review is starting."),
    (agent_3_graphrag_buyer_matchmaker, "Local trade graph and buyer matching are starting."),
    (agent_4_cbam_esg_auditor, "Carbon benchmark and ESG evidence screening are starting."),
    (agent_5_invoice_contract_synthesizer, "Invoice and draft deal documents are being prepared."),
]

if mcp_server is not None:
    for _agent_fn, _description in _agent_steps:
        try:
            mcp_server.tool(name=_agent_fn.__name__, description=_agent_fn.__doc__ or _description)(_agent_fn)
        except Exception:
            logger.exception("Could not register FastMCP tool %s", _agent_fn.__name__)


async def _run_pipeline_events(
    deal: dict,
    voice_text: str,
    user_id: str,
    private_fields: dict[str, str] | None = None,
) -> AsyncIterator[dict]:
    started_at = time.perf_counter()
    preset = _preset_for(deal["preset_id"])
    context: dict[str, Any] = {
        "deal": deal,
        "preset": preset,
        "voice_text_bn": voice_text,
        "user_id": user_id,
    }
    context.update(private_fields or {})
    outputs: list[dict] = []
    yield {
        "event": "pipeline_started",
        "data": {"preset_id": deal["preset_id"], "agent_count": len(_agent_steps)},
    }

    for agent_fn, progress_summary in _agent_steps:
        agent_id = len(outputs) + 1
        yield {
            "event": "agent_started",
            "data": {
                "agent_id": agent_id,
                "agent_name": agent_fn.__name__.replace("agent_", "").replace("_", " "),
                "status": "RUNNING",
                "summary": progress_summary,
            },
        }
        agent_started_at = time.perf_counter()
        try:
            output = await asyncio.wait_for(agent_fn(context), timeout=15.0)
        except asyncio.TimeoutError as exc:
            raise RuntimeError(f"Agent {agent_id} exceeded its execution limit") from exc
        except Exception as exc:
            logger.exception("Pipeline agent %s failed", agent_id)
            raise RuntimeError(f"Agent {agent_id} failed") from exc
        output["latency_ms"] = round((time.perf_counter() - agent_started_at) * 1000, 2)
        outputs.append(output)
        if agent_id == 1:
            context["redacted_voice_text"] = output["redacted_voice_text"]
            context["pii_redactions"] = output["pii_redactions"]
            context.pop("voice_text_bn", None)
            for field in ("factory_name", "owner_name", "owner_email", "owner_phone", "trade_license", "bank_account"):
                context.pop(field, None)
        elif agent_id == 3:
            context["matched_buyers"] = output["matched_buyers"]
            context["graph_data"] = output["graph_data"]
        elif agent_id == 4:
            context["compliance_audit"] = output
        yield {"event": "agent_step", "data": output}
        await asyncio.sleep(0)

    synthesizer = outputs[-1]
    deal_package = deepcopy(deal)
    deal_package["graph_data"] = context.get("graph_data")
    deal_package["matched_buyers"] = context.get("matched_buyers", [])
    deal_package["pitch_templates"] = synthesizer["pitch_templates"]
    deal_package["pdf_downloads"] = synthesizer["pdf_downloads"]
    final = {
        "status": "success",
        "preset_id": deal["preset_id"],
        "agent_count": len(outputs),
        "agents": outputs,
        "deal_package": deal_package,
        "proforma_invoice_draft": synthesizer["proforma_invoice_draft"],
        "contract_terms_draft": synthesizer["contract_terms_draft"],
        "pii_redactions": context.get("pii_redactions", 0),
        "latency_ms": round((time.perf_counter() - started_at) * 1000, 2),
    }
    yield {"event": "pipeline_completed", "data": final}


async def _execute_pipeline(
    deal: dict,
    voice_text: str,
    user_id: str,
    private_fields: dict[str, str] | None = None,
) -> dict:
    result = None
    async for item in _run_pipeline_events(deal, voice_text, user_id, private_fields):
        if item["event"] == "pipeline_completed":
            result = item["data"]
    if result is None:
        raise RuntimeError("Pipeline did not produce a result")
    return result


async def run_five_agent_pipeline(preset_id: str, voice_text_bn: str = "") -> dict:
    """Run the five trade agents through the FastMCP server coordinator tool."""
    deal = _preset_for(preset_id)
    if len(voice_text_bn) > 20000:
        raise ValueError("Voice text exceeds the 20 KB limit")
    return await _execute_pipeline(deal, voice_text_bn, "authenticated_mcp_client")


if mcp_server is not None:
    try:
        mcp_server.tool(name="run_five_agent_pipeline")(run_five_agent_pipeline)
    except Exception:
        logger.exception("Could not register FastMCP pipeline coordinator")


def _persist_pipeline_result(user_id: str, deal: dict, result: dict) -> str:
    agent_results = result.get("agents", [])
    audit_data = next((item for item in agent_results if item.get("agent_id") == 4), {})
    safe_input = {
        "preset_id": deal.get("preset_id"),
        "hs_code_candidate": deal.get("hs_code_8digit"),
        "pii_redactions": result.get("pii_redactions", 0),
    }
    with SessionLocal() as db:
        try:
            record = TradeDeal(
                user_id=user_id,
                preset_id=deal.get("preset_id"),
                status="completed",
                input_json=safe_input,
                result_json=result,
            )
            db.add(record)
            db.flush()
            if audit_data:
                db.add(
                    ComplianceAudit(
                        trade_deal_id=record.id,
                        audit_type="cbam_esg_screening",
                        verdict=audit_data.get("verdict", "REVIEW_REQUIRED"),
                        measured_value=audit_data.get("scope2_co2_kg_per_unit"),
                        reference_value=audit_data.get("benchmark_co2_kg_per_unit"),
                        findings_json={
                            "applicability_note": audit_data.get("applicability_note"),
                            "required_certificates": audit_data.get("required_certificates", []),
                        },
                    )
                )
            db.commit()
            return record.id
        except Exception:
            db.rollback()
            logger.exception("Could not persist completed trade pipeline")
            raise


async def _persist(user_id: str, deal: dict, result: dict) -> str:
    return await run_in_threadpool(_persist_pipeline_result, user_id, deal, result)


@pipeline_router.post("/run-pipeline")
async def run_pipeline(
    req: PipelineRequest,
    current_user: User = Depends(get_current_active_user),
):
    user_id = current_user.id
    deal, voice_text, private_fields = _deal_from_request(req)
    result = await _execute_pipeline(deal, voice_text, user_id, private_fields)
    result["deal_record_id"] = await _persist(current_user.id, deal, result)
    return result


@pipeline_router.get("/run-pipeline-stream")
async def run_pipeline_stream(
    deal_id: str = Query(default="preset_jute_bag", max_length=100),
    current_user: User = Depends(get_current_active_user),
):
    user_id = current_user.id
    deal = _preset_for(deal_id)

    async def event_generator():
        yield ": connected\n\n"
        event_count = 0
        final_result = None
        try:
            async for item in _run_pipeline_events(deal, "", user_id):
                event_count += 1
                if item["event"] == "pipeline_completed":
                    final_result = item["data"]
                data = json.dumps(item["data"], ensure_ascii=False, separators=(",", ":"))
                yield f"id: {event_count}\nevent: {item['event']}\ndata: {data}\n\n"
            if final_result is not None:
                record_id = await _persist(current_user.id, deal, final_result)
                payload = json.dumps({"deal_record_id": record_id}, separators=(",", ":"))
                yield f"event: persistence_complete\ndata: {payload}\n\n"
        except Exception:
            logger.exception("Streaming trade pipeline failed for account %s", user_id)
            data = json.dumps({"status": "failed", "detail": "Pipeline execution failed."})
            yield f"event: error\ndata: {data}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/analyze")
async def analyze_export(
    preset_id: str | None = Form(default=None),
    voice_text_bn: str | None = Form(default=None),
    image: UploadFile | None = File(default=None),
    pdf: UploadFile | None = File(default=None),
    current_user: User = Depends(get_current_active_user),
):
    deal = _preset_for(preset_id)
    user_id = current_user.id
    if voice_text_bn and len(voice_text_bn) > 20000:
        raise HTTPException(status_code=413, detail="Voice text exceeds the 20 KB limit")
    scripts_dir = BASE_DIR / "scripts"
    scripts_dir.mkdir(parents=True, exist_ok=True)

    async def save_upload(upload: UploadFile, allowed_prefix: str, expected_type: str) -> Path:
        if upload.content_type and not upload.content_type.startswith(allowed_prefix):
            raise HTTPException(status_code=415, detail=f"Expected {expected_type} content")
        content = await upload.read(MAX_UPLOAD_BYTES + 1)
        if len(content) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="Uploaded files are limited to 10 MB")
        suffix = ".pdf" if expected_type == "PDF" else ".img"
        path = scripts_dir / f"upload_{uuid.uuid4().hex}{suffix}"
        path.write_bytes(content)
        return path

    if image is not None:
        temp_path = await save_upload(image, "image/", "image")
        try:
            studio_path = await run_in_threadpool(
                clean_studio_image,
                temp_path,
                f"studio_{temp_path.stem}.jpg",
                deal.get("hs_code_8digit", ""),
            )
            deal["studio_image"] = str(studio_path)
            deal["sample_image"] = str(studio_path)
        finally:
            temp_path.unlink(missing_ok=True)

    if pdf is not None:
        temp_path = await save_upload(pdf, "application/pdf", "PDF")
        try:
            parsed_doc = await run_in_threadpool(extract_pdf_data, temp_path)
            metrics = parsed_doc.get("metrics", {})
            deal["uploaded_doc_metrics"] = metrics
            if metrics.get("scope2_per_unit_kg_co2e") is not None:
                deal["cbam_scope2_co2_kg_per_unit"] = metrics["scope2_per_unit_kg_co2e"]
        finally:
            temp_path.unlink(missing_ok=True)

    result = await _execute_pipeline(deal, voice_text_bn or "", user_id)
    result["deal_record_id"] = await _persist(current_user.id, deal, result)
    return {"status": "success", "deal_id": deal["preset_id"], "deal_package": result["deal_package"], "pipeline": result}


@router.get("/stream/{deal_id}")
async def stream_agents(
    deal_id: str,
    current_user: User = Depends(get_current_active_user),
):
    user_id = current_user.id
    deal = _preset_for(deal_id)

    async def event_generator():
        async for item in _run_pipeline_events(deal, "", user_id):
            data = json.dumps(item["data"], ensure_ascii=False, separators=(",", ":"))
            yield f"event: {item['event']}\ndata: {data}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no"},
    )


@router.get("/buyers")
def list_global_buyers(
    country: str | None = Query(default=None),
    cert: str | None = Query(default=None),
    payment: str | None = Query(default=None),
    search: str | None = Query(default=None),
    max_moq: int | None = Query(default=None),
):
    """
    Returns verified international buyers from the Trade Knowledge Graph.
    Supports filtering by destination country, certifications, payment terms, and MOQ.
    """
    buyers = [
        {
            "id": "b001", "company_name": "NordicEco Retail GmbH", "city": "Hamburg", "country": "Germany",
            "segment": "Sustainable Home Goods", "hs_chapters": ["42", "53"],
            "tariff_bd_pct": 0.0, "trade_scheme": "EU EBA", "moq": 5000, "fob_target_usd": 3.40,
            "annual_import_usd": 1450000, "payment_terms": ["L/C", "T/T"], "certs": ["CBAM", "BSCI", "REX"],
            "contact_ready": True, "preset_id": "preset_jute_bag"
        },
        {
            "id": "b002", "company_name": "Bayern Craft Imports AG", "city": "Munich", "country": "Germany",
            "segment": "Artisan Ceramics & Decor", "hs_chapters": ["69"],
            "tariff_bd_pct": 0.0, "trade_scheme": "EU EBA", "moq": 2000, "fob_target_usd": 11.20,
            "annual_import_usd": 870000, "payment_terms": ["CAD", "L/C"], "certs": ["CBAM", "Oeko-Tex", "REX"],
            "contact_ready": True, "preset_id": "preset_terracotta"
        },
        {
            "id": "b003", "company_name": "Paris Textile Collective SAS", "city": "Lyon", "country": "France",
            "segment": "Fashion Accessories", "hs_chapters": ["42", "62"],
            "tariff_bd_pct": 0.0, "trade_scheme": "EU EBA", "moq": 3000, "fob_target_usd": 8.50,
            "annual_import_usd": 2100000, "payment_terms": ["L/C"], "certs": ["BSCI", "Oeko-Tex", "CBAM"],
            "contact_ready": True, "preset_id": "preset_jute_bag"
        },
        {
            "id": "b004", "company_name": "Tokyo Midori Lifestyle Ltd.", "city": "Tokyo", "country": "Japan",
            "segment": "Eco Lifestyle Products", "hs_chapters": ["42", "53"],
            "tariff_bd_pct": 0.0, "trade_scheme": "Japan DFQF", "moq": 8000, "fob_target_usd": 3.80,
            "annual_import_usd": 980000, "payment_terms": ["T/T", "D/P"], "certs": ["BSCI", "GRS", "REX"],
            "contact_ready": True, "preset_id": "preset_jute_bag"
        },
        {
            "id": "b005", "company_name": "Osaka Craft Footwear KK", "city": "Osaka", "country": "Japan",
            "segment": "Premium Leather Footwear", "hs_chapters": ["64"],
            "tariff_bd_pct": 0.0, "trade_scheme": "Japan DFQF", "moq": 1200, "fob_target_usd": 24.50,
            "annual_import_usd": 1650000, "payment_terms": ["L/C", "CAD"], "certs": ["LWG", "BSCI", "REX"],
            "contact_ready": True, "preset_id": "preset_leather_boot"
        },
        {
            "id": "b006", "company_name": "Green Harbor Imports LLC", "city": "New York", "country": "USA",
            "segment": "Sustainable Home Textiles", "hs_chapters": ["53", "62"],
            "tariff_bd_pct": 15.0, "trade_scheme": "MFN (GSP Pending)", "moq": 10000, "fob_target_usd": 4.20,
            "annual_import_usd": 3200000, "payment_terms": ["L/C", "T/T"], "certs": ["GOTS", "BSCI"],
            "contact_ready": False, "preset_id": "preset_denim_jacket"
        },
        {
            "id": "b007", "company_name": "Thames Streetwear Collective Ltd.", "city": "London", "country": "UK",
            "segment": "Recycled Denim Fashion", "hs_chapters": ["62"],
            "tariff_bd_pct": 0.0, "trade_scheme": "UK DCTS", "moq": 4000, "fob_target_usd": 13.80,
            "annual_import_usd": 3400000, "payment_terms": ["L/C", "CAD"], "certs": ["GRS", "Oeko-Tex", "BSCI"],
            "contact_ready": True, "preset_id": "preset_denim_jacket"
        },
        {
            "id": "b008", "company_name": "Edinburgh Natural Living PLC", "city": "Edinburgh", "country": "UK",
            "segment": "Eco Homewares", "hs_chapters": ["42", "69"],
            "tariff_bd_pct": 0.0, "trade_scheme": "UK DCTS", "moq": 2500, "fob_target_usd": 9.80,
            "annual_import_usd": 760000, "payment_terms": ["T/T", "L/C"], "certs": ["CBAM", "Oeko-Tex", "REX"],
            "contact_ready": True, "preset_id": "preset_terracotta"
        },
        {
            "id": "b009", "company_name": "Amsterdam Green Wholesale BV", "city": "Amsterdam", "country": "Netherlands",
            "segment": "Organic Textiles & Accessories", "hs_chapters": ["42", "53", "62"],
            "tariff_bd_pct": 0.0, "trade_scheme": "EU EBA", "moq": 6000, "fob_target_usd": 5.60,
            "annual_import_usd": 1820000, "payment_terms": ["CAD", "T/T"], "certs": ["CBAM", "GOTS", "BSCI"],
            "contact_ready": True, "preset_id": "preset_jute_bag"
        },
        {
            "id": "b010", "company_name": "Stockholm EcoDesign AB", "city": "Stockholm", "country": "Sweden",
            "segment": "Nordic Interior Decor", "hs_chapters": ["42", "69"],
            "tariff_bd_pct": 0.0, "trade_scheme": "EU EBA", "moq": 1500, "fob_target_usd": 12.50,
            "annual_import_usd": 650000, "payment_terms": ["L/C"], "certs": ["CBAM", "Oeko-Tex", "BSCI"],
            "contact_ready": True, "preset_id": "preset_terracotta"
        },
        {
            "id": "b011", "company_name": "Milano Fashion Sourcing Srl", "city": "Milan", "country": "Italy",
            "segment": "Premium Leather Goods", "hs_chapters": ["42", "64"],
            "tariff_bd_pct": 0.0, "trade_scheme": "EU EBA", "moq": 2000, "fob_target_usd": 22.00,
            "annual_import_usd": 2800000, "payment_terms": ["L/C", "CAD"], "certs": ["LWG", "BSCI", "REX"],
            "contact_ready": True, "preset_id": "preset_leather_boot"
        },
        {
            "id": "b012", "company_name": "Antwerp Ethical Trade NV", "city": "Antwerp", "country": "Belgium",
            "segment": "Fair Trade Home Goods", "hs_chapters": ["42", "53"],
            "tariff_bd_pct": 0.0, "trade_scheme": "EU EBA", "moq": 3500, "fob_target_usd": 4.10,
            "annual_import_usd": 1100000, "payment_terms": ["T/T", "L/C"], "certs": ["CBAM", "GOTS", "BSCI"],
            "contact_ready": True, "preset_id": "preset_jute_bag"
        },
        {
            "id": "b013", "company_name": "Copenhagen Living ApS", "city": "Copenhagen", "country": "Denmark",
            "segment": "Scandinavian Home & Lifestyle", "hs_chapters": ["42", "69"],
            "tariff_bd_pct": 0.0, "trade_scheme": "EU EBA", "moq": 1800, "fob_target_usd": 10.80,
            "annual_import_usd": 720000, "payment_terms": ["CAD", "L/C"], "certs": ["CBAM", "BSCI", "REX"],
            "contact_ready": True, "preset_id": "preset_terracotta"
        },
        {
            "id": "b014", "company_name": "West Coast Sustainable Retail Inc.", "city": "San Francisco", "country": "USA",
            "segment": "Eco Fashion & Footwear", "hs_chapters": ["62", "64"],
            "tariff_bd_pct": 11.5, "trade_scheme": "MFN", "moq": 5000, "fob_target_usd": 16.50,
            "annual_import_usd": 4100000, "payment_terms": ["L/C"], "certs": ["GRS", "LWG", "BSCI"],
            "contact_ready": True, "preset_id": "preset_denim_jacket"
        }
    ]

    try:
        from backend.seed_expansion import EXPANDED_BUYERS
        for eb in EXPANDED_BUYERS:
            if not any(b["company_name"].lower() == eb["company_name"].lower() for b in buyers):
                p_terms = []
                for p in eb.get("payment_terms", []):
                    pt = p.replace("LC_SIGHT", "L/C").replace("CAD", "CAD").replace("TT_ADVANCE", "T/T").replace("DP", "D/P")
                    if pt not in p_terms:
                        p_terms.append(pt)
                if not p_terms:
                    p_terms = ["L/C", "T/T"]

                scheme = eb.get("trade_scheme", "EU EBA")
                zero_duty = "0%" in scheme or "EBA" in scheme or "DFQF" in scheme or "DCTS" in scheme or "GPT" in scheme or "ASTP" in scheme

                hs_ch = eb.get("hs_chapters", ["42"])
                preset_id = "preset_jute_bag"
                if "62" in hs_ch:
                    preset_id = "preset_denim_jacket"
                elif "64" in hs_ch:
                    preset_id = "preset_leather_boot"
                elif "69" in hs_ch:
                    preset_id = "preset_terracotta"

                buyers.append({
                    "id": eb["buyer_id"].lower(),
                    "company_name": eb["company_name"],
                    "city": eb["city"],
                    "country": eb["country_name_en"],
                    "segment": eb["segment"],
                    "hs_chapters": hs_ch,
                    "tariff_bd_pct": 0.0 if zero_duty else 12.5,
                    "trade_scheme": scheme,
                    "moq": eb.get("typical_moq_units", 3000),
                    "fob_target_usd": eb.get("target_fob_usd", 5.0),
                    "annual_import_usd": eb.get("annual_import_usd", 1000000.0),
                    "payment_terms": p_terms,
                    "certs": eb.get("certs", ["CBAM", "BSCI", "REX"]),
                    "contact_ready": True,
                    "preset_id": preset_id,
                })
    except Exception:
        pass

    filtered = buyers
    if country:
        c_lower = country.lower()
        filtered = [b for b in filtered if b["country"].lower() == c_lower]
    if cert:
        filtered = [b for b in filtered if cert in b["certs"]]
    if payment:
        filtered = [b for b in filtered if payment in b["payment_terms"]]
    if max_moq:
        filtered = [b for b in filtered if b["moq"] <= max_moq]
    if search:
        s_lower = search.lower()
        filtered = [b for b in filtered if s_lower in b["company_name"].lower() or s_lower in b["city"].lower() or s_lower in b["segment"].lower()]

    return {
        "status": "success",
        "total": len(filtered),
        "total_count": len(filtered),
        "buyers": filtered
    }

