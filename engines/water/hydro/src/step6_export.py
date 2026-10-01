# [DATA PROVENANCE]
# Data Source: Calculated hydropower reach segments from Step 5
# Classification: CALCULATED DELIVERABLES & VECTOR REACH DATASETS
# Citations: Open Geospatial Consortium (OGC) GeoJSON Specification (RFC 7946)

"""
step6_export.py
===============
STEP 10. OUTPUT GENERATION: Export the calculated stream segments along with their
attributes (Head/Tail elevations, Net Head, Discharge, and Hydro Potential in kW)
to the specified output vector file or a summary CSV.

District Reusability Note:
--------------------------
Exports clean standard GeoJSON and CSV formats compatible with any GIS software
(QGIS, ArcGIS, Mapbox, Leaflet, or Python GeoPandas) for any district worldwide.
"""

from __future__ import annotations

import json
import os
from typing import List, Dict, Any, Optional
import pandas as pd


def export_results(
    reaches: List[Dict[str, Any]],
    output_vector_path: str,
    output_csv_path: Optional[str] = None
) -> Dict[str, Any]:
    """
    Exports stream reaches to a GeoJSON vector file and a summary tabular CSV file.
    
    Parameters:
        reaches: List of reach dictionaries containing line_coords and hydraulic attributes.
        output_vector_path: Target path for the GeoJSON file.
        output_csv_path: Optional target path for the CSV summary file (defaults to same folder).
        
    Returns:
        Dict of summary metrics for the district assessment.
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

    features = []
    tabular_records = []

    for r in reaches:
        # Properties for GeoJSON and CSV
        props = {
            "reach_id": int(r["reach_id"]),
            "district": str(r["district"]),
            "palika": str(r.get("palika", r.get("district", "Unknown"))),
            "intake_x": float(r["intake_x"]),
            "intake_y": float(r["intake_y"]),
            "z_head_m": float(r["z_head_m"]),
            "powerhouse_x": float(r["powerhouse_x"]),
            "powerhouse_y": float(r["powerhouse_y"]),
            "z_tail_m": float(r["z_tail_m"]),
            "gross_head_m": float(r["gross_head_m"]),
            "net_head_m": float(r["net_head_m"]),
            "catchment_km2": float(r["catchment_km2"]),
            "discharge_m3s": float(r["discharge_m3s"]),
            "power_potential_kw": float(r["power_potential_kw"]),
            "power_potential_mw": float(r["power_potential_mw"]),
            "annual_energy_mwh": float(r["annual_energy_mwh"]),
            "length_m": float(r["length_m"]),
            "slope_pct": float(r["slope_pct"])
        }
        tabular_records.append(props)

        # GeoJSON LineString geometry
        geometry = {
            "type": "LineString",
            "coordinates": r["line_coords"]
        }
        features.append({
            "type": "Feature",
            "id": r["reach_id"],
            "geometry": geometry,
            "properties": props
        })

    geojson_doc = {
        "type": "FeatureCollection",
        "name": "hydro_potential_reaches",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}
        },
        "features": features
    }

    # Write GeoJSON
    with open(output_vector_path, "w", encoding="utf-8") as f:
        json.dump(geojson_doc, f, indent=2)
    print(f"    Saved Vector GeoJSON: {output_vector_path}")

    # Write CSV
    df = pd.DataFrame(tabular_records)
    df.to_csv(output_csv_path, index=False)
    print(f"    Saved Summary CSV:   {output_csv_path}")

    # Compile executive summary report
    total_reaches = len(reaches)
    total_mw = float(df["power_potential_mw"].sum()) if not df.empty else 0.0
    total_gwh = float(df["annual_energy_mwh"].sum() / 1000.0) if not df.empty else 0.0
    avg_head = float(df["gross_head_m"].mean()) if not df.empty else 0.0
    avg_q = float(df["discharge_m3s"].mean()) if not df.empty else 0.0
    max_reach_power_kw = float(df["power_potential_kw"].max()) if not df.empty else 0.0

    summary_report = {
        "total_reaches": total_reaches,
        "total_potential_mw": round(total_mw, 3),
        "total_annual_generation_gwh": round(total_gwh, 2),
        "mean_gross_head_m": round(avg_head, 2),
        "mean_discharge_m3s": round(avg_q, 4),
        "max_reach_power_kw": round(max_reach_power_kw, 2),
        "vector_file": output_vector_path,
        "csv_file": output_csv_path
    }

    return summary_report
