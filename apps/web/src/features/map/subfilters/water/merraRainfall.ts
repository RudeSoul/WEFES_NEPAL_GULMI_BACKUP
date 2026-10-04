// [DATA PROVENANCE]
// Data Source: data/real/climate/nasa_power_10_years_full.csv
// Classification: CALCULATED
// Citations: Putkonen, J. (2004). Continuous snow and rain data at 500 to 4400 m altitude in the Nepal Himalayas; DHM Nepal Climate Records.

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const merraRainfallMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Precipitation Model',
    np: 'वर्षा वितरण मोडल',
  },
  pillarName: {
    en: 'Water',
    np: 'जल',
  },
  model: {
    en: 'Topographic Orographic Enhancement & Hydro-Climatic Downscaling',
    np: 'टोपोग्राफिक वर्षा अभिवृद्धि तथा हाइड्रो-जलवायु डाउनस्केलिङ',
  },
  formula: 'P(z) = P_{\\text{base}} \\cdot \\left[1 + \\beta \\cdot (z - z_{\\text{base}})\\right]',
  parameter: {
    en: 'Orographic Coefficient: β = +0.03% to +0.08% / 100m elevation gain (up to 2,200m crest)',
    np: 'टोपोग्राफिक वर्षा अभिवृद्धि गुणक: β = +०.०३% देखि +०.०८% प्रति १०० मिटर',
  },
  variables: [
    {
      symbol: 'P(z)',
      definition: {
        en: 'Downscaled monthly precipitation at elevation z (mm/month)',
        np: 'उचाइ z मा डाउनस्केल गरिएको मासिक वर्षा (मिमी/महिना)',
      },
    },
    {
      symbol: 'P_{\\text{base}}',
      definition: {
        en: 'Baseline monthly precipitation at reference station (Tamghas #725, 1,450m)',
        np: 'आधार केन्द्रको मासिक वर्षा (तम्घास #७२५, १,४५० मिटर)',
      },
    },
    {
      symbol: 'z',
      definition: {
        en: 'Target terrain surface elevation from 30m SRTM DEM (m)',
        np: '३० मिटर SRTM DEM बाट प्राप्त भू-सतहको उचाइ (मिटर)',
      },
    },
    {
      symbol: 'z_{\\text{base}}',
      definition: {
        en: 'Reference station elevation (Tamghas: 1,450m)',
        np: 'आधार जलमापन केन्द्रको उचाइ (तम्घास: १,४५० मिटर)',
      },
    },
    {
      symbol: '\\beta',
      definition: {
        en: 'Dimensionless orographic precipitation gradient coefficient (m⁻¹)',
        np: 'टोपोग्राफिक उचाइगत वर्षा अभिवृद्धि दर गुणक (m⁻¹)',
      },
    },
  ],
  description: {
    en: "Downscales monthly climatology across Gulmi's 450m–2,690m elevation span by applying orographic enhancement factors (0.82 in deep valleys to 1.24 along high mountain ridges) benchmarked against DHM station network.",
    np: 'गुल्मीको ४५० देखि २,६९० मिटर उचाइ अनुसार खोला उपत्यका (०.८२) देखि उच्च लेकाली डाँडा (१.२४) सम्मको टोपोग्राफिक वर्षा अभिवृद्धि दर प्रयोग गरी डाउनस्केल गरिएको छ।',
  },
  confidence: 'CALCULATED',
  inputs: [
    'NASA MERRA-2 Monthly Climatology / CHIRPS v2.0',
    'SRTM 30m Digital Elevation Model',
    'DHM Tamghas Gauge #725 Baseline',
  ],
  citation:
    'Putkonen, J. (2004). Continuous snow and rain data at 500 to 4400 m altitude in the Nepal Himalayas; DHM Nepal Climate Records.',
  provenancePath: 'data/real/climate/nasa_power_10_years_full.csv',
  unit: 'mm/month',
  currentStat: '{month}: Area Mean {rainMm} mm ({rainMin}–{rainMax} mm across Palikas)',
};
