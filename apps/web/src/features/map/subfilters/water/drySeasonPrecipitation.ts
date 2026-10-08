// [DATA PROVENANCE]
// Data Source: data/real/hydrology/average_dry_season_precipitation.tif
// Classification: OBSERVED REAL
// Citations: Funk, C. et al. (2015). Scientific Data, 2:150066.

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const drySeasonPrecipitationMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Dry Season Precipitation (CHIRPS)',
    np: 'सुक्खा यामको वर्षा (CHIRPS)',
  },
  pillarName: {
    en: 'Water',
    np: 'जल',
  },
  model: {
    en: 'CHIRPS v2.0 Non-Monsoon Cumulative (Oct–May)',
    np: 'CHIRPS v2.0 गैर-मनसुनी सुक्खा यामको कुल वर्षा (कार्तिक–जेठ)',
  },
  formula: 'P_{\\text{dry}} = P_{\\text{annual}} - P_{\\text{monsoon}}',
  parameter: {
    en: 'Non-monsoon dry season cumulative rainfall (mm)',
    np: 'मनसुन बाहेकको सुक्खा यामको कुल वर्षा (मिमी)',
  },
  variables: [
    {
      symbol: 'P_{\\text{dry}}',
      definition: {
        en: 'Total precipitation received during the eight non-monsoon dry season months (October through May)',
        np: 'मनसुन बाहेकका आठ महिना (कार्तिकदेखि जेठसम्म) मा प्राप्त हुने कुल वर्षा',
      },
    },
  ],
  description: {
    en: 'Dry season rainfall defines the critical water deficit period in Gulmi, impacting springshed discharge, winter crops, and drinking water availability.',
    np: 'सुक्खा यामको वर्षाले गुल्मीमा पानीको अभाव, हिउँदे बाली र खानेपानी मुहानको उपलब्धता निर्धारण गर्दछ।',
  },
  confidence: 'OBSERVED REAL',
  inputs: ['CHIRPS v2.0 Dry Season Gridded Rasters'],
  citation: 'Funk, C. et al. (2015). Scientific Data, 2:150066.',
  provenancePath: 'data/real/hydrology/average_dry_season_precipitation.tif',
  unit: 'mm/dry season',
  currentStat: 'Mean: 135 mm (Range: 114–181 mm across Gulmi)',
};
