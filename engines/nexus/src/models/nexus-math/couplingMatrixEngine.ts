import { WEFESOutput } from '@wefes/shared-types';
import { CouplingMatrixCell, FuturisticIntervention } from './nexusMathTypes';

export function computeCouplingMatrix(output: WEFESOutput): CouplingMatrixCell[] {
  const isPaddy = output.cropName?.toLowerCase().includes('paddy') || output.cropName?.toLowerCase().includes('rice');
  const isCoffee = output.cropName?.toLowerCase().includes('coffee');

  return [
    {
      from: 'Water (Irrigation)',
      to: 'Food (Yield)',
      type: 'synergy',
      coefficient: 0.85,
      mechanism: 'Timely monsoon supplemental irrigation secures vegetative tillering and grain filling.',
    },
    {
      from: 'Energy (Grid)',
      to: 'Water (Pumping)',
      type: 'tradeoff',
      coefficient: -0.45,
      mechanism: 'Pumping lift draws electricity load during dry season peak grid demand.',
    },
    {
      from: 'Food (Biomass)',
      to: 'Ecosystem (Carbon)',
      type: 'synergy',
      coefficient: isCoffee ? 0.92 : 0.70,
      mechanism: isCoffee ? 'Shade-grown Arabica canopy sequesters woody carbon and leaf litter humus.' : 'Crop root biomass enriches soil organic matter and microbial activity.',
    },
    {
      from: 'Ecosystem (Topsoil)',
      to: 'Food (Soil Nutrients)',
      type: 'synergy',
      coefficient: 0.78,
      mechanism: 'Terraced bunding preserves Nitrogen and Phosphorus from monsoonal slope wash.',
    },
    {
      from: 'Socioeconomics (Labor)',
      to: 'Food (Harvest Efficiency)',
      type: 'tradeoff',
      coefficient: -0.35,
      mechanism: 'Peak season agricultural labor shortage creates harvesting bottleneck and post-harvest loss.',
    },
  ];
}

export function computeInterventions(output: WEFESOutput): FuturisticIntervention[] {
  return [
    {
      id: 'solar_drip',
      name: 'Smart Solar Micro-Drip Irrigation Hubs',
      domain: 'Water-Energy Synergy',
      projectedScoreGain: 8.5,
      targetTradeoffResolved: 'Eliminates grid energy draw and diesel pump GHG emissions.',
      synergyCreated: 'Saves 45% irrigation water while boosting fertilizer use efficiency.',
      implementationCostNpr: 'NPR 180,000 / ha (60% Subsidy)',
      paybackPeriodYears: '1.8 Years',
    },
    {
      id: 'biochar_soil',
      name: 'Biochar & Compost Circular Soil Amendment',
      domain: 'Food-Ecosystem Resilience',
      projectedScoreGain: 6.8,
      targetTradeoffResolved: 'Reduces chemical urea leaching and slope nutrient runoff.',
      synergyCreated: 'Increases soil water holding capacity by 28% and sequesters recalcitrant carbon.',
      implementationCostNpr: 'NPR 35,000 / ha',
      paybackPeriodYears: '1.2 Years',
    },
    {
      id: 'community_cold_hub',
      name: 'Decentralized Micro-Hydro Cold Storage Chain',
      domain: 'Socioeconomic Value Retention',
      projectedScoreGain: 6.0,
      targetTradeoffResolved: 'Mitigates 22% post-harvest distress sale and spoilage losses.',
      synergyCreated: 'Extends crop shelf life by 45 days, capturing higher off-season market prices.',
      implementationCostNpr: 'NPR 4,500,000 (Municipal Co-op)',
      paybackPeriodYears: '3.1 Years',
    },
  ];
}
