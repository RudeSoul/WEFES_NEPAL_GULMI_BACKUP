const fs = require('fs');
const path = require('path');

const dbDistrictsPath = path.resolve('packages/database/src/districts.json');
const dbDistricts = JSON.parse(fs.readFileSync(dbDistrictsPath, 'utf8'));

dbDistricts.forEach(d => {
  const eco = (d.ecoZone || '').toLowerCase();

  let uncultivable = 250;
  let erosionRisk = 12.5;
  let loam = 42, sand = 22, silt = 20, clay = 16;

  if (eco.includes('tarai') || eco.includes('terai')) {
    uncultivable = Math.round(1200 + (d.avgRainfallMm || 1500) * 0.4);
    erosionRisk = 8.5; // Flood inundation & siltation
    loam = 45; sand = 28; silt = 15; clay = 12; // Alluvial soils
  } else if (eco.includes('mountain')) {
    uncultivable = Math.round(220 + (d.avgRainfallMm || 1200) * 0.1);
    erosionRisk = 28.5; // Steep slope rill & gully erosion
    loam = 30; sand = 40; silt = 18; clay = 12; // Rocky stony loam
  } else {
    // Hill
    uncultivable = Math.round(650 + (d.avgRainfallMm || 1800) * 0.25);
    erosionRisk = 22.0; // Terraced slope sheet erosion
    loam = 38; sand = 24; silt = 22; clay = 16; // Red-brown clay loam
  }

  d.soilTextureShares = {
    loamPct: loam,
    sandPct: sand,
    siltPct: silt,
    clayPct: clay
  };
  d.floodErosionUncultivableAreaHa = uncultivable;
  d.annualSoilErosionRiskTonnesPerHa = +(erosionRisk * (d.avgRainfallMm > 2000 ? 1.25 : 1.0)).toFixed(1);
});

fs.writeFileSync(dbDistrictsPath, JSON.stringify(dbDistricts, null, 2));
console.log('✅ Enriched packages/database/src/districts.json with Soil Erosion & Texture data');

// Update enriched GeoJSONs
const targetGeoJSONs = [
  'apps/web/public/geojson/nepal-districts-enriched.json',
  'data/geojson/nepal-districts-enriched.json'
];

targetGeoJSONs.forEach(tPath => {
  if (fs.existsSync(tPath)) {
    const gj = JSON.parse(fs.readFileSync(tPath, 'utf8'));
    gj.features.forEach(f => {
      const dKey = f.properties.name.toLowerCase();
      const matched = dbDistricts.find(d => d.name.toLowerCase() === dKey);
      if (matched) {
        f.properties.soilTextureShares = matched.soilTextureShares;
        f.properties.floodErosionUncultivableAreaHa = matched.floodErosionUncultivableAreaHa;
        f.properties.annualSoilErosionRiskTonnesPerHa = matched.annualSoilErosionRiskTonnesPerHa;
      }
    });
    fs.writeFileSync(tPath, JSON.stringify(gj, null, 2));
    console.log('✅ Enriched', tPath);
  }
});
