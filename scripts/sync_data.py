#!/usr/bin/env python3
"""
scripts/sync_data.py
====================
Downloads and verifies heavy binary assets listed in `data/manifest.json`.
Complies with Rule 5 of RULESET.md (Large Raster & Binary Git Hygiene).
"""

import hashlib
import json
import os
import sys
import tarfile
import urllib.request
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
MANIFEST_FILE = ROOT_DIR / "data" / "manifest.json"


def compute_sha256(filepath: Path) -> str:
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def main():
    if not MANIFEST_FILE.exists():
        print(f"❌ Error: Manifest file not found at {MANIFEST_FILE}")
        sys.exit(1)

    with open(MANIFEST_FILE, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    assets = manifest.get("assets", {})
    print(f"--> Syncing {len(assets)} heavy binary assets from manifest...")

    for asset_name, meta in assets.items():
        dest = ROOT_DIR / meta["destination_path"]
        expected_hash = meta["sha256"]
        url = meta["source_url"]

        dest.parent.mkdir(parents=True, exist_ok=True)

        if dest.exists():
            actual_hash = compute_sha256(dest)
            if actual_hash == expected_hash:
                print(f"  ✓ {asset_name}: Present and verified (SHA-256 match)")
                continue
            else:
                print(f"  ⚠️ {asset_name}: Checksum mismatch! Re-downloading...")

        print(f"  ⬇️ Downloading {asset_name}...")
        api_key = os.environ.get("OPENTOPOGRAPHY_API_KEY", "8660814057d43340b72f513fbbb97983")
        full_url = f"{url}&API_Key={api_key}" if "API_Key=" not in url else url

        temp_dest = dest.parent / f"temp_{asset_name}"
        urllib.request.urlretrieve(full_url, str(temp_dest))

        if tarfile.is_tarfile(str(temp_dest)):
            with tarfile.open(str(temp_dest), "r:*") as tar:
                tar.extractall(path=str(dest.parent))
            temp_dest.unlink()
        else:
            temp_dest.rename(dest)

        # Verify
        actual_hash = compute_sha256(dest)
        if actual_hash == expected_hash:
            print(f"  ✓ {asset_name}: Downloaded and verified successfully!")
        else:
            print(f"  ⚠️ Warning: {asset_name} downloaded with hash {actual_hash} (expected {expected_hash})")

    print("--> Data sync completed successfully.")


if __name__ == "__main__":
    main()
