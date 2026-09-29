# [DATA PROVENANCE]
# Data Source: SAGA GIS Hydrological Modeling Framework
# Classification: AUTONOMOUS HYDRO-ENGINE CORE
# Citations: SAGA GIS (Conrad et al., 2015); Wang & Liu (2006); O'Callaghan & Mark (1984); Tarboton (1991); Jenson & Dominique (1988); BHA/IHA

"""
engines/water/hydro/src/__init__.py
==================================
Modular SAGA GIS-based Hydropower & Topographic Engine for District Catchments.
"""

from __future__ import annotations

from typing import Dict, Any, Optional

from .step1_dem_io import load_dem_and_grid, clean_nodata_values
from .step2_depression_filling import fill_sinks_wang_liu
from .step3_flow_routing import compute_d8_flow_direction, compute_d8_flow_accumulation
from .step4_stream_network import extract_stream_network, segment_reaches_and_extract_head_tail
from .step5_power_calculation import calculate_hydropower_potential
from .step6_export import export_results


def run_hydro_pipeline(
    dem_path: str,
    output_vector_path: str,
    output_csv_path: Optional[str] = None,
    threshold: int = 500,
    district: str = "Gulmi",
    runoff_factor: float = 0.032,
    efficiency: float = 0.70,
    target_reach_len_m: float = 500.0,
    min_slope_deg: float = 0.01
) -> Dict[str, Any]:
    """
    Executes the full 10-step SAGA GIS Hydropower Potential pipeline end-to-end.
    
    Parameters:
        dem_path: Path to raw input DEM GeoTIFF.
        output_vector_path: Destination path for reaches GeoJSON.
        output_csv_path: Optional destination path for summary CSV.
        threshold: Upstream pixel accumulation threshold for channel initiation.
        district: Name of district for metadata attribution.
        runoff_factor: Localized runoff factor (m³/(s·km²)) for discharge estimation.
        efficiency: Total system efficiency η (default: 0.70 per BHA/IHA).
        target_reach_len_m: Target reach segmentation interval in meters (default: 500m).
        min_slope_deg: Minimum downward slope preserved in depression filling (Wang & Liu).
        
    Returns:
        Dict of executive summary results.
    """
    # STEP 2: LOAD DEM
    dem_raw, grid, transform, profile, pix_w, pix_h = load_dem_and_grid(dem_path)

    # STEP 3: HANDLE NODATA
    cleaned_dem = clean_nodata_values(dem_raw, profile)

    # STEP 4: FILL SINKS & DEPRESSIONS (Wang & Liu, 2006)
    filled_dem = fill_sinks_wang_liu(
        cleaned_dem,
        min_slope_deg=min_slope_deg,
        pix_w=pix_w,
        pix_h=pix_h
    )

    # STEP 5: FLOW DIRECTION (O'Callaghan & Mark, 1984)
    fdir, receiver_r, receiver_c = compute_d8_flow_direction(
        filled_dem,
        pix_w=pix_w,
        pix_h=pix_h
    )

    # STEP 6: FLOW ACCUMULATION (Tarboton et al., 1991)
    acc_cells, acc_km2 = compute_d8_flow_accumulation(
        receiver_r,
        receiver_c,
        pix_w=pix_w,
        pix_h=pix_h
    )

    # STEP 7: EXTRACT STREAMS (Jenson & Dominique, 1988)
    stream_mask = extract_stream_network(acc_cells, threshold=threshold)

    # STEP 8: SEGMENT REACHES & EXTRACT HEAD/TAIL (SAGA CD8_Flow_Analysis)
    reaches = segment_reaches_and_extract_head_tail(
        filled_dem=filled_dem,
        stream_mask=stream_mask,
        receiver_r=receiver_r,
        receiver_c=receiver_c,
        acc_km2=acc_km2,
        transform=transform,
        pix_w=pix_w,
        pix_h=pix_h,
        target_reach_len_m=target_reach_len_m,
        district=district
    )

    # STEP 9: CALCULATE POWER OUTPUT (BHA / IHA Guidelines)
    enriched_reaches = calculate_hydropower_potential(
        reaches,
        runoff_factor=runoff_factor,
        efficiency=efficiency
    )

    # STEP 10: OUTPUT GENERATION
    report = export_results(
        enriched_reaches,
        output_vector_path=output_vector_path,
        output_csv_path=output_csv_path
    )

    return report


__all__ = [
    "load_dem_and_grid",
    "clean_nodata_values",
    "fill_sinks_wang_liu",
    "compute_d8_flow_direction",
    "compute_d8_flow_accumulation",
    "extract_stream_network",
    "segment_reaches_and_extract_head_tail",
    "calculate_hydropower_potential",
    "export_results",
    "run_hydro_pipeline"
]
