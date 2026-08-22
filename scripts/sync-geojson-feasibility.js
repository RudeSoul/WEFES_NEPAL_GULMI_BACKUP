/**
 * Syncs feasibility data from packages/database/src/districts.json
 * into apps/web/public/geojson/nepal-districts-enriched.json
 */
const fs = require('fs');
const path = require('path');

const districtsJsonPath = path.resolve(__dirname, '../packages/database/src/districts.json');
const geojsonPath = path.resolve(__dirname, '../apps/web/public/geojson/nepal-districts-enriched.json');

const districts = JSON.parse(fs.readFileSync(districtsJsonPath, 'utf-8'));
const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'));

const distMap = new Map();
for (const d of districts) {
  distMap.set(d.id.toLowerCase(), d);
}

let enrichedCount = 0;
for (const feature of geojson.features) {
  const fid = (feature.id || feature.properties?.id || '').toLowerCase();
  const dData = distMap.get(fid);
  if (dData) {
    feature.properties = {
      ...feature.properties,
      physiographicRegion: dData.physiographicRegion,
      climateZone: dData.climateZone,
      elevationRange: dData.elevationRange,
      feasibleCrops: dData.feasibleCrops,
      feasibleVegetables: dData.feasibleVegetables,
      feasibleFruits: dData.feasibleFruits,
      feasibleSpicesCashCrops: dData.feasibleSpicesCashCrops,
      feasibilityReasoning: dData.feasibilityReasoning,
    };
    enrichedCount++;
  }
}

fs.writeFileSync(geojsonPath, JSON.stringify(geojson, null, 2), 'utf-8');
console.log(`✅ Successfully enriched ${enrichedCount} / ${geojson.features.length} GeoJSON features in apps/web/public/geojson/nepal-districts-enriched.json`);
