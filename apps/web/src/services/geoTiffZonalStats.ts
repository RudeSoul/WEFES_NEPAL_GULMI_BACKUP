/**
 * Dynamic GeoTIFF Zonal Statistics Extractor
 *
 * Directly decodes GeoTIFF rasters in JavaScript/TypeScript using 'geotiff',
 * computes overall raster statistics (min, max, mean), and performs point-in-polygon
 * zonal statistics across Palika administrative boundaries on-the-fly.
 */

import type { Feature, FeatureCollection, GeoJsonObject, Geometry } from 'geojson';
import { fromArrayBuffer } from 'geotiff';

export interface PalikaZonalStat {
  mean: number;
  min: number;
  max: number;
  pixelCount: number;
}

export interface GeoTiffRasterStats {
  url: string;
  width: number;
  height: number;
  bbox: [number, number, number, number]; // [minX, minY, maxX, maxY]
  overallMin: number;
  overallMax: number;
  overallMean: number;
  palikaStats: Record<string, PalikaZonalStat>;
}

// In-memory cache for computed stats by URL
const statsCache = new Map<string, GeoTiffRasterStats>();

/**
 * Standard ray-casting algorithm to test whether a coordinate [lng, lat] is inside a polygon ring
 */
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

/**
 * Check if a coordinate [lng, lat] is inside a GeoJSON Feature geometry
 */
function pointInFeature(point: [number, number], feature: Feature | { geometry?: Geometry }): boolean {
  const geom = feature?.geometry;
  if (!geom) return false;

  if (geom.type === 'Polygon') {
    return pointInPolygon(point, geom.coordinates[0]);
  } else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates) {
      if (pointInPolygon(point, poly[0])) return true;
    }
  }
  return false;
}

/**
 * Normalizes palika names to alphanumeric lowercase for lookup
 */
function normalizeKey(name?: string | null): string {
  return (name || '').toLowerCase().replace(/[^a-z]/g, '');
}

/**
 * Extracts raster min, max, mean and per-Palika zonal statistics dynamically from a GeoTIFF.
 *
 * @param tifUrl URL path to the GeoTIFF file (e.g., '/tiles/average_annual_precipitation.tif')
 * @param palikasGeoJson GeoJSON FeatureCollection containing Palika polygons
 */
export async function getGeoTiffZonalStats(
  tifUrl: string,
  palikasGeoJson?: FeatureCollection | GeoJsonObject | null
): Promise<GeoTiffRasterStats> {
  const cached = statsCache.get(tifUrl);
  if (cached) return cached;

  const response = await fetch(tifUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch GeoTIFF at ${tifUrl}: status ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const tiff = await fromArrayBuffer(arrayBuffer);
  const image = await tiff.getImage();
  const width = image.getWidth();
  const height = image.getHeight();
  const [data] = await image.readRasters();
  const bbox = image.getBoundingBox() as [number, number, number, number]; // [minX, minY, maxX, maxY]
  const [minX, minY, maxX, maxY] = bbox;

  const validValues: number[] = [];
  const palikaBuckets: Record<string, number[]> = {};

  const features = (
    palikasGeoJson && 'features' in palikasGeoJson && Array.isArray(palikasGeoJson.features)
      ? palikasGeoJson.features
      : []
  ) as Array<Feature<Geometry, { name?: string; GaPa_Na?: string }>>;
  for (const f of features) {
    const key = normalizeKey(f.properties?.name || f.properties?.GaPa_Na);
    if (key) {
      palikaBuckets[key] = [];
    }
  }

  // Iterate over each raster pixel center
  for (let r = 0; r < height; r++) {
    const lat = maxY - ((r + 0.5) / height) * (maxY - minY);
    for (let c = 0; c < width; c++) {
      const val = Number(data[r * width + c]);
      // Filter out invalid/nodata values
      if (val < 0 || val > 9000 || isNaN(val)) continue;

      validValues.push(val);

      if (features.length > 0) {
        const pt: [number, number] = [minX + ((c + 0.5) / width) * (maxX - minX), lat];
        for (const f of features) {
          const key = normalizeKey(f.properties?.name || f.properties?.GaPa_Na);
          if (key && pointInFeature(pt, f)) {
            palikaBuckets[key].push(val);
          }
        }
      }
    }
  }

  const overallMin = validValues.length > 0 ? Math.min(...validValues) : 0;
  const overallMax = validValues.length > 0 ? Math.max(...validValues) : 0;
  const overallMean = validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / validValues.length : 0;

  const palikaStats: Record<string, PalikaZonalStat> = {};
  for (const [key, vals] of Object.entries(palikaBuckets)) {
    if (vals.length > 0) {
      const sum = vals.reduce((a, b) => a + b, 0);
      palikaStats[key] = {
        mean: Math.round(sum / vals.length),
        min: Math.round(Math.min(...vals)),
        max: Math.round(Math.max(...vals)),
        pixelCount: vals.length,
      };
    } else {
      // Fallback to overall mean if no pixel center fell squarely inside polygon
      palikaStats[key] = {
        mean: Math.round(overallMean),
        min: Math.round(overallMin),
        max: Math.round(overallMax),
        pixelCount: 0,
      };
    }
  }

  const result: GeoTiffRasterStats = {
    url: tifUrl,
    width,
    height,
    bbox,
    overallMin: Math.round(overallMin),
    overallMax: Math.round(overallMax),
    overallMean: Math.round(overallMean),
    palikaStats,
  };

  statsCache.set(tifUrl, result);
  return result;
}
