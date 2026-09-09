# WEFES Computational Engines (`engines/`)

This directory houses the core scientific, simulation, and modeling engines of the WEFES platform.

---

## Architectural Principles
1. **Zero Inward Imports**: Engines are autonomous domain packages. They NEVER import code from `apps/` or `packages/`.
2. **Headless Execution**: All engines are headless and deterministic. They can be executed via CLI, tests, or sub-processes without requiring a browser or web server.
3. **Polyglot Harmony**:
   - `engines/nexus` (TypeScript): Crop suitability models, fertilizer balances, circular bioeconomy simulator.
   - `engines/hydro` (Python): Spatial hydrology, D8 flow routing, Priority-Flood depression filling, WECS/NEA regional hydrology, DOED environmental flows.
   - `engines/routing` (Future: Go or Rust): High-throughput topological stream network graph routing.

---

## Standalone Repository Extraction
Any engine in this directory can be carved out into an independent GitHub repository at any time:

```bash
# Extract hydro engine into standalone repository:
git subtree split -P engines/hydro -b standalone-hydro-engine

# Extract nexus engine into standalone repository:
git subtree split -P engines/nexus -b standalone-nexus-engine
```
