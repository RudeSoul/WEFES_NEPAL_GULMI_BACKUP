// [DATA PROVENANCE]
// Data Source: data/real/boundaries/gulmi-palikas.json
// Classification: OBSERVED REAL
// Citations: Ministry of Federal Affairs and General Administration (MoFAGA)

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const localGovernanceMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Administrative Typology',
    np: 'स्थानीय तह संरचना',
  },
  pillarName: {
    en: 'Socioeconomics',
    np: 'सामाजिक-आर्थिक',
  },
  model: {
    en: 'Constitution of Nepal 2015 Local Governance Typology',
    np: 'नेपालको संविधान २०७२ स्थानीय संरचना',
  },
  formula: '\\text{Palikas} = 2 \\, \\text{Urban (Nagarpalika)} + 10 \\, \\text{Rural (Gaunpalika)} = 12',
  parameter: {
    en: 'Constitution of Nepal 2015 Local Governance Typology',
    np: 'नेपालको संविधान २०७२ स्थानीय संरचना',
  },
  variables: [
    {
      symbol: '\\text{Nagarpalika}',
      definition: {
        en: '2 Urban Municipalities: Resunga (HQ) and Musikot',
        np: '२ नगरपालिका: रेसुङ्गा (सदरमुकाम) र मुसिकोट',
      },
    },
    {
      symbol: '\\text{Gaunpalika}',
      definition: {
        en: '10 Rural Municipalities designated under 2015 Federal Constitution',
        np: '१० गाउँपालिकाहरू (नेपालको संविधान २०७२ अनुसार)',
      },
    },
  ],
  description: {
    en: 'Official administrative classification under MoFAGA federal governance structure.',
    np: 'गुल्मी जिल्लाका २ नगरपालिका र १० गाउँपालिकाहरूको प्रशासनिक संरचना।',
  },
  confidence: 'OBSERVED REAL',
  inputs: ['MoFAGA Local Government Registries', 'Survey Department Administrative Boundaries'],
  citation: 'Ministry of Federal Affairs and General Administration (MoFAGA)',
  provenancePath: 'data/real/boundaries/gulmi-palikas.json',
  unit: 'Administrative Type',
  currentStat: '2 Nagarpalikas • 10 Gaunpalikas',
};
