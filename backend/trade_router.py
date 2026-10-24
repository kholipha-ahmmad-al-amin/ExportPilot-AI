"""
ExportPilot AI | Trade Intelligence & Regulatory Router
======================================================
Endpoints for:
1. Letter of Credit (L/C) Discrepancy Auditing (ICC UCP 600)
2. Bangladesh Bank Cash Incentive & Subsidy Calculator

No em dash (U+2014) and no en dash (U+2013) is used in this file.
"""

from fastapi import APIRouter, Depends, HTTPException
from backend.auth import get_current_active_user
from backend.models import User
from backend.lc_audit import (
    LCAuditRequest,
    LCAuditResponse,
    audit_letter_of_credit,
)
from backend.cash_incentives import (
    CashIncentiveRequest,
    CashIncentiveResponse,
    STATUTORY_RATES,
    calculate_cash_incentive,
)

router = APIRouter(prefix="/trade", tags=["Trade & Regulatory Intelligence"])


@router.post("/lc-audit", response_model=LCAuditResponse)
def audit_lc_endpoint(
    req: LCAuditRequest,
    _current_user: User = Depends(get_current_active_user),
):
    """Audit export L/C against UCP 600 rules and Proforma Invoice parameters."""
    try:
        return audit_letter_of_credit(req)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to audit L/C: {str(exc)}")


@router.post("/cash-incentive", response_model=CashIncentiveResponse)
def calculate_cash_incentive_endpoint(
    req: CashIncentiveRequest,
    _current_user: User = Depends(get_current_active_user),
):
    """Calculate Bangladesh Bank statutory export subsidy and bank checklist."""
    try:
        return calculate_cash_incentive(req)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to calculate cash incentive: {str(exc)}")


@router.get("/cash-incentive/sectors")
def list_incentive_sectors(
    _current_user: User = Depends(get_current_active_user),
):
    """List all official Bangladesh Bank supported cash incentive export sectors."""
    return [
        {
            "sector_id": k,
            "sector_name_bn": v["sector_name_bn"],
            "sector_name_en": v["sector_name_en"],
            "rate_pct": v["rate_pct"],
            "min_value_addition_pct": v["min_value_addition_pct"],
            "circular_ref": v["circular_ref"],
        }
        for k, v in STATUTORY_RATES.items()
    ]
