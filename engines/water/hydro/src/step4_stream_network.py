# [DATA PROVENANCE]
# Data Source: Flow accumulation raster and filled DEM from Steps 2 & 3
# Classification: CALCULATED HYDROGRAPHIC NETWORK & TOPOGRAPHIC REACHES
# Citations: Jenson & Dominique (1988); Topological Stream Graph Segmentation

"""
step4_stream_network.py
=======================
STEP 7. EXTRACT STREAMS: Segment a stream network based on the user-defined pixel
threshold accumulation count.
[Code Comment Citation]: Jenson, S. K., and Dominique, J. O. (1988). "Extracting topographic structure from digital elevation model data for geographic information system analysis." Photogrammetric Engineering and Remote Sensing.

STEP 8. SEGMENT REACHES & EXTRACT UPSTREAM/DOWNSTREAM NODES:
Group channel cells into discrete reach corridors by accumulating actual curvilinear
path distance in meters. Extracts coordinates and elevations for upstream intake points
and downstream powerhouse points.

District Reusability Note:
--------------------------
The stream extraction threshold is user-configurable via CLI argument (--threshold).
In high-relief districts, smaller thresholds (e.g. 200–500 cells) extract steep mountain
tributaries. In flatter southern districts, higher thresholds (e.g. 2,000–5,000 cells)
isolate major river trunks.
"""

from __future__ import annotations

from typing import List, Dict, Any, Tuple
import numpy as np
from rasterio.transform import Affine


def extract_stream_network(
    acc_cells: np.ndarray,
    threshold: int = 500
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Extracts a binary stream network raster based on contributing pixel threshold count.
    
    Parameters:
        acc_cells: Flow accumulation raster (in cells).
        threshold: Minimum upstream cell count required to initiate a channel.
        
    Returns:
        stream_mask: 2D uint8 array (1 = stream channel, 0 = hillslope).
        qa_stats: Stream extraction metadata.
    """
    print(f"--> [STEP 7: EXTRACT STREAMS] Extracting stream network at threshold >= {threshold:,} cells...")
    stream_mask = (acc_cells >= threshold).astype(np.uint8)
    stream_cell_count = int(np.sum(stream_mask))
    
    qa_stats = {
        "threshold_cells": threshold,
        "stream_cells": stream_cell_count,
        "stream_cell_pct": round((stream_cell_count / acc_cells.size) * 100.0, 2)
    }
    print(f"    Stream extraction complete: {stream_cell_count:,} channel cells ({qa_stats['stream_cell_pct']}%)")
    return stream_mask, qa_stats


def segment_reaches_and_extract_head_tail(
    filled_dem: np.ndarray,
    stream_mask: np.ndarray,
    receiver_r: np.ndarray,
    receiver_c: np.ndarray,
    acc_km2: np.ndarray,
    transform: Affine,
    pix_w: float = 30.0,
    pix_h: float = 30.0,
    target_reach_len_m: float = 500.0,
    district: str = "Gulmi"
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Constructs a topological stream graph and segments river corridors based on
    actual accumulated curvilinear path distance in meters.
    
    Parameters:
        filled_dem: Depression-conditioned elevation array.
        stream_mask: Extracted binary stream mask.
        receiver_r: Downstream row receivers.
        receiver_c: Downstream column receivers.
        acc_km2: Upstream catchment area in km².
        transform: Affine raster transform for pixel-to-coordinate mapping.
        pix_w: Planar cell width in meters.
        pix_h: Planar cell height in meters.
        target_reach_len_m: Desired reach length discretization step in meters.
        district: District name for administrative tagging.
        
    Returns:
        reaches: List of reach dictionaries with geometric, elevation, and catchment attributes.
        qa_stats: Segmentation metrics including median length, total stream km, and node counts.
    """
    print(f"--> [STEP 8: SEGMENT REACHES] Tracing topological stream graph by curvilinear path distance...")
    nrows, ncols = filled_dem.shape
    
    # 1. Calculate stream in-degrees to identify channel heads (sources) and confluences (junctions)
    in_deg_stream = np.zeros((nrows, ncols), dtype=np.int8)
    s_r, s_c = np.where(stream_mask == 1)
    
    down_r = receiver_r[s_r, s_c]
    down_c = receiver_c[s_r, s_c]
    valid_down = (down_r >= 0) & (down_r < nrows) & (down_c >= 0) & (down_c < ncols)
    valid_stream_down = valid_down & (stream_mask[down_r, down_c] == 1)
    
    np.add.at(in_deg_stream, (down_r[valid_stream_down], down_c[valid_stream_down]), 1)

    channel_heads = (stream_mask == 1) & (in_deg_stream == 0)
    confluences = (stream_mask == 1) & (in_deg_stream > 1)
    
    head_count = int(np.sum(channel_heads))
    confluence_count = int(np.sum(confluences))
    print(f"    Topological Nodes: {head_count:,} channel heads | {confluence_count:,} confluences/junctions")

    # Seed paths from channel heads and confluences, sorted high to low elevation
    start_points = np.where(channel_heads | confluences)
    start_coords = list(zip(start_points[0], start_points[1]))
    start_elevs = [filled_dem[r, c] for r, c in start_coords]
    sorted_starts = [start_coords[i] for i in np.argsort(start_elevs)[::-1]]

    def pix2coords(r_idx: int, c_idx: int) -> Tuple[float, float]:
        """Converts raster row, col to projected/geographic (X, Y) coordinates at pixel center."""
        x = transform[2] + (c_idx + 0.5) * transform[0] + (r_idx + 0.5) * transform[1]
        y = transform[5] + (c_idx + 0.5) * transform[3] + (r_idx + 0.5) * transform[4]
        return float(x), float(y)

    visited_reach = np.zeros((nrows, ncols), dtype=bool)
    reaches: List[Dict[str, Any]] = []
    reach_id = 1

    for r_init, c_init in sorted_starts:
        if visited_reach[r_init, c_init]:
            continue

        curr_r, curr_c = r_init, c_init
        path: List[Tuple[int, int]] = []
        
        while True:
            path.append((curr_r, curr_c))
            visited_reach[curr_r, curr_c] = True
            
            nr = receiver_r[curr_r, curr_c]
            nc = receiver_c[curr_r, curr_c]
            
            if nr < 0 or nc < 0 or stream_mask[nr, nc] == 0:
                break  # Reached river mouth or grid boundary
            if visited_reach[nr, nc] or in_deg_stream[nr, nc] > 1:
                path.append((nr, nc))
                break  # Reached downstream confluence or existing network trunk
                
            curr_r, curr_c = nr, nc

        n_pts = len(path)
        if n_pts < 2:
            continue

        # Subdivide path by accumulating true curvilinear euclidean distance in meters
        idx = 0
        while idx < n_pts - 1:
            cum_dist = 0.0
            end_idx = idx + 1
            
            while end_idx < n_pts:
                pr_prev, pc_prev = path[end_idx - 1]
                pr_curr, pc_curr = path[end_idx]
                step_m = float(np.sqrt(((pr_curr - pr_prev) * pix_h)**2 + ((pc_curr - pc_prev) * pix_w)**2))
                cum_dist += step_m
                if cum_dist >= target_reach_len_m:
                    break
                end_idx += 1

            end_idx = min(end_idx, n_pts - 1)
            sub_path = path[idx:end_idx + 1]

            u_r, u_c = sub_path[0]   # Upstream candidate node
            d_r, d_c = sub_path[-1]  # Downstream candidate node

            up_x, up_y = pix2coords(u_r, u_c)
            down_x, down_y = pix2coords(d_r, d_c)

            z_upstream = float(filled_dem[u_r, u_c])
            z_downstream = float(filled_dem[d_r, d_c])
            gross_head = max(0.0, z_upstream - z_downstream)

            # True curvilinear reach length along all constituent pixel steps
            dr_arr = np.diff([p[0] for p in sub_path]).astype(float)
            dc_arr = np.diff([p[1] for p in sub_path]).astype(float)
            length_m = float(np.sum(np.sqrt((dr_arr * pix_h)**2 + (dc_arr * pix_w)**2)))
            if length_m < 1.0:
                length_m = float((pix_w + pix_h) / 2.0)

            # Hydraulic bed slope percentage
            slope_pct = (gross_head / max(length_m, 10.0)) * 100.0

            # Drainage areas at upstream point and downstream endpoint
            area_head_km2 = float(acc_km2[u_r, u_c])
            area_tail_km2 = float(acc_km2[d_r, d_c])

            # LineString vertex coordinate list [(x, y), ...]
            line_coords = [pix2coords(p[0], p[1]) for p in sub_path]

            reaches.append({
                "reach_id": reach_id,
                "district": district,
                "upstream_x": round(up_x, 6),
                "upstream_y": round(up_y, 6),
                "upstream_z_m": round(z_upstream, 2),
                "downstream_x": round(down_x, 6),
                "downstream_y": round(down_y, 6),
                "downstream_z_m": round(z_downstream, 2),
                # Backward-compatible aliases for UI/existing consumers
                "intake_x": round(up_x, 6),
                "intake_y": round(up_y, 6),
                "z_head_m": round(z_upstream, 2),
                "powerhouse_x": round(down_x, 6),
                "powerhouse_y": round(down_y, 6),
                "z_tail_m": round(z_downstream, 2),
                "gross_head_m": round(gross_head, 2),
                "catchment_head_km2": round(area_head_km2, 3),
                "catchment_tail_km2": round(area_tail_km2, 3),
                "catchment_km2": round(area_tail_km2, 3),
                "length_m": round(length_m, 1),
                "slope_pct": round(slope_pct, 2),
                "line_coords": line_coords
            })
            reach_id += 1
            idx = end_idx

    total_km = sum(r["length_m"] for r in reaches) / 1000.0
    lengths = [r["length_m"] for r in reaches]
    median_len = float(np.median(lengths)) if lengths else 0.0

    qa_stats = {
        "channel_heads": head_count,
        "confluences": confluence_count,
        "total_reaches": len(reaches),
        "total_stream_length_km": round(total_km, 2),
        "median_reach_length_m": round(median_len, 1),
        "target_reach_len_m": target_reach_len_m
    }

    print(f"    Reach segmentation complete: {len(reaches):,} discrete stream reaches ({total_km:,.1f} total stream km).")
    print(f"    Median reach length: {median_len:.1f}m (Target: {target_reach_len_m:.1f}m)")
    return reaches, qa_stats
