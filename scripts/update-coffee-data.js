/**
 * Script: update-coffee-data.js
 * Ingests data/vegetation/Coffee_Production_untill_2080.csv
 * 1. Enriches packages/database/src/districts.json with coffee production statistics
 *    and ensures "Coffee" is in feasibleSpicesCashCrops for all 24 producing districts.
 * 2. Enriches apps/web/public/geojson/nepal-districts-enriched.json with the same data.
 * 3. Synchronizes data/vegetation/Nepal_District_Crops_Feasibility.csv.
 */

const fs = require('fs');
const path = require('path');

const coffeeCsvPath = path.resolve(__dirname, '../data/vegetation/Coffee_Production_untill_2080.csv');
const feasibilityCsvPath = path.resolve(__dirname, '../data/vegetation/Nepal_District_Crops_Feasibility.csv');
const districtsJsonPath = path.resolve(__dirname, '../packages/database/src/districts.json');
const geojsonPath = path.resolve(__dirname, '../apps/web/public/geojson/nepal-districts-enriched.json');

const ALIAS_MAP = {
  'arghakhachi': 'arghakhanchi',
  'makawanpur': 'makwanpur',
  'sankhuwashava': 'sankhuwasabha',
  'kavre': 'kavrepalanchok',
  'tanahu': 'tanahun'
};

function normalize(s) {
  const norm = (s || '').toLowerCase().replace(/[^a-z]/g, '');
  return ALIAS_MAP[norm] || norm;
}

// 1. Parse Coffee CSV
const coffeeRaw = fs.readFileSync(coffeeCsvPath, 'utf-8');
const lines = coffeeRaw.split('\n').filter(l => l.trim());
const coffeeMap = new Map();

for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',').map(s => s.trim());
  if (parts.length < 6 || parts[1] === 'Total' || parts[1].includes('Other')) continue;
  const rawName = parts[1];
  const areaHa = parseFloat(parts[2]);
  const prodMt = parseFloat(parts[3]);
  const yieldKgHa = parseFloat(parts[4]);
  const farmers = parseInt(parts[5]);

  const norm = normalize(rawName);
  coffeeMap.set(norm, {
    rawName,
    areaHa,
    prodMt,
    yieldKgHa,
    farmers
  });
}

console.log(`Parsed ${coffeeMap.size} coffee producing districts from Coffee_Production_untill_2080.csv`);

// 2. Update districts.json
const districts = JSON.parse(fs.readFileSync(districtsJsonPath, 'utf-8'));
let updatedInDistricts = 0;

for (const d of districts) {
  const normId = normalize(d.id);
  const normName = normalize(d.name);
  const coffeeData = coffeeMap.get(normId) || coffeeMap.get(normName);

  if (coffeeData) {
    updatedInDistricts++;
    d.coffeeProductionMt = coffeeData.prodMt;
    d.coffeeAreaHa = coffeeData.areaHa;
    d.coffeeYieldKgHa = coffeeData.yieldKgHa;
    d.coffeeFarmersCount = coffeeData.farmers;

    // Ensure "Coffee" is in feasibleSpicesCashCrops
    if (!d.feasibleSpicesCashCrops) {
      d.feasibleSpicesCashCrops = ['Coffee'];
    } else {
      const hasCoffee = d.feasibleSpicesCashCrops.some(s => s.toLowerCase().includes('coffee'));
      if (!hasCoffee) {
        d.feasibleSpicesCashCrops.push('Coffee');
      }
    }
  }
}

fs.writeFileSync(districtsJsonPath, JSON.stringify(districts, null, 2), 'utf-8');
console.log(`✅ Updated ${updatedInDistricts} districts in packages/database/src/districts.json`);

// 3. Update GeoJSON
const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'));
let updatedInGeoJSON = 0;

for (const feature of geojson.features) {
  const normId = normalize(feature.id || feature.properties?.id);
  const normName = normalize(feature.properties?.name);
  const coffeeData = coffeeMap.get(normId) || coffeeMap.get(normName);

  if (coffeeData) {
    updatedInGeoJSON++;
    feature.properties = {
      ...feature.properties,
      coffeeProductionMt: coffeeData.prodMt,
      coffeeAreaHa: coffeeData.areaHa,
      coffeeYieldKgHa: coffeeData.yieldKgHa,
      coffeeFarmersCount: coffeeData.farmers,
    };

    if (!feature.properties.feasibleSpicesCashCrops) {
      feature.properties.feasibleSpicesCashCrops = ['Coffee'];
    } else {
      const hasCoffee = feature.properties.feasibleSpicesCashCrops.some(s => s.toLowerCase().includes('coffee'));
      if (!hasCoffee) {
        feature.properties.feasibleSpicesCashCrops = [...feature.properties.feasibleSpicesCashCrops, 'Coffee'];
      }
    }
  }
}

fs.writeFileSync(geojsonPath, JSON.stringify(geojson, null, 2), 'utf-8');
console.log(`✅ Updated ${updatedInGeoJSON} features in apps/web/public/geojson/nepal-districts-enriched.json`);

// 4. Synchronize Nepal_District_Crops_Feasibility.csv
const feasCsvRaw = fs.readFileSync(feasibilityCsvPath, 'utf-8');
const feasLines = feasCsvRaw.split('\n');
const newFeasLines = [];

for (let i = 0; i < feasLines.length; i++) {
  const line = feasLines[i];
  if (!line.trim() || i === 0) {
    newFeasLines.push(line);
    continue;
  }

  // Find district name (before first comma)
  const firstComma = line.indexOf(',');
  if (firstComma === -1) {
    newFeasLines.push(line);
    continue;
  }

  const distName = line.substring(0, firstComma).trim();
  const norm = normalize(distName);
  const coffeeData = coffeeMap.get(norm);

  if (coffeeData && !line.toLowerCase().includes('coffee')) {
    // Inject Coffee into the line
    // Find the 9th column (Feasible_Spices_Cash_Crops)
    // Replace "Ginger," with "Coffee, Ginger," or similar
    if (line.includes('"Ginger')) {
      newFeasLines.push(line.replace('"Ginger', '"Coffee, Ginger'));
    } else if (line.includes('Ginger')) {
      newFeasLines.push(line.replace('Ginger', 'Coffee, Ginger'));
    } else if (line.includes('"Honey')) {
      newFeasLines.push(line.replace('"Honey', '"Coffee, Honey'));
    } else {
      newFeasLines.push(line);
    }
  } else {
    newFeasLines.push(line);
  }
}

fs.writeFileSync(feasibilityCsvPath, newFeasLines.join('\n'), 'utf-8');
console.log(`✅ Synchronized data/vegetation/Nepal_District_Crops_Feasibility.csv`);
