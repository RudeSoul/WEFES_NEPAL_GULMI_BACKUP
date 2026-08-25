import { Request, Response, NextFunction } from 'express';
import { nexusEngineService } from './nexusEngine.service';

export class NexusEngineController {
  public calculateHarvest(req: Request, res: Response, next: NextFunction) {
    try {
      const output = nexusEngineService.calculateHarvest(req.body);
      res.json({
        success: true,
        data: output,
      });
    } catch (error) {
      next(error);
    }
  }

  public simulateScenario(req: Request, res: Response, next: NextFunction) {
    try {
      const { baselineOutput, parameters } = req.body;
      if (!baselineOutput || !parameters) {
        return res.status(400).json({
          success: false,
          error: 'Missing required baselineOutput or parameters in request body',
        });
      }
      const simulated = nexusEngineService.simulate(baselineOutput, parameters);
      res.json({
        success: true,
        data: simulated,
      });
    } catch (error) {
      next(error);
    }
  }

  public calculateFertilizer(req: Request, res: Response, next: NextFunction) {
    try {
      const { districtId, cropId, harvestQuantityKg, palikaName } = req.body;
      const result = nexusEngineService.calculateFertilizerImpact(
        districtId || 'gulmi',
        cropId,
        harvestQuantityKg || 1000,
        palikaName
      );
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const nexusEngineController = new NexusEngineController();
