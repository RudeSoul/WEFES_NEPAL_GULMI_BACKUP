# Applications Layer (`apps/`)

This directory contains the user-facing application runtimes and API gateways of the WEFES platform.

---

## Architecture
- `apps/web`: React/Next.js/Vite frontend portal providing interactive WebGIS mapping, scenario modeling, and indicator dashboards.
- `apps/api`: Backend service providing data ingestion endpoints, caching layers, and simulation execution dispatchers.

---

## Design Principles
1. **Pure Presentation**: `apps/web` is strictly a presentation and interaction layer. It never performs raw GIS raster manipulations or heavy continuous mathematics.
2. **Dynamic Legends**: Map layers must be driven by data contracts and metadata defined in `packages/shared-types`.
3. **Transparent Provenance**: Tooltips, hover cards, and legends must expose data lineage badges (Observed Real, Calculated, Proxy).
