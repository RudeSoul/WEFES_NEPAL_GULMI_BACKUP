import { District, Crop, CropUnit, WEFESOutput, CropSuitability } from '@wefes/shared-types';
import { convertToBaseUnit } from './conversions';
import { calculateFertilizerNexusImpact } from './fertilizerCalculator';

export const DEFAULT_GRID_TARIFF_NPR = 10.5; // Official Nepal NEA agricultural grid electricity tariff baseline (NPR/kWh)

export function calculateHarvestImpact(
  district: District,
  crop: Crop,
  quantity: number,
  unit: CropUnit,
  customGridTariffNpr: number = DEFAULT_GRID_TARIFF_NPR
): WEFESOutput {
  const { baseQuantity, baseUnit } = convertToBaseUnit(quantity, unit);

  // 1. Water Pillar
  const consumptionLiters = Math.round(baseQuantity * crop.waterFootprintPerUnit);
  const consumptionM3 = Math.round((consumptionLiters / 1000) * 100) / 100;
  const districtRainfallFactor = Math.max(0.5, district.avgRainfallMm / 1500);
  
  // Water stress index calculation relative to district rainfall
  const rawWaterStress = (consumptionM3 / (districtRainfallFactor * 50)) * 15;
  const waterStressIndex = Math.min(100, Math.max(5, Math.round(rawWaterStress)));

  let waterRating = 'Low Stress';
  if (waterStressIndex > 75) waterRating = 'Severe Water Stress';
  else if (waterStressIndex > 50) waterRating = 'High Water Stress';
  else if (waterStressIndex > 25) waterRating = 'Moderate Water Stress';

  // 2. Energy Pillar — reflects Nepal's clean hydro baseline boosted by local solar and hydro capacity
  const loadKwh = Math.round(baseQuantity * crop.energyReqPerUnit * 10) / 10;
  const loadMj = Math.round(loadKwh * 3.6 * 10) / 10;
  const hydroBoost = Math.min(0.20, ((district.totalHydroCapacityMW || 0) / 250) * 0.15);
  const solarBoost = ((district.solarRadiationKwh || 4.8) - 4.0) * 0.08;
  const baseRenewableShare = Math.min(0.95, Math.max(0.40, 0.60 + solarBoost + hydroBoost));
  const renewableKwh = Math.round(loadKwh * baseRenewableShare * 10) / 10;
  const gridKwh = Math.round((loadKwh - renewableKwh) * 10) / 10;
  const fossilSharePercent = Math.round((1 - baseRenewableShare) * 100);

  // ── BIOPHYSICAL SUITABILITY GATE ────────────────────────────────────────────
  // Run the FAO/AHP agro-ecological suitability engine for this crop × district.
  // realizedQuantity = what the farmer will actually harvest after climate
  // and altitude constraints. An unsuitable crop (e.g., coffee at 3,800 m)
  // will have a suitabilityFactor near 0.18, collapsing revenue and EIRR.
  const suitResult = evaluateCropFeasibilityMatrix(district, crop);
  const suitabilityScore = suitResult.finalSuitabilityScore;

  // Determine limiting factor label
  const minBio = Math.min(suitResult.soilScore, suitResult.thermalScore, suitResult.waterScore, suitResult.elevScore);
  let limitingFactor = 'None';
  if (minBio < 65) {
    if (minBio === suitResult.thermalScore) limitingFactor = 'Thermal Deficit';
    else if (minBio === suitResult.elevScore) limitingFactor = 'Altitude Envelope';
    else if (minBio === suitResult.waterScore) limitingFactor = 'Moisture / Rainfall';
    else if (minBio === suitResult.soilScore) limitingFactor = 'Soil Acidity (pH)';
  }

  // Suitability factor: score ≥ 80 → near full yield; score < 45 → heavy loss
  // We apply a non-linear curve so small deficiencies (S2/S3) are still
  // economically significant, and N-class crops face near-total collapse.
  const rawFactor = suitabilityScore / 100;
  // Apply a mild convex curve: low scores penalize more than proportionally
  const suitabilityFactor = Math.min(1.0, Math.max(0.05, Math.pow(rawFactor, 1.35)));

  const realizedQuantity = Math.round(baseQuantity * suitabilityFactor * 10) / 10;
  const unrealizedQuantityPct = Math.round((1 - suitabilityFactor) * 100);
  const isBiophysicallyFeasible = suitabilityScore >= 45;
  // ────────────────────────────────────────────────────────────────────────────

  // 3. Food & Yield Pillar — uses realizedQuantity
  const yieldKg = crop.baseUnitName === 'kg' ? realizedQuantity : Math.round(realizedQuantity * 650);
  const biomassValueNpr = Math.round(realizedQuantity * crop.marketValuePerUnit);
  const nutritionalKcal = Math.round(realizedQuantity * crop.caloriesPerUnit);
  const foodSecurityIndex = Math.min(100, Math.max(10, Math.round((nutritionalKcal / 100000) * 20 + (yieldKg / 500) * 15 + 30)));

  // 4. Ecosystem Pillar — uses realizedQuantity for carbon; erosion is land-based
  const carbonOffsetKgCo2 = Math.round(realizedQuantity * crop.carbonOffsetPerUnit * 10) / 10;
  let baseErosion = 40;
  if (crop.id === 'timber_sal') baseErosion = 85;
  else if (crop.id === 'tea' || crop.id === 'coffee' || crop.id === 'cardamom') baseErosion = 70;
  else if (crop.id === 'apple' || crop.id === 'orange' || crop.id === 'mango' || crop.id === 'banana') baseErosion = 65;
  else if (crop.id === 'sugarcane' || crop.id === 'bamboo') baseErosion = 60;
  const erosionMitigationIndex = Math.min(100, Math.round(baseErosion + (district.ecoZone === 'Mountain' ? 10 : 0)));
  const ecoHealthScore = Math.min(100, Math.max(15, Math.round((carbonOffsetKgCo2 / Math.max(1, realizedQuantity)) * 12 + erosionMitigationIndex * 0.6)));

  // 5. Socioeconomics Pillar — revenue driven by realizedQuantity
  const grossRevenueNpr = Math.round(realizedQuantity * crop.marketValuePerUnit);
  const laborDays = Math.max(1, Math.round(baseQuantity * crop.laborDaysPerUnit * 10) / 10); // labor committed on full area
  const laborCostNpr = Math.round(laborDays * district.laborRateNprPerDay);
  const energyCostNpr = Math.round(loadKwh * customGridTariffNpr);
  const netRevenueNpr = Math.max(0, grossRevenueNpr - laborCostNpr - energyCostNpr);
  const directJobsCreated = Math.round((laborDays / 250) * 10) / 10; // 250 person-days = 1 FTE
  const indirectJobsCreated = Math.round(directJobsCreated * 0.5 * 10) / 10;
  const revenuePerLaborDay = Math.round(grossRevenueNpr / Math.max(1, laborDays));

  // Composite Nexus Balance Index (0 - 100)
  const ecoFoodComposite = (foodSecurityIndex + ecoHealthScore) / 2;
  const ecoMargin = (netRevenueNpr / Math.max(1, grossRevenueNpr)) * 100;
  const stressPenalty = (waterStressIndex * 0.3) + (fossilSharePercent * 0.2);
  const nexusBalanceIndex = Math.min(100, Math.max(10, Math.round((ecoFoodComposite * 0.45) + (ecoMargin * 0.35) - stressPenalty + 20)));

  let nexusRating = 'Optimal Equilibrium';
  if (nexusBalanceIndex < 45) nexusRating = 'High Vulnerability & Imbalance';
  else if (nexusBalanceIndex < 60) nexusRating = 'Moderate Resource Pressure';
  else if (nexusBalanceIndex < 78) nexusRating = 'Sustainable Synergy';

  // 6. Fertilizer Nexus & Spatial Logistics Engine
  const fertilizerNexus = calculateFertilizerNexusImpact({
    district,
    crop,
    harvestQuantityKg: crop.baseUnitName === 'kg' ? baseQuantity : baseQuantity * 650,
  });

  return {
    districtId: district.id,
    districtName: district.name,
    cropId: crop.id,
    cropName: crop.name,
    inputQuantity: quantity,
    inputUnit: unit,
    baseQuantity,
    baseUnit,
    water: {
      consumptionLiters,
      consumptionM3,
      waterStressIndex,
      rating: waterRating
    },
    energy: {
      loadKwh,
      loadMj,
      gridKwh,
      renewableKwh,
      fossilSharePercent
    },
    food: {
      yieldKg,
      biomassValueNpr,
      foodSecurityIndex,
      nutritionalKcal
    },
    ecosystem: {
      carbonOffsetKgCo2,
      erosionMitigationIndex,
      ecoHealthScore
    },
    socioeconomics: {
      grossRevenueNpr,
      netRevenueNpr,
      laborDays,
      directJobsCreated,
      indirectJobsCreated,
      revenuePerLaborDay
    },
    nexusBalanceIndex,
    nexusRating,
    agroSuitability: {
      suitabilityScore,
      suitabilityFactor: Math.round(suitabilityFactor * 1000) / 1000,
      faoClass: suitResult.faoClass,
      limitingFactor,
      realizedQuantity,
      unrealizedQuantityPct,
      isBiophysicallyFeasible,
    },
    fertilizerNexus,
  };
}

// ─── SCIENTIFIC FAO ECOCROP & AGRO-ECOLOGICAL SUITABILITY ENGINE ───

export interface CropAgroEnvelope {
  altMin: number; altOptMin: number; altOptMax: number; altMax: number;
  tempMin: number; tempOptMin: number; tempOptMax: number; tempMax: number;
  rainMin: number; rainOptMin: number; rainOptMax: number; rainMax: number;
  phMin: number; phOptMin: number; phOptMax: number; phMax: number;
}

export const CROP_AGRO_ENVELOPES: Record<string, CropAgroEnvelope> = {
  coffee: {
    altMin: 600, altOptMin: 1000, altOptMax: 1800, altMax: 2200,
    tempMin: 12, tempOptMin: 15, tempOptMax: 24, tempMax: 30,
    rainMin: 900, rainOptMin: 1400, rainOptMax: 2800, rainMax: 3600,
    phMin: 4.8, phOptMin: 5.5, phOptMax: 6.8, phMax: 7.8,
  },
  tea: {
    altMin: 800, altOptMin: 1200, altOptMax: 2200, altMax: 2600,
    tempMin: 10, tempOptMin: 14, tempOptMax: 22, tempMax: 28,
    rainMin: 1000, rainOptMin: 1600, rainOptMax: 3200, rainMax: 4200,
    phMin: 4.5, phOptMin: 5.0, phOptMax: 6.0, phMax: 7.0,
  },
  cardamom: {
    altMin: 600, altOptMin: 1000, altOptMax: 2100, altMax: 2500,
    tempMin: 8, tempOptMin: 12, tempOptMax: 22, tempMax: 28,
    rainMin: 1200, rainOptMin: 1800, rainOptMax: 3600, rainMax: 4600,
    phMin: 4.5, phOptMin: 5.0, phOptMax: 6.5, phMax: 7.4,
  },
  apple: {
    altMin: 1500, altOptMin: 2000, altOptMax: 3400, altMax: 3800,
    tempMin: -15, tempOptMin: 4, tempOptMax: 18, tempMax: 28,
    rainMin: 400, rainOptMin: 600, rainOptMax: 1400, rainMax: 2400,
    phMin: 5.2, phOptMin: 6.0, phOptMax: 7.0, phMax: 8.0,
  },
  orange: {
    altMin: 400, altOptMin: 800, altOptMax: 1500, altMax: 1900,
    tempMin: 10, tempOptMin: 15, tempOptMax: 28, tempMax: 35,
    rainMin: 800, rainOptMin: 1200, rainOptMax: 2600, rainMax: 3400,
    phMin: 5.2, phOptMin: 6.0, phOptMax: 7.0, phMax: 8.0,
  },
  rice: {
    altMin: 60, altOptMin: 100, altOptMax: 1600, altMax: 2600,
    tempMin: 15, tempOptMin: 22, tempOptMax: 32, tempMax: 38,
    rainMin: 800, rainOptMin: 1400, rainOptMax: 3000, rainMax: 4500,
    phMin: 5.0, phOptMin: 5.5, phOptMax: 7.2, phMax: 8.4,
  },
  maize: {
    altMin: 60, altOptMin: 300, altOptMax: 2200, altMax: 2900,
    tempMin: 12, tempOptMin: 18, tempOptMax: 28, tempMax: 35,
    rainMin: 500, rainOptMin: 900, rainOptMax: 2600, rainMax: 3800,
    phMin: 5.0, phOptMin: 5.8, phOptMax: 7.0, phMax: 8.2,
  },
  wheat: {
    altMin: 60, altOptMin: 100, altOptMax: 2400, altMax: 3200,
    tempMin: 4, tempOptMin: 12, tempOptMax: 22, tempMax: 32,
    rainMin: 250, rainOptMin: 500, rainOptMax: 2400, rainMax: 3600,
    phMin: 5.2, phOptMin: 6.0, phOptMax: 7.5, phMax: 8.4,
  },
  buckwheat: {
    altMin: 800, altOptMin: 1600, altOptMax: 3800, altMax: 4400,
    tempMin: 4, tempOptMin: 10, tempOptMax: 20, tempMax: 28,
    rainMin: 250, rainOptMin: 450, rainOptMax: 2200, rainMax: 3200,
    phMin: 4.5, phOptMin: 5.5, phOptMax: 7.0, phMax: 8.0,
  },
  potato: {
    altMin: 100, altOptMin: 1000, altOptMax: 3500, altMax: 4200,
    tempMin: 5, tempOptMin: 12, tempOptMax: 20, tempMax: 28,
    rainMin: 400, rainOptMin: 650, rainOptMax: 2500, rainMax: 3800,
    phMin: 4.5, phOptMin: 5.2, phOptMax: 6.5, phMax: 7.8,
  },
  ginger: {
    altMin: 200, altOptMin: 600, altOptMax: 1600, altMax: 2100,
    tempMin: 14, tempOptMin: 20, tempOptMax: 30, tempMax: 36,
    rainMin: 900, rainOptMin: 1500, rainOptMax: 3000, rainMax: 4000,
    phMin: 5.0, phOptMin: 5.8, phOptMax: 6.8, phMax: 7.8,
  },
  sugarcane: {
    altMin: 60, altOptMin: 80, altOptMax: 700, altMax: 1100,
    tempMin: 16, tempOptMin: 24, tempOptMax: 34, tempMax: 42,
    rainMin: 900, rainOptMin: 1500, rainOptMax: 3000, rainMax: 4200,
    phMin: 5.2, phOptMin: 6.0, phOptMax: 7.5, phMax: 8.4,
  },
  mustard: {
    altMin: 60, altOptMin: 80, altOptMax: 1200, altMax: 1800,
    tempMin: 8, tempOptMin: 15, tempOptMax: 25, tempMax: 34,
    rainMin: 250, rainOptMin: 500, rainOptMax: 2200, rainMax: 3200,
    phMin: 5.2, phOptMin: 6.0, phOptMax: 7.5, phMax: 8.2,
  },
  lentil: {
    altMin: 60, altOptMin: 80, altOptMax: 1100, altMax: 1600,
    tempMin: 10, tempOptMin: 16, tempOptMax: 26, tempMax: 34,
    rainMin: 250, rainOptMin: 450, rainOptMax: 2000, rainMax: 3000,
    phMin: 5.5, phOptMin: 6.2, phOptMax: 7.8, phMax: 8.5,
  },
  millet: {
    altMin: 200, altOptMin: 600, altOptMax: 2400, altMax: 3100,
    tempMin: 8, tempOptMin: 16, tempOptMax: 28, tempMax: 35,
    rainMin: 350, rainOptMin: 600, rainOptMax: 2400, rainMax: 3500,
    phMin: 4.5, phOptMin: 5.5, phOptMax: 7.2, phMax: 8.2,
  },
  timber_sal: {
    altMin: 60, altOptMin: 100, altOptMax: 800, altMax: 1300,
    tempMin: 14, tempOptMin: 22, tempOptMax: 35, tempMax: 44,
    rainMin: 900, rainOptMin: 1400, rainOptMax: 3000, rainMax: 4000,
    phMin: 4.8, phOptMin: 5.5, phOptMax: 7.0, phMax: 8.2,
  },
  mango: {
    altMin: 60, altOptMin: 80, altOptMax: 900, altMax: 1200,
    tempMin: 15, tempOptMin: 24, tempOptMax: 35, tempMax: 44,
    rainMin: 700, rainOptMin: 1200, rainOptMax: 2600, rainMax: 3600,
    phMin: 5.2, phOptMin: 6.0, phOptMax: 7.5, phMax: 8.4,
  },
  banana: {
    altMin: 60, altOptMin: 80, altOptMax: 1300, altMax: 1600,
    tempMin: 14, tempOptMin: 22, tempOptMax: 34, tempMax: 42,
    rainMin: 900, rainOptMin: 1500, rainOptMax: 3000, rainMax: 4000,
    phMin: 5.2, phOptMin: 6.0, phOptMax: 7.2, phMax: 8.2,
  }
};

export function calculateTransferFactor(val: number, minAbs: number, optMin: number, optMax: number, maxAbs: number): number {
  if (val < minAbs) {
    const deficit = minAbs - val;
    return Math.max(0.10, 0.40 - (deficit / Math.max(1, minAbs)) * 0.30);
  }
  if (val > maxAbs) {
    const excess = val - maxAbs;
    return Math.max(0.10, 0.40 - (excess / Math.max(1, maxAbs)) * 0.30);
  }
  if (val >= optMin && val <= optMax) return 1.0;
  if (val >= minAbs && val < optMin) {
    return 0.40 + 0.60 * ((val - minAbs) / Math.max(0.001, optMin - minAbs));
  }
  if (val > optMax && val <= maxAbs) {
    return 0.40 + 0.60 * ((maxAbs - val) / Math.max(0.001, maxAbs - optMax));
  }
  return 0.40;
}

/**
 * FAO Land Evaluation & AHP Framework Multi-Criteria Suitability Evaluator
 * 
 * Computes:
 * 1. 5 Individual Criteria Scores (0 - 100)
 * 2. AHP Weighted Biophysical Composite Base
 * 3. FAO Non-Compensatory Limiting Factor Gate (Liebig Threshold Penalty)
 */
export function evaluateCropFeasibilityMatrix(district: District, crop: Crop) {
  const env = CROP_AGRO_ENVELOPES[crop.id] || {
    altMin: 60, altOptMin: 100, altOptMax: 2000, altMax: 3000,
    tempMin: 5, tempOptMin: 15, tempOptMax: 28, tempMax: 36,
    rainMin: 400, rainOptMin: 800, rainOptMax: 2400, rainMax: 3600,
    phMin: 4.8, phOptMin: 5.5, phOptMax: 7.5, phMax: 8.5
  };

  // 1. Elevation metrics & Overlap
  let dMinElev = 200, dMaxElev = 2200;
  if (district.elevationRange) {
    const parts = district.elevationRange.replace(/m/gi, '').split('-').map(s => parseFloat(s.trim()));
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      dMinElev = parts[0];
      dMaxElev = parts[1];
    }
  } else {
    if (district.ecoZone === 'Terai') { dMinElev = 60; dMaxElev = 350; }
    else if (district.ecoZone === 'Mountain') { dMinElev = 1200; dMaxElev = 6500; }
    else { dMinElev = 450; dMaxElev = 2800; }
  }

  const overlapMin = Math.max(dMinElev, env.altMin);
  const overlapMax = Math.min(dMaxElev, env.altMax);
  const hasOverlap = overlapMax >= overlapMin;

  let effectiveElev = (dMinElev + dMaxElev) / 2;
  let phiElev = 0.3;

  if (hasOverlap) {
    const targetOpt = (env.altOptMin + env.altOptMax) / 2;
    effectiveElev = Math.max(overlapMin, Math.min(overlapMax, targetOpt));
    phiElev = calculateTransferFactor(effectiveElev, env.altMin, env.altOptMin, env.altOptMax, env.altMax);
  } else {
    if (dMinElev > env.altMax) {
      const distAbove = dMinElev - env.altMax;
      phiElev = Math.max(0.10, 0.35 - (distAbove / 2000) * 0.25);
    } else {
      const distBelow = env.altMin - dMaxElev;
      phiElev = Math.max(0.10, 0.35 - (distBelow / 1000) * 0.25);
    }
  }

  // 2. Climate & Soil Metrics
  const avgTemp = district.avgTempC ?? (district.ecoZone === 'Terai' ? 24.5 : district.ecoZone === 'Mountain' ? 10.5 : 18.0);
  const avgRainfall = district.avgRainfallMm ?? 1500;
  const soilPh = district.baseSoilPh ?? 6.2;
  const solarRad = district.solarRadiationKwh ?? 4.8;
  const laborWage = district.laborRateNprPerDay ?? 750;

  // 3. Transfer Factors
  const phiTemp = calculateTransferFactor(avgTemp, env.tempMin, env.tempOptMin, env.tempOptMax, env.tempMax);
  const phiRain = calculateTransferFactor(avgRainfall, env.rainMin, env.rainOptMin, env.rainOptMax, env.rainMax);
  const phiSoilPh = calculateTransferFactor(soilPh, env.phMin, env.phOptMin, env.phOptMax, env.phMax);

  // 4. Individual Criteria Scores (0 - 100)
  const soilScore = Math.min(98, Math.max(15, Math.round(phiSoilPh * 98)));
  const thermalScore = Math.min(98, Math.max(15, Math.round(phiTemp * 98)));
  const waterScore = Math.min(98, Math.max(15, Math.round(phiRain * 98)));
  const elevScore = Math.min(98, Math.max(15, Math.round(phiElev * 98)));
  const laborScore = Math.min(96, Math.max(25, Math.round(100 - (laborWage / 1600) * 35 + (crop.marketValuePerUnit > 150 ? 8 : 0))));

  // 5. AHP Agronomic Weighted Base (20% Soil + 25% Thermal + 25% Moisture + 15% Elevation + 15% Labor)
  const ahpWeightedBase = (soilScore * 0.20) + (thermalScore * 0.25) + (waterScore * 0.25) + (elevScore * 0.15) + (laborScore * 0.15);

  // 6. FAO Non-Compensatory Limiting Factor Gate (Liebig Threshold Function)
  // If all factors >= 55 (viable), modifier is 1.0 (no penalty, pure weighted score).
  // If any biophysical factor drops below 35 (critical deficit/barrier), apply non-linear limitation modifier.
  const minBiophysicalScore = Math.min(soilScore, thermalScore, waterScore, elevScore);
  let limitingModifier = 1.0;
  if (minBiophysicalScore < 55) {
    if (minBiophysicalScore >= 35) {
      limitingModifier = 0.85 + 0.15 * ((minBiophysicalScore - 35) / 20); // 0.85 to 1.0
    } else if (minBiophysicalScore >= 20) {
      limitingModifier = 0.55 + 0.30 * ((minBiophysicalScore - 20) / 15); // 0.55 to 0.85
    } else {
      limitingModifier = Math.max(0.15, (minBiophysicalScore / 20) * 0.55); // < 0.55 for lethal non-arable barriers
    }
  }

  const finalSuitabilityScore = Math.min(98, Math.max(15, Math.round(ahpWeightedBase * limitingModifier)));

  // FAO Suitability Class
  let faoClass: 'S1 (Highly Suitable)' | 'S2 (Moderately Suitable)' | 'S3 (Marginally Suitable)' | 'N (Not Suitable)' = 'S1 (Highly Suitable)';
  if (finalSuitabilityScore >= 80) faoClass = 'S1 (Highly Suitable)';
  else if (finalSuitabilityScore >= 65) faoClass = 'S2 (Moderately Suitable)';
  else if (finalSuitabilityScore >= 45) faoClass = 'S3 (Marginally Suitable)';
  else faoClass = 'N (Not Suitable)';

  return {
    soilScore,
    thermalScore,
    waterScore,
    elevScore,
    laborScore,
    ahpWeightedBase: Math.round(ahpWeightedBase),
    limitingModifier: Math.round(limitingModifier * 100) / 100,
    finalSuitabilityScore,
    faoClass,
    env,
    dPh: soilPh,
    dTemp: avgTemp,
    dRain: avgRainfall,
    dMinElev,
    dMaxElev,
    dLabor: laborWage,
    solarRad
  };
}

export function computeCropSuitability(district: District, crop: Crop): CropSuitability {
  const result = evaluateCropFeasibilityMatrix(district, crop);

  // Determine limiting factor
  let limitingFactor = 'None';
  const minScore = Math.min(result.soilScore, result.thermalScore, result.waterScore, result.elevScore);
  if (minScore < 65) {
    if (minScore === result.thermalScore) limitingFactor = 'Thermal Deficit';
    else if (minScore === result.elevScore) limitingFactor = 'Altitude Envelope';
    else if (minScore === result.waterScore) limitingFactor = 'Moisture / Rainfall';
    else if (minScore === result.soilScore) limitingFactor = 'Soil Acidity (pH)';
  }

  let faoClass: 'S1' | 'S2' | 'S3' | 'N1' | 'N2' = 'S1';
  let faoLabel = 'Highly Suitable';
  if (result.finalSuitabilityScore >= 80) {
    faoClass = 'S1';
    faoLabel = 'Highly Suitable (Optimal)';
  } else if (result.finalSuitabilityScore >= 65) {
    faoClass = 'S2';
    faoLabel = 'Moderately Suitable';
  } else if (result.finalSuitabilityScore >= 45) {
    faoClass = 'S3';
    faoLabel = 'Marginally Suitable';
  } else if (result.finalSuitabilityScore >= 25) {
    faoClass = 'N1';
    faoLabel = 'Currently Not Suitable';
  } else {
    faoClass = 'N2';
    faoLabel = 'Permanently Unsuitable';
  }

  // 5 WEFES Pillar Scores
  const pillarWater = result.waterScore;
  const pillarEnergy = Math.min(100, Math.max(25, Math.round(50 + (result.solarRad - 4.0) * 15 + (crop.energyReqPerUnit <= 0.35 ? 10 : 0))));
  const pillarFood = Math.min(100, Math.max(25, Math.round((result.elevScore * 0.40) + (result.thermalScore * 0.35) + (result.soilScore * 0.25))));
  const pillarEco = Math.min(100, Math.max(25, Math.round((crop.carbonOffsetPerUnit * 12 + (result.soilScore / 100) * 35 + 30))));
  const pillarSocio = Math.min(100, Math.max(25, Math.round((result.laborScore * 0.60) + (Math.min(100, crop.marketValuePerUnit) * 0.40))));

  return {
    cropId: crop.id,
    cropName: crop.name,
    suitabilityScore: result.finalSuitabilityScore,
    faoClass,
    faoLabel,
    limitingFactor,
    season: crop.season,
    seasonLabelNepali: crop.seasonLabelNepali,
    pillarScores: {
      water: pillarWater,
      energy: pillarEnergy,
      food: pillarFood,
      ecosystem: pillarEco,
      socioeconomics: pillarSocio
    }
  };
}
