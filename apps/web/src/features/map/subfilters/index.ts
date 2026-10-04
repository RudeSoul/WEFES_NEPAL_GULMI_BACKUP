// [DATA PROVENANCE]
// Classification: COMPONENT-LEVEL SUBFILTER METHODOLOGY REGISTRY
// Citations: DHM, MoALD, NARC, ICIMOD, DOED, NEA, CBS, NASA POWER, Survey Department Nepal

import { ecosystemMethodologies } from './ecosystem';
import { energyMethodologies } from './energy';
import { foodMethodologies } from './food';
import { nexusMethodologies } from './nexus';
import { socioeconomicsMethodologies } from './socioeconomics';
import { waterMethodologies } from './water';

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const SUBFILTER_METHODOLOGIES: Record<string, RawMethodologyEntry> = {
  ...waterMethodologies,
  ...foodMethodologies,
  ...energyMethodologies,
  ...ecosystemMethodologies,
  ...socioeconomicsMethodologies,
  ...nexusMethodologies,
};
