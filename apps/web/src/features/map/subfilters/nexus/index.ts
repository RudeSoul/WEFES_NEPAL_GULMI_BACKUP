// [DATA PROVENANCE]
// Classification: SUBFILTER RE-EXPORTS (NEXUS PILLAR)
// Citations: Verified WEFES Nexus Gulmi datasets

import { agroHydrologyWaterBalanceMethodology } from './agroHydrologyWaterBalance';
import { defaultMethodology } from './default';

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const nexusMethodologies: Record<string, RawMethodologyEntry> = {
  agro_hydrology_water_balance: agroHydrologyWaterBalanceMethodology,
  default: defaultMethodology,
};
