"""Database engine and schema initialization for ExportPilot."""

import os
from pathlib import Path
from typing import Generator

from sqlalchemy import create_engine, event, inspect, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "exportpilot.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH.as_posix()}").strip()
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = "postgresql+psycopg://" + DATABASE_URL[len("postgres://"):]
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = "postgresql+psycopg://" + DATABASE_URL[len("postgresql://"):]
IS_SQLITE = DATABASE_URL.lower().startswith("sqlite")

connect_args = {"check_same_thread": False, "timeout": 30} if IS_SQLITE else {}
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=1800 if not IS_SQLITE else -1,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)
Base = declarative_base()


if IS_SQLITE:
    @event.listens_for(engine, "connect")
    def configure_sqlite_connection(dbapi_connection, connection_record):
        """Enable WAL and safe connection defaults on every SQLite connection."""
        cursor = dbapi_connection.cursor()
        try:
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA synchronous=NORMAL")
            cursor.execute("PRAGMA busy_timeout=30000")
            cursor.execute("PRAGMA foreign_keys=ON")
        finally:
            cursor.close()


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def initialize_database() -> None:
    """Create current tables and add compatible columns to existing databases."""
    # Import model modules before create_all so all mapped tables are registered.
    from backend import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _ensure_user_security_columns(engine)


def _ensure_user_security_columns(bind: Engine) -> None:
    """Add authentication state columns to databases created by older releases."""
    inspector = inspect(bind)
    if "users" not in inspector.get_table_names():
        return

    existing = {column["name"] for column in inspector.get_columns("users")}
    additions = {
        "is_active": "BOOLEAN NOT NULL DEFAULT TRUE",
        "is_verified": "BOOLEAN NOT NULL DEFAULT FALSE",
    }
    with bind.begin() as connection:
        for column_name, column_ddl in additions.items():
            if column_name not in existing:
                connection.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} {column_ddl}"))
        # Normalize historical role labels to the current authorization vocabulary.
        connection.execute(text("UPDATE users SET role = 'factory_owner' WHERE role = 'exporter'"))
        connection.execute(text("UPDATE users SET role = 'verified_buyer' WHERE role = 'buyer'"))
        connection.execute(text("UPDATE users SET role = 'compliance_auditor' WHERE role = 'nrb_advisor'"))
