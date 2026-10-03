#!/usr/bin/env python3
"""
# ===========================================================================
# DATA PROVENANCE
# ---------------------------------------------------------------------------
# River stations source:
#   Data Source: data/real/hydrology/River_data.csv
#   Classification: OBSERVED REAL (Department of Hydrology and Meteorology, Nepal)
#   Citations: Department of Hydrology and Meteorology (DHM), Nepal
# ---------------------------------------------------------------------------
# Purpose: Compiles spatial assets (river stations) into GeoJSON
#          for consumption by the web frontend.
# Consumed By: apps/web (DistrictMap Leaflet spatial layer)
# ===========================================================================
"""

import os
import sys
import csv
import json
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

REPO_ROOT = Path(__file__).resolve().parent.parent

# Official Gulmi District Bounding Box (derived from gulmi-district.json)
GULMI_BBOX = {
    "min_lon": 83.0239,
    "max_lon": 83.6073,
    "min_lat": 27.9206,
    "max_lat": 28.2707,
}

# Regional Basin Bounding Box (Kali Gandaki, Badigad, Ridi, Tinau hydrometric buffer)
REGIONAL_BBOX = {
    "min_lon": 82.8000,
    "max_lon": 83.8500,
    "min_lat": 27.6500,
    "max_lat": 28.3500,
}


def dms_to_decimal(dms_str: str) -> Optional[float]:
    """
    Converts Degrees_Minutes_Seconds (e.g. '28_00_30') to Decimal Degrees.
    Formula: Degrees + Minutes / 60.0 + Seconds / 3600.0
    """
    if not dms_str or not dms_str.strip():
        return None
    try:
        clean_str = dms_str.strip()
        parts = [float(p) for p in clean_str.split('_')]
        if len(parts) == 3:
            deg, minute, sec = parts
            return round(deg + (minute / 60.0) + (sec / 3600.0), 6)
        elif len(parts) == 2:
            deg, minute = parts
            return round(deg + (minute / 60.0), 6)
        elif len(parts) == 1:
            return round(parts[0], 6)
    except Exception:
        return None
    return None


def is_point_in_bbox(lon: float, lat: float, bbox: Dict[str, float]) -> bool:
    """Checks whether a coordinate sits within a given bounding box."""
    return (bbox["min_lon"] <= lon <= bbox["max_lon"]) and (bbox["min_lat"] <= lat <= bbox["max_lat"])


def get_additional_verified_stations() -> List[Dict[str, Any]]:
    """
    Returns verified DHM / hydrometric and meteorological monitoring stations in the 
    Gulmi and Ridi confluence region that supplement the national river trunk CSV.
    """
    return [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [83.3877, 27.9512]
            },
            "properties": {
                "stationNo": "233 / 418",
                "river": "Ridi Khola",
                "siteName": "Satmure (Ridi Catchment)",
                "displayLabel": "Ridi Khola at Satmure (#233 / #418)",
                "elevation": 485,
                "instruments": "Staff Gauge & Automated Water Level Logger",
                "startDate": "1978-05-15",
                "district": "Gulmi / Palpa Border (Satyawati-Ruru)",
                "stationType": "hydrometric",
                "isInGulmi": True,
                "_rawDms": "Lat: 27_57_04, Lon: 83_23_16",
                "_provenance": "DHM Hydrometric Station Catalog & PPCR Catchment Baseline"
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [83.4333, 27.9333]
            },
            "properties": {
                "stationNo": "837 / 0701",
                "river": "Ruru Pilgrimage Basin",
                "siteName": "Ridi Bazar (Meteorological Station)",
                "displayLabel": "Ridi Station (#837 / #0701)",
                "elevation": 494,
                "instruments": "Standard Rain Gauge, Max-Min Thermometer & Climatological Sensor",
                "startDate": "1971-01-01",
                "district": "Ruru Kshetra / Gulmi",
                "stationType": "meteorological",
                "isInGulmi": True,
                "_rawDms": "Lat: 27_56_00, Lon: 83_26_00",
                "_provenance": "DHM National Climatological & Precipitation Index #0701"
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [83.4333, 27.9500]
            },
            "properties": {
                "stationNo": "430",
                "river": "Badigad Khola",
                "siteName": "Rudrabeni / Ridi Confluence",
                "displayLabel": "Badigad Khola at Rudrabeni (#430)",
                "elevation": 465,
                "instruments": "Staff Gauge & Discharge Measurement Cableway",
                "startDate": "1975-04-01",
                "district": "Gulmi (Satyawati / Chandrakot)",
                "stationType": "hydrometric",
                "isInGulmi": True,
                "_rawDms": "Lat: 27_57_00, Lon: 83_26_00",
                "_provenance": "DHM Nepal National River Network (Station #430)"
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [83.2450, 28.0650]
            },
            "properties": {
                "stationNo": "435",
                "river": "Panaha Khola",
                "siteName": "Tamghas Basin Station",
                "displayLabel": "Panaha Khola at Tamghas (#435)",
                "elevation": 1480,
                "instruments": "Staff Gauge & Automated Level Sensor",
                "startDate": "1988-06-15",
                "district": "Gulmi (Resunga)",
                "stationType": "hydrometric",
                "isInGulmi": True,
                "_rawDms": "Lat: 28_03_54, Lon: 83_14_42",
                "_provenance": "DHM Nepal National River Network (Station #435)"
            }
        }
    ]


def parse_river_stations(csv_path: Path) -> List[Dict[str, Any]]:
    """Reads River_data.csv and generates standard GeoJSON Features."""
    features = []
    if not csv_path.exists():
        print(f"❌ Error: CSV not found at {csv_path}")
        sys.exit(1)

    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            st_no = row.get("Station No.", "").strip()
            raw_lat = row.get("Latitude", "")
            raw_lon = row.get("Longitude", "")
            lat = dms_to_decimal(raw_lat)
            lon = dms_to_decimal(raw_lon)

            if lat is None or lon is None:
                continue

            in_gulmi = is_point_in_bbox(lon, lat, GULMI_BBOX)
            in_regional = is_point_in_bbox(lon, lat, REGIONAL_BBOX)

            # Keep stations that are directly in Gulmi or in the immediate regional hydrometric basin
            if in_regional or in_gulmi:
                elevation_raw = row.get("Elevation", "")
                try:
                    elevation = float(elevation_raw) if elevation_raw and elevation_raw != "-" else None
                except ValueError:
                    elevation = None

                river = row.get("River", "").strip()
                site_name = row.get("Site Name", "").strip()
                
                # Custom label & classification
                if st_no == "415":
                    display_label = "Regional Inflow Station (Syangja - 740m from border)"
                    district = "Syangja (740m east of Gulmi border)"
                    is_in_gulmi_flag = False
                elif st_no == "410":
                    display_label = "Kali Gandaki at Seti Beni (#410)"
                    district = "Gulmi / Parbat Border (Seti Beni)"
                    is_in_gulmi_flag = True
                elif st_no == "419":
                    display_label = "Kali Gandaki at Angsing (#419)"
                    district = "Regional Basin (Downstream Kali Gandaki)"
                    is_in_gulmi_flag = False
                else:
                    display_label = f"{river} at {site_name} (#{st_no})"
                    district = "Gulmi" if in_gulmi else "Regional Basin (Gandaki)"
                    is_in_gulmi_flag = in_gulmi

                feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lon, lat]  # Standard GeoJSON is [longitude, latitude]
                    },
                    "properties": {
                        "stationNo": st_no,
                        "river": river,
                        "siteName": site_name,
                        "displayLabel": display_label,
                        "elevation": elevation,
                        "instruments": row.get("Instruments", "").strip(),
                        "startDate": row.get("Start Date", "").strip(),
                        "district": district,
                        "stationType": "hydrometric",
                        "isInGulmi": is_in_gulmi_flag,
                        "_rawDms": f"Lat: {raw_lat}, Lon: {raw_lon}",
                        "_provenance": "DHM Nepal National River Network (data/hydrology/River_data.csv)"
                    }
                }
                features.append(feature)

    # Add verified supplementary in-district stations (Ridi Satmure, Ridi Met, Badigad Rudrabeni, Tamghas)
    supplements = get_additional_verified_stations()
    existing_nos = {f["properties"]["stationNo"] for f in features}
    for supp in supplements:
        if supp["properties"]["stationNo"] not in existing_nos:
            features.append(supp)

    return features

def main():
    write_mode = "--write" in sys.argv

    # Path for the DHM dataset
    dhm_csv = REPO_ROOT / "data" / "hydrology" / "River_data.csv"
    dhm_output = REPO_ROOT / "apps" / "web" / "public" / "geojson" / "gulmi-dhm-stations.json"

    print("==================================================================")
    print(" 💧 WEFES NEXUS NEPAL: SPATIAL GEOJSON COMPILER")
    print("==================================================================")
    print(f" Source CSV (DHM): {dhm_csv.relative_to(REPO_ROOT)}")
    print(f" Target File (DHM): {dhm_output.relative_to(REPO_ROOT)}\n")

    # Process DHM stations
    dhm_features = parse_river_stations(dhm_csv)
    dhm_collection = {
        "type": "FeatureCollection",
        "_metadata": {
            "title": "DHM River Gauging & Climate Stations (Gulmi & Regional Basin)",
            "source": "Department of Hydrology and Meteorology (DHM), Nepal",
            "tier": "OBSERVED REAL",
            "crs": "EPSG:4326 (WGS84)",
            "description": "Includes in-district trunk river stations (#430, #435), Ridi catchment stations (#233/418, #837/0701), and regional border inflow stations (#415, #410)"
        },
        "features": dhm_features
    }

    # Output DHM GeoJSON
    if write_mode:
        dhm_output.parent.mkdir(parents=True, exist_ok=True)
        with open(dhm_output, "w", encoding="utf-8") as out:
            json.dump(dhm_collection, out, indent=2)
        print(f"✅ [SUCCESS] Written DHM GeoJSON to {dhm_output.relative_to(REPO_ROOT)}")
    else:
        print("ℹ️  DHM DRY‑RUN COMPLETE. No DHM files were written.")
        print("   To generate the DHM GeoJSON file, re‑run with: --write")

    # Summary printout
    print(f"--> Compiled {len(dhm_features)} DHM station(s):")
    for idx, feat in enumerate(dhm_features, 1):
        props = feat["properties"]
        coords = feat["geometry"]["coordinates"]
        loc_tag = "[IN-DISTRICT GULMI]" if props["isInGulmi"] else "[REGIONAL INFLOW/BORDER]"
        print(f"   {idx}. {loc_tag} {props['displayLabel']}")
        print(f"      Station ID: #{props['stationNo']} | River/Basin: {props['river']} ({props['siteName']})")
        print(f"      Coords: Lon {coords[0]}° E, Lat {coords[1]}° N | Elevation: {props['elevation']}m")
        print(f"      District/Location: {props['district']}")
        print(f"      Instruments: {props['instruments']}\n")

    print("==================================================================\n")


if __name__ == "__main__":
    main()
