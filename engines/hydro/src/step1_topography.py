"""
step1_topography.py
===================
Step 1: Spatial & Topographic Analysis (GIS Pipeline)

Technical Functionality:
  1. DEM Ingestion: Reads any projected/geographic raster via rasterio.
  2. Metric Calibration: Converts angular degrees to planar meters at local latitude.
  3. Hydrological Conditioning: Barnes et al. (2014) Priority-Flood depression filling.
  4. Flow Routing: Deterministic 8-neighbor (D8) steepest-descent direction encoding.
  5. Flow Accumulation: In-degree topological sort (Kahn's algorithm) to compute upstream catchment area (km²).
  6. Stream Extraction: Dual thresholding for Commercial RoR (>= 10 km²) and Micro-Hydro (>= 0.5 km²).
  7. Reach Segmentation: Continuous topological stream tracing at ~500m intervals.
     Extracts upstream elevation (Zu), downstream elevation (Zd), gross head (Hgross = Zu - Zd),
     length, bed slope, and geographic midpoint coordinates.

How to reproduce this step in desktop QGIS:
  - Fill Sinks: In QGIS Processing Toolbox, run 'Fill Depressions' (Whitebox) or 'Fill Sinks (Wang & Liu)' (SAGA).
  - Flow Direction & Accumulation: Run 'D8 Flow Accumulation' (Whitebox).
  - Stream Extraction: Run 'Extract Streams' or Raster Calculator: ("accumulation" >= 555).
  - Reach Segmentation: Run 'Raster Streams to Vector' followed by 'Split lines by maximum length' (length: 500m).
  - Elevation Sampling: Run 'Sample raster values' on reach start and end vertices.
"""

import os
import heapq
from collections import deque
import numpy as np
import pandas as pd
import rasterio

D8_OFFSETS = [
    (0,  1,  1),   # East
    (1,  1,  2),   # South-East
    (1,  0,  4),   # South
    (1, -1,  8),   # South-West
    (0, -1, 16),   # West
    (-1,-1, 32),   # North-West
    (-1, 0, 64),   # North
    (-1, 1, 128)   # North-East
]


def run_topographic_analysis(
    dem_path: str,
    output_dir: str,
    target_reach_len_m: float = 500.0,
    micro_threshold_km2: float = 0.5,
    ror_threshold_km2: float = 10.0,
    save_rasters: bool = True
) -> pd.DataFrame:
    """
    Executes full topographic conditioning, D8 routing, stream extraction,
    and continuous 500m reach delineation on any input DEM GeoTIFF.

    Parameters:
      dem_path: Path to raw input DEM GeoTIFF.
      output_dir: Directory where conditioned GeoTIFFs and intermediate products are saved.
      target_reach_len_m: Desired reach length step in meters (default 500m).
      micro_threshold_km2: Minimum upstream catchment area to initiate a micro-hydro stream (default 0.5 km²).
      ror_threshold_km2: Catchment area threshold for commercial RoR rivers (default 10.0 km²).
      save_rasters: Whether to persist intermediate GeoTIFFs to disk.

    Returns:
      pd.DataFrame: Tabulated reaches with reach_id, Zu, Zd, Hgross, Au, Ad, length_m, slope_pct, mid_lon, mid_lat.
    """
    os.makedirs(output_dir, exist_ok=True)
    print(f"--> [Step 1] Ingesting DEM: {os.path.basename(dem_path)}")

    with rasterio.open(dem_path) as src:
        dem_raw = src.read(1).astype(np.float32)
        profile = src.profile.copy()
        transform = src.transform

    nrows, ncols = dem_raw.shape
    res_x = abs(transform[0])
    res_y = abs(transform[4])

    # Approximate planar cell size (meters) based on center latitude
    lat_center = transform[5] + (nrows / 2.0) * transform[4]
    m_per_deg_lat = 111320.0
    m_per_deg_lon = 111320.0 * np.cos(np.radians(lat_center))
    pix_w = res_x * m_per_deg_lon
    pix_h = res_y * m_per_deg_lat
    pix_area_m2 = pix_w * pix_h

    # 1. Hydrological Conditioning (Priority-Flood)
    print("    Running Priority-Flood depression filling...")
    filled = dem_raw.copy()
    visited = np.zeros((nrows, ncols), dtype=bool)
    pq = []

    for r in range(nrows):
        for c in (0, ncols - 1):
            if np.isfinite(dem_raw[r, c]) and dem_raw[r, c] > 0:
                heapq.heappush(pq, (float(dem_raw[r, c]), r, c))
                visited[r, c] = True
    for c in range(ncols):
        for r in (0, nrows - 1):
            if not visited[r, c] and np.isfinite(dem_raw[r, c]) and dem_raw[r, c] > 0:
                heapq.heappush(pq, (float(dem_raw[r, c]), r, c))
                visited[r, c] = True

    d8_neighs = [(-1,-1), (-1,0), (-1,1), (0,-1), (0,1), (1,-1), (1,0), (1,1)]
    while pq:
        elev, r, c = heapq.heappop(pq)
        for dr, dc in d8_neighs:
            nr, nc = r + dr, c + dc
            if 0 <= nr < nrows and 0 <= nc < ncols and not visited[nr, nc]:
                visited[nr, nc] = True
                v = float(dem_raw[nr, nc])
                if np.isfinite(v) and v > 0:
                    if v < elev:
                        v = elev + 1e-4
                        filled[nr, nc] = v
                    heapq.heappush(pq, (v, nr, nc))

    # 2. D8 Flow Direction
    print("    Computing D8 flow direction matrix...")
    fdir = np.zeros((nrows, ncols), dtype=np.uint8)
    best_drop = np.full((nrows, ncols), -np.inf, dtype=np.float32)

    for dr, dc, code in D8_OFFSETS:
        nr_idx = np.clip(np.arange(nrows) + dr, 0, nrows - 1)
        nc_idx = np.clip(np.arange(ncols) + dc, 0, ncols - 1)
        nbr = filled[np.ix_(nr_idx, nc_idx)]
        dist = np.sqrt(dr * dr + dc * dc)
        drop = (filled - nbr) / dist
        row_valid = (np.arange(nrows)[:, None] + dr >= 0) & (np.arange(nrows)[:, None] + dr < nrows)
        col_valid = (np.arange(ncols)[None, :] + dc >= 0) & (np.arange(ncols)[None, :] + dc < ncols)
        drop[~(row_valid & col_valid)] = -np.inf
        update = drop > best_drop
        best_drop[update] = drop[update]
        fdir[update] = code

    # 3. Flow Accumulation
    print("    Computing flow accumulation via topological sort...")
    receiver_r = np.full((nrows, ncols), -1, dtype=np.int32)
    receiver_c = np.full((nrows, ncols), -1, dtype=np.int32)
    for dr, dc, code in D8_OFFSETS:
        rows, cols = np.where(fdir == code)
        rr = rows + dr
        cc = cols + dc
        val = (rr >= 0) & (rr < nrows) & (cc >= 0) & (cc < ncols)
        receiver_r[rows[val], cols[val]] = rr[val]
        receiver_c[rows[val], cols[val]] = cc[val]

    in_deg = np.zeros((nrows, ncols), dtype=np.int32)
    vr, vc = np.where(receiver_r >= 0)
    np.add.at(in_deg, (receiver_r[vr, vc], receiver_c[vr, vc]), 1)

    queue = deque(zip(*np.where(in_deg == 0)))
    acc = np.ones((nrows, ncols), dtype=np.float64)
    while queue:
        r, c = queue.popleft()
        rr, cc = receiver_r[r, c], receiver_c[r, c]
        if rr >= 0:
            acc[rr, cc] += acc[r, c]
            in_deg[rr, cc] -= 1
            if in_deg[rr, cc] == 0:
                queue.append((rr, cc))

    acc_km2 = (acc * pix_area_m2) / 1e6

    # 4. Stream Masks
    mhy_mask = (acc_km2 >= micro_threshold_km2).astype(np.uint8)
    ror_mask = (acc_km2 >= ror_threshold_km2).astype(np.uint8)

    # 5. Strahler Order Proxy
    strahler = np.zeros((nrows, ncols), dtype=np.uint8)
    strahler[acc_km2 >= micro_threshold_km2] = 1
    strahler[acc_km2 >= 2.0] = 2
    strahler[acc_km2 >= 10.0] = 3
    strahler[acc_km2 >= 50.0] = 4
    strahler[acc_km2 >= 200.0] = 5

    # 6. Save GeoTIFF Rasters
    if save_rasters:
        cond_path = os.path.join(output_dir, "conditioned_dem.tif")
        fdir_path = os.path.join(output_dir, "flow_direction.tif")
        facc_path = os.path.join(output_dir, "flow_accumulation.tif")
        mhy_path  = os.path.join(output_dir, "stream_network_microhydro.tif")
        ror_path  = os.path.join(output_dir, "stream_network_ror.tif")
        str_path  = os.path.join(output_dir, "strahler_order.tif")

        prof_f32 = profile.copy()
        prof_f32.update(dtype=rasterio.float32, nodata=-9999.0)
        with rasterio.open(cond_path, "w", **prof_f32) as dst:
            dst.write(filled.astype(np.float32), 1)
        with rasterio.open(facc_path, "w", **prof_f32) as dst:
            dst.write(acc_km2.astype(np.float32), 1)

        prof_u8 = profile.copy()
        prof_u8.update(dtype=rasterio.uint8, nodata=0)
        with rasterio.open(fdir_path, "w", **prof_u8) as dst:
            dst.write(fdir, 1)
        with rasterio.open(mhy_path, "w", **prof_u8) as dst:
            dst.write(mhy_mask, 1)
        with rasterio.open(ror_path, "w", **prof_u8) as dst:
            dst.write(ror_mask, 1)
        with rasterio.open(str_path, "w", **prof_u8) as dst:
            dst.write(strahler, 1)

    # 7. Continuous Reach Tracing
    print(f"    Tracing continuous stream reaches (~{target_reach_len_m}m steps)...")
    target_pix = max(5, int(round(target_reach_len_m / ((pix_w + pix_h) / 2.0))))

    in_deg_stream = np.zeros((nrows, ncols), dtype=np.int8)
    s_r, s_c = np.where(mhy_mask == 1)
    down_r = receiver_r[s_r, s_c]
    down_c = receiver_c[s_r, s_c]
    in_b = (down_r >= 0) & (down_r < nrows) & (down_c >= 0) & (down_c < ncols)
    valid_down = in_b & (mhy_mask[down_r[in_b], down_c[in_b]] == 1)
    np.add.at(in_deg_stream, (down_r[in_b][valid_down[in_b]], down_c[in_b][valid_down[in_b]]), 1)

    channel_heads = (mhy_mask == 1) & (in_deg_stream == 0)
    confluences   = (mhy_mask == 1) & (in_deg_stream > 1)
    start_points  = np.where(channel_heads | confluences)
    start_pts_list = list(zip(start_points[0], start_points[1]))

    start_elevs = [filled[r, c] for r, c in start_pts_list]
    sorted_starts = [start_pts_list[i] for i in np.argsort(start_elevs)[::-1]]

    visited_reach = np.zeros((nrows, ncols), dtype=bool)
    reaches = []
    reach_id = 0

    def pix2lonlat(r_idx, c_idx):
        lon = transform[2] + (c_idx + 0.5) * transform[0]
        lat = transform[5] + (r_idx + 0.5) * transform[4]
        return float(lon), float(lat)

    for r_init, c_init in sorted_starts:
        if visited_reach[r_init, c_init]:
            continue

        curr_r, curr_c = r_init, c_init
        path = []
        while True:
            path.append((curr_r, curr_c))
            visited_reach[curr_r, curr_c] = True
            next_r = receiver_r[curr_r, curr_c]
            next_c = receiver_c[curr_r, curr_c]
            if next_r < 0 or next_c < 0 or mhy_mask[next_r, next_c] == 0:
                break
            if visited_reach[next_r, next_c] or in_deg_stream[next_r, next_c] > 1:
                path.append((next_r, next_c))
                break
            curr_r, curr_c = next_r, next_c

        n_p = len(path)
        if n_p < 2:
            continue

        idx = 0
        while idx < n_p - 1:
            end_idx = min(idx + target_pix, n_p - 1)
            sub_p = path[idx:end_idx + 1]
            u_r, u_c = sub_p[0]
            d_r, d_c = sub_p[-1]

            Z_u = float(filled[u_r, u_c])
            Z_d = float(filled[d_r, d_c])
            H_gross = max(0.0, Z_u - Z_d)

            dr_arr = np.diff([p[0] for p in sub_p]).astype(float)
            dc_arr = np.diff([p[1] for p in sub_p]).astype(float)
            length_m = float(np.sum(np.sqrt((dr_arr * pix_h)**2 + (dc_arr * pix_w)**2)))
            if length_m < 1.0:
                length_m = float((pix_w + pix_h) / 2.0)

            mid_pt = sub_p[len(sub_p) // 2]
            mid_lon, mid_lat = pix2lonlat(mid_pt[0], mid_pt[1])
            A_u_km2 = float(acc_km2[u_r, u_c])
            A_d_km2 = float(acc_km2[d_r, d_c])

            reaches.append({
                "reach_id": reach_id,
                "strahler_ord": int(strahler[mid_pt[0], mid_pt[1]]),
                "Z_u_m": round(Z_u, 1),
                "Z_d_m": round(Z_d, 1),
                "H_gross_m": round(H_gross, 1),
                "A_u_km2": round(A_u_km2, 2),
                "A_d_km2": round(A_d_km2, 2),
                "length_m": round(length_m, 1),
                "slope_pct": round((H_gross / max(length_m, 10.0)) * 100.0, 2),
                "mid_lon": round(mid_lon, 6),
                "mid_lat": round(mid_lat, 6),
                "is_ror": 1 if A_d_km2 >= ror_threshold_km2 else 0,
                "is_microhydro": 1 if (micro_threshold_km2 <= A_d_km2 < ror_threshold_km2) else 0
            })
            reach_id += 1
            idx = end_idx

    df_reaches = pd.DataFrame(reaches)
    print(f"    Total Reaches Extracted: {len(df_reaches):,}")
    return df_reaches
