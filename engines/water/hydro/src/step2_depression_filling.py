# [DATA PROVENANCE]
# Data Source: Topographically conditioned DEM array from Step 1
# Classification: CALCULATED HYDROLOGICAL BASELINE
# Citations: Wang & Liu (2006); Independent Priority-Flood Algorithm Implementation

"""
step2_depression_filling.py
===========================
STEP 4. FILL SINKS & DEPRESSIONS: Detect and fill pits/depressions and resolve flat
areas to establish continuous downstream flow paths.

[Scientific Provenance & Implementation Disclosure]:
This module is an independent Python implementation inspired by the priority-flood
depression filling approach of Wang & Liu (2006). While it mirrors the least-cost spill
path concept with a minimum slope gradient (minslope), it is an independent implementation
and is not guaranteed to numerically reproduce SAGA GIS CFillSinks_WL C++ binary output.

District Reusability Note:
--------------------------
This algorithm performs priority-flood depression filling on any terrain.
The minimum slope parameter (min_slope_deg) guarantees that flat valley bottoms
retain a continuous downward hydraulic gradient, preventing artificial stagnation.
"""

from __future__ import annotations

import heapq
from typing import Tuple, Dict, Any
import numpy as np


def fill_sinks_wang_liu(
    dem: np.ndarray,
    min_slope_deg: float = 0.01,
    pix_w: float = 30.0,
    pix_h: float = 30.0
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Detects and fills pits, sinks, and depressions using a priority-flood queue approach.
    
    Parameters:
        dem: 2D numpy array of elevations (float32).
        min_slope_deg: Minimum downward gradient preserved along flow paths in degrees.
        pix_w: Metric cell width in meters.
        pix_h: Metric cell height in meters.
        
    Returns:
        filled: Depression-conditioned DEM with monotonic drainage connectivity.
        qa_stats: Dictionary containing filled cell count, max lift (m), and mean lift (m).
    """
    print("--> [STEP 4: FILL SINKS & DEPRESSIONS] Running priority-flood depression conditioning...")
    nrows, ncols = dem.shape
    filled = dem.copy()
    visited = np.zeros((nrows, ncols), dtype=bool)
    pq: list[tuple[float, int, int]] = []

    # Calculate minimum elevation difference per direction (tangent of min_slope_deg * cell distance)
    minslope_tan = np.tan(np.radians(min_slope_deg))
    d8_neighs = [
        (-1, -1, float(np.sqrt(pix_h**2 + pix_w**2))),  # NW
        (-1,  0, float(pix_h)),                         # N
        (-1,  1, float(np.sqrt(pix_h**2 + pix_w**2))),  # NE
        ( 0, -1, float(pix_w)),                         # W
        ( 0,  1, float(pix_w)),                         # E
        ( 1, -1, float(np.sqrt(pix_h**2 + pix_w**2))),  # SW
        ( 1,  0, float(pix_h)),                         # S
        ( 1,  1, float(np.sqrt(pix_h**2 + pix_w**2))),  # SE
    ]

    # Seed the priority queue with all boundary / spill cells (outer edge of the domain)
    for r in range(nrows):
        for c in (0, ncols - 1):
            if np.isfinite(dem[r, c]):
                heapq.heappush(pq, (float(dem[r, c]), r, c))
                visited[r, c] = True
    for c in range(ncols):
        for r in (0, nrows - 1):
            if not visited[r, c] and np.isfinite(dem[r, c]):
                heapq.heappush(pq, (float(dem[r, c]), r, c))
                visited[r, c] = True

    # Priority-Flood outward expansion
    filled_count = 0
    elevation_deltas: list[float] = []

    while pq:
        spill_z, r, c = heapq.heappop(pq)
        
        for dr, dc, dist in d8_neighs:
            nr, nc = r + dr, c + dc
            if 0 <= nr < nrows and 0 <= nc < ncols and not visited[nr, nc]:
                visited[nr, nc] = True
                nbr_z = float(dem[nr, nc])
                
                if np.isfinite(nbr_z):
                    min_diff = minslope_tan * dist
                    if nbr_z < (spill_z + min_diff):
                        lift = (spill_z + min_diff) - nbr_z
                        nbr_z = spill_z + min_diff
                        filled[nr, nc] = nbr_z
                        filled_count += 1
                        elevation_deltas.append(lift)
                        
                    heapq.heappush(pq, (nbr_z, nr, nc))

    max_lift_m = float(np.max(elevation_deltas)) if elevation_deltas else 0.0
    mean_lift_m = float(np.mean(elevation_deltas)) if elevation_deltas else 0.0

    qa_stats = {
        "filled_cells": filled_count,
        "filled_pct": round((filled_count / dem.size) * 100.0, 2),
        "max_elevation_lift_m": round(max_lift_m, 2),
        "mean_elevation_lift_m": round(mean_lift_m, 2),
        "min_slope_deg_used": min_slope_deg
    }

    print(f"    Conditioning complete: resolved {filled_count:,} depressed cells ({qa_stats['filled_pct']}%)")
    print(f"    QA Sink Lift Metrics: Max Lift = {max_lift_m:.2f}m | Mean Lift = {mean_lift_m:.2f}m")
    if max_lift_m > 50.0:
        print(f"    [QA NOTICE] Large sink filling lift detected (>50m). Verify whether raster has deep artificial quarries or valley damming.")
    print(f"    Conditioned DEM Elevation Range: {np.nanmin(filled):.1f}m to {np.nanmax(filled):.1f}m")
    return filled, qa_stats
