"""
ExportPilot AI | Letter of Credit (L/C) Discrepancy Auditor
=============================================================
Audits export Letter of Credit terms against ICC UCP 600 standards
and Proforma Invoice drafts to prevent payment refusals for
Bangladeshi exporters.

No em dash (U+2014) and no en dash (U+2013) is used in this file.
"""

from datetime import datetime, date
import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class LCAuditRequest(BaseModel):
    lc_number: str = Field(..., min_length=3, max_length=50)
    issuing_bank: str = Field(..., min_length=2, max_length=150)
    issuing_country: str = Field(default="DE", max_length=50)
    lc_amount_usd: float = Field(..., gt=0)
    tolerance_pct: float = Field(default=5.0, ge=0.0, le=10.0)
    latest_shipment_date: str = Field(..., description="YYYY-MM-DD")
    lc_expiry_date: str = Field(..., description="YYYY-MM-DD")
    port_of_loading: str = Field(default="Chattogram Port, Bangladesh")
    port_of_discharge: str = Field(..., min_length=2)
    incoterm: str = Field(default="FOB", max_length=10)
    product_description: str = Field(..., min_length=3)
    pi_reference_amount_usd: Optional[float] = None
    pi_reference_quantity: Optional[int] = None
    pi_reference_unit_price: Optional[float] = None
    required_documents: List[str] = Field(default_factory=list)


class DiscrepancyFinding(BaseModel):
    rule_id: str
    ucp600_article: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    title_bn: str
    title_en: str
    description_bn: str
    description_en: str
    suggested_amendment_bn: str
    suggested_amendment_en: str


class LCAuditResponse(BaseModel):
    lc_number: str
    overall_health_score: int  # 0 to 100
    risk_level: str  # LOW, MODERATE, CRITICAL
    verdict_bn: str
    verdict_en: str
    total_discrepancies: int
    findings: List[DiscrepancyFinding]
    mandatory_checklist: List[Dict[str, Any]]
    amendment_letter_template_en: str


def _parse_date(date_str: str) -> Optional[date]:
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
        try:
            return datetime.strptime(date_str.strip(), fmt).date()
        except ValueError:
            continue
    return None


def audit_letter_of_credit(req: LCAuditRequest) -> LCAuditResponse:
    findings: List[DiscrepancyFinding] = []
    penalty_score = 0

    # 1. Date Validation: Expiry Date vs Latest Shipment Date (UCP 600 Article 29)
    ship_date = _parse_date(req.latest_shipment_date)
    exp_date = _parse_date(req.lc_expiry_date)

    if ship_date and exp_date:
        if exp_date < ship_date:
            penalty_score += 40
            findings.append(DiscrepancyFinding(
                rule_id="DATE_EXPIRY_BEFORE_SHIP",
                ucp600_article="UCP 600 Article 29",
                severity="CRITICAL",
                title_bn="মেয়াদ শেষ হওয়ার তারিখ জাহাজিকরণের তারিখের পূর্বে",
                title_en="L/C Expiry Precedes Latest Shipment Date",
                description_bn=f"এলসির মেয়াদ শেষ হওয়ার তারিখ ({req.lc_expiry_date}) সর্বশেষ জাহাজিকরণের তারিখ ({req.latest_shipment_date}) এর পূর্বে নির্ধারিত হয়েছে। এই এলসিতে বিল অব লেডিং উপস্থাপন করলে ব্যাংক সরাসরি অর্থ ছাড় বাতিল করবে।",
                description_en=f"The L/C expiry date ({req.lc_expiry_date}) is earlier than the latest shipment date ({req.latest_shipment_date}). Documents presented will be rejected by the issuing bank under Article 29.",
                suggested_amendment_bn="বায়ারকে অনতিবিলম্বে এলসি সংশোধন (Amendment) করে মেয়াদ জাহাজিকরণের তারিখ থেকে ন্যূনতম ১৫ থেকে ২১ দিন পর্যন্ত বাড়ানোর অনুরোধ করুন।",
                suggested_amendment_en="Request an immediate L/C amendment extending expiry to at least 15-21 days after the latest shipment date.",
            ))
        else:
            diff_days = (exp_date - ship_date).days
            if diff_days < 14:
                penalty_score += 15
                findings.append(DiscrepancyFinding(
                    rule_id="DATE_PRESENTATION_WINDOW_TIGHT",
                    ucp600_article="UCP 600 Article 14(c)",
                    severity="HIGH",
                    title_bn="নথি উপস্থাপনের সময়সীমা ঝুঁকিপূর্ণভাবে কম",
                    title_en="Presentation Period Unusually Short",
                    description_bn=f"জাহাজিকরণ ও এলসি মেয়াদের ব্যবধান মাত্র {diff_days} দিন। পণ্য চট্টগ্রাম বন্দর থেকে জাহাজে ওঠার পর বিল অব লেডিং সংগ্রহ ও ব্যাংকে উপস্থাপনে সময় স্বল্পতার ঝুঁকি রয়েছে।",
                    description_en=f"Only {diff_days} days are allowed between shipment and expiry. This leaves insufficient time to receive Bill of Lading from the shipping line and present to the negotiating bank.",
                    suggested_amendment_bn="নথি উপস্থাপনের জন্য মেয়াদ বাড়িয়ে ন্যূনতম ২১ দিন নির্ধারণের আবেদন করুন।",
                    suggested_amendment_en="Amend the presentation window to at least 21 days from the transport document issue date.",
                ))

    # 2. Port of Loading Validation (Must match Bangladesh ports)
    bd_ports = ["chattogram", "chittagong", "mongla", "payra", "dhaka air cargo", "benapole"]
    pol_normalized = req.port_of_loading.lower()
    if not any(port in pol_normalized for port in bd_ports):
        penalty_score += 25
        findings.append(DiscrepancyFinding(
            rule_id="PORT_LOADING_INVALID",
            ucp600_article="UCP 600 Article 20(a)(iii)",
            severity="HIGH",
            title_bn="লোডিং পোর্টের নাম বাংলাদেশে অবস্থিত নয়",
            title_en="Port of Loading Not Located in Bangladesh",
            description_bn=f"এলসিতে উল্লেখিত লোডিং পোর্ট '{req.port_of_loading}' বাংলাদেশের কোনো অনুমোদিত সমুদ্র বা বিমান বন্দর হিসেবে চিহ্নিত নয়।",
            description_en=f"The specified Port of Loading '{req.port_of_loading}' is not recognized as a designated Bangladeshi sea, air, or land customs port.",
            suggested_amendment_bn="পোর্ট সংশোধন করে 'Chattogram Sea Port, Bangladesh' বা 'Hazrat Shahjalal International Airport, Dhaka' লিখুন।",
            suggested_amendment_en="Request an amendment specifying 'Chattogram Sea Port, Bangladesh' or 'Dhaka Air Cargo'.",
        ))

    # 3. Tolerance and Value Stack Checks (UCP 600 Article 30)
    if req.pi_reference_amount_usd:
        diff_amount = abs(req.lc_amount_usd - req.pi_reference_amount_usd)
        pct_diff = (diff_amount / req.pi_reference_amount_usd) * 100.0
        if pct_diff > req.tolerance_pct:
            penalty_score += 20
            findings.append(DiscrepancyFinding(
                rule_id="VALUE_TOLERANCE_EXCEEDED",
                ucp600_article="UCP 600 Article 30(b)",
                severity="HIGH",
                title_bn="প্রফর্মা ইনভয়েস ও এলসির অর্থের পরিমাণে অমিল",
                title_en="L/C Amount Differs from Proforma Invoice Beyond Tolerance",
                description_bn=f"এলসির অর্থ (${req.lc_amount_usd:,.2f}) প্রফর্মা ইনভয়েসের (${req.pi_reference_amount_usd:,.2f}) চেয়ে {pct_diff:.1f}% ভিন্ন, যা অনুমোদিত টলারেন্সের ({req.tolerance_pct}%) বাইরে।",
                description_en=f"The L/C credit value (${req.lc_amount_usd:,.2f}) differs by {pct_diff:.1f}% from the PI value (${req.pi_reference_amount_usd:,.2f}), exceeding the {req.tolerance_pct}% credit tolerance.",
                suggested_amendment_bn="সঠিক চুক্তি অনুযায়ী এলসির অংক সমন্বয় করুন অথবা সংশোধিত প্রফর্মা ইনভয়েস জারি করুন।",
                suggested_amendment_en="Amend the credit value to match the exact agreed proforma invoice amount.",
            ))

    # 4. Mandatory Documentation Requirements
    req_docs_normalized = [d.lower() for d in req.required_documents]
    mandatory_checklist = [
        {
            "doc_name": "Signed Commercial Invoice (in 3 originals and 3 copies)",
            "present": any("commercial invoice" in d or "invoice" in d for d in req_docs_normalized),
            "critical": True,
            "ucp_basis": "UCP 600 Article 18",
        },
        {
            "doc_name": "Clean On Board Bill of Lading (made out to order of issuing bank)",
            "present": any("bill of lading" in d or "b/l" in d or "transport document" in d for d in req_docs_normalized),
            "critical": True,
            "ucp_basis": "UCP 600 Article 20",
        },
        {
            "doc_name": "Packing List detailing gross and net weights per carton",
            "present": any("packing list" in d for d in req_docs_normalized),
            "critical": True,
            "ucp_basis": "Standard Banking Practice ISBP 745",
        },
        {
            "doc_name": "Certificate of Origin issued by Export Promotion Bureau (EPB) or DCCI",
            "present": any("certificate of origin" in d or "origin certificate" in d for d in req_docs_normalized),
            "critical": True,
            "ucp_basis": "GSP / Preferential Rules of Origin",
        },
        {
            "doc_name": "Scope 2 Carbon & Environmental Statement / Inspection Report",
            "present": any("inspection" in d or "carbon" in d or "scope 2" in d or "certificate of inspection" in d for d in req_docs_normalized),
            "critical": False,
            "ucp_basis": "EU CBAM Readiness & Buyer ESG Protocol",
        },
    ]

    for item in mandatory_checklist:
        if item["critical"] and not item["present"]:
            penalty_score += 10
            findings.append(DiscrepancyFinding(
                rule_id=f"MISSING_DOC_{item['doc_name'][:12].upper().replace(' ', '_')}",
                ucp600_article=item["ucp_basis"],
                severity="MEDIUM",
                title_bn=f"আবশ্যক নথি এলসিতে অস্পষ্ট: {item['doc_name'].split('(')[0].strip()}",
                title_en=f"Mandatory Document Unclear in L/C Terms: {item['doc_name'].split('(')[0].strip()}",
                description_bn=f"আন্তর্জাতিক ব্যাংকিং নিয়মানুযায়ী এই নথিটির সুস্পষ্ট বিবরণ এলসির ফিল্ড ৪৬A (Documents Required)-এ থাকা আবশ্যক।",
                description_en=f"Under standard banking practice, explicit wording for {item['doc_name']} must be enumerated in Field 46A of the credit.",
                suggested_amendment_bn="ফিল্ড ৪৬A তে এই নথিটির নাম ও কপির সংখ্যা সুনির্দিষ্টভাবে উল্লেখ করার পরামর্শ দিন।",
                suggested_amendment_en="Ensure Field 46A lists the exact title and copy counts required.",
            ))

    overall_health = max(0, 100 - penalty_score)
    if overall_health >= 85:
        risk = "LOW"
        verdict_bn = "এলসি শর্তাবলি সন্তোষজনক। জাহাজিকরণ প্রস্তুতি শুরু করা যেতে পারে।"
        verdict_en = "L/C terms are clean and acceptable under UCP 600. Production may proceed."
    elif overall_health >= 60:
        risk = "MODERATE"
        verdict_bn = "কিছু সম্ভাব্য অসংগতি রয়েছে। জাহাজিকরণের পূর্বে বায়ারের সাথে শর্তাবলি যাচাই বা সংশোধন প্রয়োজন।"
        verdict_en = "Moderate risk identified. Minor amendments recommended before issuing shipment documents."
    else:
        risk = "CRITICAL"
        verdict_bn = "মারাত্মক অসংগতি বিদ্যমান। এলসি সংশোধন (Amendment) ব্যতীত কোনোভাবেই পণ্য জাহাজিকরণ করবেন না।"
        verdict_en = "Critical discrepancies detected. Do NOT dispatch shipment without an official L/C amendment."

    # Generate ready-to-send amendment request letter template
    amendment_letter = f"""Subject: Urgent Request for L/C Amendment - L/C No: {req.lc_number}
To: The Purchasing / Trade Finance Team, {req.issuing_bank} (Ref: {req.issuing_country})
From: Commercial Department, Verified Export Unit, Bangladesh
Date: {datetime.now().strftime('%Y-%m-%d')}

Dear Trade Partners,

We have received and audited the operative instrument for Letter of Credit {req.lc_number}. 
To comply with ICC UCP 600 rules and ensure smooth banking settlement upon vessel departure from Chattogram, please arrange an official amendment for the following points:

{chr(10).join(f"- {f.rule_id}: {f.suggested_amendment_en}" for f in findings) if findings else "- All major parameters match proforma terms. Please ensure full copy counts are confirmed."}

Please confirm issuance of the amendment swift MT707 at your earliest convenience so production schedules remain on track.

Sincerely,
Export Trade & Compliance Department
ExportPilot AI Sovereign Gateway
"""

    return LCAuditResponse(
        lc_number=req.lc_number,
        overall_health_score=overall_health,
        risk_level=risk,
        verdict_bn=verdict_bn,
        verdict_en=verdict_en,
        total_discrepancies=len(findings),
        findings=findings,
        mandatory_checklist=mandatory_checklist,
        amendment_letter_template_en=amendment_letter,
    )
