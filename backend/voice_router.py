import os
import json
import logging
from pathlib import Path
from typing import Literal
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
import httpx
from backend.auth import require_roles
from backend.sovereignty import mask_bangla_pii

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/voice", tags=["Deepgram Sovereign Voice Engine"])

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY", "").strip()

ACCEPTED_AUDIO_TYPES = {
    "audio/webm",
    "audio/wav",
    "audio/ogg",
    "audio/mp4",
    "audio/x-m4a",
    "audio/mpeg",
    "audio/aac",
}

TRADE_KEYTERMS = [
    "FOB", "Chattogram", "HS Code", "CBAM",
    "পিস", "ডলার", "টাকা", "এলসি",
    "সাভার", "গাজীপুর", "বগুড়া", "কনটেইনার",
]

MAX_AUDIO_BYTES = 25 * 1024 * 1024

@router.get("/status")
def get_voice_engine_status():
    """Returns real-time status of Deepgram Voice STT Engine."""
    has_deepgram = bool(DEEPGRAM_API_KEY and len(DEEPGRAM_API_KEY) > 10)
    return {
        "engine": "Deepgram Sovereign Voice Engine",
        "stt_engine": "Deepgram Sovereign Voice 5.0",
        "stt_model": "nova-3",
        "language": "bn (Bengali / বাংলা) & en (English)",
        "deepgram_connected": has_deepgram,
        "accepted_audio_formats": sorted(ACCEPTED_AUDIO_TYPES),
        "keyterm_prompting": TRADE_KEYTERMS,
    }


@router.post("/transcribe", dependencies=[Depends(require_roles("factory_owner", "admin"))])
async def transcribe_factory_voice(
    audio: UploadFile = File(...),
    language: Literal["bn", "en"] = Form("bn"),
):
    """
    Zero-Hassle Voice Intake for SME Exporters.
    Receives raw audio recorded from factory floor or browser,
    transcribes via Deepgram Nova-3 REST API in natural Bengali,
    and returns sanitized text ready for the 5 FastMCP agents.
    """
    if not DEEPGRAM_API_KEY or len(DEEPGRAM_API_KEY) < 10:
        raise HTTPException(status_code=503, detail="Voice transcription is not configured")

    content_type = (audio.content_type or "").split(";", 1)[0].strip().lower()
    if content_type not in ACCEPTED_AUDIO_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported audio format")

    audio_bytes = await audio.read(MAX_AUDIO_BYTES + 1)
    if not audio_bytes or len(audio_bytes) < 100:
        raise HTTPException(status_code=400, detail="Audio is empty or invalid")
    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio files are limited to 25 MB")

    params = {
        "model": "nova-3",
        "language": language,
        "smart_format": "true",
        "punctuate": "true",
        "keyterm": TRADE_KEYTERMS,
    }
    headers = {
        "Authorization": f"Token {DEEPGRAM_API_KEY}",
        "Content-Type": content_type,
    }
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(30.0, connect=5.0)) as client:
            response = await client.post(
                "https://api.deepgram.com/v1/listen",
                params=params,
                headers=headers,
                content=audio_bytes,
            )
        if response.status_code != 200:
            logger.warning("Voice provider returned HTTP %s", response.status_code)
            raise HTTPException(status_code=502, detail="Voice transcription provider could not complete the request")
        data = response.json()
        alternatives = data.get("results", {}).get("channels", [{}])[0].get("alternatives", [])
        if not alternatives or not isinstance(alternatives[0].get("transcript"), str):
            raise HTTPException(status_code=422, detail="No speech could be transcribed")
        transcript = alternatives[0]["transcript"].strip()
        if not transcript:
            raise HTTPException(status_code=422, detail="No speech could be transcribed")
        confidence = float(alternatives[0].get("confidence", 0.0))
        clean_transcript, pii_count, _entities = mask_bangla_pii(transcript)
        return {
            "status": "success",
            "model": "deepgram-nova-3",
            "language": language,
            "sanitized_transcript": clean_transcript,
            "pii_redacted_count": pii_count,
            "confidence": round(confidence, 3),
        }
    except HTTPException:
        raise
    except (httpx.TimeoutException, httpx.RequestError):
        logger.exception("Voice transcription provider could not be reached")
        raise HTTPException(status_code=503, detail="Voice transcription is temporarily unavailable")
    except (ValueError, KeyError, IndexError, TypeError):
        logger.exception("Voice transcription provider returned an invalid response")
        raise HTTPException(status_code=502, detail="Voice transcription provider returned an invalid response")
