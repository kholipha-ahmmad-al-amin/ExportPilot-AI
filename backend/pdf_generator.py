"""Generate clearly labelled trade preparation documents and diagnostics."""

from datetime import datetime, timezone
from html import escape
import io
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def _text(value: Any, fallback: str = "Not provided") -> str:
    if value is None or value == "":
        return fallback
    return str(value)


def _money(value: Any) -> str:
    try:
        amount = float(value)
    except (TypeError, ValueError):
        return "Not provided"
    return f"USD {amount:,.2f}"


def _make_document(title: str, subtitle: str, rows: list[list[Any]], notice: str) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4, rightMargin=42, leftMargin=42, topMargin=42,
        bottomMargin=42, title=title, author="ExportPilot AI",
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ExportPilotTitle", parent=styles["Heading1"], fontName="Helvetica-Bold",
        fontSize=17, leading=22, textColor=colors.HexColor("#064E3B"), spaceAfter=5,
    )
    subtitle_style = ParagraphStyle(
        "ExportPilotSubtitle", parent=styles["Normal"], fontSize=9, leading=13,
        textColor=colors.HexColor("#475569"), spaceAfter=8,
    )
    body_style = ParagraphStyle(
        "ExportPilotBody", parent=styles["Normal"], fontSize=9, leading=13,
        textColor=colors.HexColor("#334155"),
    )
    story = [
        Paragraph(escape(title), title_style),
        Paragraph(escape(subtitle), subtitle_style),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceAfter=12),
    ]
    if rows:
        table = Table(rows, colWidths=[150, 350], repeatRows=1)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
            ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#0F172A")),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 8.5),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#CBD5E1")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ]))
        story.extend([table, Spacer(1, 14)])
    story.append(Paragraph(escape(notice), body_style))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        f"Generated {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
        ParagraphStyle("ExportPilotTimestamp", parent=body_style, fontSize=8,
                       textColor=colors.HexColor("#64748B")),
    ))
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


def generate_proforma_invoice_pdf(deal: dict) -> bytes:
    """Prepare a non-binding invoice draft without invented counterparty details."""
    quantity = deal.get("quantity") or deal.get("order_quantity")
    unit_price = deal.get("unit_price_usd") or deal.get("recommended_fob_price_usd")
    try:
        total = float(quantity) * float(unit_price) if quantity is not None and unit_price is not None else None
    except (TypeError, ValueError):
        total = None
    rows = [
        ["Field", "Draft value"],
        ["Seller", _text(deal.get("factory_name"), "Factory details to be completed")],
        ["Buyer", _text(deal.get("buyer_name"), "Buyer details to be completed")],
        ["Product", _text(deal.get("title_en"))],
        ["HS code candidate", _text(deal.get("hs_code_8digit"))],
        ["Quantity", _text(quantity, "To be agreed")],
        ["Indicative unit price", _money(unit_price)],
        ["Indicative total", _money(total)],
        ["Incoterm and named place", _text(deal.get("incoterm"), "To be agreed")],
        ["Payment terms", _text(deal.get("payment_terms"), "To be agreed")],
        ["Delivery date", _text(deal.get("delivery_date"), "To be agreed")],
    ]
    return _make_document(
        "Proforma Invoice Draft", "For review by the exporter and buyer", rows,
        "DRAFT ONLY. This document has not been sent, accepted, signed, or approved by a bank or customs authority. Confirm all parties, prices, quantities, payment instructions, Incoterms, taxes, and shipping details before issuing it. No bank account or signature is supplied by this service.",
    )


def generate_cbam_certificate_pdf(deal: dict) -> bytes:
    """Generate a preliminary emissions estimate, never a compliance certificate."""
    carbon = deal.get("carbon_estimate") or {}
    metrics = deal.get("uploaded_doc_metrics") or {}
    intensity = carbon.get("scope2_co2_kg_per_unit")
    if intensity is None:
        intensity = metrics.get("scope2_per_unit_kg_co2e", deal.get("cbam_scope2_co2_kg_per_unit"))
    total_kwh = metrics.get("total_kwh")
    total_emissions = metrics.get("scope2_total_kg_co2e")
    if total_emissions is None and total_kwh is not None:
        try:
            total_emissions = float(total_kwh) * float(metrics.get("grid_emission_factor_kg_per_kwh", 0))
        except (TypeError, ValueError):
            total_emissions = None
    benchmark = carbon.get("benchmark_co2_kg_per_unit", deal.get("eu_benchmark_co2_kg_per_unit"))
    rows = [
        ["Field", "Estimate"],
        ["Product", _text(deal.get("title_en"))],
        ["HS code candidate", _text(deal.get("hs_code_8digit"))],
        ["Electricity use", f"{total_kwh} kWh" if total_kwh is not None else "Not supplied"],
        ["Scope 2 total", f"{total_emissions} kg CO2e" if total_emissions is not None else "Not calculated"],
        ["Emissions per unit", f"{intensity} kg CO2e per unit" if intensity is not None else "Not calculated"],
        ["Configured comparison value", f"{benchmark} kg CO2e per unit" if benchmark is not None else "Not supplied"],
    ]
    return _make_document(
        "Preliminary Emissions Estimate", "Electricity based screening for export preparation", rows,
        "ESTIMATE ONLY. This is not an audit, verified footprint, CBAM declaration, certificate, or customs decision. Results depend on the supplied bill, production boundary, units, and emission factor. Confirm the method, product scope, and current requirements with a qualified auditor and the relevant authorities.",
    )


def generate_buyer_catalog_pdf(deal: dict) -> bytes:
    """Generate a product lookbook without fictitious buyer leads or approvals."""
    rows = [
        ["Field", "Product information"],
        ["Product", _text(deal.get("title_en"))],
        ["Product description", _text(deal.get("description"))],
        ["Suggested HS code", _text(deal.get("hs_code_8digit"))],
        ["Indicative unit price", _money(deal.get("recommended_fob_price_usd"))],
        ["Stated monthly capacity", _text(deal.get("monthly_capacity_units"))],
        ["Materials", _text(deal.get("materials"))],
        ["Destination tariff", "Not verified. Check the final code, destination, origin rules, and current schedule."],
        ["Buyer contacts", "Not included"],
    ]
    return _make_document(
        "Product Lookbook Draft", "Product information for review and editing", rows,
        "DRAFT PRODUCT MATERIAL. Product statements, prices, production capacity, HS classification, tariff treatment, and certificates have not been independently verified. This document contains no buyer contacts, confirmed order, or buyer approval.",
    )


def generate_enterprise_audit_pdf(audit_data: dict) -> bytes:
    """Render actual diagnostic output without implying external certification."""
    checklist = audit_data.get("checklist") or []
    rows = [["Check", "Result"]]
    for item in checklist:
        rows.append([
            _text(item.get("name"), "System check"),
            f"{_text(item.get('status'), 'NOT RUN')} - {_text(item.get('details'), '')}",
        ])
    if not checklist:
        rows.append(["System diagnostics", "No diagnostic results were supplied. Run the system check first."])
    score = audit_data.get("total_score")
    score_text = f"Internal diagnostic score: {score} / {audit_data.get('max_score', 100)}" if score is not None else "Internal diagnostic score: not available"
    rows.insert(1, ["Summary", f"{_text(audit_data.get('status'), 'not run')}. {score_text}"])
    return _make_document(
        "Platform Diagnostic Report", "Results from ExportPilot AI system checks", rows,
        "INTERNAL DIAGNOSTICS ONLY. This report is not a regulatory audit, security certification, trade certificate, or third-party assessment. Each check reflects the application state at the time it ran.",
    )
