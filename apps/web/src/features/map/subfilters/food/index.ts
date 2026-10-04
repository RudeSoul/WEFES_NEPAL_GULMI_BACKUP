// [DATA PROVENANCE]
// Classification: SUBFILTER RE-EXPORTS (FOOD PILLAR)
// Citations: Verified WEFES Nexus Gulmi datasets

import { allCropsMethodology } from './allCrops';
import { cerealIndexMethodology } from './cerealIndex';
import { cropWaterStressMethodology } from './cropWaterStress';
import { landTypologyMethodology } from './landTypology';
import { singleCropMethodology } from './singleCrop';

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const foodMethodologies: Record<string, RawMethodologyEntry> = {
  single_crop: singleCropMethodology,
  crop_water_stress: cropWaterStressMethodology,
  land_typology: landTypologyMethodology,
  all_crops: allCropsMethodology,
  cereal_index: cerealIndexMethodology,
};
