// [DATA PROVENANCE]
// Data Source: data/real/hydrology/catchments_l10.geojson
// Classification: OBSERVED REAL
// Citations: Lehner, B. and Grill, G. (2013). Global river hydrography and network routing: baseline data and new approaches to study the world’s large river systems. Hydrological Processes, 27(15): 2171–2186.

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const catchmentsMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'HydroBASINS Level 10 Sub-Basins',
    np: 'हाइड्रोबेसिन्स लेभल १० उप-जलाधारहरू',
  },
  pillarName: {
    en: 'Water',
    np: 'जल',
  },
  model: {
    en: 'HydroBASINS Level 10 Standard Sub-Basin Delineation',
    np: 'हाइड्रोबेसिन्स लेभल १० मानक उप-जलाधार सीमांकन',
  },
  formula: '\\text{Pfafstetter ID: } C_k = 10 \\cdot C_{k-1} + d \\quad (d \\in \\{1, 2, \\dots, 9\\})',
  parameter: {
    en: 'Sub-basin boundaries, upstream contributing area and river-network connectivity',
    np: 'स्थलाकृतिक उप-जलाधार सीमाना, माथिल्लो भागबाट योगदान हुने जलाधार क्षेत्रफल र नदी सञ्जालको सम्बन्ध',
  },
  variables: [
    {
      symbol: '\\text{SUB\\_AREA}',
      definition: {
        en: 'Area of the individual HydroBASINS sub-basin polygon (km²)',
        np: 'सम्बन्धित हाइड्रोबेसिन्स उप-जलाधार बहुभुजको क्षेत्रफल (वर्ग किमी)',
      },
    },
    {
      symbol: '\\text{UP\\_AREA}',
      definition: {
        en: 'Total upstream drainage area calculated from the headwaters to the polygon location, including the polygon itself; includes only the directly connected watershed area (km²)',
        np: 'सम्बन्धित उप-जलाधारसहित प्रत्यक्ष रूपमा जोडिएको माथिल्लो भागको कुल निकास क्षेत्रफल (वर्ग किमी)',
      },
    },
    {
      symbol: '\\text{ORDER}',
      definition: {
        en: 'Indicator of river order following the classical ordering system: order 1 represents the main-stem river from sink to source; order 2 represents tributaries flowing into an order-1 river; higher orders represent tributaries flowing into the corresponding lower-order river; order 0 represents conglomerates of small coastal watersheds',
        np: 'शास्त्रीय नदी-क्रम निर्धारण प्रणालीमा आधारित नदी क्रमको सूचक',
      },
    },
    {
      symbol: '\\text{PFAF\\_ID}',
      definition: {
        en: "Pfafstetter hierarchical code identifying the sub-basin's position within the nested drainage system; a Level 10 sub-basin has a 10-digit Pfafstetter code",
        np: 'पदानुक्रमिक रूपमा जोडिएको जल निकास प्रणालीमा उप-जलाधारको अद्वितीय स्थान पहिचान गर्ने १०-अङ्कको Pfafstetter पदानुक्रमिक कोड',
      },
    },
    {
      symbol: '\\text{DIST\\_SINK}',
      definition: {
        en: 'Distance from the sub-basin outlet to the next downstream sink along the river network, measured to the next downstream endorheic sink or, if none exists, to the most downstream sink at the ocean (km)',
        np: 'उप-जलाधारको निकास विन्दुदेखि अन्तिम महासागर वा अन्तिम विन्दु (सिङ्क) सम्मको नदी सञ्जाल पछ्याउने कुल जलप्रवाह दुरी (किमी)',
      },
    },
  ],
  description: {
    en: 'HydroBASINS provides globally consistent, hierarchically nested sub-basin polygons derived from HydroSHEDS. The standard product uses the Pfafstetter coding system to organize nested drainage basins and provides attributes supporting analysis of basin topology, upstream and downstream connectivity, and drainage structure.',
    np: 'हाइड्रोबेसिन्स लेभल १० ले हाइड्रोसेड्सबाट व्युत्पन्न विश्वव्यापी रूपमा एकरूप र पदानुक्रमिक रूपमा जोडिएका उप-जलाधार बहुभुजहरू प्रदान गर्छ। मानक उत्पादनले पदानुक्रमिक रूपमा जोडिएका जल निकास क्षेत्रहरूलाई व्यवस्थित गर्न तथा जलाधारको संरचना र माथिल्लो/तल्लो भागको सम्बन्ध विश्लेषण गर्न Pfafstetter कोडिङ प्रणाली प्रयोग गर्छ।',
  },
  confidence: 'OBSERVED REAL',
  inputs: ['HydroBASINS Level 10 Standard Sub-Basin Dataset'],
  citation:
    'Lehner, B. and Grill, G. (2013). Global river hydrography and network routing: baseline data and new approaches to study the world’s large river systems. Hydrological Processes, 27(15): 2171–2186.',
  provenancePath: 'data/real/hydrology/catchments_l10.geojson',
  unit: 'km²',
  currentStat: 'HydroBASINS Level 10 sub-basins covering the selected Gulmi study area',
};
