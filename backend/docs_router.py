"""
ExportPilot AI | Live Docs Router
=================================
Serves the /docs module: a YC-style pitch deck, deep technical
documentation, a live system snapshot, and admin-controlled
visibility scheduling.

Access model:
- GET /api/v1/docs/public is anonymous. It returns content only while the
  singleton DocSetting row allows public access (enabled flag plus an
  optional publish/unpublish window in UTC).
- All /admin endpoints require the admin role.

No em dash (U+2014) and no en dash (U+2013) is used in this file.
"""

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.auth import require_roles
from backend.database import get_db
from backend.models import (
    BuyerRFQ,
    DealAgreement,
    DocMember,
    DocSection,
    DocSetting,
    FactoryProfile,
    Product,
    User,
)

router = APIRouter(prefix="/docs", tags=["Live Documentation"])


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _get_setting(db: Session) -> DocSetting:
    setting = db.get(DocSetting, 1)
    if setting is None:
        setting = DocSetting(id=1, enabled=True, publish_at=None, unpublish_at=None)
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting


def _is_publicly_visible(setting: DocSetting, now: Optional[datetime] = None) -> bool:
    now = now or _utcnow()
    if not setting.enabled:
        return False
    if setting.publish_at is not None:
        pub = setting.publish_at if setting.publish_at.tzinfo else setting.publish_at.replace(tzinfo=timezone.utc)
        if now < pub:
            return False
    if setting.unpublish_at is not None:
        unpub = setting.unpublish_at if setting.unpublish_at.tzinfo else setting.unpublish_at.replace(tzinfo=timezone.utc)
        if now > unpub:
            return False
    return True


def _section_dict(s: DocSection) -> dict:
    return {
        "key": s.key,
        "group": s.group,
        "title_bn": s.title_bn,
        "title_en": s.title_en,
        "body_md": s.body_md,
        "sort_order": s.sort_order,
        "status": s.status,
        "updated_at": s.updated_at.isoformat() if s.updated_at else None,
    }


def _member_dict(m: DocMember) -> dict:
    return {
        "id": m.id,
        "name": m.name,
        "name_bn": m.name_bn,
        "role_en": m.role_en,
        "role_bn": m.role_bn,
        "email": m.email,
        "photo_url": m.photo_url,
        "sort_order": m.sort_order,
    }


def _live_stats(db: Session) -> dict:
    return {
        "accounts": db.query(func.count(User.id)).scalar() or 0,
        "factory_profiles": db.query(func.count(FactoryProfile.id)).scalar() or 0,
        "products": db.query(func.count(Product.id)).scalar() or 0,
        "open_requests": db.query(func.count(BuyerRFQ.id)).filter(BuyerRFQ.status == "open").scalar() or 0,
        "agreements": db.query(func.count(DealAgreement.id)).scalar() or 0,
    }


SEED_SECTIONS = [
    # ---------------- Pitch deck (YC style) ----------------
    ("deck_problem", "deck", "সমস্যা", "Problem", 10, """Bangladeshi manufacturers produce world-class goods but lose margin and time to middlemen, unclear documentation, and opaque pricing before a shipment ever leaves the port.

- Factories struggle to price against real landed-cost comparisons.
- Export paperwork is prepared manually, document by document.
- Small and mid-size units cannot afford trade consultants.
- Carbon exposure rules such as the EU CBAM add a new compliance burden that most factories cannot model alone.

The result: capable producers stay stuck at the factory gate while intermediaries capture the margin."""),
    ("deck_solution", "deck", "সমাধান", "Solution", 20, """ExportPilot AI is a bilingual trade workspace that walks a factory from product details to a reviewable export package.

- Product catalog with HS classification support and illustrative market references.
- Buyer request board where factories quote against real demand.
- Deal agreements that freeze agreed terms and track self-reported milestones.
- Draft documents: quotations, proforma invoices, and export paperwork.
- CBAM-style carbon estimation and compliance scoring.

Everything runs in Bangla and English, designed for factory owners on phones and laptops."""),
    ("deck_why_now", "deck", "কেন এখন", "Why Now", 30, """Three forces make this the right moment:

- Bangladesh's export basket is diversifying beyond garments into jute, leather, ceramics, and agro-processing.
- The EU CBAM is phasing in, so carbon-aware manufacturing is becoming a market access requirement, not a nice-to-have.
- Buyers increasingly want direct factory relationships, and digital trade tooling has become cheap enough to run on factory-grade devices and bandwidth."""),
    ("deck_product", "deck", "পণ্য ও কাজের ধারা", "Product & Workflow", 40, """The core journey in the product today:

1. A factory owner registers, completes a factory profile, and adds products with photos.
2. The system suggests HS codes, computes illustrative FOB references, and estimates carbon exposure.
3. The factory browses open buyer requests, sends a quotation, and discusses terms in a private conversation.
4. When the buyer selects a proposal, an agreement snapshot is created with agreed price, quantity, lead time, and destination.
5. Both parties edit draft terms, advance self-reported milestones, and download a proforma invoice PDF.

Every stage is labelled honestly: quotes and milestones are self-reported workflow state, not verified payments or shipments."""),
    ("deck_market", "deck", "বাজারের সুযোগ", "Market Opportunity", 50, """The addressable base is Bangladesh's non-garment export manufacturing base plus the garment sector's compliance upgrade cycle.

- Sectors covered today: jute and jute products, garments, leather, ceramics, and agro-processing.
- Buyers served: verified international buyers in the EU, UK, US, and Japan corridors.
- The wedge is narrow on purpose: one country, five sectors, one complete workflow. Expansion follows proven unit economics, not a horizontal platform bet."""),
    ("deck_model", "deck", "ব্যবসার মডেল", "Business Model", 60, """Planned monetization, in order of introduction:

- Subscription tiers for factory accounts with higher catalog, document, and analytics limits.
- Per-document and per-analysis fees for premium exports (certified PDFs, deep market reports).
- Buyer-side premium matching and verified supplier badges.
- Compliance add-ons as CBAM reporting matures into a recurring need.

No payment provider is live yet; the current build proves the workflow before monetization."""),
    ("deck_traction", "deck", "এখন পর্যন্ত যা আছে", "Traction", 70, """Live system snapshot, counted directly from the production database:

- Registered accounts across factory, buyer, auditor, and admin roles.
- Factory profiles with product catalogs and imagery.
- Illustrative products across the five target sectors.
- Open buyer requests and recorded quotation conversations.
- Deal agreements with agreed terms and milestone history.

These are competition and demonstration records. They are not claims of paying customers or completed exports."""),
    ("deck_competition", "deck", "প্রতিযোগিতা", "Competition", 80, """Alternatives a factory might use today:

- Generic B2B marketplaces: broad reach, but no Bangladesh-specific cost modeling, no Bangla-first UX, no document workflow.
- Trade consultants and agents: effective but expensive and opaque, which is the margin leak we remove.
- Spreadsheets and manual paperwork: free but error-prone and slow.
- Enterprise trade suites: built for multinationals, not for a Savar jute unit on a mid-range laptop.

ExportPilot's edge is the combination: local sector knowledge, honest illustrative labeling, and an end-to-end draft workflow."""),
    ("deck_advantage", "deck", "অনন্য সুবিধা", "Unique Advantage", 90, """- Bilingual-first design: the product is written in Bangla, not translated into it.
- Sovereign data posture: sensitive identity and contact patterns are masked before external model calls.
- Honest labeling: illustrative data is labelled illustrative everywhere; self-reported milestones are never dressed up as verified outcomes.
- Full-stack ownership: matching, documents, carbon estimation, and compliance scoring live in one system rather than stitched-together tools.
- Mobile-first for factories: the heaviest workflows fit a phone screen with a bottom tab bar."""),
    ("deck_gtm", "deck", "বাজারে যাওয়ার পথ", "Go-To-Market", 100, """- Start inside existing factory clusters: Savar, Gazipur, Bogura, and Chattogram corridors where sector density is highest.
- Partner with export promotion councils and industry associations for onboarding workshops.
- Use the free workspace as the acquisition loop; charge for document volume, premium intelligence, and verified badges.
- Publish sector guides (already live at /sectors/*) as the SEO and trust surface for inbound factory owners."""),
    ("deck_team", "deck", "দল", "Team", 110, "Members are listed from the live documentation database below. Contact details are shared for direct inquiries."""),
    ("deck_vision", "deck", "দৃষ্টিভঙ্গি", "Vision", 120, """A Bangladesh where any factory, regardless of size or language, can price, document, and ship an export order as confidently as a multinational procurement team.

The long-term shape: the workspace becomes the operating system for SME export manufacturing in Bangladesh, then a template for other sourcing countries."""),
    # ---------------- Technical documentation ----------------
    ("tech_overview", "tech", "পণ্যের সংক্ষিপ্ত বিবরণ", "Product Overview", 200, """ExportPilot AI is a bilingual trade workflow platform for Bangladeshi manufacturers.

- Who it serves: factory owners (mobile and laptop, Bangla-first), verified international buyers, compliance auditors, and administrators.
- What it does: product cataloging, HS classification support, illustrative market references, buyer request matching, quotation conversations, deal agreements, proforma PDF generation, carbon exposure estimation, and compliance scoring.
- What it does not do: it does not process payments, verify shipments, or guarantee customs outcomes. Milestones are self-reported and labelled as such."""),
    ("tech_features", "tech", "ফিচার ম্যাট্রিক্স", "Feature Matrix", 210, "Live feature status is rendered from the sections and endpoints on this page. Statuses below describe the current build."""),
    ("tech_architecture", "tech", "সিস্টেম আর্কিটেকচার", "Architecture", 220, """Layered structure:

- UI: React 18 + TypeScript + Vite SPA, Tailwind CSS, framer-motion, lucide icons.
- API: FastAPI routers under /api/v1 with JWT cookie auth and bearer fallback.
- Services: auth, RFQ matching, quotations, agreements, document generation (ReportLab/PyMuPDF), carbon and compliance scoring, voice guidance, MCP agent servers.
- Data: SQLite on durable Azure storage in production (WAL locally), SQLAlchemy ORM, additive schema only.

The diagram is intentionally simple: every request flows UI -> API -> service logic -> database, with auth and role checks at the API boundary."""),
    ("tech_dataflow", "tech", "ডেটা প্রবাহ", "Data Flow", 230, """Request lifecycle:

1. Input: user action in the SPA (form, button, chat).
2. Processing: FastAPI endpoint validates input with Pydantic, checks role and ownership.
3. AI layer (optional): planning and advisor calls go through masking before any external model call.
4. Output: JSON response or generated PDF (ReportLab).
5. Feedback: UI updates state, shows toasts or inline errors; audit log records sensitive actions."""),
    ("tech_stack", "tech", "প্রযুক্তি স্ট্যাক", "Technology Stack", 240, """- Frontend: React 18, TypeScript, Vite 5, React Router 6, Tailwind CSS, framer-motion, lucide-react.
- Backend: Python 3, FastAPI, SQLAlchemy, Pydantic v2, PyMuPDF, pdfplumber, ReportLab.
- Data: SQLite (WAL locally, DELETE journal on Azure mounted storage).
- Auth: HTTP-only JWT cookie plus bearer tokens, persistent session revocation.
- AI: Azure OpenAI integration with PII masking; FastMCP agent servers; offline parsers.
- Infra: Azure App Service, ZIP deploy via deploy.ps1, GitHub single-commit mirror."""),
    ("tech_api", "tech", "API ও প্রমাণীকরণ", "API & Authentication", 250, """- Auth model: JWT in an HTTP-only cookie; bearer token accepted for API clients. Sessions can be revoked server-side; logout invalidates the token.
- Browser mutations require a trusted origin header.
- Key routers: /api/v1/auth, /api/v1/rfq (requests, quotations, conversations, agreements, proforma PDF), /api/v1/factory (profiles, products, capacity), /api/v1/audit, /api/v1/intelligence, /api/v1/docs (this module), plus MCP and voice routers.
- Role enforcement: factory_owner, verified_buyer, compliance_auditor, admin. Ownership checks scope RFQs, products, and conversations to the right accounts."""),
    ("tech_data", "tech", "ডেটা স্তর", "Data Layer", 260, """- Sources: user-entered factory profiles, products, RFQs, quotations, agreements, plus seeded illustrative catalog records.
- Storage: relational tables via SQLAlchemy; JSON columns for requirements, stage history, and settings payloads.
- Privacy: recognized identity and contact patterns are masked before external model calls; PII never appears in public feeds.
- Integrity: additive migrations only; production snapshots are verified before and after releases."""),
    ("tech_ai", "tech", "এআই স্তর", "AI Layer", 270, """- Planning tools: HS suggestion, pricing scenarios, carbon estimation, document drafting. All outputs are labelled estimates or drafts.
- Advisor and copilot features call external models only after identifier masking.
- RAG-style retrieval uses the local document corpus and hybrid parsers for uploaded files.
- Explainability: every AI-assisted result shows its assumptions; nothing is presented as verified fact."""),
    ("tech_roadmap", "tech", "রোডম্যাপ", "Roadmap", 280, """- Short term: richer agreement activity feed, commercial invoice and packing list drafts, LC audit evidence linked to milestones.
- Mid term: consent-based product publishing, notifications, provider integrations for payments and shipping.
- Long term: PostgreSQL migration, multi-instance deployment, load testing, full accessibility audit."""),
    ("tech_performance", "tech", "পারফরম্যান্স", "Performance & Scalability", 290, """- Frontend: route-level code splitting with vendor chunks; initial JS is roughly 37 kB gzipped; lazy overlays load after first paint.
- Media: generated assets served as optimized WebP under /assets/media.
- Backend: single-instance FastAPI on App Service; SQLite suits current scale. Horizontal scaling requires PostgreSQL and is tracked as launch work.
- Caching: immutable hashed asset filenames; API responses marked no-store where freshness matters."""),
    ("tech_security", "tech", "নিরাপত্তা", "Security", 300, """- Authentication: JWT cookie + revocation list; self-admin protection; create-only bootstrap.
- Authorization: role checks on every router; participant-scoped conversations and agreements.
- Transport: HTTPS only in production; trusted-origin checks on browser mutations.
- Data: PII masking before external calls; secrets stay in environment settings, never in the repo.
- Remaining work: broader abuse controls, rate limiting review, and a full third-party security audit."""),
    ("tech_analytics", "tech", "বিশ্লেষণ", "Analytics", 310, """- Live counters on this page come straight from production tables: accounts, factory profiles, products, open requests, agreements.
- Product telemetry is intentionally minimal; no third-party trackers are embedded.
- Admin audit endpoints expose security events and system settings for operational review."""),
    ("tech_changelog", "tech", "পরিবর্তনের ইতিহাস", "Changelog", 320, """- 2026-11-14: Live /docs module launched with pitch deck, technical docs, live stats, team showcase, and admin visibility scheduling.
- 2026-11-10: UI/UX release series: loaders, transitions, skeletons, toasts, command palette recents, skip link, empty states, scroll reveals, vendor chunk splitting.
- 2026-11-09: Deal agreements with agreed-terms snapshot, milestone tracking, proforma PDF, agreements board.
- 2026-11-09: Quotation conversations, proposal selection, session safety hardening.
- Earlier: showcase catalog, sector landing pages, voice guidance, intelligence hub."""),
]

SEED_MEMBERS = [
    {
        "name": "Kazi Sabbir",
        "name_bn": "কাজী সেবির",
        "role_en": "Co-founder",
        "role_bn": "সহ-প্রতিষ্ঠাতা",
        "email": "",
        "photo_url": "/Team%20members/Kazi%20Sabbir.jpg",
        "sort_order": 10,
    },
    {
        "name": "Md Mushfiqur Rahman",
        "name_bn": None,
        "role_en": "Co-founder",
        "role_bn": "সহ-প্রতিষ্ঠাতা",
        "email": "",
        "photo_url": "/Team%20members/Md%20Mushfiqur%20Rahman.jpg",
        "sort_order": 20,
    },
]


def _seed_if_empty(db: Session) -> None:
    if db.query(DocSection).count() == 0:
        for key, group, tbn, ten, order, body in SEED_SECTIONS:
            db.add(DocSection(key=key, group=group, title_bn=tbn, title_en=ten,
                              body_md=body, sort_order=order, status="published"))
    if db.query(DocMember).count() == 0:
        for m in SEED_MEMBERS:
            db.add(DocMember(**m))
    _get_setting(db)
    db.commit()


# ---------------- Public payload ----------------

@router.get("/public")
def get_public_docs(db: Session = Depends(get_db)):
    _seed_if_empty(db)
    setting = _get_setting(db)
    visible = _is_publicly_visible(setting)
    if not visible:
        return {"visible": False, "sections": [], "members": [], "stats": None}

    sections = (
        db.query(DocSection)
        .filter(DocSection.status == "published")
        .order_by(DocSection.sort_order.asc())
        .all()
    )
    members = (
        db.query(DocMember)
        .filter(DocMember.active == True)  # noqa: E712
        .order_by(DocMember.sort_order.asc())
        .all()
    )
    return {
        "visible": True,
        "generated_at": _utcnow().isoformat(),
        "stats": _live_stats(db),
        "sections": [_section_dict(s) for s in sections],
        "members": [_member_dict(m) for m in members],
    }


# ---------------- Admin endpoints ----------------

class DocsSettingsUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    enabled: Optional[bool] = None
    publish_at: Optional[datetime] = None
    unpublish_at: Optional[datetime] = None


class SectionUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title_bn: Optional[str] = Field(default=None, max_length=255)
    title_en: Optional[str] = Field(default=None, max_length=255)
    body_md: Optional[str] = Field(default=None, max_length=100000)
    status: Optional[str] = Field(default=None, pattern="^(draft|published)$")


class ReorderRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    keys: list[str] = Field(..., min_length=1, max_length=200)


class MemberUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: Optional[str] = Field(default=None, max_length=255)
    name_bn: Optional[str] = Field(default=None, max_length=255)
    role_en: Optional[str] = Field(default=None, max_length=255)
    role_bn: Optional[str] = Field(default=None, max_length=255)
    email: Optional[str] = Field(default=None, max_length=255)
    photo_url: Optional[str] = Field(default=None, max_length=500)
    sort_order: Optional[int] = Field(default=None, ge=0, le=100000)
    active: Optional[bool] = None


class MemberCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(..., min_length=1, max_length=255)
    name_bn: Optional[str] = Field(default=None, max_length=255)
    role_en: str = Field(..., min_length=1, max_length=255)
    role_bn: Optional[str] = Field(default=None, max_length=255)
    email: Optional[str] = Field(default=None, max_length=255)
    photo_url: Optional[str] = Field(default=None, max_length=500)
    sort_order: int = Field(default=100, ge=0, le=100000)


@router.get("/admin")
def get_admin_docs(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles("admin")),
):
    _seed_if_empty(db)
    setting = _get_setting(db)
    sections = db.query(DocSection).order_by(DocSection.sort_order.asc()).all()
    members = db.query(DocMember).order_by(DocMember.sort_order.asc()).all()
    return {
        "settings": {
            "enabled": setting.enabled,
            "publish_at": setting.publish_at.isoformat() if setting.publish_at else None,
            "unpublish_at": setting.unpublish_at.isoformat() if setting.unpublish_at else None,
            "updated_at": setting.updated_at.isoformat() if setting.updated_at else None,
        },
        "publicly_visible": _is_publicly_visible(setting),
        "stats": _live_stats(db),
        "sections": [_section_dict(s) for s in sections],
        "members": [_member_dict(m) for m in members],
    }


@router.patch("/admin/settings")
def update_docs_settings(
    req: DocsSettingsUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("admin")),
):
    setting = _get_setting(db)
    if req.enabled is not None:
        setting.enabled = req.enabled
    if "publish_at" in req.model_fields_set:
        setting.publish_at = req.publish_at
    if "unpublish_at" in req.model_fields_set:
        setting.unpublish_at = req.unpublish_at
    if setting.publish_at and setting.unpublish_at and setting.publish_at >= setting.unpublish_at:
        raise HTTPException(status_code=422, detail="publish_at must be before unpublish_at")
    setting.updated_by_user_id = admin.id
    db.commit()
    return {"ok": True, "settings": {
        "enabled": setting.enabled,
        "publish_at": setting.publish_at.isoformat() if setting.publish_at else None,
        "unpublish_at": setting.unpublish_at.isoformat() if setting.unpublish_at else None,
    }}


@router.put("/admin/sections/{key}")
def update_section(
    key: str,
    req: SectionUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles("admin")),
):
    section = db.query(DocSection).filter(DocSection.key == key).first()
    if section is None:
        raise HTTPException(status_code=404, detail="Section not found")
    if req.title_bn is not None:
        section.title_bn = req.title_bn
    if req.title_en is not None:
        section.title_en = req.title_en
    if req.body_md is not None:
        section.body_md = req.body_md
    if req.status is not None:
        section.status = req.status
    db.commit()
    return {"ok": True, "section": _section_dict(section)}


@router.post("/admin/sections/reorder")
def reorder_sections(
    req: ReorderRequest,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles("admin")),
):
    sections = {s.key: s for s in db.query(DocSection).all()}
    if any(k not in sections for k in req.keys):
        raise HTTPException(status_code=422, detail="Unknown section key")
    for index, key in enumerate(req.keys):
        sections[key].sort_order = (index + 1) * 10
    db.commit()
    return {"ok": True}


@router.put("/admin/members/{member_id}")
def update_member(
    member_id: str,
    req: MemberUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles("admin")),
):
    member = db.get(DocMember, member_id)
    if member is None:
        raise HTTPException(status_code=404, detail="Member not found")
    for field in ("name", "name_bn", "role_en", "role_bn", "email", "photo_url", "sort_order", "active"):
        value = getattr(req, field)
        if value is not None or field in req.model_fields_set:
            setattr(member, field, value)
    db.commit()
    return {"ok": True, "member": _member_dict(member)}


@router.post("/admin/members")
def create_member(
    req: MemberCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles("admin")),
):
    member = DocMember(**req.model_dump())
    db.add(member)
    db.commit()
    db.refresh(member)
    return {"ok": True, "member": _member_dict(member)}


@router.delete("/admin/members/{member_id}")
def delete_member(
    member_id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles("admin")),
):
    member = db.get(DocMember, member_id)
    if member is None:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(member)
    db.commit()
    return {"ok": True}
