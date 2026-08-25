import { apiClient, ApiResponse } from './apiClient';
import { Crop } from '@wefes/shared-types';

export const agronomySoilService = {
  getAllCrops: async (): Promise<ApiResponse<Crop[]>> => {
    return apiClient.get('/api/v1/agronomy/crops');
  },

  getCropById: async (id: string): Promise<ApiResponse<Crop>> => {
    return apiClient.get(`/api/v1/agronomy/crops/${id}`);
  },

  getSuitability: async (districtId: string = 'gulmi'): Promise<ApiResponse> => {
    return apiClient.get(`/api/v1/agronomy/suitability/${districtId}`);
  },

  getSoilProfile: async (districtId: string = 'gulmi'): Promise<ApiResponse> => {
    return apiClient.get(`/api/v1/agronomy/soil/${districtId}`);
  },
};
