import { WEFESOutput } from '@wefes/shared-types';
import { NaturalCapitalAccount, SDGAlignmentItem } from './nexusMathTypes';

export function computeNaturalCapital(output: WEFESOutput): NaturalCapitalAccount {
  const grossFinancialRevenueNpr = output.socioeconomics.grossRevenueNpr || 250000;
  const laborDirectCostNpr = Math.round(output.socioeconomics.laborDays * 760);
  const energyDirectCostNpr = Math.round(output.energy.loadKwh * 10.5);
  const conventionalNetProfitNpr = Math.max(0, grossFinancialRevenueNpr - laborDirectCostNpr - energyDirectCostNpr);

  const waterShadowCostNpr = Math.round(output.water.consumptionM3 * 14.5);
  const carbonCreditAssetNpr = Math.round(Math.abs(output.ecosystem.carbonOffsetKgCo2) * 4.2);
  const soilNutrientDepletionCostNpr = Math.round(grossFinancialRevenueNpr * 0.065);
  const trueNexusNetValueNpr = Math.round(
    conventionalNetProfitNpr - waterShadowCostNpr - soilNutrientDepletionCostNpr + carbonCreditAssetNpr
  );
  const naturalCapitalRatioPct = Math.round(((waterShadowCostNpr + soilNutrientDepletionCostNpr) / Math.max(1, grossFinancialRevenueNpr)) * 100);

  return {
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
}

export function computeSdgAlignments(output: WEFESOutput): SDGAlignmentItem[] {
  return [
    {
      sdgNumber: 'SDG 2',
      sdgName: 'Zero Hunger & Food Security',
      targetTitle: 'Sustainable Food Production Systems',
      alignmentScore: output.food.foodSecurityIndex,
      metricLabel: 'Food Security Index',
      metricValue: `${output.food.foodSecurityIndex}/100`,
      color: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      sdgNumber: 'SDG 6',
      sdgName: 'Clean Water & Sanitation',
      targetTitle: 'Water-Use Efficiency & Springshed Health',
      alignmentScore: Math.max(10, 100 - output.water.waterStressIndex),
      metricLabel: 'Water Efficiency Index',
      metricValue: `${Math.max(10, 100 - output.water.waterStressIndex)}/100`,
      color: 'bg-sky-100 text-sky-900 border-sky-300',
    },
    {
      sdgNumber: 'SDG 7',
      sdgName: 'Affordable & Clean Energy',
      targetTitle: 'Renewable Power in Agriculture',
      alignmentScore: Math.round(100 - output.energy.fossilSharePercent),
      metricLabel: 'Clean Energy Share',
      metricValue: `${Math.round(100 - output.energy.fossilSharePercent)}%`,
      color: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    },
    {
      sdgNumber: 'SDG 13',
      sdgName: 'Climate Action',
      targetTitle: 'Himalayan Climate Adaptation & Resilience',
      alignmentScore: output.ecosystem.ecoHealthScore,
      metricLabel: 'Eco-Health Score',
      metricValue: `${output.ecosystem.ecoHealthScore}/100`,
      color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
    {
      sdgNumber: 'SDG 15',
      sdgName: 'Life on Land',
      targetTitle: 'Mountain Topsoil & Biodiversity Conservation',
      alignmentScore: output.ecosystem.erosionMitigationIndex,
      metricLabel: 'Erosion Mitigation',
      metricValue: `${output.ecosystem.erosionMitigationIndex}/100`,
      color: 'bg-teal-100 text-teal-900 border-teal-300',
    },
  ];
}
