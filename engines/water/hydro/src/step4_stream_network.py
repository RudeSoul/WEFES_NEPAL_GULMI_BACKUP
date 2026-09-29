# [DATA PROVENANCE]
# Data Source: Flow accumulation raster and filled DEM from Steps 2 & 3
# Classification: CALCULATED HYDROGRAPHIC NETWORK & TOPOGRAPHIC REACHES
# Citations: Jenson & Dominique (1988); SAGA GIS CD8_Flow_Analysis (Conrad, 2003)

"""
step4_stream_network.py
=======================
STEP 7. EXTRACT STREAMS: Segment a stream network based on the user-defined pixel
threshold accumulation count.
[Code Comment Citation]: Jenson, S. K., and Dominique, J. O. (1988). "Extracting topographic structure from digital elevation model data for geographic information system analysis." Photogrammetric Engineering and Remote Sensing.

STEP 8. SEGMENT REACHES & EXTRACT HEAD/TAIL: Group the cells into stream reaches.
For each segment, programmatically identify the coordinates and elevations (Z-values)
of its highest upstream point (Intake/Head) and lowest downstream point (Powerhouse/Tail)
from the filled DEM.

District Reusability Note:
--------------------------
The stream extraction threshold is completely user-configurable via CLI argument (--threshold).
In high-relief districts (e.g. Baglung, Mustang), smaller thresholds (e.g. 200–500 cells)
extract steep mountain headwater torrents ideal for high-head micro-hydro. In low-relief
districts (e.g. Jhapa), higher thresholds (e.g. 2,000–5,000 cells) capture major river stems.
"""

from __future__ import annotations

from typing import List, Dict, Any, Tuple
import numpy as np
from rasterio.transform import Affine


def extract_stream_network(
    acc_cells: np.ndarray,
    threshold: int = 500
) -> np.ndarray:
    """
    Extracts a binary stream network raster based on contributing pixel threshold count.
    
    [Code Comment Citation]: Jenson, S. K., and Dominique, J. O. (1988). "Extracting topographic structure from digital elevation model data for geographic information system analysis." Photogrammetric Engineering and Remote Sensing.
    
    Parameters:
        acc_cells: Flow accumulation raster (in cells).
        threshold: Minimum upstream cell count required to initiate a channel.
        
    Returns:
        stream_mask: 2D uint8 array (1 = stream channel, 0 = hillslope).
    """
    print(f"--> [STEP 7: EXTRACT STREAMS] Extracting stream network at threshold >= {threshold:,} cells...")
    stream_mask = (acc_cells >= threshold).astype(np.uint8)
    stream_cell_count = int(np.sum(stream_mask))
    print(f"    Stream extraction complete. Total active channel cells: {stream_cell_count:,}")
    return stream_mask


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
) -> List[Dict[str, Any]]:
    """
    Groups stream cells into reaches following SAGA GIS CD8_Flow_Analysis (Get_Segments).
    Identifies exact coordinates and Z-values for Intake (Head) and Powerhouse (Tail).
    
    Parameters:
        filled_dem: Depression-free elevation array.
        stream_mask: Extracted binary stream mask.
        receiver_r: Downstream row receivers.
        receiver_c: Downstream column receivers.
        acc_km2: Upstream catchment area in km².
        transform: Affine raster transform for pixel-to-geographic projection.
        pix_w: Planar cell width in meters.
        pix_h: Planar cell height in meters.
        target_reach_len_m: Desired reach length discretization step in meters.
        district: District name for administrative tagging.
        
    Returns:
        List of reach dictionaries with head/tail elevations, coordinates, length, slope, and geometries.
    """
    print(f"--> [STEP 8: SEGMENT REACHES] Delineating stream reaches and extracting Head/Tail coordinates...")
    nrows, ncols = filled_dem.shape
    
    # Calculate stream in-degrees to locate springs (channel heads) and confluences (junctions)
    in_deg_stream = np.zeros((nrows, ncols), dtype=np.int8)
    s_r, s_c = np.where(stream_mask == 1)
    
    down_r = receiver_r[s_r, s_c]
    down_c = receiver_c[s_r, s_c]
    valid_down = (down_r >= 0) & (down_r < nrows) & (down_c >= 0) & (down_c < ncols)
    valid_stream_down = valid_down & (stream_mask[down_r, down_c] == 1)
    
    np.add.at(in_deg_stream, (down_r[valid_stream_down], down_c[valid_stream_down]), 1)

    channel_heads = (stream_mask == 1) & (in_deg_stream == 0)
    confluences = (stream_mask == 1) & (in_deg_stream > 1)
    start_points = np.where(channel_heads | confluences)
    start_coords = list(zip(start_points[0], start_points[1]))

    # Sort starting points from highest elevation to lowest elevation (SAGA top-down priority)
    start_elevs = [filled_dem[r, c] for r, c in start_coords]
    sorted_starts = [start_coords[i] for i in np.argsort(start_elevs)[::-1]]

    # Step in pixels for reach segmentation
    mean_res_m = (pix_w + pix_h) / 2.0
    target_pix_step = max(3, int(round(target_reach_len_m / mean_res_m)))

    def pix2coords(r_idx: int, c_idx: int) -> Tuple[float, float]:
        """Converts raster row, col to projected/geographic (X, Y) coordinates."""
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
                break  # Reached downstream confluence or processed segment
                
            curr_r, curr_c = nr, nc

        n_pts = len(path)
        if n_pts < 2:
            continue

        # Subdivide long trunk paths into discrete reach candidates (~500m steps)
        idx = 0
        while idx < n_pts - 1:
            end_idx = min(idx + target_pix_step, n_pts - 1)
            sub_path = path[idx:end_idx + 1]
            
            u_r, u_c = sub_path[0]   # Intake / Head
            d_r, d_c = sub_path[-1]  # Powerhouse / Tail

            # Programmatically extract Intake (Head) and Powerhouse (Tail) coordinates and elevations
            head_x, head_y = pix2coords(u_r, u_c)
            tail_x, tail_y = pix2coords(d_r, d_c)

            z_head = float(filled_dem[u_r, u_c])
            z_tail = float(filled_dem[d_r, d_c])
            gross_head = max(0.0, z_head - z_tail)

            # Planar reach distance
            dr_arr = np.diff([p[0] for p in sub_path]).astype(float)
            dc_arr = np.diff([p[1] for p in sub_path]).astype(float)
            length_m = float(np.sum(np.sqrt((dr_arr * pix_h)**2 + (dc_arr * pix_w)**2)))
            if length_m < 1.0:
                length_m = mean_res_m

            # Bed slope percentage
            slope_pct = (gross_head / max(length_m, 10.0)) * 100.0

            # Drainage areas at Intake and Powerhouse
            area_head_km2 = float(acc_km2[u_r, u_c])
            area_tail_km2 = float(acc_km2[d_r, d_c])

            # LineString vertex geometry list [(x, y), ...]
            line_coords = [pix2coords(p[0], p[1]) for p in sub_path]

            reaches.append({
                "reach_id": reach_id,
                "district": district,
                "intake_x": round(head_x, 6),
                "intake_y": round(head_y, 6),
                "z_head_m": round(z_head, 2),
                "powerhouse_x": round(tail_x, 6),
                "powerhouse_y": round(tail_y, 6),
                "z_tail_m": round(z_tail, 2),
                "gross_head_m": round(gross_head, 2),
                "catchment_km2": round(area_tail_km2, 3),
                "length_m": round(length_m, 1),
                "slope_pct": round(slope_pct, 2),
                "line_coords": line_coords
            })
            reach_id += 1
            idx = end_idx

    print(f"    Reach segmentation complete. Total discrete stream reaches delineated: {len(reaches):,}")
    return reaches
