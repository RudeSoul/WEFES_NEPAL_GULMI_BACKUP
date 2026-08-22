const fs = require('fs');
const path = require('path');

const geojsonPath = path.resolve(process.cwd(), 'apps/web/public/geojson/nepal-districts-enriched.json');
const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'));

const districts = geojson.features.map(f => f.properties);

const jsonPath = path.resolve(process.cwd(), 'packages/database/src/districts.json');
fs.writeFileSync(jsonPath, JSON.stringify(districts, null, 2), 'utf-8');

console.log(`Exported ${districts.length} real district records to packages/database/src/districts.json (${(fs.statSync(jsonPath).size / 1024).toFixed(1)} KB)`);
