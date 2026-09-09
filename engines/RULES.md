# Rules for Computational Engines (`engines/`)

## 1. Adding a New Engine
- Must be placed in `engines/<name>/` with an isolated package configuration (`package.json`, `pyproject.toml`, `go.mod`, or `Cargo.toml`).
- Must provide a standalone CLI entry point (`cli.py`, `src/cli.ts`, or `main.go`).
- Must include both `README.md` and `RULES.md` before merging into `main`.

## 2. Editing an Engine
- All math and algorithms must cite their authoritative source (e.g. WECS/NEA, DOED, FAO-56, NARC).
- Breaking changes to output data contracts (GeoJSON properties or CSV columns) must be coordinated with `packages/shared-types`.

## 3. Deleting an Engine
- Deprecation must be announced at least one release cycle in advance.
- All downstream consumers in `apps/api` and `apps/web` must be migrated first.

## 4. Inward Code Imports
- **STRICTLY PROHIBITED**: Importing from `apps/` or `packages/`.
- Communication must occur through file artifacts (`data/`), CLI arguments, or environment variables.
