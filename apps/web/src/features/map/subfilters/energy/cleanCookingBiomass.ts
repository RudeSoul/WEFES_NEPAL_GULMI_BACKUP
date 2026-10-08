// [DATA PROVENANCE]
// Data Source: data/real/infrastructure/cooking_household.geojson
// Classification: OBSERVED REAL
// Citations: National Statistics Office (NSO), Nepal (https://censusresults.nsonepal.gov.np/downloads/census-dataset)

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const cleanCookingBiomassMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Clean Cooking & Firewood Reliance',
    np: 'स्वच्छ भान्छा र दाउरा निर्भरता दर',
  },
  pillarName: {
    en: 'Energy',
    np: 'ऊर्जा',
  },
  model: {
    en: 'National Population and Housing Census 2021 Household Cooking Fuel Analysis (NSO Nepal)',
    np: 'राष्ट्रिय जनगणना २०७८ भान्छाको इन्धन विश्लेषण',
  },
  formula:
    '\\text{Firewood (\\%)} = \\left(\\frac{\\mathrm{HH}_{\\text{firewood}, p}}{\\mathrm{HH}_{\\text{total}, p}}\\right) \\times 100',
  parameter: {
    en: 'Primary Household Cooking Fuel Stratification (Firewood vs. Modern LPG/Electricity/Biogas)',
    np: 'प्राथमिक खाना पकाउने इन्धन वर्गीकरण (दाउरा वि. एलपीजी/विद्युत्/बायोग्यास)',
  },
  variables: [
    {
      symbol: '\\text{Firewood (\\%)}',
      definition: {
        en: 'Percentage of households relying primarily on traditional firewood/biomass for cooking',
        np: 'खाना पकाउन परम्परागत दाउरामा निर्भर घरधुरी प्रतिशत',
      },
    },
    {
      symbol: '\\mathrm{HH}_{\\text{firewood}, p}',
      definition: {
        en: 'Recorded number of firewood-dependent households in Palika p (NSO 2021 Census)',
        np: 'पालिका भित्रका दाउरा प्रयोग गर्ने कुल घरधुरी संख्या (जनगणना २०७८)',
      },
    },
    {
      symbol: '\\mathrm{HH}_{\\text{total}, p}',
      definition: {
        en: 'Total enumerated households in Palika p (Gulmi district total: 66,100 HHs)',
        np: 'पालिका भित्रका कुल घरधुरी संख्या (गुल्मी जिल्लाभर कुल ६६,१०० घरधुरी)',
      },
    },
    {
      symbol: '\\text{LPG (\\%)}',
      definition: {
        en: 'Liquefied Petroleum Gas adoption rate (ranging from 2.9% in Malika to 41.6% in Resunga)',
        np: 'एलपीजी ग्यास प्रयोग दर (मालिकामा २.९% देखि रेसुङ्गामा ४१.६% सम्म)',
      },
    },
  ],
  description: {
    en: 'Official empirical household cooking fuel metrics from the National Population and Housing Census 2021 (National Statistics Office, Nepal). Analyzes 66,100 households across all 12 Palikas, identifying urgent priority zones for electric induction cooktops, domestic biogas digesters, and forest biomass conservation.',
    np: 'राष्ट्रिय तथ्याङ्क कार्यालय (NSO) द्वारा सञ्चालित राष्ट्रिय जनगणना २०७८ को आधिकारिक तथ्याङ्क। गुल्मीका १२ वटै पालिकाका ६६,१०० घरधुरीको भान्छाको इन्धन विश्लेषण गरी विद्युतीय इन्डक्सन, बायोग्यास तथा वन संरक्षण रणनीतिका लागि नीतिगत आधार प्रदान गर्दछ।',
  },
  confidence: 'OBSERVED REAL',
  inputs: [
    'NSO Nepal Census 2021 Household Cooking Fuel Dataset (hhld07_typeofcookingfuel.csv)',
    'OpenStreetMap / HDX Admin Level 7 Local Administrative Boundaries',
    'QGIS Geospatial Table Attribute Join (66,100 Households)',
  ],
  citation: 'National Statistics Office (NSO), Nepal (https://censusresults.nsonepal.gov.np/downloads/census-dataset)',
  provenancePath: 'data/real/infrastructure/cooking_household.geojson',
  unit: '% Households',
  currentStat: '58.1% to 96.1% Firewood Reliance (District Mean: 86.3%)',
};
