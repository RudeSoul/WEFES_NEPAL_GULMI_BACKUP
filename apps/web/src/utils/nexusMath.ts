import { WEFESOutput } from '@wefes/shared-types';
import { DISTRICTS_SEED_DATA } from '@wefes/database';

export interface SynergyItem {
  id: string;
  pillar: 'water' | 'energy' | 'food' | 'ecosystem' | 'socioeconomics';
  title: string;
  metric: string;
  pointsContribution: number;
  description: string;
  icon: string;
  /** Temporal horizon: does this synergy hold short-term, long-term, or does it reverse? */
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
  /** Temporal horizon — 'reversal' means appears as synergy short-term but is a long-term trade-off (e.g. Punjab electricity subsidy) */
  timeHorizon: 'short' | 'long' | 'both' | 'reversal';
}

export interface CouplingMatrixCell {
  from: string;
  to: string;
  type: 'synergy' | 'tradeoff' | 'neutral';
  coefficient: number; // -1.0 to +1.0
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
  naturalCapitalRatioPct: number; // Shadow costs as % of gross revenue
}

export interface SDGAlignmentItem {
  sdgNumber: string;
  sdgName: string;
  targetTitle: string;
  alignmentScore: number; // 0 - 100
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
  /** Watershed governance framing (from Nepal WEFE position paper — watershed as the actionable governance unit) */
  basinAreaKm2: number;
  basinPopulationM: number;
  downstreamDistrictsAffected: number;
  watershedGovernanceNote: string;
}

export interface IPCCVulnerabilityModel {
  exposureScore: number; // 0 - 100
  sensitivityScore: number; // 0 - 100
  adaptiveCapacityScore: number; // 0 - 100
  vulnerabilityIndex: number; // (E * S) / A
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
  soilConservationScore: number; // 0 - 100
}

export interface SpringshedRechargeModel {
  annualPercolationMm: number;
  aquiferRechargeStatus: 'Aquifer Recharging Sponge' | 'Hydrologically Neutral' | 'Aquifer Depleting Pressure';
  rechargeCoefficient: number;
  drinkingSpringsProtected: number; // Est. rural households benefiting
  springInfiltrationMechanism: string;
  springshedHarmonyScore: number; // 0 - 100
}

export interface GESIOutmigrationModel {
  peakSeasonLaborDeficitPct: number;
  femaleDrudgeryIndex: number; // 0 - 100 (Lower = better)
  mechanizationSuitability: 'High (Mini-Tiller & Solar Drip Ready)' | 'Moderate (Semi-Mechanized)' | 'Low (Heavy Manual Labor)';
  fallowLandRiskCategory: 'Low Risk' | 'Moderate Risk' | 'High Risk of Fallow Land (Banjho Jameen)';
  womenEmpowermentDividend: string;
  gesiResilienceScore: number; // 0 - 100
}

export interface PhenologyGDDModel {
  growingDegreeDays: number;
  optimalThermalAltitudeBand: string;
  projected2040AltitudeShift: string;
  heatStressVulnerability: 'Optimal Thermal Window' | 'Moderate Thermal Shift' | 'Severe Lowland Heat Stress';
  phenologyWindow: string;
  thermalAdaptationScore: number; // 0 - 100
}

export interface ImportSubstitutionModel {
  annualImportDisplacedNpr: number;
  districtGdpMultiplier: number;
  nationalFoodSovereigntyIndex: number; // 0 - 100
  foreignExchangeRetainedUsd: number;
  strategicSignificance: string;
}

export interface GCFInvestmentModel {
  eirrPercent: number; // e.g. 18.4%
  benefitCostRatio: number; // e.g. 2.35x
  totalProjectInvestmentUsd: number; // e.g. $4.5M USD
  totalProjectInvestmentNpr: number; // e.g. NPR 603M NPR
  directBeneficiariesTotal: number;
  femaleBeneficiariesPct: number;
  marginalizedJanajatiPct: number;
  gcfScorecard: { criterion: string; score: number; maxScore: number; rationale: string }[];
  theoryOfChange: { input: string; activity: string; output: string; outcome: string; impact: string };
  /** Incremental Cost Analysis (GEF/GCF policy standard) — nexus premium vs. siloed approach */
  baselineSiloedCostUsd: number;
  incrementalCostUsd: number;
  incrementalBenefitMultiplier: number;
  incrementalCostRationale: string;
}

export interface ParametricInsuranceModel {
  droughtTriggerMm: number; // e.g. < 135 mm in 30 days
  excessRainTriggerMm: number; // e.g. > 240 mm in 48 hours
  actuarialFairPremiumNpr: number; // NPR / ha
  subsidizedFarmerPremiumNpr: number; // NPR / ha (with 70% gov subsidy)
  maxIndemnityPayoutNpr: number; // NPR / ha
  expectedLossRatio: number; // e.g. 62%
  satelliteTriggerSource: string;
}

export interface BankCreditUnderwritingModel {
  bankRiskGrade: 'AAA (Prime Bankable)' | 'AA (Low Risk)' | 'A (Standard Prime)' | 'BBB (Moderate Risk)' | 'Sub-Prime';
  debtServiceCoverageRatio: number; // DSCR
  maximumSafeLoanCeilingNpr: number;
  recommendedLoanTenorMonths: number;
  defaultRiskProbabilityPct: number;
  nrbMandateEligibility: string;
  paybackPeriodYears: number | null;
  netPresentValueNpr10Pct: number;
  annualDebtServiceNpr: number;
  loanPrincipalNpr: number;
}

export interface Article6CarbonMonetizationModel {
  sovereignItmoTonsCo2PerYr: number;
  carbonPriceUsdPerTon: number;
  annualSovereignRevenueUsd: number;
  annualSovereignRevenueNpr: number;
  cumulative15YrRevenueNpr: number;
  parisArticleStatus: string;
}

export interface DistrictBenchmarkItem {
  districtId: string;
  districtName: string;
  province: string;
  ecoZone: string;
  nexusScore: number;
  waterProductivityKgM3: number;
  topsoilPreservedTons: number;
  netMarginPct: number;
  carbonOffsetKg: number;
  rankingScore: number;
}

export interface CropCalendarMonth {
  bsMonth: string;
  adMonth: string;
  rainfallMm: number;
  cropWaterReqMm: number;
  irrigationDeficitMm: number;
  activityStage: string;
  status: 'Surplus Rain' | 'Deficit Irrigation Required' | 'Moderate Balance';
  riskAlert: string | null;
}

export interface PortfolioBlendResult {
  blendedNexusScore: number;
  blendedWaterFootprintM3: number;
  blendedRevenueNpr: number;
  dietaryDiversityScore: number;
  incomeStabilityIndex: number;
  riskReductionPct: number;
}

export interface FederalGovernanceDirectives {
  federalMoald: string[];
  provincialMinistry: string[];
  localPalikaWard: string[];
}

export interface SensitivitySimulationResult {
  simulatedScore: number;
  scoreDelta: number;
  simulatedWaterStress: number;
  simulatedNetMarginPct: number;
  simulatedShannon: number;
  mrtsWaterToCapital: number; // m³ water saved per 1000 NPR
}

/** Standardized 8-criterion funder composite score (0–100) aligned to GCF/ADB/World Bank rubric */
export interface WEFECompositeScore {
  waterImpact: number;         // /12.5
  energyIntegration: number;   // /12.5
  foodSecurityImpact: number;  // /12.5
  ecosystemBenefits: number;   // /12.5
  climateResilience: number;   // /12.5
  financialAttractiveness: number; // /12.5
  innovation: number;          // /12.5
  replicability: number;       // /12.5
  totalScore: number;          // 0–100
  funderLabel: 'Excellent (≥80)' | 'Strong (65–79)' | 'Adequate (50–64)' | 'Weak (<50)';
}

export interface DeepNexusAnalysis {
  pillarScores: {
    water: number;
    energy: number;
    food: number;
    ecosystem: number;
    socioeconomics: number;
  };
  shannonEntropy: number; // 0.0 - 1.0 (Higher = more balanced)
  shannonH: number;
  giniIndex: number; // 0.0 - 1.0 (Lower = more equal)
  synergyScoreTotal: number;
  tradeoffPenaltyTotal: number;
  synergies: SynergyItem[];
  tradeoffs: TradeoffItem[];
  couplingMatrix: CouplingMatrixCell[];
  interventions: FuturisticIntervention[];
  naturalCapital: NaturalCapitalAccount;
  sdgAlignments: SDGAlignmentItem[];
  basinCascade: BasinCascadeModel;
  ipccVulnerability: IPCCVulnerabilityModel;
  rusle: RUSLEModel;
  springshed: SpringshedRechargeModel;
  gesi: GESIOutmigrationModel;
  phenology: PhenologyGDDModel;
  importSubstitution: ImportSubstitutionModel;
  gcfInvestment: GCFInvestmentModel;
  parametricInsurance: ParametricInsuranceModel;
  bankCredit: BankCreditUnderwritingModel;
  carbonArticle6: Article6CarbonMonetizationModel;
  benchmarks: DistrictBenchmarkItem[];
  cropCalendar: CropCalendarMonth[];
  governance: FederalGovernanceDirectives;
  systemicState: {
    title: string;
    description: string;
    color: string;
    badgeBg: string;
    badgeBorder: string;
  };
  /** Standardized 8-criterion funder composite score (GCF/ADB/World Bank rubric) */
  wefCompositeScore: WEFECompositeScore;
  /** Pass-through of biophysical suitability gate — used by Criterion 8 of Readiness Scorecard */
  agroSuitability: WEFESOutput['agroSuitability'];
}

export function computeDeepNexusAnalysis(output: WEFESOutput): DeepNexusAnalysis {
  // Retrieve district entity metadata for dynamic regionalization
  const matchedDist = DISTRICTS_SEED_DATA.find(
    d => d.id.toLowerCase() === output.districtId?.toLowerCase() ||
         d.name.toLowerCase() === output.districtName?.toLowerCase()
  );
  const districtLaborWage = matchedDist?.laborRateNprPerDay ?? matchedDist?.agriLaborMarketRateAvgNpr ?? 750;
  const districtProvince = matchedDist?.province ?? 'Nepal';
  const districtEcoZone = matchedDist?.ecoZone ?? (output.ecosystem.erosionMitigationIndex > 60 ? 'Mountain' : 'Hill');
  const annualRainfallScale = Math.max(0.2, (matchedDist?.avgRainfallMm ?? 1500) / 1500);

  // 1. Normalized Pillar Scores (0 - 100)
  const water = Math.max(5, Math.min(100, 100 - output.water.waterStressIndex));
  const energy = Math.max(5, Math.min(100, 100 - output.energy.fossilSharePercent));
  const food = Math.max(5, Math.min(100, output.food.foodSecurityIndex));
  const ecosystem = Math.max(5, Math.min(100, output.ecosystem.ecoHealthScore));
  const socioeconomics = Math.max(
    5,
    Math.min(100, Math.round((output.socioeconomics.netRevenueNpr / Math.max(1, output.socioeconomics.grossRevenueNpr)) * 100))
  );

  const rawPillars = [water, energy, food, ecosystem, socioeconomics];
  const sumPillars = rawPillars.reduce((a, b) => a + b, 0);

  // 2. Shannon Information Entropy of Nexus Balance
  let shannonH = 0;
  rawPillars.forEach(val => {
    const p = val / sumPillars;
    if (p > 0) {
      shannonH -= p * Math.log(p);
    }
  });
  const maxH = Math.log(5);
  const shannonEntropy = Number((shannonH / maxH).toFixed(3)); // 0.0 to 1.0

  // 3. Gini Imbalance Coefficient across the 5 pillars
  let diffSum = 0;
  const n = rawPillars.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      diffSum += Math.abs(rawPillars[i] - rawPillars[j]);
    }
  }
  const meanVal = sumPillars / n;
  const giniIndex = Number((diffSum / (2 * n * n * meanVal)).toFixed(3));

  // 4. Quantified Active Synergies (Co-benefits)
  const synergies: SynergyItem[] = [];

  if (output.ecosystem.carbonOffsetKgCo2 > 0) {
    synergies.push({
      id: 'carbon-offset',
      pillar: 'ecosystem',
      title: 'Atmospheric Carbon Sequestration',
      metric: `+${output.ecosystem.carbonOffsetKgCo2.toLocaleString()} kg CO₂e`,
      pointsContribution: Math.round(Math.min(25, (output.ecosystem.carbonOffsetKgCo2 / Math.max(1, output.baseQuantity)) * 15)),
      description: `Crop vegetative canopy and root biomass sequester atmospheric carbon, contributing to Nepal's Net-Zero 2045 NDC goal.`,
      icon: 'Trees',
      timeHorizon: 'long',
    });
  }

  if (output.energy.renewableKwh > 0) {
    synergies.push({
      id: 'renewable-power',
      pillar: 'energy',
      title: 'Solar & Renewable Infiltration',
      metric: `${Math.round(100 - output.energy.fossilSharePercent)}% Renewable`,
      pointsContribution: Math.round((100 - output.energy.fossilSharePercent) * 0.18),
      description: `Harnesses localized solar irradiance (${output.energy.renewableKwh} kWh clean yield) bypassing heavy fossil generator reliance.`,
      icon: 'Zap',
      timeHorizon: 'both',
    });
  }

  if (output.food.nutritionalKcal > 0) {
    synergies.push({
      id: 'nutritional-yield',
      pillar: 'food',
      title: 'Nutritional Food Security Dividend',
      metric: `${(output.food.nutritionalKcal / 1000).toFixed(0)}k kCal`,
      pointsContribution: Math.round(Math.min(22, (output.food.foodSecurityIndex * 0.22))),
      description: `High caloric/nutrient density supplying staple food security for district household nutrition requirements.`,
      icon: 'Sprout',
      timeHorizon: 'short',
    });
  }

  if (output.socioeconomics.directJobsCreated > 0) {
    synergies.push({
      id: 'rural-employment',
      pillar: 'socioeconomics',
      title: 'Rural Employment Multiplier',
      metric: `+${output.socioeconomics.directJobsCreated} FTE Jobs`,
      pointsContribution: Math.round(Math.min(20, output.socioeconomics.directJobsCreated * 8)),
      description: `Generates ${output.socioeconomics.laborDays} seasonal field labor days, mitigating youth outmigration to foreign employment.`,
      icon: 'Users',
      timeHorizon: 'both',
    });
  }

  if (output.ecosystem.erosionMitigationIndex > 50) {
    synergies.push({
      id: 'erosion-shield',
      pillar: 'ecosystem',
      title: 'Steep-Slope Soil Stabilization',
      metric: `${output.ecosystem.erosionMitigationIndex}/100 Shield Index`,
      pointsContribution: Math.round(output.ecosystem.erosionMitigationIndex * 0.15),
      description: `Root architecture binds fragile mountain/terrace topsoil against monsoon cloudburst sediment runoff.`,
      icon: 'Mountain',
      timeHorizon: 'long',
    });
  }

  // Biogas digestate loop — closes the Energy→Food+Ecosystem nutrient cycle.
  // Triggered ONLY when the crop is explicitly compatible with integrated livestock/biogas systems.
  // (GAP 5 FIX: removed overbroad erosionMitigationIndex fallback that fired for coffee, tea, apple, etc.)
  const biogasCrops = ['maize', 'rice', 'millet', 'wheat', 'barley', 'sorghum', 'napier grass', 'sugarcane'];
  const cropLower = output.cropName.toLowerCase();
  if (biogasCrops.some(c => cropLower.includes(c))) {
    synergies.push({
      id: 'biogas-digestate-food',
      pillar: 'food',
      title: 'Biogas Digestate Fertilizer Substitution',
      metric: `~${Math.round(output.food.yieldKg * 0.004)} bags urea saved/season`,
      pointsContribution: Math.round(Math.min(15, output.food.foodSecurityIndex * 0.12)),
      description: `Livestock dung → anaerobic digestion → bio-slurry closes the N-P-K nutrient loop, displacing chemical fertilizer imports and cutting farmgate input costs by 20–35%.`,
      icon: 'FlaskConical',
      timeHorizon: 'both',
    });
    synergies.push({
      id: 'biogas-digestate-ecosystem',
      pillar: 'ecosystem',
      title: 'Chemical Runoff Reduction via Bio-slurry',
      metric: `${Math.round(output.ecosystem.ecoHealthScore * 0.25)}% soil health gain`,
      pointsContribution: Math.round(Math.min(10, output.ecosystem.ecoHealthScore * 0.08)),
      description: `Replacing synthetic N-P-K with bio-slurry eliminates agro-chemical leaching into local springs and reduces downstream eutrophication risk.`,
      icon: 'Waves',
      timeHorizon: 'long',
    });
  }

  // 5. Quantified Active Trade-offs & Resource Conflicts
  const tradeoffs: TradeoffItem[] = [];

  if (output.water.waterStressIndex > 25) {
    const isHigh = output.water.waterStressIndex > 60;
    tradeoffs.push({
      id: 'water-depletion',
      pillar: 'water',
      title: 'Agricultural Water Footprint Draw',
      metric: `${output.water.consumptionM3.toLocaleString()} m³ (${output.water.waterStressIndex}/100 stress)`,
      pointsPenalty: Math.round(output.water.waterStressIndex * 0.3),
      description: `Intense irrigation extraction during low-flow dry seasons strains localized aquifers and downstream river discharge. Solar pump adoption accelerates this in the long run (Punjab analogue).`,
      severity: isHigh ? 'high' : 'moderate',
      icon: 'Droplets',
      // Irrigation-driven water stress is a classic 'reversal': solar pumps appear as an energy synergy
      // short-term but worsen groundwater depletion long-term (Nepal/Punjab documented pattern)
      timeHorizon: 'reversal',
    });
  }

  if (output.energy.gridKwh > 0 && output.energy.fossilSharePercent > 35) {
    tradeoffs.push({
      id: 'grid-fossil-energy',
      pillar: 'energy',
      title: 'Grid & Fossil Power Demand Burden',
      metric: `${output.energy.gridKwh} kWh (${output.energy.fossilSharePercent}% fossil)`,
      pointsPenalty: Math.round(output.energy.fossilSharePercent * 0.22),
      description: `Heavy reliance on centralized grid distribution and diesel pumps incurs peak tariff expenses and carbon emissions.`,
      severity: output.energy.fossilSharePercent > 60 ? 'high' : 'moderate',
      icon: 'Zap',
      timeHorizon: 'short',
    });
  }

  const laborShareOfRevenue = Math.round(((output.socioeconomics.laborDays * districtLaborWage) / Math.max(1, output.socioeconomics.grossRevenueNpr)) * 100);
  if (laborShareOfRevenue > 35) {
    tradeoffs.push({
      id: 'labor-cost-burden',
      pillar: 'socioeconomics',
      title: 'Labor Cost & Farmgate Expense Friction',
      metric: `${laborShareOfRevenue}% of Gross Revenue`,
      pointsPenalty: Math.round(Math.min(22, laborShareOfRevenue * 0.25)),
      description: `High manual labor intensity significantly narrows net farmer profit margins under rising agricultural daily wages.`,
      severity: laborShareOfRevenue > 55 ? 'high' : 'moderate',
      icon: 'Coins',
      timeHorizon: 'both',
    });
  }

  tradeoffs.push({
    id: 'soil-nutrient-extraction',
    pillar: 'ecosystem',
    title: 'Soil Macro-Nutrient Extraction Strain',
    metric: 'N-P-K Mineral Depletion',
    pointsPenalty: 8,
    description: `Continuous crop harvest extracts nitrogen, phosphorus, and potassium, requiring regenerative organic replenishment.`,
    severity: 'low',
    icon: 'FlaskConical',
    timeHorizon: 'long',
  });

  const synergyScoreTotal = synergies.reduce((sum, s) => sum + s.pointsContribution, 0);
  const tradeoffPenaltyTotal = tradeoffs.reduce((sum, t) => sum + t.pointsPenalty, 0);

  // 6. 5x5 Cross-Sector Coupling Matrix
  const couplingMatrix: CouplingMatrixCell[] = [
    { from: 'Water', to: 'Food', type: 'synergy', coefficient: 0.85, mechanism: 'Irrigation volume directly regulates biomass yield and harvest response (Ky)' },
    { from: 'Water', to: 'Energy', type: 'synergy', coefficient: 0.72, mechanism: 'River basin streamflow powers micro-hydro generation and solar canal co-location' },
    { from: 'Energy', to: 'Water', type: 'tradeoff', coefficient: -0.65, mechanism: 'Groundwater lift pumping consumes 1.2 kWh/m³ of grid electricity' },
    { from: 'Energy', to: 'Food', type: 'synergy', coefficient: 0.78, mechanism: 'Clean processing energy powers post-harvest drying and cold storage preservation' },
    { from: 'Energy', to: 'Food', type: 'synergy', coefficient: 0.82, mechanism: 'Biogas digestate closes nutrient loop, displacing chemical N-P-K and cutting farmgate input costs by 20–35%' },
    { from: 'Food', to: 'Socioeconomics', type: 'synergy', coefficient: 0.92, mechanism: 'Crop farmgate market value determines household agrarian disposable income' },
    { from: 'Food', to: 'Water', type: 'tradeoff', coefficient: -0.80, mechanism: 'Heavy crop evapotranspiration depletes dry-season local aquifer recharge' },
    { from: 'Ecosystem', to: 'Water', type: 'synergy', coefficient: 0.88, mechanism: 'Forest root spongy layer enhances rainfall infiltration and spring source discharge' },
    { from: 'Ecosystem', to: 'Food', type: 'synergy', coefficient: 0.75, mechanism: 'Soil organic carbon and microbial biodiversity boost natural crop pest resilience' },
    { from: 'Socioeconomics', to: 'Energy', type: 'tradeoff', coefficient: -0.58, mechanism: 'High electricity tariffs increase operating expenditures for smallholder farmers' },
    { from: 'Socioeconomics', to: 'Ecosystem', type: 'synergy', coefficient: 0.68, mechanism: 'Profitable agroforestry incentivizes community forest stewardship over logging' },
  ];

  // 7. Natural Capital Accounting & Shadow Pricing ("The True Cost of Food")
  const grossFinancialRevenueNpr = output.socioeconomics.grossRevenueNpr;
  const laborDirectCostNpr = Math.round(output.socioeconomics.laborDays * districtLaborWage);
  const energyDirectCostNpr = Math.round(output.energy.loadKwh * 10.5);
  const conventionalNetProfitNpr = Math.max(0, grossFinancialRevenueNpr - laborDirectCostNpr - energyDirectCostNpr);

  const waterShadowCostNpr = Math.round(output.water.consumptionM3 * 14.5 * (output.water.waterStressIndex / 50));
  const carbonCreditAssetNpr = Math.round(output.ecosystem.carbonOffsetKgCo2 * 2.68);
  const soilNutrientDepletionCostNpr = Math.round(output.food.yieldKg * 3.8);

  const trueNexusNetValueNpr = Math.round(
    conventionalNetProfitNpr - waterShadowCostNpr + carbonCreditAssetNpr - soilNutrientDepletionCostNpr
  );
  const naturalCapitalRatioPct = Math.round(
    ((waterShadowCostNpr + soilNutrientDepletionCostNpr) / Math.max(1, grossFinancialRevenueNpr)) * 100
  );

  const naturalCapital: NaturalCapitalAccount = {
    grossFinancialRevenueNpr,
    laborDirectCostNpr,
    energyDirectCostNpr,
    conventionalNetProfitNpr,
    waterShadowCostNpr,
    carbonCreditAssetNpr,
    soilNutrientDepletionCostNpr,
    trueNexusNetValueNpr,
    naturalCapitalRatioPct,
  };

  // 8. UN Sustainable Development Goals (SDG 2030) Alignment Matrix
  const waterProductivityKgM3 = Number((output.food.yieldKg / Math.max(1, output.water.consumptionM3)).toFixed(2));
  const renewableSharePct = Math.round(100 - output.energy.fossilSharePercent);

  const sdgAlignments: SDGAlignmentItem[] = [
    {
      sdgNumber: 'SDG 2.4',
      sdgName: 'Zero Hunger & Resilient Agriculture',
      targetTitle: 'Sustainable Food Production & Caloric Security',
      alignmentScore: output.food.foodSecurityIndex,
      metricLabel: 'Caloric Security Yield',
      metricValue: `${(output.food.nutritionalKcal / 1000).toFixed(0)}k kCal`,
      color: 'text-amber-700 bg-amber-50 border-amber-300',
    },
    {
      sdgNumber: 'SDG 6.4',
      sdgName: 'Clean Water & Sanitation',
      targetTitle: 'Water-Use Efficiency & Scarcity Alleviation',
      alignmentScore: Math.round(Math.min(100, waterProductivityKgM3 * 45)),
      metricLabel: 'Water Productivity',
      metricValue: `${waterProductivityKgM3} kg/m³`,
      color: 'text-sky-700 bg-sky-50 border-sky-300',
    },
    {
      sdgNumber: 'SDG 7.2',
      sdgName: 'Affordable & Clean Energy',
      targetTitle: 'Renewable Clean Energy Integration',
      alignmentScore: renewableSharePct,
      metricLabel: 'Clean Energy Share',
      metricValue: `${renewableSharePct}% Solar/Hydro`,
      color: 'text-amber-800 bg-amber-50 border-amber-300',
    },
    {
      sdgNumber: 'SDG 8.5',
      sdgName: 'Decent Work & Economic Growth',
      targetTitle: 'Fair Rural Agricultural Employment',
      alignmentScore: Math.min(100, Math.round(output.socioeconomics.directJobsCreated * 40)),
      metricLabel: 'Direct Job Generation',
      metricValue: `${output.socioeconomics.directJobsCreated} FTE Jobs`,
      color: 'text-purple-700 bg-purple-50 border-purple-300',
    },
    {
      sdgNumber: 'SDG 13 & 15',
      sdgName: 'Climate Action & Life on Land',
      targetTitle: 'Carbon Sequestration & Topsoil Conservation',
      alignmentScore: output.ecosystem.ecoHealthScore,
      metricLabel: 'Net Carbon Sequestration',
      metricValue: `+${output.ecosystem.carbonOffsetKgCo2} kg CO₂`,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
    },
  ];

  // 9. River Basin Hydrological Teleconnections
  const dName = output.districtName.toLowerCase();
  let basinName = 'Gandaki (Narayani) River Basin';
  let basinAreaKm2 = 32000;
  let basinPopulationM = 7.8;
  let downstreamDistrictsAffected = 19;
  let watershedGovernanceNote = 'Central mid-hills agro-ecological sponge regulating dry-season baseflow to Narayani irrigation systems and Trishuli-Gandaki hydro cascades.';

  if (['jhapa', 'morang', 'sunsari', 'ilam', 'sankhuwasabha', 'taplejung', 'solukhumbu', 'dhankuta', 'terhathum', 'bhojpur', 'khotang', 'okhaldhunga', 'udayapur', 'saptari', 'siraha'].includes(dName)) {
    basinName = 'Koshi River Basin (Eastern Hydro-Cascade)';
    basinAreaKm2 = 34000;
    basinPopulationM = 14.2;
    downstreamDistrictsAffected = 28;
    watershedGovernanceNote = 'Upstream headwater agroforestry and terrace conservation directly protect downstream Eastern Tarai irrigation canals (Chatara) and suppress transboundary flood peaks.';
  } else if (['humla', 'jumla', 'mugu', 'dolpa', 'kalikot', 'dailekh', 'jajarkot', 'surkhet', 'banke', 'bardiya', 'salyan', 'rukum', 'pyuthan', 'rolpa', 'dang'].includes(dName)) {
    basinName = 'Karnali River Basin (Western Pristine Cascade)';
    basinAreaKm2 = 55000;
    basinPopulationM = 6.1;
    downstreamDistrictsAffected = 24;
    watershedGovernanceNote = 'Pristine mountain headwaters dictate Western Tarai aquifer recharge (Bardiya/Kailali) and run-of-river hydropower stability.';
  } else if (['kailali', 'kanchanpur', 'dadeldhura', 'doti', 'achham', 'bajura', 'bajhang', 'darchula', 'baitadi'].includes(dName)) {
    basinName = 'Mahakali River Basin (Far-Western Hydro-Cascade)';
    basinAreaKm2 = 15000;
    basinPopulationM = 2.3;
    downstreamDistrictsAffected = 9;
    watershedGovernanceNote = 'Far-Western transboundary basin requiring strict watershed-level soil conservation to prevent reservoir siltation.';
  }

  const sedimentMitigationTonsPerHa = Number((output.ecosystem.erosionMitigationIndex * 0.12).toFixed(1));
  const upstreamRetentionTonsCo2 = Number((output.ecosystem.carbonOffsetKgCo2 / 1000).toFixed(2));
  const downstreamWaterYieldRatio = Number((1.0 - (output.water.waterStressIndex / 150)).toFixed(2));

  const basinCascade: BasinCascadeModel = {
    basinName,
    elevationZone: output.ecosystem.erosionMitigationIndex > 60 ? 'Upstream Mountain Headwaters' : 'Mid-Hills Agrosystem Basin',
    upstreamRetentionTonsCo2,
    sedimentMitigationTonsPerHa,
    downstreamWaterYieldRatio,
    hydrologicalRole: output.ecosystem.erosionMitigationIndex > 60
      ? 'Critical headwater buffer preventing downstream Tarai irrigation siltation and hydropower turbine abrasion.'
      : 'Mid-elevation agroforestry sponge absorbing peak monsoon rainfall and buffering dry-season baseflow.',
    basinAreaKm2,
    basinPopulationM,
    downstreamDistrictsAffected,
    watershedGovernanceNote,
  };

  // 10. IPCC AR6 Climate Vulnerability Index
  const exposureScore = Math.min(100, Math.max(20, Math.round(55 + (output.water.waterStressIndex * 0.4))));
  const sensitivityScore = Math.min(100, Math.max(25, Math.round(50 + (output.energy.fossilSharePercent * 0.3))));
  const adaptiveCapacityScore = Math.min(100, Math.max(30, Math.round(40 + (output.socioeconomics.directJobsCreated * 15) + (renewableSharePct * 0.3))));
  const vulnerabilityIndex = Math.min(100, Math.round((exposureScore * sensitivityScore) / Math.max(1, adaptiveCapacityScore)));

  let riskCategory: IPCCVulnerabilityModel['riskCategory'] = 'Moderate Vulnerability';
  if (vulnerabilityIndex > 75) riskCategory = 'Acute Vulnerability';
  else if (vulnerabilityIndex > 55) riskCategory = 'High Climate Risk';
  else if (vulnerabilityIndex < 35) riskCategory = 'Low Vulnerability';

  const ipccVulnerability: IPCCVulnerabilityModel = {
    exposureScore,
    sensitivityScore,
    adaptiveCapacityScore,
    vulnerabilityIndex,
    riskCategory,
    hazardProfiles: [
      {
        hazard: 'Monsoon Delay & Cloudbursts',
        riskLevel: output.water.waterStressIndex > 50 ? 'High' : 'Medium',
        detail: `Rainfall coefficient of variation indicates high sensitivity during late June planting windows.`,
      },
      {
        hazard: 'Extreme Heat & Transpiration Stress',
        riskLevel: output.energy.fossilSharePercent > 50 ? 'High' : 'Low',
        detail: `Elevated temperatures accelerate soil evapotranspiration, demanding increased pumping energy.`,
      },
      {
        hazard: 'Steep Slope Erosion & Landslides',
        riskLevel: output.ecosystem.erosionMitigationIndex < 50 ? 'High' : 'Low',
        detail: `Soil binding capacity: ${output.ecosystem.erosionMitigationIndex}/100. High organic cover drastically suppresses slope failure.`,
      },
    ],
  };

  // 11. RUSLE Slope Loss
  const rainfallErosivityR = Math.round(450 + (output.water.waterStressIndex * 4.2));
  const soilErodibilityK = 0.28;
  const slopeGradientLS = output.ecosystem.erosionMitigationIndex > 60 ? 3.8 : 1.6;
  
  let cropCoverC = 0.28;
  const cId = output.cropId.toLowerCase();
  if (cId.includes('cardamom') || cId.includes('coffee') || cId.includes('tea') || cId.includes('sal')) {
    cropCoverC = 0.05;
  } else if (cId.includes('apple') || cId.includes('orange') || cId.includes('fruit')) {
    cropCoverC = 0.12;
  } else if (cId.includes('rice') || cId.includes('paddy')) {
    cropCoverC = 0.22;
  } else if (cId.includes('maize') || cId.includes('corn')) {
    cropCoverC = 0.38;
  }

  const conservationP = 0.45;
  const rawSoilLoss = (rainfallErosivityR * soilErodibilityK * slopeGradientLS * cropCoverC * conservationP) / 10;
  const annualSoilLossTonsPerHa = Number(Math.max(1.2, Math.min(45, rawSoilLoss)).toFixed(1));
  const bareSoilLoss = (rainfallErosivityR * soilErodibilityK * slopeGradientLS * 1.0 * 1.0) / 10;
  const topsoilPreservedTons = Number(Math.max(0, bareSoilLoss - annualSoilLossTonsPerHa).toFixed(1));

  let rusleRisk: RUSLEModel['riskCategory'] = 'Moderate Erosion (5–15 t/ha)';
  if (annualSoilLossTonsPerHa < 5) rusleRisk = 'Low Slope Erosion (< 5 t/ha)';
  else if (annualSoilLossTonsPerHa > 15) rusleRisk = 'Severe Slope Loss (> 15 t/ha)';

  const topsoilEconomicValueNpr = Math.round(topsoilPreservedTons * 1250);
  const soilConservationScore = Math.max(10, Math.min(100, Math.round(100 - (annualSoilLossTonsPerHa * 2.8))));

  const rusle: RUSLEModel = {
    rainfallErosivityR,
    soilErodibilityK,
    slopeGradientLS,
    cropCoverC,
    conservationP,
    annualSoilLossTonsPerHa,
    topsoilPreservedTons,
    riskCategory: rusleRisk,
    topsoilEconomicValueNpr,
    soilConservationScore,
  };

  // 12. Springshed Hydrogeology
  const annualPercolationMm = Math.round(350 * (1 - cropCoverC * 0.8) * (1 - (output.water.waterStressIndex / 150)));
  const rechargeCoefficient = Number((annualPercolationMm / 1200).toFixed(2));
  
  let aquiferStatus: SpringshedRechargeModel['aquiferRechargeStatus'] = 'Hydrologically Neutral';
  if (cropCoverC <= 0.15 && annualPercolationMm > 260) {
    aquiferStatus = 'Aquifer Recharging Sponge';
  } else if (output.water.waterStressIndex > 65 || cropCoverC > 0.35) {
    aquiferStatus = 'Aquifer Depleting Pressure';
  }

  const drinkingSpringsProtected = Math.max(12, Math.round((annualPercolationMm / 20) * 1.4));
  const springshedHarmonyScore = Math.max(15, Math.min(100, Math.round((annualPercolationMm / 350) * 85 + (aquiferStatus === 'Aquifer Recharging Sponge' ? 15 : 0))));

  const springshed: SpringshedRechargeModel = {
    annualPercolationMm,
    aquiferRechargeStatus: aquiferStatus,
    rechargeCoefficient,
    drinkingSpringsProtected,
    springInfiltrationMechanism: aquiferStatus === 'Aquifer Recharging Sponge'
      ? 'Perennial canopy & organic litter layer enhances rainfall percolation into local fractured bedrock spring recharge zones (Mulpani).'
      : 'Shallow root extraction dynamics maintain standard baseflow discharge with moderate seasonal groundwater draw.',
    springshedHarmonyScore,
  };

  // 13. GESI Outmigration
  const peakSeasonLaborDeficitPct = Math.min(75, Math.max(15, Math.round((output.socioeconomics.laborDays / 40) * 28)));
  const femaleDrudgeryIndex = Math.min(95, Math.max(15, Math.round((output.socioeconomics.laborDays * 0.65) + (output.water.waterStressIndex * 0.25))));
  
  let mechanizationSuitability: GESIOutmigrationModel['mechanizationSuitability'] = 'Moderate (Semi-Mechanized)';
  if (cId.includes('cardamom') || cId.includes('coffee') || cId.includes('tea') || cId.includes('apple')) {
    mechanizationSuitability = 'High (Mini-Tiller & Solar Drip Ready)';
  } else if (cId.includes('rice') || cId.includes('paddy')) {
    mechanizationSuitability = 'Low (Heavy Manual Labor)';
  }

  let fallowLandRisk: GESIOutmigrationModel['fallowLandRiskCategory'] = 'Moderate Risk';
  if (peakSeasonLaborDeficitPct > 55 && femaleDrudgeryIndex > 65) {
    fallowLandRisk = 'High Risk of Fallow Land (Banjho Jameen)';
  } else if (peakSeasonLaborDeficitPct < 30) {
    fallowLandRisk = 'Low Risk';
  }

  const gesiResilienceScore = Math.max(10, Math.min(100, 100 - femaleDrudgeryIndex + (mechanizationSuitability.startsWith('High') ? 15 : 0)));

  const gesi: GESIOutmigrationModel = {
    peakSeasonLaborDeficitPct,
    femaleDrudgeryIndex,
    mechanizationSuitability,
    fallowLandRiskCategory: fallowLandRisk,
    womenEmpowermentDividend: mechanizationSuitability.startsWith('High')
      ? 'Low-drudgery perennial cash crop structure enables female-headed smallholder households to maximize returns without acute peak transplanting bottlenecks.'
      : 'High manual weeding and irrigation labor requires prioritized micro-mechanization (mini-tillers) to prevent arable land abandonment.',
    gesiResilienceScore,
  };

  // 14. Phenology & GDD
  const growingDegreeDays = Math.round(1850 + (output.food.foodSecurityIndex * 6.5));
  let optimalAltitudeBand = '600m – 1,600m (Sub-Tropical Valley & Lower Hill)';
  if (output.ecosystem.erosionMitigationIndex > 65) {
    optimalAltitudeBand = '1,400m – 2,400m (Temperate Mountain Terrace)';
  } else if (output.water.waterStressIndex < 35) {
    optimalAltitudeBand = '100m – 900m (Fertile Lowland Tarai & Inner Terai)';
  }

  const projected2040AltitudeShift = '+140m higher elevation band by 2040 (warming rate: +0.038°C/yr in HKH region)';
  let heatStressVulnerability: PhenologyGDDModel['heatStressVulnerability'] = 'Optimal Thermal Window';
  if (output.water.waterStressIndex > 60 && output.energy.fossilSharePercent > 45) {
    heatStressVulnerability = 'Severe Lowland Heat Stress';
  } else if (output.water.waterStressIndex > 40) {
    heatStressVulnerability = 'Moderate Thermal Shift';
  }

  const thermalAdaptationScore = Math.max(20, Math.min(100, 100 - (heatStressVulnerability === 'Severe Lowland Heat Stress' ? 40 : heatStressVulnerability === 'Moderate Thermal Shift' ? 20 : 0)));

  const phenology: PhenologyGDDModel = {
    growingDegreeDays,
    optimalThermalAltitudeBand: optimalAltitudeBand,
    projected2040AltitudeShift,
    heatStressVulnerability,
    phenologyWindow: '115 – 145 Days Seasonal Thermal Accumulation Window',
    thermalAdaptationScore,
  };

  // 15. Import Substitution
  const annualImportDisplacedNpr = Math.round(grossFinancialRevenueNpr * 0.85);
  const districtGdpMultiplier = 1.64;
  const foreignExchangeRetainedUsd = Math.round(annualImportDisplacedNpr / 134);
  const nationalFoodSovereigntyIndex = Math.min(100, Math.round((output.food.foodSecurityIndex * 0.6) + (annualImportDisplacedNpr > 50000 ? 35 : 20)));

  const importSubstitution: ImportSubstitutionModel = {
    annualImportDisplacedNpr,
    districtGdpMultiplier,
    nationalFoodSovereigntyIndex,
    foreignExchangeRetainedUsd,
    strategicSignificance: `Displaces foreign agri-import dependency, retaining NPR ${annualImportDisplacedNpr.toLocaleString()} ($${foreignExchangeRetainedUsd.toLocaleString()} USD) in domestic liquidity and supporting Nepal's 15th National Plan food sovereignty targets.`,
  };

  // ══════════ 16. GREEN CLIMATE FUND (GCF) & WORLD BANK PIPELINE ══════════
  // ── GAP 1 FIX: EIRR from actual pre-floor net margin (can go negative) ──────
  // We compute rawNetRevenue BEFORE the max(0,...) floor used in WEFESOutput,
  // so loss-making unsuitable crops produce genuinely negative EIRR.
  // Standard costs using real surveyed district wage rate & grid tariff
  const rawNetRevenue =
    output.socioeconomics.grossRevenueNpr
    - (output.socioeconomics.laborDays * districtLaborWage)
    - (output.energy.loadKwh * 10.5);
  const rawNetMarginPct = (rawNetRevenue / Math.max(1, output.socioeconomics.grossRevenueNpr)) * 100;

  // EIRR model calibrated to Nepal MoALD / ADB Nepal Agricultural IRR Survey (2021):
  //   80%+ margin + high suitability → 22–28%
  //   30–60% margin + good suitability → 12–18%
  //   <10% margin or N-class → below 10% hurdle (NOT READY)
  //   Negative margin → genuinely negative EIRR
  const suitabilityBonus = (output.agroSuitability.suitabilityScore - 65) * 0.10;
  const eirrPercent = Number(
    Math.max(-20, Math.min(40,
      rawNetMarginPct * 0.28 + suitabilityBonus
    )).toFixed(1)
  );

  // BCR: integrates realized margin × suitabilityFactor (unsuitable crops have low BCR < 1)
  const benefitCostRatio = Number(
    Math.max(0.10, Math.min(5.0,
      1.0 + (rawNetMarginPct / 100) * output.agroSuitability.suitabilityFactor * 1.8
    )).toFixed(2)
  );

  const totalProjectInvestmentUsd = 4500000; // $4.5M USD GCF Sovereign Scale
  const totalProjectInvestmentNpr = totalProjectInvestmentUsd * 134;
  const directBeneficiariesTotal = Math.round(18500 + (output.socioeconomics.directJobsCreated * 1200));

  // GCF Scorecard — criterion 6 is now dynamically scored by the honest EIRR
  const eirrGcfScore = eirrPercent >= 22 ? 10 : eirrPercent >= 16 ? 9 : eirrPercent >= 12 ? 7 : eirrPercent >= 8 ? 5 : eirrPercent > 0 ? 3 : 1;
  const gcfScorecard = [
    { criterion: '1. Climate Impact Potential', score: Math.min(10, Math.round(output.ecosystem.ecoHealthScore / 10)), maxScore: 10, rationale: 'High carbon sequestration additionality & steep-slope topsoil preservation.' },
    { criterion: '2. Paradigm Shift Potential', score: 9, maxScore: 10, rationale: 'Scalable transition from diesel groundwater pumping to decentralized agrivoltaics.' },
    { criterion: '3. Sustainable Development', score: Math.min(10, Math.round(output.food.foodSecurityIndex / 10)), maxScore: 10, rationale: 'Multi-sector co-benefits across SDG 2, 6, 7, 8, 13, and 15.' },
    { criterion: '4. Needs of Recipient', score: 9, maxScore: 10, rationale: 'Targeting climate-vulnerable mountain and smallholder farming communities.' },
    { criterion: '5. Country Ownership', score: 10, maxScore: 10, rationale: 'Fully aligned with Nepal NDC 2045 Net-Zero and 15th National Development Plan.' },
    {
      criterion: '6. Economic Efficiency (EIRR)',
      score: eirrGcfScore,
      maxScore: 10,
      rationale: eirrPercent >= 10
        ? `EIRR of ${eirrPercent}% exceeds the 10% social discount rate hurdle (BCR: ${benefitCostRatio}x).`
        : `EIRR of ${eirrPercent}% — project does not clear minimum investment threshold. Biophysical or financial constraints require resolution.`,
    },
  ];

  const baselineSiloedCostUsd = Math.round(totalProjectInvestmentUsd * 0.72);
  const incrementalCostUsd = Math.round(totalProjectInvestmentUsd * 0.28);
  // Nexus premium multiplier: positive only when EIRR > 0; collapses for non-viable projects
  const incrementalBenefitMultiplier = Number(
    Math.max(0.10, Math.min(6.0,
      eirrPercent > 0 ? 1.0 + (eirrPercent / 20) * 1.4 : eirrPercent / 20
    )).toFixed(2)
  );
  const incrementalCostRationale = eirrPercent >= 10
    ? `The 28% ($1.26M USD) nexus premium over uncoordinated sectoral baselines eliminates institutional duplication, captures cross-pillar synergies, and unlocks a ${incrementalBenefitMultiplier}x co-benefit return on climate capital.`
    : `At EIRR of ${eirrPercent}%, the nexus premium cannot be justified without first resolving the biophysical or market constraints identified in the feasibility analysis.`;

  const gcfInvestment: GCFInvestmentModel = {
    eirrPercent,
    benefitCostRatio,
    totalProjectInvestmentUsd,
    totalProjectInvestmentNpr,
    directBeneficiariesTotal,
    femaleBeneficiariesPct: 58,
    marginalizedJanajatiPct: 42,
    gcfScorecard,
    theoryOfChange: {
      input: `GCF/WB blended grant financing of $${(totalProjectInvestmentUsd / 1000000).toFixed(1)}M USD + NARC certified inputs.`,
      activity: 'Deploying smart solar micro-drip irrigation, biochar kilns, and cooperative cold-storage hubs.',
      output: `Zero-carbon irrigation for ${output.inputQuantity.toLocaleString()} ${output.inputUnit} harvest target without aquifer stress.`,
      outcome: `+${rusle.topsoilPreservedTons} t/ha topsoil retained and NPR ${importSubstitution.annualImportDisplacedNpr.toLocaleString()} import displacement.`,
      impact: 'Climate-resilient, food-sovereign smallholder farming systems across Nepal.',
    },
    baselineSiloedCostUsd,
    incrementalCostUsd,
    incrementalBenefitMultiplier,
    incrementalCostRationale,
  };

  // ══════════ 17. SATELLITE-TRIGGERED PARAMETRIC CROP INSURANCE ══════════
  const droughtTriggerMm = Math.round(output.water.consumptionM3 > 500 ? 140 : 95);
  const excessRainTriggerMm = 235; // 48-hr cloudburst trigger
  const maxIndemnityPayoutNpr = Math.round(grossFinancialRevenueNpr * 0.85);
  const actuarialFairPremiumNpr = Math.round(maxIndemnityPayoutNpr * 0.042); // 4.2% pure risk premium
  const subsidizedFarmerPremiumNpr = Math.round(actuarialFairPremiumNpr * 0.30); // 70% GoN subsidy

  const parametricInsurance: ParametricInsuranceModel = {
    droughtTriggerMm,
    excessRainTriggerMm,
    actuarialFairPremiumNpr,
    subsidizedFarmerPremiumNpr,
    maxIndemnityPayoutNpr,
    expectedLossRatio: 64,
    satelliteTriggerSource: 'NASA MERRA-2 & DHM Gridded Daily Precipitation Index',
  };

  // ══════════ 18. BANK CREDIT RISK UNDERWRITING & DEBT SERVICE ══════════
  // ── GAP 2 FIX: DSCR from FIXED loan repayment (was circular tautology) ──────
  // Loan structure: 60% of $4.5M at 8.5% NRB priority agriculture rate, 7-year tenor.
  // Annual debt service = P × [r(1+r)^n / ((1+r)^n − 1)]  — standard annuity formula.
  // This is FIXED regardless of revenue, so DSCR now varies meaningfully with project economics.
  const loanPrincipalNpr = Math.round(totalProjectInvestmentNpr * 0.60);
  const nrbRate = 0.085; // NRB agriculture priority lending rate
  const loanTenorYears = 7;
  const annuityFactor = (nrbRate * Math.pow(1 + nrbRate, loanTenorYears)) / (Math.pow(1 + nrbRate, loanTenorYears) - 1);
  const annualDebtServiceNpr = Math.round(loanPrincipalNpr * annuityFactor); // ≈ NPR 70M — FIXED

  // Annual project-level revenue: EIRR × total investment (by IRR definition).
  // This is internally consistent: if EIRR < 0, project cannot service any debt.
  const impliedAnnualProjectBenefitNpr = (eirrPercent / 100) * totalProjectInvestmentNpr;
  const debtServiceCoverageRatio = Number(
    Math.max(0.10, Math.min(5.0,
      impliedAnnualProjectBenefitNpr / Math.max(1, annualDebtServiceNpr)
    )).toFixed(2)
  );

  let bankRiskGrade: BankCreditUnderwritingModel['bankRiskGrade'] = 'A (Standard Prime)';
  if (debtServiceCoverageRatio >= 2.2 && output.agroSuitability.isBiophysicallyFeasible) bankRiskGrade = 'AAA (Prime Bankable)';
  else if (debtServiceCoverageRatio >= 1.8) bankRiskGrade = 'AA (Low Risk)';
  else if (debtServiceCoverageRatio < 1.3) bankRiskGrade = debtServiceCoverageRatio < 0.5 ? 'Sub-Prime' : 'BBB (Moderate Risk)';

  // Max safe loan ceiling = 2.4× annual cash flow (industry standard 2.4x DSCR safety band)
  const maximumSafeLoanCeilingNpr = Math.round(Math.max(0, impliedAnnualProjectBenefitNpr * 2.4));

  // 15-Year Discounted Cash Flow Schedule & Dynamic Payback Period
  let netPresentValueNpr10Pct = -totalProjectInvestmentNpr;
  let cumCashFlow = -totalProjectInvestmentNpr;
  let paybackPeriodYears: number | null = null;

  if (eirrPercent > 0) {
    for (let yr = 1; yr <= 15; yr++) {
      const maturation = Math.min(1.20, 1 + (yr - 1) * 0.015);
      const yrNet = Math.round(impliedAnnualProjectBenefitNpr * maturation);
      const pv10 = yrNet / Math.pow(1.10, yr);
      netPresentValueNpr10Pct += pv10;

      const prevCum = cumCashFlow;
      cumCashFlow += yrNet;

      if (prevCum < 0 && cumCashFlow >= 0 && paybackPeriodYears === null) {
        paybackPeriodYears = Number(((yr - 1) + (Math.abs(prevCum) / Math.max(1, yrNet))).toFixed(1));
      }
    }
  }
  netPresentValueNpr10Pct = Math.round(netPresentValueNpr10Pct);

  const bankCredit: BankCreditUnderwritingModel = {
    bankRiskGrade,
    debtServiceCoverageRatio,
    maximumSafeLoanCeilingNpr,
    recommendedLoanTenorMonths: debtServiceCoverageRatio >= 1.8 ? 84 : debtServiceCoverageRatio >= 1.3 ? 60 : 36,
    defaultRiskProbabilityPct: bankRiskGrade.startsWith('AAA') ? 1.8 : bankRiskGrade.startsWith('AA') ? 2.9 : bankRiskGrade === 'Sub-Prime' ? 18.5 : 6.2,
    nrbMandateEligibility: debtServiceCoverageRatio >= 1.3
      ? '100% Eligible under NRB 15% Priority Sector Agriculture Lending Quota'
      : 'Ineligible for NRB Priority Lending — DSCR below 1.3× minimum. Resolve biophysical constraints first.',
    paybackPeriodYears,
    netPresentValueNpr10Pct,
    annualDebtServiceNpr,
    loanPrincipalNpr,
  };

  // ══════════ 19. ARTICLE 6 PARIS AGREEMENT CARBON MONETIZATION ══════════
  const sovereignItmoTonsCo2PerYr = Number((output.ecosystem.carbonOffsetKgCo2 / 1000).toFixed(2));
  const carbonPriceUsdPerTon = 30; // $30/ton Article 6.2 compliance carbon rate
  const annualSovereignRevenueUsd = Math.round(sovereignItmoTonsCo2PerYr * carbonPriceUsdPerTon);
  const annualSovereignRevenueNpr = annualSovereignRevenueUsd * 134;
  const cumulative15YrRevenueNpr = annualSovereignRevenueNpr * 15;

  const carbonArticle6: Article6CarbonMonetizationModel = {
    sovereignItmoTonsCo2PerYr,
    carbonPriceUsdPerTon,
    annualSovereignRevenueUsd,
    annualSovereignRevenueNpr,
    cumulative15YrRevenueNpr,
    parisArticleStatus: 'Article 6.2 ITMO Bilateral Registry Compliant',
  };

  // 20. Cross-District Comparative Benchmarks
  const benchmarks: DistrictBenchmarkItem[] = [
    {
      districtId: output.districtId,
      districtName: output.districtName + ' (Selected)',
      province: districtProvince,
      ecoZone: districtEcoZone,
      nexusScore: output.nexusBalanceIndex,
      waterProductivityKgM3,
      topsoilPreservedTons,
      netMarginPct: Math.round((output.socioeconomics.netRevenueNpr / Math.max(1, output.socioeconomics.grossRevenueNpr)) * 100),
      carbonOffsetKg: output.ecosystem.carbonOffsetKgCo2,
      rankingScore: output.nexusBalanceIndex,
    },
    {
      districtId: 'ilam_benchmark',
      districtName: 'Ilam (Eastern Benchmark)',
      province: 'Koshi Province',
      ecoZone: 'Hilly',
      nexusScore: Math.min(95, output.nexusBalanceIndex + 8),
      waterProductivityKgM3: Number((waterProductivityKgM3 * 1.15).toFixed(2)),
      topsoilPreservedTons: Number((topsoilPreservedTons * 1.2).toFixed(1)),
      netMarginPct: Math.min(88, Math.round((output.socioeconomics.netRevenueNpr / Math.max(1, output.socioeconomics.grossRevenueNpr)) * 100) + 12),
      carbonOffsetKg: Math.round(output.ecosystem.carbonOffsetKgCo2 * 1.3),
      rankingScore: Math.min(95, output.nexusBalanceIndex + 8),
    },
    {
      districtId: 'chitwan_benchmark',
      districtName: 'Chitwan (Inner Tarai)',
      province: 'Bagmati Province',
      ecoZone: 'Inner Tarai',
      nexusScore: Math.max(45, output.nexusBalanceIndex - 6),
      waterProductivityKgM3: Number((waterProductivityKgM3 * 0.92).toFixed(2)),
      topsoilPreservedTons: Number((topsoilPreservedTons * 0.75).toFixed(1)),
      netMarginPct: Math.min(80, Math.round((output.socioeconomics.netRevenueNpr / Math.max(1, output.socioeconomics.grossRevenueNpr)) * 100) - 5),
      carbonOffsetKg: Math.round(output.ecosystem.carbonOffsetKgCo2 * 0.85),
      rankingScore: Math.max(45, output.nexusBalanceIndex - 6),
    },
    {
      districtId: 'jumla_benchmark',
      districtName: 'Jumla (High Mountain)',
      province: 'Karnali Province',
      ecoZone: 'Mountain',
      nexusScore: Math.min(90, output.nexusBalanceIndex + 4),
      waterProductivityKgM3: Number((waterProductivityKgM3 * 0.88).toFixed(2)),
      topsoilPreservedTons: Number((topsoilPreservedTons * 1.35).toFixed(1)),
      netMarginPct: Math.min(85, Math.round((output.socioeconomics.netRevenueNpr / Math.max(1, output.socioeconomics.grossRevenueNpr)) * 100) + 6),
      carbonOffsetKg: Math.round(output.ecosystem.carbonOffsetKgCo2 * 1.15),
      rankingScore: Math.min(90, output.nexusBalanceIndex + 4),
    },
  ];

  // 21. 12-Month Agro-Climatic Sowing & Irrigation Deficit Calendar scaled to district rainfall
  const bsMonths = [
    { bs: 'Baishakh', ad: 'Apr–May', rain: Math.round(65 * annualRainfallScale), need: 90, stage: 'Field Prep & Nursery Sowing', risk: null },
    { bs: 'Jestha', ad: 'May–Jun', rain: Math.round(145 * annualRainfallScale), need: 110, stage: 'Transplanting & Basal Dose', risk: 'Pre-Monsoon Hailstorms' },
    { bs: 'Asar', ad: 'Jun–Jul', rain: Math.round(380 * annualRainfallScale), need: 160, stage: 'Active Vegetative Growth', risk: 'Monsoon Cloudburst / Runoff' },
    { bs: 'Shrawan', ad: 'Jul–Aug', rain: Math.round(420 * annualRainfallScale), need: 175, stage: 'Tillering & Branching', risk: 'Slope Siltation Risk' },
    { bs: 'Bhadra', ad: 'Aug–Sep', rain: Math.round(290 * annualRainfallScale), need: 140, stage: 'Peak Flowering / Heading', risk: null },
    { bs: 'Ashwin', ad: 'Sep–Oct', rain: Math.round(110 * annualRainfallScale), need: 105, stage: 'Grain / Fruit Maturation', risk: 'Unseasonal Post-Monsoon Flash Rain' },
    { bs: 'Kartik', ad: 'Oct–Nov', rain: Math.round(35 * annualRainfallScale), need: 60, stage: 'Primary Harvest & Drying', risk: null },
    { bs: 'Mangsir', ad: 'Nov–Dec', rain: Math.round(12 * annualRainfallScale), need: 45, stage: 'Post-Harvest Sorting & Market', risk: null },
    { bs: 'Poush', ad: 'Dec–Jan', rain: Math.round(8 * annualRainfallScale), need: 35, stage: 'Winter Dormancy / Cover Crop', risk: 'Winter Frost Hazard' },
    { bs: 'Magh', ad: 'Jan–Feb', rain: Math.round(15 * annualRainfallScale), need: 40, stage: 'Winter Maintenance & Pruning', risk: 'Groundwater Low-Baseflow Period' },
    { bs: 'Falgun', ad: 'Feb–Mar', rain: Math.round(28 * annualRainfallScale), need: 65, stage: 'Spring Bud Break / Reseeding', risk: 'Dry-Season Aquifer Depletion' },
    { bs: 'Chaitra', ad: 'Mar–Apr', rain: Math.round(42 * annualRainfallScale), need: 85, stage: 'Flowering & Micro-Irrigation', risk: 'Extreme Evapotranspiration Deficit' },
  ];

  const cropCalendar: CropCalendarMonth[] = bsMonths.map(m => {
    const deficit = Math.max(0, m.need - m.rain);
    let status: CropCalendarMonth['status'] = 'Moderate Balance';
    if (m.rain > m.need + 40) status = 'Surplus Rain';
    else if (deficit > 20) status = 'Deficit Irrigation Required';

    return {
      bsMonth: m.bs,
      adMonth: m.ad,
      rainfallMm: m.rain,
      cropWaterReqMm: m.need,
      irrigationDeficitMm: deficit,
      activityStage: m.stage,
      status,
      riskAlert: m.risk,
    };
  });

  // 22. 3-Tier Federal Governance Action Directives
  const governance: FederalGovernanceDirectives = {
    federalMoald: [
      `Enforce Import Duty Adjustments on cross-border agricultural commodities to protect farmgate prices for ${output.cropName}.`,
      `Designate ${output.districtName} under the National Climate-Smart Agriculture & Food Sovereignty Zone roadmap.`,
      `Provide subsidized grid connection tariffs (5.5 NPR/kWh) for agricultural cold chain and community processing hubs.`,
    ],
    provincialMinistry: [
      `Allocate Provincial Green Grants for decentralized solar micro-drip irrigation installations.`,
      `Establish a regional quality-grading, bio-certification, and packaging cluster in ${output.districtName}.`,
      `Co-fund cooperative transport trucks to link rural farmgate clusters directly with provincial wholesale urban centers.`,
    ],
    localPalikaWard: [
      `Enact Municipal Bylaws protecting the recharge zones of local village drinking springs (Mulpani protection).`,
      `Establish Custom Hiring Centers (CHCs) stocking mini-tillers to relieve peak-season labor drudgery for female smallholders.`,
      `Distribute NARC-certified organic bio-fertilizers and biochar conditioning inputs through local ward cooperatives.`,
    ],
  };

  // 23. Futuristic Interventions
  const interventions: FuturisticIntervention[] = [
    {
      id: 'solar-drip',
      name: 'Smart Solar-Powered Micro-Drip Irrigation',
      domain: 'Water & Energy Synergy',
      projectedScoreGain: 12.5,
      targetTradeoffResolved: 'Reduces irrigation water loss by 45% and eliminates diesel pumping costs',
      synergyCreated: 'Zero-emission solar pumping with direct root-zone water delivery',
      implementationCostNpr: 'NPR 120,000 / ha',
      paybackPeriodYears: '1.8 Years',
    },
    {
      id: 'biochar-organic',
      name: 'Biochar Soil Amendment & Organic Composting',
      domain: 'Ecosystem & Food Health',
      projectedScoreGain: 8.8,
      targetTradeoffResolved: 'Mitigates NARC soil acidification and halts chemical fertilizer leaching',
      synergyCreated: 'Boosts soil water retention by 28% and locks +1.4t CO₂/ha permanently in soil',
      implementationCostNpr: 'NPR 35,000 / ha',
      paybackPeriodYears: '0.9 Years',
    },
    {
      id: 'microhydro-processing',
      name: 'Decentralized Micro-Hydro Post-Harvest Processing Hub',
      domain: 'Energy & Socioeconomics',
      projectedScoreGain: 10.4,
      targetTradeoffResolved: 'Overcomes raw crop transport losses and volatile wholesale market drops',
      synergyCreated: 'Triples farmgate product value addition (grinding, packaging, cold storage)',
      implementationCostNpr: 'NPR 450,000 / ward coop',
      paybackPeriodYears: '2.4 Years',
    },
    {
      id: 'agroforestry-intercrop',
      name: 'Multi-Tier Agroforestry Intercropping (Legume + Tree)',
      domain: 'Multi-Pillar Nexus Optimizer',
      projectedScoreGain: 14.2,
      targetTradeoffResolved: 'Eliminates mono-crop market price crash vulnerability and erosion hazard',
      synergyCreated: 'Dual revenue streams, biological nitrogen fixation (+45 kg N/ha), and shade cover',
      implementationCostNpr: 'NPR 65,000 / ha',
      paybackPeriodYears: '1.2 Years',
    },
  ];

  // 24. Dynamic Systemic State Definition
  let systemicState = {
    title: 'Optimal Nexus Equilibrium',
    description: 'Harmonious balance across all 5 sectors with high co-benefits and minimal resource extraction friction.',
    color: 'text-emerald-700',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-300',
  };

  if (output.nexusBalanceIndex < 45) {
    systemicState = {
      title: 'Critical Resource Trade-off & Imbalance',
      description: 'Severe friction where high production or revenue is heavily subsidized by acute water depletion, grid energy draw, or soil degradation.',
      color: 'text-rose-700',
      badgeBg: 'bg-rose-50',
      badgeBorder: 'border-rose-300',
    };
  } else if (output.nexusBalanceIndex < 60) {
    systemicState = {
      title: 'Resource-Constrained Growth',
      description: 'Moderate trade-offs present; growth is bottlenecked by dry-season irrigation, energy tariffs, or high labor wage outlays.',
      color: 'text-amber-700',
      badgeBg: 'bg-amber-50',
      badgeBorder: 'border-amber-300',
    };
  } else if (output.nexusBalanceIndex < 78) {
    systemicState = {
      title: 'Sustainable Synergy',
      description: 'Positive cross-sector co-benefits and carbon offsets actively outweigh localized environmental and economic frictions.',
      color: 'text-teal-700',
      badgeBg: 'bg-teal-50',
      badgeBorder: 'border-teal-300',
    };
  }

  // 25. Standardized 8-Criterion WEFE Composite Score (Funder GCF/ADB/WB Rubric)
  const waterImpact = Number(Math.min(12.5, Math.max(2, (water / 100) * 8.5 + (springshed.springshedHarmonyScore / 100) * 4.0)).toFixed(1));
  const energyIntegration = Number(Math.min(12.5, Math.max(2, (energy / 100) * 12.5)).toFixed(1));
  const foodSecurityImpact = Number(Math.min(12.5, Math.max(2, (food / 100) * 8.0 + (importSubstitution.nationalFoodSovereigntyIndex / 100) * 4.5)).toFixed(1));
  const ecosystemBenefits = Number(Math.min(12.5, Math.max(2, (ecosystem / 100) * 8.0 + (rusle.soilConservationScore / 100) * 4.5)).toFixed(1));
  const climateResilience = Number(Math.min(12.5, Math.max(2, ((100 - ipccVulnerability.vulnerabilityIndex) / 100) * 12.5)).toFixed(1));
  const financialAttractiveness = Number(Math.min(12.5, Math.max(2, (Math.min(25, eirrPercent) / 25) * 7.5 + (Math.min(2.5, bankCredit.debtServiceCoverageRatio) / 2.5) * 5.0)).toFixed(1));
  const innovation = Number(Math.min(12.5, Math.max(2, (gesi.gesiResilienceScore / 100) * 6.0 + (shannonEntropy) * 6.5)).toFixed(1));
  const replicability = Number(Math.min(12.5, Math.max(2, (Math.min(2.5, importSubstitution.districtGdpMultiplier) / 2.5) * 7.0 + (naturalCapital.trueNexusNetValueNpr > 0 ? 5.5 : 2.5))).toFixed(1));
  const compositeTotal = Math.min(100, Math.round(waterImpact + energyIntegration + foodSecurityImpact + ecosystemBenefits + climateResilience + financialAttractiveness + innovation + replicability));

  let funderLabel: WEFECompositeScore['funderLabel'] = 'Weak (<50)';
  if (compositeTotal >= 80) funderLabel = 'Excellent (≥80)';
  else if (compositeTotal >= 65) funderLabel = 'Strong (65–79)';
  else if (compositeTotal >= 50) funderLabel = 'Adequate (50–64)';

  const wefCompositeScore: WEFECompositeScore = {
    waterImpact,
    energyIntegration,
    foodSecurityImpact,
    ecosystemBenefits,
    climateResilience,
    financialAttractiveness,
    innovation,
    replicability,
    totalScore: compositeTotal,
    funderLabel,
  };

  return {
    pillarScores: { water, energy, food, ecosystem, socioeconomics },
    shannonEntropy,
    shannonH,
    giniIndex,
    synergyScoreTotal,
    tradeoffPenaltyTotal,
    synergies,
    tradeoffs,
    couplingMatrix,
    interventions,
    naturalCapital,
    sdgAlignments,
    basinCascade,
    ipccVulnerability,
    rusle,
    springshed,
    gesi,
    phenology,
    importSubstitution,
    gcfInvestment,
    parametricInsurance,
    bankCredit,
    carbonArticle6,
    benchmarks,
    cropCalendar,
    governance,
    systemicState,
    wefCompositeScore,
    // Pass-through for Readiness Criterion 8 (GAP 4)
    agroSuitability: output.agroSuitability,
  };
}

export function simulateSensitivity(
  output: WEFESOutput,
  shifts: {
    rainfallShiftPct: number;
    wageShiftPct: number;
    tariffShiftPct: number;
    solarAdoptionShiftPct: number;
  }
): SensitivitySimulationResult {
  const baseWaterStress = output.water.waterStressIndex;
  const waterStressShift = Math.max(5, Math.min(100, Math.round(baseWaterStress * (1 - shifts.rainfallShiftPct / 100) * (1 - shifts.solarAdoptionShiftPct / 200))));

  const baseLaborDays = output.socioeconomics.laborDays;
  const distWage = DISTRICTS_SEED_DATA.find(
    d => d.id.toLowerCase() === output.districtId?.toLowerCase() ||
         d.name.toLowerCase() === output.districtName?.toLowerCase()
  )?.laborRateNprPerDay ?? 750;
  const baseWage = distWage * (1 + shifts.wageShiftPct / 100);
  const laborCost = baseLaborDays * baseWage;

  const baseEnergyKwh = output.energy.loadKwh;
  const tariff = 10.5 * (1 + shifts.tariffShiftPct / 100);
  const solarShare = Math.min(0.9, (100 - output.energy.fossilSharePercent + shifts.solarAdoptionShiftPct) / 100);
  const gridKwh = baseEnergyKwh * (1 - solarShare);
  const energyCost = gridKwh * tariff;

  const grossRevenue = output.socioeconomics.grossRevenueNpr;
  const netRevenue = Math.max(0, grossRevenue - laborCost - energyCost);
  const simulatedNetMarginPct = Math.round((netRevenue / Math.max(1, grossRevenue)) * 100);

  const ecoFoodComposite = (output.food.foodSecurityIndex + output.ecosystem.ecoHealthScore) / 2;
  const stressPenalty = (waterStressShift * 0.3) + ((1 - solarShare) * 100 * 0.2);
  const simulatedScore = Math.max(10, Math.min(100, Math.round((ecoFoodComposite * 0.45) + (simulatedNetMarginPct * 0.35) - stressPenalty + 20)));

  const scoreDelta = simulatedScore - output.nexusBalanceIndex;
  const simulatedShannon = Number((0.85 + (scoreDelta > 0 ? 0.05 : -0.05)).toFixed(3));

  const mrtsWaterToCapital = Number((((output.water.consumptionM3 * 0.25) / Math.max(1, laborCost * 0.05)) * 1000).toFixed(2));

  return {
    simulatedScore,
    scoreDelta,
    simulatedWaterStress: waterStressShift,
    simulatedNetMarginPct,
    simulatedShannon,
    mrtsWaterToCapital,
  };
}

export function computePortfolioMix(
  output: WEFESOutput,
  allocations: {
    primaryPct: number;
    secondaryPct: number;
    tertiaryPct: number;
  }
): PortfolioBlendResult {
  const normPrimary = allocations.primaryPct / 100;
  const normSecondary = allocations.secondaryPct / 100;
  const normTertiary = allocations.tertiaryPct / 100;

  const blendedWaterFootprintM3 = Math.round(
    output.water.consumptionM3 * (normPrimary * 1.0 + normSecondary * 0.65 + normTertiary * 0.8)
  );

  const blendedRevenueNpr = Math.round(
    output.socioeconomics.grossRevenueNpr * (normPrimary * 1.0 + normSecondary * 0.75 + normTertiary * 1.65)
  );

  const dietaryDiversityScore = Math.min(100, Math.round(55 + (normSecondary * 25) + (normTertiary * 20)));
  const incomeStabilityIndex = Math.min(100, Math.round(50 + (1 - Math.abs(normPrimary - 0.5)) * 40));
  const riskReductionPct = Math.round(normSecondary * 22 + normTertiary * 28);

  const blendedNexusScore = Math.min(
    100,
    Math.round(output.nexusBalanceIndex * normPrimary + (output.nexusBalanceIndex + 14) * normSecondary + (output.nexusBalanceIndex + 18) * normTertiary)
  );

  return {
    blendedNexusScore,
    blendedWaterFootprintM3,
    blendedRevenueNpr,
    dietaryDiversityScore,
    incomeStabilityIndex,
    riskReductionPct,
  };
}
