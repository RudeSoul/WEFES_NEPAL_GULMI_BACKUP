#!/usr/bin/env python3
# [DATA PROVENANCE]
# Data Source: User-provided Digital Elevation Model (GeoTIFF)
# Classification: AUTONOMOUS HYDRO-TOPOGRAPHIC DECISION SUPPORT ENGINE
# Citations: SAGA GIS (Conrad et al., 2015); Wang & Liu (2006); O'Callaghan & Mark (1984);
#            Tarboton et al. (1991); Jenson & Dominique (1988); British Hydropower Association (BHA)

"""
engines/water/hydro/cli.py
==========================
STEP 1. COMPONENT INTEGRATION:
Standard CLI entry point for the Autonomous WEFES Hydropower & Topographic Engine.
Complies with Rule 1 of RULESET.md (Zero Inward Code Imports) and Rule 2 (Data Provenance).

================================================================================
HOW TO USE THIS ENGINE FOR ANY OTHER DISTRICT (100% REUSABLE)
================================================================================
This engine is completely terrain, coordinate, and district agnostic. To run the
assessment for any new district in Nepal (or globally):

1. PREPARE YOUR DEM:
   Place any 30m, 12.5m (ALOS PALSAR), or 10m DEM GeoTIFF of your target district
   in `data/real/rasters/` or pass any absolute path.

2. RUN VIA CLI:
   Pass the path to your DEM, your desired accumulation threshold, and output path:

   # Example 1: Baglung District (Steep High-Head Torrents)
   python3 engines/water/hydro/cli.py \\
       --input-dem /path/to/baglung_dem_30m.tif \\
       --district Baglung \\
       --threshold 300 \\
       --runoff-factor 0.038 \\
       --output data/calculated/hydro_reaches/baglung_hydro_reaches.geojson

   # Example 2: Mustang District (Arid Trans-Himalayan Region)
   python3 engines/water/hydro/cli.py \\
       --input-dem /path/to/mustang_dem_30m.tif \\
       --district Mustang \\
       --threshold 600 \\
       --runoff-factor 0.015 \\
       --output data/calculated/hydro_reaches/mustang_hydro_reaches.geojson

   # Example 3: Jhapa District (Lowland River Basins)
   python3 engines/water/hydro/cli.py \\
       --input-dem /path/to/jhapa_dem_30m.tif \\
       --district Jhapa \\
       --threshold 2000 \\
       --runoff-factor 0.028 \\
       --output data/calculated/hydro_reaches/jhapa_hydro_reaches.geojson

   # Example 4: Gulmi District (Default)
   python3 engines/water/hydro/cli.py \\
       --district Gulmi \\
       --threshold 500

3. AUTOMATIC COORDINATE SYSTEM & PROJECTION HANDLING:
   - If your DEM is in UTM meters (e.g. EPSG:32644 / Zone 44N or EPSG:32645 / Zone 45N),
     it directly uses the metric pixel grid.
   - If your DEM is in geographic degrees (EPSG:4326), it automatically calibrates
     planar metric spacing (dx, dy in meters) at the district's centroid latitude.
================================================================================
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from pathlib import Path

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
    """Finds available DEM file in the repository or returns standard default."""
    candidates = [
        PROJECT_ROOT / "data" / "real" / "rasters" / f"{district.lower()}_dem_30m.tif",
        PROJECT_ROOT / "data" / "real" / "rasters" / "gulmi_dem_30m.tif",
        PROJECT_ROOT / "data" / "Gulmi_OpenTopography_data_Hillside_and_slope" / "gulmi_dem_30m.tif",
    ]
    for p in candidates:
        if p.exists():
            return str(p)
    return str(candidates[0])


def main():
    parser = argparse.ArgumentParser(
        description="Autonomous WEFES Hydropower & Topographic Assessment Engine (SAGA GIS Algorithms)",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    
    # Required / Primary CLI Arguments (Step 1)
    parser.add_argument(
        "--input-dem",
        type=str,
        default=None,
        help="Path to input digital elevation model (DEM GeoTIFF)"
    )
    parser.add_argument(
        "--threshold",
        type=int,
        default=500,
        help="Stream initiation flow accumulation threshold in pixels"
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Target output vector file path (GeoJSON format)"
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
        "--runoff-factor",
        type=float,
        default=0.032,
        help="Localized runoff factor in m³/(s·km²) to convert catchment area to design discharge Q"
    )
    parser.add_argument(
        "--efficiency",
        type=float,
        default=0.70,
        help="Total electromechanical efficiency η (enforced standard: 0.70 per BHA/IHA guidelines)"
    )
    parser.add_argument(
        "--reach-len",
        type=float,
        default=500.0,
        help="Target reach segmentation interval in meters"
    )
    parser.add_argument(
        "--min-slope",
        type=float,
        default=0.01,
        help="Minimum downward slope gradient in degrees preserved during sink filling (Wang & Liu, 2006)"
    )

    args = parser.parse_args()

    # 1. Resolve input DEM path
    dem_path = args.input_dem if args.input_dem else resolve_default_dem_path(args.district)
    if not os.path.exists(dem_path):
        print(f"\n[FATAL ERROR] Input DEM raster does not exist on physical disk:\n  -> {dem_path}")
        print("Please provide a valid DEM via: --input-dem /path/to/raster.tif\n")
        sys.exit(1)

    # 2. Resolve output paths
    if args.output:
        output_vector = args.output
    else:
        out_folder = PROJECT_ROOT / "data" / "calculated" / "hydro_reaches"
        output_vector = str(out_folder / f"{args.district.lower()}_hydro_reaches.geojson")
        
    output_csv = args.output_csv

    # Terminal Header
    print("==================================================================")
    print("  WEFES AUTONOMOUS HYDRO ENGINE: SAGA GIS SCIENTIFIC PIPELINE     ")
    print("==================================================================")
    print(f"  • District Target:      {args.district}")
    print(f"  • Input DEM Path:       {dem_path}")
    print(f"  • Stream Threshold:     {args.threshold:,} cells")
    print(f"  • Runoff Factor:        {args.runoff_factor:.4f} m³/(s·km²)")
    print(f"  • System Efficiency:    {args.efficiency:.2f} (BHA/IHA Guidelines)")
    print(f"  • Target Reach Step:    {args.reach_len:.1f} m")
    print(f"  • Target Output Vector: {output_vector}")
    print("==================================================================")

    start_time = time.time()

    try:
        # Execute the 10-step pipeline
        report = run_hydro_pipeline(
            dem_path=dem_path,
            output_vector_path=output_vector,
            output_csv_path=output_csv,
            threshold=args.threshold,
            district=args.district,
            runoff_factor=args.runoff_factor,
            efficiency=args.efficiency,
            target_reach_len_m=args.reach_len,
            min_slope_deg=args.min_slope
        )

        elapsed = time.time() - start_time
        print("\n==================================================================")
        print(" [SUCCESS] Hydropower Assessment Complete!")
        print("==================================================================")
        print(f"  • Total Stream Reaches:      {report['total_reaches']:,}")
        print(f"  • Total Capacity Potential:  {report['total_potential_mw']:.3f} MW")
        print(f"  • Estimated Annual Energy:   {report['total_annual_generation_gwh']:.2f} GWh/yr")
        print(f"  • Mean Gross Head:           {report['mean_gross_head_m']:.1f} m")
        print(f"  • Mean Design Discharge:     {report['mean_discharge_m3s']:.4f} m³/s")
        print(f"  • Max Single Reach Output:   {report['max_reach_power_kw']:.1f} kW")
        print(f"  • Exported GeoJSON:          {report['vector_file']}")
        print(f"  • Exported Summary CSV:      {report['csv_file']}")
        print(f"  • Total Execution Time:      {elapsed:.2f} seconds")
        print("==================================================================\n")

    except Exception as err:
        print(f"\n[FATAL ERROR] Engine execution failed: {err}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
