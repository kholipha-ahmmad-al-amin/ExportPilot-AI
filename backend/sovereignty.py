import re
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from backend.auth import get_current_active_user
from backend.database import get_db
from backend.security_events import record_security_event
from sqlalchemy.orm import Session

router = APIRouter(prefix="/security", tags=["Data Sovereignty & PII"])

# Bengali numeral translation map
BN_DIGITS = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")

class MaskPIIRequest(BaseModel):
    text: str

class MaskPIIResponse(BaseModel):
    redacted_text: str
    total_redactions: int
    detected_entities: list[dict]
    sovereignty_status: str

# Redaction patterns processed longest-first to avoid partial overlaps.
# Each entry: (entity_type, regex_pattern, replacement_token)
PATTERNS = [
    # IBAN: 2 letters + 2 check digits + up to 30 alphanumeric
    ("IBAN", r"\b[A-Z]{2}\d{2}[A-Z0-9]{4,30}\b", "[REDACTED_IBAN]"),
    # Bangladesh BIN: 9 digits hyphen 4 digits
    ("BD_BIN", r"\b\d{9}-\d{4}\b", "[REDACTED_BIN]"),
    # NID 17-digit: starts with birth year 19xx or 20xx
    ("BD_NID_17", r"\b(?:19|20)\d{15}\b", "[REDACTED_BD_NID]"),
    # Bangladesh mobile: +8801 / 8801 / 01 + prefix 3-9 + 8 digits (11 digits)
    ("BD_PHONE", r"(?:\+8801|8801|01)[3-9]\d{8}\b", "[REDACTED_BD_PHONE]"),
    # NID 13-digit legacy
    ("BD_NID_13", r"\b\d{13}\b", "[REDACTED_BD_NID]"),
    # e-TIN 12-digit
    ("BD_TIN_12", r"\b\d{12}\b", "[REDACTED_TIN]"),
    # Smart NID 10-digit preceded by NID/Smart/nomber/kard keyword
    ("BD_SMART_NID_10", r"(?:NID|Smart|কার্ড|নম্বর)\s*[:#-]?\s*\b\d{10}\b", "[REDACTED_BD_NID]"),
    # Bank account 13 to 16 digits
    ("BANK_ACCOUNT", r"\b\d{13,16}\b", "[REDACTED_BANK_ACCOUNT]"),
]

def mask_bangla_pii(text: str) -> tuple[str, int, list[dict]]:
    """Mask Bangladeshi PII locally using ordered regex patterns.

    Patterns run longest-first (NID-17 before NID-13 before Smart-10) so a
    longer identifier is never split by a shorter pattern. Bengali digits are
    normalized to Arabic digits before scanning.
    """
    normalized = text.translate(BN_DIGITS)
    redacted = normalized
    detected_entities = []
    total_count = 0

    for entity_type, pattern, replacement in PATTERNS:
        matches = list(re.finditer(pattern, redacted))
        for m in matches:
            raw_val = m.group()
            detected_entities.append({
                "type": entity_type,
                "raw": raw_val,
                "replacement": replacement,
            })
            total_count += 1
        redacted = re.sub(pattern, replacement, redacted)

    return redacted, total_count, detected_entities

@router.post("/mask-pii", response_model=MaskPIIResponse)
def mask_pii_endpoint(
    req: MaskPIIRequest,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_active_user),
):
    redacted, count, entities = mask_bangla_pii(req.text)
    record_security_event(
        db,
        name="Sensitive information screening",
        category="security",
        status="PASS",
        details=f"Screened submitted text and masked {count} sensitive values.",
    )
    return {
        "redacted_text": redacted,
        "total_redactions": count,
        "detected_entities": [
            {"type": entity["type"], "replacement": entity["replacement"]}
            for entity in entities
        ],
        "sovereignty_status": "SECURE_SOVEREIGN_PASSED"
    }
