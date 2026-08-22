export interface AquacultureFishProfile {
  districtName: string;
  nationalAquacultureContext: {
    totalNationalFishProductionTonnes: '100,000 Tonnes (79% Aquaculture, 21% Capture)';
    activeFishFarmingHouseholds: '200,000 Households';
    totalHatcheriesNationwide: '130 Hatcheries (119 Private, 11 Government)';
  };
  pondOperationalModel: {
    pondSurfaceAreaHectares: number; // e.g. 1.0 ha
    primarySpeciesMix: string[]; // Rohu, Catla, Mrigal, Grass Carp, Common Carp
    stockingDensityFingerlingsPerHa: number;
    feedConversionRatioFCR: number; // 1.55 for pelleted feed
    annualFishYieldTonnesPerHa: number;
    farmgatePriceNprPerKg: number;
    grossFishRevenueNpr: number;
  };
  waterAndEvaporationBudget: {
    annualPondEvaporationLossM3: number;
    annualSeepageLossM3: number;
    totalAnnualAquacultureWaterDemandM3: number;
    groundwaterTubewellPumpingHours: number;
  };
  economicCostBreakdown: {
    variableCostTotalNpr: number;
    feedCostSharePct: 49.87; // 49.87% feed cost share from Dhanusha super-zone empirical study
    fingerlingCostSharePct: number;
    electricityPumpingSharePct: number;
    netAnnualReturnNprPerHa: number;
    benefitCostRatioBCR: number; // 1.33
  };
  riceFishCoCulturePotential: {
    isAgroEcologicallyViable: boolean;
    riceYieldBoostPct: number;
    pestSuppressionByCarpPct: number;
  };
  calibrationProvenance: string;
}

export function computeAquacultureModel(
  districtName: string,
  pondAreaHa: number = 1.0
): AquacultureFishProfile {
  const dNorm = districtName.toLowerCase();

  let yieldTon = 4.8;
  let priceKg = 280;
  let isSuperZone = ['dhanusha', 'bara', 'parsa', 'rautahat', 'saptari', 'siraha', 'morang', 'sunsari', 'chitwan', 'rupandehi', 'kailali', 'bardiya'].includes(dNorm);

  if (isSuperZone) {
    yieldTon = 5.6; // High intensive polycarp super-zone
    priceKg = 295;
  } else {
    yieldTon = 3.8;
    priceKg = 310;
  }

  const totalGrossRevenue = Math.round(pondAreaHa * yieldTon * 1000 * priceKg);

  // Water calculations: 1350 mm evap + 2.5 mm/day seepage across 1 ha (10,000 m²)
  const evapM3 = Math.round(pondAreaHa * 10000 * 1.35);
  const seepageM3 = Math.round(pondAreaHa * 10000 * (2.5 * 365 / 1000));
  const totalWaterM3 = evapM3 + seepageM3;
  const pumpingHours = Math.round(totalWaterM3 / 18); // 5 L/s STW discharge = 18 m³/hr

  // Economics from 2024 Dhanusha Super-Zone survey
  const totalCost = Math.round(totalGrossRevenue / 1.33);
  const netReturn = totalGrossRevenue - totalCost;

  return {
    districtName,
    nationalAquacultureContext: {
      totalNationalFishProductionTonnes: '100,000 Tonnes (79% Aquaculture, 21% Capture)',
      activeFishFarmingHouseholds: '200,000 Households',
      totalHatcheriesNationwide: '130 Hatcheries (119 Private, 11 Government)',
    },
    pondOperationalModel: {
      pondSurfaceAreaHectares: pondAreaHa,
      primarySpeciesMix: ['Rohu (Labeo rohita - 35%)', 'Catla (Gibelion catla - 25%)', 'Mrigal (Cirrhinus mrigala - 20%)', 'Grass Carp (20%)'],
      stockingDensityFingerlingsPerHa: 7500,
      feedConversionRatioFCR: 1.55,
      annualFishYieldTonnesPerHa: yieldTon,
      farmgatePriceNprPerKg: priceKg,
      grossFishRevenueNpr: totalGrossRevenue,
    },
    waterAndEvaporationBudget: {
      annualPondEvaporationLossM3: evapM3,
      annualSeepageLossM3: seepageM3,
      totalAnnualAquacultureWaterDemandM3: totalWaterM3,
      groundwaterTubewellPumpingHours: pumpingHours,
    },
    economicCostBreakdown: {
      variableCostTotalNpr: totalCost,
      feedCostSharePct: 49.87,
      fingerlingCostSharePct: 14.5,
      electricityPumpingSharePct: 12.8,
      netAnnualReturnNprPerHa: netReturn,
      benefitCostRatioBCR: 1.33,
    },
    riceFishCoCulturePotential: {
      isAgroEcologicallyViable: isSuperZone,
      riceYieldBoostPct: 12.5,
      pestSuppressionByCarpPct: 45.0,
    },
    calibrationProvenance: 'Calibrated using Directorate of Fisheries / Dhanusha Fish Super-Zone Empirical Economics (Archives of Ag & Env Sci 2024).',
  };
}
