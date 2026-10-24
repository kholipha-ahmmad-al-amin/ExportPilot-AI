import datetime
import math
import time
from pathlib import Path

from fastapi import APIRouter, Depends
from sqlalchemy import desc, text
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.auth import _jwt_secret, get_current_active_user, require_roles
from backend.database import get_db
from backend.hybrid_rag import knowledge_graph
from backend.open_source_parsers import extract_pdf_data
from backend.sovereignty import mask_bangla_pii
from backend.models import AuditLog

router = APIRouter(prefix="/audit", tags=["System Audit"])
BASE_DIR = Path(__file__).resolve().parent.parent


def _check(check_id: str, name: str, started: float, passed: bool, details: str) -> dict:
    return {
        "test_id": check_id,
        "name": name,
        "status": "PASS" if passed else "FAIL",
        "score": 20 if passed else 0,
        "latency_ms": round((time.perf_counter() - started) * 1000, 1),
        "details": details,
    }


@router.post("/run")
def run_live_enterprise_audit(
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_active_user),
):
    started = time.perf_counter()
    checks = []

    check_started = time.perf_counter()
    try:
        db.execute(text("SELECT 1"))
        from backend.models import ProductScan, User

        user_count = db.query(User).count()
        product_count = db.query(ProductScan).count()
        checks.append(_check(
            "CHK_01_DB_PERSISTENCE",
            "Database connectivity and seeded records",
            check_started,
            True,
            f"Database query succeeded. {user_count} users and {product_count} trade presets are available.",
        ))
    except Exception:
        checks.append(_check(
            "CHK_01_DB_PERSISTENCE", "Database connectivity and seeded records", check_started, False,
            "Database query failed.",
        ))

    check_started = time.perf_counter()
    sample_text = "NID: 19882694812004512, phone 01712984920, TIN 558492011234"
    redacted, count, _entities = mask_bangla_pii(sample_text)
    pii_pass = (
        count == 3
        and "[REDACTED_BD_NID]" in redacted
        and "[REDACTED_BD_PHONE]" in redacted
        and "[REDACTED_TIN]" in redacted
        and all(value not in redacted for value in ("19882694812004512", "01712984920", "558492011234"))
    )
    checks.append(_check(
        "CHK_02_BANGLA_PII_SOVEREIGNTY", "PII masking", check_started, pii_pass,
        f"{count} sample identifiers were checked; raw sample values were {'removed' if pii_pass else 'still present'}.",
    ))

    check_started = time.perf_counter()
    sample_reb = BASE_DIR / "frontend" / "public" / "assets" / "samples" / "sample-reb-electricity-bill.pdf"
    try:
        pdf_result = extract_pdf_data(sample_reb)
        metrics = pdf_result.get("metrics", {})
        total_kwh = float(metrics.get("total_kwh") or 0)
        intensity = float(metrics.get("scope2_per_unit_kg_co2e") or 0)
        pdf_pass = (
            pdf_result.get("status") == "success"
            and total_kwh > 0
            and intensity > 0
            and math.isclose(
                float(metrics.get("scope2_total_kg_co2e") or 0),
                total_kwh * float(metrics.get("grid_emission_factor_kg_per_kwh") or 0),
                rel_tol=0,
                abs_tol=0.02,
            )
        )
        pdf_details = f"Parsed {total_kwh:g} kWh and verified the Scope 2 calculation at {intensity:g} kg CO2e per unit." if pdf_pass else "The sample bill could not be parsed or its emissions calculation did not reconcile."
    except Exception:
        pdf_pass = False
        pdf_details = "The sample bill could not be parsed or its emissions calculation did not reconcile."
    checks.append(_check("CHK_03_PDF_CARBON", "Electricity bill and emissions calculation", check_started, pdf_pass, pdf_details))

    check_started = time.perf_counter()
    try:
        subgraph = knowledge_graph.get_react_flow_subgraph("preset_jute_bag")
        graph_pass = subgraph["total_nodes"] > 0 and subgraph["total_edges"] > 0
        graph_details = f"Trade graph returned {subgraph['total_nodes']} nodes and {subgraph['total_edges']} edges." if graph_pass else "Trade graph returned no connected trade records."
    except Exception:
        graph_pass = False
        graph_details = "Trade graph query failed."
    checks.append(_check("CHK_04_TRADE_GRAPH", "Trade graph traversal", check_started, graph_pass, graph_details))

    check_started = time.perf_counter()
    try:
        secret_ready = len(_jwt_secret().encode("utf-8")) >= 32
    except Exception:
        secret_ready = False
    from backend.mcp_agents import _agent_steps, mcp_server

    pipeline_ready = len(_agent_steps) == 5
    mcp_ready = mcp_server is not None
    auth_pass = secret_ready and pipeline_ready and mcp_ready
    auth_details = (
        "Signing key, authenticated sessions, and all five FastMCP agent registrations are configured."
        if auth_pass else "Signing key or FastMCP registration is not configured correctly."
    )
    checks.append(_check("CHK_05_AUTH_AND_AGENTS", "Authentication and agent readiness", check_started, auth_pass, auth_details))

    total_score = sum(item["score"] for item in checks)
    checks_passed = sum(item["status"] == "PASS" for item in checks)
    return {
        "status": "success" if checks_passed == 5 else "degraded",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "total_score": total_score,
        "max_score": 100,
        "grade": "PASS" if total_score == 100 else "REVIEW REQUIRED",
        "checks_passed": checks_passed,
        "total_checks": len(checks),
        "execution_total_ms": round((time.perf_counter() - started) * 1000, 1),
        "checklist": checks,
        "audit_report_url": "/api/v1/reports/download/enterprise_audit/deal_active",
    }


@router.get("/events")
def list_security_events(
    db: Session = Depends(get_db),
    _admin=Depends(require_roles("admin")),
):
    rows = db.query(AuditLog).order_by(desc(AuditLog.timestamp)).limit(50).all()
    return [
        {
            "id": row.id,
            "name": row.test_name,
            "category": row.category,
            "status": row.status,
            "details": row.details,
            "timestamp": row.timestamp.isoformat() if row.timestamp else None,
        }
        for row in rows
    ]
