// [DATA PROVENANCE]
// Classification: SUBFILTER RE-EXPORTS (ECOSYSTEM PILLAR)
// Citations: Verified WEFES Nexus Gulmi datasets

import { agroforestryBeltMethodology } from './agroforestryBelt';
import { elevationZonesMethodology } from './elevationZones';
import { soilNitrogenMethodology } from './soilNitrogen';
import { soilOmMethodology } from './soilOm';
import { soilPhMethodology } from './soilPh';
import { soilPhosphorusMethodology } from './soilPhosphorus';
import { soilPotassiumMethodology } from './soilPotassium';

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const ecosystemMethodologies: Record<string, RawMethodologyEntry> = {
  soil_ph: soilPhMethodology,
  soil_om: soilOmMethodology,
  soil_nitrogen: soilNitrogenMethodology,
  soil_phosphorus: soilPhosphorusMethodology,
  soil_potassium: soilPotassiumMethodology,
  elevation_zones: elevationZonesMethodology,
  agroforestry_belt: agroforestryBeltMethodology,
};
