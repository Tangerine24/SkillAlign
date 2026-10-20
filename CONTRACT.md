# SkillAlign — Master API, Data & TypeScript Contract (`CONTRACT.md`)

> **Problem Statement:** SIH26246 — AI-Enabled Labour Market Intelligence and Skill Demand-Supply Forecasting Engine for MSDE  
> **Brand Name:** **SkillAlign** (Strictly no use of KaushalYuva)  
> **Pilot Geography:** **Madhya Pradesh** (`Indore`, `Bhopal`, `Jabalpur`, `Rewa`, `Ujjain`)  
> **Historical Observation Horizon:** `2023-11` to `2026-10` (36 months), with a structural demand shock injected at `T-12m` (`2025-10`) in `Rewa` (`Solar PV Installer`) and `Indore` (`EV Service Lead Technician`).

---

## 1. Canonical Enumerations & Domain Constants

### 1.1 Provenance Flag (`RealOrSyntheticFlag`)
- `"OBSERVED_PUBLIC_ANCHOR"` — Published MSDE/DGT/PLFS/NCS aggregate macro anchors and official NCO-2015 / NSQF / NCVT parameters.
- `"DERIVED_ESTIMATE"` — Statistically estimated parameters (e.g., PLFS `pi_tier` informal capture multiplier, Empirical Bayes shrinkage weights, 6-stage retention yields).
- `"SYNTHETIC_PILOT_FEED"` — High-realism deterministic monthly district-by-occupation micro-series synthesized for the Madhya Pradesh 36-month pilot.

### 1.2 Empirical Bayes Fallback Tier (`ConfidenceTier`)
- `"Tier 1: Direct"` — High posting density and consistent coverage; direct district-level structural time-series model used.
- `"Tier 2: Cluster-Pooled"` — Moderate sample density; Empirical Bayes shrinkage blends district series with neighbor-cluster prior.
- `"Tier 3: Advisory Only"` — Low/sparse observation volume; high uncertainty fan width; automated seat reallocation locked without human sign-off.

### 1.3 Pilot Districts (`district_id` -> `district_name`)
| `district_id` | `district_name` | `state_name` | `cluster_id` | `cluster_name` |
| :--- | :--- | :--- | :--- | :--- |
| `indore` | `Indore` | `Madhya Pradesh` | `malwa_industrial` | `Malwa Auto-Solar-IT Corridor` |
| `bhopal` | `Bhopal` | `Madhya Pradesh` | `central_mp_core` | `Central MP Institutional & EV Core` |
| `jabalpur` | `Jabalpur` | `Madhya Pradesh` | `mahakoshal_engg` | `Mahakoshal Heavy Engineering Cluster` |
| `rewa` | `Rewa` | `Madhya Pradesh` | `vindhya_green` | `Vindhya Ultra-Mega Solar Corridor` |
| `ujjain` | `Ujjain` | `Madhya Pradesh` | `malwa_industrial` | `Malwa Auto-Solar-IT Corridor` |

### 1.4 Pilot Occupations (`occupation_id` -> NCO-2015 & NSQF Spec)
| `occupation_id` | `occupation_name` | `nco_code` | `nsqf_level` | `sector` | `training_duration_months` | `section_size` | `bridge_duration_days` |
| :--- | :--- | :--- | :---: | :--- | :---: | :---: | :---: |
| `occ_solar_pv` | `Solar PV Installer (Suryamitra)` | `7411.0101` | `4` | `Green Energy & Electrical` | `3` | `20` | `90` |
| `occ_electrician` | `Electrician (General)` | `7411.0100` | `4` | `Green Energy & Electrical` | `24` | `20` | `null` |
| `occ_ev_tech` | `EV Service Lead Technician` | `7231.0105` | `4` | `Automotive & EV` | `12` | `20` | `45` |
| `occ_mmv` | `Mechanic Motor Vehicle (MMV)` | `7231.0101` | `4` | `Automotive & EV` | `24` | `24` | `null` |
| `occ_cnc_prog` | `CNC Programmer & Setter` | `7223.0501` | `4` | `Capital Goods & Manufacturing` | `12` | `20` | `60` |
| `occ_data_entry` | `Data Entry Operator / Domestic IT Helpdesk` | `4132.0402` | `3` | `IT-ITeS & Digital` | `6` | `40` | `null` |

---

## 2. Processed Dataset Schemas (`/data/processed/`)

### 2.1 `/data/processed/data_sources.json`
```json
{
  "generated_at": "2026-10-20T00:00:00Z",
  "state": "Madhya Pradesh",
  "sources": [
    {
      "source_id": "src_ncs_postings",
      "source_name": "National Career Service (NCS) & Aggregated Job Portals",
      "publisher": "Ministry of Labour & Employment (MoLE) / Employer Feeds",
      "refresh_cadence": "Daily / Monthly Aggregated",
      "duplicate_rate": 0.184,
      "stale_rate": 0.112,
      "mapping_confidence": 0.91,
      "real_or_synthetic": "SYNTHETIC_PILOT_FEED",
      "coverage_notes": "Captures formal & semi-formal online vacancy velocity; adjusted via PLFS pi_tier for informal demand."
    }
  ]
}
```

### 2.2 `/data/processed/skill_genome.json`
Contains:
- `occupations`: Array of `OccupationGenomeRecord` (with `occupation_id`, `occupation_name`, `nco_code`, `nsqf_level`, `sector`, `training_scheme`, `training_duration_months`, `training_hours`, `section_size`, `nos_nodes`, `emerging_unmapped_skills` for **Screen S09**).
- `skillbridge_pathways`: Array of `SkillBridgePathway` representing curated donor-to-target reskilling transitions:
  1. `Electrician (General)` (`7411.0100`) $\rightarrow$ `Solar PV Installer (Suryamitra)` (`7411.0101`): **76% skill overlap**, `90 days` (`300 hrs`) Suryamitra STT / Bridge module, cost in INR.
  2. `Mechanic Motor Vehicle (MMV)` (`7231.0101`) $\rightarrow$ `EV Service Lead Technician` (`7231.0105`): **72% skill overlap**, `45 days` (`180 hrs`) EV High-Voltage & BMS Bridge module, cost in INR.
  3. `Data Entry Operator / Domestic IT Helpdesk` (`4132.0402`) $\rightarrow$ `Solar PV Installer (Suryamitra)` (`7411.0101`) or ERP/Shopfloor Coordinator path (low technical overlap warning example).
  4. `Electrician (General)` (`7411.0100`) $\rightarrow$ `EV Service Lead Technician` (`7231.0105`): **64% skill overlap**, `60 days` (`240 hrs`) Automotive HV & CAN-Bus Bridge module.

### 2.3 `/data/processed/timeseries_observations.json` (and `.csv`)
Contains 36 months (`2023-11` to `2026-10`) $\times$ 5 districts $\times$ 6 occupations = **1,080 monthly records**:
```json
{
  "record_id": "obs_rewa_occ_solar_pv_2025-10",
  "month": "2025-10",
  "district_id": "rewa",
  "district_name": "Rewa",
  "occupation_id": "occ_solar_pv",
  "occupation_name": "Solar PV Installer (Suryamitra)",
  "nco_code": "7411.0101",
  "nsqf_level": 4,
  "sector": "Green Energy & Electrical",
  "raw_postings": 215,
  "deduplicated_clean_postings": 154,
  "posting_velocity_mom": 0.425,
  "plfs_capture_rate_pi_tier": 0.38,
  "estimated_total_demand": 405,
  "offered_trade_wage_inr": 19800,
  "local_alternative_gig_wage_inr": 14500,
  "wage_ competitiveness_ratio": 1.365,
  "confidence_tier": "Tier 1: Direct",
  "eb_shrinkage_weight": 0.88,
  "sanctioned_seats": 120,
  "actual_enrolments": 112,
  "phantom_capacity_rate": 0.067,
  "completions": 102,
  "certifications": 96,
  "entered_employment": 84,
  "retained_6m": 76,
  "unplaced_backlog_stock": 18,
  "net_monthly_supply": 28,
  "monthly_net_gap": 377,
  "is_shock_window": true,
  "real_or_synthetic": "SYNTHETIC_PILOT_FEED"
}
```

---

## 3. Exact 12 REST API Endpoint Specifications

Base URL: `http://localhost:8000`

### Endpoint 1: `GET /api/v1/geographies`
- **Response (`GeographiesResponse`):**
  - `state_name`: `"Madhya Pradesh"`
  - `state_code`: `"MP"`
  - `districts`: `DistrictInfo[]` (`district_id`, `district_name`, `cluster_id`, `cluster_name`, `latitude`, `longitude`, `iti_count`, `pmkvy_tc_count`, `dominant_sectors`, `key_industrial_anchors`)
  - `sectors`: `string[]`

### Endpoint 2: `GET /api/v1/occupations`
- **Query Params (optional):** `sector?: string`
- **Response (`OccupationsResponse`):**
  - `occupations`: `OccupationSummary[]` (`occupation_id`, `occupation_name`, `nco_code`, `nsqf_level`, `sector`, `training_scheme`, `training_duration_months`, `training_hours`, `section_size`, `bridge_duration_days`, `market_status`, `donor_or_target_role`, `primary_shortage_districts`, `skill_overlap_highlight`)

### Endpoint 3: `GET /api/v1/dashboard`
- **Query Params (optional):** `district_id?: string`, `sector?: string`, `as_of_month?: string` (default `"2026-10"`)
- **Response (`DashboardResponse`):**
  - `as_of_month`: `string`
  - `state_name`: `"Madhya Pradesh"`
  - `kpis`: `DashboardKPIs` (`total_annual_demand`, `total_effective_supply_retained`, `net_skill_gap`, `overall_phantom_capacity_pct`, `total_unplaced_backlog`, `high_shortage_cells_count`, `chronic_surplus_cells_count`, `reallocation_opportunity_seats`)
  - `heatmap_cells`: `DistrictOccupationCell[]` (all 30 district $\times$ occupation cells with demand, supply, gap, status, `confidence_tier`, wage ratio, phantom capacity rate, `forecast_id`)
  - `supply_funnel_aggregate`: `SupplyPipelineStage[]` (6 stages + unplaced backlog stock)
  - `top_alerts`: `DashboardAlert[]`

### Endpoint 4: `GET /api/v1/forecast`
- **Query Params:** `district_id?: string` (default `"rewa"`), `occupation_id?: string` (default `"occ_solar_pv"`), `as_of_month?: string` (default `"2026-10"`), `horizon_months?: number` (default `12`)
- **Response (`ForecastResponse`):**
  - `forecast_id`: `string` (e.g. `"fc_rewa_occ_solar_pv_2026-10"`)
  - `district_id`, `district_name`, `occupation_id`, `occupation_name`, `nco_code`, `nsqf_level`, `sector`
  - `as_of_month`: `string`
  - `horizon_months`: `number`
  - `confidence_tier`: `ConfidenceTier`
  - `plfs_capture_rate_pi_tier`: `number`
  - `training_duration_months`: `number`
  - `bridge_duration_days`: `number | null`
  - `historical_series`: `ForecastTimePoint[]`
  - `forecast_series`: `ForecastTimePoint[]` (includes `demand_p10`, `demand_p50`, `demand_p90`, `supply_baseline`, `supply_retained_6m`, `net_gap_p50`)
  - `supply_pipeline_breakdown`: `SupplyPipelineMetrics`
  - `wage_dynamics`: `WageDynamics`
  - `recommended_intervention`: `string`

### Endpoint 5: `GET /api/v1/evidence/{forecast_id}`
- **Path Param:** `forecast_id: string`
- **Response (`EvidenceResponse`):**
  - `forecast_id`, `district_id`, `district_name`, `occupation_id`, `occupation_name`, `as_of_month`
  - `confidence_tier`: `ConfidenceTier`
  - `eb_shrinkage_weight`: `number`
  - `neighbor_cluster_name`: `string`
  - `cleaning_waterfall`: `CleaningWaterfallStep[]` (Raw Postings $\rightarrow$ Deduplicated $\rightarrow$ Stale Removed $\rightarrow$ NCO Mapped $\rightarrow$ PLFS `pi_tier` Informal Adjusted Total Demand)
  - `feature_drivers`: `FeatureDriver[]` (driver name, contribution pct, direction, provenance)
  - `data_sources`: `DataSourceRecord[]`
  - `audit_notes`: `string[]`

### Endpoint 6: `GET /api/v1/skill-genome/{occupation_id}`
- **Path Param:** `occupation_id: string` (accepts `occ_solar_pv` or NCO code `7411.0101`)
- **Response (`SkillGenomeResponse`):**
  - `occupation`: `OccupationGenomeRecord` (includes `nos_nodes: NOSCompetencyNode[]` and `emerging_unmapped_skills: EmergingSkillNode[]` for **Screen S09**)
  - `adjacent_transitions`: `SkillBridgePathway[]`
  - `curriculum_drift_summary`: `CurriculumDriftSummary` (`overall_drift_score`, `unmapped_demand_share_pct`, `last_nsqf_revision_year`, `recommended_micro_credentials`)

### Endpoint 7: `GET /api/v1/skillbridge/pathways`
- **Query Params (optional):** `district_id?: string`, `source_occupation_id?: string`, `target_occupation_id?: string`
- **Response (`SkillBridgePathwaysResponse`):**
  - `district_id`: `string | null`
  - `pathways`: `SkillBridgePathway[]` (`pathway_id`, `source_occupation_id`, `source_occupation_name`, `source_nco_code`, `target_occupation_id`, `target_occupation_name`, `target_nco_code`, `skill_overlap_pct`, `shared_skills`, `missing_skills`, `bridge_module_code`, `bridge_module_name`, `bridge_duration_days`, `bridge_hours`, `bridge_cost_per_candidate_inr`, `available_donor_pool`, `projected_placement_rate`, `roi_payback_months`)

### Endpoint 8: `POST /api/v1/skillclock/estimate` (also supports `GET`)
- **Request Body (`SkillClockRequest`):**
  - `district_id`: `string`
  - `target_occupation_id`: `string`
  - `donor_occupation_id?: string`
  - `target_gap_headcount`: `number`
  - `intervention_start_month?: string` (default `"2026-11"`)
  - `wage_stipend_topup_inr?: number` (default `0`)
- **Response (`SkillClockEstimateResponse`):**
  - `district_id`, `district_name`, `target_occupation_id`, `target_occupation_name`
  - `target_gap_headcount`: `number`
  - `fresh_iti_pathway`: `LeadTimeOption` (e.g., 12–24 months lead time, graduation month, misses near-term peak window warning)
  - `pmkvy_stt_pathway`: `LeadTimeOption` (e.g., 3 months / 90 days lead time)
  - `skillbridge_conversion_pathway`: `LeadTimeOption` (e.g., 45–90 days bridge from donor trade / unplaced backlog)
  - `monthly_readiness_curve`: `ReadinessTimelinePoint[]`
  - `verdict_summary`: `string`

### Endpoint 9: `POST /api/v1/scenarios` (also supports `GET /api/v1/scenarios`)
- **Request Body (`ScenarioSimulationRequest`):**
  - `scenario_name`: `string`
  - `district_id`: `string`
  - `as_of_month?: string` (default `"2026-10"`)
  - `seat_reallocations`: `SeatReallocationItem[]` (`from_occupation_id`, `to_occupation_id`, `sections_converted`, `seats_converted`)
  - `bridge_batches`: `BridgeBatchItem[]` (`pathway_id`, `candidates_enrolled`)
  - `wage_subsidy_monthly_inr`: `number`
- **Response (`ScenarioSimulationResponse`):**
  - `scenario_id`: `string`
  - `scenario_name`, `district_id`, `district_name`, `created_at`
  - `ncvt_constraint_valid`: `boolean`
  - `constraint_messages`: `string[]`
  - `baseline_net_gap`: `number`
  - `simulated_net_gap`: `number`
  - `gap_reduction_pct`: `number`
  - `phantom_capacity_before_pct`: `number`
  - `phantom_capacity_after_pct`: `number`
  - `total_budget_inr`: `number`
  - `cost_per_placed_candidate_inr`: `number`
  - `occupation_impacts`: `ScenarioOccupationImpact[]`

### Endpoint 10: `GET /api/v1/forecast-evaluation`
- **Query Params (optional):** `district_id?: string` (default `"rewa"`), `occupation_id?: string` (default `"occ_solar_pv"`), `rewind_to_month?: string` (default `"2025-10"`)
- **Response (`ForecastEvaluationResponse`):**
  - `evaluation_id`: `string`
  - `district_id`, `district_name`, `occupation_id`, `occupation_name`
  - `rewind_to_month`: `"2025-10"`
  - `verify_through_month`: `"2026-10"`
  - `shock_event_title`: `string`
  - `shock_event_narrative`: `string`
  - `metrics`: `BacktestMetrics` (`skillalign_wape`, `naive_baseline_wape`, `mase`, `pinball_loss_p50`, `empirical_coverage_80pi`, `action_accuracy_pct`)
  - `replay_series`: `TimeTravelReplayPoint[]` (historical up to `2025-10`, plus `2025-11` to `2026-10` showing `actual_ground_truth`, `skillalign_p10`, `skillalign_p50`, `skillalign_p90`, and `naive_flat_forecast`)
  - `district_benchmark_table`: `DistrictEvaluationSummary[]`

### Endpoint 11: `GET /api/v1/decisions` (also supports `POST /api/v1/decisions`)
- **Query Params (optional):** `district_id?: string`, `status?: string`
- **Response (`DecisionsResponse`):**
  - `decisions`: `PolicyDecisionItem[]` (`decision_id`, `district_id`, `district_name`, `occupation_id`, `occupation_name`, `donor_occupation_id`, `donor_occupation_name`, `action_type`, `title`, `rationale`, `confidence_tier`, `AutomatedActionAllowed`, `sections_delta`, `seats_delta`, `bridge_candidates`, `estimated_cost_inr`, `expected_gap_closed`, `time_to_impact_days`, `status`, `updated_at`)

### Endpoint 12: `GET /api/v1/reports/{scenario_id}`
- **Path Param:** `scenario_id: string` (e.g., `"scen_mp_flagship_2026"` or any scenario ID)
- **Response (`PolicyReportResponse`):**
  - `report_id`, `scenario_id`, `title`, `generated_at`, `issuing_authority`, `target_state`, `executive_summary`
  - `key_findings`: `string[]`
  - `ncvt_seat_orders`: `SeatOrderLineItem[]`
  - `pmkvy_bridge_orders`: `BridgeOrderLineItem[]`
  - `budget_summary`: `ReportBudgetSummary`
  - `governance_disclaimers`: `string[]`
  - `markdown_brief`: `string`
