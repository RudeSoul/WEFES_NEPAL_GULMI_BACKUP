# WEFES NEXUS NEPAL: COMMIT, PRE-COMMIT & HOOK RULES REMOVAL GUIDE

> **Purpose:** This document is the single, all-in-one reference for everything concerning commit rules, pre-commit hooks, conventional commit formatting, 1-file-per-commit enforcement, branch protections, and automated build-flow tools in this repository.
> 
> It contains:
> 1. **Immediate Quick Actions** (Bypass, disable locally, or permanently remove).
> 2. **Complete Inventory of Enforcing Files & Settings**.
> 3. **Step-by-Step Instructions by Scenario** (Temporary bypass vs. Selective edit vs. Total removal).
> 4. **AI Assistant Guidelines Update** (Updating `AGENTS.md`, `GEMINI.md`, `.cursorrules`, etc.).
> 5. **Full Backup / Archive of All Hook Code & Rule Definitions** (So you can safely remove them without losing the original logic).
> 6. **How to Re-enable / Restore** in the future if desired.

---

## Table of Contents
1. [Quick Reference: How Do I Take It Out?](#1-quick-reference-how-do-i-take-it-out)
   - [Option A: One-Command Temporary Bypass](#option-a-one-command-temporary-bypass)
   - [Option B: Disable Locally on Your Machine (Recommended, 10 Seconds)](#option-b-disable-locally-on-your-machine-recommended-10-seconds)
   - [Option C: Selective Customization (Keep data checks, drop 1-file rule)](#option-c-selective-customization)
   - [Option D: Complete & Permanent Repository Teardown](#option-d-complete--permanent-repository-teardown)
2. [Master Inventory: Where These Rules Live](#2-master-inventory-where-these-rules-live)
3. [AI Assistants & Tooling Configuration](#3-ai-assistants--tooling-configuration)
4. [Complete Archive of All Hooks & Code](#4-complete-archive-of-all-hooks--code)
   - [1. `.githooks/pre-commit`](#1-githookspre-commit)
   - [2. `.githooks/commit-msg`](#2-githookscommit-msg)
   - [3. `.githooks/pre-push`](#3-githookspre-push)
   - [4. `scripts/flow_commit.py`](#4-scriptsflow_commitpy)
   - [5. Rule Text from `RULESET.md` and `AGENTS.md`](#5-rule-text-from-rulesetmd-and-agentsmd)
5. [How to Restore Everything Back to Original State](#5-how-to-restore-everything-back-to-original-state)

---

## 1. Quick Reference: How Do I Take It Out?

### Option A: One-Command Temporary Bypass
If you want to keep the rules in the repo, but bypass them for your current task:

```bash
# 1. Skip ALL pre-commit and commit-msg checks for a commit:
git commit --no-verify -m "your commit message"

# 2. Or bypass specific checks using built-in flags:
ALLOW_MULTI_FILE_COMMIT=1 ALLOW_LARGE_COMMIT=1 git commit -m "feat: commit multiple files"

# 3. Skip pre-push tests and branch checks during push:
git push --no-verify
```

---

### Option B: Disable Locally on Your Machine (Recommended, 10 Seconds)
If you want to stop all hooks from running on your machine without altering repository files:

```bash
# Unset the git hooks path configuration so git ignores .githooks entirely:
git config --unset core.hooksPath
```

To make sure `pnpm install` does not re-enable it via the `prepare` script, edit `package.json` or run:
```bash
# Prevent git hooks path from ever pointing to .githooks
git config core.hooksPath /dev/null
```

To verify it is disabled:
```bash
git config --get core.hooksPath
# (Should output /dev/null or nothing)
```

---

### Option C: Selective Customization
If you want to keep the **data integrity check** or **branch protection**, but eliminate the annoying **1-file-per-commit** and **400-line limit**:

1. Open `.githooks/pre-commit` and remove or comment out:
   - **Lines 27–67**: 1-File-Per-Commit check (`STAGED_FILES > 1`).
   - **Lines 99–138**: 400 Net functional lines limit.
2. Open `.githooks/commit-msg` and remove or comment out:
   - **Lines 13–48**: Conventional Commits regex check (allows any commit message).

---

### Option D: Complete & Permanent Repository Teardown
If you want to permanently strip out all git hooks, automated build-flow commit scripts, and commit rules across the entire project:

#### Step 1: Disconnect Git Hooks
```bash
git config --unset core.hooksPath
```

#### Step 2: Remove the `.githooks` Directory
```bash
rm -rf .githooks
```

#### Step 3: Remove Hooks & Commit Scripts from `package.json`
In `package.json`, delete the `"prepare"` and `"commit:flow"` lines:
```diff
   "scripts": {
     "build": "pnpm exec turbo run build",
     "dev": "pnpm exec turbo run dev --parallel",
     "test": "pnpm check:data && pnpm exec turbo run test",
     "check:data": "python3 scripts/verify_data_integrity.py",
-    "prepare": "git config core.hooksPath .githooks",
     "lint": "pnpm exec turbo run lint",
-    "commit:flow": "python3 scripts/flow_commit.py",
     "clean": "pnpm exec turbo run clean"
   },
```

#### Step 4: Remove `commit-flow` from `Makefile`
In `Makefile`, delete the `commit-flow` target and reference:
```diff
-.PHONY: dev build test check-data test-nexus test-api test-hydro run-hydro sync-data update-ai-index commit-flow clean
+.PHONY: dev build test check-data test-nexus test-api test-hydro run-hydro sync-data update-ai-index clean

-# Step through and commit changes 1-by-1 in architectural build-flow sequence
-commit-flow:
-	python3 scripts/flow_commit.py
```

#### Step 5: (Optional) Delete `scripts/flow_commit.py`
```bash
rm -f scripts/flow_commit.py
```

#### Step 6: Update AI & Contributor Rule Files
Remove the commit rules from:
- `AGENTS.md` (Delete Section 6)
- `GEMINI.md` (Delete Section 6)
- `RULESET.md` (Delete or modify Rule 7 & Rule 8)
- `.cursorrules` (Delete Section 5)
- `CLAUDE.md` (Delete Section 5)
- `CONTRIBUTING.md` (Delete Section 2)

---

## 2. Master Inventory: Where These Rules Live

Here is the exhaustive inventory of all files involved in pre-commit and commit policy:

| Component | File Path | What It Does |
| :--- | :--- | :--- |
| **Pre-Commit Hook** | `.githooks/pre-commit` | Blocks direct commit to `main`, runs data integrity check, enforces 1 file per commit, enforces < 40MB file size, refreshes `AI_INDEX.md`, limits commits to 400 lines. |
| **Commit Message Hook** | `.githooks/commit-msg` | Rejects any commit message not adhering to Conventional Commits: `<type>(<scope>): <subject>`. |
| **Pre-Push Hook** | `.githooks/pre-push` | Blocks direct `git push` to `main`/`master`, runs `pnpm test` before code is pushed. |
| **Git Config Initializer** | `package.json` (`prepare`) | Automatically runs `git config core.hooksPath .githooks` upon running `pnpm install`. |
| **Build-Flow Commit Script** | `scripts/flow_commit.py` | Interactive CLI that walks through staged/unstaged files and commits them 1-by-1 in 7 architectural tiers. |
| **Monorepo Task Runner** | `Makefile` (`commit-flow`) | Exposes `make commit-flow` to trigger `scripts/flow_commit.py`. |
| **Repository Ruleset** | `RULESET.md` (Rules 7 & 8) | Mandates 1-file-per-commit, build-flow dependency order, and branch protection. |
| **Agent Directives** | `AGENTS.md` (Rule 6) | Directs AI coding assistants to follow 1-file-per-commit and commit-msg rules. |
| **Gemini Directives** | `GEMINI.md` (Rule 6) | Duplicate of `AGENTS.md` for Google Gemini / Antigravity agents. |
| **Cursor Directives** | `.cursorrules` (Rule 5) | Limits commits to 400 lines and forbids direct push to `main`. |
| **Claude Directives** | `CLAUDE.md` (Rule 5) | Instructs Claude Code on atomic commit limits. |
| **Contributor Guide** | `CONTRIBUTING.md` (Section 2) | Explains hook requirements to human contributors. |

---

## 3. AI Assistants & Tooling Configuration

AI coding assistants (such as Antigravity, Cursor, Claude Code, GitHub Copilot, and Windsurf) read markdown rules from the project root. If you disable the git hooks but **do not** update the rule files, AI models may still try to enforce 1-file-per-commit or refuse to make multi-file commits.

### Updating `AGENTS.md` and `GEMINI.md`:
Replace **Section 6** with standard, flexible git instructions:
```markdown
## 6. Git Hygiene & Workflow
- Work on dedicated feature branches (`feat/...`, `fix/...`).
- Write clear and descriptive commit messages.
- Ensure automated tests and data verification pass before pushing.
```

### Updating `RULESET.md`:
Change **Rule 7** from mandatory 1-file-per-commit to standard cohesive commits:
```markdown
## Rule 7: Cohesive & Logical Commits
- Group logically related changes into clean commits with meaningful descriptions.
- Ensure data integrity checks pass prior to committing.
```

---

## 4. Complete Archive of All Hooks & Code

> **Reference Archive:** The complete code of all hooks, scripts, and rule sections is backed up below. If you delete or modify `.githooks` or `flow_commit.py`, you can always copy-paste this code back.

### 1. `.githooks/pre-commit`
```bash
#!/usr/bin/env bash
# .githooks/pre-commit
# Enforces:
# 1. Branch Protection (no direct commits to main/master)
# 2. 6-Tier Data Integrity & Governance Gatekeeper
# 3. 1-File-Per-Commit Rule (Build-Flow Atomic Policy)
# 4. Max 400 net functional lines per commit
# 5. Auto-regeneration of AI_INDEX.md

# 0. Branch Protection (Rule 6: Never commit directly to main or master)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    echo "=================================================================="
    echo " ❌ COMMIT REJECTED: Direct commits to '$CURRENT_BRANCH' are forbidden!"
    echo " Rule 6 of RULESET.md mandates working on a feature branch."
    echo " Create a branch: git checkout -b feat/your-feature"
    echo "=================================================================="
    exit 1
fi

# 1. Verify 6-Tier Data Integrity & Governance Gatekeeper (Rules 1-6)
if [ -f "scripts/verify_data_integrity.py" ]; then
    echo "--> [Pre-Commit] Verifying 6-tier data integrity & platform rules..."
    python3 scripts/verify_data_integrity.py || exit 1
fi

# 2. 1-File-Per-Commit Rule (Rule 7: Build-Flow Atomic Policy)
if [ "$ALLOW_MULTI_FILE_COMMIT" != "1" ]; then
    # Collect list of staged files, ignoring AI_INDEX.md which is auto-refreshed
    STAGED_FILES=()
    while IFS= read -r file; do
        if [ -n "$file" ] && [ "$file" != "AI_INDEX.md" ]; then
            STAGED_FILES+=("$file")
        fi
    done < <(git diff --cached --name-only)

    NUM_FILES=${#STAGED_FILES[@]}

    if [ "$NUM_FILES" -gt 1 ]; then
        echo ""
        echo "=================================================================="
        echo " ❌ COMMIT REJECTED: 1-File-Per-Commit Rule Exceeded ($NUM_FILES files staged)!"
        echo "=================================================================="
        echo " Repository policy mandates committing 1 functional file per commit,"
        echo " sequenced by the architectural build flow:"
        echo "   (Types -> Engines -> Database -> API -> Web -> Tests -> Governance)"
        echo ""
        echo " Currently staged files:"
        for f in "${STAGED_FILES[@]}"; do
            echo "   - $f"
        done
        echo ""
        echo " To commit your changes in build-flow order:"
        echo "   1. Unstage all changes:"
        echo "        git reset HEAD"
        echo "   2. Use the automated build-flow assistant:"
        echo "        pnpm commit:flow"
        echo "      or stage and commit each file in order:"
        echo "        git add <file>"
        echo "        git commit -m \"<type>(<scope>): <message>\""
        echo ""
        echo " (Emergency bypass: ALLOW_MULTI_FILE_COMMIT=1 git commit -m '...')"
        echo "=================================================================="
        echo ""
        exit 1
    fi
fi

# 3. Check Binary File Size Limit (Rule 5: Max 40 MB per file)
MAX_FILE_BYTES=$((40 * 1024 * 1024))
while IFS= read -r file; do
    if [ -f "$file" ]; then
        FILE_SIZE=$(wc -c < "$file" | tr -d ' ')
        if [ "$FILE_SIZE" -gt "$MAX_FILE_BYTES" ]; then
            FILE_MB=$((FILE_SIZE / 1024 / 1024))
            echo ""
            echo "=================================================================="
            echo " ❌ COMMIT REJECTED: File size exceeds 40 MB limit!"
            echo "=================================================================="
            echo " '$file' is ${FILE_MB} MB (maximum allowed is 40 MB)."
            echo " Rule 5 of RULESET.md mandates tracking large binary rasters in"
            echo " 'data/manifest.json' and downloading them via 'scripts/sync_data.py'."
            echo "=================================================================="
            echo ""
            exit 1
        fi
    fi
done < <(git diff --cached --name-only)

# 4. Update AI_INDEX.md if generator script exists
if [ -f "scripts/generate_ai_index.py" ]; then
    echo "--> [Pre-Commit] Refreshing dynamic AI_INDEX.md..."
    python3 scripts/generate_ai_index.py > /dev/null 2>&1 || true
    if [ -f "AI_INDEX.md" ]; then
        git add AI_INDEX.md
    fi
fi

# 4. Check Atomic Commit Limit (Max 400 net functional lines)
if [ "$ALLOW_LARGE_COMMIT" = "1" ]; then
    echo "--> [Pre-Commit] ALLOW_LARGE_COMMIT=1 set; bypassing commit size check."
    exit 0
fi

MAX_LINES=400
TOTAL_LINES=0

# Sum up added and deleted lines, excluding manifests, lockfiles, and data tables
while read -r added deleted filepath; do
    if [[ "$added" =~ ^[0-9]+$ ]] && [[ "$deleted" =~ ^[0-9]+$ ]]; then
        case "$filepath" in
            *lock.yaml|*lock.json|*.lock|AI_INDEX.md|data/manifest.json|*.geojson|*.csv|data/*|data/calculated/*|data/real/*|data/proxy/*|dist/*|*public/geojson/*)
                # Exempt from line count limit (data assets and build artifacts)
                ;;
            *)
                TOTAL_LINES=$((TOTAL_LINES + added + deleted))
                ;;
        esac
    fi
done < <(git diff --cached --numstat)

if [ "$TOTAL_LINES" -gt "$MAX_LINES" ]; then
    echo ""
    echo "=================================================================="
    echo " ❌ COMMIT REJECTED: Atomic Commit Line Limit Exceeded!"
    echo "=================================================================="
    echo " This commit modifies $TOTAL_LINES net functional code lines (limit: $MAX_LINES)."
    echo " Rule 7 of RULESET.md requires atomic commits to keep reviews manageable."
    echo ""
    echo " Please split your staged changes into smaller commits:"
    echo "   git reset HEAD <files>"
    echo "   git commit -m 'feat: step 1 schema & interfaces'"
    echo ""
    echo " (Bypass: ALLOW_LARGE_COMMIT=1 git commit -m '...')"
    echo "=================================================================="
    echo ""
    exit 1
fi

exit 0
```

---

### 2. `.githooks/commit-msg`
```bash
#!/usr/bin/env bash
# .githooks/commit-msg
# Enforces Conventional Commits standard and prevents vague commit messages.

COMMIT_MSG_FILE="$1"
FIRST_LINE=$(head -n 1 "$COMMIT_MSG_FILE" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

# 1. Allow merge and revert commits automatically
if [[ "$FIRST_LINE" =~ ^Merge ]] || [[ "$FIRST_LINE" =~ ^Revert ]]; then
    exit 0
fi

# 2. Conventional Commit Regex
# Format: <type>(<scope>): <subject>  or  <type>: <subject>
CONVENTIONAL_REGEX="^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-zA-Z0-9_\/\.-]+\))?!?: .{5,100}$"

if ! [[ "$FIRST_LINE" =~ $CONVENTIONAL_REGEX ]]; then
    echo ""
    echo "=================================================================="
    echo " ❌ COMMIT REJECTED: Invalid Commit Message Format!"
    echo "=================================================================="
    echo " Your commit message was:"
    echo "   \"$FIRST_LINE\""
    echo ""
    echo " Commits must follow the Conventional Commits specification:"
    echo "   <type>(<scope>): <subject>"
    echo ""
    echo " Allowed Types:"
    echo "   feat     New feature or functional enhancement"
    echo "   fix      Bug fix or correction"
    echo "   refactor Code restructuring with no behavior change"
    echo "   test     Adding or updating automated tests"
    echo "   docs     Documentation changes only"
    echo "   perf     Performance improvement"
    echo "   ci       CI/CD configuration"
    echo "   chore    Tooling, dependencies, or git hygiene"
    echo ""
    echo " Build-Flow Scope Examples:"
    echo "   feat(types/palika): define crop water demand schema"
    echo "   feat(engine/nexus): implement water balance calculations"
    echo "   feat(api/gateway): expose palika profile endpoint"
    echo "   feat(web/DistrictMap): collapse live weather telemetry drawer"
    echo "   test(engine/nexus): add metric conversion assertions"
    echo "   chore(hooks): enforce conventional commit format"
    echo "=================================================================="
    echo ""
    exit 1
fi

exit 0
```

---

### 3. `.githooks/pre-push`
```bash
#!/usr/bin/env bash
# .githooks/pre-push
# 1. Blocks direct git push to main / master
# 2. Runs automated tests before code leaves local machine

while read local_ref local_sha remote_ref remote_sha
do
    if [[ "$remote_ref" == "refs/heads/main" || "$remote_ref" == "refs/heads/master" ]]; then
        echo ""
        echo "=================================================================="
        echo " ❌ PUSH REJECTED: Direct push to 'main' is strictly forbidden!"
        echo "=================================================================="
        echo " Rule 8 of RULESET.md prohibits pushing directly to main."
        echo ""
        echo " Please create a feature branch and submit a Pull Request:"
        echo "   git checkout -b feat/your-feature-name"
        echo "   git push origin feat/your-feature-name"
        echo "=================================================================="
        echo ""
        exit 1
    fi
done

# Run full test suite before push
if [ "$SKIP_TESTS" != "1" ]; then
    echo "--> [Pre-Push] Running test suite & data integrity verification..."
    pnpm test || {
        echo ""
        echo "=================================================================="
        echo " ❌ PUSH REJECTED: Test suite failed!"
        echo " Fix the failing tests or run 'pnpm test' to inspect failures."
        echo "=================================================================="
        echo ""
        exit 1
    }
fi

exit 0
```

---

### 4. `scripts/flow_commit.py`
```python
#!/usr/bin/env python3
"""
# ==============================================================================
# WEFES NEXUS NEPAL: BUILD-FLOW COMMIT ORCHESTRATOR
# ==============================================================================
# Enforces the 1-File-Per-Commit rule by sequencing all pending changes strictly
# through the architectural build-flow hierarchy:
#   Tier 1: Contracts & Types      (packages/shared-types, data/schemas)
#   Tier 2: Computational Engines  (engines/nexus, engines/water/hydro)
#   Tier 3: Database & Models      (packages/database)
#   Tier 4: Backend API Services   (apps/api)
#   Tier 5: Frontend UI & GIS      (apps/web)
#   Tier 6: Automated Test Suites  (*__tests__*, *.test.ts)
#   Tier 7: Tooling & Governance   (.githooks, scripts, docs, root configs)
# ==============================================================================
"""

import sys
import os
import subprocess
import re
from typing import List, Tuple, Dict

# ANSI Terminal Colors
BOLD = "\033[1m"
GREEN = "\033[32m"
BLUE = "\033[34m"
CYAN = "\033[36m"
YELLOW = "\033[33m"
RED = "\033[31m"
RESET = "\033[0m"

TIERS = [
    {
        "id": 1,
        "name": "Contracts & Types",
        "description": "Foundational domain schemas, interfaces, and unit types",
        "patterns": [r"^packages/shared-types/", r"^data/schemas/"],
        "default_type": "feat",
        "default_scope_prefix": "types"
    },
    {
        "id": 2,
        "name": "Computational Engines",
        "description": "Autonomous scientific calculation engines",
        "patterns": [r"^engines/"],
        "default_type": "feat",
        "default_scope_prefix": "engine"
    },
    {
        "id": 3,
        "name": "Database & Persistence",
        "description": "Data access models, repositories, and local adapters",
        "patterns": [r"^packages/database/"],
        "default_type": "feat",
        "default_scope_prefix": "db"
    },
    {
        "id": 4,
        "name": "Backend API Services",
        "description": "REST endpoints, domain routes, and orchestration controllers",
        "patterns": [r"^apps/api/"],
        "default_type": "feat",
        "default_scope_prefix": "api"
    },
    {
        "id": 5,
        "name": "Frontend UI & GIS",
        "description": "Interactive web app, MapLibre GIS, dashboards, and client components",
        "patterns": [r"^apps/web/"],
        "default_type": "feat",
        "default_scope_prefix": "web"
    },
    {
        "id": 6,
        "name": "Automated Test Suites",
        "description": "Unit, integration, and contract tests across all workspaces",
        "patterns": [r"test", r"__tests__", r"\.spec\.", r"\.test\."],
        "default_type": "test",
        "default_scope_prefix": "test"
    },
    {
        "id": 7,
        "name": "Tooling & Governance",
        "description": "Git hooks, build scripts, documentation, and root project configs",
        "patterns": [r"^\.githooks/", r"^scripts/", r"\.md$", r"^package\.json$", r"^Makefile$", r"^turbo\.json$"],
        "default_type": "chore",
        "default_scope_prefix": "governance"
    }
]

def get_git_status() -> List[Tuple[str, str]]:
    cmd = ["git", "status", "--porcelain"]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    files = []
    for line in res.stdout.splitlines():
        if not line.strip():
            continue
        status = line[:2].strip()
        filepath = line[3:].strip()
        if " -> " in filepath:
            filepath = filepath.split(" -> ")[1].strip()
        if filepath == "AI_INDEX.md":
            continue
        files.append((status, filepath))
    return files

def assign_tier(filepath: str) -> Dict:
    for tier in TIERS:
        for pattern in tier["patterns"]:
            if re.search(pattern, filepath):
                return tier
    return TIERS[-1]

def suggest_commit_message(tier: Dict, filepath: str, status: str) -> str:
    filename = os.path.basename(filepath)
    basename, _ = os.path.splitext(filename)
    prefix = tier["default_type"]
    scope = tier["default_scope_prefix"]
    parts = filepath.split("/")
    if len(parts) > 2:
        scope = f"{parts[0]}/{parts[1]}"
    action = "update"
    if "?" in status or "A" in status:
        action = "add"
    elif "D" in status:
        action = "remove"
    return f"{prefix}({scope}): {action} {basename}"
```

---

### 5. Rule Text from `RULESET.md` and `AGENTS.md`

#### Rule 7 from `RULESET.md`:
```markdown
## Rule 7: 1-File-Per-Commit & Build-Flow Dependency Sequencing
- **1-File-Per-Commit Enforcement**: Every commit must modify exactly **1 functional file** (enforced by `.githooks/pre-commit`), guaranteeing granular bisectability and exact rollbacks.
- **Architectural Build-Flow Order**: When committing changes across multiple files, commits MUST flow strictly in dependency sequence:
  1. **Tier 1: Contracts & Types** (`packages/shared-types`, `data/schemas`)
  2. **Tier 2: Computational Engines** (`engines/nexus`, `engines/water/hydro`)
  3. **Tier 3: Database & Models** (`packages/database`)
  4. **Tier 4: Backend API Services** (`apps/api`)
  5. **Tier 5: Frontend UI & GIS** (`apps/web`)
  6. **Tier 6: Automated Test Suites** (`*__tests__*`, `*.test.ts`)
  7. **Tier 7: Tooling & Governance** (`.githooks`, `scripts`, documentation, root configs)
- **Conventional Commits Hook**: Commit messages must conform to `<type>(<scope>): <subject>` (enforced by `.githooks/commit-msg`).
- **Atomic Size Limit**: Net functional code changes per commit must **NOT exceed 400 lines**.
- **Automated Workflow**: Run `pnpm commit:flow` or `make commit-flow` to automatically sort and commit pending files in build-flow sequence.
- *(Emergency bypass for large scaffolding or multi-file renames: `ALLOW_MULTI_FILE_COMMIT=1 git commit -m "..."`)*.
```

#### Rule 6 from `AGENTS.md`:
```markdown
## 6. Git Hygiene, 1-File Commits & Build-Flow Sequencing
- Strict branch protection: Never push directly to `main`.
- **1-File-Per-Commit**: Every commit must modify exactly 1 functional file (enforced by `.githooks/pre-commit`).
- **Build-Flow Sequence**: Multi-file deliveries must flow in architectural dependency order:
  `Types -> Engines -> Database -> API -> Web -> Tests -> Tooling/Governance`.
- **Conventional Commits**: Commit messages must conform to `<type>(<scope>): <subject>` (enforced by `.githooks/commit-msg`).
- Keep all commits atomic: Max 400 net functional lines per commit.
- Always run `python3 scripts/generate_ai_index.py` before committing (or use `pnpm commit:flow`).
```

---

## 5. How to Restore Everything Back to Original State

If you ever wish to turn the full enforcement system back on:

1. Ensure the files exist in `.githooks/` (or copy them from the archive in Section 4 above).
2. Make sure they are executable:
   ```bash
   chmod +x .githooks/pre-commit .githooks/commit-msg .githooks/pre-push
   ```
3. Re-link git hooks path:
   ```bash
   git config core.hooksPath .githooks
   ```
4. Verify by checking `git config core.hooksPath`.
