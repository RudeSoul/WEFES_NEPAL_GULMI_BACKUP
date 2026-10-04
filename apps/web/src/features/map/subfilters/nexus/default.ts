// [DATA PROVENANCE]
// Data Source: data/real/municipal/palika_profiles.json
// Classification: CALCULATED
// Citations: DHM, MoALD, NARC, CBS, Survey Department, NASA POWER

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const defaultMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'WEFES Spatial Nexus Model',
    np: 'नेक्सस भू-स्थानिक मोडल',
  },
  pillarName: {
    en: '5 Pillars',
    np: '५ स्तम्भ',
  },
  model: {
    en: 'Integrated Water-Energy-Food-Ecosystem Decision Support',
    np: 'एकीकृत जल-ऊर्जा-खाद्य-पारिस्थितिकी विश्लेषण',
  },
  formula: 'I_{\\text{WEFES}} = f(\\mathbf{W}, \\, \\mathbf{E}, \\, \\mathbf{F}, \\, \\mathbf{Eco}, \\, \\mathbf{Soc})',
  parameter: {
    en: '5-Pillar Harmonized Spatial Decision Index',
    np: '५-स्तम्भ एकीकृत भू-स्थानिक सूचकाङ्क',
  },
  variables: [
    {
      symbol: '\\mathbf{W} \\text{ (Water)}',
      definition: {
        en: 'Catchment yield, springshed conservation, and irrigation access',
        np: 'जलाधार बहाव, मुहान संरक्षण र सिँचाइ पहुँच',
      },
    },
    {
      symbol: '\\mathbf{E} \\text{ (Energy)}',
      definition: {
        en: 'Hydropower potential, solar radiation, and clean cooking access',
        np: 'जलविद्युत, सौर्य विकिरण र स्वच्छ इन्धन पहुँच',
      },
    },
    {
      symbol: '\\mathbf{F} \\text{ (Food)}',
      definition: {
        en: 'NARC crop suitability, agro-biodiversity, and cereal balance',
        np: 'बाली अनुकूलता, कृषि विविधता र खाद्यान्न आत्मनिर्भरता',
      },
    },
    {
      symbol: '\\mathbf{Eco} \\text{ (Ecosystem)}',
      definition: {
        en: 'Soil pH health, organic matter percentage, and slope stability',
        np: 'माटोको पिएच, जैविक पदार्थ र भिरालो भू-संरक्षण',
      },
    },
    {
      symbol: '\\mathbf{Soc} \\text{ (Society)}',
      definition: {
        en: 'Market connectivity, transport master plan, and local governance',
        np: 'बजार पहुँच, यातायात दूरी र स्थानीय सरकार क्षमता',
      },
    },
  ],
  description: {
    en: 'Scientific spatial decision support system for Gulmi District, Nepal.',
    np: 'गुल्मी जिल्लाका १२ स्थानीय तहहरूको वैज्ञानिक निर्णय समर्थन प्रणाली।',
  },
  confidence: 'CALCULATED',
  inputs: ['DHM Nepal Gauge Feeds', 'NARC Agronomic Registries', 'NASA POWER 39-Yr Climatology'],
  citation: 'DHM, MoALD, NARC, CBS, Survey Department, NASA POWER',
  provenancePath: 'data/real/municipal/palika_profiles.json',
  unit: 'Composite Nexus Index',
  currentStat: '12 Local Government Bodies (Gulmi District)',
};
