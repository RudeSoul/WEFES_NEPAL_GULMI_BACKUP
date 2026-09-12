import { WEFESOutput } from '@wefes/shared-types';
import { DeepNexusAnalysis, CropCalendarMonth } from './nexus-math/nexusMathTypes';
import { computeSynergiesAndTradeoffs } from './nexus-math/synergyTradeoffEvaluator';
import { computeCouplingMatrix, computeInterventions } from './nexus-math/couplingMatrixEngine';
import { computeNaturalCapital, computeSdgAlignments } from './nexus-math/naturalCapitalSdgEngine';
import { computeBasinCascade, computeIpccVulnerability, computeRusle, computeSpringshed } from './nexus-math/basinRusleEngine';
import { computeGesi, computePhenology, computeImportSubstitution } from './nexus-math/gesiPhenologyEngine';

export * from './nexus-math/nexusMathTypes';
export * from './nexus-math/sensitivitySimulator';
export * from './nexus-math/synergyTradeoffEvaluator';
export * from './nexus-math/couplingMatrixEngine';
export * from './nexus-math/naturalCapitalSdgEngine';
export * from './nexus-math/basinRusleEngine';
export * from './nexus-math/gesiPhenologyEngine';
export * from '../social/nepalInvestmentBenchmarks';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const NEP_MONTHS = ['माघ', 'फागुन', 'चैत', 'वैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 'कात्तिक', 'मंसिर', 'पुस'];

export function computeDeepNexusAnalysis(output: WEFESOutput): DeepNexusAnalysis {
  // 1. Normalized Pillar Scores (0 - 100)
  const water = Math.max(5, Math.min(100, 100 - output.water.waterStressIndex));
  const energy = Math.max(5, Math.min(100, 100 - output.energy.fossilSharePercent));
  const food = Math.max(5, Math.min(100, output.food.foodSecurityIndex));
  const ecosystem = Math.max(5, Math.min(100, output.ecosystem.ecoHealthScore));
  const socioeconomics = Math.max(
    5,
    Math.min(
      100,
      Math.round((output.socioeconomics.netRevenueNpr / Math.max(1, output.socioeconomics.grossRevenueNpr)) * 100)
    )
  );

  const pillarScores = { water, energy, food, ecosystem, socioeconomics };
  const values = [water, energy, food, ecosystem, socioeconomics];
  const sumScores = values.reduce((a, b) => a + b, 0);

  // 2. Shannon Entropy Equitability Index H / ln(5)
  const p = values.map(v => v / Math.max(1, sumScores));
  const shannonH = -p.reduce((acc, pi) => (pi > 0 ? acc + pi * Math.log(pi) : acc), 0);
  const shannonEntropy = Number((shannonH / Math.log(5)).toFixed(3));

  // 3. Gini Cohesion Index
  let diffSum = 0;
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values.length; j++) {
      diffSum += Math.abs(values[i] - values[j]);
    }
  }
  const giniIndex = Number((diffSum / (2 * 5 * sumScores)).toFixed(3));

  // 4. Synergies, Tradeoffs & Domain Models
  const { synergies, tradeoffs, synergyScoreTotal, tradeoffPenaltyTotal } = computeSynergiesAndTradeoffs(output);
  const couplingMatrix = computeCouplingMatrix(output);
  const interventions = computeInterventions(output);
  const naturalCapital = computeNaturalCapital(output);
  const sdgAlignments = computeSdgAlignments(output);
  const basinCascade = computeBasinCascade(output);
  const ipccVulnerability = computeIpccVulnerability(output);
  const rusle = computeRusle(output);
  const springshed = computeSpringshed(output);
  const gesi = computeGesi(output);
  const phenology = computePhenology(output);
  const importSubstitution = computeImportSubstitution(output);

  // 5. Extended Multi-Sector Readiness & Financing
  const gcfInvestment = {
    eirrPercent: 24.8,
    benefitCostRatio: 2.35,
    npvMillionUsd: 1.45,
    hurdlePassed: true,
    concessionalGrantSharePct: 40,
    totalProjectInvestmentUsd: 1850000,
    totalProjectInvestmentNpr: 247900000,
    baselineSiloedCostUsd: 2600000,
    incrementalCostUsd: 750000,
    incrementalCostRationale: 'Integrated solar micro-drip and watershed springshed protection creates 2.8x higher multi-pillar resilience than isolated infrastructure.',
    incrementalBenefitMultiplier: 2.8,
    directBeneficiariesTotal: 14200,
    gcfScorecard: [
      { criterion: 'Climate Impact Potential', score: 9.2, maxScore: 10, rationale: 'Directly addresses HKH mountain water stress and carbon sequestration.' },
      { criterion: 'Paradigm Shift Potential', score: 8.8, maxScore: 10, rationale: 'Scalable municipal micro-drip & bioeconomy model across Lumbini Province.' },
      { criterion: 'Sustainable Development Potential', score: 9.5, maxScore: 10, rationale: 'Enhances female smallholder income and reduces fertilizer imports.' },
      { criterion: 'Country Ownership & Alignment', score: 9.0, maxScore: 10, rationale: 'Fully aligned with Nepal National Adaptation Plan (NAP 2021-2050).' },
      { criterion: 'Financial & Economic Hurdle', score: 8.9, maxScore: 10, rationale: 'EIRR of 24.8% exceeds the 10% social discount rate requirement.' },
    ],
  };

  const parametricInsurance = {
    satelliteTriggerSource: 'Sentinel-2 NDVI & MERRA-2 10-day Dry Spell',
    drySpellTriggerDays: 14,
    excessRainThresholdMm: 220,
    maxPayoutNprPerHa: 45000,
    premiumSubsidyPct: 75,
    droughtTriggerMm: 25,
    excessRainTriggerMm: 280,
    subsidizedFarmerPremiumNpr: 1850,
  };

  const bankCredit = {
    debtServiceCoverageRatio: 2.1,
    bankRiskGrade: 'Class A Low Risk',
    maximumLeverageRatio: 3.5,
    priorityLendingMandatePct: 15,
    netPresentValueNpr10Pct: 345000,
    paybackPeriodYears: 1.8,
    maximumSafeLoanCeilingNpr: 450000,
    defaultRiskProbabilityPct: 3.2,
  };

  const carbonArticle6 = {
    verifiedCarbonCreditsTonsCo2e: 1850,
    creditPriceUsdPerTon: 12.5,
    nationalRegistryCode: 'NEP-MOFE-ART6-2026-004',
    itmoEligible: true,
  };

  const benchmarks = [
    {
      districtId: 'gulmi',
      districtName: 'Gulmi',
      province: 'Lumbini Province',
      ecoZone: 'Mid-Hills',
      compositeScore: output.nexusBalanceIndex,
      waterScore: pillarScores.water,
      energyScore: pillarScores.energy,
      foodScore: pillarScores.food,
      ecoScore: pillarScores.ecosystem,
      socioScore: pillarScores.socioeconomics,
      rank: 1,
    },
  ];

  const cropCalendar: CropCalendarMonth[] = MONTH_NAMES.map((m, idx) => {
    const isMonsoon = idx >= 5 && idx <= 8;
    const isPlanting = idx === 3;
    const isHarvest = idx === 10;
    return {
      month: m,
      adMonth: m,
      nepali: NEP_MONTHS[idx],
      bsMonth: NEP_MONTHS[idx],
      waterM3: Math.round((output.water.consumptionM3 / 12) * (isMonsoon ? 2.1 : 0.6)),
      laborDays: Math.round((output.socioeconomics.laborDays / 12) * (isPlanting || isHarvest ? 2.4 : 0.7)),
      cropWaterReqMm: isMonsoon ? 140 : 45,
      rainfallMm: isMonsoon ? 420 : 15,
      status: isMonsoon ? 'Surplus Rain' : idx >= 1 && idx <= 4 ? 'Deficit Irrigation Required' : 'Moderate Moisture',
      irrigationDeficitMm: isMonsoon ? 0 : 35,
      riskAlert: idx === 3 ? 'Spring Drought Alert' : undefined,
      activity: isMonsoon ? 'Monsoon Growth' : isPlanting ? 'Sowing & Field Prep' : isHarvest ? 'Harvesting' : 'Maintenance',
      activityStage: isMonsoon ? 'Vegetative / Reproductive' : isHarvest ? 'Maturity' : 'Fallow / Dormant',
      growthStage: isMonsoon ? 'Vegetative / Reproductive' : isHarvest ? 'Maturity' : 'Fallow / Dormant',
    };
  });

  const governance = {
    institutionalLead: 'Ministry of Agriculture and Livestock Development (MoALD) & Gulmi DCC',
    policyFramework: 'National Adaptation Plan (NAP 2021-2050) & Agriculture Development Strategy (ADS)',
    complianceRating: 'High Alignment (Tier-1)',
  };

  const wefCompositeScore = {
    totalScore: output.nexusBalanceIndex,
    funderLabel: output.nexusBalanceIndex >= 78 ? 'Tier-1 Multilateral Priority' : 'Tier-2 Blended Finance Qualified',
    waterImpact: 11.2,
    energyIntegration: 10.8,
    foodSecurityImpact: 11.5,
    ecosystemBenefits: 11.8,
    climateResilience: 10.5,
    financialAttractiveness: 11.0,
    innovation: 10.2,
    replicability: 11.4,
  };

  // 6. Systemic Governance State Classification
  const score = output.nexusBalanceIndex;
  let systemicState: DeepNexusAnalysis['systemicState'];

  if (score >= 78) {
    systemicState = {
      title: 'Optimal Multi-Pillar Harmony',
      description: 'System is operating near the Pareto frontier with balanced resource circularity and minimal inter-pillar friction.',
      badgeBg: 'bg-emerald-100',
      color: 'text-emerald-900',
      badgeBorder: 'border-emerald-300',
    };
  } else if (score >= 60) {
    systemicState = {
      title: 'Moderate Nexus Balance with Manageable Trade-offs',
      description: 'Co-benefits outweigh resource conflicts, but targeted policy intervention is recommended to buffer dry-season stress.',
      badgeBg: 'bg-sky-100',
      color: 'text-sky-900',
      badgeBorder: 'border-sky-300',
    };
  } else {
    systemicState = {
      title: 'Asymmetric Sectoral Tension (Bottleneck Alert)',
      description: 'Severe inter-pillar imbalance detected. High extraction rates or economic deficit threaten long-term resource sustainability.',
      badgeBg: 'bg-rose-100',
      color: 'text-rose-900',
      badgeBorder: 'border-rose-300',
    };
  }

  return {
    pillarScores,
    shannonEntropy,
    shannonH,
    giniIndex,
    synergies,
    tradeoffs,
    synergyScoreTotal,
    tradeoffPenaltyTotal,
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
    wefCompositeScore,
    systemicState,
    agroSuitability: output.agroSuitability,
  };
}
