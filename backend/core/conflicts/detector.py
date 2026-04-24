"""
Conflict Detector — identifies incompatibilities between matched fields.
"""

from backend.core.ir.models import (
    Schema, ReconciliationResult, Conflict, ColumnType,
)


def detect_conflicts(
    result: ReconciliationResult,
    source: Schema,
    target: Schema,
) -> list[Conflict]:
    conflicts: list[Conflict] = []

    for tm in result.table_mappings:
        src_table = source.get_table(tm.source_table)
        tgt_table = target.get_table(tm.target_table)
        if not src_table or not tgt_table:
            continue

        for cm in tm.column_mappings:
            src_col = src_table.get_column(cm.source_column)
            tgt_col = tgt_table.get_column(cm.target_column)
            if not src_col or not tgt_col:
                continue

            if src_col.col_type != tgt_col.col_type:
                severity = _type_mismatch_severity(src_col.col_type, tgt_col.col_type)
                conflicts.append(Conflict(
                    conflict_type="type_mismatch",
                    source_table=tm.source_table,
                    source_column=cm.source_column,
                    target_table=tm.target_table,
                    target_column=cm.target_column,
                    source_value=src_col.raw_type,
                    target_value=tgt_col.raw_type,
                    severity=severity,
                    suggestion=_type_suggestion(src_col.col_type, tgt_col.col_type),
                ))

            if src_col.nullable != tgt_col.nullable:
                conflicts.append(Conflict(
                    conflict_type="nullable_mismatch",
                    source_table=tm.source_table,
                    source_column=cm.source_column,
                    target_table=tm.target_table,
                    target_column=cm.target_column,
                    source_value=f"nullable={src_col.nullable}",
                    target_value=f"nullable={tgt_col.nullable}",
                    severity="warning",
                    suggestion="Consider aligning nullability — NOT NULL → NULL is safe, NULL → NOT NULL needs default",
                ))

            if (src_col.max_length is not None and tgt_col.max_length is not None
                    and src_col.max_length != tgt_col.max_length):
                severity = "warning" if src_col.max_length > tgt_col.max_length else "info"
                conflicts.append(Conflict(
                    conflict_type="length_mismatch",
                    source_table=tm.source_table,
                    source_column=cm.source_column,
                    target_table=tm.target_table,
                    target_column=cm.target_column,
                    source_value=f"length={src_col.max_length}",
                    target_value=f"length={tgt_col.max_length}",
                    severity=severity,
                    suggestion=f"Use the larger length: {max(src_col.max_length, tgt_col.max_length)}",
                ))

            if src_col.enum_values and tgt_col.enum_values:
                src_set = set(src_col.enum_values)
                tgt_set = set(tgt_col.enum_values)
                if src_set != tgt_set:
                    only_in_src = src_set - tgt_set
                    only_in_tgt = tgt_set - src_set
                    conflicts.append(Conflict(
                        conflict_type="enum_mismatch",
                        source_table=tm.source_table,
                        source_column=cm.source_column,
                        target_table=tm.target_table,
                        target_column=cm.target_column,
                        source_value=str(sorted(src_col.enum_values)),
                        target_value=str(sorted(tgt_col.enum_values)),
                        severity="warning",
                        suggestion=f"Source-only: {sorted(only_in_src)}, Target-only: {sorted(only_in_tgt)}",
                    ))

            if src_col.foreign_key and tgt_col.foreign_key:
                src_fk = src_col.foreign_key
                tgt_fk = tgt_col.foreign_key
                if src_fk.target_table != tgt_fk.target_table:
                    conflicts.append(Conflict(
                        conflict_type="fk_target_mismatch",
                        source_table=tm.source_table,
                        source_column=cm.source_column,
                        target_table=tm.target_table,
                        target_column=cm.target_column,
                        source_value=f"{src_fk.target_table}.{src_fk.target_column}",
                        target_value=f"{tgt_fk.target_table}.{tgt_fk.target_column}",
                        severity="warning",
                        suggestion="Foreign key targets differ — verify relationship mapping",
                    ))

    return conflicts


_COMPATIBLE_GROUPS = [
    {ColumnType.INTEGER, ColumnType.BIGINT, ColumnType.SMALLINT},
    {ColumnType.FLOAT, ColumnType.DOUBLE, ColumnType.DECIMAL},
    {ColumnType.VARCHAR, ColumnType.TEXT, ColumnType.CHAR},
    {ColumnType.DATETIME, ColumnType.TIMESTAMP},
]


def _type_mismatch_severity(a: ColumnType, b: ColumnType) -> str:
    for group in _COMPATIBLE_GROUPS:
        if a in group and b in group:
            return "info"
    return "warning"


def _type_suggestion(a: ColumnType, b: ColumnType) -> str:
    for group in _COMPATIBLE_GROUPS:
        if a in group and b in group:
            if ColumnType.BIGINT in {a, b}:
                return "Use BIGINT (wider integer type)"
            if ColumnType.DOUBLE in {a, b}:
                return "Use DOUBLE (wider float type)"
            if ColumnType.TEXT in {a, b}:
                return "Use TEXT (no length limit)"
            if ColumnType.TIMESTAMP in {a, b}:
                return "Use TIMESTAMP (includes timezone info)"
    return f"Manual review needed: {a.value} vs {b.value}"