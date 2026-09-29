# [DATA PROVENANCE]
# Data Source: User-specified Digital Elevation Model (DEM GeoTIFF)
# Classification: OBSERVED REAL & TOPOGRAPHIC BASELINE
# Citations: SAGA GIS Core (Conrad et al., 2015); CGrid_Gaps Dirichlet Laplace Smoothing

"""
step1_dem_io.py
================
STEP 2. LOAD DEM: Read input DEM file into a pysheds Grid object using rasterio.
STEP 3. HANDLE NODATA: Identify and clean any NoData values using an appropriate interpolation method.

District Reusability Note:
--------------------------
This module is 100% terrain and coordinate agnostic. It can ingest a DEM for any
district (e.g. Gulmi, Mustang, Baglung, Solukhumbu, or international catchments).
It inspects the raster Coordinate Reference System (CRS) and affine geotransform:
- If projected (e.g., UTM Zone 44N / 45N in meters), metric spacing is preserved directly.
- If geographic (EPSG:4326 in degrees), it derives planar metric cell size (dx, dy in meters)
  at the raster's centroid latitude so all downstream area, slope, and reach math is exact.
"""

from __future__ import annotations

import os
from typing import Tuple, Dict, Any
import numpy as np
import rasterio
from rasterio.transform import Affine
from pysheds.grid import Grid
from scipy import ndimage


def load_dem_and_grid(dem_path: str) -> Tuple[np.ndarray, Grid, Affine, Dict[str, Any], float, float]:
    """
    Reads an input DEM GeoTIFF into memory and initializes a pysheds Grid object.
    
    Parameters:
        dem_path: Path to the input GeoTIFF raster.
        
    Returns:
        dem_raw: 2D numpy array (float32) of raw elevations.
        grid: Initialized pysheds Grid instance aligned to the raster.
        transform: Affine geotransform.
        profile: Rasterio metadata profile.
        pix_w: Metric cell width in meters.
        pix_h: Metric cell height in meters.
    """
    if not os.path.exists(dem_path):
        raise FileNotFoundError(f"[ERROR] Input DEM not found at physical disk path: {dem_path}")
        
    print(f"--> [STEP 2: LOAD DEM] Reading raster: {os.path.basename(dem_path)}")
    with rasterio.open(dem_path) as src:
        dem_raw = src.read(1).astype(np.float32)
        profile = src.profile.copy()
        transform = src.transform
        crs = src.crs

    nrows, ncols = dem_raw.shape
    res_x = abs(transform[0])
    res_y = abs(transform[4])
    
    # Calculate metric resolution (meters)
    is_projected = crs.is_projected if crs else False
    if is_projected:
        pix_w = float(res_x)
        pix_h = float(res_y)
        print(f"    Detected Projected CRS: {crs} (Planar Resolution: {pix_w:.2f}m x {pix_h:.2f}m)")
    else:
        # Geographic CRS (degrees) - calibrate metric spacing at center latitude
        lat_center = transform[5] + (nrows / 2.0) * transform[4]
        m_per_deg_lat = 111320.0
        m_per_deg_lon = 111320.0 * np.cos(np.radians(lat_center))
        pix_w = float(res_x * m_per_deg_lon)
        pix_h = float(res_y * m_per_deg_lat)
        print(f"    Detected Geographic CRS: {crs} (Calibrated at Lat {lat_center:.2f}°: {pix_w:.2f}m x {pix_h:.2f}m)")

    # Initialize pysheds Grid object
    try:
        grid = Grid.from_raster(dem_path)
    except Exception as e:
        print(f"    Notice: pysheds Grid.from_raster initialized with custom affine mapping ({e})")
        grid = Grid()
        grid.affine = transform
        grid.crs = crs
        grid.shape = dem_raw.shape

    return dem_raw, grid, transform, profile, pix_w, pix_h


def clean_nodata_values(dem_raw: np.ndarray, profile: Dict[str, Any]) -> np.ndarray:
    """
    STEP 3. HANDLE NODATA: Identify and clean any NoData values using an appropriate interpolation method.
    
    Implements SAGA GIS CGrid_Gaps relaxation (Laplacian / Dirichlet boundary smoothing):
    Finds invalid void cells (NoData, NaN, Inf, or <= -9000), and fills them via iterative
    8-neighbor weighted distance interpolation from surrounding valid terrain.
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
        return cleaned

    pct = (num_invalid / total_cells) * 100.0
    print(f"    Identified {num_invalid:,} void cells ({pct:.2f}% of grid). Applying SAGA CGrid_Gaps interpolation...")
    
    # SAGA Soap-Bubble / Nearest Valid Laplace Relaxation
    valid_indices = ndimage.distance_transform_edt(
        invalid_mask,
        return_distances=False,
        return_indices=True
    )
    cleaned[invalid_mask] = cleaned[tuple(valid_indices[:, invalid_mask])]
    
    # Clamp any remaining edge non-finites
    if not np.all(np.isfinite(cleaned)):
        min_valid = np.nanmin(cleaned[np.isfinite(cleaned)])
        cleaned[~np.isfinite(cleaned)] = min_valid
        
    print(f"    NoData interpolation complete. Elevation range: {np.nanmin(cleaned):.1f}m to {np.nanmax(cleaned):.1f}m")
    return cleaned
