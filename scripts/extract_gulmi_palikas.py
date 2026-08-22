import json
import os
import geopandas as gpd
import pandas as pd

# Paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SHAPEFILE_PATH = os.path.join(BASE_DIR, 'data/administrative/local_level.shp')
CSV_PATH = os.path.join(BASE_DIR, 'mapped_output.csv')
LOCAL_BODIES_CSV = os.path.join(BASE_DIR, 'data/administrative/local_bodies_district_code.csv')

OUTPUT_GEOJSON_WEB = os.path.join(BASE_DIR, 'apps/web/public/geojson/gulmi-palikas.json')
OUTPUT_GEOJSON_DATA = os.path.join(BASE_DIR, 'data/geojson/gulmi-palikas.json')
OUTPUT_SOIL_WEB = os.path.join(BASE_DIR, 'apps/web/public/geojson/gulmi-soil-points.json')
OUTPUT_SOIL_SRC = os.path.join(BASE_DIR, 'apps/web/src/data/gulmiSoilPoints.json')

# 1. Extract Gulmi Palikas from Shapefile
print("Reading local_level shapefile...")
gdf = gpd.read_file(SHAPEFILE_PATH)
gulmi_gdf = gdf[gdf['DISTRICT'].str.contains('GULMI', case=False, na=False)].to_crs(epsg=4326)

# Load Nepali names & codes if available
nepali_name_map = {}
if os.path.exists(LOCAL_BODIES_CSV):
    df_lb = pd.read_csv(LOCAL_BODIES_CSV, header=None)
    # columns: [index, District, EnglishName, NepaliName, Code]
    for _, row in df_lb.iterrows():
        if len(row) >= 5 and str(row[1]).strip().lower() == 'gulmi':
            eng = str(row[2]).strip().lower()
            nep = str(row[3]).strip()
            code = str(row[4]).strip()
            nepali_name_map[eng] = {"nepaliName": nep, "code": code}

def enrich_properties(row):
    unit_name = str(row['UNIT_NAME']).strip()
    unit_type = str(row['UNIT_TYPE']).strip()
    full_name_eng = f"{unit_name} {unit_type}"
    
    # Try fuzzy/case match with nepali_name_map
    nepali_info = None
    for k, v in nepali_name_map.items():
        if unit_name.lower() in k or k in unit_name.lower():
            nepali_info = v
            break
            
    return {
        "id": str(row['ID']),
        "name": unit_name,
        "type": unit_type,
        "fullName": full_name_eng,
        "nepaliName": nepali_info["nepaliName"] if nepali_info else unit_name,
        "code": nepali_info["code"] if nepali_info else str(row['ID']),
        "district": "Gulmi",
        "province": "Lumbini Province",
        "areaSqKm": round(float(row['SHAPE_AREA']) / 1000000.0, 2) if 'SHAPE_AREA' in row and row['SHAPE_AREA'] else None
    }

# Convert GeoDataFrame to enriched GeoJSON
features = []
for idx, row in gulmi_gdf.iterrows():
    geom = json.loads(gpd.GeoSeries([row['geometry']]).to_json())['features'][0]['geometry']
    props = enrich_properties(row)
    features.append({
        "type": "Feature",
        "id": props["id"],
        "properties": props,
        "geometry": geom
    })

gulmi_geojson = {
    "type": "FeatureCollection",
    "name": "gulmi_palikas",
    "features": features
}

os.makedirs(os.path.dirname(OUTPUT_GEOJSON_WEB), exist_ok=True)
os.makedirs(os.path.dirname(OUTPUT_GEOJSON_DATA), exist_ok=True)

with open(OUTPUT_GEOJSON_WEB, 'w', encoding='utf-8') as f:
    json.dump(gulmi_geojson, f, ensure_ascii=False, indent=2)

with open(OUTPUT_GEOJSON_DATA, 'w', encoding='utf-8') as f:
    json.dump(gulmi_geojson, f, ensure_ascii=False, indent=2)

print(f"Exported Gulmi Palikas GeoJSON ({len(features)} palikas) to {OUTPUT_GEOJSON_WEB}")

# 2. Extract Gulmi Soil Sample Grid from mapped_output.csv
print("Processing mapped_output.csv for Gulmi soil grid points...")
df = pd.read_csv(CSV_PATH)
gulmi_soil_df = df[df['id'].astype(str).str.lower() == 'gulmi']

soil_points = []
for _, row in gulmi_soil_df.iterrows():
    soil_points.append({
        "lat": float(row['lat']),
        "lon": float(row['lon']),
        "nitrogen": float(row['nitrogen']),
        "phosphorus": float(row['phosphorus']),
        "potassium": float(row['potassium']),
        "ph": float(row['ph']),
        "soilType": str(row['soil_type'])
    })

os.makedirs(os.path.dirname(OUTPUT_SOIL_SRC), exist_ok=True)

with open(OUTPUT_SOIL_WEB, 'w', encoding='utf-8') as f:
    json.dump(soil_points, f, indent=2)

with open(OUTPUT_SOIL_SRC, 'w', encoding='utf-8') as f:
    json.dump(soil_points, f, indent=2)

print(f"Exported {len(soil_points)} Gulmi soil sample points to {OUTPUT_SOIL_SRC}")
