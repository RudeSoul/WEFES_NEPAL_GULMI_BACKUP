// [DATA PROVENANCE]
// Data Source: apps/web/public/geojson/gulmi-contours.json, apps/web/src/utils/contourGenerator.ts
// Classification: UNIT TEST (Topographic Contours & Agro-Ecological Life Zones)
// Citations: Survey Department / Topographical Survey of Nepal, MoALD Agro-Ecological Catalog

import { describe, it, expect } from 'vitest';
import contoursData from '../../public/geojson/gulmi-contours.json';

describe('Track C: Raster Vectorization (Topographic Contours & Life Zones)', () => {
  it('loads valid GeoJSON FeatureCollection metadata', () => {
    expect(contoursData.type).toBe('FeatureCollection');
    expect(contoursData._metadata).toBeDefined();
    expect(contoursData._metadata.title).toContain('Gulmi District Vector Topographic Elevation Contours');
    expect(contoursData._metadata.source).toContain('Survey Department of Nepal');
    expect(contoursData.features.length).toBeGreaterThan(15);
  });

  it('verifies elevation interval integrity and required properties on every contour line', () => {
    const validElevations = [500, 700, 900, 1100, 1300, 1500, 1700, 1900, 2100, 2300, 2500];

    for (const feature of contoursData.features) {
      expect(feature.type).toBe('Feature');
      expect(feature.geometry.type).toBe('LineString');
      expect(feature.geometry.coordinates.length).toBeGreaterThanOrEqual(3);

      const p = feature.properties;
      expect(validElevations).toContain(p.elevation);
      expect(typeof p.isIndex).toBe('boolean');
      expect(typeof p.color).toBe('string');
      expect(p.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(typeof p.lifeZone).toBe('string');
      expect(Array.isArray(p.feasibleCrops)).toBe(true);
      expect(p.feasibleCrops.length).toBeGreaterThan(0);
      expect(typeof p.temperatureC).toBe('number');
    }
  });

  it('confirms coordinates stay strictly within Gulmi District geographical bounds', () => {
    // Gulmi BBOX: lat [27.91, 28.27], lng [83.02, 83.61]
    for (const feature of contoursData.features) {
      for (const [lng, lat] of feature.geometry.coordinates) {
        expect(lng).toBeGreaterThanOrEqual(83.02);
        expect(lng).toBeLessThanOrEqual(83.61);
        expect(lat).toBeGreaterThanOrEqual(27.91);
        expect(lat).toBeLessThanOrEqual(28.27);
      }
    }
  });

  it('accurately classifies agro-ecological life zones and crops across elevation bands', () => {
    const tropicalLine = contoursData.features.find((f: any) => f.properties.elevation === 500);
    expect(tropicalLine).toBeDefined();
    expect(tropicalLine?.properties.lifeZone).toContain('Tropical');
    expect(tropicalLine?.properties.feasibleCrops).toContain('Paddy (Rice)');

    const midHillsLine = contoursData.features.find((f: any) => f.properties.elevation === 1300);
    expect(midHillsLine).toBeDefined();
    expect(midHillsLine?.properties.lifeZone).toContain('Subtropical Mid-Hills');
    expect(midHillsLine?.properties.feasibleCrops).toContain('Arabica Coffee');

    const montaneLine = contoursData.features.find((f: any) => f.properties.elevation === 2100);
    expect(montaneLine).toBeDefined();
    expect(montaneLine?.properties.lifeZone).toContain('Warm Temperate Montane');
    expect(montaneLine?.properties.feasibleCrops).toContain('Large Cardamom');
  });

  it('calculates physical lapse-rate temperatures monotonically decreasing with altitude', () => {
    const elev500 = contoursData.features.find((f: any) => f.properties.elevation === 500);
    const elev1500 = contoursData.features.find((f: any) => f.properties.elevation === 1500);
    const elev2500 = contoursData.features.find((f: any) => f.properties.elevation === 2500);

    expect(elev500?.properties.temperatureC).toBeGreaterThan(elev1500?.properties.temperatureC);
    expect(elev1500?.properties.temperatureC).toBeGreaterThan(elev2500?.properties.temperatureC);
  });
});
