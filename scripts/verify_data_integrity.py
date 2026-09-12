#!/usr/bin/env python3
"""
==============================================================================
WEFES NEXUS NEPAL: DATA INTEGRITY & GOVERNANCE VERIFIER
==============================================================================
This script is an automated gatekeeper that enforces:
1. Physical existence of all data paths cited in code (Zero-Hallucination).
2. Engine isolation (Zero inward imports from apps/ or packages/ into engines/).
3. Detection of synthetic / mock data markers in data/real/.

It is executed on pre-commit and during CI. Exits with 0 on pass, 1 on failure.
==============================================================================
"""

import os
import re
import sys
from pathlib import Path

# Repository root is parent of scripts directory
REPO_ROOT = Path(__file__).resolve().parent.parent

# Directories to scan for data path references
SCAN_DIRS = ["apps", "engines", "packages"]

# Extensions to scan
SCAN_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".py", ".json", ".md"}

# Pattern to capture data path references: data/(real|calculated|proxy)/...
DATA_PATH_PATTERN = re.compile(
    r'(?:["\'`])(?:\.?\.?/)*(data/(?:real|calculated|proxy)/[a-zA-Z0-9_\-\./]+\.[a-zA-Z0-9]+)(?:["\'`])'
)

# Engine inward import pattern (Rule 1)
INWARD_IMPORT_PATTERN_TS = re.compile(r'from\s+["\'](?:\.\./)*?(?:apps/|packages/)[^"\']*["\']')
INWARD_IMPORT_PATTERN_PY = re.compile(r'^\s*(?:import\s+(?:apps|packages)|from\s+(?:apps|packages))')


def check_data_references() -> list[str]:
    """Scans code for data references and verifies their physical existence on disk."""
    errors = []
    checked_paths = set()

    for scan_dir_name in SCAN_DIRS:
        scan_dir = REPO_ROOT / scan_dir_name
        if not scan_dir.exists():
            continue

        for root, dirs, files in os.walk(scan_dir):
            # Skip build and dependency directories
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
                        # Check if this asset is a tracked heavy binary defined in data/manifest.json
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
                            # Calculate line number
                            line_num = content[:match.start()].count("\n") + 1
                            errors.append(
                                f"❌ Missing Data File: '{rel_data_path}' cited at "
                                f"{file_path.relative_to(REPO_ROOT)}:{line_num} does not exist on disk!"
                            )

    return errors, checked_paths


def check_engine_isolation() -> list[str]:
    """Ensures engines/ does not import inward from apps/ or packages/ (Rule 1)."""
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
                                f"❌ Engine Isolation Violation (Rule 1): {file_path.relative_to(REPO_ROOT)}:{idx} "
                                f"imports inward from apps/ or packages/!"
                            )
            elif file_path.suffix == ".py":
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    for idx, line in enumerate(f, 1):
                        if INWARD_IMPORT_PATTERN_PY.search(line):
                            errors.append(
                                f"❌ Engine Isolation Violation (Rule 1): {file_path.relative_to(REPO_ROOT)}:{idx} "
                                f"imports inward from apps or packages!"
                            )

    return errors


def check_real_data_discipline() -> list[str]:
    """Ensures data/real/ files do not contain forbidden synthetic markers."""
    errors = []
    real_dir = REPO_ROOT / "data" / "real"
    if not real_dir.exists():
        return errors

    # Forbidden terms indicating synthetic/hallucinated data in empirical tier
    synthetic_markers = [
        "SYNTHETIC_ESTIMATE",
        "MOCK_STATION",
        "GENERATED_SYNTHETIC",
        "ASSUMED_OBSERVATION"
    ]

    for root, dirs, files in os.walk(real_dir):
        for file in files:
            if file.endswith((".csv", ".json", ".txt", ".md")):
                file_path = Path(root) / file
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read(5000)  # Check first 5KB
                        for marker in synthetic_markers:
                            if marker in content:
                                errors.append(
                                    f"❌ Synthetic Data Marker Detected in data/real/: '{marker}' found in "
                                    f"{file_path.relative_to(REPO_ROOT)}! data/real/ must contain ONLY observed data."
                                )
                except Exception as e:
                    pass

    return errors


def main():
    print("==================================================================")
    print(" 🛡️  WEFES NEXUS NEPAL: DATA INTEGRITY & GOVERNANCE GATEKEEPER")
    print("==================================================================")

    data_errors, checked_paths = check_data_references()
    isolation_errors = check_engine_isolation()
    real_data_errors = check_real_data_discipline()

    all_errors = data_errors + isolation_errors + real_data_errors

    print(f" Checked {len(checked_paths)} unique data file citations across source code.")

    if all_errors:
        print("\n❌ DATA GOVERNANCE VIOLATIONS DETECTED:\n")
        for err in all_errors:
            print(f"  • {err}")
        print("\n==================================================================")
        print(" Commit or build rejected! Please correct the references or remove")
        print(" synthetic data before proceeding.")
        print("==================================================================")
        sys.exit(1)
    else:
        print(" ✅ All data citations exist on disk.")
        print(" ✅ Engine isolation verified (zero inward imports).")
        print(" ✅ Real data empirical discipline verified.")
        print("==================================================================")
        print(" 🚀 DATA INTEGRITY CHECK PASSED!")
        print("==================================================================")
        sys.exit(0)


if __name__ == "__main__":
    main()
