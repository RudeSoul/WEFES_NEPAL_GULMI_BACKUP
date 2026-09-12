export interface DevelopmentPartnerProject {
  id: string;
  partnerName: 'Asian Development Bank (ADB)' | 'World Bank (WB)' | 'USAID' | 'IFAD' | 'FAO / GCF';
  projectName: string;
  projectCode: string;
  totalBudgetUsdMillion: number;
  projectDuration: string;
  coreInterventionSectors: string[];
  districtActivePresence: boolean;
  coFinancingOpportunity: string;
  antiDuplicationPolicyGuidance: string;
}

export const NEPAL_DEVELOPMENT_PARTNER_REGISTRY: DevelopmentPartnerProject[] = [
  {
    id: 'adb-miip',
    partnerName: 'Asian Development Bank (ADB)',
    projectName: 'Mechanized Irrigation Innovation Project (MIIP)',
    projectCode: 'ADB-LOAN-3842-NEP',
    totalBudgetUsdMillion: 85.0,
    projectDuration: '2020 – 2026',
    coreInterventionSectors: ['Solar Pumping Micro-Irrigation', 'Groundwater Tubewell Automation', 'Recharge Ponds'],
    districtActivePresence: true,
    coFinancingOpportunity: 'Provides 85% capital subsidy for solar tubewells; platform models recharge pond compliance to ensure sustainable drawdown.',
    antiDuplicationPolicyGuidance: 'Avoid independent municipal solar pump tenders where ADB-MIIP is actively issuing matching subsidies.',
  },
  {
    id: 'wb-reed',
    partnerName: 'World Bank (WB)',
    projectName: 'Rural Enterprise and Economic Development Project (REED)',
    projectCode: 'WB-P170215 / PAD-3712',
    totalBudgetUsdMillion: 80.0,
    projectDuration: '2021 – 2027',
    coreInterventionSectors: ['Productive Partnerships', 'Cold Chain Hubs', 'Value Chain Infrastructure', 'Agro-Alliances'],
    districtActivePresence: true,
    coFinancingOpportunity: 'Grants up to NPR 1 Crore per cooperative productive partnership; platform exports bankable PAD briefs directly for REED grants.',
    antiDuplicationPolicyGuidance: 'Align cooperative business plans with REED corridor economic hubs (Mid-Hills & Terai Highway Corridors).',
  },
  {
    id: 'usaid-nsaf',
    partnerName: 'USAID',
    projectName: 'Nepal Seed and Fertilizer Project (NSAF / Feed the Future)',
    projectCode: 'USAID-FTF-720367',
    totalBudgetUsdMillion: 15.0,
    projectDuration: '2019 – 2025',
    coreInterventionSectors: ['NARC Hybrid Seed Commercialization', 'Digital Soil Mapping', 'QUEFTS Nutrient Management'],
    districtActivePresence: true,
    coFinancingOpportunity: 'Partners with private seed companies and Agro-vets for certified seed supply and mobile advisory.',
    antiDuplicationPolicyGuidance: 'Leverage NSAF verified seed multiplier networks rather than importing uncertified seed stock.',
  },
  {
    id: 'ifad-asdp',
    partnerName: 'IFAD',
    projectName: 'Agriculture Sector Development Programme (ASDP)',
    projectCode: 'IFAD-ASDP-2000001550',
    totalBudgetUsdMillion: 68.0,
    projectDuration: '2018 – 2026',
    coreInterventionSectors: ['High-Value Mountain Agriculture', 'Spices & Horticulture', 'Karnali Poverty Alleviation'],
    districtActivePresence: true,
    coFinancingOpportunity: 'Co-finances processing equipment, micro-cold stores, and organic certification for smallholder groups.',
    antiDuplicationPolicyGuidance: 'Direct project proposals in Karnali and Mid-Hills to ASDP windows for 50% matching infrastructure funds.',
  },
];

// District-level operational presence lists
const WB_REED_DISTRICTS = new Set(['gulmi', 'palpa', 'arghakhanchi', 'rupandehi', 'kaski', 'syangja']);
const USAID_NSAF_DISTRICTS = new Set(['gulmi', 'rupandehi', 'kapilvastu', 'palpa', 'syangja']);

export function computeDevelopmentPartnerAlignment(
  districtName: string
): { activeProjects: DevelopmentPartnerProject[]; totalAvailableDonorBudgetUsd: number; matchingStrategy: string } {
  const dNorm = districtName.toLowerCase();

  const activeProjects = NEPAL_DEVELOPMENT_PARTNER_REGISTRY.map(p => {
    let isActive: boolean;

    if (p.id === 'adb-miip') {
      isActive = ['rupandehi', 'kapilvastu'].includes(dNorm);
    } else if (p.id === 'ifad-asdp') {
      isActive = ['gulmi', 'arghakhanchi'].includes(dNorm);
    } else if (p.id === 'wb-reed') {
      isActive = WB_REED_DISTRICTS.has(dNorm);
    } else if (p.id === 'usaid-nsaf') {
      isActive = USAID_NSAF_DISTRICTS.has(dNorm);
    } else {
      isActive = false;
    }

    return { ...p, districtActivePresence: isActive };
  });

  const totalBudget = activeProjects.filter(p => p.districtActivePresence).reduce((acc, p) => acc + p.totalBudgetUsdMillion, 0);
  const activeCount = activeProjects.filter(p => p.districtActivePresence).length;

  const matchingStrategy = activeCount > 0
    ? `Identified $${totalBudget}M USD in active multilateral donor co-financing in ${districtName} (${activeCount} donor${activeCount > 1 ? 's' : ''}). Municipal planners should leverage these existing matching grant windows.`
    : `No active multilateral donor programs currently operating in ${districtName}. Engage provincial Ministry of Agriculture or NPC for pre-feasibility seed grant allocation.`;

  return { activeProjects, totalAvailableDonorBudgetUsd: totalBudget, matchingStrategy };
}
