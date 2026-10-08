// [DATA PROVENANCE]
// Data Source: data/real/municipal/palika_profiles.json
// Classification: OBSERVED REAL
// Citations: Food and Agriculture Organization (FAO EcoCrop), MoFAGA & MoALD Nepal

import type { RawMethodologyEntry } from '@/data/districtCalculationAssets';

export const singleCropMethodology: RawMethodologyEntry = {
  shortTitle: {
    en: '{crop} Suitability',
    np: '{crop} अनुकूलता',
  },
  pillarName: {
    en: 'Food',
    np: 'खाद्य',
  },
  model: {
    en: 'Two-Tier Rule: FAO EcoCrop + Municipal Survey Grounding',
    np: 'दुई-तह विधि: एफएओ जैविक सीमा + स्थानीय सरकार कृषि सम्भाव्यता सर्वेक्षण',
  },
  formula:
    '\\text{Suitability} = \\begin{cases} S_{\\text{survey}}, & \\text{if field verified} \\\\ f(T, P, \\text{pH}, z), & \\text{otherwise (EcoCrop)} \\end{cases}',
  parameter: {
    en: 'Two-Tier Rule: Tier 1 FAO EcoCrop Biological Envelope + Tier 2 MoFAGA/MoALD Survey Grounding',
    np: 'दुई-तह विधि: एफएओ जैविक सीमा + स्थानीय सरकार कृषि सम्भाव्यता सर्वेक्षण',
  },
  variables: [
    {
      symbol: '\\text{Suitability}',
      definition: {
        en: 'Official agro-climatic suitability score (0–100%) grounded in municipal surveys',
        np: 'अन्तिम कृषि-जलवायु बाली अनुकूलता सूचकाङ्क',
      },
    },
    {
      symbol: '\\text{Tier 1 (EcoCrop)}',
      definition: {
        en: 'Biophysical envelope checks for optimal temperature, precipitation, soil pH, and altitude limits',
        np: 'तापक्रम, वर्षा, माटोको पिएच र उचाइको जैविक सीमा परीक्षण',
      },
    },
    {
      symbol: '\\text{Tier 2 (Survey)}',
      definition: {
        en: 'Grounded municipal feasibility survey from MoFAGA / MoALD / CBS 2021 District Profiles',
        np: 'स्थानीय तह कृषि सम्भाव्यता सर्वेक्षण (सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय / कृषि मन्त्रालय)',
      },
    },
    {
      symbol: '\\text{Limiting Factor}',
      definition: {
        en: 'Primary agro-climatic constraint (frost risk, slope, thermal edge, dry-month rainfall deficit)',
        np: 'प्रमुख कृषि-जलवायु सीमितता (तुषारो, भिरालोपन, तापक्रम वा वर्षा अभाव)',
      },
    },
  ],
  description: {
    en: 'Two-tier scientific evaluation: Tier 1 checks biological limits against FAO EcoCrop species envelopes ({crop}); Tier 2 grounds Palika suitability scores directly in official municipal agricultural feasibility surveys (MoFAGA/MoALD/CBS 2021) with identified limiting constraints.',
    np: 'दुई-तह वैज्ञानिक विधि: तह १ मा एफएओ इकोक्रप अनुसार {crop} का जैविक सीमाहरू (तापक्रम, वर्षा, माटो पिएच, उचाइ) परीक्षण गरिन्छ; तह २ मा गुल्मीका १२ पालिकाको आधिकारिक सरकारी कृषि सम्भाव्यता सर्वेक्षण (MoFAGA/MoALD/CBS २०७८) को वास्तविक प्राप्ताङ्क र सीमितता समावेश गरिन्छ।',
  },
  confidence: 'OBSERVED REAL',
  inputs: [
    'FAO EcoCrop Species Database (IDs 749, 2175, 1574, 2114, 5657, 1407, 1379)',
    'Municipal Agricultural Feasibility Profiles (MoFAGA, MoALD, CBS Census 2021)',
    'DHM Downscaled Climatology & NASA POWER',
    'NARC Soil Sampling Grid pH Database',
  ],
  citation: 'Food and Agriculture Organization (FAO EcoCrop), MoFAGA & MoALD Nepal',
  provenancePath: 'data/real/municipal/palika_profiles.json',
  unit: 'Suitability Score %',
  currentStat: 'Optimal (≥80%), High (65–79%), Marginal (45–64%), Constrained (<45%)',
};
