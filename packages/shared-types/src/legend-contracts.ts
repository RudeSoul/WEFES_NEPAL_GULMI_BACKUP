/**
 * packages/shared-types/src/legend-contracts.ts
 * =============================================
 * Scientific and metadata-driven contracts for dynamic map legends.
 * Replaces legacy hardcoded 6-tier arrays with data-driven threshold models.
 * Complies with Rule 2 and Rule 6 of RULESET.md.
 *
 * [DATA PROVENANCE]
 * Data Source: data/real/boundaries/gulmi-palikas.json, data/real/hydrology/gulmi_hydrology_assets.json
 * Classification: OBSERVED REAL & CALCULATED BASELINES
 * Citations: Survey Department Nepal, Department of Hydrology and Meteorology (DHM)
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
 * Fully driven by scientific domain criteria (NARC, FAO, DHM, DOED, MoALD, CBS).
 */
export const SUBFILTER_LEGENDS: Record<string, SubFilterLegendConfig> = {
  // ============================================================================
  // 1. WATER PILLAR
  // ============================================================================
  merra_rainfall: {
    id: 'merra_rainfall',
    pillar: 'water',
    title: 'Precipitation Distribution',
    subtitle: 'Topographically Downscaled (Lapse-Rate & Ridge Uplift)',
    unit: 'mm',
    legendType: 'continuous_gradient',
    dataSourceCitation: 'data/real/climate/nasa_power_10_years_full.csv',
    confidence: 'CALCULATED',
    gradient: {
      minColor: '#fed7aa',
      midColor: '#38bdf8',
      maxColor: '#1e3a8a',
      minLabel: 'Subtropical Low Valleys (Lower mm)',
      maxLabel: 'High Mountain Ridges (Higher mm Uplift)'
    }
  },

  river_basins: {
    id: 'river_basins',
    pillar: 'water',
    title: 'Gandaki Basin Drainage Corridors',
    subtitle: 'Kali Gandaki Mainstem & Perennial Sub-Basins',
    legendType: 'categorical',
    dataSourceCitation: 'data/real/boundaries/gulmi-palikas.json',
    confidence: 'REAL',
    categories: [
      { key: 'kaligandaki', color: '#0369a1', label: 'Kali Gandaki Corridor', description: 'Trans-Himalayan major river system & hydro corridor' },
      { key: 'badigad', color: '#0ea5e9', label: 'Badigad Sub-Basin', description: 'Agricultural lifeline drainage for Musikot and Isma' },
      { key: 'ridi', color: '#06b6d4', label: 'Ridi Khola Sub-Basin', description: 'Historic central drainage for Resunga, Gulmidarbar, and Ruru' },
      { key: 'panaha', color: '#d97706', label: 'Panaha River Corridor', description: 'Tamghas valley & southern agro-ecological drainage' },
      { key: 'hugdi', color: '#38bdf8', label: 'Hugdi Khola Sub-Basin', description: 'Eastern agricultural catchment in Chandrakot & Satyawati' },
      { key: 'chhaldi', color: '#0891b2', label: 'Chhaldi Khola Sub-Basin', description: 'Western watershed connecting Dhurkot & Malika' }
    ]
  },

  springshed_vulnerability: {
    id: 'springshed_vulnerability',
    pillar: 'water',
    title: 'ICIMOD Springshed Hydro-Vulnerability',
    subtitle: 'Mid-Hill Spring Depletion & Drying Risk (मुहान सुक्ने जोखिम)',
    unit: 'Risk Level',
    legendType: 'domain_thresholds',
    dataSourceCitation: 'data/proxy/environmental_proxies/default_eflow_parameters.json & ICIMOD springshed protocols',
    confidence: 'PROXY',
    thresholds: [
      { maxValue: 25, color: '#059669', label: 'Low Vulnerability (<25%)', description: 'Stable perennial recharge zones (Dense forest slopes)' },
      { minValue: 25, maxValue: 50, color: '#10b981', label: 'Moderate Vulnerability (25–50%)', description: 'Seasonal discharge variation observed' },
      { minValue: 50, maxValue: 75, color: '#f59e0b', label: 'High Vulnerability (50–75%)', description: 'Springflow declines >40% pre-monsoon; recharge intervention needed' },
      { minValue: 75, color: '#ef4444', label: 'Critical Vulnerability (>75%)', description: 'Severe pre-monsoon drying; high drought & drinking water risk' }
    ]
  },

  irrigation_potential: {
    id: 'irrigation_potential',
    pillar: 'water',
    title: 'Agricultural Lift & Canal Irrigation Feasibility',
    subtitle: 'Department of Water Resources & Irrigation (DWRI) Command Criteria',
    unit: 'Command %',
    legendType: 'domain_thresholds',
    dataSourceCitation: 'data/real/agriculture/crops.json & DWRI master plan',
    confidence: 'CALCULATED',
    thresholds: [
      { minValue: 80, color: '#047857', label: 'Prime Riverbed Gravity Kulo (≥80%)', description: 'Continuous perennial gravity irrigation (Kaligandaki/Badigad)' },
      { minValue: 60, maxValue: 79, color: '#10b981', label: 'Mid-Hill Solar Lift Command (60–79%)', description: 'Viable 50–150m solar lift from perennial streams' },
      { minValue: 40, maxValue: 59, color: '#f59e0b', label: 'Rainwater Harvest & Micro-Drip (40–59%)', description: 'Plastic ponds and drip irrigation for vegetable terraces' },
      { maxValue: 39, color: '#ef4444', label: 'Rainfed Ridge Slopes (<40%)', description: 'Steep upland terrain relying purely on monsoon rainfall' }
    ]
  },

  // ============================================================================
  // 2. FOOD PILLAR
  // ============================================================================
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
  },

  barkhe_summer: {
    id: 'barkhe_summer',
    pillar: 'food',
    title: 'Barkhe Summer Monsoon Crop Feasibility',
    subtitle: 'Paddy, Hybrid Maize, Ginger, and Turmeric Suitability',
    unit: 'Feasibility %',
    legendType: 'domain_thresholds',
    dataSourceCitation: 'data/real/agriculture/crops.json & MoALD agricultural statistics',
    confidence: 'CALCULATED',
    thresholds: [
      { minValue: 85, color: '#047857', label: 'Prime Irrigated Valleys (≥85%)', description: 'Paddy, commercial ginger, and hybrid spring maize' },
      { minValue: 70, maxValue: 84, color: '#10b981', label: 'Agroforestry Terraces (70–84%)', description: 'Arabica coffee, finger millet, and monsoon vegetables' },
      { minValue: 50, maxValue: 69, color: '#f59e0b', label: 'Rainfed Mid-Slopes (50–69%)', description: 'Traditional millet, pulses, and forage crops' },
      { maxValue: 49, color: '#ef4444', label: 'High Steep Ridges (<50%)', description: 'High runoff risk; best reserved for community conservation forestry' }
    ]
  },

  hiunde_winter: {
    id: 'hiunde_winter',
    pillar: 'food',
    title: 'Hiunde Winter Season Crop Feasibility',
    subtitle: 'Winter Wheat, Mustard, Seed Potato, and Off-Season Vegetables',
    unit: 'Feasibility %',
    legendType: 'domain_thresholds',
    dataSourceCitation: 'data/real/agriculture/crops.json & MoALD agricultural statistics',
    confidence: 'CALCULATED',
    thresholds: [
      { minValue: 85, color: '#047857', label: 'Optimal Winter Niche (≥85%)', description: 'Winter wheat, yellow mustard, and irrigated cole crops' },
      { minValue: 70, maxValue: 84, color: '#10b981', label: 'Cold-Hardy Highland Terraces (70–84%)', description: 'Seed potato and high-altitude winter cereals' },
      { minValue: 50, maxValue: 69, color: '#f59e0b', label: 'Low-Moisture Slopes (50–69%)', description: 'Buckwheat and cover crops; limited by winter drought' },
      { maxValue: 49, color: '#ef4444', label: 'Severe Frost Ridge Slopes (<50%)', description: 'Frequent winter sub-zero temperature exposure' }
    ]
  },

  double_cropping: {
    id: 'double_cropping',
    pillar: 'food',
    title: 'Cropping Rotation Intensity Index',
    subtitle: 'Annual Cultivation Cycles (CBS Agricultural Census & NARC)',
    unit: 'Intensity %',
    legendType: 'domain_thresholds',
    dataSourceCitation: 'data/real/agriculture/crops.json & CBS Agricultural Census',
    confidence: 'CALCULATED',
    thresholds: [
      { minValue: 250, color: '#047857', label: 'Triple-Cropping (≥250%)', description: 'Paddy-Wheat-Maize year-round irrigation in Kaligandaki & Musikot' },
      { minValue: 200, maxValue: 249, color: '#10b981', label: 'Standard Double-Cropping (200–249%)', description: 'Monsoon Paddy followed by Winter Wheat/Potato' },
      { minValue: 140, maxValue: 199, color: '#f59e0b', label: 'Semi-Irrigated Rotation (140–199%)', description: 'Monsoon Maize + Winter Legumes/Mustard' },
      { maxValue: 139, color: '#ef4444', label: 'Single-Cropping (<140%)', description: 'Rainfed subsistence single crop due to lack of winter water' }
    ]
  },

  // ============================================================================
  // 3. ECOSYSTEM PILLAR
  // ============================================================================
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

  elevation_zones: {
    id: 'elevation_zones',
    pillar: 'ecosystem',
    title: 'Topographic & Hypsometric Agro-Ecological Zones',
    subtitle: 'Survey Department 30m Digital Elevation Model',
    unit: 'Meters (AMSL)',
    legendType: 'domain_thresholds',
    dataSourceCitation: 'data/real/rasters/gulmi_dem_30m.tif',
    confidence: 'REAL',
    thresholds: [
      { minValue: 1700, color: '#4c1d95', label: 'Alpine Ridges (>1,700m)', description: 'Madane Lekh (1740m), Resunga Peak; protected biodiversity & cloud forests' },
      { minValue: 1450, maxValue: 1699, color: '#7c3aed', label: 'Cool Temperate Highlands (1,450–1,700m)', description: 'Malika, Chandrakot, Dhurkot; specialty Arabica coffee and temperate fruit belt' },
      { minValue: 1100, maxValue: 1449, color: '#0ea5e9', label: 'Sub-Tropical Mid-Hills (1,100–1,450m)', description: 'Chatrakot, Gulmidarbar; intensive terrace farming and mixed agroforestry' },
      { maxValue: 1099, color: '#10b981', label: 'Low Riverbed Valleys (<1,100m)', description: 'Ruru, Kaligandaki, Musikot (890–1100m); tropical crops and irrigated alluvial flats' }
    ]
  },

  agroforestry_belt: {
    id: 'agroforestry_belt',
    pillar: 'ecosystem',
    title: 'Community Forestry & Canopy Cover',
    subtitle: 'Department of Forests and Soil Conservation (DFSC) Forest Density',
    unit: '% Cover',
    legendType: 'domain_thresholds',
    dataSourceCitation: 'data/real/land_and_soil/district-soil-summary.json & DFSC inventory',
    confidence: 'REAL',
    thresholds: [
      { minValue: 60, color: '#047857', label: 'Dense Forest Sanctuary (≥60%)', description: 'Protected religious and community forests (Resunga, Madane)' },
      { minValue: 40, maxValue: 59, color: '#10b981', label: 'Integrated Coffee Agroforestry (40–59%)', description: 'Shade-grown coffee and fodder tree canopy' },
      { minValue: 25, maxValue: 39, color: '#f59e0b', label: 'Terrace Farming Slopes (25–39%)', description: 'Intensive agricultural terraces with sparse boundary trees' },
      { maxValue: 24, color: '#ef4444', label: 'Cultivated Lowlands (<25%)', description: 'Riverbed agricultural farmland and settlement corridors' }
    ]
  },

  soil_nitrogen: {
    id: 'soil_nitrogen',
    pillar: 'ecosystem',
    title: 'NARC Soil Available Nitrogen (N)',
    subtitle: 'NARC 81-Point Ground Soil Sampling Survey',
    unit: '% N',
    legendType: 'domain_thresholds',
    dataSourceCitation: 'data/real/land_and_soil/gulmi_soil_points_81.json',
    confidence: 'REAL',
    thresholds: [
      { minValue: 0.20, color: '#047857', label: 'High Nitrogen (≥0.20%)', description: 'Rich in organic matter (Kaligandaki, Satyawati, Ruru)' },
      { minValue: 0.10, maxValue: 0.19, color: '#10b981', label: 'Medium Nitrogen (0.10–0.19%)', description: 'Adequate for cereal crops (Musikot, Chandrakot, Chatrakot)' },
      { maxValue: 0.09, color: '#ef4444', label: 'Low / Deficient (<0.10%)', description: 'Requires leguminous intercropping or organic compost replenishment' }
    ]
  },

  soil_phosphorus: {
    id: 'soil_phosphorus',
    pillar: 'ecosystem',
    title: 'NARC Available Phosphorus (P₂O₅)',
    subtitle: 'NARC 81-Point Ground Soil Sampling Survey',
    unit: 'kg/ha P₂O₅',
    legendType: 'domain_thresholds',
    dataSourceCitation: 'data/real/land_and_soil/gulmi_soil_points_81.json',
    confidence: 'REAL',
    thresholds: [
      { minValue: 35, color: '#0284c7', label: 'High Available P (≥35 kg/ha)', description: 'Adequate root development for pulses and oilseeds' },
      { minValue: 15, maxValue: 34, color: '#38bdf8', label: 'Medium Available P (15–34 kg/ha)', description: 'Standard agricultural maintenance application needed' },
      { maxValue: 14, color: '#ef4444', label: 'Low / Deficient (<15 kg/ha)', description: 'Phosphorus fixation on acidic hillside soils' }
    ]
  },

  soil_potassium: {
    id: 'soil_potassium',
    pillar: 'ecosystem',
    title: 'NARC Available Potassium (K₂O)',
    subtitle: 'NARC 81-Point Ground Soil Sampling Survey',
    unit: 'kg/ha K₂O',
    legendType: 'domain_thresholds',
    dataSourceCitation: 'data/real/land_and_soil/gulmi_soil_points_81.json',
    confidence: 'REAL',
    thresholds: [
      { minValue: 180, color: '#0284c7', label: 'High Available K (≥180 kg/ha)', description: 'High disease resistance and potato/coffee vigor' },
      { minValue: 110, maxValue: 179, color: '#38bdf8', label: 'Medium Available K (110–179 kg/ha)', description: 'Optimal for maize and winter cereal rotations' },
      { maxValue: 109, color: '#ef4444', label: 'Low / Leached (<110 kg/ha)', description: 'Leached soils on steep high-rainfall slopes' }
    ]
  },

  soil_sampling_grid: {
    id: 'soil_sampling_grid',
    pillar: 'ecosystem',
    title: 'NARC 81-Point Ground Soil Survey Grid',
    subtitle: 'Field Empirical Composite Classification',
    unit: 'Agronomic Class',
    legendType: 'domain_thresholds',
    dataSourceCitation: 'data/real/land_and_soil/gulmi_soil_points_81.json',
    confidence: 'REAL',
    thresholds: [
      { minValue: 75, color: '#047857', label: 'Prime Balanced Soil (≥75%)', description: 'Balanced NPK and neutral pH 6.2–6.8' },
      { minValue: 50, maxValue: 74, color: '#10b981', label: 'Productive Farmland (50–74%)', description: 'Moderate fertility requiring standard farmyard manure' },
      { maxValue: 49, color: '#ef4444', label: 'Constrained Soils (<50%)', description: 'High acidity or NPK deficiency requiring lime/fertilizer management' }
    ]
  },

  // ============================================================================
  // 4. ENERGY PILLAR
  // ============================================================================
  hydro_corridor: {
    id: 'hydro_corridor',
    pillar: 'energy',
    title: 'Viable Hydropower & River Reach Potential',
    subtitle: 'Department of Electricity Development (DOED) E-Flow Screened',
    unit: 'Capacity',
    legendType: 'domain_thresholds',
    dataSourceCitation: 'data/calculated/hydro_reaches/reaches_screened.csv',
    confidence: 'CALCULATED',
    thresholds: [
      { minValue: 1000, color: '#4c1d95', label: 'Commercial RoR (>1 MW)', description: 'National grid feed-in cascade potential (Kaligandaki/Badigad)' },
      { minValue: 100, maxValue: 999, color: '#7c3aed', label: 'Mini Hydro (100–999 kW)', description: 'Local industrial micro-grid & cold storage power' },
      { maxValue: 99, color: '#10b981', label: 'Rural Micro-Hydro (<100 kW)', description: 'Off-grid community electrification and agricultural agro-processing mills' }
    ]
  },

  solar_irradiance: {
    id: 'solar_irradiance',
    pillar: 'energy',
    title: 'Solar Photovoltaic Global Horizontal Irradiance',
    subtitle: 'NASA POWER 10-Year Daily Climatology Average',
    unit: 'kWh/m²/day',
    legendType: 'domain_thresholds',
    dataSourceCitation: 'data/real/climate/nasa_power_10_years_full.csv',
    confidence: 'REAL',
    thresholds: [
      { minValue: 5.0, color: '#b45309', label: 'Optimal Solar Ridge (≥5.0 kWh/m²/d)', description: 'Unshaded southern ridge slopes (Resunga, Madane, Malika)' },
      { minValue: 4.4, maxValue: 4.9, color: '#f59e0b', label: 'High Solar Slopes (4.4–4.9 kWh/m²/d)', description: 'Mid-hill south and west facing terraces' },
      { maxValue: 4.3, color: '#fbbf24', label: 'Valley Shadow Zone (<4.4 kWh/m²/d)', description: 'Deep river gorges subject to morning/afternoon topographic shading' }
    ]
  },

  clean_cooking: {
    id: 'clean_cooking',
    pillar: 'energy',
    title: 'Clean Cooking Transition Demand',
    subtitle: 'Alternative Energy Promotion Centre (AEPC) Biomass Reliance',
    unit: '% Biomass',
    legendType: 'domain_thresholds',
    dataSourceCitation: 'data/proxy/economic_benchmarks/rural_tariff_estimates.json',
    confidence: 'PROXY',
    thresholds: [
      { minValue: 75, color: '#ef4444', label: 'Severe Firewood Reliance (≥75%)', description: 'Urgent priority for electric induction & domestic biogas' },
      { minValue: 50, maxValue: 74, color: '#f59e0b', label: 'Moderate Firewood Reliance (50–74%)', description: 'Mixed LPG and traditional chulho cooking' },
      { maxValue: 49, color: '#10b981', label: 'Electrified / Modern Transition (<50%)', description: 'High adoption of induction cookers and grid electricity' }
    ]
  },

  grid_reach: {
    id: 'grid_reach',
    pillar: 'energy',
    title: 'NEA Distribution Grid Reach & Reliability',
    subtitle: 'Nepal Electricity Authority (NEA) Tamghas Substation Feeder Reach',
    unit: 'Reliability Tier',
    legendType: 'categorical',
    dataSourceCitation: 'data/proxy/economic_benchmarks/rural_tariff_estimates.json',
    confidence: 'PROXY',
    categories: [
      { key: 'core', color: '#047857', label: 'Tamghas Core Grid', description: 'High reliability, low transmission losses, 33kV dedicated line' },
      { key: 'secondary', color: '#0ea5e9', label: 'Secondary Mid-Hill Line', description: 'Standard 11kV distribution, occasional storm interruptions' },
      { key: 'peripheral', color: '#f59e0b', label: 'Peripheral Feeder', description: 'Long rural distribution lines subject to low voltage drop' },
      { key: 'offgrid', color: '#ef4444', label: 'Off-Grid Remote Pocket', description: 'Isolated highland settlements relying on solar micro-grids' }
    ]
  },

  // ============================================================================
  // 5. SOCIOECONOMICS PILLAR
  // ============================================================================
  road_access: {
    id: 'road_access',
    pillar: 'socioeconomics',
    title: 'Transport Accessibility to Tamghas Hub',
    subtitle: 'Department of Local Infrastructure (DoLI) Travel Time Network',
    unit: 'Hours',
    legendType: 'domain_thresholds',
    dataSourceCitation: 'data/real/boundaries/gulmi-palikas.json & DoLI transport maps',
    confidence: 'REAL',
    thresholds: [
      { maxValue: 1.0, color: '#047857', label: 'Direct Access (<1 hr)', description: 'Blacktopped highway directly connecting Tamghas market' },
      { minValue: 1.0, maxValue: 2.5, color: '#0ea5e9', label: 'Moderate Transit (1–2.5 hrs)', description: 'Gravel all-weather municipal access road' },
      { minValue: 2.6, maxValue: 4.0, color: '#f59e0b', label: 'Extended Transit (2.6–4.0 hrs)', description: 'Rough seasonal earthen track subject to monsoon blockage' },
      { minValue: 4.0, color: '#ef4444', label: 'Remote Highland Access (>4 hrs)', description: 'High logistical friction for agricultural inputs and cold chain' }
    ]
  },

  landholding: {
    id: 'landholding',
    pillar: 'socioeconomics',
    title: 'Average Agricultural Landholding per Household',
    subtitle: 'CBS National Sample Census of Agriculture 2021',
    unit: 'Ropani / HH',
    legendType: 'domain_thresholds',
    dataSourceCitation: 'data/real/municipal/palika_profiles.json & CBS 2021',
    confidence: 'REAL',
    thresholds: [
      { minValue: 8.0, color: '#047857', label: 'Substantial Holdings (≥8 Ropani)', description: 'High commercial vegetable and cash crop production capacity' },
      { minValue: 4.0, maxValue: 7.9, color: '#10b981', label: 'Medium Smallholder (4–7.9 Ropani)', description: 'Standard mid-hill mixed subsistence and cash crop terrace farming' },
      { maxValue: 3.9, color: '#ef4444', label: 'Marginal Smallholder (<4 Ropani)', description: 'High land fragmentation; requires collective farming or high-value crops' }
    ]
  },

  labor_rate: {
    id: 'labor_rate',
    pillar: 'socioeconomics',
    title: 'Daily Agricultural Labor Wage Rate',
    subtitle: 'Ministry of Labour, Employment and Social Security (MoLESS)',
    unit: 'NPR / Day',
    legendType: 'domain_thresholds',
    dataSourceCitation: 'data/proxy/social/gender_labor_coefficients.json & MoLESS rates',
    confidence: 'REAL',
    thresholds: [
      { minValue: 900, color: '#047857', label: 'Commercial Urban Wage (≥900 NPR)', description: 'Urbanized centers near Tamghas and major river highway corridors' },
      { minValue: 750, maxValue: 899, color: '#10b981', label: 'Standard Agricultural Rate (750–899 NPR)', description: 'Average rural municipal field labor rate' },
      { maxValue: 749, color: '#f59e0b', label: 'Subsidized / Subsistence Rate (<750 NPR)', description: 'Remote highland village areas with high outmigration' }
    ]
  },

  local_governance: {
    id: 'local_governance',
    pillar: 'socioeconomics',
    title: 'Local Government Body Classification',
    subtitle: 'Ministry of Federal Affairs and General Administration (MoFAGA)',
    legendType: 'categorical',
    dataSourceCitation: 'data/real/boundaries/gulmi-palikas.json',
    confidence: 'REAL',
    categories: [
      { key: 'district_hq', color: '#3730a3', label: 'District Administrative Capital', description: 'Resunga Municipality (रेसुङ्गा नगरपालिका)' },
      { key: 'commercial_hub', color: '#4f46e5', label: 'Western Commercial Hub', description: 'Musikot Municipality (मुसिकोट नगरपालिका)' },
      { key: 'religious_trade', color: '#059669', label: 'Trade & Religious Corridors', description: 'Chatrakot & Ruru Rural Municipalities' },
      { key: 'coffee_belt', color: '#10b981', label: 'Agroforestry & Coffee Belt', description: 'Dhurkot, Chandrakot, Gulmidarbar' },
      { key: 'river_lowlands', color: '#0ea5e9', label: 'River Basin Lowlands', description: 'Kaligandaki & Satyawati Rural Municipalities' },
      { key: 'highland_watershed', color: '#14b8a6', label: 'Highland Watershed Belt', description: 'Madane, Malika, Isma Rural Municipalities' }
    ]
  },

  dhm_station: {
    id: 'dhm_station',
    pillar: 'water',
    title: 'River Network & DHM Hydrometric Stations',
    subtitle: 'Department of Hydrology and Meteorology Gauge Baselines',
    legendType: 'categorical',
    dataSourceCitation: 'data/real/hydrology/gulmi_hydrology_assets.json',
    confidence: 'REAL',
    categories: [
      { key: 'primary_gauge', color: '#0284c7', label: 'Kali Gandaki (Station #410 Seti Beni)', description: 'Cable way hydrometric station at Seti Beni / Ruru confluence' },
      { key: 'badigad_gauge', color: '#0ea5e9', label: 'Badigad Khola (Station #430 Rudrabeni)', description: 'Staff gauge & discharge measurement station at Rudrabeni' },
      { key: 'panaha_gauge', color: '#06b6d4', label: 'Panaha Khola (Station #435 Tamghas)', description: 'Staff gauge & hydro-meteorological basin station at Tamghas' },
      { key: 'secondary_corridor', color: '#38bdf8', label: 'Tributary Streams (Hugdi, Chhaldi)', description: 'Perennial flow feeders contributing to Gandaki river network' }
    ]
  }
};

// Aliases for subfilter keys used interchangeably in UI controllers
SUBFILTER_LEGENDS['spring_vulnerability'] = SUBFILTER_LEGENDS['springshed_vulnerability'];
SUBFILTER_LEGENDS['clean_cooking_biomass'] = SUBFILTER_LEGENDS['clean_cooking'];
SUBFILTER_LEGENDS['grid_electrification'] = SUBFILTER_LEGENDS['grid_reach'];
SUBFILTER_LEGENDS['hq_market_proximity'] = SUBFILTER_LEGENDS['road_access'];
SUBFILTER_LEGENDS['agri_landholding'] = SUBFILTER_LEGENDS['landholding'];
SUBFILTER_LEGENDS['labor_wages'] = SUBFILTER_LEGENDS['labor_rate'];

