const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function validateDistricts() {
  const geojsonPath = path.resolve(process.cwd(), 'apps/web/public/geojson/nepal-districts-enriched.json');
  const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'));

  const csvPath = path.resolve(process.cwd(), 'data/geojson/soildataNepal.csv');
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  // Map each district ID to its name and list of sampled points
  const districtData = {};
  for (const f of geojson.features) {
    districtData[f.properties.id] = {
      id: f.properties.id,
      name: f.properties.name,
      nepaliName: f.properties.nepaliName,
      province: f.properties.province,
      ecoZone: f.properties.ecoZone,
      pts: []
    };
  }

  let lineCount = 0;
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
    const st = parts[6].replace(/^"|"$/g, '').trim();

    if (isNaN(lon) || isNaN(lat)) continue;

    // Check which polygon it falls inside
    for (const f of geojson.features) {
      if (pointInGeoJSONGeometry([lon, lat], f.geometry)) {
        districtData[f.properties.id].pts.push({ n, p, k, ph, st });
        break;
      }
    }
  }

  console.log('District soil summary comparison with NARC standards:');
  const summary = [];
  for (const [id, d] of Object.entries(districtData)) {
    if (d.pts.length > 0) {
      const phs = d.pts.map(p => p.ph);
      const ns = d.pts.map(p => p.n);
      const ps = d.pts.map(p => p.p);
      const ks = d.pts.map(p => p.k);

      const meanPh = phs.reduce((a,b)=>a+b,0)/phs.length;
      const meanN = ns.reduce((a,b)=>a+b,0)/ns.length;
      const meanP = ps.reduce((a,b)=>a+b,0)/ps.length;
      const meanK = ks.reduce((a,b)=>a+b,0)/ks.length;

      // NARC Rating for pH: Acidic (<6.0), Neutral (6.0-7.0), Alkaline (>7.0)
      let narcPhRating = 'Neutral (6.0 - 7.0)';
      if (meanPh < 6.0) narcPhRating = 'Acidic (< 6.0)';
      if (meanPh > 7.0) narcPhRating = 'Alkaline (> 7.0)';

      // NARC Rating for N: Low (<0.10%), Medium (0.10-0.20%), High (>0.20%)
      let narcNRating = 'Medium (0.10 - 0.20%)';
      if (meanN < 0.10) narcNRating = 'Low (< 0.10%)';
      if (meanN > 0.20) narcNRating = 'High (> 0.20%)';

      // NARC Rating for P (kg/ha): Low (<30), Medium (30-55), High (>55)
      let narcPRating = 'Medium (30 - 55 kg/ha)';
      if (meanP < 30) narcPRating = 'Low (< 30 kg/ha)';
      if (meanP > 55) narcPRating = 'High (> 55 kg/ha)';

      // NARC Rating for K (kg/ha): Low (<110), Medium (110-280), High (>280)
      let narcKRating = 'Medium (110 - 280 kg/ha)';
      if (meanK < 110) narcKRating = 'Low (< 110 kg/ha)';
      if (meanK > 280) narcKRating = 'High (> 280 kg/ha)';

      summary.push({
        id,
        name: d.name,
        count: d.pts.length,
        meanPh: Number(meanPh.toFixed(2)),
        narcPhRating,
        meanN: Number(meanN.toFixed(2)),
        narcNRating,
        meanP: Number(meanP.toFixed(2)),
        narcPRating,
        meanK: Number(meanK.toFixed(2)),
        narcKRating
      });
    }
  }

  console.log(`Matched ${summary.length} districts with ground samples.`);
  console.log('\nFirst 15 district NARC validation:');
  console.log(summary.slice(0, 15));
}

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
  if (!geometry || !geometry.coordinates) return false;
  if (geometry.type === 'Polygon') return pointInPolygon(point, geometry.coordinates[0]);
  if (geometry.type === 'MultiPolygon') {
    for (const poly of geometry.coordinates) {
      if (pointInPolygon(point, poly[0])) return true;
    }
  }
  return false;
}

validateDistricts().catch(console.error);
