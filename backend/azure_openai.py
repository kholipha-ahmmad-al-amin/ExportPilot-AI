import logging
import os
import time
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends
import httpx
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent.parent / ".env", override=False)
except ImportError:
    pass

# Ensure .env is parsed even if python-dotenv is not installed
_env_file = Path(__file__).resolve().parent.parent / ".env"
if _env_file.exists():
    try:
        for _line in _env_file.read_text(encoding="utf-8").splitlines():
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _k, _v = _line.split("=", 1)
                os.environ.setdefault(_k.strip(), _v.strip())
    except Exception:
        pass

from backend.database import get_db
from backend.models import SystemSetting
from backend.sovereignty import mask_bangla_pii
from backend.auth import get_current_active_user, User

logger = logging.getLogger("exportpilot.azure_openai")

router = APIRouter(prefix="/azure-openai", tags=["Azure OpenAI Trade Advisor"])


class DealContext(BaseModel):
    commodity: Optional[str] = Field(default=None, max_length=500)
    target_price: Optional[str] = Field(default=None, max_length=500)
    moq: Optional[str] = Field(default=None, max_length=500)
    incoterm: Optional[str] = Field(default=None, max_length=500)
    destination_country: Optional[str] = Field(default=None, max_length=500)
    buyer_name: Optional[str] = Field(default=None, max_length=500)


class NegotiateRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000, description="Exporter query or buyer message to negotiate")
    deal_context: Optional[DealContext] = None
    language: Optional[str] = Field("bn", description="Response language preference: bn or en")


class NegotiateResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    reply: str
    strategy_summary: str
    suggested_counter_offer: str
    risk_factors: List[str]
    pii_redacted_count: int
    model_used: str
    latency_ms: int
    sovereignty_protected: bool


def _get_azure_config() -> Dict[str, str]:
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT", "").strip().rstrip("/")
    key = os.getenv("AZURE_OPENAI_KEY", "").strip()
    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4.1-mini").strip()
    fallback_deployment = os.getenv("AZURE_OPENAI_FALLBACK_DEPLOYMENT", "gpt-5-mini").strip()
    return {
        "endpoint": endpoint,
        "key": key,
        "deployment": deployment,
        "fallback_deployment": fallback_deployment,
    }


def _clean_anti_slop(text: str) -> str:
    if not text:
        return ""
    text = text.replace("—", "-").replace("–", "-")
    for forbidden in ["✨", "🌟", "💫", "⭐"]:
        text = text.replace(forbidden, "")
    return text


def _retrieve_rag_context(query: str, language: str = "bn") -> str:
    q = (query or "").lower()
    sections = []

    # Jute & Allied Products
    if any(k in q for k in ["jute", "পাট", "bag", "ব্যাগ", "4202", "6305", "চট", "বস্তা"]):
        if language == "en":
            sections.append(
                "VERIFIED TRADE KNOWLEDGE (JUTE & ALLIED PRODUCTS):\n"
                "- HS Codes: 4202.92 (Shopping bags of jute/bast fibres), 6305.10 (Sacks and bags for packing).\n"
                "- EU Market: 0.0% duty under EU Everything But Arms (EBA) - Regulation (EU) No 978/2012, Annex IV. Competitors (India/Vietnam) face 6.5% to 8.0% MFN duty.\n"
                "- UK Market: 0.0% duty under UK Developing Countries Trading Scheme (DCTS) Comprehensive Preferences.\n"
                "- Japan Market: 0.0% duty under Japan DFQF for LDCs.\n"
                "- US Market: 3.4% MFN tariff (General Column 1).\n"
                "- FOB Unit Economics (Savar Factory): Suggested net FOB $3.38 per piece vs local buying house rate of $2.77 -> +$0.61 direct unit margin gain.\n"
                "- EU CBAM Status: Natural jute fiber is exempt from EU CBAM Annex I goods list.\n"
                "- Recommended Payment: Irrevocable LC at Sight from tier-1 bank or 30% advance TT deposit.\n"
                "- Relevant Platform Tools: [Deal Room](/dealroom), [HS Code Search](/hs-search), [Verified Buyers](/buyers)."
            )
        else:
            sections.append(
                "বাণিজ্য গোয়েন্দা তথ্য (পাট ও বহুমুখী পাটজাত পণ্য):\n"
                "- এইচএস কোড: ৪২০২.৯২ (জুট শপিং ব্যাগ), ৬৩০৫.১০ (পাটের বস্তা ও ব্যাগ)।\n"
                "- ইউরোপীয় ইউনিয়ন: ইবিএ (EBA) সুবিধার আওতায় ০.০% শুল্কমুক্ত সুবিধা (Regulation (EU) No 978/2012, Annex IV)। প্রতিযোগী ভারত/ভিয়েতনামের শুল্ক ৬.৫% থেকে ৮.০%।\n"
                "- যুক্তরাজ্য: ইউকে DCTS স্কিমের আওতায় ০.০% শুল্কমুক্ত সুবিধা।\n"
                "- জাপান: ডিএফকিউএফ (DFQF) স্কিমের আওতায় ০.০% শুল্ক।\n"
                "- যুক্তরাষ্ট্র: এমএফএন ট্যারিফ ৩.৪%।\n"
                "- এফওবি (FOB) ইউনিট অর্থনীতি (সাভার ফ্যাক্টরি): প্রস্তাবিত নেট FOB $৩.৩৮ প্রতি পিস, বিপরীতে লোকাল বায়িং হাউসের দর $২.৭৭ -> সরাসরি রপ্তানিতে অতিরিক্ত +$০.৬১ প্রতি পিসে নিট লাভ।\n"
                "- সিবিএএম (CBAM) অবস্থা: প্রাকৃতিক পাটজাত পণ্য বর্তমানে ইইউ সিবিএএম অ্যানেক্স ১ এর আওতামুক্ত।\n"
                "- প্রস্তাবিত পেমেন্ট শর্ত: কনফার্মড ইরেভোকেবল এলসি অ্যাট সাইট অথবা ৩০% অগ্রিম টিটি।\n"
                "- সংশ্লিষ্ট প্ল্যাটফর্ম লিঙ্কসমূহ: [ডিল রুম](/dealroom), [এইচএস কোড ও শুল্ক অনুসন্ধান](/hs-search), [আন্তর্জাতিক বায়ার তালিকা](/buyers)।"
            )

    # CBAM & Carbon Compliance
    if any(k in q for k in ["cbam", "সিবিএএম", "কার্বন", "carbon", "scope", "স্কোপ", "ets", "emission", "নির্গমন", "পরিবেশ", "সবুজ"]):
        if language == "en":
            sections.append(
                "VERIFIED TRADE KNOWLEDGE (EU CBAM & DECARBONIZATION):\n"
                "- Regulation: Regulation (EU) 2023/956, Annex IV rules.\n"
                "- CBAM Chargeable Phase-in Schedule: 2026: 2.5%, 2027: 5.0%, 2028: 10.0%, 2029: 22.5%, 2030: 48.5%, 2034: 100%.\n"
                "- Scope 2 Grid Emission Factor (Bangladesh): 0.58 kg CO2e / kWh (BPDB national baseline).\n"
                "- Scope 1 Combustion Emission Factors: Diesel = 2.68 kg CO2e/L, LPG = 3.16 kg CO2e/kg, Natural Gas = 2.02 kg CO2e/m3.\n"
                "- EU ETS Carbon Price Benchmark: EUR 65.0 - 75.0 per tonne CO2e (baseline EUR 70.0/tCO2e, EUR/USD = 1.1215).\n"
                "- Key Mitigation: Rooftop solar generation (yield ~1350 kWh/kWp/year, capex ~$950/kWp) directly reduces Scope 2 liability.\n"
                "- Relevant Platform Tool: [CBAM Carbon Footprint Calculator](/carbon-audit)."
            )
        else:
            sections.append(
                "বাণিজ্য গোয়েন্দা তথ্য (ইইউ সিবিএএম ও কার্বন সম্মতি):\n"
                "- আইনি রেফারেন্স: Regulation (EU) 2023/956, Annex IV.\n"
                "- সিবিএএম পর্যায়ক্রমিক বাস্তবায়ন সূচি: ২০২৬: ২.৫%, ২০২৭: ৫.০%, ২০২৮: ১০.০%, ২০২৯: ২২.৫%, ২০৩০: ৪৮.৫%।\n"
                "- স্কোপ ২ গ্রিড নির্গমন ফ্যাক্টর (বাংলাদেশ): ০.৫৮ কেজি CO2e / কিলোওয়াট ঘণ্টা (BPDB গড়)।\n"
                "- স্কোপ ১ নির্গমন ফ্যাক্টর: ডিজেল = ২.৬৮ কেজি CO2e/লিটার, এলপিজি = ৩.১৬ কেজি CO2e/কেজি, প্রাকৃতিক গ্যাস = ২.০২ কেজি CO2e/ঘনমিটার।\n"
                "- ইইউ ইটিএস (EU ETS) কার্বন মূল্য বেঞ্চমার্ক: ৭০ ইউরো প্রতি টন CO2e (রেন্জ ৬৫-৭৫ ইউরো/টন)।\n"
                "- নির্গমন হ্রাসের উপায়: কারখানার ছাদে রুফটপ সোলার (প্রতি কিলোওয়াট পিকে বছরে ১৩৫০ কিলোওয়াট ঘণ্টা বিদ্যুৎ সাশ্রয়) স্কোপ ২ কার্বন সরাসরি কমিয়ে দেয়।\n"
                "- সংশ্লিষ্ট প্ল্যাটফর্ম লিঙ্কসমূহ: [কার্বন অডিট ও সিবিএএম ক্যালকুলেটর](/carbon-audit)।"
            )

    # Payment Security & Incoterms
    if any(k in q for k in ["payment", "পেমেন্ট", "lc", "এলসি", "upas", "ইউপাস", "open account", "ওপেন একাউন্ট", "tt", "টিটি", "incoterm", "ইনকোটার্মস", "fob", "cif", "ঝুঁকি", "risk"]):
        if language == "en":
            sections.append(
                "VERIFIED TRADE KNOWLEDGE (PAYMENT SECURITY & INCOTERMS 2020):\n"
                "- Open Account (OA) Risk: Highly dangerous without export credit insurance (ECGC). 100% of cancellation and non-payment risk falls on exporter.\n"
                "- Confirmed Irrevocable LC at Sight: Tier-1 confirming bank guarantees unconditional payment upon presentation of clean, compliant documents (B/L, Commercial Invoice, Packing List, Certificate of Origin).\n"
                "- UPAS LC (Usance Payable at Sight): Allows foreign buyer deferred credit (60/90/120 days) while exporter receives immediate discounted cash at sight upon document acceptance. Bank interest/acceptance commission must be explicitly marked 'For Buyer's Account'.\n"
                "- Advance TT: Recommend 30% advance deposit with 70% balance against non-negotiable Bill of Lading (B/L) copy.\n"
                "- Incoterm Rule: For containerized sea freight, FOB Chattogram (BMY) transfers risk once goods pass ship's rail; terminal handling and customs clearance at Chattogram are exporter's responsibility.\n"
                "- Relevant Platform Tool: [Deal Room Contract Negotiation](/dealroom)."
            )
        else:
            sections.append(
                "বাণিজ্য গোয়েন্দা তথ্য (পেমেন্ট নিরাপত্তা ও ইনকোটার্মস ২০২০):\n"
                "- ওপেন অ্যাকাউন্ট (OA) ঝুঁকি: ক্রেডিট ইন্স্যুরেন্স ছাড়া ওপেন অ্যাকাউন্টে পণ্য পাঠানো চরম ঝুঁকিপূর্ণ। ক্রেতা পণ্য পাওয়ার পর পেমেন্ট আটকে রাখলে আইনি প্রতিকার অত্যন্ত জটিল ও ব্যয়বহুল।\n"
                "- কনফার্মড ইরেভোকেবল এলসি অ্যাট সাইট: আন্তর্জাতিক প্রথম শ্রেণির কনফার্মিং ব্যাংক নিশ্চিত পেমেন্টের গ্যারান্টি দেয়। সঠিক শিপিং ডকুমেন্ট (B/L, ইনভয়েস, প্যাকিং লিস্ট, অরিজিন সার্টিফিকেট) জমা দেওয়ার সাথে সাথে পেমেন্ট রিলিজ হয়।\n"
                "- ইউপাস (UPAS) এলসি: বায়ার ৬০/৯০/১২০ দিনের ডেফার্ড ক্রেডিটের সুবিধা পায়, কিন্তু রপ্তানিকারক ডকুমেন্ট অ্যাকসেপ্টেন্সের সাথে সাথে ডিসকাউন্টেড ক্যাশ পেমেন্ট পান। শর্ত থাকে যে ব্যাংক সুদ ও একসেপ্টেন্স চার্জ বায়ারের একাউন্টে যুক্ত থাকতে হবে।\n"
                "- টিটি (TT) শর্ত: ন্যূনতম ৩০% অগ্রিম ক্যাশ ডিপোজিট এবং বাকি ৭০% নন-নেগোশিয়েবল বি/এল কপি দেখানোর পর খালাস করার শর্ত রাখুন।\n"
                "- সংশ্লিষ্ট প্ল্যাটফর্ম লিঙ্কসমূহ: [ডিল রুমে চুক্তি পরীক্ষা](/dealroom)।"
            )

    # Port & Logistics
    if any(k in q for k in ["port", "বন্দর", "chattogram", "চট্টগ্রাম", "mongla", "মোংলা", "truck", "ট্রাক", "ভাড়া", "freight", "ফ্রেইট", "demurrage", "কন্টেইনার", "container", "চার্জ"]):
        if language == "en":
            sections.append(
                "VERIFIED TRADE KNOWLEDGE (LOGISTICS & PORT CHARGES):\n"
                "- Chattogram Port 20ft Container Benchmark Charges: Total ~$393 USD (Terminal Handling: $95, Documentation: $75, CDF Development Fee: $28, Customs Agent: $110, Bonded Warehouse VAT: $85).\n"
                "- Inland Covered Trucking to Chattogram Port (15-tonne):\n"
                "  * Savar: BDT 42,000 (285 km, ~32 hrs transit)\n"
                "  * Gazipur: BDT 44,000 (300 km, ~34 hrs transit)\n"
                "  * Dhaka: BDT 45,000 (265 km, ~30 hrs transit)\n"
                "  * Bogura: BDT 38,000 (235 km, ~28 hrs transit)\n"
                "- Port Risk Tip: Maintain a minimum 4-day buffer before feeder vessel cut-off to prevent gate congestion demurrage charges.\n"
                "- Relevant Platform Tool: [Customs & Trade Analytics](/data)."
            )
        else:
            sections.append(
                "বাণিজ্য গোয়েন্দা তথ্য (লজিস্টিকস ও চট্টগ্রাম বন্দর চার্জ):\n"
                "- চট্টগ্রাম বন্দর ২০ ফুট কন্টেইনার ছাড়ানোর স্ট্যান্ডার্ড চার্জ: মোট আনুমানিক ৩৯৩ ডলার (টার্মিনাল হ্যান্ডলিং $৯৫, ডকুমেন্টেশন $৭৫, সিডিএফ ফি $২৮, সিঅ্যান্ডএফ এজেন্ট $১১০, ওয়্যারহাউস ভ্যাট $৮৫)।\n"
                "- কারখানার গেট থেকে চট্টগ্রাম বন্দর পর্যন্ত কভার্ড ট্রাক ভাড়া (১৫ টন):\n"
                "  * সাভার: ৪২,০০০ টাকা (২৮৫ কিমি, প্রায় ৩২ ঘণ্টা ট্রানজিট)\n"
                "  * গাজীপুর: ৪৪,০০০ টাকা (৩০০ কিমি, প্রায় ৩৪ ঘণ্টা ট্রানজিট)\n"
                "  * ঢাকা: ৪৫,০০০ টাকা (২৬৫ কিমি, প্রায় ৩০ ঘণ্টা ট্রানজিট)\n"
                "  * বগুড়া: ৩৮,০০০ টাকা (২৩৫ কিমি, প্রায় ২৮ ঘণ্টা ট্রানজিট)\n"
                "- বন্দর পরামর্শ: কনটেইনার জট ও ডিউরেজ এড়াতে ফিডার জাহাজের কাট-অফ সময়ের কমপক্ষে ৪ দিন আগে পোর্ট গেট-ইন সম্পন্ন করুন।\n"
                "- সংশ্লিষ্ট প্ল্যাটফর্ম লিঙ্কসমূহ: [কাস্টমস ও পোর্ট ডেটা](/data)।"
            )

    # RMG & Denim
    if any(k in q for k in ["apparel", "garment", "পোশাক", "পোশাকশিল্প", "denim", "ডেনিম", "shirt", "pant", "শার্ট", "প্যান্ট", "6201", "6203", "knitwear", "নিটওয়্যার", "woven"]):
        if language == "en":
            sections.append(
                "VERIFIED TRADE KNOWLEDGE (RMG & DENIM):\n"
                "- HS Codes: 6203.42 (Men's cotton denim trousers), 6201 (Overcoats/jackets).\n"
                "- UK Market: 0.0% tariff under UK DCTS Comprehensive Preferences with single transformation rules for LDCs.\n"
                "- EU Market: 0.0% under EU EBA (GSP+ requires double transformation post-graduation).\n"
                "- Inland Logistics: Gazipur/Savar to Chattogram Port is BDT 42,000 to 44,000 per truck.\n"
                "- Relevant Platform Tools: [Deal Room](/dealroom), [Verified Buyers](/buyers)."
            )
        else:
            sections.append(
                "বাণিজ্য গোয়েন্দা তথ্য (তৈরি পোশাক ও ডেনিম):\n"
                "- এইচএস কোড: ৬২০৩.৪২ (পুরুষদের সুতি ডেনিম ট্রাউজার্স), ৬২০১ (জ্যাকেট/কোট)।\n"
                "- যুক্তরাজ্য: ইউকে DCTS স্কিমের আওতায় ০.০% শুল্ক (একক রূপান্তর নিয়ম প্রযোজ্য)।\n"
                "- ইউরোপীয় ইউনিয়ন: ইবিএ সুবিধার আওতায় ০.০% শুল্ক (পোস্ট-গ্র্যাজুয়েশন জিএসপি প্লাসে দ্বৈত রূপান্তর আবশ্যক)।\n"
                "- লজিস্টিকস: গাজীপুর/সাভার থেকে চট্টগ্রাম বন্দর পর্যন্ত ট্রাক ভাড়া ৪২,০০০ - ৪৪,০০০ টাকা।\n"
                "- সংশ্লিষ্ট প্ল্যাটফর্ম লিঙ্কসমূহ: [ডিল রুম](/dealroom), [আন্তর্জাতিক বায়ার তালিকা](/buyers)।"
            )

    # Leather & Footwear
    if any(k in q for k in ["leather", "চামড়া", "footwear", "জুতো", "জুতা", "boot", "বুট", "6403", "tannery", "ট্যানারি"]):
        if language == "en":
            sections.append(
                "VERIFIED TRADE KNOWLEDGE (LEATHER & FOOTWEAR):\n"
                "- HS Code: 6403 (Footwear with outer soles of rubber/leather).\n"
                "- Japan Market: 0.0% duty under Japan DFQF for LDCs.\n"
                "- EU Market: 0.0% duty under EU EBA.\n"
                "- Compliance: International buyers require LWG (Leather Working Group) certification and Savar Tannery Estate effluent standards.\n"
                "- Relevant Platform Tools: [Deal Room](/dealroom), [Verified Buyers](/buyers)."
            )
        else:
            sections.append(
                "বাণিজ্য গোয়েন্দা তথ্য (চামড়া ও চামড়াজাত পণ্য):\n"
                "- এইচএস কোড: ৬৪০৩ (চামড়ার জুতো ও বুট)।\n"
                "- জাপান বাজার: এলডিসি ডিএফকিউএফ (DFQF) স্কিমের আওতায় ০.০% শুল্কমুক্ত প্রবেশাধিকার।\n"
                "- ইউরোপীয় ইউনিয়ন: ইবিএ স্কিমের আওতায় ০.০% শুল্ক।\n"
                "- সার্টিফিকেশন সতর্কতা: ইউরোপীয় রিটেইলারদের ক্ষেত্রে এলডব্লিউজি (LWG) সার্টিফাইড ট্যানারি প্রসেসিং বাধ্যতামূলক।\n"
                "- সংশ্লিষ্ট প্ল্যাটফর্ম লিঙ্কসমূহ: [ডিল রুম](/dealroom), [আন্তর্জাতিক বায়ার তালিকা](/buyers)।"
            )

    # Default baseline
    if not sections:
        if language == "en":
            sections.append(
                "VERIFIED TRADE BENCHMARKS (EXPORTPILOT CORE KNOWLEDGE GRAPH):\n"
                "- Exchange Rate Baseline: BDT 123.53 per USD (Bangladesh Customs reference).\n"
                "- EU Access: 0.0% duty under EU Everything But Arms (Regulation 978/2012).\n"
                "- UK Access: 0.0% duty under UK DCTS Comprehensive Preferences.\n"
                "- Japan Access: 0.0% duty under Japan DFQF for LDCs.\n"
                "- Payment Benchmark: Confirmed Irrevocable LC at Sight or 30% advance TT deposit.\n"
                "- Chattogram Port 20ft Container Charges: ~$393 USD total.\n"
                "- Navigation: [Deal Room](/dealroom) | [Verified Buyers](/buyers) | [Carbon Audit](/carbon-audit) | [HS Search](/hs-search) | [Customs Data](/data)."
            )
        else:
            sections.append(
                "মূল বাণিজ্য ভিত্তি ও নীতিমালা (এক্সপোর্টপাইলট নলেজ গ্রাফ):\n"
                "- মুদ্রা বিনিময় হার: ১২৩.৫৩ টাকা প্রতি ডলার (বাংলাদেশ কাস্টমস রেফারেন্স রেট)।\n"
                "- ইউরোপীয় ইউনিয়ন: ইবিএ (EBA) স্কিমের আওতায় ০% শুল্কমুক্ত সুবিধা (Regulation 978/2012)।\n"
                "- যুক্তরাজ্য: ইউকে DCTS স্কিমের আওতায় ০% শুল্কমুক্ত সুবিধা।\n"
                "- জাপান: ডিএফকিউএফ (DFQF) স্কিমের আওতায় ০% শুল্ক।\n"
                "- পেমেন্ট নিরাপত্তা: কনফার্মড ইরেভোকেবল এলসি অ্যাট সাইট অথবা ৩০% অগ্রিম টিটি।\n"
                "- চট্টগ্রাম বন্দর কন্টেইনার ক্লিয়ারেন্স চার্জ: আনুমানিক ৩৯৩ ডলার (২০ ফুট কন্টেইনার)।\n"
                "- প্ল্যাটফর্ম লিঙ্ক: [ডিল রুম](/dealroom) | [আন্তর্জাতিক বায়ার তালিকা](/buyers) | [কার্বন অডিট](/carbon-audit) | [এইচএস কোড ও শুল্ক অনুসন্ধান](/hs-search) | [কাস্টমস ডেটা](/data)।"
            )

    return "\n\n".join(sections)


def _build_system_prompt(language: str = "bn") -> str:
    if language == "en":
        return (
            "You are ExportPilot AI Senior Trade Advisor, specialized in Bangladesh export trade.\n"
            "Your expertise covers RMG (knitwear, woven apparel, denim), diversified jute products, "
            "crust and finished leather, frozen seafood, and light engineering.\n"
            "You master Incoterms 2020 (FOB Chattogram, CIF, CFR), payment security "
            "(Confirmed Irrevocable LC at sight, UPAS LC, TT advance), EU CBAM carbon "
            "compliance (Regulation 2023/956), and international negotiation tactics.\n"
            "Rules:\n"
            "1. Give direct, sharp, actionable trade intelligence and pricing strategy.\n"
            "2. Strictly NO em-dashes (—) or en-dashes (–). Use standard hyphens (-) only.\n"
            "3. Format tariffs, HS codes, contract clauses, or cost breakdowns in Markdown code blocks (```text or ```json) or inline code.\n"
            "4. Provide clickable Markdown links where relevant: [Deal Room](/dealroom), [Verified Buyers](/buyers), [Carbon Audit](/carbon-audit), [HS Code Search](/hs-search), [Customs Data](/data).\n"
            "5. Never use generic AI fluff or flowery clichés. Be realistic and business-oriented.\n"
            "6. Protect exporter gross margins and identify hidden freight, inspection, or penalty risks.\n"
            "7. Structure your answer with clear markdown headers: ### Trade Analysis, ### Strategic Counter-Offer, and ### Risk Assessment."
        )
    return (
        "আপনি এক্সপোর্টপাইলট এআই এর সিনিয়র আন্তর্জাতিক বাণিজ্য ও নেগোসিয়েশন অ্যাডভাইজার।\n"
        "বাংলাদেশের তৈরি পোশাক (নিটওয়্যার, ওভেন, ডেনিম), পাট ও পাটজাত পণ্য, চামড়া ও চামড়াজাত পণ্য, "
        "হিমায়িত খাদ্য ও প্রকৌশল পণ্যের আন্তর্জাতিক রপ্তানি বাণিজ্যে আপনি অভিজ্ঞ।\n"
        "ইনকোটার্মস ২০২০ (FOB চট্টগ্রাম, CIF, CFR), পেমেন্ট নিরাপত্তা (কনফার্মড ইরেভোকেবল এলসি অ্যাট সাইট, "
        "ইউপাস এলসি, টিটি ডিপোজিট), ইউরোপীয় ইউনিয়নের সিবিএএম (CBAM) কার্বন নীতি এবং ক্রেতার সাথে দরকষাকষির "
        "কৌশলে আপনি দক্ষ।\n"
        "নিয়মাবলী:\n"
        "১. সোজাসাপ্টা, বাস্তবসম্মত এবং ব্যবসায়িকভাবে কার্যকর পরামর্শ ও কৌশল দিন।\n"
        "২. কোনো অবস্থাতেই এম-ড্যাশ (—) বা এন-ড্যাশ (–) ব্যবহার করবেন না। শুধু সাধারণ হাইফেন (-) ব্যবহার করুন।\n"
        "৩. ট্যারিফ রেট, এইচএস কোড, চুক্তির ধারা বা খরচের হিসাব অবশ্যই মার্কডাউন কোড ব্লকে (```text বা ```json) অথবা ইনলাইন কোডে উপস্থাপন করুন।\n"
        "৪. উত্তরের প্রাসঙ্গিক জায়গায় প্ল্যাটফর্মের টুলসের ক্লিকেবল মার্কডাউন লিঙ্ক দিন: [ডিল রুম](/dealroom), [আন্তর্জাতিক বায়ার তালিকা](/buyers), [কার্বন অডিট](/carbon-audit), [এইচএস কোড ও শুল্ক অনুসন্ধান](/hs-search), [কাস্টমস ডেটা](/data)।\n"
        "৫. কৃত্রিম বা রোবোটিক বাক্য ও চটুল বিজ্ঞাপনীয় ভাষা পরিহার করুন। পেশাদার ও সরাসরি বাংলায় লিখুন।\n"
        "৬. রপ্তানিকারকের মার্জিন রক্ষা করা এবং গোপন ফ্রেইট চার্জ বা পরিদর্শন ঝুঁকি চিহ্নিত করাই আপনার প্রধান লক্ষ্য।\n"
        "৭. স্পষ্ট মার্কডাউন হেডারে উত্তর সাজান: ### মূল বিশ্লেষণ ও শুল্ক সুবিধা, ### প্রস্তাবিত বাণিজ্যিক কৌশল ও কাউন্টার অফার, এবং ### ঝুঁকি সতর্কতা।"
    )


def _offline_fallback(sanitized_text: str, context: Optional[DealContext], language: str = "bn") -> Dict[str, Any]:
    """Deterministic fallback strategy injecting rich Hybrid RAG trade intelligence."""
    commodity = (context.commodity if context and context.commodity else "রপ্তানি পণ্য").strip()
    target_price = (context.target_price if context and context.target_price else "মার্কেট বেঞ্চমার্ক").strip()
    incoterm = (context.incoterm if context and context.incoterm else "FOB Chattogram").strip()

    rag_text = _retrieve_rag_context(sanitized_text, language=language)

    if language == "en":
        reply = (
            f"### Trade Analysis & Verified Intelligence\n"
            f"{rag_text}\n\n"
            f"### Negotiation & Margins Strategy\n"
            f"For {commodity} under {incoterm}, foreign buyers commonly request a 5% to 8% discount on initial inquiries. "
            f"Do not discount the base FOB directly. Instead, maintain base price around {target_price} "
            f"and propose staggered shipment schedules against a Confirmed Irrevocable LC at sight.\n\n"
            f"### Quick Platform Navigation\n"
            f"- Negotiate contract terms: [Deal Room](/dealroom)\n"
            f"- Direct verified buyers: [Buyer Directory](/buyers)\n"
            f"- Verify tariff and HS codes: [HS Code Search](/hs-search)\n"
            f"- Calculate Scope 1 and 2 emissions: [CBAM Carbon Audit](/carbon-audit)"
        )
        return {
            "reply": _clean_anti_slop(reply),
            "strategy_summary": f"Hold price near {target_price}. Counter with staggered shipment lots and Confirmed LC at sight.",
            "suggested_counter_offer": f"Counter at {target_price} {incoterm} with 30% advance TT and 70% Irrevocable LC at sight.",
            "risk_factors": [
                "Unsecured Open Account terms (insist on Confirmed LC at sight or credit insurance)",
                "EU CBAM carbon documentation compliance requirements",
                "Chattogram port feeder congestion buffer (maintain 4-day port gate-in cushion)",
            ],
            "model_used": "Deterministic Local Hybrid RAG Engine",
        }

    reply = (
        f"### মূল বিশ্লেষণ ও যাচাইকৃত বাণিজ্য তথ্য\n"
        f"{rag_text}\n\n"
        f"### দরকষাকষি ও মার্জিন সুরক্ষা কৌশল\n"
        f"{commodity} রপ্তানির ক্ষেত্রে {incoterm} শর্তে বিদেশি বায়াররা প্রাথমিক প্রস্তাবে ৫% থেকে ৮% পর্যন্ত ছাড় চাইতে পারে। "
        f"সরাসরি FOB রেট না কমিয়ে মূল্য {target_price} এর কাছাকাছি ধরে রাখুন এবং চট্টগ্রাম বন্দর থেকে দ্রুত শিপমেন্ট ব্যাচ ও "
        f"কনফার্মড ইরেভোকেবল এলসি অ্যাট সাইট শর্তে অনড় থাকুন।\n\n"
        f"### প্রয়োজনীয় প্ল্যাটফর্ম লিঙ্কসমূহ\n"
        f"- সরাসরি চুক্তি নেগোশিয়েট করুন: [ডিল রুম](/dealroom)\n"
        f"- সরাসরি ভেরিফায়েড বিদেশি বায়ার খুঁজুন: [বায়ার তালিকা](/buyers)\n"
        f"- সঠিক এইচএস কোড ও শুল্ক সুবিধা যাচাই করুন: [এইচএস কোড ও শুল্ক অনুসন্ধান](/hs-search)\n"
        f"- স্কোপ ১ ও ২ কার্বন হিসাব করুন: [কার্বন অডিট ও সিবিএএম](/carbon-audit)"
    )
    return {
        "reply": _clean_anti_slop(reply),
        "strategy_summary": f"মূল্য {target_price} এর কাছাকাছি ধরে রাখুন। সরাসরি ছাড় না দিয়ে শিপমেন্ট ব্যাচ ও কনফার্মড এলসি শর্তে অনড় থাকুন।",
        "suggested_counter_offer": f"কাউন্টার রেট: {target_price} ({incoterm})। পেমেন্ট শর্ত: কনফার্মড এলসি অ্যাট সাইট অথবা ৩০% অগ্রিম টিটি।",
        "risk_factors": [
            "ওপেন অ্যাকাউন্টে পণ্য না পাঠানো (পেমেন্ট ডিফল্ট ঝুঁকি এড়াতে কনফার্মড এলসি বজায় রাখুন)",
            "ইউরোপীয় ইউনিয়নের সিবিএএম ও পরিবেশ সনদ সংক্রান্ত তথ্য সংরক্ষণ",
            "পিক মৌসুমে চট্টগ্রাম বন্দরের কনটেইনার জট এড়াতে ৪ দিনের পোর্ট গেট-ইন বাফার",
        ],
        "model_used": "স্থানীয় হাইব্রিড রাগ বাণিজ্য ইঞ্জিন",
    }


async def _call_azure_completion(
    endpoint: str,
    key: str,
    deployment: str,
    messages: List[Dict[str, str]],
    timeout: float = 16.0,
) -> Optional[str]:
    url = f"{endpoint}/openai/deployments/{deployment}/chat/completions?api-version=2024-08-01-preview"
    headers = {
        "Content-Type": "application/json",
        "api-key": key,
    }
    
    payload = {
        "messages": messages,
        "max_completion_tokens": 1000,
    }

    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                choices = data.get("choices", [])
                if choices:
                    return choices[0].get("message", {}).get("content", "")
            
            if resp.status_code == 400 and "unsupported_parameter" in resp.text:
                payload.pop("max_completion_tokens", None)
                payload["max_tokens"] = 1000
                resp2 = await client.post(url, json=payload, headers=headers)
                if resp2.status_code == 200:
                    data2 = resp2.json()
                    choices2 = data2.get("choices", [])
                    if choices2:
                        return choices2[0].get("message", {}).get("content", "")
            
            logger.warning("Azure OpenAI deployment %s returned status %d: %s", deployment, resp.status_code, resp.text[:200])
        except Exception as exc:
            logger.warning("Azure OpenAI call failed for %s: %s", deployment, exc)
    return None


async def _call_gemini_completion(messages: List[Dict[str, str]], api_key: str, model: str) -> Optional[str]:
    system_prompt = next((message["content"] for message in messages if message["role"] == "system"), "")
    user_parts = [
        {"role": "user", "parts": [{"text": message["content"]}]}
        for message in messages
        if message["role"] != "system"
    ]
    payload = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": user_parts,
        "generationConfig": {"maxOutputTokens": 1000},
    }
    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            response = await client.post(
                endpoint,
                json=payload,
                headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
            )
            if response.status_code == 200:
                candidates = response.json().get("candidates", [])
                parts = candidates[0].get("content", {}).get("parts", []) if candidates else []
                text = "\n".join(part.get("text", "") for part in parts if part.get("text"))
                return text or None
            logger.warning("Gemini model %s returned status %d", model, response.status_code)
        except Exception as exc:
            logger.warning("Gemini request failed (%s)", type(exc).__name__)
    return None


def _selected_trade_provider(db: Session, azure_configured: bool) -> str:
    setting = db.get(SystemSetting, "trade_advisor_provider")
    if setting and setting.value:
        val = setting.value.strip()
        if val == "local_deterministic":
            return "local_deterministic"
        if val == "azure_openai" and azure_configured:
            return "azure_openai"
        if val == "gemini_flash" and os.getenv("GEMINI_API_KEY", "").strip():
            return "gemini_flash"
    return "azure_openai" if azure_configured else "local_deterministic"


@router.post("/negotiate", response_model=NegotiateResponse)
async def negotiate_deal(
    req: NegotiateRequest,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
):
    start_time = time.perf_counter()

    # Step 1: Enforce local data sovereignty by redacting Bangladeshi PII
    redacted_text, pii_count, detected = mask_bangla_pii(req.message)

    sanitized_context = None
    if req.deal_context:
        sanitized_fields = {}
        for field, value in req.deal_context.model_dump().items():
            if value is None:
                sanitized_fields[field] = None
                continue
            sanitized_fields[field], count, _ = mask_bangla_pii(value)
            pii_count += count
        sanitized_context = DealContext(**sanitized_fields)
    cfg = _get_azure_config()
    provider = _selected_trade_provider(db, bool(cfg["endpoint"] and cfg["key"]))
    language = "en" if req.language == "en" else "bn"

    # Step 2: Retrieve verified Hybrid RAG trade intelligence
    rag_context = _retrieve_rag_context(redacted_text, language=language)

    # Context enrichment
    context_str = ""
    if sanitized_context:
        ctx = sanitized_context
        ctx_parts = []
        if ctx.commodity:
            ctx_parts.append(f"Commodity: {ctx.commodity}")
        if ctx.target_price:
            ctx_parts.append(f"Target Price: {ctx.target_price}")
        if ctx.moq:
            ctx_parts.append(f"MOQ: {ctx.moq}")
        if ctx.incoterm:
            ctx_parts.append(f"Incoterm: {ctx.incoterm}")
        if ctx.destination_country:
            ctx_parts.append(f"Destination: {ctx.destination_country}")
        if ctx.buyer_name:
            ctx_parts.append(f"Buyer: {ctx.buyer_name}")
        if ctx_parts:
            context_str = "Deal Parameters: " + " | ".join(ctx_parts) + "\n\n"

    system_prompt = _build_system_prompt(language)
    user_prompt = (
        f"{rag_context}\n\n"
        f"{context_str}Buyer / Exporter Query (PII Sanitized):\n{redacted_text}"
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    llm_output = None
    model_name_used = "Offline Fallback"

    if provider == "azure_openai" and cfg["endpoint"] and cfg["key"]:
        llm_output = await _call_azure_completion(cfg["endpoint"], cfg["key"], cfg["deployment"], messages)
        if llm_output:
            model_name_used = f"{cfg['deployment']} (Azure OpenAI + Hybrid RAG)"
        elif cfg["fallback_deployment"] and cfg["fallback_deployment"] != cfg["deployment"]:
            llm_output = await _call_azure_completion(cfg["endpoint"], cfg["key"], cfg["fallback_deployment"], messages)
            if llm_output:
                model_name_used = f"{cfg['fallback_deployment']} (Azure OpenAI + Hybrid RAG)"
    elif provider == "gemini_flash" and os.getenv("GEMINI_API_KEY"):
        gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
        llm_output = await _call_gemini_completion(messages, os.environ["GEMINI_API_KEY"].strip(), gemini_model)
        if llm_output:
            model_name_used = f"{gemini_model} (Gemini Flash + Hybrid RAG)"
    elif provider == "local_deterministic":
        model_name_used = "Hybrid RAG Engine"

    latency_ms = int((time.perf_counter() - start_time) * 1000)

    if llm_output:
        cleaned_output = _clean_anti_slop(llm_output)
        lines = [line.strip() for line in cleaned_output.split("\n") if line.strip()]
        first_few = " ".join(lines[:2])[:200]
        strategy_summary = _clean_anti_slop(first_few if first_few else "Strategic negotiation counter-proposal ready.")
        
        suggested_counter = "Review detailed breakdown above for counter-offer parameters."
        for line in lines:
            if "counter" in line.lower() or "কাউন্টার" in line or "প্রস্তাব" in line:
                suggested_counter = line.lstrip("-*# ").strip()
                break

        risk_factors = [
            "Verify buyer creditworthiness via ECGC or Dun & Bradstreet rating",
            "Ensure LC contains no non-standard inspection certificates before port loading",
            "Maintain EU CBAM and environmental compliance certificates on file",
        ]

        return NegotiateResponse(
            reply=cleaned_output,
            strategy_summary=strategy_summary,
            suggested_counter_offer=_clean_anti_slop(suggested_counter),
            risk_factors=[_clean_anti_slop(r) for r in risk_factors],
            pii_redacted_count=pii_count,
            model_used=model_name_used,
            latency_ms=latency_ms,
            sovereignty_protected=True,
        )

    # If Azure OpenAI call did not succeed, return deterministic hybrid RAG fallback
    fallback_data = _offline_fallback(redacted_text, sanitized_context, language)
    return NegotiateResponse(
        reply=_clean_anti_slop(fallback_data["reply"]),
        strategy_summary=_clean_anti_slop(fallback_data["strategy_summary"]),
        suggested_counter_offer=_clean_anti_slop(fallback_data["suggested_counter_offer"]),
        risk_factors=[_clean_anti_slop(r) for r in fallback_data["risk_factors"]],
        pii_redacted_count=pii_count,
        model_used=fallback_data["model_used"],
        latency_ms=latency_ms,
        sovereignty_protected=True,
    )


@router.get("/status")
async def get_azure_openai_status(db: Session = Depends(get_db)):
    cfg = _get_azure_config()
    is_configured = bool(cfg["endpoint"] and cfg["key"])
    gemini_configured = bool(os.getenv("GEMINI_API_KEY", "").strip())
    active_provider = _selected_trade_provider(db, is_configured)
    
    masked_endpoint = ""
    if cfg["endpoint"]:
        parts = cfg["endpoint"].split("//")
        domain = parts[-1]
        masked_endpoint = f"https://{domain[:8]}...{domain[-14:]}" if len(domain) > 22 else cfg["endpoint"]

    return {
        "configured": is_configured,
        "active_provider": active_provider,
        "gemini_configured": gemini_configured,
        "endpoint_masked": masked_endpoint,
        "primary_deployment": cfg["deployment"] if is_configured else None,
        "fallback_deployment": cfg["fallback_deployment"] if is_configured else None,
        "status": "operational" if is_configured else "local_fallback",
        "sovereignty_filter_active": True,
        "supported_models": ["gpt-4.1-mini", "gpt-5-mini"],
        "region": os.getenv("AZURE_OPENAI_REGION", "Not reported") if is_configured else "Not applicable",
    }

