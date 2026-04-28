"""
Validate route — structural validation for a single schema.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from backend.api.errors import ErrorCode, ErrorResponse, api_error, ParseErrorDetail, FormatErrorDetail
from backend.core.parsers.sql_ddl import SQLDDLParser
from backend.core.parsers.prisma import PrismaParser
from backend.core.parsers.json_schema import JSONSchemaParser
from backend.core.parsers.base import BaseParser
from backend.core.analysis.validator import validate_schema

router = APIRouter(prefix="/validate", tags=["validate"])

_sql_parser = SQLDDLParser()
_prisma_parser = PrismaParser()
_json_parser = JSONSchemaParser()

_ERR = {
    400: {"model": ErrorResponse, "description": "Parse error or unsupported format"},
    422: {"model": ErrorResponse, "description": "Request validation failed"},
}


class ValidateRequest(BaseModel):
    schema_text: str
    schema_name: Optional[str] = "schema"

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "summary": "Validate a simple schema",
                    "value": {
                        "schema_text": (
                            "CREATE TABLE users (id INT PRIMARY KEY, email VARCHAR(255) NOT NULL);\n"
                            "CREATE TABLE posts (id INT PRIMARY KEY, author_id INT REFERENCES users(id));"
                        ),
                        "schema_name": "my_db",
                    },
                }
            ]
        }
    }


class ValidateResponse(BaseModel):
    schema_name: str
    table_count: int
    column_count: int
    issue_count: int
    error_count: int
    warning_count: int
    issues: list[dict]
    valid: bool


def _detect_parser(text: str) -> BaseParser:
    if _sql_parser.can_parse(text):
        return _sql_parser
    if _prisma_parser.can_parse(text):
        return _prisma_parser
    if _json_parser.can_parse(text):
        return _json_parser
    api_error(
        400,
        ErrorCode.UNSUPPORTED_FORMAT,
        "Could not detect schema format",
        detail=FormatErrorDetail(supported=["sql_ddl", "prisma", "json_schema"]),
    )


@router.post("/", response_model=ValidateResponse, responses=_ERR)
async def validate(req: ValidateRequest):
    """Parse and validate a single schema, returning all structural issues found."""
    parser = _detect_parser(req.schema_text)
    if not parser.can_parse(req.schema_text):
        api_error(
            400,
            ErrorCode.PARSE_ERROR,
            "Schema text has no recognisable table definitions",
            detail=ParseErrorDetail(hint="Add at least one CREATE TABLE (SQL), model (Prisma), or object definition (JSON Schema)."),
        )

    schema = parser.parse(req.schema_text, schema_name=req.schema_name)
    issues = validate_schema(schema)

    error_count = sum(1 for i in issues if i.severity == "error")
    warning_count = sum(1 for i in issues if i.severity == "warning")

    return ValidateResponse(
        schema_name=schema.name,
        table_count=len(schema.tables),
        column_count=sum(len(t.columns) for t in schema.tables),
        issue_count=len(issues),
        error_count=error_count,
        warning_count=warning_count,
        issues=[i.to_dict() for i in issues],
        valid=error_count == 0,
    )
