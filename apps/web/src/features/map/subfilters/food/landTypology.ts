// [DATA PROVENANCE]
// Data Source: data/real/agriculture/gulmi_agricultural_landholding.geojson
// Classification: OBSERVED REAL
// Citations: National Statistics Office (NSO), Government of Nepal (Census of Agriculture 2021/22)

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const landTypologyMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Terrace Typology & Landholding',
    np: 'जग्गाको किसिम तथा खेतबारी संरचना',
  },
  pillarName: {
    en: 'Food',
    np: 'खाद्य',
  },
  model: {
    en: 'NSO Agricultural Census 2021/22 Landholding Distribution',
    np: 'राष्ट्रिय कृषि गणना २०७८ जग्गा तथा खेतबारी वितरण',
  },
  formula: '\\text{Khet (\\%)} = \\left(\\frac{A_{\\text{khet}}}{A_{\\text{total}}}\\right) \\times 100',
  parameter: {
    en: 'Census Holdings = 51,200; Avg Holding = 12.15 Ropani; Khet vs Bari',
    np: 'कृषि गणना २०७८: कुल कृषि परिवार, औसत जग्गा र खेत/बारी अनुपात',
  },
  variables: [
    {
      symbol: '\\text{Khet (\\%)}',
      definition: {
        en: 'Proportion of lowland bunded irrigated terraces suited for paddy & wheat',
        np: 'धान तथा गहुँका लागि उपयुक्त सिञ्चित खेतको प्रतिशत',
      },
    },
    {
      symbol: '\\text{Bari (\\%)}',
      definition: {
        en: 'Proportion of sloping rainfed upland terraces suited for maize, millet, coffee',
        np: 'मकै, कोदो र कफीका लागि उपयुक्त पाखो बारीको प्रतिशत',
      },
    },
    {
      symbol: '\\text{Parcels}',
      definition: {
        en: 'Average land fragmentation parcels per agricultural household',
        np: 'प्रति किसान परिवार औसत कित्ता सङ्ख्या (भू-खण्डिकरण)',
      },
    },
    {
      symbol: 'A_{\\text{total}}',
      definition: {
        en: 'Aggregated cultivated agricultural area recorded by NSO Census (ha)',
        np: 'राष्ट्रिय तथ्याङ्क कार्यालय अनुसार कुल कृषियोग्य क्षेत्रफल',
      },
    },
  ],
  description: {
    en: 'Official National Sample Census of Agriculture 2021/22 dataset documenting the physical division between lowland irrigated terraces (Khet) and sloping rainfed terraces (Bari) across all 12 Palikas of Gulmi.',
    np: 'राष्ट्रिय तथ्याङ्क कार्यालय (NSO) को राष्ट्रिय कृषि गणना २०७८ अनुसार गुल्मीका १२ पालिकामा रहेका सिञ्चित खेत र पाखो बारीको वास्तविक क्षेत्रफल र कित्ता विवरण।',
  },
  confidence: 'OBSERVED REAL',
  inputs: [
    'National Sample Census of Agriculture 2021/22 (NSO Nepal)',
    'Survey Department Cadastral Parcel Records',
    'MoALD Land Resources Survey',
  ],
  citation: 'National Statistics Office (NSO), Government of Nepal (Census of Agriculture 2021/22)',
  provenancePath: 'data/real/agriculture/gulmi_agricultural_landholding.geojson',
  unit: '% Khet / % Bari / Parcels',
  currentStat: 'District: 19.4% Khet, 80.6% Bari, 3.3 Parcels/Holding',
};
