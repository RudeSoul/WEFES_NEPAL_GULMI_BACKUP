import { apiClient } from './apiClient';

export const gisClimateService = {
  getGulmiBoundary: async (): Promise<unknown> => {
    return apiClient.get('/geojson/gulmi-district.json');
  },

  getPalikas: async (): Promise<unknown> => {
    return apiClient.get('/geojson/gulmi-palikas.json');
  },

  getClimateMonthly: async (): Promise<unknown> => {
    return apiClient.get('/geojson/gulmi-climate-monthly.json');
  },

  getSoilPoints: async (): Promise<unknown> => {
    return apiClient.get('/geojson/gulmi-soil-points.json');
  },
};
