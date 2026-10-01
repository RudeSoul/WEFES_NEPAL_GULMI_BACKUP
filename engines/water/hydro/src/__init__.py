# [DATA PROVENANCE]
# Data Source: SAGA GIS Hydrological Modeling Framework & BHA/IHA Standards
# Classification: AUTONOMOUS HYDRO-ENGINE CORE
# Citations: Conrad et al. (2015); Wang & Liu (2006); O'Callaghan & Mark (1984); Tarboton (1991); Jenson & Dominique (1988); BHA/IHA

"""
engines/water/hydro/src/__init__.py
==================================
Autonomous Hydrological & Topographic Power Potential Screening Engine for District Catchments.
"""

from __future__ import annotations

from typing import Dict, Any, Optional

from .step1_dem_io import load_dem_and_grid, clean_nodata_values
from .step2_depression_filling import fill_sinks_wang_liu
from .step3_flow_routing import compute_d8_flow_direction, compute_d8_flow_accumulation
from .step4_stream_network import extract_stream_network, segment_reaches_and_extract_head_tail
from .step5_power_calculation import calculate_hydropower_potential, filter_and_screen_reaches
from .step6_export import export_results


def run_hydro_pipeline(
    dem_path: str,
    output_vector_path: str,
    output_csv_path: Optional[str] = None,
    boundary_path: Optional[str] = None,
    threshold: int = 500,
    min_power_kw: float = 0.0,
    district: str = "Gulmi",
    specific_discharge: float = 0.032,
    runoff_factor: Optional[float] = None,
    efficiency: float = 0.70,
    head_loss_factor: float = 0.90,
    capacity_factor: float = 0.60,
    env_flow_fraction: float = 0.10,
    target_reach_len_m: float = 500.0,
    min_slope_deg: float = 0.01
) -> Dict[str, Any]:
    """
    Executes the full 10-step Hydropower Potential Screening pipeline end-to-end.
    
    Parameters:
        dem_path: Path to raw input DEM GeoTIFF.
        output_vector_path: Destination path for reaches GeoJSON.
        output_csv_path: Optional destination path for summary CSV.
        boundary_path: District administrative boundary vector path.
        threshold: Upstream pixel accumulation threshold for channel initiation.
        min_power_kw: Minimum capacity threshold in kW to filter sub-viable trickles.
        district: Name of district for metadata attribution.
        specific_discharge: Specific discharge (m³/(s·km²)) for discharge estimation.
        runoff_factor: Backward-compatible alias for specific_discharge.
        efficiency: Total system efficiency η (default: 0.70 per BHA/IHA).
        head_loss_factor: Head loss factor (default: 0.90 = 10% hydraulic losses).
        capacity_factor: Screening capacity factor (default: 0.60).
        env_flow_fraction: Reserved environmental river flow fraction (default: 0.10).
        target_reach_len_m: Target reach segmentation interval in meters (default: 500m).
        min_slope_deg: Minimum downward slope preserved in depression filling.
        
    Returns:
        Dict of executive summary results and QA audit metrics.
    """
    q_spec = runoff_factor if runoff_factor is not None else specific_discharge

    # STEP 2: LOAD DEM & VALIDATE
    dem_raw, transform, profile, pix_w, pix_h, dem_qa = load_dem_and_grid(dem_path)

    # STEP 3: HANDLE NODATA (Dirichlet-Laplace boundary smoothing)
    cleaned_dem, nodata_qa = clean_nodata_values(dem_raw, profile)

    # STEP 4: FILL SINKS & DEPRESSIONS (Priority-Flood least-cost path)
    filled_dem, sink_qa = fill_sinks_wang_liu(
        cleaned_dem,
        min_slope_deg=min_slope_deg,
        pix_w=pix_w,
        pix_h=pix_h
    )

    # STEP 5: FLOW DIRECTION (D8 steepest descent)
    fdir, receiver_r, receiver_c, fdir_qa = compute_d8_flow_direction(
        filled_dem,
        pix_w=pix_w,
        pix_h=pix_h
    )

    # STEP 6: FLOW ACCUMULATION (Topological DAG sort with cycle check)
    acc_cells, acc_km2, acc_qa = compute_d8_flow_accumulation(
        receiver_r,
        receiver_c,
        pix_w=pix_w,
        pix_h=pix_h
    )

    # STEP 7: EXTRACT STREAMS (Channel initiation threshold)
    stream_mask, stream_qa = extract_stream_network(acc_cells, threshold=threshold)

    # STEP 8: SEGMENT REACHES & EXTRACT UPSTREAM/DOWNSTREAM NODES (Curvilinear path distance)
    reaches, reach_qa = segment_reaches_and_extract_head_tail(
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

    # STEP 9: CALCULATE POWER OUTPUT (BHA / IHA Equation with Net Head & Env Flow)
    enriched_reaches, power_qa = calculate_hydropower_potential(
        reaches,
        specific_discharge=q_spec,
        efficiency=efficiency,
        head_loss_factor=head_loss_factor,
        capacity_factor=capacity_factor,
        env_flow_fraction=env_flow_fraction
    )

    # STEP 9.1: BOUNDARY CLIPPING & VIABILITY SCREENING
    screened_reaches, screen_qa = filter_and_screen_reaches(
        enriched_reaches,
        boundary_path=boundary_path,
        min_power_kw=min_power_kw,
        district_name=district,
        raster_crs=profile.get("crs")
    )

    # Aggregate QA audit package
    qa_audit = {
        "dem": dem_qa,
        "nodata": nodata_qa,
        "sink_filling": sink_qa,
        "flow_direction": fdir_qa,
        "flow_accumulation": acc_qa,
        "stream_network": stream_qa,
        "reaches": reach_qa,
        "power_physics": power_qa,
        "screening": screen_qa
    }

    # STEP 10: OUTPUT GENERATION (RFC 7946 GeoJSON & CSV Export)
    report = export_results(
        screened_reaches,
        output_vector_path=output_vector_path,
        output_csv_path=output_csv_path,
        source_crs=profile.get("crs"),
        qa_metadata=qa_audit
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
    "filter_and_screen_reaches",
    "export_results",
    "run_hydro_pipeline",
]
