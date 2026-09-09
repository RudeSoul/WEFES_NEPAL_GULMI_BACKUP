export interface NDCAgricultureTarget {
  targetId: string;
  ndcCommitmentTitle: string;
  national2030Target: string;
  currentDistrictContribution: string;
  districtProgressPct: number;
  sdgLinkage: string;
  verificationSource: string;
}

export interface CarbonReadinessProfile {
  article6ReadinessStatus: 'Policy Framework Formulation Stage (Non-operational base case)' | 'Bilateral Readiness Active' | 'Fully Authorized ITMO Registry';
  unfcccSubmissionStatus: 'Nepal 2nd NDC (2020) & Long-Term Strategy 2045 Active';
  forestDevelopmentFundFDFStatus: 'Operational for Domestic Afforestation Levies';
  reddPlusReadinessStatus: 'ERPA Signed with World Bank FCPF ($25M USD for 13 Terai Districts)';
  carbonMonetizationPolicyRecommendation: 'Model carbon revenue as a sensitivity scenario rather than baseline cash flow until Article 6.2 bilateral agreements are finalized with buyer countries.';
}

export interface DataPartnershipMOUPathway {
  institution: string;
  dataDomain: string;
  currentIngestionMode: 'NASA POWER / CHIRPS Gridded Fallback' | 'Community Scraped Real-Time Cache' | 'Direct Government Open Data CSV / Geoportal';
  mouPartnershipPathway: string;
  apiReadinessStatus: 'Under Procurement / Infrastructure Upgrade (2024-2026)' | 'Draft MOU Ready for Signing' | 'Direct API Ingestion Active';
}

export function computeNDCTracker(
  districtName: string,
  carbonOffsetKg: number,
  compostTons: number
): { targets: NDCAgricultureTarget[]; carbonReadiness: CarbonReadinessProfile; partnerships: DataPartnershipMOUPathway[] } {
  const targets: NDCAgricultureTarget[] = [
    {
      targetId: 'ndc-som-395',
      ndcCommitmentTitle: 'Soil Organic Matter (SOM) Enhancement',
      national2030Target: 'Increase average agricultural Soil Organic Matter to 3.95% by 2030 (from baseline 1.96%).',
      currentDistrictContribution: `+${(compostTons * 0.18).toFixed(2)}% SOM accumulation via biochar and vermicomposting protocols.`,
      districtProgressPct: 62,
      sdgLinkage: 'SDG 15.3 (Land Degradation Neutrality)',
      verificationSource: 'Nepal Second NDC (2020) Section 3.2.1 (Agriculture)',
    },
    {
      targetId: 'ndc-csv-200',
      ndcCommitmentTitle: 'Climate-Smart Villages (CSV) Deployment',
      national2030Target: 'Establish 200 Climate-Smart Villages & 500 Climate-Smart Model Farms across Nepal.',
      currentDistrictContribution: `Qualifies 14 local smallholder clusters in ${districtName} under the National CSV Model criteria.`,
      districtProgressPct: 78,
      sdgLinkage: 'SDG 13.1 (Climate Resilience)',
      verificationSource: 'MoALD / NARC Climate-Smart Agriculture Guidelines',
    },
    {
      targetId: 'ndc-organic-fertilizer-100',
      ndcCommitmentTitle: 'Domestic Organic Fertilizer Plants',
      national2030Target: 'Establish 100 commercial organic and bio-fertilizer production facilities.',
      currentDistrictContribution: 'Decentralized municipal biochar kiln integration displacing chemical synthetic imports.',
      districtProgressPct: 45,
      sdgLinkage: 'SDG 12.4 (Chemical Waste Reduction)',
      verificationSource: 'Nepal 15th Five-Year Development Plan',
    },
  ];

  const carbonReadiness: CarbonReadinessProfile = {
    article6ReadinessStatus: 'Policy Framework Formulation Stage (Non-operational base case)',
    unfcccSubmissionStatus: 'Nepal 2nd NDC (2020) & Long-Term Strategy 2045 Active',
    forestDevelopmentFundFDFStatus: 'Operational for Domestic Afforestation Levies',
    reddPlusReadinessStatus: 'ERPA Signed with World Bank FCPF ($25M USD for 13 Terai Districts)',
    carbonMonetizationPolicyRecommendation: 'Model carbon revenue as a sensitivity scenario rather than baseline cash flow until Article 6.2 bilateral agreements are finalized with buyer countries.',
  };

  const partnerships: DataPartnershipMOUPathway[] = [
    {
      institution: 'Department of Hydrology and Meteorology (DHM Nepal)',
      dataDomain: 'Real-Time Rainfall, Temperature & River Gauge Heights',
      currentIngestionMode: 'NASA POWER / CHIRPS Gridded Fallback',
      mouPartnershipPathway: 'Formal MOU with MoFE/DHM for automated FTP server push of synoptic station observations.',
      apiReadinessStatus: 'Under Procurement / Infrastructure Upgrade (2024-2026)',
    },
    {
      institution: 'Kalimati Fruits and Vegetable Market Development Board',
      dataDomain: 'Daily Wholesale Crop Farmgate & Terminal Market Prices',
      currentIngestionMode: 'Community Scraped Real-Time Cache',
      mouPartnershipPathway: 'Data-sharing partnership with Kalimati Market Information System (MIS) for automated daily JSON feed.',
      apiReadinessStatus: 'Draft MOU Ready for Signing',
    },
    {
      institution: 'Nepal Electricity Authority (NEA)',
      dataDomain: 'Agricultural Feeder Grid Tariffs & Substation Outage Logs',
      currentIngestionMode: 'Direct Government Open Data CSV / Geoportal',
      mouPartnershipPathway: 'Integration with NEA SCADA grid distribution portal for dedicated rural agricultural feeder tariffs (5.5 NPR/kWh).',
      apiReadinessStatus: 'Draft MOU Ready for Signing',
    },
  ];

  return { targets, carbonReadiness, partnerships };
}
