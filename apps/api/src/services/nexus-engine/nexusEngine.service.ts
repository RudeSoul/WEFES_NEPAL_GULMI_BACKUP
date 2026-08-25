import { db } from '@wefes/database';
import { calculateHarvestImpact, simulateScenario, calculateFertilizerNexusImpact } from '@wefes/wefes-engine';
import { WEFESOutput, ScenarioParameters, CropUnit } from '@wefes/shared-types';

export interface CalculateHarvestImpactInput {
  districtId: string;
  cropId: string;
  quantity: number;
  unit: CropUnit;
  palikaId?: string;
  palikaName?: string;
  cultivationAreaHa?: number;
  irrigationSource?: 'gravity_canal' | 'groundwater_electric' | 'groundwater_diesel' | 'solar_pv_drip' | 'rainfed';
  energySource?: 'grid_clean' | 'diesel_generator' | 'solar_offgrid' | 'micro_hydro';
  fertilizerRegime?: 'subsidized_chemical' | 'integrated_ipns' | 'organic_compost_manure' | 'zero_input';
  marketDestination?: 'local_subsistence' | 'butwal_regional_wholesale' | 'international_export';
  transportMode?: 'tractor_trailer' | 'light_mini_truck' | 'heavy_diesel_truck' | 'gravity_ropeway';
}

export class NexusEngineService {
  public calculateHarvest(input: CalculateHarvestImpactInput): WEFESOutput {
    const district = db.getDistrictById(input.districtId) || db.getDistrictById('gulmi');
    if (!district) {
      throw new Error(`District '${input.districtId}' not found in database`);
    }

    const crop = db.getCropById(input.cropId);
    if (!crop) {
      throw new Error(`Crop '${input.cropId}' not found in database`);
    }

    return calculateHarvestImpact(
      district,
      crop,
      input.quantity,
      input.unit,
      input.palikaId,
      input.palikaName,
      input.cultivationAreaHa,
      input.irrigationSource,
      input.energySource,
      input.fertilizerRegime,
      input.marketDestination,
      input.transportMode
    );
  }

  public simulate(baselineOutput: WEFESOutput, params: ScenarioParameters): WEFESOutput {
    return simulateScenario(baselineOutput, params);
  }

  public calculateFertilizerImpact(districtId: string, cropId: string, harvestQuantityKg: number, palikaName?: string) {
    const district = db.getDistrictById(districtId) || db.getDistrictById('gulmi');
    if (!district) throw new Error(`District '${districtId}' not found`);
    const crop = db.getCropById(cropId);
    if (!crop) throw new Error(`Crop '${cropId}' not found`);

    return calculateFertilizerNexusImpact({
      district,
      crop,
      harvestQuantityKg,
      palikaName,
    });
  }
}

export const nexusEngineService = new NexusEngineService();
