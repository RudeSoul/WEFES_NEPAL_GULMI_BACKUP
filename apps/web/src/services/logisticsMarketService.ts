import { apiClient, ApiResponse } from './apiClient';

export const logisticsMarketService = {
  getRoute: async (districtId: string = 'gulmi', palikaName?: string): Promise<ApiResponse> => {
    return apiClient.get('/api/v1/logistics/route', { districtId, palikaName });
  },

  getCustomsPorts: async (): Promise<ApiResponse> => {
    return apiClient.get('/api/v1/logistics/customs-ports');
  },

  getSocioeconomics: async (districtId: string = 'gulmi'): Promise<ApiResponse> => {
    return apiClient.get(`/api/v1/logistics/socioeconomics/${districtId}`);
  },
};
