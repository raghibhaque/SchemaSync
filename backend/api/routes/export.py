"""Export route — download generated migration SQL."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse
from backend.api.models.requests import ReconcileRequest, DemoRequest
from backend.api.models.responses import ExportResponse
from backend.core.parsers.sql_ddl import SQLDDLParser
from backend.core.reconciliation.engine import ReconciliationEngine
from backend.config import DEMO_DIR

router = APIRouter(prefix="/export", tags=["export"])
parser = SQLDDLParser()
engine = ReconciliationEngine()


@router.post("/sql", response_model=ExportResponse)
async def export_migration_sql(req: ReconcileRequest):
    source_schema = parser.parse(req.source_sql, schema_name=req.source_name)
    target_schema = parser.parse(req.target_sql, schema_name=req.target_name)
    result = engine.reconcile(source_schema, target_schema)

    return ExportResponse(
        sql=result.migration_sql or "-- No migration generated",
        filename=f"migration_{req.source_name}_to_{req.target_name}.sql",
    )


@router.get("/demo/sql")
async def export_demo_sql():
    ghost_sql = (DEMO_DIR / "ghost_schema.sql").read_text()
    wp_sql = (DEMO_DIR / "wordpress_schema.sql").read_text()

    source = parser.parse(ghost_sql, schema_name="ghost")
    target = parser.parse(wp_sql, schema_name="wordpress")
    result = engine.reconcile(source, target)

    return PlainTextResponse(
        content=result.migration_sql or "-- No migration generated",
        media_type="text/sql",
        headers={"Content-Disposition": "attachment; filename=migration_ghost_to_wordpress.sql"},
    )