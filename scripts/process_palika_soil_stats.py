# [DATA PROVENANCE]
# Data Source: data/real/land_and_soil/gulmi_soil_data.nc, data/real/boundaries/gulmi-palikas.json
# Classification: OBSERVED REAL (NARC NSSRC 100m Geospatial Soil Grid)
# Citations: National Soil Science Research Centre (NSSRC), Nepal Agricultural Research Council (NARC)

"""
Extracts zonal soil statistics for Gulmi's 12 Palikas from NARC 100m NetCDF raster archives.
Generates:
  - data/calculated/indicators/gulmi_palika_soil.json
  - apps/web/public/data/gulmi_palika_soil.json
Updates:
  - data/real/municipal/palika_profiles.json (palika-level soilPh baseline)
"""

import json
import os
import sys
from pathlib import Path
import numpy as np

# Ensure rasterio is available
try:
    import rasterio
    from rasterio.mask import mask
except ImportError:
    print("Error: rasterio is required to process gulmi_soil_data.nc")
    sys.exit(1)

REPO_ROOT = Path(__file__).resolve().parent.parent
NC_FILE = REPO_ROOT / "data" / "real" / "land_and_soil" / "gulmi_soil_data.nc"
BOUNDARIES_FILE = REPO_ROOT / "data" / "real" / "boundaries" / "gulmi-palikas.json"
PALIKA_PROFILES_FILE = REPO_ROOT / "data" / "real" / "municipal" / "palika_profiles.json"
OUTPUT_INDICATOR = REPO_ROOT / "data" / "calculated" / "indicators" / "gulmi_palika_soil.json"
PUBLIC_INDICATOR = REPO_ROOT / "apps" / "web" / "public" / "data" / "gulmi_palika_soil.json"

SOIL_FLAG_MEANINGS = "NoData CMe CMg CMo CMu CMx FLc GG GLe LPi LVx PHc PHh RGd RGe RK WR".split()
SOIL_TAXONOMIC_NAMES = {
    "CMe": "Eutric Cambisols",
    "CMg": "Gleyic Cambisols",
    "CMo": "Dystric Cambisols",
    "CMu": "Humic Cambisols",
    "CMx": "Chromic Cambisols",
    "FLc": "Calcaric Fluvisols",
    "GG": "Glaciers / Perennial Snow",
    "GLe": "Eutric Gleysols",
    "LPi": "Lithic Leptosols",
    "LVx": "Chromic Luvisols",
    "PHc": "Calcaric Phaeozems",
    "PHh": "Haplic Phaeozems",
    "RGd": "Dystric Regosols",
    "RGe": "Eutric Regosols",
    "RK": "Rock Outcrops",
    "WR": "Inland Water Bodies",
}


def classify_usda_texture(clay: float, silt: float, sand: float) -> str:
    """Classifies USDA soil textural triangle from percentage fractions."""
    if silt + 1.5 * clay < 15:
        return "Sand"
    elif silt + 2 * clay < 30:
        return "Loamy Sand"
    elif (clay >= 7 and clay < 20 and sand > 52 and silt + 2 * clay >= 30) or (
        clay < 7 and silt < 50 and silt + 2 * clay >= 30
    ):
        return "Sandy Loam"
    elif clay >= 7 and clay < 27 and silt >= 28 and silt < 50 and sand <= 52:
        return "Loam"
    elif (silt >= 50 and (clay >= 12 and clay < 27)) or (silt >= 50 and silt < 80 and clay < 12):
        return "Silt Loam"
    elif silt >= 80 and clay < 12:
        return "Silt"
    elif clay >= 20 and clay < 35 and silt < 28 and sand > 45:
        return "Sandy Clay Loam"
    elif clay >= 27 and clay < 40 and sand > 20 and sand <= 45:
        return "Clay Loam"
    elif clay >= 27 and clay < 40 and sand <= 20:
        return "Silty Clay Loam"
    elif clay >= 35 and sand > 45:
        return "Sandy Clay"
    elif clay >= 40 and silt >= 40:
        return "Silty Clay"
    elif clay >= 40:
        return "Clay"
    return "Loam"


def compute_saxton_rawls_awc(clay_pct: float, sand_pct: float, som_pct: float) -> float:
    """Computes Available Water Capacity (AWC = FC - WP) via Saxton & Rawls (2006) pedotransfer equations."""
    s = sand_pct / 100.0
    c = clay_pct / 100.0
    om = som_pct

    # Permanent Wilting Point (theta_1500)
    theta_1500t = (
        -0.024 * s
        + 0.487 * c
        + 0.006 * om
        + 0.005 * (s * om)
        - 0.013 * (c * om)
        + 0.068 * (s * c)
        + 0.031
    )
    theta_1500 = theta_1500t + (0.14 * theta_1500t - 0.02)

    # Field Capacity (theta_33)
    theta_33t = (
        -0.251 * s
        + 0.195 * c
        + 0.011 * om
        + 0.006 * (s * om)
        - 0.027 * (c * om)
        + 0.452 * (s * c)
        + 0.299
    )
    theta_33 = theta_33t + (1.283 * (theta_33t**2) - 0.374 * theta_33t - 0.015)

    awc = theta_33 - theta_1500
    return max(0.08, min(0.20, float(awc)))


def rate_ph(ph: float) -> str:
    if ph < 5.0:
        return "Strongly Acidic"
    elif ph < 6.0:
        return "Moderately Acidic"
    elif ph <= 7.2:
        return "Neutral / Optimal"
    return "Slightly Alkaline"


def rate_nitrogen(n_pct: float) -> str:
    if n_pct < 0.10:
        return "Low"
    elif n_pct <= 0.20:
        return "Medium"
    return "High"


def rate_phosphorus(p_kgha: float) -> str:
    if p_kgha < 30.0:
        return "Low"
    elif p_kgha <= 55.0:
        return "Medium"
    return "High"


def rate_potassium(k_kgha: float) -> str:
    if k_kgha < 110.0:
        return "Low"
    elif k_kgha <= 280.0:
        return "Medium"
    return "High"


def rate_organic_matter(som_pct: float) -> str:
    if som_pct < 2.5:
        return "Low"
    elif som_pct <= 4.0:
        return "Medium"
    return "High"


def main():
    if not NC_FILE.exists():
        print(f"Error: {NC_FILE} not found on disk!")
        sys.exit(1)
    if not BOUNDARIES_FILE.exists():
        print(f"Error: {BOUNDARIES_FILE} not found on disk!")
        sys.exit(1)

    with open(BOUNDARIES_FILE, "r", encoding="utf-8") as f:
        boundaries = json.load(f)

    variables = [
        "ph",
        "nitrogen",
        "phosphorus",
        "potassium",
        "organic_matter",
        "clay",
        "silt",
        "sand",
        "zinc",
        "boron",
        "dominant_soil",
    ]

    palika_results = {}
    features = boundaries.get("features", [])

    print(f"Extracting zonal soil statistics for {len(features)} palikas from {NC_FILE.name}...")

    # Pre-open raster readers for all variables
    raster_sources = {}
    for var in variables:
        uri = f"netcdf:{NC_FILE}:{var}"
        raster_sources[var] = rasterio.open(uri)

    try:
        for feat in features:
            p_name = feat["properties"]["name"]
            geom = [feat["geometry"]]

            # Mask all rasters
            masked_arrays = {}
            for var in variables:
                out_img, _ = mask(raster_sources[var], geom, crop=True)
                masked_arrays[var] = out_img[0]

            # Primary valid mask from ph (non-nan)
            ph_arr = masked_arrays["ph"]
            valid_mask = ~np.isnan(ph_arr)
            sample_count = int(np.sum(valid_mask))

            if sample_count == 0:
                print(f"Warning: No valid pixels found for {p_name}!")
                continue

            def get_stats(arr):
                valid_vals = arr[valid_mask]
                valid_vals = valid_vals[~np.isnan(valid_vals)]
                if len(valid_vals) == 0:
                    return {
                        "mean": 0.0,
                        "min": 0.0,
                        "max": 0.0,
                        "median": 0.0,
                        "std": 0.0,
                    }
                return {
                    "mean": float(np.mean(valid_vals)),
                    "min": float(np.min(valid_vals)),
                    "max": float(np.max(valid_vals)),
                    "median": float(np.median(valid_vals)),
                    "std": float(np.std(valid_vals)),
                }

            ph_s = get_stats(masked_arrays["ph"])
            n_s = get_stats(masked_arrays["nitrogen"])
            p_s = get_stats(masked_arrays["phosphorus"])
            k_s = get_stats(masked_arrays["potassium"])
            som_s = get_stats(masked_arrays["organic_matter"])
            clay_s = get_stats(masked_arrays["clay"])
            silt_s = get_stats(masked_arrays["silt"])
            sand_s = get_stats(masked_arrays["sand"])
            zn_s = get_stats(masked_arrays["zinc"])
            b_s = get_stats(masked_arrays["boron"])

            # Dominant soil unit
            soil_code_arr = masked_arrays["dominant_soil"][valid_mask]
            soil_code_arr = soil_code_arr[soil_code_arr > 0]
            if len(soil_code_arr) > 0:
                vals, counts = np.unique(soil_code_arr, return_counts=True)
                top_idx = int(vals[np.argmax(counts)])
                dom_code = SOIL_FLAG_MEANINGS[top_idx] if top_idx < len(SOIL_FLAG_MEANINGS) else str(top_idx)
                dom_name = SOIL_TAXONOMIC_NAMES.get(dom_code, dom_code)
            else:
                dom_code = "CMe"
                dom_name = "Eutric Cambisols"

            texture_class = classify_usda_texture(clay_s["mean"], silt_s["mean"], sand_s["mean"])

            awc_val = compute_saxton_rawls_awc(clay_s["mean"], sand_s["mean"], som_s["mean"])

            palika_results[p_name] = {
                "sampleCount": sample_count,
                "ph": round(ph_s["mean"], 2),
                "phMin": round(ph_s["min"], 2),
                "phMax": round(ph_s["max"], 2),
                "phStd": round(ph_s["std"], 2),
                "phRating": rate_ph(ph_s["mean"]),
                "nitrogenPct": round(n_s["mean"], 3),
                "nitrogenMin": round(n_s["min"], 3),
                "nitrogenMax": round(n_s["max"], 3),
                "nitrogenStd": round(n_s["std"], 3),
                "nitrogenRating": rate_nitrogen(n_s["mean"]),
                "phosphorusKgHa": round(p_s["mean"], 1),
                "phosphorusMin": round(p_s["min"], 1),
                "phosphorusMax": round(p_s["max"], 1),
                "phosphorusStd": round(p_s["std"], 1),
                "phosphorusRating": rate_phosphorus(p_s["mean"]),
                "potassiumKgHa": round(k_s["mean"], 1),
                "potassiumMin": round(k_s["min"], 1),
                "potassiumMax": round(k_s["max"], 1),
                "potassiumStd": round(k_s["std"], 1),
                "potassiumRating": rate_potassium(k_s["mean"]),
                "organicMatterPct": round(som_s["mean"], 2),
                "organicMatterMin": round(som_s["min"], 2),
                "organicMatterMax": round(som_s["max"], 2),
                "organicMatterStd": round(som_s["std"], 2),
                "organicMatterRating": rate_organic_matter(som_s["mean"]),
                "clayPct": round(clay_s["mean"], 1),
                "siltPct": round(silt_s["mean"], 1),
                "sandPct": round(sand_s["mean"], 1),
                "texture": texture_class,
                "awc": round(awc_val, 3),
                "zincPpm": round(zn_s["mean"], 2),
                "boronPpm": round(b_s["mean"], 2),
                "dominantSoilCode": dom_code,
                "dominantSoil": dom_name,
            }

            print(
                f"  ✓ {p_name:15s}: {sample_count:4d} cells | pH {palika_results[p_name]['ph']:4.2f} ({palika_results[p_name]['phRating']:18s}) | "
                f"N {palika_results[p_name]['nitrogenPct']:.3f}% | P {palika_results[p_name]['phosphorusKgHa']:5.1f} | "
                f"K {palika_results[p_name]['potassiumKgHa']:5.1f} | SOM {palika_results[p_name]['organicMatterPct']:4.2f}% | "
                f"{texture_class}"
            )

    finally:
        for src in raster_sources.values():
            src.close()

    output_data = {
        "_provenance": {
            "source": "data/real/land_and_soil/gulmi_soil_data.nc",
            "classification": "OBSERVED REAL (NARC NSSRC 100m Geospatial Grid)",
            "citations": "National Soil Science Research Centre (NSSRC), Nepal Agricultural Research Council (NARC)",
            "description": "Zonal municipal soil chemistry, texture, and fertility indicators for Gulmi's 12 local levels, derived from 37,800+ 100m resolution empirical raster cells.",
            "totalGridCells": sum(p["sampleCount"] for p in palika_results.values()),
        },
        "palikas": palika_results,
    }

    # Save to data/calculated/indicators/gulmi_palika_soil.json
    OUTPUT_INDICATOR.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_INDICATOR, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Successfully generated {OUTPUT_INDICATOR}")

    # Save to apps/web/public/data/gulmi_palika_soil.json
    PUBLIC_INDICATOR.parent.mkdir(parents=True, exist_ok=True)
    with open(PUBLIC_INDICATOR, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    print(f"✅ Successfully synced to {PUBLIC_INDICATOR}")

    # Update palika_profiles.json soilPh baselines
    if PALIKA_PROFILES_FILE.exists():
        with open(PALIKA_PROFILES_FILE, "r", encoding="utf-8") as f:
            profiles = json.load(f)

        updated_count = 0
        palikas_raw = profiles.get("palikas", {})
        palikas_list = palikas_raw.get("gulmi", []) if isinstance(palikas_raw, dict) else palikas_raw
        if isinstance(palikas_list, list):
            for p in palikas_list:
                if isinstance(p, dict):
                    p_name = p.get("name")
                    if p_name in palika_results:
                        p["soilPh"] = palika_results[p_name]["ph"]
                        updated_count += 1

        with open(PALIKA_PROFILES_FILE, "w", encoding="utf-8") as f:
            json.dump(profiles, f, indent=2, ensure_ascii=False)
        print(f"✅ Successfully updated empirical soilPh for {updated_count} palikas in {PALIKA_PROFILES_FILE}")


if __name__ == "__main__":
    main()
