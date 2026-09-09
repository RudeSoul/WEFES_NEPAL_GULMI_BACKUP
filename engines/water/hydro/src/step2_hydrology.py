"""
step2_hydrology.py
==================
Step 2: Hydrological Estimation for Ungauged Catchments

Technical Functionality:
  Method A: WECS/NEA (1997) & MIP Regional Hydrology Method
    - Used for ungauged tributaries and mountain streams (catchment area < 200 km²).
    - Long-term mean monthly flows (Q1..Q12) and quantiles (Q40, Q65, Q80, Q90) derived
      from catchment area (A) and Monsoon Wetness Index (MWI).
    - For Region 3 (Western Mid-Hills / Gulmi), standard MWI = 1,600 mm.
  
  Method B: Area-Ratio Gauge Transfer Scaling
    - Used for major river stems (catchment area >= 200 km², e.g., Badigad, Kaligandaki).
    - Scaled from permanent hydrometric stations:
        Q_reach = Q_gauge * (A_reach / A_gauge)^0.85
      DHM Station 430 (Badigad at Rudrabeni, A = 2,140 km², Qmean = 68.5 m³/s).

How to reproduce this step in desktop QGIS:
  - Open Attribute Table of reach vector layer.
  - Open Field Calculator ('Ctrl + E' / 'Cmd + E').
  - Calculate Q_mean: 0.024 * ("A_d_km2"^0.98) * (1.6^1.10)
  - Calculate Q40: 0.0165 * ("A_d_km2"^0.99) * (1.6^1.05)
  - Calculate Q65: 0.0088 * ("A_d_km2"^1.01) * (1.6^0.95)
  - Calculate Q90: 0.0038 * ("A_d_km2"^1.04) * (1.6^0.85)
"""

import pandas as pd

MONTH_WEIGHTS = {
    "jan": 0.22, "feb": 0.20, "mar": 0.22, "apr": 0.30,
    "may": 0.55, "jun": 1.75, "jul": 3.40, "aug": 3.65,
    "sep": 2.10, "oct": 0.95, "nov": 0.42, "dec": 0.26
}


def run_hydrological_estimation(
    reaches_df: pd.DataFrame,
    mwi: float = 1600.0,
    gauge_area_km2: float = 2140.0,
    gauge_qmean: float = 68.5,
    gauge_q40: float = 42.0,
    gauge_q65: float = 21.0,
    gauge_q80: float = 13.5,
    gauge_q90: float = 9.5,
    gauge_transfer_threshold_km2: float = 200.0
) -> pd.DataFrame:
    """
    Computes design discharges, flow duration curve quantiles (Q40, Q65, Q80, Q90),
    and 12-month hydrographs for every stream reach.

    Parameters:
      reaches_df: DataFrame from Step 1 containing A_d_km2.
      mwi: Monsoon Wetness Index in mm (default 1600 mm for Western Mid-Hills).
      gauge_area_km2: Drainage area of reference DHM gauge (Station 430 Badigad).
      gauge_qmean: Long-term mean annual discharge at reference gauge (m³/s).
      gauge_q40..q90: Flow exceedance quantiles at reference gauge.
      gauge_transfer_threshold_km2: Area threshold above which gauge scaling is used.

    Returns:
      pd.DataFrame: Reaches enriched with Q_mean, Q40, Q65, Q80, Q90, and Q_jan..Q_dec.
    """
    print(f"--> [Step 2] Computing Hydrological Discharges (WECS/NEA & Gauge Scaling)...")
    mwi_factor = (mwi / 1000.0)

    results = []
    for _, row in reaches_df.iterrows():
        A = max(0.1, float(row["A_d_km2"]))

        if A >= gauge_transfer_threshold_km2:
            method = "GAUGE_TRANSFER_DHM"
            ratio = (A / gauge_area_km2) ** 0.85
            q_mean = gauge_qmean * ratio
            q40    = gauge_q40 * ratio
            q65    = gauge_q65 * ratio
            q80    = gauge_q80 * ratio
            q90    = gauge_q90 * ratio
        else:
            method = "WECS_NEA_MIP"
            # WECS/NEA 1997 Regional Regression Equations (Region 3 - Middle Mountains)
            q_mean = 0.024 * (A ** 0.98) * (mwi_factor ** 1.10)
            q40    = 0.0165 * (A ** 0.99) * (mwi_factor ** 1.05)
            q65    = 0.0088 * (A ** 1.01) * (mwi_factor ** 0.95)
            q80    = 0.0052 * (A ** 1.03) * (mwi_factor ** 0.88)
            q90    = 0.0038 * (A ** 1.04) * (mwi_factor ** 0.85)

        q_record = {
            "hydro_method": method,
            "Q_mean_m3s": round(q_mean, 4),
            "Q40_m3s": round(q40, 4),
            "Q65_m3s": round(q65, 4),
            "Q80_m3s": round(q80, 4),
            "Q90_m3s": round(q90, 4),
        }
        for month, weight in MONTH_WEIGHTS.items():
            q_record[f"Q_{month}_m3s"] = round(q_mean * weight, 4)

        results.append(q_record)

    hydro_df = pd.DataFrame(results)
    enriched_df = pd.concat([reaches_df.reset_index(drop=True), hydro_df], axis=1)
    print(f"    Hydrology modeled for {len(enriched_df):,} reaches.")
    return enriched_df
