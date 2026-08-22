/**
 * Script: enrich-labor-data.js
 * Ingests data/Labour_data/nepal_agricultural_labor_rates_by_district.csv
 * Updates packages/database/src/districts.json and apps/web/public/geojson/nepal-districts-enriched.json
 */

const fs = require('fs');
const path = require('path');

const csvPath = path.resolve(__dirname, '../data/Labour_data/nepal_agricultural_labor_rates_by_district.csv');
const districtsJsonPath = path.resolve(__dirname, '../packages/database/src/districts.json');
const geojsonPath = path.resolve(__dirname, '../apps/web/public/geojson/nepal-districts-enriched.json');

const ALIASES = {
  'arghakhachi': 'arghakhanchi',
  'makawanpur': 'makwanpur',
  'sankhuwashava': 'sankhuwasabha',
  'kavre': 'kavrepalanchok',
  'tanahu': 'tanahun',
  'rukumpurba': 'eastern_rukum',
  'rukumpaschim': 'western_rukum',
  'rukum': 'western_rukum',
  'nawalparasi': 'parasi',
  'nawalpur': 'nawalpur'
};

function normalize(s) {
  const norm = (s || '').toLowerCase().replace(/[^a-z]/g, '');
  return ALIASES[norm] || norm;
}

// 1. Read & parse Labor CSV
const rawCsv = fs.readFileSync(csvPath, 'utf-8');
const lines = rawCsv.split('\n').filter(l => l.trim());

const laborMap = new Map();

for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',').map(s => s.trim());
  if (parts.length < 6) continue;

  const sn = parts[0];
  const distName = parts[1];
  const province = parts[2];
  const ecoBelt = parts[3];
  const baselineRate = parseFloat(parts[4]);
  const rangeStr = parts[5];

  // Parse range: e.g. "700 - 850"
  let minRate = baselineRate;
  let maxRate = baselineRate;
  const rangeMatch = rangeStr.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) {
    minRate = parseFloat(rangeMatch[1]);
    maxRate = parseFloat(rangeMatch[2]);
  }
  const avgRate = Math.round((minRate + maxRate) / 2);

  const norm = normalize(distName);
  laborMap.set(norm, {
    distName,
    province,
    ecoBelt,
    baselineRate,
    minRate,
    maxRate,
    avgRate,
    rangeStr: `${minRate} - ${maxRate}`
  });
}

console.log(`Parsed ${laborMap.size} districts from nepal_agricultural_labor_rates_by_district.csv`);

// 2. Update packages/database/src/districts.json
const districts = JSON.parse(fs.readFileSync(districtsJsonPath, 'utf-8'));
let matchedDistricts = 0;

for (const d of districts) {
  const normId = normalize(d.id);
  const normName = normalize(d.name);
  const labor = laborMap.get(normId) || laborMap.get(normName);

  if (labor) {
    matchedDistricts++;
    d.laborRateNprPerDay = labor.avgRate; // Main financial labor rate
    d.agriLaborRateBaselineNpr = labor.baselineRate;
    d.agriLaborMarketRateMinNpr = labor.minRate;
    d.agriLaborMarketRateMaxNpr = labor.maxRate;
    d.agriLaborMarketRateAvgNpr = labor.avgRate;
    d.agriLaborRateRange = labor.rangeStr;
    d.agriLaborEcoBelt = labor.ecoBelt;
  } else {
    console.warn(`⚠️ No labor data found for district: ${d.name} (${d.id})`);
  }
}

fs.writeFileSync(districtsJsonPath, JSON.stringify(districts, null, 2), 'utf-8');
console.log(`✅ Updated ${matchedDistricts} / ${districts.length} districts in packages/database/src/districts.json`);

// 3. Update apps/web/public/geojson/nepal-districts-enriched.json
const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'));
let matchedGeoJSON = 0;

for (const feature of geojson.features) {
  const normId = normalize(feature.id || feature.properties?.id);
  const normName = normalize(feature.properties?.name);
  const labor = laborMap.get(normId) || laborMap.get(normName);

  if (labor) {
    matchedGeoJSON++;
    feature.properties = {
      ...feature.properties,
      laborRateNprPerDay: labor.avgRate,
      agriLaborRateBaselineNpr: labor.baselineRate,
      agriLaborMarketRateMinNpr: labor.minRate,
      agriLaborMarketRateMaxNpr: labor.maxRate,
      agriLaborMarketRateAvgNpr: labor.avgRate,
      agriLaborRateRange: labor.rangeStr,
      agriLaborEcoBelt: labor.ecoBelt,
    };
  } else {
    console.warn(`⚠️ No labor data found for GeoJSON feature: ${feature.properties?.name} (${feature.id})`);
  }
}

fs.writeFileSync(geojsonPath, JSON.stringify(geojson, null, 2), 'utf-8');
console.log(`✅ Updated ${matchedGeoJSON} / ${geojson.features.length} features in apps/web/public/geojson/nepal-districts-enriched.json`);
