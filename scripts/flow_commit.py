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
        "description": "REST endpoints, gateways, middleware, and controllers",
        "patterns": [r"^apps/api/"],
        "default_type": "feat",
        "default_scope_prefix": "api"
    },
    {
        "id": 5,
        "name": "Frontend UI & Visualization",
        "description": "Map views, dashboards, charts, widgets, and styles",
        "patterns": [r"^apps/web/"],
        "default_type": "feat",
        "default_scope_prefix": "web"
    },
    {
        "id": 6,
        "name": "Automated Test Suites",
        "description": "Unit tests, integration smoke tests, and fixtures",
        "patterns": [r"/__tests__/", r"\.test\.ts$", r"\.spec\.ts$", r"^tests/"],
        "default_type": "test",
        "default_scope_prefix": "test"
    },
    {
        "id": 7,
        "name": "Tooling, Hooks & Governance",
        "description": "Git hooks, scripts, configs, documentation, and manifest",
        "patterns": [
            r"^\.githooks/", r"^scripts/", r"^RULESET\.md$", r"^AGENTS\.md$",
            r"^GEMINI\.md$", r"^Makefile$", r"^turbo\.json$", r"^package\.json$",
            r"^pnpm-", r"^README\.md$", r"^AI_INDEX\.md$"
        ],
        "default_type": "chore",
        "default_scope_prefix": "governance"
    }
]


def classify_file(filepath: str) -> Tuple[int, Dict]:
    """Assign an architectural tier to a given filepath."""
    # Special handling for tests located within packages or apps
    if "/__tests__/" in filepath or filepath.endswith(".test.ts") or filepath.endswith(".spec.ts"):
        return 6, TIERS[5]

    for tier in TIERS:
        for pattern in tier["patterns"]:
            if re.search(pattern, filepath):
                return tier["id"], tier

    # Fallback to Tier 7 (Governance/Tooling)
    return 7, TIERS[6]


def suggest_commit_message(filepath: str, tier: Dict) -> str:
    """Generate a high-quality initial commit message recommendation."""
    basename = os.path.basename(filepath)
    name_no_ext = os.path.splitext(basename)[0]
    tier_id = tier["id"]

    if basename == "package.json":
        if "engines/nexus" in filepath:
            return "feat(engine/nexus): configure vitest test runner in package.json"
        elif "apps/api" in filepath:
            return "feat(api): configure vitest test runner in package.json"
        elif "apps/web" in filepath:
            return "feat(web): update dependencies in package.json"
        else:
            return "chore(workspace): update root package.json configuration"

    if tier_id == 1:
        return f"feat(types/{name_no_ext}): update {name_no_ext} schema definitions"
    elif tier_id == 2:
        engine_name = "nexus" if "nexus" in filepath else "hydro"
        return f"feat(engine/{engine_name}): update {name_no_ext} logic"
    elif tier_id == 3:
        return f"feat(db/{name_no_ext}): update {name_no_ext} repository models"
    elif tier_id == 4:
        if filepath == "apps/api/src/index.ts":
            return "feat(api/index): export app and isolate server listen for testing"
        return f"feat(api/{name_no_ext}): update {name_no_ext} implementation"
    elif tier_id == 5:
        return f"feat(web/{name_no_ext}): update {name_no_ext} component"
    elif tier_id == 6:
        pkg = "engine" if "nexus" in filepath else ("api" if "apps/api" in filepath else "test")
        clean_name = name_no_ext.replace(".test", "")
        if "conversions" in filepath:
            return f"test({pkg}/conversions): add unit tests for metric conversions"
        elif "health" in filepath:
            return f"test({pkg}/health): add smoke test for gateway health endpoint"
        return f"test({pkg}/{clean_name}): add assertions for {clean_name}"
    else:
        if ".githooks" in filepath:
            return f"chore(hooks): update {name_no_ext} git hook enforcement"
        elif "scripts/" in filepath:
            return f"chore(scripts): update {name_no_ext} utility script"
        elif filepath.endswith(".md"):
            return f"docs({name_no_ext.lower()}): update {name_no_ext} platform documentation"
        else:
            return f"chore(config): update {basename} workspace configuration"


def get_changed_files() -> List[str]:
    """Retrieve all untracked, modified, and staged files from Git."""
    result = subprocess.run(
        ["git", "status", "--porcelain"],
        capture_output=True,
        text=True,
        check=True
    )

    files = []
    for line in result.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        # Format: XY <file> or XY <old> -> <new>
        parts = line.split(maxsplit=1)
        if len(parts) >= 2:
            path = parts[1]
            if " -> " in path:
                path = path.split(" -> ")[1]
            # Strip surrounding quotes if any
            path = path.strip('"')

            # If path is an untracked directory, recursively expand its files
            if os.path.isdir(path):
                for root, _, filenames in os.walk(path):
                    for fn in filenames:
                        files.append(os.path.join(root, fn))
            else:
                files.append(path)

    return list(dict.fromkeys(files))


def main():
    dry_run = "--dry-run" in sys.argv
    auto_mode = "--auto" in sys.argv

    print(f"\n{BOLD}{CYAN}=================================================================={RESET}")
    print(f"{BOLD}{CYAN} 🌊 WEFES NEXUS NEPAL: BUILD-FLOW COMMIT ORCHESTRATOR{RESET}")
    print(f"{BOLD}{CYAN}=================================================================={RESET}")
    print(f" Enforcing 1-file-per-commit sequenced by architectural dependency.\n")

    files = get_changed_files()
    if not files:
        print(f"{GREEN}✅ Working directory clean. No changes to commit.{RESET}\n")
        return

    # Filter out AI_INDEX.md if there are other files (it gets staged automatically in pre-commit)
    if len(files) > 1 and "AI_INDEX.md" in files:
        files = [f for f in files if f != "AI_INDEX.md"]

    # Sort files by Tier ID
    sorted_files = sorted(files, key=lambda f: (classify_file(f)[0], f))

    print(f"{BOLD}Found {len(sorted_files)} changed file(s) to commit:{RESET}")
    for idx, f in enumerate(sorted_files, start=1):
        tier_id, tier = classify_file(f)
        print(f"  {idx}. {YELLOW}[Tier {tier_id}: {tier['name']}]{RESET} {f}")

    print("")

    if dry_run:
        print(f"{BLUE}ℹ️  Dry-run mode active. No commits will be made.{RESET}\n")
        for idx, f in enumerate(sorted_files, start=1):
            tier_id, tier = classify_file(f)
            suggestion = suggest_commit_message(f, tier)
            print(f"  {BOLD}File {idx}:{RESET} {f}")
            print(f"  {BOLD}Suggested Message:{RESET} {suggestion}\n")
        return

    # Step through each file sequentially
    for idx, f in enumerate(sorted_files, start=1):
        tier_id, tier = classify_file(f)
        suggestion = suggest_commit_message(f, tier)

        print(f"{BOLD}------------------------------------------------------------------{RESET}")
        print(f" [{idx}/{len(sorted_files)}] {CYAN}Tier {tier_id}: {tier['name']}{RESET}")
        print(f" File: {BOLD}{f}{RESET}")
        print(f" Suggestion: {GREEN}{suggestion}{RESET}")

        if auto_mode:
            commit_msg = suggestion
        else:
            prompt = f" Commit message [Enter to use suggestion, 's' to skip, 'q' to quit]: "
            try:
                user_input = input(prompt).strip()
            except (KeyboardInterrupt, EOFError):
                print(f"\n{YELLOW}Aborted by user.{RESET}")
                sys.exit(0)

            if user_input.lower() == 'q':
                print(f"\n{YELLOW}Exiting commit flow.{RESET}")
                break
            elif user_input.lower() == 's':
                print(f"{YELLOW}Skipped {f}.{RESET}\n")
                continue
            elif user_input:
                commit_msg = user_input
            else:
                commit_msg = suggestion

        # Stage ONLY this single file
        subprocess.run(["git", "add", f], check=True)

        # Execute git commit
        commit_res = subprocess.run(["git", "commit", "-m", commit_msg])
        if commit_res.returncode != 0:
            print(f"\n{RED}❌ Commit failed for {f}. Stopping sequence.{RESET}")
            sys.exit(1)

        print(f"{GREEN}✓ Successfully committed:{RESET} {commit_msg}\n")

    print(f"{BOLD}{GREEN}=================================================================={RESET}")
    print(f"{BOLD}{GREEN} 🚀 Build-Flow Commit Sequence Complete!{RESET}")
    print(f"{BOLD}{GREEN}=================================================================={RESET}\n")


if __name__ == "__main__":
    main()
