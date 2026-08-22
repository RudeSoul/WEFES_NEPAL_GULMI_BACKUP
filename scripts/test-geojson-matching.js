const fs = require('fs');
const path = require('path');
const readline = require('readline');

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
  
  if (geometry.type === 'Polygon') {
    // Outer ring is coordinates[0]
    return pointInPolygon(point, geometry.coordinates[0]);
  } else if (geometry.type === 'MultiPolygon') {
    // Array of polygons, each having outer ring as poly[0]
    for (const poly of geometry.coordinates) {
      if (pointInPolygon(point, poly[0])) return true;
    }
  }
  return false;
}

async function testMatching() {
  const geojsonPath = path.resolve(process.cwd(), 'apps/web/public/geojson/nepal-districts-enriched.json');
  const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'));

  console.log('Feature counts and geometry types:');
  const typeCounts = {};
  for (const f of geojson.features) {
    const type = f.geometry ? f.geometry.type : 'Unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
    console.log(`ID: ${f.properties.id || f.id}, Name: ${f.properties.name}, Type: ${type}`);
  }
  console.log('Geometry summary:', typeCounts);
}

testMatching().catch(console.error);
