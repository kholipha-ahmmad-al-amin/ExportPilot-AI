from fastapi import APIRouter, HTTPException, Response
from backend.seed_data import PRESETS_DATA
from backend.pdf_generator import (
    generate_proforma_invoice_pdf,
    generate_cbam_certificate_pdf,
    generate_buyer_catalog_pdf,
    generate_enterprise_audit_pdf
)

router = APIRouter(prefix="/reports", tags=["PDF Reports & Quotations"])

@router.get("/download/{report_type}/{deal_id}")
def download_pdf_report(report_type: str, deal_id: str):
    # Match preset
    deal = None
    for p in PRESETS_DATA:
        if p["preset_id"] == deal_id:
            deal = p
            break
    if not deal:
        deal = PRESETS_DATA[0]

    if report_type == "proforma_invoice":
        pdf_bytes = generate_proforma_invoice_pdf(deal)
        filename = f"ExportPilot_Proforma_Invoice_{deal['hs_code_8digit']}.pdf"
    elif report_type == "cbam_certificate":
        pdf_bytes = generate_cbam_certificate_pdf(deal)
        filename = f"ExportPilot_EU_CBAM_Certificate_{deal['hs_code_8digit']}.pdf"
    elif report_type == "buyer_catalog":
        pdf_bytes = generate_buyer_catalog_pdf(deal)
        filename = f"ExportPilot_Buyer_Lookbook_{deal['hs_code_8digit']}.pdf"
    elif report_type == "enterprise_audit":
        pdf_bytes = generate_enterprise_audit_pdf({"deal_id": deal_id})
        filename = "ExportPilot_Enterprise_Audit_Report.pdf"
    else:
        raise HTTPException(status_code=400, detail="অজানা রিপোর্ট টাইপ")

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
