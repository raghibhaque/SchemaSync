"""Pytest suite for the SQL DDL parser (#35)."""

import pytest
from backend.core.parsers.sql_ddl import SQLDDLParser
from backend.core.ir.models import ColumnType, Schema


@pytest.fixture
def parser():
    return SQLDDLParser()


# ── can_parse ────────────────────────────────────────────────────────────────

def test_can_parse_basic_create(parser):
    assert parser.can_parse("CREATE TABLE foo (id INT);")


def test_can_parse_case_insensitive(parser):
    assert parser.can_parse("create table foo (id int);")


def test_cannot_parse_empty(parser):
    assert not parser.can_parse("")


def test_cannot_parse_insert_only(parser):
    assert not parser.can_parse("INSERT INTO foo VALUES (1);")


# ── Basic table parsing ───────────────────────────────────────────────────────

def test_parse_single_table(parser):
    sql = "CREATE TABLE users (id INT, name VARCHAR(100));"
    schema = parser.parse(sql, schema_name="test")
    assert len(schema.tables) == 1
    assert schema.tables[0].name == "users"


def test_parse_schema_name(parser):
    schema = parser.parse("CREATE TABLE t (id INT);", schema_name="mydb")
    assert schema.name == "mydb"


def test_parse_multiple_tables(parser):
    sql = """
    CREATE TABLE users (id INT PRIMARY KEY);
    CREATE TABLE posts (id INT PRIMARY KEY, user_id INT);
    CREATE TABLE comments (id INT PRIMARY KEY, post_id INT);
    """
    schema = parser.parse(sql)
    assert len(schema.tables) == 3
    names = {t.name for t in schema.tables}
    assert names == {"users", "posts", "comments"}


# ── Column types ─────────────────────────────────────────────────────────────

@pytest.mark.parametrize("sql_type,expected", [
    ("INT", ColumnType.INTEGER),
    ("INTEGER", ColumnType.INTEGER),
    ("BIGINT", ColumnType.BIGINT),
    ("SMALLINT", ColumnType.SMALLINT),
    ("VARCHAR(255)", ColumnType.VARCHAR),
    ("TEXT", ColumnType.TEXT),
    ("BOOLEAN", ColumnType.BOOLEAN),
    ("TINYINT(1)", ColumnType.BOOLEAN),
    ("DECIMAL(10,2)", ColumnType.DECIMAL),
    ("FLOAT", ColumnType.FLOAT),
    ("DOUBLE", ColumnType.DOUBLE),
    ("DATE", ColumnType.DATE),
    ("DATETIME", ColumnType.TIMESTAMP),  # parser normalises DATETIME → TIMESTAMP
    ("TIMESTAMP", ColumnType.TIMESTAMP),
    ("JSON", ColumnType.JSON),
    ("BLOB", ColumnType.BLOB),
])
def test_column_type_mapping(parser, sql_type, expected):
    sql = f"CREATE TABLE t (col {sql_type});"
    schema = parser.parse(sql)
    col = schema.tables[0].columns[0]
    assert col.col_type == expected, f"{sql_type} should map to {expected}, got {col.col_type}"


# ── Constraints ───────────────────────────────────────────────────────────────

def test_primary_key_inline(parser):
    schema = parser.parse("CREATE TABLE t (id INT PRIMARY KEY);")
    col = schema.tables[0].get_column("id")
    assert col is not None
    assert col.is_primary_key


def test_auto_increment(parser):
    schema = parser.parse("CREATE TABLE t (id INT PRIMARY KEY AUTO_INCREMENT);")
    col = schema.tables[0].get_column("id")
    assert col.is_auto_increment


def test_not_null(parser):
    schema = parser.parse("CREATE TABLE t (name VARCHAR(100) NOT NULL);")
    col = schema.tables[0].get_column("name")
    assert not col.nullable


def test_nullable_default(parser):
    schema = parser.parse("CREATE TABLE t (bio TEXT);")
    col = schema.tables[0].get_column("bio")
    assert col.nullable


def test_unique_constraint(parser):
    schema = parser.parse("CREATE TABLE t (email VARCHAR(255) UNIQUE);")
    col = schema.tables[0].get_column("email")
    assert col.is_unique


def test_default_value(parser):
    schema = parser.parse("CREATE TABLE t (status VARCHAR(20) DEFAULT 'active');")
    col = schema.tables[0].get_column("status")
    assert col.default_value is not None


# ── VARCHAR length ────────────────────────────────────────────────────────────

def test_varchar_max_length(parser):
    schema = parser.parse("CREATE TABLE t (name VARCHAR(150));")
    col = schema.tables[0].get_column("name")
    assert col.max_length == 150


# ── Foreign keys ──────────────────────────────────────────────────────────────

def test_inline_foreign_key(parser):
    sql = """
    CREATE TABLE users (id INT PRIMARY KEY);
    CREATE TABLE posts (
        id INT PRIMARY KEY,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """
    schema = parser.parse(sql)
    posts = schema.get_table("posts")
    assert posts is not None
    user_id_col = posts.get_column("user_id")
    assert user_id_col is not None
    assert user_id_col.foreign_key is not None
    assert user_id_col.foreign_key.target_table == "users"
    assert user_id_col.foreign_key.target_column == "id"


# ── Quoted identifiers ────────────────────────────────────────────────────────

def test_backtick_quoted_names(parser):
    schema = parser.parse("CREATE TABLE `my_table` (`my_col` INT);")
    assert schema.tables[0].name == "my_table"
    assert schema.tables[0].columns[0].name == "my_col"


# ── Comments stripped ─────────────────────────────────────────────────────────

def test_sql_comments_stripped(parser):
    sql = """
    -- This is a comment
    CREATE TABLE t (
        id INT, -- inline comment
        name VARCHAR(100)
    );
    """
    schema = parser.parse(sql)
    assert len(schema.tables) == 1
    assert len(schema.tables[0].columns) == 2


# ── IF NOT EXISTS ─────────────────────────────────────────────────────────────

def test_if_not_exists(parser):
    schema = parser.parse("CREATE TABLE IF NOT EXISTS t (id INT);")
    assert len(schema.tables) == 1
    assert schema.tables[0].name == "t"


# ── ENUM ──────────────────────────────────────────────────────────────────────

def test_enum_values_parsed(parser):
    schema = parser.parse("CREATE TABLE t (status ENUM('active','inactive','pending'));")
    col = schema.tables[0].get_column("status")
    assert col.col_type == ColumnType.ENUM
    assert set(col.enum_values) == {"active", "inactive", "pending"}


# ── to_dict round-trip ────────────────────────────────────────────────────────

def test_schema_to_dict_structure(parser):
    schema = parser.parse(
        "CREATE TABLE users (id INT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(255) NOT NULL);",
        schema_name="mydb",
    )
    d = schema.to_dict()
    assert d["name"] == "mydb"
    assert d["table_count"] == 1
    assert d["total_columns"] == 2
    assert len(d["tables"]) == 1
    col_names = [c["name"] for c in d["tables"][0]["columns"]]
    assert "id" in col_names
    assert "email" in col_names
