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

export const NEPAL_FINANCIAL_BENCHMARKS: NepalProjectFinancialBenchmark[] = [
  {
    commodity: 'Ginger (Fresh / Sutho)',
    sourceProject: 'World Bank REED (Rural Enterprise & Economic Development)',
    agroDomain: 'Mid-Hills (Salyan, Palpa, Surkhet)',
    economicInternalRateOfReturnEIRR: 32.7,
    financialNPVNpr: 342419,
    discountRatePct: 12.0,
    benefitCostRatioBCR: 2.14,
    farmgateSwitchingValuePriceDropPct: -28.5,
    costSwitchingValueCostRisePct: +38.2,
    paybackPeriodYears: 1.6,
    verifiedFieldReference: 'World Bank Project Appraisal Document PAD-3712 (Nepal REED Project 2020)',
  },
  {
    commodity: 'Potato (Table & Seed)',
    sourceProject: 'World Bank REED (Rural Enterprise & Economic Development)',
    agroDomain: 'Mid-Hills & Trans-Himalayan Terraces (Kavre, Solukhumbu)',
    economicInternalRateOfReturnEIRR: 39.9,
    financialNPVNpr: 379220,
    discountRatePct: 12.0,
    benefitCostRatioBCR: 2.45,
    farmgateSwitchingValuePriceDropPct: -32.0,
    costSwitchingValueCostRisePct: +44.0,
    paybackPeriodYears: 1.4,
    verifiedFieldReference: 'World Bank Project Appraisal Document PAD-3712 (Nepal REED Project 2020)',
  },
  {
    commodity: 'Dairy & Silage Intercropping',
    sourceProject: 'World Bank REED (Rural Enterprise & Economic Development)',
    agroDomain: 'Mid-Hills Valley Corridors (Kaski, Chitwan, Tanahun)',
    economicInternalRateOfReturnEIRR: 61.2,
    financialNPVNpr: 3546639,
    discountRatePct: 12.0,
    benefitCostRatioBCR: 3.10,
    farmgateSwitchingValuePriceDropPct: -42.0,
    costSwitchingValueCostRisePct: +68.5,
    paybackPeriodYears: 1.1,
    verifiedFieldReference: 'World Bank Project Appraisal Document PAD-3712 (Nepal REED Project 2020)',
  },
  {
    commodity: 'Improved Spring & Monsoon Paddy',
    sourceProject: 'USAID Feed the Future (FtF)',
    agroDomain: 'Terai & Inner Terai (Kailali, Bardiya, Banke, Kapilvastu)',
    economicInternalRateOfReturnEIRR: 21.5,
    financialNPVNpr: 185600,
    discountRatePct: 10.0,
    benefitCostRatioBCR: 1.78,
    farmgateSwitchingValuePriceDropPct: -18.5,
    costSwitchingValueCostRisePct: +24.0,
    paybackPeriodYears: 2.2,
    verifiedFieldReference: 'USAID/CRI Cost-Benefit Analysis of Family Farm Model (Far-West Nepal)',
  },
  {
    commodity: 'Large Cardamom (Agroforestry)',
    sourceProject: 'IFAD AAFIS',
    agroDomain: 'Eastern Mountain Forests (Ilam, Panchthar, Taplejung)',
    economicInternalRateOfReturnEIRR: 28.4,
    financialNPVNpr: 685000,
    discountRatePct: 12.0,
    benefitCostRatioBCR: 2.65,
    farmgateSwitchingValuePriceDropPct: -34.0,
    costSwitchingValueCostRisePct: +52.0,
    paybackPeriodYears: 3.2,
    verifiedFieldReference: 'IFAD High Value Agriculture Project (HVAP) Impact Evaluation 2019',
  },
  {
    commodity: 'High-Density Mountain Apple',
    sourceProject: 'World Bank REED (Rural Enterprise & Economic Development)',
    agroDomain: 'High Mountains (Mustang, Jumla, Manang)',
    economicInternalRateOfReturnEIRR: 24.8,
    financialNPVNpr: 512000,
    discountRatePct: 12.0,
    benefitCostRatioBCR: 2.25,
    farmgateSwitchingValuePriceDropPct: -25.0,
    costSwitchingValueCostRisePct: +35.0,
    paybackPeriodYears: 3.8,
    verifiedFieldReference: 'World Bank Nepal REED Horticulture Value Chain Appraisal 2021',
  },
];

export function getBenchmarkByCrop(cropName: string): NepalProjectFinancialBenchmark {
  const norm = cropName.toLowerCase();
  const found = NEPAL_FINANCIAL_BENCHMARKS.find(b => {
    const c = b.commodity.toLowerCase();
    return norm.includes(c) || c.includes(norm) || (norm.includes('rice') && c.includes('paddy'));
  });
  return found || NEPAL_FINANCIAL_BENCHMARKS[0];
}
