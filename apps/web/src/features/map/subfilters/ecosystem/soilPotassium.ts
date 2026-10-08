// [DATA PROVENANCE]
// Data Source: data/real/land_and_soil/gulmi_soil_data.nc
// Classification: OBSERVED REAL
// Citations: National Soil Science Research Centre (NSSRC), NARC Nepal

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const soilPotassiumMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Soil Available Potassium (K₂O)',
    np: 'माटोमा उपलब्ध पोटास (K₂O)',
  },
  pillarName: {
    en: 'Ecosystem',
    np: 'पारिस्थितिकी',
  },
  model: {
    en: 'NARC Neutral Normal Ammonium Acetate Extraction Grid',
    np: 'नार्क एमोनियम एसिटेट विधिबाट पोटास विश्लेषण',
  },
  formula:
    '\\bar{\\mathrm{K}}_{2}\\mathrm{O}_p = \\frac{1}{M_p} \\sum_{j=1}^{M_p} \\mathrm{K}_j \\quad (\\text{kg/ha K}_2\\text{O})',
  parameter: {
    en: 'NARC Available Potassium Rating: Low (<110 kg/ha), Medium (110–280 kg/ha), High (>280 kg/ha)',
    np: 'नार्क मापदण्ड: न्यून (<११० केजी/हेक्टर), मध्यम (११०–२८०), उच्च (>२८०)',
  },
  variables: [
    {
      symbol: '\\bar{\\mathrm{K}}_{2}\\mathrm{O}_p',
      definition: {
        en: 'Palika mean available potash content (kg/ha)',
        np: 'पालिकाको औसत उपलब्ध पोटास (केजी/हेक्टर)',
      },
    },
    {
      symbol: '\\mathrm{K}_j',
      definition: {
        en: 'Available potassium recorded at 100m raster cell j (kg/ha)',
        np: 'ग्रिड कोष j मा मापन गरिएको उपलब्ध पोटास',
      },
    },
  ],
  description: {
    en: 'Available potassium oxide (K₂O) distribution supporting plant vigor and drought tolerance from NARC 100m grid.',
    np: 'नार्क १०० मिटर ग्रिड तथ्याङ्क अनुसार बिरुवाको रोग प्रतिरोधी क्षमता बढाउने माटोमा उपलब्ध पोटासको वितरण।',
  },
  confidence: 'OBSERVED REAL',
  inputs: ['NARC NSSRC 100m Soil Geospatial Database', 'Flame Photometric Potassium Extraction'],
  citation: 'National Soil Science Research Centre (NSSRC), NARC Nepal',
  provenancePath: 'data/real/land_and_soil/gulmi_soil_data.nc',
  unit: 'kg/ha K₂O',
  currentStat: 'Medium to High (>200 kg/ha) in mid-hill terraces',
};
