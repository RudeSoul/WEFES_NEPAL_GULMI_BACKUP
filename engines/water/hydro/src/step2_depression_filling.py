# [DATA PROVENANCE]
# Data Source: Topographically conditioned DEM array from Step 1
# Classification: CALCULATED HYDROLOGICAL BASELINE
# Citations: Wang & Liu (2006); SAGA GIS CFillSinks_WL (Wichmann, 2007)

"""
step2_depression_filling.py
===========================
STEP 4. FILL SINKS & DEPRESSIONS: Detect and fill pits/depressions and resolve flat
areas to establish continuous downstream flow paths.

[Code Comment Citation]: Wang, L., and Liu, H. (2006). "An efficient method for identifying and filling depressions in digital elevation models." International Journal of Geographical Information Science.

District Reusability Note:
--------------------------
This algorithm performs priority-flood least-cost path depression filling on any
topography (Himalayan peaks, middle hills, or southern plains). The minimum slope
parameter (minslope) guarantees that flat valley bottoms (such as river plains or
terraced valleys) retain a continuous downward hydraulic gradient, preventing
artificial stagnation or broken reach segments.
"""

from __future__ import annotations

import heapq
import numpy as np


def fill_sinks_wang_liu(
    dem: np.ndarray,
    min_slope_deg: float = 0.01,
    pix_w: float = 30.0,
    pix_h: float = 30.0
) -> np.ndarray:
    """
    Detects and fills pits, sinks, and depressions using the Wang & Liu (2006)
    Priority-Queue algorithm as implemented in SAGA GIS (CFillSinks_WL).
    
    [Code Comment Citation]: Wang, L., and Liu, H. (2006). "An efficient method for identifying and filling depressions in digital elevation models." International Journal of Geographical Information Science.
    
    Parameters:
        dem: 2D numpy array of elevations (float32).
        min_slope_deg: Minimum downward gradient preserved along flow paths in degrees.
        pix_w: Metric cell width in meters.
        pix_h: Metric cell height in meters.
        
    Returns:
        filled: Depression-free DEM with monotonic drainage connectivity.
    """
    print("--> [STEP 4: FILL SINKS & DEPRESSIONS] Running Wang & Liu (2006) depression filling...")
    nrows, ncols = dem.shape
    filled = dem.copy()
    visited = np.zeros((nrows, ncols), dtype=bool)
    pq: list[tuple[float, int, int]] = []

    # Calculate minimum elevation difference per direction (SAGA mindiff[8])
    minslope_tan = np.tan(np.radians(min_slope_deg))
    d8_neighs = [
        (-1, -1, np.sqrt(pix_h**2 + pix_w**2)),  # NW
        (-1,  0, pix_h),                         # N
        (-1,  1, np.sqrt(pix_h**2 + pix_w**2)),  # NE
        ( 0, -1, pix_w),                         # W
        ( 0,  1, pix_w),                         # E
        ( 1, -1, np.sqrt(pix_h**2 + pix_w**2)),  # SW
        ( 1,  0, pix_h),                         # S
        ( 1,  1, np.sqrt(pix_h**2 + pix_w**2)),  # SE
    ]

    # Seed the priority queue with all boundary / spill cells (SAGA FillSinks_WL Pass 1)
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

    # SAGA Pass 2: Work through least-cost spill path
    filled_count = 0
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
                        nbr_z = spill_z + min_diff
                        filled[nr, nc] = nbr_z
                        filled_count += 1
                        
                    heapq.heappush(pq, (nbr_z, nr, nc))

    print(f"    Wang & Liu (2006) conditioning complete. Resolved {filled_count:,} depressed cells.")
    print(f"    Conditioned DEM Elevation Range: {np.nanmin(filled):.1f}m to {np.nanmax(filled):.1f}m")
    return filled
