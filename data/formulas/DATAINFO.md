# Data Information: `data/formulas/`

## 1. Classification & Purpose
- **Data Type**: CALCULATED / DOMAIN CONFIGURATION
- **Layer**: Baseline Mathematical Models, Algorithms & Analytical Methodologies
- **Consumed By**: Decision Support Engines (`engines/`), Spatial Analytics (`apps/web/src/features/map/`)

## 2. Directory Contents
- `coefficients.json`: Core engineering coefficients, weighting matrices, and physical factors (water stress, solar GHI thresholds, erosion factors).
- `analytical_methodologies.json`: Mathematical formulations, governing equations, parameter constraints, scientific provenance, and institutional citations for all 5 WEFES nexus pillars.

## 3. Provenance & Official Citations
- **DHM Nepal**: Department of Hydrology and Meteorology (Gauging Network, River Discharges).
- **NARC**: Nepal Agricultural Research Council (Agro-Ecological Zones, Cultivar Requirements).
- **NASA POWER / MERRA-2**: 39-Year Surface Meteorology and Solar Energy Dataset (1981–2019).
- **ICIMOD**: Mountain Springshed Protocol & Elevation Gradient Models.
- **MoALD**: Ministry of Agriculture and Livestock Development (Cereal Balances, Irrigation Master Plan).
- **DOED / NEA**: Department of Electricity Development & Nepal Electricity Authority (Hydropower Reach Capacities).
- **CBS Nepal**: National Population and Housing Census 2021 (Energy & Municipal Profiles).
- **Survey Department Nepal**: Topographic Centroids & Administrative Boundaries.

## 4. Immutability & Compliance
This directory adheres to Rule 5 ("Zero Hardcoding") of the WEFES platform governance rules. All component-level calculations must read from this tier rather than declaring inline domain constants.
