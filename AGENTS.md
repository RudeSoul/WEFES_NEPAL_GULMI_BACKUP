# WEFES PLATFORM: AGENT BEHAVIORAL CONTRACT & RULES

# ==============================================================================

# MANDATORY COMPLIANCE FOR ALL AI CODING ASSISTANTS & TEAM DEVELOPERS

# ==============================================================================

This repository hosts a scientific Water-Energy-Food-Ecosystem-Society (WEFES) decision support system for Gulmi District, Nepal. Because policy, agricultural planning, and water resource allocations depend on this platform, **DATA TRUTH AND SCIENTIFIC RIGOR ARE ABSOLUTE PRIORITY #1**.

---

## 0. Proactive First-Line Compliance (Zero-Rework Principle)

- **Rules are proactive authoring constraints, NOT post-hoc commit-time tests.**
- Do NOT write placeholder, inline, or unprovenanced code intending to "fix it before commit" — this burns duplicate tokens and forces repetitive rework.
- **Before writing line 1 of any functional file**:
  1. If defining coordinates, palika lists, thresholds, or tariffs: **STOP**. Import from existing assets (`data/palika_centroids.json`, `districtPalikaAssets.ts`, `data/`) immediately. Never declare a local `{ Resunga: ..., Madane: ... }` dictionary.
  2. If the file consumes or produces datasets: **Declare `// [DATA PROVENANCE]` at line 1 before writing imports**.
  3. Verify physical disk existence of every cited path (`test -f <path>`) before typing the citation string.
  4. Ensure engines do not import from `apps/` or `packages/`.
- The commit-time verification script (`scripts/verify_data_integrity.py`) is merely a passive safety net; code must be 100% compliant on first generation.

## 1. Zero-Synthesis & Anti-Hallucination in `data/real/`

- **NEVER create, estimate, or synthesize data in `data/real/`.**
- `data/real/` is an immutable, read-only tier reserved strictly for official government publications and recorded gauge data (DHM, MoALD, CBS, Survey Department, NASA POWER).
- If a cited file does not physically exist on disk, **DO NOT fabricate a file to make the path resolve**.
  - Stop immediately.
  - Check the filesystem.
  - Point to the true existing ground-truth file or alert the team.

## 2. In-Code Data Lineage & Provenance

Every file consuming or exposing data MUST declare an in-code provenance block:

```ts
// [DATA PROVENANCE]
// Data Source: data/real/hydrology/River_data.csv
// Classification: OBSERVED REAL (DHM National River Network)
// Citations: Department of Hydrology and Meteorology (DHM), Nepal
```

## 3. Physical Disk Verification

Before writing any citation string or import statement:

- Verify with `ls` or `test -f` that the referenced path physically exists on disk.
- Never rely on markdown examples or assumptions.

## 4. Engine Isolation (Zero Inward Imports)

- Engines (`engines/water/hydro`, `engines/nexus`) are headless, autonomous scientific models.
- They must **NEVER** import code from `apps/` or `packages/`.
- No circular dependencies across engine boundaries.

## 5. Zero Hardcoding

- Domain constants, coordinates, thresholds, crop profiles, and tariffs must be loaded from `data/`.
- Never hardcode 6-tier arrays, palika metrics, or financial benchmarks directly in component files.

## 6. Git Hygiene & Atomic Commits

- Strict branch protection: Never push directly to `main`.
- **Atomic Commits**: Commits should be logically coherent units of change with all related files committed together.
- **Conventional Commits**: Commit messages must conform to `<type>(<scope>): <subject>` (enforced by `.githooks/commit-msg`).

---

## 7. Architecture Map & Subfilter Fast-Reference (Token-Optimized)

When working on maps, subfilters, legends, or analytics, **NEVER search or grep blindly across the repo**. Refer directly to this authoritative map:

### Multi-Pillar Subfilters & Data Lineage:

| Pillar             | SubFilter ID                                        | Primary Data Source                                                                                                         | Computation / Engine Location                                                  | Legend Contract                                                                      |
| ------------------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| **Food**           | `single_crop` / `crop_suitability`                  | `data/real/agriculture/crop_requirement.json` & `data/real/municipal/palika_profiles.json`                                  | `apps/web/src/data/cropSuitabilityAssets.ts` (`evaluatePalikaCropSuitability`) | `crop_suitability` in `packages/shared-types/src/legend-contracts.ts`                |
| **Food**           | `crop_water_stress`                                 | `data/real/agriculture/crops.json`, DHM Rain & NASA POWER                                                                   | `apps/web/src/data/cropSuitabilityAssets.ts` (`computePalikaMoistureStress`)   | `crop_water_stress` (4 seasons: `cycle`, `winter_dry`, `pre_monsoon`, `monsoon_wet`) |
| **Food**           | `land_typology`                                     | `data/real/agriculture/gulmi_agricultural_landholding.geojson` & `data/calculated/indicators/gulmi_palika_landholding.json` | `apps/web/src/hooks/usePalikaChoropleth.ts` (via `districtIndicatorAssets.ts`) | `land_typology` (Khet %, Bari %, Parcel density from NSO Census 2021/22)             |
| **Water**          | `irrigation_potential`                              | `data/real/agriculture/gulmi_agricultural_landholding.geojson`                                                              | `apps/web/src/hooks/usePalikaChoropleth.ts`                                    | `irrigation_potential`                                                               |
| **Water**          | `spring_vulnerability`                              | `data/real/hydrology/` & `palika_profiles.json`                                                                             | `apps/web/src/hooks/usePalikaChoropleth.ts`                                    | `spring_vulnerability`                                                               |
| **Water**          | `dhm_station`                                       | `data/real/hydrology/` DHM station network                                                                                  | `apps/web/src/hooks/usePalikaChoropleth.ts`                                    | `dhm_station`                                                                        |
| **Energy**         | `solar_irradiance`                                  | `data/real/climate/gulmi_solar_pvout_opta.geojson` & `data/calculated/indicators/gulmi_palika_ghi.json`                     | `apps/web/src/hooks/usePalikaChoropleth.ts` (via `districtIndicatorAssets.ts`) | `solar_irradiance`                                                                   |
| **Energy**         | `grid_electrification`                              | `data/calculated/indicators/gulmi_palika_grid.json` (NEA Substations)                                                       | `apps/web/src/hooks/usePalikaChoropleth.ts` (via `districtIndicatorAssets.ts`) | `grid_electrification`                                                               |
| **Energy**         | `hydro_capacity`                                    | `HYDRO_PALIKA_SUMMARY` exported from `apps/web/src/data/districtPalikaAssets.ts`                                            | `apps/web/src/hooks/usePalikaChoropleth.ts`                                    | `hydro_capacity`                                                                     |
| **Ecosystem**      | `soil_nitrogen` / `phosphorus` / `potassium` / `ph` | `data/real/land_and_soil/gulmi_soil_points_81.json` (127 NARC laboratory points)                                            | `apps/web/src/hooks/usePalikaChoropleth.ts` (via `districtIndicatorAssets.ts`) | Respective soil chemical thresholds                                                  |
| **Ecosystem**      | `elevation_zones` / `agroforestry_belt`             | SRTM DEM / Topographic profiles in `palika_profiles.json`                                                                   | `apps/web/src/hooks/usePalikaChoropleth.ts`                                    | `elevation_zones`                                                                    |
| **Socioeconomics** | `clean_cooking_biomass`                             | `data/calculated/indicators/gulmi_palika_cooking.json` & `palika_profiles.json` (Census 2021 firewood %)                    | `apps/web/src/hooks/usePalikaChoropleth.ts` (via `districtIndicatorAssets.ts`) | `clean_cooking_biomass`                                                              |
| **Socioeconomics** | `agri_landholding`                                  | `data/calculated/indicators/gulmi_palika_landholding.json` (NSO Census 2021/22)                                             | `apps/web/src/hooks/usePalikaChoropleth.ts` (via `districtIndicatorAssets.ts`) | `landholding`                                                                        |

### Key Code & Presentation Files:

- **Choropleth Join Hook**: `apps/web/src/hooks/usePalikaChoropleth.ts` (Zero hardcoding; joins palika GeoJSON with calculation metrics).
- **SubFilter Toolbar UI**: `apps/web/src/features/map/SubFilterToolbar.tsx` (Dropdowns for subfilters and timescale selectors).
- **District Map Component**: `apps/web/src/features/map/DistrictMap.tsx` (Leaflet rendering, legend display, layer briefing).
- **Layer Briefing & Methodologies**: `apps/web/src/data/districtCalculationAssets.ts` and `data/formulas/analytical_methodologies.json`.
- **Crop Suitability & Water Stress Assets**: `apps/web/src/data/cropSuitabilityAssets.ts`.
- **Legend Type Contracts**: `packages/shared-types/src/legend-contracts.ts`.

---

## 8. Decoupled Data Architecture & Lazy-Loading Lifecycle (Anti-Lag Guarantee)

- **Universal Data Client**: Frontend data and raster queries must use `fetchGeoJson()`, `fetchDataset()`, or `getTileUrl()` from `apps/web/src/services/dataClient.ts` to allow seamless remote CDN/S3 hosting via `VITE_DATA_BASE_URL`, `VITE_GEOJSON_BASE_URL`, and `VITE_TILES_BASE_URL`.
- **No Direct Deep Relative Traversal**: Never use `../../../../data/...` in frontend files. Use the `@data` path alias for compile-time assets or runtime `dataClient`.
- **3-Tier Lifecycle Loading**:
  1. **Tier 1 (Base Viewport)**: Only district boundary, palika polygons, roads, and DHM stations may load on map mount.
  2. **Tier 2 (On-Demand Layers)**: Heavy vector assets (`hydro_potential_reaches.geojson` ~5MB, `catchments_l10.geojson`, `rivers_streams.geojson`, `gulmi-contours.json`) and GeoTIFF rasters MUST be lazy-loaded only when their specific toggle/subfilter is activated.
  3. **Tier 3 (Route-Specific)**: Detailed municipal profiles (`gulmi_palika_agro_hydrology.json`) must only be loaded on `/palikas/:palikaName` routes.
- **Automated Gatekeeper Rule 8**: `scripts/verify_data_integrity.py` actively blocks commits containing raw `fetch('/geojson/...')` or deep relative root data traversals.
- **Reference**: Full loading matrix, raster budgets, and cloud deployment procedures are documented in `docs/DATA_LIFECYCLE_AND_LAZY_LOADING.md`.
