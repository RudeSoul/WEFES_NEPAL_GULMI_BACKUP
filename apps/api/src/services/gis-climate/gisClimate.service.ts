import * as fs from 'fs';
import * as path from 'path';

export interface GeoJsonData {
  type?: string;
  features?: unknown[];
  [key: string]: unknown;
}

export interface ClimateMonthlyData {
  years?: Record<string, unknown>;
  [key: string]: unknown;
}

class GisClimateService {
  private geojsonDir: string;
  private cache: Map<string, unknown> = new Map();

  constructor() {
    this.geojsonDir = path.resolve(__dirname, '../../../../web/public/geojson');
  }

  private readJson<T = unknown>(filename: string): T {
    if (this.cache.has(filename)) {
      return this.cache.get(filename) as T;
    }
    const filePath = path.join(this.geojsonDir, filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`GeoJSON asset '${filename}' not found at ${filePath}`);
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
    this.cache.set(filename, data);
    return data;
  }

  public getGulmiBoundary(): GeoJsonData {
    return this.readJson<GeoJsonData>('gulmi-district.json');
  }

  public getPalikas(): GeoJsonData {
    return this.readJson<GeoJsonData>('gulmi-palikas.json');
  }

  public getClimateMonthly(): ClimateMonthlyData {
    return this.readJson<ClimateMonthlyData>('gulmi-climate-monthly.json');
  }

  public getSoilPoints(): GeoJsonData {
    return this.readJson<GeoJsonData>('gulmi-soil-points.json');
  }
}

export const gisClimateService = new GisClimateService();
