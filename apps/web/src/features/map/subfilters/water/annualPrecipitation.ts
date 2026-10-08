// [DATA PROVENANCE]
// Data Source: data/real/hydrology/average_annual_precipitation.tif
// Classification: OBSERVED REAL
// Citations: Funk, C. et al. (2015). The climate hazards group infrared precipitation with stations - a new environmental record for monitoring extremes. Scientific Data, 2:150066.

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const annualPrecipitationMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Observed Annual Precipitation (CHIRPS)',
    np: 'वार्षिक वर्षा तथ्याङ्क (CHIRPS)',
  },
  pillarName: {
    en: 'Water',
    np: 'जल',
  },
  model: {
    en: 'CHIRPS v2.0 0.05° Gridded Rainfall Reanalysis',
    np: 'CHIRPS v2.0 ०.०५° ग्रिड वर्षा पुनःविश्लेषण',
  },
  formula: 'P_{\\text{annual}} = \\sum_{m=1}^{12} P_{m}',
  parameter: {
    en: 'Long-term mean annual precipitation (mm/year)',
    np: 'दीर्घकालीन औसत वार्षिक वर्षा (मिमी/वर्ष)',
  },
  variables: [
    {
      symbol: 'P_{\\text{annual}}',
      definition: {
        en: 'Mean cumulative annual precipitation across Gulmi terrain derived from CHIRPS v2.0 (mm/year)',
        np: 'CHIRPS v2.0 बाट प्राप्त गुल्मी जिल्लाको भू-भागमा औसत कुल वार्षिक वर्षा (मिमी/वर्ष)',
      },
    },
    {
      symbol: 'P_{m}',
      definition: {
        en: 'Long-term monthly rainfall depths from high-resolution satellite infrared and rain-gauge blending (mm/month)',
        np: 'उपग्रह इन्फ्रारेड र वर्षा मापन केन्द्रहरूको संयोजनबाट प्राप्त मासिक वर्षा (मिमी/महिना)',
      },
    },
  ],
  description: {
    en: "High-resolution (0.05° / ~5 km) gridded satellite precipitation dataset incorporating station data to monitor spatial variations in rainfall across Gulmi's mid-hills and river valleys.",
    np: 'गुल्मीका पहाडी र उपत्यका क्षेत्रहरूमा वर्षाको स्थानिक भिन्नता मापन गर्न उपग्रह र वर्षा मापन केन्द्रको तथ्याङ्क संयोजन गरिएको ०.०५° रिजोल्युसनको ग्रिड डाटा।',
  },
  confidence: 'OBSERVED REAL',
  inputs: ['CHIRPS v2.0 Monthly Global Precipitation'],
  citation:
    'Funk, C. et al. (2015). The climate hazards group infrared precipitation with stations - a new environmental record for monitoring extremes. Scientific Data, 2:150066.',
  provenancePath: 'data/real/hydrology/average_annual_precipitation.tif',
  unit: 'mm/year',
  currentStat: 'Mean: 1,585 mm/yr (Range: 1,272–2,026 mm/yr across Gulmi)',
};
