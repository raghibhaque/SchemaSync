"""Suggestions route — near-miss matches for unmatched columns."""

from fastapi import APIRouter
from pydantic import BaseModel

from backend.api.errors import ErrorCode, ErrorResponse, api_error, ParseErrorDetail
from backend.api.models.requests import ReconcileRequest
from backend.core.parsers.sql_ddl import SQLDDLParser
from backend.core.reconciliation.engine import ReconciliationEngine
from backend.core.reconciliation.scorer import score_column_pair
from backend.config import DEMO_DIR

router = APIRouter(prefix="/suggestions", tags=["suggestions"])
parser = SQLDDLParser()
engine = ReconciliationEngine()

_ERR = {
    400: {"model": ErrorResponse, "description": "Parse error or invalid input"},
    422: {"model": ErrorResponse, "description": "Request validation failed"},
    500: {"model": ErrorResponse, "description": "Internal server error"},
}

_TOP_K = 3


class ColumnSuggestion(BaseModel):
    candidate_column: str
    candidate_table: str
    combined_score: float
    structural_score: float
    semantic_score: float
    match_reason: str


class UnmatchedColumnEntry(BaseModel):
    column: str
    table: str
    side: str  # "source" | "target"
    col_type: str
    suggestions: list[ColumnSuggestion]


class SuggestionsResponse(BaseModel):
    source_schema: str
    target_schema: str
    unmatched_source: list[UnmatchedColumnEntry]
    unmatched_target: list[UnmatchedColumnEntry]
    total_unmatched: int


def _top_suggestions(col, col_table, candidates, candidate_side: str, top_k: int) -> list[ColumnSuggestion]:
    scored = []
    for tbl in candidates:
        for cand_col in tbl.columns:
            scores = score_column_pair(col, cand_col, col_table.name, tbl.name)
            scored.append(ColumnSuggestion(
                candidate_column=cand_col.name,
                candidate_table=tbl.name,
                combined_score=round(scores["combined_score"], 4),
                structural_score=round(scores["structural_score"], 4),
                semantic_score=round(scores["semantic_score"], 4),
                match_reason=scores["match_reason"],
            ))
    scored.sort(key=lambda s: s.combined_score, reverse=True)
    return scored[:top_k]


def _build_suggestions(source, target, result) -> SuggestionsResponse:
    matched_src: dict[str, set[str]] = {}
    matched_tgt: dict[str, set[str]] = {}

    for tm in result.table_mappings:
        matched_src.setdefault(tm.source_table, set()).update(
            cm.source_column for cm in tm.column_mappings
        )
        matched_tgt.setdefault(tm.target_table, set()).update(
            cm.target_column for cm in tm.column_mappings
        )

    unmatched_source: list[UnmatchedColumnEntry] = []
    for tm in result.table_mappings:
        src_table = source.get_table(tm.source_table)
        if not src_table:
            continue
        for col_name in tm.unmatched_source:
            col = src_table.get_column(col_name)
            if not col:
                continue
            unmatched_source.append(UnmatchedColumnEntry(
                column=col_name,
                table=tm.source_table,
                side="source",
                col_type=col.col_type.value,
                suggestions=_top_suggestions(col, src_table, target.tables, "target", _TOP_K),
            ))

    unmatched_target: list[UnmatchedColumnEntry] = []
    for tm in result.table_mappings:
        tgt_table = target.get_table(tm.target_table)
        if not tgt_table:
            continue
        for col_name in tm.unmatched_target:
            col = tgt_table.get_column(col_name)
            if not col:
                continue
            unmatched_target.append(UnmatchedColumnEntry(
                column=col_name,
                table=tm.target_table,
                side="target",
                col_type=col.col_type.value,
                suggestions=_top_suggestions(col, tgt_table, source.tables, "source", _TOP_K),
            ))

    return SuggestionsResponse(
        source_schema=source.name,
        target_schema=target.name,
        unmatched_source=unmatched_source,
        unmatched_target=unmatched_target,
        total_unmatched=len(unmatched_source) + len(unmatched_target),
    )


@router.post("/unmatched", response_model=SuggestionsResponse, responses=_ERR)
async def suggest_unmatched(req: ReconcileRequest):
    if not parser.can_parse(req.source_sql):
        api_error(400, ErrorCode.PARSE_ERROR, "Source SQL has no CREATE TABLE statements",
                  detail=ParseErrorDetail(hint="Add at least one CREATE TABLE statement"))
    if not parser.can_parse(req.target_sql):
        api_error(400, ErrorCode.PARSE_ERROR, "Target SQL has no CREATE TABLE statements",
                  detail=ParseErrorDetail(hint="Add at least one CREATE TABLE statement"))

    source = parser.parse(req.source_sql, schema_name=req.source_name)
    target = parser.parse(req.target_sql, schema_name=req.target_name)
    result = engine.reconcile(source, target)
    return _build_suggestions(source, target, result)


@router.get("/demo/unmatched", response_model=SuggestionsResponse, responses=_ERR)
async def suggest_demo_unmatched():
    ghost_path = DEMO_DIR / "ghost_schema.sql"
    wp_path = DEMO_DIR / "wordpress_schema.sql"
    if not ghost_path.exists() or not wp_path.exists():
        api_error(500, ErrorCode.INTERNAL_ERROR, "Demo schema files not found")

    source = parser.parse(ghost_path.read_text(), schema_name="ghost")
    target = parser.parse(wp_path.read_text(), schema_name="wordpress")
    result = engine.reconcile(source, target)
    return _build_suggestions(source, target, result)
