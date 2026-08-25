import { Router } from 'express';
import { nexusEngineController } from './nexusEngine.controller';

export const nexusEngineRouter = Router();

// POST /api/v1/nexus/calculate - Run 5-Pillar WEFES Nexus Calculation
nexusEngineRouter.post('/calculate', (req, res, next) => nexusEngineController.calculateHarvest(req, res, next));

// POST /api/v1/nexus/simulate - Run Policy / Climate Scenario Simulation
nexusEngineRouter.post('/simulate', (req, res, next) => nexusEngineController.simulateScenario(req, res, next));

// POST /api/v1/nexus/fertilizer - Compute QUEFTS site-specific nutrient and logistics impact
nexusEngineRouter.post('/fertilizer', (req, res, next) => nexusEngineController.calculateFertilizer(req, res, next));
