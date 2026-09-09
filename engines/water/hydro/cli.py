#!/usr/bin/env python3
"""
engines/hydro/cli.py
====================
CLI entry point for the Autonomous WEFES Hydropower & Topographic Engine.
Complies with Rule 1 of RULESET.md (Zero Inward Code Imports).

Usage:
  python3 engines/hydro/cli.py --district Gulmi --output-dir data/calculated/hydro_reaches

Options:
  --dem-path        Path to input Copernicus 30m DEM GeoTIFF
  --palika-geojson  Path to municipal boundaries GeoJSON
  --output-dir      Directory where output tables, GeoJSON, and summaries will be written
  --district        Target district name (default: Gulmi)
  --reach-len       Target river reach segmentation length in meters (default: 500.0)
  --api-key         OpenTopography API key (used if DEM needs to be downloaded)
"""

from __future__ import annotations

import argparse
import os
import sys
import tarfile
import urllib.request
from pathlib import Path

# Add current directory to path so `src` resolves cleanly both standalone and in monorepo
ENGINE_DIR = Path(__file__).resolve().parent
# Determine monorepo root or fallback to local directory if run standalone
if len(ENGINE_DIR.parents) >= 3 and (ENGINE_DIR.parents[2] / "data").exists():
    PROJECT_ROOT = ENGINE_DIR.parents[2]
elif len(ENGINE_DIR.parents) >= 2 and (ENGINE_DIR.parents[1] / "data").exists():
    PROJECT_ROOT = ENGINE_DIR.parents[1]
else:
    PROJECT_ROOT = ENGINE_DIR
if str(ENGINE_DIR) not in sys.path:
    sys.path.insert(0, str(ENGINE_DIR))

from src import (
    run_topographic_analysis,
    run_hydrological_estimation,
    apply_environmental_flows,
    simulate_energy_yield,
    apply_spatial_screening,
    verify_and_export
)


def ensure_dem(dem_path: str, output_dir: str, api_key: str):
    """Verifies local DEM exists or downloads Copernicus 30m from OpenTopography."""
    if os.path.exists(dem_path):
        print(f"--> [Input DEM Verified]: {os.path.basename(dem_path)}")
        return

    print(f"--> DEM not found at {dem_path}. Fetching Copernicus 30m via OpenTopography API...")
    os.makedirs(os.path.dirname(os.path.abspath(dem_path)), exist_ok=True)
    south, north, west, east = 27.80, 28.50, 82.85, 83.75
    url = (
        f"https://portal.opentopography.org/API/globaldem?"
        f"demtype=COP30&south={south}&north={north}&west={west}&east={east}"
        f"&outputFormat=GTiff&API_Key={api_key}"
    )
    temp_file = os.path.join(output_dir, "temp_dem_download")
    urllib.request.urlretrieve(url, temp_file)

    if tarfile.is_tarfile(temp_file):
        with tarfile.open(temp_file, "r:*") as tar:
            tar.extractall(path=output_dir)
        os.remove(temp_file)
        tifs = [f for f in os.listdir(output_dir) if f.endswith(".tif") and "output" in f.lower()]
        if tifs:
            os.rename(os.path.join(output_dir, tifs[0]), dem_path)
        else:
            all_tifs = [f for f in os.listdir(output_dir) if f.endswith(".tif")]
            if all_tifs:
                os.rename(os.path.join(output_dir, all_tifs[0]), dem_path)
    else:
        os.rename(temp_file, dem_path)
    print(f"    Saved DEM -> {dem_path}")


def main():
    parser = argparse.ArgumentParser(description="WEFES Hydropower & Topographic Assessment Engine")
    parser.add_argument("--dem-path", type=str, default=None, help="Path to input DEM GeoTIFF")
    parser.add_argument("--palika-geojson", type=str, default=None, help="Path to Palika boundary GeoJSON")
    parser.add_argument("--input-dir", type=str, default=None, help="Base data/real directory")
    parser.add_argument("--output-dir", type=str, default=None, help="Output destination folder")
    parser.add_argument("--district", type=str, default="Gulmi", help="Target district name")
    parser.add_argument("--reach-len", type=float, default=500.0, help="Target reach length in meters")
    parser.add_argument("--api-key", type=str, default="8660814057d43340b72f513fbbb97983", help="OpenTopography API Key")

    args = parser.parse_args()

    # Determine default paths relative to PROJECT_ROOT
    input_base = Path(args.input_dir) if args.input_dir else (PROJECT_ROOT / "data" / "real")
    output_dir = Path(args.output_dir) if args.output_dir else (PROJECT_ROOT / "data" / "calculated" / "hydro_reaches")
    output_dir.mkdir(parents=True, exist_ok=True)

    # Resolve DEM path
    if args.dem_path:
        dem_path = args.dem_path
    else:
        # Check standard locations (data/real/rasters or legacy data folder)
        primary_dem = input_base / "rasters" / "gulmi_dem_30m.tif"
        fallback_dem = PROJECT_ROOT / "data" / "Gulmi_OpenTopography_data_Hillside_and_slope" / "gulmi_dem_30m.tif"
        if primary_dem.exists():
            dem_path = str(primary_dem)
        elif fallback_dem.exists():
            dem_path = str(fallback_dem)
        else:
            dem_path = str(primary_dem)

    # Resolve GeoJSON path
    if args.palika_geojson:
        geojson_path = args.palika_geojson
    else:
        primary_geo = input_base / "boundaries" / "gulmi-palikas.json"
        legacy_geo = PROJECT_ROOT / "data" / "geojson" / "gulmi-palikas.json"
        if primary_geo.exists():
            geojson_path = str(primary_geo)
        elif legacy_geo.exists():
            geojson_path = str(legacy_geo)
        else:
            geojson_path = str(legacy_geo)

    print("==================================================================")
    print(f" WEFES HYDRO ENGINE: Assessment for {args.district} District")
    print("==================================================================")
    print(f"   • DEM Input:        {dem_path}")
    print(f"   • Palika GeoJSON:   {geojson_path}")
    print(f"   • Output Directory: {output_dir}")
    print("==================================================================")

    # 0. Ensure DEM is ready
    ensure_dem(dem_path, str(output_dir), args.api_key)

    # 1. Step 1: Topographic Analysis
    reaches_step1 = run_topographic_analysis(
        dem_path=dem_path,
        output_dir=str(output_dir),
        target_reach_len_m=args.reach_len,
        micro_threshold_km2=0.5,
        ror_threshold_km2=10.0,
        save_rasters=True
    )

    # 2. Step 2: Hydrological Estimation (WECS/NEA + DHM Station 430)
    reaches_step2 = run_hydrological_estimation(
        reaches_df=reaches_step1,
        mwi=1600.0,
        gauge_area_km2=2140.0,
        gauge_qmean=68.5,
        gauge_transfer_threshold_km2=200.0
    )

    # 3. Step 3: Environmental Flow Allocation (DOED 10% Statutory E-Flow)
    reaches_step3 = apply_environmental_flows(
        reaches_df=reaches_step2,
        env_flow_ratio=0.10,
        ror_efficiency=0.82,
        micro_efficiency=0.65
    )

    # 4. Step 4: Power and Monthly Energy Simulation
    reaches_step4 = simulate_energy_yield(
        reaches_df=reaches_step3,
        head_loss_factor=0.90
    )

    # 5. Step 5: Spatial Screening & Apportionment
    screened_reaches, palika_summary = apply_spatial_screening(
        reaches_df=reaches_step4,
        palika_geojson_path=geojson_path,
        border_apportion_factor=0.50,
        min_slope_pct=2.0,
        min_head_m=5.0,
        cultural_buffer_km=1.5
    )

    # 6. Step 6: Ground-Truth Verification & Export
    report = verify_and_export(
        screened_df=screened_reaches,
        palika_summary=palika_summary,
        output_dir=str(output_dir),
        district_name=args.district
    )

    print("==================================================================")
    print(" Execution Complete! Summary Results:")
    print(f"   • Viable Screened Reaches: {report['total_screened_viable_reaches']:,}")
    print(f"   • Total Viable Capacity:   {report['total_viable_potential_MW']} MW")
    print(f"   • Commercial RoR (>1 MW):  {report['commercial_ror_potential_MW']} MW")
    print(f"   • Rural Micro-Hydro:       {report['rural_micro_potential_MW']} MW")
    print(f"   • Annual Clean Energy:     {report['annual_energy_generation_GWh']} GWh/yr")
    print(f"   • Saved In:                {output_dir}")
    print("==================================================================")


if __name__ == "__main__":
    main()
