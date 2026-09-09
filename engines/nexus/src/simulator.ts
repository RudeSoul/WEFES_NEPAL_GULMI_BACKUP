import { WEFESOutput, ScenarioParameters, ScenarioResult } from '@wefes/shared-types';

export function simulateScenario(
  baseline: WEFESOutput,
  parameters: ScenarioParameters
): ScenarioResult {
  const {
    // 1. Climate & Water
    rainfallVariation = 0,
    monsoonShift = 0,
    droughtFrequency = 1.0,
    glacierFlowVariation = 0,
    groundwaterLimit = 2500,

    // 2. Energy
    renewableEnergyShare = 30,
    solarIrrigationAdoption = 20,
    microHydroAccess = 15,
    dieselDependency = 10,
    gridTariffNpr = 10.5,

    // 3. Agronomic & Ecological
    regenerativeFarmingAdoption = 10,
    bioFertilizerRatio = 15,
    erosionBarrierRate = 20,
    deforestationRate = 2,

    // 4. Socioeconomic & Market
    marketPriceFluctuation = 0,
    laborRemittanceRate = 0,
    transportInfraIndex = 50,
    exportTaxSubsidyRate = 0,
  } = parameters;

  // 1. Water simulation
  // Regenerative farming + solar irrigation saving factor
  const regenWaterSaving = (regenerativeFarmingAdoption / 100) * 0.20;
  const solarIrrigationSaving = (solarIrrigationAdoption / 100) * 0.10;
  const totalWaterSavingFactor = Math.max(0.6, 1 - regenWaterSaving - solarIrrigationSaving);

  const simulatedConsumptionLiters = Math.round(baseline.water.consumptionLiters * totalWaterSavingFactor);
  const simulatedConsumptionM3 = Math.round((simulatedConsumptionLiters / 1000) * 100) / 100;

  // Climate impacts on water stress (monsoon shift + drought freq + glacier variation)
  const climateStressImpact = (1 - (rainfallVariation / 100) * 0.6) * (droughtFrequency) * (1 - (glacierFlowVariation / 100) * 0.3) * (1 + (monsoonShift / 100) * 0.2);
  
  // Groundwater limit penalty
  const groundwaterPenalty = simulatedConsumptionM3 > groundwaterLimit ? 1.25 : 1.0;

  const simulatedWaterStressIndex = Math.min(100, Math.max(5, Math.round(baseline.water.waterStressIndex * climateStressImpact * totalWaterSavingFactor * groundwaterPenalty)));

  let simulatedWaterRating = 'Low Stress';
  if (simulatedWaterStressIndex > 75) simulatedWaterRating = 'Severe Water Stress';
  else if (simulatedWaterStressIndex > 50) simulatedWaterRating = 'High Water Stress';
  else if (simulatedWaterStressIndex > 25) simulatedWaterRating = 'Moderate Water Stress';

  // 2. Energy simulation
  const totalLoadKwh = baseline.energy.loadKwh;
  const effectiveRenewableShare = Math.min(100, Math.max(0, renewableEnergyShare + solarIrrigationAdoption * 0.2 + microHydroAccess * 0.25 - dieselDependency * 0.3));
  
  const newRenewableKwh = Math.round(totalLoadKwh * (effectiveRenewableShare / 100) * 10) / 10;
  const newGridKwh = Math.round((totalLoadKwh - newRenewableKwh) * 10) / 10;
  const newFossilShare = Math.round(100 - effectiveRenewableShare);

  // 3. Food simulation
  // Yield boosted by rainfall, bio-fertilizers, & transport access, penalized by drought
  const yieldModifier = 1 + (rainfallVariation / 100) * 0.2
    + (regenerativeFarmingAdoption / 100) * 0.15
    + (bioFertilizerRatio / 100) * 0.1
    + ((transportInfraIndex - 50) / 100) * 0.1
    - (droughtFrequency - 1) * 0.2;

  const simulatedYieldKg = Math.round(baseline.food.yieldKg * Math.max(0.3, yieldModifier));
  const simulatedFoodSecurityIndex = Math.min(100, Math.max(10, Math.round(baseline.food.foodSecurityIndex * Math.max(0.4, yieldModifier))));

  // 4. Ecosystem simulation
  const carbonMultiplier = 1 + (regenerativeFarmingAdoption / 100) * 0.3
    + (effectiveRenewableShare / 100) * 0.15
    - (deforestationRate / 100) * 0.5;

  const simulatedCarbonOffset = Math.round(Math.max(0, baseline.ecosystem.carbonOffsetKgCo2 * carbonMultiplier * 10)) / 10;
  
  const erosionBoost = Math.round((regenerativeFarmingAdoption / 100) * 20 + (erosionBarrierRate / 100) * 25 - (deforestationRate / 100) * 30);
  const simulatedErosionIndex = Math.min(100, Math.max(0, baseline.ecosystem.erosionMitigationIndex + erosionBoost));
  
  const ecoHealthBoost = Math.round((regenerativeFarmingAdoption / 100) * 25 + (effectiveRenewableShare / 100) * 15 - (deforestationRate / 100) * 25);
  const simulatedEcoHealth = Math.min(100, Math.max(10, baseline.ecosystem.ecoHealthScore + ecoHealthBoost));

  // 5. Socioeconomics simulation
  const priceMultiplier = 1 + (marketPriceFluctuation / 100) + (exportTaxSubsidyRate / 100);
  const simulatedGrossRevenue = Math.round(baseline.socioeconomics.grossRevenueNpr * Math.max(0.2, priceMultiplier) * Math.max(0.4, yieldModifier));
  
  // Energy costs drop as grid tariff changes & renewable share increases
  const energyCost = totalLoadKwh * gridTariffNpr * (1 - effectiveRenewableShare / 100);
  const energySavings = totalLoadKwh * 10.5 - energyCost;

  const baseLaborCost = baseline.socioeconomics.laborDays * (1 + (laborRemittanceRate / 100) * 0.3) * 800;
  const simulatedNetRevenue = Math.round(Math.max(0, simulatedGrossRevenue - baseLaborCost - energyCost + energySavings));

  const jobMultiplier = 1 + (regenerativeFarmingAdoption / 100) * 0.2 - (laborRemittanceRate / 100) * 0.15;
  const simulatedDirectJobs = Math.round(Math.max(0.1, baseline.socioeconomics.directJobsCreated * jobMultiplier * 10)) / 10;
  const simulatedIndirectJobs = Math.round(simulatedDirectJobs * 0.5 * 10) / 10;
  const simulatedRevenuePerLaborDay = Math.round(simulatedGrossRevenue / Math.max(1, baseline.socioeconomics.laborDays * jobMultiplier));

  // Composite Nexus Balance Index recalculation
  const simulatedEcoFoodComposite = (simulatedFoodSecurityIndex + simulatedEcoHealth) / 2;
  const simulatedEcoMargin = (simulatedNetRevenue / Math.max(1, simulatedGrossRevenue)) * 100;
  const simulatedStressPenalty = (simulatedWaterStressIndex * 0.3) + (newFossilShare * 0.2);
  
  const simulatedNexusBalanceIndex = Math.min(
    100,
    Math.max(10, Math.round((simulatedEcoFoodComposite * 0.45) + (simulatedEcoMargin * 0.35) - simulatedStressPenalty + 20))
  );

  let simulatedNexusRating = 'Optimal Equilibrium';
  if (simulatedNexusBalanceIndex < 45) simulatedNexusRating = 'High Vulnerability & Imbalance';
  else if (simulatedNexusBalanceIndex < 60) simulatedNexusRating = 'Moderate Resource Pressure';
  else if (simulatedNexusBalanceIndex < 78) simulatedNexusRating = 'Sustainable Synergy';

  const simulated: WEFESOutput = {
    ...baseline,
    water: {
      consumptionLiters: simulatedConsumptionLiters,
      consumptionM3: simulatedConsumptionM3,
      waterStressIndex: simulatedWaterStressIndex,
      rating: simulatedWaterRating
    },
    energy: {
      loadKwh: totalLoadKwh,
      loadMj: baseline.energy.loadMj,
      gridKwh: newGridKwh,
      renewableKwh: newRenewableKwh,
      fossilSharePercent: Math.max(0, newFossilShare)
    },
    food: {
      yieldKg: simulatedYieldKg,
      biomassValueNpr: simulatedGrossRevenue,
      foodSecurityIndex: simulatedFoodSecurityIndex,
      nutritionalKcal: Math.round(baseline.food.nutritionalKcal * Math.max(0.4, yieldModifier))
    },
    ecosystem: {
      carbonOffsetKgCo2: simulatedCarbonOffset,
      erosionMitigationIndex: simulatedErosionIndex,
      ecoHealthScore: simulatedEcoHealth
    },
    socioeconomics: {
      grossRevenueNpr: simulatedGrossRevenue,
      netRevenueNpr: simulatedNetRevenue,
      laborDays: Math.round(baseline.socioeconomics.laborDays * jobMultiplier * 10) / 10,
      directJobsCreated: simulatedDirectJobs,
      indirectJobsCreated: simulatedIndirectJobs,
      revenuePerLaborDay: simulatedRevenuePerLaborDay
    },
    nexusBalanceIndex: simulatedNexusBalanceIndex,
    nexusRating: simulatedNexusRating,
    // Suitability is a biophysical district×crop constant — unchanged by scenario levers
    agroSuitability: baseline.agroSuitability,
  };

  const calcDelta = (sim: number, base: number) => {
    if (base === 0) return 0;
    return Math.round(((sim - base) / base) * 1000) / 10;
  };

  return {
    baseline,
    simulated,
    differentials: {
      waterDeltaPercent: calcDelta(simulated.water.consumptionLiters, baseline.water.consumptionLiters),
      energyDeltaPercent: calcDelta(simulated.energy.gridKwh, baseline.energy.gridKwh),
      revenueDeltaPercent: calcDelta(simulated.socioeconomics.netRevenueNpr, baseline.socioeconomics.netRevenueNpr),
      carbonDeltaPercent: calcDelta(simulated.ecosystem.carbonOffsetKgCo2, baseline.ecosystem.carbonOffsetKgCo2),
      ecoHealthDeltaPercent: calcDelta(simulated.ecosystem.ecoHealthScore, baseline.ecosystem.ecoHealthScore),
      jobsDeltaPercent: calcDelta(simulated.socioeconomics.directJobsCreated, baseline.socioeconomics.directJobsCreated),
      nexusBalanceDelta: Math.round((simulated.nexusBalanceIndex - baseline.nexusBalanceIndex) * 10) / 10
    },
    parameters
  };
}
