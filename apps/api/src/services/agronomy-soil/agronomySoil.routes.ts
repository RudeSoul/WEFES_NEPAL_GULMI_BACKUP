import { Router } from 'express';
import { agronomySoilController } from './agronomySoil.controller';

export const agronomySoilRouter = Router();

// GET /api/v1/agronomy/crops - List all crops
agronomySoilRouter.get('/crops', (req, res, next) => agronomySoilController.getAllCrops(req, res, next));

// GET /api/v1/agronomy/crops/:id - Get crop detail
agronomySoilRouter.get('/crops/:id', (req, res, next) => agronomySoilController.getCropById(req, res, next));

// GET /api/v1/agronomy/suitability/:districtId - Get crop suitability ranking
agronomySoilRouter.get('/suitability/:districtId', (req, res, next) => agronomySoilController.getSuitability(req, res, next));

// GET /api/v1/agronomy/soil/:districtId - Get soil NPK, pH & texture
agronomySoilRouter.get('/soil/:districtId?', (req, res, next) => agronomySoilController.getSoilProfile(req, res, next));
