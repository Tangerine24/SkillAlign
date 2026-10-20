#!/usr/bin/env python3
"""
SkillAlign Deterministic Pilot Dataset Generator (Phase 0)
SIH 2026 Problem Statement SIH26246: AI-Enabled Labour Market Intelligence
and Skill Demand-Supply Forecasting Engine for MSDE.

Generates 36 months of monthly historical data (2023-11 to 2026-10) across
5 Madhya Pradesh districts and 6 NCO-2015 / NSQF-mapped occupations.
Outputs JSON & CSV artifacts to /data/processed/ and syncs fallback JSON
to /frontend/src/data/ for resilient frontend operation.
"""

from __future__ import annotations

import csv
import json
import math
import random
from pathlib import Path
from typing import Any, Dict, List

# Fixed seed for 100% deterministic reproducibility across all agents
RNG_SEED = 26246

ROOT_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = ROOT_DIR / "data" / "processed"
FRONTEND_DATA_DIR = ROOT_DIR / "frontend" / "src" / "data"


def generate_months() -> List[str]:
    """Generate 36 monthly period strings from 2023-11 to 2026-10 inclusive."""
    months: List[str] = []
    year, month = 2023, 11
    for _ in range(36):
        months.append(f"{year:04d}-{month:02d}")
        month += 1
        if month > 12:
            month = 1
            year += 1
    return months


DISTRICTS: List[Dict[str, Any]] = [
    {
        "district_id": "indore",
        "district_name": "Indore",
        "state_name": "Madhya Pradesh",
        "state_code": "MP",
        "cluster_id": "malwa_industrial",
        "cluster_name": "Malwa Auto-Solar-IT Corridor",
        "latitude": 22.7196,
        "longitude": 75.8577,
        "iti_count": 28,
        "pmkvy_tc_count": 19,
        "dominant_sectors": [
            "Automotive & EV",
            "Green Energy & Electrical",
            "IT-ITeS & Digital",
            "Capital Goods & Manufacturing",
        ],
        "key_industrial_anchors": [
            "Pithampur Auto & EV SEZ (Sector 1-3)",
            "NATRAX High-Speed EV Testing Track",
            "Crystal IT Park & Super Corridor Tech Hub",
        ],
        "local_gig_wage_base_inr": 15800,
    },
    {
        "district_id": "bhopal",
        "district_name": "Bhopal",
        "state_name": "Madhya Pradesh",
        "state_code": "MP",
        "cluster_id": "central_mp_core",
        "cluster_name": "Central MP Institutional & EV Core",
        "latitude": 23.2599,
        "longitude": 77.4126,
        "iti_count": 22,
        "pmkvy_tc_count": 16,
        "dominant_sectors": [
            "Automotive & EV",
            "Green Energy & Electrical",
            "IT-ITeS & Digital",
        ],
        "key_industrial_anchors": [
            "Mandideep Industrial Area (HEG & Crompton)",
            "BHEL Govindpura Ancillary Engineering Cluster",
            "Bagroda EV & ESDM Park",
        ],
        "local_gig_wage_base_inr": 15200,
    },
    {
        "district_id": "jabalpur",
        "district_name": "Jabalpur",
        "state_name": "Madhya Pradesh",
        "state_code": "MP",
        "cluster_id": "mahakoshal_engg",
        "cluster_name": "Mahakoshal Heavy Engineering Cluster",
        "latitude": 23.1815,
        "longitude": 79.9864,
        "iti_count": 18,
        "pmkvy_tc_count": 12,
        "dominant_sectors": [
            "Capital Goods & Manufacturing",
            "Green Energy & Electrical",
        ],
        "key_industrial_anchors": [
            "Richhai MSME Engineering & Foundry Cluster",
            "Vehicle Factory Jabalpur (VFJ) & GCF Defence Ancillaries",
            "Hargarh Industrial Growth Centre",
        ],
        "local_gig_wage_base_inr": 14400,
    },
    {
        "district_id": "rewa",
        "district_name": "Rewa",
        "state_name": "Madhya Pradesh",
        "state_code": "MP",
        "cluster_id": "vindhya_green",
        "cluster_name": "Vindhya Ultra-Mega Solar Corridor",
        "latitude": 24.5362,
        "longitude": 81.3037,
        "iti_count": 14,
        "pmkvy_tc_count": 11,
        "dominant_sectors": [
            "Green Energy & Electrical",
        ],
        "key_industrial_anchors": [
            "RUMSL 750MW Badwar Ultra-Mega Solar Park",
            "PM Surya Ghar Vindhya EPC Cluster",
            "Prism Johnson & Birla Corp Captive Solar Grid",
        ],
        "local_gig_wage_base_inr": 13200,
    },
    {
        "district_id": "ujjain",
        "district_name": "Ujjain",
        "state_name": "Madhya Pradesh",
        "state_code": "MP",
        "cluster_id": "malwa_industrial",
        "cluster_name": "Malwa Auto-Solar-IT Corridor",
        "latitude": 23.1765,
        "longitude": 75.7885,
        "iti_count": 11,
        "pmkvy_tc_count": 8,
        "dominant_sectors": [
            "Green Energy & Electrical",
            "Capital Goods & Manufacturing",
        ],
        "key_industrial_anchors": [
            "Vikram Udyogpuri DMIC Smart Industrial Township",
            "Nagda Engineering & Chemical Process Hub",
            "Malwa PM-KUSUM Solar Feeder Cluster",
        ],
        "local_gig_wage_base_inr": 13600,
    },
]

ITI_CAMPUSES: List[Dict[str, Any]] = [
    {
        "campus_id": "iti_rewa_div",
        "campus_name": "Govt Divisional ITI Rewa (MIS: GR23000142)",
        "mis_code": "GR23000142",
        "district_id": "rewa",
        "district_name": "Rewa",
        "sanctioned_seats": 480,
        "active_enrolments": 388,
        "phantom_capacity_pct": 19.2,
        "key_trades": [
            "Electrician (7411.0100)",
            "Solar PV Installer (7411.0101)",
            "MMV (7231.0101)",
            "COPA / Data Entry (4132.0402)",
        ],
        "nodal_role": "Vindhya Suryamitra 90-Day SkillBridge Nodal Hub (RUMSL Badwar Feeder)",
    },
    {
        "campus_id": "iti_rewa_women",
        "campus_name": "Govt Women ITI Rewa",
        "mis_code": "GR23000198",
        "district_id": "rewa",
        "district_name": "Rewa",
        "sanctioned_seats": 240,
        "active_enrolments": 148,
        "phantom_capacity_pct": 38.3,
        "key_trades": [
            "COPA / Data Entry (4132.0402)",
            "Electrician (7411.0100)",
            "Solar PV Telemetry & RMS Support (7411.0101)",
        ],
        "nodal_role": "PM Surya Ghar Rooftop Telemetry & Helpdesk Conversion Center",
    },
    {
        "campus_id": "iti_indore_nandanagar",
        "campus_name": "Govt Divisional ITI Nanda Nagar Indore (MIS: GR23000018)",
        "mis_code": "GR23000018",
        "district_id": "indore",
        "district_name": "Indore",
        "sanctioned_seats": 920,
        "active_enrolments": 754,
        "phantom_capacity_pct": 18.0,
        "key_trades": [
            "MMV (7231.0101)",
            "EV Service Lead Technician (7231.0105)",
            "CNC Programmer & Setter (7223.0501)",
            "Electrician (7411.0100)",
        ],
        "nodal_role": "Malwa Flagship 45-Day MMV-to-EV High-Voltage & BMS Bridge Hub",
    },
    {
        "campus_id": "iti_indore_pithampur",
        "campus_name": "Govt ITI Pithampur Sector-2",
        "mis_code": "GR23000214",
        "district_id": "indore",
        "district_name": "Indore",
        "sanctioned_seats": 440,
        "active_enrolments": 356,
        "phantom_capacity_pct": 19.1,
        "key_trades": [
            "EV Service Lead Technician (7231.0105)",
            "CNC Programmer & Setter (7223.0501)",
            "MMV (7231.0101)",
        ],
        "nodal_role": "Pithampur Auto SEZ Dual-System Training (DST) & NATRAX Fleet Lab",
    },
    {
        "campus_id": "iti_bhopal_govindpura",
        "campus_name": "Govt Model ITI Govindpura Bhopal (MIS: GR23000004)",
        "mis_code": "GR23000004",
        "district_id": "bhopal",
        "district_name": "Bhopal",
        "sanctioned_seats": 840,
        "active_enrolments": 688,
        "phantom_capacity_pct": 18.1,
        "key_trades": [
            "Electrician (7411.0100)",
            "EV Service Lead Technician (7231.0105)",
            "MMV (7231.0101)",
            "CNC Programmer & Setter (7223.0501)",
        ],
        "nodal_role": "BHEL Ancillary & Mandideep Industrial Dual-Apprenticeship Anchor",
    },
    {
        "campus_id": "iti_bhopal_gsp",
        "campus_name": "SSR Global Skills Park Bhopal",
        "mis_code": "GSP23000001",
        "district_id": "bhopal",
        "district_name": "Bhopal",
        "sanctioned_seats": 600,
        "active_enrolments": 552,
        "phantom_capacity_pct": 8.0,
        "key_trades": [
            "EV Service Lead Technician (7231.0105)",
            "CNC 5-Axis Programmer & Setter (7223.0501)",
            "Solar PV & Hybrid BESS Specialist (7411.0101)",
        ],
        "nodal_role": "State Center of Excellence for Advanced Mechatronics, EV & 5-Axis CNC",
    },
    {
        "campus_id": "iti_jabalpur_richhai",
        "campus_name": "Govt Divisional ITI Richhai Jabalpur (MIS: GR23000089)",
        "mis_code": "GR23000089",
        "district_id": "jabalpur",
        "district_name": "Jabalpur",
        "sanctioned_seats": 680,
        "active_enrolments": 496,
        "phantom_capacity_pct": 27.1,
        "key_trades": [
            "CNC Programmer & Setter (7223.0501)",
            "Electrician (7411.0100)",
            "MMV (7231.0101)",
        ],
        "nodal_role": "Mahakoshal Defence Ancillary (VFJ/GCF) & Richhai Foundry CNC Hub",
    },
    {
        "campus_id": "iti_jabalpur_women",
        "campus_name": "Govt Women ITI Madhartal Jabalpur",
        "mis_code": "GR23000156",
        "district_id": "jabalpur",
        "district_name": "Jabalpur",
        "sanctioned_seats": 320,
        "active_enrolments": 176,
        "phantom_capacity_pct": 45.0,
        "key_trades": [
            "COPA / Data Entry (4132.0402)",
            "Electrician (7411.0100)",
        ],
        "nodal_role": "Priority Candidate for Legacy Data Entry Seat Freeze & ERP Upskilling",
    },
    {
        "campus_id": "iti_ujjain_maxiroad",
        "campus_name": "Govt Divisional ITI Maxi Road Ujjain (MIS: GR23000112)",
        "mis_code": "GR23000112",
        "district_id": "ujjain",
        "district_name": "Ujjain",
        "sanctioned_seats": 460,
        "active_enrolments": 354,
        "phantom_capacity_pct": 23.0,
        "key_trades": [
            "Electrician (7411.0100)",
            "Solar PV Installer (7411.0101)",
            "MMV (7231.0101)",
            "COPA / Data Entry (4132.0402)",
        ],
        "nodal_role": "Vikram Udyogpuri DMIC Township & PM-KUSUM Solar Feeder Training Node",
    },
    {
        "campus_id": "iti_ujjain_nagda",
        "campus_name": "Govt ITI Nagda",
        "mis_code": "GR23000241",
        "district_id": "ujjain",
        "district_name": "Ujjain",
        "sanctioned_seats": 240,
        "active_enrolments": 178,
        "phantom_capacity_pct": 25.8,
        "key_trades": [
            "Electrician (7411.0100)",
            "CNC Programmer & Setter (7223.0501)",
            "MMV (7231.0101)",
        ],
        "nodal_role": "Nagda Process & Engineering Maintenance Apprenticeship Center",
    },
]

OCCUPATIONS: List[Dict[str, Any]] = [
    {
        "occupation_id": "occ_solar_pv",
        "occupation_name": "Solar PV Installer (Suryamitra)",
        "nco_code": "7411.0101",
        "nsqf_level": 4,
        "sector": "Green Energy & Electrical",
        "training_scheme": "PMKVY STT: 300 hrs / 3 months",
        "training_duration_months": 3,
        "training_hours": 300,
        "section_size": 20,
        "bridge_duration_days": 90,
        "market_status": "HIGH_SHORTAGE",
        "donor_or_target_role": "TARGET_TRADE",
        "primary_shortage_districts": ["Rewa", "Indore"],
        "skill_overlap_highlight": "76% skill overlap with Electrician (General)",
        "base_offered_wage_inr": 19500,
    },
    {
        "occupation_id": "occ_electrician",
        "occupation_name": "Electrician (General)",
        "nco_code": "7411.0100",
        "nsqf_level": 4,
        "sector": "Green Energy & Electrical",
        "training_scheme": "DGT ITI Duration: 24 months, Section Size: 20",
        "training_duration_months": 24,
        "training_hours": 2400,
        "section_size": 20,
        "bridge_duration_days": None,
        "market_status": "SURPLUS_DONOR",
        "donor_or_target_role": "DONOR_TRADE",
        "primary_shortage_districts": [],
        "skill_overlap_highlight": "Surplus / Donor Trade (76% skill overlap with Solar PV Installer)",
        "base_offered_wage_inr": 15200,
    },
    {
        "occupation_id": "occ_ev_tech",
        "occupation_name": "EV Service Lead Technician",
        "nco_code": "7231.0105",
        "nsqf_level": 4,
        "sector": "Automotive & EV",
        "training_scheme": "Duration: 12 months / Bridge: 45 days",
        "training_duration_months": 12,
        "training_hours": 1200,
        "section_size": 20,
        "bridge_duration_days": 45,
        "market_status": "HIGH_SHORTAGE",
        "donor_or_target_role": "TARGET_TRADE",
        "primary_shortage_districts": ["Indore", "Bhopal"],
        "skill_overlap_highlight": "72% skill overlap with Mechanic Motor Vehicle (MMV)",
        "base_offered_wage_inr": 21800,
    },
    {
        "occupation_id": "occ_mmv",
        "occupation_name": "Mechanic Motor Vehicle (MMV)",
        "nco_code": "7231.0101",
        "nsqf_level": 4,
        "sector": "Automotive & EV",
        "training_scheme": "DGT ITI Duration: 24 months, Section Size: 24",
        "training_duration_months": 24,
        "training_hours": 2400,
        "section_size": 24,
        "bridge_duration_days": None,
        "market_status": "SURPLUS_DONOR",
        "donor_or_target_role": "DONOR_TRADE",
        "primary_shortage_districts": [],
        "skill_overlap_highlight": "Surplus / Donor Trade (72% skill overlap with EV Service Lead Technician)",
        "base_offered_wage_inr": 14900,
    },
    {
        "occupation_id": "occ_cnc_prog",
        "occupation_name": "CNC Programmer & Setter",
        "nco_code": "7223.0501",
        "nsqf_level": 4,
        "sector": "Capital Goods & Manufacturing",
        "training_scheme": "Duration: 12 months, Section Size: 20",
        "training_duration_months": 12,
        "training_hours": 1200,
        "section_size": 20,
        "bridge_duration_days": 60,
        "market_status": "WAGE_GAP_SHORTAGE",
        "donor_or_target_role": "TARGET_TRADE",
        "primary_shortage_districts": ["Jabalpur", "Indore"],
        "skill_overlap_highlight": "High Wage-Gap / Phantom Capacity case in Jabalpur & Indore",
        "base_offered_wage_inr": 14200,  # Notice entry SME offer often lags factory overtime / gig alternative!
    },
    {
        "occupation_id": "occ_data_entry",
        "occupation_name": "Data Entry Operator / Domestic IT Helpdesk",
        "nco_code": "4132.0402",
        "nsqf_level": 3,
        "sector": "IT-ITeS & Digital",
        "training_scheme": "Duration: 6 months, Section Size: 40",
        "training_duration_months": 6,
        "training_hours": 600,
        "section_size": 40,
        "bridge_duration_days": None,
        "market_status": "CHRONIC_OVERSUPPLY",
        "donor_or_target_role": "OVERSUPPLIED_LEGACY",
        "primary_shortage_districts": [],
        "skill_overlap_highlight": "Chronic Oversupply across all districts (~48% Phantom Capacity & Unplaced Backlog)",
        "base_offered_wage_inr": 12400,
    },
]


def build_data_sources() -> Dict[str, Any]:
    """Build /data/processed/data_sources.json with explicit provenance flags."""
    return {
        "generated_at": "2026-10-20T00:00:00Z",
        "brand": "SkillAlign",
        "problem_statement": "SIH26246",
        "state": "Madhya Pradesh",
        "sources": [
            {
                "source_id": "src_ncs_postings",
                "source_name": "NCS Job Postings & Employer Portal Feed",
                "publisher": "Ministry of Labour & Employment (National Career Service) + Regional Portals",
                "refresh_cadence": "Daily stream / Monthly deduplicated rollup",
                "duplicate_rate": 0.184,
                "stale_rate": 0.112,
                "mapping_confidence": 0.91,
                "real_or_synthetic": "SYNTHETIC_PILOT_FEED",
                "coverage_notes": "Captures formal online job postings across Indore, Bhopal, Jabalpur, Rewa, and Ujjain; requires PLFS pi_tier adjustment for unorganized/offline hiring.",
            },
            {
                "source_id": "src_plfs_benchmark",
                "source_name": "PLFS District/State Benchmark",
                "publisher": "MoSPI (Periodic Labour Force Survey — Madhya Pradesh State & NSSO Region Anchors)",
                "refresh_cadence": "Quarterly urban / Annual district-cluster benchmark",
                "duplicate_rate": 0.0,
                "stale_rate": 0.035,
                "mapping_confidence": 0.94,
                "real_or_synthetic": "OBSERVED_PUBLIC_ANCHOR",
                "coverage_notes": "Anchors the online capture rate (pi_tier) between 0.28 and 0.68 across sectors, plus local alternative/gig reservation wage benchmarks.",
            },
            {
                "source_id": "src_dgt_ncvt_mis",
                "source_name": "DGT NCVT MIS ITI Seat Matrix",
                "publisher": "Directorate General of Training (DGT), MSDE — NCVT MIS Portal",
                "refresh_cadence": "Annual Admission Cycle / Semester Progression",
                "duplicate_rate": 0.015,
                "stale_rate": 0.048,
                "mapping_confidence": 0.98,
                "real_or_synthetic": "OBSERVED_PUBLIC_ANCHOR",
                "coverage_notes": "Enforces institutional section-size constraints (20, 24, 40 seats per unit) and reveals ~48% ITI Phantom Capacity (sanctioned seats vs actual active enrolments).",
            },
            {
                "source_id": "src_sidh_pmkvy",
                "source_name": "SIDH PMKVY Funnel",
                "publisher": "Skill India Digital Hub (SIDH) & NSDC — PMKVY 4.0 STT & Bridge Modules",
                "refresh_cadence": "Monthly Batch Lifecycle Tracking",
                "duplicate_rate": 0.022,
                "stale_rate": 0.041,
                "mapping_confidence": 0.95,
                "real_or_synthetic": "DERIVED_ESTIMATE",
                "coverage_notes": "Tracks 6-stage supply conversion funnel from enrolment -> completion -> certification -> placement -> 6-month retention, plus SkillBridge 45-90 day reskilling cohorts.",
            },
            {
                "source_id": "src_eshram_context",
                "source_name": "e-Shram Context & Unorganized Skill Stock",
                "publisher": "Ministry of Labour & Employment — e-Shram District Occupation Aggregator",
                "refresh_cadence": "Monthly Snapshot",
                "duplicate_rate": 0.064,
                "stale_rate": 0.089,
                "mapping_confidence": 0.86,
                "real_or_synthetic": "DERIVED_ESTIMATE",
                "coverage_notes": "Provides informal worker density and unplaced/underemployed technician stock priors for Empirical Bayes cluster pooling in sparse districts like Ujjain and Rewa.",
            },
        ],
    }


def build_skill_genome() -> Dict[str, Any]:
    """Build /data/processed/skill_genome.json with NOS nodes, SkillBridge transitions, and Screen S09 emerging skills."""
    occupations_genome: List[Dict[str, Any]] = [
        {
            "occupation_id": "occ_solar_pv",
            "occupation_name": "Solar PV Installer (Suryamitra)",
            "nco_code": "7411.0101",
            "nsqf_level": 4,
            "qp_code": "SGJ/Q0101",
            "sector": "Green Energy & Electrical",
            "training_scheme": "PMKVY STT: 300 hrs / 3 months",
            "training_duration_months": 3,
            "training_hours": 300,
            "section_size": 20,
            "last_nsqf_revision_year": 2022,
            "curriculum_drift_score": 0.34,
            "unmapped_demand_share_pct": 38.5,
            "nos_nodes": [
                {
                    "nos_code": "SGJ/N0101",
                    "nos_title": "Site Survey & Shadow Analysis for Solar PV System",
                    "nsqf_level": 4,
                    "hours": 45,
                    "category": "DOMAIN_CORE",
                    "is_core": True,
                    "demand_frequency_pct": 88.0,
                },
                {
                    "nos_code": "SGJ/N0102",
                    "nos_title": "Civil & Mechanical Mounting of Solar PV Modules",
                    "nsqf_level": 4,
                    "hours": 60,
                    "category": "DOMAIN_CORE",
                    "is_core": True,
                    "demand_frequency_pct": 92.0,
                },
                {
                    "nos_code": "SGJ/N0103",
                    "nos_title": "DC/AC Electrical Wiring, Earthing & Inverter Termination",
                    "nsqf_level": 4,
                    "hours": 90,
                    "category": "SHARED_FOUNDATION",
                    "is_core": True,
                    "demand_frequency_pct": 96.0,
                },
                {
                    "nos_code": "SGJ/N0104",
                    "nos_title": "Testing, Commissioning & Net-Metering Handover",
                    "nsqf_level": 4,
                    "hours": 60,
                    "category": "DOMAIN_CORE",
                    "is_core": True,
                    "demand_frequency_pct": 84.0,
                },
                {
                    "nos_code": "SGJ/N0106",
                    "nos_title": "Electrical Worksite Safety & Working at Heights PPE",
                    "nsqf_level": 4,
                    "hours": 45,
                    "category": "SAFETY_COMPLIANCE",
                    "is_core": True,
                    "demand_frequency_pct": 91.0,
                },
            ],
            "emerging_unmapped_skills": [
                {
                    "skill_id": "em_solar_01",
                    "skill_name": "Bifacial Tracker & 1500V DC String Diagnostics",
                    "occupation_id": "occ_solar_pv",
                    "nco_code": "7411.0101",
                    "posting_mention_growth_yoy_pct": 164.0,
                    "employer_demand_share_pct": 44.2,
                    "current_nsqf_coverage": "UNMAPPED",
                    "recommended_micro_credential": "MC-SGJ-409: High-Voltage 1500V Bifacial & Single-Axis Tracker Commissioning (36 hrs)",
                    "estimated_upskill_hours": 36,
                    "sample_job_snippets": [
                        "[RUMSL 750MW Badwar Ultra-Mega Solar Park, Gurh-Rewa | ₹19,800–₹22,500/mo] Urgent requirement for 35 Suryamitra Lead Installers (SGJ/N0103, SGJ/N0104) trained in 1500V DC bifacial string IV-curve tracing, Fluke PV analyzer diagnostics & single-axis tracker calibration.",
                        "[PM Surya Ghar Vindhya EPC Cluster & Prism Johnson Captive Grid, Rewa/Satna | ₹18,500–₹21,000/mo] Hiring NCVT/PMKVY certified Solar PV Technicians for industrial rooftop string inverter SCADA fault isolation, MC4 crimping & earthing pit testing.",
                    ],
                },
                {
                    "skill_id": "em_solar_02",
                    "skill_name": "Hybrid BESS (Battery Energy Storage) & Smart Net-Metering Telemetry",
                    "occupation_id": "occ_solar_pv",
                    "nco_code": "7411.0101",
                    "posting_mention_growth_yoy_pct": 128.5,
                    "employer_demand_share_pct": 31.8,
                    "current_nsqf_coverage": "PARTIAL_LEGACY",
                    "recommended_micro_credential": "MC-SGJ-412: LiFePO4 Solar Hybrid Inverter & RMS Dongle Configuration (24 hrs)",
                    "estimated_upskill_hours": 24,
                    "sample_job_snippets": [
                        "[Malwa PM-KUSUM Solar Feeder & Pithampur Industrial Rooftop EPC, Indore/Ujjain | ₹19,000–₹22,000/mo] Solar Hybrid Commissioning Technician needed to configure LiFePO4 BESS racks, RS485/Modbus telemetry dongles & MPPKVVCL bi-directional smart net-meters (SGJ/N0104).",
                        "[Mandideep Industrial Area Solar EPC, Bhopal | ₹18,200–₹20,500/mo] Field Service Technician for 100kWp–500kWp C&I hybrid plants; must hold NSQF Level-4 Suryamitra certification and LOTO safety compliance (SGJ/N0106).",
                    ],
                },
            ],
        },
        {
            "occupation_id": "occ_electrician",
            "occupation_name": "Electrician (General)",
            "nco_code": "7411.0100",
            "nsqf_level": 4,
            "qp_code": "PSS/Q2001",
            "sector": "Green Energy & Electrical",
            "training_scheme": "DGT ITI Duration: 24 months, Section Size: 20",
            "training_duration_months": 24,
            "training_hours": 2400,
            "section_size": 20,
            "last_nsqf_revision_year": 2021,
            "curriculum_drift_score": 0.29,
            "unmapped_demand_share_pct": 27.0,
            "nos_nodes": [
                {
                    "nos_code": "PSS/N2001",
                    "nos_title": "Single & Three-Phase AC/DC Wiring, Conduit & Switchgear",
                    "nsqf_level": 4,
                    "hours": 600,
                    "category": "SHARED_FOUNDATION",
                    "is_core": True,
                    "demand_frequency_pct": 94.0,
                },
                {
                    "nos_code": "PSS/N2002",
                    "nos_title": "Earthing, Lightning Protection & Megger Insulation Testing",
                    "nsqf_level": 4,
                    "hours": 480,
                    "category": "SHARED_FOUNDATION",
                    "is_core": True,
                    "demand_frequency_pct": 89.0,
                },
                {
                    "nos_code": "PSS/N2003",
                    "nos_title": "Transformer, Induction Motor Winding & Panel Maintenance",
                    "nsqf_level": 4,
                    "hours": 720,
                    "category": "DOMAIN_CORE",
                    "is_core": True,
                    "demand_frequency_pct": 76.0,
                },
                {
                    "nos_code": "PSS/N2004",
                    "nos_title": "Electrical Safety, LOTO (Lockout-Tagout) & IE Rules",
                    "nsqf_level": 4,
                    "hours": 600,
                    "category": "SAFETY_COMPLIANCE",
                    "is_core": True,
                    "demand_frequency_pct": 92.0,
                },
            ],
            "emerging_unmapped_skills": [
                {
                    "skill_id": "em_elec_01",
                    "skill_name": "EV AC/DC Fast Charger (EVSE) Installation & Load Balancing",
                    "occupation_id": "occ_electrician",
                    "nco_code": "7411.0100",
                    "posting_mention_growth_yoy_pct": 142.0,
                    "employer_demand_share_pct": 34.5,
                    "current_nsqf_coverage": "UNMAPPED",
                    "recommended_micro_credential": "MC-PSS-405: Commercial EVSE CCS2 Charger Wiring & OCPP Commissioning (30 hrs)",
                    "estimated_upskill_hours": 30,
                    "sample_job_snippets": [
                        "[Indore-Bhopal Expressway & Crystal IT Park EVSE Corridor | ₹17,500–₹21,000/mo] Commercial EV Charging Operator hiring ITI Electricians (PSS/N2001, PSS/N2002) for 60kW/120kW CCS2 DC fast-charger LT panel termination, earth resistance testing (<1 Ohm) & OCPP 1.6J modem setup.",
                        "[BHEL Govindpura Ancillary Cluster & Bagroda ESDM Park, Bhopal | ₹16,800–₹19,500/mo] Industrial Maintenance Electrician required for 11kV/415V switchgear, APFC capacitor banks, Fluke insulation megger diagnostics & LOTO compliance (PSS/N2004).",
                    ],
                },
            ],
        },
        {
            "occupation_id": "occ_ev_tech",
            "occupation_name": "EV Service Lead Technician",
            "nco_code": "7231.0105",
            "nsqf_level": 4,
            "qp_code": "ASC/Q1429",
            "sector": "Automotive & EV",
            "training_scheme": "Duration: 12 months / Bridge: 45 days",
            "training_duration_months": 12,
            "training_hours": 1200,
            "section_size": 20,
            "last_nsqf_revision_year": 2023,
            "curriculum_drift_score": 0.42,
            "unmapped_demand_share_pct": 46.8,
            "nos_nodes": [
                {
                    "nos_code": "ASC/N1429",
                    "nos_title": "High-Voltage (HV) Traction Battery Pack & BMS Diagnostics",
                    "nsqf_level": 4,
                    "hours": 320,
                    "category": "DOMAIN_CORE",
                    "is_core": True,
                    "demand_frequency_pct": 95.0,
                },
                {
                    "nos_code": "ASC/N1430",
                    "nos_title": "BLDC / PMSM Traction Motor & Motor Controller Servicing",
                    "nsqf_level": 4,
                    "hours": 280,
                    "category": "DOMAIN_CORE",
                    "is_core": True,
                    "demand_frequency_pct": 91.0,
                },
                {
                    "nos_code": "ASC/N1402",
                    "nos_title": "Vehicle Chassis, Regenerative Braking, Suspension & Steering",
                    "nsqf_level": 4,
                    "hours": 360,
                    "category": "SHARED_FOUNDATION",
                    "is_core": True,
                    "demand_frequency_pct": 85.0,
                },
                {
                    "nos_code": "ASC/N1432",
                    "nos_title": "HV Live-Line Isolation, Arc-Flash PPE & Thermal Runaway Safety",
                    "nsqf_level": 4,
                    "hours": 240,
                    "category": "SAFETY_COMPLIANCE",
                    "is_core": True,
                    "demand_frequency_pct": 97.0,
                },
            ],
            "emerging_unmapped_skills": [
                {
                    "skill_id": "em_ev_01",
                    "skill_name": "CAN-Bus Telemetry Decoding & OTA Firmware Reflashing",
                    "occupation_id": "occ_ev_tech",
                    "nco_code": "7231.0105",
                    "posting_mention_growth_yoy_pct": 188.0,
                    "employer_demand_share_pct": 51.4,
                    "current_nsqf_coverage": "UNMAPPED",
                    "recommended_micro_credential": "MC-ASC-418: Automotive CAN-FD Protocol Analyzers & VCU Telemetry Diagnostics (40 hrs)",
                    "estimated_upskill_hours": 40,
                    "sample_job_snippets": [
                        "[Pithampur Auto & EV SEZ (Sector 1-3) & NATRAX Testing Hub, Indore | ₹21,500–₹24,000/mo] Commercial EV OEM & Fleet Hub hiring EV Service Lead Technicians (ASC/N1429, ASC/N1430) skilled in Peak PCAN-USB CAN-FD frame decoding, VCU OTA firmware flashing & HV interlock loop troubleshooting.",
                        "[AICTSL & Bagroda EV Bus Depot, Bhopal/Indore | ₹20,500–₹23,500/mo] Senior EV Diagnostics Technician required for 9m/12m electric bus traction PMSM motor resolver calibration and high-voltage isolation testing (ASC/N1432).",
                    ],
                },
                {
                    "skill_id": "em_ev_02",
                    "skill_name": "LFP Cell-Level Impedance Grading & Liquid Thermal Loop Service",
                    "occupation_id": "occ_ev_tech",
                    "nco_code": "7231.0105",
                    "posting_mention_growth_yoy_pct": 152.0,
                    "employer_demand_share_pct": 39.0,
                    "current_nsqf_coverage": "DRAFT_NOS",
                    "recommended_micro_credential": "MC-ASC-421: Liquid-Cooled HV Battery Chiller & Cell Balancing Workshop (32 hrs)",
                    "estimated_upskill_hours": 32,
                    "sample_job_snippets": [
                        "[Bagroda EV & ESDM Park / Mandideep Industrial Area, Bhopal | ₹20,000–₹23,200/mo] Battery Pack Assembly & Service Technician (ASC/N1429) for AIS-156 Phase-2 LFP battery modules, Hioki BT3562 internal resistance cell grading, active BMS balancing & chiller glycol loop service.",
                        "[Pithampur Sector-2 EV Component Cluster, Indore | ₹19,800–₹22,800/mo] HV Battery QA & Rework Specialist with 1000V CAT-III insulated tool certification and thermal runaway containment protocol training (ASC/N1432).",
                    ],
                },
            ],
        },
        {
            "occupation_id": "occ_mmv",
            "occupation_name": "Mechanic Motor Vehicle (MMV)",
            "nco_code": "7231.0101",
            "nsqf_level": 4,
            "qp_code": "ASC/Q1401",
            "sector": "Automotive & EV",
            "training_scheme": "DGT ITI Duration: 24 months, Section Size: 24",
            "training_duration_months": 24,
            "training_hours": 2400,
            "section_size": 24,
            "last_nsqf_revision_year": 2020,
            "curriculum_drift_score": 0.37,
            "unmapped_demand_share_pct": 35.2,
            "nos_nodes": [
                {
                    "nos_code": "ASC/N1401",
                    "nos_title": "IC Engine Overhaul, Fuel Injection & Emission Control (BS-VI)",
                    "nsqf_level": 4,
                    "hours": 800,
                    "category": "DOMAIN_CORE",
                    "is_core": True,
                    "demand_frequency_pct": 72.0,
                },
                {
                    "nos_code": "ASC/N1402",
                    "nos_title": "Vehicle Chassis, Braking, Suspension, Transmission & Wheel Alignment",
                    "nsqf_level": 4,
                    "hours": 800,
                    "category": "SHARED_FOUNDATION",
                    "is_core": True,
                    "demand_frequency_pct": 89.0,
                },
                {
                    "nos_code": "ASC/N1403",
                    "nos_title": "12V/24V Automotive Wiring Harness, Sensors & OBD-II Scanning",
                    "nsqf_level": 4,
                    "hours": 500,
                    "category": "SHARED_FOUNDATION",
                    "is_core": True,
                    "demand_frequency_pct": 91.0,
                },
                {
                    "nos_code": "ASC/N0003",
                    "nos_title": "Workshop Hydraulic Lift, Pneumatic Tool & Hazardous Fluid Safety",
                    "nsqf_level": 4,
                    "hours": 300,
                    "category": "SAFETY_COMPLIANCE",
                    "is_core": True,
                    "demand_frequency_pct": 87.0,
                },
            ],
            "emerging_unmapped_skills": [
                {
                    "skill_id": "em_mmv_01",
                    "skill_name": "Hybrid-Electric Powertrain & 48V Mild-Hybrid Starter-Generator",
                    "occupation_id": "occ_mmv",
                    "nco_code": "7231.0101",
                    "posting_mention_growth_yoy_pct": 119.0,
                    "employer_demand_share_pct": 33.4,
                    "current_nsqf_coverage": "UNMAPPED",
                    "recommended_micro_credential": "MC-ASC-410: MMV-to-EV 45-Day High-Voltage Transition Bridge (180 hrs)",
                    "estimated_upskill_hours": 180,
                    "sample_job_snippets": [
                        "[Indore Super Corridor & Bhopal LCV/Passenger Dealership Network | ₹16,500–₹19,800/mo] Authorized Multi-Brand Workshop hiring ITI MMV Mechanics (ASC/N1402, ASC/N1403) cross-trained on 48V/72V mild-hybrid starter-generators, OBD-II/CAN scanners & regenerative brake bleeding.",
                        "[Vikram Udyogpuri DMIC Smart Industrial Township, Ujjain | ₹16,800–₹19,200/mo] Senior Fleet Technician for BS-VI SCR/DPF regeneration and EV retrofit chassis/suspension overhaul.",
                    ],
                },
            ],
        },
        {
            "occupation_id": "occ_cnc_prog",
            "occupation_name": "CNC Programmer & Setter",
            "nco_code": "7223.0501",
            "nsqf_level": 4,
            "qp_code": "CSC/Q0115",
            "sector": "Capital Goods & Manufacturing",
            "training_scheme": "Duration: 12 months, Section Size: 20",
            "training_duration_months": 12,
            "training_hours": 1200,
            "section_size": 20,
            "last_nsqf_revision_year": 2021,
            "curriculum_drift_score": 0.39,
            "unmapped_demand_share_pct": 41.0,
            "nos_nodes": [
                {
                    "nos_code": "CSC/N0115",
                    "nos_title": "G-Code / M-Code Part Programming for CNC Turning & VMC Milling",
                    "nsqf_level": 4,
                    "hours": 400,
                    "category": "DOMAIN_CORE",
                    "is_core": True,
                    "demand_frequency_pct": 94.0,
                },
                {
                    "nos_code": "CSC/N0116",
                    "nos_title": "Workholding Fixture Setup, Tool Offset Calibration & Zero Setting",
                    "nsqf_level": 4,
                    "hours": 400,
                    "category": "DOMAIN_CORE",
                    "is_core": True,
                    "demand_frequency_pct": 93.0,
                },
                {
                    "nos_code": "CSC/N0117",
                    "nos_title": "GD&T Blueprint Reading, CMM & Micrometer Metrology Inspection",
                    "nsqf_level": 4,
                    "hours": 240,
                    "category": "SHARED_FOUNDATION",
                    "is_core": True,
                    "demand_frequency_pct": 88.0,
                },
                {
                    "nos_code": "CSC/N0135",
                    "nos_title": "Machine Guarding, Coolant Handling & Shopfloor 5S Safety",
                    "nsqf_level": 4,
                    "hours": 160,
                    "category": "SAFETY_COMPLIANCE",
                    "is_core": True,
                    "demand_frequency_pct": 85.0,
                },
            ],
            "emerging_unmapped_skills": [
                {
                    "skill_id": "em_cnc_01",
                    "skill_name": "Fanuc/Siemens 5-Axis CAM Post-Processing & Probe In-Cycle Gauging",
                    "occupation_id": "occ_cnc_prog",
                    "nco_code": "7223.0501",
                    "posting_mention_growth_yoy_pct": 146.0,
                    "employer_demand_share_pct": 43.5,
                    "current_nsqf_coverage": "UNMAPPED",
                    "recommended_micro_credential": "MC-CSC-408: Multi-Axis Sinumerik/Fanuc Macro Programming & Renishaw Probing (48 hrs)",
                    "estimated_upskill_hours": 48,
                    "sample_job_snippets": [
                        "[Richhai MSME Engineering Cluster & VFJ/GCF Defence Ancillaries, Jabalpur | ₹18,500–₹23,500/mo] Urgent opening for CNC Setter-Programmer (CSC/N0115, CSC/N0116) on Fanuc 0i-TF & Siemens Sinumerik 828D 4-axis VMC; must perform Renishaw probe in-cycle work-offset calibration & CMM GD&T verification (CSC/N0117).",
                        "[Pithampur Auto & EV SEZ Tier-1 Precision Machining Vendor, Indore | ₹19,000–₹24,000/mo] CNC Turn-Mill Center Programmer required for EV transmission shafts; Mastercam post-processing, tool wear offset compensation & zero-defect SPC charting.",
                    ],
                },
            ],
        },
        {
            "occupation_id": "occ_data_entry",
            "occupation_name": "Data Entry Operator / Domestic IT Helpdesk",
            "nco_code": "4132.0402",
            "nsqf_level": 3,
            "qp_code": "SSC/Q2212",
            "sector": "IT-ITeS & Digital",
            "training_scheme": "Duration: 6 months, Section Size: 40",
            "training_duration_months": 6,
            "training_hours": 600,
            "section_size": 40,
            "last_nsqf_revision_year": 2019,
            "curriculum_drift_score": 0.68,
            "unmapped_demand_share_pct": 64.0,
            "nos_nodes": [
                {
                    "nos_code": "SSC/N3022",
                    "nos_title": "Alphanumeric Keyboarding, Spreadsheet Entry & Document Formatting",
                    "nsqf_level": 3,
                    "hours": 240,
                    "category": "DOMAIN_CORE",
                    "is_core": True,
                    "demand_frequency_pct": 38.0,
                },
                {
                    "nos_code": "SSC/N0101",
                    "nos_title": "Basic Ticketing Logging & Inbound Customer Query Escalation",
                    "nsqf_level": 3,
                    "hours": 240,
                    "category": "SHARED_FOUNDATION",
                    "is_core": True,
                    "demand_frequency_pct": 52.0,
                },
                {
                    "nos_code": "SSC/N9001",
                    "nos_title": "Data Privacy, Ergonomics & Digital Workplace Hygiene",
                    "nsqf_level": 3,
                    "hours": 120,
                    "category": "SAFETY_COMPLIANCE",
                    "is_core": True,
                    "demand_frequency_pct": 61.0,
                },
            ],
            "emerging_unmapped_skills": [
                {
                    "skill_id": "em_deo_01",
                    "skill_name": "AI Copilot Ticket Triage, OCR Validation & Cloud ERP Inventory Logging",
                    "occupation_id": "occ_data_entry",
                    "nco_code": "4132.0402",
                    "posting_mention_growth_yoy_pct": 210.0,
                    "employer_demand_share_pct": 66.0,
                    "current_nsqf_coverage": "UNMAPPED",
                    "recommended_micro_credential": "MC-SSC-315: GenAI Helpdesk Copilot, Automated OCR QA & Tally/SAP Shopfloor ERP (45 hrs)",
                    "estimated_upskill_hours": 45,
                    "sample_job_snippets": [
                        "[Crystal IT Park & Super Corridor Tech Hub, Indore | ₹16,500–₹19,500/mo] Digital Operations & ERP Associate (replacing legacy manual Data Entry SSC/N3022) — must operate SAP S/4HANA / Tally Prime e-waybill reconciliation, automated OCR invoice validation & GenAI CRM ticket triage.",
                        "[Mandideep Industrial Area (HEG & Crompton) Supply Chain Desk, Bhopal | ₹16,500–₹18,800/mo] Shopfloor ERP & Warehouse Inventory Coordinator skilled in barcode/RFID dispatch logging, GST portal reconciliation & automated MIS dashboard reporting.",
                    ],
                },
            ],
        },
    ]

    skillbridge_pathways: List[Dict[str, Any]] = [
        {
            "pathway_id": "sb_elec_to_solar",
            "source_occupation_id": "occ_electrician",
            "source_occupation_name": "Electrician (General)",
            "source_nco_code": "7411.0100",
            "source_nsqf_level": 4,
            "target_occupation_id": "occ_solar_pv",
            "target_occupation_name": "Solar PV Installer (Suryamitra)",
            "target_nco_code": "7411.0101",
            "target_nsqf_level": 4,
            "skill_overlap_pct": 76.0,
            "shared_skills": [
                "AC/DC Wiring & Conduit Termination (PSS/N2001 <-> SGJ/N0103)",
                "Earthing, Lightning Arrester & Megger Testing (PSS/N2002)",
                "Multimeter, Clamp Meter & Load Calculation",
                "Electrical LOTO & Worksite Safety Compliance (SGJ/N0106)",
            ],
            "missing_skills": [
                "Solar Site Shadow Analysis & Azimuth/Tilt Survey (SGJ/N0101)",
                "PV Module Stringing, MC4 Connector Crimping & 1500V DC Safety",
                "Grid-Tie / Hybrid Inverter Commissioning & Net-Metering Handover",
            ],
            "bridge_module_code": "PMKVY-SB-SGJ-401",
            "bridge_module_name": "Suryamitra Fast-Track Bridge for Certified ITI Electricians",
            "bridge_duration_days": 90,
            "bridge_hours": 300,
            "bridge_cost_per_candidate_inr": 14500,
            "fresh_training_duration_months": 24,
            "lead_time_saved_months": 21,
            "available_donor_pool": 640,
            "projected_placement_rate": 0.86,
            "expected_wage_uplift_inr": 4300,
            "roi_payback_months": 3.4,
        },
        {
            "pathway_id": "sb_mmv_to_ev",
            "source_occupation_id": "occ_mmv",
            "source_occupation_name": "Mechanic Motor Vehicle (MMV)",
            "source_nco_code": "7231.0101",
            "source_nsqf_level": 4,
            "target_occupation_id": "occ_ev_tech",
            "target_occupation_name": "EV Service Lead Technician",
            "target_nco_code": "7231.0105",
            "target_nsqf_level": 4,
            "skill_overlap_pct": 72.0,
            "shared_skills": [
                "Vehicle Chassis, Suspension, Steering & Braking Systems (ASC/N1402)",
                "12V/24V Auxiliary Harness, Relays & OBD Diagnostic Tooling (ASC/N1403)",
                "Hydraulic Bay Lift, Torque Wrench & Workshop Safety Protocols",
            ],
            "missing_skills": [
                "High-Voltage (HV) LFP/NMC Battery Pack Isolation & BMS Cell Balancing (ASC/N1429)",
                "BLDC / PMSM Traction Motor & Controller Resolver Diagnostics (ASC/N1430)",
                "CAN-Bus Telemetry Decoding & Thermal Runaway Emergency Protocol (ASC/N1432)",
            ],
            "bridge_module_code": "PMKVY-SB-ASC-405",
            "bridge_module_name": "ICE-to-EV High-Voltage Powertrain & BMS Bridge Module",
            "bridge_duration_days": 45,
            "bridge_hours": 180,
            "bridge_cost_per_candidate_inr": 11800,
            "fresh_training_duration_months": 24,
            "lead_time_saved_months": 22.5,
            "available_donor_pool": 520,
            "projected_placement_rate": 0.88,
            "expected_wage_uplift_inr": 6900,
            "roi_payback_months": 1.8,
        },
        {
            "pathway_id": "sb_elec_to_ev",
            "source_occupation_id": "occ_electrician",
            "source_occupation_name": "Electrician (General)",
            "source_nco_code": "7411.0100",
            "source_nsqf_level": 4,
            "target_occupation_id": "occ_ev_tech",
            "target_occupation_name": "EV Service Lead Technician",
            "target_nco_code": "7231.0105",
            "target_nsqf_level": 4,
            "skill_overlap_pct": 64.0,
            "shared_skills": [
                "High-Voltage Insulation Testing, Multimeter & Electrical Safety",
                "Three-Phase Motor Winding Principles & Inverter Power Electronics",
                "LOTO & Arc-Flash PPE Compliance",
            ],
            "missing_skills": [
                "Automotive Chassis, Regenerative Braking & Transaxle Architecture",
                "Traction Battery BMS Diagnostics & CAN-Bus Protocol Scanning",
                "EV Charging Protocol (CCS2 / Bharat DC-001) Vehicle-Side Handshake",
            ],
            "bridge_module_code": "PMKVY-SB-ASC-409",
            "bridge_module_name": "Automotive HV Architecture & EV Diagnostics Bridge for Electricians",
            "bridge_duration_days": 60,
            "bridge_hours": 240,
            "bridge_cost_per_candidate_inr": 13200,
            "fresh_training_duration_months": 24,
            "lead_time_saved_months": 22,
            "available_donor_pool": 410,
            "projected_placement_rate": 0.81,
            "expected_wage_uplift_inr": 6600,
            "roi_payback_months": 2.0,
        },
        {
            "pathway_id": "sb_mmv_to_cnc",
            "source_occupation_id": "occ_mmv",
            "source_occupation_name": "Mechanic Motor Vehicle (MMV)",
            "source_nco_code": "7231.0101",
            "source_nsqf_level": 4,
            "target_occupation_id": "occ_cnc_prog",
            "target_occupation_name": "CNC Programmer & Setter",
            "target_nco_code": "7223.0501",
            "target_nsqf_level": 4,
            "skill_overlap_pct": 58.0,
            "shared_skills": [
                "Precision Micrometer, Vernier Caliper & Bore Gauge Metrology",
                "Engineering Drawing Tolerance Reading & Mechanical Fasteners",
                "Shopfloor 5S, Coolant & Machine Guarding Safety",
            ],
            "missing_skills": [
                "Fanuc/Siemens G-Code & M-Code CNC Turning/VMC Programming",
                "Workholding Fixture Zero-Setting & Tool Wear Offset Compensation",
                "GD&T Surface Finish Verification & CAM Post-Processing",
            ],
            "bridge_module_code": "PMKVY-SB-CSC-402",
            "bridge_module_name": "Precision CNC Setting & Fanuc Programming Bridge for Mechanical Trades",
            "bridge_duration_days": 60,
            "bridge_hours": 240,
            "bridge_cost_per_candidate_inr": 13800,
            "fresh_training_duration_months": 12,
            "lead_time_saved_months": 10,
            "available_donor_pool": 310,
            "projected_placement_rate": 0.79,
            "expected_wage_uplift_inr": 3800,
            "roi_payback_months": 3.6,
        },
    ]

    return {
        "generated_at": "2026-10-20T00:00:00Z",
        "brand": "SkillAlign",
        "state": "Madhya Pradesh",
        "occupations": occupations_genome,
        "skillbridge_pathways": skillbridge_pathways,
    }


# District x Occupation baseline parameters so every cell tells a realistic, coherent story
CELL_CONFIG: Dict[tuple[str, str], Dict[str, Any]] = {
    # 1. Solar PV Installer (Suryamitra) - High Shortage in Rewa & Indore; shock at 2025-10 in Rewa
    ("rewa", "occ_solar_pv"): {
        "base_clean_postings": 46,
        "shock_start_idx": 23,  # 2025-10 (0-indexed: month 23 of 0..35)
        "shock_Clean_Boost": 98,
        "pi_tier": 0.36,
        "confidence_tier": "Tier 1: Direct",
        "eb_weight": 0.89,
        "sections": 5,  # 5 * 20 = 100 seats/yr (~8-9 per month cohort flow)
        "enrolment_fill_rate": 0.94,
        "completion_rate": 0.91,
        "certification_rate": 0.93,
        "employment_conversion": 0.88,
        "retention_6m_rate": 0.90,
        "offered_wage": 19800,
        "backlog_base": 14,
    },
    ("indore", "occ_solar_pv"): {
        "base_clean_postings": 64,
        "shock_start_idx": 23,
        "shock_Clean_Boost": 54,
        "pi_tier": 0.48,
        "confidence_tier": "Tier 1: Direct",
        "eb_weight": 0.93,
        "sections": 7,  # 140 seats
        "enrolment_fill_rate": 0.92,
        "completion_rate": 0.90,
        "certification_rate": 0.94,
        "employment_conversion": 0.86,
        "retention_6m_rate": 0.89,
        "offered_wage": 20600,
        "backlog_base": 19,
    },
    ("bhopal", "occ_solar_pv"): {
        "base_clean_postings": 40,
        "shock_start_idx": 23,
        "shock_Clean_Boost": 24,
        "pi_tier": 0.46,
        "confidence_tier": "Tier 1: Direct",
        "eb_weight": 0.86,
        "sections": 5,
        "enrolment_fill_rate": 0.90,
        "completion_rate": 0.89,
        "certification_rate": 0.92,
        "employment_conversion": 0.84,
        "retention_6m_rate": 0.88,
        "offered_wage": 19200,
        "backlog_base": 16,
    },
    ("jabalpur", "occ_solar_pv"): {
        "base_clean_postings": 26,
        "shock_start_idx": 23,
        "shock_Clean_Boost": 14,
        "pi_tier": 0.40,
        "confidence_tier": "Tier 2: Cluster-Pooled",
        "eb_weight": 0.71,
        "sections": 4,
        "enrolment_fill_rate": 0.86,
        "completion_rate": 0.88,
        "certification_rate": 0.91,
        "employment_conversion": 0.81,
        "retention_6m_rate": 0.86,
        "offered_wage": 18100,
        "backlog_base": 15,
    },
    ("ujjain", "occ_solar_pv"): {
        "base_clean_postings": 18,
        "shock_start_idx": 23,
        "shock_Clean_Boost": 12,
        "pi_tier": 0.34,
        "confidence_tier": "Tier 2: Cluster-Pooled",
        "eb_weight": 0.62,
        "sections": 3,
        "enrolment_fill_rate": 0.85,
        "completion_rate": 0.87,
        "certification_rate": 0.90,
        "employment_conversion": 0.80,
        "retention_6m_rate": 0.85,
        "offered_wage": 17800,
        "backlog_base": 12,
    },
    # 2. Electrician (General) - Surplus / Donor Trade (76% overlap with Solar PV)
    ("rewa", "occ_electrician"): {
        "base_clean_postings": 22,
        "shock_start_idx": None,
        "shock_Clean_Boost": 0,
        "pi_tier": 0.42,
        "confidence_tier": "Tier 1: Direct",
        "eb_weight": 0.84,
        "sections": 16,  # 320 seats -> large donor pool in Rewa!
        "enrolment_fill_rate": 0.82,
        "completion_rate": 0.86,
        "certification_rate": 0.90,
        "employment_conversion": 0.56,
        "retention_6m_rate": 0.78,
        "offered_wage": 14100,
        "backlog_base": 148,
    },
    ("indore", "occ_electrician"): {
        "base_clean_postings": 42,
        "shock_start_idx": None,
        "shock_Clean_Boost": 0,
        "pi_tier": 0.52,
        "confidence_tier": "Tier 1: Direct",
        "eb_weight": 0.91,
        "sections": 22,  # 440 seats
        "enrolment_fill_rate": 0.84,
        "completion_rate": 0.88,
        "certification_rate": 0.91,
        "employment_conversion": 0.61,
        "retention_6m_rate": 0.80,
        "offered_wage": 15900,
        "backlog_base": 182,
    },
    ("bhopal", "occ_electrician"): {
        "base_clean_postings": 35,
        "shock_start_idx": None,
        "shock_Clean_Boost": 0,
        "pi_tier": 0.50,
        "confidence_tier": "Tier 1: Direct",
        "eb_weight": 0.89,
        "sections": 18,  # 360 seats
        "enrolment_fill_rate": 0.83,
        "completion_rate": 0.87,
        "certification_rate": 0.90,
        "employment_conversion": 0.59,
        "retention_6m_rate": 0.79,
        "offered_wage": 15400,
        "backlog_base": 154,
    },
    ("jabalpur", "occ_electrician"): {
        "base_clean_postings": 28,
        "shock_start_idx": None,
        "shock_Clean_Boost": 0,
        "pi_tier": 0.45,
        "confidence_tier": "Tier 1: Direct",
        "eb_weight": 0.85,
        "sections": 15,  # 300 seats
        "enrolment_fill_rate": 0.81,
        "completion_rate": 0.86,
        "certification_rate": 0.89,
        "employment_conversion": 0.58,
        "retention_6m_rate": 0.78,
        "offered_wage": 14800,
        "backlog_base": 126,
    },
    ("ujjain", "occ_electrician"): {
        "base_clean_postings": 18,
        "shock_start_idx": None,
        "shock_Clean_Boost": 0,
        "pi_tier": 0.40,
        "confidence_tier": "Tier 2: Cluster-Pooled",
        "eb_weight": 0.68,
        "sections": 12,  # 240 seats
        "enrolment_fill_rate": 0.79,
        "completion_rate": 0.85,
        "certification_rate": 0.88,
        "employment_conversion": 0.54,
        "retention_6m_rate": 0.76,
        "offered_wage": 14200,
        "backlog_base": 108,
    },
    # 3. EV Service Lead Technician - High Shortage in Indore & Bhopal; shock at 2025-10 in Indore
    ("indore", "occ_ev_tech"): {
        "base_clean_postings": 58,
        "shock_start_idx": 23,  # 2025-10 demand shock in Indore!
        "shock_Clean_Boost": 108,
        "pi_tier": 0.45,
        "confidence_tier": "Tier 1: Direct",
        "eb_weight": 0.94,
        "sections": 5,  # 100 seats
        "enrolment_fill_rate": 0.95,
        "completion_rate": 0.92,
        "certification_rate": 0.94,
        "employment_conversion": 0.91,
        "retention_6m_rate": 0.92,
        "offered_wage": 23400,
        "backlog_base": 9,
    },
    ("bhopal", "occ_ev_tech"): {
        "base_clean_postings": 44,
        "shock_start_idx": 23,
        "shock_Clean_Boost": 62,
        "pi_tier": 0.44,
        "confidence_tier": "Tier 1: Direct",
        "eb_weight": 0.90,
        "sections": 4,  # 80 seats
        "enrolment_fill_rate": 0.93,
        "completion_rate": 0.91,
        "certification_rate": 0.93,
        "employment_conversion": 0.89,
        "retention_6m_rate": 0.90,
        "offered_wage": 22100,
        "backlog_base": 11,
    },
    ("jabalpur", "occ_ev_tech"): {
        "base_clean_postings": 21,
        "shock_start_idx": 23,
        "shock_Clean_Boost": 18,
        "pi_tier": 0.40,
        "confidence_tier": "Tier 2: Cluster-Pooled",
        "eb_weight": 0.72,
        "sections": 3,
        "enrolment_fill_rate": 0.88,
        "completion_rate": 0.89,
        "certification_rate": 0.91,
        "employment_conversion": 0.84,
        "retention_6m_rate": 0.87,
        "offered_wage": 20200,
        "backlog_base": 10,
    },
    ("rewa", "occ_ev_tech"): {
        "base_clean_postings": 9,
        "shock_start_idx": None,
        "shock_Clean_Boost": 0,
        "pi_tier": 0.35,
        "confidence_tier": "Tier 3: Advisory Only",
        "eb_weight": 0.41,
        "sections": 2,
        "enrolment_fill_rate": 0.82,
        "completion_rate": 0.86,
        "certification_rate": 0.89,
        "employment_conversion": 0.78,
        "retention_6m_rate": 0.84,
        "offered_wage": 18900,
        "backlog_base": 8,
    },
    ("ujjain", "occ_ev_tech"): {
        "base_clean_postings": 11,
        "shock_start_idx": 23,
        "shock_Clean_Boost": 10,
        "pi_tier": 0.36,
        "confidence_tier": "Tier 3: Advisory Only",
        "eb_weight": 0.45,
        "sections": 2,
        "enrolment_fill_rate": 0.84,
        "completion_rate": 0.87,
        "certification_rate": 0.90,
        "employment_conversion": 0.80,
        "retention_6m_rate": 0.85,
        "offered_wage": 19400,
        "backlog_base": 9,
    },
    # 4. Mechanic Motor Vehicle (MMV) - Surplus / Donor Trade (Section Size: 24, 72% overlap with EV Tech)
    ("indore", "occ_mmv"): {
        "base_clean_postings": 36,
        "shock_start_idx": None,
        "shock_Clean_Boost": 0,
        "pi_tier": 0.50,
        "confidence_tier": "Tier 1: Direct",
        "eb_weight": 0.90,
        "sections": 18,  # 18 * 24 = 432 seats!
        "enrolment_fill_rate": 0.78,
        "completion_rate": 0.85,
        "certification_rate": 0.89,
        "employment_conversion": 0.55,
        "retention_6m_rate": 0.75,
        "offered_wage": 15300,
        "backlog_base": 195,
    },
    ("bhopal", "occ_mmv"): {
        "base_clean_postings": 29,
        "shock_start_idx": None,
        "shock_Clean_Boost": 0,
        "pi_tier": 0.48,
        "confidence_tier": "Tier 1: Direct",
        "eb_weight": 0.87,
        "sections": 15,  # 15 * 24 = 360 seats
        "enrolment_fill_rate": 0.77,
        "completion_rate": 0.84,
        "certification_rate": 0.88,
        "employment_conversion": 0.54,
        "retention_6m_rate": 0.74,
        "offered_wage": 14900,
        "backlog_base": 162,
    },
    ("jabalpur", "occ_mmv"): {
        "base_clean_postings": 24,
        "shock_start_idx": None,
        "shock_Clean_Boost": 0,
        "pi_tier": 0.44,
        "confidence_tier": "Tier 1: Direct",
        "eb_weight": 0.83,
        "sections": 12,  # 12 * 24 = 288 seats
        "enrolment_fill_rate": 0.76,
        "completion_rate": 0.84,
        "certification_rate": 0.88,
        "employment_conversion": 0.53,
        "retention_6m_rate": 0.74,
        "offered_wage": 14500,
        "backlog_base": 134,
    },
    ("rewa", "occ_mmv"): {
        "base_clean_postings": 15,
        "shock_start_idx": None,
        "shock_Clean_Boost": 0,
        "pi_tier": 0.39,
        "confidence_tier": "Tier 2: Cluster-Pooled",
        "eb_weight": 0.66,
        "sections": 9,  # 9 * 24 = 216 seats
        "enrolment_fill_rate": 0.74,
        "completion_rate": 0.82,
        "certification_rate": 0.87,
        "employment_conversion": 0.50,
        "retention_6m_rate": 0.72,
        "offered_wage": 13800,
        "backlog_base": 104,
    },
    ("ujjain", "occ_mmv"): {
        "base_clean_postings": 16,
        "shock_start_idx": None,
        "shock_Clean_Boost": 0,
        "pi_tier": 0.40,
        "confidence_tier": "Tier 2: Cluster-Pooled",
        "eb_weight": 0.67,
        "sections": 10,  # 10 * 24 = 240 seats
        "enrolment_fill_rate": 0.75,
        "completion_rate": 0.83,
        "certification_rate": 0.87,
        "employment_conversion": 0.52,
        "retention_6m_rate": 0.73,
        "offered_wage": 14100,
        "backlog_base": 112,
    },
    # 5. CNC Programmer & Setter - Shortage in Jabalpur & Indore (High Wage-Gap / Phantom Capacity case)
    ("jabalpur", "occ_cnc_prog"): {
        "base_clean_postings": 56,
        "shock_start_idx": 23,
        "shock_Clean_Boost": 38,
        "pi_tier": 0.42,
        "confidence_tier": "Tier 1: Direct",
        "eb_weight": 0.91,
        "sections": 10,  # 200 sanctioned seats, BUT high phantom capacity + wage-gap attrition!
        "enrolment_fill_rate": 0.54,  # 46% phantom capacity due to obsolete CNC lab & entry wage lag!
        "completion_rate": 0.78,
        "certification_rate": 0.85,
        "employment_conversion": 0.64,
        "retention_6m_rate": 0.58,  # Severe 6m attrition due to SME entry wage < local alternative/Pune migration
        "offered_wage": 13600,  # Below Jabalpur alternative wage (14400) -> Wage Ratio < 1.0!
        "backlog_base": 46,
    },
    ("indore", "occ_cnc_prog"): {
        "base_clean_postings": 62,
        "shock_start_idx": 23,
        "shock_Clean_Boost": 34,
        "pi_tier": 0.46,
        "confidence_tier": "Tier 1: Direct",
        "eb_weight": 0.92,
        "sections": 12,  # 240 sanctioned seats
        "enrolment_fill_rate": 0.56,  # 44% phantom capacity
        "completion_rate": 0.80,
        "certification_rate": 0.86,
        "employment_conversion": 0.66,
        "retention_6m_rate": 0.60,
        "offered_wage": 14500,  # Below Indore gig/alternative wage (15800) -> Wage Ratio ~ 0.92!
        "backlog_base": 54,
    },
    ("bhopal", "occ_cnc_prog"): {
        "base_clean_postings": 32,
        "shock_start_idx": None,
        "shock_Clean_Boost": 0,
        "pi_tier": 0.45,
        "confidence_tier": "Tier 1: Direct",
        "eb_weight": 0.84,
        "sections": 7,
        "enrolment_fill_rate": 0.58,
        "completion_rate": 0.80,
        "certification_rate": 0.86,
        "employment_conversion": 0.68,
        "retention_6m_rate": 0.64,
        "offered_wage": 14400,
        "backlog_base": 34,
    },
    ("rewa", "occ_cnc_prog"): {
        "base_clean_postings": 8,
        "shock_start_idx": None,
        "shock_Clean_Boost": 0,
        "pi_tier": 0.36,
        "confidence_tier": "Tier 3: Advisory Only",
        "eb_weight": 0.38,
        "sections": 3,
        "enrolment_fill_rate": 0.52,
        "completion_rate": 0.76,
        "certification_rate": 0.84,
        "employment_conversion": 0.60,
        "retention_6m_rate": 0.62,
        "offered_wage": 12900,
        "backlog_base": 22,
    },
    ("ujjain", "occ_cnc_prog"): {
        "base_clean_postings": 14,
        "shock_start_idx": None,
        "shock_Clean_Boost": 0,
        "pi_tier": 0.38,
        "confidence_tier": "Tier 2: Cluster-Pooled",
        "eb_weight": 0.64,
        "sections": 4,
        "enrolment_fill_rate": 0.55,
        "completion_rate": 0.78,
        "certification_rate": 0.85,
        "employment_conversion": 0.63,
        "retention_6m_rate": 0.63,
        "offered_wage": 13300,
        "backlog_base": 26,
    },
    # 6. Data Entry Operator / Domestic IT Helpdesk - Chronic Oversupply across ALL districts (~48% Phantom Capacity & High Unplaced Backlog)
    ("indore", "occ_data_entry"): {
        "base_clean_postings": 22,
        "shock_start_idx": None,
        "shock_Clean_Boost": -6,
        "pi_tier": 0.68,
        "confidence_tier": "Tier 1: Direct",
        "eb_weight": 0.92,
        "sections": 16,  # 16 * 40 = 640 sanctioned seats!
        "enrolment_fill_rate": 0.52,  # 48% Phantom Capacity!
        "completion_rate": 0.84,
        "certification_rate": 0.88,
        "employment_conversion": 0.31,
        "retention_6m_rate": 0.62,
        "offered_wage": 12200,
        "backlog_base": 420,
    },
    ("bhopal", "occ_data_entry"): {
        "base_clean_postings": 20,
        "shock_start_idx": None,
        "shock_Clean_Boost": -5,
        "pi_tier": 0.66,
        "confidence_tier": "Tier 1: Direct",
        "eb_weight": 0.90,
        "sections": 14,  # 14 * 40 = 560 sanctioned seats
        "enrolment_fill_rate": 0.52,  # 48% Phantom Capacity!
        "completion_rate": 0.83,
        "certification_rate": 0.87,
        "employment_conversion": 0.30,
        "retention_6m_rate": 0.61,
        "offered_wage": 12000,
        "backlog_base": 380,
    },
    ("jabalpur", "occ_data_entry"): {
        "base_clean_postings": 14,
        "shock_start_idx": None,
        "shock_Clean_Boost": -4,
        "pi_tier": 0.64,
        "confidence_tier": "Tier 1: Direct",
        "eb_weight": 0.85,
        "sections": 12,  # 12 * 40 = 480 sanctioned seats
        "enrolment_fill_rate": 0.51,  # ~49% Phantom Capacity
        "completion_rate": 0.82,
        "certification_rate": 0.86,
        "employment_conversion": 0.28,
        "retention_6m_rate": 0.60,
        "offered_wage": 11500,
        "backlog_base": 325,
    },
    ("rewa", "occ_data_entry"): {
        "base_clean_postings": 10,
        "shock_start_idx": None,
        "shock_Clean_Boost": -3,
        "pi_tier": 0.60,
        "confidence_tier": "Tier 2: Cluster-Pooled",
        "eb_weight": 0.70,
        "sections": 10,  # 10 * 40 = 400 sanctioned seats
        "enrolment_fill_rate": 0.52,  # 48% Phantom Capacity
        "completion_rate": 0.81,
        "certification_rate": 0.85,
        "employment_conversion": 0.26,
        "retention_6m_rate": 0.58,
        "offered_wage": 11000,
        "backlog_base": 290,
    },
    ("ujjain", "occ_data_entry"): {
        "base_clean_postings": 11,
        "shock_start_idx": None,
        "shock_Clean_Boost": -3,
        "pi_tier": 0.62,
        "confidence_tier": "Tier 2: Cluster-Pooled",
        "eb_weight": 0.72,
        "sections": 10,  # 10 * 40 = 400 sanctioned seats
        "enrolment_fill_rate": 0.52,  # 48% Phantom Capacity
        "completion_rate": 0.82,
        "certification_rate": 0.86,
        "employment_conversion": 0.27,
        "retention_6m_rate": 0.59,
        "offered_wage": 11200,
        "backlog_base": 275,
    },
}


def build_timeseries_observations() -> List[Dict[str, Any]]:
    """
    Generate 36 months (2023-11 to 2026-10) x 5 districts x 6 occupations = 1,080 records.
    Injects the clear historical demand shock at T-12m (2025-10) in Rewa (Solar PV)
    and Indore (EV Service Lead Technician).
    """
    rng = random.Random(RNG_SEED)
    months = generate_months()
    district_map = {d["district_id"]: d for d in DISTRICTS}
    occ_map = {o["occupation_id"]: o for o in OCCUPATIONS}

    observations: List[Dict[str, Any]] = []

    for d_id, district in district_map.items():
        for o_id, occ in occ_map.items():
            cfg = CELL_CONFIG[(d_id, o_id)]
            section_size = occ["section_size"]
            sanctioned_seats = cfg["sections"] * section_size  # Exact NCVT multiple (20, 24, or 40)

            prev_clean_postings: float | None = None
            backlog_running = float(cfg["backlog_base"])

            for m_idx, month_str in enumerate(months):
                # Seasonal wave (industrial hiring peaks in Q1/Q4, monsoon dip in Jul-Aug)
                cal_month = int(month_str.split("-")[1])
                seasonal_factor = 1.0 + 0.08 * math.sin((cal_month - 2) * (2 * math.pi / 12.0))

                # Organic trend before shock
                organic_trend = 1.0 + (0.006 * m_idx) if occ["market_status"] != "CHRONIC_OVERSUPPLY" else (1.0 - 0.005 * m_idx)

                # Shock calculation starting at T-12m (index 23 -> 2025-10)
                shock_add = 0.0
                is_shock_window = False
                shock_start = cfg["shock_start_idx"]
                if shock_start is not None and m_idx >= shock_start:
                    is_shock_window = True
                    months_into_shock = m_idx - shock_start  # 0 at 2025-10, 12 at 2026-10
                    # S-curve ramp up from 2025-10 to 2026-10 so Time-Travel Replay shows a realistic surge
                    ramp = 0.42 + 0.58 * (1.0 - math.exp(-0.32 * (months_into_shock + 1)))
                    shock_add = cfg["shock_Clean_Boost"] * ramp

                noise = rng.uniform(-2.2, 2.2)
                clean_postings_float = max(
                    4.0,
                    (cfg["base_clean_postings"] * organic_trend * seasonal_factor) + shock_add + noise,
                )
                clean_postings = int(round(clean_postings_float))

                # Raw postings include duplicates (~18.4%) and stale (~11.2%)
                raw_multiplier = 1.38 + rng.uniform(-0.03, 0.03)
                raw_postings = int(round(clean_postings * raw_multiplier))

                if prev_clean_postings is None or prev_clean_postings == 0:
                    velocity_mom = 0.02
                else:
                    velocity_mom = round((clean_postings - prev_clean_postings) / prev_clean_postings, 4)
                prev_clean_postings = float(clean_postings)

                pi_tier = cfg["pi_tier"]
                estimated_total_demand = int(round(clean_postings / pi_tier))

                # Wages with mild inflation + shock premium
                wage_growth = 1.0 + 0.0025 * m_idx + (0.045 if (is_shock_window and shock_add > 40) else 0.0)
                offered_wage = int(round((cfg["offered_wage"] * wage_growth) / 100.0) * 100)
                gig_wage = int(
                    round((district["local_gig_wage_base_inr"] * (1.0 + 0.0028 * m_idx)) / 100.0) * 100
                )
                wage_ratio = round(offered_wage / max(1, gig_wage), 3)

                # 6-Stage Supply Pipeline (annualized seat matrix & monthly cohort graduation/retention flow)
                fill_rate = cfg["enrolment_fill_rate"]
                actual_enrolments = int(round(sanctioned_seats * fill_rate))
                phantom_capacity_rate = round(1.0 - (actual_enrolments / max(1, sanctioned_seats)), 4)

                completions = int(round(actual_enrolments * cfg["completion_rate"]))
                certifications = int(round(completions * cfg["certification_rate"]))
                entered_employment = int(round(certifications * cfg["employment_conversion"]))
                retained_6m = int(round(entered_employment * cfg["retention_6m_rate"]))

                # Monthly effective supply flow (graduating/retained cohort flow per month)
                net_monthly_supply = max(2, int(round(retained_6m / 4.0)))
                unplaced_this_month = max(0, int(round((certifications - entered_employment) / 12.0)))
                absorbed_from_backlog = int(round(backlog_running * (0.06 if is_shock_window else 0.025)))
                backlog_running = max(
                    4.0, backlog_running + unplaced_this_month - absorbed_from_backlog
                )
                unplaced_backlog_stock = int(round(backlog_running))

                monthly_net_gap = estimated_total_demand - net_monthly_supply

                record_id = f"obs_{d_id}_{o_id}_{month_str}"
                observations.append(
                    {
                        "record_id": record_id,
                        "month": month_str,
                        "district_id": d_id,
                        "district_name": district["district_name"],
                        "occupation_id": o_id,
                        "occupation_name": occ["occupation_name"],
                        "nco_code": occ["nco_code"],
                        "nsqf_level": occ["nsqf_level"],
                        "sector": occ["sector"],
                        "section_size": section_size,
                        "raw_postings": raw_postings,
                        "deduplicated_clean_postings": clean_postings,
                        "posting_velocity_mom": velocity_mom,
                        "plfs_capture_rate_pi_tier": pi_tier,
                        "estimated_total_demand": estimated_total_demand,
                        "offered_trade_wage_inr": offered_wage,
                        "local_alternative_gig_wage_inr": gig_wage,
                        "wage_competitiveness_ratio": wage_ratio,
                        "confidence_tier": cfg["confidence_tier"],
                        "eb_shrinkage_weight": cfg["eb_weight"],
                        "sanctioned_seats": sanctioned_seats,
                        "actual_enrolments": actual_enrolments,
                        "phantom_capacity_rate": phantom_capacity_rate,
                        "completions": completions,
                        "certifications": certifications,
                        "entered_employment": entered_employment,
                        "retained_6m": retained_6m,
                        "unplaced_backlog_stock": unplaced_backlog_stock,
                        "net_monthly_supply": net_monthly_supply,
                        "monthly_net_gap": monthly_net_gap,
                        "is_shock_window": is_shock_window,
                        "real_or_synthetic": "SYNTHETIC_PILOT_FEED",
                    }
                )

    return observations


def main() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    FRONTEND_DATA_DIR.mkdir(parents=True, exist_ok=True)

    data_sources = build_data_sources()
    skill_genome = build_skill_genome()
    observations = build_timeseries_observations()

    metadata_payload = {
        "generated_at": "2026-10-20T00:00:00Z",
        "brand": "SkillAlign",
        "state_name": "Madhya Pradesh",
        "state_code": "MP",
        "months": generate_months(),
        "shock_month": "2025-10",
        "current_month": "2026-10",
        "districts": DISTRICTS,
        "iti_campuses": ITI_CAMPUSES,
        "occupations": OCCUPATIONS,
        "sectors": [
            "Green Energy & Electrical",
            "Automotive & EV",
            "Capital Goods & Manufacturing",
            "IT-ITeS & Digital",
        ],
    }

    # Write JSON files to /data/processed/
    with open(PROCESSED_DIR / "data_sources.json", "w", encoding="utf-8") as f:
        json.dump(data_sources, f, indent=2)

    with open(PROCESSED_DIR / "skill_genome.json", "w", encoding="utf-8") as f:
        json.dump(skill_genome, f, indent=2)

    with open(PROCESSED_DIR / "timeseries_observations.json", "w", encoding="utf-8") as f:
        json.dump(
            {
                "generated_at": "2026-10-20T00:00:00Z",
                "brand": "SkillAlign",
                "state": "Madhya Pradesh",
                "window_start": "2023-11",
                "window_end": "2026-10",
                "shock_injection_month": "2025-10",
                "total_records": len(observations),
                "metadata": metadata_payload,
                "observations": observations,
            },
            f,
            indent=2,
        )

    # Also write CSV to /data/processed/timeseries_observations.csv
    if observations:
        fieldnames = list(observations[0].keys())
        with open(
            PROCESSED_DIR / "timeseries_observations.csv", "w", newline="", encoding="utf-8"
        ) as csv_file:
            writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(observations)

    # Sync JSON files to /frontend/src/data/ for instant offline fallback in client.ts
    for fname in ["data_sources.json", "skill_genome.json", "timeseries_observations.json"]:
        src_path = PROCESSED_DIR / fname
        dst_path = FRONTEND_DATA_DIR / fname
        dst_path.write_text(src_path.read_text(encoding="utf-8"), encoding="utf-8")

    print(f"[SkillAlign Seed Generator] Successfully generated:")
    print(f"  - {PROCESSED_DIR / 'data_sources.json'} ({len(data_sources['sources'])} sources)")
    print(
        f"  - {PROCESSED_DIR / 'skill_genome.json'} "
        f"({len(skill_genome['occupations'])} occupations, {len(skill_genome['skillbridge_pathways'])} SkillBridge pathways)"
    )
    print(
        f"  - {PROCESSED_DIR / 'timeseries_observations.json'} ({len(observations)} monthly district x occupation records)"
    )
    print(f"  - {PROCESSED_DIR / 'timeseries_observations.csv'} ({len(observations)} rows)")
    print(f"  - Synced fallback seed files to {FRONTEND_DATA_DIR}")


if __name__ == "__main__":
    main()
