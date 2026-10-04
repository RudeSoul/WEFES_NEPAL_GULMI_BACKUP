// [DATA PROVENANCE]
// Data Source: data/real/hydrology/River_data.csv
// Classification: OBSERVED REAL
// Citations: Department of Hydrology and Meteorology (DHM), Nepal

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const riverBasinsMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Kali Gandaki Basin Topology',
    np: 'कालीगण्डकी नदी सञ्जाल',
  },
  pillarName: {
    en: 'Water',
    np: 'जल',
  },
  model: {
    en: 'DHM National River Hydrographic Network',
    np: 'जल तथा मौसम विभाग जलप्रणाली नक्सांकन',
  },
  formula: '\\omega = \\begin{cases} i + 1 & \\text{if } i = j \\\\ \\max(i, j) & \\text{if } i \\neq j \\end{cases}',
  parameter: {
    en: 'Kali Gandaki Basin & 5 Perennial Tributaries',
    np: 'कालीगण्डकी जलाधार र ५ सहायक नदीहरू',
  },
  variables: [
    {
      symbol: '\\text{Order 1}',
      definition: {
        en: 'High mountain headwater streams and seasonal gullies',
        np: 'उच्च पहाडी मुहान र मौसमी खोलाहरू',
      },
    },
    {
      symbol: '\\text{Order 2--3}',
      definition: {
        en: 'Valley agricultural tributaries (Panaha, Hugdi, Chhaldi)',
        np: 'मध्य पहाडी सहायक नदीहरू (पनाहा, हुग्दी, छलदी)',
      },
    },
    {
      symbol: '\\text{Order 4--5}',
      definition: {
        en: 'Major perennial trunk rivers (Badigad, Ridi, Kali Gandaki)',
        np: 'प्रमुख सदाबहार नदीहरू (बडिगाड, रिदी, कालीगण्डकी)',
      },
    },
  ],
  description: {
    en: 'Official GIS stream network for Kali Gandaki mainstem and its 5 perennial tributaries (Badigad, Ridi, Panaha, Hugdi, Chhaldi).',
    np: 'कालीगण्डकी मुख्य नदी र यसका ५ सहायक नदीहरू (बडिगाड, रिदी, पनाहा, हुग्दी, छलदी) को आधिकारिक जलाधार सञ्जाल।',
  },
  confidence: 'OBSERVED REAL',
  inputs: ['DHM National River Network GIS', 'Survey Department 1:25,000 Topographic Sheets'],
  citation: 'Department of Hydrology and Meteorology (DHM), Nepal',
  provenancePath: 'data/real/hydrology/River_data.csv',
  unit: 'Hydrological Reaches',
  currentStat: '6 Perennial Catchments • Kali Gandaki Basin Drainage',
};
