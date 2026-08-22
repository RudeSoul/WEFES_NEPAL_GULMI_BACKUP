const fs = require('fs');
const path = require('path');

const summaryPath = path.resolve(process.cwd(), 'data/geojson/district-soil-summary.json');
const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));

const phs = [], ns = [], ps = [], ks = [];
for (const [id, stats] of Object.entries(summary)) {
  if (stats.hasRealSoilData) {
    phs.push(stats.avgPh);
    ns.push(stats.avgN);
    ps.push(stats.avgP);
    ks.push(stats.avgK);
  }
}

phs.sort((a,b) => a-b);
ns.sort((a,b) => a-b);
ps.sort((a,b) => a-b);
ks.sort((a,b) => a-b);

console.log('pH Range:', Math.min(...phs), 'to', Math.max(...phs), 'Median:', phs[Math.floor(phs.length/2)]);
console.log('Nitrogen Range:', Math.min(...ns), 'to', Math.max(...ns), 'Median:', ns[Math.floor(ns.length/2)]);
console.log('Phosphorus Range:', Math.min(...ps), 'to', Math.max(...ps), 'Median:', ps[Math.floor(ps.length/2)]);
console.log('Potassium Range:', Math.min(...ks), 'to', Math.max(...ks), 'Median:', ks[Math.floor(ks.length/2)]);
