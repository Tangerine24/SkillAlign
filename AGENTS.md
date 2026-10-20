# SkillAlign — Multi-Agent Workspace Configuration (`AGENTS.md`)

> **SIH 2026 Problem Statement SIH26246:** AI-Enabled Labour Market Intelligence and Skill Demand-Supply Forecasting Engine for MSDE.
> **Brand Name:** Exclusively **SkillAlign** (Never use `KaushalYuva`).
> **Pilot Geography:** **Madhya Pradesh** (`Indore`, `Bhopal`, `Jabalpur`, `Rewa`, `Ujjain`).

---

## Parallel Agent Roles & Strict Folder Isolation

When operating as one of the 3 parallel Phase 1 agents in this workspace, strictly obey your assigned write boundaries and treat `CONTRACT.md`, `/backend/schemas.py`, `/frontend/src/types/contract.ts`, and `/frontend/src/api/client.ts` as locked contracts:

### 1. Agent A — Backend & Forecasting Engine (`/agent-a-backend`)
- **Recommended Model:** `Gemini 4 Argon` (`Medium` Thinking)
- **Allowed Write Paths:** `/backend/**`
- **Responsibilities:**
  - Statistical forecasting (`P10`, `P50`, `P90` uncertainty fan, PLFS `pi_tier` adjustment, Empirical Bayes neighbor-cluster shrinkage across `Tier 1: Direct`, `Tier 2: Cluster-Pooled`, `Tier 3: Advisory Only`).
  - 6-Stage Supply Pipeline & ~48% ITI Phantom Capacity modeling in NCVT section multiples (`20`, `24`, `40`).
  - `SkillClock` training lead-time horizon engine (`24m` fresh ITI vs `3m` PMKVY STT vs `45-90d` `SkillBridge` conversion).
  - Time-Travel Replay (`2025-10` demand shock in Rewa Solar PV & Indore EV Service verified through `2026-10`).
  - All 12 FastAPI endpoints in `/backend/main.py` matching `/backend/schemas.py`.

### 2. Agent B — Frontend Core Intelligence Views (`/agent-b-frontend-core`)
- **Recommended Model:** `Claude Sonnet 5.5` (`Medium` Thinking)
- **Allowed Write Paths:** `/frontend/src/views/core/**` and `/frontend/src/App.tsx`
- **Responsibilities:**
  - **S01 (`CommandDashboardView.tsx`):** District x Occupation Heatmap, Executive KPIs, 6-Stage Supply Pipeline Funnel, Phantom Capacity & Wage-Gap alerts.
  - **S02 (`ForecastEngineView.tsx`):** `P10/P50/P90` Forecast Fan Chart, PLFS `pi_tier` adjustment, Empirical Bayes Confidence Tier badges, and `SkillClock` Lead-Time comparison.
  - **S03 (`EvidenceLineageView.tsx`):** Source Register (`OBSERVED_PUBLIC_ANCHOR`, `DERIVED_ESTIMATE`, `SYNTHETIC_PILOT_FEED`), Deduplication/Stale/PLFS Cleaning Waterfall, and Feature Drivers.
  - **S04 (`SkillGenomeView.tsx`):** NCO-2015 & NSQF Level mapping, NOS competency nodes, and `SkillBridge` overlap pathways (`76%` Electrician->Solar, `72%` MMV->EV).
  - **S05 (`ForecastEvaluationView.tsx`):** Time-Travel Replay (`2025-10` -> `2026-10` ground-truth backtest), WAPE, MASE, Pinball Loss, and 80% PI Coverage vs Naive Baseline.

### 3. Agent C — Frontend Decision Studio & Governance Views (`/agent-c-frontend-studio`)
- **Recommended Model:** `Claude Sonnet 5.5 (Thinking)` (or `Gemini 4 Argon | Medium`)
- **Allowed Write Paths:** `/frontend/src/views/studio/**`
- **Responsibilities:**
  - **S06 (`ScenarioStudioView.tsx`):** Interactive NCVT Seat Matrix Reallocation Studio (strict multiples of `20`, `24`, `40` seats) and NAPS Wage-Subsidy simulator.
  - **S07 (`SkillBridgePlannerView.tsx`):** Donor-to-Target cohort conversion planner (`Electrician -> Solar PV` 90d, `MMV -> EV Tech` 45d), cost-per-placement & ROI calculator.
  - **S08 (`DecisionPlaybookView.tsx`):** District Action Playbook, approval workflow, and `Tier 3: Advisory Only` human-in-the-loop governance guardrails.
  - **S09 (`CurriculumRadarView.tsx`):** Curriculum Drift & Emerging Unmapped Skill Radar (`UNMAPPED`, `PARTIAL_LEGACY`, `DRAFT_NOS`) with micro-credential recommendations.
  - **S10 (`PolicyReportView.tsx`):** Official MSDE / MPSDEGB Actionable Policy Order & NCVT/PMKVY brief export.
