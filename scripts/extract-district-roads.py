import sqlite3
import json
import os
import re
import shapely.wkb
import shapely.geometry
from collections import defaultdict

OUTPUT_DIR = 'apps/web/public/geojson/roads'
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load existing districts json to match district IDs
with open('packages/database/src/districts.json', 'r') as f:
    db_districts = json.load(f)

name_to_id = {}
for d in db_districts:
    norm = re.sub(r'[^a-z0-9]', '', d['name'].lower())
    name_to_id[norm] = d['id']
    name_to_id[d['id'].lower()] = d['id']

HIGHWAY_WEIGHTS = {
    'trunk': 4.0,
    'trunk_link': 3.5,
    'primary': 3.5,
    'primary_link': 3.0,
    'secondary': 2.8,
    'secondary_link': 2.4,
    'tertiary': 2.2,
    'tertiary_link': 2.0,
    'unclassified': 1.6,
    'residential': 1.4,
    'road': 1.4,
    'track': 1.0,
    'living_street': 1.2,
    'service': 1.0,
}

print("Streaming all road vectors from data/transport/roads.gpkg in single fast pass...")

conn = sqlite3.connect('data/transport/roads.gpkg')
cursor = conn.cursor()

# Single fast query reading all relevant road classifications
cursor.execute('''
    SELECT geom, name, name_en, highway, surface, lanes, oneway, adm2_name
    FROM roads
    WHERE adm2_name IS NOT NULL
    AND highway IN (
        'trunk', 'trunk_link', 'primary', 'primary_link',
        'secondary', 'secondary_link', 'tertiary', 'tertiary_link',
        'unclassified', 'residential', 'road', 'track', 'living_street'
    )
''')

# Buckets per district: { dist_name: { 'highways': [], 'feeders': [], 'municipal': [], 'rural': [] } }
district_buckets = defaultdict(lambda: {
    'highways': [],
    'feeders': [],
    'municipal': [],
    'rural': []
})

row_count = 0

while True:
    rows = cursor.fetchmany(10000)
    if not rows:
        break
    for row in rows:
        blob, name, name_en, highway, surface, lanes, oneway, dist_name = row
        if not blob or len(blob) <= 8 or not dist_name:
            continue

        hwy_norm = highway.lower() if highway else 'unclassified'
        if 'trunk' in hwy_norm or 'primary' in hwy_norm:
            tier = 'highways'
            hwy_class = 'trunk' if 'trunk' in hwy_norm else 'primary'
        elif 'secondary' in hwy_norm:
            tier = 'feeders'
            hwy_class = 'secondary'
        elif 'tertiary' in hwy_norm:
            tier = 'municipal'
            hwy_class = 'tertiary'
        elif 'residential' in hwy_norm or 'living_street' in hwy_norm:
            tier = 'municipal'
            hwy_class = 'residential'
        elif 'track' in hwy_norm:
            tier = 'rural'
            hwy_class = 'track'
        else:
            tier = 'municipal'
            hwy_class = 'unclassified'

        flags = blob[3]
        env_type = (flags >> 1) & 0x07
        hdr_len = 8 + (32 if env_type == 1 else 48 if env_type in (2, 3) else 64 if env_type == 4 else 0)

        wkb = blob[hdr_len:]
        district_buckets[dist_name][tier].append((wkb, name, name_en, hwy_class, surface, lanes))
        row_count += 1

print(f"Processed {row_count} road rows across {len(district_buckets)} districts. Exporting JSONs...")

total_exported = 0
total_segments = 0

for dist_name, tiers in district_buckets.items():
    norm_name = re.sub(r'[^a-z0-9]', '', dist_name.lower())
    if norm_name == 'chitawan': norm_name = 'chitwan'
    elif norm_name == 'kavre': norm_name = 'kavrepalanchok'
    elif norm_name == 'dolkha': norm_name = 'dolakha'
    elif norm_name == 'terhathum': norm_name = 'tehrathum'
    elif norm_name == 'tanahun': norm_name = 'tanahu'
    elif norm_name == 'makwanpur': norm_name = 'makawanpur'
    elif norm_name == 'sindhupalchowk': norm_name = 'sindhupalchok'

    dist_id = name_to_id.get(norm_name, norm_name)

    # 1. 100% of National Highways (Class A)
    selected_rows = list(tiers['highways'])
    # 2. 100% of Feeder Roads (Class B)
    selected_rows.extend(tiers['feeders'])
    # 3. Up to 1800 Municipal & District Roads (Class C)
    selected_rows.extend(tiers['municipal'][:1800])
    # 4. Up to 1000 Rural Farm Tracks (Class D)
    selected_rows.extend(tiers['rural'][:1000])

    features = []

    for wkb, name, name_en, hwy_class, surface, lanes in selected_rows:
        try:
            geom = shapely.wkb.loads(wkb)
            geojson_geom = shapely.geometry.mapping(geom)

            def round_coords(coords):
                if isinstance(coords[0], (int, float)):
                    return [round(coords[0], 5), round(coords[1], 5)]
                return [round_coords(c) for c in coords]

            geojson_geom['coordinates'] = round_coords(geojson_geom['coordinates'])

            road_name = name_en or name or (
                'National Strategic Highway' if hwy_class in ('trunk', 'primary') else
                'Feeder Road' if hwy_class == 'secondary' else
                'District Road' if hwy_class == 'tertiary' else
                'Municipal Street' if hwy_class == 'residential' else
                'Agricultural Track' if hwy_class == 'track' else 'Local Link Road'
            )

            features.append({
                'type': 'Feature',
                'geometry': geojson_geom,
                'properties': {
                    'name': road_name,
                    'highway': hwy_class,
                    'surface': surface or ('paved' if hwy_class in ('trunk', 'primary', 'secondary', 'tertiary') else 'unpaved'),
                    'lanes': lanes or (2 if hwy_class in ('trunk', 'primary') else 1),
                    'weight': HIGHWAY_WEIGHTS.get(hwy_class, 1.4)
                }
            })
        except Exception:
            continue

    if features:
        fc = {
            'type': 'FeatureCollection',
            'district': dist_name,
            'districtId': dist_id,
            'count': len(features),
            'highwaysCount': len(tiers['highways']),
            'feedersCount': len(tiers['feeders']),
            'municipalCount': min(len(tiers['municipal']), 1800),
            'ruralCount': min(len(tiers['rural']), 1000),
            'features': features
        }
        out_path = os.path.join(OUTPUT_DIR, f"{dist_id}.json")
        with open(out_path, 'w') as out_f:
            json.dump(fc, out_f)
        total_exported += 1
        total_segments += len(features)

print(f"DONE! Exported {total_segments} road features across {total_exported} districts to {OUTPUT_DIR}")
