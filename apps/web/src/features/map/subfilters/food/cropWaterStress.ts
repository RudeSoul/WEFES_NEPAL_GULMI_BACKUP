// [DATA PROVENANCE]
// Data Source: data/real/agriculture/crops.json
// Classification: CALCULATED
// Citations: FAO Irrigation and Drainage Paper 56 (Allen et al., 1998) & Water Footprint Network (Mekonnen & Hoekstra)

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const cropWaterStressMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: '{crop} Moisture Stress ({season})',
    np: '{crop} जल अभाव तथा तनाव ({season})',
  },
  pillarName: {
    en: 'Food',
    np: 'खाद्य',
  },
  model: {
    en: 'Crop Water Footprint & Evapotranspiration Deficit Model',
    np: 'बाली जल पदचाप तथा वाष्पीकरण अभाव मोडल',
  },
  formula:
    '\\text{Moisture Stress (\\%)} = \\min\\left(100, \\frac{\\text{Deficit}}{\\text{Demand}} \\times 100\\right)',
  parameter: {
    en: 'Demand = MinWaterReq × (Temp / 20°C); Deficit = max(0, Demand - Rain)',
    np: 'माग = न्यूनतम जल माग × (तापक्रम / २०°C); अभाव = माग - वर्षा',
  },
  variables: [
    {
      symbol: '\\text{Stress (\\%)}',
      definition: {
        en: 'Relative irrigation moisture deficit severity index (0–100%)',
        np: 'सिँचाइ तथा पानी अभावको गम्भीरता सूचकाङ्क',
      },
    },
    {
      symbol: '\\text{Demand } (ET_c)',
      definition: {
        en: 'Thermal-adjusted crop seasonal evapotranspiration water demand (mm)',
        np: 'तापक्रम अनुसार समायोजित बालीको मौसमी पानी माग',
      },
    },
    {
      symbol: '\\text{Deficit } (\\mathrm{NIR})',
      definition: {
        en: 'Precipitation shortfall requiring supplemental irrigation (mm)',
        np: 'प्राकृतिक वर्षा नपुग भई सिँचाइ चाहिने परिमाण (मिमी)',
      },
    },
    {
      symbol: '\\mathrm{WF}',
      definition: {
        en: 'Global Water Footprint Network specific consumption benchmark (L/kg)',
        np: 'ग्लोबल वाटर फुटप्रिन्ट नेटवर्क अनुसार प्रति केजी पानी खपत दर',
      },
    },
  ],
  description: {
    en: "Evaluates {crop} water footprint and moisture stress for the {season} by comparing evapotranspiration demand against downscaled precipitation across Gulmi's 12 Palikas.",
    np: 'गुल्मीका १२ पालिकामा {season} का लागि {crop} को पानी माग र वर्षा बीचको खाडल मापन गरी सिँचाइ आवश्यकता र खडेरी जोखिम विश्लेषण गर्दछ।',
  },
  confidence: 'CALCULATED',
  inputs: [
    'FAO Irrigation and Drainage Paper No. 56 (Allen et al., Rome)',
    'Water Footprint Network Report 47 (Global Water Footprint of Crops)',
    'DHM Ground Rain Gauge & NASA POWER Climatology',
    'MoALD Seasonal Crop Water Requirements',
  ],
  citation: 'FAO Irrigation and Drainage Paper 56 (Allen et al., 1998) & Water Footprint Network (Mekonnen & Hoekstra)',
  provenancePath: 'data/real/agriculture/crops.json',
  unit: '% Moisture Deficit',
  currentStat: 'Minimal Deficit (<25%), Low Stress (25-44%), Moderate (45-64%), Severe (≥65%)',
};
