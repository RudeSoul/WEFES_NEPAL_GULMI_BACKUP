// [DATA PROVENANCE]
// Classification: SUBFILTER RE-EXPORTS (SOCIOECONOMICS PILLAR)
// Citations: Verified WEFES Nexus Gulmi datasets

import { agriLandholdingMethodology } from './agriLandholding';
import { localGovernanceMethodology } from './localGovernance';

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const socioeconomicsMethodologies: Record<string, RawMethodologyEntry> = {
  local_governance: localGovernanceMethodology,
  agri_landholding: agriLandholdingMethodology,
};
