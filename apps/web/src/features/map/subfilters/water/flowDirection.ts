// [DATA PROVENANCE]
// Data Source: data/real/hydrology/flow_direction.tif
// Classification: OBSERVED REAL
// Citations: Lehner, B., Verdin, K. and Jarvis, A. (2008). New global hydrography derived from spaceborne elevation data. Eos, Transactions, AGU, 89(10): 93–94; HydroSHEDS Technical Documentation v1.4.

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const flowDirectionMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'HydroSHEDS D8 Flow Direction Raster',
    np: 'हाइड्रोसेड्स D8 बहाव दिशा रास्टर',
  },
  pillarName: {
    en: 'Water',
    np: 'जल',
  },
  model: {
    en: 'HydroSHEDS ESRI D8 Drainage Direction',
    np: 'हाइड्रोसेड्स ESRI D8 निकास दिशा',
  },
  formula: '\\text{D8 Direction} = \\arg\\max_{i \\in \\{1 \\dots 8\\}} \\left( \\frac{\\Delta z_i}{d_i} \\right)',
  parameter: {
    en: 'Steepest downslope direction among eight neighboring cells',
    np: 'आठ छिमेकी ग्रिड कोषमध्ये सबैभन्दा तीव्र तलतर्फको बहाव दिशा',
  },
  variables: [
    {
      symbol: '1',
      definition: {
        en: 'East',
        np: 'पूर्व',
      },
    },
    {
      symbol: '2',
      definition: {
        en: 'Southeast',
        np: 'दक्षिण-पूर्व',
      },
    },
    {
      symbol: '4',
      definition: {
        en: 'South',
        np: 'दक्षिण',
      },
    },
    {
      symbol: '8',
      definition: {
        en: 'Southwest',
        np: 'दक्षिण-पश्चिम',
      },
    },
    {
      symbol: '16',
      definition: {
        en: 'West',
        np: 'पश्चिम',
      },
    },
    {
      symbol: '32',
      definition: {
        en: 'Northwest',
        np: 'उत्तर-पश्चिम',
      },
    },
    {
      symbol: '64',
      definition: {
        en: 'North',
        np: 'उत्तर',
      },
    },
    {
      symbol: '128',
      definition: {
        en: 'Northeast',
        np: 'उत्तर-पूर्व',
      },
    },
    {
      symbol: '0',
      definition: {
        en: 'Ocean outlet or inland sink cell in HydroSHEDS v1.1',
        np: 'हाइड्रोसेड्स v1.1 मा नदी निकास वा sink कोष',
      },
    },
  ],
  description: {
    en: 'HydroSHEDS drainage-direction raster assigns each cell an ESRI D8 flow-direction code corresponding to its steepest downslope neighbor. In HydroSHEDS v1.1, final ocean outlet cells and inland sink cells are assigned a value of 0; the complementary mask grid distinguishes ocean and inland sinks.',
    np: 'हाइड्रोसेड्स निकास-दिशा रास्टरले प्रत्येक ग्रिड कोषलाई सबैभन्दा तीव्र तलतर्फको छिमेकी दिशाअनुसार ESRI D8 कोड प्रदान गर्छ। यही दिशा सूचना बहाव संकलन तथा निकास सञ्जाल निर्माणका लागि प्रयोग हुन्छ।',
  },
  confidence: 'OBSERVED REAL',
  inputs: ['HydroSHEDS Hydrologically Conditioned Elevation', 'ESRI D8 Single Flow Direction Convention'],
  citation:
    'Lehner, B., Verdin, K. and Jarvis, A. (2008). New global hydrography derived from spaceborne elevation data. Eos, Transactions, AGU, 89(10): 93–94; HydroSHEDS Technical Documentation v1.4.',
  provenancePath: 'data/real/hydrology/flow_direction.tif',
  unit: 'ESRI D8 direction code',
  currentStat: '3 Arc-Second D8 Drainage Direction Raster clipped to the selected Gulmi study area',
};
