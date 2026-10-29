"""
ExportPilot AI | Buyer RFQ & Factory Capacity Router
====================================================
Enables verified international buyers to post live Requests for Quotation (RFQ)
and allows Bangladeshi factory owners to match, bid, and manage line capacity.

No em dash (U+2014) and no en dash (U+2013) is used in this file.
"""

from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from backend.auth import get_current_active_user, require_roles
from backend.database import get_db
from backend.models import User, BuyerInteraction, BuyerRFQ, FactoryCapacity, TradeDeal

router = APIRouter(prefix="/rfq", tags=["Buyer RFQ & Production Capacity"])


class CreateRFQRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    product_title: str = Field(..., min_length=3, max_length=255)
    hs_code: str = Field(..., min_length=4, max_length=20)
    target_fob_usd: float = Field(..., gt=0, le=1_000_000, allow_inf_nan=False)
    quantity_units: int = Field(..., gt=0, le=1_000_000_000)
    destination_country: str = Field(..., min_length=2, max_length=100)
    target_co2_kg: float = Field(default=1.80, gt=0, le=1_000_000, allow_inf_nan=False)
    delivery_deadline: date = Field(..., description="YYYY-MM-DD")
    specifications_note: Optional[str] = Field(default=None, max_length=5000)


class RFQBidRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    proposed_fob_usd: float = Field(..., gt=0, le=1_000_000, allow_inf_nan=False)
    committed_units: int = Field(..., gt=0, le=1_000_000_000)
    lead_time_days: int = Field(default=30, ge=7, le=180)
    factory_notes_bn: Optional[str] = Field(default=None, max_length=5000)


class UpdateCapacityRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    monthly_capacity_units: int = Field(..., gt=0, le=1_000_000_000)
    allocated_units: int = Field(..., ge=0, le=1_000_000_000)
    production_line_count: int = Field(default=4, ge=1, le=10000)
    next_available_slot: date = Field(..., description="YYYY-MM-DD")


@router.post("/create", status_code=status.HTTP_201_CREATED)
def create_rfq(
    req: CreateRFQRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("verified_buyer", "admin")),
):
    """Post a live international Request for Quotation."""
    new_rfq = BuyerRFQ(
        buyer_id=current_user.id,
        product_title=req.product_title,
        hs_code=req.hs_code,
        target_fob_usd=req.target_fob_usd,
        quantity_units=req.quantity_units,
        destination_country=req.destination_country,
        target_co2_kg=req.target_co2_kg,
        delivery_deadline=req.delivery_deadline.isoformat(),
        requirements_json={"notes": req.specifications_note or ""},
    )
    db.add(new_rfq)
    db.commit()
    db.refresh(new_rfq)
    return {
        "status": "success",
        "rfq_id": new_rfq.id,
        "product_title": new_rfq.product_title,
        "quantity_units": new_rfq.quantity_units,
        "target_fob_usd": new_rfq.target_fob_usd,
        "destination_country": new_rfq.destination_country,
        "created_at": new_rfq.created_at.isoformat(),
    }


@router.get("/feed")
def list_rfq_feed(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=60),
    mine: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Retrieve active buyer RFQs for factory owners to review and bid."""
    query = db.query(BuyerRFQ)
    if mine:
        query = query.filter(BuyerRFQ.buyer_id == current_user.id)
    else:
        query = query.filter(BuyerRFQ.status == "open")
    total = query.count()
    rfqs = (query.options(joinedload(BuyerRFQ.buyer))
            .order_by(BuyerRFQ.created_at.desc(), BuyerRFQ.id)
            .offset(offset).limit(limit).all())

    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "items": [
            {
                "id": r.id,
                "is_owner": r.buyer_id == current_user.id,
                "is_illustrative": (r.requirements_json or {}).get("source") == "illustrative_showcase",
                "product_title": r.product_title,
                "hs_code": r.hs_code,
                "target_fob_usd": r.target_fob_usd,
                "quantity_units": r.quantity_units,
                "destination_country": r.destination_country,
                "target_co2_kg": r.target_co2_kg,
                "delivery_deadline": r.delivery_deadline,
                "status": r.status,
                "buyer_company": r.buyer.factory_name if r.buyer else "Verified International Buyer",
            }
            for r in rfqs
        ],
    }


@router.post("/{rfq_id}/bid")
def submit_rfq_bid(
    rfq_id: str,
    req: RFQBidRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("factory_owner", "admin")),
):
    """Factory owners submit direct bids on international buyer RFQs."""
    rfq = db.query(BuyerRFQ).filter(BuyerRFQ.id == rfq_id).first()
    if rfq is None:
        raise HTTPException(status_code=404, detail="RFQ not found")
    if rfq.status != "open":
        raise HTTPException(status_code=409, detail="RFQ is not open for quotations")
    if not rfq.target_fob_usd or rfq.target_fob_usd <= 0:
        raise HTTPException(status_code=409, detail="Buyer request needs a valid target price")

    target_price = rfq.target_fob_usd
    spread_pct = round(((req.proposed_fob_usd - target_price) / target_price) * 100.0, 1)

    # Persist the counter-offer so the exporter can review every submitted bid.
    bid = BuyerInteraction(
        user_id=current_user.id,
        trade_deal_id=None,
        global_buyer_id=None,
        interaction_type="rfq_counter_bid",
        status="draft",
        notes=req.factory_notes_bn or "RFQ quotation draft saved.",
        details_json={
            "rfq_id": rfq_id,
            "buyer_company": rfq.buyer.factory_name if rfq.buyer else "",
            "proposed_fob_usd": req.proposed_fob_usd,
            "committed_units": req.committed_units,
            "lead_time_days": req.lead_time_days,
            "price_spread_vs_target_pct": spread_pct,
        },
    )
    db.add(bid)
    db.commit()
    db.refresh(bid)

    return {
        "id": bid.id,
        "status": "saved",
        "delivery": "not_sent",
        "rfq_id": rfq_id,
        "bidder_id": current_user.id,
        "bidder_factory": current_user.factory_name or "Verified Production Unit",
        "proposed_fob_usd": req.proposed_fob_usd,
        "committed_units": req.committed_units,
        "lead_time_days": req.lead_time_days,
        "price_spread_vs_target_pct": spread_pct,
        "message_bn": "আপনার কোটেশনের খসড়া সংরক্ষিত হয়েছে। এটি বায়ারের কাছে পাঠানো হয়নি।",
        "message_en": "Your quotation draft was saved. It has not been sent to the buyer.",
    }


@router.get("/my-bids")
def list_my_bids(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("factory_owner", "admin")),
):
    """List the signed-in factory's own saved and submitted RFQ quotations."""
    rows = (
        db.query(BuyerInteraction).options(joinedload(BuyerInteraction.user))
        .filter(BuyerInteraction.user_id == current_user.id, BuyerInteraction.interaction_type == "rfq_counter_bid")
        .order_by(BuyerInteraction.created_at.desc())
        .limit(100)
        .all()
    )
    return {"items": [
        {"id": row.id, "status": row.status, "notes": row.notes,
         "details": row.details_json or {}, "created_at": row.created_at.isoformat()}
        for row in rows
    ]}


@router.post("/bids/{bid_id}/submit")
def submit_saved_bid(
    bid_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("factory_owner", "admin")),
):
    """Share an existing draft with the buyer account inside ExportPilot."""
    bid = db.query(BuyerInteraction).filter(
        BuyerInteraction.id == bid_id,
        BuyerInteraction.user_id == current_user.id,
        BuyerInteraction.interaction_type == "rfq_counter_bid",
    ).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Quotation draft not found")
    rfq_id = (bid.details_json or {}).get("rfq_id")
    rfq = db.query(BuyerRFQ).filter(BuyerRFQ.id == rfq_id).first()
    if not rfq or rfq.status != "open":
        raise HTTPException(status_code=409, detail="Buyer request is no longer open")
    if bid.status not in {"draft", "submitted"}:
        raise HTTPException(status_code=409, detail="Quotation cannot be submitted")
    bid.status = "submitted"
    db.commit()
    return {"id": bid.id, "status": "submitted", "delivery": "in_app"}


@router.get("/{rfq_id}/bids")
def list_received_bids(
    rfq_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("verified_buyer", "admin")),
):
    """Return submitted quotations for the owner of the buyer request."""
    rfq = db.query(BuyerRFQ).filter(BuyerRFQ.id == rfq_id).first()
    if not rfq or (current_user.role != "admin" and rfq.buyer_id != current_user.id):
        raise HTTPException(status_code=404, detail="Buyer request not found")
    rows = (
        db.query(BuyerInteraction)
        .filter(
            BuyerInteraction.interaction_type == "rfq_counter_bid",
            BuyerInteraction.status == "submitted",
            BuyerInteraction.details_json["rfq_id"].as_string() == rfq_id,
        )
        .order_by(BuyerInteraction.created_at.desc())
        .limit(100)
        .all()
    )
    return {"rfq_id": rfq_id, "items": [
        {"id": row.id, "factory_name": row.user.factory_name if row.user else None,
         "notes": row.notes, "details": row.details_json or {},
         "created_at": row.created_at.isoformat()}
        for row in rows
    ]}

@router.get("/capacity")
def get_factory_capacity(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("factory_owner", "admin")),
):
    """Retrieve factory monthly production bandwidth and line availability."""
    cap = db.query(FactoryCapacity).filter(FactoryCapacity.factory_owner_id == current_user.id).first()
    if not cap:
        raise HTTPException(status_code=404, detail="Factory capacity has not been configured")

    utilization_pct = round((cap.allocated_units / cap.monthly_capacity_units) * 100.0, 1)

    return {
        "monthly_capacity_units": cap.monthly_capacity_units,
        "allocated_units": cap.allocated_units,
        "available_units": cap.available_units,
        "utilization_pct": utilization_pct,
        "production_line_count": cap.production_line_count,
        "next_available_slot": cap.next_available_slot,
    }


@router.put("/capacity")
def update_factory_capacity(
    req: UpdateCapacityRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("factory_owner", "admin")),
):
    """Update factory production lines and available units."""
    if req.allocated_units > req.monthly_capacity_units:
        raise HTTPException(status_code=422, detail="Allocated units cannot exceed monthly capacity")

    cap = db.query(FactoryCapacity).filter(FactoryCapacity.factory_owner_id == current_user.id).first()
    if not cap:
        cap = FactoryCapacity(factory_owner_id=current_user.id)
        db.add(cap)

    avail = max(0, req.monthly_capacity_units - req.allocated_units)
    cap.monthly_capacity_units = req.monthly_capacity_units
    cap.allocated_units = req.allocated_units
    cap.available_units = avail
    cap.production_line_count = req.production_line_count
    cap.next_available_slot = req.next_available_slot.isoformat()

    db.commit()
    db.refresh(cap)

    return {
        "status": "success",
        "monthly_capacity_units": cap.monthly_capacity_units,
        "allocated_units": cap.allocated_units,
        "available_units": cap.available_units,
        "utilization_pct": round((cap.allocated_units / cap.monthly_capacity_units) * 100.0, 1),
        "production_line_count": cap.production_line_count,
        "next_available_slot": cap.next_available_slot,
    }
