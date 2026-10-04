// [DATA PROVENANCE]
// Data Source: data/real/hydrology/average_monsoon_precipitation.tif
// Classification: OBSERVED REAL
// Citations: Funk, C. et al. (2015). Scientific Data, 2:150066.

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const monsoonPrecipitationMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Monsoon Precipitation (CHIRPS)',
    np: 'मनसुन यामको वर्षा (CHIRPS)',
  },
  pillarName: {
    en: 'Water',
    np: 'जल',
  },
  model: {
    en: 'CHIRPS v2.0 Monsoon Season Cumulative (JJAS)',
    np: 'CHIRPS v2.0 मनसुन यामको कुल वर्षा (असार–असोज)',
  },
  formula: 'P_{\\text{monsoon}} = P_{\\text{Jun}} + P_{\\text{Jul}} + P_{\\text{Aug}} + P_{\\text{Sep}}',
  parameter: {
    en: 'Summer monsoon cumulative rainfall (mm)',
    np: 'ग्रीष्मकालीन मनसुन यामको कुल वर्षा (मिमी)',
  },
  variables: [
    {
      symbol: 'P_{\\text{monsoon}}',
      definition: {
        en: 'Total precipitation received during the four monsoon months (June through September)',
        np: 'मनसुनका चार महिना (असारदेखि असोजसम्म) मा प्राप्त हुने कुल वर्षा',
      },
    },
  ],
  description: {
    en: 'Monsoon rainfall accounts for 75–80% of total annual water influx in Gulmi District, driving river discharge, terraced rice irrigation, and landslide/flood risks.',
    np: 'गुल्मी जिल्लामा वार्षिक वर्षाको ७५-८०% पानी मनसुन याममा पर्दछ, जसले नदीको बहाव, धान खेती र बाढी-पहिरोको जोखिम निर्धारण गर्दछ।',
  },
  confidence: 'OBSERVED REAL',
  inputs: ['CHIRPS v2.0 Monsoon Gridded Rasters'],
  citation: 'Funk, C. et al. (2015). Scientific Data, 2:150066.',
  provenancePath: 'data/real/hydrology/average_monsoon_precipitation.tif',
  unit: 'mm/monsoon',
  currentStat: 'Mean: 1,262 mm (Range: 1,012–1,578 mm across Gulmi)',
};
