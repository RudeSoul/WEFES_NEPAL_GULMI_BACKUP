#!/usr/bin/env python3
"""
==============================================================================
WEFES NEXUS NEPAL: 6-TIER DATA INTEGRITY & GOVERNANCE GATEKEEPER
==============================================================================
This script is an automated gatekeeper enforcing ALL 6 platform rules:
1. Rule 1: Zero-Synthesis & Anti-Hallucination in data/real/
2. Rule 2: In-Code Data Lineage & Provenance ([DATA PROVENANCE] blocks)
3. Rule 3: Physical Disk Verification for all cited data paths
4. Rule 4: Headless Engine Isolation (zero inward imports into engines/)
5. Rule 5: Zero Hardcoding (no inline palika metric dictionaries/scores)
6. Rule 6: Branch Protection & Git Hygiene (no direct commits to main/master)

Executed on pre-commit and CI. Exits with 0 on full pass, 1 on failure.
==============================================================================
"""

import os
import re
import subprocess
import sys
from pathlib import Path

# Repository root is parent of scripts directory
REPO_ROOT = Path(__file__).resolve().parent.parent

# Directories to scan for source code and data citations
SCAN_DIRS = ["apps", "engines", "packages"]

# Extensions to scan
SCAN_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".py", ".json", ".md"}
CODE_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".py"}

# Pattern to capture data path references: data/(real|calculated|proxy)/...
DATA_PATH_PATTERN = re.compile(
    r'(?:["\'`])(?:\.?\.?/)*(data/(?:real|calculated|proxy)/[a-zA-Z0-9_\-\./]+\.[a-zA-Z0-9]+)(?:["\'`])'
)

# Engine inward import patterns (Rule 4)
INWARD_IMPORT_PATTERN_TS = re.compile(r'from\s+["\'](?:\.\./)*?(?:apps/|packages/)[^"\']*["\']')
INWARD_IMPORT_PATTERN_PY = re.compile(r'^\s*(?:import\s+(?:apps|packages)|from\s+(?:apps|packages))')

# Provenance block pattern (Rule 2)
PROVENANCE_BLOCK_PATTERN = re.compile(r'\[DATA PROVENANCE\]', re.IGNORECASE)

# Official 12 Gulmi Palikas (Rule 5)
GULMI_PALIKAS = {
    "kaligandaki", "satyawati", "ruru", "chandrakot",
    "chatrakot", "musikot", "isma", "gulmidarbar",
    "dhurkot", "resunga", "malika", "madane"
}


# ==============================================================================
# Rule 1: Zero-Synthesis in data/real/
# ==============================================================================
def check_real_data_discipline() -> list[str]:
    """Ensures data/real/ files contain strictly empirical data and no synthetic markers."""
    errors = []
    real_dir = REPO_ROOT / "data" / "real"
    if not real_dir.exists():
        return errors

    synthetic_markers = [
        "SYNTHETIC_ESTIMATE",
        "MOCK_STATION",
        "GENERATED_SYNTHETIC",
        "ASSUMED_OBSERVATION",
        "DUMMY_BENCHMARK",
        "PLACEHOLDER_METRIC"
    ]

    for root, dirs, files in os.walk(real_dir):
        for file in files:
            if file.endswith((".csv", ".json", ".txt", ".md")):
                file_path = Path(root) / file
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read(5000)
                        for marker in synthetic_markers:
                            if marker in content:
                                errors.append(
                                    f"❌ [Rule 1 Violation] Synthetic Data Marker Detected in data/real/: '{marker}' "
                                    f"found in {file_path.relative_to(REPO_ROOT)}! data/real/ is immutable observed real."
                                )
                except Exception as e:
                    pass

    return errors


# ==============================================================================
# Rule 2: In-Code Data Lineage & Provenance
# ==============================================================================
def check_data_provenance_blocks() -> list[str]:
    """Ensures all source files consuming data declare an in-code [DATA PROVENANCE] block."""
    errors = []

    for scan_dir_name in SCAN_DIRS:
        scan_dir = REPO_ROOT / scan_dir_name
        if not scan_dir.exists():
            continue

        for root, dirs, files in os.walk(scan_dir):
            dirs[:] = [d for d in dirs if d not in {
                "node_modules", "dist", ".turbo", "__pycache__", ".git", "coverage", ".next"
            }]

            for file in files:
                file_path = Path(root) / file
                if file_path.suffix not in CODE_EXTENSIONS:
                    continue

                # Skip tests and build tools
                if "test" in file_path.name.lower() or "spec" in file_path.name.lower() or "config" in file_path.name.lower():
                    continue

                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                except Exception as e:
                    continue

                # If file consumes data from data/ or exposes data datasets
                if DATA_PATH_PATTERN.search(content):
                    if not PROVENANCE_BLOCK_PATTERN.search(content):
                        errors.append(
                            f"❌ [Rule 2 Violation] Missing In-Code Provenance: {file_path.relative_to(REPO_ROOT)} "
                            f"references data/ but lacks a mandatory [DATA PROVENANCE] header block!"
                        )

    return errors


# ==============================================================================
# Rule 3: Physical Disk Verification
# ==============================================================================
def check_data_references() -> tuple[list[str], set[str]]:
    """Scans code for data references and verifies their physical existence on disk."""
    errors = []
    checked_paths = set()

    for scan_dir_name in SCAN_DIRS:
        scan_dir = REPO_ROOT / scan_dir_name
        if not scan_dir.exists():
            continue

        for root, dirs, files in os.walk(scan_dir):
            dirs[:] = [d for d in dirs if d not in {
                "node_modules", "dist", ".turbo", "__pycache__", ".git", "coverage", ".next"
            }]

            for file in files:
                file_path = Path(root) / file
                if file_path.suffix not in SCAN_EXTENSIONS:
                    continue

                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                except Exception as e:
                    errors.append(f"Failed to read {file_path.relative_to(REPO_ROOT)}: {e}")
                    continue

                for match in DATA_PATH_PATTERN.finditer(content):
                    rel_data_path = match.group(1)
                    checked_paths.add(rel_data_path)
                    physical_path = REPO_ROOT / rel_data_path

                    if not physical_path.exists():
                        # Check if this asset is a tracked heavy binary in data/manifest.json
                        manifest_path = REPO_ROOT / "data" / "manifest.json"
                        is_manifest_asset = False
                        if manifest_path.exists():
                            try:
                                import json
                                with open(manifest_path, "r", encoding="utf-8") as mf:
                                    manifest_data = json.load(mf)
                                    assets = manifest_data.get("assets", {})
                                    for asset_info in assets.values():
                                        if asset_info.get("destination_path") == rel_data_path:
                                            is_manifest_asset = True
                                            break
                            except Exception:
                                pass

                        if not is_manifest_asset:
                            line_num = content[:match.start()].count("\n") + 1
                            errors.append(
                                f"❌ [Rule 3 Violation] Missing Physical Data File: '{rel_data_path}' cited at "
                                f"{file_path.relative_to(REPO_ROOT)}:{line_num} does not exist on disk!"
                            )

    return errors, checked_paths


# ==============================================================================
# Rule 4: Headless Engine Isolation
# ==============================================================================
def check_engine_isolation() -> list[str]:
    """Ensures engines/ does not import inward from apps/ or packages/."""
    errors = []
    engines_dir = REPO_ROOT / "engines"
    if not engines_dir.exists():
        return errors

    for root, dirs, files in os.walk(engines_dir):
        dirs[:] = [d for d in dirs if d not in {"node_modules", "dist", ".turbo", "__pycache__", ".git"}]

        for file in files:
            file_path = Path(root) / file
            if file_path.suffix in {".ts", ".tsx", ".js", ".jsx"}:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    for idx, line in enumerate(f, 1):
                        if INWARD_IMPORT_PATTERN_TS.search(line):
                            errors.append(
                                f"❌ [Rule 4 Violation] Engine Isolation Broken: {file_path.relative_to(REPO_ROOT)}:{idx} "
                                f"imports inward from apps/ or packages/!"
                            )
            elif file_path.suffix == ".py":
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    for idx, line in enumerate(f, 1):
                        if INWARD_IMPORT_PATTERN_PY.search(line):
                            errors.append(
                                f"❌ [Rule 4 Violation] Engine Isolation Broken: {file_path.relative_to(REPO_ROOT)}:{idx} "
                                f"imports inward from apps or packages!"
                            )

    return errors


# ==============================================================================
# Rule 5: Zero Hardcoding (Palika Dictionaries & Dummy Metrics)
# ==============================================================================
def check_zero_hardcoding() -> list[str]:
    """Scans code for hardcoded Palika metric dictionaries or mock scoring maps."""
    errors = []

    for scan_dir_name in ["apps", "packages"]:
        scan_dir = REPO_ROOT / scan_dir_name
        if not scan_dir.exists():
            continue

        for root, dirs, files in os.walk(scan_dir):
            dirs[:] = [d for d in dirs if d not in {
                "node_modules", "dist", ".turbo", "__pycache__", ".git", "coverage", ".next"
            }]

            for file in files:
                file_path = Path(root) / file
                if file_path.suffix not in CODE_EXTENSIONS:
                    continue

                # Skip test files and type definitions
                if "test" in file_path.name.lower() or "spec" in file_path.name.lower() or file_path.name.endswith(".d.ts"):
                    continue

                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        lines = f.readlines()
                except Exception:
                    continue

                for idx, line in enumerate(lines):
                    # Check sliding window of 15 lines for hardcoded palika dictionary definitions
                    window = " ".join(lines[max(0, idx - 1):min(len(lines), idx + 14)])
                    found_palikas = [p for p in GULMI_PALIKAS if re.search(r'\b' + p + r'\b\s*:', window, re.IGNORECASE)]
                    if len(found_palikas) >= 4 and any(k in line for k in ["Record<", "= {", "const "]):
                        errors.append(
                            f"❌ [Rule 5 Violation] Hardcoded Palika Metric Dictionary Detected at "
                            f"{file_path.relative_to(REPO_ROOT)}:{idx + 1}!\n"
                            f"      Found keys: {found_palikas[:5]}... All metrics must load from data/."
                        )

    return errors


# ==============================================================================
# Rule 6: Git Hygiene & Branch Protection
# ==============================================================================
def check_branch_protection() -> list[str]:
    """Ensures commits are never made directly to main or master branches."""
    errors = []
    try:
        res = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
            check=True
        )
        branch = res.stdout.strip()
        if branch in {"main", "master"}:
            errors.append(
                f"❌ [Rule 6 Violation] Direct commit to protected branch '{branch}' is forbidden!\n"
                f"      Create a feature branch: git checkout -b feat/your-feature"
            )
    except Exception:
        pass
    return errors


# ==============================================================================
# Master Gatekeeper Runner
# ==============================================================================
def main():
    print("==================================================================")
    print(" 🛡️  WEFES NEXUS NEPAL: 6-TIER AUTOMATED GOVERNANCE GATEKEEPER")
    print("==================================================================")

    rule1_errors = check_real_data_discipline()
    rule2_errors = check_data_provenance_blocks()
    rule3_errors, checked_paths = check_data_references()
    rule4_errors = check_engine_isolation()
    rule5_errors = check_zero_hardcoding()
    rule6_errors = check_branch_protection()

    all_errors = (
        rule1_errors +
        rule2_errors +
        rule3_errors +
        rule4_errors +
        rule5_errors +
        rule6_errors
    )

    # Print summary status per rule
    def status_line(rule_num: int, name: str, errors: list, info: str = ""):
        if errors:
            print(f" [Rule {rule_num}] ❌ {name}: {len(errors)} violation(s)")
        else:
            print(f" [Rule {rule_num}] ✅ {name}{' (' + info + ')' if info else ''}")

    status_line(1, "Zero-Synthesis in data/real/", rule1_errors, "empirical tier clean")
    status_line(2, "In-Code [DATA PROVENANCE] Declaration", rule2_errors, "all data consumers declare lineage")
    status_line(3, "Physical Disk Verification", rule3_errors, f"{len(checked_paths)} valid citations")
    status_line(4, "Headless Engine Isolation", rule4_errors, "zero inward imports into engines/")
    status_line(5, "Zero Hardcoding", rule5_errors, "zero mock/dummy palika dictionaries")
    status_line(6, "Git Hygiene & Branch Protection", rule6_errors, "branch protected")

    print("==================================================================")

    if all_errors:
        print("\n❌ DATA GOVERNANCE & ARCHITECTURAL VIOLATIONS DETECTED:\n")
        for err in all_errors:
            print(f"  • {err}")
        print("\n==================================================================")
        print(" Commit rejected! Please correct the violations above.")
        print("==================================================================")
        sys.exit(1)
    else:
        print(" 🚀 ALL 6 PLATFORM RULES VERIFIED — COMMIT PERMITTED")
        print("==================================================================")
        sys.exit(0)


if __name__ == "__main__":
    main()
