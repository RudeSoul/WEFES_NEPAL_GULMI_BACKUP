// [DATA PROVENANCE]
// Data Source: data/proxy/social/gender_labor_coefficients.json
// Classification: PROXY (Mid-Hills Gender Inclusivity Surveys, MoALD GESI Guidelines)
// Citations: Nepal Labour Force Survey (NLFS III); MoALD Gender Equity & Social Inclusion in Agriculture (2021)

import proxyCoefficients from '../../../../../data/proxy/social/gender_labor_coefficients.json';

export interface GenderResponsiveInputPlan {
  femaleLaborSharePct: number;
  peakWeedingDrudgeryHoursPerHa: number;
  womenFriendlyMicroMechanization: {
    toolName: string;
    drudgeryReductionPct: number;
    laborHoursSavedPerHa: number;
    costNpr: number;
    womenCooperativeSubsidyEligibility: '85% Subsidized by Ministry' | '50% Cooperative Loan' | 'Custom Hiring Center (CHC) Rental' | string;
  }[];
  autonomousCreditAccessIndex: number;
  ndcWomenRepresentationTargetPct: number;
}

export interface MunicipalBudgetOptimizer {
  municipalityName: string;
  totalAnnualMunicipalBudgetNpr: number;
  agriBudgetSharePct: number;
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
  const femaleLaborShare = proxyCoefficients.femaleLaborSharePct;
  const weedingHours = Math.round(totalLaborDays * proxyCoefficients.drudgeryWeedingFraction * proxyCoefficients.dailyWorkHours);

  const gender: GenderResponsiveInputPlan = {
    femaleLaborSharePct: femaleLaborShare,
    peakWeedingDrudgeryHoursPerHa: weedingHours,
    womenFriendlyMicroMechanization: proxyCoefficients.womenFriendlyMicroMechanization as any,
    autonomousCreditAccessIndex: proxyCoefficients.autonomousCreditAccessIndex,
    ndcWomenRepresentationTargetPct: proxyCoefficients.ndcWomenRepresentationTargetPct,
  };

  const totalMunBudget = proxyCoefficients.defaultMunicipalBudget.totalAnnualMunicipalBudgetNpr;
  const agriShare = proxyCoefficients.defaultMunicipalBudget.agriBudgetSharePct;
  const totalAgri = totalMunBudget * (agriShare / 100);

  const budget: MunicipalBudgetOptimizer = {
    municipalityName: `${districtName} Central Municipality`,
    totalAnnualMunicipalBudgetNpr: totalMunBudget,
    agriBudgetSharePct: agriShare,
    actualAgriAllocationNpr: totalAgri,
    optimizedSubAllocations: proxyCoefficients.defaultMunicipalBudget.defaultSubAllocations.map(alloc => ({
      program: alloc.program,
      currentSharePct: alloc.currentSharePct,
      recommendedSharePct: alloc.recommendedSharePct,
      allocatedAmountNpr: Math.round(totalAgri * alloc.shareMultiplier),
      expectedOutcome: alloc.expectedOutcome,
    })),
    dataIngestionStatus: 'Manual Entry Verified',
  };

  return { gender, budget };
}
