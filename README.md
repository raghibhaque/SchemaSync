# SchemaSync

**Automated database schema reconciliation powered by ML-driven structural and semantic analysis.**

Schema reconciliation—mapping tables and columns across two different database schemas—is normally a manual, error-prone task that takes days. SchemaSync automates it in seconds using a 3-layer matching engine: structural fingerprinting, semantic similarity, and optimal assignment via the Hungarian algorithm.

---

## Table of Contents

- [What It Does](#what-it-does)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [How to Run](#how-to-run)
- [Features](#features)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Future Work](#future-work)

---

## What It Does

SchemaSync takes two SQL database schemas and produces:

1. **Table Mappings** — Which table in schema A matches which table in schema B, with confidence scores
2. **Column Mappings** — For each matched table, which columns map to each other
3. **Conflict Report** — Type mismatches, nullability differences, constraint violations
4. **Migration SQL** — Auto-generated SQL scaffold to migrate data from source to target schema

**Input:** Two `.sql` files (CREATE TABLE statements)  
**Output:** Visual mapping results, conflict analysis, migration code, exportable as SQL/JSON/Python

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
│   │   │   ├── reconcile.py           # POST /api/reconcile/demo, /, /files — run reconciliation
│   │   │   └── export.py              # POST /api/export/sql — export migration SQL
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
│   │   │   ├── detector.py            # Detects type/nullability/constraint mismatches
│   │   │   └── types.py               # Conflict type constants
│   │   │
│   │   └── codegen/                   # SQL migration generation
│   │       ├── generator.py           # Generates ALTER TABLE / CREATE TABLE / INSERT SELECT
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
    │   │   └── utils.ts               # cn() helper (clsx + tailwind-merge)
    │   │
    │   ├── types/
    │   │   └── index.ts               # TypeScript types (Schema, Table, TableMapping, etc.)
    │   │
    │   ├── components/
    │   │   ├── Upload/
    │   │   │   └── UploadPanel.tsx    # Hero with file upload + demo button
    │   │   │
    │   │   ├── Mapping/
    │   │   │   └── MappingTable.tsx   # Searchable table mappings (cmd+k)
    │   │   │
    │   │   ├── Graph/
    │   │   │   └── EquivalenceGraph.tsx # Two-column visual with connection lines
    │   │   │
    │   │   ├── Conflicts/
    │   │   │   └── ConflictReport.tsx # Grouped by severity
    │   │   │
    │   │   ├── CodeGen/
    │   │   │   └── MigrationScaffold.tsx # Code viewer with SQL/JSON/Python formats
    │   │   │
    │   │   ├── Analytics/
    │   │   │   └── AnalyticsView.tsx  # Metrics dashboard (confidence dist, etc.)
    │   │   │
    │   │   ├── shared/
    │   │   │   ├── ConfidenceBadge.tsx
    │   │   │   └── ProgressBar.tsx
    │   │   │
    │   │   └── ui/
    │   │       └── shape-landing-hero.tsx # Floating geometric shapes (framer-motion)
    │   │
    │   ├── hooks/
    │   │   └── useKeyboardShortcuts.ts # Cmd+K for search, Escape to clear
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

### ✅ Core Features (Implemented)

| Feature | Status | Details |
|---------|--------|---------|
| SQL DDL Parsing | ✅ | MySQL, PostgreSQL (`CREATE TABLE` statements) |
| Structural Analysis | ✅ | Fingerprinting, primary/foreign key detection |
| Semantic Matching | ✅ | Synonym dicts, name similarity, optional embeddings |
| Hungarian Assignment | ✅ | Optimal global matching for tables & columns |
| Conflict Detection | ✅ | Type, nullability, constraint, FK mismatches |
| Migration SQL Gen | ✅ | `CREATE TABLE`, `INSERT...SELECT`, `CAST` handling |
| Demo Data | ✅ | Ghost CMS vs WordPress schemas |
| File Upload | ✅ | `.sql` file parsing & preview |
| Responsive UI | ✅ | Dark theme, mobile-friendly layout |
| Real-time Search | ✅ | Filter mappings by table name (Cmd+K) |
| Multi-format Export | ✅ | SQL, JSON, Python code formats |
| Analytics Dashboard | ✅ | Confidence distribution, conflict breakdown, metrics |

### 🔧 Partial/Future Features

| Feature | Status | Notes |
|---------|--------|-------|
| Prisma Schema Parsing | 🔲 Stub | Parser interface exists, implementation pending |
| JSON Schema Parsing | 🔲 Stub | Parser interface exists, implementation pending |
| LLM Transformations | 🔲 Stub | Hook exists, not integrated |
| Live DB Connectors | 🔲 Future | Connect directly to PostgreSQL, MySQL, etc. |
| Manual Mapping Editor | 🔲 Future | UI to adjust auto-generated mappings |
| Undo/Redo | 🔲 Future | History of mapping changes |

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

**POST `/api/export/sql`** — Export migration SQL

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
  "sql": "BEGIN; CREATE TABLE ..."
}
```

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

- **Prisma + JSON Schema support** — Parse non-SQL schema formats
- **Live database connectors** — Connect directly to databases (no file upload)
- **LLM-powered transformations** — Use GPT/Claude to suggest data transformations
- **Manual mapping editor** — Adjust auto-generated mappings in UI
- **Webhook integration** — Export to Slack, GitHub, etc.
- **Batch processing** — Reconcile 10+ schema pairs at once
- **Performance** — Optimize for 1000+ column tables

---

## License

MIT

---

**Built with ❤️ for the HackUPC hackathon**
