// [DATA PROVENANCE]
// Data Source: data/real/municipal/palika_profiles.json
// Classification: CALCULATED
// Citations: Ministry of Agriculture and Livestock Development (MoALD)

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const cerealIndexMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Cereal Self-Sufficiency',
    np: 'खाद्यान्न आत्मनिर्भरता',
  },
  pillarName: {
    en: 'Food',
    np: 'खाद्य',
  },
  model: {
    en: 'MoALD Municipal Cereal Production Balance Model',
    np: 'मन्त्रालय खाद्यान्न सन्तुलन विश्लेषण',
  },
  formula:
    '\\mathrm{SSR} = \\frac{Y_{\\text{total}}}{D_{\\text{annual}}} = \\frac{Y_{\\text{total}}}{\\text{Pop} \\times 180 \\text{ kg}}',
  parameter: {
    en: 'Demand = Population × 180 kg/capita/year',
    np: 'माग = जनसङ्ख्या × १८० केजी/व्यक्ति/वर्ष',
  },
  variables: [
    {
      symbol: 'Y_{\\text{total}}',
      definition: {
        en: 'Aggregate annual cereal harvest: paddy, maize, wheat, millet (MT)',
        np: 'वार्षिक कुल खाद्यान्न उत्पादन: धान, मकै, गहुँ, कोदो (मेट्रिक टन)',
      },
    },
    {
      symbol: 'D_{\\text{annual}}',
      definition: {
        en: 'Municipal nutritional requirement: Population × 0.180 MT/capita',
        np: 'स्थानीय पोषण माग: जनसङ्ख्या × १८० केजी प्रति व्यक्ति',
      },
    },
    {
      symbol: '180 \\text{ kg/capita/yr}',
      definition: {
        en: 'National dietary consumption benchmark defined by MoALD Nepal',
        np: 'कृषि तथा पशुपन्छी विकास मन्त्रालयको राष्ट्रिय उपभोग मापदण्ड',
      },
    },
  ],
  description: {
    en: 'Compares annual cereal production against the national dietary standard (180 kg/capita/year).',
    np: 'प्रत्येक पालिकाको वार्षिक खाद्यान्न उत्पादन र १८० केजी प्रतिव्यक्ति आवश्यकता बीचको सन्तुलन।',
  },
  confidence: 'CALCULATED',
  inputs: ['MoALD District Agriculture Statistics', 'CBS Census 2021 Palika Populations'],
  citation: 'Ministry of Agriculture and Livestock Development (MoALD)',
  provenancePath: 'data/real/municipal/palika_profiles.json',
  unit: 'Production Metric (MT)',
  currentStat: 'Annual Cereal Demand vs Actual Production Balance',
};
