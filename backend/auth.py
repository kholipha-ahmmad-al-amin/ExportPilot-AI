"""JWT authentication and role-based access control."""

import datetime
import os
import re
import secrets
import threading
import time
import uuid
from pathlib import Path
from typing import Callable

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool
from starlette.datastructures import Headers
from starlette.responses import JSONResponse as StarletteJSONResponse
from starlette.types import ASGIApp, Receive, Scope, Send

try:
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).resolve().parent.parent / ".env", override=False)
except ImportError:
    pass

from backend.database import get_db
from backend.models import SystemSetting, User

ALGORITHM = "HS256"
ISSUER = "exportpilot-api"
AUDIENCE = "exportpilot-client"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8
ROLE_NAMES = {"factory_owner", "verified_buyer", "compliance_auditor", "admin"}
ROLE_ALIASES = {
    "exporter": "factory_owner",
    "buyer": "verified_buyer",
    "importer": "verified_buyer",
    "nrb_advisor": "compliance_auditor",
}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)
router = APIRouter(prefix="/auth", tags=["Authentication"])

# Login brute-force guard: per email+client counters with a fixed window and a
# lockout. Kept in process memory, which is sufficient for a single App Service.
LOGIN_MAX_FAILURES = 5
LOGIN_WINDOW_SECONDS = 15 * 60
LOGIN_LOCKOUT_SECONDS = 15 * 60
_login_failures: dict[str, list[float]] = {}
_login_lock = threading.Lock()


def _login_blocked_remaining(key: str, now: float) -> float:
    with _login_lock:
        timestamps = [ts for ts in _login_failures.get(key, []) if now - ts < LOGIN_WINDOW_SECONDS]
        _login_failures[key] = timestamps
        if len(timestamps) >= LOGIN_MAX_FAILURES:
            return max(LOGIN_WINDOW_SECONDS - (now - min(timestamps)), 0.0)
        return 0.0


def _record_login_failure(key: str, now: float) -> None:
    with _login_lock:
        timestamps = [ts for ts in _login_failures.get(key, []) if now - ts < LOGIN_WINDOW_SECONDS]
        timestamps.append(now)
        _login_failures[key] = timestamps


def _clear_login_failures(key: str) -> None:
    with _login_lock:
        _login_failures.pop(key, None)


class RegisterRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=12, max_length=72)
    full_name_bn: str = Field(min_length=1, max_length=255)
    role: str = "factory_owner"
    factory_name: str | None = Field(default=None, max_length=255)
    bootstrap_token: str | None = Field(default=None, max_length=256)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        value = value.strip().lower()
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value):
            raise ValueError("A valid email address is required")
        return value

    @field_validator("password")
    @classmethod
    def validate_password_bytes(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be 72 UTF-8 bytes or fewer")
        return value


class LoginRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=1024)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class RoleUpdateRequest(BaseModel):
    role: str
    is_active: bool | None = None


class ModelProviderRequest(BaseModel):
    provider: str


def normalize_role(role: str | None) -> str:
    normalized = (role or "factory_owner").strip().lower()
    return ROLE_ALIASES.get(normalized, normalized)


def _jwt_secret() -> str:
    secret = (os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY") or "").strip()
    if len(secret.encode("utf-8")) < 32:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured",
        )
    return secret


def _cookie_secure() -> bool:
    if os.getenv("ENVIRONMENT", "development").lower() in {"production", "prod"}:
        return True
    configured = os.getenv("COOKIE_SECURE")
    if configured is not None:
        return configured.strip().lower() in {"1", "true", "yes", "on"}
    return False


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        password_bytes = plain_password.encode("utf-8")
        if len(password_bytes) > 72:
            return False
        return bcrypt.checkpw(password_bytes, hashed_password.encode("utf-8"))
    except (ValueError, TypeError, UnicodeError):
        return False


def get_password_hash(password: str) -> str:
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        raise ValueError("Passwords must be 72 UTF-8 bytes or fewer")
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt(rounds=12)).decode("utf-8")


def create_access_token(data: dict, expires_delta: datetime.timedelta | None = None) -> str:
    now = datetime.datetime.now(datetime.timezone.utc)
    expires_at = now + (expires_delta or datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    claims = {
        "sub": str(data["sub"]),
        "role": normalize_role(data.get("role")),
        "iat": now,
        "exp": expires_at,
        "iss": ISSUER,
        "aud": AUDIENCE,
        "jti": str(uuid.uuid4()),
        "token_use": "access",
    }
    return jwt.encode(claims, _jwt_secret(), algorithm=ALGORITHM)


def _user_payload(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "full_name_bn": user.full_name_bn,
        "role": normalize_role(user.role),
        "factory_name": user.factory_name,
    }


def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=_cookie_secure(),
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )


def _issue_session(user: User, response: Response) -> dict:
    token = create_access_token({"sub": user.id, "role": user.role})
    _set_auth_cookie(response, token)
    return {
        "status": "success",
        "access_token": token,
        "token_type": "bearer",
        "user": _user_payload(user),
    }


def get_current_user(
    request: Request,
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User | None:
    raw_token = token
    if not raw_token:
        raw_token = request.cookies.get("access_token")
        if raw_token and raw_token.startswith("Bearer "):
            raw_token = raw_token[7:].strip()
    if not raw_token:
        return None

    return get_user_for_token(raw_token, db)


def get_user_for_token(raw_token: str, db: Session) -> User | None:
    try:
        payload = jwt.decode(
            raw_token,
            _jwt_secret(),
            algorithms=[ALGORITHM],
            issuer=ISSUER,
            audience=AUDIENCE,
            leeway=30,
            options={"require": ["sub", "exp", "iat", "iss", "aud", "jti", "token_use"]},
        )
        if payload.get("token_use") != "access":
            return None
        user_id = payload.get("sub")
    except HTTPException:
        raise
    except jwt.PyJWTError:
        return None

    if not user_id:
        return None
    user = db.query(User).filter(User.id == user_id).first()
    return user


class JWTSessionMiddleware:
    """Require an active authenticated account on a mounted FastMCP ASGI app."""

    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http" or scope.get("method") == "OPTIONS":
            await self.app(scope, receive, send)
            return

        headers = Headers(scope=scope)
        raw_token = headers.get("authorization", "")
        if raw_token.lower().startswith("bearer "):
            raw_token = raw_token[7:].strip()
        else:
            from starlette.requests import Request

            raw_token = Request(scope).cookies.get("access_token", "")
            if raw_token.startswith("Bearer "):
                raw_token = raw_token[7:].strip()

        authorized, status_code, detail = await run_in_threadpool(_authorize_mcp_token, raw_token)

        if authorized:
            await self.app(scope, receive, send)
            return

        response = StarletteJSONResponse(
            status_code=status_code,
            media_type="application/problem+json",
            content={
                "type": "about:blank",
                "title": {401: "Unauthorized", 503: "Service Unavailable"}.get(status_code, "Forbidden"),
                "status": status_code,
                "detail": detail,
                "instance": scope.get("path", "/"),
            },
        )
        await response(scope, receive, send)


def _authorize_mcp_token(raw_token: str) -> tuple[bool, int, str]:
    if not raw_token:
        return False, 401, "Authentication is required"
    try:
        from backend.database import SessionLocal

        with SessionLocal() as db:
            user = get_user_for_token(raw_token, db)
            if user is None:
                return False, 401, "Authentication is required"
            if not user.is_active:
                return False, 403, "This account is inactive"
            role = normalize_role(user.role)
            verified = role not in {"verified_buyer", "compliance_auditor"} or user.is_verified
            if role not in ROLE_NAMES or not verified:
                return False, 403, "This account is not permitted to use the MCP service"
            if role not in {"factory_owner", "admin"}:
                return False, 403, "The trade agent service is limited to exporter accounts"
            return True, 200, ""
    except HTTPException as exc:
        detail = exc.detail if isinstance(exc.detail, str) else "Authentication is not configured"
        return False, exc.status_code, detail


def get_current_active_user(current_user: User | None = Depends(get_current_user)) -> User:
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication is required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account is inactive")
    role = normalize_role(current_user.role)
    if role not in ROLE_NAMES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account has no valid role")
    if role in {"verified_buyer", "compliance_auditor"} and not current_user.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account is pending verification")
    return current_user


def require_roles(*roles: str) -> Callable:
    allowed = {normalize_role(role) for role in roles}

    def role_dependency(current_user: User = Depends(get_current_active_user)) -> User:
        if normalize_role(current_user.role) not in allowed:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role permissions")
        return current_user

    return role_dependency


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    _jwt_secret()
    requested_role = normalize_role(req.role)
    bootstrap_email = os.getenv("BOOTSTRAP_ADMIN_EMAIL", "").strip().lower()
    bootstrap_secret = os.getenv("BOOTSTRAP_ADMIN_TOKEN", "")
    is_bootstrap_admin = bool(
        requested_role == "admin"
        and bootstrap_email
        and req.email == bootstrap_email
        and bootstrap_secret
        and len(bootstrap_secret.encode("utf-8")) >= 32
        and req.bootstrap_token
        and len(req.bootstrap_token.encode("utf-8")) >= 32
        and secrets.compare_digest(req.bootstrap_token, bootstrap_secret)
    )

    if requested_role not in {"factory_owner", "verified_buyer", "compliance_auditor", "admin"}:
        raise HTTPException(status_code=422, detail="Unsupported account role")
    if requested_role != "factory_owner" and not is_bootstrap_admin:
        raise HTTPException(status_code=403, detail="Buyer, auditor, and admin roles must be assigned by an administrator")

    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        if not is_bootstrap_admin:
            raise HTTPException(status_code=409, detail="An account with this email already exists")
        existing.password_hash = get_password_hash(req.password)
        existing.full_name_bn = req.full_name_bn
        existing.role = "admin"
        existing.factory_name = req.factory_name or existing.factory_name
        existing.is_active = True
        existing.is_verified = True
        try:
            db.commit()
            db.refresh(existing)
        except Exception:
            db.rollback()
            raise
        return _issue_session(existing, response)

    role = "admin" if is_bootstrap_admin else "factory_owner"
    user = User(
        email=req.email,
        password_hash=get_password_hash(req.password),
        full_name_bn=req.full_name_bn,
        role=role,
        factory_name=req.factory_name or "Bangladesh Export Factory",
        is_active=True,
        is_verified=is_bootstrap_admin,
    )
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        raise
    return _issue_session(user, response)


@router.post("/login")
def login(req: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    _jwt_secret()
    client_host = request.client.host if request.client else "unknown"
    login_key = f"{req.email}|{client_host}"
    now = time.time()
    blocked_remaining = _login_blocked_remaining(login_key, now)
    if blocked_remaining > 0:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed sign-in attempts. Try again later.",
            headers={"Retry-After": str(int(blocked_remaining) + 1)},
        )
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        _record_login_failure(login_key, now)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    _clear_login_failures(login_key)
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account is inactive")
    role = normalize_role(user.role)
    if role not in ROLE_NAMES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account has no valid role")
    if role in {"verified_buyer", "compliance_auditor"} and not user.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account is pending verification")
    return _issue_session(user, response)


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", path="/", httponly=True, secure=_cookie_secure(), samesite="lax")
    return {"status": "success"}


@router.get("/me")
def me(current_user: User = Depends(get_current_active_user)):
    return _user_payload(current_user)


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: str,
    req: RoleUpdateRequest,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles("admin")),
):
    role = normalize_role(req.role)
    if role not in ROLE_NAMES:
        raise HTTPException(status_code=422, detail="Unsupported account role")
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    user.is_verified = role in {"verified_buyer", "compliance_auditor", "admin"}
    if req.is_active is not None:
        user.is_active = req.is_active
    db.commit()
    db.refresh(user)
    return _user_payload(user) | {"is_active": user.is_active, "is_verified": user.is_verified}


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles("admin")),
):
    """List all registered users for admin console oversight."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name_bn": u.full_name_bn,
            "role": normalize_role(u.role),
            "factory_name": u.factory_name or "ExportPilot Enterprise Facility",
            "is_active": bool(u.is_active),
            "is_verified": bool(u.is_verified),
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.post("/users/{user_id}/toggle-status")
def toggle_user_status(
    user_id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles("admin")),
):
    """Admin endpoint to suspend or activate a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Prevent self-deactivation of the active admin
    if user.id == _admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate the currently authenticated superuser")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return {
        "status": "success",
        "user_id": user.id,
        "is_active": user.is_active,
        "message": f"Account {'activated' if user.is_active else 'suspended'} successfully"
    }


def _model_provider_options() -> dict[str, bool]:
    return {
        "local_deterministic": True,
        "azure_openai": bool(os.getenv("AZURE_OPENAI_ENDPOINT") and os.getenv("AZURE_OPENAI_KEY")),
        "gemini_flash": bool(os.getenv("GEMINI_API_KEY")),
    }


@router.get("/admin/model-provider")
def get_model_provider(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles("admin")),
):
    options = _model_provider_options()
    setting = db.get(SystemSetting, "trade_advisor_provider")
    selected = setting.value if setting and setting.value in options else None
    if not selected or not options.get(selected):
        selected = "azure_openai" if options["azure_openai"] else "local_deterministic"
    return {"provider": selected, "available": options}


@router.put("/admin/model-provider")
def update_model_provider(
    req: ModelProviderRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("admin")),
):
    options = _model_provider_options()
    if req.provider not in options:
        raise HTTPException(status_code=422, detail="Unsupported trade advice provider")
    if not options[req.provider]:
        raise HTTPException(status_code=409, detail="This provider is not configured")

    setting = db.get(SystemSetting, "trade_advisor_provider")
    if setting is None:
        setting = SystemSetting(key="trade_advisor_provider", value=req.provider)
        db.add(setting)
    else:
        setting.value = req.provider
    setting.updated_at = datetime.datetime.now(datetime.timezone.utc)
    setting.updated_by_user_id = admin.id
    db.commit()
    return {"provider": req.provider, "available": options}


@router.get("/system-stats")
def get_system_stats(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles("admin")),
):
    """Fetch live system metrics, database records, and cloud telemetry for the admin cockpit."""
    from backend.models import GlobalBuyer, ProductScan, TradeDeal

    user_count = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    product_scans = db.query(ProductScan).count()
    buyer_count = db.query(GlobalBuyer).count()
    illustrative_count = db.query(TradeDeal).filter(TradeDeal.status == "illustrative").count()
    analysis_count = db.query(TradeDeal).filter(TradeDeal.status != "illustrative").count()
    azure_configured = bool(
        os.getenv("AZURE_OPENAI_ENDPOINT", "").strip()
        and os.getenv("AZURE_OPENAI_KEY", "").strip()
    )
    gemini_configured = bool(os.getenv("GEMINI_API_KEY", "").strip())
    from backend.mcp_agents import _agent_steps, mcp_server


    return {
        "status": "healthy",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "users": {
            "total": user_count,
            "active": active_users,
            "suspended": user_count - active_users,
        },
        "trade_metrics": {
            "products_scanned": product_scans,
            "global_buyers_indexed": buyer_count,
            "analysis_runs": analysis_count,
            "illustrative_records_excluded": illustrative_count,
        },
        "cloud_telemetry": {
            "plan": os.getenv("APP_SERVICE_PLAN", "Not reported"),
            "region": os.getenv("WEBSITE_REGION") or os.getenv("CLOUD_REGION", "Not reported"),
            "ram_allocated": os.getenv("APP_RAM_GB", "Not reported"),
            "cpu_cores": os.getenv("APP_CPU_CORES", "Not reported"),
            "student_credit_total": None,
            "estimated_burn_rate_usd": None,
            "projected_runway_months": "Not reported",
            "custom_domain_ssl": "Not checked",
            "websockets": "Not reported",
        },
        "engine_status": {
            "trade_pipeline": "available" if len(_agent_steps) == 5 else "unavailable",
            "mcp_protocol": "available" if mcp_server is not None else "unavailable",
            "voice_transcription": "configured" if os.getenv("DEEPGRAM_API_KEY", "").strip() else "not_configured",
            "carbon_parser": "available",
            "trade_advisor": "azure_configured" if azure_configured else "gemini_configured" if gemini_configured else "local_only",
        }
    }

