# [DATA PROVENANCE]
# Data Source: Topographic reach attributes from Step 4 & District boundary vectors (GeoJSON/Shapefile)
# Classification: CALCULATED ENERGY BASELINE & HYDROPOWER POTENTIAL
# Citations: British Hydropower Association (BHA) & International Hydropower Association (IHA); Survey Department of Nepal

"""
step5_power_calculation.py
==========================
STEP 9. CALCULATE POWER OUTPUT: 
   - Compute Gross Head (H) as (Z_Head - Z_Tail).
   - Estimate Design Discharge (Q) in m³/s using an area-to-runoff approximation based
     on the flow accumulation cell count and a customizable localized runoff factor.
   - Apply the standard Hydropower Potential Formula: Power (kW) = g * Q * H * η
   
[Code Comment Citation]: British Hydropower Association (BHA) / International Hydropower Association (IHA) guidelines. Enforce g = 9.81 m/s² and a default total system efficiency (η) of 0.70.

CRITICAL MULTI-DISTRICT REUSABILITY REQUIREMENT:
-----------------------------------------------
When using this engine for any new district (e.g., Baglung, Mustang, Jhapa, etc.),
you MUST provide BOTH the DEM raster (--input-dem) AND the district boundary vector (--boundary).

Why the Boundary is Required:
1. Broad Satellite Footprint:
   Raw satellite DEM tiles (SRTM, ALOS, Copernicus) are large rectangular bounding boxes
   spanning 5,000–10,000 km² across multiple adjacent districts (e.g., Gulmi's raw DEM tile
   covers 6,942 km² across 7 districts: Gulmi, Baglung, Parbat, Syangja, Palpa, Arghakhanchi,
   and Pyuthan; Gulmi itself is only 1,149 km²).
2. Avoiding Artificial Reach Inflation:
   Without `--boundary`, the engine delineates river reaches across all 7 districts (15,000+
   reaches), which artificially inflates reach counts and total district capacity.
3. Palika / Municipality Attribution:
   Passing the district Palika boundary (e.g. `gulmi-palikas.json`) dynamically assigns
   each reach to its specific local government unit (Palika/Municipality).
"""

from __future__ import annotations

import os
from typing import List, Dict, Any, Optional
import geopandas as gpd
from shapely.geometry import LineString
from shapely.ops import unary_union
from shapely.prepared import prep


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
    print(f"    Raw DEM Aggregate Capacity: {total_mw:,.2f} MW ({total_potential_kw:,.1f} kW)")
    return enriched_reaches


def filter_and_screen_reaches(
    reaches: List[Dict[str, Any]],
    boundary_path: Optional[str] = None,
    min_power_kw: float = 0.0,
    district_name: str = "Gulmi",
    raster_crs: Any = None
) -> List[Dict[str, Any]]:
    """
    Spatially clips stream reaches to the target district administrative boundary and screens
    by minimum hydropower capacity (kW).
    
    CRITICAL MULTI-DISTRICT REUSABILITY NOTE (MANDATORY BOUNDARY REQUIREMENT):
    --------------------------------------------------------------------------
    When evaluating any new district, you must pass the district boundary vector (--boundary).
    Satellite DEM tiles (SRTM/ALOS/Copernicus) are large multi-district rectangular scenes
    (e.g., Gulmi's raw DEM tile covers 6,942 km² across 7 districts, while Gulmi is 1,149 km²).
    Passing --boundary clips out adjacent districts and attributes reaches to local Palikas.
    
    Parameters:
        reaches: List of reach dictionaries from calculate_hydropower_potential.
        boundary_path: Path to GeoJSON/Shapefile of district/palika boundaries.
        min_power_kw: Minimum capacity threshold in kW to filter sub-viable trickles (e.g. 5.0 kW).
        district_name: Target district name for metadata.
        raster_crs: Coordinate reference system of the DEM raster to ensure CRS matching.
        
    Returns:
        List of clipped, screened, and palika-attributed reaches with sequential IDs (1..N).
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
            palika_features.append((str(name), prep(row.geometry)))

        clipped_reaches: List[Dict[str, Any]] = []
        for r in reaches:
            coords = r.get("line_coords", [])
            if len(coords) < 2:
                continue
            line = LineString(coords)
            if prepared_district.intersects(line):
                # Attribute to specific Palika by checking reach midpoint
                mid_pt = line.interpolate(0.5, normalized=True)
                assigned_palika = None
                for pname, p_prep in palika_features:
                    if p_prep.contains(mid_pt):
                        assigned_palika = pname
                        break
                if assigned_palika is None:
                    # Fallback: check intersection with palika polygon
                    for pname, p_prep in palika_features:
                        if p_prep.intersects(line):
                            assigned_palika = pname
                            break
                if assigned_palika is None:
                    assigned_palika = district_name

                r_copy = dict(r)
                r_copy["palika"] = assigned_palika
                clipped_reaches.append(r_copy)

        print(f"    Boundary spatial filter: retained {len(clipped_reaches):,} of {initial_count:,} reaches (clipped {initial_count - len(clipped_reaches):,} out-of-district reaches).")
    else:
        print(f"    [ADVISORY] No administrative boundary provided (--boundary).")
        print(f"    Reaches span the entire rectangular satellite DEM bounding box.")
        print(f"    TIP: When adding a new district, provide --boundary <path.geojson> to isolate district reaches.")
        clipped_reaches = []
        for r in reaches:
            r_copy = dict(r)
            r_copy["palika"] = r_copy.get("palika", district_name)
            clipped_reaches.append(r_copy)

    # 2. Economic Viability Screening (min_power_kw)
    if min_power_kw > 0.0:
        viable_reaches = [r for r in clipped_reaches if float(r["power_potential_kw"]) >= min_power_kw]
        screened_out = len(clipped_reaches) - len(viable_reaches)
        print(f"    Viability screening (>= {min_power_kw:.1f} kW): retained {len(viable_reaches):,} reaches (screened out {screened_out:,} sub-viable channels).")
    else:
        viable_reaches = clipped_reaches

    # 3. Sequential Re-indexing
    for new_id, r in enumerate(viable_reaches, start=1):
        r["reach_id"] = new_id

    total_mw = sum(float(r["power_potential_mw"]) for r in viable_reaches)
    print(f"    Screened total for {district_name}: {len(viable_reaches):,} viable reaches | Aggregate Capacity: {total_mw:,.2f} MW")
    return viable_reaches

