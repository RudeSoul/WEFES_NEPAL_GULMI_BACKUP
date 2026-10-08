// [DATA PROVENANCE]
// Data Source: data/real/land_and_soil/gulmi_soil_points_81.json
// Classification: OBSERVED REAL
// Citations: National Soil Science Research Centre (NSSRC), NARC Nepal

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const soilPhMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Soil Reaction (pH)',
    np: 'माटोको अम्लीयता (pH)',
  },
  pillarName: {
    en: 'Ecosystem',
    np: 'पारिस्थितिकी',
  },
  model: {
    en: 'NARC 127 Soil Survey Point Laboratory Interpolation',
    np: 'नार्क १२७ माटो नमूना प्रयोगशाला इन्टरपोलेसन',
  },
  formula: '\\mathrm{pH}(x) = \\frac{\\sum_{i=1}^n (w_i \\cdot \\mathrm{pH}_i)}{\\sum_{i=1}^n w_i}',
  parameter: {
    en: 'Inverse Distance Weighting (IDW) from 127 Soil Points',
    np: 'नार्क १२७ माटो नमूना IDW इन्टरपोलेसन',
  },
  variables: [
    {
      symbol: '\\mathrm{pH}(x)',
      definition: {
        en: 'Interpolated soil suspension pH at coordinate position x',
        np: 'नक्साको कुनै पनि विन्दु x मा अनुमानित माटोको पिएच',
      },
    },
    {
      symbol: '\\mathrm{pH}_i',
      definition: {
        en: 'Laboratory potentiometric tested pH value at survey sample point i',
        np: 'नार्क प्रयोगशालामा परीक्षण गरिएको वास्तविक माटो नमूना i को पिएच',
      },
    },
    {
      symbol: 'w_i',
      definition: {
        en: 'Inverse distance weight factor: w_i = 1 / d(x, x_i)²',
        np: 'दूरीको आधारमा निर्धारित प्रभाव भार: १ / दूरी²',
      },
    },
  ],
  description: {
    en: 'Empirical soil pH surface generated from 127 georeferenced laboratory test points across all 12 Palikas.',
    np: 'नार्क राष्ट्रिय माटो विज्ञान अनुसन्धान केन्द्रबाट गुल्मी जिल्लाभर संकलित १२७ माटो नमूनाहरूको प्रयोगशाला विश्लेषण।',
  },
  confidence: 'OBSERVED REAL',
  inputs: ['NARC NSSRC 127 Soil Lab Profile Points', 'Soil Survey Department GIS Grid'],
  citation: 'National Soil Science Research Centre (NSSRC), NARC Nepal',
  provenancePath: 'data/real/land_and_soil/gulmi_soil_points_81.json',
  unit: 'pH Scale (4.5–7.8)',
  currentStat: 'Strongly Acidic (<5.5) to Neutral (6.5–7.5)',
};
