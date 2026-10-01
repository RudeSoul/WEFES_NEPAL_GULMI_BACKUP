# [DATA PROVENANCE]
# Data Source: Topographic reach attributes from Step 4 & District boundary vectors (GeoJSON/Shapefile)
# Classification: CALCULATED ENERGY BASELINE & HYDROPOWER POTENTIAL
# Citations: British Hydropower Association (BHA) & International Hydropower Association (IHA); Survey Department of Nepal

"""
step5_power_calculation.py
==========================
STEP 9. CALCULATE POWER OUTPUT:
   - Compute Gross Head (H_gross = Z_upstream - Z_downstream).
   - Apply head loss factor to derive Net Head (H_net = H_gross * head_loss_factor).
   - Estimate Specific Discharge (Q_gross) in m³/s using contributing catchment area
     at the reach downstream endpoint scaled by local specific discharge (m³/s/km²).
   - Deduct residual environmental flow (Q_turb = Q_gross * (1 - env_flow_fraction)).
   - Apply the standard Hydropower Equation: Power (kW) = g * Q_turb * H_net * η
   
[Code Comment Citation]: British Hydropower Association (BHA) / International Hydropower Association (IHA) guidelines.
Enforces g = 9.81 m/s², Net Head H_net, and total electromechanical efficiency η (default: 0.70).

CRITICAL SCIENTIFIC & PLANNING DISCLOSURES:
-------------------------------------------
1. Screening-Level Theoretical Assessment:
   This engine calculates screening-level Gross Theoretical Reach Potential (GTRP).
   Consecutive reaches along the same river trunk share and compete for the same discharge.
   Therefore, aggregate district capacity is a theoretical ceiling of available kinetic energy,
   NOT the sum of independently developable cascade power plants.
2. Catchment vs. Administrative Boundary:
   Hydrological drainage basins do not adhere to administrative borders. A stream entering
   Gulmi can have an upstream catchment originating in Baglung or Parbat. Reaches are clipped
   based on administrative location, while their contributing catchment is modeled across
   the natural topography.
"""

from __future__ import annotations

import os
from typing import List, Dict, Any, Optional, Tuple
import geopandas as gpd
from shapely.geometry import LineString
from shapely.ops import unary_union
from shapely.prepared import prep


def calculate_hydropower_potential(
    reaches: List[Dict[str, Any]],
    specific_discharge: float = 0.032,
    runoff_factor: Optional[float] = None,
    efficiency: float = 0.70,
    head_loss_factor: float = 0.90,
    capacity_factor: float = 0.60,
    env_flow_fraction: float = 0.10
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Computes design discharge, net head, power potential (kW), and screening annual energy yield (MWh/yr).
    
    [Code Comment Citation]: BHA / IHA Standard Hydropower Formula: P (kW) = 9.81 * Q_turb * H_net * η
    
    Parameters:
        reaches: List of reach dictionaries from Step 4.
        specific_discharge: Specific discharge rate in m³/(s·km²) to convert catchment area to mean discharge.
        runoff_factor: Backward-compatible alias for specific_discharge.
        efficiency: Total electromechanical efficiency η (default: 0.70 per BHA/IHA).
        head_loss_factor: Head preservation factor (default: 0.90 = 10% hydraulic losses).
        capacity_factor: Screening plant load factor (default: 0.60).
        env_flow_fraction: Reserved environmental river flow fraction (default: 0.10 per Nepal Hydropower Policy).
        
    Returns:
        enriched_reaches: List of reaches enriched with discharge, net head, power (kW/MW), and energy.
        qa_stats: Calculation summary metrics.
    """
    # Handle backward-compatible argument alias
    q_spec = runoff_factor if runoff_factor is not None else specific_discharge
    
    print(f"--> [STEP 9: CALCULATE POWER OUTPUT] Evaluating Hydropower Potential (BHA/IHA Standard)...")
    print(f"    Physics: P = 9.81 * Q_turb * H_net * η")
    print(f"    Parameters: Q_spec = {q_spec:.4f} m³/(s·km²) | Head Loss Factor = {head_loss_factor:.2f} | Env Reserve = {env_flow_fraction*100:.0f}% | η = {efficiency:.2f}")

    g = 9.81  # Acceleration due to gravity in m/s²
    enriched_reaches: List[Dict[str, Any]] = []
    total_potential_kw = 0.0

    for r in reaches:
        z_up = float(r.get("upstream_z_m", r.get("z_head_m", 0.0)))
        z_down = float(r.get("downstream_z_m", r.get("z_tail_m", 0.0)))

        # 1. Gross Head & Net Head
        gross_head = max(0.0, z_up - z_down)
        net_head = max(0.0, gross_head * head_loss_factor)

        # 2. Discharge Calculation at Reach Downstream Endpoint
        catchment_area_km2 = float(r["catchment_km2"])
        q_gross = max(0.001, catchment_area_km2 * q_spec)
        q_env = q_gross * env_flow_fraction
        q_turb = max(0.0, q_gross - q_env)

        # 3. Hydropower Potential Formula using Net Head: P (kW) = g * Q_turb * H_net * η
        if net_head > 0.0 and q_turb > 0.0:
            power_kw = g * q_turb * net_head * efficiency
        else:
            power_kw = 0.0

        # 4. Screening Annual Energy Yield (MWh/yr) based on assumed Capacity Factor
        annual_energy_mwh = (power_kw * 8760.0 * capacity_factor) / 1000.0
        total_potential_kw += power_kw

        record = dict(r)
        record.update({
            "gross_head_m": round(gross_head, 2),
            "net_head_m": round(net_head, 2),
            "discharge_gross_m3s": round(q_gross, 4),
            "discharge_env_m3s": round(q_env, 4),
            "discharge_turbined_m3s": round(q_turb, 4),
            "discharge_m3s": round(q_turb, 4),  # Standard turbined discharge
            "power_potential_kw": round(power_kw, 2),
            "power_potential_mw": round(power_kw / 1000.0, 3),
            "screening_annual_energy_mwh": round(annual_energy_mwh, 2),
            "annual_energy_mwh": round(annual_energy_mwh, 2),  # Backward compatibility
            "system_efficiency": efficiency,
            "head_loss_factor": head_loss_factor,
            "capacity_factor": capacity_factor,
            "specific_discharge_m3s_per_km2": q_spec
        })
        enriched_reaches.append(record)

    total_mw = total_potential_kw / 1000.0
    qa_stats = {
        "reaches_evaluated": len(enriched_reaches),
        "total_gross_theoretical_potential_mw": round(total_mw, 3),
        "specific_discharge_used": q_spec,
        "efficiency_used": efficiency,
        "head_loss_factor_used": head_loss_factor,
        "capacity_factor_used": capacity_factor,
        "env_flow_fraction_used": env_flow_fraction
    }

    print(f"    Calculation complete across {len(enriched_reaches):,} reaches.")
    print(f"    Raw DEM Gross Theoretical Reach Potential: {total_mw:,.2f} MW ({total_potential_kw:,.1f} kW)")
    return enriched_reaches, qa_stats


def filter_and_screen_reaches(
    reaches: List[Dict[str, Any]],
    boundary_path: Optional[str] = None,
    min_power_kw: float = 0.0,
    district_name: str = "Gulmi",
    raster_crs: Any = None
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Spatially clips stream reaches to the target district administrative boundary and screens
    by minimum hydropower capacity (kW).
    
    Parameters:
        reaches: List of reach dictionaries from calculate_hydropower_potential.
        boundary_path: Path to GeoJSON/Shapefile of district/palika boundaries.
        min_power_kw: Minimum capacity threshold in kW to filter sub-viable trickles (e.g. 5.0 kW).
        district_name: Target district name for metadata.
        raster_crs: Coordinate reference system of the DEM raster to ensure CRS matching.
        
    Returns:
        viable_reaches: List of clipped, screened, and palika-attributed reaches with sequential IDs (1..N).
        qa_stats: Filtering and screening metrics.
    """
    print(f"--> [STEP 9.1: BOUNDARY CLIPPING & VIABILITY SCREENING] Filtering reaches...")
    initial_count = len(reaches)

    # 1. Spatial Boundary Clipping
    if boundary_path:
        if not os.path.exists(boundary_path):
            raise FileNotFoundError(
                f"[ERROR] Administrative boundary file does not exist on disk: {boundary_path}\n"
                f"When evaluating a new district, ensure the boundary vector exists."
            )
        print(f"    Applying administrative boundary clipping: {os.path.basename(boundary_path)}")
        gdf = gpd.read_file(boundary_path)
        if gdf.empty:
            raise ValueError(f"[ERROR] Boundary file is empty: {boundary_path}")

        # Align CRS if raster_crs is provided
        if raster_crs is not None and gdf.crs != raster_crs:
            print(f"    Reprojecting boundary vector from {gdf.crs} to raster CRS {raster_crs}...")
            gdf = gdf.to_crs(raster_crs)

        # Dissolve union for whole-district clipping
        district_union = unary_union(gdf.geometry)
        prepared_district = prep(district_union)

        # Extract individual palika/sub-unit features for spatial attribution
        palika_features = []
        for idx, row in gdf.iterrows():
            name = (
                row.get("name")
                or row.get("fullName")
                or row.get("nepaliName")
                or row.get("GaPa_Na")
                or row.get("palika")
                or row.get("MUNICIPALI")
                or row.get("DISTRICT")
                or f"Unit_{idx+1}"
            )
            palika_features.append((str(name), row.geometry, prep(row.geometry)))

        clipped_reaches: List[Dict[str, Any]] = []
        for r in reaches:
            coords = r.get("line_coords", [])
            if len(coords) < 2:
                continue
            line = LineString(coords)
            if prepared_district.intersects(line):
                # Attribute to specific Palika by checking reach midpoint (using covers to include boundary)
                mid_pt = line.interpolate(0.5, normalized=True)
                assigned_palika = None
                for pname, geom, p_prep in palika_features:
                    if p_prep.covers(mid_pt):
                        assigned_palika = pname
                        break
                if assigned_palika is None:
                    # Fallback: check length of intersection with each palika polygon
                    max_len = 0.0
                    for pname, geom, p_prep in palika_features:
                        if p_prep.intersects(line):
                            try:
                                inter_len = line.intersection(geom).length
                                if inter_len > max_len:
                                    max_len = inter_len
                                    assigned_palika = pname
                            except Exception:
                                assigned_palika = pname
                                break
                if assigned_palika is None:
                    assigned_palika = district_name

                r_copy = dict(r)
                r_copy["palika"] = assigned_palika
                clipped_reaches.append(r_copy)

        clipped_out = initial_count - len(clipped_reaches)
        print(f"    Boundary spatial filter: retained {len(clipped_reaches):,} of {initial_count:,} reaches (clipped {clipped_out:,} out-of-district reaches).")
    else:
        print(f"    [ADVISORY] No administrative boundary provided (--boundary).")
        print(f"    Reaches span the entire rectangular satellite DEM scene.")
        clipped_reaches = []
        for r in reaches:
            r_copy = dict(r)
            r_copy["palika"] = r_copy.get("palika", district_name)
            clipped_reaches.append(r_copy)
        clipped_out = 0

    # 2. Economic Viability Screening (min_power_kw)
    if min_power_kw > 0.0:
        viable_reaches = [r for r in clipped_reaches if float(r["power_potential_kw"]) >= min_power_kw]
        screened_out = len(clipped_reaches) - len(viable_reaches)
        print(f"    Viability screening (>= {min_power_kw:.1f} kW): retained {len(viable_reaches):,} reaches (screened out {screened_out:,} sub-viable trickles).")
    else:
        viable_reaches = clipped_reaches
        screened_out = 0

    # 3. Sequential Re-indexing
    for new_id, r in enumerate(viable_reaches, start=1):
        r["reach_id"] = new_id

    total_mw = sum(float(r["power_potential_mw"]) for r in viable_reaches)
    qa_stats = {
        "initial_reaches": initial_count,
        "retained_reaches": len(viable_reaches),
        "clipped_out_of_district": clipped_out,
        "screened_below_min_power": screened_out,
        "district_gross_theoretical_potential_mw": round(total_mw, 3),
        "min_power_kw_threshold": min_power_kw
    }

    print(f"    Screened total for {district_name}: {len(viable_reaches):,} viable reaches | Gross Theoretical Potential: {total_mw:,.2f} MW")
    return viable_reaches, qa_stats
