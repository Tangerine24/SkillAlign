# SkillAlign — AI-Enabled Labour Market Intelligence & Skill Forecasting Engine

**Smart India Hackathon (SIH 2026) • Problem Statement ID: SIH26246**  
**Ministry of Skill Development & Entrepreneurship (MSDE) • Directorate General of Training (DGT) • Madhya Pradesh Pilot (`MPSDEGB`)**

---

## 1. Quick Start (Run Backend + Frontend)

### Terminal 1 — FastAPI Backend (Port `8000`)
```powershell
cd C:\Users\Lenovo\.gemini\antigravity\scratch\SkillAlign\backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*Swagger UI / OpenAPI Docs:* `http://localhost:8000/docs`

### Terminal 2 — React + Vite Sovereign Policy Studio (Port `5173`)
```powershell
cd C:\Users\Lenovo\.gemini\antigravity\scratch\SkillAlign\frontend
npm.cmd run dev
```
*Note: The frontend API client (`frontend/src/api/client.ts`) includes automatic deterministic fallback to `frontend/src/data/*.json` if the backend server is offline.*

---

## 2. Architecture & 9-Screen Sovereign Policy Command Studio

### Core Intelligence Screens (`/frontend/src/views/core/`)
- **S01 — `SkillWeatherView.tsx`**: Madhya Pradesh Interactive SVG District Map (`Rewa`, `Indore`, `Bhopal`, `Jabalpur`, `Ujjain`), 4 Click-Any-Number Sovereign KPIs, and Ranked District × Occupation Matrix with **Monte-Carlo Rank Stability Badges** (`[Range 1-2 • Robust]`) and **NCVT Admission Cycle Lock Countdowns**.
- **S02 — `EvidenceLedgerView.tsx`**: Official 5-Source Data Provenance Register (`NCS`, `MoSPI PLFS`, `DGT-ITI`, `SIDH / PMKVY 4.0`, `NCO-2015`), 4-Stage Deduplication & PLFS Debiasing Waterfall ($\text{True Total Demand} = \text{Clean Postings} / \pi_{\text{tier}}$), Empirical Bayes Small-Area Shrinkage ($\alpha$), and interactive **Ambiguous NCO-2015 Human Review Queue**.
- **S03 — `ForecastDetailView.tsx`**: Dual-Scale Toggle (`PLFS-Debiased Worker Headcount` vs `Normalized Index 0-100`), Probabilistic `P10 / P50 / P90` Quantile Fan Chart, Signature **"Phantom Capacity" Iceberg & 6-Stage Supply Leakage Funnel** (~48% empty seats in Data Entry + Unplaced Prior-Cohort Backlog Stock), and **Wage Competitiveness ($W_{\text{ratio}}$) Root-Cause Diagnostics**.
- **S04 — `SkillGenomeView.tsx`**: Interactive SVG Node-Link Graph of NCO-2015 codes, NSQF levels, National Occupational Standards (NOS) competencies, and adjacent SkillBridge transition pathways.

### Policy Studio & Validation Screens (`/frontend/src/views/studio/`)
- **S05 — `SkillBridgeView.tsx`**: Cross-Occupation Transition Planner (`Electrician -> Solar PV [76% Overlap, 90d]`, `MMV -> EV Service Lead Tech [72% Overlap, 45d]`) with live **Donor-Pool Conservation Safety Floor Meter**.
- **S06 — `SkillClockView.tsx`**: Dual-Track Lead-Time Race comparing Track A (Standard 12-24m DGT ITI cohort) vs Track B (30-90d PMKVY 4.0 SkillBridge cohort) against the district demand surge window.
- **S07 — `PolicySimulatorView.tsx`**: Constrained What-If Simulator enforcing **NCVT Section Multiples (`20`, `24`, `40` seats)**, District Budget, Master Trainer, and Lab Workstation constraints with Side-by-Side Scenario Comparison (`Baseline`, `Plan A`, `Plan B`, `Plan C`) and Human-in-the-Loop Decision Recording.
- **S08 — `ValidationOutcomesView.tsx`**: Walk-Forward Backtest Scorecard (`SkillAlign WAPE 6.8%` vs `Seasonal-Naive 46.2%`), **Oct 2025 Time-Travel Counterfactual Replay**, and District Governance Action Queue (with Tier-3 Empirical Bayes safety locks).
- **S09 — `CurriculumAndReportView.tsx`**: NSQF Curriculum Drift Radar with **Sector Skill Council (SSC) Expert Workflow** (`Approve / Edit Hours / Reject`), 1-Click Printable Gazette Policy Order Brief, CSV Order Schedule Download, and Live JSON API Inspector (`/api/v1/reports/{scenario_id}`).

### Global Psychological UI Components (`/frontend/src/components/`)
- **`EvidenceXRayDrawer.tsx`**: Slide-out glassmorphic right drawer triggered by clicking any metric, KPI, or table cell across the platform.
- **`TimeTravelDock.tsx`**: Pinned bottom scrubber dock toggling the system clock between **`Oct 2025 (T-12m Historical Replay Cutoff)`** and **`Oct 2026 (Live Present)`**.
