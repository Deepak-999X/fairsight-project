# FairSight AI — Bias Detection & Fairness Auditing Platform

> **Hackathon Project** · Unbiased AI Decision Track  
> Detect, measure, and fix bias in AI models before they impact real people.

---

## What This Project Does

FairSight AI lets organizations upload a CSV dataset (e.g., a hiring, loan, or medical dataset with model predictions), select a protected attribute (gender, race, age, etc.), and instantly get:

- **5 industry-standard bias metrics** (DPD, DIR, EOD, Calibration Error, Group Accuracy Gap)
- **PASS / WARN / FAIL severity badges** per metric
- **Overall Fairness Score (0–100) and letter grade (A–F)**
- **AI-generated plain-English audit report** via Google Gemini
- **Per-group statistics** (positive rate, accuracy, TPR, FPR)
- **CSV export** of results + **PDF export** of the full report
- **Audit history** to track changes over time

---

## Project Structure

```
Hackathon/
├── fairsight-backend/          # FastAPI + Python bias engine
│   ├── app/
│   │   ├── main.py             # FastAPI app, CORS, router registration
│   │   ├── config.py           # Settings via pydantic-settings
│   │   ├── database.py         # SQLAlchemy + SQLite/PostgreSQL setup
│   │   ├── models/             # SQLAlchemy ORM models (User, Upload, Audit)
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── upload.py       # POST /api/v1/upload  (CSV ingestion)
│   │   │   ├── analyze.py      # POST /api/v1/analyze (bias computation)
│   │   │   ├── report.py       # POST /api/v1/report  (Gemini AI report)
│   │   │   ├── history.py      # GET  /api/v1/history (audit log)
│   │   │   ├── datasets.py     # GET  /api/v1/datasets/samples
│   │   │   └── health.py       # GET  /api/v1/health
│   │   └── services/
│   │       ├── bias_engine.py      # Core: fairlearn + numpy metrics
│   │       ├── gemini_service.py   # Google Gemini report generator
│   │       ├── dataset_service.py  # CSV parsing, column detection
│   │       └── sample_data.py      # Built-in Adult Income dataset
│   ├── uploads/                # Persisted CSV files (git-ignored)
│   ├── fairsight.db            # SQLite database (dev)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── fairsight-frontend/         # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx     # Hero, demo button, feature cards
│   │   │   ├── ConfigPage.tsx      # Column selector + run analysis
│   │   │   └── ResultsPage.tsx     # Metrics grid, charts, AI report
│   │   ├── components/
│   │   │   ├── upload/
│   │   │   │   ├── UploadZone.tsx  # Drag-and-drop CSV uploader
│   │   │   │   ├── ColumnMapper.tsx ✅ COMPLETED — column type table
│   │   │   │   └── FilePreview.tsx
│   │   │   ├── metrics/
│   │   │   │   ├── BiasChart.tsx   ✅ COMPLETED — Recharts bar charts
│   │   │   │   ├── GroupTable.tsx  ✅ COMPLETED — sortable group stats
│   │   │   │   └── MetricCard.tsx
│   │   │   └── report/
│   │   │       ├── AuditReport.tsx ✅ COMPLETED — markdown report panel
│   │   │       └── RemediationPanel.tsx
│   │   ├── store/
│   │   │   └── uploadStore.ts      # Zustand global state
│   │   ├── lib/
│   │   │   ├── api.ts              # Axios API client
│   │   │   └── exportPDF.ts        # PDF export utility
│   │   └── types/index.ts          # TypeScript interfaces
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
│
└── README.md
```

---

## Bias Metrics Explained

| Metric | Abbreviation | Threshold (PASS) | What It Measures |
|--------|-------------|------------------|-----------------|
| Demographic Parity Difference | DPD | \|value\| < 0.1 | Positive prediction rate gap between groups |
| Disparate Impact Ratio | DIR | 0.8 ≤ value ≤ 1.25 | Ratio of positive rates (the "80% rule") |
| Equalized Odds Difference | EOD | \|value\| < 0.1 | TPR and FPR equality across groups |
| Calibration Error | CE | \|value\| < 0.05 | Probability calibration gap between groups |
| Group Accuracy Gap | GAP | \|value\| < 0.05 | Max accuracy difference between any two groups |

**Fairness Score:** Each metric contributes 20 points. PASS = 20 pts, WARN = 10 pts, FAIL = 0 pts.  
**Letter Grade:** A (90–100), B (70–89), C (50–69), D (30–49), F (0–29)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS 3.4 |
| Charts | Recharts |
| State | Zustand + React Query |
| Animations | Framer Motion |
| Backend | FastAPI (Python 3.11) |
| ML / Bias | fairlearn, scikit-learn, Pandas, NumPy |
| AI Reports | Google Gemini API (`gemini-2.0-flash`) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | SQLAlchemy 2.0 |

---

## Prerequisites

Make sure these are installed before starting:

- **Python 3.11+** — `python --version`
- **Node.js 18+** — `node --version`
- **npm 9+** — `npm --version`
- **Git** — `git --version`
- **Google Gemini API key** — get one free at https://aistudio.google.com/app/apikey

---

## Step-by-Step Setup

### Step 1 — Clone / Extract the project

```bash
# If you downloaded the zip, extract it:
unzip 1776570040149_Hackathon.zip
cd Hackathon
```

---

### Step 2 — Backend Setup

```bash
cd fairsight-backend
```

**2a. Create a Python virtual environment**

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

**2b. Install Python dependencies**

```bash
pip install -r requirements.txt
```

> ⚠️ `fairlearn` requires scikit-learn ≥ 1.2. If you hit a conflict, run:  
> `pip install --upgrade scikit-learn fairlearn`

**2c. Configure environment variables**

```bash
cp .env.example .env
```

Open `.env` and set your values:

```env
# Required — Google Gemini API key
GOOGLE_API_KEY=AIzaSy...your_key_here

# App settings
APP_NAME=FairSight AI
DEBUG=True
SECRET_KEY=change-this-to-a-random-string

# Gemini model settings
GEMINI_MODEL=gemini-2.0-flash
GEMINI_MAX_TOKENS=2048

# Database (SQLite for local dev — no extra setup needed)
DATABASE_URL=sqlite+aiosqlite:///./fairsight.db

# CORS — allow the frontend origin
ALLOWED_ORIGINS=http://localhost:5173
```

**2d. Run the backend server**

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:

```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Verify it works:**

- API docs (Swagger UI): http://localhost:8000/docs  
- Health check: http://localhost:8000/api/v1/health

---

### Step 3 — Frontend Setup

Open a **new terminal** (keep the backend running).

```bash
cd fairsight-frontend
```

**3a. Install Node dependencies**

```bash
npm install
```

**3b. Configure environment**

```bash
cp .env.example .env.local
```

Open `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

**3c. Copy the completed components into the project**

The four stub components need to be replaced with the completed versions:

```bash
# From the completed-components folder provided alongside this README:
cp BiasChart.tsx    src/components/metrics/BiasChart.tsx
cp GroupTable.tsx   src/components/metrics/GroupTable.tsx
cp AuditReport.tsx  src/components/report/AuditReport.tsx
cp ColumnMapper.tsx src/components/upload/ColumnMapper.tsx
```

**3d. Start the frontend dev server**

```bash
npm run dev
```

Output:

```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

---

## Using the Application

### Option A — One-click Demo (Recommended for judges)

1. Open http://localhost:5173
2. Click **"Load Adult Income Dataset"** on the landing page
3. The app loads 32K rows of real-world income data with known gender bias
4. Click **"Run Bias Analysis"**
5. View results: Disparate Impact Ratio will be ~0.67 (**FAIL** — significant gender bias)
6. Click **"Generate AI Report"** for a plain-English Gemini analysis
7. Click **"Export CSV"** or **"Export PDF"** to save results

### Option B — Upload Your Own CSV

1. Click **"Upload Dataset"** on the landing page
2. Drag and drop any CSV file (must have at least one binary outcome column and one categorical attribute column)
3. On the Config page, select:
   - **Protected attribute** (e.g., `gender`, `race`, `age_group`)
   - **Outcome column** (binary 0/1 predictions or labels)
   - **Task type** (Classification or Regression)
4. Click **"Run Analysis"**
5. View the Results dashboard

### What Makes a Good Test CSV

Your CSV should have:
- At least 100 rows
- A **protected attribute** column with 2–5 unique values (e.g., `Male`/`Female`, `White`/`Black`/`Hispanic`)
- A **binary outcome** column with values 0 and 1 (e.g., hired/not hired, approved/denied)
- Optional: a separate ground truth column for richer metrics

**Example columns:**
```
age, education, gender, income, hired (0/1)
```

---

## API Reference

All endpoints are at `http://localhost:8000/api/v1/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |
| POST | `/upload` | Upload a CSV file |
| POST | `/analyze` | Run bias analysis |
| POST | `/report` | Generate AI audit report |
| GET | `/history` | Get past audit results |
| GET | `/datasets/samples` | List built-in sample datasets |

Full interactive docs: **http://localhost:8000/docs**

### Example: Run analysis via curl

```bash
# 1. Upload a CSV
curl -X POST http://localhost:8000/api/v1/upload \
  -F "file=@your_dataset.csv"
# Returns: {"dataset_id": "abc12345", "columns": [...], ...}

# 2. Run bias analysis
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_id": "abc12345",
    "protected_attribute": "gender",
    "outcome_column": "hired",
    "task_type": "classification"
  }'

# 3. Generate AI report (using the audit_id from step 2)
curl -X POST http://localhost:8000/api/v1/report \
  -H "Content-Type: application/json" \
  -d '{"audit_id": 1}'
```

---

## Running Tests

```bash
cd fairsight-backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pytest tests/ -v
```

---

## Production Build

### Build the frontend

```bash
cd fairsight-frontend
npm run build
# Output is in dist/ — serve with any static host (Vercel, Netlify, etc.)
```

### Run backend in production mode

```bash
cd fairsight-backend
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker (optional)

```bash
cd fairsight-backend
docker build -t fairsight-api .
docker run -p 8000:8000 --env-file .env fairsight-api
```

---

## Troubleshooting

**`ModuleNotFoundError: No module named 'fairlearn'`**  
→ Make sure your virtual environment is activated: `source venv/bin/activate`

**`CORS error` in browser console**  
→ Check that `.env` has `ALLOWED_ORIGINS=http://localhost:5173` and restart the backend.

**`404 Dataset not found` when analyzing**  
→ The backend stores uploaded files in memory per session. Re-upload the CSV if you restarted the backend.

**Gemini report shows "Offline Mode"**  
→ Your `GOOGLE_API_KEY` in `.env` is missing or invalid. The app still works with a template-based fallback report.

**`npm install` fails on Node 16**  
→ Upgrade to Node 18+: https://nodejs.org

**Port 8000 already in use**  
→ `uvicorn app.main:app --reload --port 8001` and update `VITE_API_BASE_URL` to `http://localhost:8001`.

---

## Completed Components (What Was Added)

The following four stub components were implemented as part of this submission:

| File | What It Does |
|------|-------------|
| `src/components/metrics/BiasChart.tsx` | Two Recharts bar charts: metric severity visualization and per-group positive rate comparison |
| `src/components/metrics/GroupTable.tsx` | Sortable table with positive rate, accuracy, TPR, FPR per group; colour-coded highest-rate group |
| `src/components/report/AuditReport.tsx` | Renders the Gemini markdown report with styled headings, PASS/WARN/FAIL badges, executive summary panel |
| `src/components/upload/ColumnMapper.tsx` | Column type table with dtype badges, sample values, unique count, and role-assignment buttons |

---

## License

MIT — built for Solution Challenge 2026.