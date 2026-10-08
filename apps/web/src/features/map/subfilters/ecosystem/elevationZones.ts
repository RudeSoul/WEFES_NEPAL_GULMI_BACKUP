// [DATA PROVENANCE]
// Data Source: data/real/boundaries/gulmi-palikas.json
// Classification: OBSERVED REAL
// Citations: Department of Survey & ICIMOD Agro-Ecological Zonation

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const elevationZonesMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: 'Topographic Elevation Tiers',
    np: 'उचाइगत भू-बनोट तहहरू',
  },
  pillarName: {
    en: 'Ecosystem',
    np: 'पारिस्थितिकी',
  },
  model: {
    en: 'SRTM 30m Agro-Ecological Altitudinal Zoning',
    np: 'SRTM ३० मिटर उचाइगत कृषि-पारिस्थितिकीय क्षेत्र वर्गीकरण',
  },
  formula:
    'z \\in [450\\text{ m}, 2690\\text{ m}] \\implies \\text{Zone}(z) \\in \\{\\text{Subtropical}, \\text{Warm-Temp}, \\text{Cool-Temp}\\}',
  parameter: {
    en: 'Subtropical (<1000m), Warm-Temperate (1000–2000m), Cool-Temperate (>2000m)',
    np: 'उपोष्ण (<१०००मि), न्यानो-समशीतोष्ण (१०००–२०००मि), चिसो-समशीतोष्ण (>२०००मि)',
  },
  variables: [
    {
      symbol: 'z',
      definition: {
        en: 'Surface terrain elevation from 30m SRTM DEM (m masl)',
        np: 'समुद्र सतहबाट भू-सतहको उचाइ (मिटर)',
      },
    },
    {
      symbol: '\\text{Zone}(z)',
      definition: {
        en: 'Agro-ecological altitudinal climate zone classification',
        np: 'उचाइगत कृषि-जलवायु क्षेत्र वर्गीकरण',
      },
    },
  ],
  description: {
    en: 'SRTM 30m topographic altitudinal distribution across Gulmi classifying valley floors, mid-hill terraces, and high-altitude ridges.',
    np: 'गुल्मी जिल्लाको ३० मिटर उचाइ तथ्याङ्कबाट नदी उपत्यका, मध्य पहाडी टार, र लेकाली डाँडाहरूको कृषि-जलवायु वर्गीकरण।',
  },
  confidence: 'OBSERVED REAL',
  inputs: ['NASA SRTM 30m Digital Elevation Model', 'Nepal Department of Survey'],
  citation: 'Department of Survey & ICIMOD Agro-Ecological Zonation',
  provenancePath: 'data/real/boundaries/gulmi-palikas.json',
  unit: 'm masl',
  currentStat: 'Span: 465m (Ridi riverbed) to 2,690m (Resunga / Madane peaks)',
};
