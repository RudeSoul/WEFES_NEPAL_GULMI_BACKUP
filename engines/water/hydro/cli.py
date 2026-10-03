#!/usr/bin/env python3
# [DATA PROVENANCE]
# Data Source: User-specified DEM raster, district boundary vectors, and scientific hydrology models
# Classification: HYDROPOWER & TOPOGRAPHIC ENERGY ASSESSMENT ENGINE
# Citations: Conrad et al. (2015); Wang & Liu (2006); O'Callaghan & Mark (1984); Tarboton (1991); Jenson & Dominique (1988); BHA/IHA

"""
================================================================================
WEFES AUTONOMOUS HYDRO-POWER ASSESSMENT ENGINE (CLI ENTRYPOINT)
================================================================================
End-to-end command-line interface for the 10-step Hydropower Potential Screening
pipeline. Designed for district reusability and rigorous scientific validation.

HOW TO RUN FOR ANY NEW DISTRICT (MANDATORY REQUIREMENT):
---------------------------------------------------------
When analyzing any district outside Gulmi, you MUST provide BOTH:
  1. The input DEM raster:
     --input-dem /path/to/district_dem.tif
  2. The district administrative boundary vector:
     --boundary /path/to/district_palikas.json (or .geojson / .shp)

WHY THE BOUNDARY VECTOR IS MANDATORY:
-------------------------------------
1. SATELLITE FOOTPRINT MULTI-DISTRICT COVERAGE:
   Raw satellite DEM GeoTIFFs (Copernicus 30m, SRTM, ALOS) are rectangular scenes
   spanning thousands of square kilometers across multiple districts. For example,
   the Gulmi DEM tile covers 6,942 km² across 7 districts (Gulmi, Baglung, Parbat,
   Syangja, Palpa, Arghakhanchi, Pyuthan). Gulmi itself is only 1,149 km² (~16.5%).
2. PREVENTING REGIONAL REACH INFLATION:
   Without `--boundary`, stream networks are delineated across all 7 districts (15,000+
   reaches). Providing `--boundary` restricts delineation strictly to the target district.
3. LOCAL PALIKA ATTRIBUTION:
   The boundary vector enables dynamic spatial attribution of each reach to its exact
   local government unit (Palika).

EXAMPLE RUNS:
-------------
1. Gulmi District (Default):
   python cli.py --district Gulmi

2. New District (e.g. Mustang):
   python cli.py --district Mustang \
       --input-dem data/real/rasters/mustang_dem_30m.tif \
       --boundary data/real/boundaries/mustang-palikas.json \
       --threshold 300 \
       --min-power-kw 10.0 \
       --output output/mustang_hydro_reaches.geojson
================================================================================
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from pathlib import Path
from typing import Optional

# Add engine directory to path so `src` resolves cleanly
ENGINE_DIR = Path(__file__).resolve().parent
if str(ENGINE_DIR) not in sys.path:
    sys.path.insert(0, str(ENGINE_DIR))

# Determine monorepo root or fallback to local directory
if len(ENGINE_DIR.parents) >= 3 and (ENGINE_DIR.parents[2] / "data").exists():
    PROJECT_ROOT = ENGINE_DIR.parents[2]
elif len(ENGINE_DIR.parents) >= 2 and (ENGINE_DIR.parents[1] / "data").exists():
    PROJECT_ROOT = ENGINE_DIR.parents[1]
else:
    PROJECT_ROOT = ENGINE_DIR

try:
    from engines.water.hydro.src import run_hydro_pipeline
except ImportError:
    from src import run_hydro_pipeline


def resolve_default_dem_path(district: str) -> str:
    """
    Finds available DEM file for the target district.
    PREVENTS DANGEROUS FALLBACK: Never silently returns Gulmi DEM for other districts.
    """
    dist_lower = district.lower()
    
    if dist_lower == "gulmi":
        candidates = [
            PROJECT_ROOT / "data" / "real" / "rasters" / "gulmi_dem_30m.tif",
            PROJECT_ROOT / "data" / "Gulmi_OpenTopography_data_Hillside_and_slope" / "gulmi_dem_30m.tif",
        ]
        for p in candidates:
            if p.exists():
                return str(p)
        return str(candidates[0])
    
    # Non-Gulmi district: Look strictly for district-specific DEM
    district_path = PROJECT_ROOT / "data" / "real" / "rasters" / f"{dist_lower}_dem_30m.tif"
    if district_path.exists():
        return str(district_path)
        
    raise FileNotFoundError(
        f"[ERROR] No default DEM found on disk for district '{district}'.\n"
        f"Searched: {district_path}\n"
        f"You must explicitly provide the DEM raster via: --input-dem /path/to/{dist_lower}_dem.tif"
    )


def resolve_default_boundary_path(district: str) -> Optional[str]:
    """Finds available administrative boundary vector for target district."""
    dist_lower = district.lower()
    candidates = [
        PROJECT_ROOT / "data" / "real" / "boundaries" / f"{dist_lower}-palikas.json",
        PROJECT_ROOT / "data" / "real" / "boundaries" / f"{dist_lower}_palikas.json",
        PROJECT_ROOT / "data" / "real" / "boundaries" / f"{dist_lower}_boundary.geojson",
        PROJECT_ROOT / "data" / "real" / "boundaries" / f"{dist_lower}.geojson",
        PROJECT_ROOT / "data" / "real" / "boundaries" / f"{dist_lower}.json",
    ]
    for p in candidates:
        if p.exists():
            return str(p)
    return None


def main():
    parser = argparse.ArgumentParser(
        description="Autonomous WEFES Hydropower Potential Screening Engine (BHA/IHA Standards)",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    
    # Required / Primary CLI Arguments
    parser.add_argument(
        "--input-dem",
        type=str,
        default=None,
        help="Path to input digital elevation model (DEM GeoTIFF)"
    )
    parser.add_argument(
        "--boundary",
        type=str,
        default=None,
        help="Path to district administrative boundary vector (GeoJSON/Shapefile) for spatial clipping & Palika attribution"
    )
    parser.add_argument(
        "--threshold",
        type=int,
        default=500,
        help="Stream initiation flow accumulation threshold in cells"
    )
    parser.add_argument(
        "--min-power-kw",
        type=float,
        default=5.0,
        help="Minimum hydropower capacity in kW to filter out sub-viable trickles (default: 5.0 kW)"
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Target output vector file path (GeoJSON format, RFC 7946)"
    )
    parser.add_argument(
        "--output-csv",
        type=str,
        default=None,
        help="Optional target path for summary tabular CSV file"
    )
    
    # District & Hydrological Parameters
    parser.add_argument(
        "--district",
        type=str,
        default="Gulmi",
        help="Target district name (e.g. Gulmi, Baglung, Mustang, Jhapa)"
    )
    parser.add_argument(
        "--specific-discharge",
        type=float,
        default=0.032,
        help="Specific discharge rate in m³/(s·km²) to convert catchment area to mean discharge Q"
    )
    parser.add_argument(
        "--runoff-factor",
        type=float,
        default=None,
        help="[Alias for --specific-discharge] Specific discharge rate in m³/(s·km²)"
    )
    parser.add_argument(
        "--efficiency",
        type=float,
        default=0.70,
        help="Total electromechanical efficiency η (enforced standard: 0.70 per BHA/IHA guidelines)"
    )
    parser.add_argument(
        "--head-loss-factor",
        type=float,
        default=0.90,
        help="Hydraulic head preservation factor (default: 0.90 = 10% head loss in penstock/trash rack)"
    )
    parser.add_argument(
        "--capacity-factor",
        type=float,
        default=0.60,
        help="Screening plant load factor (default: 0.60 for annual energy estimation)"
    )
    parser.add_argument(
        "--env-flow-fraction",
        type=float,
        default=0.10,
        help="Mandatory residual environmental river flow fraction (default: 0.10 per Nepal Hydropower Policy)"
    )
    parser.add_argument(
        "--reach-len",
        type=float,
        default=500.0,
        help="Target reach segmentation interval in curvilinear path meters"
    )
    parser.add_argument(
        "--min-slope",
        type=float,
        default=0.01,
        help="Minimum downward slope gradient in degrees preserved during sink filling"
    )
    parser.add_argument(
        "--allow-unbounded",
        action="store_true",
        help="Allow running without boundary vector for whole-scene regional delineation"
    )

    args = parser.parse_args()

    # =========================================================================
    # INPUT VALIDATION
    # =========================================================================
    if args.threshold <= 0:
        parser.error("--threshold must be an integer > 0.")
    if not (0.0 < args.efficiency <= 1.0):
        parser.error("--efficiency must be between 0.0 and 1.0.")
    if not (0.0 < args.head_loss_factor <= 1.0):
        parser.error("--head-loss-factor must be between 0.0 and 1.0.")
    if not (0.0 < args.capacity_factor <= 1.0):
        parser.error("--capacity-factor must be between 0.0 and 1.0.")
    if not (0.0 <= args.env_flow_fraction < 1.0):
        parser.error("--env-flow-fraction must be between 0.0 and 1.0.")
    if args.reach_len <= 0.0:
        parser.error("--reach-len must be > 0.0 meters.")
    if args.min_slope < 0.0:
        parser.error("--min-slope must be >= 0.0 degrees.")
    if args.min_power_kw < 0.0:
        parser.error("--min-power-kw must be >= 0.0 kW.")

    # Resolve specific discharge (prioritize --runoff-factor if provided as alias)
    q_spec = args.runoff_factor if args.runoff_factor is not None else args.specific_discharge
    if q_spec <= 0.0:
        parser.error("--specific-discharge (or --runoff-factor) must be > 0.0 m³/(s·km²).")

    # =========================================================================
    # 1. RESOLVE INPUT DEM PATH
    # =========================================================================
    try:
        dem_path = args.input_dem if args.input_dem else resolve_default_dem_path(args.district)
    except FileNotFoundError as err:
        print(f"\n{err}\n")
        sys.exit(1)

    if not os.path.exists(dem_path):
        print(f"\n[FATAL ERROR] Input DEM raster does not exist on physical disk:\n  -> {dem_path}")
        print("Please provide a valid DEM via: --input-dem /path/to/raster.tif\n")
        sys.exit(1)

    # =========================================================================
    # 2. RESOLVE ADMINISTRATIVE BOUNDARY PATH
    # =========================================================================
    boundary_path = args.boundary if args.boundary else resolve_default_boundary_path(args.district)
    
    if args.district.lower() != "gulmi" and not boundary_path and not args.allow_unbounded:
        print(f"\n[ERROR] Mandatory administrative boundary vector missing for district '{args.district}'.")
        print("Because satellite DEMs span multiple districts, you must provide --boundary <path.geojson>")
        print("To deliberately run unbounded across the entire satellite scene, pass --allow-unbounded.\n")
        sys.exit(1)

    if args.boundary and not os.path.exists(args.boundary):
        print(f"\n[FATAL ERROR] Specified boundary file does not exist on physical disk:\n  -> {args.boundary}")
        sys.exit(1)

    # =========================================================================
    # 3. RESOLVE OUTPUT PATHS
    # =========================================================================
    if args.output:
        output_vector = args.output
    else:
        out_folder = PROJECT_ROOT / "data" / "calculated" / "hydro_reaches"
        output_vector = str(out_folder / f"{args.district.lower()}_hydro_reaches.geojson")
        
    output_csv = args.output_csv

    # =========================================================================
    # 4. EXECUTE PIPELINE
    # =========================================================================
    print("=" * 80)
    print("  WEFES AUTONOMOUS HYDRO-POWER ASSESSMENT ENGINE")
    print(f"  Target District:        {args.district}")
    print(f"  Input DEM:              {dem_path}")
    print(f"  Boundary Vector:        {boundary_path if boundary_path else 'None (Full Scene Unbounded)'}")
    print(f"  Flow Accum. Threshold:  {args.threshold:,} cells")
    print(f"  Viability Filter:       >= {args.min_power_kw:.1f} kW")
    print(f"  Specific Discharge:     {q_spec:.4f} m³/(s·km²)")
    print(f"  Electromechanical η:    {args.efficiency:.2f}")
    print(f"  Head Loss Factor:       {args.head_loss_factor:.2f} (Net Head = Gross Head * {args.head_loss_factor:.2f})")
    print(f"  Capacity Factor:        {args.capacity_factor:.2f}")
    print(f"  Environmental Reserve:  {args.env_flow_fraction*100:.0f}% of natural discharge")
    print(f"  Reach Length Step:      {args.reach_len:.1f} m")
    print(f"  Min Slope Preserved:    {args.min_slope:.3f}°")
    print(f"  Output Vector:          {output_vector}")
    print("=" * 80)

    start_time = time.time()
    try:
        report = run_hydro_pipeline(
            dem_path=dem_path,
            output_vector_path=output_vector,
            output_csv_path=output_csv,
            boundary_path=boundary_path,
            threshold=args.threshold,
            min_power_kw=args.min_power_kw,
            district=args.district,
            specific_discharge=q_spec,
            efficiency=args.efficiency,
            head_loss_factor=args.head_loss_factor,
            capacity_factor=args.capacity_factor,
            env_flow_fraction=args.env_flow_fraction,
            target_reach_len_m=args.reach_len,
            min_slope_deg=args.min_slope
        )
    except Exception as e:
        print(f"\n[FATAL PIPELINE FAILURE]: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    elapsed = time.time() - start_time
    print("\n" + "=" * 80)
    print(f"  HYDROPOWER SCREENING ASSESSMENT COMPLETED in {elapsed:.2f} seconds")
    print("=" * 80)
    print(f"  Total Viable Reaches Delineated:   {report['total_reaches']:,}")
    print(f"  Gross Theoretical Reach Potential: {report['gross_theoretical_potential_mw']:,.2f} MW")
    print(f"  Screening Annual Generation:       {report['screening_annual_generation_gwh']:,.2f} GWh/year")
    print(f"  Mean Gross Head:                   {report['mean_gross_head_m']:.2f} m")
    print(f"  Mean Net Head:                     {report['mean_net_head_m']:.2f} m")
    print(f"  Mean Turbined Discharge:           {report['mean_turbined_discharge_m3s']:.4f} m³/s")
    print(f"  Max Single Reach Power:            {report['max_reach_power_kw']:,.1f} kW ({report['max_reach_power_kw']/1000.0:.2f} MW)")
    print(f"  Output Vector GeoJSON:             {report['vector_file']}")
    print(f"  Output Summary CSV:                {report['csv_file']}")
    print("=" * 80)
    print("  [SCIENTIFIC NOTICE] Reaches along the same river trunk share upstream flow.")
    print("  Gross Theoretical Potential represents a kinetic ceiling, not independent cascade capacity.")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    main()
