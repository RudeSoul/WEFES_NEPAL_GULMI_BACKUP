# WEFES NEXUS NEPAL: COMMIT & GIT HOOKS GUIDE

> **Purpose:** This document is the definitive guide to Git workflow, atomic commit standards, conventional commit messages, and automated git hooks in the WEFES Nexus Nepal platform repository.

---

## Table of Contents
1. [Git Workflow & Branching Strategy](#1-git-workflow--branching-strategy)
2. [Commit Standards](#2-commit-standards)
   - [Cohesive Atomic Commits](#cohesive-atomic-commits)
   - [Conventional Commit Format](#conventional-commit-format)
3. [Automated Git Hooks Overview](#3-automated-git-hooks-overview)
   - [Pre-Commit Hook (`.githooks/pre-commit`)](#pre-commit-hook-githookspre-commit)
   - [Commit-Message Hook (`.githooks/commit-msg`)](#commit-message-hook-githookscommit-msg)
   - [Pre-Push Hook (`.githooks/pre-push`)](#pre-push-hook-githookspre-push)
4. [Hook Configuration & Setup](#4-hook-configuration--setup)
5. [Developer Workflows & Troubleshooting](#5-developer-workflows--troubleshooting)
   - [Day-to-Day Workflow](#day-to-day-workflow)
   - [Resolving Pre-Commit Failures](#resolving-pre-commit-failures)
   - [Emergency Bypass Options](#emergency-bypass-options)

---

## 1. Git Workflow & Branching Strategy

To maintain scientific integrity and code quality:

- **Protected Main Branch:** Direct commits and direct pushes to `main` (or `master`) are strictly blocked by pre-commit and pre-push hooks.
- **Feature Branches:** All changes must be developed on dedicated feature or bugfix branches:
  ```bash
  git checkout -b feat/your-feature-name
  # or
  git checkout -b fix/issue-description
  ```
- **Pull Requests:** Changes are merged into `main` exclusively through Pull Requests with automated test validation and code reviews.

---

## 2. Commit Standards

### Cohesive Atomic Commits
Commits should be **cohesive atomic units of change**:
- **Logically complete:** Each commit should represent a coherent logical change. Group related files together (for example: a schema definition, the consuming component, and corresponding unit tests) in a single commit.
- **Green at every commit:** The repository should build and pass automated tests at every individual commit point.
- **No arbitrary fragmentation:** Do not artificially break up a single logical change across separate commits.

### Conventional Commit Format
All commit messages must adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <short description>
```

#### Allowed Types
| Type | Description |
| :--- | :--- |
| `feat` | New user-facing feature or domain capability |
| `fix` | Bug fix or calculation correction |
| `refactor` | Code restructuring with no behavior change |
| `test` | Adding or updating automated tests |
| `docs` | Documentation changes only |
| `perf` | Performance improvement |
| `ci` | CI/CD configuration and pipeline updates |
| `chore` | Tooling, dependencies, or repository hygiene |

#### Common Scopes
- `engine/hydro` — Water and hydrological simulation models
- `engine/nexus` — Multi-sector nexus cross-impact models
- `web/map` — District GIS and choropleth visualizations
- `web/charts` — Telemetry and sectoral analytics charts
- `data/climate` — Climate datasets and ingest pipelines
- `types` — Domain schema and interface contracts

#### Examples
```bash
git commit -m "feat(types/palika): define crop water demand schema"
git commit -m "feat(engine/nexus): implement water balance calculations"
git commit -m "fix(web/map): correct tooltip coordinates in choropleth"
git commit -m "test(engine/hydro): add assertions for runoff conversions"
git commit -m "chore(deps): update pnpm packages"
```

---

## 3. Automated Git Hooks Overview

Hooks are stored in the tracked repository directory `.githooks/`.

```text
.githooks/
├── pre-commit      # Branch protection, data integrity check, binary file size limit
├── commit-msg      # Conventional commit message validation
└── pre-push        # Push branch protection, automated test execution
```

### Pre-Commit Hook (`.githooks/pre-commit`)
Fires automatically whenever you run `git commit`. It executes three critical checks:

1. **Branch Protection:**
   Rejects commits if the active branch is `main` or `master`.
2. **6-Tier Data Integrity Gatekeeper:**
   Executes `python3 scripts/verify_data_integrity.py`:
   - Checks that all cited data files physically exist on disk.
   - Ensures no synthetic data has been added to `data/real/`.
   - Enforces engine isolation (code under `engines/` never imports from `apps/` or `packages/`).
3. **Binary File Size Limit:**
   Rejects any staged file exceeding **40 MB**. Large raw raster grids (GeoTIFFs) must be tracked via dataset manifests or external storage rather than git tracking.

### Commit-Message Hook (`.githooks/commit-msg`)
Fires when the commit message is created. Validates that the message starts with an approved type:
```bash
^(feat|fix|docs|refactor|test|perf|ci|chore)(\([a-zA-Z0-9_\-\/]+\))?: .+$
```

### Pre-Push Hook (`.githooks/pre-push`)
Fires when running `git push`.
1. Blocks pushing directly to remote `main` or `master`.
2. Executes `pnpm test` to ensure code passes all automated tests before leaving your local machine.

---

## 4. Hook Configuration & Setup

When cloning the repository or running dependency installation, hooks are registered automatically:

```bash
pnpm install
```

This sets the repository's git hooks path:
```bash
git config core.hooksPath .githooks
```

You can verify the configuration at any time:
```bash
git config core.hooksPath
# Expected output: .githooks
```

---

## 5. Developer Workflows & Troubleshooting

### Day-to-Day Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feat/palika-water-metrics
   ```
2. Make your edits and verify data integrity:
   ```bash
   python scripts/verify_data_integrity.py
   ```
3. Stage all related files for the change:
   ```bash
   git add packages/shared-types/src/ apps/web/src/
   ```
4. Commit using a conventional commit message:
   ```bash
   git commit -m "feat(web/map): connect palika water balance choropleth"
   ```
5. Push to your feature branch:
   ```bash
   git push -u origin feat/palika-water-metrics
   ```

### Resolving Pre-Commit Failures

| Failure Message | Cause | Resolution |
| :--- | :--- | :--- |
| `Direct commits to 'main' are forbidden!` | Attempted commit on `main` branch | Run `git checkout -b feat/your-branch` and commit on the new branch. |
| `File cited in code does not physically exist` | Missing canonical data file | Download or generate the required canonical data file under `data/`, or fix the file path citation. |
| `Engines must remain headless` | Engine imports from `apps/` or `packages/` | Remove the inward dependency. Pass data through function parameters or JSON inputs. |
| `File size exceeds 40 MB limit` | Large binary file staged (e.g., GeoTIFF) | Unstage the file (`git reset HEAD <file>`) and record it in `data/manifest.json`. |
| `Invalid commit message format` | Message does not match conventional format | Format message with a valid type, e.g., `feat(web): update palette`. |

### Emergency Bypass Options

If you need to bypass hooks during emergency local testing or non-code documentation staging:

- **Bypass pre-commit and commit-msg hooks:**
  ```bash
  git commit --no-verify -m "docs: emergency fix"
  ```
- **Bypass pre-push test suite:**
  ```bash
  SKIP_TESTS=1 git push origin feat/your-branch
  ```
- **Temporarily disable local hooks:**
  ```bash
  git config --unset core.hooksPath
  ```
  *(To re-enable: `git config core.hooksPath .githooks`)*
