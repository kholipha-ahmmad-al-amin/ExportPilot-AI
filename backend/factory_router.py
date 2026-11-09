"""Owner-scoped factory profiles and product records."""

from datetime import datetime, timezone
from urllib.parse import urlsplit

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.auth import require_roles
from backend.database import get_db
from backend.models import FactoryProfile, Product, TradeDeal, User

router = APIRouter(prefix="/factory", tags=["Factory profile and products"])
factory_access = require_roles("factory_owner", "admin")


class FactoryProfileInput(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    legal_name: str = Field(min_length=1, max_length=255)
    country_code: str = Field(default="BD", pattern=r"^[A-Z]{2}$")
    address: str | None = Field(default=None, max_length=1000)
    registration_number: str | None = Field(default=None, max_length=100)
    exporter_registration_number: str | None = Field(default=None, max_length=100)


class ProductInput(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True, allow_inf_nan=False)

    name: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=5000)
    hs_code: str | None = Field(default=None, max_length=20, pattern=r"^[0-9. -]*$")
    hs_description: str | None = Field(default=None, max_length=500)
    unit_cost: float | None = Field(default=None, ge=0, le=1_000_000_000)
    currency: str = Field(default="BDT", pattern=r"^[A-Z]{3}$")
    monthly_capacity: int | None = Field(default=None, ge=0, le=1_000_000_000)
    image_url: str | None = Field(default=None, max_length=500)

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, value: str | None) -> str | None:
        if not value:
            return None
        parsed = urlsplit(value)
        if (parsed.scheme or parsed.netloc or parsed.query or parsed.fragment
                or not value.startswith(("/assets/", "/images/"))
                or "\\" in value or ".." in value or "%" in value):
            raise ValueError("Product image must be a local asset path")
        return value


def _profile_data(profile: FactoryProfile) -> dict:
    return {
        "id": profile.id,
        "legal_name": profile.legal_name,
        "country_code": profile.country_code,
        "address": profile.address,
        "registration_number": profile.registration_number,
        "exporter_registration_number": profile.exporter_registration_number,
        "verification_status": profile.verification_status,
        "is_illustrative": (profile.certifications_json or {}).get("source") == "illustrative_showcase",
    }


def _product_data(product: Product) -> dict:
    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "hs_code": product.hs_code,
        "hs_description": product.hs_description,
        "unit_cost": product.unit_cost,
        "currency": product.currency,
        "monthly_capacity": product.monthly_capacity,
        "image_url": (product.attributes_json or {}).get("image_url"),
        "is_illustrative": bool((product.attributes_json or {}).get("is_illustrative", False)),
        "created_at": product.created_at.isoformat() if product.created_at else None,
        "updated_at": product.updated_at.isoformat() if product.updated_at else None,
    }


@router.get("/profile")
def get_profile(db: Session = Depends(get_db), user: User = Depends(factory_access)):
    profile = db.query(FactoryProfile).filter(FactoryProfile.user_id == user.id).first()
    return {"profile": _profile_data(profile) if profile else None}


@router.put("/profile")
def put_profile(data: FactoryProfileInput, db: Session = Depends(get_db), user: User = Depends(factory_access)):
    profile = db.query(FactoryProfile).filter(FactoryProfile.user_id == user.id).first()
    if profile is None:
        profile = FactoryProfile(user_id=user.id, verification_status="pending")
        db.add(profile)
    elif any(getattr(profile, key) != value for key, value in data.model_dump().items()):
        profile.verification_status = "pending"
    # Editing a sample profile makes it private until an explicit publication
    # workflow exists. Preserve non-public provenance for later review.
    certifications = dict(profile.certifications_json or {})
    if certifications.get("source") == "illustrative_showcase":
        certifications.setdefault("original_source", certifications.pop("source"))
        profile.certifications_json = certifications
    for key, value in data.model_dump().items():
        setattr(profile, key, value)
    profile.updated_at = datetime.now(timezone.utc)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Profile could not be saved. Please retry.")
    db.refresh(profile)
    return _profile_data(profile)


@router.get("/products")
def list_products(
    offset: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: User = Depends(factory_access),
):
    if offset < 0 or not 1 <= limit <= 100:
        raise HTTPException(status_code=422, detail="Invalid pagination")
    products = (
        db.query(Product)
        .filter(Product.user_id == user.id)
        .order_by(Product.created_at.desc(), Product.id)
        .offset(offset)
        .limit(limit)
        .all()
    )
    return {"items": [_product_data(product) for product in products]}


@router.get("/showcase")
def list_illustrative_showcase(
    offset: int = 0,
    limit: int = 24,
    db: Session = Depends(get_db),
    _user: User = Depends(require_roles("factory_owner", "verified_buyer", "admin")),
):
    """Show explicitly illustrative products without private factory data."""
    if offset < 0 or offset > 10000 or not 1 <= limit <= 60:
        raise HTTPException(status_code=422, detail="Invalid pagination")
    records = (
        db.query(Product, FactoryProfile)
        .join(FactoryProfile, FactoryProfile.user_id == Product.user_id)
        .join(User, User.id == Product.user_id)
        .filter(
            User.is_active.is_(True),
            Product.attributes_json["source"].as_string() == "illustrative_showcase",
            Product.attributes_json["is_illustrative"].as_boolean().is_(True),
            FactoryProfile.certifications_json["source"].as_string() == "illustrative_showcase",
        )
        .order_by(Product.created_at.desc(), Product.id)
        .offset(offset)
        .limit(limit + 1)
        .all()
    )
    items = []
    for product, profile in records[:limit]:
        image_url = (product.attributes_json or {}).get("image_url")
        try:
            image_url = ProductInput.validate_image_url(image_url)
        except (ValueError, TypeError):
            image_url = None
        items.append({
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "hs_code": product.hs_code,
            "factory_name": profile.legal_name,
            "country_code": profile.country_code,
            "image_url": image_url,
            "is_illustrative": True,
        })
    return {"items": items, "offset": offset, "has_more": len(records) > limit}

@router.post("/products", status_code=status.HTTP_201_CREATED)
def create_product(data: ProductInput, db: Session = Depends(get_db), user: User = Depends(factory_access)):
    fields = data.model_dump(exclude={"image_url"})
    product = Product(user_id=user.id, attributes_json={"image_url": data.image_url}, **fields)
    db.add(product)
    db.commit()
    db.refresh(product)
    return _product_data(product)


def _owned_product(db: Session, user: User, product_id: str) -> Product:
    product = db.query(Product).filter(Product.id == product_id, Product.user_id == user.id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/products/{product_id}")
def update_product(product_id: str, data: ProductInput, db: Session = Depends(get_db), user: User = Depends(factory_access)):
    product = _owned_product(db, user, product_id)
    for key, value in data.model_dump(exclude={"image_url"}).items():
        setattr(product, key, value)
    attributes = dict(product.attributes_json or {})
    if attributes.get("source") == "illustrative_showcase":
        attributes.setdefault("original_source", attributes.pop("source"))
    attributes.pop("is_illustrative", None)
    attributes["image_url"] = data.image_url
    product.attributes_json = attributes
    product.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(product)
    return _product_data(product)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: str, db: Session = Depends(get_db), user: User = Depends(factory_access)):
    product = _owned_product(db, user, product_id)
    if db.query(TradeDeal.id).filter(TradeDeal.product_id == product.id).first():
        raise HTTPException(status_code=409, detail="Product is linked to a trade record and cannot be deleted")
    db.delete(product)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
