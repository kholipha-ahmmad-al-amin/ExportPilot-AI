"""SQLAlchemy models for identity, factory, and trade workflow records."""

import datetime
import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from backend.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name_bn = Column(String(255), nullable=False)
    role = Column(String(50), default="factory_owner", nullable=False, index=True)
    factory_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    products = relationship("ProductScan", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("ParsedDocument", back_populates="user", cascade="all, delete-orphan")
    factory_profile = relationship(
        "FactoryProfile", back_populates="user", cascade="all, delete-orphan", uselist=False
    )
    trade_deals = relationship("TradeDeal", back_populates="user", cascade="all, delete-orphan")
    buyer_interactions = relationship(
        "BuyerInteraction", back_populates="user", cascade="all, delete-orphan"
    )


class FactoryProfile(Base):
    __tablename__ = "factory_profiles"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    legal_name = Column(String(255), nullable=False)
    country_code = Column(String(2), default="BD", nullable=False)
    address = Column(Text, nullable=True)
    registration_number = Column(String(100), nullable=True, index=True)
    exporter_registration_number = Column(String(100), nullable=True)
    verification_status = Column(String(32), default="pending", nullable=False, index=True)
    certifications_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="factory_profile")


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (Index("ix_products_owner_hs", "user_id", "hs_code"),)

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    hs_code = Column(String(20), nullable=True)
    hs_description = Column(String(500), nullable=True)
    unit_cost = Column(Float, nullable=True)
    currency = Column(String(3), default="BDT", nullable=False)
    monthly_capacity = Column(Integer, nullable=True)
    attributes_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User")
    trade_deals = relationship("TradeDeal", back_populates="product")


class ProductScan(Base):
    """Legacy product scan table kept for existing API and seeded preset data."""

    __tablename__ = "products_and_scans"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    title_bn = Column(String(255), nullable=False)
    title_en = Column(String(255), nullable=False)
    hs_code_8digit = Column(String(20), index=True, nullable=False)
    hs_chapter_name = Column(String(255), nullable=True)
    unit_cost_bdt = Column(Float, default=0.0)
    buying_house_offer_bdt = Column(Float, default=0.0)
    recommended_fob_usd = Column(Float, default=0.0)
    recommended_fob_bdt = Column(Float, default=0.0)
    monthly_capacity_units = Column(Integer, default=5000)
    middleman_margin_saved_pct = Column(Float, default=32.0)
    extra_profit_per_shipment_usd = Column(Float, default=14400.0)
    cbam_co2_kg = Column(Float, default=0.45)
    eu_benchmark_co2_kg = Column(Float, default=1.80)
    compliance_score = Column(Integer, default=90)
    image_path = Column(String(500), nullable=True)
    studio_image_path = Column(String(500), nullable=True)
    details_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="products")


class GlobalBuyer(Base):
    __tablename__ = "global_buyers"

    id = Column(String(50), primary_key=True)
    company_name = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    country_code = Column(String(10), nullable=False)
    hs_code_8digit = Column(String(20), index=True, nullable=False)
    tariff_for_bangladesh_pct = Column(Float, default=0.0)
    tariff_for_competitors_pct = Column(Float, default=9.5)
    trade_scheme = Column(String(255), nullable=False)
    typical_moq_units = Column(Integer, default=3000)
    target_fob_usd = Column(Float, default=5.0)
    annual_import_usd = Column(Float, default=1000000.0)


class TradeDeal(Base):
    __tablename__ = "trade_deals"
    __table_args__ = (Index("ix_trade_deals_owner_created", "user_id", "created_at"),)

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    preset_id = Column(String(100), nullable=True, index=True)
    # Analysis completion is not the same as a signed or shipped trade deal.
    status = Column(String(32), default="analysis_ready", nullable=False, index=True)
    input_json = Column(JSON, nullable=False)
    result_json = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    completed_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="trade_deals")
    product = relationship("Product", back_populates="trade_deals")
    compliance_audits = relationship(
        "ComplianceAudit", back_populates="trade_deal", cascade="all, delete-orphan"
    )
    buyer_interactions = relationship(
        "BuyerInteraction", back_populates="trade_deal", cascade="all, delete-orphan"
    )


class ComplianceAudit(Base):
    __tablename__ = "compliance_audits"
    __table_args__ = (Index("ix_compliance_audits_deal_type", "trade_deal_id", "audit_type"),)

    id = Column(String(36), primary_key=True, default=gen_uuid)
    trade_deal_id = Column(String(36), ForeignKey("trade_deals.id", ondelete="CASCADE"), nullable=False)
    audit_type = Column(String(64), nullable=False)
    verdict = Column(String(32), nullable=False)
    measured_value = Column(Float, nullable=True)
    reference_value = Column(Float, nullable=True)
    findings_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    trade_deal = relationship("TradeDeal", back_populates="compliance_audits")


class BuyerInteraction(Base):
    __tablename__ = "buyer_interactions"
    __table_args__ = (Index("ix_buyer_interactions_owner_created", "user_id", "created_at"),)

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    trade_deal_id = Column(String(36), ForeignKey("trade_deals.id", ondelete="SET NULL"), nullable=True)
    global_buyer_id = Column(String(50), ForeignKey("global_buyers.id", ondelete="SET NULL"), nullable=True)
    interaction_type = Column(String(32), nullable=False)
    status = Column(String(32), default="recorded", nullable=False)
    notes = Column(Text, nullable=True)
    details_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="buyer_interactions")
    trade_deal = relationship("TradeDeal", back_populates="buyer_interactions")
    global_buyer = relationship("GlobalBuyer")


class ParsedDocument(Base):
    __tablename__ = "parsed_documents"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    doc_type = Column(String(100), nullable=False)
    parser_engine = Column(String(100), default="PyMuPDF + pdfplumber")
    pii_masked_count = Column(Integer, default=0)
    metrics_json = Column(JSON, nullable=True)
    raw_text_redacted = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="documents")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    test_name = Column(String(255), nullable=False)
    category = Column(String(100), default="sovereignty")
    status = Column(String(50), default="PASS")
    score = Column(Integer, default=20)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=utc_now)


class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String(100), primary_key=True)
    value = Column(String(255), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
