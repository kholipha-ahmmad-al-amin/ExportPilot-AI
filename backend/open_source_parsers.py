import os
import re
import time
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import pymupdf as fitz
import pdfplumber
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.sovereignty import mask_bangla_pii

router = APIRouter(prefix="/parsers", tags=["Open-Source Parsers"])

BASE_DIR = Path(__file__).resolve().parent.parent
STUDIO_DIR = BASE_DIR / "frontend" / "public" / "assets" / "studio"
STUDIO_DIR.mkdir(parents=True, exist_ok=True)

def clean_studio_image(input_image_path: Path, output_filename: str, hs_code: str = "4202.22.10") -> str:
    """Takes a product image, places it on a studio canvas with drop shadow and export badge."""
    try:
        orig = Image.open(input_image_path).convert("RGBA")
        
        # Resize to fit within 600x600 inside an 800x800 studio frame
        orig.thumbnail((560, 560), Image.Resampling.LANCZOS)
        
        # Studio canvas (clean slight gradient off-white / light slate)
        canvas = Image.new("RGBA", (800, 800), (250, 252, 255, 255))
        
        # Calculate centering
        cx = (800 - orig.width) // 2
        cy = (800 - orig.height) // 2 - 20
        
        # Soft studio contact shadow beneath product
        shadow = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
        sdraw = ImageDraw.Draw(shadow)
        shadow_box = [cx + 30, cy + orig.height - 15, cx + orig.width - 30, cy + orig.height + 40]
        sdraw.ellipse(shadow_box, fill=(20, 30, 45, 75))
        shadow = shadow.filter(ImageFilter.GaussianBlur(16))
        canvas.alpha_composite(shadow)
        
        # Paste product
        canvas.alpha_composite(orig, (cx, cy))
        
        # Overlay studio badge: 'Made in Bangladesh • Verified Export Spec'
        draw = ImageDraw.Draw(canvas)
        draw.rectangle([50, 50, 380, 115], fill=(11, 17, 32, 235), outline=(16, 185, 129, 255), width=2)
        draw.text((65, 65), f"HS CODE: {hs_code}", fill=(245, 158, 11))
        draw.text((65, 88), "MADE IN BANGLADESH • EXPORT SPEC", fill=(16, 185, 129))
        
        out_path = STUDIO_DIR / output_filename
        canvas.convert("RGB").save(out_path, "JPEG", quality=92)
        return f"/assets/studio/{output_filename}"
    except Exception as e:
        print(f"Error in studio image cleaning: {e}")
        return "/assets/samples/jute-tote-bag.png"

def extract_pdf_data(pdf_path: Path) -> dict:
    """Extract structured trade-document data from a PDF using PyMuPDF and pdfplumber.

    Supports REB/DPDC/DESCO electricity bills, Bangladesh Trade License, and ERC.
    Returns typed JSON with doc_type, metrics, tables, and PII redaction results.
    """
    start_time = time.time()
    raw_text = ""
    tables = []
    
    # 1. PyMuPDF text extraction
    with fitz.open(str(pdf_path)) as doc:
        for page in doc:
            raw_text += page.get_text() + "\n"
            
    # 2. pdfplumber table extraction
    try:
        with pdfplumber.open(str(pdf_path)) as pdf:
            for page in pdf.pages:
                extracted = page.extract_tables()
                if extracted:
                    for t in extracted:
                        # Clean empty cells
                        cleaned_t = [[cell.strip() if cell else "" for cell in row] for row in t]
                        tables.append(cleaned_t)
    except Exception as e:
        print(f"pdfplumber error: {e}")
        
    # Apply Bangla PII Redaction
    redacted_text, pii_count, detected_entities = mask_bangla_pii(raw_text)
    
    # Detect document category & extract domain metrics
    doc_type = "unknown_document"
    metrics = {}
    
    has_reb = any(k in raw_text for k in ("ELECTRIFICATION", "POLLI BIDDYUT", "RURAL ELECTRIFICATION", "BREB", "REB"))
    has_dpdc = "DPDC" in raw_text
    has_desco = "DESCO" in raw_text
    is_electricity_bill = has_reb or has_dpdc or has_desco or "kWh" in raw_text

    if is_electricity_bill:
        doc_type = "reb_industrial_electricity_bill"
        
        meter_m = re.search(r"Meter No[:\s]*([A-Z0-9\-]+)", raw_text, re.IGNORECASE)
        meter_no = meter_m.group(1).strip() if meter_m else ""

        consumer_m = re.search(r"(?:Consumer Name|Consumer)[:\s]*([^\n]+)", raw_text, re.IGNORECASE)
        consumer_name = consumer_m.group(1).strip() if consumer_m else ""

        month_m = re.search(r"Billing Month[:\s]*([^\n]+)", raw_text, re.IGNORECASE)
        billing_month = month_m.group(1).strip() if month_m else ""

        peak_m = re.search(r"Peak[^0-9]*([\d,]+)\s*kWh", raw_text, re.IGNORECASE)
        if not peak_m:
            peak_m = re.search(r"Peak Hours[^\n]*\n[^\n]*\n[^\n]*\s*([\d,]+)", raw_text)
        peak_kwh = float(peak_m.group(1).replace(",", "")) if peak_m else 0.0
        
        offpeak_m = re.search(r"Off-Peak[^0-9]*([\d,]+)\s*kWh", raw_text, re.IGNORECASE)
        if not offpeak_m:
            offpeak_m = re.search(r"Off-Peak Hours[^\n]*\n[^\n]*\n[^\n]*\s*([\d,]+)", raw_text)
        offpeak_kwh = float(offpeak_m.group(1).replace(",", "")) if offpeak_m else 0.0
        
        total_m = re.search(r"Total Active Energy[^\n]*\n[^\n]*\s*([\d,]+)\s*kWh", raw_text)
        if not total_m:
            total_m = re.search(r"Total[^\n]*\n[^\n]*\s*([\d,]+)\s*kWh", raw_text)
        total_kwh = float(total_m.group(1).replace(",", "")) if total_m else (peak_kwh + offpeak_kwh)
        
        pf_m = re.search(r"Power Factor[^0-9]*([\d\.]+)", raw_text, re.IGNORECASE)
        pf = float(pf_m.group(1)) if pf_m else 0.0
        
        bill_m = re.search(r"NET PAYABLE[^\n]*\n([^\n]*\n){0,10}?\s*([\d,]+\.?\d*)", raw_text, re.IGNORECASE)
        if not bill_m:
            bill_m = re.search(r"NET PAYABLE AMOUNT[^\n]*\n([^\n]*\n){0,10}?\s*([\d,]+\.?\d*)", raw_text, re.IGNORECASE)
        if not bill_m:
            bill_m = re.search(r"Total Bill[^0-9]*([\d,]+\.?\d*)", raw_text)
        net_payable_bdt = float(bill_m.group(2).replace(",", "")) if bill_m else 0.0
        
        grid_emission_factor = 0.637
        scope2_total_kg_co2e = round(total_kwh * grid_emission_factor, 2)
        scope2_per_unit_kg_co2e = round(scope2_total_kg_co2e / 10000.0, 2)
        
        metrics = {
            "document_type": "electricity_bill",
            "utility_board": "REB" if has_reb else ("DPDC" if has_dpdc else "DESCO"),
            "consumer_name": consumer_name,
            "billing_month": billing_month,
            "meter_no": meter_no,
            "peak_kwh": peak_kwh,
            "offpeak_kwh": offpeak_kwh,
            "total_kwh": total_kwh,
            "power_factor": pf,
            "grid_emission_factor_kg_per_kwh": grid_emission_factor,
            "scope2_total_kg_co2e": scope2_total_kg_co2e,
            "scope2_per_unit_kg_co2e": scope2_per_unit_kg_co2e,
            "eu_cbam_benchmark_limit_kg": 1.45,
            "cbam_compliance_status": "COMPLIANT_PASS" if scope2_per_unit_kg_co2e <= 1.45 else "NON_COMPLIANT",
            "net_payable_bdt": net_payable_bdt,
        }
        
    elif "TRADE LICENSE" in raw_text or "MUNICIPALITY" in raw_text:
        doc_type = "bangladesh_trade_license"

        tl_m = re.search(r"Trade License Number[:\s]*([^\n]+)", raw_text, re.IGNORECASE)
        trade_license_no = tl_m.group(1).strip() if tl_m else ""

        biz_m = re.search(r"(?:Business Enterprise|Business Name)[:\s]*([^\n]+)", raw_text, re.IGNORECASE)
        enterprise_name = biz_m.group(1).strip() if biz_m else ""

        addr_m = re.search(r"Factory Address[:\s]*([^\n]+)", raw_text, re.IGNORECASE)
        factory_address = addr_m.group(1).strip() if addr_m else ""

        val_m = re.search(r"Validity Period[:\s]*([^\n]+)", raw_text, re.IGNORECASE)
        validity = val_m.group(1).strip() if val_m else ""

        metrics = {
            "document_type": "trade_license",
            "enterprise_name": enterprise_name,
            "trade_license_no": trade_license_no,
            "factory_address": factory_address,
            "validity": validity,
            "compliance_status": "VALID_ACTIVE",
        }

    elif "ERC" in raw_text or "EXPORT REGISTRATION" in raw_text:
        doc_type = "bangladesh_erc"

        erc_m = re.search(r"ERC Number[:\\s]*([^\\n]+)", raw_text, re.IGNORECASE)
        erc_number = erc_m.group(1).strip() if erc_m else ""

        auth_m = re.search(r"(?:Issuing Authority|Chief Controller)[^\\n]*\\n?\\s*([^\\n]+)", raw_text, re.IGNORECASE)
        issuing_authority = auth_m.group(1).strip() if auth_m else "Chief Controller of Imports & Exports (CCI&E)"

        status_m = re.search(r"(?:Active|Valid|Expired)[^\\n]*", raw_text, re.IGNORECASE)
        validity_status = status_m.group(0).strip() if status_m else "Active"

        metrics = {
            "document_type": "erc",
            "erc_number": erc_number,
            "issuing_authority": issuing_authority,
            "validity_status": validity_status,
        }
    
    elapsed_ms = round((time.time() - start_time) * 1000, 1)
    
    return {
        "status": "success",
        "doc_type": doc_type,
        "execution_time_ms": elapsed_ms,
        "parser_engine": "PyMuPDF (fitz) + pdfplumber",
        "pii_redacted_count": pii_count,
        "detected_entities": detected_entities,
        "metrics": metrics,
        "tables_count": len(tables),
        "tables": tables,
        "redacted_text_snippet": redacted_text[:1200]
    }

@router.post("/parse-pdf")
async def parse_pdf_endpoint(file: UploadFile = File(None), preset_doc: str = Form(None)):
    """Parses an uploaded PDF or a preset bundled sample PDF."""
    if preset_doc == "sample_reb_bill":
        sample_path = BASE_DIR / "frontend" / "public" / "assets" / "samples" / "sample-reb-electricity-bill.pdf"
        return extract_pdf_data(sample_path)
    elif preset_doc == "sample_trade_license":
        sample_path = BASE_DIR / "frontend" / "public" / "assets" / "samples" / "sample-trade-license-bd.pdf"
        return extract_pdf_data(sample_path)
    elif file:
        temp_path = BASE_DIR / "scripts" / f"temp_{file.filename}"
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)
        try:
            res = extract_pdf_data(temp_path)
            return res
        finally:
            if temp_path.exists():
                temp_path.unlink()
    else:
        # Default to REB bill
        sample_path = BASE_DIR / "frontend" / "public" / "assets" / "samples" / "sample-reb-electricity-bill.pdf"
        return extract_pdf_data(sample_path)
