// [DATA PROVENANCE]
// Data Source: data/real/land_and_soil/gulmi_soil_points_81.json
// Classification: OBSERVED REAL
// Citations: NARC National Soil Science Research Centre

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const soilOmMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Soil Organic Matter',
    np: 'जैविक पदार्थ (SOM)',
  },
  pillarName: {
    en: 'Ecosystem',
    np: 'पारिस्थितिकी',
  },
  model: {
    en: 'Walkley-Black Wet Oxidation Spectrometry Surface',
    np: 'वाक्ली-ब्ल्याक प्रयोगशाला परीक्षण',
  },
  formula: '\\text{SOM (\\%)} = \\text{SOC (\\%)} \\times 1.724',
  parameter: {
    en: 'Van Bemmelen Factor (Walkley-Black Spectrometry)',
    np: 'भ्यान बेम्मेलिन रूपान्तरण गुणक (NARC)',
  },
  variables: [
    {
      symbol: '\\text{SOM (\\%)}',
      definition: {
        en: 'Total soil organic matter percentage by dry weight',
        np: 'माटोमा जैविक पदार्थको समग्र प्रतिशत',
      },
    },
    {
      symbol: '\\text{SOC (\\%)}',
      definition: {
        en: 'Organic carbon measured via potassium dichromate oxidation',
        np: 'वाक्ली-ब्ल्याक विधिबाट परीक्षण गरिएको प्राङ्गारिक कार्बन प्रतिशत',
      },
    },
    {
      symbol: 'f_{\\text{van Bemmelen}} = 1.724',
      definition: {
        en: 'Standard Van Bemmelen conversion factor (assuming 58% carbon in humus)',
        np: 'ह्युमसमा ५८% कार्बन हुने मान्यता अनुसारको अन्तर्राष्ट्रिय रूपान्तरण गुणक',
      },
    },
  ],
  description: {
    en: 'Spatial mapping of soil organic matter supporting crop root aeration and water retention.',
    np: 'माटोको उर्वराशक्ति र जैविक पदार्थको प्रतिशत मापन।',
  },
  confidence: 'OBSERVED REAL',
  inputs: ['NARC Soil Survey Laboratory Test Database'],
  citation: 'NARC National Soil Science Research Centre',
  provenancePath: 'data/real/land_and_soil/gulmi_soil_points_81.json',
  unit: 'Organic Matter %',
  currentStat: 'Low (<1.5%), Medium (1.5–3.0%), High (>3.0%)',
};
