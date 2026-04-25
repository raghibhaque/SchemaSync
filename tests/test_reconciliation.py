"""Pytest suite for the reconciliation engine (#36)."""

import pytest
from backend.core.parsers.sql_ddl import SQLDDLParser
from backend.core.reconciliation.engine import ReconciliationEngine
from backend.core.codegen.dialects import SQLDialect
from backend.core.ir.models import Schema, Table, Column, ColumnType

parser = SQLDDLParser()
engine = ReconciliationEngine()


# ── Fixtures ─────────────────────────────────────────────────────────────────

IDENTICAL_SQL = """
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100),
    created_at TIMESTAMP
);
"""

RENAMED_SQL = """
CREATE TABLE accounts (
    account_id INT PRIMARY KEY AUTO_INCREMENT,
    email_address VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    registered_at TIMESTAMP
);
"""

ECOMMERCE_SOURCE = """
CREATE TABLE users (id INT PRIMARY KEY, email VARCHAR(255));
CREATE TABLE orders (id INT PRIMARY KEY, user_id INT, total DECIMAL(10,2));
CREATE TABLE products (id INT PRIMARY KEY, name VARCHAR(255), price DECIMAL(10,2));
"""

ECOMMERCE_TARGET = """
CREATE TABLE accounts (account_id INT PRIMARY KEY, email_address VARCHAR(255));
CREATE TABLE purchase_orders (order_id INT PRIMARY KEY, account_id INT, subtotal DECIMAL(12,2));
CREATE TABLE product_catalog (product_id INT PRIMARY KEY, product_name VARCHAR(255), list_price DECIMAL(12,2));
"""


# ── Basic matching ────────────────────────────────────────────────────────────

def test_identical_schema_matches_all(parser=parser, engine=engine):
    source = parser.parse(IDENTICAL_SQL, "src")
    target = parser.parse(IDENTICAL_SQL, "tgt")
    result = engine.reconcile(source, target)
    assert len(result.table_mappings) == 1
    assert result.unmatched_source_tables == []
    assert result.unmatched_target_tables == []


def test_identical_schema_high_confidence(parser=parser, engine=engine):
    source = parser.parse(IDENTICAL_SQL, "src")
    target = parser.parse(IDENTICAL_SQL, "tgt")
    result = engine.reconcile(source, target)
    assert result.table_mappings[0].combined_score >= 0.90


def test_renamed_table_matched(parser=parser, engine=engine):
    source = parser.parse(IDENTICAL_SQL, "src")
    target = parser.parse(RENAMED_SQL, "tgt")
    result = engine.reconcile(source, target)
    assert len(result.table_mappings) == 1
    tm = result.table_mappings[0]
    assert tm.source_table == "users"
    assert tm.target_table == "accounts"


def test_renamed_columns_matched(parser=parser, engine=engine):
    source = parser.parse(IDENTICAL_SQL, "src")
    target = parser.parse(RENAMED_SQL, "tgt")
    result = engine.reconcile(source, target)
    tm = result.table_mappings[0]
    src_to_tgt = {cm.source_column: cm.target_column for cm in tm.column_mappings}
    assert src_to_tgt.get("id") == "account_id"
    assert src_to_tgt.get("email") == "email_address"


def test_multi_table_all_matched(parser=parser, engine=engine):
    source = parser.parse(ECOMMERCE_SOURCE, "src")
    target = parser.parse(ECOMMERCE_TARGET, "tgt")
    result = engine.reconcile(source, target)
    assert len(result.table_mappings) == 3
    assert result.unmatched_source_tables == []
    assert result.unmatched_target_tables == []


# ── Unmatched tables ──────────────────────────────────────────────────────────

def test_extra_target_table_unmatched(parser=parser, engine=engine):
    source = parser.parse("CREATE TABLE users (id INT);", "src")
    target = parser.parse("""
        CREATE TABLE accounts (account_id INT);
        CREATE TABLE audit_log (id INT, action VARCHAR(100));
    """, "tgt")
    result = engine.reconcile(source, target)
    assert len(result.unmatched_target_tables) == 1
    assert "audit_log" in result.unmatched_target_tables


def test_extra_source_table_unmatched(parser=parser, engine=engine):
    source = parser.parse("""
        CREATE TABLE users (id INT);
        CREATE TABLE legacy_data (id INT, payload TEXT);
    """, "src")
    target = parser.parse("CREATE TABLE accounts (account_id INT);", "tgt")
    result = engine.reconcile(source, target)
    assert "legacy_data" in result.unmatched_source_tables


# ── Column mappings ───────────────────────────────────────────────────────────

def test_pk_column_maps_to_pk(parser=parser, engine=engine):
    source = parser.parse("CREATE TABLE t (id INT PRIMARY KEY);", "src")
    target = parser.parse("CREATE TABLE t (id INT PRIMARY KEY);", "tgt")
    result = engine.reconcile(source, target)
    tm = result.table_mappings[0]
    assert any(cm.source_column == "id" and cm.target_column == "id" for cm in tm.column_mappings)


def test_unmatched_columns_reported(parser=parser, engine=engine):
    source = parser.parse("CREATE TABLE t (id INT, extra_col TEXT);", "src")
    target = parser.parse("CREATE TABLE t (id INT);", "tgt")
    result = engine.reconcile(source, target)
    tm = result.table_mappings[0]
    assert "extra_col" in tm.unmatched_source


# ── Summary ───────────────────────────────────────────────────────────────────

def test_summary_fields_present(parser=parser, engine=engine):
    source = parser.parse(ECOMMERCE_SOURCE, "src")
    target = parser.parse(ECOMMERCE_TARGET, "tgt")
    result = engine.reconcile(source, target)
    s = result.summary
    assert "tables_matched" in s
    assert "columns_matched" in s
    assert "avg_confidence" in s
    assert "confidence_distribution" in s
    assert s["tables_matched"] == 3


def test_elapsed_seconds_populated(parser=parser, engine=engine):
    source = parser.parse(IDENTICAL_SQL, "src")
    target = parser.parse(IDENTICAL_SQL, "tgt")
    result = engine.reconcile(source, target)
    assert result.elapsed_seconds >= 0


# ── Conflict detection ────────────────────────────────────────────────────────

def test_type_mismatch_conflict_detected(parser=parser, engine=engine):
    source = parser.parse("CREATE TABLE t (id INT PRIMARY KEY, val INT);", "src")
    target = parser.parse("CREATE TABLE t (id INT PRIMARY KEY, val VARCHAR(100));", "tgt")
    result = engine.reconcile(source, target)
    conflict_types = {c.conflict_type for c in result.conflicts}
    assert "type_mismatch" in conflict_types


def test_no_conflicts_identical_schema(parser=parser, engine=engine):
    source = parser.parse(IDENTICAL_SQL, "src")
    target = parser.parse(IDENTICAL_SQL, "tgt")
    result = engine.reconcile(source, target)
    assert result.conflicts == []


# ── SQL generation ────────────────────────────────────────────────────────────

def test_migration_sql_generated(parser=parser, engine=engine):
    source = parser.parse(IDENTICAL_SQL, "src")
    target = parser.parse(RENAMED_SQL, "tgt")
    result = engine.reconcile(source, target)
    assert result.migration_sql is not None
    assert "CREATE TABLE" in result.migration_sql
    assert "BEGIN" in result.migration_sql
    assert "COMMIT" in result.migration_sql


def test_alter_sql_generated(parser=parser, engine=engine):
    source = parser.parse(IDENTICAL_SQL, "src")
    target = parser.parse(RENAMED_SQL, "tgt")
    result = engine.reconcile(source, target)
    assert result.migration_alter_sql is not None
    assert "ALTER TABLE" in result.migration_alter_sql or "RENAME" in result.migration_alter_sql


def test_rollback_sql_generated(parser=parser, engine=engine):
    source = parser.parse(IDENTICAL_SQL, "src")
    target = parser.parse(RENAMED_SQL, "tgt")
    result = engine.reconcile(source, target)
    assert result.rollback_sql is not None
    assert "ROLLBACK" in result.rollback_sql


@pytest.mark.parametrize("dialect", [SQLDialect.MYSQL, SQLDialect.POSTGRESQL, SQLDialect.SQLITE])
def test_dialect_in_migration_header(dialect, parser=parser, engine=engine):
    source = parser.parse(IDENTICAL_SQL, "src")
    target = parser.parse(RENAMED_SQL, "tgt")
    result = engine.reconcile(source, target, dialect=dialect)
    assert dialect.value in result.migration_sql


def test_postgresql_serial_type(parser=parser, engine=engine):
    source = parser.parse("CREATE TABLE t (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100));", "src")
    target = parser.parse("CREATE TABLE t (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100));", "tgt")
    result = engine.reconcile(source, target, dialect=SQLDialect.POSTGRESQL)
    assert "SERIAL" in result.migration_sql


# ── to_dict round-trip ────────────────────────────────────────────────────────

def test_result_to_dict_structure(parser=parser, engine=engine):
    source = parser.parse(ECOMMERCE_SOURCE, "src")
    target = parser.parse(ECOMMERCE_TARGET, "tgt")
    result = engine.reconcile(source, target)
    d = result.to_dict()
    assert "summary" in d
    assert "table_mappings" in d
    assert "conflicts" in d
    assert "migration_sql" in d
    assert len(d["table_mappings"]) == 3


def test_confidence_tier_in_table_mapping_dict(parser=parser, engine=engine):
    source = parser.parse(IDENTICAL_SQL, "src")
    target = parser.parse(IDENTICAL_SQL, "tgt")
    result = engine.reconcile(source, target)
    tm_dict = result.table_mappings[0].to_dict()
    assert "confidence_tier" in tm_dict
    assert tm_dict["confidence_tier"] in {"exact", "high", "medium", "low", "uncertain"}
