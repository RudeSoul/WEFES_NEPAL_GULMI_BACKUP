// [DATA PROVENANCE]
// Data Source: data/real/socioeconomics/nepal_investment_benchmarks.json
// Classification: OBSERVED REAL (World Bank REED, USAID FtF, IFAD AAFIS Project Appraisal Reports)
// Citations: World Bank Project Appraisal Document PAD-3712; USAID Feed the Future Evaluation 2021; IFAD Rural Enterprises Assessment

import rawBenchmarks from '../../../../../data/real/socioeconomics/nepal_investment_benchmarks.json';

export interface NepalProjectFinancialBenchmark {
  commodity: string;
  sourceProject: 'World Bank REED (Rural Enterprise & Economic Development)' | 'USAID Feed the Future (FtF)' | 'IFAD AAFIS' | 'NARC Commercial Trial';
  agroDomain: string;
  economicInternalRateOfReturnEIRR: number;
  financialNPVNpr: number;
  discountRatePct: number;
  benefitCostRatioBCR: number;
  farmgateSwitchingValuePriceDropPct: number; // Maximum drop in crop price before NPV <= 0
  costSwitchingValueCostRisePct: number; // Maximum rise in input cost before NPV <= 0
  paybackPeriodYears: number;
  verifiedFieldReference: string;
}

export const NEPAL_FINANCIAL_BENCHMARKS: NepalProjectFinancialBenchmark[] = rawBenchmarks as NepalProjectFinancialBenchmark[];

export function getBenchmarkByCrop(cropName: string): NepalProjectFinancialBenchmark {
  const norm = cropName.toLowerCase();
  const found = NEPAL_FINANCIAL_BENCHMARKS.find(b => {
    const c = b.commodity.toLowerCase();
    return norm.includes(c) || c.includes(norm) || (norm.includes('rice') && c.includes('paddy'));
  });
  return found || NEPAL_FINANCIAL_BENCHMARKS[0];
}

