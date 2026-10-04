// [DATA PROVENANCE]
// Classification: SUBFILTER RE-EXPORTS (ENERGY PILLAR)
// Citations: Verified WEFES Nexus Gulmi datasets

import { cleanCookingBiomassMethodology } from './cleanCookingBiomass';
import { gridReachMethodology } from './gridReach';
import { hydroCorridorMethodology } from './hydroCorridor';
import { solarIrradianceMethodology } from './solarIrradiance';

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export { cleanCookingBiomassMethodology, gridReachMethodology, hydroCorridorMethodology, solarIrradianceMethodology };

export const energyMethodologies: Record<string, RawMethodologyEntry> = {
  hydro_corridor: hydroCorridorMethodology,
  solar_irradiance: solarIrradianceMethodology,
  clean_cooking_biomass: cleanCookingBiomassMethodology,
  grid_reach: gridReachMethodology,
};
