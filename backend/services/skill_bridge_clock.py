"""
SkillAlign — SkillClock & SkillBridge Engine (/backend/services/skill_bridge_clock.py)
SIH 2026 Problem Statement SIH26246 (MSDE)

Implements:
1. SkillClock Lead-Time Estimator:
   Calculates supply_arrival_date = next_batch_start + course_duration + certification_lag + OJT.
   Flags URGENT LEAD-TIME MISMATCH when standard ITI training (12-24m) arrives after the demand surge window,
   and automatically routes to PMKVY 4.0 RPL / Short-Term SkillBridge (<6m) vs DGT/ITI Annual Seat Matrix.
2. SkillBridge Curated Pathways:
   Surfaces donor-to-target reskilling pathways from oversupplied trades in the district,
   displaying shared NOS skills, missing NOS skills, bridge modules, costs, and maximum transferable cohorts.
"""

from __future__ import annotations

import math
from typing import Any, Dict, List, Optional

from backend.services.data_store import (
    get_district_by_id,
    get_latest_observation,
    get_occupation_by_id,
    get_occupation_genome,
    get_pathways,
)
from backend.services.forecaster import _add_months


class SkillBridgeClockEngine:
    """
    SkillClock lead-time analytics and SkillBridge transfer pathways engine.
    """

    @classmethod
    def estimate_skillclock(
        cls,
        district_id: str = "rewa",
        target_occupation_id: str = "occ_solar_pv",
        donor_occupation_id: Optional[str] = "occ_electrician",
        target_gap_headcount: int = 180,
        intervention_start_month: str = "2026-11",
        wage_stipend_topup_inr: int = 0,
    ) -> Dict[str, Any]:
        """
        Calculates pipeline lead times, readiness curves, and lead-time mismatch verdicts.
        """
        d_info = get_district_by_id(district_id)
        target_occ = get_occupation_by_id(target_occupation_id)
        donor_occ = get_occupation_by_id(donor_occupation_id) if donor_occupation_id else None

        district_name = d_info["district_name"] if d_info else district_id.title()
        target_occ_name = target_occ["occupation_name"] if target_occ else target_occupation_id
        donor_occ_name = donor_occ["occupation_name"] if donor_occ else (donor_occupation_id or "General Pool")

        # 1. Fresh ITI Pathway
        # ITI trades typically run 12 to 24 months, with 2-month certification + placement lag
        fresh_iti_months = float(target_occ.get("training_duration_months", 24) if target_occ else 24)
        fresh_total_lag_months = int(round(fresh_iti_months + 2))
        fresh_ready_month = _add_months(intervention_start_month, fresh_total_lag_months)
        fresh_hits_12m = fresh_total_lag_months <= 12
        fresh_yield = 0.52  # Reflects ~48% phantom/drop attrition across 6-stage funnel
        fresh_enrol_req = int(round(target_gap_headcount / fresh_yield))
        fresh_unit_cost = 42000
        fresh_total_cost = fresh_enrol_req * fresh_unit_cost
        fresh_cost_per_worker = int(round(fresh_total_cost / max(1, target_gap_headcount)))

        fresh_bottleneck = (
            f"URGENT LEAD-TIME MISMATCH: 24-month ITI curriculum delivers graduates in {fresh_ready_month} "
            f"({fresh_total_lag_months}m lag), completely missing the immediate 12-month industrial hiring peak."
            if not fresh_hits_12m else
            f"12-month ITI trade delivers graduates near the end of the 12-month horizon ({fresh_ready_month})."
        )

        fresh_pathway = {
            "option_key": "FRESH_ITI",
            "option_label": "Fresh Institutional ITI Admissions (DGT CTS)",
            "scheme_name": "DGT Craftsmen Training Scheme (NCVT 1-2 Yr)",
            "duration_days": int(fresh_iti_months * 30),
            "duration_months": fresh_iti_months,
            "ready_by_month": fresh_ready_month,
            "hits_12m_demand_window": fresh_hits_12m,
            "effective_yield_rate": fresh_yield,
            "required_enrolments": fresh_enrol_req,
            "total_cost_inr": fresh_total_cost,
            "cost_per_retained_worker_inr": fresh_cost_per_worker,
            "bottleneck_note": fresh_bottleneck,
        }

        # 2. PMKVY STT Pathway
        # Short-Term Training: 300-400 hrs (typically 3 months) + 1 month assessment/placement
        stt_months = 3.0
        stt_total_lag = 4
        stt_ready_month = _add_months(intervention_start_month, stt_total_lag)
        stt_hits_12m = True
        stt_yield = 0.68
        stt_enrol_req = int(round(target_gap_headcount / stt_yield))
        stt_unit_cost = 18500
        stt_total_cost = stt_enrol_req * stt_unit_cost
        stt_cost_per_worker = int(round(stt_total_cost / max(1, target_gap_headcount)))

        stt_bottleneck = (
            f"Delivers first cohort by {stt_ready_month} (4m lag). Requires rapid accreditation of "
            "PMKVY training centers and master trainers certified under SSC."
        )

        stt_pathway = {
            "option_key": "PMKVY_STT",
            "option_label": "PMKVY 4.0 Short-Term Training (STT)",
            "scheme_name": "PMKVY 4.0 Special Projects / STT (3-Month)",
            "duration_days": int(stt_months * 30),
            "duration_months": stt_months,
            "ready_by_month": stt_ready_month,
            "hits_12m_demand_window": stt_hits_12m,
            "effective_yield_rate": stt_yield,
            "required_enrolments": stt_enrol_req,
            "total_cost_inr": stt_total_cost,
            "cost_per_retained_worker_inr": stt_cost_per_worker,
            "bottleneck_note": stt_bottleneck,
        }

        # 3. SkillBridge Conversion Pathway
        # Bridge modules: 45 to 90 days (1.5 to 3 months) + 15 days rapid assessment
        pathways = get_pathways(district_id, donor_occupation_id, target_occupation_id)
        if pathways:
            best_p = pathways[0]
            bridge_days = best_p.get("bridge_duration_days", 60)
            bridge_cost_unit = best_p.get("bridge_cost_per_candidate_inr", 9500)
        else:
            bridge_days = 60
            bridge_cost_unit = 9500

        bridge_months = round(bridge_days / 30.0, 1)
        bridge_lag_months = max(2, int(round(bridge_months + 0.5)))
        bridge_ready_month = _add_months(intervention_start_month, bridge_lag_months)
        bridge_yield = 0.84  # Higher yield because candidates have prior foundation in donor trade
        bridge_enrol_req = int(round(target_gap_headcount / bridge_yield))
        bridge_total_cost = bridge_enrol_req * (bridge_cost_unit + (wage_stipend_topup_inr * 2))
        bridge_cost_per_worker = int(round(bridge_total_cost / max(1, target_gap_headcount)))

        bridge_bottleneck = (
            f"FASTEST INTERVENTION: Delivers certified candidates by {bridge_ready_month} ({bridge_lag_months}m lag). "
            f"Re-skills existing unplaced backlog from donor trade with 70%+ NOS competency overlap."
        )

        bridge_pathway = {
            "option_key": "SKILLBRIDGE_CONVERSION",
            "option_label": "SkillBridge Fast-Track Reskilling (PMKVY RPL/Bridge)",
            "scheme_name": "SkillBridge Modular Conversion (45-90 Days)",
            "duration_days": bridge_days,
            "duration_months": bridge_months,
            "ready_by_month": bridge_ready_month,
            "hits_12m_demand_window": True,
            "effective_yield_rate": bridge_yield,
            "required_enrolments": bridge_enrol_req,
            "total_cost_inr": bridge_total_cost,
            "cost_per_retained_worker_inr": bridge_cost_per_worker,
            "bottleneck_note": bridge_bottleneck,
        }

        # Monthly Readiness Curves across 12 months
        monthly_curve: List[Dict[str, Any]] = []
        monthly_target_inc = target_gap_headcount / 12.0

        for m_offset in range(1, 13):
            m_label = _add_months(intervention_start_month, m_offset - 1)
            cum_target = int(round(monthly_target_inc * m_offset))

            # Fresh ITI supply
            if m_offset < fresh_total_lag_months:
                fresh_supply = 0
            else:
                fresh_supply = int(round(target_gap_headcount * min(1.0, (m_offset - fresh_total_lag_months + 1) / 3.0)))

            # PMKVY STT supply
            if m_offset < stt_total_lag:
                stt_supply = 0
            else:
                stt_supply = int(round(target_gap_headcount * min(1.0, (m_offset - stt_total_lag + 1) / 3.0)))

            # SkillBridge supply
            if m_offset < bridge_lag_months:
                bridge_supply = 0
            else:
                bridge_supply = int(round(target_gap_headcount * min(1.0, (m_offset - bridge_lag_months + 1) / 2.0)))

            monthly_curve.append({
                "month_offset": m_offset,
                "month_label": m_label,
                "cumulative_demand_target": cum_target,
                "fresh_iti_ready_supply": fresh_supply,
                "pmkvy_stt_ready_supply": stt_supply,
                "skillbridge_ready_supply": bridge_supply,
            })

        # Final verdict narrative
        verdict = (
            f"LEAD-TIME ARBITRAGE OPPORTUNITY in {district_name}: Addressing the {target_gap_headcount}-technician "
            f"shortage in {target_occ_name} via standard ITI training incurs a {fresh_total_lag_months}-month latency, "
            f"failing the industrial project timeline. SkillAlign recommends an immediate dual-track intervention: "
            f"1) Authorize SkillBridge conversion ({bridge_days} days) for {bridge_enrol_req} unplaced graduates from {donor_occ_name} "
            f"delivering certified technicians by {bridge_ready_month}; 2) Reallocate NCVT seat quotas in next year's institutional matrix."
        )

        return {
            "district_id": district_id,
            "district_name": district_name,
            "target_occupation_id": target_occupation_id,
            "target_occupation_name": target_occ_name,
            "donor_occupation_id": donor_occupation_id,
            "donor_occupation_name": donor_occ_name,
            "target_gap_headcount": target_gap_headcount,
            "intervention_start_month": intervention_start_month,
            "fresh_iti_pathway": fresh_pathway,
            "pmkvy_stt_pathway": stt_pathway,
            "skillbridge_conversion_pathway": bridge_pathway,
            "monthly_readiness_curve": monthly_curve,
            "verdict_summary": verdict,
        }

    @classmethod
    def get_skillbridge_pathways(
        cls,
        district_id: Optional[str] = None,
        source_occupation_id: Optional[str] = None,
        target_occupation_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Retrieves curated SkillBridge pathways enriched with district-level unplaced backlog donor pools
        and maximum transferable cohort sizes bounded by safety conservation floors.
        """
        raw_pathways = get_pathways(district_id, source_occupation_id, target_occupation_id)
        results: List[Dict[str, Any]] = []

        for p in raw_pathways:
            p_out = dict(p)
            if district_id:
                donor_obs = get_latest_observation(district_id, p["source_occupation_id"])
                if donor_obs:
                    raw_stock = donor_obs.get("unplaced_backlog_stock", 30)
                    # Enforce donor safety buffer: keep at least 15% or 5 candidates
                    safety_floor = max(5, int(round(raw_stock * 0.15)))
                    available_pool = max(0, raw_stock - safety_floor)
                    p_out["available_donor_pool"] = available_pool
            results.append(p_out)

        return results
