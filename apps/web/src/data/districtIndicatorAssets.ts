// [DATA PROVENANCE]
// Data Source: data/calculated/indicators/gulmi_palika_cooking.json, data/calculated/indicators/gulmi_palika_ghi.json, data/calculated/indicators/gulmi_palika_grid.json, data/calculated/indicators/gulmi_palika_landholding.json, data/calculated/indicators/gulmi_palika_soil.json, data/calculated/indicators/gulmi_palika_transit.json, data/calculated/indicators/gulmi_ghi_grid.json, data/real/land_and_soil/gulmi_soil_points_81.json, data/calculated/indicators/gulmi_palika_chirps_precipitation.json
// Classification: CALCULATED EMPIRICAL INDICATORS (Census 2021, NEA, NARC, Global Solar Atlas, CHIRPS v2.0)
// Citations: National Statistics Office (NSO), Nepal Electricity Authority (NEA), NARC Soil Science Division, Global Solar Atlas, Funk et al. (2015)

import ghiGridRaw from '../../../../data/calculated/indicators/gulmi_ghi_grid.json';
import chirpsPrecipRaw from '../../../../data/calculated/indicators/gulmi_palika_chirps_precipitation.json';
import palikaCookingRaw from '../../../../data/calculated/indicators/gulmi_palika_cooking.json';
import palikaGhiRaw from '../../../../data/calculated/indicators/gulmi_palika_ghi.json';
import palikaGridRaw from '../../../../data/calculated/indicators/gulmi_palika_grid.json';
import palikaLandholdingRaw from '../../../../data/calculated/indicators/gulmi_palika_landholding.json';
import palikaSoilRaw from '../../../../data/calculated/indicators/gulmi_palika_soil.json';
import palikaTransitRaw from '../../../../data/calculated/indicators/gulmi_palika_transit.json';
import soilPointsRaw from '../../../../data/real/land_and_soil/gulmi_soil_points_81.json';

export interface PalikaCookingProfile {
  totalHouseholds: number;
  firewood: number;
  firewoodPct: number;
  lpg: number;
  lpgPct: number;
  electricity: number;
  biogas: number;
  cleanCookingPct?: number;
  [key: string]: unknown;
}

export interface PalikaGhiProfile {
  min: number;
  max: number;
  mean: number;
  opta: number;
  count: number;
  meanGhiKwhM2Day?: number;
  minGhi?: number;
  maxGhi?: number;
  pvoutKwhKwp?: number;
  solarClass?: string;
  [key: string]: unknown;
}

export interface PalikaGridProfile {
  electrificationRatePct: number;
  totalConsumers: number;
  substationCount: number;
  nearestSubstation: string;
  substationName?: string;
  reliabilityTier: string;
  substationNepali?: string;
  connectedHydro?: string;
  color?: string;
  hubVoltage?: string;
  capacityMVA?: number;
  tierKey?: string;
  feederDistanceKm?: number;
  lineLossEstimatePct?: number;
  technicalDetails?: string;
  [key: string]: unknown;
}

export interface PalikaLandholdingProfile {
  totalHoldings: number;
  totalAreaHa: number;
  avgHoldingSizeHa: number;
  khetPct: number;
  bariPct: number;
  irrigatedPct: number;
  parcelDensityPerHolding: number;
  avgHoldingRopaniPerHh: number;
  avgHoldingHaPerHh: number;
  totalAgriLandHa: number;
  khetLandHa: number;
  bariLandHa: number;
  khetPercentage?: number;
  bariPercentage?: number;
  avgParcelsPerHolding?: number;
  agriculturalHoldings2021?: number;
  censusHouseholds2021?: number;
  osmBuildingCount?: number;
  [key: string]: unknown;
}

export interface PalikaSoilProfile {
  sampleCount: number;
  nitrogenPct: number;
  nitrogenRating: string;
  phosphorusKgHa: number;
  phosphorusRating: string;
  potassiumKgHa: number;
  potassiumRating: string;
  ph: number;
  phRating: string;
  texture: string;
  [key: string]: unknown;
}

export interface SubstationInfo {
  name: string;
  nepaliName?: string;
  voltage: string;
  ward?: number | string;
  palika?: string;
  capacityMVA: number;
  transmissionCapacityMW?: number;
  connectedHydro?: string;
  budgetNPR?: string;
  contractor?: string;
  status: string;
  coordinates?: [number, number];
  color?: string;
  tierKey?: string;
  tierLabel?: string;
  hubVoltage?: string;
  substationNepali?: string;
  [key: string]: unknown;
}

export const PALIKA_COOKING_DATA = palikaCookingRaw as unknown as {
  district: PalikaCookingProfile;
  palikas: Record<string, PalikaCookingProfile>;
};

export const PALIKA_GHI_DATA = palikaGhiRaw as unknown as {
  palikas: Record<string, PalikaGhiProfile>;
};

export const PALIKA_GRID_DATA = palikaGridRaw as unknown as {
  substations: Record<string, SubstationInfo>;
  palikas: Record<string, PalikaGridProfile>;
};

export const PALIKA_LANDHOLDING_DATA = palikaLandholdingRaw as unknown as {
  palikas: Record<string, PalikaLandholdingProfile>;
};

export const PALIKA_SOIL_DATA = palikaSoilRaw as unknown as {
  palikas: Record<string, PalikaSoilProfile>;
};

export const PALIKA_TRANSIT_DATA = palikaTransitRaw as unknown as {
  palikas: Record<string, Record<string, unknown>>;
};

export const GULMI_GHI_GRID = ghiGridRaw as unknown as {
  rows: number;
  cols: number;
  bounds: [[number, number], [number, number]];
  lat_max: number;
  lat_min: number;
  lon_min: number;
  lon_max: number;
  step: number;
  minVal: number;
  maxVal: number;
  grid: (number | null)[][];
};

export const GULMI_SOIL_POINTS = soilPointsRaw as unknown as Array<{
  lat: number;
  lon: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  soilType: string;
}>;

export interface PalikaChirpsPrecipitationBaseline {
  annual: number;
  monsoon: number;
  dry: number;
}

export const PALIKA_CHIRPS_PRECIPITATION_DATA: Record<string, PalikaChirpsPrecipitationBaseline> =
  (chirpsPrecipRaw as { baseline: Record<string, PalikaChirpsPrecipitationBaseline> }).baseline;

