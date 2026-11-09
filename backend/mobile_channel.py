"""
ExportPilot AI | Mobile & WhatsApp Trade Deal Channel
======================================================
Provides interactive WhatsApp Business / SMS gateway endpoints
for Bangladeshi factory owners on the production floor.

Processes natural language text in Bengali or English, performs
sovereign local PII masking, and returns structured trade deal cards.

No em dash (U+2014) and no en dash (U+2013) is used in this file.
"""

import os
import secrets
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, Header, HTTPException
from backend.auth import require_roles
from backend.hybrid_rag import BDT_PER_USD_DEFAULT
from backend.sovereignty import mask_bangla_pii
from backend.seed_data import PRESETS_DATA

router = APIRouter(prefix="/mobile", tags=["Mobile & WhatsApp Channel"])


class WhatsAppIncomingMessage(BaseModel):
    from_number: str = Field(..., min_length=7, max_length=25)
    sender_name: Optional[str] = "Factory Representative"
    message_body: str = Field(..., min_length=1, max_length=8000)
    media_url: Optional[str] = None
    media_type: Optional[str] = None  # "image", "document", None


class WhatsAppActionOption(BaseModel):
    title_bn: str
    title_en: str
    action_url: str


class WhatsAppDealResponse(BaseModel):
    from_number_redacted: str
    original_message_redacted: str
    entities_masked_count: int
    matched_preset_id: str
    product_title_bn: str
    product_title_en: str
    hs_code_8digit: str
    recommended_fob_usd: float
    local_buyer_offer_bdt: float
    middleman_margin_saved_pct: float
    estimated_extra_profit_usd: float
    reply_text_bn: str
    reply_text_en: str
    action_buttons: List[WhatsAppActionOption]


def _build_simulated_response(msg: WhatsAppIncomingMessage):
    """Process incoming WhatsApp trade query with sovereign PII protection."""
    # Step 1: Local PII Masking
    clean_body, pii_count, _ = mask_bangla_pii(msg.message_body)
    clean_number, _, _ = mask_bangla_pii(msg.from_number)

    # Step 2: Intent & Product Matching
    lower_body = clean_body.lower()
    if any(k in lower_body for k in ("ডেনিম", "গার্মেন্টস", "পোশাক", "জ্যাকেট", "denim", "jacket", "rmg")):
        matched_preset = next((p for p in PRESETS_DATA if "denim" in p["preset_id"]), PRESETS_DATA[1])
    elif any(k in lower_body for k in ("জুতা", "লেদার", "চামড়া", "বুট", "leather", "boot", "shoe")):
        matched_preset = next((p for p in PRESETS_DATA if "leather" in p["preset_id"]), PRESETS_DATA[2])
    elif any(k in lower_body for k in ("সিরামিক", "প্লেট", "বাটি", "টেরাকোটা", "ceramic", "tableware")):
        matched_preset = next((p for p in PRESETS_DATA if "ceramic" in p["preset_id"]), PRESETS_DATA[3])
    else:
        # Default flagship jute bag preset
        matched_preset = PRESETS_DATA[0]

    # Extract quantity if present
    import re
    qty_match = re.search(r"(\d+)\s*(?:পিস|টি|টা|জোড়া|units|pcs|pieces)", clean_body, re.IGNORECASE)
    quantity = int(qty_match.group(1)) if qty_match else matched_preset["monthly_capacity_units"]

    unit_fob = matched_preset["recommended_fob_price_usd"]
    local_offer_bdt = matched_preset["buying_house_offer_bdt"]
    extra_profit_usd = round(quantity * (unit_fob - (local_offer_bdt / BDT_PER_USD_DEFAULT)), 2)

    reply_bn = (
        f"ExportPilot AI স্বয়ংক্রিয় রপ্তানি বিশ্লেষণ:\n\n"
        f"পণ্য: {matched_preset['title_bn']}\n"
        f"এইচএস কোড: {matched_preset['hs_code_8digit']}\n"
        f"সরাসরি এফওবি দর: ${unit_fob:.2f} (ট্রেডিং হাউজের অফার {local_offer_bdt:.0f} টাকার বিপরীতে)\n"
        f"মিডলম্যান মার্জিন সাশ্রয়: {matched_preset['middleman_margin_saved_pct']:.0f}%\n"
        f"আপনার সম্ভাব্য অতিরিক্ত লাভ: ${extra_profit_usd:,.2f} USD\n\n"
        f"আপনার সংবেদনশীল তথ্য স্থানীয়ভাবে সুরক্ষিত রাখা হয়েছে।"
    )

    reply_en = (
        f"ExportPilot AI Trade Analysis:\n\n"
        f"Product: {matched_preset['title_en']}\n"
        f"HS Code: {matched_preset['hs_code_8digit']}\n"
        f"Direct FOB Price: ${unit_fob:.2f} USD (vs Local Buying House {local_offer_bdt:.0f} BDT)\n"
        f"Middleman Margin Saved: {matched_preset['middleman_margin_saved_pct']:.0f}%\n"
        f"Estimated Exporter Extra Gain: ${extra_profit_usd:,.2f} USD\n\n"
        f"Sensitive details have been protected via sovereign local redactor."
    )

    actions = [
        WhatsAppActionOption(
            title_bn="ডিল রুমে প্রফর্মা ইনভয়েস দেখুন",
            title_en="Open Deal Room & Invoice",
            action_url=f"/dealroom?preset={matched_preset['preset_id']}",
        ),
        WhatsAppActionOption(
            title_bn="প্রফর্মা ইনভয়েস পিডিএফ ডাউনলোড",
            title_en="Download Proforma PDF",
            action_url=f"/api/v1/reports/download/proforma_invoice/{matched_preset['preset_id']}",
        ),
        WhatsAppActionOption(
            title_bn="জার্মানি ও ইইউ বায়ার ডিরেক্টরি",
            title_en="View Matched EU Buyers",
            action_url="/buyers",
        ),
    ]

    return WhatsAppDealResponse(
        from_number_redacted=clean_number,
        original_message_redacted=clean_body,
        entities_masked_count=pii_count,
        matched_preset_id=matched_preset["preset_id"],
        product_title_bn=matched_preset["title_bn"],
        product_title_en=matched_preset["title_en"],
        hs_code_8digit=matched_preset["hs_code_8digit"],
        recommended_fob_usd=unit_fob,
        local_buyer_offer_bdt=local_offer_bdt,
        middleman_margin_saved_pct=matched_preset["middleman_margin_saved_pct"],
        estimated_extra_profit_usd=extra_profit_usd,
        reply_text_bn=reply_bn,
        reply_text_en=reply_en,
        action_buttons=actions,
    )


@router.post("/simulate", response_model=WhatsAppDealResponse)
def simulate_trade_message(
    msg: WhatsAppIncomingMessage,
    _current_user=Depends(require_roles("factory_owner", "admin")),
):
    """Return an illustrative analysis to the signed-in exporter only."""
    return _build_simulated_response(msg)


@router.post("/webhook", response_model=WhatsAppDealResponse)
def handle_whatsapp_message(
    msg: WhatsAppIncomingMessage,
    x_verify_token: str | None = Header(default=None, alias="X-Verify-Token"),
):
    """Process provider requests only when a verification token is configured."""
    expected_token = os.getenv("MOBILE_CHANNEL_VERIFY_TOKEN", "").strip()
    if not expected_token:
        raise HTTPException(status_code=503, detail="Mobile channel webhook is not configured")
    if not x_verify_token or not secrets.compare_digest(x_verify_token.strip(), expected_token):
        raise HTTPException(status_code=401, detail="Webhook verification failed")
    return _build_simulated_response(msg)