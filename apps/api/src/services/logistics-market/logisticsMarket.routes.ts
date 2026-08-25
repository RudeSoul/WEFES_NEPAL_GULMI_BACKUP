import { Router } from 'express';
import { logisticsMarketController } from './logisticsMarket.controller';

export const logisticsMarketRouter = Router();

// GET /api/v1/logistics/route - Freight route segments & tariffs for Palika
logisticsMarketRouter.get('/route', (req, res, next) => logisticsMarketController.getPalikaRoute(req, res, next));

// GET /api/v1/logistics/customs-ports - List ICP border customs ports
logisticsMarketRouter.get('/customs-ports', (req, res, next) => logisticsMarketController.getCustomsPorts(req, res, next));

// GET /api/v1/logistics/socioeconomics/:districtId - Socioeconomics, labor rates & wealth index
logisticsMarketRouter.get('/socioeconomics/:districtId?', (req, res, next) => logisticsMarketController.getSocioeconomics(req, res, next));
