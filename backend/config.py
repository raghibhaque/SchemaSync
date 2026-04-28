"""
Configuration — all settings in one place.
"""

import logging
import os
import re
import sys
import warnings
from pathlib import Path

_log = logging.getLogger(__name__)


def _base_dir() -> Path:
    if getattr(sys, "frozen", False):
        # Running as a PyInstaller bundle — data lives under sys._MEIPASS/backend
        return Path(sys._MEIPASS) / "backend"
    return Path(__file__).resolve().parent


def _upload_dir() -> Path:
    if getattr(sys, "frozen", False):
        # sys._MEIPASS is read-only; write uploads to a user-writable location
        app_data = Path(os.getenv("LOCALAPPDATA") or (Path.home() / "AppData" / "Local"))
        return app_data / "SchemaSync" / "uploads"
    return Path(__file__).resolve().parent / "uploads"


BASE_DIR = _base_dir()
DEMO_DIR = BASE_DIR / "demo"
UPLOAD_DIR = _upload_dir()
CRM_LEGACY_SCHEMA  = DEMO_DIR / "crm_legacy_schema.sql"
CRM_MODERN_SCHEMA  = DEMO_DIR / "crm_modern_schema.sql"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
API_V1_PREFIX = "/api/v1"
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

TABLE_MATCH_THRESHOLD = float(os.getenv("TABLE_MATCH_THRESHOLD", "0.35"))
COLUMN_MATCH_THRESHOLD = float(os.getenv("COLUMN_MATCH_THRESHOLD", "0.30"))
STRUCTURAL_WEIGHT = float(os.getenv("STRUCTURAL_WEIGHT", "0.45"))
SEMANTIC_WEIGHT = float(os.getenv("SEMANTIC_WEIGHT", "0.55"))

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
USE_EMBEDDINGS = os.getenv("USE_EMBEDDINGS", "false").lower() == "true"

MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(2 * 1024 * 1024)))  # 2 MB
MAX_REQUEST_BYTES = int(os.getenv("MAX_REQUEST_BYTES", str(10 * 1024 * 1024)))  # 10 MB
ALLOWED_EXTENSIONS = set(os.getenv("ALLOWED_EXTENSIONS", ".sql,.prisma,.json").split(","))


def _validate_cors_origins(raw: str, debug: bool) -> list[str]:
    """Parse and validate CORS_ORIGINS, emitting warnings for suspicious values."""
    origins = [o.strip() for o in raw.split(",") if o.strip()]
    if not origins:
        warnings.warn("CORS_ORIGINS is empty — defaulting to localhost only", stacklevel=2)
        return ["http://localhost:3000", "http://localhost:5173"]

    validated: list[str] = []
    for origin in origins:
        if origin == "*":
            if not debug:
                warnings.warn(
                    "CORS_ORIGINS contains wildcard '*' — this allows any origin in production",
                    stacklevel=2,
                )
        elif not re.match(r"^https?://", origin):
            warnings.warn(
                f"CORS origin '{origin}' does not start with http:// or https:// — it will likely be rejected by browsers",
                stacklevel=2,
            )
        validated.append(origin)

    if not debug:
        localhost_origins = [o for o in validated if re.search(r"localhost|127\.0\.0\.1", o)]
        if localhost_origins and len(localhost_origins) == len(validated):
            _log.warning(
                "All CORS_ORIGINS point to localhost but DEBUG=false — "
                "set CORS_ORIGINS to your production domain"
            )

    return validated


CORS_ORIGINS = _validate_cors_origins(
    os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173"),
    debug=DEBUG,
)
