/**
 * SkillAlign — Canonical TypeScript Contract (/frontend/src/types/contract.ts)
 * 100% synchronized with /backend/schemas.py and CONTRACT.md.
 * SIH 2026 Problem Statement SIH26246: AI-Enabled Labour Market Intelligence
 * and Skill Demand-Supply Forecasting Engine for MSDE.
 */

// ============================================================================
// 1. Canonical Literal Types & Enumerations
// ============================================================================

export type RealOrSyntheticFlag =
  | 'OBSERVED_PUBLIC_ANCHOR'
  | 'DERIVED_ESTIMATE'
  | 'SYNTHETIC_PILOT_FEED';

export type ConfidenceTier =
  | 'Tier 1: Direct'
  | 'Tier 2: Cluster-Pooled'
  | 'Tier 3: Advisory Only';

export type MarketStatus =
  | 'HIGH_SHORTAGE'
  | 'WAGE_GAP_SHORTAGE'
  | 'BALANCED'
  | 'SURPLUS_DONOR'
  | 'CHRONIC_OVERSUPPLY';

export type DonorOrTargetRole =
  | 'TARGET_TRADE'
  | 'DONOR_TRADE'
  | 'OVERSUPPLIED_LEGACY';

export type NSQFCoverageStatus =
  | 'UNMAPPED'
  | 'PARTIAL_LEGACY'
  | 'DRAFT_NOS';

export type DecisionActionType =
  | 'CONVERT_ITI_SECTION'
  | 'LAUNCH_PMKVY_BRIDGE'
  | 'WAGE_STIPEND_TOPUP'
  | 'FREEZE_PHANTOM_SEATS'
  | 'CURRICULUM_MICRO_CREDENTIAL'
  | 'ADVISORY_HOLD_TIER3';

export type DecisionStatus =
  | 'RECOMMENDED'
  | 'APPROVED'
  | 'DEFERRED'
  | 'LOCKED_ADVISORY';

// ============================================================================
// 2. Endpoint 1: GET /api/v1/geographies
// ============================================================================

export interface DistrictInfo {
  district_id: string;
  district_name: string;
  state_name: string;
  state_code: string;
  cluster_id: string;
  cluster_name: string;
  latitude: number;
  longitude: number;
  iti_count: number;
  pmkvy_tc_count: number;
  dominant_sectors: string[];
  key_industrial_anchors: string[];
  local_gig_wage_base_inr: number;
}

export interface GeographiesResponse {
  brand: string;
  state_name: string;
  state_code: string;
  districts: DistrictInfo[];
  sectors: string[];
}

// ============================================================================
// 3. Endpoint 2: GET /api/v1/occupations
// ============================================================================

export interface OccupationSummary {
  occupation_id: string;
  occupation_name: string;
  nco_code: string;
  nsqf_level: number;
  sector: string;
  training_scheme: string;
  training_duration_months: number;
  training_hours: number;
  section_size: number;
  bridge_duration_days: number | null;
  market_status: MarketStatus;
  donor_or_target_role: DonorOrTargetRole;
  primary_shortage_districts: string[];
  skill_overlap_highlight: string;
  base_offered_wage_inr: number;
}

export interface OccupationsResponse {
  brand: string;
  occupations: OccupationSummary[];
}

// ============================================================================
// 4. Endpoint 3: GET /api/v1/dashboard
// ============================================================================

export interface DashboardKPIs {
  total_annual_demand: number;
  total_effective_supply_retained: number;
  net_skill_gap: number;
  overall_phantom_capacity_pct: number;
  total_unplaced_backlog: number;
  high_shortage_cells_count: number;
  chronic_surplus_cells_count: number;
  reallocation_opportunity_seats: number;
}

export interface DistrictOccupationCell {
  cell_id: string;
  forecast_id: string;
  district_id: string;
  district_name: string;
  occupation_id: string;
  occupation_name: string;
  nco_code: string;
  nsqf_level: number;
  sector: string;
  section_size: number;
  as_of_month: string;
  annualized_demand: number;
  annualized_effective_supply: number;
  net_annual_gap: number;
  monthly_demand: number;
  monthly_supply: number;
  monthly_net_gap: number;
  market_status: MarketStatus;
  confidence_tier: ConfidenceTier;
  plfs_capture_rate_pi_tier: number;
  sanctioned_seats: number;
  actual_enrolments: number;
  phantom_capacity_rate: number;
  retained_6m: number;
  unplaced_backlog_stock: number;
  offered_trade_wage_inr: number;
  local_alternative_gig_wage_inr: number;
  wage_competitiveness_ratio: number;
}

export interface SupplyPipelineStage {
  stage_key: string;
  stage_label: string;
  headcount: number;
  conversion_from_previous_pct: number;
  drop_off_reason: string;
}

export interface DashboardAlert {
  alert_id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  district_id: string;
  district_name: string;
  occupation_id: string;
  occupation_name: string;
  headline: string;
  detail: string;
  recommended_action: string;
}

export interface DashboardResponse {
  brand: string;
  state_name: string;
  as_of_month: string;
  kpis: DashboardKPIs;
  heatmap_cells: DistrictOccupationCell[];
  supply_funnel_aggregate: SupplyPipelineStage[];
  top_alerts: DashboardAlert[];
}

// ============================================================================
// 5. Endpoint 4: GET /api/v1/forecast
// ============================================================================

export interface ForecastTimePoint {
  month: string;
  is_historical: boolean;
  is_shock_window: boolean;
  raw_postings: number | null;
  clean_postings: number | null;
  demand_p10: number;
  demand_p50: number;
  demand_p90: number;
  supply_sanctioned_monthly: number;
  supply_retained_6m: number;
  net_gap_p50: number;
}

export interface SupplyPipelineMetrics {
  section_size: number;
  sanctioned_sections: number;
  sanctioned_seats: number;
  actual_enrolments: number;
  phantom_capacity_rate: number;
  completions: number;
  certifications: number;
  entered_employment: number;
  retained_6m: number;
  unplaced_backlog_stock: number;
}

export interface WageDynamics {
  offered_trade_wage_inr: number;
  local_alternative_gig_wage_inr: number;
  wage_competitiveness_ratio: number;
  wage_gap_inr: number;
  attrition_risk_level: 'LOW' | 'MODERATE' | 'HIGH';
  explanation: string;
}

export interface ForecastResponse {
  forecast_id: string;
  district_id: string;
  district_name: string;
  occupation_id: string;
  occupation_name: string;
  nco_code: string;
  nsqf_level: number;
  sector: string;
  as_of_month: string;
  horizon_months: number;
  confidence_tier: ConfidenceTier;
  eb_shrinkage_weight: number;
  plfs_capture_rate_pi_tier: number;
  training_duration_months: number;
  bridge_duration_days: number | null;
  historical_series: ForecastTimePoint[];
  forecast_series: ForecastTimePoint[];
  supply_pipeline_breakdown: SupplyPipelineMetrics;
  wage_dynamics: WageDynamics;
  recommended_intervention: string;
}

// ============================================================================
// 6. Endpoint 5: GET /api/v1/evidence/{forecast_id}
// ============================================================================

export interface DataSourceRecord {
  source_id: string;
  source_name: string;
  publisher: string;
  refresh_cadence: string;
  duplicate_rate: number;
  stale_rate: number;
  mapping_confidence: number;
  real_or_synthetic: RealOrSyntheticFlag;
  coverage_notes: string;
}

export interface CleaningWaterfallStep {
  step_order: number;
  step_name: string;
  input_count: number;
  output_count: number;
  delta_pct: number;
  rule_applied: string;
  real_or_synthetic: RealOrSyntheticFlag;
}

export interface FeatureDriver {
  driver_name: string;
  contribution_pct: number;
  direction: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  explanation: string;
  real_or_synthetic: RealOrSyntheticFlag;
}

export interface EvidenceResponse {
  forecast_id: string;
  district_id: string;
  district_name: string;
  occupation_id: string;
  occupation_name: string;
  nco_code: string;
  as_of_month: string;
  confidence_tier: ConfidenceTier;
  eb_shrinkage_weight: number;
  neighbor_cluster_name: string;
  AutomatedActionAllowed: boolean;
  cleaning_waterfall: CleaningWaterfallStep[];
  feature_drivers: FeatureDriver[];
  data_sources: DataSourceRecord[];
  audit_notes: string[];
}

// ============================================================================
// 7. Endpoint 6 & 7: Skill Genome & SkillBridge Pathways
// ============================================================================

export interface NOSCompetencyNode {
  nos_code: string;
  nos_title: string;
  nsqf_level: number;
  hours: number;
  category: 'DOMAIN_CORE' | 'SHARED_FOUNDATION' | 'SAFETY_COMPLIANCE';
  is_core: boolean;
  demand_frequency_pct: number;
}

export interface EmergingSkillNode {
  skill_id: string;
  skill_name: string;
  occupation_id: string;
  nco_code: string;
  posting_mention_growth_yoy_pct: number;
  employer_demand_share_pct: number;
  current_nsqf_coverage: NSQFCoverageStatus;
  recommended_micro_credential: string;
  estimated_upskill_hours: number;
  sample_job_snippets: string[];
}

export interface OccupationGenomeRecord {
  occupation_id: string;
  occupation_name: string;
  nco_code: string;
  nsqf_level: number;
  qp_code: string;
  sector: string;
  training_scheme: string;
  training_duration_months: number;
  training_hours: number;
  section_size: number;
  last_nsqf_revision_year: number;
  curriculum_drift_score: number;
  unmapped_demand_share_pct: number;
  nos_nodes: NOSCompetencyNode[];
  emerging_unmapped_skills: EmergingSkillNode[];
}

export interface SkillBridgePathway {
  pathway_id: string;
  source_occupation_id: string;
  source_occupation_name: string;
  source_nco_code: string;
  source_nsqf_level: number;
  target_occupation_id: string;
  target_occupation_name: string;
  target_nco_code: string;
  target_nsqf_level: number;
  skill_overlap_pct: number;
  shared_skills: string[];
  missing_skills: string[];
  bridge_module_code: string;
  bridge_module_name: string;
  bridge_duration_days: number;
  bridge_hours: number;
  bridge_cost_per_candidate_inr: number;
  fresh_training_duration_months: number;
  lead_time_saved_months: number;
  available_donor_pool: number;
  projected_placement_rate: number;
  expected_wage_uplift_inr: number;
  roi_payback_months: number;
}

export interface CurriculumDriftSummary {
  overall_drift_score: number;
  unmapped_demand_share_pct: number;
  last_nsqf_revision_year: number;
  recommended_micro_credentials: string[];
}

export interface SkillGenomeResponse {
  occupation: OccupationGenomeRecord;
  adjacent_transitions: SkillBridgePathway[];
  curriculum_drift_summary: CurriculumDriftSummary;
}

export interface SkillBridgePathwaysResponse {
  district_id: string | null;
  pathways: SkillBridgePathway[];
}

// ============================================================================
// 8. Endpoint 8: POST /api/v1/skillclock/estimate
// ============================================================================

export interface SkillClockRequest {
  district_id: string;
  target_occupation_id: string;
  donor_occupation_id?: string;
  target_gap_headcount: number;
  intervention_start_month?: string;
  wage_stipend_topup_inr?: number;
}

export interface LeadTimeOption {
  option_key: 'FRESH_ITI' | 'PMKVY_STT' | 'SKILLBRIDGE_CONVERSION';
  option_label: string;
  scheme_name: string;
  duration_days: number;
  duration_months: number;
  ready_by_month: string;
  hits_12m_demand_window: boolean;
  effective_yield_rate: number;
  required_enrolments: number;
  total_cost_inr: number;
  cost_per_retained_worker_inr: number;
  bottleneck_note: string;
}

export interface ReadinessTimelinePoint {
  month_offset: number;
  month_label: string;
  cumulative_demand_target: number;
  fresh_iti_ready_supply: number;
  pmkvy_stt_ready_supply: number;
  skillbridge_ready_supply: number;
}

export interface SkillClockEstimateResponse {
  district_id: string;
  district_name: string;
  target_occupation_id: string;
  target_occupation_name: string;
  donor_occupation_id?: string | null;
  donor_occupation_name?: string | null;
  target_gap_headcount: number;
  intervention_start_month: string;
  fresh_iti_pathway: LeadTimeOption;
  pmkvy_stt_pathway: LeadTimeOption;
  skillbridge_conversion_pathway: LeadTimeOption;
  monthly_readiness_curve: ReadinessTimelinePoint[];
  verdict_summary: string;
}

// ============================================================================
// 9. Endpoint 9: POST /api/v1/scenarios
// ============================================================================

export interface SeatReallocationItem {
  from_occupation_id: string;
  to_occupation_id: string;
  sections_converted: number;
  seats_converted: number;
}

export interface BridgeBatchItem {
  pathway_id: string;
  candidates_enrolled: number;
}

export interface ScenarioSimulationRequest {
  scenario_name: string;
  district_id: string;
  as_of_month?: string;
  seat_reallocations: SeatReallocationItem[];
  bridge_batches: BridgeBatchItem[];
  wage_subsidy_monthly_inr: number;
}

export interface ScenarioOccupationImpact {
  occupation_id: string;
  occupation_name: string;
  nco_code: string;
  section_size: number;
  baseline_sections: number;
  simulated_sections: number;
  baseline_sanctioned_seats: number;
  simulated_sanctioned_seats: number;
  baseline_effective_supply: number;
  simulated_effective_supply: number;
  annual_demand: number;
  baseline_net_gap: number;
  simulated_net_gap: number;
}

export interface ScenarioSimulationResponse {
  scenario_id: string;
  scenario_name: string;
  district_id: string;
  district_name: string;
  created_at: string;
  ncvt_constraint_valid: boolean;
  constraint_messages: string[];
  baseline_net_gap: number;
  simulated_net_gap: number;
  gap_reduction_pct: number;
  phantom_capacity_before_pct: number;
  phantom_capacity_after_pct: number;
  total_budget_inr: number;
  cost_per_placed_candidate_inr: number;
  occupation_impacts: ScenarioOccupationImpact[];
}

// ============================================================================
// 10. Endpoint 10: GET /api/v1/forecast-evaluation
// ============================================================================

export interface BacktestMetrics {
  skillalign_wape: number;
  naive_baseline_wape: number;
  wape_improvement_pct: number;
  mase: number;
  pinball_loss_p50: number;
  empirical_coverage_80pi: number;
  action_accuracy_pct: number;
}

export interface TimeTravelReplayPoint {
  month: string;
  phase: 'TRAIN_HISTORY' | 'REPLAY_TEST_WINDOW';
  actual_ground_truth: number;
  skillalign_p10: number | null;
  skillalign_p50: number | null;
  skillalign_p90: number | null;
  naive_flat_forecast: number | null;
  within_80pi_band: boolean | null;
}

export interface DistrictEvaluationSummary {
  district_id: string;
  district_name: string;
  occupation_id: string;
  occupation_name: string;
  confidence_tier: ConfidenceTier;
  skillalign_wape: number;
  naive_wape: number;
  coverage_80pi: number;
  shock_captured: boolean;
}

export interface ForecastEvaluationResponse {
  evaluation_id: string;
  district_id: string;
  district_name: string;
  occupation_id: string;
  occupation_name: string;
  nco_code: string;
  rewind_to_month: string;
  verify_through_month: string;
  shock_event_title: string;
  shock_event_narrative: string;
  metrics: BacktestMetrics;
  replay_series: TimeTravelReplayPoint[];
  district_benchmark_table: DistrictEvaluationSummary[];
}

// ============================================================================
// 11. Endpoint 11: GET /api/v1/decisions
// ============================================================================

export interface PolicyDecisionItem {
  decision_id: string;
  district_id: string;
  district_name: string;
  occupation_id: string;
  occupation_name: string;
  nco_code: string;
  donor_occupation_id?: string | null;
  donor_occupation_name?: string | null;
  action_type: DecisionActionType;
  title: string;
  rationale: string;
  confidence_tier: ConfidenceTier;
  AutomatedActionAllowed: boolean;
  sections_delta: number;
  seats_delta: number;
  bridge_candidates: number;
  estimated_cost_inr: number;
  expected_gap_closed: number;
  time_to_impact_days: number;
  status: DecisionStatus;
  updated_at: string;
}

export interface DecisionUpdateRequest {
  decision_id: string;
  status: DecisionStatus;
  reviewer_note?: string;
}

export interface DecisionsResponse {
  brand: string;
  decisions: PolicyDecisionItem[];
}

// ============================================================================
// 12. Endpoint 12: GET /api/v1/reports/{scenario_id}
// ============================================================================

export interface SeatOrderLineItem {
  district_name: string;
  from_trade: string;
  from_nco: string;
  to_trade: string;
  to_nco: string;
  section_size: number;
  sections_reallocated: number;
  seats_reallocated: number;
  implementation_window: string;
}

export interface BridgeOrderLineItem {
  district_name: string;
  pathway_name: string;
  module_code: string;
  duration_days: number;
  batch_headcount: number;
  unit_cost_inr: number;
  total_cost_inr: number;
  expected_placements: number;
}

export interface ReportBudgetSummary {
  seat_conversion_capex_inr: number;
  skillbridge_training_opex_inr: number;
  wage_stipend_support_inr: number;
  total_allocation_inr: number;
  projected_12m_placements: number;
  effective_cost_per_placement_inr: number;
}

export interface PolicyReportResponse {
  report_id: string;
  scenario_id: string;
  brand: string;
  title: string;
  generated_at: string;
  issuing_authority: string;
  target_state: string;
  executive_summary: string;
  key_findings: string[];
  ncvt_seat_orders: SeatOrderLineItem[];
  pmkvy_bridge_orders: BridgeOrderLineItem[];
  budget_summary: ReportBudgetSummary;
  governance_disclaimers: string[];
  markdown_brief: string;
}
