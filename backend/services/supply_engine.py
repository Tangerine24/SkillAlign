"""
SkillAlign — 6-Stage Effective Supply & Backlog Ledger (/backend/services/supply_engine.py)
SIH 2026 Problem Statement SIH26246 (MSDE)

Implements:
1. Full 6-Stage Supply Funnel:
   planned_seats -> actual_enrolments -> completions -> certifications -> employment_entry -> retention
   plus carryover unplaced_backlog_stock.
2. Phantom Capacity Computation:
   sanctioned_seats - actual_enrolments, and phantom_capacity_rate (vacancy %).
3. Skill Tightness Ratio (\\theta = \\hat{D} / S_{eff}) and Headcount Gap (\\Delta = \\hat{D} - S_{eff}).
4. Monte-Carlo Rank Stability Bands:
   100 perturbations over +/-10% completion / fill-rate uncertainty returning
   rank, rank_min, rank_max, and stability_label ("Robust" vs "Fragile").
"""

from __future__ import annotations

import random
from typing import Any, Dict, List, Optional, Tuple

from backend.services.data_store import (
    get_latest_observation,
    get_observations,
    get_occupation_by_id,
)


class SupplyEngine:
    """
    6-stage supply pipeline ledger and Monte-Carlo uncertainty evaluator.
    """

    STAGES_METADATA = [
        ("sanctioned_seats", "Sanctioned Seats (NCVT / PMKVY Capacity)", "Budgeted institutional intake allocation"),
        ("actual_enrolments", "Actual Enrolments", "Drop due to trade unpopularity, wage penalty, or lack of local awareness (Phantom Capacity)"),
        ("completions", "Course Completions", "Academic dropouts, exam dropouts, migration, or seasonal disengagement"),
        ("certifications", "Assessments & Certifications Passed", "Assessment test failures or attendance disqualifications"),
        ("entered_employment", "Entered Trade Employment", "Wage-gap refusal, lack of local employer linkage, gig economy substitution"),
        ("retained_6m", "Effective 6-Month Retained Supply", "Early attrition, wage dissatisfaction, relocations, or hazardous worksite exit"),
    ]

    @classmethod
    def compute_cell_metrics(
        cls,
        district_id: str,
        occupation_id: str,
        as_of_month: str = "2026-10",
        demand_headcount: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Computes the complete supply pipeline metrics, phantom capacity, tightness ratio, and headcount gap.
        """
        obs = get_latest_observation(district_id, occupation_id, as_of_month)
        if not obs:
            raise ValueError(f"Observation missing for {district_id}/{occupation_id} at {as_of_month}")

        sanctioned = obs.get("sanctioned_seats", 60)
        enrolments = obs.get("actual_enrolments", 45)
        completions = obs.get("completions", 38)
        certifications = obs.get("certifications", 35)
        entered_emp = obs.get("entered_employment", 28)
        retained = obs.get("retained_6m", 24)
        backlog = obs.get("unplaced_backlog_stock", 10)
        section_size = obs.get("section_size", 20)

        # Phantom capacity
        phantom_seats = max(0, sanctioned - enrolments)
        phantom_rate = round(phantom_seats / max(1, sanctioned), 3)

        # Monthly and annual supply
        # Net monthly effective supply is effectively the retained cohort flow per month
        monthly_supply = max(1, retained)
        annual_supply = monthly_supply * 12

        # Demand and gap
        if demand_headcount is None:
            demand_headcount = obs.get("estimated_total_demand", 100)
        annual_demand = demand_headcount * 12

        headcount_gap = demand_headcount - monthly_supply
        annual_net_gap = annual_demand - annual_supply

        # Skill tightness ratio theta = Demand / Supply_eff
        tightness_ratio = round(demand_headcount / max(1.0, float(monthly_supply)), 2)

        return {
            "district_id": district_id,
            "occupation_id": occupation_id,
            "as_of_month": as_of_month,
            "section_size": section_size,
            "sanctioned_sections": sanctioned // section_size if section_size > 0 else 1,
            "sanctioned_seats": sanctioned,
            "actual_enrolments": enrolments,
            "phantom_capacity_seats": phantom_seats,
            "phantom_capacity_rate": phantom_rate,
            "completions": completions,
            "certifications": certifications,
            "entered_employment": entered_emp,
            "retained_6m": retained,
            "unplaced_backlog_stock": backlog,
            "monthly_supply": monthly_supply,
            "annual_effective_supply": annual_supply,
            "monthly_demand": demand_headcount,
            "annual_demand": annual_demand,
            "monthly_net_gap": headcount_gap,
            "annual_net_gap": annual_net_gap,
            "tightness_ratio_theta": tightness_ratio,
        }

    @classmethod
    def get_aggregate_supply_funnel(cls, as_of_month: str = "2026-10") -> List[Dict[str, Any]]:
        """
        Builds the statewide aggregate 6-stage supply funnel stages with conversion percentages and drop reasons.
        """
        all_obs = get_observations(month=as_of_month)
        if not all_obs:
            all_obs = get_observations(month="2026-10")

        sums = {
            "sanctioned_seats": sum(o.get("sanctioned_seats", 0) for o in all_obs),
            "actual_enrolments": sum(o.get("actual_enrolments", 0) for o in all_obs),
            "completions": sum(o.get("completions", 0) for o in all_obs),
            "certifications": sum(o.get("certifications", 0) for o in all_obs),
            "entered_employment": sum(o.get("entered_employment", 0) for o in all_obs),
            "retained_6m": sum(o.get("retained_6m", 0) for o in all_obs),
        }

        stages: List[Dict[str, Any]] = []
        prev_headcount: Optional[int] = None

        for key, label, drop_reason in cls.STAGES_METADATA:
            hc = sums[key]
            if prev_headcount is None:
                conv_pct = 100.0
            else:
                conv_pct = round((hc / max(1, prev_headcount)) * 100.0, 1)
            prev_headcount = hc

            stages.append({
                "stage_key": key,
                "stage_label": label,
                "headcount": hc,
                "conversion_from_previous_pct": conv_pct,
                "drop_off_reason": drop_reason,
            })

        return stages

    @classmethod
    def compute_monte_carlo_rank_stability(
        cls,
        as_of_month: str = "2026-10",
        num_trials: int = 100,
        perturbation_range: float = 0.10,
    ) -> Dict[str, Dict[str, Any]]:
        """
        Runs 100 Monte-Carlo perturbations over +/-10% completion and fill-rate uncertainty.
        Ranks all 30 district x occupation cells by shortage severity (annual net gap).
        Returns for each cell:
          - rank: baseline rank (1 = highest shortage)
          - rank_min: best rank across perturbations
          - rank_max: worst rank across perturbations
          - stability_label: "Robust" if rank spread <= 3 else "Fragile"
        """
        rng = random.Random(42)  # Deterministic seed for reproducible evaluation
        all_obs = get_observations(month=as_of_month)
        if not all_obs:
            all_obs = get_observations(month="2026-10")

        # Baseline evaluation
        baseline_cells = []
        for o in all_obs:
            cell_id = f"{o['district_id']}__{o['occupation_id']}"
            demand = o.get("estimated_total_demand", 100) * 12
            supply = o.get("retained_6m", 20) * 12
            gap = demand - supply
            baseline_cells.append({
                "cell_id": cell_id,
                "gap": gap,
                "demand": demand,
                "enrolments": o.get("actual_enrolments", 40),
                "completion_rate": o.get("completions", 30) / max(1, o.get("actual_enrolments", 40)),
                "cert_rate": o.get("certifications", 25) / max(1, o.get("completions", 30)),
                "emp_rate": o.get("entered_employment", 20) / max(1, o.get("certifications", 25)),
                "ret_rate": o.get("retained_6m", 15) / max(1, o.get("entered_employment", 20)),
            })

        # Baseline sorting (descending by gap = highest shortage first)
        baseline_sorted = sorted(baseline_cells, key=lambda x: x["gap"], reverse=True)
        base_ranks = {item["cell_id"]: idx + 1 for idx, item in enumerate(baseline_sorted)}

        # Simulation trials
        trial_ranks: Dict[str, List[int]] = {item["cell_id"]: [] for item in baseline_cells}

        for _ in range(num_trials):
            trial_cells = []
            for item in baseline_cells:
                # Perturb enrolments and completion rate by +/- perturbation_range
                fill_perturb = 1.0 + rng.uniform(-perturbation_range, perturbation_range)
                comp_perturb = 1.0 + rng.uniform(-perturbation_range, perturbation_range)

                sim_enrol = item["enrolments"] * fill_perturb
                sim_comp = sim_enrol * item["completion_rate"] * comp_perturb
                sim_cert = sim_comp * item["cert_rate"]
                sim_emp = sim_cert * item["emp_rate"]
                sim_retained = sim_emp * item["ret_rate"]

                sim_annual_supply = sim_retained * 12
                sim_gap = item["demand"] - sim_annual_supply
                trial_cells.append({"cell_id": item["cell_id"], "sim_gap": sim_gap})

            trial_sorted = sorted(trial_cells, key=lambda x: x["sim_gap"], reverse=True)
            for idx, tc in enumerate(trial_sorted):
                trial_ranks[tc["cell_id"]].append(idx + 1)

        results: Dict[str, Dict[str, Any]] = {}
        for cell_id, ranks in trial_ranks.items():
            b_rank = base_ranks[cell_id]
            r_min = min(ranks)
            r_max = max(ranks)
            spread = r_max - r_min
            stability = "Robust" if spread <= 3 else "Fragile"

            results[cell_id] = {
                "cell_id": cell_id,
                "baseline_rank": b_rank,
                "rank_min": r_min,
                "rank_max": r_max,
                "rank_spread": spread,
                "stability_label": stability,
            }

        return results
