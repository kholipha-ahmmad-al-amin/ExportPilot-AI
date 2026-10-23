"""FastAPI application gateway for ExportPilot."""

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.auth import JWTSessionMiddleware, get_current_active_user, require_roles, router as auth_router
from backend.audit_router import router as audit_router
from backend.azure_openai import router as azure_openai_router
from backend.database import SessionLocal, engine, initialize_database
from backend.mcp_agents import mcp_server, pipeline_router, router as mcp_router
from backend.open_source_parsers import router as parsers_router
from backend.reports_router import router as reports_router
from backend.seed_data import seed_database
from backend.sovereignty import router as sovereignty_router
from backend.voice_router import router as voice_router

logger = logging.getLogger("exportpilot.api")
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"


def _enabled(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _cors_origins() -> tuple[list[str], bool]:
    configured = os.getenv("CORS_ORIGINS")
    if configured:
        requested = [origin.strip() for origin in configured.split(",") if origin.strip()]
        wildcard = "*" in requested
        origins = [origin for origin in requested if origin != "*"]
        return (["*"] if wildcard else origins), not wildcard
    return [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ], True


def _initialize_application_data() -> None:
    initialize_database()
    with SessionLocal() as db:
        seed_database(db)
    initialize_database()


mcp_http_app = mcp_server.http_app(path="/") if mcp_server is not None else None


@asynccontextmanager
async def lifespan(app: FastAPI):
    _initialize_application_data()
    yield


app = FastAPI(
    title="ExportPilot AI API",
    description="Sovereign trade intelligence and compliance workflows for exporters.",
    version="2026.10",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

cors_origins, cors_credentials = _cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=cors_credentials,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Type", "Cache-Control", "X-Request-ID", "Mcp-Session-Id", "MCP-Protocol-Version"],
    max_age=600,
)


def _problem(status_code: int, title: str, detail: str, instance: str, headers: dict | None = None):
    return JSONResponse(
        status_code=status_code,
        media_type="application/problem+json",
        headers=headers,
        content={
            "type": "about:blank",
            "title": title,
            "status": status_code,
            "detail": detail,
            "instance": instance,
        },
    )


@app.exception_handler(StarletteHTTPException)
async def http_problem_handler(request: Request, exc: StarletteHTTPException):
    title = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        409: "Conflict",
        422: "Unprocessable Content",
        429: "Too Many Requests",
    }.get(exc.status_code, "Request Failed")
    detail = exc.detail if isinstance(exc.detail, str) else "The request could not be completed."
    return _problem(exc.status_code, title, detail, request.url.path, exc.headers)


@app.exception_handler(RequestValidationError)
async def validation_problem_handler(request: Request, exc: RequestValidationError):
    return _problem(422, "Unprocessable Content", "Request validation failed.", request.url.path)


@app.exception_handler(Exception)
async def unhandled_problem_handler(request: Request, exc: Exception):
    logger.error(
        "Unhandled API error on %s",
        request.url.path,
        exc_info=(type(exc), exc, exc.__traceback__),
    )
    return _problem(500, "Internal Server Error", "An unexpected server error occurred.", request.url.path)


app.include_router(auth_router, prefix="/api/v1")
app.include_router(sovereignty_router, prefix="/api/v1")
app.include_router(parsers_router, prefix="/api/v1")
app.include_router(mcp_router, prefix="/api/v1")
app.include_router(pipeline_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/v1")
app.include_router(audit_router, prefix="/api/v1")
app.include_router(voice_router, prefix="/api/v1", dependencies=[Depends(get_current_active_user)])
app.include_router(azure_openai_router, prefix="/api/v1")

@app.get("/api/v1/buyers", tags=["Trade Analysis"])
def get_global_buyers_alias(request: Request):
    from backend.mcp_agents import list_global_buyers
    params = request.query_params
    return list_global_buyers(
        country=params.get("country"),
        cert=params.get("cert"),
        payment=params.get("payment"),
        search=params.get("search"),
        max_moq=int(params.get("max_moq")) if params.get("max_moq") else None,
    )

@app.get("/api/v1/deals/feed", tags=["Trade Analysis"])
def get_live_deals_feed():
    from backend.seed_expansion import LIVE_TRADE_ACTIVITY_FEED
    normalized_deals = []
    for d in LIVE_TRADE_ACTIVITY_FEED:
        total_usd = float(d.get("total_deal_usd") or d.get("total_fob_value_usd") or 0.0)
        fob_unit = float(d.get("fob_unit_usd") or d.get("fob_unit_price_usd") or 1.0)
        qty = int(d.get("quantity_units") or (round(total_usd / fob_unit) if fob_unit > 0 else 1000))
        item = dict(d)
        item["quantity_units"] = qty
        item["total_fob_value_usd"] = total_usd
        item["total_deal_usd"] = total_usd
        item["fob_unit_usd"] = fob_unit
        item["fob_unit_price_usd"] = fob_unit
        item["product_name"] = d.get("product_title") or d.get("product_name") or "Export Shipment"
        item["product_title"] = d.get("product_title") or d.get("product_name") or "Export Shipment"
        item["destination_country"] = d.get("buyer_city_country") or d.get("destination_country") or "International"
        item["buyer_city_country"] = d.get("buyer_city_country") or d.get("destination_country") or "International"
        item["compliance_status"] = d.get("cbam_carbon_intensity") or d.get("compliance_status") or "Scope 2 Verified"
        normalized_deals.append(item)

    total_margin_saved = sum(d.get("middleman_margin_saved_usd", 0.0) for d in normalized_deals)
    total_volume_usd = sum(d.get("total_deal_usd", 0.0) for d in normalized_deals)
    return {
        "status": "success",
        "total_active_deals": len(normalized_deals),
        "total_deals_monitored": len(normalized_deals),
        "total_volume_usd": total_volume_usd,
        "total_margin_saved_usd": total_margin_saved,
        "total_middleman_margin_saved_usd": total_margin_saved,
        "deals": normalized_deals,
    }

if mcp_http_app is not None:
    app.mount("/api/v1/mcp/protocol", JWTSessionMiddleware(mcp_http_app), name="mcp_protocol")


@app.get("/api/v1/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy" if mcp_http_app is not None else "degraded",
        "service": "ExportPilot AI",
        "version": app.version,
        "cloud_region": os.getenv("CLOUD_REGION", "southeastasia"),
        "database": "sqlite-wal" if str(engine.url).startswith("sqlite") else "configured-sqlalchemy",
        "agent_count": 5,
        "fastmcp_enabled": mcp_http_app is not None,
    }


if (FRONTEND_DIST / "assets").is_dir():
    app.mount(
        "/assets",
        StaticFiles(directory=str(FRONTEND_DIST / "assets"), check_dir=True),
        name="dist_assets",
    )


if FRONTEND_DIST.is_dir():
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str, request: Request):
        normalized = full_path.lstrip("/")
        if normalized == "" or normalized == "index.html":
            return FileResponse(FRONTEND_DIST / "index.html")
        if normalized in {"api", "openapi.json"} or normalized.startswith(
            ("api/", "assets/")
        ):
            return _problem(404, "Not Found", "The requested resource was not found.", request.url.path)

        candidate = (FRONTEND_DIST / normalized).resolve()
        try:
            candidate.relative_to(FRONTEND_DIST.resolve())
        except ValueError:
            return _problem(404, "Not Found", "The requested resource was not found.", request.url.path)
        if candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/", include_in_schema=False)
    async def index_root():
        return {
            "message": "ExportPilot AI backend is running. The frontend build is not present.",
            "docs": "/docs",
            "health": "/api/v1/health",
        }
