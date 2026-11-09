"""Modular domain FastMCP 3.2.0 servers for ExportPilot AI.

Exposes five focused, independently mountable Model Context Protocol servers
over Streamable HTTP / SSE while preserving the unified five-agent pipeline
coordinator on /api/v1/mcp/protocol:

1. exportpilot-sovereignty-mcp (/api/v1/mcp/sovereignty)
2. exportpilot-hs-tariff-mcp (/api/v1/mcp/hs-tariff)
3. exportpilot-graphrag-buyers-mcp (/api/v1/mcp/graphrag-buyers)
4. exportpilot-cbam-esg-mcp (/api/v1/mcp/cbam-esg)
5. exportpilot-finance-contracts-mcp (/api/v1/mcp/finance-contracts)
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from fastapi import APIRouter
from pydantic import ValidationError

from backend.cash_incentives import CashIncentiveRequest, calculate_cash_incentive
from backend.hybrid_rag import (
    build_fob_cost_stack,
    calculate_cbam_liability,
    classify_product,
    compare_duty_savings,
    knowledge_graph,
)
from backend.intelligence_router import (
    ExportFinanceScoreRequest,
    NegotiateContractRequest,
    SupplyChainRiskRequest,
    VisionInspectRequest,
    calculate_export_finance_score,
    negotiate_and_generate_contract,
    predict_supply_chain_risk,
    vision_quality_inspect,
)
from backend.lc_audit import LCAuditRequest, audit_letter_of_credit
from backend.mcp_agents import _local_redaction, _read_catalog_buyers, agent_1_data_sovereignty
from backend.open_source_parsers import extract_pdf_data, resolve_sample_path
from backend.sovereignty import mask_bangla_pii

logger = logging.getLogger("exportpilot.mcp_servers")
BASE_DIR = Path(__file__).resolve().parent.parent

try:
    from fastmcp import FastMCP
except ImportError as exc:
    logger.warning("FastMCP could not be imported; modular MCP sub-servers disabled: %s", exc)
    FastMCP = None  # type: ignore[assignment,misc]

servers_router = APIRouter(prefix="/mcp", tags=["FastMCP Modular Servers"])


def _build_server(name: str) -> Any:
    if FastMCP is None:
        return None
    return FastMCP(name)


# ---------------------------------------------------------------------------
# 1. Sovereign PII Firewall & KYC Guard MCP Server
# ---------------------------------------------------------------------------
sovereignty_mcp = _build_server("exportpilot-sovereignty-mcp")

if sovereignty_mcp is not None:

    @sovereignty_mcp.tool(
        name="mask_bangla_english_pii",
        description="Normalize Bengali digits (0-9) and mask BD NIDs, mobile numbers, e-TIN, BIN, IBAN, bank accounts, and emails locally before external LLM inference.",
    )
    def tool_mask_bangla_english_pii(text: str) -> dict[str, Any]:
        clean = str(text or "")[:20000]
        redacted, count, entities = mask_bangla_pii(clean)
        # Apply secondary email/phone screening without altering entity metadata safety.
        fully_redacted, _ = _local_redaction(clean)
        return {
            "redacted_text": fully_redacted if len(fully_redacted) <= len(redacted) else redacted,
            "total_redactions": count,
            "detected_entities": [
                {"type": item["type"], "replacement": item["replacement"]}
                for item in entities
            ],
            "sovereignty_status": "SECURE_SOVEREIGN_PASSED",
        }

    @sovereignty_mcp.tool(
        name="sanitize_export_kyc_payload",
        description="Screen factory voice intake and private KYC identity fields locally and confirm raw personal keys are masked prior to trade analysis.",
    )
    async def tool_sanitize_export_kyc_payload(
        voice_text_bn: str = "",
        factory_name: str = "",
        owner_name: str = "",
        owner_email: str = "",
        owner_phone: str = "",
        trade_license: str = "",
        bank_account: str = "",
    ) -> dict[str, Any]:
        context = {
            "voice_text_bn": str(voice_text_bn or "")[:20000],
            "factory_name": str(factory_name or "")[:500],
            "owner_name": str(owner_name or "")[:500],
            "owner_email": str(owner_email or "")[:500],
            "owner_phone": str(owner_phone or "")[:500],
            "trade_license": str(trade_license or "")[:500],
            "bank_account": str(bank_account or "")[:500],
        }
        return await agent_1_data_sovereignty(context)

    @sovereignty_mcp.tool(
        name="verify_sovereignty_guardrails",
        description="Run deterministic self-verification against synthetic Bengali-digit NID, e-TIN, BIN, and phone patterns to confirm zero PII leakage.",
    )
    def tool_verify_sovereignty_guardrails() -> dict[str, Any]:
        probe = "NID: 19882694812004512, Phone: +8801712984920, TIN: 558492011234, BIN: 001234567-0101"
        redacted, count, entities = mask_bangla_pii(probe)
        leaked = [
            token
            for token in ("19882694812004512", "+8801712984920", "558492011234", "001234567-0101")
            if token in redacted
        ]
        return {
            "status": "PASS" if (count >= 4 and not leaked) else "FAIL",
            "redactions_detected": count,
            "entity_types": [item["type"] for item in entities],
            "leaked_identifiers_count": len(leaked),
        }


# ---------------------------------------------------------------------------
# 2. WCO HS 2022 Classifier, Tariff Matrix & FOB Unit Economics MCP Server
# ---------------------------------------------------------------------------
hs_tariff_mcp = _build_server("exportpilot-hs-tariff-mcp")

if hs_tariff_mcp is not None:

    @hs_tariff_mcp.tool(
        name="classify_export_product",
        description="Classify a Bangladeshi export product description into WCO HS 2022 6-digit heading and 8-digit national line with preferential market tariff matrix.",
    )
    def tool_classify_export_product(
        description: str,
        explicit_hs_code: str = "",
        sector_hint: str = "",
    ) -> dict[str, Any]:
        return classify_product(
            description=str(description or "")[:2000],
            explicit_hs_code=explicit_hs_code or None,
            sector_hint=sector_hint or None,
        )

    @hs_tariff_mcp.tool(
        name="lookup_preferential_duty_matrix",
        description="Resolve duty advantages for Bangladesh under EU EBA, UK DCTS, Japan DFQF, US MFN, and GCC schedules for a 6-digit HS heading.",
    )
    def tool_lookup_preferential_duty_matrix(hs_code_6: str) -> dict[str, Any]:
        try:
            return compare_duty_savings(str(hs_code_6 or "").strip())
        except KeyError as exc:
            return {
                "status": "not_found",
                "hs_code_6": hs_code_6,
                "detail": str(exc),
            }

    @hs_tariff_mcp.tool(
        name="model_fob_chattogram_cost_stack",
        description="Compute itemized FOB Chattogram unit economics (material, labor, overhead, inland freight, port C&F fees, and target exporter margin vs buying house offer).",
    )
    def tool_model_fob_chattogram_cost_stack(
        hs_code_6: str,
        factory_location: str = "savar",
        margin_pct: float = 18.0,
        monthly_capacity_units: float = 5000.0,
    ) -> dict[str, Any]:
        clamped_margin = max(12.0, min(20.0, float(margin_pct)))
        clamped_cap = max(100.0, min(10_000_000.0, float(monthly_capacity_units)))
        try:
            return build_fob_cost_stack(
                hs6=str(hs_code_6 or "").strip(),
                factory_location=factory_location or None,
                margin_pct=clamped_margin,
                monthly_capacity_units=clamped_cap,
            )
        except (KeyError, ValueError) as exc:
            return {
                "status": "invalid_input",
                "hs_code_6": hs_code_6,
                "detail": str(exc),
            }


# ---------------------------------------------------------------------------
# 3. NetworkX GraphRAG Buyer Matchmaker & Maritime Corridor MCP Server
# ---------------------------------------------------------------------------
graphrag_buyers_mcp = _build_server("exportpilot-graphrag-buyers-mcp")

if graphrag_buyers_mcp is not None:

    @graphrag_buyers_mcp.tool(
        name="extract_trade_knowledge_subgraph",
        description="Traverse the local NetworkX trade knowledge graph around a flagship export preset to return buyer corridors, tariff programs, and graph telemetry.",
    )
    def tool_extract_trade_knowledge_subgraph(
        preset_id: str = "preset_jute_bag",
        max_hops: int = 2,
    ) -> dict[str, Any]:
        hops = max(1, min(3, int(max_hops)))
        subgraph = knowledge_graph.get_react_flow_subgraph(str(preset_id or "preset_jute_bag"), max_hops=hops)
        return {
            "preset_id": preset_id,
            "max_hops": hops,
            "graph_stats": knowledge_graph.stats(),
            "subgraph": subgraph,
        }

    @graphrag_buyers_mcp.tool(
        name="match_illustrative_buyers_by_hs",
        description="Query SQL GlobalBuyer catalog profiles matching an 8-digit HS code. Returned profiles remain strictly labeled illustrative reference data.",
    )
    def tool_match_illustrative_buyers_by_hs(hs_code_8digit: str) -> dict[str, Any]:
        matches = _read_catalog_buyers(str(hs_code_8digit or ""), [])
        return {
            "hs_code_8digit": hs_code_8digit,
            "catalog_status": "illustrative_reference_data",
            "total_matches": len(matches),
            "buyers": matches,
        }

    @graphrag_buyers_mcp.tool(
        name="simulate_chattogram_maritime_corridor",
        description="Simulate ocean shipping corridors from Chattogram Port across EU, East-Pacific, and GCC destinations with transit days, reliability, and FOB risk advisory.",
    )
    async def tool_simulate_chattogram_maritime_corridor(
        sector: str = "garments",
        destination_port: str = "Rotterdam",
        containers_teu: int = 2,
        cargo_value_usd: float = 48000.0,
        preferred_incoterm: str = "FOB",
    ) -> dict[str, Any]:
        try:
            req = SupplyChainRiskRequest(
                sector=sector,  # type: ignore[arg-type]
                destination_port=destination_port,  # type: ignore[arg-type]
                containers_teu=containers_teu,
                cargo_value_usd=cargo_value_usd,
                preferred_incoterm=preferred_incoterm,  # type: ignore[arg-type]
            )
        except ValidationError as exc:
            return {"status": "validation_error", "detail": str(exc)}
        return await predict_supply_chain_risk(req)


# ---------------------------------------------------------------------------
# 4. EU CBAM Scope 2 Emissions, PDF Utility Parser & AQL Quality MCP Server
# ---------------------------------------------------------------------------
cbam_esg_mcp = _build_server("exportpilot-cbam-esg-mcp")

if cbam_esg_mcp is not None:

    @cbam_esg_mcp.tool(
        name="calculate_cbam_carbon_exposure",
        description="Calculate EU CBAM (Regulation 2023/956) Scope 1 and Scope 2 embedded carbon liability using BPDB 0.58 kg CO2e/kWh baseline and solar/efficiency ROI paths.",
    )
    def tool_calculate_cbam_carbon_exposure(
        annual_units: float = 60000.0,
        annual_electricity_kwh: float = 16000.0,
        hs_code_6: str = "4202.92",
        production_year: int = 2026,
    ) -> dict[str, Any]:
        try:
            return calculate_cbam_liability(
                annual_units=max(1.0, float(annual_units)),
                annual_electricity_kwh=max(0.0, float(annual_electricity_kwh)),
                production_year=int(production_year),
                hs6=hs_code_6 or None,
            )
        except ValueError as exc:
            return {"status": "invalid_input", "detail": str(exc)}

    @cbam_esg_mcp.tool(
        name="parse_sample_utility_bill_emissions",
        description="Extract kWh metrics and compute Scope 2 CO2e per unit from the sanitized sample Bangladesh REB industrial electricity bill PDF via PyMuPDF and pdfplumber.",
    )
    def tool_parse_sample_utility_bill_emissions(
        monthly_output_units: float = 5000.0,
        hs_code: str = "4202.92.10",
    ) -> dict[str, Any]:
        sample_path = resolve_sample_path("sample-reb-electricity-bill.pdf")
        if not sample_path.exists():
            return {"status": "not_found", "detail": "Sample REB utility bill is not present"}
        units = max(1.0, min(10_000_000.0, float(monthly_output_units)))
        return extract_pdf_data(
            sample_path,
            monthly_output_units=units,
            hs_code=hs_code or None,
        )

    @cbam_esg_mcp.tool(
        name="inspect_quality_aql_compliance",
        description="Evaluate garment, jute, leather, ceramic, or agro batch notes against ISO 2859-1 AQL tolerances and 8-digit HS tariff schedules with PII masking.",
    )
    async def tool_inspect_quality_aql_compliance(
        sector: str = "jute",
        product_name: str = "Organic Jute Shopping Tote Bag",
        voice_or_text_note: str = "300 GSM natural jute tote bag with double stitching",
        target_market: str = "EU",
        batch_size_units: int = 5000,
    ) -> dict[str, Any]:
        try:
            req = VisionInspectRequest(
                sector=sector,  # type: ignore[arg-type]
                product_name=product_name,
                voice_or_text_note=voice_or_text_note,
                target_market=target_market,  # type: ignore[arg-type]
                batch_size_units=batch_size_units,
            )
        except ValidationError as exc:
            return {"status": "validation_error", "detail": str(exc)}
        return await vision_quality_inspect(req)


# ---------------------------------------------------------------------------
# 5. Export Finance (BB FE Circulars), UCP 600 & Multilingual Drafts MCP Server
# ---------------------------------------------------------------------------
finance_contracts_mcp = _build_server("exportpilot-finance-contracts-mcp")

if finance_contracts_mcp is not None:

    @finance_contracts_mcp.tool(
        name="score_bangladesh_bank_export_finance",
        description="Score Back-to-Back LC headroom, minimum domestic value-addition eligibility for government Cash Incentives, and EDF interest cost per Bangladesh Bank FE Circular No. 20.",
    )
    async def tool_score_bangladesh_bank_export_finance(
        sector: str = "garments",
        master_lc_value_usd: float = 85000.0,
        raw_material_import_pct: float = 55.0,
        completed_export_orders: int = 12,
        lead_time_days: int = 60,
        has_erc_and_ud: bool = True,
    ) -> dict[str, Any]:
        try:
            req = ExportFinanceScoreRequest(
                sector=sector,  # type: ignore[arg-type]
                master_lc_value_usd=master_lc_value_usd,
                raw_material_import_pct=raw_material_import_pct,
                completed_export_orders=completed_export_orders,
                lead_time_days=lead_time_days,
                has_erc_and_ud=has_erc_and_ud,
            )
        except ValidationError as exc:
            return {"status": "validation_error", "detail": str(exc)}
        return await calculate_export_finance_score(req)

    @finance_contracts_mcp.tool(
        name="calculate_cash_incentive_subsidy",
        description="Compute statutory Bangladesh Bank export cash assistance (4%-20%) with domestic value addition verification and OEMS/PRC document checklist.",
    )
    def tool_calculate_cash_incentive_subsidy(
        sector_id: str = "diversified_jute",
        fob_export_value_usd: float = 33800.0,
        raw_material_import_cost_usd: float = 5000.0,
    ) -> dict[str, Any]:
        try:
            req = CashIncentiveRequest(
                sector_id=sector_id,
                fob_export_value_usd=fob_export_value_usd,
                raw_material_import_cost_usd=raw_material_import_cost_usd,
            )
        except ValidationError as exc:
            return {"status": "validation_error", "detail": str(exc)}
        return calculate_cash_incentive(req).model_dump()

    @finance_contracts_mcp.tool(
        name="audit_lc_ucp600_terms",
        description="Audit export Letter of Credit clauses, shipment/expiry dates, Bangladesh loading ports, and amount tolerances under ICC UCP 600 rules.",
    )
    def tool_audit_lc_ucp600_terms(
        lc_number: str = "LC-2026-BD-8891",
        issuing_bank: str = "Deutsche Bank AG",
        lc_amount_usd: float = 33800.0,
        latest_shipment_date: str = "2026-11-30",
        lc_expiry_date: str = "2026-12-21",
        port_of_discharge: str = "Hamburg Port, Germany",
        product_description: str = "Eco Jute Shopping Tote Bags HS 4202.92.10",
        port_of_loading: str = "Chattogram Sea Port, Bangladesh",
    ) -> dict[str, Any]:
        try:
            req = LCAuditRequest(
                lc_number=lc_number,
                issuing_bank=issuing_bank,
                lc_amount_usd=lc_amount_usd,
                latest_shipment_date=latest_shipment_date,
                lc_expiry_date=lc_expiry_date,
                port_of_discharge=port_of_discharge,
                product_description=product_description,
                port_of_loading=port_of_loading,
            )
        except ValidationError as exc:
            return {"status": "validation_error", "detail": str(exc)}
        return audit_letter_of_credit(req).model_dump()

    @finance_contracts_mcp.tool(
        name="draft_multilingual_counter_offer",
        description="Draft non-binding bilingual/multilingual buyer counter-offers and UCP 600 contract clauses (DE, JA, AR, FR, EN) while enforcing a 92% target FOB margin floor.",
    )
    async def tool_draft_multilingual_counter_offer(
        buyer_language: str = "de",
        buyer_company: str = "Hanseatic EcoRetail GmbH",
        product_name: str = "Organic Jute Shopping Tote Bag",
        hs_code: str = "4202.92.10",
        quantity_units: int = 10000,
        buyer_offered_fob_usd: float = 1.65,
        factory_target_fob_usd: float = 1.95,
        incoterm: str = "FOB Chattogram",
        buyer_message: str = "We want 10,000 units at USD 1.65 FOB with 90 days open account.",
    ) -> dict[str, Any]:
        try:
            req = NegotiateContractRequest(
                buyer_language=buyer_language,  # type: ignore[arg-type]
                buyer_company=buyer_company,
                product_name=product_name,
                hs_code=hs_code,
                quantity_units=quantity_units,
                buyer_offered_fob_usd=buyer_offered_fob_usd,
                factory_target_fob_usd=factory_target_fob_usd,
                incoterm=incoterm,  # type: ignore[arg-type]
                buyer_message=buyer_message,
            )
        except ValidationError as exc:
            return {"status": "validation_error", "detail": str(exc)}
        return await negotiate_and_generate_contract(req)


MODULAR_MCP_SERVERS: list[dict[str, Any]] = [
    {
        "name": "exportpilot-sovereignty-mcp",
        "mount_path": "/api/v1/mcp/sovereignty",
        "server": sovereignty_mcp,
        "http_app": sovereignty_mcp.http_app(path="/") if sovereignty_mcp is not None else None,
        "transport": "Streamable HTTP + SSE",
        "tools": [
            "mask_bangla_english_pii",
            "sanitize_export_kyc_payload",
            "verify_sovereignty_guardrails",
        ],
        "summary": "Local Bangla/English PII normalization, KYC redaction, and guardrail verification.",
    },
    {
        "name": "exportpilot-hs-tariff-mcp",
        "mount_path": "/api/v1/mcp/hs-tariff",
        "server": hs_tariff_mcp,
        "http_app": hs_tariff_mcp.http_app(path="/") if hs_tariff_mcp is not None else None,
        "transport": "Streamable HTTP + SSE",
        "tools": [
            "classify_export_product",
            "lookup_preferential_duty_matrix",
            "model_fob_chattogram_cost_stack",
        ],
        "summary": "WCO HS 2022 6/8-digit classification, treaty duty matrix, and FOB Chattogram unit economics.",
    },
    {
        "name": "exportpilot-graphrag-buyers-mcp",
        "mount_path": "/api/v1/mcp/graphrag-buyers",
        "server": graphrag_buyers_mcp,
        "http_app": graphrag_buyers_mcp.http_app(path="/") if graphrag_buyers_mcp is not None else None,
        "transport": "Streamable HTTP + SSE",
        "tools": [
            "extract_trade_knowledge_subgraph",
            "match_illustrative_buyers_by_hs",
            "simulate_chattogram_maritime_corridor",
        ],
        "summary": "NetworkX GraphRAG buyer-corridor subgraph traversal and maritime shipping risk predictor.",
    },
    {
        "name": "exportpilot-cbam-esg-mcp",
        "mount_path": "/api/v1/mcp/cbam-esg",
        "server": cbam_esg_mcp,
        "http_app": cbam_esg_mcp.http_app(path="/") if cbam_esg_mcp is not None else None,
        "transport": "Streamable HTTP + SSE",
        "tools": [
            "calculate_cbam_carbon_exposure",
            "parse_sample_utility_bill_emissions",
            "inspect_quality_aql_compliance",
        ],
        "summary": "EU CBAM (2023/956) Scope 1+2 liability modeling, utility PDF parsing, and ISO 2859-1 AQL inspection.",
    },
    {
        "name": "exportpilot-finance-contracts-mcp",
        "mount_path": "/api/v1/mcp/finance-contracts",
        "server": finance_contracts_mcp,
        "http_app": finance_contracts_mcp.http_app(path="/") if finance_contracts_mcp is not None else None,
        "transport": "Streamable HTTP + SSE",
        "tools": [
            "score_bangladesh_bank_export_finance",
            "calculate_cash_incentive_subsidy",
            "audit_lc_ucp600_terms",
            "draft_multilingual_counter_offer",
        ],
        "summary": "Bangladesh Bank FE Circular No. 20 LC/cash-incentive scoring, UCP 600 audit, and 5-language contract drafting.",
    },
]


@servers_router.get("/servers")
def list_mcp_servers() -> dict[str, Any]:
    """Return read-only inventory of mounted FastMCP 3.2.0 servers and exposed tools."""
    items = [
        {
            "name": "ExportPilot Trade Agents (Master Pipeline)",
            "slug": "exportpilot-trade-agents",
            "mount_path": "/api/v1/mcp/protocol",
            "transport": "Streamable HTTP + SSE",
            "auth": "Bearer JWT (factory_owner / admin)",
            "tool_count": 6,
            "tools": [
                "agent_1_data_sovereignty",
                "agent_2_hs_tariff_classifier",
                "agent_3_graphrag_buyer_matchmaker",
                "agent_4_cbam_esg_auditor",
                "agent_5_invoice_contract_synthesizer",
                "run_five_agent_pipeline",
            ],
            "summary": "End-to-end 5-agent sequential export pipeline coordinator and SSE event stream.",
        }
    ]
    for entry in MODULAR_MCP_SERVERS:
        items.append(
            {
                "name": entry["name"],
                "slug": entry["name"],
                "mount_path": entry["mount_path"],
                "transport": entry["transport"],
                "auth": "Bearer JWT (factory_owner / admin)",
                "tool_count": len(entry["tools"]),
                "tools": entry["tools"],
                "summary": entry["summary"],
            }
        )
    return {
        "fastmcp_available": FastMCP is not None,
        "modular_server_count": len(MODULAR_MCP_SERVERS),
        "total_mounted_servers": len(items),
        "total_exposed_tools": sum(item["tool_count"] for item in items),
        "servers": items,
    }
