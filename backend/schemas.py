"""
SkillAlign — Canonical Pydantic v2 Schemas (/backend/schemas.py)
100% locked contract matching CONTRACT.md and /frontend/src/types/contract.ts.
Never rename or remove fields in Phase 1 without updating CONTRACT.md.
"""

from __future__ import annotations

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


# ============================================================================
# 1. Canonical Literal Types & Enumerations
# ============================================================================

RealOrSyntheticFlag = Literal[
    "OBSERVED_PUBLIC_ANCHOR",
    "DERIVED_ESTIMATE",
    "SYNTHETIC_PILOT_FEED",
]

ConfidenceTier = Literal[
    "Tier 1: Direct",
    "Tier 2: Cluster-Pooled",
    "Tier 3: Advisory Only",
]

MarketStatus = Literal[
    "HIGH_SHORTAGE",
    "WAGE_GAP_SHORTAGE",
    "BALANCED",
    "SURPLUS_DONOR",
    "CHRONIC_OVERSUPPLY",
]

DonorOrTargetRole = Literal[
    "TARGET_TRADE",
    "DONOR_TRADE",
    "OVERSUPPLIED_LEGACY",
]

NSQFCoverageStatus = Literal[
    "UNMAPPED",
    "PARTIAL_LEGACY",
    "DRAFT_NOS",
]

DecisionActionType = Literal[
    "CONVERT_ITI_SECTION",
    "LAUNCH_PMKVY_BRIDGE",
    "WAGE_STIPEND_TOPUP",
    "FREEZE_PHANTOM_SEATS",
    "CURRICULUM_MICRO_CREDENTIAL",
    "ADVISORY_HOLD_TIER3",
]

DecisionStatus = Literal[
    "RECOMMENDED",
    "APPROVED",
    "DEFERRED",
    "LOCKED_ADVISORY",
]


# ============================================================================
# 2. Endpoint 1: GET /api/v1/geographies
# ============================================================================

class DistrictInfo(BaseModel):
    district_id: str
    district_name: str
    state_name: str = "Madhya Pradesh"
    state_code: str = "MP"
    cluster_id: str
    cluster_name: str
    latitude: float
    longitude: float
    iti_count: int
    pmkvy_tc_count: int
    dominant_sectors: List[str]
    key_industrial_anchors: List[str]
    local_gig_wage_base_inr: int


class ITICampusInfo(BaseModel):
    campus_id: str
    campus_name: str
    mis_code: str
    district_id: str
    district_name: str
    sanctioned_seats: int
    active_enrolments: int
    phantom_capacity_pct: float
    key_trades: List[str]
    nodal_role: str


class GeographiesResponse(BaseModel):
    brand: str = "SkillAlign"
    state_name: str = "Madhya Pradesh"
    state_code: str = "MP"
    districts: List[DistrictInfo]
    sectors: List[str]
    iti_campuses: Optional[List[ITICampusInfo]] = None


# ============================================================================
# 3. Endpoint 2: GET /api/v1/occupations
# ============================================================================

class OccupationSummary(BaseModel):
    occupation_id: str
    occupation_name: str
    nco_code: str
    nsqf_level: int
    sector: str
    training_scheme: str
    training_duration_months: int
    training_hours: int
    section_size: int
    bridge_duration_days: Optional[int] = None
    market_status: MarketStatus
    donor_or_target_role: DonorOrTargetRole
    primary_shortage_districts: List[str]
    skill_overlap_highlight: str
    base_offered_wage_inr: int


class OccupationsResponse(BaseModel):
    brand: str = "SkillAlign"
    occupations: List[OccupationSummary]


# ============================================================================
# 4. Endpoint 3: GET /api/v1/dashboard
# ============================================================================

class DashboardKPIs(BaseModel):
    total_annual_demand: int
    total_effective_supply_retained: int
    net_skill_gap: int
    overall_phantom_capacity_pct: float
    total_unplaced_backlog: int
    high_shortage_cells_count: int
    chronic_surplus_cells_count: int
    reallocation_opportunity_seats: int


class DistrictOccupationCell(BaseModel):
    cell_id: str
    forecast_id: str
    district_id: str
    district_name: str
    occupation_id: str
    occupation_name: str
    nco_code: str
    nsqf_level: int
    sector: str
    section_size: int
    as_of_month: str
    annualized_demand: int
    annualized_effective_supply: int
    net_annual_gap: int
    monthly_demand: int
    monthly_supply: int
    monthly_net_gap: int
    market_status: MarketStatus
    confidence_tier: ConfidenceTier
    plfs_capture_rate_pi_tier: float
    sanctioned_seats: int
    actual_enrolments: int
    phantom_capacity_rate: float
    retained_6m: int
    unplaced_backlog_stock: int
    offered_trade_wage_inr: int
    local_alternative_gig_wage_inr: int
    wage_competitiveness_ratio: float


class SupplyPipelineStage(BaseModel):
    stage_key: str
    stage_label: str
    headcount: int
    conversion_from_previous_pct: float
    drop_off_reason: str


class DashboardAlert(BaseModel):
    alert_id: str
    severity: Literal["CRITICAL", "WARNING", "INFO"]
    district_id: str
    district_name: str
    occupation_id: str
    occupation_name: str
    headline: str
    detail: str
    recommended_action: str


class DashboardResponse(BaseModel):
    brand: str = "SkillAlign"
    state_name: str = "Madhya Pradesh"
    as_of_month: str
    kpis: DashboardKPIs
    heatmap_cells: List[DistrictOccupationCell]
    supply_funnel_aggregate: List[SupplyPipelineStage]
    top_alerts: List[DashboardAlert]


# ============================================================================
# 5. Endpoint 4: GET /api/v1/forecast
# ============================================================================

class ForecastTimePoint(BaseModel):
    month: str
    is_historical: bool
    is_shock_window: bool
    raw_postings: Optional[int] = None
    clean_postings: Optional[int] = None
    demand_p10: int
    demand_p50: int
    demand_p90: int
    supply_sanctioned_monthly: int
    supply_retained_6m: int
    net_gap_p50: int


class SupplyPipelineMetrics(BaseModel):
    section_size: int
    sanctioned_sections: int
    sanctioned_seats: int
    actual_enrolments: int
    phantom_capacity_rate: float
    completions: int
    certifications: int
    entered_employment: int
    retained_6m: int
    unplaced_backlog_stock: int


class WageDynamics(BaseModel):
    offered_trade_wage_inr: int
    local_alternative_gig_wage_inr: int
    wage_competitiveness_ratio: float
    wage_gap_inr: int
    attrition_risk_level: Literal["LOW", "MODERATE", "HIGH"]
    explanation: str


class ForecastResponse(BaseModel):
    forecast_id: str
    district_id: str
    district_name: str
    occupation_id: str
    occupation_name: str
    nco_code: str
    nsqf_level: int
    sector: str
    as_of_month: str
    horizon_months: int
    confidence_tier: ConfidenceTier
    eb_shrinkage_weight: float
    plfs_capture_rate_pi_tier: float
    training_duration_months: int
    bridge_duration_days: Optional[int] = None
    historical_series: List[ForecastTimePoint]
    forecast_series: List[ForecastTimePoint]
    supply_pipeline_breakdown: SupplyPipelineMetrics
    wage_dynamics: WageDynamics
    recommended_intervention: str


# ============================================================================
# 6. Endpoint 5: GET /api/v1/evidence/{forecast_id}
# ============================================================================

class DataSourceRecord(BaseModel):
    source_id: str
    source_name: str
    publisher: str
    refresh_cadence: str
    duplicate_rate: float
    stale_rate: float
    mapping_confidence: float
    real_or_synthetic: RealOrSyntheticFlag
    coverage_notes: str


class CleaningWaterfallStep(BaseModel):
    step_order: int
    step_name: str
    input_count: int
    output_count: int
    delta_pct: float
    rule_applied: str
    real_or_synthetic: RealOrSyntheticFlag


class FeatureDriver(BaseModel):
    driver_name: str
    contribution_pct: float
    direction: Literal["POSITIVE", "NEGATIVE", "NEUTRAL"]
    explanation: str
    real_or_synthetic: RealOrSyntheticFlag


class EvidenceResponse(BaseModel):
    forecast_id: str
    district_id: str
    district_name: str
    occupation_id: str
    occupation_name: str
    nco_code: str
    as_of_month: str
    confidence_tier: ConfidenceTier
    eb_shrinkage_weight: float
    neighbor_cluster_name: str
    AutomatedActionAllowed: bool
    cleaning_waterfall: List[CleaningWaterfallStep]
    feature_drivers: List[FeatureDriver]
    data_sources: List[DataSourceRecord]
    audit_notes: List[str]


# ============================================================================
# 7. Endpoint 6 & 7: Skill Genome & SkillBridge Pathways
# ============================================================================

class NOSCompetencyNode(BaseModel):
    nos_code: str
    nos_title: str
    nsqf_level: int
    hours: int
    category: Literal["DOMAIN_CORE", "SHARED_FOUNDATION", "SAFETY_COMPLIANCE"]
    is_core: bool
    demand_frequency_pct: float


class EmergingSkillNode(BaseModel):
    skill_id: str
    skill_name: str
    occupation_id: str
    nco_code: str
    posting_mention_growth_yoy_pct: float
    employer_demand_share_pct: float
    current_nsqf_coverage: NSQFCoverageStatus
    recommended_micro_credential: str
    estimated_upskill_hours: int
    sample_job_snippets: List[str]


class OccupationGenomeRecord(BaseModel):
    occupation_id: str
    occupation_name: str
    nco_code: str
    nsqf_level: int
    qp_code: str
    sector: str
    training_scheme: str
    training_duration_months: int
    training_hours: int
    section_size: int
    last_nsqf_revision_year: int
    curriculum_drift_score: float
    unmapped_demand_share_pct: float
    nos_nodes: List[NOSCompetencyNode]
    emerging_unmapped_skills: List[EmergingSkillNode]


class SkillBridgePathway(BaseModel):
    pathway_id: str
    source_occupation_id: str
    source_occupation_name: str
    source_nco_code: str
    source_nsqf_level: int
    target_occupation_id: str
    target_occupation_name: str
    target_nco_code: str
    target_nsqf_level: int
    skill_overlap_pct: float
    shared_skills: List[str]
    missing_skills: List[str]
    bridge_module_code: str
    bridge_module_name: str
    bridge_duration_days: int
    bridge_hours: int
    bridge_cost_per_candidate_inr: int
    fresh_training_duration_months: int
    lead_time_saved_months: float
    available_donor_pool: int
    projected_placement_rate: float
    expected_wage_uplift_inr: int
    roi_payback_months: float


class CurriculumDriftSummary(BaseModel):
    overall_drift_score: float
    unmapped_demand_share_pct: float
    last_nsqf_revision_year: int
    recommended_micro_credentials: List[str]


class SkillGenomeResponse(BaseModel):
    occupation: OccupationGenomeRecord
    adjacent_transitions: List[SkillBridgePathway]
    curriculum_drift_summary: CurriculumDriftSummary


class SkillBridgePathwaysResponse(BaseModel):
    district_id: Optional[str] = None
    pathways: List[SkillBridgePathway]


# ============================================================================
# 8. Endpoint 8: POST /api/v1/skillclock/estimate
# ============================================================================

class SkillClockRequest(BaseModel):
    district_id: str = "rewa"
    target_occupation_id: str = "occ_solar_pv"
    donor_occupation_id: Optional[str] = "occ_electrician"
    target_gap_headcount: int = 180
    intervention_start_month: str = "2026-11"
    wage_stipend_topup_inr: int = 0


class LeadTimeOption(BaseModel):
    option_key: Literal["FRESH_ITI", "PMKVY_STT", "SKILLBRIDGE_CONVERSION"]
    option_label: str
    scheme_name: str
    duration_days: int
    duration_months: float
    ready_by_month: str
    hits_12m_demand_window: bool
    effective_yield_rate: float
    required_enrolments: int
    total_cost_inr: int
    cost_per_retained_worker_inr: int
    bottleneck_note: str


class ReadinessTimelinePoint(BaseModel):
    month_offset: int
    month_label: str
    cumulative_demand_target: int
    fresh_iti_ready_supply: int
    pmkvy_stt_ready_supply: int
    skillbridge_ready_supply: int


class SkillClockEstimateResponse(BaseModel):
    district_id: str
    district_name: str
    target_occupation_id: str
    target_occupation_name: str
    donor_occupation_id: Optional[str] = None
    donor_occupation_name: Optional[str] = None
    target_gap_headcount: int
    intervention_start_month: str
    fresh_iti_pathway: LeadTimeOption
    pmkvy_stt_pathway: LeadTimeOption
    skillbridge_conversion_pathway: LeadTimeOption
    monthly_readiness_curve: List[ReadinessTimelinePoint]
    verdict_summary: str


# ============================================================================
# 9. Endpoint 9: POST /api/v1/scenarios
# ============================================================================

class SeatReallocationItem(BaseModel):
    from_occupation_id: str
    to_occupation_id: str
    sections_converted: int
    seats_converted: int


class BridgeBatchItem(BaseModel):
    pathway_id: str
    candidates_enrolled: int


class ScenarioSimulationRequest(BaseModel):
    scenario_name: str = "MP Rewa-Indore Green & EV Realignment Plan"
    district_id: str = "rewa"
    as_of_month: str = "2026-10"
    seat_reallocations: List[SeatReallocationItem] = Field(default_factory=list)
    bridge_batches: List[BridgeBatchItem] = Field(default_factory=list)
    wage_subsidy_monthly_inr: int = 1500


class ScenarioOccupationImpact(BaseModel):
    occupation_id: str
    occupation_name: str
    nco_code: str
    section_size: int
    baseline_sections: int
    simulated_sections: int
    baseline_sanctioned_seats: int
    simulated_sanctioned_seats: int
    baseline_effective_supply: int
    simulated_effective_supply: int
    annual_demand: int
    baseline_net_gap: int
    simulated_net_gap: int


class ScenarioSimulationResponse(BaseModel):
    scenario_id: str
    scenario_name: str
    district_id: str
    district_name: str
    created_at: str
    ncvt_constraint_valid: bool
    constraint_messages: List[str]
    baseline_net_gap: int
    simulated_net_gap: int
    gap_reduction_pct: float
    phantom_capacity_before_pct: float
    phantom_capacity_after_pct: float
    total_budget_inr: int
    cost_per_placed_candidate_inr: int
    occupation_impacts: List[ScenarioOccupationImpact]


# ============================================================================
# 10. Endpoint 10: GET /api/v1/forecast-evaluation
# ============================================================================

class BacktestMetrics(BaseModel):
    skillalign_wape: float
    naive_baseline_wape: float
    wape_improvement_pct: float
    mase: float
    pinball_loss_p50: float
    empirical_coverage_80pi: float
    action_accuracy_pct: float


class TimeTravelReplayPoint(BaseModel):
    month: str
    phase: Literal["TRAIN_HISTORY", "REPLAY_TEST_WINDOW"]
    actual_ground_truth: int
    skillalign_p10: Optional[int] = None
    skillalign_p50: Optional[int] = None
    skillalign_p90: Optional[int] = None
    naive_flat_forecast: Optional[int] = None
    within_80pi_band: Optional[bool] = None


class DistrictEvaluationSummary(BaseModel):
    district_id: str
    district_name: str
    occupation_id: str
    occupation_name: str
    confidence_tier: ConfidenceTier
    skillalign_wape: float
    naive_wape: float
    coverage_80pi: float
    shock_captured: bool


class ForecastEvaluationResponse(BaseModel):
    evaluation_id: str
    district_id: str
    district_name: str
    occupation_id: str
    occupation_name: str
    nco_code: str
    rewind_to_month: str
    verify_through_month: str
    shock_event_title: str
    shock_event_narrative: str
    metrics: BacktestMetrics
    replay_series: List[TimeTravelReplayPoint]
    district_benchmark_table: List[DistrictEvaluationSummary]


# ============================================================================
# 11. Endpoint 11: GET /api/v1/decisions
# ============================================================================

class PolicyDecisionItem(BaseModel):
    decision_id: str
    district_id: str
    district_name: str
    occupation_id: str
    occupation_name: str
    nco_code: str
    donor_occupation_id: Optional[str] = None
    donor_occupation_name: Optional[str] = None
    action_type: DecisionActionType
    title: str
    rationale: str
    confidence_tier: ConfidenceTier
    AutomatedActionAllowed: bool
    sections_delta: int
    seats_delta: int
    bridge_candidates: int
    estimated_cost_inr: int
    expected_gap_closed: int
    time_to_impact_days: int
    status: DecisionStatus
    updated_at: str


class DecisionUpdateRequest(BaseModel):
    decision_id: str
    status: DecisionStatus
    reviewer_note: Optional[str] = None


class DecisionsResponse(BaseModel):
    brand: str = "SkillAlign"
    decisions: List[PolicyDecisionItem]


# ============================================================================
# 12. Endpoint 12: GET /api/v1/reports/{scenario_id}
# ============================================================================

class SeatOrderLineItem(BaseModel):
    district_name: str
    from_trade: str
    from_nco: str
    to_trade: str
    to_nco: str
    section_size: int
    sections_reallocated: int
    seats_reallocated: int
    implementation_window: str


class BridgeOrderLineItem(BaseModel):
    district_name: str
    pathway_name: str
    module_code: str
    duration_days: int
    batch_headcount: int
    unit_cost_inr: int
    total_cost_inr: int
    expected_placements: int


class ReportBudgetSummary(BaseModel):
    seat_conversion_capex_inr: int
    skillbridge_training_opex_inr: int
    wage_stipend_support_inr: int
    total_allocation_inr: int
    projected_12m_placements: int
    effective_cost_per_placement_inr: int


class PolicyReportResponse(BaseModel):
    report_id: str
    scenario_id: str
    brand: str = "SkillAlign"
    title: str
    generated_at: str
    issuing_authority: str
    target_state: str
    executive_summary: str
    key_findings: List[str]
    ncvt_seat_orders: List[SeatOrderLineItem]
    pmkvy_bridge_orders: List[BridgeOrderLineItem]
    budget_summary: ReportBudgetSummary
    governance_disclaimers: List[str]
    markdown_brief: str
