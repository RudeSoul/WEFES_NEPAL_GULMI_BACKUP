// [DATA PROVENANCE]
// Data Source: data/formulas/analytical_methodologies.json
// Classification: CALCULATED & BASELINE METHODOLOGIES
// Citations: DHM, MoALD, NARC, ICIMOD, DOED, NEA, CBS, NASA POWER, Survey Department Nepal

import methodologiesData from '../../../../data/formulas/analytical_methodologies.json';

export interface LocalizedString {
  en: string;
  np: string;
}

export interface VariableDefinition {
  symbol: string;
  definition: LocalizedString;
}

export interface ResolvedVariable {
  symbol: string;
  definition: string;
}

export interface RawMethodologyEntry {
  shortTitle: LocalizedString;
  pillarName: LocalizedString;
  model: LocalizedString;
  formula: string;
  parameter: LocalizedString;
  variables?: VariableDefinition[];
  description: LocalizedString;
  confidence: 'OBSERVED REAL' | 'CALCULATED' | 'PROXY ESTIMATE';
  inputs: string[];
  citation: string;
  provenancePath: string;
  unit: string;
  currentStat: string;
}

export interface ResolvedCalculationMethodology {
  shortTitle: string;
  pillarName: string;
  model: string;
  formula: string;
  parameter?: string;
  variables: ResolvedVariable[];
  description: string;
  confidence: 'OBSERVED REAL' | 'CALCULATED' | 'PROXY ESTIMATE';
  inputs: string[];
  citation: string;
  provenancePath: string;
  unit: string;
  currentStat: string;
}

export const ANALYTICAL_METHODOLOGIES = methodologiesData.methodologies as Record<string, RawMethodologyEntry>;

export interface ResolveMethodologyParams {
  selectedPillar: string;
  subFilters: Record<string, any>;
  lang: 'en' | 'np';
  cropName?: string;
  cropNameNepali?: string;
  climateMonth: number;
  currentRainMm: number;
  monthName: string;
}

export function resolveCalculationMethodology(params: ResolveMethodologyParams): ResolvedCalculationMethodology {
  const { selectedPillar, subFilters, lang, cropName, cropNameNepali, currentRainMm, monthName } = params;

  let key = 'default';

  if (selectedPillar === 'water') {
    const wSub = subFilters.waterSubFilter || 'merra_rainfall';
    if (wSub === 'merra_rainfall') key = 'merra_rainfall';
    else if (wSub === 'river_basins') key = 'river_basins';
    else if (wSub === 'springshed_vulnerability' || wSub === 'spring_vulnerability') key = 'springshed_vulnerability';
    else if (wSub === 'irrigation_potential') key = 'irrigation_potential';
    else if (wSub === 'dhm_station') key = 'dhm_station';
  } else if (selectedPillar === 'food') {
    const foodMode = subFilters.foodMode || 'single_crop';
    if (foodMode === 'single_crop') key = 'single_crop';
    else if (foodMode === 'all_crops') key = 'all_crops';
    else if (foodMode === 'cereal_index') key = 'cereal_index';
  } else if (selectedPillar === 'energy') {
    const eSub = subFilters.energySubFilter || 'hydro_corridor';
    if (eSub === 'hydro_corridor') key = 'hydro_corridor';
    else if (eSub === 'solar_irradiance') key = 'solar_irradiance';
    else if (eSub === 'clean_cooking_biomass' || eSub === 'clean_cooking') key = 'clean_cooking_biomass';
    else if (eSub === 'grid_electrification' || eSub === 'grid_reach') key = 'grid_reach';
  } else if (selectedPillar === 'ecosystem') {
    const ecoSub = subFilters.ecoSubFilter || 'soil_ph';
    if (ecoSub === 'soil_ph') key = 'soil_ph';
    else if (ecoSub === 'soil_om') key = 'soil_om';
  } else if (selectedPillar === 'socioeconomics') {
    const sSub = subFilters.socioSubFilter || 'local_governance';
    if (sSub === 'local_governance') key = 'local_governance';
    else if (sSub === 'hq_market_proximity') key = 'hq_market_proximity';
  }

  const raw = ANALYTICAL_METHODOLOGIES[key] || ANALYTICAL_METHODOLOGIES['default'];
  const activeCrop = (lang === 'np' ? cropNameNepali : cropName) || (lang === 'np' ? 'बाली' : 'Crop');

  // Interpolate dynamic values into localized text
  const formatText = (text: string) => {
    return text
      .replace(/{crop}/g, activeCrop)
      .replace(/{month}/g, monthName)
      .replace(/{rainMm}/g, String(Math.round(currentRainMm)))
      .replace(/{rainMin}/g, String(Math.round(currentRainMm * 0.82)))
      .replace(/{rainMax}/g, String(Math.round(currentRainMm * 1.24)));
  };

  const variables: ResolvedVariable[] = (raw.variables || []).map(v => ({
    symbol: v.symbol,
    definition: formatText(v.definition[lang] || v.definition.en)
  }));

  return {
    shortTitle: formatText(raw.shortTitle[lang] || raw.shortTitle.en),
    pillarName: formatText(raw.pillarName[lang] || raw.pillarName.en),
    model: formatText(raw.model[lang] || raw.model.en),
    formula: raw.formula,
    parameter: raw.parameter ? formatText(raw.parameter[lang] || raw.parameter.en) : undefined,
    variables,
    description: formatText(raw.description[lang] || raw.description.en),
    confidence: raw.confidence,
    inputs: raw.inputs,
    citation: raw.citation,
    provenancePath: raw.provenancePath,
    unit: raw.unit,
    currentStat: formatText(raw.currentStat)
  };
}
