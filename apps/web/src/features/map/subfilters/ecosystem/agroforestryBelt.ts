// [DATA PROVENANCE]
// Data Source: data/real/municipal/palika_profiles.json
// Classification: OBSERVED REAL
// Citations: Department of Forests and Soil Conservation, Ministry of Forests and Environment, Nepal

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const agroforestryBeltMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Forest Canopy & Agroforestry Belt',
    np: 'वन क्षेत्र तथा कृषि-वन संरचना',
  },
  pillarName: {
    en: 'Ecosystem',
    np: 'पारिस्थितिकी',
  },
  model: {
    en: 'Copernicus Global Land Cover & Community Forest Coverage',
    np: 'कोपर्निकस भू-सतह कभर तथा सामुदायिक वन घनत्व',
  },
  formula: '\\text{Forest Cover (\\%)} = \\left(\\frac{A_{\\text{forest}}}{A_{\\text{palika}}}\\right) \\times 100',
  parameter: {
    en: 'Community Forest User Groups (CFUGs) & Pine/Sal/Chilaune Broadleaf Belt',
    np: 'सामुदायिक वन उपभोक्ता समूह तथा सल्ला/साल/चिलाउने वन क्षेत्र',
  },
  variables: [
    {
      symbol: '\\text{Forest Cover (\\%)}',
      definition: {
        en: 'Percentage of municipal land area under closed or open forest canopy',
        np: 'पालिकाको कुल क्षेत्रफलमा वन क्षेत्रको प्रतिशत',
      },
    },
    {
      symbol: 'A_{\\text{forest}}',
      definition: {
        en: 'Total forest canopy area recorded by Department of Forests / Copernicus (ha)',
        np: 'वन विभाग र भू-उपग्रह अनुसार कुल वन क्षेत्रफल (हेक्टर)',
      },
    },
    {
      symbol: 'A_{\\text{palika}}',
      definition: {
        en: 'Total municipal geographical surface area (ha)',
        np: 'पालिकाको कुल भौगोलिक क्षेत्रफल (हेक्टर)',
      },
    },
  ],
  description: {
    en: 'Copernicus 100m land cover combined with municipal community forest inventories documenting forest canopy and tree cover.',
    np: 'गुल्मीका १२ पालिकामा सामुदायिक वन उपभोक्ता समूह तथा भू-उपग्रहबाट प्राप्त वन क्षेत्र र रूखहरूको ढाँचा।',
  },
  confidence: 'OBSERVED REAL',
  inputs: ['Copernicus Global Land Service 100m Land Cover', 'Department of Forests Community Forest Inventory'],
  citation: 'Department of Forests and Soil Conservation, Ministry of Forests and Environment, Nepal',
  provenancePath: 'data/real/municipal/palika_profiles.json',
  unit: '% Canopy Cover',
  currentStat: 'District Mean: ~48% forest canopy cover',
};
