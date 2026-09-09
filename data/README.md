# Data Governance & Storage Architecture (`data/`)

This directory is the centralized, single-source-of-truth data repository for the WEFES Nexus platform.

---

## 1. The Tri-Tier Architecture

```text
data/
├── real/                      # [BRONZE / RAW] Official, immutable observed records
│   ├── DATAINFO.md            # Lineage, sources (DHM, MoALD, CBS, Survey Dept)
│   ├── boundaries/            # Official administrative boundary GeoJSONs
│   ├── hydrology/             # Observed hydrometric river gauge series
│   ├── agriculture/           # District agricultural crop records
│   ├── climate/               # NASA POWER 10-year daily reanalysis
│   ├── land_and_soil/         # Soil characteristics and erosion zones
│   └── rasters/               # Copernicus 30m DEM GeoTIFF (excluded from Git)
│
├── calculated/                # [SILVER / PROCESSED] Deterministic engine outputs
│   ├── DATAINFO.md            # Engine version, mathematical formulas, reproducibility guide
│   └── hydro_reaches/         # Screened hydropower reaches, 12-month energy, summary JSON
│
└── proxy/                     # [ADVISORY / SURROGATE] Assumptions & regional proxies
    ├── DATAINFO.md            # Surrogate justification, limitations, and replacement criteria
    ├── economic_benchmarks/   # Rural tariff and capital installation costs
    ├── crop_suitability_proxies/ # Estimated temperature bounds for indigenous crops
    └── environmental_proxies/ # Statutory 10% dry-season flow assumptions
```

---

## 2. Heavy Binary Raster Git Policy
- All binary GeoTIFF files (`*.tif`, `*.geotiff`) > 10 MB are strictly `.gitignore`d.
- They are cryptographically cataloged in `data/manifest.json`.
- Run `python3 scripts/sync_data.py` (or `make sync-data`) to automatically download and verify local rasters.
