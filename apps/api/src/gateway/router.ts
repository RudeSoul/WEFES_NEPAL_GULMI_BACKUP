import { Router } from 'express';
import { gisClimateRouter } from '../services/gis-climate/gisClimate.routes';
import { nexusEngineRouter } from '../services/nexus-engine/nexusEngine.routes';
import { agronomySoilRouter } from '../services/agronomy-soil/agronomySoil.routes';
import { energyHydroRouter } from '../services/energy-hydro/energyHydro.routes';
import { logisticsMarketRouter } from '../services/logistics-market/logisticsMarket.routes';
import { districtRouter } from '../routes/districts';
import { cropRouter } from '../routes/crops';
import { nexusRouter } from '../routes/nexus';

export const gatewayRouter = Router();

// ─── Domain Microservice Routes ───
gatewayRouter.use('/gis', gisClimateRouter);
gatewayRouter.use('/nexus', nexusEngineRouter);
gatewayRouter.use('/agronomy', agronomySoilRouter);
gatewayRouter.use('/energy', energyHydroRouter);
gatewayRouter.use('/logistics', logisticsMarketRouter);

// ─── Backward-Compatibility Aliases ───
gatewayRouter.use('/districts', districtRouter);
gatewayRouter.use('/crops', cropRouter);
gatewayRouter.use('/legacy-nexus', nexusRouter);
