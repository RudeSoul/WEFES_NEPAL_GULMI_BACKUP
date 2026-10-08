import * as fs from 'fs';
import { fromArrayBuffer } from 'geotiff';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

describe('Track B: Dynamic GeoTIFF Zonal Statistics & Parser', () => {
  const tiffPath = path.resolve(__dirname, '../../public/tiles/average_annual_precipitation.tif');
  const palikasPath = path.resolve(__dirname, '../../public/geojson/gulmi-palikas.json');

  it('verifies that GeoTIFF array buffer can be parsed and min/max/mean extracted dynamically', async () => {
    const buf = fs.readFileSync(tiffPath);
    const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

    const tiff = await fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();
    expect(image.getWidth()).toBe(15);
    expect(image.getHeight()).toBe(10);

    const [data] = await image.readRasters();
    const valid: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const v = Number(data[i]);
      if (v >= 0 && v < 9000 && !isNaN(v)) {
        valid.push(v);
      }
    }

    expect(valid.length).toBeGreaterThan(0);
    const min = Math.min(...valid);
    const max = Math.max(...valid);
    const mean = valid.reduce((a, b) => a + b, 0) / valid.length;

    // Verify against actual CHIRPS v2.0 ground truth
    expect(min).toBeGreaterThan(1200);
    expect(max).toBeLessThan(2100);
    expect(mean).toBeGreaterThan(1500);
    expect(mean).toBeLessThan(1700);
  });

  it('verifies that point-in-polygon zonal statistics extract valid Palika averages', async () => {
    const palikas = JSON.parse(fs.readFileSync(palikasPath, 'utf8'));
    expect(palikas.features.length).toBe(12);

    const buf = fs.readFileSync(tiffPath);
    const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const tiff = await fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();
    const [data] = await image.readRasters();
    const width = image.getWidth();
    const height = image.getHeight();
    const [minX, minY, maxX, maxY] = image.getBoundingBox();

    function pointInPolygon(point: [number, number], vs: number[][]): boolean {
      const x = point[0];
      const y = point[1];
      let inside = false;
      for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0];
        const yi = vs[i][1];
        const xj = vs[j][0];
        const yj = vs[j][1];
        const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    }

    const resungaFeature = (
      palikas.features as Array<{ properties: { name: string }; geometry: { coordinates: number[][][] } }>
    ).find((f) => f.properties.name.toLowerCase() === 'resunga');

    const resungaVals: number[] = [];
    for (let r = 0; r < height; r++) {
      const lat = maxY - ((r + 0.5) / height) * (maxY - minY);
      for (let c = 0; c < width; c++) {
        const val = Number(data[r * width + c]);
        if (val < 0 || val > 9000 || isNaN(val)) continue;
        const pt: [number, number] = [minX + ((c + 0.5) / width) * (maxX - minX), lat];
        if (pointInPolygon(pt, resungaFeature.geometry.coordinates[0])) {
          resungaVals.push(val);
        }
      }
    }

    expect(resungaVals.length).toBeGreaterThan(0);
    const resungaMean = resungaVals.reduce((a, b) => a + b, 0) / resungaVals.length;
    // Resunga is an orographic ridge peak (~1,814 mm)
    expect(resungaMean).toBeGreaterThan(1750);
    expect(resungaMean).toBeLessThan(1900);
  });
});
