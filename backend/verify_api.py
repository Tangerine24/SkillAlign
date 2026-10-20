#!/usr/bin/env python3
"""
SkillAlign — In-Process Canonical API & Dataset Verification Suite (/backend/verify_api.py)
SIH 2026 Problem Statement SIH26246 (MSDE)

Verifies:
1. /data/processed/ artifacts (data_sources.json, skill_genome.json, timeseries_observations.json)
2. All 12 canonical /api/v1/* endpoints in-process against /backend/schemas.py and CONTRACT.md.
"""

from __future__ import annotations

import asyncio
import json
import sys
import time
from pathlib import Path
from typing import Any, Callable, Dict, List, Tuple

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.main import (
    app,
    get_dashboard,
    get_decisions,
    get_evidence,
    get_forecast,
    get_forecast_evaluation,
    get_geographies,
    get_occupations,
    get_policy_report,
    get_skill_genome,
    get_skillbridge_pathways,
    post_scenarios,
    post_skillclock_estimate,
    update_decision,
)
from backend.schemas import (
    DashboardResponse,
    DecisionUpdateRequest,
    DecisionsResponse,
    EvidenceResponse,
    ForecastEvaluationResponse,
    ForecastResponse,
    GeographiesResponse,
    OccupationsResponse,
    PolicyReportResponse,
    ScenarioSimulationRequest,
    ScenarioSimulationResponse,
    SeatReallocationItem,
    SkillBridgePathwaysResponse,
    SkillClockEstimateResponse,
    SkillClockRequest,
    SkillGenomeResponse,
)

PROCESSED_DIR = ROOT_DIR / "data" / "processed"


def verify_datasets() -> List[Tuple[str, bool, str]]:
    results: List[Tuple[str, bool, str]] = []

    # 1. data_sources.json
    ds_path = PROCESSED_DIR / "data_sources.json"
    ds_data = json.loads(ds_path.read_text(encoding="utf-8"))
    sources = ds_data.get("sources", [])
    ok_ds = len(sources) == 5 and ds_data.get("state") == "Madhya Pradesh"
    results.append(
        (
            "DATA-1: /data/processed/data_sources.json",
            ok_ds,
            f"{len(sources)} provenance sources loaded ({ds_data.get('state')})",
        )
    )

    # 2. skill_genome.json
    sg_path = PROCESSED_DIR / "skill_genome.json"
    sg_data = json.loads(sg_path.read_text(encoding="utf-8"))
    occs = sg_data.get("occupations", [])
    pws = sg_data.get("skillbridge_pathways", [])
    ok_sg = len(occs) == 6 and len(pws) == 4
    results.append(
        (
            "DATA-2: /data/processed/skill_genome.json",
            ok_sg,
            f"{len(occs)} occupations, {len(pws)} SkillBridge pathways",
        )
    )

    # 3. timeseries_observations.json
    ts_path = PROCESSED_DIR / "timeseries_observations.json"
    ts_data = json.loads(ts_path.read_text(encoding="utf-8"))
    obs = ts_data.get("observations", [])
    campuses = ts_data.get("metadata", {}).get("iti_campuses", [])
    months = sorted({o["month"] for o in obs})
    districts = sorted({o["district_id"] for o in obs})
    expected_districts = ["bhopal", "indore", "jabalpur", "rewa", "ujjain"]
    ok_ts = (
        len(obs) == 1080
        and len(campuses) == 10
        and months[0] == "2023-11"
        and months[-1] == "2026-10"
        and len(months) == 36
        and districts == expected_districts
    )
    results.append(
        (
            "DATA-3: /data/processed/timeseries_observations.json",
            ok_ts,
            f"{len(obs)} records ({months[0]}..{months[-1]}, {len(districts)} MP districts, {len(campuses)} ITI campuses)",
        )
    )

    return results


def verify_endpoints() -> List[Tuple[str, str, bool, str]]:
    """Invoke all 12 endpoints in-process and validate Pydantic schemas + business invariants."""
    rows: List[Tuple[str, str, bool, str]] = []

    # 1. GET /api/v1/geographies
    res1 = GeographiesResponse.model_validate(get_geographies().model_dump())
    ok1 = (
        res1.state_name == "Madhya Pradesh"
        and len(res1.districts) == 5
        and len(res1.sectors) == 4
        and res1.iti_campuses is not None
        and len(res1.iti_campuses) == 10
        and all(len(d.key_industrial_anchors) == 3 for d in res1.districts)
    )
    rows.append(
        (
            "1",
            "GET /api/v1/geographies",
            ok1,
            f"state={res1.state_name}, districts={len(res1.districts)}, iti_campuses={len(res1.iti_campuses or [])}, sectors={len(res1.sectors)}",
        )
    )

    # 2. GET /api/v1/occupations
    res2 = OccupationsResponse.model_validate(get_occupations(sector=None).model_dump())
    sec_sizes = sorted({o.section_size for o in res2.occupations})
    ok2 = len(res2.occupations) == 6 and sec_sizes == [20, 24, 40]
    rows.append(
        (
            "2",
            "GET /api/v1/occupations",
            ok2,
            f"occupations={len(res2.occupations)}, section_sizes={sec_sizes}",
        )
    )

    # 3. GET /api/v1/dashboard
    res3 = DashboardResponse.model_validate(get_dashboard(as_of_month="2026-10").model_dump())
    ok3 = (
        len(res3.heatmap_cells) == 30
        and len(res3.supply_funnel_aggregate) == 6
        and res3.kpis.total_annual_demand > 0
        and len(res3.top_alerts) >= 3
    )
    rows.append(
        (
            "3",
            "GET /api/v1/dashboard",
            ok3,
            f"cells={len(res3.heatmap_cells)}, funnel_stages={len(res3.supply_funnel_aggregate)}, gap={res3.kpis.net_skill_gap}",
        )
    )

    # 4. GET /api/v1/forecast
    res4 = ForecastResponse.model_validate(
        get_forecast(district_id="rewa", occupation_id="occ_solar_pv", as_of_month="2026-10", horizon_months=12).model_dump()
    )
    ok4 = (
        len(res4.historical_series) == 36
        and len(res4.forecast_series) == 12
        and all(p.demand_p10 <= p.demand_p50 <= p.demand_p90 for p in res4.forecast_series)
    )
    rows.append(
        (
            "4",
            "GET /api/v1/forecast",
            ok4,
            f"id={res4.forecast_id}, hist={len(res4.historical_series)}m, horizon={len(res4.forecast_series)}m, tier={res4.confidence_tier}",
        )
    )

    # 5. GET /api/v1/evidence/{forecast_id}
    res5 = EvidenceResponse.model_validate(get_evidence("fc_rewa_occ_solar_pv_2026-10").model_dump())
    ok5 = (
        len(res5.cleaning_waterfall) == 4
        and len(res5.feature_drivers) == 4
        and len(res5.data_sources) == 5
        and res5.AutomatedActionAllowed is True
    )
    rows.append(
        (
            "5",
            "GET /api/v1/evidence/{forecast_id}",
            ok5,
            f"waterfall={len(res5.cleaning_waterfall)} steps, drivers={len(res5.feature_drivers)}, sources={len(res5.data_sources)}",
        )
    )

    # 6. GET /api/v1/skill-genome/{occupation_id}
    res6 = SkillGenomeResponse.model_validate(get_skill_genome("occ_solar_pv").model_dump())
    ok6 = (
        res6.occupation.nco_code == "7411.0101"
        and len(res6.occupation.nos_nodes) >= 4
        and len(res6.occupation.emerging_unmapped_skills) >= 2
        and len(res6.adjacent_transitions) >= 1
    )
    rows.append(
        (
            "6",
            "GET /api/v1/skill-genome/{occupation_id}",
            ok6,
            f"nco={res6.occupation.nco_code}, nos={len(res6.occupation.nos_nodes)}, emerging_s09={len(res6.occupation.emerging_unmapped_skills)}",
        )
    )

    # 7. GET /api/v1/skillbridge/pathways
    res7 = SkillBridgePathwaysResponse.model_validate(get_skillbridge_pathways(district_id="rewa").model_dump())
    overlaps = [p.skill_overlap_pct for p in res7.pathways]
    ok7 = len(res7.pathways) == 4 and 76.0 in overlaps and 72.0 in overlaps
    rows.append(
        (
            "7",
            "GET /api/v1/skillbridge/pathways",
            ok7,
            f"pathways={len(res7.pathways)}, overlaps={overlaps}%",
        )
    )

    # 8. POST /api/v1/skillclock/estimate
    res8 = SkillClockEstimateResponse.model_validate(
        post_skillclock_estimate(
            SkillClockRequest(
                district_id="rewa",
                target_occupation_id="occ_solar_pv",
                donor_occupation_id="occ_electrician",
                target_gap_headcount=180,
                intervention_start_month="2026-11",
                wage_stipend_topup_inr=1500,
            )
        ).model_dump()
    )
    ok8 = (
        res8.fresh_iti_pathway.hits_12m_demand_window is False
        and res8.skillbridge_conversion_pathway.hits_12m_demand_window is True
        and res8.skillbridge_conversion_pathway.duration_days == 90
        and len(res8.monthly_readiness_curve) == 12
    )
    rows.append(
        (
            "8",
            "POST /api/v1/skillclock/estimate",
            ok8,
            f"ITI={res8.fresh_iti_pathway.duration_months}m (hits_12m={res8.fresh_iti_pathway.hits_12m_demand_window}), Bridge={res8.skillbridge_conversion_pathway.duration_days}d",
        )
    )

    # 9. POST /api/v1/scenarios (valid multiples of 20/24/40 + invalid non-multiple check)
    res9_valid = ScenarioSimulationResponse.model_validate(
        post_scenarios(
            ScenarioSimulationRequest(
                scenario_name="Valid NCVT Multiples Check",
                district_id="indore",
                seat_reallocations=[
                    SeatReallocationItem(
                        from_occupation_id="occ_mmv",
                        to_occupation_id="occ_ev_tech",
                        sections_converted=4,
                        seats_converted=96,  # 4 * 24
                    ),
                    SeatReallocationItem(
                        from_occupation_id="occ_data_entry",
                        to_occupation_id="occ_solar_pv",
                        sections_converted=2,
                        seats_converted=80,  # 2 * 40
                    ),
                ],
            )
        ).model_dump()
    )
    res9_invalid = ScenarioSimulationResponse.model_validate(
        post_scenarios(
            ScenarioSimulationRequest(
                scenario_name="Invalid Non-Multiple Check",
                district_id="rewa",
                seat_reallocations=[
                    SeatReallocationItem(
                        from_occupation_id="occ_electrician",
                        to_occupation_id="occ_solar_pv",
                        sections_converted=1,
                        seats_converted=25,  # Violates 20-seat NCVT section multiple
                    )
                ],
            )
        ).model_dump()
    )
    ok9 = (
        res9_valid.ncvt_constraint_valid is True
        and res9_invalid.ncvt_constraint_valid is False
        and res9_valid.simulated_net_gap < res9_valid.baseline_net_gap
    )
    rows.append(
        (
            "9",
            "POST /api/v1/scenarios",
            ok9,
            f"valid_20_24_40={res9_valid.ncvt_constraint_valid}, invalid_25_blocked={not res9_invalid.ncvt_constraint_valid}, gap_red={res9_valid.gap_reduction_pct}%",
        )
    )

    # 10. GET /api/v1/forecast-evaluation
    res10 = ForecastEvaluationResponse.model_validate(
        get_forecast_evaluation(district_id="rewa", occupation_id="occ_solar_pv", rewind_to_month="2025-10").model_dump()
    )
    ok10 = (
        6.0 <= res10.metrics.skillalign_wape <= 7.5
        and 44.0 <= res10.metrics.naive_baseline_wape <= 49.0
        and len(res10.replay_series) == 36
    )
    rows.append(
        (
            "10",
            "GET /api/v1/forecast-evaluation",
            ok10,
            f"SkillAlign WAPE={res10.metrics.skillalign_wape}% vs Naive={res10.metrics.naive_baseline_wape}% (80% PI cov={res10.metrics.empirical_coverage_80pi}%)",
        )
    )

    # 11. GET & POST /api/v1/decisions (blocking automated execution on 'Tier 3: Advisory Only')
    res11_get = DecisionsResponse.model_validate(get_decisions().model_dump())
    res11_post = DecisionsResponse.model_validate(
        update_decision(
            DecisionUpdateRequest(
                decision_id="dec_ujjain_ev_advisory",
                status="APPROVED",
                reviewer_note=None,  # Automated attempt without human sign-off note
            )
        ).model_dump()
    )
    tier3_item = next(d for d in res11_post.decisions if d.decision_id == "dec_ujjain_ev_advisory")
    ok11 = (
        len(res11_get.decisions) == 5
        and tier3_item.confidence_tier == "Tier 3: Advisory Only"
        and tier3_item.AutomatedActionAllowed is False
        and tier3_item.status == "LOCKED_ADVISORY"
    )
    rows.append(
        (
            "11",
            "GET & POST /api/v1/decisions",
            ok11,
            f"decisions={len(res11_get.decisions)}, Tier3 auto-exec blocked (status={tier3_item.status})",
        )
    )

    # 12. GET /api/v1/reports/{scenario_id}
    res12 = PolicyReportResponse.model_validate(get_policy_report("scen_mp_flagship_2026").model_dump())
    ok12 = (
        len(res12.ncvt_seat_orders) == 3
        and len(res12.pmkvy_bridge_orders) == 2
        and res12.budget_summary.total_allocation_inr > 0
        and "SkillAlign" in res12.markdown_brief
    )
    rows.append(
        (
            "12",
            "GET /api/v1/reports/{scenario_id}",
            ok12,
            f"seat_orders={len(res12.ncvt_seat_orders)}, bridge_orders={len(res12.pmkvy_bridge_orders)}, budget=INR {res12.budget_summary.total_allocation_inr:,}",
        )
    )

    # Verify ASGI routes registered on FastAPI app
    registered_paths = {getattr(r, "path", "") for r in app.routes}
    required_paths = {
        "/api/v1/geographies",
        "/api/v1/occupations",
        "/api/v1/dashboard",
        "/api/v1/forecast",
        "/api/v1/evidence/{forecast_id}",
        "/api/v1/skill-genome/{occupation_id}",
        "/api/v1/skillbridge/pathways",
        "/api/v1/skillclock/estimate",
        "/api/v1/scenarios",
        "/api/v1/forecast-evaluation",
        "/api/v1/decisions",
        "/api/v1/reports/{scenario_id}",
    }
    missing = required_paths - registered_paths
    if missing:
        raise AssertionError(f"Missing FastAPI routes: {missing}")

    return rows


def main() -> None:
    print("=" * 112)
    print(" SKILLALIGN (SIH26246) -- PHASE 1A & 2A IN-PROCESS DATASET & 12-ENDPOINT VERIFICATION SUITE")
    print("=" * 112)

    data_Checks = verify_datasets()
    for label, passed, detail in data_Checks:
        status_str = "PASS" if passed else "FAIL"
        print(f" [{status_str}] {label:<44} | {detail}")

    print("-" * 112)
    print(f" {'#':<3} | {'Canonical Endpoint':<35} | {'Status':<6} | {'Verification Summary'}")
    print("-" * 112)

    ep_rows = verify_endpoints()
    all_passed = all(p for _, p, _ in data_Checks) and all(p for _, _, p, _ in ep_rows)

    for idx, ep, passed, summary in ep_rows:
        status_str = "PASS" if passed else "FAIL"
        print(f" {idx:<3} | {ep:<35} | {status_str:<6} | {summary}")

    print("=" * 112)
    if all_passed:
        print(" OVERALL VERDICT: 15 / 15 CHECKS PASSED (3 DATASETS + 12 CANONICAL /api/v1/* ENDPOINTS)")
        print("=" * 112)
        sys.exit(0)
    else:
        print(" OVERALL VERDICT: VERIFICATION FAILED")
        print("=" * 112)
        sys.exit(1)


if __name__ == "__main__":
    main()
