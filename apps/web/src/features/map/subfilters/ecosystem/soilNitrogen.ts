// [DATA PROVENANCE]
// Data Source: data/real/land_and_soil/gulmi_soil_data.nc
// Classification: OBSERVED REAL
// Citations: National Soil Science Research Centre (NSSRC), NARC Nepal

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const soilNitrogenMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Soil Available Nitrogen',
    np: 'माटोमा उपलब्ध नाइट्रोजन',
  },
  pillarName: {
    en: 'Ecosystem',
    np: 'पारिस्थितिकी',
  },
  model: {
    en: 'NARC NSSRC 100m Geospatial Grid & Laboratory Kjeldahl Analysis',
    np: 'नार्क राष्ट्रिय माटो विज्ञान अनुसन्धान केन्द्र १०० मिटर ग्रिड तथ्याङ्क',
  },
  formula: '\\bar{\\mathrm{N}}_p = \\frac{1}{M_p} \\sum_{j=1}^{M_p} \\mathrm{N}_j \\quad (\\% \\text{ Total Nitrogen})',
  parameter: {
    en: 'NARC Critical Thresholds: Low (<0.10%), Medium (0.10–0.20%), High (>0.20%)',
    np: 'नार्क मापदण्ड: न्यून (<०.१०%), मध्यम (०.१०–०.२०%), उच्च (>०.२०%)',
  },
  variables: [
    {
      symbol: '\\bar{\\mathrm{N}}_p',
      definition: {
        en: 'Municipal mean soil nitrogen content (%) across sampled grid cells',
        np: 'पालिका भित्रका ग्रिड कोषहरूको औसत माटो नाइट्रोजन प्रतिशत',
      },
    },
    {
      symbol: 'M_p',
      definition: {
        en: 'Number of NARC 100m raster grid cells within Palika boundary (3,000+ cells/palika)',
        np: 'पालिका भित्र पर्ने नार्क १०० मिटर ग्रिड कोष संख्या',
      },
    },
    {
      symbol: '\\mathrm{N}_j',
      definition: {
        en: 'Available total nitrogen measured at raster cell j (%)',
        np: 'ग्रिड कोष j मा मापन गरिएको कुल नाइट्रोजन (%)',
      },
    },
  ],
  description: {
    en: 'Empirical soil total nitrogen surface derived from NARC National Soil Science Research Centre 100m grid (37,800+ cells across Gulmi).',
    np: 'नार्क राष्ट्रिय माटो विज्ञान अनुसन्धान केन्द्रको १०० मिटर ग्रिड तथ्याङ्कबाट प्राप्त गुल्मी जिल्लाको माटो नाइट्रोजन नक्सांकन।',
  },
  confidence: 'OBSERVED REAL',
  inputs: ['NARC NSSRC 100m Soil Geospatial Database (gulmi_soil_data.nc)', 'Survey Department Palika Boundaries'],
  citation: 'National Soil Science Research Centre (NSSRC), NARC Nepal',
  provenancePath: 'data/real/land_and_soil/gulmi_soil_data.nc',
  unit: '% Nitrogen',
  currentStat: 'Medium (0.10–0.20%) across Gulmi Palikas',
};
