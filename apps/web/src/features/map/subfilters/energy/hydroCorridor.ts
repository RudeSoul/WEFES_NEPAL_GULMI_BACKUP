// [DATA PROVENANCE]
// Data Source: data/calculated/hydro_reaches/hydro_palika_summary.json
// Classification: CALCULATED
// Citations: Conrad et al. (2015); Wang & Liu (2006); BHA / IHA Hydropower Guidelines; DOED Nepal

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const hydroCorridorMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Hydropower Potential',
    np: 'जलविद्युत सम्भाव्यता',
  },
  pillarName: {
    en: 'Energy',
    np: 'ऊर्जा',
  },
  model: {
    en: 'Topographic Hydropower Screening Engine & BHA/IHA Standard (P = 9.81·Q_turb·H_net·η)',
    np: 'स्थलरूपी जलविद्युत स्क्रिनिङ इन्जिन र BHA/IHA मापदण्ड (P = ९.८१·Q_turb·H_net·η)',
  },
  formula: 'P \\, (\\text{kW}) = 9.81 \\times Q_{\\text{turb}} \\times H_{\\text{net}} \\times \\eta',
  parameter: {
    en: 'Electromechanical Efficiency η = 0.70, Net Head (H_net = H_gross × 0.90), Turbined Discharge Q_turb (m³/s)',
    np: 'विद्युत-यान्त्रिक दक्षता η = ०.७० • खुद हेड (H_net = H_gross × ०.९०) • टर्बाइन बहाव Q_turb (m³/s)',
  },
  variables: [
    {
      symbol: 'P \\, (\\text{kW})',
      definition: {
        en: 'Screening-level theoretical power generation potential (kW)',
        np: 'स्क्रिनिङ तहको सम्भावित जलविद्युत उत्पादन क्षमता (किलोवाट)',
      },
    },
    {
      symbol: '\\rho g = 9.81 \\text{ kN/m}^3',
      definition: {
        en: 'Specific weight of water: ρ · g = 1,000 kg/m³ × 9.81 m/s² / 1000',
        np: 'पानीको विशिष्ट तौल र गुरुत्व प्रवेग गुणनफल',
      },
    },
    {
      symbol: 'Q_{\\text{turb}}',
      definition: {
        en: 'Turbined river discharge (m³/s) deducting 10% environmental river reserve from mean catchment flow',
        np: '१०% वातावरणीय बहाव कट्टा गरी प्राप्त टर्बाइनमा जाने खुद नदी बहाव (घनमिटर प्रति सेकेन्ड)',
      },
    },
    {
      symbol: 'H_{\\text{net}}',
      definition: {
        en: 'Effective hydraulic head after 10% penstock/friction loss: H_net = (Z_upstream - Z_downstream) × 0.90 (m)',
        np: '१०% घर्षण तथा पेनस्टक गिरावट कट्टा पछिको खुद हेड: H_net = H_gross × ०.९० (मिटर)',
      },
    },
    {
      symbol: '\\eta',
      definition: {
        en: 'Total electromechanical efficiency (0.70 enforced standard per BHA/IHA guidelines)',
        np: 'टर्बाइन, जेनेरेटर र प्रसारणको समग्र विद्युत-यान्त्रिक दक्षता (७०% BHA/IHA मापदण्ड)',
      },
    },
  ],
  description: {
    en: 'Calculates screening-level Gross Theoretical Reach Potential across Gulmi sub-basins utilizing priority-flood depression-free routing, acyclic D8 DAG flow accumulation, and curvilinear path distance tracing. Screened against district administrative boundary and 5.0 kW minimum capacity threshold.',
    np: 'सिङ्क-रहित हाइड्रोलोजिकल मोडल, चक्रीय-त्रुटि-रहित D8 बहाव संकलन र वास्तविक वक्र रेखा दूरीका आधारमा गुल्मीका नदी तथा खोलाहरूमा सम्भावित जलविद्युत क्षमताको वैज्ञानिक गणना। पालिका सीमाना र न्यूनतम ५ किलोवाट क्षमताका आधारमा प्रशोधित।',
  },
  confidence: 'CALCULATED',
  inputs: [
    '30m Digital Elevation Model (Copernicus DEM / ALOS PALSAR)',
    'Priority-Flood & Topological DAG Flow Routing',
    'Gulmi Palika Boundary Vector (2,620 Screened Reaches)',
    'BHA / IHA Hydropower Standard (η = 0.70, Net Head, 10% Env Flow)',
    'hydro_palika_summary.json',
  ],
  citation: 'Conrad et al. (2015); Wang & Liu (2006); BHA / IHA Hydropower Guidelines; DOED Nepal',
  provenancePath: 'data/calculated/hydro_reaches/hydro_palika_summary.json',
  unit: 'Gross Potential (MW)',
  currentStat:
    '2,620 Viable Screened Reaches (≥ 5 kW) | Gross Theoretical Potential: 1,730.7 MW | Mean Net Head: 56.9 m',
};
