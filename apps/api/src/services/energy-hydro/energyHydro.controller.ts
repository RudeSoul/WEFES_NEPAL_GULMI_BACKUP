import { Request, Response, NextFunction } from 'express';
import { energyHydroService } from './energyHydro.service';

export class EnergyHydroController {
  public getHydropower(req: Request, res: Response, next: NextFunction) {
    try {
      const data = energyHydroService.getHydropowerProfile(req.params.districtId || 'gulmi');
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public getSolarProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = energyHydroService.getSolarProfile(req.params.districtId || 'gulmi');
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public getHydrology(req: Request, res: Response, next: NextFunction) {
    try {
      const data = energyHydroService.getHydrologyStations(req.params.districtId || 'gulmi');
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export const energyHydroController = new EnergyHydroController();
