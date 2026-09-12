# Rules for Hydropower & Topographic Engine (`engines/hydro/`)

## 1. Zero Inward Code Imports
- This engine is 100% self-contained and autonomous.
- NEVER import from `apps/` or `packages/`.
- All interactions must be mediated via `cli.py` arguments (`--input-dir`, `--output-dir`, etc.) or standard files.

## 2. Scientific Integrity & Mathematical Citations
- Any formula used must cite the primary peer-reviewed literature or Nepal regulatory framework:
  - Barnes et al. (2014) for Priority-Flood depression filling.
  - WECS/NEA (1997) & MIP for ungauged catchment regionalization.
  - DOED (Department of Electricity Development) statutory 10% E-flow reservation policy.

## 3. Memory & Raster Handling
- Raster files must be opened cleanly using `rasterio` context managers (`with rasterio.open(...) as src:`).
- For large regional DEMs (>1 GB), windowed reads or downsampled tiling must be utilized to prevent Out-Of-Memory errors.

## 4. Pure Modular Steps
- Each step (`step1` to `step6`) must remain an independent module accepting DataFrames/rasters and returning DataFrames/GeoJSON.
- No step should rely on global mutable state.

## 5. Testing
- Mathematical equations must be tested with synthetic benchmarks verifying that $H_{\text{net}} = 0.9 \times H_{\text{gross}}$ and $Q_{\text{env}} = 0.10 \times Q_{\text{min}}$.
