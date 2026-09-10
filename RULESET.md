# WEFES NEXUS NEPAL: SYSTEM RULESET & CONSTITUTION

This document serves as the absolute, non-negotiable engineering constitution for the WEFES Nexus Nepal platform. Every human developer, contributor, and AI assistant MUST strictly comply with these rules.

---

## Rule 1: Zero Inward Code Imports & Engine Autonomy
- Engines (`engines/water/hydro`, `engines/nexus`, `engines/energy`, `engines/food`) must be 100% headless, isolated, and domain-pure.
- Under NO circumstances may an engine import from `apps/` or `packages/`.
- Code flows OUTWARD ONLY: `engines/` -> `apps/` or `packages/` -> `apps/`.
- Communication between engines, data layers, and applications occurs exclusively through:
  1. Standardized file artifacts (GeoJSON, CSV, JSON).
  2. CLI arguments and environment variables (`--input-dir`, `--output-dir`, `--district`).
  3. Clean REST/IPC APIs.

### Standalone Engine Execution & Git Subtree Splitting
Every computational engine must be capable of running completely standalone outside of this repository.

```bash
# Splits engines/water/hydro into a brand new standalone Git repository:
git subtree split -P engines/water/hydro -b standalone-hydro-engine

# Splits engines/nexus into its own standalone Git repository:
git subtree split -P engines/nexus -b standalone-nexus-engine
```

---

## Rule 2: The "Zero Hardcoded Data" Law
- Hardcoding scientific numbers, geographical coordinates, percentages, crop parameters, tariff estimates, or indicator thresholds inside application source code (`.ts`, `.tsx`, `.py`) is **STRICTLY PROHIBITED**.
- All domain constants, boundary coordinates, and scientific parameters MUST be loaded from designated files in `data/`.
- Configuration files (`.env`, `vite.config.ts`, etc.) may only contain operational/infrastructure variables (port numbers, API timeouts, base URLs), never scientific data.

---

## Rule 3: Mandatory In-Code Data Provenance Citations
Every module, hook, service, or script that consumes or transforms data must begin with an explicit top-level provenance declaration:
```python
# ==============================================================================
# DATA PROVENANCE CITATION
# Source File: data/real/hydrology/River_data.csv
# Lineage: DHM Nepal National River Network & Station 410 (Seti Beni, Kali Gandaki)
# Confidence: HIGH (Observed hydrometric station record)
# Consumed By: engines/water/hydro/src/hydrology/gauge_scaling.py
# ==============================================================================
```

---

## Rule 4: Data Tri-Tier Architecture & Governance
All project data must reside in one of three strictly governed tiers:
1. `data/real/` (Observed Official Records):
   - Official records from recognized agencies (DHM, MoALD, CBS, Survey Department).
   - **Immutable & Read-Only**: Code must never modify or overwrite files in this folder.
2. `data/calculated/` (Reproducible Engine Outputs):
   - Deterministic outputs computed by our engines (`engines/water/hydro`, `engines/nexus`).
   - Must be completely reproducible by re-running the engine's CLI or test suites.
3. `data/proxy/` (Surrogate Assumptions & Regional Estimates):
   - Used only when empirical data is unavailable.
   - Must include an explicit justification, confidence rating, and replacement roadmap in its `DATAINFO.md`.

*Every subfolder in `data/` MUST contain a `DATAINFO.md` file describing its provenance, fields, and confidence.*

---

## Rule 5: Large Raster & Binary Git Hygiene
- Binary rasters (`*.tif`, `*.nc`, `*.h5`, `*.geotiff`) > 10 MB must **NEVER** be committed directly to Git.
- Binary rasters are tracked via `data/manifest.json` with cryptographic SHA-256 checksums and automated download scripts (`scripts/sync_data.py`).
- Developers can clone the repository in seconds and run `make sync-data` to retrieve heavy assets locally.

---

## Rule 6: Dynamic Frontend Presentation (No Hardcoded Ranges)
- UI legends, scale bars, and filter ranges in `apps/web` must **NEVER** use arbitrary hardcoded tier arrays (such as the legacy 6-tier array).
- Legend ranges must be dynamically computed from datasets (Min/Max, Quantiles) or driven by domain-specific agronomic/hydrologic metadata defined in `packages/shared-types`.

---

## Rule 7: The Atomic Commit Limit (Max 400 Lines per Commit)
- Commits must represent atomic, single-intent units of work.
- Net functional code changes per commit must **NOT exceed 400 lines** (additions + deletions).
- *Exempted files*: Lockfiles (`pnpm-lock.yaml`), generated assets (`dist/`), data tables (`.csv`, `.geojson`), manifests (`AI_INDEX.md`, `data/manifest.json`).
- Commits exceeding this threshold are blocked by the `.githooks/pre-commit` hook. Split work into logical chunks:
  1. Commit 1: Data schemas and contracts.
  2. Commit 2: Engine computation logic.
  3. Commit 3: Unit tests and documentation.

---

## Rule 8: Branch Protection & Zero-Tolerance PR Gatekeeper
- Direct pushes to `main` are **strictly blocked** locally (via `.githooks/pre-push`) and remotely on GitHub.
- All development must occur on feature branches (`feat/*`, `fix/*`, `refactor/*`) and merge via Pull Request.
- Pull Requests will only be approved if:
  1. All tests pass (`make test` $\to$ pytest + pnpm test).
  2. TypeScript and Pyright check with zero errors (`tsc --noEmit`).
  3. All newly created directories contain `README.md` and `RULES.md`.
  4. `AI_INDEX.md` is synchronized and up-to-date.

---

## Rule 9: Dynamic AI Index (`AI_INDEX.md`)
- A single, compact, token-optimized file (`AI_INDEX.md`) at root acts as the AI context anchor (~1,500 tokens).
- `scripts/generate_ai_index.py` automatically refreshes this file during pre-commit hooks, ensuring AI agents never burn tokens parsing unneeded files.

---

## Rule 10: Dual-Documentation Standard
Every architectural folder (`apps/`, `engines/`, `packages/`, `data/`, `scripts/`) must maintain:
- `README.md`: Explains what the folder does, how it works, data flows, and alternatives considered.
- `RULES.md`: Defines strict rules on how to add, edit, test, and delete files within that folder.

---

## Rule 11: Polyglot Architecture & Package Isolation
- TypeScript packages use `pnpm` workspace protocols.
- Python engines use isolated virtual environments, `pyproject.toml`, and standard typing (`from __future__ import annotations`).
- Future Go or Rust engines will use `go.mod` or `Cargo.toml` in dedicated subdirectories under `engines/`.
