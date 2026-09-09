import {
  FertilizerImpactProfile,
  FertilizerNutrientDose,
  PalikaLogisticsRoute,
  District,
  Crop,
} from '@wefes/shared-types';

// ─── NARC NATIONAL SOIL SCIENCE RESEARCH CENTRE (NSSRC) 2023 RECOMMENDATIONS ─
export const NARC_CROP_NUTRIENT_DOSES: Record<string, {
  cropId: string; nKgPerHa: number; p2o5KgPerHa: number; k2oKgPerHa: number;
  znKgPerHa: number; bKgPerHa: number; organicManureTonPerHa: number; description: string;
}> = {
  rice: { cropId: 'rice', nKgPerHa: 120, p2o5KgPerHa: 40, k2oKgPerHa: 40, znKgPerHa: 25, bKgPerHa: 10, organicManureTonPerHa: 6.0, description: 'NARC 2023 Standard: 120:40:40 kg/ha NPK + 25kg Zinc Sulphate in Terai/Inner Terai.' },
  maize: { cropId: 'maize', nKgPerHa: 120, p2o5KgPerHa: 60, k2oKgPerHa: 40, znKgPerHa: 15, bKgPerHa: 10, organicManureTonPerHa: 10.0, description: 'NARC 2023 Standard: 120:60:40 kg/ha NPK + 10 t FYM for hybrid/improved maize.' },
  wheat: { cropId: 'wheat', nKgPerHa: 120, p2o5KgPerHa: 50, k2oKgPerHa: 50, znKgPerHa: 15, bKgPerHa: 10, organicManureTonPerHa: 6.0, description: 'NARC 2023 Standard: 120:50:50 kg/ha NPK for irrigated winter wheat.' },
  potato: { cropId: 'potato', nKgPerHa: 100, p2o5KgPerHa: 100, k2oKgPerHa: 60, znKgPerHa: 20, bKgPerHa: 15, organicManureTonPerHa: 15.0, description: 'NARC High-P requirement: 100:100:60 kg/ha NPK + 15 t compost.' },
  coffee: { cropId: 'coffee', nKgPerHa: 80, p2o5KgPerHa: 40, k2oKgPerHa: 80, znKgPerHa: 10, bKgPerHa: 10, organicManureTonPerHa: 12.0, description: 'Agroforestry Shade: 80:40:80 kg/ha NPK + heavy organic mulch.' },
  tea: { cropId: 'tea', nKgPerHa: 90, p2o5KgPerHa: 30, k2oKgPerHa: 60, znKgPerHa: 10, bKgPerHa: 8, organicManureTonPerHa: 10.0, description: 'High-altitude Tea: 90:30:60 kg/ha NPK + organic bio-slurry.' },
  cardamom: { cropId: 'cardamom', nKgPerHa: 40, p2o5KgPerHa: 40, k2oKgPerHa: 60, znKgPerHa: 5, bKgPerHa: 5, organicManureTonPerHa: 15.0, description: 'Shade Agroforestry: 40:40:60 kg/ha NPK + 15 t forest leaf litter compost.' },
  apple: { cropId: 'apple', nKgPerHa: 70, p2o5KgPerHa: 50, k2oKgPerHa: 70, znKgPerHa: 15, bKgPerHa: 15, organicManureTonPerHa: 20.0, description: 'Temperate Orchard: 70:50:70 kg/ha NPK + 20 t FYM + Boron for fruit set.' },
  orange: { cropId: 'orange', nKgPerHa: 80, p2o5KgPerHa: 40, k2oKgPerHa: 60, znKgPerHa: 20, bKgPerHa: 12, organicManureTonPerHa: 15.0, description: 'Mandarin Orchard: 80:40:60 kg/ha NPK + micronutrient foliar spray.' },
  ginger: { cropId: 'ginger', nKgPerHa: 90, p2o5KgPerHa: 50, k2oKgPerHa: 60, znKgPerHa: 15, bKgPerHa: 10, organicManureTonPerHa: 25.0, description: 'Heavy Rhizome Feeder: 90:50:60 kg/ha NPK + 25 t FYM mulch.' },
  mustard: { cropId: 'mustard', nKgPerHa: 60, p2o5KgPerHa: 40, k2oKgPerHa: 20, znKgPerHa: 10, bKgPerHa: 10, organicManureTonPerHa: 5.0, description: 'Oilseed: 60:40:20 kg/ha NPK + sulphur/boron for oil synthesis.' },
  lentil: { cropId: 'lentil', nKgPerHa: 20, p2o5KgPerHa: 40, k2oKgPerHa: 20, znKgPerHa: 5, bKgPerHa: 5, organicManureTonPerHa: 4.0, description: 'N-Fixing Pulse: Starter 20:40:20 kg/ha NPK (rhizobial nodulation supplies N).' },
  millet: { cropId: 'millet', nKgPerHa: 40, p2o5KgPerHa: 30, k2oKgPerHa: 20, znKgPerHa: 5, bKgPerHa: 5, organicManureTonPerHa: 6.0, description: 'Drought-hardy Cereal: 40:30:20 kg/ha NPK + 6 t compost.' },
  buckwheat: { cropId: 'buckwheat', nKgPerHa: 30, p2o5KgPerHa: 30, k2oKgPerHa: 20, znKgPerHa: 5, bKgPerHa: 5, organicManureTonPerHa: 5.0, description: 'Mountain Pseudocereal: 30:30:20 kg/ha NPK.' },
  sugarcane: { cropId: 'sugarcane', nKgPerHa: 150, p2o5KgPerHa: 60, k2oKgPerHa: 60, znKgPerHa: 25, bKgPerHa: 10, organicManureTonPerHa: 15.0, description: 'High Biomass Grass: 150:60:60 kg/ha NPK.' },
  banana: { cropId: 'banana', nKgPerHa: 150, p2o5KgPerHa: 50, k2oKgPerHa: 180, znKgPerHa: 20, bKgPerHa: 10, organicManureTonPerHa: 20.0, description: 'High Potash Feeder: 150:50:180 kg/ha NPK.' },
  timber_sal: { cropId: 'timber_sal', nKgPerHa: 20, p2o5KgPerHa: 20, k2oKgPerHa: 20, znKgPerHa: 0, bKgPerHa: 0, organicManureTonPerHa: 5.0, description: 'Native Forestry: Initial sapling nursery incorporation only.' },
};

// ─── OFFICIAL MOALD MARCH 2023 CHEMICAL FERTILIZER PRICING BASELINES ─────────
export const MOALD_FERTILIZER_PRICING_2023 = {
  subsidizedRetailNprPerKg: {
    urea: 25.0,      // NPR 1,250 per 50kg bag (Updated March 2023)
    dap: 50.0,       // NPR 2,500 per 50kg bag (Updated March 2023)
    mop: 40.0,       // NPR 2,000 per 50kg bag (Updated March 2023)
    zincSulphate: 140.0,
    borax: 180.0,
  },
  internationalCifNprPerKg: {
    urea: 60.0,
    dap: 105.0,
    mop: 68.0,
  },
  freightRateNprPerTonKm: {
    teraiFlat: 5.50,
    mountainHighway: 14.00,
    lastMileEarthen: 40.00,
    transshipmentLaborFeePerTon: 750.0,
  },
  energyIntensityMjPerTonKm: {
    teraiFlat: 0.8,
    mountainHighway: 2.5,
    lastMileEarthen: 4.5,
  },
  dieselEnergyMjPerLiter: 38.6,
  dieselEmissionFactorKgCo2ePerMj: 0.074,
  emptyReturnPenaltyFactor: 1.60,
};

export const NEPAL_CUSTOMS_BORDER_PORTS: Record<string, { id: PalikaLogisticsRoute['customsPortId']; name: string }> = {
  birgunj: { id: 'birgunj', name: 'Birgunj Integrated Check Post (ICP)' },
  bhairahawa: { id: 'bhairahawa', name: 'Bhairahawa / Belahiya ICP' },
  biratnagar: { id: 'biratnagar', name: 'Biratnagar / Rani ICP' },
  nepalgunj: { id: 'nepalgunj', name: 'Nepalgunj / Jamunaha ICP' },
  kakarbhitta: { id: 'kakarbhitta', name: 'Mechi / Kakarbhitta Border Depot' },
  dhangadhi: { id: 'dhangadhi', name: 'Mohana / Trinagar Border Depot' },
};

function getLocalPalikaRoute(districtId: string, palikaName?: string, palikaId?: string): PalikaLogisticsRoute {
  const d = districtId.toLowerCase();
  let customsPortId: PalikaLogisticsRoute['customsPortId'] = 'bhairahawa';
  let distanceTeraiKm = 85;
  let distanceHillKm = 92;
  let distanceLastMileKm = 26;
  let elevationDeltaM = 1250;
  let lastMileRoadType: PalikaLogisticsRoute['lastMileRoadType'] = 'Earthen Mountain';

  if (['rupandehi', 'kapilvastu'].includes(d)) {
    distanceTeraiKm = 25; distanceHillKm = 0; distanceLastMileKm = 10; elevationDeltaM = 15; lastMileRoadType = 'Paved Highway';
  } else if (d === 'palpa') {
    distanceTeraiKm = 45; distanceHillKm = 42; distanceLastMileKm = 18; elevationDeltaM = 950; lastMileRoadType = 'Gravel Valley';
  } else if (d === 'arghakhanchi') {
    distanceTeraiKm = 65; distanceHillKm = 78; distanceLastMileKm = 24; elevationDeltaM = 1180; lastMileRoadType = 'Gravel Valley';
  }

  const port = NEPAL_CUSTOMS_BORDER_PORTS[customsPortId] || NEPAL_CUSTOMS_BORDER_PORTS.bhairahawa;
  return {
    palikaId: palikaId || `${d}-hq`,
    palikaName: palikaName || `${districtId.toUpperCase()} Center`,
    districtId: d,
    districtName: districtId,
    customsPortId,
    customsPortName: port.name,
    distanceTeraiKm,
    distanceHillKm,
    distanceLastMileKm,
    totalDistanceKm: distanceTeraiKm + distanceHillKm + distanceLastMileKm,
    elevationDeltaM,
    lastMileRoadType,
  };
}

export interface FertilizerCalculatorInput {
  district: District;
  crop: Crop;
  harvestQuantityKg: number;
  palikaId?: string;
  palikaName?: string;
  organicSubstitutionPct?: number; // 0 to 100% (default: 0%)
  scarcityMarkupPct?: number;       // 0 to 80% (default: 0%)
  dieselPriceNprPerLiter?: number;  // default: 175 NPR/L
  customFreightRates?: {
    terai?: number;
    mountain?: number;
    lastMile?: number;
    transshipment?: number;
  };
}

/**
 * Fertilizer Nexus & Spatial Logistics Engine
 * 
 * Computes the 5-pillar impact of nutrient management, freight physics across
 * terrain gradients, national forex outflow, GoN subsidy burden, farmer VCR,
 * and the decentralized circular bioeconomy tipping point.
 */
export function calculateFertilizerNexusImpact(input: FertilizerCalculatorInput): FertilizerImpactProfile {
  const {
    district,
    crop,
    harvestQuantityKg,
    palikaId,
    palikaName,
    organicSubstitutionPct = 0,
    scarcityMarkupPct = 0,
    dieselPriceNprPerLiter = 175,
    customFreightRates,
  } = input;

  const orgRatio = Math.min(1.0, Math.max(0.0, organicSubstitutionPct / 100));
  const chemRatio = 1.0 - orgRatio;
  const scarcityRatio = Math.min(0.80, Math.max(0.0, scarcityMarkupPct / 100));

  // 1. Estimate Cultivated Land Area (ha) from crop harvest
  // Yield benchmarks per ha: Cereals ~3.2 t/ha, Potatoes ~16 t/ha, Vegetables/Fruits ~12 t/ha, Pulses ~1.2 t/ha
  let standardYieldKgPerHa = 3200;
  if (['potato', 'banana', 'sugarcane'].includes(crop.id)) standardYieldKgPerHa = 15000;
  else if (['apple', 'orange', 'mango', 'ginger'].includes(crop.id)) standardYieldKgPerHa = 9000;
  else if (['coffee', 'tea', 'cardamom'].includes(crop.id)) standardYieldKgPerHa = 1200;
  else if (['lentil', 'mustard', 'millet', 'buckwheat'].includes(crop.id)) standardYieldKgPerHa = 1400;

  const estimatedAreaHa = Math.max(0.05, harvestQuantityKg / standardYieldKgPerHa);

  // 2. Retrieve NARC NSSRC 2023 Recommended Nutrient Dose
  const narcDose = NARC_CROP_NUTRIENT_DOSES[crop.id] || {
    cropId: crop.id,
    nKgPerHa: 100,
    p2o5KgPerHa: 40,
    k2oKgPerHa: 30,
    znKgPerHa: 15,
    bKgPerHa: 10,
    organicManureTonPerHa: 8.0,
    description: 'Standard Agronomic Dosing',
  };

  // Convert pure NPK to commercial fertilizer bag weights per ha
  const dapKgPerHa = narcDose.p2o5KgPerHa / 0.46;
  const nFromDap = dapKgPerHa * 0.18;
  const remainingN = Math.max(0, narcDose.nKgPerHa - nFromDap);
  const ureaKgPerHa = remainingN / 0.46;
  const mopKgPerHa = narcDose.k2oKgPerHa / 0.60;

  const ureaBagsPerHa = Number((ureaKgPerHa / 50).toFixed(1));
  const dapBagsPerHa = Number((dapKgPerHa / 50).toFixed(1));
  const mopBagsPerHa = Number((mopKgPerHa / 50).toFixed(1));

  const recommendedDose: FertilizerNutrientDose = {
    nitrogenKgPerHa: narcDose.nKgPerHa,
    phosphorusP2O5KgPerHa: narcDose.p2o5KgPerHa,
    potassiumK2OKgPerHa: narcDose.k2oKgPerHa,
    zincKgPerHa: narcDose.znKgPerHa,
    boronKgPerHa: narcDose.bKgPerHa,
    organicManureTonPerHa: narcDose.organicManureTonPerHa,
    ureaBags50kg: ureaBagsPerHa,
    dapBags50kg: dapBagsPerHa,
    mopBags50kg: mopBagsPerHa,
  };

  // Actual chemical amounts applied based on organic substitution ratio
  const appliedChemicalUreaKg = Math.round(ureaKgPerHa * estimatedAreaHa * chemRatio);
  const appliedChemicalDapKg = Math.round(dapKgPerHa * estimatedAreaHa * chemRatio);
  const appliedChemicalMopKg = Math.round(mopKgPerHa * estimatedAreaHa * chemRatio);
  const appliedChemicalZnKg = Math.round(narcDose.znKgPerHa * estimatedAreaHa * chemRatio);
  const appliedChemicalBKg = Math.round(narcDose.bKgPerHa * estimatedAreaHa * chemRatio);

  const appliedDose: FertilizerNutrientDose = {
    nitrogenKgPerHa: Math.round(narcDose.nKgPerHa * chemRatio),
    phosphorusP2O5KgPerHa: Math.round(narcDose.p2o5KgPerHa * chemRatio),
    potassiumK2OKgPerHa: Math.round(narcDose.k2oKgPerHa * chemRatio),
    zincKgPerHa: Math.round(narcDose.znKgPerHa * chemRatio),
    boronKgPerHa: Math.round(narcDose.bKgPerHa * chemRatio),
    organicManureTonPerHa: Math.round(narcDose.organicManureTonPerHa * (1 + orgRatio * 1.5)),
    ureaBags50kg: Number(((ureaBagsPerHa * chemRatio)).toFixed(1)),
    dapBags50kg: Number(((dapBagsPerHa * chemRatio)).toFixed(1)),
    mopBags50kg: Number(((mopBagsPerHa * chemRatio)).toFixed(1)),
  };

  // 3. Spatial Freight Logistics Routing
  const logisticsRoute: PalikaLogisticsRoute = getLocalPalikaRoute(district.id, palikaName, palikaId);

  const totalChemicalWeightMt = (appliedChemicalUreaKg + appliedChemicalDapKg + appliedChemicalMopKg + appliedChemicalZnKg + appliedChemicalBKg) / 1000;

  // Fuel indexation: Diesel represents ~45% of trucking operational cost in Nepal
  const fuelEscalationFactor = Math.max(0.6, 1.0 + 0.45 * ((dieselPriceNprPerLiter - 175) / 175));

  const rTerai = (customFreightRates?.terai ?? MOALD_FERTILIZER_PRICING_2023.freightRateNprPerTonKm.teraiFlat) * fuelEscalationFactor;
  const rHill = (customFreightRates?.mountain ?? MOALD_FERTILIZER_PRICING_2023.freightRateNprPerTonKm.mountainHighway) * fuelEscalationFactor;
  const rLastMile = (customFreightRates?.lastMile ?? MOALD_FERTILIZER_PRICING_2023.freightRateNprPerTonKm.lastMileEarthen) * fuelEscalationFactor;
  const rHandling = (customFreightRates?.transshipment ?? MOALD_FERTILIZER_PRICING_2023.freightRateNprPerTonKm.transshipmentLaborFeePerTon) * fuelEscalationFactor;

  const freightCostTotalNpr = totalChemicalWeightMt * (
    (logisticsRoute.distanceTeraiKm * rTerai) +
    (logisticsRoute.distanceHillKm * rHill) +
    (logisticsRoute.distanceLastMileKm * rLastMile)
  ) + (totalChemicalWeightMt * rHandling);

  const freightCostPerKgNpr = totalChemicalWeightMt > 0
    ? Number((freightCostTotalNpr / (totalChemicalWeightMt * 1000)).toFixed(2))
    : 0;

  const handlingTransshipmentNprPerKg = Number((rHandling / 1000).toFixed(2));
  const dealerMarginNprPerKg = 1.50; // Standard cooperative margin

  // 4. Landed Farmgate Price (March 2023 MoALD Subsidized vs International CIF)
  const baseSubsidized = MOALD_FERTILIZER_PRICING_2023.subsidizedRetailNprPerKg;
  const cifUnsubsidized = MOALD_FERTILIZER_PRICING_2023.internationalCifNprPerKg;

  const landedUreaPerKg = Number(((baseSubsidized.urea + freightCostPerKgNpr + dealerMarginNprPerKg) * (1 + scarcityRatio)).toFixed(2));
  const landedDapPerKg = Number(((baseSubsidized.dap + freightCostPerKgNpr + dealerMarginNprPerKg) * (1 + scarcityRatio)).toFixed(2));
  const landedMopPerKg = Number(((baseSubsidized.mop + freightCostPerKgNpr + dealerMarginNprPerKg) * (1 + scarcityRatio)).toFixed(2));

  const totalFarmerFertilizerSpendNpr = Math.round(
    (appliedChemicalUreaKg * landedUreaPerKg) +
    (appliedChemicalDapKg * landedDapPerKg) +
    (appliedChemicalMopKg * landedMopPerKg) +
    (appliedChemicalZnKg * baseSubsidized.zincSulphate) +
    (appliedChemicalBKg * baseSubsidized.borax)
  );

  const avgWeightedLandedPerKg = totalChemicalWeightMt > 0
    ? Number((totalFarmerFertilizerSpendNpr / (totalChemicalWeightMt * 1000)).toFixed(2))
    : (landedUreaPerKg + landedDapPerKg + landedMopPerKg) / 3;

  // 5. Sovereign Forex Drain ($USD) & GoN Subsidy Burden (NPR)
  // International CIF rates: Urea = 60 NPR/kg (~$400/MT), DAP = 105 NPR/kg (~$700/MT), MoP = 68 NPR/kg (~$450/MT)
  const totalCifImportCostNpr =
    (appliedChemicalUreaKg * cifUnsubsidized.urea) +
    (appliedChemicalDapKg * cifUnsubsidized.dap) +
    (appliedChemicalMopKg * cifUnsubsidized.mop);

  const sovereignImportForexDrainUsd = Math.round(totalCifImportCostNpr / 134);

  // Subsidy Burden = (CIF Import Cost - Subsidized Base Revenue collected by AICL/STC)
  const totalSubsidizedBaseRevenueNpr =
    (appliedChemicalUreaKg * baseSubsidized.urea) +
    (appliedChemicalDapKg * baseSubsidized.dap) +
    (appliedChemicalMopKg * baseSubsidized.mop);

  const gonSubsidyBurdenNpr = Math.max(0, Math.round(totalCifImportCostNpr - totalSubsidizedBaseRevenueNpr));

  // 6. Agronomic Liebig Minimum Yield Response Curve
  // Year 1 organic mineralization lag penalty (-12% if 100% organic)
  const organicYieldLagPenaltyPct = Number((orgRatio * 12.0).toFixed(1));
  const agronomicYieldEfficiency = Math.max(0.60, 1.0 - (organicYieldLagPenaltyPct / 100));

  const realizedYieldKg = Math.round(harvestQuantityKg * agronomicYieldEfficiency);
  const yieldGapPercent = Math.round((1.0 - agronomicYieldEfficiency) * 100);

  let limitingNutrient: FertilizerImpactProfile['agronomic']['limitingNutrient'] = 'None';
  if (district.baseSoilPh && district.baseSoilPh < 5.5) limitingNutrient = 'P'; // Hill soil acidity locks phosphorus
  else if (district.baseSoilPh && district.baseSoilPh > 7.6) limitingNutrient = 'Zinc'; // Calcareous Terai locks zinc
  else if (chemRatio < 0.3) limitingNutrient = 'N'; // Slow organic mineralization initial N gap

  // 7. Farmer Value-Cost Ratio (VCR)
  // Marginal yield gain attributable to fertilizer inputs (~35% of total yield)
  const marginalYieldGainKg = realizedYieldKg * 0.35;
  const marginalRevenueNpr = marginalYieldGainKg * crop.marketValuePerUnit;
  const farmerValueCostRatioVCR = totalFarmerFertilizerSpendNpr > 0
    ? Number((marginalRevenueNpr / totalFarmerFertilizerSpendNpr).toFixed(2))
    : 3.5;

  let vcrStatus: FertilizerImpactProfile['economic']['vcrStatus'] = 'Optimal Investment (VCR >= 2.5)';
  if (farmerValueCostRatioVCR < 2.0) vcrStatus = 'High Risk of Non-Adoption (VCR < 2.0)';
  else if (farmerValueCostRatioVCR < 2.5) vcrStatus = 'Acceptable Margin (2.0 <= VCR < 2.5)';

  // 8. Energy: Transport Work & Diesel Fuel Burned
  const pEmpty = MOALD_FERTILIZER_PRICING_2023.emptyReturnPenaltyFactor;
  const eiTerai = MOALD_FERTILIZER_PRICING_2023.energyIntensityMjPerTonKm.teraiFlat;
  const eiHill = MOALD_FERTILIZER_PRICING_2023.energyIntensityMjPerTonKm.mountainHighway;
  const eiLastMile = MOALD_FERTILIZER_PRICING_2023.energyIntensityMjPerTonKm.lastMileEarthen;

  const transportEnergyMegaJoules = Math.round(
    totalChemicalWeightMt * (
      (logisticsRoute.distanceTeraiKm * eiTerai) +
      (logisticsRoute.distanceHillKm * eiHill) +
      (logisticsRoute.distanceLastMileKm * eiLastMile)
    ) * pEmpty
  );

  const transportDieselLiters = Number((transportEnergyMegaJoules / MOALD_FERTILIZER_PRICING_2023.dieselEnergyMjPerLiter).toFixed(1));
  const embeddedManufacturingEnergyKwh = Math.round((appliedChemicalUreaKg * 8.5) + (appliedChemicalDapKg * 6.2) + (appliedChemicalMopKg * 2.8));

  // 9. Ecosystem: Carbon Emissions & Soil Carbon Accumulation
  const transportEmissionsKgCo2e = Number((transportEnergyMegaJoules * MOALD_FERTILIZER_PRICING_2023.dieselEmissionFactorKgCo2ePerMj).toFixed(1));
  const chemicalManufacturingGhgKgCo2e = Math.round((appliedChemicalUreaKg * 1.85) + (appliedChemicalDapKg * 1.25));
  const totalGhgEmissionsKgCo2e = Math.round(transportEmissionsKgCo2e + chemicalManufacturingGhgKgCo2e);

  // Soil Organic Carbon (SOC) Delta: +0.22% with organic bio-slurry, -0.05% with chemical-only
  const soilOrganicCarbonDeltaPct = Number(((orgRatio * 0.22) - (chemRatio * 0.05)).toFixed(2));
  const nitrousOxideEmissionsKgCo2e = Number(((appliedChemicalUreaKg * 0.012) * 298).toFixed(1));

  // 10. Water & Hydrology: Nitrate Leaching Runoff
  const rainfallFactor = Math.max(0.5, (district.avgRainfallMm || 1500) / 1500);
  const isSteepSlope = district.ecoZone === 'Mountain' || (logisticsRoute.elevationDeltaM > 1200);
  const baseLeachingPct = isSteepSlope ? 0.28 : 0.18;
  const appliedNitrogenKg = (appliedChemicalUreaKg * 0.46) + (appliedChemicalDapKg * 0.18);
  const nitrateLeachingKgPerHa = Number((((appliedNitrogenKg / Math.max(1, estimatedAreaHa)) * baseLeachingPct * rainfallFactor) * chemRatio).toFixed(1));

  let groundwaterEutrophicationRisk: FertilizerImpactProfile['water']['groundwaterEutrophicationRisk'] = 'Low';
  if (nitrateLeachingKgPerHa > 35) groundwaterEutrophicationRisk = 'Severe Nitrate Hazard';
  else if (nitrateLeachingKgPerHa > 20) groundwaterEutrophicationRisk = 'Moderate';

  // 11. Circular Bioeconomy Tipping Point Evaluation
  // Localized biogas slurry / farmyard compost production cost benchmark in Nepal: NPR 16,500 / ha
  const landedChemicalCostPerHaNpr = Math.round(totalFarmerFertilizerSpendNpr / Math.max(1, estimatedAreaHa));
  const equivalentBioSlurryCostPerHaNpr = 16500;
  const netSavingsPerHaNpr = landedChemicalCostPerHaNpr - equivalentBioSlurryCostPerHaNpr;
  const isBioeconomySuperior = (netSavingsPerHaNpr > 0 && isSteepSlope) || (logisticsRoute.distanceHillKm + logisticsRoute.distanceLastMileKm > 80);

  let bioeconomyAdvantageRationale = `In ${district.name} (${logisticsRoute.palikaName}), local biogas slurry production saves NPR ${Math.max(0, netSavingsPerHaNpr).toLocaleString()}/ha over imported chemical fertilizer due to ${logisticsRoute.distanceHillKm + logisticsRoute.distanceLastMileKm}km of mountain freight penalty.`;
  if (!isBioeconomySuperior) {
    bioeconomyAdvantageRationale = `Flat Terai logistics corridor keeps chemical fertilizer freight competitive; integrated 50/50 bio-chemical blending recommended for soil carbon preservation.`;
  }

  return {
    agronomic: {
      targetYieldKg: harvestQuantityKg,
      realizedYieldKg,
      yieldGapPercent,
      limitingNutrient,
      recommendedDose,
      appliedDose,
      organicSubstitutionPct,
      organicYieldLagPenaltyPct,
    },
    economic: {
      baseSubsidizedBorderPriceNprPerKg: {
        urea: baseSubsidized.urea,
        dap: baseSubsidized.dap,
        mop: baseSubsidized.mop,
      },
      cifUnsubsidizedImportPriceNprPerKg: {
        urea: cifUnsubsidized.urea,
        dap: cifUnsubsidized.dap,
        mop: cifUnsubsidized.mop,
      },
      freightCostPerKgNpr,
      handlingTransshipmentNprPerKg,
      dealerMarginNprPerKg,
      scarcityMarkupPct,
      landedFarmgatePriceNprPerKg: {
        urea: landedUreaPerKg,
        dap: landedDapPerKg,
        mop: landedMopPerKg,
        averageWeighted: avgWeightedLandedPerKg,
      },
      totalFarmerFertilizerSpendNpr,
      sovereignImportForexDrainUsd,
      gonSubsidyBurdenNpr,
      farmerValueCostRatioVCR,
      vcrStatus,
    },
    energy: {
      transportEnergyMegaJoules,
      transportDieselLiters,
      transportDieselCostNpr: Math.round(transportDieselLiters * dieselPriceNprPerLiter),
      emptyReturnPenaltyFactor: pEmpty,
      embeddedManufacturingEnergyKwh,
    },
    ecosystem: {
      transportEmissionsKgCo2e,
      soilOrganicCarbonDeltaPct,
      nitrousOxideEmissionsKgCo2e,
    },
    water: {
      nitrateLeachingKgPerHa,
      groundwaterEutrophicationRisk,
    },
    bioeconomyTippingPoint: {
      isBioeconomySuperior,
      landedChemicalCostPerHaNpr,
      equivalentBioSlurryCostPerHaNpr,
      netSavingsPerHaNpr,
      bioeconomyAdvantageRationale,
    },
    logisticsRoute,
  };
}
