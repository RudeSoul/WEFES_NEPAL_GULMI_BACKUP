import { Request, Response, NextFunction } from 'express';
import { logisticsMarketService } from './logisticsMarket.service';

export class LogisticsMarketController {
  public getPalikaRoute(req: Request, res: Response, next: NextFunction) {
    try {
      const districtId = (req.query.districtId as string) || 'gulmi';
      const palikaName = req.query.palikaName as string | undefined;
      const route = logisticsMarketService.getPalikaRoute(districtId, palikaName);
      res.json({ success: true, data: route });
    } catch (error) {
      next(error);
    }
  }

  public getCustomsPorts(req: Request, res: Response, next: NextFunction) {
    try {
      const ports = logisticsMarketService.getCustomsPorts();
      res.json({ success: true, count: ports.length, data: ports });
    } catch (error) {
      next(error);
    }
  }

  public getSocioeconomics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = logisticsMarketService.getSocioeconomicProfile(req.params.districtId || 'gulmi');
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export const logisticsMarketController = new LogisticsMarketController();
