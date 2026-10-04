// [DATA PROVENANCE]
// Data Source: data/calculated/indicators/gulmi_palika_cooking.json, data/calculated/indicators/gulmi_palika_ghi.json, data/calculated/indicators/gulmi_palika_grid.json, data/calculated/indicators/gulmi_palika_landholding.json, data/calculated/indicators/gulmi_palika_soil.json, data/calculated/indicators/gulmi_palika_transit.json, data/calculated/indicators/gulmi_ghi_grid.json, data/real/land_and_soil/gulmi_soil_data.nc, data/real/land_and_soil/gulmi_soil_points_81.json, data/calculated/indicators/gulmi_palika_chirps_precipitation.json, data/calculated/indicators/gulmi_palika_agro_hydrology.json
// Classification: CALCULATED EMPIRICAL INDICATORS (Census 2021, NEA, NARC, Global Solar Atlas, CHIRPS v2.0, FAO-56 Penman-Monteith)
// Citations: National Statistics Office (NSO), Nepal Electricity Authority (NEA), NARC Soil Science Division, Global Solar Atlas, Funk et al. (2015), Allen et al. (1998)

import ghiGridRaw from '@data/calculated/indicators/gulmi_ghi_grid.json';
import agroHydrologyRaw from '@data/calculated/indicators/gulmi_palika_agro_hydrology.json';
import chirpsPrecipRaw from '@data/calculated/indicators/gulmi_palika_chirps_precipitation.json';
import palikaCookingRaw from '@data/calculated/indicators/gulmi_palika_cooking.json';
import palikaGhiRaw from '@data/calculated/indicators/gulmi_palika_ghi.json';
import palikaGridRaw from '@data/calculated/indicators/gulmi_palika_grid.json';
import palikaLandholdingRaw from '@data/calculated/indicators/gulmi_palika_landholding.json';
import palikaSoilRaw from '@data/calculated/indicators/gulmi_palika_soil.json';
import palikaTransitRaw from '@data/calculated/indicators/gulmi_palika_transit.json';

import { fetchDataset } from '../services/dataClient';

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
  arableLandHa?: number;
  temporaryCropsLandHa?: number;
  permanentCropsLandHa?: number;
  [key: string]: unknown;
}

export interface PalikaSoilProfile {
  sampleCount: number;
  nitrogenPct: number;
  nitrogenRating: string;
  nitrogenMin?: number;
  nitrogenMax?: number;
  phosphorusKgHa: number;
  phosphorusRating: string;
  phosphorusMin?: number;
  phosphorusMax?: number;
  potassiumKgHa: number;
  potassiumRating: string;
  potassiumMin?: number;
  potassiumMax?: number;
  ph: number;
  phRating: string;
  phMin?: number;
  phMax?: number;
  phStd?: number;
  organicMatterPct?: number;
  organicMatterRating?: string;
  clayPct?: number;
  siltPct?: number;
  sandPct?: number;
  texture: string;
  awc?: number;
  zincPpm?: number;
  boronPpm?: number;
  dominantSoilCode?: string;
  dominantSoil?: string;
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

const PALIKA_TRANSIT_DATA = palikaTransitRaw as unknown as {
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

export interface MonthAgroHydrology {
  month_num: number;
  month_en: string;
  month_np: string;
  agro_season: string;
  crop_kc: number;
  precip_wmo_normal_mm: number;
  precip_std_mm: number;
  precip_p10_mm: number;
  precip_p25_mm: number;
  precip_p50_mm: number;
  precip_p75_mm: number;
  precip_p90_mm: number;
  effective_precip_mm: number;
  tmean_c: number;
  tmax_c: number;
  tmin_c: number;
  et0_reference_mm: number;
  etc_crop_demand_mm: number;
  climatic_water_balance_mm: number;
  soil_storage_start_mm: number;
  soil_storage_end_mm: number;
  soil_depletion_fraction: number;
  soil_depletion_pct: number;
  net_irrigation_req_mm: number;
  unretained_rainfall_mm?: number;
  surplus_drainage_mm: number;
  stress_level: 'adequate_hydration' | 'depletion_watch' | 'moderate_stress' | 'critical_deficit';
  advisory: string;
}

export interface PalikaAgroHydrologyProfile {
  palika_name: string;
  palika_nepali: string;
  elevation_m: number;
  soil_lithology: string;
  awc_volumetric: number;
  awc_uncertainty: number;
  root_zone_depth_m: number;
  taw_mm: number;
  raw_mm: number;
  annual_summary: {
    precipitation_wmo_normal_mm: number;
    effective_precipitation_mm: number;
    et0_reference_mm: number;
    etc_crop_demand_mm: number;
    net_irrigation_requirement_mm: number;
    unretained_rainfall_mm?: number;
    monsoon_surplus_drainage_mm: number;
    deep_percolation_mm?: number;
    irrigation_deficit_months: number;
    adequate_moisture_months: number;
    critical_stress_window: string;
    peak_deficit_window?: string;
    monsoon_recharge_window: string;
  };
  months: MonthAgroHydrology[];
}

export interface AgroHydrologyDataset {
  _metadata: Record<string, unknown>;
  palikas: Record<string, PalikaAgroHydrologyProfile>;
}

export interface PalikaChirpsPrecipitationBaseline {
  annual: number;
  monsoon: number;
  dry: number;
}

export const PALIKA_CHIRPS_PRECIPITATION_DATA: Record<string, PalikaChirpsPrecipitationBaseline> =
  (chirpsPrecipRaw as { baseline: Record<string, PalikaChirpsPrecipitationBaseline> }).baseline;

export const PALIKA_AGRO_HYDROLOGY_DATA = agroHydrologyRaw as unknown as AgroHydrologyDataset;

/**
 * Rehydrates indicator datasets from remote storage when VITE_DATA_BASE_URL is configured.
 * Seamlessly merges remote data over the local baseline without breaking synchronous access.
 */
export async function initializeRemoteIndicatorData(): Promise<void> {
  const dataBaseUrl = (import.meta.env?.VITE_DATA_BASE_URL as string) || '';
  if (!dataBaseUrl) return;

  try {
    const [cooking, ghi, grid, landholding, soil, transit, chirps, agro] = await Promise.all([
      fetchDataset<typeof PALIKA_COOKING_DATA>('gulmi_palika_cooking.json').catch(() => null),
      fetchDataset<typeof PALIKA_GHI_DATA>('gulmi_palika_ghi.json').catch(() => null),
      fetchDataset<typeof PALIKA_GRID_DATA>('gulmi_palika_grid.json').catch(() => null),
      fetchDataset<typeof PALIKA_LANDHOLDING_DATA>('gulmi_palika_landholding.json').catch(() => null),
      fetchDataset<typeof PALIKA_SOIL_DATA>('gulmi_palika_soil.json').catch(() => null),
      fetchDataset<typeof PALIKA_TRANSIT_DATA>('gulmi_palika_transit.json').catch(() => null),
      fetchDataset<{ baseline: Record<string, PalikaChirpsPrecipitationBaseline> }>('gulmi_palika_chirps_precipitation.json').catch(() => null),
      fetchDataset<AgroHydrologyDataset>('gulmi_palika_agro_hydrology.json').catch(() => null),
    ]);

    if (cooking) Object.assign(PALIKA_COOKING_DATA, cooking);
    if (ghi) Object.assign(PALIKA_GHI_DATA, ghi);
    if (grid) Object.assign(PALIKA_GRID_DATA, grid);
    if (landholding) Object.assign(PALIKA_LANDHOLDING_DATA, landholding);
    if (soil) Object.assign(PALIKA_SOIL_DATA, soil);
    if (transit) Object.assign(PALIKA_TRANSIT_DATA, transit);
    if (chirps?.baseline) Object.assign(PALIKA_CHIRPS_PRECIPITATION_DATA, chirps.baseline);
    if (agro) Object.assign(PALIKA_AGRO_HYDROLOGY_DATA, agro);
  } catch (err) {
    console.warn('[DataClient] Error loading remote indicators:', err);
  }
}

