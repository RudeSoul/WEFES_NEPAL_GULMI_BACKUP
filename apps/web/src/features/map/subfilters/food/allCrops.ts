// [DATA PROVENANCE]
// Data Source: data/real/agriculture/crops.json
// Classification: CALCULATED
// Citations: Nepal Agricultural Research Council (NARC)

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const allCropsMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Composite Crop Suitability',
    np: 'एकीकृत बाली अनुकूलता',
  },
  pillarName: {
    en: 'Food',
    np: 'खाद्य',
  },
  model: {
    en: 'Harmonized Multi-Crop Agronomic Diversity Index',
    np: 'बहु-बाली जैविक-विविधता सूचकाङ्क',
  },
  formula: 'I_{\\text{composite}} = \\frac{\\sum_{i=1}^n (w_i \\cdot S_i)}{\\sum_{i=1}^n w_i}',
  parameter: {
    en: 'Weighted Multi-Crop Agronomic Diversity Index',
    np: 'बहु-बाली भारित कृषि विविधता सूचकाङ्क',
  },
  variables: [
    {
      symbol: 'I_{\\text{composite}}',
      definition: {
        en: 'District-wide agricultural diversification index (0–100)',
        np: 'जिल्लाव्यापी एकीकृत बाली विविधीकरण सूचकाङ्क',
      },
    },
    {
      symbol: 'S_i',
      definition: {
        en: 'Individual suitability score for cultivar i (maize, paddy, coffee, etc.)',
        np: 'बाली i (मकै, धान, कफी आदि) को व्यक्तिगत अनुकूलता',
      },
    },
    {
      symbol: 'w_i',
      definition: {
        en: 'Economic, caloric, and local dietary importance weight',
        np: 'आर्थिक मूल्य तथा पोषणका आधारमा तोकिएको भार',
      },
    },
  ],
  description: {
    en: 'Aggregated agronomic potential across cereals, pulses, cash crops, and horticulture in Gulmi.',
    np: 'मकै, धान, गहुँ, कफी, अदुवा, सुन्तला सहितका प्रमुख बालीहरूको समग्र अनुकूलता र कृषि विविधता।',
  },
  confidence: 'CALCULATED',
  inputs: ['NARC Multi-Cultivar Matrix', 'Palika Topographic Profiles'],
  citation: 'Nepal Agricultural Research Council (NARC)',
  provenancePath: 'data/real/agriculture/crops.json',
  unit: 'Composite Score (0–100)',
  currentStat: 'District Multi-Crop Optimization & Diversity',
};
