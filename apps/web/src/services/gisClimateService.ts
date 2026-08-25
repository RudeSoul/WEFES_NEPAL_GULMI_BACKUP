import { apiClient, ApiResponse } from './apiClient';

export const gisClimateService = {
  getGulmiBoundary: async (): Promise<any> => {
    return apiClient.get('/geojson/gulmi-district.json');
  },

  getPalikas: async (): Promise<any> => {
    return apiClient.get('/geojson/gulmi-palikas.json');
  },

  getClimateMonthly: async (): Promise<any> => {
    return apiClient.get('/geojson/gulmi-climate-monthly.json');
  },

  getSoilPoints: async (): Promise<any> => {
    return apiClient.get('/geojson/gulmi-soil-points.json');
  },
};
