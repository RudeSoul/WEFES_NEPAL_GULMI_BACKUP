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

// Distance between two points in km (Haversine)
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function run() {
  console.log('Loading enriched GeoJSON...');
  const geojsonPath = path.resolve(process.cwd(), 'apps/web/public/geojson/nepal-districts-enriched.json');
  const geojsonRaw = fs.readFileSync(geojsonPath, 'utf-8');
  const geojson = JSON.parse(geojsonRaw);

  console.log(`Loaded ${geojson.features.length} features from GeoJSON.`);

  // Initialize district statistics accumulator
  const districtStats = {};
  const districtCenters = [];

  for (const feature of geojson.features) {
    const id = feature.properties.id || feature.id;
    districtStats[id] = {
      id,
      name: feature.properties.name,
      phSum: 0,
      nSum: 0,
      pSum: 0,
      kSum: 0,
      count: 0,
      soilTypes: {},
      feature
    };

    // Calculate approximate center lat/lng from bounding box for nearest fallback
    let sumLon = 0, sumLat = 0, ptCount = 0;
    const coords = feature.geometry.type === 'Polygon' 
      ? feature.geometry.coordinates[0] 
      : feature.geometry.coordinates.flatMap(p => p[0]);
    
    for (const pt of coords) {
      sumLon += pt[0];
      sumLat += pt[1];
      ptCount++;
    }
    districtCenters.push({
      id,
      centerLon: sumLon / ptCount,
      centerLat: sumLat / ptCount
    });
  }

  console.log('Reading CSV soildataNepal.csv...');
  const csvPath = path.resolve(process.cwd(), 'data/geojson/soildataNepal.csv');
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  let matchedCount = 0;

  for await (const line of rl) {
    lineCount++;
    if (lineCount === 1) continue; // Skip header

    // lon,lat,nitrogen,phosphorus,potassium,ph,soil_type,timestamp
    // Handle potential quotes in soil_type
    const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    if (!parts || parts.length < 7) continue;

    const lon = parseFloat(parts[0]);
    const lat = parseFloat(parts[1]);
    const n = parseFloat(parts[2]);
    const p = parseFloat(parts[3]);
    const k = parseFloat(parts[4]);
    const ph = parseFloat(parts[5]);
    const soilType = parts[6].replace(/^"|"$/g, '');

    if (isNaN(lon) || isNaN(lat) || isNaN(ph)) continue;

    const point = [lon, lat];
    let matchedId = null;

    // Check point in polygon
    for (const feature of geojson.features) {
      if (pointInGeoJSONGeometry(point, feature.geometry)) {
        matchedId = feature.properties.id || feature.id;
        break;
      }
    }

    // Nearest fallback if slightly outside boundary
    if (!matchedId) {
      let minDist = Infinity;
      for (const dc of districtCenters) {
        const d = distanceKm(lat, lon, dc.centerLat, dc.centerLon);
        if (d < minDist) {
          minDist = d;
          matchedId = dc.id;
        }
      }
    }

    if (matchedId && districtStats[matchedId]) {
      matchedCount++;
      const ds = districtStats[matchedId];
      ds.phSum += ph;
      ds.nSum += n;
      ds.pSum += p;
      ds.kSum += k;
      ds.count += 1;
      ds.soilTypes[soilType] = (ds.soilTypes[soilType] || 0) + 1;
    }
  }

  console.log(`Processed ${lineCount - 1} rows. Matched ${matchedCount} to districts.`);

  // Calculate final averages and dominant soil types
  const finalSummary = {};
  for (const [id, ds] of Object.entries(districtStats)) {
    if (ds.count > 0) {
      const avgPh = Number((ds.phSum / ds.count).toFixed(2));
      const avgN = Number((ds.nSum / ds.count).toFixed(2));
      const avgP = Number((ds.pSum / ds.count).toFixed(2));
      const avgK = Number((ds.kSum / ds.count).toFixed(2));

      let dominantType = 'Unknown';
      let maxTypeCount = 0;
      for (const [st, cnt] of Object.entries(ds.soilTypes)) {
        if (cnt > maxTypeCount) {
          maxTypeCount = cnt;
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
        dominantType
      };

      // Enrich feature properties in GeoJSON
      ds.feature.properties.baseSoilPh = avgPh;
      ds.feature.properties.soilNitrogen = avgN;
      ds.feature.properties.soilPhosphorus = avgP;
      ds.feature.properties.soilPotassium = avgK;
      ds.feature.properties.soilType = dominantType;
      ds.feature.properties.soilSampleCount = ds.count;
    }
  }

  console.log('\nSample results (first 10 districts):');
  console.log(Object.values(finalSummary).slice(0, 10));

  // Write updated enriched GeoJSON
  fs.writeFileSync(geojsonPath, JSON.stringify(geojson, null, 2), 'utf-8');
  console.log('\nUpdated apps/web/public/geojson/nepal-districts-enriched.json');

  // Save summary JSON for database/seed updates
  const summaryPath = path.resolve(process.cwd(), 'data/geojson/district-soil-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(finalSummary, null, 2), 'utf-8');
  console.log('Saved data/geojson/district-soil-summary.json');
}

run().catch(console.error);
