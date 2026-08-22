const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Point-in-Polygon algorithm (Ray-casting)
function pointInPolygon(point, vs) {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInGeoJSONGeometry(point, geometry) {
  if (geometry.type === 'Polygon') {
    return pointInPolygon(point, geometry.coordinates[0]);
  } else if (geometry.type === 'MultiPolygon') {
    for (const poly of geometry.coordinates) {
      if (pointInPolygon(point, poly[0])) return true;
    }
  }
  return false;
}

async function analyze() {
  const geojsonPath = path.resolve(process.cwd(), 'apps/web/public/geojson/nepal-districts-enriched.json');
  const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'));

  const districtStats = {};
  for (const feature of geojson.features) {
    const id = feature.properties.id || feature.id;
    districtStats[id] = {
      id,
      name: feature.properties.name,
      phValues: [],
      nValues: [],
      pValues: [],
      kValues: [],
      soilTypes: {},
      count: 0,
      feature
    };
  }

  const csvPath = path.resolve(process.cwd(), 'data/geojson/soildataNepal.csv');
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineCount = 0;
  let matchedStrictCount = 0;
  const allSoilTypes = new Set();

  for await (const line of rl) {
    lineCount++;
    if (lineCount === 1) continue;

    const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    if (!parts || parts.length < 7) continue;

    const lon = parseFloat(parts[0]);
    const lat = parseFloat(parts[1]);
    const n = parseFloat(parts[2]);
    const p = parseFloat(parts[3]);
    const k = parseFloat(parts[4]);
    const ph = parseFloat(parts[5]);
    const soilType = parts[6].replace(/^"|"$/g, '').trim();
    if (soilType) allSoilTypes.add(soilType);

    if (isNaN(lon) || isNaN(lat) || isNaN(ph)) continue;

    const point = [lon, lat];
    let matchedId = null;

    // STRICT Point-in-polygon matching ONLY
    for (const feature of geojson.features) {
      if (pointInGeoJSONGeometry(point, feature.geometry)) {
        matchedId = feature.properties.id || feature.id;
        break;
      }
    }

    if (matchedId && districtStats[matchedId]) {
      matchedStrictCount++;
      const ds = districtStats[matchedId];
      ds.phValues.push(ph);
      ds.nValues.push(n);
      ds.pValues.push(p);
      ds.kValues.push(k);
      ds.soilTypes[soilType] = (ds.soilTypes[soilType] || 0) + 1;
      ds.count++;
    }
  }

  console.log(`Total CSV rows: ${lineCount - 1}`);
  console.log(`Strictly matched to district polygons: ${matchedStrictCount}`);
  console.log(`Unique Soil Types in dataset:`, Array.from(allSoilTypes));

  const withData = [];
  const noData = [];

  const finalSummary = {};

  for (const [id, ds] of Object.entries(districtStats)) {
    if (ds.count > 0) {
      const avgPh = Number((ds.phValues.reduce((a, b) => a + b, 0) / ds.count).toFixed(2));
      const avgN = Number((ds.nValues.reduce((a, b) => a + b, 0) / ds.count).toFixed(2));
      const avgP = Number((ds.pValues.reduce((a, b) => a + b, 0) / ds.count).toFixed(2));
      const avgK = Number((ds.kValues.reduce((a, b) => a + b, 0) / ds.count).toFixed(2));

      let dominantType = 'Unknown';
      let maxCount = 0;
      for (const [st, cnt] of Object.entries(ds.soilTypes)) {
        if (cnt > maxCount) {
          maxCount = cnt;
          dominantType = st;
        }
      }

      finalSummary[id] = {
        name: ds.name,
        count: ds.count,
        avgPh,
        avgN,
        avgP,
        avgK,
        dominantType,
        hasRealSoilData: true
      };
      withData.push(ds.name);

      // Update feature
      ds.feature.properties.baseSoilPh = avgPh;
      ds.feature.properties.soilNitrogen = avgN;
      ds.feature.properties.soilPhosphorus = avgP;
      ds.feature.properties.soilPotassium = avgK;
      ds.feature.properties.soilType = dominantType;
      ds.feature.properties.soilSampleCount = ds.count;
      ds.feature.properties.hasRealSoilData = true;
    } else {
      finalSummary[id] = {
        name: ds.name,
        count: 0,
        hasRealSoilData: false
      };
      noData.push(ds.name);

      // DO NOT ASSUME BASELINE!
      ds.feature.properties.soilNitrogen = undefined;
      ds.feature.properties.soilPhosphorus = undefined;
      ds.feature.properties.soilPotassium = undefined;
      ds.feature.properties.soilType = undefined;
      ds.feature.properties.soilSampleCount = 0;
      ds.feature.properties.hasRealSoilData = false;
    }
  }

  console.log(`\nDistricts WITH real soil data (${withData.length}):`, withData);
  console.log(`\nDistricts WITHOUT real soil data (${noData.length}):`, noData);

  // Write updated GeoJSON
  fs.writeFileSync(geojsonPath, JSON.stringify(geojson, null, 2), 'utf-8');
  console.log('Updated apps/web/public/geojson/nepal-districts-enriched.json with strict real soil data flag!');

  // Write summary
  const summaryPath = path.resolve(process.cwd(), 'data/geojson/district-soil-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(finalSummary, null, 2), 'utf-8');
  console.log('Saved district-soil-summary.json');
}

analyze().catch(console.error);
