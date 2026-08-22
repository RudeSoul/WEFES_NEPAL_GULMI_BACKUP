const fs = require('fs');
const path = require('path');

const summaryPath = path.resolve(process.cwd(), 'data/geojson/district-soil-summary.json');
const soilSummary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));

const seedPath = path.resolve(process.cwd(), 'packages/database/src/seed-data.ts');
let seedContent = fs.readFileSync(seedPath, 'utf-8');

// Regex match each district entry in seed-data.ts
// Format: { id: 'taplejung', ... }
for (const [id, stats] of Object.entries(soilSummary)) {
  const targetPattern = new RegExp(`(\{\\s*id:\\s*'${id}'.*?)(baseSoilPh:\\s*[0-9.]+)(.*?\})`, 's');
  if (targetPattern.test(seedContent)) {
    seedContent = seedContent.replace(targetPattern, (match, prefix, oldPh, suffix) => {
      const newSoilProps = `baseSoilPh: ${stats.avgPh}, soilNitrogen: ${stats.avgN}, soilPhosphorus: ${stats.avgP}, soilPotassium: ${stats.avgK}, soilType: '${stats.dominantType.replace(/'/g, "\\'")}', soilSampleCount: ${stats.count}`;
      return `${prefix}${newSoilProps}${suffix}`;
    });
  }
}

fs.writeFileSync(seedPath, seedContent, 'utf-8');
console.log('Successfully updated packages/database/src/seed-data.ts with real soil metrics!');
