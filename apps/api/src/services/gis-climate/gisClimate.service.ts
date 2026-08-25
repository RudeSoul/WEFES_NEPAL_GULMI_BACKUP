import * as fs from 'fs';
import * as path from 'path';

export class GisClimateService {
  private geojsonDir: string;
  private cache: Map<string, any> = new Map();

  constructor() {
    this.geojsonDir = path.resolve(__dirname, '../../../../web/public/geojson');
  }

  private readJson(filename: string): any {
    if (this.cache.has(filename)) {
      return this.cache.get(filename);
    }
    const filePath = path.join(this.geojsonDir, filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`GeoJSON asset '${filename}' not found at ${filePath}`);
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    this.cache.set(filename, data);
    return data;
  }

  public getGulmiBoundary(): any {
    return this.readJson('gulmi-district.json');
  }

  public getPalikas(): any {
    return this.readJson('gulmi-palikas.json');
  }

  public getClimateMonthly(): any {
    return this.readJson('gulmi-climate-monthly.json');
  }

  public getSoilPoints(): any {
    return this.readJson('gulmi-soil-points.json');
  }
}

export const gisClimateService = new GisClimateService();
