# [DATA PROVENANCE]
# Data Source: Calculated hydropower reach segments from Step 5
# Classification: CALCULATED DELIVERABLES & VECTOR REACH DATASETS
# Citations: Open Geospatial Consortium (OGC) GeoJSON Specification (RFC 7946)

"""
step6_export.py
===============
STEP 10. OUTPUT GENERATION: Export calculated stream reaches to standard RFC 7946 GeoJSON
and summary CSV. Automatically reprojects planar/projected coordinates to geographic WGS84 (EPSG:4326).

District Reusability Note:
--------------------------
Conforms strictly to RFC 7946 standards:
- Always reprojects coordinates to WGS84 (EPSG:4326) [longitude, latitude] if source raster was projected (e.g. UTM).
- Omits the deprecated 'crs' member as mandated by RFC 7946 Section 4.
"""

from __future__ import annotations

import json
import os
from typing import List, Dict, Any, Optional
import pandas as pd
from pyproj import Transformer


def export_results(
    reaches: List[Dict[str, Any]],
    output_vector_path: str,
    output_csv_path: Optional[str] = None,
    source_crs: Any = None,
    qa_metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Exports stream reaches to an RFC 7946 compliant GeoJSON file and a summary CSV.
    
    Parameters:
        reaches: List of reach dictionaries containing line_coords and hydraulic attributes.
        output_vector_path: Target path for the GeoJSON file.
        output_csv_path: Optional target path for the CSV summary file.
        source_crs: Coordinate reference system of the input DEM raster.
        qa_metadata: Optional comprehensive QA audit metadata to bundle in summary report.
        
    Returns:
        Dict of summary metrics and QA findings for the district assessment.
    """
    print(f"--> [STEP 10: OUTPUT GENERATION] Exporting vector reaches and summary tables...")
    
    # Ensure destination directories exist
    os.makedirs(os.path.dirname(os.path.abspath(output_vector_path)), exist_ok=True)
    if output_csv_path is None:
        base_dir = os.path.dirname(os.path.abspath(output_vector_path))
        base_name = os.path.splitext(os.path.basename(output_vector_path))[0]
        output_csv_path = os.path.join(base_dir, f"{base_name}_summary.csv")
    else:
        os.makedirs(os.path.dirname(os.path.abspath(output_csv_path)), exist_ok=True)

    # Coordinate transformer to RFC 7946 WGS84 (EPSG:4326)
    transformer = None
    if source_crs is not None:
        crs_str = str(source_crs).upper()
        if "4326" not in crs_str and "CRS84" not in crs_str:
            try:
                transformer = Transformer.from_crs(source_crs, "EPSG:4326", always_xy=True)
                print(f"    Reprojecting reach coordinates from {source_crs} to RFC 7946 WGS84 (EPSG:4326)...")
            except Exception as e:
                print(f"    [WARNING] Could not initialize CRS transformer ({e}). Coordinates exported as-is.")

    features = []
    tabular_records = []

    for r in reaches:
        # Reproject line coordinates and endpoint nodes if needed
        raw_coords = r.get("line_coords", [])
        if transformer:
            wgs84_coords = []
            for pt in raw_coords:
                lon, lat = transformer.transform(pt[0], pt[1])
                wgs84_coords.append([round(lon, 6), round(lat, 6)])
            up_x, up_y = transformer.transform(r.get("upstream_x", r.get("intake_x")), r.get("upstream_y", r.get("intake_y")))
            down_x, down_y = transformer.transform(r.get("downstream_x", r.get("powerhouse_x")), r.get("downstream_y", r.get("powerhouse_y")))
        else:
            wgs84_coords = [[round(pt[0], 6), round(pt[1], 6)] for pt in raw_coords]
            up_x = r.get("upstream_x", r.get("intake_x"))
            up_y = r.get("upstream_y", r.get("intake_y"))
            down_x = r.get("downstream_x", r.get("powerhouse_x"))
            down_y = r.get("downstream_y", r.get("powerhouse_y"))

        props = {
            "reach_id": int(r["reach_id"]),
            "district": str(r["district"]),
            "palika": str(r.get("palika", r.get("district", "Unknown"))),
            "upstream_x": round(float(up_x), 6),
            "upstream_y": round(float(up_y), 6),
            "upstream_z_m": float(r.get("upstream_z_m", r.get("z_head_m", 0.0))),
            "downstream_x": round(float(down_x), 6),
            "downstream_y": round(float(down_y), 6),
            "downstream_z_m": float(r.get("downstream_z_m", r.get("z_tail_m", 0.0))),
            # Backward-compatible aliases
            "intake_x": round(float(up_x), 6),
            "intake_y": round(float(up_y), 6),
            "z_head_m": float(r.get("upstream_z_m", r.get("z_head_m", 0.0))),
            "powerhouse_x": round(float(down_x), 6),
            "powerhouse_y": round(float(down_y), 6),
            "z_tail_m": float(r.get("downstream_z_m", r.get("z_tail_m", 0.0))),
            "gross_head_m": float(r["gross_head_m"]),
            "net_head_m": float(r["net_head_m"]),
            "catchment_km2": float(r["catchment_km2"]),
            "discharge_m3s": float(r["discharge_m3s"]),
            "power_potential_kw": float(r["power_potential_kw"]),
            "power_potential_mw": float(r["power_potential_mw"]),
            "screening_annual_energy_mwh": float(r.get("screening_annual_energy_mwh", r.get("annual_energy_mwh", 0.0))),
            "annual_energy_mwh": float(r.get("annual_energy_mwh", 0.0)),
            "length_m": float(r["length_m"]),
            "slope_pct": float(r["slope_pct"])
        }
        tabular_records.append(props)

        # GeoJSON LineString geometry
        geometry = {
            "type": "LineString",
            "coordinates": wgs84_coords
        }
        features.append({
            "type": "Feature",
            "id": r["reach_id"],
            "geometry": geometry,
            "properties": props
        })

    # RFC 7946 Standard: no deprecated crs member
    geojson_doc = {
        "type": "FeatureCollection",
        "name": "hydro_potential_reaches",
        "features": features
    }

    # Write GeoJSON
    with open(output_vector_path, "w", encoding="utf-8") as f:
        json.dump(geojson_doc, f, indent=2)
    print(f"    Saved Vector GeoJSON (RFC 7946): {output_vector_path}")

    # Write CSV
    df = pd.DataFrame(tabular_records)
    df.to_csv(output_csv_path, index=False)
    print(f"    Saved Summary CSV:   {output_csv_path}")

    # Summary metrics
    total_reaches = len(reaches)
    total_mw = float(df["power_potential_mw"].sum()) if not df.empty else 0.0
    total_gwh = float(df["annual_energy_mwh"].sum() / 1000.0) if not df.empty else 0.0
    avg_gross_head = float(df["gross_head_m"].mean()) if not df.empty else 0.0
    avg_net_head = float(df["net_head_m"].mean()) if not df.empty else 0.0
    avg_q = float(df["discharge_m3s"].mean()) if not df.empty else 0.0
    max_reach_power_kw = float(df["power_potential_kw"].max()) if not df.empty else 0.0

    summary_report = {
        "assessment_type": "Gross Theoretical Reach Potential (GTRP) Screening",
        "total_reaches": total_reaches,
        "gross_theoretical_potential_mw": round(total_mw, 3),
        "screening_annual_generation_gwh": round(total_gwh, 2),
        "mean_gross_head_m": round(avg_gross_head, 2),
        "mean_net_head_m": round(avg_net_head, 2),
        "mean_turbined_discharge_m3s": round(avg_q, 4),
        "max_reach_power_kw": round(max_reach_power_kw, 2),
        "vector_file": output_vector_path,
        "csv_file": output_csv_path,
        "qa_audit": qa_metadata or {}
    }

    return summary_report
