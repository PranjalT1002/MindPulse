# MindPulse — Student Mental Well-Being & Prescriptive Platform

A production-grade, highly responsive full-stack platform designed to analyze, predict, and proactively reduce student psychological strain through explainable AI, interactive counterfactual simulations, and campus support integration.

---

## Architecture Overview

```
mindpulse/
├── Model/
│   └── mental_health_model.joblib  # Scikit-Learn trained Pipeline (StandardScaler + OneHotEncoder + RandomForest)
├── backend/
│   ├── main.py                     # FastAPI REST API (Auth, Assessment, What-If, Clusters)
│   ├── ml_service.py               # Joblib pipeline execution, trigger attribution & counterfactuals
│   ├── database.py                 # SQLite local persistence with SQLAlchemy ORM (WAL mode)
│   ├── auth.py                     # JWT token generation & bcrypt password hashing
│   └── requirements.txt            # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Split-screen Auth & Anonymous Ephemeral Gateway
│   │   │   ├── dashboard/page.tsx  # Central Command Center (Strain score, Triggers, Mini What-If, Action steps)
│   │   │   ├── assessment/page.tsx # 3-step segmented check-in with keyboard shortcuts
│   │   │   ├── what-if/page.tsx    # Interactive Counterfactual Sandbox with delta strain projection
│   │   │   ├── clusters/page.tsx   # Student Peer Cohorts 2D Scatter Plot
│   │   │   ├── history/page.tsx    # Longitudinal dual-axis trends & Counselor Intake Summary export
│   │   │   ├── resources/page.tsx  # Campus Emergency, Bursaries, Counseling & Helpline directory
│   │   │   └── settings/page.tsx   # Local Data Management & One-Click History Purge
│   │   ├── components/             # Reusable UI components (Sidebar, AppShell)
│   │   └── lib/                    # API client and authentication state store
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## Key Features

1. **Direct AI Model Inference (`mental_health_model.joblib`)**
   - Automatically loads the attached Scikit-Learn Pipeline (`StandardScaler`, `OneHotEncoder`, `RandomForestClassifier`).
   - Generates calibrated psychological strain scores (0.0% – 100.0%) and risk tiers: *Manageable*, *Elevated Strain*, and *Critical Strain*.

2. **Explainable AI & Root-Cause Attribution**
   - Dissects student metrics across 9 holistic dimensions: Academic Workload, CGPA, Study Fulfillment, Sleep Duration, Nutrition, Financial Stress, Family Strain, **Physical Activity**, and **Social Connection**.
   - Pinpoints top strain triggers (e.g., *Critical Sleep Shortage*, *Social Isolation Strain*, *Sedentary Routine Deficit*, *High Financial Worry*).

3. **Prescriptive "What-If" Counterfactual Simulation**
   - Multi-lever interactive sandbox for Restful Sleep, Meal Regularity, **Physical Movement**, and **Peer Connection**.
   - Computes achievable strain reductions in real-time with guaranteed monotonicity without modifying persistent historical baseline data.

4. **Zero Tech-Jargon UI / UX**
   - Bespoke editorial dark theme inspired by Linear and Raycast (`#0B0F19` deep graphite navy, `#111827` cards, hairline borders).
   - Non-stigmatizing, empathetic copy throughout the interface.
   - Privacy transparency: *"Stored Privately on This Device"*.

5. **Incognito / Ephemeral Mode**
   - Allows students to test assessments anonymously in-memory without persisting any data to disk.

6. **Longitudinal Analysis & Counselor Intake Export**
   - Dual-axis time-series visualization tracking Strain Index vs. Nightly Sleep.
   - Formatted 1-page clinical intake summary export to streamline university counseling triage.

7. **Peer Cohort Mapping**
   - 2D scatter plot placing students relative to common archetypes (*The All-Nighter Sprinters*, *The Overburdened Balancers*, *The Steady Pacemakers*).

---

## Quickstart Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Single-Command Start (Recommended)

Run both Backend and Frontend together in one terminal:

```bash
cd mindpulse
npm run dev
```

Both services will boot concurrently:
- **Backend API:** `http://localhost:8000` (Docs at `/docs`)
- **Frontend App:** `http://localhost:3000`

---

### Alternative: Individual Start (2 Terminals)

#### 1. Launch Backend (FastAPI)

```bash
cd mindpulse/backend

# Start the FastAPI server
python -m uvicorn main:app --reload --port 8000
```
Backend API will be accessible at: `http://localhost:8000` (Docs at `http://localhost:8000/docs`).

### 2. Launch Frontend (Next.js)

```bash
cd mindpulse/frontend

# Install dependencies (already prepared)
npm install

# Start development server
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## Privacy & Security Guarantee
- Database records are stored strictly on the local machine in `mindpulse/backend/mindpulse.db`.
- Passwords hashed using standard `bcrypt`.
- Instant complete data purge option available under `Settings`.
