"""Persist privacy-safe security and compliance event summaries."""

import logging

from sqlalchemy.orm import Session

from backend.models import AuditLog

logger = logging.getLogger("exportpilot.security_events")


def record_security_event(
    db: Session,
    *,
    name: str,
    category: str,
    status: str,
    details: str,
) -> None:
    """Store operational outcomes without raw documents or identifiers."""
    try:
        db.add(AuditLog(
            test_name=name[:255],
            category=category[:100],
            status=status[:50],
            score=20 if status == "PASS" else 0,
            details=details[:1000],
        ))
        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Could not persist a security event")
