"""
step5_screening.py
==================
Step 5: Aggregation, Administrative Screening & Boundaries

Technical Functionality:
  1. Capacity Classification:
       - Pico-Hydro: < 5 kW (filtered out as sub-utility)
       - Micro-Hydro: 5 kW to 100 kW (community village mini-grids)
       - Mini-Hydro: 100 kW to 1 MW (tributary cascades)
       - Small/Medium RoR: > 1 MW (grid-connected commercial corridors)
  2. Administrative Masking & Palika Allocation:
       Clipped to the official boundary polygon of Gulmi District; each reach
       is attributed with its host municipality (Palika).
  3. Boundary River Apportionment:
       Kaligandaki & Badigad form district borders with Syangja, Baglung, and Palpa.
       Border river reaches (A >= 200 km²) receive a 50% apportionment factor (0.50 * Q)
       to avoid double-counting shared river potential.
  4. Viability & Hazard Screening:
       - Cultural Exclusion: 1.5 km protection buffer around holy Ridi Dham / Rudrabeni.
       - Slope & Head Filter: Reaches with bed slope < 2.0% or H_gross < 5.0m excluded for micro-hydro.

How to reproduce this step in desktop QGIS:
  - Vector $\to$ Geoprocessing Tools $\to$ Clip (Input: reaches, Overlay: Gulmi polygon).
  - Join Attributes by Location (Input: reaches, Join: Palika boundaries).
  - Select by Expression: "P_inst_kW" >= 5 AND "slope_pct" >= 2.0 AND distance to Ridi > 1500.
"""

import json
import numpy as np
import pandas as pd
from shapely.geometry import shape, Point

# Coordinates of sacred Ridi confluence
RIDI_LON, RIDI_LAT = 83.433, 27.950


def apply_spatial_screening(
    reaches_df: pd.DataFrame,
    palika_geojson_path: str,
    border_apportion_factor: float = 0.50,
    min_slope_pct: float = 2.0,
    min_head_m: float = 5.0,
    cultural_buffer_km: float = 1.5
) -> tuple[pd.DataFrame, list[dict]]:
    """
    Performs administrative clipping, boundary river apportionment, and viability filtering.

    Parameters:
      reaches_df: DataFrame from Step 4 with P_inst_kW, mid_lon, mid_lat.
      palika_geojson_path: Path to local levels GeoJSON.
      border_apportion_factor: Apportionment factor for shared border rivers (default 0.50 = 50%).
      min_slope_pct: Minimum bed slope for viable micro-hydro (default 2.0%).
      min_head_m: Minimum head required if slope is below threshold (default 5.0m).
      cultural_buffer_km: Exclusion radius around Ridi Dham pilgrimage confluence (km).

    Returns:
      tuple: (screened_reaches_df, palika_summary_list)
    """
    print(f"--> [Step 5] Applying Administrative Masking & Multi-Criteria Screening...")
    with open(palika_geojson_path, "r") as f:
        palika_data = json.load(f)

    palikas = []
    for feat in palika_data["features"]:
        p_shape = shape(feat["geometry"])
        p_name = feat["properties"].get("name") or feat["properties"].get("GaPa_Na")
        palikas.append({"name": p_name, "geometry": p_shape})

    # Metric conversion for buffer distance
    m_per_deg_lat = 111320.0
    m_per_deg_lon = 111320.0 * np.cos(np.radians(28.1))

    clipped_records = []
    for _, row in reaches_df.iterrows():
        lon = float(row["mid_lon"])
        lat = float(row["mid_lat"])
        pt = Point(lon, lat)

        # 1. Point-in-polygon check for Palika
        assigned_palika = None
        for p in palikas:
            if p["geometry"].contains(pt):
                assigned_palika = p["name"]
                break

        if assigned_palika is None:
            continue  # Outside district boundary

        # 2. Boundary River Apportionment
        A_d = float(row["A_d_km2"])
        is_border = (A_d >= 200.0)
        apportion = border_apportion_factor if is_border else 1.0

        # Adjust power and energy if border apportionment applies
        P_inst = round(float(row["P_inst_kW"]) * apportion, 2)
        E_annual = round(float(row["annual_energy_MWh"]) * apportion, 2)
        E_dry = round(float(row["dry_energy_MWh"]) * apportion, 2)
        E_wet = round(float(row["wet_energy_MWh"]) * apportion, 2)

        # 3. Capacity Classification
        if P_inst < 5.0:
            cap_class = "Pico (<5 kW)"
        elif P_inst < 100.0:
            cap_class = "Micro (5-100 kW)"
        elif P_inst < 1000.0:
            cap_class = "Mini (100-1000 kW)"
        else:
            cap_class = "Small/Medium RoR (>1 MW)"

        # 4. Cultural Buffer (Ridi Dham)
        dist_to_ridi_km = np.sqrt(((lon - RIDI_LON) * m_per_deg_lon) ** 2 + ((lat - RIDI_LAT) * m_per_deg_lat) ** 2) / 1000.0
        is_cultural_excluded = (dist_to_ridi_km < cultural_buffer_km)

        # 5. Slope Viability
        slope = float(row["slope_pct"])
        head = float(row["H_gross_m"])
        is_slope_viable = (slope >= min_slope_pct or head >= min_head_m)

        is_screened_viable = (not is_cultural_excluded) and is_slope_viable and (P_inst >= 5.0)

        row_dict = row.to_dict()
        row_dict.update({
            "palika": assigned_palika,
            "is_border_river": int(is_border),
            "apportion_factor": apportion,
            "P_inst_kW": P_inst,
            "annual_energy_MWh": E_annual,
            "dry_energy_MWh": E_dry,
            "wet_energy_MWh": E_wet,
            "capacity_class": cap_class,
            "cultural_excluded": int(is_cultural_excluded),
            "slope_viable": int(is_slope_viable),
            "screened_viable": int(is_screened_viable)
        })
        clipped_records.append(row_dict)

    screened_df = pd.DataFrame(clipped_records)
    print(f"    Reaches inside District: {len(screened_df):,}")
    print(f"    Screened Viable Reaches: {(screened_df['screened_viable'] == 1).sum():,}")

    # Aggregate by Palika
    palika_summary = []
    for p_name in sorted(screened_df["palika"].unique()):
        p_df = screened_df[screened_df["palika"] == p_name]
        p_viable = p_df[p_df["screened_viable"] == 1]

        palika_summary.append({
            "palika": p_name,
            "total_reaches": len(p_df),
            "screened_viable_reaches": len(p_viable),
            "total_stream_length_km": round(p_df["length_m"].sum() / 1000.0, 1),
            "total_installed_capacity_MW": round(p_viable["P_inst_kW"].sum() / 1000.0, 2),
            "annual_energy_GWh": round(p_viable["annual_energy_MWh"].sum() / 1000.0, 2),
            "dry_season_energy_GWh": round(p_viable["dry_energy_MWh"].sum() / 1000.0, 2),
            "wet_season_energy_GWh": round(p_viable["wet_energy_MWh"].sum() / 1000.0, 2),
            "micro_count": int((p_viable["capacity_class"] == "Micro (5-100 kW)").sum()),
            "mini_count": int((p_viable["capacity_class"] == "Mini (100-1000 kW)").sum()),
            "ror_count": int((p_viable["capacity_class"] == "Small/Medium RoR (>1 MW)").sum())
        })

    return screened_df, palika_summary
