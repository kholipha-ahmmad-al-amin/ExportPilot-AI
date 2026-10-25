"""
ExportPilot AI | Bangladesh Bank Export Cash Incentive Calculator
=================================================================
Calculates statutory export subsidies (নগদ সহায়তা) per Bangladesh Bank
Foreign Exchange Circulars across flagship export sectors.

No em dash (U+2014) and no en dash (U+2013) is used in this file.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

# Bangladesh Bank Foreign Exchange statutory subsidy rate table (2026 guidelines)
STATUTORY_RATES = {
    "diversified_jute": {
        "sector_name_bn": "বহুমুখী পাটজাত পণ্য",
        "sector_name_en": "Diversified Jute Goods",
        "rate_pct": 20.0,
        "min_value_addition_pct": 30.0,
        "eligible_hs_prefixes": ["53", "57", "6305", "4202"],
        "circular_ref": "FE Circular No. 04 / Bangladesh Bank 2026",
    },
    "jute_yarn_hessian": {
        "sector_name_bn": "ঐতিহ্যবাহী পাটের সুতা ও বস্তা",
        "sector_name_en": "Traditional Jute Yarn & Hessian",
        "rate_pct": 7.0,
        "min_value_addition_pct": 30.0,
        "eligible_hs_prefixes": ["5307", "6305.10"],
        "circular_ref": "FE Circular No. 04 / Bangladesh Bank 2026",
    },
    "leather_footwear": {
        "sector_name_bn": "চামড়াজাত পণ্য ও জুতা",
        "sector_name_en": "Finished Leather Goods & Footwear",
        "rate_pct": 15.0,
        "min_value_addition_pct": 30.0,
        "eligible_hs_prefixes": ["4201", "4202", "4203", "4205", "6403", "6404"],
        "circular_ref": "FE Circular No. 08 / Bangladesh Bank 2026",
    },
    "rmg_new_markets": {
        "sector_name_bn": "তৈরি পোশাক (নতুন বাজার ও এসএমই)",
        "sector_name_en": "Ready-Made Garments (New Markets / SME)",
        "rate_pct": 4.0,
        "min_value_addition_pct": 30.0,
        "eligible_hs_prefixes": ["61", "62"],
        "circular_ref": "FE Circular No. 02 / Bangladesh Bank 2026",
    },
    "agro_processing": {
        "sector_name_bn": "কৃষি ও প্রক্রিয়াজাত খাদ্যপণ্য",
        "sector_name_en": "Agricultural & Processed Agro-Food",
        "rate_pct": 20.0,
        "min_value_addition_pct": 30.0,
        "eligible_hs_prefixes": ["07", "08", "09", "19", "20", "21"],
        "circular_ref": "FE Circular No. 05 / Bangladesh Bank 2026",
    },
    "ceramics_engineering": {
        "sector_name_bn": "সিরামিক সামগ্রী ও হালকা প্রকৌশল",
        "sector_name_en": "Ceramics & Light Engineering",
        "rate_pct": 10.0,
        "min_value_addition_pct": 30.0,
        "eligible_hs_prefixes": ["6911", "6912", "73", "84", "85"],
        "circular_ref": "FE Circular No. 06 / Bangladesh Bank 2026",
    },
}

DEFAULT_USD_TO_BDT_RATE = 123.53


class CashIncentiveRequest(BaseModel):
    sector_id: str = Field(..., description="One of: diversified_jute, jute_yarn_hessian, leather_footwear, rmg_new_markets, agro_processing, ceramics_engineering")
    fob_export_value_usd: float = Field(..., gt=0)
    raw_material_import_cost_usd: float = Field(default=0.0, ge=0.0)
    usd_to_bdt_rate: float = Field(default=DEFAULT_USD_TO_BDT_RATE, gt=50.0)
    hs_code: Optional[str] = None


class CashIncentiveResponse(BaseModel):
    sector_id: str
    sector_name_bn: str
    sector_name_en: str
    fob_export_value_usd: float
    fob_export_value_bdt: float
    value_addition_pct: float
    is_value_addition_eligible: bool
    applicable_subsidy_rate_pct: float
    estimated_cash_incentive_usd: float
    estimated_cash_incentive_bdt: float
    net_effective_exporter_margin_increase_pct: float
    statutory_circular: str
    required_bank_documents_bn: List[str]
    required_bank_documents_en: List[str]


def calculate_cash_incentive(req: CashIncentiveRequest) -> CashIncentiveResponse:
    sector = STATUTORY_RATES.get(req.sector_id)
    if not sector:
        sector = STATUTORY_RATES["diversified_jute"]

    fob_bdt = req.fob_export_value_usd * req.usd_to_bdt_rate

    # Calculate Value Addition (মূল্য সংযোজন)
    # Value Addition % = ((FOB Value - Imported Raw Material Cost) / FOB Value) * 100
    if req.fob_export_value_usd > 0:
        val_add_pct = round(((req.fob_export_value_usd - req.raw_material_import_cost_usd) / req.fob_export_value_usd) * 100.0, 2)
    else:
        val_add_pct = 0.0

    is_eligible = val_add_pct >= sector["min_value_addition_pct"]
    subsidy_rate = sector["rate_pct"] if is_eligible else 0.0

    incentive_usd = round(req.fob_export_value_usd * (subsidy_rate / 100.0), 2)
    incentive_bdt = round(incentive_usd * req.usd_to_bdt_rate, 2)

    margin_gain_pct = round(subsidy_rate, 2)

    bank_docs_bn = [
        "বাংলাদেশ ব্যাংক অনলাইন এক্সপোর্ট মনিটরিং সিস্টেম (OEMS) জেনারেটেড অনুমোদিত EXP ফরম কপি",
        "কাস্টমস কর্তৃপক্ষ কর্তৃক সার্টিফাইড আসল বিল অব এক্সপোর্ট (Bill of Export)",
        "বাণিজ্যিক ব্যাংকের ইস্যুকৃত আসল প্রসিড রিয়ালাইজেশন সার্টিফিকেট (PRC)",
        "স্থানীয় কারখানা কর্তৃক কাঁচামাল ও উৎপাদন খরচের মূল্য সংযোজন হিসাব বিবরণী",
        "রপ্তানি উন্নয়ন ব্যুরো (EPB) অথবা সংশ্লিষ্ট বাণিজ্য অ্যাসোসিয়েশনের হালনাগাদ সদস্যপদ সনদ",
    ]

    bank_docs_en = [
        "Bangladesh Bank OEMS system generated approved EXP Form",
        "Original customs certified Bill of Export with export endorsement stamp",
        "Bank issued Proceed Realization Certificate (PRC) confirming forex arrival",
        "Audited factory cost sheet proving minimum 30% local value addition",
        "Valid membership certificate from Export Promotion Bureau (EPB) or trade association",
    ]

    return CashIncentiveResponse(
        sector_id=req.sector_id,
        sector_name_bn=sector["sector_name_bn"],
        sector_name_en=sector["sector_name_en"],
        fob_export_value_usd=req.fob_export_value_usd,
        fob_export_value_bdt=fob_bdt,
        value_addition_pct=val_add_pct,
        is_value_addition_eligible=is_eligible,
        applicable_subsidy_rate_pct=subsidy_rate,
        estimated_cash_incentive_usd=incentive_usd,
        estimated_cash_incentive_bdt=incentive_bdt,
        net_effective_exporter_margin_increase_pct=margin_gain_pct,
        statutory_circular=sector["circular_ref"],
        required_bank_documents_bn=bank_docs_bn,
        required_bank_documents_en=bank_docs_en,
    )
