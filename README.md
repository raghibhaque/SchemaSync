# SchemaSync

**Automated database schema reconciliation and migration SQL generation powered by ML-driven structural and semantic analysis.**

Schema reconciliation—mapping tables and columns across two different database schemas—is normally a manual, error-prone task that takes days. SchemaSync automates it in seconds using a 3-layer matching engine: structural fingerprinting, semantic similarity, and optimal assignment via the Hungarian algorithm. It then generates real, runnable migration SQL in multiple formats (Generic SQL, Flyway, Liquibase, AWS DMS, Rollback) with dialect support for MySQL and PostgreSQL.

---

## Table of Contents

- [What It Does](#what-it-does)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [How to Run](#how-to-run)
- [Features](#features)
- [Real Migration SQL Generation](#real-migration-sql-generation)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Development Status](#development-status)
- [Future Work](#future-work)

---

## What It Does

SchemaSync takes two SQL database schemas and produces:

1. **Table Mappings** — Which table in schema A matches which table in schema B, with confidence scores
2. **Column Mappings** — For each matched table, which columns map to each other  
3. **Conflict Report** — Type mismatches, nullability differences, constraint violations, missing defaults
4. **Real Migration SQL** — Production-ready SQL scripts with:
   - Multiple output formats: Generic SQL, Flyway, Liquibase XML, AWS DMS JSON, Rollback scripts
   - Dialect support: MySQL 5.7+, PostgreSQL 11+, or generic (dialect-agnostic)
   - Safe type conversions with NULLIF guards and CASE expressions
   - ALTER TABLE incremental migrations or DROP+CREATE approaches
   - Automatic rollback scripts for quick recovery
5. **Visual Analysis** — Mapping confidence scores, complexity assessment, data loss risk indicators, execution metrics

**Input:** Two `.sql` files (CREATE TABLE statements) or raw SQL  
**Output:** 
- Visual mapping results with confidence scores
- Interactive conflict analysis and batch resolution
- Migration complexity assessment (Simple/Moderate/Complex)
- Data loss risk warnings before download
- Real migration SQL in 5 formats + rollback scripts
- Export history tracking
- Exportable as SQL/JSON/PDF reports

---

## The Problem

Every time systems integrate (M&A, platform migrations, data consolidation), teams face schema reconciliation:

- **Naming chaos:** `users` vs `wp_users` vs `accounts` vs `customer_profiles`
- **Semantic mismatch:** `created_at` vs `registered_on` vs `date_joined`
- **Type divergence:** `VARCHAR(255)` vs `TEXT` vs `CHARACTER VARYING`
- **Structural differences:** Foreign keys, constraints, indexes, enums

This forces engineers to:
1. Manually inspect both schemas side-by-side
2. Infer semantic meaning from names and context
3. Resolve conflicts (which differences are intentional? which are bugs?)
4. Hand-write migration logic

**The cost:**
- ⏱️ Slow: Days to weeks of senior engineer time
- 💰 Expensive: Only senior engineers can do this reliably
- ❌ Inconsistent: Depends on human judgment, prone to mistakes

---

## The Solution

SchemaSync automates reconciliation with a **3-layer matching engine**:

### Layer 1: Structural Analysis
Extracts format-agnostic **fingerprints** of each table:
- Primary key strategy (single vs composite, auto-increment)
- Foreign key density and patterns
- Column count, type distribution
- Junction table detection (many-to-many patterns)
- Audit column presence (`created_at`, `updated_at`, `deleted_at`)

Uses **cosine similarity** on fingerprint vectors to score table pairs structurally.

### Layer 2: Semantic Matching
Understands **meaning** beyond names:
- Token-based similarity with synonym dictionaries (e.g., "customer" ≈ "user")
- Optional: Transformer embeddings via `sentence-transformers` (semantic context)
- Jaccard similarity for column names
- Levenshtein distance for fuzzy matching

Scores table and column pairs semantically based on name similarity and context.

### Layer 3: Optimal Assignment
Uses the **Hungarian Algorithm** (via SciPy) to find the **globally optimal table and column mappings** given all pairwise scores.

Instead of greedy matching (pick the best pair, repeat), this solves the bipartite matching problem optimally, ensuring no table is matched twice.

---

## Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm
- **Git**

### Quick Start (5 minutes)

#### 1. Set up backend

```bash
cd /home/raghib/Desktop/hackUPC

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python -m uvicorn backend.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

#### 2. Set up frontend (in a new terminal)

```bash
cd /home/raghib/Desktop/hackUPC/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

You should see:
```
VITE v5.0.8  ready in 123 ms
➜  Local:   http://localhost:5173/
```

#### 3. Open the app

Go to **http://localhost:5173** in your browser. Click "Run Demo" to see it work (no files needed—it reconciles Ghost CMS vs WordPress schemas).

---

## Project Structure

```
hackUPC/
├── README.md                          # This file
├── requirements.txt                   # Python dependencies
├── .env.example                       # Environment variables template
├── .gitignore
│
├── backend/                           # FastAPI backend (port 8000)
│   ├── main.py                        # FastAPI app, CORS, routes
│   ├── config.py                      # Configuration (thresholds, paths)
│   │
│   ├── api/
│   │   ├── routes/
│   │   │   ├── upload.py              # POST /api/upload/ — upload & parse SQL file
│   │   │   ├── reconcile.py           # POST /api/reconcile/demo, /, /files — run reconciliation + 3 migrations
│   │   │   └── export.py              # POST /api/export/{sql,alter,rollback,demo/*} — export migrations
│   │   ├── models/
│   │   │   ├── requests.py            # Pydantic request schemas
│   │   │   └── responses.py           # Pydantic response schemas
│   │   └── __init__.py
│   │
│   ├── core/
│   │   ├── ir/                        # Intermediate Representation (IR) — universal schema format
│   │   │   ├── models.py              # Dataclasses: Schema, Table, Column, TableMapping, etc.
│   │   │   └── normaliser.py          # Name & type normalisation
│   │   │
│   │   ├── parsers/                   # Schema format parsers
│   │   │   ├── base.py                # Abstract parser interface
│   │   │   ├── sql_ddl.py             # ✓ SQL DDL parser (MySQL/PostgreSQL)
│   │   │   ├── prisma.py              # (stub) Prisma schema parser
│   │   │   └── json_schema.py         # (stub) JSON Schema parser
│   │   │
│   │   ├── analysis/                  # Matching algorithms
│   │   │   ├── structural.py          # Fingerprint extraction & structural similarity
│   │   │   └── semantic.py            # Name similarity, optional embeddings
│   │   │
│   │   ├── reconciliation/            # Main reconciliation engine
│   │   │   ├── engine.py              # ReconciliationEngine — orchestrates matching
│   │   │   ├── scorer.py              # Score matrix computation
│   │   │   └── assignment.py          # Hungarian algorithm + greedy fallback
│   │   │
│   │   ├── conflicts/                 # Conflict detection
│   │   │   ├── detector.py            # Detects type/nullability/constraint/DEFAULT mismatches
│   │   │   └── types.py               # Conflict type constants
│   │   │
│   │   └── codegen/                   # SQL migration generation (3 approaches)
│   │       ├── generator.py           # Three generators:
│   │       │                          # 1. generate_migration_sql() — DROP+CREATE (full rebuild)
│   │       │                          # 2. generate_alter_table_migration() — RENAME/ALTER (incremental)
│   │       │                          # 3. generate_rollback_sql() — Reverse operations
│   │       │                          # Safe type conversions with NULLIF, STR_TO_DATE, CASE
│   │       └── templates/             # (unused) Jinja2 template stubs
│   │
│   ├── services/
│   │   ├── pipeline.py                # (unused) Job queue dataclass
│   │   └── llm.py                     # (stub) LLM integration
│   │
│   ├── demo/
│   │   ├── ghost_schema.sql           # Demo: Ghost CMS schema
│   │   └── wordpress_schema.sql       # Demo: WordPress schema
│   │
│   └── __init__.py
│
└── frontend/                          # React + TypeScript frontend (port 5173)
    ├── package.json                   # NPM dependencies
    ├── vite.config.ts                 # Vite bundler config
    ├── tailwind.config.js             # Tailwind CSS config
    ├── tsconfig.json                  # TypeScript config
    ├── index.html                     # HTML entry point
    │
    ├── src/
    │   ├── main.tsx                   # React root
    │   ├── App.tsx                    # Main app (upload or results view)
    │   ├── vite-env.d.ts              # Vite env vars
    │   │
    │   ├── lib/
    │   │   ├── api.ts                 # API client (axios) + response transformer
    │   │   ├── utils.ts               # cn() helper (clsx + tailwind-merge)
    │   │   ├── exportFormats.ts       # 5 export generators (Generic SQL, Flyway, Liquibase, DMS, Rollback)
    │   │   ├── migrationUtils.ts      # Type conversion map, SQL builders, complexity estimator
    │   │   ├── sqlDialect.ts          # MySQL/PostgreSQL/Generic dialect adapters
    │   │   └── statisticsExport.ts    # Statistics export utilities
    │   │
    │   ├── types/
    │   │   └── index.ts               # TypeScript types (Schema, Table, TableMapping, ReconciliationResult, etc.)
    │   │
    │   ├── components/
    │   │   ├── Upload/
    │   │   │   └── UploadPanel.tsx    # Hero with file upload + demo button
    │   │   │
    │   │   ├── Mapping/
    │   │   │   ├── MappingTable.tsx                  # Main view with table mappings, search, stats
    │   │   │   ├── MappingEditor.tsx                # Modal for editing individual mappings
    │   │   │   ├── ColumnDetailsDrawer.tsx          # Side panel for column details
    │   │   │   ├── ConfidenceFilterSlider.tsx       # Confidence threshold slider
    │   │   │   ├── BulkActionBar.tsx                # Bulk select/edit toolbar
    │   │   │   ├── MappingDiffView.tsx              # Side-by-side source/target comparison
    │   │   │   ├── BatchConflictResolutionPanel.tsx # Batch apply resolutions
    │   │   │   ├── ExportDrawer.tsx                 # Export panel with formats + preview + risk indicator
    │   │   │   ├── MigrationPreview.tsx             # Live SQL preview with syntax highlighting
    │   │   │   ├── MigrationOptions.tsx             # Dialect selector (MySQL/PostgreSQL/Generic)
    │   │   │   ├── MigrationSummaryCard.tsx         # Complexity badge + metrics
    │   │   │   ├── DataLossRiskIndicator.tsx        # Risk warning panel
    │   │   │   ├── ProgressDashboard.tsx            # Review progress metrics
    │   │   │   ├── PerformanceMetrics.tsx           # Execution timing display
    │   │   │   ├── SettingsPanel.tsx                # UI configuration
    │   │   │   ├── FilterPresetsUI.tsx              # Save/load filter presets
    │   │   │   ├── RulesUI.tsx                      # Custom transformation rules
    │   │   │   ├── HistoryPanel.tsx                 # Action history viewer
    │   │   │   ├── TemplateManager.tsx              # Save/load review state templates
    │   │   │   ├── TableStatisticsCard.tsx          # Per-table stats summary
    │   │   │   ├── SchemaSummaryCard.tsx            # Overall schema comparison
    │   │   │   ├── StatisticsExportPanel.tsx        # Export stats as PDF/CSV
    │   │   │   ├── StatisticsDashboard.tsx          # Comprehensive statistics view
    │   │   │   ├── StatisticsGuide.tsx              # Help for statistics features
    │   │   │   ├── AutoDiscoveryDashboard.tsx       # Quick actions for mappings
    │   │   │   ├── AdvancedFilterBuilder.tsx        # Complex filter criteria
    │   │   │
    │   │   ├── Graph/
    │   │   │   └── EquivalenceGraph.tsx # Two-column visual with connection lines
    │   │   │
    │   │   ├── Conflicts/
    │   │   │   └── ConflictReport.tsx # Grouped by severity
    │   │   │
    │   │   ├── Review/
    │   │   │   ├── ReviewStatusBadge.tsx             # Approval/rejection status
    │   │   │   ├── ReviewControls.tsx                # Action buttons
    │   │   │   ├── ReviewProgressBar.tsx             # Review completion percentage
    │   │   │   ├── MappingEditor.tsx                 # Inline mapping editor
    │   │   │   └── ConflictIndicator.tsx             # Visual conflict markers
    │   │   │
    │   │   ├── Analytics/
    │   │   │   └── AnalyticsView.tsx  # Metrics dashboard (confidence dist, etc.)
    │   │   │
    │   │   ├── shared/
    │   │   │   ├── ConfidenceBadge.tsx
    │   │   │   ├── ConfidenceTooltip.tsx
    │   │   │   └── ProgressBar.tsx
    │   │   │
    │   │   └── ui/
    │   │       └── shape-landing-hero.tsx # Floating geometric shapes (framer-motion)
    │   │
    │   ├── hooks/
    │   │   ├── useKeyboardShortcuts.ts     # Cmd+K, Escape, Ctrl+Z/Y
    │   │   ├── useHistory.ts               # 50-action undo/redo stack
    │   │   ├── useConflictResolutions.ts   # Track conflict resolution state
    │   │   ├── useConflictPatterns.ts      # Detect conflict patterns (batch resolution)
    │   │   ├── useTemplates.ts             # Save/load review state templates
    │   │   ├── useFilterPresets.ts         # Save/load filter configurations
    │   │   ├── useCustomRules.ts           # Custom transformation rules
    │   │   ├── useProgressMetrics.ts       # Review progress tracking
    │   │   ├── useTableStatistics.ts       # Per-table statistics computation
    │   │   ├── useReviewState.ts           # Track review status (approve/reject)
    │   │   ├── useReviewFilters.ts         # Advanced filtering
    │   │   ├── useReviewHistory.ts         # Review action history
    │   │   ├── useExportHistory.ts         # Track exported migrations (last 10)
    │   │   └── useTypeConversions.ts       # Type conversion utilities
    │   │
    │   └── styles/
    │       └── global.css              # Dark theme, scrollbars, base styles
    │
    └── node_modules/                  # NPM packages (generated)
```

---

## How to Run

### Full Setup (Fresh Install)

```bash
# 1. Clone/navigate to project
cd /home/raghib/Desktop/hackUPC

# 2. Set up backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Start backend (Terminal 1)
python -m uvicorn backend.main:app --reload --port 8000

# 4. In a new terminal, set up frontend
cd frontend
npm install

# 5. Start frontend (Terminal 2)
npm run dev

# 6. Open http://localhost:5173 in browser
```

### Backend Only (Existing Setup)

```bash
cd /home/raghib/Desktop/hackUPC
source venv/bin/activate
python -m uvicorn backend.main:app --reload --port 8000
```

### Frontend Only (Existing Setup)

```bash
cd /home/raghib/Desktop/hackUPC/frontend
npm run dev
```

### Environment Variables

Create `.env.local` in the frontend root (optional):

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_DEBUG=true
```

---

## Features

### ✅ Core Schema Reconciliation (Implemented)

| Feature | Status | Details |
|---------|--------|---------|
| SQL DDL Parsing | ✅ | MySQL, PostgreSQL (`CREATE TABLE` statements) |
| Structural Analysis | ✅ | Fingerprinting, primary/foreign key detection, audit column detection |
| Semantic Matching | ✅ | Synonym dicts, name similarity, optional embeddings, Jaccard/Levenshtein |
| Hungarian Assignment | ✅ | Optimal global bipartite matching for tables & columns |
| Conflict Detection | ✅ | Type mismatches, nullability, constraint, FK, DEFAULT value differences |
| Demo Data | ✅ | Ghost CMS vs WordPress schemas (4 tables, 50+ columns) |
| File Upload | ✅ | `.sql` file parsing & instant preview |
| Responsive UI | ✅ | Dark theme, mobile-friendly, Framer Motion animations |
| Real-time Search | ✅ | Filter mappings by table/column name (Cmd+K) |
| Interactive Mapping Table | ✅ | Expandable rows, confidence badges, conflict indicators, inline editors |
| Equivalence Graph Visualization | ✅ | Two-column schema view with visual mapping connections |
| Confidence Filtering | ✅ | Slider to filter results by confidence threshold (0-100%) |
| Batch Conflict Resolution | ✅ | Group similar conflicts, apply bulk resolutions |

### ✅ Real Migration SQL Generation (Implemented)

| Feature | Status | Details |
|---------|--------|---------|
| Generic SQL Export | ✅ | BEGIN/COMMIT transaction wrapper, ALTER TABLE or DROP+CREATE |
| Flyway Migration Format | ✅ | Proper `V{timestamp}__schema.sql` naming, version prefix, @undo rollback |
| Liquibase XML Format | ✅ | `<databaseChangeLog>` with `<changeSet>` entries, rollback sections |
| AWS DMS JSON Format | ✅ | Task configuration with table/column mapping rules, transformation metadata |
| Rollback SQL Generator | ✅ | Reverse operations, RENAME TABLE, DROP IF EXISTS with cascade |
| ALTER TABLE Path | ✅ | Incremental migration (rename/modify instead of drop+create) |
| Safe Type Conversions | ✅ | NULLIF guards, STR_TO_DATE, FROM_UNIXTIME, CASE expressions for risky casts |
| Dialect Adapters | ✅ | MySQL vs PostgreSQL vs Generic syntax differences |
| Migration Preview | ✅ | Live SQL preview with syntax highlighting and conflict markers |
| SQL Syntax Highlighting | ✅ | Keywords (blue), strings (green), comments (gray), line numbers |
| Complexity Estimation | ✅ | Simple/Moderate/Complex scoring based on risky conversions, unmatched columns |
| Data Loss Risk Assessment | ✅ | Detects risky casts, dropped columns, low-confidence mappings, unresolved conflicts |
| Export History | ✅ | Persists last 10 exports in localStorage with metadata |

### ✅ Advanced Features (Implemented)

| Feature | Status | Details |
|---------|--------|---------|
| Execution Metrics | ✅ | Timing, confidence scores, precision/recall, algorithm details |
| Progress Tracking | ✅ | Review status, completion percentage, conflict resolution progress |
| Custom Rules Engine | ✅ | Create transformation rules, custom mappings, save/load templates |
| Filter Presets | ✅ | Save/apply filter configurations, quick access to common views |
| Statistics Dashboard | ✅ | Tables overview, column statistics, confidence distribution, conflict breakdown |
| PDF Report Export | ✅ | Full reconciliation report with mappings, conflicts, metrics |
| Table Statistics | ✅ | Per-table statistics: mappings, confidence, conflicts, unmatched counts |
| Batch Conflict Resolution | ✅ | Pattern grouping: type mismatches, ambiguous mappings, name similarities |
| Mapping Diff View | ✅ | Side-by-side comparison of source and target schema |
| Undo/Redo History | ✅ | 50-action history buffer with stack-based tracking |
| Keyboard Shortcuts | ✅ | Cmd+K for search, Escape to clear, Ctrl+Z/Y for undo/redo |

### 🔧 Partial/Future Features

| Feature | Status | Notes |
|---------|--------|-------|
| Prisma Schema Parsing | 🔲 Stub | Parser interface exists, implementation pending |
| JSON Schema Parsing | 🔲 Stub | Parser interface exists, implementation pending |
| LLM Transformations | 🔲 Stub | Hook exists, not integrated |
| Live DB Connectors | 🔲 Future | Connect directly to PostgreSQL, MySQL, etc. |
| Copy Section Buttons | 🔲 Partial | Per-table section copy functionality |
| Manual Mapping Editor | 🔲 Future | UI to adjust auto-generated mappings in detail |
| Batch Processing | 🔲 Future | Reconcile multiple schema pairs at once |

---

## Real Migration SQL Generation

SchemaSync generates production-ready migration SQL across multiple formats and database dialects. Instead of just identifying matches, it produces actual runnable code to migrate your data.

### Supported Export Formats

#### 1. **Generic SQL**
Standard SQL with `BEGIN/COMMIT` transaction wrapper. Includes:
- `CREATE TABLE` statements for new tables
- `ALTER TABLE` statements for renames, type changes
- `INSERT INTO ... SELECT` for data migration
- `CAST` expressions with safe type conversions
- Comment headers with confidence scores and metadata

```sql
-- ═══════════════════════════════════════════════════════════
-- SchemaSync Migration: 8 tables, 45 columns
-- Generated: 2026-04-25T20:42:00Z
-- Confidence: 87.3%
-- Complexity: MODERATE (3 risky type conversions; 2 unmatched columns)
-- ═══════════════════════════════════════════════════════════

BEGIN;

-- ─── users → wp_users (0.95) ───
ALTER TABLE wp_users RENAME COLUMN user_id TO ID;
ALTER TABLE wp_users MODIFY COLUMN created_at DATETIME;
INSERT INTO wp_users (ID, email, name) SELECT user_id, email_addr, full_name FROM users;

COMMIT;
```

#### 2. **Flyway SQL**
Flyway-compatible migration with version prefix and rollback annotation:

```sql
-- V20260425_202400__Migrate_ghost_to_wordpress.sql
-- Flyway migration auto-generated by SchemaSync

BEGIN;
-- Migration statements...
COMMIT;

-- @undo
-- ROLLBACK;
```

#### 3. **Liquibase XML**
Liquibase databaseChangeLog format with changeSet entries:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog">
  <changeSet id="schemasync-0" author="schemasync">
    <comment>Migrate users → wp_users</comment>
    <renameColumn tableName="wp_users" oldColumnName="user_id" newColumnName="ID"/>
    <modifyDataType tableName="wp_users" columnName="created_at" newDataType="DATETIME"/>
    <sql>INSERT INTO wp_users (...) SELECT ... FROM users;</sql>
    <rollback>...</rollback>
  </changeSet>
</databaseChangeLog>
```

#### 4. **AWS DMS JSON**
AWS Database Migration Service task configuration:

```json
{
  "version": "1.0",
  "generated_at": "2026-04-25T20:42:00Z",
  "summary": { "tables_matched": 8, "columns_matched": 45, ... },
  "table_mappings": [{
    "source_table": "users",
    "target_table": "wp_users",
    "column_mappings": [
      { "source_column": "user_id", "target_column": "ID", ... }
    ]
  }]
}
```

#### 5. **Rollback SQL**
Reverse migration script to undo the migration:

```sql
-- ═══════════════════════════════════════════════════════════
-- ROLLBACK SCRIPT - Undo Migration
-- Generated: 2026-04-25T20:42:00Z
-- ═══════════════════════════════════════════════════════════

BEGIN;

-- Reverse operations
ALTER TABLE wp_users RENAME COLUMN ID TO user_id;
ALTER TABLE wp_users MODIFY COLUMN created_at VARCHAR(255);
DROP TABLE IF EXISTS wp_new_tables CASCADE;

-- ROLLBACK;
```

### Dialect Support

SchemaSync adapts SQL syntax to your target database:

**MySQL 5.7+ / MariaDB 10.3+**
- `ALTER TABLE table MODIFY COLUMN col TYPE`
- `AUTO_INCREMENT` for sequence generation
- `CAST(col AS SIGNED)` for integer casting
- `DATE_FORMAT()` for date formatting

**PostgreSQL 11+**
- `ALTER TABLE table ALTER COLUMN col TYPE`
- `SERIAL` for sequence generation
- `CAST(col AS INTEGER)` for casting
- `TO_TIMESTAMP()` for date formatting

**Generic SQL**
- Comments indicate dialect-specific sections
- Manual adjustment needed for non-standard syntax

### Safe Type Conversion

Risky conversions (VARCHAR→INT, TEXT→DATE) are handled safely:

```sql
-- Instead of: CAST(col AS INT) — may fail on non-numeric strings
-- Generated:  CAST(NULLIF(TRIM(col), '') AS SIGNED)
-- Safer pattern: trim whitespace, treat empty as NULL, then cast

-- VARCHAR to INT with NULLIF:
CAST(NULLIF(TRIM(col_name), '') AS SIGNED)

-- VARCHAR to DATE with STR_TO_DATE:
STR_TO_DATE(NULLIF(TRIM(col_name), ''), '%Y-%m-%d')

-- String to BOOLEAN with CASE:
CASE WHEN LOWER(NULLIF(TRIM(col_name), '')) IN ('true','yes','1','t','y') 
     THEN 1 ELSE 0 END
```

### Migration Complexity Assessment

SchemaSync estimates migration complexity (Simple/Moderate/Complex) based on:
- Number of risky type conversions (high penalty)
- Unmatched columns requiring manual resolution (medium penalty)
- Low-confidence table mappings (low penalty)
- Unresolved conflicts (high penalty)

Users are warned before exporting:
```
⚠️ Data Loss Risks:
  • 3 high-risk type conversions (VARCHAR→INT)
  • 2 source columns will be dropped
  • 1 low-confidence mapping (0.65 score)
  
Recommendation: Always test migrations in staging first and maintain backups.
```

---

## Architecture

### Backend Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | FastAPI | Async REST API, auto-docs, validation |
| **Parsing** | Regex + hand-written parser | SQL DDL extraction (tables, columns, constraints) |
| **Analysis** | SciPy, NumPy | Structural fingerprinting, linear algebra |
| **Matching** | SciPy (hungarian) | Optimal bipartite matching |
| **Optional AI** | sentence-transformers | Semantic embeddings (disabled by default) |
| **Server** | Uvicorn | ASGI server |

### Frontend Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 18 + TypeScript | Component-based UI |
| **Build** | Vite | Fast bundling & dev server |
| **HTTP** | Axios | REST API calls |
| **Animations** | Framer Motion | Smooth transitions, interactive effects |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Icons** | Lucide React | Icon library |

### Data Flow

```
User uploads 2 SQL files
        ↓
Backend parses → normalizes → extracts IR (Schema, Table, Column objects)
        ↓
Structural analysis: Fingerprint extraction (vectors)
        ↓
Semantic analysis: Name similarity + optional embeddings
        ↓
Score matrices: (tables × tables) and (columns × columns)
        ↓
Hungarian algorithm: Find optimal global assignment
        ↓
Conflict detection: Cross-reference mappings for issues
        ↓
SQL generation: Transform + migrate data
        ↓
Frontend renders results: Mappings, conflicts, analytics, SQL export
```

---

## API Endpoints

### Upload

**POST `/api/upload/`** — Upload & parse a SQL file

Request:
```
Form: file (binary .sql)
```

Response:
```json
{
  "filename": "users_schema.sql",
  "tables_found": 5,
  "table_names": ["users", "posts", "comments", ...],
  "schema_preview": { ... }
}
```

---

### Reconcile

**POST `/api/reconcile/demo`** — Run demo (Ghost vs WordPress)

Request: `{}`

Response:
```json
{
  "status": "complete",
  "result": {
    "summary": {
      "tables_matched": 8,
      "columns_matched": 45,
      "unmatched_source_tables": 2,
      "unmatched_target_tables": 1,
      "conflicts": 3,
      "avg_confidence": 0.87
    },
    "table_mappings": [
      {
        "source_table": "users",
        "target_table": "wp_users",
        "combined_score": 0.95,
        "column_mappings": [ ... ],
        ...
      }
    ],
    "unmatched_source_tables": ["..."],
    "unmatched_target_tables": ["..."],
    "conflicts": [ ... ],
    "migration_sql": "BEGIN; CREATE TABLE ..."
  }
}
```

**POST `/api/reconcile/`** — Reconcile raw SQL

Request:
```json
{
  "source_sql": "CREATE TABLE users ...",
  "target_sql": "CREATE TABLE wp_users ...",
  "source_name": "legacy",
  "target_name": "wordpress"
}
```

Response: Same as `/demo`

**POST `/api/reconcile/files`** — Reconcile uploaded files

Request:
```
?source_file=users_schema.sql&target_file=wordpress_schema.sql
```

Response: Same as `/demo`

---

### Export

**POST `/api/export/sql`** — Export Generic SQL migration (DROP+CREATE)

Request:
```json
{
  "source_sql": "...",
  "target_sql": "..."
}
```

Response:
```json
{
  "sql": "BEGIN; CREATE TABLE ...",
  "filename": "migration_source_to_target.sql"
}
```

**POST `/api/export/alter`** — Export ALTER TABLE migration (incremental)

Request: Same as `/sql`

Response:
```json
{
  "sql": "BEGIN; ALTER TABLE ...",
  "filename": "migration_alter_source_to_target.sql"
}
```

**POST `/api/export/rollback`** — Export rollback SQL

Request: Same as `/sql`

Response:
```json
{
  "sql": "BEGIN; ROLLBACK;",
  "filename": "rollback_target_to_source.sql"
}
```

**GET `/api/export/demo/sql`** — Demo Generic SQL (Ghost → WordPress)

Response: Plain text SQL file

**GET `/api/export/demo/alter`** — Demo ALTER migration

Response: Plain text SQL file

**GET `/api/export/demo/rollback`** — Demo rollback SQL

Response: Plain text SQL file

---

### Health

**GET `/api/health`** — Health check

Response:
```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

---

## Development Status

### Latest Implementation: Real Migration SQL Generation (April 2026)

SchemaSync has been extended with **production-ready migration SQL generation** across multiple formats:

**Completed Features (20+ commits):**
- ✅ Generic SQL export with transaction wrappers
- ✅ Flyway migration format with version naming
- ✅ Liquibase XML changeLog format
- ✅ AWS DMS JSON task configuration  
- ✅ Rollback SQL generation for safe recovery
- ✅ ALTER TABLE incremental migration path
- ✅ Safe type conversion handling (NULLIF guards, STR_TO_DATE, CASE expressions)
- ✅ MySQL 5.7+ and PostgreSQL 11+ dialect adapters
- ✅ Live SQL preview with syntax highlighting
- ✅ Migration complexity estimation (Simple/Moderate/Complex)
- ✅ Data loss risk assessment and warnings
- ✅ Migration summary card with metrics
- ✅ Export history tracking (last 10 migrations)
- ✅ Batch conflict resolution with pattern grouping
- ✅ Dialect selector in export drawer

**Frontend Improvements:**
- MigrationPreview component with tokenized syntax highlighting
- MigrationOptions dialect selector
- MigrationSummaryCard showing complexity and metrics  
- DataLossRiskIndicator identifying risky conversions and operations
- useExportHistory hook for tracking exports

**Backend Improvements:**
- DEFAULT_MISMATCH conflict detection
- Three migration SQL generators in reconciliation engine
- Safe type conversion functions for risky conversions
- API endpoints for /alter, /rollback, and demo variants

### Test Coverage

The implementation has been tested with:
- **Demo Data:** Ghost CMS ↔ WordPress (8 tables, 50+ columns)
- **Build Verification:** Zero TypeScript errors, production build passing
- **Export Formats:** All 5 formats generate valid SQL with proper syntax

### Known Limitations

- Copy-section buttons in preview not yet integrated
- Conflict annotations in preview enhanced but can be further refined
- Per-table section navigation partially implemented
- LLM-powered transformations not yet integrated

---

## Troubleshooting

### Backend won't start

**Error:** `No module named uvicorn`

**Solution:** Install dependencies
```bash
source venv/bin/activate
pip install -r requirements.txt
```

---

**Error:** `Address already in use (port 8000)`

**Solution:** Use a different port
```bash
python -m uvicorn backend.main:app --reload --port 8001
```

Then update frontend `src/lib/api.ts` line 5:
```typescript
const API_BASE_URL = 'http://localhost:8001'
```

---

### Frontend won't start

**Error:** `Cannot find module 'framer-motion'`

**Solution:** Install dependencies
```bash
cd frontend
npm install
```

---

**Error:** `Network Error` when clicking demo

**Solution:** Ensure backend is running on port 8000
```bash
# Check if running:
curl http://localhost:8000/api/health

# If not, start it:
python -m uvicorn backend.main:app --reload --port 8000
```

---

### Slow reconciliation

**Issue:** Reconciliation takes >10 seconds

**Solution:** Disable optional embeddings by setting env var:
```bash
USE_EMBEDDINGS=false python -m uvicorn backend.main:app --reload
```

(Sentence-transformers is slow on first use; it caches the model after.)

---

## Future Work

### High Priority
- **Prisma + JSON Schema support** — Parse non-SQL schema formats (interface exists, implementation pending)
- **LLM-powered transformations** — Use GPT/Claude to suggest data transformations and mappings
- **Live database connectors** — Connect directly to PostgreSQL, MySQL, Oracle (no file upload needed)
- **Manual mapping editor** — Fine-grained UI to override auto-generated mappings
- **Copy section buttons** — Per-table section copy functionality in migration preview

### Medium Priority
- **Webhook integration** — Export to Slack, GitHub, Linear for team notifications
- **Batch processing** — Reconcile 10+ schema pairs at once with bulk export
- **Performance optimization** — Profile and optimize for 1000+ column tables
- **Custom transformation functions** — User-defined conversions for edge cases
- **Integration with migration tools** — Direct export to Alembic, db-migrate, etc.

### Nice to Have
- **Schema versioning** — Track historical reconciliations
- **Collaboration features** — Share mappings, comment on conflicts
- **Advanced filtering** — Saved complex filter queries
- **A/B testing migrations** — Compare different migration strategies
- **Mobile app** — Native iOS/Android for on-the-go schema reviews

---

## License

MIT

---

**Built with ❤️ for the HackUPC hackathon**
