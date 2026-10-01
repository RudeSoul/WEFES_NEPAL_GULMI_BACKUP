# [DATA PROVENANCE]
# Data Source: Depression-conditioned DEM raster from Step 2
# Classification: CALCULATED HYDROLOGICAL BASELINE
# Citations: O'Callaghan & Mark (1984); Tarboton et al. (1991); Topological In-Degree Flow Accumulation

"""
step3_flow_routing.py
=====================
STEP 5. FLOW DIRECTION: Generate a D8 steepest-descent flow direction raster.
[Code Comment Citation]: O'Callaghan, J. F., and Mark, D. M. (1984). "The extraction of drainage networks from digital elevation models." Computer Vision, Graphics, and Image Processing.

STEP 6. FLOW ACCUMULATION: Calculate upstream drainage accumulation using topological in-degree sort.
[Code Comment Citation]: Tarboton, D. G., et al. (1991). "On the extraction of channel networks from digital elevation data." Hydrological Processes.

District Reusability Note:
--------------------------
Topographic flow routing is purely geometric. Regardless of whether the district is
mountainous or low relief, each cell routes 100% of its downslope water to its steepest
neighbor. Upstream catchment area (km²) is derived strictly from cell counts scaled by
metric pixel area (pix_w * pix_h / 1e6).
"""

from __future__ import annotations

from collections import deque
from typing import Tuple, Dict, Any
import numpy as np

# Standard D8 Direction encoding: (delta_row, delta_col, bit_code)
# Power-of-two bitmasks: 1=E, 2=SE, 4=S, 8=SW, 16=W, 32=NW, 64=N, 128=NE
D8_DIRECTIONS = [
    ( 0,  1,   1),  # East
    ( 1,  1,   2),  # South-East
    ( 1,  0,   4),  # South
    ( 1, -1,   8),  # South-West
    ( 0, -1,  16),  # West
    (-1, -1,  32),  # North-West
    (-1,  0,  64),  # North
    (-1,  1, 128),  # North-East
]


def compute_d8_flow_direction(
    filled_dem: np.ndarray,
    pix_w: float = 30.0,
    pix_h: float = 30.0
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, Dict[str, Any]]:
    """
    Computes Deterministic 8 (D8) steepest descent flow direction raster.
    
    Parameters:
        filled_dem: Depression-free elevation array.
        pix_w: Planar cell width in meters.
        pix_h: Planar cell height in meters.
        
    Returns:
        fdir: 2D uint8 raster containing D8 direction bitmasks.
        receiver_r: 2D int32 raster containing downstream receiver row index (-1 if outlet).
        receiver_c: 2D int32 raster containing downstream receiver column index (-1 if outlet).
        qa_stats: Statistics on active draining cells and boundary outlets.
    """
    print("--> [STEP 5: FLOW DIRECTION] Calculating D8 steepest descent flow directions...")
    nrows, ncols = filled_dem.shape
    fdir = np.zeros((nrows, ncols), dtype=np.uint8)
    best_drop = np.full((nrows, ncols), -np.inf, dtype=np.float32)

    receiver_r = np.full((nrows, ncols), -1, dtype=np.int32)
    receiver_c = np.full((nrows, ncols), -1, dtype=np.int32)

    rows_grid, cols_grid = np.indices((nrows, ncols), dtype=np.int32)

    for dr, dc, code in D8_DIRECTIONS:
        dist_m = float(np.sqrt((dr * pix_h)**2 + (dc * pix_w)**2))
        
        nr_idx = np.clip(rows_grid + dr, 0, nrows - 1)
        nc_idx = np.clip(cols_grid + dc, 0, ncols - 1)
        nbr_z = filled_dem[nr_idx, nc_idx]

        drop = (filled_dem - nbr_z) / dist_m
        
        # Valid interior bounds mask
        valid_bounds = (
            (rows_grid + dr >= 0) & (rows_grid + dr < nrows) &
            (cols_grid + dc >= 0) & (cols_grid + dc < ncols)
        )
        drop[~valid_bounds] = -np.inf

        steeper = (drop > best_drop) & (drop > 0.0)
        best_drop[steeper] = drop[steeper]
        fdir[steeper] = code

    # Map downstream receiver cells based on winning D8 direction
    for dr, dc, code in D8_DIRECTIONS:
        mask = (fdir == code)
        receiver_r[mask] = rows_grid[mask] + dr
        receiver_c[mask] = cols_grid[mask] + dc

    # Invalidate any boundary overflow (cells draining beyond the raster boundary)
    boundary_out = (receiver_r < 0) | (receiver_r >= nrows) | (receiver_c < 0) | (receiver_c >= ncols)
    receiver_r[boundary_out] = -1
    receiver_c[boundary_out] = -1

    # Classify cell types
    active_draining = int(np.sum((receiver_r >= 0) & (receiver_c >= 0)))
    boundary_outlets = int(np.sum((receiver_r == -1) | (receiver_c == -1)))

    qa_stats = {
        "active_draining_cells": active_draining,
        "boundary_outlet_cells": boundary_outlets,
        "total_cells": nrows * ncols
    }

    print(f"    D8 flow direction matrix calculated. Active draining cells: {active_draining:,} | Domain outlets: {boundary_outlets:,}")
    return fdir, receiver_r, receiver_c, qa_stats


def compute_d8_flow_accumulation(
    receiver_r: np.ndarray,
    receiver_c: np.ndarray,
    pix_w: float = 30.0,
    pix_h: float = 30.0
) -> Tuple[np.ndarray, np.ndarray, Dict[str, Any]]:
    """
    Computes upstream drainage accumulation using topological in-degree sort (Kahn's DAG algorithm).
    Explicitly verifies that the flow graph is a directed acyclic graph (DAG) with 0 topological cycles.
    
    Parameters:
        receiver_r: Downstream row pointers.
        receiver_c: Downstream column pointers.
        pix_w: Planar cell width in meters.
        pix_h: Planar cell height in meters.
        
    Returns:
        acc_cells: Number of contributing upstream cells for every pixel.
        acc_km2: Contributing upstream drainage catchment area in square kilometers (km²).
        qa_stats: Validation metrics including cycle check verification.
    """
    print("--> [STEP 6: FLOW ACCUMULATION] Computing drainage accumulation via topological DAG sort...")
    nrows, ncols = receiver_r.shape
    total_cells = nrows * ncols
    pix_area_m2 = pix_w * pix_h

    # 1. Calculate in-degree (number of upstream neighbors pouring into each cell)
    in_deg = np.zeros((nrows, ncols), dtype=np.int32)
    has_receiver = (receiver_r >= 0) & (receiver_c >= 0)
    
    rr_valid = receiver_r[has_receiver]
    cc_valid = receiver_c[has_receiver]
    np.add.at(in_deg, (rr_valid, cc_valid), 1)

    # 2. Seed queue with all watershed divide/headwater cells (in-degree == 0)
    queue = deque(zip(*np.where(in_deg == 0)))
    headwater_count = len(queue)
    acc_cells = np.ones((nrows, ncols), dtype=np.float64)

    # 3. Topological sweep downwards to stream outlets with DAG cycle tracking
    processed_cells = 0
    while queue:
        r, c = queue.popleft()
        processed_cells += 1
        
        rr, cc = receiver_r[r, c], receiver_c[r, c]
        if rr >= 0 and cc >= 0:
            acc_cells[rr, cc] += acc_cells[r, c]
            in_deg[rr, cc] -= 1
            if in_deg[rr, cc] == 0:
                queue.append((rr, cc))

    # 4. Critical Scientific Verification: Acyclic DAG integrity
    if processed_cells != total_cells:
        unresolved = total_cells - processed_cells
        raise RuntimeError(
            f"[FATAL TOPOLOGY ERROR] Flow accumulation graph contains {unresolved:,} unresolved cells or circular loops.\n"
            f"Expected {total_cells:,} processed cells but completed {processed_cells:,}."
        )

    acc_km2 = (acc_cells * pix_area_m2) / 1e6
    max_acc_km2 = float(np.max(acc_km2))
    max_acc_cells = float(np.max(acc_cells))

    qa_stats = {
        "headwater_cells": headwater_count,
        "processed_cells": processed_cells,
        "unresolved_cells": 0,
        "is_acyclic_dag": True,
        "max_catchment_km2": round(max_acc_km2, 2),
        "max_catchment_cells": int(max_acc_cells)
    }

    print(f"    Topological sweep verified DAG acyclic (0 cycles, {processed_cells:,}/{total_cells:,} cells processed).")
    print(f"    Max Basin Catchment Area: {max_acc_km2:,.2f} km² ({max_acc_cells:,.0f} cells)")
    return acc_cells, acc_km2, qa_stats
