import { z } from 'zod';

export type EcoZone = 'Mountain' | 'Hill' | 'Terai';

export type CropUnit = 'kg' | 'metric_ton' | 'm3' | 'cubic_feet' | 'bag';

export type WEFESPillar = 'water' | 'energy' | 'food' | 'ecosystem' | 'socioeconomics';

export type NepaliCropSeason = 'barkhe' | 'hiunde' | 'chaite' | 'baahramase';

export interface District {
  id: string;
  name: string;
  nepaliName: string;
  province: string;
  ecoZone: EcoZone;
  avgRainfallMm: number;
  solarRadiationKwh: number;
  avgTempC?: number;
  baseSoilPh?: number;
  laborRateNprPerDay: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description?: string;
  // Real Soil Metrics from 45,000+ field measurements (soildataNepal.csv)
  soilNitrogen?: number;
  soilPhosphorus?: number;
  soilPotassium?: number;
  soilType?: string;
  soilSampleCount?: number;
  hasRealSoilData?: boolean;

  // Real Socioeconomic Indicators (CBS & National Census Data)
  populationTotal?: number;
  populationDensity?: number;
  wealthIndexScore?: number;
  agriLandholdingAvgHa?: number;
  unemploymentRatePct?: number;
  literacyRatePct?: number;
  utilityAccessPct?: number;

  // Real Energy Infrastructure & NASA Solar Data
  totalHydroCapacityMW?: number;
  hydroStationCount?: number;
  hydroStationsList?: { name: string; capacityMW: number; commissioned: string; owner: string; location: string }[];
  nasaSolarRadiationKwh?: number;
  nasaSolarYearly?: Record<number, number>;

  // Real Crop Feasibility Data (Nepal_District_Crops_Feasibility.csv)
  physiographicRegion?: string;        // "Hill", "Mountain", "Terai", "Inner Terai", "Hill/Mountain", etc.
  climateZone?: string;                // "Tropical", "Subtropical to Temperate", etc.
  elevationRange?: string;             // "1000-2500", "100-300", etc.
  feasibleCrops?: string[];            // Cereals/grains: ["Paddy", "Maize", "Wheat", ...]
  feasibleVegetables?: string[];       // Vegetables: ["Tomato", "Cauliflower", ...]
  feasibleFruits?: string[];           // Fruits: ["Orange", "Apple", "Mango", ...]
  feasibleSpicesCashCrops?: string[];  // Spices & Cash: ["Tea", "Ginger", "Cardamom", ...]
  feasibilityReasoning?: string;       // Detailed agronomic reasoning text

  // Real Commercial Coffee Production Statistics (NTCDB / MoALD 2080)
  coffeeProductionMt?: number;
  coffeeAreaHa?: number;
  coffeeYieldKgHa?: number;
  coffeeFarmersCount?: number;

  // Real Agricultural Labor Rates (MoLESS / District Administration Jilla Dar Baseline & Market Surveys)
  agriLaborRateBaselineNpr?: number;      // Official District Admin Baseline (Jilla Dar) Rate (e.g. 754, 890, 1000)
  agriLaborMarketRateMinNpr?: number;     // Farmgate market wage lower bound (e.g. 600)
  agriLaborMarketRateMaxNpr?: number;     // Farmgate market wage upper bound (e.g. 680)
  agriLaborMarketRateAvgNpr?: number;     // Farmgate market wage midpoint average (e.g. 640)
  agriLaborRateRange?: string;            // Formatted market range string (e.g. "600 - 680")
  agriLaborEcoBelt?: string;              // "Hills", "Tarai", "Kathmandu Valley", "Mountain", "Remote Mountain", etc.

  // Real Hydrology & GLOF Hazard Data (DHM National River Gauges & Glacial Lakes)
  hydrologyStationsCount?: number;
  hydrologyStationsList?: { stationNo: string; river: string; siteName: string; elevation: number | null; instruments: string; startDate: string }[];
  totalLakesCount?: number;
  highAltitudeLakesCount?: number;
  lakeAltitudeDistribution?: {
    under100m: number;
    from100to499m: number;
    from500to1999m: number;
    from2000to2999m: number;
    from3000to4999m: number;
    above5000m: number;
  };
  dangerousGlacialLakes?: { sn?: string; name: string; altitude: number; areaSqM?: number | null; hazardLevel: string; basin?: string }[];
  glofRiskLevel?: string;

  // Real Transport Connectivity & Logistics Access (Strategic Road Network)
  roadDensityKmPerKm2?: number;
  avgDistanceToPavedRoadKm?: number;
  marketAccessIndex?: number;
  freightLogisticsTariffNprPerTonKm?: number;

  // Real Soil Degradation, Inundation & Physical Color/Texture
  soilTextureShares?: { loamPct: number; sandPct: number; siltPct: number; clayPct: number };
  floodErosionUncultivableAreaHa?: number;
  annualSoilErosionRiskTonnesPerHa?: number;
}

export interface Crop {
  id: string;
  name: string;
  nepaliName: string;
  category: string;
  supportedUnits: CropUnit[];
  defaultUnit: CropUnit;
  baseUnitName: 'kg' | 'm3';
  baseUnitMultiplier: Record<CropUnit, number>; // Factor to multiply unit by to get base unit quantity
  waterFootprintPerUnit: number; // Liters per base unit
  energyReqPerUnit: number; // kWh per base unit
  carbonOffsetPerUnit: number; // kg CO2e per base unit
  marketValuePerUnit: number; // NPR per base unit
  laborDaysPerUnit: number; // labor days per base unit
  caloriesPerUnit: number; // kcal per base unit
  season?: NepaliCropSeason; // 'barkhe' | 'hiunde' | 'chaite' | 'baahramase'
  seasonLabelNepali?: string; // e.g. "बर्खे बाली", "हिउँदे बाली", "चैते बाली", "बाह्रमासे"
  seasonMonthsNepali?: string; // e.g. "असार – कात्तिक", "मंसिर – फागुन", "चैत – जेठ", "वर्षभरि"
}

export interface CropSuitability {
  cropId: string;
  cropName: string;
  suitabilityScore: number; // 0 - 100
  faoClass?: 'S1' | 'S2' | 'S3' | 'N1' | 'N2';
  faoLabel?: string; // 'Highly Suitable', 'Moderately Suitable', 'Marginally Suitable', 'Currently Not Suitable', 'Permanently Unsuitable'
  limitingFactor?: string;
  season?: NepaliCropSeason;
  seasonLabelNepali?: string;
  pillarScores: {
    water: number;
    energy: number;
    food: number;
    ecosystem: number;
    socioeconomics: number;
  };
}

export interface WEFESOutput {
  districtId: string;
  districtName: string;
  cropId: string;
  cropName: string;
  inputQuantity: number;
  inputUnit: CropUnit;
  baseQuantity: number;
  baseUnit: string;
  water: {
    consumptionLiters: number;
    consumptionM3: number;
    waterStressIndex: number; // 0 - 100
    rating: string;
  };
  energy: {
    loadKwh: number;
    loadMj: number;
    gridKwh: number;
    renewableKwh: number;
    fossilSharePercent: number;
  };
  food: {
    yieldKg: number;
    biomassValueNpr: number;
    foodSecurityIndex: number; // 0 - 100
    nutritionalKcal: number;
  };
  ecosystem: {
    carbonOffsetKgCo2: number;
    erosionMitigationIndex: number; // 0 - 100
    ecoHealthScore: number; // 0 - 100
  };
  socioeconomics: {
    grossRevenueNpr: number;
    netRevenueNpr: number;
    laborDays: number;
    directJobsCreated: number;
    indirectJobsCreated: number;
    revenuePerLaborDay: number;
  };
  nexusBalanceIndex: number; // 0 - 100
  nexusRating: string;
  /** Agro-ecological suitability gate — populated by calculateHarvestImpact */
  agroSuitability: {
    suitabilityScore: number;        // 0–100, FAO/AHP biophysical score
    suitabilityFactor: number;       // 0.0–1.0 multiplier applied to realized yield
    faoClass: string;                // e.g. 'S1 (Highly Suitable)'
    limitingFactor: string;          // e.g. 'Thermal Deficit' or 'None'
    realizedQuantity: number;        // baseQuantity × suitabilityFactor
    unrealizedQuantityPct: number;   // % of target harvest lost to unsuitability
    isBiophysicallyFeasible: boolean; // suitabilityScore >= 45
  };
  /** Fertilizer Nexus & Spatial Logistics Profile */
  fertilizerNexus?: FertilizerImpactProfile;
}

// ─── FERTILIZER NEXUS & SPATIAL LOGISTICS SCHEMAS ────────────────────────────

export interface FertilizerNutrientDose {
  nitrogenKgPerHa: number;
  phosphorusP2O5KgPerHa: number;
  potassiumK2OKgPerHa: number;
  zincKgPerHa: number;
  boronKgPerHa: number;
  organicManureTonPerHa: number;
  ureaBags50kg: number;
  dapBags50kg: number;
  mopBags50kg: number;
}

export interface PalikaLogisticsRoute {
  palikaId: string;
  palikaName: string;
  districtId: string;
  districtName: string;
  customsPortId: 'birgunj' | 'bhairahawa' | 'biratnagar' | 'nepalgunj' | 'kakarbhitta' | 'dhangadhi';
  customsPortName: string;
  distanceTeraiKm: number;
  distanceHillKm: number;
  distanceLastMileKm: number;
  totalDistanceKm: number;
  elevationDeltaM: number;
  lastMileRoadType: 'Paved Highway' | 'Gravel Valley' | 'Earthen Mountain' | 'Seasonal Rough Earthen';
}

export interface FertilizerImpactProfile {
  // 1. Food & Agronomy
  agronomic: {
    targetYieldKg: number;
    realizedYieldKg: number;
    yieldGapPercent: number;
    limitingNutrient: 'N' | 'P' | 'K' | 'Zinc' | 'Boron' | 'None';
    recommendedDose: FertilizerNutrientDose;
    appliedDose: FertilizerNutrientDose;
    organicSubstitutionPct: number; // 0% (100% chemical) to 100% (pure bio-slurry/organic)
    organicYieldLagPenaltyPct: number; // Year 1 mineralization lag (e.g. -12%)
  };
  // 2. Socioeconomics & Logistics
  economic: {
    baseSubsidizedBorderPriceNprPerKg: { urea: number; dap: number; mop: number };
    cifUnsubsidizedImportPriceNprPerKg: { urea: number; dap: number; mop: number };
    freightCostPerKgNpr: number;
    handlingTransshipmentNprPerKg: number;
    dealerMarginNprPerKg: number;
    scarcityMarkupPct: number; // 0% to 80% during peak season cooperative depletion
    landedFarmgatePriceNprPerKg: { urea: number; dap: number; mop: number; averageWeighted: number };
    totalFarmerFertilizerSpendNpr: number;
    sovereignImportForexDrainUsd: number;
    gonSubsidyBurdenNpr: number;
    farmerValueCostRatioVCR: number; // VCR = (Delta Yield Value) / (Fertilizer Cost)
    vcrStatus: 'Optimal Investment (VCR >= 2.5)' | 'Acceptable Margin (2.0 <= VCR < 2.5)' | 'High Risk of Non-Adoption (VCR < 2.0)';
  };
  // 3. Energy & Transport Work
  energy: {
    transportEnergyMegaJoules: number;
    transportDieselLiters: number;
    transportDieselCostNpr: number;
    emptyReturnPenaltyFactor: number;
    embeddedManufacturingEnergyKwh: number;
  };
  // 4. Ecosystem & Carbon
  ecosystem: {
    transportEmissionsKgCo2e: number;
    soilOrganicCarbonDeltaPct: number; // Positive with bio-slurry, negative with chemical-only
    nitrousOxideEmissionsKgCo2e: number;
  };
  // 5. Hydrology & Water
  water: {
    nitrateLeachingKgPerHa: number;
    groundwaterEutrophicationRisk: 'Low' | 'Moderate' | 'Severe Nitrate Hazard';
  };
  // 6. Bioeconomy Tipping Point
  bioeconomyTippingPoint: {
    isBioeconomySuperior: boolean;
    landedChemicalCostPerHaNpr: number;
    equivalentBioSlurryCostPerHaNpr: number;
    netSavingsPerHaNpr: number;
    bioeconomyAdvantageRationale: string;
  };
  logisticsRoute: PalikaLogisticsRoute;
}


export interface ScenarioParameters {
  // 1. Climate & Water Levers
  rainfallVariation: number; // -30% to +30%
  monsoonShift: number; // -30% to +30%
  droughtFrequency: number; // 1.0x to 3.0x
  glacierFlowVariation: number; // -40% to +40%
  groundwaterLimit: number; // 500 to 5000 m3

  // 2. Energy Levers
  renewableEnergyShare: number; // 0% to 100%
  solarIrrigationAdoption: number; // 0% to 100%
  microHydroAccess: number; // 0% to 100%
  dieselDependency: number; // 0% to 100%
  gridTariffNpr: number; // 5 to 25 NPR/kWh

  // 3. Agronomic & Ecological Levers
  regenerativeFarmingAdoption: number; // 0% to 100%
  bioFertilizerRatio: number; // 0% to 100%
  erosionBarrierRate: number; // 0% to 100%
  deforestationRate: number; // 0% to 20%

  // 4. Socioeconomic & Market Levers
  marketPriceFluctuation: number; // -50% to +100%
  laborRemittanceRate: number; // -30% to +30%
  transportInfraIndex: number; // 10 to 100
  exportTaxSubsidyRate: number; // -20% to +50%
}

export interface ScenarioResult {
  baseline: WEFESOutput;
  simulated: WEFESOutput;
  differentials: {
    waterDeltaPercent: number;
    energyDeltaPercent: number;
    revenueDeltaPercent: number;
    carbonDeltaPercent: number;
    ecoHealthDeltaPercent: number;
    jobsDeltaPercent: number;
    nexusBalanceDelta: number;
  };
  parameters: ScenarioParameters;
}

// Zod Schemas for API validation
export const AnalyzeRequestSchema = z.object({
  districtId: z.string().min(1, 'District ID is required'),
  cropId: z.string().min(1, 'Crop ID is required'),
  quantity: z.number().positive('Quantity must be greater than zero'),
  unit: z.enum(['kg', 'metric_ton', 'm3', 'cubic_feet', 'bag']),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

export const ScenarioRequestSchema = z.object({
  districtId: z.string().min(1),
  cropId: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.enum(['kg', 'metric_ton', 'm3', 'cubic_feet', 'bag']),
  parameters: z.object({
    rainfallVariation: z.number().min(-30).max(30),
    monsoonShift: z.number().optional(),
    droughtFrequency: z.number().optional(),
    glacierFlowVariation: z.number().optional(),
    groundwaterLimit: z.number().optional(),
    renewableEnergyShare: z.number().min(0).max(100),
    solarIrrigationAdoption: z.number().optional(),
    microHydroAccess: z.number().optional(),
    dieselDependency: z.number().optional(),
    gridTariffNpr: z.number().optional(),
    regenerativeFarmingAdoption: z.number().min(0).max(100),
    bioFertilizerRatio: z.number().optional(),
    erosionBarrierRate: z.number().optional(),
    deforestationRate: z.number().optional(),
    marketPriceFluctuation: z.number().min(-50).max(100),
    laborRemittanceRate: z.number().optional(),
    transportInfraIndex: z.number().optional(),
    exportTaxSubsidyRate: z.number().optional(),
  }),
});

export type ScenarioRequest = z.infer<typeof ScenarioRequestSchema>;

export * from './legend-contracts';
