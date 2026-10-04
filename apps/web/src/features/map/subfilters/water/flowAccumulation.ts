// [DATA PROVENANCE]
// Data Source: data/real/hydrology/flow_accumulation.tif
// Classification: OBSERVED REAL
// Citations: Lehner, B., Verdin, K. and Jarvis, A. (2008). New global hydrography derived from spaceborne elevation data. Eos, Transactions, AGU, 89(10): 93–94; HydroSHEDS Technical Documentation v1.4.

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const flowAccumulationMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'HydroSHEDS Flow Accumulation Grid',
    np: 'हाइड्रोसेड्स बहाव संकलन ग्रिड',
  },
  pillarName: {
    en: 'Water',
    np: 'जल',
  },
  model: {
    en: 'HydroSHEDS 3 Arc-Second Flow Accumulation Raster',
    np: 'हाइड्रोसेड्स ३ आर्क-सेकेन्ड बहाव संकलन रास्टर',
  },
  formula: '\\mathrm{ACC}(x, y) = 1 + \\sum_{i \\in \\text{Inflow}(x, y)} \\mathrm{ACC}(x_i, y_i)',
  parameter: {
    en: 'Number of accumulated upstream contributing cells',
    np: 'सम्बन्धित बिन्दुमा योगदान गर्ने माथिल्लो बहावका ग्रिड कोषहरूको संख्या',
  },
  variables: [
    {
      symbol: '\\mathrm{ACC}',
      definition: {
        en: 'Number of accumulated upstream grid cells draining into each cell, including the cell itself; the count starts at 1 at river sources',
        np: 'प्रत्येक ग्रिड कोषमा निकास हुने माथिल्लो बहावका ग्रिड कोषहरूको संख्या; हाइड्रोसेड्समा नदीको मुहानमा गणना १ बाट सुरु हुन्छ',
      },
    },
    {
      symbol: '\\mathrm{ACA}',
      definition: {
        en: 'Accumulated upstream contributing area in square kilometers; available in HydroSHEDS at multiple spatial resolutions',
        np: 'माथिल्लो योगदान क्षेत्रफल वर्ग किलोमिटरमा; हाइड्रोसेड्समा विभिन्न स्थानिक रिजोल्युसनहरूमा उपलब्ध',
      },
    },
  ],
  description: {
    en: 'HydroSHEDS flow accumulation represents the upstream drainage contribution to each raster cell based on the HydroSHEDS drainage-direction network. ACC expresses this contribution as the number of accumulated upstream cells.',
    np: 'हाइड्रोसेड्स बहाव संकलनले निकास-दिशा सञ्जालका आधारमा प्रत्येक रास्टर कोषमा जम्मा हुने माथिल्लो जलनिकास योगदान देखाउँछ। उच्च संकलन मानले ठूलो माथिल्लो जलाधारबाट निकास प्राप्त गर्ने स्थान जनाउँछ।',
  },
  confidence: 'OBSERVED REAL',
  inputs: ['HydroSHEDS Flow Direction (DIR)'],
  citation:
    'Lehner, B., Verdin, K. and Jarvis, A. (2008). New global hydrography derived from spaceborne elevation data. Eos, Transactions, AGU, 89(10): 93–94; HydroSHEDS Technical Documentation v1.4.',
  provenancePath: 'data/real/hydrology/flow_accumulation.tif',
  unit: 'Accumulated cells (ACC)',
  currentStat: '3 Arc-Second Flow Accumulation Raster clipped to the selected Gulmi study area',
};
