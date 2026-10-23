import logging
import os
import time
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends
import httpx
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent.parent / ".env", override=False)
except ImportError:
    pass

# Ensure .env is parsed even if python-dotenv is not installed
_env_file = Path(__file__).resolve().parent.parent / ".env"
if _env_file.exists():
    try:
        for _line in _env_file.read_text(encoding="utf-8").splitlines():
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _k, _v = _line.split("=", 1)
                os.environ.setdefault(_k.strip(), _v.strip())
    except Exception:
        pass

from backend.database import get_db
from backend.models import SystemSetting
from backend.sovereignty import mask_bangla_pii
from backend.auth import require_roles

logger = logging.getLogger("exportpilot.azure_openai")

router = APIRouter(prefix="/azure-openai", tags=["Azure OpenAI Trade Advisor"])


class DealContext(BaseModel):
    commodity: Optional[str] = None
    target_price: Optional[str] = None
    moq: Optional[str] = None
    incoterm: Optional[str] = None
    destination_country: Optional[str] = None
    buyer_name: Optional[str] = None


class NegotiateRequest(BaseModel):
    message: str = Field(..., description="Exporter query or buyer message to negotiate")
    deal_context: Optional[DealContext] = None
    language: Optional[str] = Field("bn", description="Response language preference: bn or en")


class NegotiateResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    reply: str
    strategy_summary: str
    suggested_counter_offer: str
    risk_factors: List[str]
    pii_redacted_count: int
    model_used: str
    latency_ms: int
    sovereignty_protected: bool


def _get_azure_config() -> Dict[str, str]:
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT", "").strip().rstrip("/")
    key = os.getenv("AZURE_OPENAI_KEY", "").strip()
    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4.1-mini").strip()
    fallback_deployment = os.getenv("AZURE_OPENAI_FALLBACK_DEPLOYMENT", "gpt-5-mini").strip()
    return {
        "endpoint": endpoint,
        "key": key,
        "deployment": deployment,
        "fallback_deployment": fallback_deployment,
    }


def _build_system_prompt(language: str = "bn") -> str:
    if language == "en":
        return (
            "You are ExportPilot AI Senior Trade Advisor, specialized in Bangladesh export trade.\n"
            "Your expertise spans RMG (knitwear, woven apparel, denim), diversified jute products, "
            "crust and finished leather, frozen seafood, and agro-commodities.\n"
            "You master Incoterms 2020 (FOB Chattogram/Mongla, CIF, CFR, EXW), payment security "
            "(Irrevocable LC at sight, UPAS LC, TT deposit with balance against BL), EU CBAM carbon "
            "compliance, EU GSP+ rules of origin (double transformation), and international negotiation tactics.\n"
            "Rules:\n"
            "1. Give direct, sharp, actionable trade intelligence and pricing strategy.\n"
            "2. Never use generic AI fluff or flowery clichés. Be realistic and business-oriented.\n"
            "3. Protect exporter gross margins and identify hidden freight, inspection, or penalty risks.\n"
            "4. Format your answer with clear sections: Tactical Analysis, Suggested Counter-Offer, and Risk Assessment."
        )
    return (
        "আপনি এক্সপোর্টপাইলট এআই এর সিনিয়র আন্তর্জাতিক বাণিজ্য ও নেগোসিয়েশন অ্যাডভাইজার।\n"
        "বাংলাদেশের তৈরি পোশাক (নিটওয়্যার, ওভেন, ডেনিম), পাট ও পাটজাত পণ্য, চামড়া ও চামড়াজাত পণ্য, "
        "হিমায়িত চিংড়ি ও কৃষি প্রক্রিয়াজাত পণ্যের আন্তর্জাতিক রপ্তানি বাণিজ্যে আপনি অভিজ্ঞ।\n"
        "ইনকোটার্মস ২০২০ (FOB চট্টগ্রাম/মোংলা, CIF, CFR), পেমেন্ট নিরাপত্তা (কনফার্মড ইরেভোকেবল এলসি অ্যাট সাইট, "
        "ইউপাস এলসি, টিটি ডিপোজিট), ইউরোপীয় ইউনিয়নের সিবিএএম (CBAM) ও জিএসপি প্লাস নিয়মাবলী এবং ক্রেতার সাথে দরকষাকষির "
        "কৌশলে আপনি দক্ষ।\n"
        "নিয়মাবলী:\n"
        "১. সোজাসাপ্টা, বাস্তবসম্মত এবং ব্যবসায়িকভাবে কার্যকর পরামর্শ ও কৌশল দিন।\n"
        "২. কৃত্রিম বা রোবোটিক কোনো বাক্য ব্যবহার করবেন না। সহজ ও পেশাদার বাংলা ব্যবহার করুন।\n"
        "৩. রপ্তানিকারকের মার্জিন রক্ষা করা এবং গোপন ফ্রেইট চার্জ বা পরিদর্শন ঝুঁকি চিহ্নিত করাই আপনার প্রধান লক্ষ্য।\n"
        "৪. উত্তরের শেষে স্পষ্ট কাউন্টার-অফার ও ঝুঁকি সতর্কতা উল্লেখ করুন।"
    )


def _offline_fallback(sanitized_text: str, context: Optional[DealContext], language: str = "bn") -> Dict[str, Any]:
    """Deterministic fallback strategy when Azure OpenAI is unreachable or unconfigured."""
    commodity = (context.commodity if context and context.commodity else "তৈরি পোশাক").strip()
    target_price = (context.target_price if context and context.target_price else "মার্কেট রেট").strip()
    incoterm = (context.incoterm if context and context.incoterm else "FOB Chattogram").strip()

    if language == "en":
        return {
            "reply": (
                f"Based on trade parameters for {commodity} under {incoterm}, foreign buyers commonly request a 5% to 8% "
                f"discount on initial inquiries. To protect your margin, do not discount raw FOB directly. Instead, bundle "
                f"faster port turnaround at Chattogram or offer staggered shipment lots against an Irrevocable LC at sight."
            ),
            "strategy_summary": f"Hold base price near {target_price}. Counter with milestone-based delivery rather than price cuts.",
            "suggested_counter_offer": f"Counter at {target_price} {incoterm} with 30% advance TT and 70% Irrevocable LC at sight.",
            "risk_factors": [
                "Unsecured payment terms (avoid Open Account without credit insurance)",
                "EU CBAM carbon documentation compliance requirements",
                "Chattogram port demurrage buffer in peak shipment seasons",
            ],
            "model_used": "Deterministic Local Trade Engine (Fallback)",
        }

    return {
        "reply": (
            f"{commodity} রপ্তানির ক্ষেত্রে {incoterm} শর্তে বিদেশি বায়াররা সাধারণত প্রাথমিক প্রস্তাবে ৫% থেকে ৮% পর্যন্ত "
            f"ছাড় চাইতে পারে। তবে সরাসরি FOB মূল্য না কমিয়ে চট্টগ্রাম বন্দর থেকে দ্রুত শিপমেন্টের নিশ্চয়তা দিন "
            f"এবং কনফার্মড ইরেভোকেবল এলসি অ্যাট সাইট শর্তে অনড় থাকুন।"
        ),
        "strategy_summary": f"মূল্য {target_price} এর কাছাকাছি ধরে রাখুন। সরাসরি ছাড় না দিয়ে ডেলিভারি শিডিউল ও ব্যাচ সাইজ সমন্বয় করুন।",
        "suggested_counter_offer": f"কাউন্টার রেট: {target_price} ({incoterm})। পেমেন্ট শর্ত: কনফার্মড এলসি অ্যাট সাইট অথবা ৩০% অগ্রিম টিটি।",
        "risk_factors": [
            "ওপেন অ্যাকাউন্টে পণ্য না পাঠানো (পেমেন্ট ডিফল্ট ঝুঁকি)",
            "ইউরোপীয় ইউনিয়নের সিবিএএম ও পরিবেশ সনদ সংক্রান্ত বাধ্যবাধকতা",
            "পিক মৌসুমে চট্টগ্রাম বন্দরের কনটেইনার ও জাহাজের বিলম্বজনিত চার্জ",
        ],
        "model_used": "স্থানীয় বাণিজ্য নীতি ইঞ্জিন (ফলব্যাক)",
    }


async def _call_azure_completion(
    endpoint: str,
    key: str,
    deployment: str,
    messages: List[Dict[str, str]],
    timeout: float = 6.0,
) -> Optional[str]:
    url = f"{endpoint}/openai/deployments/{deployment}/chat/completions?api-version=2024-08-01-preview"
    headers = {
        "Content-Type": "application/json",
        "api-key": key,
    }
    
    # Try with max_completion_tokens first, fallback to max_tokens if model rejects
    payload = {
        "messages": messages,
        "max_completion_tokens": 800,
    }

    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                choices = data.get("choices", [])
                if choices:
                    return choices[0].get("message", {}).get("content", "")
            
            # If unsupported parameter error for max_completion_tokens, retry with max_tokens
            if resp.status_code == 400 and "unsupported_parameter" in resp.text:
                payload.pop("max_completion_tokens", None)
                payload["max_tokens"] = 800
                resp2 = await client.post(url, json=payload, headers=headers)
                if resp2.status_code == 200:
                    data2 = resp2.json()
                    choices2 = data2.get("choices", [])
                    if choices2:
                        return choices2[0].get("message", {}).get("content", "")
            
            logger.warning("Azure OpenAI deployment %s returned status %d: %s", deployment, resp.status_code, resp.text[:200])
        except Exception as exc:
            logger.warning("Azure OpenAI call failed for %s: %s", deployment, exc)
    return None


async def _call_gemini_completion(messages: List[Dict[str, str]], api_key: str, model: str) -> Optional[str]:
    system_prompt = next((message["content"] for message in messages if message["role"] == "system"), "")
    user_parts = [
        {"role": "user", "parts": [{"text": message["content"]}]}
        for message in messages
        if message["role"] != "system"
    ]
    payload = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": user_parts,
        "generationConfig": {"maxOutputTokens": 800},
    }
    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            response = await client.post(
                endpoint,
                json=payload,
                headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
            )
            if response.status_code == 200:
                candidates = response.json().get("candidates", [])
                parts = candidates[0].get("content", {}).get("parts", []) if candidates else []
                text = "\n".join(part.get("text", "") for part in parts if part.get("text"))
                return text or None
            logger.warning("Gemini model %s returned status %d", model, response.status_code)
        except Exception as exc:
            logger.warning("Gemini request failed (%s)", type(exc).__name__)
    return None


def _selected_trade_provider(db: Session, azure_configured: bool) -> str:
    setting = db.get(SystemSetting, "trade_advisor_provider")
    if setting:
        if setting.value == "local_deterministic":
            return setting.value
        if setting.value == "azure_openai" and azure_configured:
            return setting.value
        if setting.value == "gemini_flash" and os.getenv("GEMINI_API_KEY", "").strip():
            return setting.value
    return "azure_openai" if azure_configured else "local_deterministic"


@router.post("/negotiate", response_model=NegotiateResponse)
async def negotiate_deal(
    req: NegotiateRequest,
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles("factory_owner", "admin")),
):
    start_time = time.perf_counter()

    # Step 1: Enforce local data sovereignty by redacting Bangladeshi PII
    redacted_text, pii_count, detected = mask_bangla_pii(req.message)

    cfg = _get_azure_config()
    provider = _selected_trade_provider(db, bool(cfg["endpoint"] and cfg["key"]))
    language = "en" if req.language == "en" else "bn"

    # Context enrichment
    context_str = ""
    if req.deal_context:
        ctx = req.deal_context
        ctx_parts = []
        if ctx.commodity:
            ctx_parts.append(f"Commodity: {ctx.commodity}")
        if ctx.target_price:
            ctx_parts.append(f"Target Price: {ctx.target_price}")
        if ctx.moq:
            ctx_parts.append(f"MOQ: {ctx.moq}")
        if ctx.incoterm:
            ctx_parts.append(f"Incoterm: {ctx.incoterm}")
        if ctx.destination_country:
            ctx_parts.append(f"Destination: {ctx.destination_country}")
        if ctx.buyer_name:
            ctx_parts.append(f"Buyer: {ctx.buyer_name}")
        if ctx_parts:
            context_str = "Deal Parameters: " + " | ".join(ctx_parts) + "\n\n"

    system_prompt = _build_system_prompt(language)
    user_prompt = f"{context_str}Buyer / Exporter Query (PII Sanitized):\n{redacted_text}"

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    llm_output = None
    model_name_used = "Offline Fallback"

    if provider == "azure_openai" and cfg["endpoint"] and cfg["key"]:
        # Attempt primary deployment (e.g. gpt-4.1-mini)
        llm_output = await _call_azure_completion(cfg["endpoint"], cfg["key"], cfg["deployment"], messages)
        if llm_output:
            model_name_used = f"{cfg['deployment']} (Azure OpenAI)"
        elif cfg["fallback_deployment"] and cfg["fallback_deployment"] != cfg["deployment"]:
            # Fallback to secondary deployment (e.g. gpt-5-mini)
            llm_output = await _call_azure_completion(cfg["endpoint"], cfg["key"], cfg["fallback_deployment"], messages)
            if llm_output:
                model_name_used = f"{cfg['fallback_deployment']} (Azure OpenAI)"
    elif provider == "gemini_flash" and os.getenv("GEMINI_API_KEY"):
        gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
        llm_output = await _call_gemini_completion(messages, os.environ["GEMINI_API_KEY"].strip(), gemini_model)
        if llm_output:
            model_name_used = f"{gemini_model} (Gemini Flash)"
    elif provider == "local_deterministic":
        model_name_used = "Local trade rules"

    latency_ms = int((time.perf_counter() - start_time) * 1000)

    if llm_output:
        # Extract structured segments if available, or generate default summaries
        lines = [line.strip() for line in llm_output.split("\n") if line.strip()]
        first_few = " ".join(lines[:2])[:200]
        strategy_summary = first_few if first_few else "Strategic negotiation counter-proposal ready."
        
        suggested_counter = "Review detailed breakdown above for counter-offer parameters."
        for line in lines:
            if "counter" in line.lower() or "কাউন্টার" in line or "প্রস্তাব" in line:
                suggested_counter = line.lstrip("-*# ").strip()
                break

        risk_factors = [
            "Verify buyer creditworthiness via ECGC or Dun & Bradstreet rating",
            "Ensure LC contains no non-standard inspection certificates before port loading",
            "Maintain EU CBAM and environmental compliance certificates on file",
        ]

        return NegotiateResponse(
            reply=llm_output,
            strategy_summary=strategy_summary,
            suggested_counter_offer=suggested_counter,
            risk_factors=risk_factors,
            pii_redacted_count=pii_count,
            model_used=model_name_used,
            latency_ms=latency_ms,
            sovereignty_protected=True,
        )

    # If Azure OpenAI call did not succeed, return deterministic fallback
    fallback_data = _offline_fallback(redacted_text, req.deal_context, language)
    return NegotiateResponse(
        reply=fallback_data["reply"],
        strategy_summary=fallback_data["strategy_summary"],
        suggested_counter_offer=fallback_data["suggested_counter_offer"],
        risk_factors=fallback_data["risk_factors"],
        pii_redacted_count=pii_count,
        model_used=fallback_data["model_used"],
        latency_ms=latency_ms,
        sovereignty_protected=True,
    )


@router.get("/status")
async def get_azure_openai_status(db: Session = Depends(get_db)):
    cfg = _get_azure_config()
    is_configured = bool(cfg["endpoint"] and cfg["key"])
    gemini_configured = bool(os.getenv("GEMINI_API_KEY", "").strip())
    active_provider = _selected_trade_provider(db, is_configured)
    
    masked_endpoint = ""
    if cfg["endpoint"]:
        parts = cfg["endpoint"].split("//")
        domain = parts[-1]
        masked_endpoint = f"https://{domain[:8]}...{domain[-14:]}" if len(domain) > 22 else cfg["endpoint"]

    return {
        "configured": is_configured,
        "active_provider": active_provider,
        "gemini_configured": gemini_configured,
        "endpoint_masked": masked_endpoint,
        "primary_deployment": cfg["deployment"] if is_configured else None,
        "fallback_deployment": cfg["fallback_deployment"] if is_configured else None,
        "status": "operational" if is_configured else "local_fallback",
        "sovereignty_filter_active": True,
        "supported_models": ["gpt-4.1-mini", "gpt-5-mini"],
        "region": os.getenv("AZURE_OPENAI_REGION", "Not reported") if is_configured else "Not applicable",
    }

