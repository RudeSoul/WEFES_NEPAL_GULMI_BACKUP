# Food Pillar Engine Governance Rules

## 1. Scientific Provenance
- All crop benchmarks and varietal descriptors must cite official Nepal Agricultural Research Council (NARC) bulletins or FAO standards.
- No arbitrary yield constants are permitted; all yield equations must reference baseline agro-ecological zones.

## 2. Decoupled Architecture
- Future standalone food engines (e.g. ML yield forecasters) must live in dedicated subdirectories with zero inward imports from UI layers.
- Current interactive simulation modules must reside under `engines/nexus/src/models/food/` and expose pure calculation functions.
