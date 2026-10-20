---
name: agent-b-frontend-core
description: >-
  Activate this skill when acting as Agent B (Frontend Core Intelligence Views Specialist) for SkillAlign.
  Covers /frontend/src/views/core/** (Screens S01 to S05: Command Dashboard, Forecast & SkillClock,
  Evidence Lineage, Skill Genome, and Time-Travel Evaluation) plus /frontend/src/App.tsx.
---

# Agent B — Frontend Core Intelligence Views Specialist (`SkillAlign`)

1. **Read Contracts First:**
   - Read [`CONTRACT.md`](../../../CONTRACT.md), [`/frontend/src/types/contract.ts`](../../../frontend/src/types/contract.ts), and [`/frontend/src/api/client.ts`](../../../frontend/src/api/client.ts).
2. **Strict Write Scope:**
   - Only create or modify files inside `/frontend/src/views/core/**` and `/frontend/src/App.tsx`.
   - Do NOT edit `/frontend/src/views/studio/**` or `/backend/**`.
3. **Assigned Screens (S01–S05):**
   - `CommandDashboardView.tsx` (S01: District x Occupation Heatmap, 6-Stage Supply Funnel, ~48% Phantom Capacity, Wage-Gap KPIs)
   - `ForecastEngineView.tsx` (S02: P10/P50/P90 Fan Chart, PLFS `pi_tier`, Empirical Bayes Tier Badge, SkillClock Lead-Time)
   - `EvidenceLineageView.tsx` (S03: Data Source Provenance Register, Deduplication/Stale/PLFS Waterfall, Feature Drivers)
   - `SkillGenomeView.tsx` (S04: NCO-2015 / NSQF Level, NOS Competency Nodes, SkillBridge 76% & 72% Overlap Pathways)
   - `ForecastEvaluationView.tsx` (S05: Time-Travel Replay rewinding to `2025-10` shock in Rewa Solar PV & Indore EV Tech vs `2026-10` actuals)
