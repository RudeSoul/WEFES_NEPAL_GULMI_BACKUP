/**
 * WEFES Nexus Nepal - Empirical Multi-Species Livestock & Bioeconomy Engine
 * Calibrated against:
 *  - MoALD / Department of Livestock Services (DLS) 2024 Statistical Yearbook
 *  - NARC Animal Breeding & Animal Nutrition Divisions
 *  - IPCC AR6 / Tier-2 South Asia Livestock Greenhouse Gas Inventories
 *  - AEPC National Biogas Program Specifications
 */

export type LivestockSpeciesType = 'buffalo' | 'cattle' | 'goat' | 'poultry' | 'swine';

export interface LivestockSpeciesSpec {
  id: LivestockSpeciesType;
  name: string;
  nameNep: string;
  breeds: string[];
  nationalPop: string;
  nationalContribution: string;
  dailyDungKgPerHead: number;
  manureN_pct: number;
  manureP_pct: number;
  manureK_pct: number;
  biogasYieldM3PerKgDung: number;
  dailyDrinkingWaterLiters: number;
  fodderWaterM3PerHeadYr: number;
  entericMethaneKgPerHeadYr: number; // IPCC Tier-2
  feedProfile: {
    primaryFeed: string;
    dryMatterIntakeKgDay: number;
    proteinRequirementPct: number;
  };
  economicProduct: {
    productName: string;
    annualYieldPerHead: number;
    unit: string;
    farmgatePriceNpr: number;
  };
  gesiProfile: {
    womenOwnershipPct: number;
    laborRole: string;
    empowermentScore: 'High (Primary Female Asset)' | 'Moderate (Joint Asset)' | 'Commercial';
  };
}

export const NEPAL_LIVESTOCK_DATABASE: Record<LivestockSpeciesType, LivestockSpeciesSpec> = {
  buffalo: {
    id: 'buffalo',
    name: 'Water Buffalo (Bhainsi)',
    nameNep: 'भैंसी (Murrah / Lime / Parkote)',
    breeds: ['Murrah Cross (Terai/Valleys)', 'Lime (Mid-Hills indigenous)', 'Parkote (Western Hills)'],
    nationalPop: '5.3 Million heads (MoALD 2024)',
    nationalContribution: '71% of Nepal National Milk Supply (1.9M MT/yr)',
    dailyDungKgPerHead: 18.0,
    manureN_pct: 0.42,
    manureP_pct: 0.22,
    manureK_pct: 0.51,
    biogasYieldM3PerKgDung: 0.040,
    dailyDrinkingWaterLiters: 70,
    fodderWaterM3PerHeadYr: 310,
    entericMethaneKgPerHeadYr: 55.0, // 55 kg CH4 = 1,485 kg CO2e
    feedProfile: {
      primaryFeed: 'Paddy straw + Green Napier + Mustard cake concentrate',
      dryMatterIntakeKgDay: 10.5,
      proteinRequirementPct: 12.5,
    },
    economicProduct: {
      productName: 'High-Fat Buffalo Milk (7.5% Fat, 9.2% SNF)',
      annualYieldPerHead: 1650,
      unit: 'Liters/year',
      farmgatePriceNpr: 78,
    },
    gesiProfile: {
      womenOwnershipPct: 48,
      laborRole: 'Milking, stall cleaning, fodder lopping & dung collection',
      empowermentScore: 'Moderate (Joint Asset)',
    },
  },
  cattle: {
    id: 'cattle',
    name: 'Dairy Cattle & Cows (Gaai)',
    nameNep: 'गाई (Jersey Cross / Holstein / Achhami)',
    breeds: ['Jersey Cross (Commercial)', 'Holstein-Friesian Cross', 'Siri & Achhami (Indigenous Hill/Mountain)'],
    nationalPop: '7.4 Million heads (MoALD 2024)',
    nationalContribution: '29% of Nepal National Milk Supply (0.8M MT/yr)',
    dailyDungKgPerHead: 13.5,
    manureN_pct: 0.50,
    manureP_pct: 0.25,
    manureK_pct: 0.48,
    biogasYieldM3PerKgDung: 0.035,
    dailyDrinkingWaterLiters: 55,
    fodderWaterM3PerHeadYr: 260,
    entericMethaneKgPerHeadYr: 46.0,
    feedProfile: {
      primaryFeed: 'Oat-Vetch silage, Maize stover, Berseem, Commercial balanced pellet',
      dryMatterIntakeKgDay: 9.0,
      proteinRequirementPct: 13.0,
    },
    economicProduct: {
      productName: 'Standard Liquid Milk (4.0% Fat, 8.2% SNF)',
      annualYieldPerHead: 2200,
      unit: 'Liters/year',
      farmgatePriceNpr: 66,
    },
    gesiProfile: {
      womenOwnershipPct: 42,
      laborRole: 'Daily feeding, grazing, organic compost preparation',
      empowermentScore: 'Moderate (Joint Asset)',
    },
  },
  goat: {
    id: 'goat',
    name: 'Goats & Chevon (Bakhra / Khasi)',
    nameNep: 'बाख्रा (Khari / Jamunapari / Boer / Chyangra)',
    breeds: ['Khari (Prolific Hill indigenous - 1.8 twinning)', 'Jamunapari Cross (Terai)', 'Boer Cross (Meat)', 'Chyangra (Himalayan Pashmina)'],
    nationalPop: '14.2 Million heads (MoALD 2024)',
    nationalContribution: '#1 Red Meat Sector (55% of all national meat, 78,000 MT chevon)',
    dailyDungKgPerHead: 2.0,
    manureN_pct: 1.40,
    manureP_pct: 0.50,
    manureK_pct: 1.20,
    biogasYieldM3PerKgDung: 0.055,
    dailyDrinkingWaterLiters: 6.5,
    fodderWaterM3PerHeadYr: 35,
    entericMethaneKgPerHeadYr: 5.0,
    feedProfile: {
      primaryFeed: 'Forest browse, Badahar/Bakaino tree leaves, Stylosanthes, Pigeonpea foliage',
      dryMatterIntakeKgDay: 1.2,
      proteinRequirementPct: 14.0,
    },
    economicProduct: {
      productName: 'Live Chevon / Meat Goat (Khasi)',
      annualYieldPerHead: 1.6, // Offspring sold/yr per breeding doe
      unit: 'heads sold/year',
      farmgatePriceNpr: 14500,
    },
    gesiProfile: {
      womenOwnershipPct: 82,
      laborRole: 'Direct herd management, sales decision-making & health management',
      empowermentScore: 'High (Primary Female Asset)',
    },
  },
  poultry: {
    id: 'poultry',
    name: 'Commercial & Backyard Poultry (Kukhura)',
    nameNep: 'कुखुरा (Broiler / Layer / Sakini / Giriraja)',
    breeds: ['Cobb 500 Broiler (Commercial)', 'Hy-Line Layer (Egg)', 'Sakini (Indigenous free-range)', 'Giriraja (Dual-purpose)'],
    nationalPop: '110+ Million birds (Self-Sufficient Industry)',
    nationalContribution: '100% National Meat & Egg Security (240k MT meat, 1.6B eggs)',
    dailyDungKgPerHead: 0.12,
    manureN_pct: 3.00,
    manureP_pct: 2.50,
    manureK_pct: 1.50,
    biogasYieldM3PerKgDung: 0.070,
    dailyDrinkingWaterLiters: 0.35,
    fodderWaterM3PerHeadYr: 4.5,
    entericMethaneKgPerHeadYr: 0.0, // Monogastric (0 enteric, ~0.02 kg manure CH4)
    feedProfile: {
      primaryFeed: 'Domestic yellow maize (60%) + Soybean de-oiled cake (30%) + Premix (10%)',
      dryMatterIntakeKgDay: 0.11,
      proteinRequirementPct: 19.5,
    },
    economicProduct: {
      productName: 'Live Broiler Meat / Fresh Table Eggs',
      annualYieldPerHead: 6.0, // 6 batches per broiler unit/yr or 280 eggs/layer
      unit: 'kg live meat/yr',
      farmgatePriceNpr: 260,
    },
    gesiProfile: {
      womenOwnershipPct: 75,
      laborRole: 'Feeding, egg collection, local market retail sales',
      empowermentScore: 'High (Primary Female Asset)',
    },
  },
  swine: {
    id: 'swine',
    name: 'Swine & Pigs (Sungur / Bandel)',
    nameNep: 'सुँगुर (Pakhribas Black / Dharane / Hurrah)',
    breeds: ['Pakhribas Black (NARC released)', 'Dharane Black', 'Hurrah (Terai Indigenous)', 'Wild Boar Hybrid (Bandel)'],
    nationalPop: '1.6 Million heads (Eastern Hills & Terai)',
    nationalContribution: 'High Protein Conversion of Agro-Waste & Janajati Livelihood Anchor',
    dailyDungKgPerHead: 4.2,
    manureN_pct: 0.70,
    manureP_pct: 0.50,
    manureK_pct: 0.40,
    biogasYieldM3PerKgDung: 0.050,
    dailyDrinkingWaterLiters: 18.0,
    fodderWaterM3PerHeadYr: 45,
    entericMethaneKgPerHeadYr: 1.5,
    feedProfile: {
      primaryFeed: 'Rice bran, vegetable culls, brewer spent grains, boiled Colocasia roots',
      dryMatterIntakeKgDay: 2.2,
      proteinRequirementPct: 15.0,
    },
    economicProduct: {
      productName: 'Live Market Pig / Pork Weight',
      annualYieldPerHead: 85,
      unit: 'kg meat/year',
      farmgatePriceNpr: 320,
    },
    gesiProfile: {
      womenOwnershipPct: 65,
      laborRole: 'Feed boiling, stall management, local butchery supply',
      empowermentScore: 'High (Primary Female Asset)',
    },
  },
};

export interface MultiSpeciesHerdConfig {
  buffaloHeads: number;
  cattleHeads: number;
  goatHeads: number;
  poultryHeads: number;
  swineHeads: number;
}

export interface MultiSpeciesLivestockBioeconomyResult {
  districtName: string;
  herdConfig: MultiSpeciesHerdConfig;
  totalLivestockUnitsLSU: number;
  
  // 1. Manure & AEPC Biogas Balance
  dailyDungTotalKg: number;
  annualDungTotalTonnes: number;
  dailyBiogasM3: number;
  annualBiogasM3: number;
  annualLpgCylindersDisplaced: number;
  annualLpgSavingsNpr: number;
  aepcRecommendedDigesterSize: '2 m³ Small Digester' | '4 m³ Standard Digester' | '6 m³ Community/Farm Digester' | '8-10 m³ Institutional Plant';
  
  // 2. Soil NPK Organic Return & Chemical Fertilizer Offset
  annualOrganicNitrogenKg: number;
  annualOrganicPhosphorusKg: number;
  annualOrganicPotassiumKg: number;
  chemicalUrea50kgBagsSubstituted: number;
  chemicalDap50kgBagsSubstituted: number;
  chemicalMop50kgBagsSubstituted: number;
  annualFertilizerCostSavingsNpr: number;
  
  // 3. Water Footprint
  dailyDrinkingWaterLiters: number;
  annualDirectDrinkingWaterM3: number;
  annualFeedFodderWaterM3: number;
  totalAnnualLivestockWaterDemandM3: number;
  
  // 4. Climate & Carbon Balance (IPCC AR6 / GWP100 CH4=27)
  grossEntericMethaneKgYr: number;
  grossEntericCo2eTonnesYr: number;
  avoidedBiogasEmissionsCo2eTonnesYr: number;
  netLivestockGhGEmissionsCo2eTonnesYr: number;
  
  // 5. Economic & GESI Household Balance
  annualGrossLivestockRevenueNpr: number;
  femaleControlledRevenueNpr: number;
  femaleControlledIncomeSharePct: number;
  householdMonthlyLivestockCashflowNpr: number;
  dscrDebtServiceContribution: number;
  
  // 6. NARC Fodder Resilience Package
  narcStrawTreatmentRecipe: {
    strawKg: number;
    ureaKg: number;
    waterLiters: number;
    fermentationDays: number;
    crudeProteinBoost: string;
    digestibilityBoost: string;
  };
}

export function computeMultiSpeciesLivestockBioeconomy(
  districtName: string,
  herdConfig: MultiSpeciesHerdConfig = {
    buffaloHeads: 2,
    cattleHeads: 1,
    goatHeads: 6,
    poultryHeads: 50,
    swineHeads: 0,
  }
): MultiSpeciesLivestockBioeconomyResult {
  const { buffaloHeads, cattleHeads, goatHeads, poultryHeads, swineHeads } = herdConfig;

  // Livestock Standard Units (LSU): Buffalo=1.0, Cattle=0.8, Swine=0.25, Goat=0.1, Poultry=0.01
  const lsu = Number((
    buffaloHeads * 1.0 +
    cattleHeads * 0.8 +
    swineHeads * 0.25 +
    goatHeads * 0.10 +
    poultryHeads * 0.01
  ).toFixed(2));

  // 1. Manure & Biogas
  const buf = NEPAL_LIVESTOCK_DATABASE.buffalo;
  const cat = NEPAL_LIVESTOCK_DATABASE.cattle;
  const goa = NEPAL_LIVESTOCK_DATABASE.goat;
  const pou = NEPAL_LIVESTOCK_DATABASE.poultry;
  const swi = NEPAL_LIVESTOCK_DATABASE.swine;

  const dailyDungKg = Number((
    buffaloHeads * buf.dailyDungKgPerHead +
    cattleHeads * cat.dailyDungKgPerHead +
    goatHeads * goa.dailyDungKgPerHead +
    poultryHeads * pou.dailyDungKgPerHead +
    swineHeads * swi.dailyDungKgPerHead
  ).toFixed(1));

  const annualDungTonnes = Number(((dailyDungKg * 365) / 1000).toFixed(2));

  // Biogas: Substrates feeding household digester (Buffalo, Cattle, Swine, Poultry)
  const dailyBiogasM3 = Number((
    buffaloHeads * buf.dailyDungKgPerHead * buf.biogasYieldM3PerKgDung +
    cattleHeads * cat.dailyDungKgPerHead * cat.biogasYieldM3PerKgDung +
    swineHeads * swi.dailyDungKgPerHead * swi.biogasYieldM3PerKgDung +
    (poultryHeads * pou.dailyDungKgPerHead * pou.biogasYieldM3PerKgDung * 0.5) // 50% poultry manure co-digested
  ).toFixed(2));

  const annualBiogasM3 = Number((dailyBiogasM3 * 365).toFixed(1));
  // 1 m³ biogas = 0.45 kg LPG; 1 LPG cylinder = 14.2 kg (NPR 1,900)
  const lpgCylindersDisplaced = Number(((annualBiogasM3 * 0.45) / 14.2).toFixed(1));
  const lpgSavingsNpr = Math.round(lpgCylindersDisplaced * 1900);

  let aepcSize: MultiSpeciesLivestockBioeconomyResult['aepcRecommendedDigesterSize'] = '2 m³ Small Digester';
  if (dailyBiogasM3 >= 3.5) aepcSize = '8-10 m³ Institutional Plant';
  else if (dailyBiogasM3 >= 2.2) aepcSize = '6 m³ Community/Farm Digester';
  else if (dailyBiogasM3 >= 1.2) aepcSize = '4 m³ Standard Digester';

  // 2. Soil NPK Organic Return
  const annualDungBuf = buffaloHeads * buf.dailyDungKgPerHead * 365;
  const annualDungCat = cattleHeads * cat.dailyDungKgPerHead * 365;
  const annualDungGoa = goatHeads * goa.dailyDungKgPerHead * 365;
  const annualDungPou = poultryHeads * pou.dailyDungKgPerHead * 365;
  const annualDungSwi = swineHeads * swi.dailyDungKgPerHead * 365;

  const orgN = Number((
    annualDungBuf * (buf.manureN_pct / 100) +
    annualDungCat * (cat.manureN_pct / 100) +
    annualDungGoa * (goa.manureN_pct / 100) +
    annualDungPou * (pou.manureN_pct / 100) +
    annualDungSwi * (swi.manureN_pct / 100)
  ).toFixed(1));

  const orgP = Number((
    annualDungBuf * (buf.manureP_pct / 100) +
    annualDungCat * (cat.manureP_pct / 100) +
    annualDungGoa * (goa.manureP_pct / 100) +
    annualDungPou * (pou.manureP_pct / 100) +
    annualDungSwi * (swi.manureP_pct / 100)
  ).toFixed(1));

  const orgK = Number((
    annualDungBuf * (buf.manureK_pct / 100) +
    annualDungCat * (cat.manureK_pct / 100) +
    annualDungGoa * (goa.manureK_pct / 100) +
    annualDungPou * (pou.manureK_pct / 100) +
    annualDungSwi * (swi.manureK_pct / 100)
  ).toFixed(1));

  // Chemical replacement: 1 bag Urea (50kg) = 23 kg N (NPR 1,050 subsidized); 1 bag DAP (50kg) = 23 kg P2O5 + 9 kg N (NPR 2,450); 1 bag MOP = 30 kg K2O (NPR 1,800)
  const ureaBags = Number((orgN / 23).toFixed(1));
  const dapBags = Number((orgP / 23).toFixed(1));
  const mopBags = Number((orgK / 30).toFixed(1));
  const fertSavingsNpr = Math.round(ureaBags * 1050 + dapBags * 2450 + mopBags * 1800);

  // 3. Water Demand
  const dailyDrinking = Number((
    buffaloHeads * buf.dailyDrinkingWaterLiters +
    cattleHeads * cat.dailyDrinkingWaterLiters +
    goatHeads * goa.dailyDrinkingWaterLiters +
    poultryHeads * pou.dailyDrinkingWaterLiters +
    swineHeads * swi.dailyDrinkingWaterLiters
  ).toFixed(1));

  const annualDirectWater = Number(((dailyDrinking * 365) / 1000).toFixed(2));
  const annualFodderWater = Number((
    buffaloHeads * buf.fodderWaterM3PerHeadYr +
    cattleHeads * cat.fodderWaterM3PerHeadYr +
    goatHeads * goa.fodderWaterM3PerHeadYr +
    poultryHeads * pou.fodderWaterM3PerHeadYr +
    swineHeads * swi.fodderWaterM3PerHeadYr
  ).toFixed(1));
  const totalWaterM3 = Number((annualDirectWater + annualFodderWater).toFixed(1));

  // 4. Climate & Carbon (IPCC AR6: CH4 GWP = 27)
  const entericMethaneKg = Number((
    buffaloHeads * buf.entericMethaneKgPerHeadYr +
    cattleHeads * cat.entericMethaneKgPerHeadYr +
    goatHeads * goa.entericMethaneKgPerHeadYr +
    poultryHeads * pou.entericMethaneKgPerHeadYr +
    swineHeads * swi.entericMethaneKgPerHeadYr
  ).toFixed(1));

  const grossCo2eTonnes = Number(((entericMethaneKg * 27) / 1000).toFixed(2));
  // Avoided emissions from biogas (displacing firewood 1.5t/yr = 2.4 t CO2e + LPG 0.45 kg/m³ = 0.6 t CO2e)
  const avoidedCo2eTonnes = Number(((annualBiogasM3 * 0.0028) + (lpgCylindersDisplaced * 0.042)).toFixed(2));
  const netCo2eTonnes = Number((grossCo2eTonnes - avoidedCo2eTonnes).toFixed(2));

  // 5. Economic & GESI
  const bufRev = buffaloHeads * buf.economicProduct.annualYieldPerHead * buf.economicProduct.farmgatePriceNpr;
  const catRev = cattleHeads * cat.economicProduct.annualYieldPerHead * cat.economicProduct.farmgatePriceNpr;
  const goaRev = goatHeads * goa.economicProduct.annualYieldPerHead * goa.economicProduct.farmgatePriceNpr;
  const pouRev = poultryHeads * pou.economicProduct.annualYieldPerHead * pou.economicProduct.farmgatePriceNpr;
  const swiRev = swineHeads * swi.economicProduct.annualYieldPerHead * swi.economicProduct.farmgatePriceNpr;

  const totalGrossRev = Math.round(bufRev + catRev + goaRev + pouRev + swiRev);

  // Female-controlled revenue by species ownership share
  const femaleRev = Math.round(
    bufRev * (buf.gesiProfile.womenOwnershipPct / 100) +
    catRev * (cat.gesiProfile.womenOwnershipPct / 100) +
    goaRev * (goa.gesiProfile.womenOwnershipPct / 100) +
    pouRev * (pou.gesiProfile.womenOwnershipPct / 100) +
    swiRev * (swi.gesiProfile.womenOwnershipPct / 100)
  );

  const femaleSharePct = totalGrossRev > 0 ? Number(((femaleRev / totalGrossRev) * 100).toFixed(1)) : 0;
  const monthlyCashflow = Math.round(totalGrossRev / 12);
  const dscrContribution = Number((monthlyCashflow / 18500).toFixed(2)); // Benchmark against 18.5k NPR monthly loan repayment

  return {
    districtName,
    herdConfig,
    totalLivestockUnitsLSU: lsu,
    dailyDungTotalKg: dailyDungKg,
    annualDungTotalTonnes: annualDungTonnes,
    dailyBiogasM3,
    annualBiogasM3,
    annualLpgCylindersDisplaced: lpgCylindersDisplaced,
    annualLpgSavingsNpr: lpgSavingsNpr,
    aepcRecommendedDigesterSize: aepcSize,
    annualOrganicNitrogenKg: orgN,
    annualOrganicPhosphorusKg: orgP,
    annualOrganicPotassiumKg: orgK,
    chemicalUrea50kgBagsSubstituted: ureaBags,
    chemicalDap50kgBagsSubstituted: dapBags,
    chemicalMop50kgBagsSubstituted: mopBags,
    annualFertilizerCostSavingsNpr: fertSavingsNpr,
    dailyDrinkingWaterLiters: dailyDrinking,
    annualDirectDrinkingWaterM3: annualDirectWater,
    annualFeedFodderWaterM3: annualFodderWater,
    totalAnnualLivestockWaterDemandM3: totalWaterM3,
    grossEntericMethaneKgYr: entericMethaneKg,
    grossEntericCo2eTonnesYr: grossCo2eTonnes,
    avoidedBiogasEmissionsCo2eTonnesYr: avoidedCo2eTonnes,
    netLivestockGhGEmissionsCo2eTonnesYr: netCo2eTonnes,
    annualGrossLivestockRevenueNpr: totalGrossRev,
    femaleControlledRevenueNpr: femaleRev,
    femaleControlledIncomeSharePct: femaleSharePct,
    householdMonthlyLivestockCashflowNpr: monthlyCashflow,
    dscrDebtServiceContribution: dscrContribution,
    narcStrawTreatmentRecipe: {
      strawKg: 100,
      ureaKg: 4,
      waterLiters: 40,
      fermentationDays: 21,
      crudeProteinBoost: '3.5% → 7.8% Crude Protein (+122% boost)',
      digestibilityBoost: '42% → 54% in-vitro dry matter digestibility',
    },
  };
}
