// [DATA PROVENANCE]
// Classification: SUBFILTER RE-EXPORTS (WATER PILLAR)
// Citations: Verified WEFES Nexus Gulmi datasets

import { annualPrecipitationMethodology } from './annualPrecipitation';
import { catchmentsMethodology } from './catchments';
import { dhmStationMethodology } from './dhmStation';
import { drySeasonPrecipitationMethodology } from './drySeasonPrecipitation';
import { flowAccumulationMethodology } from './flowAccumulation';
import { flowDirectionMethodology } from './flowDirection';
import { irrigationPotentialMethodology } from './irrigationPotential';
import { merraRainfallMethodology } from './merraRainfall';
import { monsoonPrecipitationMethodology } from './monsoonPrecipitation';
import { riverBasinsMethodology } from './riverBasins';
import { riversStreamsMethodology } from './riversStreams';
import { springshedVulnerabilityMethodology } from './springshedVulnerability';

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const waterMethodologies: Record<string, RawMethodologyEntry> = {
  merra_rainfall: merraRainfallMethodology,
  annual_precipitation: annualPrecipitationMethodology,
  monsoon_precipitation: monsoonPrecipitationMethodology,
  dry_season_precipitation: drySeasonPrecipitationMethodology,
  river_basins: riverBasinsMethodology,
  catchments: catchmentsMethodology,
  rivers_streams: riversStreamsMethodology,
  flow_accumulation: flowAccumulationMethodology,
  flow_direction: flowDirectionMethodology,
  springshed_vulnerability: springshedVulnerabilityMethodology,
  irrigation_potential: irrigationPotentialMethodology,
  dhm_station: dhmStationMethodology,
};
