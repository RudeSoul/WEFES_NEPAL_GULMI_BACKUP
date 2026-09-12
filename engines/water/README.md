# Water Pillar Computational Engines

## Mandate & Scope
The Water Pillar encompasses all hydrological, hydro-meteorological, hydraulic, and aquatic computational pipelines for the WEFES Nexus Nepal platform:
1. **Physical Topographic & River Reach Hydrology (`engines/water/hydro`)**:
   - High-performance Python GIS pipeline executing D8 flow direction, topological sort accumulation, reach segmentation (~500m), head computation, WECS/NEA regional discharge scaling, and DOED statutory 10% environmental flow screening.
2. **Crop Water & Irrigation Requirements**:
   - Physical water balance modeling (FAO CROPWAT / AquaCrop) integrated with seasonal downscaled precipitation.
3. **Conjunctive Groundwater & Spring Discharge**:
   - Mid-hill catchment spring flow depletion curves and groundwater storage estimation.

## Sub-Engines & Modules
| Engine / Module | Runtime | Primary Scope | Status |
| :--- | :--- | :--- | :--- |
| `engines/water/hydro/` | Python 3.13 (GDAL/Rasterio) | 30m DEM raster pipeline, reach delineation, hydropower screening | **Autonomous Pipeline** |
| `engines/nexus/src/models/water/` | TypeScript | Interactive browser/API irrigation, groundwater & rainfall models | **Integrated Simulator** |

## Directory Conventions
- Heavy geospatial raster processing engines live in dedicated subdirectories under `engines/water/` with their own independent `pyproject.toml` and CLI.
- Interactive scenario models live in `engines/nexus/src/models/water/` to enable isomorphic client-side and server-side execution.
