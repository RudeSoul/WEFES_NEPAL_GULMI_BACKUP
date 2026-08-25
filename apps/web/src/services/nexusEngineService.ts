import { apiClient, ApiResponse } from './apiClient';
import { WEFESOutput, ScenarioParameters, CropUnit } from '@wefes/shared-types';

export interface CalculateHarvestPayload {
  districtId: string;
  cropId: string;
  quantity: number;
  unit: CropUnit;
  palikaId?: string;
  palikaName?: string;
  cultivationAreaHa?: number;
  irrigationSource?: string;
  energySource?: string;
  fertilizerRegime?: string;
  marketDestination?: string;
  transportMode?: string;
}

export const nexusEngineService = {
  calculateHarvest: async (payload: CalculateHarvestPayload): Promise<ApiResponse<WEFESOutput>> => {
    return apiClient.post('/api/v1/nexus/calculate', payload);
  },

  simulateScenario: async (baselineOutput: WEFESOutput, parameters: ScenarioParameters): Promise<ApiResponse<WEFESOutput>> => {
    return apiClient.post('/api/v1/nexus/simulate', { baselineOutput, parameters });
  },

  calculateFertilizer: async (districtId: string, cropId: string, harvestQuantityKg: number, palikaName?: string): Promise<ApiResponse> => {
    return apiClient.post('/api/v1/nexus/fertilizer', { districtId, cropId, harvestQuantityKg, palikaName });
  },
};
