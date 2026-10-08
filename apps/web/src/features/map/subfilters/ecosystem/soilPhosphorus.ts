// [DATA PROVENANCE]
// Data Source: data/real/land_and_soil/gulmi_soil_data.nc
// Classification: OBSERVED REAL
// Citations: National Soil Science Research Centre (NSSRC), NARC Nepal

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const soilPhosphorusMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Soil Available Phosphorus (P₂O₅)',
    np: 'माटोमा उपलब्ध फस्फोरस (P₂O₅)',
  },
  pillarName: {
    en: 'Ecosystem',
    np: 'पारिस्थितिकी',
  },
  model: {
    en: 'NARC Modified Olsen Sodium Bicarbonate Extraction Surface',
    np: 'नार्क परिमार्जित ओल्सेन विधिबाट फस्फोरस विश्लेषण',
  },
  formula:
    '\\bar{\\mathrm{P}}_{2}\\mathrm{O}_{5, p} = \\frac{1}{M_p} \\sum_{j=1}^{M_p} \\mathrm{P}_j \\quad (\\text{kg/ha P}_2\\text{O}_5)',
  parameter: {
    en: 'NARC Available Phosphorus Rating: Low (<30 kg/ha), Medium (30–55 kg/ha), High (>55 kg/ha)',
    np: 'नार्क मापदण्ड: न्यून (<३० केजी/हेक्टर), मध्यम (३०–५५), उच्च (>५५)',
  },
  variables: [
    {
      symbol: '\\bar{\\mathrm{P}}_{2}\\mathrm{O}_{5, p}',
      definition: {
        en: 'Palika mean available phosphorus pentoxide content (kg/ha)',
        np: 'पालिकाको औसत उपलब्ध फस्फोरस (केजी/हेक्टर)',
      },
    },
    {
      symbol: '\\mathrm{P}_j',
      definition: {
        en: 'Available phosphorus recorded at 100m raster cell j (kg/ha)',
        np: 'ग्रिड कोष j मा मापन गरिएको उपलब्ध फस्फोरस',
      },
    },
  ],
  description: {
    en: 'Available phosphorus pentoxide (P₂O₅) distribution across agricultural soils from NARC 100m geospatial grid.',
    np: 'नार्क १०० मिटर ग्रिड तथ्याङ्क अनुसार गुल्मीका कृषियोग्य जमिनमा उपलब्ध फस्फोरस (P₂O₅) को वितरण।',
  },
  confidence: 'OBSERVED REAL',
  inputs: ['NARC NSSRC 100m Soil Geospatial Database', 'Laboratory Olsen P Analysis'],
  citation: 'National Soil Science Research Centre (NSSRC), NARC Nepal',
  provenancePath: 'data/real/land_and_soil/gulmi_soil_data.nc',
  unit: 'kg/ha P₂O₅',
  currentStat: 'High (>55 kg/ha) across Gulmi terraced agricultural soils',
};
