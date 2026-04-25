"""
Structured API errors — consistent error envelope across all endpoints.

Every error response has this shape:
    {
        "error":      "<machine-readable code>",
        "message":    "<human-readable description>",
        "detail":     <optional typed context, null when absent>,
        "request_id": "<uuid for log correlation, null when tracing not enabled>"
    }

Usage in route handlers:
    raise api_error(404, ErrorCode.NOT_FOUND, f"Job not found: {job_id}")
    raise api_error(400, ErrorCode.PARSE_ERROR, "Bad SQL", detail=ParseErrorDetail(line=12, hint="missing semicolon"))
"""

from enum import Enum
from typing import Any, Optional, Union
from typing import NoReturn

from fastapi import HTTPException
from pydantic import BaseModel


# ── Error codes ───────────────────────────────────────────────────────────────

class ErrorCode(str, Enum):
    VALIDATION_ERROR    = "validation_error"    # malformed request body / params
    NOT_FOUND           = "not_found"           # resource does not exist
    CONFLICT            = "conflict"            # state conflict (duplicate, locked, etc.)
    UNSUPPORTED_FORMAT  = "unsupported_format"  # unrecognised / disallowed file type
    FILE_TOO_LARGE      = "file_too_large"      # upload exceeds size limit
    PARSE_ERROR         = "parse_error"         # schema text could not be parsed
    RECONCILIATION_ERROR = "reconciliation_error"  # engine failed unexpectedly
    TIMEOUT_ERROR       = "timeout_error"       # operation exceeded time limit
    RATE_LIMITED        = "rate_limited"        # too many requests
    INTERNAL_ERROR      = "internal_error"      # unhandled server-side exception
    SERVICE_UNAVAILABLE = "service_unavailable" # dependency not ready


# Maps HTTP status codes to the most appropriate ErrorCode.
# Used by the global HTTPException handler for exceptions raised outside api_error().
HTTP_STATUS_TO_ERROR_CODE: dict[int, ErrorCode] = {
    400: ErrorCode.VALIDATION_ERROR,
    404: ErrorCode.NOT_FOUND,
    405: ErrorCode.VALIDATION_ERROR,
    409: ErrorCode.CONFLICT,
    413: ErrorCode.FILE_TOO_LARGE,
    422: ErrorCode.VALIDATION_ERROR,
    429: ErrorCode.RATE_LIMITED,
    500: ErrorCode.INTERNAL_ERROR,
    503: ErrorCode.SERVICE_UNAVAILABLE,
    504: ErrorCode.TIMEOUT_ERROR,
}


# ── Typed detail sub-models ───────────────────────────────────────────────────

class ValidationErrorDetail(BaseModel):
    """Detail payload for request/input validation failures."""
    fields: list[dict]  # list of Pydantic-style {loc, msg, type} dicts


class ParseErrorDetail(BaseModel):
    """Detail payload for schema parse failures."""
    line: Optional[int] = None      # 1-based line number where parsing failed
    column: Optional[int] = None    # 1-based column offset
    snippet: Optional[str] = None   # short excerpt around the bad token
    hint: Optional[str] = None      # human-readable fix suggestion


class FormatErrorDetail(BaseModel):
    """Detail payload for unsupported or undetected schema formats."""
    supported: list[str]            # allowed format identifiers
    detected: Optional[str] = None  # what the server thought it saw, if anything
    filename: Optional[str] = None  # the uploaded filename, for context


class FileSizeErrorDetail(BaseModel):
    """Detail payload for file-too-large rejections."""
    max_bytes: int
    max_mb: float


class ReconcileErrorDetail(BaseModel):
    """Detail payload for reconciliation engine failures."""
    source_table: Optional[str] = None  # table being processed when failure occurred
    target_table: Optional[str] = None
    step: Optional[str] = None          # pipeline step (e.g. "scoring", "assignment")
    hint: Optional[str] = None


class JobErrorDetail(BaseModel):
    """Detail payload for async job lookup / state errors."""
    job_id: str
    current_status: Optional[str] = None


# Union type used for IDE auto-complete; the envelope stores any JSON-serialisable value.
AnyErrorDetail = Union[
    ValidationErrorDetail,
    ParseErrorDetail,
    FormatErrorDetail,
    FileSizeErrorDetail,
    ReconcileErrorDetail,
    JobErrorDetail,
    dict,
    list,
    str,
    None,
]


# ── Error envelope ────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    error: str                       # ErrorCode value
    message: str
    detail: Optional[Any] = None     # typed sub-model or free-form context
    request_id: Optional[str] = None # injected by global handler for log correlation


# ── Factory ───────────────────────────────────────────────────────────────────

def api_error(
    status_code: int,
    code: ErrorCode,
    message: str,
    detail: AnyErrorDetail = None,
) -> NoReturn:
    """Raise an HTTPException whose body conforms to the standard error envelope.

    Always raises — callers must not check the return value.
    """
    detail_payload = detail.model_dump(mode="json") if isinstance(detail, BaseModel) else detail
    raise HTTPException(
        status_code=status_code,
        detail={"error": code.value, "message": message, "detail": detail_payload},
    )
