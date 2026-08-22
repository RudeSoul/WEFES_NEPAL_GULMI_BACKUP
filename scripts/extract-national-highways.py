import sqlite3
import json
import os
import shapely.wkb
import shapely.geometry

OUTPUT_PATH = 'apps/web/public/geojson/roads/nepal-national-highways.json'
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

conn = sqlite3.connect('data/transport/roads.gpkg')
cursor = conn.cursor()

print("Extracting National Strategic Highways (trunk, primary, secondary)...")

cursor.execute('''
    SELECT geom, name, name_en, highway, surface, lanes, adm2_name, ref
    FROM (
        SELECT geom, name, name_en, highway, surface, lanes, adm2_name, NULL as ref
        FROM roads
        WHERE highway IN ('trunk', 'primary', 'secondary')
    )
''')

rows = cursor.fetchall()
features = []
print(f"Found {len(rows)} strategic road segments across Nepal")

HIGHWAY_WEIGHTS = {
    'trunk': 3.5,
    'primary': 2.8,
    'secondary': 2.0,
}

for row in rows:
    blob, name, name_en, highway, surface, lanes, dist_name, ref = row
    if not blob or len(blob) <= 8:
        continue

    flags = blob[3]
    envelope_type = (flags >> 1) & 0x07
    header_len = 8
    if envelope_type == 1: header_len += 32
    elif envelope_type in (2, 3): header_len += 48
    elif envelope_type == 4: header_len += 64

    wkb = blob[header_len:]
    try:
        geom = shapely.wkb.loads(wkb)
        geojson_geom = shapely.geometry.mapping(geom)

        def round_coords(coords):
            if isinstance(coords[0], (int, float)):
                return [round(coords[0], 5), round(coords[1], 5)]
            return [round_coords(c) for c in coords]

        geojson_geom['coordinates'] = round_coords(geojson_geom['coordinates'])
        road_name = name_en or name or f"{highway.capitalize()} Highway"

        features.append({
            'type': 'Feature',
            'geometry': geojson_geom,
            'properties': {
                'name': road_name,
                'highway': highway,
                'surface': surface or 'paved',
                'lanes': lanes or (2 if highway in ('trunk', 'primary') else 1),
                'district': dist_name or '',
                'weight': HIGHWAY_WEIGHTS.get(highway, 2.0)
            }
        })
    except Exception:
        continue

fc = {
    'type': 'FeatureCollection',
    'name': 'Nepal National Strategic Road Network',
    'count': len(features),
    'features': features
}

with open(OUTPUT_PATH, 'w') as f:
    json.dump(fc, f)

file_size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
print(f"Exported {len(features)} highway features to {OUTPUT_PATH} ({file_size_mb:.2f} MB)")
