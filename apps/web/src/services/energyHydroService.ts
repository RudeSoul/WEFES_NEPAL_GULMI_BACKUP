import { apiClient, ApiResponse } from './apiClient';

export const energyHydroService = {
  getHydropower: async (districtId: string = 'gulmi'): Promise<ApiResponse> => {
    return apiClient.get(`/api/v1/energy/hydropower/${districtId}`);
  },

  getSolarProfile: async (districtId: string = 'gulmi'): Promise<ApiResponse> => {
    return apiClient.get(`/api/v1/energy/solar/${districtId}`);
  },

  getHydrology: async (districtId: string = 'gulmi'): Promise<ApiResponse> => {
    return apiClient.get(`/api/v1/energy/hydrology/${districtId}`);
  },
};
