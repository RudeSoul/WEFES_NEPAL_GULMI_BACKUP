# [DATA PROVENANCE]
# Data Source: User-specified Digital Elevation Model (DEM GeoTIFF)
# Classification: OBSERVED REAL & TOPOGRAPHIC BASELINE
# Citations: Conrad et al. (2015); SAGA GIS CGrid_Gaps Dirichlet Laplace Smoothing

"""
step1_dem_io.py
================
STEP 2. LOAD DEM: Read input DEM file into memory, validate integrity, and calibrate metric resolution.
STEP 3. HANDLE NODATA: Identify and interpolate void/NoData cells using iterative Dirichlet-Laplace boundary smoothing.

District Reusability & Terrain Agnostic Note:
---------------------------------------------
This module is completely terrain and coordinate agnostic. It can ingest a DEM for any
district worldwide (e.g. Gulmi, Mustang, Baglung, Solukhumbu, or international catchments).
It inspects the raster Coordinate Reference System (CRS) and affine geotransform:
- If projected (e.g., UTM Zone 44N / 45N in meters), metric spacing is preserved directly.
- If geographic (EPSG:4326 in degrees), metric spacing is approximated at the raster centroid latitude.
"""

from __future__ import annotations

import os
from typing import Tuple, Dict, Any
import numpy as np
import rasterio
from rasterio.transform import Affine
from scipy import ndimage


def load_dem_and_grid(dem_path: str) -> Tuple[np.ndarray, Affine, Dict[str, Any], float, float, Dict[str, Any]]:
    """
    Reads an input DEM GeoTIFF into memory, validates geometry/metadata, and derives metric cell spacing.
    
    Parameters:
        dem_path: Path to the input GeoTIFF raster.
        
    Returns:
        dem_raw: 2D numpy array (float32) of raw elevations.
        transform: Affine geotransform.
        profile: Rasterio metadata profile.
        pix_w: Metric cell width in meters.
        pix_h: Metric cell height in meters.
        qa_meta: Dictionary of validation QA metrics.
    """
    if not os.path.exists(dem_path):
        raise FileNotFoundError(f"[ERROR] Input DEM not found at physical disk path: {dem_path}")
        
    print(f"--> [STEP 2: LOAD DEM] Reading raster: {os.path.basename(dem_path)}")
    with rasterio.open(dem_path) as src:
        # QA Check 1: Band count
        if src.count != 1:
            raise ValueError(f"[ERROR] Expected single-band DEM raster, but found {src.count} bands in: {dem_path}")
            
        dem_raw = src.read(1).astype(np.float32)
        profile = src.profile.copy()
        transform = src.transform
        crs = src.crs
        bounds = src.bounds

    nrows, ncols = dem_raw.shape
    
    # QA Check 2: Non-zero dimensions
    if nrows < 10 or ncols < 10:
        raise ValueError(f"[ERROR] DEM raster dimensions too small ({nrows}x{ncols}) to model drainage.")

    # QA Check 3: CRS existence
    if crs is None:
        print("    [WARNING] Input DEM lacks CRS metadata! Assuming geographic WGS84 (EPSG:4326).")
        crs = rasterio.crs.CRS.from_epsg(4326)
        profile["crs"] = crs

    # QA Check 4: Geotransform validity
    res_x = abs(transform[0])
    res_y = abs(transform[4])
    if res_x == 0 or res_y == 0:
        raise ValueError(f"[ERROR] Invalid affine geotransform: zero pixel resolution ({res_x}, {res_y}).")

    # Metric resolution calculation
    is_projected = crs.is_projected if crs else False
    if is_projected:
        pix_w = float(res_x)
        pix_h = float(res_y)
        print(f"    Detected Projected CRS: {crs} (Planar Resolution: {pix_w:.2f}m x {pix_h:.2f}m)")
    else:
        # Geographic CRS (degrees) - approximate metric spacing at centroid latitude
        lat_center = transform[5] + (nrows / 2.0) * transform[4]
        m_per_deg_lat = 111320.0
        m_per_deg_lon = 111320.0 * np.cos(np.radians(lat_center))
        pix_w = float(res_x * m_per_deg_lon)
        pix_h = float(res_y * m_per_deg_lat)
        print(f"    Detected Geographic CRS: {crs}")
        print(f"    Centroid Lat {lat_center:.2f}° metric approximation: {pix_w:.2f}m x {pix_h:.2f}m")

    # QA Check 5: Plausible elevation check on valid cells
    valid_cells = np.isfinite(dem_raw) & (dem_raw > -9000.0)
    if not np.any(valid_cells):
        raise ValueError(f"[ERROR] DEM contains zero valid elevation values.")
        
    elev_min = float(np.min(dem_raw[valid_cells]))
    elev_max = float(np.max(dem_raw[valid_cells]))
    
    if elev_min < -500.0 or elev_max > 9000.0:
        print(f"    [WARNING] Extreme elevation bounds detected ({elev_min:.1f}m to {elev_max:.1f}m). Verify raster.")

    qa_meta = {
        "dem_path": dem_path,
        "nrows": nrows,
        "ncols": ncols,
        "total_cells": nrows * ncols,
        "crs": str(crs),
        "is_projected": is_projected,
        "pix_w_m": round(pix_w, 2),
        "pix_h_m": round(pix_h, 2),
        "cell_area_m2": round(pix_w * pix_h, 2),
        "elev_min_m": round(elev_min, 1),
        "elev_max_m": round(elev_max, 1),
        "bounds": {
            "left": bounds.left,
            "bottom": bounds.bottom,
            "right": bounds.right,
            "top": bounds.top
        }
    }
    
    print(f"    Grid Dimensions: {nrows} rows x {ncols} cols | Elevation: {elev_min:.1f}m to {elev_max:.1f}m")
    return dem_raw, transform, profile, pix_w, pix_h, qa_meta


def clean_nodata_values(dem_raw: np.ndarray, profile: Dict[str, Any]) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    STEP 3. HANDLE NODATA: Identify and clean any NoData values using iterative
    Dirichlet-Laplace boundary smoothing (solving discrete ∇²Z = 0 over void masks).
    
    Parameters:
        dem_raw: 2D numpy array of raw elevations.
        profile: Rasterio metadata profile containing nodata flag.
        
    Returns:
        cleaned: 2D numpy array with smooth continuous void interpolation.
        qa_stats: Statistics on void cells resolved.
    """
    print("--> [STEP 3: HANDLE NODATA] Scanning for missing void cells and NoData flags...")
    cleaned = dem_raw.copy()
    nodata_val = profile.get("nodata", None)
    
    invalid_mask = ~np.isfinite(cleaned) | (cleaned <= -9000.0)
    if nodata_val is not None and np.isfinite(nodata_val):
        invalid_mask |= np.isclose(cleaned, nodata_val)
        
    num_invalid = int(np.sum(invalid_mask))
    total_cells = cleaned.size
    
    if num_invalid == 0:
        print("    Clean: Zero NoData voids detected. Elevation grid is 100% continuous.")
        return cleaned, {"void_cells": 0, "void_pct": 0.0}

    pct = (num_invalid / total_cells) * 100.0
    print(f"    Identified {num_invalid:,} void cells ({pct:.2f}% of grid).")
    print("    Applying Dirichlet-Laplace boundary relaxation (∇²Z = 0) with distance-transform seeding...")
    
    # 1. Initial Dirichlet Seed: Nearest valid cell via Euclidean Distance Transform
    valid_indices = ndimage.distance_transform_edt(
        invalid_mask,
        return_distances=False,
        return_indices=True
    )
    cleaned[invalid_mask] = cleaned[tuple(valid_indices[:, invalid_mask])]
    
    # 2. Iterative 5-point discrete Laplace relaxation: Z(r,c) = 0.25 * (Z_up + Z_down + Z_left + Z_right)
    # Applied strictly to the void cells to smooth out stepped cliffs and artificial plateaus
    max_iters = 30
    tolerance_m = 0.05
    nrows, ncols = cleaned.shape

    # Interior void mask (excluding outer border cells where 5-point stencil wraps)
    interior_void = invalid_mask.copy()
    interior_void[0, :] = False
    interior_void[-1, :] = False
    interior_void[:, 0] = False
    interior_void[:, -1] = False

    if np.any(interior_void):
        for it in range(max_iters):
            # Compute discrete 4-neighbor average
            smoothed = 0.25 * (
                cleaned[:-2, 1:-1] +   # North
                cleaned[2:, 1:-1] +    # South
                cleaned[1:-1, :-2] +   # West
                cleaned[1:-1, 2:]      # East
            )
            sub_mask = interior_void[1:-1, 1:-1]
            diff = np.max(np.abs(cleaned[1:-1, 1:-1][sub_mask] - smoothed[sub_mask])) if np.any(sub_mask) else 0.0
            cleaned[1:-1, 1:-1][sub_mask] = smoothed[sub_mask]
            
            if diff < tolerance_m:
                break

    # Clamp any remaining non-finites
    if not np.all(np.isfinite(cleaned)):
        min_valid = np.nanmin(cleaned[np.isfinite(cleaned)])
        cleaned[~np.isfinite(cleaned)] = min_valid
        
    print(f"    Dirichlet-Laplace relaxation complete. Elevation range: {np.nanmin(cleaned):.1f}m to {np.nanmax(cleaned):.1f}m")
    return cleaned, {"void_cells": num_invalid, "void_pct": round(pct, 3)}
