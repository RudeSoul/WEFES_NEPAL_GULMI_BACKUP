import * as fs from 'fs';
import * as path from 'path';
import { DISTRICTS_SEED_DATA } from './seed-data';

function generateGeoJSON() {
  const features = DISTRICTS_SEED_DATA.map((district, idx) => {
    const lat = district.coordinates.lat;
    const lng = district.coordinates.lng;
    
    // Create a smooth pseudo-hexagonal polygon around the centroid
    const r = 0.18 + ((idx % 5) * 0.03); // slightly varying size
    const polygon = [
      [
        [lng - r * 0.9, lat - r * 0.5],
        [lng - r * 0.2, lat - r * 0.95],
        [lng + r * 0.8, lat - r * 0.6],
        [lng + r * 0.95, lat + r * 0.4],
        [lng + r * 0.3, lat + r * 0.9],
        [lng - r * 0.75, lat + r * 0.7],
        [lng - r * 0.9, lat - r * 0.5]
      ]
    ];

    return {
      type: 'Feature',
      id: district.id,
      properties: {
        id: district.id,
        name: district.name,
        nepaliName: district.nepaliName,
        province: district.province,
        ecoZone: district.ecoZone,
        avgRainfallMm: district.avgRainfallMm,
        solarRadiationKwh: district.solarRadiationKwh,
        baseSoilPh: district.baseSoilPh,
        laborRateNprPerDay: district.laborRateNprPerDay
      },
      geometry: {
        type: 'Polygon',
        coordinates: polygon
      }
    };
  });

  const geoJson = {
    type: 'FeatureCollection',
    features
  };

  const outputDir = path.resolve(__dirname, '../../../data/geojson');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'nepal-districts.json');
  fs.writeFileSync(outputPath, JSON.stringify(geoJson, null, 2), 'utf-8');
  console.log(`Generated ${features.length} district GeoJSON features at ${outputPath}`);
}

generateGeoJSON();
