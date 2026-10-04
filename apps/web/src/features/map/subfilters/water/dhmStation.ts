// [DATA PROVENANCE]
// Data Source: data/real/hydrology/gulmi_dhm_stations.geojson
// Classification: OBSERVED REAL
// Citations: Department of Hydrology and Meteorology (DHM), Ministry of Energy, Water Resources and Irrigation, Government of Nepal (https://dhm.gov.np)

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const dhmStationMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'DHM Hydro-Meteorological Stations',
    np: 'जल तथा मौसम मापन केन्द्र सञ्जाल',
  },
  pillarName: {
    en: 'Water',
    np: 'जल',
  },
  model: {
    en: 'DHM National Ground Station Network & Telemetry',
    np: 'जल तथा मौसम विज्ञान विभाग राष्ट्रिय केन्द्र सञ्जाल तथा टेलिमेट्री',
  },
  formula: '\\text{DHM Station Class} = f(\\text{Type}, \\, z_{\\text{elev}}, \\, \\text{Telemetry})',
  parameter: {
    en: '8 Active District Stations (5 Precipitation, 2 Climatology, 1 Telemetric AWS)',
    np: 'गुल्मी जिल्लाका ८ सक्रिय केन्द्रहरू (५ वर्षा, २ जलवायु, १ स्वचालित AWS)',
  },
  variables: [
    {
      symbol: '\\text{Precipitation}',
      definition: {
        en: 'Daily manual rainfall recording stations (Ridi #701, Musikot #722, Agimir #731, Bharse #733, Daugha #734)',
        np: 'दैनिक वर्षा मापन केन्द्रहरू (रिडी बजार #७०१, मुसीकोट #७२२, अगिमिर #७३१, भार्से #७३३, दौघा #७३४)',
      },
    },
    {
      symbol: '\\text{Climatological}',
      definition: {
        en: 'Comprehensive climate parameters (Temp, RH, Wind) at Tamghas #725 and Anp Chour #732',
        np: 'तापक्रम, आद्रता, हावाको गति मापन गर्ने जलवायु केन्द्रहरू (तम्घास #७२५ र आँपचौर #७३२)',
      },
    },
    {
      symbol: '\\text{Telemetric AWS}',
      definition: {
        en: 'Real-time automated cellular/satellite telemetry station at Tamghas New AWS',
        np: 'वास्तविक समयमा इन्टरनेट/सेलुलरबाट तथ्याङ्क पठाउने स्वचालित मौसम केन्द्र (तम्घास नयाँ AWS)',
      },
    },
    {
      symbol: '\\text{Elevation Range}',
      definition: {
        en: 'Covers altitudinal gradient from 494m (Ridi) to 1,626m (Bharse) for orographic verification',
        np: 'उचाइगत वर्षा अध्ययनका लागि ४९४ मिटर (रिडी) देखि १,६२६ मिटर (भार्से) सम्मको सञ्जाल',
      },
    },
  ],
  description: {
    en: 'Official Department of Hydrology and Meteorology (DHM) ground monitoring network in Gulmi District comprising 8 active stations: 5 precipitation stations (Index 701 Ridi Bazar 494m, Index 722 Musikot 1353m, Index 731 Agimir 1493m, Index 733 Bharse 1626m, Index 734 Daugha 960m), 2 climatological stations (Index 725 Tamghas 1547m, Index 732 Anp Chour 738m), and 1 real-time Automated Weather Station (Tamghas New AWS).',
    np: 'गुल्मी जिल्लाका ८ वटा आधिकारिक जल तथा मौसम विज्ञान विभाग (DHM) केन्द्रहरूको वास्तविक सञ्जाल: ५ वर्षा मापन केन्द्र (रिडी बजार ४९४मि, मुसीकोट १३५३मि, अगिमिर १४९३मि, भार्से १६२६मि, दौघा ९६०मि), २ जलवायु मापन केन्द्र (तम्घास १५४७मि, आँपचौर ७३८मि), र १ स्वचालित मौसम केन्द्र (तम्घास नयाँ AWS)।',
  },
  confidence: 'OBSERVED REAL',
  inputs: [
    'DHM Station Directory & National Climatological Records (Indices 701, 722, 725, 731, 732, 733, 734)',
    'DHM Real-Time Telemetry & Automated Weather Station (AWS) Portal',
    'Nepal Water & Energy Commission Secretariat (WECS) Catchment Baselines',
  ],
  citation:
    'Department of Hydrology and Meteorology (DHM), Ministry of Energy, Water Resources and Irrigation, Government of Nepal (https://dhm.gov.np)',
  provenancePath: 'data/real/hydrology/gulmi_dhm_stations.geojson',
  unit: 'Station Elevation (m masl) & Gauge Type',
  currentStat: '8 Active DHM Stations (5 Precipitation, 2 Climatology, 1 Telemetric AWS)',
};
