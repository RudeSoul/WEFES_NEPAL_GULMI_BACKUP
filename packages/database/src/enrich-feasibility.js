/**
 * Enrichment script: Parse Nepal_District_Crops_Feasibility.csv
 * and inject feasibility fields into districts.json
 *
 * Usage: node enrich-feasibility.js
 */
const fs = require('fs');
const path = require('path');

const CSV_PATH = path.resolve(__dirname, '../../../data/vegetation/Nepal_District_Crops_Feasibility.csv');
const DISTRICTS_JSON_PATH = path.resolve(__dirname, 'districts.json');

// Simple CSV parser that handles quoted fields with commas inside
function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]);
    if (vals.length < headers.length) continue;
    const record = {};
    headers.forEach((h, idx) => {
      record[h.trim()] = (vals[idx] || '').trim();
    });
    records.push(record);
  }
  return records;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// Split comma-separated crop list (trimming each item)
function splitCropList(str) {
  if (!str || str.trim() === '') return [];
  return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

// Normalize district name for matching
function normalizeDistrictName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z]/g, '');
}

// Build alternative name lookup
function buildNameVariants(csvName) {
  const variants = [normalizeDistrictName(csvName)];

  // Handle "Nawalparasi East" -> "nawalparasieast", also try "nawalparasi"
  // Handle "Eastern Rukum" -> "easternrukum", also try "rukumeast"
  // Handle "Western Rukum" -> "westernrukum", also try "rukumwest"
  // Handle "Nawalparasi West (Parasi)" -> also try "parasi"
  const lower = csvName.toLowerCase();

  if (lower.includes('nawalparasi east')) {
    variants.push('nawalparasieast', 'nawalparasisirahaeast', 'nawalpur');
  }
  if (lower.includes('nawalparasi west') || lower.includes('parasi')) {
    variants.push('nawalparasiwest', 'parasi', 'nawalparasibardaghatsunari');
  }
  if (lower.includes('eastern rukum')) {
    variants.push('easternrukum', 'rukumeast', 'rukumpurba');
  }
  if (lower.includes('western rukum')) {
    variants.push('westernrukum', 'rukumwest', 'rukumpaschim');
  }

  return variants;
}

function main() {
  // Read CSV
  const csvText = fs.readFileSync(CSV_PATH, 'utf-8');
  const csvRecords = parseCSV(csvText);
  console.log(`Parsed ${csvRecords.length} records from CSV`);

  // Read districts.json
  const districts = JSON.parse(fs.readFileSync(DISTRICTS_JSON_PATH, 'utf-8'));
  console.log(`Loaded ${districts.length} districts from districts.json`);

  // Build lookup: normalizedName -> csvRecord
  const csvLookup = new Map();
  for (const rec of csvRecords) {
    const csvName = rec['District'] || '';
    const variants = buildNameVariants(csvName);
    for (const v of variants) {
      csvLookup.set(v, rec);
    }
  }

  let matched = 0;
  let unmatched = [];

  for (const dist of districts) {
    const normName = normalizeDistrictName(dist.name);
    const normId = normalizeDistrictName(dist.id);

    const csvRec = csvLookup.get(normName) || csvLookup.get(normId);

    if (csvRec) {
      matched++;
      dist.physiographicRegion = csvRec['Physiographic_Region'] || undefined;
      dist.climateZone = csvRec['Climate_Zone'] || undefined;
      dist.elevationRange = csvRec['Elevation_Range_m'] || undefined;
      dist.feasibleCrops = splitCropList(csvRec['Feasible_Crops']);
      dist.feasibleVegetables = splitCropList(csvRec['Feasible_Vegetables']);
      dist.feasibleFruits = splitCropList(csvRec['Feasible_Fruits']);
      dist.feasibleSpicesCashCrops = splitCropList(csvRec['Feasible_Spices_Cash_Crops']);
      dist.feasibilityReasoning = csvRec['Reasoning_For_Feasibility'] || undefined;
    } else {
      unmatched.push(dist.name);
    }
  }

  console.log(`\nMatched: ${matched} / ${districts.length}`);
  if (unmatched.length > 0) {
    console.log(`Unmatched districts (${unmatched.length}):`, unmatched.join(', '));
  }

  // Write back
  fs.writeFileSync(DISTRICTS_JSON_PATH, JSON.stringify(districts, null, 2), 'utf-8');
  console.log(`\n✅ districts.json updated with crop feasibility data.`);
}

main();
