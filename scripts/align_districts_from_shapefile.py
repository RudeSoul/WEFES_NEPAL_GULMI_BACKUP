import os
import json
import geopandas as gpd
from shapely.geometry import mapping

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SHAPEFILE_PATH = os.path.join(BASE_DIR, 'data/administrative/local_level.shp')
ORIG_ENRICHED_PATH = os.path.join(BASE_DIR, 'data/geojson/nepal-districts-enriched.json')
OUTPUT_WEB_PATH = os.path.join(BASE_DIR, 'apps/web/public/geojson/nepal-districts-enriched.json')
OUTPUT_DATA_PATH = os.path.join(BASE_DIR, 'data/geojson/nepal-districts-enriched.json')

print("Reading shapefile and existing enriched GeoJSON...")
gdf = gpd.read_file(SHAPEFILE_PATH).to_crs(epsg=4326)

with open(ORIG_ENRICHED_PATH, 'r', encoding='utf-8') as f:
    orig_enriched = json.load(f)

# Name normalization lookup table
NAME_NORM = {
    'CHITAWAN': 'CHITWAN',
    'DHANUSHA': 'DHANUSA',
    'KABHREPALANCHOK': 'KAVREPALANCHOK',
    'MAKAWANPUR': 'MAKWANPUR',
    'TERHATHUM': 'TEHRATHUM',
    'EASTERN_RUKUM': 'RUKUM EAST',
    'WESTERN_RUKUM': 'RUKUM WEST',
    'NAWALPUR': 'NAWALPARASI EAST',
    'PARASI': 'NAWALPARASI WEST'
}

props_by_name = {}
props_by_id = {}
for feat in orig_enriched['features']:
    props = feat['properties']
    props_by_name[props.get('name', '').upper().replace(' ', '').replace('_', '')] = props
    props_by_id[props.get('id', '').lower()] = props

# Dissolve by DISTRICT to get survey-perfect district polygons
print("Dissolving local_level by DISTRICT...")
dissolved = gdf.dissolve(by='DISTRICT', as_index=False)

aligned_features = []
for _, row in dissolved.iterrows():
    raw_name = str(row['DISTRICT']).strip()
    norm_name = NAME_NORM.get(raw_name.upper(), raw_name.upper())
    clean_key = norm_name.replace(' ', '').replace('_', '')
    
    matched_props = props_by_name.get(clean_key)
    if not matched_props:
        # Fallback search
        for k, v in props_by_name.items():
            if k in clean_key or clean_key in k:
                matched_props = v
                break
                
    if not matched_props:
        matched_props = {
            "id": raw_name.lower().replace(' ', '_'),
            "name": raw_name.title(),
            "nepaliName": raw_name,
            "province": "Lumbini Province" if raw_name == 'GULMI' else "Nepal",
            "ecoZone": "Hill",
            "avgRainfallMm": 1500,
            "solarRadiationKwh": 5.0,
            "baseSoilPh": 6.5,
            "laborRateNprPerDay": 750
        }
    else:
        matched_props = dict(matched_props)

    geom = mapping(row['geometry'])
    aligned_features.append({
        "type": "Feature",
        "id": matched_props.get("id", raw_name.lower()),
        "properties": matched_props,
        "geometry": geom
    })

aligned_geojson = {
    "type": "FeatureCollection",
    "name": "nepal_districts_aligned",
    "features": aligned_features
}

os.makedirs(os.path.dirname(OUTPUT_WEB_PATH), exist_ok=True)
os.makedirs(os.path.dirname(OUTPUT_DATA_PATH), exist_ok=True)

with open(OUTPUT_WEB_PATH, 'w', encoding='utf-8') as f:
    json.dump(aligned_geojson, f, ensure_ascii=False)

with open(OUTPUT_DATA_PATH, 'w', encoding='utf-8') as f:
    json.dump(aligned_geojson, f, ensure_ascii=False)

print(f"Successfully generated aligned districts GeoJSON ({len(aligned_features)} districts) to {OUTPUT_WEB_PATH}")
