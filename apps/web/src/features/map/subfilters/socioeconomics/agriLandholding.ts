// [DATA PROVENANCE]
// Data Source: data/real/agriculture/gulmi_agricultural_landholding.geojson
// Classification: OBSERVED REAL
// Citations: Ministry of Agriculture and Livestock Development (MoALD), NSO Nepal Census 2021, and OpenStreetMap Contributors

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const agriLandholdingMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Agricultural Landholding & Settlement',
    np: 'कृषियोग्य जमिन तथा बस्ती वितरण',
  },
  pillarName: {
    en: 'Socioeconomics',
    np: 'सामाजिक-आर्थिक',
  },
  model: {
    en: 'Harmonized Agricultural Land Resources & Household Holding Metric (MoALD / NSO Census 2021 / OSM)',
    np: 'कृषि जमिन तथा घरधुरी वितरण सूचकाङ्क',
  },
  formula:
    '\\bar{A}_{\\text{holding}} \\, (\\text{Ropani}) = \\left(\\frac{A_{\\text{agri, ha}}}{\\mathrm{HH}_{\\text{census}}}\\right) \\times 19.656',
  parameter: {
    en: 'Cultivated Land (ha), Khet/Bari Split, Census Households, OSM Buildings',
    np: 'कुल कृषियोग्य जमिन (हेक्टर), खेत/बारी अनुपात, घरधुरी संख्या, भवन संरचना',
  },
  variables: [
    {
      symbol: '\\bar{A}_{\\text{holding}}',
      definition: {
        en: 'Average agricultural landholding per enumerated household (Ropani/HH and ha/HH)',
        np: 'प्रति घरधुरी औसत कृषियोग्य जमिन (रोपनी र हेक्टर)',
      },
    },
    {
      symbol: 'A_{\\text{khet}}',
      definition: {
        en: 'Irrigated/lowland terraced crop field area suitable for paddy (ha)',
        np: 'धान खेतीका लागि उपयुक्त सिञ्चित खेत जमिन (हेक्टर)',
      },
    },
    {
      symbol: 'A_{\\text{bari}}',
      definition: {
        en: 'Rainfed/upland terrace field area suitable for maize, wheat, and cash crops (ha)',
        np: 'मकै, गहुँ, कोदो र नगदे बालीका लागि पाखो/बारी जमिन (हेक्टर)',
      },
    },
    {
      symbol: '\\mathrm{HH}_{\\text{census}}',
      definition: {
        en: 'Official enumerated household population from National Population and Housing Census 2021',
        np: 'राष्ट्रिय जनगणना २०७८ अनुसार पालिकाको कुल घरधुरी संख्या',
      },
    },
    {
      symbol: '\\text{Settlement Density}',
      definition: {
        en: 'Intra-palika settlement density heat wave generated from 78,934 physical building footprints',
        np: '७८,९३४ वास्तविक भवन संरचनाबाट निकालिएको पालिका भित्रको बस्ती घनत्व तरङ्ग',
      },
    },
  ],
  description: {
    en: 'Official municipal agricultural land resource distribution across all 12 Palikas of Gulmi District. Couples surveyed cultivated hectares (Khet vs Bari) with 2021 Census households and 78,934 OpenStreetMap building structures to show land per household and non-symmetric settlement concentration.',
    np: 'गुल्मी जिल्लाका १२ वटै पालिकाको वास्तविक कृषियोग्य जमिन (खेत र बारी), जनगणना २०७८ का घरधुरी र ७८,९३४ भवन संरचनाको आधारमा प्रति घरधुरी जग्गा र पालिकाभित्रको बस्ती घनत्वको वैज्ञानिक नक्सांकन।',
  },
  confidence: 'OBSERVED REAL',
  inputs: [
    'MoALD Land Resources Survey & Agriculture Profiles',
    'NSO Nepal Population & Housing Census 2021 (66,100 Households)',
    'OpenStreetMap Gulmi Building Geometries (78,934 Structures via QuickOSM)',
    'Survey Department of Nepal Local Boundary Polygons',
  ],
  citation:
    'Ministry of Agriculture and Livestock Development (MoALD), NSO Nepal Census 2021, and OpenStreetMap Contributors',
  provenancePath: 'data/real/agriculture/gulmi_agricultural_landholding.geojson',
  unit: 'Ropani / HH (ha / HH)',
  currentStat: 'District Avg: 5.45 Ropani/HH (18,493 ha Cultivated Land across 12 Palikas)',
};
