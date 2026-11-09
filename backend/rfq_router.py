"""
ExportPilot AI | Buyer RFQ & Factory Capacity Router
====================================================
Enables verified international buyers to post live Requests for Quotation (RFQ)
and allows Bangladeshi factory owners to match, bid, and manage line capacity.

No em dash (U+2014) and no en dash (U+2013) is used in this file.
"""

from datetime import date, datetime, timedelta, timezone
from typing import Literal, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from backend.auth import get_current_active_user, require_roles
from backend.database import get_db
from backend.models import User, BuyerInteraction, BuyerRFQ, DealAgreement, FactoryCapacity

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


class QuotationMessageRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    body: str = Field(..., min_length=1, max_length=5000)
    client_message_id: UUID | None = None


class QuotationDecisionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    decision: Literal["accepted", "declined"]


class UpdateCapacityRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    monthly_capacity_units: int = Field(..., gt=0, le=1_000_000_000)
    allocated_units: int = Field(..., ge=0, le=1_000_000_000)
    production_line_count: int = Field(default=4, ge=1, le=10000)
    next_available_slot: date = Field(..., description="YYYY-MM-DD")


class AgreementTermsRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    incoterm: str = Field(default="FOB Chattogram", min_length=2, max_length=50)
    payment_terms: Optional[str] = Field(default=None, max_length=255)
    delivery_terms: Optional[str] = Field(default=None, max_length=500)


class AgreementStageRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    stage: Literal["documents_ready", "lc_reviewed", "production_reported", "shipped_reported", "delivered_reported"]
    note: Optional[str] = Field(default=None, max_length=1000)


class AgreementLCCheckRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    lc_number: str = Field(default="LC-DRAFT-CHECK", min_length=3, max_length=50)
    issuing_bank: str = Field(default="Buyer Issuing Bank", min_length=2, max_length=150)
    lc_amount_usd: Optional[float] = Field(default=None, gt=0, le=1_000_000_000, allow_inf_nan=False)
    tolerance_pct: float = Field(default=5.0, ge=0.0, le=10.0, allow_inf_nan=False)
    latest_shipment_date: Optional[str] = Field(default=None, max_length=20)
    lc_expiry_date: Optional[str] = Field(default=None, max_length=20)
    port_of_loading: str = Field(default="Chattogram Port, Bangladesh", min_length=2, max_length=150)
    port_of_discharge: Optional[str] = Field(default=None, max_length=150)
    required_documents: Optional[list[str]] = None


AGREEMENT_STAGES = [
    "terms_draft",
    "documents_ready",
    "lc_reviewed",
    "production_reported",
    "shipped_reported",
    "delivered_reported",
]
TERMS_EDITABLE_STAGES = {"terms_draft", "documents_ready", "lc_reviewed"}


def _iso_timestamp(value: datetime) -> str:
    return value.replace(tzinfo=value.tzinfo or timezone.utc).isoformat()


def _rfq_payload(rfq: BuyerRFQ) -> dict:
    return {
        "id": rfq.id, "product_title": rfq.product_title, "status": rfq.status,
        "destination_country": rfq.destination_country, "quantity_units": rfq.quantity_units,
        "delivery_deadline": rfq.delivery_deadline,
    }


def _bid_payload(bid: BuyerInteraction, rfq: BuyerRFQ | None) -> dict:
    return {
        "id": bid.id, "status": bid.status, "notes": bid.notes,
        "details": bid.details_json or {}, "created_at": _iso_timestamp(bid.created_at),
        "factory_name": bid.user.factory_name if bid.user else None,
        "buyer_company": rfq.buyer.factory_name if rfq and rfq.buyer else None,
        "rfq": _rfq_payload(rfq) if rfq else None,
    }


def _load_quotation(db: Session, bid_id: str, current_user: User) -> tuple[BuyerInteraction, BuyerRFQ]:
    """A quotation and its thread are private to the two account owners."""
    bid = db.query(BuyerInteraction).options(joinedload(BuyerInteraction.user)).filter(
        BuyerInteraction.id == bid_id,
        BuyerInteraction.interaction_type == "rfq_counter_bid",
    ).first()
    rfq = db.query(BuyerRFQ).options(joinedload(BuyerRFQ.buyer)).filter(
        BuyerRFQ.id == (bid.details_json or {}).get("rfq_id")
    ).first() if bid else None
    if not bid or not rfq:
        raise HTTPException(status_code=404, detail="Quotation not found")
    participant = current_user.id in {bid.user_id, rfq.buyer_id}
    # Administrators may inspect records, but may not act as either participant.
    if not participant and current_user.role != "admin":
        raise HTTPException(status_code=404, detail="Quotation not found")
    private_draft = bid.status == "draft" or (
        bid.status == "withdrawn" and not (bid.details_json or {}).get("was_submitted", False)
    )
    if private_draft and current_user.id != bid.user_id:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return bid, rfq


def _conversation_permissions(bid: BuyerInteraction, rfq: BuyerRFQ, user: User) -> dict:
    is_factory = user.id == bid.user_id and user.role in {"factory_owner", "admin"}
    is_buyer = user.id == rfq.buyer_id and user.role in {"verified_buyer", "admin"}
    active_thread = (bid.status == "submitted" and rfq.status == "open") or (
        bid.status == "accepted" and rfq.status == "awarded"
    )
    return {
        "can_message": (is_factory or is_buyer) and active_thread,
        "can_decide": is_buyer and bid.status == "submitted" and rfq.status == "open",
        "can_withdraw": is_factory and bid.status in {"draft", "submitted"},
    }


def _message_payload(message: BuyerInteraction, user: User) -> dict:
    details = message.details_json or {}
    return {
        "id": message.id, "sender_name": details.get("sender_name", "Account holder"),
        "sender_role": details.get("sender_role", "account_holder"),
        "is_mine": message.user_id == user.id, "body": message.notes or "",
        "created_at": _iso_timestamp(message.created_at),
    }


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
    if rfq.buyer_id == current_user.id:
        raise HTTPException(status_code=409, detail="You cannot quote on your own buyer request")
    if req.committed_units > rfq.quantity_units:
        raise HTTPException(status_code=422, detail="Quoted units cannot exceed the requested quantity")
    if not rfq.target_fob_usd or rfq.target_fob_usd <= 0:
        raise HTTPException(status_code=409, detail="Buyer request needs a valid target price")

    target_price = rfq.target_fob_usd
    spread_pct = round(((req.proposed_fob_usd - target_price) / target_price) * 100.0, 1)

    parent_open = db.query(BuyerRFQ).filter(BuyerRFQ.id == rfq.id, BuyerRFQ.status == "open").update(
        {BuyerRFQ.status: "open"}, synchronize_session=False,
    )
    if not parent_open:
        db.rollback()
        raise HTTPException(status_code=409, detail="Buyer request is no longer open")

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
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("factory_owner", "admin")),
):
    """List the signed-in factory's own saved and submitted RFQ quotations."""
    query = (
        db.query(BuyerInteraction).options(joinedload(BuyerInteraction.user))
        .filter(BuyerInteraction.user_id == current_user.id, BuyerInteraction.interaction_type == "rfq_counter_bid")
    )
    total = query.count()
    rows = query.order_by(BuyerInteraction.created_at.desc(), BuyerInteraction.id).offset(offset).limit(limit).all()
    rfq_ids = {(row.details_json or {}).get("rfq_id") for row in rows}
    rfqs = {row.id: row for row in db.query(BuyerRFQ).options(joinedload(BuyerRFQ.buyer)).filter(BuyerRFQ.id.in_(rfq_ids)).all()}
    return {"items": [_bid_payload(row, rfqs.get((row.details_json or {}).get("rfq_id"))) for row in rows],
            "total": total, "offset": offset, "limit": limit}


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
    if bid.status == "submitted":
        return {"id": bid.id, "status": "submitted", "delivery": "in_app"}
    if not rfq or rfq.status != "open":
        raise HTTPException(status_code=409, detail="Buyer request is no longer open")
    if bid.status != "draft":
        raise HTTPException(status_code=409, detail="Quotation cannot be submitted")
    # Lock the parent state before the quotation so a concurrent buyer selection
    # cannot admit a late submission after the request has been awarded.
    parent_open = db.query(BuyerRFQ).filter(BuyerRFQ.id == rfq.id, BuyerRFQ.status == "open").update(
        {BuyerRFQ.status: "open"}, synchronize_session=False,
    )
    changed = db.query(BuyerInteraction).filter(BuyerInteraction.id == bid.id, BuyerInteraction.status == "draft").update(
        {BuyerInteraction.status: "submitted"}, synchronize_session=False,
    ) if parent_open else 0
    if changed != 1:
        db.rollback()
        raise HTTPException(status_code=409, detail="Quotation or buyer request changed. Refresh and try again")
    db.commit()
    return {"id": bid.id, "status": "submitted", "delivery": "in_app"}


@router.get("/{rfq_id}/bids")
def list_received_bids(
    rfq_id: str,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("verified_buyer", "admin")),
):
    """Return submitted quotations for the owner of the buyer request."""
    rfq = db.query(BuyerRFQ).filter(BuyerRFQ.id == rfq_id).first()
    if not rfq or (current_user.role != "admin" and rfq.buyer_id != current_user.id):
        raise HTTPException(status_code=404, detail="Buyer request not found")
    query = (
        db.query(BuyerInteraction).options(joinedload(BuyerInteraction.user))
        .filter(
            BuyerInteraction.interaction_type == "rfq_counter_bid",
            or_(BuyerInteraction.status.in_(["submitted", "accepted", "declined"]),
                and_(BuyerInteraction.status == "withdrawn",
                     BuyerInteraction.details_json["was_submitted"].as_boolean().is_(True))),
            BuyerInteraction.details_json["rfq_id"].as_string() == rfq_id,
        )
    )
    total = query.count()
    rows = query.order_by(BuyerInteraction.created_at.desc(), BuyerInteraction.id).offset(offset).limit(limit).all()
    return {"rfq_id": rfq_id, "items": [_bid_payload(row, rfq) for row in rows],
            "total": total, "offset": offset, "limit": limit}


@router.get("/bids/{bid_id}/conversation")
def get_quotation_conversation(
    bid_id: str,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    bid, rfq = _load_quotation(db, bid_id, current_user)
    query = db.query(BuyerInteraction).filter(
        BuyerInteraction.interaction_type == "rfq_message",
        BuyerInteraction.details_json["bid_id"].as_string() == bid_id,
    )
    total = query.count()
    messages = query.order_by(BuyerInteraction.created_at, BuyerInteraction.id).offset(offset).limit(limit).all()
    return {
        "bid": _bid_payload(bid, rfq), "messages": [_message_payload(row, current_user) for row in messages],
        "total": total, "offset": offset, "limit": limit,
        **_conversation_permissions(bid, rfq, current_user),
    }


@router.post("/bids/{bid_id}/messages", status_code=status.HTTP_201_CREATED)
def send_quotation_message(
    bid_id: str,
    req: QuotationMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    bid, rfq = _load_quotation(db, bid_id, current_user)
    message_id = str(req.client_message_id) if req.client_message_id else None

    def existing_message():
        existing = db.get(BuyerInteraction, message_id) if message_id else None
        if not existing:
            return None
        if (existing.interaction_type != "rfq_message" or existing.user_id != current_user.id
                or (existing.details_json or {}).get("bid_id") != bid_id or existing.notes != req.body):
            raise HTTPException(status_code=409, detail="Message reference was already used. Start a new message")
        return {"message": _message_payload(existing, current_user), "status": "recorded", "delivery": "in_app"}

    # A retry after an uncertain network response returns the original message,
    # even if the quotation has since been closed or withdrawn.
    replay = existing_message()
    if replay:
        return replay
    if not _conversation_permissions(bid, rfq, current_user)["can_message"]:
        raise HTTPException(status_code=409, detail="This quotation is not open for messages")
    # Conditional no-op writes serialize against decision and withdrawal actions
    # on SQLite, where SELECT FOR UPDATE is not available.
    parent_unchanged = db.query(BuyerRFQ).filter(BuyerRFQ.id == rfq.id, BuyerRFQ.status == rfq.status).update(
        {BuyerRFQ.status: rfq.status}, synchronize_session=False,
    )
    bid_unchanged = db.query(BuyerInteraction).filter(BuyerInteraction.id == bid.id, BuyerInteraction.status == bid.status).update(
        {BuyerInteraction.status: bid.status}, synchronize_session=False,
    ) if parent_unchanged else 0
    if not bid_unchanged:
        db.rollback()
        raise HTTPException(status_code=409, detail="Quotation changed. Refresh before sending")
    message = BuyerInteraction(
        user_id=current_user.id, interaction_type="rfq_message", status="recorded", notes=req.body,
        details_json={"rfq_id": rfq.id, "bid_id": bid.id,
                      "sender_name": current_user.factory_name or current_user.full_name_bn,
                      "sender_role": current_user.role},
    )
    if message_id:
        message.id = message_id
    db.add(message)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        replay = existing_message()
        if replay:
            return replay
        raise
    db.refresh(message)
    return {"message": _message_payload(message, current_user), "status": "recorded", "delivery": "in_app"}


@router.post("/bids/{bid_id}/decision")
def decide_quotation(
    bid_id: str,
    req: QuotationDecisionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    bid, rfq = _load_quotation(db, bid_id, current_user)
    if current_user.id != rfq.buyer_id or current_user.role not in {"verified_buyer", "admin"}:
        raise HTTPException(status_code=403, detail="Only the request owner can decide a quotation")
    if bid.status == req.decision:
        return {"id": bid.id, "status": bid.status, "rfq_status": rfq.status}
    if not _conversation_permissions(bid, rfq, current_user)["can_decide"]:
        raise HTTPException(status_code=409, detail="Quotation or buyer request is no longer open for a decision")
    next_rfq_status = "awarded" if req.decision == "accepted" else "open"
    parent_open = db.query(BuyerRFQ).filter(BuyerRFQ.id == rfq.id, BuyerRFQ.status == "open").update(
        {BuyerRFQ.status: next_rfq_status}, synchronize_session=False,
    )
    details = {**(bid.details_json or {}), "decided_at": datetime.now(timezone.utc).isoformat(),
               "decided_by_user_id": current_user.id}
    changed = db.query(BuyerInteraction).filter(BuyerInteraction.id == bid.id, BuyerInteraction.status == "submitted").update(
        {BuyerInteraction.status: req.decision, BuyerInteraction.details_json: details}, synchronize_session=False,
    ) if parent_open else 0
    if changed != 1:
        db.rollback()
        # An identical retry after a simultaneous successful decision is safe.
        db.refresh(bid)
        db.refresh(rfq)
        if bid.status == req.decision:
            return {"id": bid.id, "status": bid.status, "rfq_status": rfq.status}
        raise HTTPException(status_code=409, detail="Another decision changed this quotation or request. Refresh and try again")
    if req.decision == "accepted" and db.query(DealAgreement).filter(DealAgreement.bid_id == bid.id).first() is None:
        db.add(DealAgreement(
            bid_id=bid.id, rfq_id=rfq.id,
            factory_owner_id=bid.user_id, buyer_id=rfq.buyer_id,
            product_title=rfq.product_title, hs_code=rfq.hs_code,
            quantity_units=int((bid.details_json or {}).get("committed_units") or rfq.quantity_units),
            unit_price_usd=float((bid.details_json or {}).get("proposed_fob_usd") or rfq.target_fob_usd),
            lead_time_days=int((bid.details_json or {}).get("lead_time_days") or 30),
            destination_country=rfq.destination_country,
            delivery_deadline=rfq.delivery_deadline,
            stage_history_json=[{"stage": "terms_draft", "at": datetime.now(timezone.utc).isoformat(),
                                 "by_user_id": current_user.id, "by_role": current_user.role,
                                 "note": "Quotation selected by buyer"}],
        ))
    db.commit()
    return {"id": bid.id, "status": req.decision, "rfq_status": next_rfq_status,
            "agreement_created": req.decision == "accepted"}


@router.post("/bids/{bid_id}/withdraw")
def withdraw_quotation(
    bid_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    bid, rfq = _load_quotation(db, bid_id, current_user)
    if current_user.id != bid.user_id or current_user.role not in {"factory_owner", "admin"}:
        raise HTTPException(status_code=403, detail="Only the quotation owner can withdraw it")
    if bid.status == "withdrawn":
        return {"id": bid.id, "status": "withdrawn"}
    if not _conversation_permissions(bid, rfq, current_user)["can_withdraw"]:
        raise HTTPException(status_code=409, detail="This quotation can no longer be withdrawn")
    details = {**(bid.details_json or {}), "withdrawn_at": datetime.now(timezone.utc).isoformat(),
               "withdrawn_by_user_id": current_user.id,
               "was_submitted": bid.status == "submitted"}
    changed = db.query(BuyerInteraction).filter(BuyerInteraction.id == bid.id, BuyerInteraction.status.in_(["draft", "submitted"])).update(
        {BuyerInteraction.status: "withdrawn", BuyerInteraction.details_json: details}, synchronize_session=False,
    )
    if changed != 1:
        db.rollback()
        raise HTTPException(status_code=409, detail="Quotation changed. Refresh and try again")
    db.commit()
    return {"id": bid.id, "status": "withdrawn"}

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


# ---------------------------------------------------------------------------
# Deal agreements: agreed terms snapshot, draft terms, and self-reported stages
# ---------------------------------------------------------------------------

def _agreement_payload(agreement: DealAgreement, user: User) -> dict:
    participants = {agreement.factory_owner_id, agreement.buyer_id}
    is_participant = user.id in participants or user.role == "admin"
    stage_idx = AGREEMENT_STAGES.index(agreement.stage) if agreement.stage in AGREEMENT_STAGES else 0
    history = agreement.stage_history_json or []
    latest_lc_check = None
    for entry in reversed(history):
        if isinstance(entry, dict) and entry.get("lc_check"):
            latest_lc_check = entry["lc_check"]
            break
    return {
        "id": agreement.id,
        "bid_id": agreement.bid_id,
        "rfq_id": agreement.rfq_id,
        "product_title": agreement.product_title,
        "hs_code": agreement.hs_code,
        "quantity_units": agreement.quantity_units,
        "unit_price_usd": agreement.unit_price_usd,
        "total_value_usd": round(agreement.quantity_units * agreement.unit_price_usd, 2),
        "lead_time_days": agreement.lead_time_days,
        "destination_country": agreement.destination_country,
        "delivery_deadline": agreement.delivery_deadline,
        "incoterm": agreement.incoterm,
        "payment_terms": agreement.payment_terms,
        "delivery_terms": agreement.delivery_terms,
        "stage": agreement.stage,
        "stage_index": stage_idx,
        "stages": AGREEMENT_STAGES,
        "can_edit_terms": is_participant and agreement.stage in TERMS_EDITABLE_STAGES,
        "can_advance": is_participant and stage_idx < len(AGREEMENT_STAGES) - 1,
        "stage_history": history,
        "latest_lc_check": latest_lc_check,
        "factory_name": agreement.factory_owner.factory_name if agreement.factory_owner else None,
        "buyer_company": agreement.buyer.factory_name if agreement.buyer else None,
        "is_mine_as_factory": user.id == agreement.factory_owner_id,
        "is_mine_as_buyer": user.id == agreement.buyer_id,
        "created_at": _iso_timestamp(agreement.created_at),
        "updated_at": _iso_timestamp(agreement.updated_at),
    }


def _load_agreement(db: Session, agreement_id: str, user: User) -> DealAgreement:
    agreement = db.query(DealAgreement).options(
        joinedload(DealAgreement.factory_owner), joinedload(DealAgreement.buyer)
    ).filter(DealAgreement.id == agreement_id).first()
    if not agreement:
        raise HTTPException(status_code=404, detail="Agreement not found")
    if user.id not in {agreement.factory_owner_id, agreement.buyer_id} and user.role != "admin":
        raise HTTPException(status_code=404, detail="Agreement not found")
    return agreement


@router.get("/agreements")
def list_agreements(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List deal agreements where the signed-in account is buyer or factory."""
    query = db.query(DealAgreement).options(
        joinedload(DealAgreement.factory_owner), joinedload(DealAgreement.buyer)
    ).filter(or_(DealAgreement.factory_owner_id == current_user.id,
                 DealAgreement.buyer_id == current_user.id))
    total = query.count()
    rows = query.order_by(DealAgreement.created_at.desc(), DealAgreement.id).offset(offset).limit(limit).all()
    return {"items": [_agreement_payload(row, current_user) for row in rows],
            "total": total, "offset": offset, "limit": limit}


@router.get("/agreements/{agreement_id}")
def get_agreement(
    agreement_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    agreement = _load_agreement(db, agreement_id, current_user)
    return _agreement_payload(agreement, current_user)


@router.get("/bids/{bid_id}/agreement")
def get_agreement_for_bid(
    bid_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Return the agreement recorded for an accepted quotation, if any."""
    _load_quotation(db, bid_id, current_user)
    agreement = db.query(DealAgreement).options(
        joinedload(DealAgreement.factory_owner), joinedload(DealAgreement.buyer)
    ).filter(DealAgreement.bid_id == bid_id).first()
    if not agreement:
        raise HTTPException(status_code=404, detail="No agreement recorded for this quotation")
    return _agreement_payload(agreement, current_user)


@router.patch("/agreements/{agreement_id}/terms")
def update_agreement_terms(
    agreement_id: str,
    req: AgreementTermsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    agreement = _load_agreement(db, agreement_id, current_user)
    if current_user.id not in {agreement.factory_owner_id, agreement.buyer_id}:
        raise HTTPException(status_code=403, detail="Only the two account holders can edit agreed terms")
    if agreement.stage not in TERMS_EDITABLE_STAGES:
        raise HTTPException(status_code=409, detail="Terms are locked at this stage")
    agreement.incoterm = req.incoterm
    agreement.payment_terms = req.payment_terms
    agreement.delivery_terms = req.delivery_terms
    history = list(agreement.stage_history_json or [])
    history.append({"stage": agreement.stage, "at": datetime.now(timezone.utc).isoformat(),
                    "by_user_id": current_user.id, "by_role": current_user.role,
                    "note": "Draft terms updated"})
    agreement.stage_history_json = history
    db.commit()
    db.refresh(agreement)
    return _agreement_payload(agreement, current_user)


@router.post("/agreements/{agreement_id}/stage")
def advance_agreement_stage(
    agreement_id: str,
    req: AgreementStageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    agreement = _load_agreement(db, agreement_id, current_user)
    if current_user.id not in {agreement.factory_owner_id, agreement.buyer_id}:
        raise HTTPException(status_code=403, detail="Only the two account holders can update progress")
    current_idx = AGREEMENT_STAGES.index(agreement.stage) if agreement.stage in AGREEMENT_STAGES else 0
    target_idx = AGREEMENT_STAGES.index(req.stage)
    if target_idx <= current_idx:
        raise HTTPException(status_code=409, detail="Progress can only move forward")
    if target_idx != current_idx + 1:
        raise HTTPException(status_code=422, detail="Complete each step in order")
    history = list(agreement.stage_history_json or [])
    history.append({"stage": req.stage, "at": datetime.now(timezone.utc).isoformat(),
                    "by_user_id": current_user.id, "by_role": current_user.role,
                    "note": req.note or f"Marked {req.stage}"})
    agreement.stage_history_json = history
    agreement.stage = req.stage
    db.commit()
    db.refresh(agreement)
    return _agreement_payload(agreement, current_user)


@router.post("/agreements/{agreement_id}/lc-check")
def run_agreement_lc_check(
    agreement_id: str,
    req: AgreementLCCheckRequest = AgreementLCCheckRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Run a UCP 600 screening check against the agreed quotation terms and record the summary."""
    from backend.lc_audit import LCAuditRequest, audit_letter_of_credit

    agreement = _load_agreement(db, agreement_id, current_user)
    if current_user.id not in {agreement.factory_owner_id, agreement.buyer_id}:
        raise HTTPException(status_code=403, detail="Only the two account holders can run an LC check on this agreement")

    agreed_total = round(agreement.quantity_units * agreement.unit_price_usd, 2)
    ship_date_str = req.latest_shipment_date or agreement.delivery_deadline
    if req.lc_expiry_date:
        exp_date_str = req.lc_expiry_date
    else:
        try:
            parsed_ship = datetime.strptime(ship_date_str.strip(), "%Y-%m-%d").date()
            exp_date_str = (parsed_ship + timedelta(days=21)).isoformat()
        except ValueError:
            exp_date_str = ship_date_str

    default_docs = [
        "Signed Commercial Invoice (3 originals)",
        "Clean On Board Bill of Lading",
        "Packing List",
        "Certificate of Origin (EPB / DCCI)",
        "Scope 2 Carbon & Inspection Statement",
    ]
    incoterm_code = (agreement.incoterm or "FOB").split()[0][:10].upper()

    audit_req = LCAuditRequest(
        lc_number=req.lc_number,
        issuing_bank=req.issuing_bank,
        issuing_country=agreement.destination_country[:50],
        lc_amount_usd=req.lc_amount_usd if req.lc_amount_usd is not None else agreed_total,
        tolerance_pct=req.tolerance_pct,
        latest_shipment_date=ship_date_str,
        lc_expiry_date=exp_date_str,
        port_of_loading=req.port_of_loading,
        port_of_discharge=req.port_of_discharge or agreement.destination_country,
        incoterm=incoterm_code or "FOB",
        product_description=f"{agreement.product_title} (HS {agreement.hs_code})",
        pi_reference_amount_usd=agreed_total,
        pi_reference_quantity=agreement.quantity_units,
        pi_reference_unit_price=agreement.unit_price_usd,
        required_documents=req.required_documents if req.required_documents is not None else default_docs,
    )
    result = audit_letter_of_credit(audit_req)
    now_iso = datetime.now(timezone.utc).isoformat()
    lc_summary = {
        "lc_number": result.lc_number,
        "health_score": result.overall_health_score,
        "risk_level": result.risk_level,
        "total_discrepancies": result.total_discrepancies,
        "verdict_en": result.verdict_en,
        "verdict_bn": result.verdict_bn,
        "checked_at": now_iso,
    }
    history = list(agreement.stage_history_json or [])
    history.append({
        "stage": agreement.stage,
        "at": now_iso,
        "by_user_id": current_user.id,
        "by_role": current_user.role,
        "note": f"UCP 600 LC screening: {result.risk_level} risk ({result.total_discrepancies} findings, score {result.overall_health_score}/100)",
        "lc_check": lc_summary,
    })
    agreement.stage_history_json = history
    db.commit()
    db.refresh(agreement)
    return {
        "agreement": _agreement_payload(agreement, current_user),
        "lc_audit": result.model_dump(),
    }


@router.get("/agreements/{agreement_id}/proforma.pdf")
def download_agreement_proforma(
    agreement_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    from fastapi.responses import Response
    from backend.pdf_generator import generate_agreement_proforma_pdf
    agreement = _load_agreement(db, agreement_id, current_user)
    pdf_bytes = generate_agreement_proforma_pdf(_agreement_payload(agreement, current_user))
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=ExportPilot_Agreed_Terms_{agreement.id[:8]}.pdf"},
    )


@router.get("/agreements/{agreement_id}/commercial-invoice.pdf")
def download_agreement_commercial_invoice(
    agreement_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    from fastapi.responses import Response
    from backend.pdf_generator import generate_agreement_commercial_invoice_pdf
    agreement = _load_agreement(db, agreement_id, current_user)
    pdf_bytes = generate_agreement_commercial_invoice_pdf(_agreement_payload(agreement, current_user))
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=ExportPilot_Commercial_Invoice_Draft_{agreement.id[:8]}.pdf"},
    )


@router.get("/agreements/{agreement_id}/packing-list.pdf")
def download_agreement_packing_list(
    agreement_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    from fastapi.responses import Response
    from backend.pdf_generator import generate_agreement_packing_list_pdf
    agreement = _load_agreement(db, agreement_id, current_user)
    pdf_bytes = generate_agreement_packing_list_pdf(_agreement_payload(agreement, current_user))
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=ExportPilot_Packing_List_Draft_{agreement.id[:8]}.pdf"},
    )
