# WEFES Nexus Nepal: Decoupled Data Architecture & Lazy-Loading Lifecycle

> **Platform Version:** v1.0.0 Decision Support System  
> **Target Region:** Gulmi District, Lumbini Province, Nepal (12 Palikas, 93 Wards)  
> **Core Architecture:** Monorepo Decoupled GIS, Headless Hydro-Agro Engine, Universal Data Client  
> **Performance SLA:** 60 FPS Smooth UI Interaction, <1.2s First Contentful Paint, Zero Memory Leaks

---

## 1. Executive Summary & Problem Post-Mortem

### Why This Documentation Exists ("Never Again" Protocol)

In earlier iterations of the platform codebase, two critical architectural anti-patterns emerged that risked performance degradation and deployment fragility:

1. **Brittle Deep Relative Imports (`../../../../data/calculated/...`)**:  
   When calculated indicators and GeoJSON datasets were reorganized from `apps/web/src/data/json/` to static directories, frontend TypeScript asset helpers fell back to climbing multiple directory levels back out to the monorepo root `/data`.
   - _Why it happened_: Developers needed synchronous imports for static calculation lookups and lacked an explicit path alias.
   - _Why the old governance gatekeeper missed it_: The validation script (`verify_data_integrity.py`) checked whether referenced paths existed physically on disk by stripping `../` prefixes. It verified _what_ data existed on disk, but did not police _how_ frontend client code imported it.
   - _Why it was dangerous_: If the frontend was built in isolation (e.g. in Docker or deployed to Vercel/Cloudflare Pages) or if the `data/` folder was hosted remotely on an S3/CDN bucket, these hardcoded relative imports broke builds and bound the UI inextricably to the local filesystem layout.

2. **Eager-Load Waterfall Bottlenecks ("Thundering Herd" Initial Paint Lag)**:  
   Mounting the map application while eagerly fetching 15–20 vector GeoJSONs, large raster GeoTIFFs, and indicator tables simultaneously overloaded the browser's HTTP/2 multiplexer and blocked the main thread parsing megabytes of GeoJSON features during the initial render.

---

## 2. Decoupled Data Architecture Blueprint

To guarantee that the frontend runs with zero modifications whether data is served locally or from a remote object storage bucket, the platform implements a **Strict 3-Pillar Data Decoupling Contract**:

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 apps/web (React 18 + UI)                │
                  └───────────────┬─────────────────────────┬───────────────┘
                                  │                         │
                 Build-Time Static Imports         Runtime Dynamic Requests
                         (@data/*)                 (services/dataClient.ts)
                                  │                         │
                                  ▼                         ▼
                  ┌────────────────────────┐      ┌─────────────────────────┐
                  │ Monorepo Root /data    │      │ Environment Dispatcher  │
                  │ (Vite Path Alias)      │      │ • VITE_DATA_BASE_URL    │
                  └────────────────────────┘      │ • VITE_GEOJSON_BASE_URL │
                                                  │ • VITE_TILES_BASE_URL   │
                                                  └────────────┬────────────┘
                                                               │
                                          ┌────────────────────┴────────────────────┐
                                          ▼                                         ▼
                             [Local Dev Mode: /public]                [Remote CDN / Cloudflare R2 / S3]
                             • /public/data/                          • https://data.wefes-nepal.org/
                             • /public/geojson/                       • https://geojson.wefes-nepal.org/
                             • /public/tiles/                         • https://tiles.wefes-nepal.org/
```

### Pillar A: Build-Time Compile Alias (`@data`)

When TypeScript asset registries (`districtIndicatorAssets.ts`, `districtPalikaAssets.ts`) require compile-time JSON bundling:

- **Allowed:** `import data from '@data/calculated/indicators/...json';`
- **Strictly Forbidden:** `import data from '../../../../data/...';` (Enforced by automated Rule 8 in `verify_data_integrity.py`).

### Pillar B: Universal Runtime Data Client (`apps/web/src/services/dataClient.ts`)

**100% of runtime network requests MUST flow through `dataClient.ts`:**

- `fetchGeoJson<T = any>(filename: string): Promise<T>`  
  Resolves against `VITE_GEOJSON_BASE_URL || '/geojson'`.
- `fetchDataset<T = any>(endpoint: string): Promise<T>`  
  Resolves against `VITE_DATA_BASE_URL || '/data'`.
- `getDataUrl(endpoint: string): string`  
  Returns fully-qualified URL for tabular or download links.
- `getGeoJsonUrl(filename: string): string`  
  Returns fully-qualified URL for vector map assets.
- `getTileUrl(filename: string): string`  
  Returns fully-qualified URL for raster GeoTIFFs and PNG density overlays (resolves against `VITE_TILES_BASE_URL || '/tiles'`).

### Pillar C: Automated CI/Pre-Commit Gatekeeper (Rule 8)

Script `scripts/verify_data_integrity.py` actively halts any commit or PR containing:

1. Deep relative imports jumping out to root data (`from '../../data/real/...'` or `from '../../../../data/...'`).
2. Raw hardcoded fetch calls (`fetch('/geojson/...')`, `fetch('/data/...')`, `fetch('/tiles/...')`) outside `dataClient.ts`.

---

## 3. Master Dataset Loading Schedule & Lifecycle Matrix

Every dataset in the platform is strictly cataloged into one of three lifecycle tiers to eliminate initial paint latency:

| Dataset Identifier            | Physical Disk Path                                            | Classification                                          | Raw Size    | Gzip Size  | Lifecycle Tier & Trigger Event                                                   | Consumer Component / Hook                                 | Caching Mechanism                                    | Anti-Lag Protection                                                       |
| :---------------------------- | :------------------------------------------------------------ | :------------------------------------------------------ | :---------- | :--------- | :------------------------------------------------------------------------------- | :-------------------------------------------------------- | :--------------------------------------------------- | :------------------------------------------------------------------------ |
| **District Boundary**         | `public/geojson/gulmi-district.json`                          | Vector Polygon                                          | 183 KB      | 42 KB      | **Tier 1 (Base Viewport)**<br>Immediate on Map Mount                             | `DistrictMap.tsx`<br>`DistrictDetailMap.tsx`              | Component `geoData` State                            | Memoized SVG Path; loaded once per session                                |
| **Palika Polygons**           | `public/geojson/gulmi-palikas.json`                           | Vector MultiPolygons (12 Palikas)                       | 1.62 MB     | 280 KB     | **Tier 1 (Base Viewport)**<br>Immediate on Map Mount                             | `DistrictMap.tsx`<br>`usePalikaChoropleth.ts`             | React `palikasData` State + Hook Ref                 | Pre-simplified coordinate tolerances; non-blocking parse                  |
| **Road Network**              | `public/geojson/roads/gulmi.json`                             | Vector LineStrings                                      | 45 KB       | 12 KB      | **Tier 1 (Base Viewport)**<br>Immediate on Map Mount                             | `DistrictMap.tsx`                                         | Leaflet GeoJSON layer cache                          | Static stroke styling; zero hover event listeners                         |
| **DHM Stations**              | `public/geojson/gulmi-dhm-stations.json`                      | Vector Points (7 Stations)                              | 6.5 KB      | 1.8 KB     | **Tier 1 (Base Viewport)**<br>Immediate on Map Mount                             | `DistrictMap.tsx`<br>`DistrictDetailMap.tsx`              | Leaflet CircleMarker layer                           | SVG circle points; lightweight rendering (<2ms)                           |
| **Major River Network**       | `public/geojson/gulmi-rivers.json`                            | Vector LineStrings                                      | 53 KB       | 14 KB      | **Tier 1 (Base Viewport)**<br>Immediate on Map Mount                             | `DistrictMap.tsx`                                         | Leaflet GeoJSON layer cache                          | Streamlined primary arterials only                                        |
| **Hydro Potential Reaches**   | `public/geojson/hydro_potential_reaches.geojson`              | Vector MultiLineStrings (Tens of thousands of vertices) | **4.98 MB** | **840 KB** | **Tier 2 (On-Demand)**<br>ONLY when Hydro Corridors toggle is **ON**             | `DistrictMap.tsx`                                         | `hydroReachesData` State (In-Memory Session Cache)   | **Canvas Renderer (`preferCanvas: true`)**; never loaded at boot          |
| **Subwatershed Catchments**   | `public/geojson/catchments_l10.geojson`                       | Vector Polygons (HydroSHEDS Level 10)                   | 69 KB       | 16 KB      | **Tier 2 (On-Demand)**<br>ONLY when Catchments subfilter is **ON**               | `CatchmentsGeoJsonLayer.tsx`                              | Hook-level state cache                               | Lazy `useEffect` with deduplication check                                 |
| **Dense Streams & Rivers**    | `public/geojson/rivers_streams.geojson`                       | Vector LineStrings (High-Density Stream Order)          | 224 KB      | 48 KB      | **Tier 2 (On-Demand)**<br>ONLY when Rivers/Streams subfilter is **ON**           | `RiversStreamsGeoJsonLayer.tsx`                           | Hook-level state cache                               | Lazy `useEffect` with deduplication check                                 |
| **Topographic Contours**      | `public/geojson/gulmi-contours.json`                          | Vector LineStrings (100m Interval DEM Contours)         | 75 KB       | 18 KB      | **Tier 2 (On-Demand)**<br>ONLY when Contours switch or Terrain basemap is **ON** | `DistrictMap.tsx`                                         | Component `contoursData` State                       | Lazy `useEffect`; omitted from initial paint                              |
| **D8 Flow Direction Raster**  | `public/tiles/flow_direction.tif`                             | GeoTIFF 3 Arc-Second Raster                             | 850 KB      | 620 KB     | **Tier 2 (On-Demand)**<br>ONLY when Flow Direction layer is toggled              | `SpatialFlowDirectionOverlay.tsx`                         | Module-level `cachedDirectionUrl` Bitmap cache       | Decoded via `geotiff.js` to off-screen 240x240 Canvas; zero SVG DOM nodes |
| **Flow Accumulation Raster**  | `public/tiles/flow_accumulation.tif`                          | GeoTIFF 3 Arc-Second Raster                             | 920 KB      | 680 KB     | **Tier 2 (On-Demand)**<br>ONLY when Flow Accumulation layer is toggled           | `SpatialFlowAccumulationOverlay.tsx`                      | Module-level `cachedAccumulationUrl` Bitmap cache    | Logarithmic color interpolation on Off-Screen Canvas                      |
| **Annual Precip CHIRPS**      | `public/tiles/average_annual_precipitation.tif`               | GeoTIFF Rainfall Climatology                            | 1.10 MB     | 890 KB     | **Tier 2 (On-Demand / Background)**<br>Fetched after base boundary loads         | `DistrictMap.tsx`<br>`SpatialPrecipitationOverlay.tsx`    | Module-level `cacheMap`                              | Zonal extraction runs via `requestIdleCallback` / non-blocking promise    |
| **Monsoon Precip CHIRPS**     | `public/tiles/average_monsoon_precipitation.tif`              | GeoTIFF Rainfall Climatology                            | 1.10 MB     | 890 KB     | **Tier 2 (On-Demand / Background)**<br>Fetched after base boundary loads         | `DistrictMap.tsx`<br>`SpatialPrecipitationOverlay.tsx`    | Module-level `cacheMap`                              | Decoded on-demand when Seasonal selector is clicked                       |
| **Dry Season Precip CHIRPS**  | `public/tiles/average_dry_season_precipitation.tif`           | GeoTIFF Rainfall Climatology                            | 1.10 MB     | 890 KB     | **Tier 2 (On-Demand / Background)**<br>Fetched after base boundary loads         | `DistrictMap.tsx`<br>`SpatialPrecipitationOverlay.tsx`    | Module-level `cacheMap`                              | Decoded on-demand when Seasonal selector is clicked                       |
| **Settlement Density**        | `public/tiles/gulmi_settlement_density_overlay.png`           | Pre-Rendered Gaussian Surface (78,934 Buildings)        | 420 KB      | 410 KB     | **Tier 2 (On-Demand)**<br>ONLY when Settlements overlay is toggled               | `SpatialSettlementDensityOverlay.tsx`                     | Native Browser Image Cache                           | Instant single-layer bitmap overlay; zero coordinate vertex parsing       |
| **39-Year Climatology**       | `public/geojson/gulmi-climate-monthly.json`                   | Tabular Climatology (NASA POWER / MERRA-2)              | 278 KB      | 36 KB      | **Tier 3 (Store Climatology)**<br>Lazy background fetch in `useNexusStore`       | `nexusStore.ts`                                           | Zustand Global Store `climateDataset`                | Idle background fetch; non-blocking for map interaction                   |
| **Agro-Hydrology Calendar**   | `data/calculated/indicators/gulmi_palika_agro_hydrology.json` | FAO-56 Monthly Water Balances (12 Palikas)              | 186 KB      | 28 KB      | **Tier 3 (Route-Specific)**<br>ONLY on `/palikas/:palikaName` routes             | `PalikaAgroHydrologyCalendar.tsx`<br>`DistrictDetail.tsx` | Bundled compile asset (`PALIKA_AGRO_HYDROLOGY_DATA`) | Split into palika route bundle; 0 KB overhead on main map                 |
| **Clean Cooking Indicator**   | `data/calculated/indicators/gulmi_palika_cooking.json`        | Palika Census Indicators (NSO 2021)                     | 4.0 KB      | 1.1 KB     | **Tier 3 (Choropleth Subfilter)**<br>Active during Socioeconomics subfilter      | `usePalikaChoropleth.ts`<br>`districtIndicatorAssets.ts`  | Static join table                                    | Instant dictionary lookup                                                 |
| **Grid Substation Indicator** | `data/calculated/indicators/gulmi_palika_grid.json`           | NEA Substation Coordinates & Feeder Radii               | 12 KB       | 2.5 KB     | **Tier 3 (Choropleth Subfilter)**<br>Active during Energy subfilter              | `usePalikaChoropleth.ts`<br>`districtIndicatorAssets.ts`  | Static join table                                    | Instant dictionary lookup                                                 |
| **Landholding Census**        | `data/calculated/indicators/gulmi_palika_landholding.json`    | NSO Agri Census (Khet, Bari, Parcels)                   | 15 KB       | 3.2 KB     | **Tier 3 (Choropleth Subfilter)**<br>Active during Food subfilter                | `usePalikaChoropleth.ts`<br>`districtIndicatorAssets.ts`  | Static join table                                    | Instant dictionary lookup                                                 |
| **Soil Chemistry Points**     | `data/real/land_and_soil/gulmi_soil_points_81.json`           | NARC Laboratory Points (127 Samples)                    | 38 KB       | 7.5 KB     | **Tier 3 (Choropleth Subfilter)**<br>Active during Ecosystem/Soil subfilter      | `DistrictDetailMap.tsx`<br>`districtIndicatorAssets.ts`   | Static asset array                                   | CircleMarker SVG layer                                                    |

---

## 4. Anti-Lag & Smooth Rendering Guarantees

To ensure the interface feels instantaneous, fluid, and responsive on mobile phones, tablets, and laptops:

### 1. Frame Budget Enforcement (16.6ms / 60 FPS)

- **Problem**: Parsing a 5 MB GeoJSON synchronously blocks the main JavaScript thread for 180–350ms, causing dropped frames during scrolling or map zooming.
- **Solution**: Heavy vector files are deferred to `requestAnimationFrame` or fetched via `fetchGeoJson()` which deserializes via Web Streams off the synchronous layout pass.

### 2. Leaflet Canvas Rendering for Heavy Geometry

- Rather than rendering SVG `<path>` DOM nodes for the 4.98 MB hydro reach network (which would inject >15,000 DOM elements into the page), Leaflet is configured to render vector paths onto a single HTML5 `<canvas>` element:
  ```ts
  <MapContainer preferCanvas={true} ...>
  ```
  This reduces memory overhead by 85% and eliminates DOM reflow penalties.

### 3. Persistent In-Memory Deduplication Cache

- When a user turns the "Hydro Corridors" layer ON, the GeoJSON is fetched and stored in React component state (`hydroReachesData`).
- If the user turns the layer OFF and ON again, **zero network requests occur**; the component re-mounts the cached feature geometry in <1ms.

### 4. Separation of Heavy Geometry vs Lightweight State

- **Rule**: Never store multi-megabyte GeoJSON geometry collections inside global Zustand store slices.
- Geometry belongs in Leaflet's internal layer tree and localized component state.
- Zustand (`useNexusStore`) stores only scalar IDs, active filter tags, time ranges, and numerical summary cards. This prevents global component tree re-rendering cascades.

### 5. Raster Off-Screen Canvas Rasterization

- GeoTIFF files (`flow_direction.tif`, `flow_accumulation.tif`, `average_annual_precipitation.tif`) are decoded in an off-screen HTML5 Canvas (240x240 pixels) and converted to a static Base64 image URL:
  ```ts
  const canvas = document.createElement('canvas');
  // ... raster manipulation ...
  const url = canvas.toDataURL();
  ```
  This data URL is handed to Leaflet's native `<ImageOverlay>`, requiring zero runtime WebGL shader overhead and zero SVG nodes.

### 6. Component Unmount Abort Protection

- All asynchronous fetch hooks utilize an `isMounted` or `AbortController` flag to ensure that if a user navigates away before a large file finishes downloading, memory is immediately released and no setState warnings occur.

---

## 5. Decoupled Data Hosting Deployment Guide (S3 / R2 / CDN)

When moving datasets to external cloud storage (e.g. Cloudflare R2, AWS S3, or BunnyCDN):

### Step 1: Bucket Directory Structure

Sync the contents of `apps/web/public/` to the cloud bucket:

```text
my-wefes-bucket/
├── geojson/
│   ├── gulmi-district.json
│   ├── gulmi-palikas.json
│   ├── hydro_potential_reaches.geojson
│   ├── catchments_l10.geojson
│   ├── rivers_streams.geojson
│   └── roads/
│       └── gulmi.json
├── data/
│   └── (any tabular CSV/JSON endpoints)
└── tiles/
    ├── flow_direction.tif
    ├── flow_accumulation.tif
    ├── average_annual_precipitation.tif
    └── gulmi_settlement_density_overlay.png
```

### Step 2: Configure CORS Headers

The cloud storage bucket must serve standard CORS headers:

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Allow-Headers: Accept, Content-Type, Range
Access-Control-Max-Age: 86400
```

### Step 3: Configure Cache-Control Headers

Because all scientific datasets in `data/real/` and static GeoJSONs are versioned and immutable:

```http
Cache-Control: public, max-age=31536000, immutable
```

### Step 4: Set Environment Variables in Web Application

In `.env.production` (or Cloudflare / Vercel dashboard):

```env
VITE_DATA_BASE_URL="https://data.wefes-nepal.org"
VITE_GEOJSON_BASE_URL="https://geojson.wefes-nepal.org"
VITE_TILES_BASE_URL="https://tiles.wefes-nepal.org"
```

The frontend application requires **zero code modifications or recompilation** of its business logic.

---

## 6. Developer Checklist & Quality Gates

Before opening a PR or committing code that touches data or maps:

1. [ ] **No Raw Fetch**: Did you use `fetchGeoJson()`, `fetchDataset()`, or `getTileUrl()` from `services/dataClient.ts`?
2. [ ] **No Root Relative Imports**: Did you avoid `../../../../data/...`? (Use `@data/...` for build-time assets).
3. [ ] **Heavy Asset Check**: Is any asset >100 KB? If yes, is it placed in **Tier 2** (on-demand toggle) or **Tier 3** (route-specific), and NEVER in Tier 1 eager-mount?
4. [ ] **Provenance Header**: Does every file consuming data declare `// [DATA PROVENANCE]` at line 1?
5. [ ] **Run Automated Gatekeeper**:
   ```bash
   python3 scripts/verify_data_integrity.py
   ```
   All 8 platform rules must return `✅ PASS`.
