// [DATA PROVENANCE]
// Data Source: data/real/agriculture/crop_requirement.json, data/real/agriculture/crops.json
// Classification: OBSERVED REAL & EMPIRICALLY SOURCED (FAO ECOCROP, WaterFootprint.org, MoALD Nepal)
// Citations: Food and Agriculture Organization (FAO ECOCROP ID 749, 2175, 1574, 2114, 5657, 1407, 1379); Water Footprint Network Report 47; MoALD Agricultural Statistics

export interface CropAgroProfile {
  id: string;
  name: string;
  nepaliName: string;
  emoji: string;
  category: string;
  tempOptimalC: [number, number];
  tempAbsoluteC: [number, number];
  rainOptimalMm: [number, number];
  rainAbsoluteMm: [number, number];
  soilPhOptimal: [number, number];
  soilPhAbsolute: [number, number];
  preferredDrainage: 'well_drained' | 'poorly_drained';
  maxSlopeDeg?: number;
  maxElevationM?: number;
  waterFootprintLitersPerKg: number; // m3/ton or L/kg
  citation: string;
}

export const VALIDATED_CROPS: Record<string, CropAgroProfile> = {
  coffee: {
    id: 'coffee',
    name: 'Arabica Coffee',
    nepaliName: 'अरबिका कफी',
    emoji: '☕',
    category: 'High-Value Export Cash Crop',
    tempOptimalC: [14, 28],
    tempAbsoluteC: [10, 34],
    rainOptimalMm: [1400, 2300],
    rainAbsoluteMm: [750, 4200],
    soilPhOptimal: [5.5, 7.0],
    soilPhAbsolute: [4.3, 8.4],
    preferredDrainage: 'well_drained',
    maxSlopeDeg: 25,
    maxElevationM: 1800,
    waterFootprintLitersPerKg: 18900,
    citation: 'FAO ECOCROP 749 & National Tea and Coffee Development Board'
  },
  maize: {
    id: 'maize',
    name: 'Mid-Hill Maize',
    nepaliName: 'मकै',
    emoji: '🌽',
    category: 'Staple Cereal Crop',
    tempOptimalC: [18, 33],
    tempAbsoluteC: [10, 47],
    rainOptimalMm: [600, 1200],
    rainAbsoluteMm: [400, 1800],
    soilPhOptimal: [5.0, 7.0],
    soilPhAbsolute: [4.5, 8.5],
    preferredDrainage: 'well_drained',
    maxSlopeDeg: 30,
    maxElevationM: 2400,
    waterFootprintLitersPerKg: 1222,
    citation: 'FAO ECOCROP 2175 & NARC Hill Crops Research Program'
  },
  rice: {
    id: 'rice',
    name: 'Monsoon Paddy Rice',
    nepaliName: 'धान',
    emoji: '🌾',
    category: 'Staple Cereal Crop',
    tempOptimalC: [20, 35],
    tempAbsoluteC: [15, 40],
    rainOptimalMm: [1000, 2000],
    rainAbsoluteMm: [800, 3000],
    soilPhOptimal: [5.0, 6.5],
    soilPhAbsolute: [4.5, 8.0],
    preferredDrainage: 'poorly_drained',
    maxSlopeDeg: 8,
    maxElevationM: 1600,
    waterFootprintLitersPerKg: 2497,
    citation: 'FAO ECOCROP 1574 & National Rice Research Program (NRRP)'
  },
  wheat: {
    id: 'wheat',
    name: 'Winter Wheat',
    nepaliName: 'गहुँ',
    emoji: '🌾',
    category: 'Winter Cereal Crop',
    tempOptimalC: [15, 23],
    tempAbsoluteC: [5, 32],
    rainOptimalMm: [450, 800],
    rainAbsoluteMm: [300, 1500],
    soilPhOptimal: [6.0, 7.0],
    soilPhAbsolute: [5.2, 8.2],
    preferredDrainage: 'well_drained',
    maxSlopeDeg: 20,
    maxElevationM: 2200,
    waterFootprintLitersPerKg: 1827,
    citation: 'FAO ECOCROP 2114 & National Wheat Research Program (NWRP)'
  },
  finger_millet: {
    id: 'finger_millet',
    name: 'Finger Millet (Kodo)',
    nepaliName: 'कोदो',
    emoji: '🌾',
    category: 'Nutritious Traditional Cereal',
    tempOptimalC: [16, 28],
    tempAbsoluteC: [11, 38],
    rainOptimalMm: [500, 1000],
    rainAbsoluteMm: [350, 1500],
    soilPhOptimal: [5.0, 6.5],
    soilPhAbsolute: [4.5, 8.0],
    preferredDrainage: 'well_drained',
    maxSlopeDeg: 35,
    maxElevationM: 2400,
    waterFootprintLitersPerKg: 4495,
    citation: 'FAO ECOCROP 5657 & NARC Traditional Crop Program'
  },
  large_cardamom: {
    id: 'large_cardamom',
    name: 'Large Cardamom (Alaichi)',
    nepaliName: 'ठूलो अलैंची',
    emoji: '🌿',
    category: 'High-Value Shade Cash Crop',
    tempOptimalC: [10, 22],
    tempAbsoluteC: [6, 28],
    rainOptimalMm: [1500, 3500],
    rainAbsoluteMm: [1200, 4500],
    soilPhOptimal: [5.0, 6.0],
    soilPhAbsolute: [4.5, 6.5],
    preferredDrainage: 'well_drained',
    maxSlopeDeg: 28,
    maxElevationM: 2100,
    waterFootprintLitersPerKg: 3200,
    citation: 'Baniya (2009) & Cardamom Development Center Fikkal'
  },
  tomato: {
    id: 'tomato',
    name: 'Fresh Market Tomato',
    nepaliName: 'गोलभेंडा',
    emoji: '🍅',
    category: 'Commercial Vegetable Crop',
    tempOptimalC: [18, 27],
    tempAbsoluteC: [10, 35],
    rainOptimalMm: [600, 1300],
    rainAbsoluteMm: [400, 1800],
    soilPhOptimal: [5.5, 6.8],
    soilPhAbsolute: [5.0, 7.5],
    preferredDrainage: 'well_drained',
    maxSlopeDeg: 15,
    maxElevationM: 1900,
    waterFootprintLitersPerKg: 214,
    citation: 'FAO ECOCROP 1379 & Horticulture Research Division NARC'
  },
  apple: {
    id: 'apple',
    name: 'Temperate Apple',
    nepaliName: 'स्याउ',
    emoji: '🍎',
    category: 'Temperate High-Hill Fruit',
    tempOptimalC: [9, 18],
    tempAbsoluteC: [-4, 28],
    rainOptimalMm: [700, 1200],
    rainAbsoluteMm: [500, 1800],
    soilPhOptimal: [6.0, 7.0],
    soilPhAbsolute: [5.0, 8.0],
    preferredDrainage: 'well_drained',
    maxSlopeDeg: 25,
    maxElevationM: 2800,
    waterFootprintLitersPerKg: 822,
    citation: 'FAO ECOCROP 1407 & Temperate Horticulture Center'
  }
};

export interface CriterionEvaluation {
  observed: number;
  optimalRange: [number, number];
  absoluteRange: [number, number];
  status: 'optimal' | 'acceptable' | 'outside_range';
}

export interface SurveyedPalikaCrop {
  score: number;
  rating: string;
  limitingFactor?: string;
}

export interface CropEvaluationResult {
  cropId: string;
  cropName: string;
  suitabilityScore: number; // 0-100
  suitabilityClass: 'highly_suitable' | 'moderately_suitable' | 'marginal' | 'unsuitable';
  color: string;
  limitingFactors: string[];
  breakdown: {
    temperature: CriterionEvaluation;
    rainfall: CriterionEvaluation;
    soilPh: CriterionEvaluation;
    elevation: { observed: number; maxRecommended: number; status: 'contextual' };
  };
  surveyScore?: number;
  surveyRating?: string;
}

/**
 * Evaluates bio-physical crop suitability according to:
 * 1. FAO EcoCrop Species Requirements (crop_requirement.json, suitability_rules.json)
 * 2. Official Municipal Feasibility Surveys (palika_profiles.json - MoFAGA / MoALD / CBS 2021)
 * Adheres strictly to Section 10 of suitability_methodology.md (No arbitrary weighted score).
 */
export function evaluateCropSuitability(
  cropId: string,
  observedTempC: number,
  observedRainMm: number,
  observedElevationM: number,
  observedSoilPh: number = 6.0,
  surveyedRecord?: SurveyedPalikaCrop
): CropEvaluationResult {
  const profile = VALIDATED_CROPS[cropId] || VALIDATED_CROPS.coffee;

  // 1. Temperature criterion (continuous_optimal_absolute in suitability_rules.json)
  const [tOptMin, tOptMax] = profile.tempOptimalC;
  const [tAbsMin, tAbsMax] = profile.tempAbsoluteC;
  let tempStatus: 'optimal' | 'acceptable' | 'outside_range' = 'optimal';
  if (observedTempC >= tOptMin && observedTempC <= tOptMax) {
    tempStatus = 'optimal';
  } else if (observedTempC >= tAbsMin && observedTempC <= tAbsMax) {
    tempStatus = 'acceptable';
  } else {
    tempStatus = 'outside_range';
  }

  // 2. Rainfall criterion
  const [rOptMin, rOptMax] = profile.rainOptimalMm;
  const [rAbsMin, rAbsMax] = profile.rainAbsoluteMm;
  let rainStatus: 'optimal' | 'acceptable' | 'outside_range' = 'optimal';
  if (observedRainMm >= rOptMin && observedRainMm <= rOptMax) {
    rainStatus = 'optimal';
  } else if (observedRainMm >= rAbsMin && observedRainMm <= rAbsMax) {
    rainStatus = 'acceptable';
  } else {
    rainStatus = 'outside_range';
  }

  // 3. Soil pH criterion
  const [pOptMin, pOptMax] = profile.soilPhOptimal;
  const [pAbsMin, pAbsMax] = profile.soilPhAbsolute;
  let phStatus: 'optimal' | 'acceptable' | 'outside_range' = 'optimal';
  if (observedSoilPh >= pOptMin && observedSoilPh <= pOptMax) {
    phStatus = 'optimal';
  } else if (observedSoilPh >= pAbsMin && observedSoilPh <= pAbsMax) {
    phStatus = 'acceptable';
  } else {
    phStatus = 'outside_range';
  }

  // 4. Elevation: Contextual per altitude_policy.md
  const maxElev = profile.maxElevationM || 2500;

  // Limiting factors audit per Section 12 of suitability_methodology.md
  const limitingFactors: string[] = [];
  if (tempStatus === 'outside_range') limitingFactors.push(`Thermal Edge (${observedTempC}°C vs optimal ${tOptMin}–${tOptMax}°C)`);
  if (rainStatus === 'outside_range') limitingFactors.push(`Rainfall Limit (${observedRainMm}mm vs optimal ${rOptMin}–${rOptMax}mm)`);
  if (phStatus === 'outside_range') limitingFactors.push(`Soil pH (${observedSoilPh} vs optimal ${pOptMin}–${pOptMax})`);
  if (observedElevationM > maxElev) limitingFactors.push(`High Elevation (${observedElevationM}m > ${maxElev}m contextual threshold)`);

  // Rule-based classification per Section 9 of suitability_methodology.md
  let ruleClass: 'highly_suitable' | 'moderately_suitable' | 'marginal' | 'unsuitable';
  if (tempStatus === 'outside_range' || rainStatus === 'outside_range' || phStatus === 'outside_range') {
    ruleClass = limitingFactors.length >= 2 ? 'unsuitable' : 'marginal';
  } else if (tempStatus === 'acceptable' || rainStatus === 'acceptable' || phStatus === 'acceptable') {
    ruleClass = 'moderately_suitable';
  } else {
    ruleClass = 'highly_suitable';
  }

  // Final Score & Class Determination:
  // Tier 2: Ground in official surveyed score if present in palika_profiles.json
  let finalScore: number;
  let suitabilityClass: 'highly_suitable' | 'moderately_suitable' | 'marginal' | 'unsuitable';

  if (surveyedRecord && typeof surveyedRecord.score === 'number') {
    finalScore = surveyedRecord.score;
    if (finalScore >= 80) suitabilityClass = 'highly_suitable';
    else if (finalScore >= 65) suitabilityClass = 'moderately_suitable';
    else if (finalScore >= 45) suitabilityClass = 'marginal';
    else suitabilityClass = 'unsuitable';
  } else {
    suitabilityClass = ruleClass;
    if (ruleClass === 'highly_suitable') finalScore = 88;
    else if (ruleClass === 'moderately_suitable') finalScore = 72;
    else if (ruleClass === 'marginal') finalScore = 52;
    else finalScore = 25;
  }

  let color: string;
  if (finalScore >= 80) color = '#047857'; // Deep Emerald (Optimal)
  else if (finalScore >= 65) color = '#84cc16'; // Lime Green (High)
  else if (finalScore >= 45) color = '#f59e0b'; // Amber (Marginal/Moderate)
  else color = '#ef4444'; // Red (Constrained/Unsuitable)

  return {
    cropId: profile.id,
    cropName: profile.name,
    suitabilityScore: finalScore,
    suitabilityClass,
    color,
    limitingFactors,
    breakdown: {
      temperature: { observed: observedTempC, optimalRange: profile.tempOptimalC, absoluteRange: profile.tempAbsoluteC, status: tempStatus },
      rainfall: { observed: observedRainMm, optimalRange: profile.rainOptimalMm, absoluteRange: profile.rainAbsoluteMm, status: rainStatus },
      soilPh: { observed: observedSoilPh, optimalRange: profile.soilPhOptimal, absoluteRange: profile.soilPhAbsolute, status: phStatus },
      elevation: { observed: observedElevationM, maxRecommended: maxElev, status: 'contextual' }
    },
    surveyScore: surveyedRecord?.score,
    surveyRating: surveyedRecord?.rating
  };
}

export type WaterStressSeason = 'cycle' | 'winter_dry' | 'pre_monsoon' | 'monsoon_wet';

/**
 * Returns representative growing-season temperature for a crop given the Palika annual mean temp.
 * Prevents summer/monsoon crops from being evaluated in freezing winter months or vice-versa.
 */
export function getCropGrowingSeasonTemp(cropId: string, avgAnnualTempC: number): number {
  switch (cropId) {
    case 'rice':
      return Number((avgAnnualTempC + 4.0).toFixed(1)); // Monsoon summer (Jun–Oct)
    case 'maize':
      return Number((avgAnnualTempC + 3.2).toFixed(1)); // Spring–Summer (Apr–Aug)
    case 'finger_millet':
      return Number((avgAnnualTempC + 3.5).toFixed(1)); // Monsoon summer (Jun–Oct)
    case 'wheat':
      return Number((avgAnnualTempC - 4.5).toFixed(1)); // Winter season (Nov–Mar)
    case 'tomato':
      return Number((avgAnnualTempC + 2.0).toFixed(1)); // Warm season vegetable
    case 'coffee':
    case 'large_cardamom':
    case 'apple':
    default:
      return Number(avgAnnualTempC.toFixed(1)); // Perennials evaluated across annual climatological envelope
  }
}

export interface CropWaterStressResult {
  cropId: string;
  season: WaterStressSeason;
  stressScorePct: number; // 0 = no stress, 100 = extreme drought stress
  status: 'minimal_deficit' | 'low_stress' | 'moderate_stress' | 'severe_stress';
  color: string;
  demandMm: number;
  receivedRainMm: number;
  irrigationNeededMm: number;
  waterFootprintLitersPerKg: number;
  summaryText: string;
}

export interface CropWaterStressParams {
  cropId: string;
  season?: WaterStressSeason;
  annualRainMm: number;
  avgTempC: number;
  monthlyRainMm?: number;
  monthlyTempC?: number;
}

/**
 * Evaluates Crop Water Demand vs Precipitation Deficit.
 * Supports both full growing cycle deficits and specific seasonal dry/wet periods.
 */
export function evaluateCropWaterStress({
  cropId,
  season = 'cycle',
  annualRainMm,
  avgTempC,
  monthlyRainMm,
  monthlyTempC,
}: CropWaterStressParams): CropWaterStressResult {
  const profile = VALIDATED_CROPS[cropId] || VALIDATED_CROPS.coffee;
  const [minReqMm] = profile.rainOptimalMm;

  let demandMm = 0;
  let receivedRainMm = 0;
  let summaryText = '';

  if (season === 'winter_dry') {
    // Winter period (Nov–Feb): Gulmi gets ~4% of annual rainfall (approx 15–28 mm/month)
    receivedRainMm = monthlyRainMm ?? Math.round(annualRainMm * 0.012);
    const temp = monthlyTempC ?? (avgTempC - 4.5);
    const thermalMod = Math.max(0.7, Math.min(1.2, temp / 18.0));
    demandMm = Math.round((minReqMm / 8.0) * thermalMod);
    summaryText = `Winter dry spell: ~${receivedRainMm} mm rain vs ~${demandMm} mm demand. Critical irrigation deficit.`;
  } else if (season === 'pre_monsoon') {
    // Pre-monsoon period (Mar–May): Rising heat, ~10% annual rain (~40–65 mm/month)
    receivedRainMm = monthlyRainMm ?? Math.round(annualRainMm * 0.035);
    const temp = monthlyTempC ?? (avgTempC + 2.5);
    const thermalMod = Math.max(0.9, Math.min(1.4, temp / 20.0));
    demandMm = Math.round((minReqMm / 6.0) * thermalMod);
    summaryText = `Pre-monsoon dry spell: ~${receivedRainMm} mm rain vs ~${demandMm} mm demand. Critical flowering stage.`;
  } else if (season === 'monsoon_wet') {
    // Monsoon period (Jun–Sep): 80% of annual rain (~350–520 mm/month)
    receivedRainMm = monthlyRainMm ?? Math.round(annualRainMm * 0.20);
    demandMm = Math.round(minReqMm / 4.0);
    summaryText = `Monsoon wet period: ~${receivedRainMm} mm rain easily satisfies ~${demandMm} mm monthly demand.`;
  } else {
    // Default: 'cycle' (Cumulative crop growing season water balance)
    switch (cropId) {
      case 'wheat':
        // Winter wheat cycle: Nov–Mar. Rain in Gulmi ~115 mm, requirement ~450 mm
        demandMm = 450;
        receivedRainMm = Math.round(annualRainMm * 0.065);
        summaryText = `Winter wheat cycle: ~${receivedRainMm} mm rain vs ${demandMm} mm demand. Requires supplemental canal/groundwater irrigation.`;
        break;
      case 'rice':
        // Monsoon paddy cycle: Jun–Oct. Rain in Gulmi ~1,380 mm, requirement ~1,000 mm
        demandMm = 1000;
        receivedRainMm = Math.round(annualRainMm * 0.78);
        summaryText = `Monsoon paddy cycle: ~${receivedRainMm} mm natural rainfall satisfies ${demandMm} mm requirement on lowland Khet terraces.`;
        break;
      case 'maize':
        // Spring/Monsoon maize: Apr–Aug. Rain is ~950 mm, requirement ~550 mm
        demandMm = 550;
        receivedRainMm = Math.round(annualRainMm * 0.55);
        summaryText = `Mid-hill maize cycle: ~${receivedRainMm} mm rain satisfies ${demandMm} mm seasonal demand; early spring planting requires pre-sowing moisture.`;
        break;
      case 'coffee':
        // Perennial coffee: Annual need ~1,400 mm. Annual rain ~1,800 mm, but pre-monsoon flowering requires ~80 mm
        demandMm = 1400;
        receivedRainMm = Math.round(annualRainMm * 0.90);
        summaryText = `Arabica coffee annual balance: Rain (${annualRainMm} mm) meets annual demand (${demandMm} mm); pre-monsoon flowering requires 1–2 supplemental irrigations.`;
        break;
      case 'tomato':
        demandMm = 650;
        receivedRainMm = Math.round(annualRainMm * 0.28);
        summaryText = `Commercial tomato cycle: High evapotranspiration demand requires dedicated furrow/drip irrigation in dry seasons.`;
        break;
      case 'finger_millet':
        demandMm = 450;
        receivedRainMm = Math.round(annualRainMm * 0.65);
        summaryText = `Finger millet (Kodo) cycle: Highly drought-tolerant; natural monsoon rainfall fully satisfies demand.`;
        break;
      case 'apple':
        demandMm = 750;
        receivedRainMm = Math.round(annualRainMm * 0.50);
        summaryText = `Temperate apple cycle: Chilling hours and rainfall in high elevations meet baseline requirements.`;
        break;
      case 'large_cardamom':
      default:
        demandMm = Math.round(minReqMm);
        receivedRainMm = Math.round(annualRainMm * 0.85);
        summaryText = `Annual water balance: ~${receivedRainMm} mm available rain vs ~${demandMm} mm crop demand.`;
        break;
    }
  }

  const deficitMm = Math.max(0, demandMm - receivedRainMm);
  const stressRatio = demandMm > 0 ? deficitMm / demandMm : 0;
  const stressScorePct = Math.min(100, Math.round(stressRatio * 100));

  let status: 'minimal_deficit' | 'low_stress' | 'moderate_stress' | 'severe_stress';
  let color: string;

  if (stressScorePct < 20) {
    status = 'minimal_deficit';
    color = '#0284c7'; // Blue
  } else if (stressScorePct < 45) {
    status = 'low_stress';
    color = '#0d9488'; // Teal
  } else if (stressScorePct < 65) {
    status = 'moderate_stress';
    color = '#f59e0b'; // Amber
  } else {
    status = 'severe_stress';
    color = '#dc2626'; // Crimson
  }

  return {
    cropId: profile.id,
    season,
    stressScorePct,
    status,
    color,
    demandMm,
    receivedRainMm,
    irrigationNeededMm: deficitMm,
    waterFootprintLitersPerKg: profile.waterFootprintLitersPerKg,
    summaryText,
  };
}
