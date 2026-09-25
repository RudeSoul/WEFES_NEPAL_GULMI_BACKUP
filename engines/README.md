# WEFES Computational Engines (`engines/`)

This directory houses the core scientific, simulation, and modeling engines of the WEFES platform, organized around the **5 WEFES Pillars + Nexus Core**.

---

## 5-Pillar WEFES Structure

```
engines/
├── water/                  # Pillar 1: Water (Hydrology, Catchments, Irrigation, Springs)
│   └── hydro/              # [Python] 30m DEM raster pipeline, reach delineation, e-flows
├── food/                   # Pillar 2: Food (NARC Agronomy, Crop Suitability, Livestock, Pest)
├── energy/                 # Pillar 3: Energy (Hydropower Sizing, Solar PV, Bioenergy)
├── ecosystems/             # Pillar 4: Ecosystems (Soil Chemistry, Bioeconomy, Remote Sensing)
├── socio_economics/        # Pillar 5: Social & Governance (Gender Labor, NDC, SDG, Finance)
└── nexus/                  # Nexus Core: Integrated Cross-Pillar Policy Simulator (@wefes/wefes-engine)
    └── src/models/         # Domain models organized into 5 pillar subfolders + core
```

---

## Architectural Principles
1. **Zero Inward Imports**: Engines are autonomous domain packages. They NEVER import code from `apps/` or `packages/`.
2. **Headless Execution**: All engines are headless and deterministic. They can be executed via CLI, tests, or sub-processes without requiring a browser or web server.
3. **Polyglot Harmony**:
   - `engines/water/hydro` (Python): Spatial hydrology, D8 flow routing, Priority-Flood depression filling, WECS/NEA regional hydrology, DOED environmental flows.
   - `engines/nexus` (TypeScript): Crop suitability models, fertilizer balances, circular bioeconomy simulator, and cross-pillar trade-off matrices.
   - Future engines (in Go, C++, or Rust) can be plugged directly into their respective pillar folder.

---

## Standalone Repository Extraction
Any engine in this directory can be carved out into an independent GitHub repository at any time:

```bash
# Extract hydro engine into standalone repository:
git subtree split -P engines/water/hydro -b standalone-hydro-engine

# Extract nexus engine into standalone repository:
git subtree split -P engines/nexus -b standalone-nexus-engine
```
