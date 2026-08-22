const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function findRawNames() {
  const csvPath = path.resolve(process.cwd(), 'data/geojson/district_monthly_climate.csv');
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineCount = 0;
  const rawDistricts = new Set();

  for await (const line of rl) {
    lineCount++;
    if (lineCount === 1) continue;
    const parts = line.split(',');
    if (parts[3]) rawDistricts.add(parts[3].trim());
  }

  console.log('All Raw District Names in CSV:', Array.from(rawDistricts).sort());
}

findRawNames().catch(console.error);
