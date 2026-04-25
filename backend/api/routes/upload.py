"""Upload route — accepts SQL files and returns parsed schema preview."""

from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.api.models.responses import UploadResponse
from backend.core.parsers.sql_ddl import SQLDDLParser
from backend.config import UPLOAD_DIR

router = APIRouter(prefix="/upload", tags=["upload"])
parser = SQLDDLParser()


@router.post("/", response_model=UploadResponse)
async def upload_schema(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(400, "No filename provided")

    content = await file.read()
    text = content.decode("utf-8", errors="replace")

    if not parser.can_parse(text):
        raise HTTPException(400, "File does not contain valid SQL DDL (no CREATE TABLE found)")

    save_path = UPLOAD_DIR / file.filename
    save_path.write_text(text)

    name = file.filename.replace(".sql", "").replace("_schema", "")
    schema = parser.parse(text, schema_name=name)

    return UploadResponse(
        filename=file.filename,
        tables_found=len(schema.tables),
        table_names=schema.table_names,
        schema_preview=schema.to_dict(),
    )


@router.post("/detect")
async def detect_and_parse(file: UploadFile = File(...)):
    """Auto-detect schema format, parse, and return preview."""
    if not file.filename:
        raise HTTPException(400, "No filename provided")

    content = await file.read()
    text = content.decode("utf-8", errors="replace")

    # Auto-detect format
    detected_format = "unknown"
    if parser.can_parse(text):
        detected_format = "sql_ddl"
    elif "model" in text and "datasource" in text:
        detected_format = "prisma"
    elif '"type"' in text and '"properties"' in text:
        detected_format = "json_schema"

    if detected_format == "unknown":
        raise HTTPException(400, "Could not detect schema format. Supported: SQL DDL, Prisma, JSON Schema")

    if detected_format != "sql_ddl":
        raise HTTPException(400, f"Detected format '{detected_format}' — only SQL DDL is supported in this version")

    save_path = UPLOAD_DIR / file.filename
    save_path.write_text(text)

    name = file.filename.replace(".sql", "").replace("_schema", "")
    schema = parser.parse(text, schema_name=name)

    return {
        "filename": file.filename,
        "detected_format": detected_format,
        "tables_found": len(schema.tables),
        "table_names": schema.table_names,
        "total_columns": sum(len(t.columns) for t in schema.tables),
        "total_foreign_keys": sum(len(t.foreign_keys) for t in schema.tables),
        "schema_preview": schema.to_dict(),
    }