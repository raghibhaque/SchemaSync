"""
Schema structural validator.

Checks a single parsed Schema for consistency issues and returns a list of
ValidationIssue objects with severity, location, and a human-readable message.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from backend.core.ir.models import Schema


@dataclass
class ValidationIssue:
    severity: str           # "error" | "warning" | "info"
    table: Optional[str]
    column: Optional[str]
    code: str
    message: str

    def to_dict(self) -> dict:
        return {
            "severity": self.severity,
            "table": self.table,
            "column": self.column,
            "code": self.code,
            "message": self.message,
        }


def validate_schema(schema: Schema) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []

    table_names: set[str] = set()
    for table in schema.tables:
        # Duplicate table names
        if table.name in table_names:
            issues.append(ValidationIssue(
                severity="error",
                table=table.name,
                column=None,
                code="DUPLICATE_TABLE",
                message=f"Table '{table.name}' is defined more than once.",
            ))
        table_names.add(table.name)

        # Table with no columns
        if not table.columns:
            issues.append(ValidationIssue(
                severity="error",
                table=table.name,
                column=None,
                code="EMPTY_TABLE",
                message=f"Table '{table.name}' has no columns.",
            ))
            continue

        # No primary key
        has_pk = any(c.is_primary_key for c in table.columns) or bool(table.primary_key)
        if not has_pk:
            issues.append(ValidationIssue(
                severity="warning",
                table=table.name,
                column=None,
                code="NO_PRIMARY_KEY",
                message=f"Table '{table.name}' has no primary key.",
            ))

        col_names: set[str] = set()
        for col in table.columns:
            # Duplicate column names within a table
            if col.name in col_names:
                issues.append(ValidationIssue(
                    severity="error",
                    table=table.name,
                    column=col.name,
                    code="DUPLICATE_COLUMN",
                    message=f"Column '{col.name}' is defined more than once in '{table.name}'.",
                ))
            col_names.add(col.name)

            # FK points to non-existent table (checked after full scan below)

    # Second pass: FK referential integrity
    for table in schema.tables:
        for col in table.columns:
            if col.foreign_key is not None:
                ref_table = col.foreign_key.target_table
                if ref_table not in table_names:
                    issues.append(ValidationIssue(
                        severity="error",
                        table=table.name,
                        column=col.name,
                        code="UNRESOLVED_FK",
                        message=(
                            f"Column '{table.name}.{col.name}' references unknown table '{ref_table}'."
                        ),
                    ))
                else:
                    # Check target column exists
                    target = next((t for t in schema.tables if t.name == ref_table), None)
                    if target and col.foreign_key.target_column not in {c.name for c in target.columns}:
                        issues.append(ValidationIssue(
                            severity="error",
                            table=table.name,
                            column=col.name,
                            code="UNRESOLVED_FK_COLUMN",
                            message=(
                                f"Column '{table.name}.{col.name}' references unknown column "
                                f"'{ref_table}.{col.foreign_key.target_column}'."
                            ),
                        ))

    return issues
