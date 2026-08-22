import { District, Crop } from '@wefes/shared-types';
import districtsRaw from './districts.json';

export const CROPS_SEED_DATA: Crop[] = [
  {
    id: 'coffee',
    name: 'Coffee (Arabica / Robusta)',
    nepaliName: 'कफी',
    category: 'Cash Crop / Agroforestry',
    supportedUnits: ['kg', 'bag', 'metric_ton'],
    defaultUnit: 'kg',
    baseUnitName: 'kg',
    baseUnitMultiplier: { kg: 1, bag: 50, metric_ton: 1000, m3: 1, cubic_feet: 1 },
    waterFootprintPerUnit: 140, // 140 L/kg
    energyReqPerUnit: 1.8, // 1.8 kWh/kg
    carbonOffsetPerUnit: 2.5, // 2.5 kg CO2e/kg
    marketValuePerUnit: 650, // 650 NPR/kg
    laborDaysPerUnit: 0.08, // 0.08 days/kg
    caloriesPerUnit: 200,
    season: 'baahramase',
    seasonLabelNepali: 'बाह्रमासे नगदे',
    seasonMonthsNepali: 'वर्षभरि'
  },
  {
    id: 'timber_sal',
    name: 'Timber (Sal / Shorea robusta)',
    nepaliName: 'साखू / साल काठ',
    category: 'Forestry & Wood Biomass',
    supportedUnits: ['m3', 'cubic_feet'],
    defaultUnit: 'm3',
    baseUnitName: 'm3',
    baseUnitMultiplier: { m3: 1, cubic_feet: 0.0283168, kg: 1, bag: 1, metric_ton: 1 },
    waterFootprintPerUnit: 450, // 450 L/m3
    energyReqPerUnit: 18.5, // 18.5 kWh/m3
    carbonOffsetPerUnit: 750.0, // 750 kg CO2e/m3
    marketValuePerUnit: 48000, // 48,000 NPR/m3
    laborDaysPerUnit: 3.5, // 3.5 days/m3
    caloriesPerUnit: 0,
    season: 'baahramase',
    seasonLabelNepali: 'बाह्रमासे वन पैदावार',
    seasonMonthsNepali: 'वर्षभरि'
  },
  {
    id: 'tea',
    name: 'Tea (Orthodox / CTC)',
    nepaliName: 'चिया',
    category: 'High-altitude Cash Crop',
    supportedUnits: ['kg', 'bag', 'metric_ton'],
    defaultUnit: 'kg',
    baseUnitName: 'kg',
    baseUnitMultiplier: { kg: 1, bag: 50, metric_ton: 1000, m3: 1, cubic_feet: 1 },
    waterFootprintPerUnit: 90, // 90 L/kg
    energyReqPerUnit: 2.2, // 2.2 kWh/kg
    carbonOffsetPerUnit: 1.8, // 1.8 kg CO2e/kg
    marketValuePerUnit: 420, // 420 NPR/kg
    laborDaysPerUnit: 0.06, // 0.06 days/kg
    caloriesPerUnit: 150,
    season: 'baahramase',
    seasonLabelNepali: 'बाह्रमासे नगदे',
    seasonMonthsNepali: 'वर्षभरि'
  },
  {
    id: 'wheat',
    name: 'Wheat (Winter Cereal)',
    nepaliName: 'गहुँ',
    category: 'Cereal Grain / Staple Food',
    supportedUnits: ['kg', 'bag', 'metric_ton'],
    defaultUnit: 'kg',
    baseUnitName: 'kg',
    baseUnitMultiplier: { kg: 1, bag: 50, metric_ton: 1000, m3: 1, cubic_feet: 1 },
    waterFootprintPerUnit: 15, // 15 L/kg
    energyReqPerUnit: 0.35, // 0.35 kWh/kg
    carbonOffsetPerUnit: 0.8, // 0.8 kg CO2e/kg
    marketValuePerUnit: 65, // 65 NPR/kg
    laborDaysPerUnit: 0.015,
    caloriesPerUnit: 340,
    season: 'hiunde',
    seasonLabelNepali: 'हिउँदे बाली',
    seasonMonthsNepali: 'मंसिर – फागुन'
  },
  {
    id: 'rice',
    name: 'Paddy Rice (Paddy / Dhan)',
    nepaliName: 'धान',
    category: 'Staple Cereal Crop',
    supportedUnits: ['kg', 'bag', 'metric_ton'],
    defaultUnit: 'kg',
    baseUnitName: 'kg',
    baseUnitMultiplier: { kg: 1, bag: 50, metric_ton: 1000, m3: 1, cubic_feet: 1 },
    waterFootprintPerUnit: 24, // 24 L/kg
    energyReqPerUnit: 0.45, // 0.45 kWh/kg
    carbonOffsetPerUnit: 0.5, // 0.5 kg CO2e/kg
    marketValuePerUnit: 55, // 55 NPR/kg
    laborDaysPerUnit: 0.02,
    caloriesPerUnit: 360,
    season: 'barkhe',
    seasonLabelNepali: 'बर्खे बाली',
    seasonMonthsNepali: 'असार – कात्तिक'
  },
  {
    id: 'cardamom',
    name: 'Large Cardamom (Alainchi)',
    nepaliName: 'अलैंची',
    category: 'High-Value Cash Crop',
    supportedUnits: ['kg', 'bag', 'metric_ton'],
    defaultUnit: 'kg',
    baseUnitName: 'kg',
    baseUnitMultiplier: { kg: 1, bag: 50, metric_ton: 1000, m3: 1, cubic_feet: 1 },
    waterFootprintPerUnit: 180, // 180 L/kg
    energyReqPerUnit: 3.5, // 3.5 kWh/kg
    carbonOffsetPerUnit: 4.2, // 4.2 kg CO2e/kg
    marketValuePerUnit: 1450, // 1450 NPR/kg
    laborDaysPerUnit: 0.12,
    caloriesPerUnit: 300,
    season: 'baahramase',
    seasonLabelNepali: 'बाह्रमासे नगदे',
    seasonMonthsNepali: 'वर्षभरि'
  },
  {
    id: 'apple',
    name: 'Highland Apple (Marpha / Mustang)',
    nepaliName: 'स्याउ',
    category: 'High-altitude Horticulture',
    supportedUnits: ['kg', 'bag', 'metric_ton'],
    defaultUnit: 'kg',
    baseUnitName: 'kg',
    baseUnitMultiplier: { kg: 1, bag: 50, metric_ton: 1000, m3: 1, cubic_feet: 1 },
    waterFootprintPerUnit: 70, // 70 L/kg
    energyReqPerUnit: 0.4, // 0.4 kWh/kg
    carbonOffsetPerUnit: 1.5, // 1.5 kg CO2e/kg
    marketValuePerUnit: 180, // 180 NPR/kg
    laborDaysPerUnit: 0.025,
    caloriesPerUnit: 520,
    season: 'baahramase',
    seasonLabelNepali: 'बाह्रमासे फलफूल',
    seasonMonthsNepali: 'वर्षभरि'
  },
  {
    id: 'maize',
    name: 'Maize (Makai)',
    nepaliName: 'मकै',
    category: 'Cereal Grain / Staple Food',
    supportedUnits: ['kg', 'bag', 'metric_ton'],
    defaultUnit: 'kg',
    baseUnitName: 'kg',
    baseUnitMultiplier: { kg: 1, bag: 50, metric_ton: 1000, m3: 1, cubic_feet: 1 },
    waterFootprintPerUnit: 12,
    energyReqPerUnit: 0.30,
    carbonOffsetPerUnit: 0.6,
    marketValuePerUnit: 45,
    laborDaysPerUnit: 0.012,
    caloriesPerUnit: 365,
    season: 'barkhe',
    seasonLabelNepali: 'बर्खे बाली',
    seasonMonthsNepali: 'फागुन – भदौ'
  },
  {
    id: 'ginger',
    name: 'Ginger (Aduwa)',
    nepaliName: 'अदुवा',
    category: 'Spice / Cash Crop',
    supportedUnits: ['kg', 'bag', 'metric_ton'],
    defaultUnit: 'kg',
    baseUnitName: 'kg',
    baseUnitMultiplier: { kg: 1, bag: 50, metric_ton: 1000, m3: 1, cubic_feet: 1 },
    waterFootprintPerUnit: 85,
    energyReqPerUnit: 1.2,
    carbonOffsetPerUnit: 1.0,
    marketValuePerUnit: 120,
    laborDaysPerUnit: 0.05,
    caloriesPerUnit: 80,
    season: 'chaite',
    seasonLabelNepali: 'चैते / नगदे बाली',
    seasonMonthsNepali: 'चैत – मंसिर'
  },
  {
    id: 'potato',
    name: 'Potato (Aalu)',
    nepaliName: 'आलु',
    category: 'Tuber / Staple Crop',
    supportedUnits: ['kg', 'bag', 'metric_ton'],
    defaultUnit: 'kg',
    baseUnitName: 'kg',
    baseUnitMultiplier: { kg: 1, bag: 50, metric_ton: 1000, m3: 1, cubic_feet: 1 },
    waterFootprintPerUnit: 8,
    energyReqPerUnit: 0.25,
    carbonOffsetPerUnit: 0.3,
    marketValuePerUnit: 40,
    laborDaysPerUnit: 0.01,
    caloriesPerUnit: 770,
    season: 'hiunde',
    seasonLabelNepali: 'हिउँदे बाली',
    seasonMonthsNepali: 'कात्तिक – फागुन'
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane (Ukhu)',
    nepaliName: 'उखु',
    category: 'Commercial / Industrial Crop',
    supportedUnits: ['kg', 'metric_ton'],
    defaultUnit: 'metric_ton',
    baseUnitName: 'kg',
    baseUnitMultiplier: { kg: 1, bag: 50, metric_ton: 1000, m3: 1, cubic_feet: 1 },
    waterFootprintPerUnit: 18,
    energyReqPerUnit: 0.15,
    carbonOffsetPerUnit: 0.4,
    marketValuePerUnit: 8,
    laborDaysPerUnit: 0.005,
    caloriesPerUnit: 400,
    season: 'barkhe',
    seasonLabelNepali: 'बर्खे / वार्षिक बाली',
    seasonMonthsNepali: 'माघ – पुस'
  },
  {
    id: 'mango',
    name: 'Mango (Aamp)',
    nepaliName: 'आँप',
    category: 'Tropical Fruit',
    supportedUnits: ['kg', 'bag', 'metric_ton'],
    defaultUnit: 'kg',
    baseUnitName: 'kg',
    baseUnitMultiplier: { kg: 1, bag: 50, metric_ton: 1000, m3: 1, cubic_feet: 1 },
    waterFootprintPerUnit: 50,
    energyReqPerUnit: 0.3,
    carbonOffsetPerUnit: 2.0,
    marketValuePerUnit: 95,
    laborDaysPerUnit: 0.02,
    caloriesPerUnit: 600,
    season: 'baahramase',
    seasonLabelNepali: 'बाह्रमासे फलफूल',
    seasonMonthsNepali: 'वर्षभरि'
  },
  {
    id: 'orange',
    name: 'Orange / Mandarin (Suntala)',
    nepaliName: 'सुन्तला',
    category: 'Subtropical Fruit',
    supportedUnits: ['kg', 'bag', 'metric_ton'],
    defaultUnit: 'kg',
    baseUnitName: 'kg',
    baseUnitMultiplier: { kg: 1, bag: 50, metric_ton: 1000, m3: 1, cubic_feet: 1 },
    waterFootprintPerUnit: 55,
    energyReqPerUnit: 0.35,
    carbonOffsetPerUnit: 1.8,
    marketValuePerUnit: 110,
    laborDaysPerUnit: 0.022,
    caloriesPerUnit: 470,
    season: 'baahramase',
    seasonLabelNepali: 'बाह्रमासे फलफूल',
    seasonMonthsNepali: 'वर्षभरि'
  },
  {
    id: 'buckwheat',
    name: 'Buckwheat (Phapar)',
    nepaliName: 'फापर',
    category: 'Mountain Grain / Pseudocereal',
    supportedUnits: ['kg', 'bag', 'metric_ton'],
    defaultUnit: 'kg',
    baseUnitName: 'kg',
    baseUnitMultiplier: { kg: 1, bag: 50, metric_ton: 1000, m3: 1, cubic_feet: 1 },
    waterFootprintPerUnit: 6,
    energyReqPerUnit: 0.20,
    carbonOffsetPerUnit: 0.5,
    marketValuePerUnit: 85,
    laborDaysPerUnit: 0.01,
    caloriesPerUnit: 343,
    season: 'hiunde',
    seasonLabelNepali: 'हिउँदे / हिमाली बाली',
    seasonMonthsNepali: 'भदौ – मंसिर'
  },
  {
    id: 'banana',
    name: 'Banana (Kera)',
    nepaliName: 'केरा',
    category: 'Tropical Fruit',
    supportedUnits: ['kg', 'bag', 'metric_ton'],
    defaultUnit: 'kg',
    baseUnitName: 'kg',
    baseUnitMultiplier: { kg: 1, bag: 50, metric_ton: 1000, m3: 1, cubic_feet: 1 },
    waterFootprintPerUnit: 35,
    energyReqPerUnit: 0.25,
    carbonOffsetPerUnit: 1.2,
    marketValuePerUnit: 60,
    laborDaysPerUnit: 0.015,
    caloriesPerUnit: 890,
    season: 'baahramase',
    seasonLabelNepali: 'बाह्रमासे फलफूल',
    seasonMonthsNepali: 'वर्षभरि'
  },
  // ─── GAP 6 FIX: Three major Nepal crops with FAO envelopes in the engine ────
  {
    id: 'lentil',
    name: 'Lentil / Red Lentil (Masur)',
    nepaliName: 'मसुर दाल',
    category: 'Pulse / Legume',
    supportedUnits: ['kg', 'bag', 'metric_ton'],
    defaultUnit: 'kg',
    baseUnitName: 'kg',
    baseUnitMultiplier: { kg: 1, bag: 50, metric_ton: 1000, m3: 1, cubic_feet: 1 },
    // Lentil: drought-tolerant pulse; FAO WFP = 100 L/kg (lower than cereals due to N-fixation)
    waterFootprintPerUnit: 100,
    energyReqPerUnit: 0.20,
    // Nitrogen-fixation root symbiosis delivers net soil carbon: 0.6 kg CO2e/kg avoided synthetic N
    carbonOffsetPerUnit: 0.60,
    // Nepal MoALD farmgate average 2080: NPR 110–130/kg; use 120
    marketValuePerUnit: 120,
    laborDaysPerUnit: 0.012,
    caloriesPerUnit: 352,
    season: 'hiunde',
    seasonLabelNepali: 'हिउँदे दलहन',
    seasonMonthsNepali: 'मंसिर – फागुन'
  },
  {
    id: 'mustard',
    name: 'Mustard / Rapeseed (Tori)',
    nepaliName: 'तोरी / तिलहन',
    category: 'Oilseed Crop',
    supportedUnits: ['kg', 'bag', 'metric_ton'],
    defaultUnit: 'kg',
    baseUnitName: 'kg',
    baseUnitMultiplier: { kg: 1, bag: 50, metric_ton: 1000, m3: 1, cubic_feet: 1 },
    // Oilseed crops: water-efficient at 40 L/kg (drought-tolerant rabi crop)
    waterFootprintPerUnit: 40,
    energyReqPerUnit: 0.25,
    // Oil press residue (mustard cake) is a soil amendment: 0.7 kg CO2e/kg
    carbonOffsetPerUnit: 0.70,
    // Nepal MoALD farmgate 2080: NPR 80–90/kg; use 85
    marketValuePerUnit: 85,
    laborDaysPerUnit: 0.010,
    caloriesPerUnit: 565,
    season: 'hiunde',
    seasonLabelNepali: 'हिउँदे तिलहन',
    seasonMonthsNepali: 'कात्तिक – माघ'
  },
  {
    id: 'millet',
    name: 'Finger Millet / Kodo Millet (Kodo / Kaguno)',
    nepaliName: 'कोदो / कागुनो',
    category: 'Mountain Cereal / Pseudocereal',
    supportedUnits: ['kg', 'bag', 'metric_ton'],
    defaultUnit: 'kg',
    baseUnitName: 'kg',
    baseUnitMultiplier: { kg: 1, bag: 50, metric_ton: 1000, m3: 1, cubic_feet: 1 },
    // Most drought-hardy cereal in Nepal: 6 L/kg WFP; grows to 3100m altitude
    waterFootprintPerUnit: 6,
    energyReqPerUnit: 0.15,
    carbonOffsetPerUnit: 0.45,
    // Nepal farmgate 2080: NPR 50–60/kg; premium niche export fetch 80–100 NPR; use 55
    marketValuePerUnit: 55,
    laborDaysPerUnit: 0.012,
    // High iron, calcium, and dietary fibre: 336 kcal/kg
    caloriesPerUnit: 336,
    season: 'barkhe',
    seasonLabelNepali: 'बर्खे हिमाली बाली',
    seasonMonthsNepali: 'जेठ – असोज'
  },
];


export const DISTRICTS_SEED_DATA: District[] = districtsRaw as District[];

// ─── NARC NATIONAL SOIL SCIENCE RESEARCH CENTRE (NSSRC) 2023 RECOMMENDATIONS ─

export interface CropNutrientRequirement {
  cropId: string;
  nKgPerHa: number;
  p2o5KgPerHa: number;
  k2oKgPerHa: number;
  znKgPerHa: number;
  bKgPerHa: number;
  organicManureTonPerHa: number;
  description: string;
}

export const NARC_CROP_NUTRIENT_DOSES: Record<string, CropNutrientRequirement> = {
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
  // GoN Subsidized Retail Farmgate (AICL / STC Official Fixed Prices - March 2023)
  subsidizedRetailNprPerKg: {
    urea: 25.0,      // NPR 1,250 per 50kg bag (Updated March 2023)
    dap: 50.0,       // NPR 2,500 per 50kg bag (Updated March 2023)
    mop: 40.0,       // NPR 2,000 per 50kg bag (Updated March 2023)
    zincSulphate: 140.0,
    borax: 180.0,
  },
  // Unsubsidized International CIF Landed Import Price (Kolkata -> Border)
  internationalCifNprPerKg: {
    urea: 60.0,      // ~$400/MT CIF
    dap: 105.0,      // ~$700/MT CIF
    mop: 68.0,       // ~$450/MT CIF
  },
  // Freight & Handling Baseline Constants
  freightRateNprPerTonKm: {
    teraiFlat: 5.50,
    mountainHighway: 14.00,
    lastMileEarthen: 40.00,
    transshipmentLaborFeePerTon: 750.0,
  },
  // Fuel & Energy Intensity
  energyIntensityMjPerTonKm: {
    teraiFlat: 0.8,
    mountainHighway: 2.5,
    lastMileEarthen: 4.5,
  },
  dieselEnergyMjPerLiter: 38.6,
  dieselEmissionFactorKgCo2ePerMj: 0.074,
  emptyReturnPenaltyFactor: 1.60,
  // Commercial Distribution Mandate Split
  quotaSplit: {
    aiclPercent: 70,
    stcPercent: 30,
  },
};
