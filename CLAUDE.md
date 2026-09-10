# Claude Code Guidelines: WEFES Nexus Nepal

This repository hosts a scientific Water-Energy-Food-Ecosystem-Society (WEFES) decision support system for Gulmi District, Nepal.

## Critical Behavioral Rules:

1. **Zero-Synthesis in `data/real/`**:
   - `data/real/` is an immutable, read-only tier reserved strictly for official government records (DHM, MoALD, CBS, Survey Department, NASA POWER).
   - Under NO circumstances should Claude create, mock, estimate, or synthesize data records inside `data/real/`.
   - If a file path does not physically exist on disk, DO NOT fabricate a file to make the path resolve. Identify the true ground-truth file or report it.

2. **Physical Disk Verification**:
   - Verify with file tools or terminal that any referenced path physically exists on disk before writing citations, imports, or configs.

3. **Engine Isolation (Rule 1)**:
   - Engines (`engines/water/hydro`, `engines/nexus`) must NEVER import from `apps/` or `packages/`.
   - Outward flow only.

4. **Zero Hardcoded Domain Data (Rule 2)**:
   - Never hardcode scientific constants, coordinates, crops, or tariff metrics into `.ts`, `.tsx`, or `.py` source files. Load them from `data/`.

5. **Atomic Commits & Verification**:
   - Keep commits under 400 net functional lines.
   - Run `python3 scripts/verify_data_integrity.py` and `pnpm test` before committing.
