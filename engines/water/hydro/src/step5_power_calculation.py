# [DATA PROVENANCE]
# Data Source: Topographic reach attributes from Step 4
# Classification: CALCULATED ENERGY BASELINE & HYDROPOWER POTENTIAL
# Citations: British Hydropower Association (BHA) & International Hydropower Association (IHA)

"""
step5_power_calculation.py
==========================
STEP 9. CALCULATE POWER OUTPUT: 
   - Compute Gross Head (H) as (Z_Head - Z_Tail).
   - Estimate Design Discharge (Q) in m³/s using an area-to-runoff approximation based
     on the flow accumulation cell count and a customizable localized runoff factor.
   - Apply the standard Hydropower Potential Formula: Power (kW) = g * Q * H * η
   
[Code Comment Citation]: British Hydropower Association (BHA) / International Hydropower Association (IHA) guidelines. Enforce g = 9.81 m/s² and a default total system efficiency (η) of 0.70.

District Reusability Note:
--------------------------
Hydropower potential relies on two variables: Gross Head (m) and Design Discharge (m³/s).
The localized runoff factor (m³/(s·km²)) allows immediate tuning for different district
rainfall regimes:
  • Wet Monsoon Hill Districts (e.g. Kaski, Gulmi, Syangja): ~0.030 to 0.040 m³/(s·km²)
  • Eastern Middle Hills (e.g. Ilam, Sankhuwasabha): ~0.035 to 0.045 m³/(s·km²)
  • Rain Shadow / High Himalayan Districts (e.g. Mustang, Manang): ~0.010 to 0.020 m³/(s·km²)
  • Southern Terai Flatlands (e.g. Jhapa, Rupandehi): ~0.025 to 0.030 m³/(s·km²)
"""

from __future__ import annotations

from typing import List, Dict, Any


def calculate_hydropower_potential(
    reaches: List[Dict[str, Any]],
    runoff_factor: float = 0.032,
    efficiency: float = 0.70,
    head_loss_factor: float = 0.90,
    capacity_factor: float = 0.60
) -> List[Dict[str, Any]]:
    """
    Computes design discharge, net head, power potential (kW), and annual energy yield (MWh/yr).
    
    [Code Comment Citation]: British Hydropower Association (BHA) / International Hydropower Association (IHA) guidelines. Enforce g = 9.81 m/s² and a default total system efficiency (η) of 0.70.
    
    Parameters:
        reaches: List of reach dictionaries from Step 4.
        runoff_factor: Specific runoff rate in m³/(s·km²) to convert catchment area to design discharge.
        efficiency: Total electromechanical efficiency η (enforced standard: 0.70).
        head_loss_factor: Friction/trash rack head preservation factor (default: 0.90 = 10% head loss).
        capacity_factor: Annual plant load factor (default: 0.60).
        
    Returns:
        List of enriched reaches with discharge_m3s, net_head_m, power_kw, and annual_energy_mwh.
    """
    print(f"--> [STEP 9: CALCULATE POWER OUTPUT] Evaluating Hydropower Potential (BHA/IHA Standard)...")
    print(f"    Parameters: Runoff Factor = {runoff_factor:.4f} m³/(s·km²), Efficiency (η) = {efficiency:.2f}, g = 9.81 m/s²")
    
    g = 9.81  # Standard acceleration due to gravity in m/s²
    enriched_reaches: List[Dict[str, Any]] = []

    total_potential_kw = 0.0

    for r in reaches:
        z_head = float(r["z_head_m"])
        z_tail = float(r["z_tail_m"])
        
        # 1. Gross Head (H) = Z_Head - Z_Tail
        gross_head = max(0.0, z_head - z_tail)
        net_head = max(0.0, gross_head * head_loss_factor)

        # 2. Design Discharge (Q) in m³/s via area-to-runoff approximation
        catchment_area_km2 = float(r["catchment_km2"])
        discharge_q = max(0.001, catchment_area_km2 * runoff_factor)

        # 3. Standard Hydropower Potential Formula: Power (kW) = g * Q * H * η
        # [Code Comment Citation]: British Hydropower Association (BHA) / International Hydropower Association (IHA) guidelines.
        power_kw = g * discharge_q * gross_head * efficiency if gross_head > 0.0 else 0.0

        # 4. Annual Energy Simulation (MWh/yr)
        annual_energy_mwh = (power_kw * 8760.0 * capacity_factor) / 1000.0

        total_potential_kw += power_kw

        record = dict(r)
        record.update({
            "gross_head_m": round(gross_head, 2),
            "net_head_m": round(net_head, 2),
            "discharge_m3s": round(discharge_q, 4),
            "power_potential_kw": round(power_kw, 2),
            "power_potential_mw": round(power_kw / 1000.0, 3),
            "annual_energy_mwh": round(annual_energy_mwh, 2),
            "system_efficiency": efficiency,
            "runoff_factor_used": runoff_factor
        })
        enriched_reaches.append(record)

    total_mw = total_potential_kw / 1000.0
    print(f"    Calculation complete across {len(enriched_reaches):,} reaches.")
    print(f"    District Aggregate Theoretical Capacity: {total_mw:,.2f} MW ({total_potential_kw:,.1f} kW)")
    return enriched_reaches
