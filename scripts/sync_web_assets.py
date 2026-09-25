#!/usr/bin/env python3
"""
# ==============================================================================
# DATA PROVENANCE
# ------------------------------------------------------------------------------
# Data Source: data/real/, data/calculated/
# Classification: AUTOMATED WEB ASSET SYNCHRONIZATION PIPELINE
# Citations: WEFE Nexus Nepal Platform Data Governance
# ------------------------------------------------------------------------------
# Purpose: Automatically prepares and synchronizes client-ready data assets from
#          the authoritative root data repository into apps/web/public/.
# ==============================================================================
"""

import os
import sys
import shutil
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DATA_DIR = REPO_ROOT / "apps" / "web" / "public" / "data"
PUBLIC_GEOJSON_DIR = REPO_ROOT / "apps" / "web" / "public" / "geojson"

# Canonical source mappings: (source_path_relative_to_repo, target_dir, target_filename)
SYNC_MAPPINGS = [
    # Palika Sectoral Indicators
    ("data/calculated/indicators/gulmi_palika_cooking.json", PUBLIC_DATA_DIR, "gulmi_palika_cooking.json"),
    ("data/calculated/indicators/gulmi_palika_ghi.json", PUBLIC_DATA_DIR, "gulmi_palika_ghi.json"),
    ("data/calculated/indicators/gulmi_palika_grid.json", PUBLIC_DATA_DIR, "gulmi_palika_grid.json"),
    ("data/calculated/indicators/gulmi_palika_landholding.json", PUBLIC_DATA_DIR, "gulmi_palika_landholding.json"),
    ("data/calculated/indicators/gulmi_palika_soil.json", PUBLIC_DATA_DIR, "gulmi_palika_soil.json"),
    ("data/calculated/indicators/gulmi_palika_transit.json", PUBLIC_DATA_DIR, "gulmi_palika_transit.json"),
    ("data/real/boundaries/palika_centroids.json", PUBLIC_DATA_DIR, "palika_centroids.json"),
    ("data/calculated/hydro_reaches/hydro_palika_summary.json", PUBLIC_DATA_DIR, "hydro_palika_summary.json"),
    ("data/real/municipal/palika_profiles.json", PUBLIC_DATA_DIR, "palika_profiles.json"),
    
    # Spatial GeoJSON layers
    ("data/real/boundaries/gulmi-palikas.json", PUBLIC_GEOJSON_DIR, "gulmi-palikas.json"),
    ("data/real/hydrology/gulmi_hydrology_assets.json", PUBLIC_GEOJSON_DIR, "gulmi-hydrology-assets.json"),
]


def sync_assets():
    print("==================================================================")
    print(" 🚀 WEFES NEXUS NEPAL: WEB ASSET SYNCHRONIZATION PIPELINE")
    print("==================================================================")

    PUBLIC_DATA_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_GEOJSON_DIR.mkdir(parents=True, exist_ok=True)

    synced_count = 0
    errors = 0

    for src_rel, target_dir, target_name in SYNC_MAPPINGS:
        src_path = REPO_ROOT / src_rel
        target_path = target_dir / target_name

        if not src_path.exists():
            print(f"⚠️  [SKIP] Source file missing: {src_rel}")
            errors += 1
            continue

        try:
            # Verify valid JSON
            with open(src_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            # Copy to destination
            shutil.copy2(src_path, target_path)
            size_kb = target_path.stat().st_size / 1024.0
            print(f"✅ Synced: {src_rel} -> {target_path.relative_to(REPO_ROOT)} ({size_kb:.1f} KB)")
            synced_count += 1
        except Exception as e:
            print(f"❌ [ERROR] Failed to sync {src_rel}: {e}")
            errors += 1

    print("==================================================================")
    print(f" ✨ Done! Synchronized {synced_count} assets ({errors} errors).")
    print("==================================================================")

    if errors > 0:
        sys.exit(1)


if __name__ == "__main__":
    sync_assets()
