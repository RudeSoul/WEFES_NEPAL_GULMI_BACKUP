import express from 'express';
import cors from 'cors';
import { config } from './config';
import { requestLogger } from './gateway/middleware/requestLogger';
import { errorHandler } from './gateway/middleware/errorHandler';
import { gatewayRouter } from './gateway/router';

const app = express();

// Global Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(requestLogger);

// Health Check & Service Discovery
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: config.serviceName,
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    domains: [
      { name: 'GIS & Climate', path: '/api/v1/gis' },
      { name: 'WEFES Nexus Engine', path: '/api/v1/nexus' },
      { name: 'Agronomy & Soil', path: '/api/v1/agronomy' },
      { name: 'Energy & Hydrology', path: '/api/v1/energy' },
      { name: 'Logistics & Market', path: '/api/v1/logistics' },
    ],
  });
});

// Master Gateway API Router
app.use(config.apiPrefix, gatewayRouter);

// 404 Fallback Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    error: `Route '${req.originalUrl}' not found on ${config.serviceName}`,
    availableEndpoints: `${config.apiPrefix} (gis, nexus, agronomy, energy, logistics)`,
    timestamp: new Date().toISOString(),
  });
});

// Centralized Error Handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🚀 ${config.serviceName} running at http://localhost:${config.port}${config.apiPrefix}`);
  console.log(`📡 Health check active at http://localhost:${config.port}/health`);
});
