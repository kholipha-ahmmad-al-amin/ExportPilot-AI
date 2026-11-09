"""Sovereign AI Trade Intelligence Hub router for ExportPilot AI.

Provides four specialized hybrid AI engines:
1. Real-Time Voice & Vision Quality Inspector (AQL 2.5 & 8-digit HS Code)
2. Autonomous Supply Chain & Shipping Route Risk Predictor (Chattogram Port & Corridors)
3. Export Finance & Bangladesh Bank Credit/Back-to-Back LC Scoring Engine
4. Multi-Language Buyer Negotiation & Auto-Contract Generator (DE, JA, AR, FR, EN + BN)
Plus official PDF report and contract generation.
"""

from __future__ import annotations

import base64
import io
import logging
import time
import binascii
from datetime import datetime, timezone
from html import escape
from typing import Annotated, Any, Dict, List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph

from backend.pdf_generator import _make_document
from backend.sovereignty import mask_bangla_pii
from backend.auth import require_roles

try:
    from PIL import Image, ImageStat
except ImportError:
    Image = None
    ImageStat = None

logger = logging.getLogger("exportpilot.intelligence")

router = APIRouter(
    prefix="/intelligence",
    tags=["AI Trade Intelligence Hub"],
    dependencies=[Depends(require_roles("factory_owner", "admin"))],
)


def _assessment_metadata(kind: str, *, evidence_status: str = "not_verified") -> dict:
    return {
        "assessment_kind": kind,
        "evidence_status": evidence_status,
        "is_estimate": True,
        "is_certification": False,
        "source": "Entered information and built-in planning assumptions",
        "limitations_bn": "এটি প্রস্তুতির হিসাব ও খসড়া। সরাসরি পরিদর্শন, ব্যাংকের অনুমোদন বা ক্রেতার সম্মতি নয়। চূড়ান্ত সিদ্ধান্তের আগে তথ্য ও শর্ত যাচাই করুন।",
        "limitations_en": "Planning estimates and drafts only. This is not an inspection, bank approval, buyer acceptance, or certification. Verify information and terms before proceeding.",
    }


def _sanitize_text(text: str) -> str:
    if not text:
        return ""
    cleaned = text.replace("\u2014", "-").replace("\u2013", "-")
    for ch in ("\u2728", "\U0001f31f", "\U0001f4ab", "\u2b50"):
        cleaned = cleaned.replace(ch, "")
    return cleaned


# ============================================================================
# 1. REAL-TIME VOICE & VISION QUALITY INSPECTOR
# ============================================================================

class VisionInspectRequest(BaseModel):
    sector: Literal["garments", "jute", "leather", "ceramics", "agro"] = "jute"
    product_name: str = Field(default="Organic Jute Shopping Tote Bag", max_length=300)
    voice_or_text_note: str = Field(
        default="৩০০ জিএসএম ন্যাচারাল জুট টোট ব্যাগ, ডাবল স্টিচিং হ্যান্ডেল, আজো-ফ্রি ডাই, ইউরোপে রপ্তানির জন্য প্রস্তুত।",
        max_length=5000,
    )
    target_market: Literal["EU", "UK", "USA", "Japan", "MiddleEast", "Canada"] = "EU"
    batch_size_units: int = Field(default=5000, ge=50, le=1000000)
    image_base64: Optional[str] = Field(default=None, max_length=8_000_000)


SECTOR_VISION_PROFILES: Dict[str, Dict[str, Any]] = {
    "jute": {
        "hs_code_8digit": "4202.92.10",
        "hs_chapter_title": "Trunks, Suit-Cases, Executive-Cases & Shopping Bags of Jute/Bast Fibres",
        "material_spec_bn": "১০০% বায়োডিগ্রেডেবল গোল্ডেন জুট ফাইবার (৩০০ জিএসএম, ল্যামিনেটেড ইন্টেরিয়র)",
        "material_spec_en": "100% Biodegradable Golden Jute Fibre (300 GSM, food-grade laminated interior)",
        "aql_standard": "ISO 2859-1 (AQL 2.5 Major / 4.0 Minor)",
        "metrics": [
            {"name_bn": "বুনন ঘনত্ব ও জিএসএম সামঞ্জস্য", "name_en": "Weave Density & GSM Uniformity", "status": "NOT_ASSESSED", "benchmark": ">= 90%"},
            {"name_bn": "হ্যান্ডেল স্টিচিং টেনসাইল স্ট্রেংথ", "name_en": "Handle Stitching Tensile Strength", "status": "NOT_ASSESSED", "benchmark": "15 kg load test"},
            {"name_bn": "সারফেস ফাইবার ও এজ ফিনিশিং", "name_en": "Surface Fibre & Edge Finishing", "status": "NOT_ASSESSED", "benchmark": "Zero loose fray > 2mm"},
            {"name_bn": "আজো-ফ্রি ডাই ও আর্দ্রতা মাত্রা", "name_en": "Azo-Free Dye & Moisture Content", "status": "NOT_ASSESSED", "benchmark": "Moisture < 12.5%"},
        ],
        "remediation_bn": [
            "প্যাকেজিংয়ের আগে প্রতিটি কার্টনে সিলিকা জেল ডেসিক্যান্ট রাখুন যাতে সমুদ্রপথে আর্দ্রতা ১২% এর নিচে থাকে।",
            "হ্যান্ডেল জয়েন্টে ক্রস-বক্স স্টিচিং (প্রতি ইঞ্চিতে ৮-১০ স্টিচ) বজায় রাখুন।",
            "ইউরোপীয় ক্রেতার জন্য REACH SVHC এবং Azo-free ল্যাব টেস্ট রিপোর্ট শিপমেন্ট ফাইলের সাথে সংযুক্ত করুন।",
        ],
        "remediation_en": [
            "Place silica gel desiccants inside master cartons to maintain transit moisture below 12%.",
            "Maintain reinforced cross-box stitching (8-10 SPI) at handle attachment points.",
            "Attach REACH SVHC and Azo-free lab test reports to the buyer compliance dossier.",
        ],
    },
    "garments": {
        "hs_code_8digit": "6203.42.10",
        "hs_chapter_title": "Men's or Boys' Trousers & Denim Jeans of Cotton (Not Knitted)",
        "material_spec_bn": "১২ আউন্স অর্গানিক কটন ও রিসাইকেলড ইলাস্টেন ডেনিম ফেব্রিক",
        "material_spec_en": "12 oz Organic Cotton & Recycled Elastane Selvedge Denim Fabric",
        "aql_standard": "ISO 2859-1 (AQL 2.5 Major / 4.0 Minor)",
        "metrics": [
            {"name_bn": "সিম পাকারিং ও স্টিচ ডেনসিটি (SPI)", "name_en": "Seam Puckering & Stitch Density (SPI)", "status": "NOT_ASSESSED", "benchmark": "10-12 SPI uniform"},
            {"name_bn": "কালার ফাস্টনেস ও ওয়াশ শেড ব্যান্ডিং", "name_en": "Color Fastness & Wash Shade Banding", "status": "NOT_ASSESSED", "benchmark": "Grade 4.5 ISO 105"},
            {"name_bn": "রিভেট, বাটন ও মেটাল ডিটেকশন", "name_en": "Rivet, Zipper & Broken Needle Check", "status": "NOT_ASSESSED", "benchmark": "100% Ferrous Pass"},
            {"name_bn": "ডাইমেনশনাল শ্রিংকেজ টলারেন্স", "name_en": "Dimensional Shrinkage Tolerance", "status": "NOT_ASSESSED", "benchmark": "Within +/- 2.5%"},
        ],
        "remediation_bn": [
            "ফিনিশিং লাইনে ১০০% নিডল ডিটেক্টর স্ক্যান লগ সংরক্ষণ করুন।",
            "ওয়েস্টব্যান্ড ও ইনসিম মেজারমেন্ট টলারেন্স চার্ট অনুযায়ী প্রতি ৫০ পিসে ১টি র‍্যান্ডম অডিট করুন।",
            "OEKO-TEX Standard 100 এবং GOTS সার্টিফিকেট রেফারেন্স ইনভয়েসে উল্লেখ করুন।",
        ],
        "remediation_en": [
            "Preserve 100% needle-detector scan logs at the final finishing gate.",
            "Verify waistband and inseam tolerances on 1-in-50 random audit samples.",
            "Include OEKO-TEX Standard 100 and GOTS certificate numbers in shipping documents.",
        ],
    },
    "leather": {
        "hs_code_8digit": "6403.91.10",
        "hs_chapter_title": "Footwear with Outer Soles of Rubber/Plastics and Uppers of Leather (Covering Ankle)",
        "material_spec_bn": "ফুল-গ্রেইন ভেজিটেবল-ট্যানড কাউহাইড লেদার (LWG অনুমোদিত ট্যানারি)",
        "material_spec_en": "Full-Grain Vegetable-Tanned Cowhide Leather (LWG-Compliant Tannery)",
        "aql_standard": "ISO 2859-1 (AQL 1.5 Critical / 2.5 Major)",
        "metrics": [
            {"name_bn": "লেদার গ্রেইন ও সারফেস ব্লেমিশ চেক", "name_en": "Leather Grain & Surface Blemish Check", "status": "NOT_ASSESSED", "benchmark": "Zero scar on vamp"},
            {"name_bn": "সোল বন্ডিং ও ফ্লেক্স রেজিস্ট্যান্স", "name_en": "Sole Bonding & Flex Resistance", "status": "NOT_ASSESSED", "benchmark": "50,000 flex cycles"},
            {"name_bn": "ক্রোমিয়াম VI (Cr6+) সেফটি লিমিট", "name_en": "Chromium VI (Cr6+) Safety Screening", "status": "NOT_ASSESSED", "benchmark": "< 3.0 mg/kg ISO 17075"},
            {"name_bn": "পেয়ার ম্যাচিং ও সাইজ ক্যালিব্রেশন", "name_en": "Pair Shade Matching & Last Calibration", "status": "NOT_ASSESSED", "benchmark": "Delta-E < 1.0"},
        ],
        "remediation_bn": [
            "ইউরোপ ও জাপানে রপ্তানির জন্য ক্রোমিয়াম-৬ (Cr VI < 3 mg/kg) ল্যাব রিপোর্ট বাধ্যতামূলকভাবে সংযুক্ত করুন।",
            "বাম ও ডান জুতার শেড এবং গ্রেইন টেক্সচার উজ্জ্বল আলোতে মিলিয়ে বক্সিং করুন।",
            "অ্যান্টি-মোন্ড র‍্যাপিং পেপার ব্যবহার করে কন্টেইনারে লোড করুন।",
        ],
        "remediation_en": [
            "Attach ISO 17075 Chromium VI (< 3 mg/kg) test certificate for EU and Japanese customs.",
            "Perform D65 lightbox pair-matching for grain and shade uniformity prior to boxing.",
            "Use anti-mold tissue wrapping inside individual shoe boxes.",
        ],
    },
    "ceramics": {
        "hs_code_8digit": "6911.10.00",
        "hs_chapter_title": "Tableware and Kitchenware of Porcelain or China",
        "material_spec_bn": "লিড ও ক্যাডমিয়াম-মুক্ত ফাইন পোর্সেলিন ও বোন চায়না গ্লেজ",
        "material_spec_en": "Lead & Cadmium-Free High-Fired Porcelain & Bone China Glaze",
        "aql_standard": "ISO 2859-1 (AQL 1.5 Critical / 2.5 Major)",
        "metrics": [
            {"name_bn": "গ্লেজ পিনহোল ও সারফেস গ্লস ইউনিফর্মিটি", "name_en": "Glaze Pinhole & Surface Gloss Uniformity", "status": "NOT_ASSESSED", "benchmark": "Zero pinhole > 0.5mm"},
            {"name_bn": "থার্মাল শক ও মাইক্রোওয়েভ রেজিস্ট্যান্স", "name_en": "Thermal Shock & Microwave Safety", "status": "NOT_ASSESSED", "benchmark": "180C delta quench"},
            {"name_bn": "লিড ও ক্যাডমিয়াম ফুড-কন্টাক্ট সেফটি", "name_en": "Lead & Cadmium Food-Contact Leaching", "status": "NOT_ASSESSED", "benchmark": "FDA / EU 84/500/EEC"},
            {"name_bn": "বেস ফ্ল্যাটনেস ও রিম রাউন্ডনেস", "name_en": "Base Flatness & Rim Concentricity", "status": "NOT_ASSESSED", "benchmark": "Wobble < 0.8mm"},
        ],
        "remediation_bn": [
            "ফুড-কন্টাক্ট সিরামিক পণ্যের জন্য EU 84/500/EEC এবং US FDA Lead/Cadmium টেস্ট রিপোর্ট যুক্ত করুন।",
            "ড্রপ-টেস্ট (ISTA 1A) পাস করার জন্য ৫-প্লাই করোগেটেড ডিভাইডার বক্স ব্যবহার করুন।",
            "কিলন ফায়ারিং ব্যাচ নম্বর প্রতিটি মাস্টার কার্টনের গায়ে প্রিন্ট করুন।",
        ],
        "remediation_en": [
            "Include EU 84/500/EEC and US FDA Lead/Cadmium leach test certificates.",
            "Use 5-ply corrugated egg-crate dividers validated for ISTA 1A drop testing.",
            "Print kiln firing batch numbers on all outer master cartons for traceability.",
        ],
    },
    "agro": {
        "hs_code_8digit": "0910.91.10",
        "hs_chapter_title": "Processed Spices, Culinary Mixes & Dehydrated Agro-Food Products",
        "material_spec_bn": "এইচএসিসিপি (HACCP) ও ISO 22000 স্ট্যান্ডার্ডে প্রক্রিয়াজাত ও ভ্যাকুয়াম প্যাকড কৃষিপণ্য",
        "material_spec_en": "HACCP & ISO 22000 Processed Vacuum-Sealed Culinary Agro-Products",
        "aql_standard": "Codex Alimentarius / ISO 2859-1 Food Grade",
        "metrics": [
            {"name_bn": "আর্দ্রতা ও ওয়াটার অ্যাক্টিভিটি (aW)", "name_en": "Moisture & Water Activity (aW) Control", "status": "NOT_ASSESSED", "benchmark": "Moisture < 10.0%"},
            {"name_bn": "আফলাটক্সিন ও পেস্টিসাইড রেসিডিউ স্ক্রিনিং", "name_en": "Aflatoxin & MRL Pesticide Screening", "status": "NOT_ASSESSED", "benchmark": "Aflatoxin B1 < 2 ppb"},
            {"name_bn": "পাউচ হিট-সিল ও নাইট্রোজেন ফ্লাশ অখণ্ডতা", "name_en": "Pouch Heat-Seal & Nitrogen Flush Integrity", "status": "NOT_ASSESSED", "benchmark": "100% Vacuum Hold"},
            {"name_bn": "ফরেইন ম্যাটার ও মেটাল সিভিং চেক", "name_en": "Foreign Matter & Magnetic Sieving", "status": "NOT_ASSESSED", "benchmark": "10,000 Gauss Trap"},
        ],
        "remediation_bn": [
            "কৃষি সম্প্রসারণ অধিদপ্তর (DAE) থেকে ফাইটোস্যানিটারি সার্টিফিকেট (Phytosanitary Certificate) সংগ্রহ করুন।",
            "ইউরোপ ও মধ্যপ্রাচ্যে রপ্তানির জন্য আফলাটক্সিন (Aflatoxin B1 < 2 ppb) এবং সালমোনেলা নেগেটিভ রিপোর্ট যুক্ত করুন।",
            "প্যাকেটের গায়ে উৎপাদন তারিখ, মেয়াদোত্তীর্ণ তারিখ এবং পুষ্টিমান টেবিল স্পষ্টভাবে মুদ্রণ করুন।",
        ],
        "remediation_en": [
            "Obtain official Phytosanitary Certificate from the Department of Agricultural Extension (DAE).",
            "Attach accredited laboratory reports for Aflatoxin (< 2 ppb) and Salmonella-absent verification.",
            "Print batch lot code, expiry date, and allergen declaration in destination market language.",
        ],
    },
}


def _analyze_optional_image(image_base64: Optional[str]) -> Dict[str, Any]:
    if not image_base64:
        return {"image_supplied": False, "resolution": None, "brightness_score": None,
                "contrast_uniformity": None, "evidence_status": "not_supplied"}
    if Image is None:
        raise HTTPException(status_code=503, detail="Image inspection is not available")
    raw_b64 = image_base64.split(",", 1)[-1]
    try:
        img_bytes = base64.b64decode(raw_b64, validate=True)
        if len(img_bytes) > 5_000_000:
            raise HTTPException(status_code=413, detail="Image must be 5 MB or smaller")
        with Image.open(io.BytesIO(img_bytes)) as img:
            if img.format not in {"JPEG", "PNG", "WEBP"}:
                raise HTTPException(status_code=422, detail="Upload a JPEG, PNG, or WebP image")
            width, height = img.size
            if width * height > 16_000_000:
                raise HTTPException(status_code=413, detail="Image must be 16 megapixels or smaller")
            img.load()
            rgb = img.convert("RGB")
            # Bound statistics work independently of the original image dimensions.
            rgb.thumbnail((1200, 1200))
            stat = ImageStat.Stat(rgb)
            return {
                "image_supplied": True,
                "resolution": f"{width}x{height} px",
                "brightness_score": round(sum(stat.mean) / 3.0 / 255.0 * 100.0, 1),
                "contrast_uniformity": round(sum(stat.stddev) / 3.0 / 255.0 * 100.0, 1),
                "evidence_status": "image_statistics_only",
                "measurement_note": "Mean brightness and channel standard deviation as percentages of 255. These do not assess product quality.",
            }
    except HTTPException:
        raise
    except (binascii.Error, ValueError, OSError, Image.DecompressionBombError):
        raise HTTPException(status_code=422, detail="Upload a valid JPEG, PNG, or WebP image") from None


@router.post("/vision-inspect")
def vision_quality_inspect(req: VisionInspectRequest) -> Dict[str, Any]:
    started = time.perf_counter()
    redacted_note, pii_count, _ = mask_bangla_pii(req.voice_or_text_note)
    profile = SECTOR_VISION_PROFILES[req.sector]
    img_metrics = _analyze_optional_image(req.image_base64)
    metrics = [
        {**item, "score": None, "status": "NOT_ASSESSED"}
        for item in profile["metrics"]
    ]
    return {
        **_assessment_metadata("pre_shipment_checklist", evidence_status=img_metrics["evidence_status"]),
        "module": "vision_inspect",
        "product_name": _sanitize_text(req.product_name),
        "sector": req.sector,
        "target_market": req.target_market,
        "hs_code_8digit": profile["hs_code_8digit"],
        "hs_classification_status": "sector_reference_requires_product_verification",
        "hs_chapter_title": profile["hs_chapter_title"],
        "material_spec_bn": "পণ্যের উপাদান, পরীক্ষার ফল ও সনদ সরবরাহকারীকে নিশ্চিত করতে হবে।",
        "material_spec_en": "Supplier confirmation of composition, test results, and certificates is required.",
        "tariff_treatment": "Not assessed. Confirm the destination tariff, classification, origin rules, and current eligibility.",
        "aql_standard": "Inspection plan to be agreed with the buyer",
        "batch_size_units": req.batch_size_units,
        "iso_sample_size": None,
        "defects": {"critical_found": None, "critical_limit": None, "major_found": None,
                    "major_limit": None, "minor_found": None, "minor_limit": None},
        "export_readiness_score": None,
        "export_grade": "Not assessed",
        "image_diagnostics": img_metrics,
        "quality_metrics": metrics,
        "remediation_bn": profile["remediation_bn"],
        "remediation_en": profile["remediation_en"],
        "summary_bn": f"{req.product_name} পণ্যের জন্য চালানের আগে যাচাইয়ের তালিকা তৈরি হয়েছে। ছবি থাকলে শুধু ছবির উজ্জ্বলতা ও কনট্রাস্ট মাপা হয়েছে। পণ্যের ত্রুটি, মান বা সনদ যাচাই করা হয়নি।",
        "summary_en": f"A pre-shipment review checklist was prepared for {req.product_name}. An uploaded image provides brightness and contrast statistics only. Product defects, quality, and certification have not been assessed.",
        "redacted_input": redacted_note,
        "pii_redacted_count": pii_count,
        "latency_ms": int((time.perf_counter() - started) * 1000),
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
    }


# ============================================================================
# 2. AUTONOMOUS SUPPLY CHAIN & SHIPPING ROUTE RISK PREDICTOR
# ============================================================================

class SupplyChainRiskRequest(BaseModel):
    sector: Literal["garments", "jute", "leather", "ceramics", "agro"] = "garments"
    destination_port: Literal["Rotterdam", "Hamburg", "Felixstowe", "Tokyo", "LosAngeles", "Jeddah"] = "Rotterdam"
    containers_teu: int = Field(default=2, ge=1, le=200)
    cargo_value_usd: float = Field(default=48000.0, ge=1000.0, le=50_000_000.0)
    preferred_incoterm: Literal["FOB", "CIF", "CFR", "DDP"] = "FOB"


DESTINATION_CORRIDOR_DATA: Dict[str, Dict[str, Any]] = {
    "Rotterdam": {
        "country": "Netherlands (EU)",
        "region": "EUROPE_WEST",
        "distance_nm": 7950,
        "suez_days": 26,
        "cape_days": 35,
        "singapore_express_days": 28,
        "base_teu_usd": 2450,
        "cbam_applicable": None,
    },
    "Hamburg": {
        "country": "Germany (EU)",
        "region": "EUROPE_WEST",
        "distance_nm": 8180,
        "suez_days": 28,
        "cape_days": 37,
        "singapore_express_days": 30,
        "base_teu_usd": 2580,
        "cbam_applicable": None,
    },
    "Felixstowe": {
        "country": "United Kingdom",
        "region": "EUROPE_WEST",
        "distance_nm": 8020,
        "suez_days": 27,
        "cape_days": 36,
        "singapore_express_days": 29,
        "base_teu_usd": 2520,
        "cbam_applicable": None,
    },
    "Tokyo": {
        "country": "Japan",
        "region": "EAST_PACIFIC",
        "distance_nm": 4650,
        "suez_days": 14,
        "cape_days": 17,
        "singapore_express_days": 14,
        "base_teu_usd": 1680,
        "cbam_applicable": None,
    },
    "LosAngeles": {
        "country": "United States (West Coast)",
        "region": "EAST_PACIFIC",
        "distance_nm": 9850,
        "suez_days": 29,
        "cape_days": 33,
        "singapore_express_days": 28,
        "base_teu_usd": 3650,
        "cbam_applicable": None,
    },
    "Jeddah": {
        "country": "Saudi Arabia (Red Sea / GCC)",
        "region": "MIDDLE_EAST",
        "distance_nm": 4120,
        "suez_days": 14,
        "cape_days": 16,
        "singapore_express_days": 18,
        "base_teu_usd": 1790,
        "cbam_applicable": None,
    },
}


@router.post("/supply-chain-risk")
def predict_supply_chain_risk(req: SupplyChainRiskRequest) -> Dict[str, Any]:
    started = time.perf_counter()
    dest = DESTINATION_CORRIDOR_DATA.get(req.destination_port, DESTINATION_CORRIDOR_DATA["Rotterdam"])

    chattogram_status = {
        "origin_port": "Chattogram Port (BDCGP)",
        "berth_occupancy_pct": None,
        "customs_asycuda_clearance_hours": None,
        "feeder_turnaround_days": None,
        "congestion_level": "NOT_REPORTED",
        "congestion_note_bn": "বন্দরের সরাসরি তথ্য সংযুক্ত নেই। জাহাজের সময়সূচি, ভাড়া ও ছাড়পত্রের সময় আপনার শিপিং এজেন্টের কাছে নিশ্চিত করুন।",
        "congestion_note_en": "No live port feed is connected. Confirm schedules, rates, and clearance times with your shipping agent.",
    }

    base_freight = dest["base_teu_usd"] * req.containers_teu
    war_risk_surcharge = round(req.cargo_value_usd * 0.0045, 2)
    standard_insurance = round(req.cargo_value_usd * 0.0015, 2)

    region = dest["region"]
    if region == "EAST_PACIFIC":
        routes = [
            {
                "route_id": "singapore_malacca_pacific",
                "name_bn": f"চট্টগ্রাম -> সিঙ্গাপুর PSA -> মালাক্কা প্রণালী -> {req.destination_port} এক্সপ্রেস মাদার ভেসেল",
                "name_en": f"Chattogram -> Singapore PSA -> Strait of Malacca -> {req.destination_port} Express Mother Vessel",
                "transit_days": dest["singapore_express_days"],
                "freight_total_usd": round(base_freight * 1.0, 2),
                "insurance_usd": standard_insurance,
                "on_time_probability_pct": 96,
                "risk_level": "LOW",
                "co2_kg_total": round(req.containers_teu * dest["distance_nm"] * 0.125, 1),
                "recommended": True,
                "notes_bn": "পূর্বমুখী প্রশান্ত মহাসাগরীয় রুটে দ্রুততম ট্রানজিট এবং সর্বনিম্ন কার্বন নিঃসরণ।",
                "notes_en": "Fastest eastbound Asia-Pacific mother-vessel connection via PSA Singapore with highest schedule reliability.",
            },
            {
                "route_id": "port_klang_busan_hub",
                "name_bn": f"চট্টগ্রাম -> পোর্ট ক্লাং (মালয়েশিয়া) -> কাওশিউং/বুসান হাব -> {req.destination_port}",
                "name_en": f"Chattogram -> Port Klang (Malaysia) -> Kaohsiung/Busan Hub -> {req.destination_port}",
                "transit_days": dest["cape_days"],
                "freight_total_usd": round(base_freight * 0.94, 2),
                "insurance_usd": standard_insurance,
                "on_time_probability_pct": 92,
                "risk_level": "LOW",
                "co2_kg_total": round(req.containers_teu * dest["distance_nm"] * 0.132, 1),
                "recommended": False,
                "notes_bn": "সাশ্রয়ী কন্টেইনার ভাড়া এবং বিকল্প ট্রান্সশিপমেন্ট স্লট সুবিধা।",
                "notes_en": "Cost-effective alternative transshipment via Port Klang and East Asian hub ports.",
            },
            {
                "route_id": "colombo_transpacific_loop",
                "name_bn": f"চট্টগ্রাম -> কলম্বো হাব -> ট্রান্স-প্যাসিফিক অ্যালায়েন্স লুপ -> {req.destination_port}",
                "name_en": f"Chattogram -> Colombo Hub -> Trans-Pacific Alliance Loop -> {req.destination_port}",
                "transit_days": dest["cape_days"] + 4,
                "freight_total_usd": round(base_freight * 1.08, 2),
                "insurance_usd": standard_insurance,
                "on_time_probability_pct": 87,
                "risk_level": "MODERATE",
                "co2_kg_total": round(req.containers_teu * dest["distance_nm"] * 0.144, 1),
                "recommended": False,
                "notes_bn": "সিঙ্গাপুরে বার্থ জট থাকলে কলম্বো হয়ে বিকল্প ব্যাকআপ রুট হিসেবে উপযোগী।",
                "notes_en": "Secondary backup corridor via Colombo when Strait of Malacca feeder slots are full.",
            },
        ]
    elif region == "MIDDLE_EAST":
        routes = [
            {
                "route_id": "colombo_arabian_direct",
                "name_bn": "চট্টগ্রাম -> কলম্বো ট্রান্সশিপমেন্ট -> আরব সাগর -> জেদ্দা ডিরেক্ট সার্ভিস",
                "name_en": "Chattogram -> Colombo Transshipment -> Arabian Sea -> Jeddah Direct Service",
                "transit_days": dest["suez_days"],
                "freight_total_usd": round(base_freight * 1.0, 2),
                "insurance_usd": standard_insurance,
                "on_time_probability_pct": 94,
                "risk_level": "LOW",
                "co2_kg_total": round(req.containers_teu * dest["distance_nm"] * 0.122, 1),
                "recommended": True,
                "notes_bn": "সৌদি আরব ও মধ্যপ্রাচ্যে হালাল ও এগ্রো পণ্যের জন্য সবচেয়ে নির্ভরযোগ্য রুট।",
                "notes_en": "Primary direct corridor into Jeddah Islamic Port with priority cold-chain and dry-container berthing.",
            },
            {
                "route_id": "jebel_ali_gcc_bridge",
                "name_bn": "চট্টগ্রাম -> জেবেল আলী (দুবাই) হাব -> জিসিসি মাল্টিমোডাল করিডোর",
                "name_en": "Chattogram -> Jebel Ali (UAE) Hub -> GCC Multimodal Sea-Land Bridge",
                "transit_days": dest["cape_days"],
                "freight_total_usd": round(base_freight * 1.12, 2),
                "insurance_usd": standard_insurance,
                "on_time_probability_pct": 95,
                "risk_level": "LOW",
                "co2_kg_total": round(req.containers_teu * dest["distance_nm"] * 0.135, 1),
                "recommended": False,
                "notes_bn": "লোহিত সাগরের প্রবেশপথে বিলম্ব হলে দুবাই হয়ে দ্রুততম বিকল্প পথ।",
                "notes_en": "Bypasses Bab el-Mandeb choke point via Jebel Ali with bonded GCC customs transit.",
            },
            {
                "route_id": "bab_el_mandeb_spot",
                "name_bn": "চট্টগ্রাম -> বাব এল-মান্দেব স্পট ফিডার রুট",
                "name_en": "Chattogram -> Bab el-Mandeb Spot Vessel Charter",
                "transit_days": dest["singapore_express_days"],
                "freight_total_usd": round(base_freight * 0.95, 2),
                "insurance_usd": war_risk_surcharge,
                "on_time_probability_pct": 74,
                "risk_level": "HIGH",
                "co2_kg_total": round(req.containers_teu * dest["distance_nm"] * 0.130, 1),
                "recommended": False,
                "notes_bn": "দক্ষিণ লোহিত সাগরে অতিরিক্ত ওয়ার-রিস্ক ইন্স্যুরেন্স প্রিমিয়াম প্রযোজ্য।",
                "notes_en": "Subject to southern Red Sea war-risk insurance premium and vessel convoy scheduling.",
            },
        ]
    else:
        routes = [
            {
                "route_id": "colombo_cape_safe",
                "name_bn": f"চট্টগ্রাম -> কলম্বো ট্রান্সশিপমেন্ট -> উত্তমাশা অন্তরীপ -> {req.destination_port} (নিরাপদ রুট)",
                "name_en": f"Chattogram -> Colombo Transshipment -> Cape of Good Hope -> {req.destination_port} (Safe Corridor)",
                "transit_days": dest["cape_days"],
                "freight_total_usd": round(base_freight * 1.12, 2),
                "insurance_usd": standard_insurance,
                "on_time_probability_pct": 94,
                "risk_level": "LOW",
                "co2_kg_total": round(req.containers_teu * dest["distance_nm"] * 0.145, 1),
                "recommended": True,
                "notes_bn": "লোহিত সাগরের ঝুঁকি এড়িয়ে নিশ্চিত শিডিউল এবং কম ইন্স্যুরেন্স প্রিমিয়াম।",
                "notes_en": "Bypasses Red Sea disruption with 94% schedule reliability and zero war-risk surcharge.",
            },
            {
                "route_id": "singapore_europe_express",
                "name_bn": f"চট্টগ্রাম -> সিঙ্গাপুর পিএসএ -> নর্থ ইউরোপ এক্সপ্রেস মাদার ভেসেল -> {req.destination_port}",
                "name_en": f"Chattogram -> Singapore PSA -> North Europe Express Mother Vessel -> {req.destination_port}",
                "transit_days": dest["singapore_express_days"],
                "freight_total_usd": round(base_freight * 1.18, 2),
                "insurance_usd": standard_insurance,
                "on_time_probability_pct": 95,
                "risk_level": "LOW",
                "co2_kg_total": round(req.containers_teu * dest["distance_nm"] * 0.128, 1),
                "recommended": False,
                "notes_bn": "সিঙ্গাপুর হতে বড় মাদার ভেসেলে অগ্রাধিকার বার্থিং ও কম কার্বন ফুটপ্রিন্ট।",
                "notes_en": "Priority mother-vessel connection via PSA Singapore with lower Scope 3 voyage emissions.",
            },
            {
                "route_id": "suez_red_sea_direct",
                "name_bn": f"চট্টগ্রাম -> সুয়েজ খাল / লোহিত সাগর রুট -> {req.destination_port}",
                "name_en": f"Chattogram -> Bab el-Mandeb / Red Sea / Suez Canal -> {req.destination_port}",
                "transit_days": dest["suez_days"],
                "freight_total_usd": round(base_freight * 1.0, 2),
                "insurance_usd": war_risk_surcharge,
                "on_time_probability_pct": 68,
                "risk_level": "HIGH",
                "co2_kg_total": round(req.containers_teu * dest["distance_nm"] * 0.118, 1),
                "recommended": False,
                "notes_bn": "লোহিত সাগরে নিরাপত্তা ঝুঁকির কারণে হঠাৎ রুট পরিবর্তন ও অতিরিক্ত ওয়ার-রিস্ক প্রিমিয়াম প্রযোজ্য।",
                "notes_en": "Elevated maritime security advisories in Red Sea; subject to war-risk insurance surcharge and vessel rerouting.",
            },
        ]

    rec_route = next(r for r in routes if r["recommended"])

    # A scenario rank is not a measured probability of on-time delivery.
    for route in routes:
        route["on_time_probability_pct"] = None
        route["risk_basis"] = "Illustrative route assumptions, not live tracking"
        route["notes_bn"] = "সময়সূচি, খরচ, বীমা ও রুটের প্রাপ্যতা শিপিং এজেন্টের কাছে যাচাই করুন।"
        route["notes_en"] = "Confirm availability, timing, freight, and insurance with the carrier."
    incoterm_advice_bn = f"{req.preferred_incoterm} শর্তে পরিবহন খরচ, বীমা, মাল হস্তান্তর ও ঝুঁকির দায়িত্ব আলাদা করে লিখুন। এই হিসাব কোনো ভাড়া বা লাভের নিশ্চয়তা নয়।"
    incoterm_advice_en = f"For {req.preferred_incoterm}, agree freight, insurance, delivery, and risk responsibilities in writing. This estimate does not guarantee rates or profit."
    summary_bn = f"{req.destination_port} বন্দরের জন্য {req.containers_teu} TEU চালানের তিনটি পরিকল্পনার তুলনা করা হয়েছে। নমুনা খরচ ও সময় ব্যবহার করা হয়েছে; এগুলো সরাসরি শিপিং কোটেশন নয়।"
    summary_en = f"Three planning scenarios were compared for {req.containers_teu} TEU to {req.destination_port}. Costs and transit times use illustrative assumptions, not live carrier quotes."
    latency_ms = int((time.perf_counter() - started) * 1000)
    return {
        **_assessment_metadata("shipping_scenario"),
        "module": "supply_chain_risk",
        "sector": req.sector,
        "destination_port": req.destination_port,
        "destination_country": dest["country"],
        "distance_nautical_miles": dest["distance_nm"],
        "containers_teu": req.containers_teu,
        "cargo_value_usd": req.cargo_value_usd,
        "preferred_incoterm": req.preferred_incoterm,
        "cbam_applicable": None,
        "cbam_note": "Applicability requires confirmed commodity classification and destination rules.",
        "chattogram_port_status": chattogram_status,
        "routes": routes,
        "recommended_route": rec_route,
        "incoterm_advice_bn": incoterm_advice_bn,
        "incoterm_advice_en": incoterm_advice_en,
        "summary_bn": _sanitize_text(summary_bn),
        "summary_en": _sanitize_text(summary_en),
        "latency_ms": latency_ms,
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
    }


# ============================================================================
# 3. EXPORT FINANCE & BANGLADESH BANK CREDIT SCORING ENGINE
# ============================================================================

class ExportFinanceScoreRequest(BaseModel):
    sector: Literal["garments", "jute", "leather", "ceramics", "agro"] = "garments"
    master_lc_value_usd: float = Field(default=85000.0, ge=1000.0, le=50_000_000.0)
    raw_material_import_pct: float = Field(default=55.0, ge=0.0, le=85.0)
    completed_export_orders: int = Field(default=12, ge=0, le=5000)
    lead_time_days: int = Field(default=60, ge=15, le=180)
    has_erc_and_ud: bool = True


SECTOR_FINANCE_RULES: Dict[str, Dict[str, Any]] = {
    "garments": {
        "max_btb_lc_pct": 70.0,
        "min_domestic_value_addition_pct": 30.0,
        "cash_incentive_rate_pct": 4.0,
        "edf_interest_rate_pct": 4.5,
    },
    "jute": {
        "max_btb_lc_pct": 50.0,
        "min_domestic_value_addition_pct": 50.0,
        "cash_incentive_rate_pct": 10.0,
        "edf_interest_rate_pct": 4.0,
    },
    "leather": {
        "max_btb_lc_pct": 60.0,
        "min_domestic_value_addition_pct": 40.0,
        "cash_incentive_rate_pct": 10.0,
        "edf_interest_rate_pct": 4.5,
    },
    "ceramics": {
        "max_btb_lc_pct": 60.0,
        "min_domestic_value_addition_pct": 40.0,
        "cash_incentive_rate_pct": 6.0,
        "edf_interest_rate_pct": 4.5,
    },
    "agro": {
        "max_btb_lc_pct": 45.0,
        "min_domestic_value_addition_pct": 55.0,
        "cash_incentive_rate_pct": 15.0,
        "edf_interest_rate_pct": 4.0,
    },
}


@router.post("/export-finance-score")
def calculate_export_finance_score(req: ExportFinanceScoreRequest) -> Dict[str, Any]:
    started = time.perf_counter()
    rules = SECTOR_FINANCE_RULES.get(req.sector, SECTOR_FINANCE_RULES["garments"])

    requested_btb_usd = round(req.master_lc_value_usd * (req.raw_material_import_pct / 100.0), 2)
    max_allowed_btb_usd = round(req.master_lc_value_usd * (rules["max_btb_lc_pct"] / 100.0), 2)
    btb_excess_margin_usd = max(0.0, round(requested_btb_usd - max_allowed_btb_usd, 2))
    domestic_value_addition_pct = round(100.0 - req.raw_material_import_pct, 1)
    btb_within_limit = req.raw_material_import_pct <= rules["max_btb_lc_pct"]

    net_fob_retention_usd = round(req.master_lc_value_usd - requested_btb_usd, 2)
    potential_cash_incentive_usd = round(net_fob_retention_usd * (rules["cash_incentive_rate_pct"] / 100.0), 2)
    # Apply this scenario threshold only; no actual incentive entitlement is determined.
    cash_incentive_usd = potential_cash_incentive_usd if btb_within_limit else 0.0
    cash_incentive_bdt = round(cash_incentive_usd * 120.0, 2)

    edf_loan_principal_usd = min(requested_btb_usd, max_allowed_btb_usd)
    edf_interest_cost_usd = round(
        edf_loan_principal_usd * (rules["edf_interest_rate_pct"] / 100.0) * (req.lead_time_days / 360.0),
        2,
    )

    # Credit Readiness Score (0-100)
    score = 55
    if btb_within_limit:
        score += 20
    else:
        score -= 10
    if req.has_erc_and_ud:
        score += 12
    if req.completed_export_orders >= 10:
        score += 10
    elif req.completed_export_orders >= 3:
        score += 6
    if req.lead_time_days <= 90:
        score += 2
    credit_score = min(99, max(45, score))

    checklist = [
        {"item_bn": "এলসির সত্যতা ব্যাংকে যাচাই করুন", "item_en": "Have the bank authenticate the LC", "status": "NOT_VERIFIED"},
        {"item_bn": "দেশীয় মূল্য সংযোজনের হিসাব", "item_en": "Declared domestic value addition", "status": "WITHIN_ASSUMPTION" if btb_within_limit else "REVIEW_REQUIRED"},
        {"item_bn": "ইআরসি ও প্রয়োজনীয় নথি", "item_en": "ERC and required documents", "status": "USER_DECLARED" if req.has_erc_and_ud else "REVIEW_REQUIRED"},
        {"item_bn": "ব্যাংকের বর্তমান নিয়ম ও অনুমোদন", "item_en": "Current bank terms and approval", "status": "NOT_VERIFIED"},
    ]
    summary_bn = f"আপনার দেওয়া USD {req.master_lc_value_usd:,.2f} এলসির তথ্য দিয়ে প্রস্তুতির হিসাব করা হয়েছে। আমদানির খরচ USD {requested_btb_usd:,.2f}; দেশে থাকা অংশ USD {net_fob_retention_usd:,.2f}। ব্যবহৃত হারগুলো নমুনা অনুমান। ব্যাংকের ঋণ, প্রণোদনা বা যোগ্যতার অনুমোদন দেওয়া হয়নি।"
    summary_en = f"Planning calculations use your declared LC value of USD {req.master_lc_value_usd:,.2f}. Import cost is USD {requested_btb_usd:,.2f} and domestic retention is USD {net_fob_retention_usd:,.2f}. Rates are scenario assumptions, not a credit decision or incentive entitlement."
    latency_ms = int((time.perf_counter() - started) * 1000)
    return {
        **_assessment_metadata("finance_scenario"),
        "module": "export_finance_score",
        "sector": req.sector,
        "circular_reference": "Illustrative planning assumptions. Confirm current terms with your bank.",
        "assumed_exchange_rate_bdt_per_usd": 120.0,
        "master_lc_value_usd": req.master_lc_value_usd,
        "requested_btb_lc_usd": requested_btb_usd,
        "max_allowed_btb_lc_usd": max_allowed_btb_usd,
        "btb_excess_margin_usd": btb_excess_margin_usd,
        "raw_material_import_pct": req.raw_material_import_pct,
        "max_btb_lc_pct": rules["max_btb_lc_pct"],
        "domestic_value_addition_pct": domestic_value_addition_pct,
        "min_domestic_value_addition_pct": rules["min_domestic_value_addition_pct"],
        "btb_within_bb_limit": btb_within_limit,
        "net_foreign_exchange_retention_usd": net_fob_retention_usd,
        "cash_incentive_rate_pct": rules["cash_incentive_rate_pct"],
        "cash_incentive_eligible": None,
        "scenario_threshold_met": btb_within_limit,
        "projected_cash_incentive_usd": cash_incentive_usd,
        "projected_cash_incentive_bdt": cash_incentive_bdt,
        "potential_cash_incentive_if_compliant_usd": potential_cash_incentive_usd,
        "edf_loan_principal_usd": edf_loan_principal_usd,
        "edf_interest_rate_pct": rules["edf_interest_rate_pct"],
        "edf_estimated_interest_usd": edf_interest_cost_usd,
        "credit_readiness_score": credit_score,
        "credit_tier": "Planning checklist score only, not a bank credit rating",
        "banking_checklist": checklist,
        "summary_bn": _sanitize_text(summary_bn),
        "summary_en": _sanitize_text(summary_en),
        "latency_ms": latency_ms,
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
    }


# ============================================================================
# 4. MULTI-LANGUAGE BUYER NEGOTIATION & AUTO-CONTRACT GENERATOR
# ============================================================================

class NegotiateContractRequest(BaseModel):
    buyer_language: Literal["de", "ja", "ar", "fr", "en"] = "de"
    buyer_company: str = Field(default="Hanseatic EcoRetail GmbH (Hamburg)", max_length=300)
    product_name: str = Field(default="Organic Jute Shopping Tote Bag (300 GSM)", max_length=300)
    hs_code: str = Field(default="4202.92.10", max_length=40)
    quantity_units: int = Field(default=10000, ge=100, le=10_000_000)
    buyer_offered_fob_usd: float = Field(default=1.65, ge=0.1, le=50000.0)
    factory_target_fob_usd: float = Field(default=1.95, ge=0.1, le=50000.0)
    incoterm: Literal["FOB Chattogram", "CIF Rotterdam", "CIF Tokyo", "CIF Jeddah"] = "FOB Chattogram"
    buyer_message: str = Field(
        default="We want 10,000 units at USD 1.65 FOB with 90 days open account payment.",
        max_length=5000,
    )


LANGUAGE_TEMPLATES: Dict[str, Dict[str, Any]] = {
    "de": {
        "language_name_bn": "জার্মান", "language_name_en": "German", "greeting": "Guten Tag",
        "pitch_template": "{greeting} {buyer_company},\n\nEntwurf zur Pruefung: {qty:,} Einheiten '{product}', HS-Vorschlag {hs_code}. Unser vorgeschlagener Preis ist USD {recommended_fob:.2f} pro Einheit ({incoterm}), insgesamt USD {total_usd:,.2f}. Zahlung per unwiderruflichem Sichtakkreditiv nach UCP 600 wird vorgeschlagen. Spezifikation, Liefertermin, Ursprungsnachweise und Zollbehandlung sind noch gemeinsam zu pruefen. Dieses Angebot ist nicht verbindlich und wurde nicht versendet.\n\nMit freundlichen Gruessen",
        "contract_heading": "SALES TERMS DRAFT (DE-EN-BN)",
    },
    "ja": {
        "language_name_bn": "জাপানি", "language_name_en": "Japanese", "greeting": "",
        "pitch_template": "{buyer_company} ご担当者様\n\n確認用の提案書です。商品: {product}、数量: {qty:,}、HSコード案: {hs_code}。提案単価は USD {recommended_fob:.2f}（{incoterm}）、合計 USD {total_usd:,.2f} です。決済にはUCP 600に基づく一覧払取消不能信用状を提案します。仕様、納期、原産地、関税条件は双方で確認が必要です。本書は未送信の草案であり、合意済みの契約ではありません。",
        "contract_heading": "SALES TERMS DRAFT (JA-EN-BN)",
    },
    "ar": {
        "language_name_bn": "আরবি", "language_name_en": "Arabic", "greeting": "السادة في",
        "pitch_template": "{greeting} {buyer_company}،\n\nمسودة للمراجعة: {qty:,} وحدة من {product}، ورمز جمركي مقترح {hs_code}. السعر المقترح USD {recommended_fob:.2f} للوحدة ({incoterm})، والإجمالي USD {total_usd:,.2f}. نقترح الدفع باعتماد مستندي غير قابل للإلغاء عند الاطلاع وفق UCP 600. يجب الاتفاق على المواصفات وموعد التسليم والتحقق من المنشأ والرسوم. هذه مسودة غير مرسلة وليست عقدا متفقا عليه.",
        "contract_heading": "SALES TERMS DRAFT (AR-EN-BN)",
    },
    "fr": {
        "language_name_bn": "ফরাসি", "language_name_en": "French", "greeting": "Bonjour",
        "pitch_template": "{greeting} {buyer_company},\n\nProjet pour examen: {qty:,} unites de '{product}', code SH propose {hs_code}. Prix propose: USD {recommended_fob:.2f} par unite ({incoterm}), total USD {total_usd:,.2f}. Nous proposons un credit documentaire irrevocable a vue selon les RUU 600. Specifications, delais, origine et droits de douane restent a verifier et a convenir. Ce projet non envoye ne constitue pas un contrat accepte.",
        "contract_heading": "SALES TERMS DRAFT (FR-EN-BN)",
    },
    "en": {
        "language_name_bn": "ইংরেজি", "language_name_en": "English", "greeting": "Dear Procurement Team at",
        "pitch_template": "{greeting} {buyer_company},\n\nDraft for review: {qty:,} units of '{product}', HS code candidate {hs_code}. Our proposed price is USD {recommended_fob:.2f} per unit ({incoterm}), totaling USD {total_usd:,.2f}. We propose payment by irrevocable LC at sight under UCP 600. Specifications, delivery, origin documents, and tariff treatment remain subject to verification and agreement. This draft has not been sent and is not an accepted contract.\n\nKind regards",
        "contract_heading": "SALES TERMS DRAFT (EN-BN)",
    },
}

@router.post("/negotiate-contract")
def negotiate_and_generate_contract(req: NegotiateContractRequest) -> Dict[str, Any]:
    started = time.perf_counter()
    redacted_msg, pii_count, _ = mask_bangla_pii(req.buyer_message)
    lang_tpl = LANGUAGE_TEMPLATES.get(req.buyer_language, LANGUAGE_TEMPLATES["de"])

    floor_fob = round(req.factory_target_fob_usd * 0.92, 2)
    if req.buyer_offered_fob_usd >= req.factory_target_fob_usd:
        recommended_fob = round(req.buyer_offered_fob_usd, 2)
    else:
        weighted = round((req.factory_target_fob_usd * 0.65) + (max(req.buyer_offered_fob_usd, floor_fob) * 0.35), 2)
        recommended_fob = max(floor_fob, weighted, round(req.buyer_offered_fob_usd, 2))

    total_contract_usd = round(recommended_fob * req.quantity_units, 2)
    margin_protected_usd = max(0.0, round((recommended_fob - req.buyer_offered_fob_usd) * req.quantity_units, 2))

    native_pitch = lang_tpl["pitch_template"].format(
        greeting=lang_tpl["greeting"],
        buyer_company=_sanitize_text(req.buyer_company),
        qty=req.quantity_units,
        product=_sanitize_text(req.product_name),
        hs_code=req.hs_code,
        recommended_fob=recommended_fob,
        incoterm=req.incoterm,
        total_usd=total_contract_usd,
    )

    bangla_explanation = (
        f"ক্রেতার প্রস্তাব USD {req.buyer_offered_fob_usd:.2f}; আলোচনার খসড়ায় প্রতি ইউনিট USD {recommended_fob:.2f} রাখা হয়েছে। "
        f"এতে সম্ভাব্য পার্থক্য USD {margin_protected_usd:,.2f}। এটি অর্জিত আয় নয়। "
        "এলসি, পণ্যের মান, ডেলিভারি ও নথির শর্ত দুই পক্ষ ও সংশ্লিষ্ট ব্যাংককে যাচাই করতে হবে। খসড়াটি ক্রেতাকে পাঠানো হয়নি।"
    )

    contract_clauses = [
        {
            "clause_no": "Clause 1",
            "title_bn": "পণ্য ও এইচএস কোড (Commodity & HS Classification)",
            "title_en": "Commodity & Customs HS Code",
            "body_en": f"{req.product_name}, Bangladesh Customs HS Code {req.hs_code}, Quantity: {req.quantity_units:,} Units (+/- 3% tolerance).",
            "body_bn": f"পণ্য: {req.product_name}, এইচএস কোড: {req.hs_code}, পরিমাণ: {req.quantity_units:,} ইউনিট (+/- ৩% সহনশীলতা)।",
        },
        {
            "clause_no": "Clause 2",
            "title_bn": "মূল্য এবং ইনকোটার্মস ২০২০ (Contract Price & Incoterms 2020)",
            "title_en": "Unit Price, Total Value & Incoterms 2020",
            "body_en": f"Unit Price: USD {recommended_fob:.2f} ({req.incoterm}, Incoterms 2020). Total Contract Value: USD {total_contract_usd:,.2f}.",
            "body_bn": f"একক মূল্য: USD {recommended_fob:.2f} ({req.incoterm}, Incoterms 2020)। মোট চুক্তিমূল্য: USD {total_contract_usd:,.2f}।",
        },
        {
            "clause_no": "Clause 3",
            "title_bn": "পেমেন্ট শর্তাবলি (Payment Terms - UCP 600)",
            "title_en": "Payment Terms (UCP 600 Documentary Credit)",
            "body_en": "100% by Irrevocable Documentary Letter of Credit at Sight governed by ICC UCP 600, advised through a scheduled Authorized Dealer (AD) Bank in Bangladesh.",
            "body_bn": "বাংলাদেশের তফসিলি এডি (AD) ব্যাংকের মাধ্যমে ICC UCP 600 অনুযায়ী ১০০% অপ্রত্যাহারযোগ্য সাইট এলসি (Irrevocable LC at Sight)।",
        },
        {
            "clause_no": "Clause 4",
            "title_bn": "মান নিয়ন্ত্রণ ও প্রি-শিপমেন্ট পরিদর্শন (Quality & Inspection)",
            "title_en": "Quality Assurance & Pre-Shipment Inspection",
            "body_en": "Inspection scope, sampling plan, acceptance criteria, and responsible inspector are to be agreed in writing before shipment. No inspection is recorded by this draft.",
            "body_bn": "চালানের আগে পরিদর্শনের ধরন, নমুনা, গ্রহণযোগ্যতার মান ও দায়িত্বপ্রাপ্ত ব্যক্তি লিখিতভাবে ঠিক করুন। এই খসড়ায় কোনো পরিদর্শন সম্পন্ন হওয়ার প্রমাণ নেই।",
        },
        {
            "clause_no": "Clause 5",
            "title_bn": "শিপমেন্ট ও প্রয়োজনীয় রপ্তানি দলিল (Shipment & Export Documents)",
            "title_en": "Shipment Port & Required Export Documents",
            "body_en": "Port of Loading: Chattogram Port (BDCGP), Bangladesh. Seller shall provide Commercial Invoice, Packing List, Clean On-Board Bill of Lading, Certificate of Origin (REX/GSP), and Bangladesh Bank EXP Form.",
            "body_bn": "লোডিং বন্দর: চট্টগ্রাম বন্দর, বাংলাদেশ। বিক্রেতা কমার্শিয়াল ইনভয়েস, প্যাকিং লিস্ট, বিল অব ল্যাডিং, সার্টিফিকেট অব অরিজিন এবং EXP ফর্ম প্রদান করবেন।",
        },
    ]

    latency_ms = int((time.perf_counter() - started) * 1000)
    return {
        **_assessment_metadata("unsent_negotiation_draft"),
        "module": "negotiate_contract",
        "status": "draft",
        "delivery": "not_sent",
        "buyer_accepted": False,
        "buyer_language": req.buyer_language,
        "language_name_bn": lang_tpl["language_name_bn"],
        "language_name_en": lang_tpl["language_name_en"],
        "buyer_company": _sanitize_text(req.buyer_company),
        "product_name": _sanitize_text(req.product_name),
        "hs_code": req.hs_code,
        "quantity_units": req.quantity_units,
        "buyer_offered_fob_usd": req.buyer_offered_fob_usd,
        "factory_target_fob_usd": req.factory_target_fob_usd,
        "recommended_counter_fob_usd": recommended_fob,
        "floor_fob_usd": floor_fob,
        "total_contract_value_usd": total_contract_usd,
        "margin_gain_over_buyer_offer_usd": margin_protected_usd,
        "incoterm": req.incoterm,
        "native_buyer_pitch": _sanitize_text(native_pitch),
        "bangla_strategy_explanation": _sanitize_text(bangla_explanation),
        "contract_heading": lang_tpl["contract_heading"],
        "contract_clauses": contract_clauses,
        "summary_bn": _sanitize_text(
            f"{req.buyer_company}-এর জন্য {lang_tpl['language_name_bn']} ভাষায় কাউন্টার-অফার এবং আন্তর্জাতিক বিক্রয় চুক্তিপত্র তৈরি হয়েছে। "
            f"প্রস্তাবিত একক মূল্য USD {recommended_fob:.2f} ({req.incoterm}), মোট চুক্তি USD {total_contract_usd:,.2f}, ক্রেতার প্রস্তাবের চেয়ে সম্ভাব্য পার্থক্য USD {margin_protected_usd:,.2f}। এটি পাঠানো বা গৃহীত হয়নি।"
        ),
        "summary_en": _sanitize_text(
            f"Generated native {lang_tpl['language_name_en']} counter-offer and bilingual Sales Contract for {req.buyer_company}. "
            f"Recommended unit price: USD {recommended_fob:.2f} ({req.incoterm}), total contract value: USD {total_contract_usd:,.2f}, with a potential USD {margin_protected_usd:,.2f} difference from the offer. This draft is unsent and has not been accepted."
        ),
        "redacted_input": redacted_msg,
        "pii_redacted_count": pii_count,
        "latency_ms": latency_ms,
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
    }


# ============================================================================
# 5. PLANNING DRAFT PDF EXPORT ENDPOINT
# ============================================================================

class IntelligencePdfRequest(BaseModel):
    module: Literal["vision_inspect", "supply_chain_risk", "export_finance_score", "negotiate_contract"]
    title: str = Field(default="ExportPilot AI Intelligence Report", max_length=250)
    subtitle: str = Field(default="Sovereign Trade Intelligence & Compliance Verification", max_length=350)
    rows: list[Annotated[list[Annotated[str, Field(max_length=2000)]], Field(min_length=2, max_length=2)]] = Field(default_factory=list, max_length=30)
    notice: str = Field(
        default="Planning draft only. Verify customs, banking, shipping, and contractual terms with the relevant professionals before use.",
        max_length=2000,
    )


@router.post("/report-pdf")
def generate_intelligence_pdf(req: IntelligencePdfRequest) -> Response:
    safe_rows = [["Parameter", "Planning draft"]]
    cell_style = getSampleStyleSheet()["BodyText"]
    cell_style.fontSize = 8
    cell_style.leading = 11
    for pair in req.rows[:30]:
        if isinstance(pair, list) and len(pair) >= 2:
            safe_rows.append([
                Paragraph(escape(_sanitize_text(str(pair[0]))[:120]), cell_style),
                Paragraph(escape(_sanitize_text(str(pair[1]))[:450]), cell_style),
            ])

    pdf_bytes = _make_document(
        title=f"DRAFT - {_sanitize_text(req.title)}",
        subtitle=_sanitize_text(req.subtitle),
        rows=safe_rows,
        notice="Planning draft, not an inspection certificate, bank approval, or accepted contract. " + _sanitize_text(req.notice),
    )
    filename = f"exportpilot_{req.module}_report.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
