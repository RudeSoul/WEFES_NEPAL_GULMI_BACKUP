import { WEFESOutput } from '@wefes/shared-types';

export interface CropCalendarMonth {
  month: string;
  nepali: string;
  adMonth: string;
  bsMonth: string;
  rainfallMm: number;
  cropWaterReqMm: number;
  irrigationDeficitMm: number;
  waterM3: number;
  laborDays: number;
  status: string;
  riskAlert?: string;
  activity: string;
  activityStage: string;
  growthStage: string;
}

export interface DistrictBenchmarkItem {
  districtId: string;
  districtName: string;
  province: string;
  ecoZone: string;
  compositeScore: number;
  waterScore: number;
  energyScore: number;
  foodScore: number;
  ecoScore: number;
  socioScore: number;
  rank: number;
}

export interface SynergyItem {
  id: string;
  pillar: 'water' | 'energy' | 'food' | 'ecosystem' | 'socioeconomics';
  title: string;
  metric: string;
  pointsContribution: number;
  description: string;
  icon: string;
  timeHorizon: 'short' | 'long' | 'both';
}

export interface TradeoffItem {
  id: string;
  pillar: 'water' | 'energy' | 'food' | 'ecosystem' | 'socioeconomics';
  title: string;
  metric: string;
  pointsPenalty: number;
  description: string;
  severity: 'low' | 'moderate' | 'high';
  icon: string;
  timeHorizon: 'short' | 'long' | 'both' | 'reversal';
}

export interface CouplingMatrixCell {
  from: string;
  to: string;
  type: 'synergy' | 'tradeoff' | 'neutral';
  coefficient: number;
  mechanism: string;
}

export interface FuturisticIntervention {
  id: string;
  name: string;
  domain: string;
  projectedScoreGain: number;
  targetTradeoffResolved: string;
  synergyCreated: string;
  implementationCostNpr: string;
  paybackPeriodYears: string;
}

export interface NaturalCapitalAccount {
  grossFinancialRevenueNpr: number;
  laborDirectCostNpr: number;
  energyDirectCostNpr: number;
  conventionalNetProfitNpr: number;
  waterShadowCostNpr: number;
  carbonCreditAssetNpr: number;
  soilNutrientDepletionCostNpr: number;
  trueNexusNetValueNpr: number;
  naturalCapitalRatioPct: number;
}

export interface SDGAlignmentItem {
  sdgNumber: string;
  sdgName: string;
  targetTitle: string;
  alignmentScore: number;
  metricLabel: string;
  metricValue: string;
  color: string;
}

export interface BasinCascadeModel {
  basinName: string;
  elevationZone: string;
  upstreamRetentionTonsCo2: number;
  sedimentMitigationTonsPerHa: number;
  downstreamWaterYieldRatio: number;
  hydrologicalRole: string;
  basinAreaKm2: number;
  basinPopulationM: number;
  downstreamDistrictsAffected: number;
  watershedGovernanceNote: string;
}

export interface IPCCVulnerabilityModel {
  exposureScore: number;
  sensitivityScore: number;
  adaptiveCapacityScore: number;
  vulnerabilityIndex: number;
  riskCategory: 'Low Vulnerability' | 'Moderate Vulnerability' | 'High Climate Risk' | 'Acute Vulnerability';
  hazardProfiles: { hazard: string; riskLevel: 'Low' | 'Medium' | 'High'; detail: string }[];
}

export interface RUSLEModel {
  rainfallErosivityR: number;
  soilErodibilityK: number;
  slopeGradientLS: number;
  cropCoverC: number;
  conservationP: number;
  annualSoilLossTonsPerHa: number;
  topsoilPreservedTons: number;
  riskCategory: 'Low Slope Erosion (< 5 t/ha)' | 'Moderate Erosion (5–15 t/ha)' | 'Severe Slope Loss (> 15 t/ha)';
  topsoilEconomicValueNpr: number;
}

export interface SpringshedModel {
  aquiferRechargeStatus: 'Critical Depletion' | 'Stable Springshed' | 'Aquifer Recharging Sponge';
  annualPercolationMm: number;
  rechargeCoefficient: number;
  drinkingSpringsProtected: number;
  springInfiltrationMechanism: string;
}

export interface GESIModel {
  femaleLaborSharePct: number;
  femaleDrudgeryIndex: number;
  peakSeasonLaborDeficitPct: number;
  fallowLandRiskCategory: 'Low Fallow Hazard' | 'Moderate Abandonment Risk' | 'Acute Outmigration Land Loss';
  mechanizationSuitability: string;
  womenEmpowermentDividend: string;
}

export interface CropPhenologyModel {
  phenologyWindow: string;
  growingDegreeDays: number;
  heatStressVulnerability: 'Thermally Resilient' | 'Moderate Terminal Heat Risk' | 'Acute Flowering Abort Risk';
  optimalThermalAltitudeBand: string;
  projected2040AltitudeShift: string;
}

export interface ImportSubstitutionModel {
  annualImportDisplacedNpr: number;
  foreignExchangeRetainedUsd: number;
  nationalFoodSovereigntyIndex: number;
  strategicSignificance: string;
  districtGdpMultiplier: number;
}

export interface DeepNexusAnalysis {
  pillarScores: {
    water: number;
    energy: number;
    food: number;
    ecosystem: number;
    socioeconomics: number;
  };
  shannonEntropy: number;
  shannonH: number;
  giniIndex: number;
  synergies: SynergyItem[];
  tradeoffs: TradeoffItem[];
  synergyScoreTotal: number;
  tradeoffPenaltyTotal: number;
  couplingMatrix: CouplingMatrixCell[];
  interventions: FuturisticIntervention[];
  naturalCapital: NaturalCapitalAccount;
  sdgAlignments: SDGAlignmentItem[];
  basinCascade: BasinCascadeModel;
  ipccVulnerability: IPCCVulnerabilityModel;
  rusle: RUSLEModel;
  springshed: SpringshedModel;
  gesi: GESIModel;
  phenology: CropPhenologyModel;
  importSubstitution: ImportSubstitutionModel;
  gcfInvestment: {
    eirrPercent: number;
    benefitCostRatio: number;
    npvMillionUsd: number;
    hurdlePassed: boolean;
    concessionalGrantSharePct: number;
    totalProjectInvestmentUsd: number;
    totalProjectInvestmentNpr: number;
    baselineSiloedCostUsd: number;
    incrementalCostUsd: number;
    incrementalCostRationale: string;
    incrementalBenefitMultiplier: number;
    directBeneficiariesTotal: number;
    gcfScorecard: { criterion: string; score: number; maxScore: number; rationale: string }[];
  };
  parametricInsurance: {
    satelliteTriggerSource: string;
    drySpellTriggerDays: number;
    excessRainThresholdMm: number;
    maxPayoutNprPerHa: number;
    premiumSubsidyPct: number;
    droughtTriggerMm: number;
    excessRainTriggerMm: number;
    subsidizedFarmerPremiumNpr: number;
  };
  bankCredit: {
    debtServiceCoverageRatio: number;
    bankRiskGrade: string;
    maximumLeverageRatio: number;
    priorityLendingMandatePct: number;
    netPresentValueNpr10Pct: number;
    paybackPeriodYears: number;
    maximumSafeLoanCeilingNpr: number;
    defaultRiskProbabilityPct: number;
  };
  carbonArticle6: {
    verifiedCarbonCreditsTonsCo2e: number;
    creditPriceUsdPerTon: number;
    nationalRegistryCode: string;
    itmoEligible: boolean;
  };
  benchmarks: DistrictBenchmarkItem[];
  cropCalendar: CropCalendarMonth[];
  governance: {
    institutionalLead: string;
    policyFramework: string;
    complianceRating: string;
  };
  wefCompositeScore: {
    totalScore: number;
    funderLabel: string;
    waterImpact: number;
    energyIntegration: number;
    foodSecurityImpact: number;
    ecosystemBenefits: number;
    climateResilience: number;
    financialAttractiveness: number;
    innovation: number;
    replicability: number;
  };
  systemicState: {
    title: string;
    description: string;
    badgeBg: string;
    color: string;
    badgeBorder: string;
  };
  agroSuitability: WEFESOutput['agroSuitability'];
}

export interface SensitivitySimulationResult {
  simulatedScore: number;
  scoreDelta: number;
  simulatedWaterStress: number;
  simulatedNetMarginPct: number;
  mrtsWaterToCapital: number;
}
