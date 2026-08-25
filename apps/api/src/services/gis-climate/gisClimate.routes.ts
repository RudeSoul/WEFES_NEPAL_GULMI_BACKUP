import { Router } from 'express';
import { gisClimateController } from './gisClimate.controller';

export const gisClimateRouter = Router();

// GET /api/v1/gis/gulmi-boundary - Gulmi District boundary polygon GeoJSON
gisClimateRouter.get('/gulmi-boundary', (req, res, next) => gisClimateController.getGulmiBoundary(req, res, next));

// GET /api/v1/gis/palikas - 12 Gulmi Palikas GeoJSON polygons
gisClimateRouter.get('/palikas', (req, res, next) => gisClimateController.getPalikas(req, res, next));

// GET /api/v1/gis/climate-monthly - 39-year monthly climate series
gisClimateRouter.get('/climate-monthly', (req, res, next) => gisClimateController.getClimateMonthly(req, res, next));

// GET /api/v1/gis/soil-points - 81 field soil point coordinates
gisClimateRouter.get('/soil-points', (req, res, next) => gisClimateController.getSoilPoints(req, res, next));
