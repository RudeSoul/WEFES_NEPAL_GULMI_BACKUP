"""
step4_energy.py
===============
Step 4: Power and Monthly Energy Simulation

Technical Functionality:
  1. Net Head:
     Accounts for ~10% hydraulic losses in trash racks, canals, and penstock friction:
       H_net = 0.90 * H_gross
  2. Theoretical / Installed Capacity (kW):
       P_inst (kW) = 9.81 * eta * Q_net * H_net
     where 9.81 kN/m³ is the specific weight of water (gamma = rho * g).
  3. 12-Month Energy Simulation:
     For each month m in [1..12]:
       Q_avail,m = min( max(0, Q_m - Q_env), Q_design )
       P_m (kW)  = 9.81 * eta * Q_avail,m * H_net
       E_m (MWh) = P_m * Hours_in_month / 1000.0
     Summed into:
       Dry-Season Energy (Dec–May): winter lean flow generation (~28% of annual).
       Wet-Season Energy (Jun–Nov): monsoon peak generation (~72% of annual).

How to reproduce this step in desktop QGIS:
  - In Field Calculator:
    H_net = 0.90 * "H_gross_m"
    P_inst_kW = 9.81 * "eta" * "Q_net_m3s" * "H_net"
    E_annual_MWh = sum of monthly energy fields.
"""

import pandas as pd

MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
MONTH_HOURS = [d * 24 for d in MONTH_DAYS]
MONTH_NAMES = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]


def simulate_energy_yield(
    reaches_df: pd.DataFrame,
    head_loss_factor: float = 0.90
) -> pd.DataFrame:
    """
    Computes installed capacity (kW) and 12-month energy generation (MWh) for every reach.

    Parameters:
      reaches_df: DataFrame from Step 3 with Q_net_m3s, Q_env_m3s, eta, and H_gross_m.
      head_loss_factor: Ratio of gross head preserved as net head (default 0.90 = 10% head loss).

    Returns:
      pd.DataFrame: Reaches with H_net_m, P_inst_kW, annual_energy_MWh, dry_energy_MWh, wet_energy_MWh,
                    and monthly generation fields (E_jan..E_dec).
    """
    print(f"--> [Step 4] Simulating Power Capacity & 12-Month Energy Yields...")
    records = []

    for _, row in reaches_df.iterrows():
        H_gross = max(0.0, float(row["H_gross_m"]))
        H_net = round(head_loss_factor * H_gross, 1)

        eta = float(row["eta"])
        Q_net = float(row["Q_net_m3s"])
        Q_env = float(row["Q_env_m3s"])
        Q_design = float(row["Q_design_m3s"])

        # Installed power capacity (kW)
        P_inst_kW = round(9.81 * eta * Q_net * H_net, 2) if H_net > 0 else 0.0

        # Monthly simulation
        monthly_mwh = {}
        e_list = []
        for idx, month in enumerate(MONTH_NAMES):
            q_m = float(row[f"Q_{month}_m3s"])
            q_avail = min(max(0.0, q_m - Q_env), Q_design)
            p_m_kw = 9.81 * eta * q_avail * H_net
            e_m = (p_m_kw * MONTH_HOURS[idx]) / 1000.0
            monthly_mwh[f"E_{month}_MWh"] = round(e_m, 2)
            e_list.append(e_m)

        # Dry energy: Dec(11), Jan(0), Feb(1), Mar(2), Apr(3), May(4)
        dry_energy_mwh = sum(e_list[i] for i in [11, 0, 1, 2, 3, 4])
        # Wet energy: Jun(5), Jul(6), Aug(7), Sep(8), Oct(9), Nov(10)
        wet_energy_mwh = sum(e_list[i] for i in [5, 6, 7, 8, 9, 10])
        annual_energy_mwh = sum(e_list)

        records.append({
            "H_net_m": H_net,
            "P_inst_kW": P_inst_kW,
            "annual_energy_MWh": round(annual_energy_mwh, 2),
            "dry_energy_MWh": round(dry_energy_mwh, 2),
            "wet_energy_MWh": round(wet_energy_mwh, 2),
            **monthly_mwh
        })

    energy_df = pd.DataFrame(records)
    out_df = pd.concat([reaches_df.reset_index(drop=True), energy_df], axis=1)
    print(f"    Simulated generation: {out_df['annual_energy_MWh'].sum() / 1000.0:,.1f} GWh/yr across {len(out_df):,} reaches.")
    return out_df
