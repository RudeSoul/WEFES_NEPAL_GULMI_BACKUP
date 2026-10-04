// [DATA PROVENANCE]
// Data Source: data/real/hydrology/rivers_streams.geojson
// Classification: OBSERVED REAL
// Citations: Lehner, B. and Grill, G. (2013). Global river hydrography and network routing: baseline data and new approaches to study the world’s large river systems. Hydrological Processes, 27(15): 2171–2186; HydroRIVERS Technical Documentation v1.0 (2019).

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const riversStreamsMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'HydroRIVERS River Network',
    np: 'हाइड्रोरिभर्स नदी तथा खोला सञ्जाल',
  },
  pillarName: {
    en: 'Water',
    np: 'जल',
  },
  model: {
    en: 'HydroRIVERS Vector River Network with Long-Term Mean Discharge Estimate',
    np: 'दीर्घकालीन औसत डिस्चार्ज अनुमानसहितको हाइड्रोरिभर्स नदी सञ्जाल',
  },
  formula: '\\bar{Q}_{\\text{reach}} = f(A_{\\text{up}}, P_{\\text{eff}}) = \\sum_{k \\in \\mathcal{U}} q_k',
  parameter: {
    en: 'River-network topology, Strahler order, classical order, flow-based order, reach length, upstream area and estimated long-term average discharge',
    np: 'नदी सञ्जाल सम्बन्ध, स्ट्राल्हर क्रम, नदी खण्ड लम्बाइ, माथिल्लो जलाधार क्षेत्रफल र अनुमानित औसत डिस्चार्ज',
  },
  variables: [
    {
      symbol: '\\text{ORD\\_STRA}',
      definition: {
        en: 'Indicator of river order following the Strahler ordering system: order 1 represents headwater streams; when two streams of the same order meet, the resulting reach increases to the next order',
        np: 'स्ट्राल्हर नदी-क्रम सूचक: १ ले मुहानतर्फका खोला जनाउँछ र समान क्रमका खोला जोडिँदा क्रम बढ्छ',
      },
    },
    {
      symbol: '\\text{ORD\\_CLAS}',
      definition: {
        en: 'Indicator of river order following the classical ordering system: order 1 represents the main-stem river from sink to source; order 2 represents tributaries flowing into an order-1 river; higher orders represent tributaries flowing into the corresponding lower-order river',
        np: 'मुख्य नदी र त्यसका सहायक नदीहरूको पदानुक्रम जनाउने शास्त्रीय नदी-क्रम सूचक',
      },
    },
    {
      symbol: '\\text{ORD\\_FLOW}',
      definition: {
        en: 'Indicator of river order based on logarithmic classes of long-term average discharge, with orders 1–10 representing progressively smaller discharge ranges',
        np: 'दीर्घकालीन औसत डिस्चार्जमा आधारित नदी-क्रम वर्ग',
      },
    },
    {
      symbol: '\\text{DIS\\_AV\\_CMS}',
      definition: {
        en: 'Estimated long-term average discharge for the river reach (m³/s)',
        np: 'सम्बन्धित नदी खण्डको अनुमानित दीर्घकालीन औसत डिस्चार्ज (घन मिटर/सेकेन्ड)',
      },
    },
    {
      symbol: '\\text{LENGTH\\_KM}',
      definition: {
        en: 'Length of the river reach segment (km)',
        np: 'नदी खण्डको ज्यामितीय लम्बाइ (किमी)',
      },
    },
    {
      symbol: '\\text{CATCH\\_SKM}',
      definition: {
        en: 'Area of the catchment that contributes directly to the individual river reach, excluding the contributing areas of upstream reaches (km²)',
        np: 'सम्बन्धित नदी खण्डमा प्रत्यक्ष रूपमा निकास हुने स्थानीय जलाधार क्षेत्रफल (वर्ग किमी)',
      },
    },
    {
      symbol: '\\text{UPLAND\\_SKM}',
      definition: {
        en: 'Total upstream drainage area calculated from the headwaters to the pour point of the river reach; includes only the directly connected watershed area and excludes endorheic regions nested within the larger basin (km²)',
        np: 'सम्बन्धित नदी खण्डमा योगदान गर्ने कुल माथिल्लो जलाधार क्षेत्रफल (वर्ग किमी)',
      },
    },
  ],
  description: {
    en: 'HydroRIVERS is a globally consistent vector river network derived from HydroSHEDS at 15 arc-second resolution. Its river reaches contain network topology and attributes including reach length, upstream and downstream distances, river-order indicators, directly contributing catchment area, total upstream area and an estimated long-term average discharge.',
    np: 'हाइड्रोरिभर्स हाइड्रोसेड्स तथा पूरक सूचनाबाट तयार गरिएको विश्वव्यापी रूपमा एकरूप भेक्टर नदी सञ्जाल हो। नदी खण्डहरूमा सञ्जाल सम्बन्ध, स्ट्राल्हर क्रम, शास्त्रीय क्रम, बहाव-आधारित क्रम, लम्बाइ, माथिल्लो जलाधार क्षेत्रफल र अनुमानित दीर्घकालीन औसत डिस्चार्ज समावेश हुन्छ।',
  },
  confidence: 'OBSERVED REAL',
  inputs: ['HydroRIVERS Global Hydrographic Database'],
  citation:
    'Lehner, B. and Grill, G. (2013). Global river hydrography and network routing: baseline data and new approaches to study the world’s large river systems. Hydrological Processes, 27(15): 2171–2186; HydroRIVERS Technical Documentation v1.0 (2019).',
  provenancePath: 'data/real/hydrology/rivers_streams.geojson',
  unit: 'm³/s, km, km², river-order class',
  currentStat: 'HydroRIVERS river reaches intersecting the selected Gulmi study area',
};
