import { Request, Response, NextFunction } from 'express';
import { agronomySoilService } from './agronomySoil.service';

export class AgronomySoilController {
  public getAllCrops(req: Request, res: Response, next: NextFunction) {
    try {
      const crops = agronomySoilService.getAllCrops();
      res.json({
        success: true,
        count: crops.length,
        data: crops,
      });
    } catch (error) {
      next(error);
    }
  }

  public getCropById(req: Request, res: Response, next: NextFunction) {
    try {
      const crop = agronomySoilService.getCropById(req.params.id);
      if (!crop) {
        return res.status(404).json({ success: false, error: `Crop '${req.params.id}' not found` });
      }
      res.json({ success: true, data: crop });
    } catch (error) {
      next(error);
    }
  }

  public getSuitability(req: Request, res: Response, next: NextFunction) {
    try {
      const districtId = req.params.districtId || 'gulmi';
      const suitability = agronomySoilService.getDistrictSuitability(districtId);
      res.json({
        success: true,
        districtId,
        count: suitability.length,
        data: suitability,
      });
    } catch (error) {
      next(error);
    }
  }

  public getSoilProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const soil = agronomySoilService.getSoilProfile(req.params.districtId || 'gulmi');
      res.json({
        success: true,
        data: soil,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const agronomySoilController = new AgronomySoilController();
