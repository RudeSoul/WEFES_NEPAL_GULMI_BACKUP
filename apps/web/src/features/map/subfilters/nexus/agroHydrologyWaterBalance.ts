// [DATA PROVENANCE]
// Data Source: data/calculated/indicators/gulmi_palika_agro_hydrology.json
// Classification: CALCULATED
// Citations: Allen, R.G. et al. (1998/2000). FAO Irrigation and Drainage Paper 56, Rome; DHM Nepal; NEA Nepal

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const agroHydrologyWaterBalanceMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Agro-Hydrology & River-Lift Balance',
    np: 'कृषि-जल सन्तुलन तथा सौर्य/ग्रिड लिफ्ट मोडल',
  },
  pillarName: {
    en: 'Water-Food-Energy',
    np: 'जल-खाद्य-ऊर्जा',
  },
  model: {
    en: 'FAO-56 Dual-Bucket Soil Moisture & Nexus River-Lift Sizing',
    np: 'एफएओ-५६ माटो चिस्यान तथा नेक्सस लिफ्ट सिँचाइ क्षमता',
  },
  formula:
    '\\mathrm{ET}_c = K_c \\cdot \\mathrm{ET}_0; \\; \\mathrm{NIR} = \\max(0, \\mathrm{ET}_c - P_{\\text{eff}}); \\; V_{\\text{gross}} = \\frac{\\mathrm{NIR} \\cdot 10 \\cdot A}{\\eta}; \\; P_{\\text{hyd}} = \\frac{\\rho \\cdot g \\cdot Q \\cdot \\mathrm{TDH}}{1000}',
  parameter: {
    en: 'FAO-56 Eq. 6 (Penman-Monteith), Eq. 82-84 (TAW, RAW, Ks), η = 80% (Drip) / 45% (Furrow)',
    np: 'एफएओ-५६ समीकरण ६, ८२-८४, सिँचाइ दक्षता ८०% (थोपा) / ४५% (कुलो)',
  },
  variables: [
    {
      symbol: '\\mathrm{ET}_0',
      definition: {
        en: 'Reference grass evapotranspiration by FAO Penman-Monteith (mm/day)',
        np: 'एफएओ पेनम्यान-मोन्टिथ अनुसार आधारभूत वाष्पीकरण दर (मिमी/दिन)',
      },
    },
    {
      symbol: '\\mathrm{ET}_c',
      definition: {
        en: 'Crop evapotranspiration under standard conditions (ET_c = K_c · ET_0, mm/day)',
        np: 'बाली गुणाङ्क अनुसार समायोजित वाष्पीकरण माग (मिमी/दिन)',
      },
    },
    {
      symbol: '\\mathrm{TAW} / \\mathrm{RAW}',
      definition: {
        en: 'Total Available Water (1000·(θ_FC - θ_WP)·Zr) and Readily Available Water (p·TAW) (mm)',
        np: 'माटोको कुल उपलब्ध जल (TAW) र बिरुवाले सहजै लिन सक्ने जल (RAW) (मिमी)',
      },
    },
    {
      symbol: 'K_s',
      definition: {
        en: 'Soil water stress reduction coefficient: (TAW - D_r) / ((1 - p)·TAW) (dimensionless)',
        np: 'माटो चिस्यान अभावमा वाष्पीकरण घट्ने दर (तनाव गुणक K_s)',
      },
    },
    {
      symbol: 'V_{\\text{gross}}',
      definition: {
        en: 'Gross volumetric irrigation water lift demand adjusted for field application efficiency η (m³)',
        np: 'सिँचाइ दक्षता अनुसार लिफ्ट गर्नुपर्ने कुल पानीको परिमाण (घन मिटर)',
      },
    },
    {
      symbol: 'P_{\\text{hyd}}',
      definition: {
        en: 'Hydraulic lift power required for Total Dynamic Head (Static Lift + Friction) (kW)',
        np: 'कुल डाइनामिक हेड (उचाइ र घर्षण) का लागि आवश्यक हाइड्रोलिक पम्पिङ पावर (किलोवाट)',
      },
    },
  ],
  description: {
    en: 'Three-stage integrated WEFES nexus model connecting monthly downscaled rainfall against crop evaporative demand (Stage 1), sequential root-zone moisture carryover and depletion (Stage 2), and peak dry-season multi-energy river-lift pump/solar generator sizing (Stage 3) for all 12 Palikas of Gulmi.',
    np: 'गुल्मीका १२ वटै पालिकामा वर्षा र बालीको पानी माग (चरण १), माटोको चिस्यान भण्डारण र सुख्खायामको अभाव (चरण २), तथा नदी लिफ्ट सिँचाइका लागि आवश्यक सौर्य/विद्युत पम्पिङ क्षमता (चरण ३) को ३-चरणिय एकीकृत वैज्ञानिक मोडल।',
  },
  confidence: 'CALCULATED',
  inputs: [
    'FAO Irrigation and Drainage Paper No. 56 (Allen, Pereira, Raes, Smith, Rome)',
    'CHIRPS v2.0 High-Resolution Gridded Precipitation (1991–2020 Baseline)',
    'DHM Nepal Tamghas Climatological Station #725 Baseline',
    'Global Solar Atlas 2.0 / World Bank ESMAP Solar PVOUT Climatology',
    'NSO Census of Agriculture 2021/22 Cultivated Land Areas',
  ],
  citation: 'Allen, R.G. et al. (1998/2000). FAO Irrigation and Drainage Paper 56, Rome; DHM Nepal; NEA Nepal',
  provenancePath: 'data/calculated/indicators/gulmi_palika_agro_hydrology.json',
  unit: 'mm/month, m³, kW, kWh',
  currentStat: '12 Palikas Modeled: 304.7 mm Net Deficit Peak (Chaitra–Baisakh), Off-Grid Solar & NEA Grid Alternative',
};
