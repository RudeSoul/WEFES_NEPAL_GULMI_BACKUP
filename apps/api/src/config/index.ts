export const config = {
  port: Number(process.env.PORT || 3001),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  apiPrefix: '/api/v1',
  serviceName: 'WEFES Nexus Gulmi Gateway',
};
