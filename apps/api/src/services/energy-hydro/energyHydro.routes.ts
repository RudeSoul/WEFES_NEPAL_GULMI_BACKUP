import { Router } from 'express';
import { energyHydroController } from './energyHydro.controller';

export const energyHydroRouter = Router();

// GET /api/v1/energy/hydropower/:districtId - Hydropower generation capacity & plants
energyHydroRouter.get('/hydropower/:districtId?', (req, res, next) => energyHydroController.getHydropower(req, res, next));

// GET /api/v1/energy/solar/:districtId - Solar irradiance time series
energyHydroRouter.get('/solar/:districtId?', (req, res, next) => energyHydroController.getSolarProfile(req, res, next));

// GET /api/v1/energy/hydrology/:districtId - River gauging stations & lakes
energyHydroRouter.get('/hydrology/:districtId?', (req, res, next) => energyHydroController.getHydrology(req, res, next));
