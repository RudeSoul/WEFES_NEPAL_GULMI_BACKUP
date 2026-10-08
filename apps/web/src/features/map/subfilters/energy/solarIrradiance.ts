// [DATA PROVENANCE]
// Data Source: data/real/climate/gulmi_solar_pvout_opta.geojson
// Classification: OBSERVED REAL
// Citations: Global Solar Atlas 2.0 (https://globalsolaratlas.info/download/nepal), ESMAP / World Bank / Solargis

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const solarIrradianceMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Solar PV Potential & Tilt',
    np: 'सौर्य फोटोभोल्टिक सम्भाव्यता र टिल्ट',
  },
  pillarName: {
    en: 'Energy',
    np: 'ऊर्जा',
  },
  model: {
    en: 'Global Solar Atlas High-Resolution PV Solar & Tilt Model (ESMAP / World Bank / Solargis)',
    np: 'ग्लोबल सोलार एटलस उच्च-विभेदन सौर्य तथा टिल्ट मोडल',
  },
  formula: '\\mathrm{PVOUT}_p = \\frac{1}{N_p} \\sum_{i=1}^{N_p} \\mathrm{PVOUT}_i \\quad [\\beta = \\mathrm{OPTA}_p]',
  parameter: {
    en: 'Photovoltaic Power Potential (PVOUT) & Optimum Module Tilt (OPTA)',
    np: 'फोटोभोल्टिक ऊर्जा सम्भाव्यता र उपयुक्त प्यानल ढल्काइ',
  },
  variables: [
    {
      symbol: '\\mathrm{PVOUT}_p',
      definition: {
        en: 'Municipal area-weighted mean Photovoltaic Power Potential (kWh/kWp/day)',
        np: 'पालिका भित्रका ग्रिड सेलहरूको औसत दैनिक सौर्य ऊर्जा उत्पादन सम्भाव्यता (kWh/kWp/दिन)',
      },
    },
    {
      symbol: '\\mathrm{PVOUT}_i',
      definition: {
        en: 'Solargis satellite-modeled long-term annual daily PV potential at cell i',
        np: 'Solargis स्याटेलाइट आधारित दीर्घकालीन दैनिक सौर्य ऊर्जा उत्पादन मान',
      },
    },
    {
      symbol: 'N_p',
      definition: {
        en: 'Discrete 30-arcsec spatial grid cells intersecting Palika p (Total Σ N_p = 1,462 in Gulmi)',
        np: 'पालिकाको सिमानाभित्र पर्ने ग्रिड सेल संख्या (गुल्मी जिल्लाभर कुल १,४६२ सेल)',
      },
    },
    {
      symbol: '\\mathrm{OPTA}_p',
      definition: {
        en: 'Optimum fixed module tilt angle (28°–30°) to maximize yearly generation',
        np: 'वार्षिक सौर्य उत्पादन अधिकतम बनाउन उपयुक्त प्यानल ढल्काइ कोण (२८°–३०°)',
      },
    },
  ],
  description: {
    en: 'Photovoltaic Power Potential (PVOUT in kWh/kWp/day) and Optimum Tilt (OPTA in degrees) derived from Global Solar Atlas 2.0 (World Bank/ESMAP/Solargis) clipped via QGIS across Gulmi District (1,462 discrete cells). Accounts for temperature derating, horizon shading, and solar lift irrigation / rooftop PV design across all 12 Palikas.',
    np: 'विश्व बैंक र Solargis द्वारा प्रकाशित ग्लोबल सोलार एटलसबाट QGIS मार्फत गुल्मी जिल्लाका १,४६२ ग्रिड सेलहरूमा निकालिएको यथार्थ सौर्य ऊर्जा सम्भाव्यता (PVOUT) र उपयुक्त टिल्ट कोण (OPTA)। यसले सौर्य लिफ्ट सिँचाइ र ग्रामीण विद्युतीकरण आयोजना निर्माणमा प्राविधिक आधार प्रदान गर्दछ।',
  },
  confidence: 'OBSERVED REAL',
  inputs: [
    'Global Solar Atlas Nepal GeoTIFF (Solargis / ESMAP / World Bank)',
    'QGIS Vectorized & Boundary Clipped Points (1,462 Features)',
    'Survey Department of Nepal Municipal Polygons',
  ],
  citation: 'Global Solar Atlas 2.0 (https://globalsolaratlas.info/download/nepal), ESMAP / World Bank / Solargis',
  provenancePath: 'data/real/climate/gulmi_solar_pvout_opta.geojson',
  unit: 'kWh/kWp/day',
  currentStat: '3.03 to 4.53 kWh/kWp/day • Tilt: 28°–30° (District Mean: 4.16 kWh/kWp/day)',
};
