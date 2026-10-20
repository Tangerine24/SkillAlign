"""
SkillAlign — Data Store & Caching Service (/backend/services/data_store.py)
Loads, indexes, and provides fast in-memory access to processed pilot datasets:
- timeseries_observations.json (36 months x 5 districts x 6 occupations = 1080 records)
- skill_genome.json (occupations, NOS competency nodes, emerging skills, SkillBridge pathways)
- data_sources.json (provenance feeds and auditing metadata)
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
PROCESSED_DIR = ROOT_DIR / "data" / "processed"

# In-memory caches
_CACHED_TIMESERIES: Optional[Dict[str, Any]] = None
_CACHED_GENOME: Optional[Dict[str, Any]] = None
_CACHED_SOURCES: Optional[Dict[str, Any]] = None


def load_json(filename: str) -> Dict[str, Any]:
    path = PROCESSED_DIR / filename
    if not path.exists():
        raise FileNotFoundError(
            f"Processed data file {filename} not found at {path}. "
            "Ensure data/seed_generator.py has been executed."
        )
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_timeseries_data() -> Dict[str, Any]:
    global _CACHED_TIMESERIES
    if _CACHED_TIMESERIES is None:
        _CACHED_TIMESERIES = load_json("timeseries_observations.json")
    return _CACHED_TIMESERIES


def get_genome_data() -> Dict[str, Any]:
    global _CACHED_GENOME
    if _CACHED_GENOME is None:
        _CACHED_GENOME = load_json("skill_genome.json")
    return _CACHED_GENOME


def get_sources_data() -> Dict[str, Any]:
    global _CACHED_SOURCES
    if _CACHED_SOURCES is None:
        _CACHED_SOURCES = load_json("data_sources.json")
    return _CACHED_SOURCES


def get_districts() -> List[Dict[str, Any]]:
    ts = get_timeseries_data()
    return ts["metadata"]["districts"]


def get_district_by_id(district_id: str) -> Optional[Dict[str, Any]]:
    for d in get_districts():
        if d["district_id"].lower() == district_id.lower():
            return d
    return None


def get_occupations() -> List[Dict[str, Any]]:
    ts = get_timeseries_data()
    return ts["metadata"]["occupations"]


def get_occupation_by_id(occ_id: str) -> Optional[Dict[str, Any]]:
    for o in get_occupations():
        if o["occupation_id"].lower() == occ_id.lower() or o["nco_code"] == occ_id:
            return o
    return None


def get_observations(
    month: Optional[str] = None,
    district_id: Optional[str] = None,
    occupation_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    ts = get_timeseries_data()
    obs = ts["observations"]
    if month is not None:
        obs = [o for o in obs if o["month"] == month]
    if district_id is not None:
        obs = [o for o in obs if o["district_id"].lower() == district_id.lower()]
    if occupation_id is not None:
        obs = [o for o in obs if o["occupation_id"].lower() == occupation_id.lower() or o["nco_code"] == occupation_id]
    return obs


def get_latest_observation(district_id: str, occupation_id: str, as_of_month: str = "2026-10") -> Optional[Dict[str, Any]]:
    obs = get_observations(month=as_of_month, district_id=district_id, occupation_id=occupation_id)
    if obs:
        return obs[0]
    # Fallback to latest available for district + occupation
    all_obs = get_observations(district_id=district_id, occupation_id=occupation_id)
    if all_obs:
        return sorted(all_obs, key=lambda x: x["month"])[-1]
    return None


def get_occupation_genome(occ_id_or_nco: str) -> Optional[Dict[str, Any]]:
    genome = get_genome_data()
    for occ in genome.get("occupations", []):
        if occ["occupation_id"].lower() == occ_id_or_nco.lower() or occ["nco_code"] == occ_id_or_nco:
            return occ
    return None


def get_pathways(
    district_id: Optional[str] = None,
    source_id: Optional[str] = None,
    target_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    genome = get_genome_data()
    pathways = list(genome.get("skillbridge_pathways", []))
    if source_id is not None:
        pathways = [p for p in pathways if p["source_occupation_id"].lower() == source_id.lower() or p["source_nco_code"] == source_id]
    if target_id is not None:
        pathways = [p for p in pathways if p["target_occupation_id"].lower() == target_id.lower() or p["target_nco_code"] == target_id]
    
    # If district_id is provided, dynamically bind the available_donor_pool based on the district's unplaced_backlog_stock
    if district_id:
        enriched_pathways = []
        for p in pathways:
            p_copy = dict(p)
            donor_obs = get_latest_observation(district_id, p["source_occupation_id"])
            if donor_obs:
                p_copy["available_donor_pool"] = donor_obs.get("unplaced_backlog_stock", p.get("available_donor_pool", 50))
            enriched_pathways.append(p_copy)
        return enriched_pathways
    return pathways
