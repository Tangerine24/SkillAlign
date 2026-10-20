# SkillAlign — Workspace & Multi-Agent Architecture Rules (`.antigravity/rules.md`)

> **SIH 2026 Problem Statement SIH26246:** AI-Enabled Labour Market Intelligence and Skill Demand-Supply Forecasting Engine for the Ministry of Skill Development and Entrepreneurship (MSDE).

---

## 1. Non-Negotiable Brand & Naming Rules

1. **Brand Name:** Exclusively use **SkillAlign** across all UI headers, API titles, documentation, policy exports, and metadata. **NEVER** use `KaushalYuva` anywhere in code, comments, or UI strings.
2. **Institutional Framing:** Frame SkillAlign as a decision-support intelligence platform for **MSDE**, **DGT (Directorate General of Training — NCVT MIS)**, **NSDC (SIDH / PMKVY 4.0)**, and the **Madhya Pradesh State Skill Development & Employment Generation Board (MPSDEGB)**.
3. **Epistemic Honesty & Provenance:** Every metric, source feed, and forecast must explicitly carry provenance (`OBSERVED_PUBLIC_ANCHOR`, `DERIVED_ESTIMATE`, or `SYNTHETIC_PILOT_FEED`) and confidence tiers (`Tier 1: Direct`, `Tier 2: Cluster-Pooled`, `Tier 3: Advisory Only`).

---

## 2. Strict Pilot Scope: Madhya Pradesh (5 Districts x 4 Sectors x 6 Occupations)

### 2.1 Geographies (State: `Madhya Pradesh`, Code: `MP`)
| `district_id` | `district_name` | Economic & Industrial Archetype | Neighbor Pool Cluster |
| :--- | :--- | :--- | :--- |
| `indore` | `Indore` | Pithampur Auto/EV Cluster, Solar Rooftop EPC & IT-ITeS Hub | `malwa_industrial` |
| `bhopal` | `Bhopal` | State Capital, BHEL Electrical & EV Service Institutional Hub | `central_mp_core` |
| `jabalpur` | `Jabalpur` | Defence Ordnance, Heavy Engineering, CNC & Capital Goods Hub | `mahakoshal_engg` |
| `rewa` | `Rewa` | Rewa Ultra Mega Solar Park (RUMSL) & Vindhya Green Energy Corridor | `vindhya_green` |
| `ujjain` | `Ujjain` | Emerging Agro-Industrial & Semi-Urban Corridor (Sparse Cell Tier-2/3 Case) | `malwa_industrial` |

### 2.2 Sectors (Exact Strings)
1. `Green Energy & Electrical`
2. `Automotive & EV`
3. `Capital Goods & Manufacturing`
4. `IT-ITeS & Digital`

### 2.3 Pilot Occupations (NCO-2015 & NSQF Mapped)
| # | `occupation_id` | `occupation_name` | `nco_code` | `nsqf_level` | `sector` | Duration / Scheme | Section Size | Market Archetype |
| :- | :--- | :--- | :--- | :---: | :--- | :--- | :---: | :--- |
| 1 | `occ_solar_pv` | `Solar PV Installer (Suryamitra)` | `7411.0101` | `4` | `Green Energy & Electrical` | PMKVY STT: 300 hrs / 3 months | `20` | **High Shortage** in `Rewa` & `Indore` (Demand shock at `2025-10`) |
| 2 | `occ_electrician` | `Electrician (General)` | `7411.0100` | `4` | `Green Energy & Electrical` | DGT ITI Duration: 24 months | `20` | **Surplus / Donor Trade** (76% skill overlap with `Solar PV Installer`) |
| 3 | `occ_ev_tech` | `EV Service Lead Technician` | `7231.0105` | `4` | `Automotive & EV` | Duration: 12 months / Bridge: 45 days | `20` | **High Shortage** in `Indore` & `Bhopal` (Demand shock at `2025-10`) |
| 4 | `occ_mmv` | `Mechanic Motor Vehicle (MMV)` | `7231.0101` | `4` | `Automotive & EV` | DGT ITI Duration: 24 months | `24` | **Surplus / Donor Trade** (72% skill overlap with `EV Service Lead Technician`) |
| 5 | `occ_cnc_prog` | `CNC Programmer & Setter` | `7223.0501` | `4` | `Capital Goods & Manufacturing` | Duration: 12 months | `20` | **Shortage** in `Jabalpur` & `Indore` (High Wage-Gap / Phantom Capacity case) |
| 6 | `occ_data_entry` | `Data Entry Operator / Domestic IT Helpdesk` | `4132.0402` | `3` | `IT-ITeS & Digital` | Duration: 6 months | `40` | **Chronic Oversupply** across all districts (~48% ITI Phantom Capacity & High Unplaced Backlog) |

---

## 3. Core Domain Invariants

1. **Time Window:** 36 monthly historical observations from `2023-11` to `2026-10` (inclusive).
2. **Historical Demand Shock (`T-12m` = `2025-10`):**
   - In `2025-10`, a structural demand surge begins in **Rewa** (`Solar PV Installer (Suryamitra)` — utility-scale & PM Surya Ghar expansion) and **Indore** (`EV Service Lead Technician` — commercial EV fleet & Pithampur OEM service rollout).
   - This enables the **Time-Travel Replay** feature: rewinding `as_of_month` to `2025-10`, generating a 12-month forecast (`2025-11` to `2026-10`), and verifying predicted `P10 / P50 / P90` intervals against actual ground-truth observations recorded through `2026-10`.
3. **6-Stage Supply Pipeline & Phantom Capacity:**
   - Every district x occupation tracks:
     1. `sanctioned_seats` (strict multiples of NCVT `section_size`: 20, 24, or 40)
     2. `actual_enrolments` (models ~48% ITI Phantom Capacity in legacy/oversupplied trades and wage-disadvantaged trades)
     3. `completions`
     4. `certifications`
     5. `entered_employment`
     6. `retained_6m` (effective net skilled supply entering & staying in the trade)
   - Plus stock metric: `unplaced_backlog_stock` (certified graduates not absorbed into trade employment, available for rapid **SkillBridge** reskilling).
4. **PLFS Informal Capture Adjustment (`pi_tier`):**
   - Online job portals (NCS / private boards) capture only a fraction (`pi_tier`, e.g., `0.28` to `0.68`) of true district labor demand. True total demand is adjusted using PLFS district/sector benchmarks: `true_demand = clean_postings / pi_tier`.
5. **Empirical Bayes Confidence Tiers:**
   - `Tier 1: Direct` — Sufficient monthly clean postings & stable coverage; full automated action eligibility.
   - `Tier 2: Cluster-Pooled` — Moderate sample size; shrunk toward neighbor-district cluster prior (`malwa_industrial`, `central_mp_core`, etc.).
   - `Tier 3: Advisory Only` — Sparse cell; high uncertainty fan width; automated seat freeze/conversion blocked without human override.

---

## 4. Strict Folder Isolation for Phase 1 Parallel Agents

To guarantee **ZERO merge conflicts** and **ZERO schema mismatches** during parallel Phase 1 execution:

| Agent | Assigned Scope | Allowed Write Paths | Read-Only Dependencies |
| :--- | :--- | :--- | :--- |
| **Agent A (Backend & Engine)** | FastAPI endpoints, statistical forecasting, SkillClock lead-time engine, scenario optimizer | `/backend/**` (except breaking changes to `/backend/schemas.py`) | `/CONTRACT.md`, `/data/processed/*.json`, `/backend/schemas.py` |
| **Agent B (Frontend Core Views)** | Executive Dashboard, Forecast & SkillClock, Evidence Drawer, Skill Genome, Time-Travel Evaluation | `/frontend/src/views/core/**`, `/frontend/src/App.tsx` | `/CONTRACT.md`, `/frontend/src/types/contract.ts`, `/frontend/src/api/client.ts` |
| **Agent C (Frontend Studio Views)** | Seat Matrix Scenario Studio, SkillBridge Planner, Decision Playbook, Screen S09 Curriculum Drift Radar, Policy Brief Export | `/frontend/src/views/studio/**` | `/CONTRACT.md`, `/frontend/src/types/contract.ts`, `/frontend/src/api/client.ts` |

- **Locked Contract Files:** `/CONTRACT.md`, `/backend/schemas.py`, `/frontend/src/types/contract.ts`, and `/frontend/src/api/client.ts` define the single source of truth.
- **Resilient Offline Fallback:** `/frontend/src/api/client.ts` automatically falls back to local deterministic seed computation if the FastAPI backend at `http://localhost:8000` is unreachable or restarting.
