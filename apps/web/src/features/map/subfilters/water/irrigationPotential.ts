// [DATA PROVENANCE]
// Data Source: data/calculated/hydro_reaches/hydro_potential_reaches.geojson
// Classification: CALCULATED
// Citations: Ministry of Agriculture and Livestock Development (MoALD)

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const irrigationPotentialMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Irrigation Command Scoring',
    np: 'सिँचाइ कमान्ड क्षमता',
  },
  pillarName: {
    en: 'Water',
    np: 'जल',
  },
  model: {
    en: 'Riverbed Gravity Kulo vs Solar Lift Command Feasibility',
    np: 'कुलो गुरुत्वाकर्षण र सौर्य लिफ्ट विश्लेषण',
  },
  formula: '\\text{Command (\\%)} = \\max\\left(15, \\min\\left(95, 100 - \\frac{\\Delta z}{20}\\right)\\right)',
  parameter: {
    en: 'Δz = (Elevation - 450m riverbed)',
    np: 'Δz = नदी सतहबाट उचाइ गिरावट (Head, m)',
  },
  variables: [
    {
      symbol: '\\text{Command}',
      definition: {
        en: 'Gravity canal feasibility score (0–100%)',
        np: 'परम्परागत कुलो तथा सिँचाइ सम्भाव्यता प्राप्ताङ्क',
      },
    },
    {
      symbol: '\\Delta z',
      definition: {
        en: 'Elevation head difference above perennial riverbed (m)',
        np: 'सदाबहार नदीको सतहभन्दा खेतको उचाइ गिरावट (मिटर)',
      },
    },
    {
      symbol: 'C_{\\min} = 15\\%, \\, C_{\\max} = 95\\%',
      definition: {
        en: 'Lower limit (lift boundary) and upper limit (riparian command)',
        np: 'न्यूनतम (लिफ्ट सीमा) र अधिकतम (नहर कमान्ड) सीमा',
      },
    },
  ],
  description: {
    en: 'Evaluates elevation head relative to perennial river beds to determine gravity canal vs solar lift irrigation feasibility.',
    np: 'नदी सतहबाट उचाइको आधारमा परम्परागत कुलो सिँचाइ र सौर्य ऊर्जा लिफ्ट प्रविधिको सम्भाव्यता वर्गीकरण।',
  },
  confidence: 'CALCULATED',
  inputs: ['MoALD Irrigation Master Plan', 'Hydrographic Reach Elevation Profiling'],
  citation: 'Ministry of Agriculture and Livestock Development (MoALD)',
  provenancePath: 'data/calculated/hydro_reaches/hydro_potential_reaches.geojson',
  unit: 'Command Score %',
  currentStat: 'Prime Riverbed Gravity (≥80%) to Rainfed Ridges (<40%)',
};
