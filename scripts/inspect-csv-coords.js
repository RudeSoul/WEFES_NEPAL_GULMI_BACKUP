const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function inspectCsv() {
  const csvPath = path.resolve(process.cwd(), 'data/geojson/soildataNepal.csv');
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineCount = 0;
  let minLon = Infinity, maxLon = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;
  let minN = Infinity, maxN = -Infinity;
  let minP = Infinity, maxP = -Infinity;
  let minK = Infinity, maxK = -Infinity;
  let minPh = Infinity, maxPh = -Infinity;

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

    if (!isNaN(lon)) { minLon = Math.min(minLon, lon); maxLon = Math.max(maxLon, lon); }
    if (!isNaN(lat)) { minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat); }
    if (!isNaN(n)) { minN = Math.min(minN, n); maxN = Math.max(maxN, n); }
    if (!isNaN(p)) { minP = Math.min(minP, p); maxP = Math.max(maxP, p); }
    if (!isNaN(k)) { minK = Math.min(minK, k); maxK = Math.max(maxK, k); }
    if (!isNaN(ph)) { minPh = Math.min(minPh, ph); maxPh = Math.max(maxPh, ph); }
  }

  console.log('Total CSV rows:', lineCount - 1);
  console.log(`Longitude range: ${minLon} to ${maxLon}`);
  console.log(`Latitude range: ${minLat} to ${maxLat}`);
  console.log(`Nitrogen (N) range: ${minN} to ${maxN}`);
  console.log(`Phosphorus (P) range: ${minP} to ${maxP}`);
  console.log(`Potassium (K) range: ${minK} to ${maxK}`);
  console.log(`pH range: ${minPh} to ${maxPh}`);
}

inspectCsv().catch(console.error);
