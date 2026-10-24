from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from backend.audit_router import run_live_enterprise_audit
from backend.auth import get_current_active_user
from backend.database import get_db
from backend.models import TradeDeal
from backend.pdf_generator import (
    generate_buyer_catalog_pdf,
    generate_cbam_certificate_pdf,
    generate_enterprise_audit_pdf,
    generate_proforma_invoice_pdf,
)
from backend.seed_data import PRESETS_DATA

router = APIRouter(prefix="/reports", tags=["PDF Reports & Quotations"])


def _resolve_deal_document(deal_id: str, current_user, db: Session) -> dict:
    preset = next((item for item in PRESETS_DATA if item["preset_id"] == deal_id), None)
    if preset:
        return {**preset, "is_illustrative": True}

    query = db.query(TradeDeal).filter(TradeDeal.id == deal_id)
    if current_user.role != "admin":
        query = query.filter(TradeDeal.user_id == current_user.id)
    record = query.first()
    if not record:
        raise HTTPException(status_code=404, detail="Trade record not found")

    result = record.result_json or {}
    deal = dict(result.get("deal_package") or {})
    draft = result.get("proforma_invoice_draft") or {}
    deal["deal_record_id"] = record.id
    deal["factory_name"] = draft.get("seller") if draft.get("seller") != "Factory details to be completed" else None
    deal["buyer_name"] = None
    deal["quantity"] = draft.get("quantity")
    deal["unit_price_usd"] = draft.get("unit_price_usd")
    deal["incoterm"] = draft.get("incoterm")
    deal["payment_terms"] = draft.get("payment_terms")
    deal["delivery_date"] = draft.get("delivery_date")
    deal["uploaded_doc_metrics"] = deal.get("uploaded_doc_metrics") or record.input_json.get("uploaded_doc_metrics", {})
    agent_results = result.get("agents") or []
    carbon = next((item for item in agent_results if item.get("agent_id") == 4), None)
    if carbon:
        deal["carbon_estimate"] = carbon
    return deal


@router.get("/download/{report_type}")
@router.get("/download/{report_type}/{deal_id}")
def download_pdf_report(
    report_type: str,
    deal_id: str = "preset_jute_bag",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    if report_type == "enterprise_audit":
        audit_data = run_live_enterprise_audit(db, current_user)
        pdf_bytes = generate_enterprise_audit_pdf(audit_data)
        filename = "ExportPilot_System_Diagnostics.pdf"
    else:
        deal = _resolve_deal_document(deal_id, current_user, db)
        if report_type == "proforma_invoice":
            pdf_bytes = generate_proforma_invoice_pdf(deal)
            filename = "ExportPilot_Proforma_Invoice_Draft.pdf"
        elif report_type == "cbam_certificate":
            pdf_bytes = generate_cbam_certificate_pdf(deal)
            filename = "ExportPilot_Preliminary_Emissions_Estimate.pdf"
        elif report_type == "buyer_catalog":
            pdf_bytes = generate_buyer_catalog_pdf(deal)
            filename = "ExportPilot_Product_Lookbook_Draft.pdf"
        else:
            raise HTTPException(status_code=404, detail="Report type not found")

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
