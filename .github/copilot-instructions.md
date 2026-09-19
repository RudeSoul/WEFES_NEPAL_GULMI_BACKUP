# GitHub Copilot Instructions for WEFES Nexus Nepal

This repository hosts a decision support system for Gulmi District, Nepal. Because policy, agriculture, and water resource allocations depend on this platform, DATA TRUTH AND SCIENTIFIC RIGOR ARE ABSOLUTE PRIORITY #1.

## Non-Negotiable Instructions:

1. **Zero-Synthesis in `data/real/`**:
   - `data/real/` is strictly immutable empirical government records (DHM, MoALD, CBS, Survey Dept).
   - NEVER create, estimate, or synthesize data records inside `data/real/`.
   - If a referenced data path is missing, DO NOT create a synthetic file. Point to the verified ground-truth file or alert the team.

2. **Physical Disk Verification**:
   - Before suggesting or citing any file path (e.g. in `dataSourceCitation` or `// [DATA PROVENANCE]`), verify that the file physically exists in the repository.

3. **Engine Isolation (Rule 1)**:
   - Code under `engines/` (`engines/water/hydro`, `engines/nexus`) must NEVER import from `apps/` or `packages/`.
   - Engines must remain autonomous and headless.

4. **Zero Hardcoded Domain Constants (Rule 2)**:
   - Coordinates, scientific constants, crop coefficients, tariffs, and indicator thresholds must be loaded from `data/`, never hardcoded into components.

5. **Atomic Commit & Verification**:
   - Commits are limited to 400 net functional code lines.
   - Always run `python3 scripts/verify_data_integrity.py` before committing.
