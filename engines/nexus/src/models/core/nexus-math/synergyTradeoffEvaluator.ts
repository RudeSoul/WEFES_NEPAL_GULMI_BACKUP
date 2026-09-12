import { WEFESOutput } from '@wefes/shared-types';
import { SynergyItem, TradeoffItem } from './nexusMathTypes';

export function computeSynergiesAndTradeoffs(output: WEFESOutput): {
  synergies: SynergyItem[];
  tradeoffs: TradeoffItem[];
  synergyScoreTotal: number;
  tradeoffPenaltyTotal: number;
} {
  const isPaddy = output.cropName?.toLowerCase().includes('paddy') || output.cropName?.toLowerCase().includes('rice');
  const isCoffee = output.cropName?.toLowerCase().includes('coffee');

  const synergies: SynergyItem[] = [
    {
      id: 'syn_carbon_biomass',
      pillar: 'ecosystem',
      title: 'Biomass Carbon Sequestration',
      metric: `${Math.abs(output.ecosystem.carbonOffsetKgCo2).toLocaleString()} kg CO₂e Offset`,
      pointsContribution: isCoffee ? 14.5 : 9.2,
      description: 'Crop photosynthetic carbon assimilation sequesters atmospheric greenhouse gases.',
      icon: 'Trees',
      timeHorizon: 'both',
    },
    {
      id: 'syn_food_density',
      pillar: 'food',
      title: 'Caloric & Nutritional Security',
      metric: `${output.food.nutritionalKcal.toLocaleString()} kcal Total Energy`,
      pointsContribution: isPaddy ? 16.0 : 11.5,
      description: 'High caloric and micronutrient yield directly supports local household food self-reliance.',
      icon: 'Sprout',
      timeHorizon: 'short',
    },
    {
      id: 'syn_soil_topsoil',
      pillar: 'ecosystem',
      title: 'Terrace Slope Stabilization',
      metric: `${output.ecosystem.erosionMitigationIndex}/100 Erosion Index`,
      pointsContribution: 11.8,
      description: 'Root system cohesion and vegetative canopy reduce monsoonal topsoil erosion on steep mountain slopes.',
      icon: 'Mountain',
      timeHorizon: 'long',
    },
  ];

  const tradeoffs: TradeoffItem[] = [
    {
      id: 'trade_water_draw',
      pillar: 'water',
      title: 'Dry-Season Water Drawdown',
      metric: `${output.water.consumptionM3.toLocaleString()} m³ Total Evapotranspiration`,
      pointsPenalty: isPaddy ? 18.5 : 8.0,
      description: 'Supplemental irrigation during pre-monsoon draws from local spring aquifers and small stream catchments.',
      severity: isPaddy ? 'high' : 'moderate',
      icon: 'Droplets',
      timeHorizon: 'short',
    },
    {
      id: 'trade_energy_load',
      pillar: 'energy',
      title: 'Processing & Irrigation Electricity Load',
      metric: `${output.energy.loadKwh.toLocaleString()} kWh Electric Energy`,
      pointsPenalty: isCoffee ? 9.5 : 5.0,
      description: 'Post-harvest processing and electric pumping increase local distribution grid demand.',
      severity: 'moderate',
      icon: 'Zap',
      timeHorizon: 'short',
    },
  ];

  const synergyScoreTotal = Number(synergies.reduce((sum, s) => sum + s.pointsContribution, 0).toFixed(1));
  const tradeoffPenaltyTotal = Number(tradeoffs.reduce((sum, t) => sum + t.pointsPenalty, 0).toFixed(1));

  return {
    synergies,
    tradeoffs,
    synergyScoreTotal,
    tradeoffPenaltyTotal,
  };
}
