"""Graph export route — schema and reconciliation result as nodes/edges JSON."""

from fastapi import APIRouter
from pydantic import BaseModel

from backend.api.errors import ErrorCode, ErrorResponse, api_error, ParseErrorDetail
from backend.api.models.requests import ReconcileRequest, DemoRequest
from backend.core.parsers.sql_ddl import SQLDDLParser
from backend.core.reconciliation.engine import ReconciliationEngine
from backend.config import DEMO_DIR

router = APIRouter(prefix="/graph", tags=["graph"])
parser = SQLDDLParser()
engine = ReconciliationEngine()

_ERR = {
    400: {"model": ErrorResponse, "description": "Parse error or invalid input"},
    422: {"model": ErrorResponse, "description": "Request validation failed"},
    500: {"model": ErrorResponse, "description": "Internal server error"},
}


class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # "table" | "column"
    group: str  # "source" | "target"
    meta: dict = {}


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str  # "foreign_key" | "mapping" | "column_of"
    weight: float = 1.0
    meta: dict = {}


class GraphResponse(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]
    source_schema: str
    target_schema: str


def _build_graph(source, target, result) -> GraphResponse:
    nodes: list[GraphNode] = []
    edges: list[GraphEdge] = []

    for schema, group in ((source, "source"), (target, "target")):
        for tbl in schema.tables:
            tbl_id = f"{group}:{tbl.name}"
            nodes.append(GraphNode(
                id=tbl_id,
                label=tbl.name,
                type="table",
                group=group,
                meta={"column_count": len(tbl.columns)},
            ))
            for col in tbl.columns:
                col_id = f"{group}:{tbl.name}.{col.name}"
                nodes.append(GraphNode(
                    id=col_id,
                    label=col.name,
                    type="column",
                    group=group,
                    meta={
                        "col_type": col.col_type.value,
                        "nullable": col.nullable,
                        "is_primary_key": col.is_primary_key,
                    },
                ))
                edges.append(GraphEdge(
                    id=f"col_of:{col_id}",
                    source=tbl_id,
                    target=col_id,
                    type="column_of",
                ))
                if col.foreign_key:
                    fk = col.foreign_key
                    fk_target_id = f"{group}:{fk.target_table}.{fk.target_column}"
                    edges.append(GraphEdge(
                        id=f"fk:{col_id}->{fk_target_id}",
                        source=col_id,
                        target=fk_target_id,
                        type="foreign_key",
                        meta={"on_delete": fk.on_delete},
                    ))

    for tm in result.table_mappings:
        src_id = f"source:{tm.source_table}"
        tgt_id = f"target:{tm.target_table}"
        edges.append(GraphEdge(
            id=f"map:{src_id}->{tgt_id}",
            source=src_id,
            target=tgt_id,
            type="mapping",
            weight=tm.combined_score,
            meta={
                "combined_score": round(tm.combined_score, 4),
                "match_reason": tm.match_reason,
            },
        ))
        for cm in tm.column_mappings:
            src_col_id = f"source:{tm.source_table}.{cm.source_column}"
            tgt_col_id = f"target:{tm.target_table}.{cm.target_column}"
            edges.append(GraphEdge(
                id=f"map:{src_col_id}->{tgt_col_id}",
                source=src_col_id,
                target=tgt_col_id,
                type="mapping",
                weight=cm.combined_score,
                meta={"combined_score": round(cm.combined_score, 4)},
            ))

    return GraphResponse(
        nodes=nodes,
        edges=edges,
        source_schema=source.name,
        target_schema=target.name,
    )


@router.post("/reconcile", response_model=GraphResponse, responses=_ERR)
async def graph_reconcile(req: ReconcileRequest):
    if not parser.can_parse(req.source_sql):
        api_error(400, ErrorCode.PARSE_ERROR, "Source SQL has no CREATE TABLE statements",
                  detail=ParseErrorDetail(hint="Add at least one CREATE TABLE statement"))
    if not parser.can_parse(req.target_sql):
        api_error(400, ErrorCode.PARSE_ERROR, "Target SQL has no CREATE TABLE statements",
                  detail=ParseErrorDetail(hint="Add at least one CREATE TABLE statement"))

    source = parser.parse(req.source_sql, schema_name=req.source_name)
    target = parser.parse(req.target_sql, schema_name=req.target_name)
    result = engine.reconcile(source, target)
    return _build_graph(source, target, result)


@router.get("/demo", response_model=GraphResponse, responses=_ERR)
async def graph_demo():
    ghost_path = DEMO_DIR / "ghost_schema.sql"
    wp_path = DEMO_DIR / "wordpress_schema.sql"
    if not ghost_path.exists() or not wp_path.exists():
        api_error(500, ErrorCode.INTERNAL_ERROR, "Demo schema files not found")

    source = parser.parse(ghost_path.read_text(), schema_name="ghost")
    target = parser.parse(wp_path.read_text(), schema_name="wordpress")
    result = engine.reconcile(source, target)
    return _build_graph(source, target, result)


@router.get("/demo/messy", response_model=GraphResponse, responses=_ERR)
async def graph_demo_messy():
    legacy_path = DEMO_DIR / "messy_legacy_schema.sql"
    modern_path = DEMO_DIR / "messy_modern_schema.sql"
    if not legacy_path.exists() or not modern_path.exists():
        api_error(500, ErrorCode.INTERNAL_ERROR, "Messy demo schema files not found")

    source = parser.parse(legacy_path.read_text(), schema_name="legacy_shop")
    target = parser.parse(modern_path.read_text(), schema_name="modern_shop")
    result = engine.reconcile(source, target)
    return _build_graph(source, target, result)
