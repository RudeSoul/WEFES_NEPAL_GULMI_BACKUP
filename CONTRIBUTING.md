# Contributing to WEFES Nexus Nepal

Welcome to the WEFES Nexus Nepal platform repository. Because this project informs evidence-based public policy, agricultural planning, and water resource management in Gulmi District, Nepal, **all contributors (human developers and AI assistants alike) are strictly bound by our engineering rules**.

---

## 1. The Core Scientific Rules

1. **Zero-Synthesis in `data/real/` (Rule 4)**:
   - `data/real/` contains strictly observed, empirical records from recognized sovereign agencies (DHM, MoALD, CBS, Survey Dept).
   - **Never create, estimate, or synthesize data in `data/real/`.**
   - If a file is missing, do not generate a dummy file. Stop and identify the true ground truth.
2. **Physical Disk Verification**:
   - Every file path cited in code or contracts must physically exist on disk before you commit.
3. **Engine Isolation (Rule 1)**:
   - Modules in `engines/` are headless and must NEVER import from `apps/` or `packages/`.
4. **Zero Hardcoded Domain Constants (Rule 2)**:
   - All domain constants, coordinates, and thresholds must be loaded from `data/`.
5. **Atomic Commits (Rule 7)**:
   - Commits are strictly capped at 400 net functional code lines.

---

## 2. Automated Git Hooks & Setup

When you clone the repository, install dependencies with:
```bash
pnpm install
```
This automatically configures our pre-commit hooks via `git config core.hooksPath .githooks`.

On every `git commit`, the pre-commit hook automatically:
1. Runs `python3 scripts/verify_data_integrity.py` to verify that all data paths exist and engine isolation is maintained.
2. Refreshes `AI_INDEX.md` dynamically.
3. Enforces the 400-line atomic commit limit.

To manually test your branch:
```bash
make test
# or
pnpm test
```

---

## 3. AI Agent Rules

If you use an AI coding assistant (Antigravity, Cursor, GitHub Copilot, Claude Code, Windsurf):
- Rules are permanently configured in the repository (`AGENTS.md`, `.cursorrules`, `.github/copilot-instructions.md`, `CLAUDE.md`, `.windsurfrules`).
- Never prompt an AI to create fake files in `data/real/` or bypass verification hooks.
