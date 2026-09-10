# WEFES PLATFORM: AGENT BEHAVIORAL CONTRACT & RULES
# ==============================================================================
# MANDATORY COMPLIANCE FOR ALL AI CODING ASSISTANTS & TEAM DEVELOPERS
# ==============================================================================

This repository hosts a scientific Water-Energy-Food-Ecosystem-Society (WEFES) decision support system for Gulmi District, Nepal. Because policy, agricultural planning, and water resource allocations depend on this platform, **DATA TRUTH AND SCIENTIFIC RIGOR ARE ABSOLUTE PRIORITY #1**.

---

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

## 6. Git Hygiene & Branch Protection
- Strict branch protection: Never push directly to `main`.
- Keep all commits atomic: Max 400 net functional lines per commit (enforced by `.githooks/pre-commit`).
- Always run `python3 scripts/generate_ai_index.py` before committing.
