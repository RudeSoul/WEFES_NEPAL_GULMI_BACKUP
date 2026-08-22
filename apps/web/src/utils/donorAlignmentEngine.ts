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

// ─── District-level operational presence lists (GAP 3 FIX) ───────────────────
// WB-REED: Rural Enterprise & Economic Development Project (P170215)
// Focused on mid-hills commercial corridors and Terai food-belt.
const WB_REED_DISTRICTS = new Set([
  // Koshi Province — eastern hills & Terai
  'jhapa', 'morang', 'sunsari', 'dhankuta', 'ilam', 'panchthar', 'taplejung',
  'terhathum', 'bhojpur', 'khotang', 'okhaldhunga',
  // Madhesh Province — terai food belt
  'saptari', 'siraha', 'dhanusha', 'mahottari', 'sarlahi', 'rautahat', 'bara', 'parsa',
  // Bagmati Province — valleys and mid-hills
  'kathmandu', 'lalitpur', 'bhaktapur', 'kavrepalanchok', 'dhading', 'nuwakot',
  'sindhuli', 'makwanpur', 'chitwan',
  // Gandaki Province — mid-hills commercial hubs
  'kaski', 'syangja', 'palpa', 'gulmi', 'arghakhanchi', 'parbat', 'baglung',
  'lamjung', 'tanahun', 'gorkha', 'nawalparasi',
  // Lumbini Province — western Terai
  'rupandehi', 'kapilvastu', 'dang', 'banke', 'pyuthan', 'rolpa',
  // Sudurpashchim — Terai belt
  'kailali', 'kanchanpur',
]);

// USAID Feed the Future / NSAF: Nepal Seed and Fertilizer Project (720367)
// Intensification focus: Terai belt + key commercial agricultural valleys only.
const USAID_NSAF_DISTRICTS = new Set([
  // Core Terai intensification zones
  'jhapa', 'morang', 'sunsari', 'saptari', 'siraha', 'dhanusha', 'mahottari',
  'sarlahi', 'rautahat', 'bara', 'parsa', 'nawalparasi', 'rupandehi', 'kapilvastu',
  'dang', 'banke', 'kailali',
  // Key mid-hills commercial valleys
  'kaski', 'syangja', 'lalitpur', 'kavrepalanchok', 'dhading', 'chitwan', 'makwanpur',
]);

export function computeDevelopmentPartnerAlignment(
  districtName: string
): { activeProjects: DevelopmentPartnerProject[]; totalAvailableDonorBudgetUsd: number; matchingStrategy: string } {
  const dNorm = districtName.toLowerCase();

  const activeProjects = NEPAL_DEVELOPMENT_PARTNER_REGISTRY.map(p => {
    let isActive: boolean;

    if (p.id === 'adb-miip') {
      // ADB MIIP: flat-land irrigation districts only (Terai tubewell zones)
      isActive = ['saptari', 'siraha', 'dhanusha', 'mahottari', 'sarlahi', 'rautahat', 'bara', 'parsa', 'rupandehi', 'kapilvastu', 'kailali', 'bardiya'].includes(dNorm);
    } else if (p.id === 'ifad-asdp') {
      // IFAD ASDP: Karnali / Mid-western mountain poverty belt
      isActive = ['surkhet', 'dailekh', 'salyan', 'jajarkot', 'jumla', 'kalikot', 'dolpa', 'mugu', 'humla', 'rolpa', 'rukum'].includes(dNorm);
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
