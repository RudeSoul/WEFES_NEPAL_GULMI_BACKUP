"""
step3_constraints.py
====================
Step 3: Design Discharge & Environmental Constraints

Technical Functionality:
  1. DOED Environmental Flow (Q_env):
     By Nepal Department of Electricity Development policy, at least 10% of the
     minimum monthly dry-season flow must remain in the natural riverbed:
       Q_env = 0.10 * min(Q_jan..Q_dec)
       Q_net = max(0, Q_design - Q_env)
  2. Scale-Dependent Design Exceedance (Q_design):
     - Commercial Run-of-River (>= 10 km²): Q_design = Q40 (wet-season peak grid export).
     - Rural Micro-Hydro (< 10 km²): Q_design = Q65 (reliable dry-season base load).

How to reproduce this step in desktop QGIS:
  - In Field Calculator:
    Q_min = min("Q_jan_m3s", "Q_feb_m3s", "Q_mar_m3s", "Q_apr_m3s", "Q_dec_m3s")
    Q_env = 0.10 * Q_min
    Q_design = CASE WHEN "is_ror" = 1 THEN "Q40_m3s" ELSE "Q65_m3s" END
    Q_net = max(0, "Q_design" - "Q_env")
"""

import pandas as pd

MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]


def apply_environmental_flows(
    reaches_df: pd.DataFrame,
    env_flow_ratio: float = 0.10,
    ror_efficiency: float = 0.82,
    micro_efficiency: float = 0.65
) -> pd.DataFrame:
    """
    Applies DOED E-flow statutory deductions and assigns project design discharges and efficiencies.

    Parameters:
      reaches_df: DataFrame from Step 2 containing monthly discharges.
      env_flow_ratio: Fraction of lean dry-season flow reserved for ecology (default 0.10 = 10%).
      ror_efficiency: Combined turbine-generator efficiency for RoR (default 0.82).
      micro_efficiency: Efficiency for micro-hydro with local transmission losses (default 0.65).

    Returns:
      pd.DataFrame: Reaches with Q_env_m3s, Q_design_m3s, Q_net_m3s, eta, and scale_type.
    """
    print(f"--> [Step 3] Applying DOED Environmental Flow Constraints (10% Minimum)...")
    records = []

    for _, row in reaches_df.iterrows():
        # Minimum monthly flow
        q_monthly_vals = [float(row[f"Q_{m}_m3s"]) for m in MONTHS]
        q_min_month = min(q_monthly_vals)

        # Environmental flow reservation
        q_env = env_flow_ratio * q_min_month

        is_ror = (int(row["is_ror"]) == 1)
        if is_ror:
            q_design = float(row["Q40_m3s"])
            eta = ror_efficiency
            scale_type = "Commercial RoR (>1 MW)"
        else:
            q_design = float(row["Q65_m3s"])
            eta = micro_efficiency
            scale_type = "Micro/Mini Hydro (<1 MW)"

        q_net = max(0.0, q_design - q_env)

        records.append({
            "Q_env_m3s": round(q_env, 4),
            "Q_design_m3s": round(q_design, 4),
            "Q_net_m3s": round(q_net, 4),
            "eta": eta,
            "scale_type": scale_type
        })

    constraints_df = pd.DataFrame(records)
    out_df = pd.concat([reaches_df.reset_index(drop=True), constraints_df], axis=1)
    print(f"    Assigned design discharges and E-flows for {len(out_df):,} reaches.")
    return out_df
