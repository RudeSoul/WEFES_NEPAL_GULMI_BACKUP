# Water Pillar Engine Governance Rules

## 1. Zero Inward Code Imports
- Engines under `engines/water/` MUST NOT import anything from `apps/`, `packages/`, or other peer pillar folders.
- Any shared contracts or interfaces must be accessed via CLI arguments, standard file exchanges (`data/real`, `data/calculated`), or published contracts.

## 2. Standalone Subtree Portability
- The primary geospatial engine `engines/water/hydro` must remain 100% extractable:
  ```bash
  git subtree split -P engines/water/hydro -b standalone-hydro-engine
  ```
- Must run cleanly with its own `pyproject.toml` and CLI flags.

## 3. Hydrological Standards
- All discharge estimates must reference regionalized DHM/WECS/NEA formulas.
- Minimum environmental flows ($Q_{eflow}$) must strictly enforce the DOED statutory 10% threshold.

## 4. File Outputs
- All generated tables and spatial layers must be written to `data/calculated/hydro_reaches/` or corresponding calculated subdirectories.
