"""
Prisma Schema Parser — parses Prisma .prisma files into our IR.

Handles:
  - model blocks → Tables
  - scalar fields (String, Int, BigInt, Float, Decimal, Boolean, DateTime, Json, Bytes)
  - optional fields (Type?) → nullable
  - list/relation fields (Type[]) → skipped (not real columns)
  - @id, @unique, @default(...), @updatedAt field attributes
  - @relation(fields: [...], references: [...]) → ForeignKey on scalar FK column
  - @@id([...]), @@unique([...]), @@index([...]) block attributes → composite keys/indexes
  - @@map("name") → preserves original table name
  - enum blocks → ColumnType.ENUM with values
"""

import re
from backend.core.parsers.base import BaseParser
from backend.core.ir.models import (
    Schema, Table, Column, Index, ForeignKey,
    ColumnType, ConstraintType, IndexType,
)
from backend.core.ir.normaliser import normalise_name, normalise_type


_PRISMA_SCALARS = frozenset({
    "string", "int", "bigint", "float", "decimal",
    "boolean", "datetime", "json", "bytes",
})

_PRISMA_TYPE_MAP: dict[str, str] = {
    "string":   "varchar",
    "int":      "integer",
    "bigint":   "bigint",
    "float":    "float",
    "decimal":  "decimal",
    "boolean":  "boolean",
    "datetime": "timestamp",
    "json":     "json",
    "bytes":    "blob",
}


class PrismaParser(BaseParser):

    def can_parse(self, content: str) -> bool:
        return bool(re.search(r"\bmodel\s+\w+\s*\{", content))

    def parse(self, content: str, schema_name: str = "") -> Schema:
        content = re.sub(r"//[^\n]*", "", content)
        content = re.sub(r"/\*.*?\*/", "", content, flags=re.S)

        enum_names = set(re.findall(r"\benum\s+(\w+)\s*\{", content))
        enum_values = self._extract_enums(content)

        tables = []
        for model_name, model_body in self._extract_model_blocks(content):
            table = self._parse_model(model_name, model_body, enum_names, enum_values)
            if table:
                tables.append(table)

        return Schema(
            name=schema_name or "unnamed",
            source_format="prisma",
            tables=tables,
        )

    # ── Block extraction ────────────────────────────────────────────────────

    def _extract_model_blocks(self, content: str) -> list[tuple[str, str]]:
        blocks = []
        for m in re.finditer(r"\bmodel\s+(\w+)\s*\{", content):
            name = m.group(1)
            start = m.end()
            depth = 1
            i = start
            while i < len(content) and depth > 0:
                if content[i] == "{":
                    depth += 1
                elif content[i] == "}":
                    depth -= 1
                i += 1
            blocks.append((name, content[start : i - 1]))
        return blocks

    def _extract_enums(self, content: str) -> dict[str, list[str]]:
        enums: dict[str, list[str]] = {}
        for m in re.finditer(r"\benum\s+(\w+)\s*\{([^}]*)\}", content, re.S):
            values = [
                line.strip()
                for line in m.group(2).splitlines()
                if line.strip()
            ]
            enums[m.group(1)] = values
        return enums

    # ── Model parsing ───────────────────────────────────────────────────────

    def _parse_model(
        self,
        raw_name: str,
        body: str,
        enum_names: set[str],
        enum_values: dict[str, list[str]],
    ) -> Table | None:
        table = Table(name=normalise_name(raw_name), raw_name=raw_name)

        # relation field name → (fk_col_names, ref_col_names, related_model)
        relations: dict[str, tuple[list[str], list[str], str]] = {}

        for line in body.splitlines():
            line = line.strip()
            if not line:
                continue

            if line.startswith("@@"):
                self._apply_block_attribute(line, table)
                continue

            result = self._parse_field_line(line, enum_names, enum_values)
            if result is None:
                continue
            if isinstance(result, tuple):
                # (relation_field_name, fk_fields, ref_fields, related_model)
                _, fk_fields, ref_fields, related_model = result
                for fk_col in fk_fields:
                    relations[fk_col] = (fk_fields, ref_fields, related_model)
            else:
                table.columns.append(result)

        # Attach FK metadata to scalar FK columns
        for col in table.columns:
            if col.raw_name in relations:
                _, ref_cols, related_model = relations[col.raw_name]
                col.foreign_key = ForeignKey(
                    target_table=normalise_name(related_model),
                    target_column=normalise_name(ref_cols[0]) if ref_cols else "id",
                )

        table.primary_key = [c.name for c in table.columns if c.is_primary_key]
        return table if table.columns else None

    # ── Field parsing ───────────────────────────────────────────────────────

    def _parse_field_line(
        self,
        line: str,
        enum_names: set[str],
        enum_values: dict[str, list[str]],
    ):
        """Return a Column, a relation tuple, or None.

        Relation tuple: (field_name, fk_fields, ref_fields, related_model)
        """
        m = re.match(r"^(\w+)\s+(\w+)(\??)(\[\])?(.*)$", line)
        if not m:
            return None

        field_name = m.group(1)
        type_name = m.group(2)
        is_optional = bool(m.group(3))
        is_list = bool(m.group(4))
        attrs = m.group(5).strip()

        # List fields are always virtual relation sides — no column in DB
        if is_list:
            return None

        type_lower = type_name.lower()
        is_scalar = type_lower in _PRISMA_SCALARS
        is_enum = type_name in enum_names

        if not is_scalar and not is_enum:
            # Model reference field — may carry @relation metadata
            rel = self._parse_relation_attr(attrs)
            if rel:
                fk_fields, ref_fields = rel
                return (field_name, fk_fields, ref_fields, type_name)
            return None

        if is_enum:
            col_type = ColumnType.ENUM
            raw_type = "enum"
            e_vals = enum_values.get(type_name, [])
        else:
            raw_type = _PRISMA_TYPE_MAP.get(type_lower, type_lower)
            col_type = normalise_type(raw_type)
            e_vals = []

        col = Column(
            name=normalise_name(field_name),
            raw_name=field_name,
            col_type=col_type,
            raw_type=raw_type,
            nullable=is_optional,
            enum_values=e_vals,
        )

        if not is_optional:
            col.constraints.append(ConstraintType.NOT_NULL)

        self._apply_field_attrs(attrs, col)
        return col

    def _parse_relation_attr(self, attrs: str) -> tuple[list[str], list[str]] | None:
        m = re.search(r"@relation\s*\(([^)]*)\)", attrs)
        if not m:
            return None
        inner = m.group(1)
        fm = re.search(r"fields:\s*\[([^\]]*)\]", inner)
        rm = re.search(r"references:\s*\[([^\]]*)\]", inner)
        if not fm or not rm:
            return None
        fields = [x.strip() for x in fm.group(1).split(",") if x.strip()]
        refs = [x.strip() for x in rm.group(1).split(",") if x.strip()]
        return fields, refs

    def _apply_field_attrs(self, attrs: str, col: Column) -> None:
        if re.search(r"@id\b", attrs):
            col.is_primary_key = True
            col.nullable = False
            if ConstraintType.NOT_NULL not in col.constraints:
                col.constraints.append(ConstraintType.NOT_NULL)
            col.constraints.append(ConstraintType.PRIMARY_KEY)

        if re.search(r"@unique\b", attrs):
            col.is_unique = True
            if ConstraintType.UNIQUE not in col.constraints:
                col.constraints.append(ConstraintType.UNIQUE)

        dm = re.search(r"@default\((.+?)\)(?=\s|$)", attrs)
        if dm:
            val = dm.group(1).strip()
            if val == "autoincrement()":
                col.is_auto_increment = True
            else:
                col.default_value = val.strip("\"'")
                col.constraints.append(ConstraintType.DEFAULT)

        if re.search(r"@updatedAt\b", attrs):
            if col.default_value is None:
                col.default_value = "now()"

    # ── Block attributes ────────────────────────────────────────────────────

    def _apply_block_attribute(self, line: str, table: Table) -> None:
        if line.startswith("@@id"):
            for cname in self._extract_bracketed_names(line):
                col = table.get_column(normalise_name(cname))
                if col:
                    col.is_primary_key = True
                    col.nullable = False
                    if ConstraintType.PRIMARY_KEY not in col.constraints:
                        col.constraints.append(ConstraintType.PRIMARY_KEY)

        elif line.startswith("@@unique"):
            cols = self._extract_bracketed_names(line)
            if cols:
                table.indexes.append(Index(
                    name=normalise_name(f"uq_{'_'.join(cols)}"),
                    columns=[normalise_name(c) for c in cols],
                    index_type=IndexType.UNIQUE,
                    is_unique=True,
                ))

        elif line.startswith("@@index"):
            cols = self._extract_bracketed_names(line)
            if cols:
                table.indexes.append(Index(
                    name=normalise_name(f"idx_{'_'.join(cols)}"),
                    columns=[normalise_name(c) for c in cols],
                    index_type=IndexType.BTREE,
                    is_unique=False,
                ))

        elif line.startswith("@@map"):
            m = re.search(r'@@map\s*\(\s*["\']([^"\']+)["\']\s*\)', line)
            if m:
                table.raw_name = m.group(1)

    def _extract_bracketed_names(self, line: str) -> list[str]:
        m = re.search(r"\[([^\]]*)\]", line)
        if not m:
            return []
        return [x.strip() for x in m.group(1).split(",") if x.strip()]
