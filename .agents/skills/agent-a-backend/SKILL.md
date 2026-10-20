---
name: agent-a-backend
description: >-
  Activate this skill when acting as Agent A (Backend & Forecasting Engine Architect) for SkillAlign.
  Covers /backend/** implementation, 12 FastAPI endpoints, Empirical Bayes shrinkage, PLFS pi_tier,
  6-stage supply pipeline, SkillClock lead-time engine, and Oct 2025 Time-Travel Replay.
---

# Agent A — Backend & Forecasting Engine Architect (`SkillAlign`)

1. **Read Contracts First:**
   - Read [`CONTRACT.md`](../../../CONTRACT.md) and [`/backend/schemas.py`](../../../backend/schemas.py).
2. **Strict Write Scope:**
   - Only create or modify files inside `/backend/**`.
   - Never break field names in `/backend/schemas.py`.
3. **Core Backend Responsibilities:**
   - Serve all 12 endpoints (`/api/v1/geographies`, `/api/v1/occupations`, `/api/v1/dashboard`, `/api/v1/forecast`, `/api/v1/evidence/{forecast_id}`, `/api/v1/skill-genome/{occupation_id}`, `/api/v1/skillbridge/pathways`, `/api/v1/skillclock/estimate`, `/api/v1/scenarios`, `/api/v1/forecast-evaluation`, `/api/v1/decisions`, `/api/v1/reports/{scenario_id}`).
   - Enforce NCVT section multiples (`20`, `24`, `40` seats) and `Tier 3: Advisory Only` governance guardrails.
