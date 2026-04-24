"""
Normaliser — standardises table/column names and maps vendor SQL types
to canonical ColumnType values.

Called by every parser after initial extraction.
"""

import re
from backend.core.ir.models import ColumnType


# ── Name normalisation ───────────────────────────────────────────────────

def normalise_name(raw: str) -> str:
    name = raw.strip()
    name = re.sub(r"[`\"\[\]']", "", name)
    name = name.lower()
    name = re.sub(r"[\s\-\.]+", "_", name)
    name = re.sub(r"_+", "_", name)
    return name.strip("_")


def strip_table_prefix(column_name: str, table_name: str) -> str:
    singular = table_name.rstrip("s")
    for prefix in [table_name + "_", singular + "_"]:
        if column_name.startswith(prefix) and len(column_name) > len(prefix):
            return column_name[len(prefix):]
    return column_name


# ── Type normalisation ───────────────────────────────────────────────────

_TYPE_MAP: list[tuple[re.Pattern, ColumnType]] = [
    (re.compile(r"uuid|uniqueidentifier", re.I), ColumnType.UUID),
    (re.compile(r"json|jsonb", re.I), ColumnType.JSON),
    (re.compile(r"bool|boolean|tinyint\(1\)", re.I), ColumnType.BOOLEAN),
    (re.compile(r"bigint|int8", re.I), ColumnType.BIGINT),
    (re.compile(r"smallint|int2|tinyint|mediumint", re.I), ColumnType.SMALLINT),
    (re.compile(r"int|integer|int4|serial", re.I), ColumnType.INTEGER),
    (re.compile(r"double|float8|real", re.I), ColumnType.DOUBLE),
    (re.compile(r"float|float4", re.I), ColumnType.FLOAT),
    (re.compile(r"decimal|numeric|money", re.I), ColumnType.DECIMAL),
    (re.compile(r"timestamp|timestamptz|datetime", re.I), ColumnType.TIMESTAMP),
    (re.compile(r"^date$", re.I), ColumnType.DATE),
    (re.compile(r"^time$|timetz", re.I), ColumnType.TIME),
    (re.compile(r"blob|bytea|binary|varbinary|longblob|mediumblob|tinyblob", re.I), ColumnType.BLOB),
    (re.compile(r"char\b", re.I), ColumnType.CHAR),
    (re.compile(r"varchar|character varying|nvarchar", re.I), ColumnType.VARCHAR),
    (re.compile(r"text|longtext|mediumtext|tinytext|clob|ntext", re.I), ColumnType.TEXT),
    (re.compile(r"enum|set", re.I), ColumnType.ENUM),
]


def normalise_type(raw_type: str) -> ColumnType:
    cleaned = raw_type.strip()
    for pattern, col_type in _TYPE_MAP:
        if pattern.search(cleaned):
            return col_type
    return ColumnType.UNKNOWN


def extract_length(raw_type: str) -> int | None:
    m = re.search(r"\((\d+)\)", raw_type)
    return int(m.group(1)) if m else None


def extract_precision_scale(raw_type: str) -> tuple[int | None, int | None]:
    m = re.search(r"\((\d+)\s*,\s*(\d+)\)", raw_type)
    if m:
        return int(m.group(1)), int(m.group(2))
    return None, None


def extract_enum_values(raw_type: str) -> list[str]:
    m = re.search(r"enum\s*\((.+)\)", raw_type, re.I)
    if m:
        inner = m.group(1)
        return [v.strip().strip("'\"") for v in inner.split(",")]
    return []