/**
 * packages/shared-types/src/legend-contracts.ts
 * =============================================
 * Scientific and metadata-driven contracts for dynamic map legends.
 * Replaces legacy hardcoded 6-tier arrays with data-driven threshold models.
 * Complies with Rule 6 of RULESET.md.
 */

export type LegendType =
  | 'categorical'
  | 'continuous_gradient'
  | 'domain_thresholds'
  | 'quantile_bins';

export interface LegendThresholdTier {
  minValue?: number;
  maxValue?: number;
  color: string;
  label: string;
  description?: string;
  badge?: string;
}

export interface LegendCategoryItem {
  key: string;
  color: string;
  label: string;
  description?: string;
  badge?: string;
}

export interface SubFilterLegendConfig {
  id: string;
  pillar: 'water' | 'energy' | 'food' | 'ecosystem' | 'socioeconomics';
  title: string;
  subtitle?: string;
  unit?: string;
  legendType: LegendType;
  dataSourceCitation: string;
  confidence: 'REAL' | 'CALCULATED' | 'PROXY';
  thresholds?: LegendThresholdTier[];
  categories?: LegendCategoryItem[];
  gradient?: {
    minColor: string;
    midColor?: string;
    maxColor: string;
    minLabel: string;
    maxLabel: string;
  };
}

/**
 * Canonical Metadata Registry for all Map Subfilters.
 * Fully driven by scientific domain criteria (NARC, FAO, DHM, DOED).
 */
export const SUBFILTER_LEGENDS: Record<string, SubFilterLegendConfig> = {
  // 1. Water: Rainfall
  merra_rainfall: {
    id: 'merra_rainfall',
    pillar: 'water',
    title: 'Precipitation Distribution',
    subtitle: 'Topographically Downscaled (Lapse-Rate & Ridge Uplift)',
    unit: 'mm',
    legendType: 'continuous_gradient',
    dataSourceCitation: 'data/real/climate/nasa_power_10_years_full.csv & DHM station baselines',
    confidence: 'CALCULATED',
    gradient: {
      minColor: '#ea580c',
      midColor: '#0ea5e9',
      maxColor: '#0369a1',
      minLabel: 'Subtropical Low Valley (-15%)',
      maxLabel: 'High Mountain Ridge (+24% Uplift)'
    }
  },

  // 2. Water: River Basins
  river_basins: {
    id: 'river_basins',
    pillar: 'water',
    title: 'Major Catchments & River Basins',
    legendType: 'categorical',
    dataSourceCitation: 'data/real/hydrology/River_data.csv',
    confidence: 'REAL',
    categories: [
      { key: 'kaligandaki', color: '#0284c7', label: 'Kali Gandaki Basin', description: 'Trans-Himalayan major river system' },
      { key: 'badigad', color: '#059669', label: 'Badigad Corridor', description: 'Primary agricultural and hydropower artery' },
      { key: 'ridi', color: '#7c3aed', label: 'Ridi Khola Watershed', description: 'Historic pilgrimage and central valley catchment' },
      { key: 'panaha', color: '#d97706', label: 'Panaha River', description: 'Southern agricultural tributary' },
      { key: 'chhaldi', color: '#0891b2', label: 'Chhaldi Khola', description: 'Western agro-ecological basin' }
    ]
  },

  // 3. Ecosystem: Soil pH
  soil_ph: {
    id: 'soil_ph',
    pillar: 'ecosystem',
    title: 'Soil Reaction (pH Distribution)',
    subtitle: 'NARC & FAO Agronomic Classification',
    unit: 'pH',
    legendType: 'domain_thresholds',
    dataSourceCitation: 'data/real/land_and_soil/district-soil-summary.json',
    confidence: 'REAL',
    thresholds: [
      { maxValue: 5.0, color: '#ef4444', label: 'Strongly Acidic (< 5.0)', description: 'Requires agricultural lime (CaCO3) application' },
      { minValue: 5.0, maxValue: 5.9, color: '#f59e0b', label: 'Moderately Acidic (5.0 – 5.9)', description: 'Suitable for coffee and tea' },
      { minValue: 6.0, maxValue: 7.2, color: '#10b981', label: 'Optimal / Neutral (6.0 – 7.2)', description: 'Ideal for major cereal and vegetable crops' },
      { minValue: 7.3, color: '#3b82f6', label: 'Alkaline (> 7.2)', description: 'Rare in mid-hills; limestone outcrops' }
    ]
  },

  // 4. Energy: Hydropower Potential
  hydro_potential: {
    id: 'hydro_potential',
    pillar: 'energy',
    title: 'Viable Hydropower Reach Potential',
    subtitle: 'DOED 10% Statutory E-Flow Screened',
    unit: 'kW / MW',
    legendType: 'domain_thresholds',
    dataSourceCitation: 'data/calculated/hydro_reaches/reaches_screened.csv',
    confidence: 'CALCULATED',
    thresholds: [
      { maxValue: 100, color: '#10b981', label: 'Rural Micro-Hydro (< 100 kW)', description: 'Local community off-grid electrification' },
      { minValue: 100, maxValue: 1000, color: '#0284c7', label: 'Mini / Small Hydro (100 kW – 1 MW)', description: 'Local mini-grid & productive end-uses' },
      { minValue: 1000, color: '#7c3aed', label: 'Commercial RoR (> 1 MW)', description: 'National grid feed-in cascade potential' }
    ]
  },

  // 5. Food: Crop Suitability
  crop_suitability: {
    id: 'crop_suitability',
    pillar: 'food',
    title: 'Agro-Ecological Suitability Score',
    subtitle: 'FAO ECOCROP Parametric Model',
    unit: '%',
    legendType: 'domain_thresholds',
    dataSourceCitation: 'data/real/agriculture/crops.json',
    confidence: 'CALCULATED',
    thresholds: [
      { minValue: 80, color: '#10b981', label: 'Highly Suitable (≥ 80%)', description: 'Optimal thermal and moisture conditions' },
      { minValue: 60, maxValue: 79, color: '#84cc16', label: 'Moderately Suitable (60 – 79%)', description: 'Good yield expected with standard inputs' },
      { minValue: 40, maxValue: 59, color: '#f59e0b', label: 'Marginally Suitable (40 – 59%)', description: 'Significant climate or elevation constraints' },
      { maxValue: 39, color: '#ef4444', label: 'Unsuitable (< 40%)', description: 'High frost or drought crop failure risk' }
    ]
  }
};
