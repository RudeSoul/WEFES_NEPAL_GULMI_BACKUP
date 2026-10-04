// [DATA PROVENANCE]
// Data Source: data/real/infrastructure/gulmi_nea_substations.geojson
// Classification: OBSERVED REAL
// Citations: Nepal Electricity Authority (NEA) & Ministry of Energy, Water Resources and Irrigation (https://nea.org.np)

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const gridReachMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'NEA Substation Grid Architecture',
    np: 'विद्युत प्राधिकरण सबस्टेसन र फिडर सञ्जाल',
  },
  pillarName: {
    en: 'Energy',
    np: 'ऊर्जा',
  },
  model: {
    en: 'NEA Sub-Transmission Hub & Radial Feeder Distribution Framework',
    np: 'नेपाल विद्युत प्राधिकरण सब-प्रसारण हब र फिडर वितरण प्रणाली',
  },
  formula:
    '\\mathcal{G}_{\\text{grid}} = (\\mathcal{V}_{\\text{substations}}, \\, \\mathcal{E}_{\\text{feeders}}), \\quad V \\in \\{132, 33, 11\\} \\, \\text{kV}',
  parameter: {
    en: '2 Bulk 132 kV Hubs (76 MVA) + 3 Distribution 33 kV Hubs (21 MVA)',
    np: '२ मुख्य १३२ केभी सबस्टेसन (७६ MVA) + ३ वितरण ३३ केभी सबस्टेसन (२१ MVA)',
  },
  variables: [
    {
      symbol: '\\text{Tamghas Hub}',
      definition: {
        en: 'Unaichaur 132/33/11 kV Substation (46 MVA capacity) — District central transmission anchor',
        np: 'उनाइचौर तम्घास १३२/३३/११ केभी सबस्टेसन (४६ MVA क्षमता) — जिल्लाको मुख्य प्रसारण केन्द्र',
      },
    },
    {
      symbol: '\\text{Paudi Amarai Hub}',
      definition: {
        en: 'Paudi Amarai 132/33/11 kV Substation (30 MVA capacity) — Northern corridor & Burtibang interconnect',
        np: 'पौदी अमराई १३२/३३/११ केभी सबस्टेसन (३० MVA क्षमता) — उत्तरी क्षेत्र र बुर्तिबाङ लाइन',
      },
    },
    {
      symbol: '\\text{Distribution Hubs}',
      definition: {
        en: '33/11 kV substations at Kisantari (3 MVA), Birbas (8 MVA), and Ridi (10 MVA with 7.4 MW local hydro)',
        np: '३३/११ केभी वितरण सबस्टेसनहरू: किसनतरी (३ MVA), बीरबास (८ MVA), र रिडी (१० MVA)',
      },
    },
    {
      symbol: '\\text{Feeder Servicing}',
      definition: {
        en: 'Radial 33 kV and 11 kV line routes linking each Palika to its nearest primary substation',
        np: 'प्रत्येक पालिकालाई नजिकको सबस्टेसनसँग जोड्ने ३३ केभी र ११ केभी फिडर लाइनहरू',
      },
    },
  ],
  description: {
    en: 'Empirical electrical network topology mapping all 12 Palikas to their servicing Nepal Electricity Authority (NEA) substations: Tamghas (Unaichaur 132/33/11 kV, 46 MVA), Paudi Amarai (132/33/11 kV, 30 MVA), Kisantari (33/11 kV, 3 MVA), Birbas (33/11 kV, 8 MVA), and Ridi (33/11 kV, 10 MVA with 7.4 MW local hydro integration).',
    np: 'गुल्मी जिल्लाका १२ वटै पालिकालाई नेपाल विद्युत प्राधिकरण (NEA) का ५ वटा आधिकारिक सबस्टेसन (उनाइचौर तम्घास १३२ केभी, पौदी अमराई १३२ केभी, किसनतरी ३३ केभी, बीरबास ३३ केभी, र रिडी ३३ केभी) सँग जोडेर भोल्टेज स्थिरता र वितरण पहुँचको वैज्ञानिक विश्लेषण।',
  },
  confidence: 'OBSERVED REAL',
  inputs: [
    'NEA Transmission Directorate Infrastructure Reports (2024-2026)',
    'Burtibang-Paudi Amarai-Tamghas-Sandhikharka 132 kV Transmission Project',
    'Gulmi Distribution Center 33/11 kV Feeder Network & Substation Registries',
    'PPMO Public Tender Records #84576628 & #NEA-GDC-2082/083-SQ06',
  ],
  citation:
    'Nepal Electricity Authority (NEA) & Ministry of Energy, Water Resources and Irrigation (https://nea.org.np)',
  provenancePath: 'data/real/infrastructure/gulmi_nea_substations.geojson',
  unit: 'Substation Voltage (kV) / MVA Capacity',
  currentStat: '5 Active Substations (132 kV Hubs: Tamghas & Paudi Amarai; 33 kV Hubs: Kisantari, Birbas, Ridi)',
};
