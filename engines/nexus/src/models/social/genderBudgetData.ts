export interface GenderResponsiveInputPlan {
  femaleLaborSharePct: number; // 68% in mid-hills
  peakWeedingDrudgeryHoursPerHa: number;
  womenFriendlyMicroMechanization: {
    toolName: string;
    drudgeryReductionPct: number;
    laborHoursSavedPerHa: number;
    costNpr: number;
    womenCooperativeSubsidyEligibility: '85% Subsidized by Ministry' | '50% Cooperative Loan' | 'Custom Hiring Center (CHC) Rental';
  }[];
  autonomousCreditAccessIndex: number; // 0 - 100
  ndcWomenRepresentationTargetPct: 50; // 50% target in community forestry & water users associations
}

export interface MunicipalBudgetOptimizer {
  municipalityName: string;
  totalAnnualMunicipalBudgetNpr: number; // e.g. NPR 60 Crore
  agriBudgetSharePct: number; // 0.2% - 8.5% (MoALD baseline)
  actualAgriAllocationNpr: number;
  optimizedSubAllocations: {
    program: string;
    currentSharePct: number;
    recommendedSharePct: number;
    allocatedAmountNpr: number;
    expectedOutcome: string;
  }[];
  dataIngestionStatus: 'Manual Entry Verified' | 'MOU Data Drop Ready (Provincial MEAP)' | 'Automated API (Pending Gov Gateway)';
}

export function computeGenderAndMunicipalBudget(
  districtName: string,
  cropName: string,
  totalLaborDays: number
): { gender: GenderResponsiveInputPlan; budget: MunicipalBudgetOptimizer } {
  const femaleLaborShare = 68; // 68% female smallholder labor in hills
  const weedingHours = Math.round(totalLaborDays * 0.45 * 8);

  const gender: GenderResponsiveInputPlan = {
    femaleLaborSharePct: femaleLaborShare,
    peakWeedingDrudgeryHoursPerHa: weedingHours,
    womenFriendlyMicroMechanization: [
      {
        toolName: 'Lightweight Mini-Tiller (4.5 HP Electric/Petrol)',
        drudgeryReductionPct: 75,
        laborHoursSavedPerHa: 140,
        costNpr: 45000,
        womenCooperativeSubsidyEligibility: '85% Subsidized by Ministry',
      },
      {
        toolName: 'Cono-Weeder / Rotary Mechanical Weeder',
        drudgeryReductionPct: 60,
        laborHoursSavedPerHa: 85,
        costNpr: 6500,
        womenCooperativeSubsidyEligibility: 'Custom Hiring Center (CHC) Rental',
      },
      {
        toolName: 'Solar-Powered Automated Drip Kit (500m²)',
        drudgeryReductionPct: 88,
        laborHoursSavedPerHa: 180,
        costNpr: 32000,
        womenCooperativeSubsidyEligibility: '50% Cooperative Loan',
      },
    ],
    autonomousCreditAccessIndex: 64,
    ndcWomenRepresentationTargetPct: 50,
  };

  const totalMunBudget = 550000000; // NPR 55 Crore standard Gaunpalika / Nagarpalika budget
  const agriShare = 3.8; // 3.8% MoALD average
  const totalAgri = totalMunBudget * (agriShare / 100);

  const budget: MunicipalBudgetOptimizer = {
    municipalityName: `${districtName} Central Municipality`,
    totalAnnualMunicipalBudgetNpr: totalMunBudget,
    agriBudgetSharePct: agriShare,
    actualAgriAllocationNpr: totalAgri,
    optimizedSubAllocations: [
      {
        program: 'Women-Led Custom Hiring Centers (Mini-Tillers & Solar Kits)',
        currentSharePct: 15,
        recommendedSharePct: 35,
        allocatedAmountNpr: Math.round(totalAgri * 0.35),
        expectedOutcome: 'Directly cuts female peak-season labor drudgery by 70% across 450 smallholder households.',
      },
      {
        program: 'NARC Certified Seed Multiplication & Biochar Composting',
        currentSharePct: 20,
        recommendedSharePct: 30,
        allocatedAmountNpr: Math.round(totalAgri * 0.30),
        expectedOutcome: 'Supplies high-yielding biofortified certified seeds locally, ending dependence on adulterated open-market seeds.',
      },
      {
        program: 'Mulpani Springshed Recharge & Solar Micro-Irrigation Ponds',
        currentSharePct: 10,
        recommendedSharePct: 25,
        allocatedAmountNpr: Math.round(totalAgri * 0.25),
        expectedOutcome: 'Protects 18 village drinking springs and provides gravity drip irrigation for 35 hectares of winter crops.',
      },
      {
        program: 'Administrative & Extension Travel Expenses',
        currentSharePct: 55,
        recommendedSharePct: 10,
        allocatedAmountNpr: Math.round(totalAgri * 0.10),
        expectedOutcome: 'Reallocates administrative bloat into direct productive smallholder capital assets.',
      },
    ],
    dataIngestionStatus: 'Manual Entry Verified',
  };

  return { gender, budget };
}
