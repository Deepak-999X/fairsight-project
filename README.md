<<<<<<< HEAD
# fairsight-project
FairSight is an AI-powered web application designed to detect and reduce bias in automated decision-making systems. It analyzes datasets and machine learning models to identify unfair patterns and ensures that decisions related to hiring, loans, or services are transparent and equitable.  
=======
# FairSight AI — Bias Detection & Fairness Auditing Platform

> Solution Challenge 2026 | Unbiased AI Decision Track

FairSight AI helps organizations detect, measure, and fix bias in their AI models before it harms real people.

## 🌐 Live Demo
- **Frontend**: https://fairsight.vercel.app
- **API Docs**: https://fairsight-api.railway.app/docs

## ⚡ Quick Start

### Backend
```bash
cd fairsight-backend
python -m venv venv && source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # Add your GOOGLE_API_KEY
uvicorn app.main:app --reload
```

### Frontend
```bash
cd fairsight-frontend
npm install
cp .env.example .env.local
npm run dev
```

## 🔍 How It Works
1. **Upload** a CSV dataset or sklearn model
2. **Select** the protected attribute (gender, race, age...)
3. **Analyze** — get 5 bias metrics in seconds
4. **Read** the AI-generated plain-English audit report
5. **Export** PDF and share with your team

## 📊 Bias Metrics

| Metric | Description | Pass Threshold |
|--------|------------|---------------|
| Demographic Parity Difference | Difference in positive rates between groups | \|DPD\| < 0.1 |
| Disparate Impact Ratio | Ratio of positive rates (80% rule) | 0.8 < DIR < 1.25 |
| Equalized Odds Difference | Max diff in TPR and FPR across groups | \|EOD\| < 0.1 |
| Calibration Error | Difference in calibration between groups | \|CE\| < 0.05 |
| Group Accuracy Gap | Difference in accuracy across groups | \|GAP\| < 0.05 |

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18, TypeScript, Vite | UI framework with type safety |
| Styling | Tailwind CSS 3.4, shadcn/ui | Design system & components |
| Charts | Recharts | Bias metric visualizations |
| State | Zustand + React Query | Client & server state |
| Backend | FastAPI, Python 3.11 | Async API framework |
| ML | fairlearn, scikit-learn, Pandas | Bias metric computation |
| AI | Google Gemini API (gemini-2.0-flash) | Plain-English audit reports |
| Auth | Firebase Auth | Google & email authentication |
| Database | PostgreSQL (prod) / SQLite (dev) | Audit history storage |
| ORM | SQLAlchemy 2.0 + Alembic | Database access & migrations |
| Deploy | Vercel (frontend) + Railway (backend) | Production hosting |
| CI/CD | GitHub Actions | Lint + test on PR |

## 🔑 Key Features
- 📁 CSV drag-and-drop upload with column auto-detection
- 🔬 5 industry-standard bias metrics (fairlearn-powered)
- 🏷️ PASS / WARN / FAIL severity badges per metric
- 📈 Overall Fairness Score (0-100) with letter grade (A-F)
- 🤖 Gemini AI audit report with plain-English explanations
- 💡 Remediation suggestions (resampling, threshold tuning)
- 📄 PDF export of full audit report
- 📊 CSV export of per-group statistics
- 🔐 Firebase Auth (Google / email sign-in)
- 📱 Fully responsive (mobile-friendly)
- 🎨 Premium UI with animations (Framer Motion)
- 🗂️ Audit history with past analyses

## 🚀 Demo Mode
Click **"Load Adult Income Dataset"** on the landing page for a one-click demo:
- Pre-loaded with the Adult Income dataset (32K rows)
- Known gender bias in income predictions
- Disparate Impact Ratio = 0.67 (FAIL)

## 📁 Project Structure
```
fairsight-ai/
├── fairsight-frontend/     # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/     # UI components (upload, metrics, report)
│   │   ├── pages/          # Landing, Config, Results pages
│   │   ├── hooks/          # React Query hooks
│   │   ├── store/          # Zustand state management
│   │   ├── lib/            # API client, utilities
│   │   └── types/          # TypeScript interfaces
│   └── ...
├── fairsight-backend/      # FastAPI + Python
│   ├── app/
│   │   ├── routers/        # API endpoints
│   │   ├── services/       # Business logic (bias engine, AI)
│   │   ├── models/         # SQLAlchemy ORM models
│   │   └── schemas/        # Pydantic validation
│   ├── tests/              # pytest test suite
│   └── ...
└── README.md
```

## 👤 Team
Built solo for Solution Challenge 2026 in 10 days.

## 📄 License
MIT
>>>>>>> 0e0b3a4 (Added CI pipeline and project files)
