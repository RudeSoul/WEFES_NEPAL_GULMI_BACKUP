const fs = require('fs');
const path = require('path');

const geojsonPath = path.resolve(process.cwd(), 'apps/web/public/geojson/nepal-districts-enriched.json');
const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'));

const climatePath = path.resolve(process.cwd(), 'apps/web/public/geojson/nepal-climate-monthly.json');
const climate = JSON.parse(fs.readFileSync(climatePath, 'utf-8'));

const geoIds = geojson.features.map(f => f.properties.id || f.id);
const climateIds = Object.keys(climate.climateMap);

console.log(`GeoJSON Districts: ${geoIds.length}`);
console.log(`Climate Dataset Districts: ${climateIds.length}`);

// Map aliases to standard GeoJSON district IDs
const ALIAS_MAP = {
  'chitawan': 'chitwan',
  'kabhre': 'kavrepalanchok',
  'dolkha': 'dolakha',
  'bajang': 'bajhang',
  'panchther': 'panchthar',
  'routahat': 'rautahat',
  'tanahun': 'tanahun',
  'nawalpur': 'nawalpur',
  'dhanusha': 'dhanusha'
};

const missingInClimate = [];
for (const id of geoIds) {
  let matched = climate.climateMap[id];
  if (!matched) {
    // Check aliases
    for (const [alias, target] of Object.entries(ALIAS_MAP)) {
      if (target === id && climate.climateMap[alias]) {
        matched = true;
        break;
      }
    }
  }
  if (!matched) {
    missingInClimate.push(id);
  }
}

console.log('Districts missing in climate CSV:', missingInClimate);
