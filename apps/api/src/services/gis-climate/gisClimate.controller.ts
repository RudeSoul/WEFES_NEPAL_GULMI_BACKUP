import { Request, Response, NextFunction } from 'express';
import { gisClimateService } from './gisClimate.service';

export class GisClimateController {
  public getGulmiBoundary(req: Request, res: Response, next: NextFunction) {
    try {
      const data = gisClimateService.getGulmiBoundary();
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  public getPalikas(req: Request, res: Response, next: NextFunction) {
    try {
      const data = gisClimateService.getPalikas();
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  public getClimateMonthly(req: Request, res: Response, next: NextFunction) {
    try {
      const data = gisClimateService.getClimateMonthly();
      res.json({
        success: true,
        district: 'Gulmi',
        seriesLengthYears: Object.keys(data.years || {}).length,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  public getSoilPoints(req: Request, res: Response, next: NextFunction) {
    try {
      const data = gisClimateService.getSoilPoints();
      res.json({
        success: true,
        district: 'Gulmi',
        sampleCount: data.features?.length || 0,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const gisClimateController = new GisClimateController();
