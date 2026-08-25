import React, { useState, useMemo } from 'react';
import { WEFESOutput } from '@wefes/shared-types';
import {
  computeDeepNexusAnalysis, simulateSensitivity, computePortfolioMix,
  DistrictBenchmarkItem, CropCalendarMonth
} from '@wefes/wefes-engine';
import { getVarietiesByCrop, NARC_VARIETAL_DATABASE } from '@wefes/wefes-engine';
import { computeSiteSpecificFertilizer } from '@wefes/wefes-engine';
import { computePostHarvestLoss, NEPAL_COLD_STORAGE_REGISTRY } from '@wefes/wefes-engine';
import { computeNexusReadiness } from '@wefes/wefes-engine';
import { computeSentinelCropHealth } from '@wefes/wefes-engine';
import { computePestSurveillance } from '@wefes/wefes-engine';
import { getBenchmarkByCrop, NEPAL_FINANCIAL_BENCHMARKS } from '@wefes/wefes-engine';
import { computeGenderAndMunicipalBudget } from '@wefes/wefes-engine';
import { computeNDCTracker } from '@wefes/wefes-engine';
import { DATA_INTEGRITY_MATRIX } from '@wefes/wefes-engine';
import { computeAquaCropSimulation } from '@wefes/wefes-engine';
import {
  computeMultiSpeciesLivestockBioeconomy,
  NEPAL_LIVESTOCK_DATABASE,
  LivestockSpeciesType,
  MultiSpeciesHerdConfig
} from '@wefes/wefes-engine';
import { computeAquacultureModel } from '@wefes/wefes-engine';
import { computeGroundwaterConjunctiveModel } from '@wefes/wefes-engine';
import { computeHeatStressRisk } from '@wefes/wefes-engine';
import { computeBioenergyModel } from '@wefes/wefes-engine';
import { computeExportTraceability } from '@wefes/wefes-engine';
import { computeDevelopmentPartnerAlignment } from '@wefes/wefes-engine';
import { computeAgronomicStandards } from '@wefes/wefes-engine';
import { CircularBioeconomyCockpit } from './CircularBioeconomyCockpit';
import { CircularSankeyFlow } from '../../components/charts/CircularSankeyFlow';
import { DonorNetworkGraph } from '../../components/charts/DonorNetworkGraph';
import { SunburstWaterCarbon } from '../../components/charts/SunburstWaterCarbon';
import { PhenologyTimelineChart } from '../../components/charts/PhenologyTimelineChart';
import { FinancialDcfChart } from '../../components/charts/FinancialDcfChart';
import { NexusRadarSpider } from '../../components/charts/NexusRadarSpider';
import { QueftsNutrientGauge } from '../../components/charts/QueftsNutrientGauge';
import { PalikaFertilizerCockpit } from './PalikaFertilizerCockpit';
import { AquacultureMetricsChart } from '../../components/charts/AquacultureMetricsChart';
import { SentinelNdviChart } from '../../components/charts/SentinelNdviChart';
import { HeatStressThermalChart } from '../../components/charts/HeatStressThermalChart';
import {
  Scale, Sparkles, TrendingUp, AlertTriangle, CheckCircle2,
  Info, Cpu, Trees, Zap, Sprout, Droplets, Coins, Users,
  Mountain, ArrowUpRight, Layers, HelpCircle, ShieldAlert,
  SlidersHorizontal, Lightbulb, Compass, Award, FlaskConical,
  ArrowRight, RefreshCw, Printer, FileText, Target, ShieldCheck,
  Activity, BarChart3, Waves, Globe2, ChevronRight, HeartHandshake,
  ThermometerSnowflake, Shield, DollarSign, ArrowLeft, ArrowUp, Calendar,
  PieChart, Building2, Landmark, Check, Satellite, Banknote, LineChart,
  Truck, Bug, Sparkle, ExternalLink, ShieldQuestion, HelpCircle as HelpIcon,
  Flame, Fish, Milk, MapPin, Gauge
} from 'lucide-react';

interface ScientificDossierScreenProps {
  output: WEFESOutput;
  onBackToAnalysis: () => void;
  onBackToDistrict: () => void;
  onBackToMap: () => void;
  onOpenSimulator: () => void;
  onOpenResearchSandbox?: () => void;
}

type MasterDomainType =
  | 'climate_finance'
  | 'precision_agronomy'
  | 'value_chain_satellite'
  | 'policy_gesi_pad';

interface SubModuleItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
}

const DOMAIN_SUBMODULES: Record<MasterDomainType, SubModuleItem[]> = {
  precision_agronomy: [
    { id: 'narc_varieties', title: 'NARC Varietal Registry', subtitle: 'Registered varieties & PoP', icon: '🌱', badge: 'NARC' },
    { id: 'aquacrop_engine', title: 'AquaCrop-RS Process Model', subtitle: 'Daily soil-water transpiration', icon: '💧', badge: 'FAO' },
    { id: 'livestock_dairy', title: 'Livestock & Bioeconomy', subtitle: '5 Species · Biogas · Soil NPK', icon: '🐄', badge: 'DLS' },
    { id: 'fisheries_aqua', title: 'Aquaculture Super-Zone', subtitle: 'Polycarp ponds & FCR model', icon: '🐟', badge: 'DoFD' },
    { id: 'quefts_fertilizer', title: 'Palika Fertilizer & Logistics', subtitle: 'MoALD 2023 · Freight · Forex · Bio-Slurry', icon: '🧪', badge: 'MoALD' },
    { id: 'agronomic_standards', title: 'International Standards', subtitle: 'Hoekstra WF & Hall EROI', icon: '📊', badge: 'Global' },
    { id: 'calendar', title: '12-Month Agro-Calendar', subtitle: 'Water balance by Bikram Sambat', icon: '📅', badge: 'DHM' },
  ],
  value_chain_satellite: [
    { id: 'groundwater_terai', title: 'Conjunctive Groundwater', subtitle: 'Tubewell grid & recharge ponds', icon: '🌊', badge: 'WECS' },
    { id: 'heat_stress_calendar', title: 'Terminal Heat Limits', subtitle: 'Reproductive thresholds & shift', icon: '🌡️', badge: 'NARC' },
    { id: 'post_harvest', title: 'Cold Storage & Losses', subtitle: 'Hermetic bags & evaporative cooling', icon: '🚚', badge: 'PMAMP' },
    { id: 'sentinel_health', title: 'Sentinel-2 Satellite', subtitle: '10m NDVI & 3D CNN forecast', icon: '🛰️', badge: 'ESA' },
    { id: 'pest_early_warning', title: 'Biophysical Pest Warning', subtitle: 'FAW, blast & IPM alerts', icon: '🐛', badge: 'DLIS' },
  ],
  climate_finance: [
    { id: 'nexus_readiness', title: 'Pre-Submission Readiness', subtitle: '7-Criteria JRC/EC Go/No-Go Gate', icon: '🚦', badge: 'GCF-SAP' },
    { id: 'wefe_composite', title: 'WEFE 8-Composite Rating', subtitle: 'Standardized Funder Rubric (0–100)', icon: '⭐', badge: 'OECD-DAC' },
    { id: 'gcf_pipeline', title: 'GCF & World Bank REED', subtitle: 'Commercial corridor benchmarks', icon: '🏛️', badge: 'WB' },
    { id: 'circular_bioenergy', title: 'AEPC Biogas Digesters', subtitle: 'LPG replacement & bio-slurry', icon: '⚡', badge: 'AEPC' },
    { id: 'export_gap_traceability', title: 'Export GAP & Traceability', subtitle: 'WTO Phytosanitary & QR logs', icon: '📦', badge: 'MoICS' },
    { id: 'parametric_insurance', title: 'Parametric Insurance', subtitle: 'Rainfall deficit & automated payout', icon: '🛰️', badge: 'NDRRMA' },
    { id: 'bank_credit', title: 'Bank Underwriting (NRB 15%)', subtitle: 'ADBL commercial facility', icon: '🏦', badge: 'NRB' },
  ],
  policy_gesi_pad: [
    { id: 'donor_project_map', title: 'Development Partner Alignment', subtitle: 'WB, ADB, USAID & GIZ active grants', icon: '🗺️', badge: 'IECCD' },
    { id: 'gender_budget', title: 'Gender & Municipal Budget', subtitle: '68% Female labor & Palika earmarks', icon: '👩‍🌾', badge: 'MoFAGA' },
    { id: 'ndc_tracker', title: 'Sovereign NDC 2030 Tracker', subtitle: 'Mitigation targets & progress', icon: '🎯', badge: 'MoFE' },
    { id: 'data_integrity', title: 'Data Integrity Matrix', subtitle: 'Audit roadmap & sovereign actions', icon: '🛡️', badge: 'NPC' },
    { id: 'sovereign_pad', title: 'Official Sovereign PAD Brief', subtitle: '1-Click World Bank executive brief', icon: '📑', badge: 'MoF' },
  ],
};

export const ScientificDossierScreen: React.FC<ScientificDossierScreenProps> = ({
  output,
  onBackToAnalysis,
  onBackToDistrict,
  onBackToMap,
  onOpenSimulator,
  onOpenResearchSandbox,
}) => {
  const [activeDomain, setActiveDomain] = useState<MasterDomainType>('precision_agronomy');
  const [subTab, setSubTab] = useState<string>('narc_varieties');
  const [showCircularCockpit, setShowCircularCockpit] = useState<boolean>(false);
  const [studyViewMode, setStudyViewMode] = useState<'synchronized' | 'visual_only' | 'empirical_only'>('synchronized');

  // Live Sensitivity Sliders State
  const [rainfallShift, setRainfallShift] = useState<number>(0);
  const [wageShift, setWageShift] = useState<number>(0);
  const [tariffShift, setTariffShift] = useState<number>(0);
  const [solarShift, setSolarShift] = useState<number>(0);

  // Multi-Crop Portfolio Blender State
  const [primaryPct, setPrimaryPct] = useState<number>(60);
  const [secondaryPct, setSecondaryPct] = useState<number>(25);
  const [tertiaryPct, setTertiaryPct] = useState<number>(15);

  const deep = useMemo(() => computeDeepNexusAnalysis(output), [output]);
  const {
    pillarScores, shannonEntropy, shannonH, giniIndex, synergies, tradeoffs,
    couplingMatrix, interventions, naturalCapital, sdgAlignments, basinCascade,
    ipccVulnerability, rusle, springshed, gesi, phenology, importSubstitution,
    gcfInvestment, parametricInsurance, bankCredit, carbonArticle6,
    benchmarks, cropCalendar, governance, systemicState, wefCompositeScore
  } = deep;

  const readiness = useMemo(() => computeNexusReadiness(deep, output.districtName, deep.agroSuitability), [deep, output.districtName]);

  // Round 1 Empirical Engines
  const narcVarieties = useMemo(() => getVarietiesByCrop(output.cropName), [output.cropName]);
  const selectedVarieties = narcVarieties.length > 0 ? narcVarieties : NARC_VARIETAL_DATABASE.slice(0, 3);

  const fertilizerPrescription = useMemo(() => {
    return computeSiteSpecificFertilizer(output.districtName, output.cropName, 6.2, 'Sandy Loam', output.food.yieldKg / 1000);
  }, [output]);

  const postHarvest = useMemo(() => {
    return computePostHarvestLoss(output.districtName, output.cropName, output.food.yieldKg, output.socioeconomics.grossRevenueNpr);
  }, [output]);

  const sentinel = useMemo(() => {
    return computeSentinelCropHealth(output.districtName, output.cropName, output.water.waterStressIndex, output.food.yieldKg / 1000);
  }, [output]);

  const pestAlerts = useMemo(() => {
    return computePestSurveillance(
      output.districtName,
      output.cropName,
      phenology.growingDegreeDays,
      output.water.waterStressIndex,
      6.2,
      'Sandy Loam'
    );
  }, [output, phenology.growingDegreeDays]);

  const investmentBenchmark = useMemo(() => {
    return getBenchmarkByCrop(output.cropName);
  }, [output.cropName]);

  const { gender: genderPlan, budget: municipalBudget } = useMemo(() => {
    return computeGenderAndMunicipalBudget(output.districtName, output.cropName, output.socioeconomics.laborDays);
  }, [output]);

  const { targets: ndcTargets, carbonReadiness, partnerships } = useMemo(() => {
    return computeNDCTracker(output.districtName, output.ecosystem.carbonOffsetKgCo2, fertilizerPrescription.organicCompostTonPerHa);
  }, [output, fertilizerPrescription]);

  // Round 2 Complete Bioeconomy Engines
  const aquaCrop = useMemo(() => {
    return computeAquaCropSimulation(output.districtName, output.cropName, 1450, output.water.waterStressIndex, output.food.yieldKg / 1000);
  }, [output]);

  // Multi-Species Livestock State & Computation
  const [selectedLivestockSpecies, setSelectedLivestockSpecies] = useState<LivestockSpeciesType>('buffalo');
  const [livestockHerdConfig, setLivestockHerdConfig] = useState<MultiSpeciesHerdConfig>({
    buffaloHeads: 2,
    cattleHeads: 1,
    goatHeads: 6,
    poultryHeads: 50,
    swineHeads: 0,
  });

  const multiSpeciesLivestock = useMemo(() => {
    return computeMultiSpeciesLivestockBioeconomy(output.districtName, livestockHerdConfig);
  }, [output.districtName, livestockHerdConfig]);

  const aquaculture = useMemo(() => {
    return computeAquacultureModel(output.districtName, 1.0);
  }, [output.districtName]);

  const groundwater = useMemo(() => {
    return computeGroundwaterConjunctiveModel(output.districtName);
  }, [output.districtName]);

  const heatStress = useMemo(() => {
    return computeHeatStressRisk(output.districtName, output.cropName);
  }, [output.districtName, output.cropName]);

  const bioenergy = useMemo(() => {
    return computeBioenergyModel(output.districtName, 3);
  }, [output.districtName]);

  const exportTrace = useMemo(() => {
    return computeExportTraceability(output.districtName, output.cropName, output.food.yieldKg, output.socioeconomics.grossRevenueNpr);
  }, [output]);

  const donorAlignment = useMemo(() => {
    return computeDevelopmentPartnerAlignment(output.districtName);
  }, [output.districtName]);

  const agronomicStandards = useMemo(() => {
    return computeAgronomicStandards(
      output.districtName,
      output.cropName,
      output.food.yieldKg,
      Math.round(output.water.consumptionM3 / 10),
      620,
      fertilizerPrescription.nitrogenKgPerHa,
      fertilizerPrescription.phosphorusP2O5KgPerHa,
      fertilizerPrescription.potassiumK2OKgPerHa
    );
  }, [output, fertilizerPrescription]);

  const sensitivityResult = useMemo(() => {
    return simulateSensitivity(output, {
      rainfallShiftPct: rainfallShift,
      wageShiftPct: wageShift,
      tariffShiftPct: tariffShift,
      solarAdoptionShiftPct: solarShift,
    });
  }, [output, rainfallShift, wageShift, tariffShift, solarShift]);

  const portfolioResult = useMemo(() => {
    return computePortfolioMix(output, {
      primaryPct,
      secondaryPct,
      tertiaryPct,
    });
  }, [output, primaryPct, secondaryPct, tertiaryPct]);

  const handleDomainChange = (domain: MasterDomainType) => {
    setActiveDomain(domain);
    if (domain === 'precision_agronomy') setSubTab('narc_varieties');
    else if (domain === 'value_chain_satellite') setSubTab('groundwater_terai');
    else if (domain === 'climate_finance') setSubTab('circular_bioenergy');
    else if (domain === 'policy_gesi_pad') setSubTab('donor_project_map');
  };

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">

      {/* Top Header & Breadcrumb Nav Card */}
      <div className="p-6 sm:p-7 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-4">
        {/* Quick Breadcrumb Back Links */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button
            onClick={onBackToAnalysis}
            className="text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Analysis Report</span>
          </button>
          <span className="text-slate-300">/</span>
          <button
            onClick={onBackToDistrict}
            className="text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-semibold transition-colors cursor-pointer"
          >
            {output.districtName} District
          </button>
          <span className="text-slate-300">/</span>
          <button
            onClick={onBackToMap}
            className="text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-semibold transition-colors cursor-pointer"
          >
            National Map
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pt-1">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 font-mono text-[11px] font-bold">
                <Scale className="w-3.5 h-3.5 text-emerald-700" />
                SOVEREIGN BIOECONOMY INTELLIGENCE
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-[11px] font-mono text-slate-500">
                NARC · AquaCrop · DLS Livestock · World Bank REED · AEPC
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight font-outfit">
              {output.cropName} in {output.districtName} District
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              Integrated multi-species livestock, 12-month phenology calendar, conjunctive groundwater modeling, AEPC bioenergy & sovereign bankability dossier.
            </p>
          </div>

          {/* Top Action Buttons & Nexus Balance Badge */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            <button
              onClick={handlePrintDossier}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Sovereign PAD</span>
            </button>

            <button
              onClick={onOpenSimulator}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer font-outfit"
            >
              <Activity className="w-4 h-4" />
              <span>Scenario Simulator ↗</span>
            </button>

            {onOpenResearchSandbox && (
              <button
                onClick={onOpenResearchSandbox}
                className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer font-outfit"
                title="Open Research & Formula Modeling Sandbox (Version 2.0 Preview)"
              >
                <FlaskConical className="w-4 h-4 text-purple-700" />
                <span>Formula Sandbox</span>
                <span className="text-[9px] font-mono bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded">v2.0</span>
              </button>
            )}

            <div className="flex items-center gap-3 bg-emerald-50 p-2.5 px-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
              <div className="text-right">
                <span className="text-[9px] text-emerald-800 font-bold uppercase tracking-wider block font-mono">Nexus Score</span>
                <div className="text-xs font-bold text-emerald-950 font-outfit">{output.nexusRating}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center font-extrabold text-lg text-white font-outfit shadow-2xs">
                {output.nexusBalanceIndex}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          THE 4 EXECUTIVE MASTER DOMAIN CARDS (HIGH-LEVEL NAVIGATION)
         ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Domain 1: Precision Agronomy, Livestock & Aqua */}
        <button
          onClick={() => handleDomainChange('precision_agronomy')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden shadow-2xs ${activeDomain === 'precision_agronomy'
              ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/50 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200">
              AquaCrop + Dairy
            </span>
          </div>
          <h4 className="font-bold text-sm text-slate-900 font-outfit mt-2.5">1. Agronomy, Dairy & Fisheries</h4>
          <p className="text-[11px] text-slate-500 font-sans mt-0.5 leading-snug">
            NARC varietals, AquaCrop-RS process model, Buffalo/Dairy nexus & Dhanusha aquaculture.
          </p>
        </button>

        {/* Domain 2: Conjunctive Water & Satellites */}
        <button
          onClick={() => handleDomainChange('value_chain_satellite')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden shadow-2xs ${activeDomain === 'value_chain_satellite'
              ? 'bg-sky-50/90 border-sky-400 ring-2 ring-sky-400/50 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700">
              <Waves className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 border border-sky-200">
              Groundwater + Heat
            </span>
          </div>
          <h4 className="font-bold text-sm text-slate-900 font-outfit mt-2.5">2. Water Security & Satellites</h4>
          <p className="text-[11px] text-slate-500 font-sans mt-0.5 leading-snug">
            Terai tubewell crisis & ADB recharge ponds, terminal heat limits, cold chain & Sentinel-2.
          </p>
        </button>

        {/* Domain 3: Bioenergy, Bankability & Market Access */}
        <button
          onClick={() => handleDomainChange('climate_finance')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden shadow-2xs ${activeDomain === 'climate_finance'
              ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/50 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
              <Flame className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-200">
              AEPC Biogas + REED
            </span>
          </div>
          <h4 className="font-bold text-sm text-slate-900 font-outfit mt-2.5">3. Bioenergy & Bankability</h4>
          <p className="text-[11px] text-slate-500 font-sans mt-0.5 leading-snug">
            AEPC biogas slurry substitution, organic GAP export traceability & World Bank REED EIRR.
          </p>
        </button>

        {/* Domain 4: Policy, Donor Map & Sovereign PAD */}
        <button
          onClick={() => handleDomainChange('policy_gesi_pad')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden shadow-2xs ${activeDomain === 'policy_gesi_pad'
              ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/50 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
              <Landmark className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
              Donor Map + Integrity
            </span>
          </div>
          <h4 className="font-bold text-sm text-slate-900 font-outfit mt-2.5">4. Policy, Donors & Sovereign PAD</h4>
          <p className="text-[11px] text-slate-500 font-sans mt-0.5 leading-snug">
            Active multilateral donor map (ADB/WB/USAID), gender planner, SuTRA & 1-click PAD.
          </p>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          INTERACTIVE CIRCULAR BIOECONOMY SIMULATOR & 15-YEAR DCF COCKPIT
         ═══════════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <div
          onClick={() => setShowCircularCockpit(!showCircularCockpit)}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${showCircularCockpit
              ? 'bg-emerald-900 text-white border-emerald-800 shadow-sm'
              : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 text-slate-800 border-emerald-300 hover:border-emerald-400 hover:shadow-2xs'
            }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${showCircularCockpit ? 'bg-emerald-700 text-emerald-200' : 'bg-emerald-600 text-white shadow-2xs'
              }`}>
              <RefreshCw className={`w-4 h-4 ${showCircularCockpit ? 'animate-spin-slow' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm font-outfit">
                  {showCircularCockpit ? 'Circular Bioeconomy Cockpit Active (5 Enterprise Levers)' : 'Interactive Circular Bioeconomy Simulator & 15-Year DCF'}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${showCircularCockpit ? 'bg-emerald-800 text-emerald-200 border border-emerald-700' : 'bg-emerald-200 text-emerald-950 border border-emerald-300'
                  }`}>
                  Live Sliders & Matrix
                </span>
              </div>
              <p className={`text-[11px] font-sans ${showCircularCockpit ? 'text-emerald-200' : 'text-slate-500'}`}>
                Crop land · Dairy herd · Aquaculture · AEPC Biogas · 50m² Recharge pond · 15-Year bankable DCF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-bold font-outfit px-3 py-1.5 rounded-xl border ${showCircularCockpit
                ? 'bg-emerald-800 text-emerald-100 border-emerald-700 hover:bg-emerald-700'
                : 'bg-white text-emerald-900 border-emerald-300 shadow-2xs hover:bg-emerald-50'
              }`}>
              {showCircularCockpit ? 'Collapse Cockpit ▴' : 'Open Simulator & DCF ▾'}
            </span>
          </div>
        </div>

        {showCircularCockpit && (
          <div className="animate-fade-in-up">
            <CircularBioeconomyCockpit
              districtName={output.districtName}
              cropName={output.cropName}
            />
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          RESPONSIVE SUB-MODULE SELECTOR TILES (WRAPS CLEANLY)
         ═══════════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-outfit text-slate-800 uppercase tracking-wide">
              {activeDomain === 'precision_agronomy' && '🌾 Bioeconomy Sub-Modules'}
              {activeDomain === 'value_chain_satellite' && '💧 Water & Climate Sub-Modules'}
              {activeDomain === 'climate_finance' && '⚡ Energy & Finance Sub-Modules'}
              {activeDomain === 'policy_gesi_pad' && '🏛️ Governance & Sovereign PAD Sub-Modules'}
            </span>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
              {DOMAIN_SUBMODULES[activeDomain].length} Modules Active
            </span>
          </div>
        </div>

        {/* Responsive Wrap Grid: Auto-fills 2 to 4 to 7 columns depending on screen width */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 items-stretch">
          {DOMAIN_SUBMODULES[activeDomain].map((m) => {
            const isSelected = subTab === m.id;

            let activeCard = 'bg-emerald-50/95 border-emerald-400 ring-2 ring-emerald-400/50 shadow-xs text-slate-900';
            let activeSubtitle = 'text-emerald-800 font-medium';
            let activeBadge = 'bg-emerald-100 text-emerald-950 border-emerald-300 font-bold';
            let activeIndicator = 'bg-emerald-600';

            if (activeDomain === 'value_chain_satellite') {
              activeCard = 'bg-sky-50/95 border-sky-400 ring-2 ring-sky-400/50 shadow-xs text-slate-900';
              activeSubtitle = 'text-sky-800 font-medium';
              activeBadge = 'bg-sky-100 text-sky-950 border-sky-300 font-bold';
              activeIndicator = 'bg-sky-600';
            } else if (activeDomain === 'climate_finance') {
              activeCard = 'bg-blue-50/95 border-blue-400 ring-2 ring-blue-400/50 shadow-xs text-slate-900';
              activeSubtitle = 'text-blue-800 font-medium';
              activeBadge = 'bg-blue-100 text-blue-950 border-blue-300 font-bold';
              activeIndicator = 'bg-blue-600';
            } else if (activeDomain === 'policy_gesi_pad') {
              activeCard = 'bg-amber-50/95 border-amber-400 ring-2 ring-amber-400/50 shadow-xs text-slate-900';
              activeSubtitle = 'text-amber-800 font-medium';
              activeBadge = 'bg-amber-100 text-amber-950 border-amber-300 font-bold';
              activeIndicator = 'bg-amber-600';
            }

            return (
              <button
                key={m.id}
                onClick={() => setSubTab(m.id)}
                className={`p-3 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between border relative overflow-hidden min-h-[108px] ${isSelected
                    ? activeCard
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                  }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-xl">{m.icon}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${isSelected ? activeBadge : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                    {m.badge}
                  </span>
                </div>
                <div className="mt-2 flex-1 flex flex-col justify-start">
                  <div className="text-xs font-bold font-outfit leading-snug">{m.title}</div>
                  <div className={`text-[10px] font-sans leading-tight mt-1 ${isSelected ? activeSubtitle : 'text-slate-500'}`}>
                    {m.subtitle}
                  </div>
                </div>
                {/* Active Indicator Bar */}
                {isSelected && (
                  <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 rounded-t-full ${activeIndicator}`}></div>
                )}
              </button>
            );
          })}
        </div>

        {/* 100% Full-Width Active Viewport Canvas */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          {/* Executive Study Mode Switcher Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-outfit text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-700" />
                Study Mode:
              </span>
              <span className="text-[11px] text-slate-500 font-sans">
                Choose your preferred view :: interactive visual diagrams, full empirical dossier, or both synchronized
              </span>
            </div>

            <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs text-xs font-outfit self-start md:self-auto">
              <button
                onClick={() => setStudyViewMode('synchronized')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${studyViewMode === 'synchronized'
                    ? 'bg-emerald-800 text-white shadow-2xs ring-2 ring-emerald-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                <span>🔄 Synchronized</span>
              </button>
              <button
                onClick={() => setStudyViewMode('visual_only')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${studyViewMode === 'visual_only'
                    ? 'bg-emerald-800 text-white shadow-2xs ring-2 ring-emerald-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                <span>👁️ Visual Diagrams</span>
              </button>
              <button
                onClick={() => setStudyViewMode('empirical_only')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${studyViewMode === 'empirical_only'
                    ? 'bg-emerald-800 text-white shadow-2xs ring-2 ring-emerald-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                <span>📑 Scientific Dossier</span>
              </button>
            </div>
          </div>

          {/* Active Sub-Module Views */}

          {/* ═══════════════════════════════════════════════════════════════
          DOMAIN 1: AGRONOMY, DAIRY & FISHERIES VIEWS
         ═══════════════════════════════════════════════════════════════ */}
          {activeDomain === 'precision_agronomy' && subTab === 'narc_varieties' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="Verified NARC/WB Empirical"
                source="NARC National Seed Board Registry (1999–2025)"
                limitation="Varietal availability subject to local NSC (National Seed Company) and agro-vet inventory cycles."
                recommendation="Local Palikas should establish community seed banks to store breeder and foundation seeds locally."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedVarieties.map((v) => (
                  <div key={v.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
                    <div className="flex items-start justify-between border-b pb-2.5">
                      <div>
                        <h4 className="font-bold text-base text-slate-900 font-outfit">{v.name}</h4>
                        <span className="text-xs font-mono text-slate-500">Released in {v.releaseYear} • Pedigree: {v.pedigreeLineage}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                        {v.commodity}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="text-[10px] text-slate-500 font-sans">Maturity</div>
                        <div className="font-bold text-slate-900 mt-0.5">{v.maturityDays} Days</div>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="text-[10px] text-slate-500 font-sans">Potential Yield</div>
                        <div className="font-bold text-emerald-700 mt-0.5">{v.potentialYieldTonPerHa} t/ha</div>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="text-[10px] text-slate-500 font-sans">Optimal Altitude</div>
                        <div className="font-bold text-blue-700 mt-0.5 text-[11px] truncate">{v.optimalAltitudeRange}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {v.specialTraits.map((t, idx) => (
                        <span key={idx} className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-md font-sans">
                          ✓ {t}
                        </span>
                      ))}
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                      <div className="font-bold text-slate-700 font-sans text-[11px]">Disease & Pest Vector Resistance:</div>
                      <div className="space-y-1">
                        {v.diseasePestResistance.map((d, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px] font-mono">
                            <span className="text-slate-600">{d.vector}</span>
                            <span className={`px-2 py-0.2 rounded font-bold text-[10px] ${d.resistanceLevel === 'High Resistance'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                              }`}>
                              {d.resistanceLevel}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 font-sans flex items-center justify-between pt-1">
                      <span>Source: <strong>{v.seedSourceContact}</strong></span>
                      <a
                        href={v.packageOfPracticesUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-0.5"
                      >
                        <span>Download PoP</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeDomain === 'precision_agronomy' && subTab === 'aquacrop_engine' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="Verified NARC/WB Empirical"
                source="FAO AquaCrop-RS Process Model & CGIAR/Elsevier Nepal Validations (2026)"
                limitation="Simulates daily soil-water-atmosphere transpiration partitioning rather than a static statistical multiplier."
                recommendation="NARC and MoALD should adopt AquaCrop-RS as the national crop forecasting engine for real-time food balance sheet monitoring."
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs text-center">
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="text-slate-500 font-sans text-xs">Normalized Water Productivity (WP*)</div>
                  <div className="text-2xl font-extrabold text-emerald-700 mt-1">{aquaCrop.normalizedWaterProductivityGPerM2} <span className="text-xs font-normal text-slate-500">g/m²</span></div>
                  <div className="text-[10px] text-slate-400 font-sans">{aquaCrop.cropTypeC3C4}</div>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="text-slate-500 font-sans text-xs">Actual Transpiration (Tr)</div>
                  <div className="text-2xl font-extrabold text-blue-700 mt-1">{aquaCrop.actualCropTranspirationTrMm} <span className="text-xs font-normal text-slate-500">mm</span></div>
                  <div className="text-[10px] text-slate-400 font-sans">Evaporative Loss: {aquaCrop.soilEvaporationLossEMm} mm</div>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="text-slate-500 font-sans text-xs">Simulated Biomass</div>
                  <div className="text-2xl font-extrabold text-purple-700 mt-1">{(aquaCrop.simulatedBiomassKgPerHa / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-500">t/ha</span></div>
                  <div className="text-[10px] text-slate-400 font-sans">Harvest Index (HI₀): {aquaCrop.harvestIndexPct}%</div>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="text-slate-500 font-sans text-xs">Simulated Grain Yield</div>
                  <div className="text-2xl font-extrabold text-emerald-800 mt-1">{(aquaCrop.simulatedGrainYieldKgPerHa / 1000).toFixed(2)} <span className="text-xs font-normal text-slate-500">t/ha</span></div>
                  <div className="text-[10px] text-emerald-700 font-sans">Water Stress Ks: {aquaCrop.waterStressAdjustmentKs}</div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-sm text-slate-900 font-outfit">AquaCrop Daily Root Zone Depletion & Mid-Season Yield Warning</span>
                  <span className="text-xs font-mono font-bold text-slate-700">{aquaCrop.dailyDepletionStatus}</span>
                </div>
                <p className="text-xs text-slate-600 font-sans leading-relaxed">
                  <strong>Process-Based Recommendation:</strong> {aquaCrop.midSeasonFailureWarning.recommendedMitigation}
                </p>
              </div>
            </div>
          )}

          {activeDomain === 'precision_agronomy' && subTab === 'livestock_dairy' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="Verified NARC/WB Empirical"
                source="MoALD Department of Livestock Services (DLS 2024), NARC Animal Science Research Institute & IPCC Tier-2 Nepal Inventory"
                limitation="Livestock represents 27% of Nepal Agricultural GDP; smallholders manage mixed herds, yet dairy, small ruminants, and poultry are rarely integrated into unified WEFES bioeconomy plans."
                recommendation="Deploy community solar milk chilling centers (MCC), GESI goat breeding groups, and closed AEPC biogas digesters to monetize bio-slurry and cut chemical fertilizer imports."
              />

              {/* Visual Sankey Diagram if not empirical_only */}
              {studyViewMode !== 'empirical_only' && (
                <CircularSankeyFlow
                  districtName={output.districtName}
                  cropName={output.cropName}
                  biogasM3PerDay={multiSpeciesLivestock.dailyBiogasM3}
                  lpgSavedPerYear={multiSpeciesLivestock.annualLpgCylindersDisplaced}
                  organicNPKSavedKg={
                    multiSpeciesLivestock.annualOrganicNitrogenKg +
                    multiSpeciesLivestock.annualOrganicPhosphorusKg +
                    multiSpeciesLivestock.annualOrganicPotassiumKg
                  }
                  annualStrawTonnes={output.food.yieldKg * 0.0013}
                />
              )}

              {studyViewMode !== 'visual_only' && (
                <>
                  {/* ═══════════════════════════════════════════════════════════════
                  SPECIES SELECTOR PILLS
                 ═══════════════════════════════════════════════════════════════ */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {(['buffalo', 'cattle', 'goat', 'poultry', 'swine'] as LivestockSpeciesType[]).map((spKey) => {
                      const sp = NEPAL_LIVESTOCK_DATABASE[spKey];
                      const isSelected = selectedLivestockSpecies === spKey;
                      return (
                        <button
                          key={spKey}
                          onClick={() => setSelectedLivestockSpecies(spKey)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-outfit font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${isSelected
                              ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs ring-2 ring-emerald-500/40'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                        >
                          <span>
                            {spKey === 'buffalo' && '🐃'}
                            {spKey === 'cattle' && '🐄'}
                            {spKey === 'goat' && '🐐'}
                            {spKey === 'poultry' && '🐔'}
                            {spKey === 'swine' && '🐖'}
                          </span>
                          <span>{sp.name.split(' (')[0]}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${isSelected ? 'bg-emerald-900 text-emerald-200 border-emerald-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                            {spKey === 'buffalo' ? '71% Milk' : spKey === 'cattle' ? '29% Milk' : spKey === 'goat' ? '82% GESI' : spKey === 'poultry' ? '100% Self-Reliant' : 'Bio-Recycle'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* ═══════════════════════════════════════════════════════════════
              ACTIVE SPECIES EMPIRICAL PROFILE CARD
             ═══════════════════════════════════════════════════════════════ */}
                  {(() => {
                    const sp = NEPAL_LIVESTOCK_DATABASE[selectedLivestockSpecies];
                    return (
                      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-base text-slate-900 font-outfit">{sp.name}</h4>
                              <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {sp.nameNep}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-sans mt-0.5">
                              National Population: <strong>{sp.nationalPop}</strong> • {sp.nationalContribution}
                            </p>
                          </div>
                          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 self-start sm:self-auto">
                            👩‍🌾 {sp.gesiProfile.empowermentScore} ({sp.gesiProfile.womenOwnershipPct}% Female Ownership)
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="text-slate-500 font-sans text-[11px]">Daily Manure / Dung</div>
                            <div className="font-bold text-slate-900 text-sm mt-0.5">{sp.dailyDungKgPerHead} kg / head / day</div>
                            <div className="text-[10px] text-emerald-700 font-sans mt-0.5">
                              NPK: {sp.manureN_pct}% N · {sp.manureP_pct}% P · {sp.manureK_pct}% K
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="text-slate-500 font-sans text-[11px]">Biogas Output Potential</div>
                            <div className="font-bold text-emerald-800 text-sm mt-0.5">
                              {(sp.dailyDungKgPerHead * sp.biogasYieldM3PerKgDung).toFixed(2)} m³ / day
                            </div>
                            <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                              Yield: {sp.biogasYieldM3PerKgDung} m³/kg substrate
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="text-slate-500 font-sans text-[11px]">Water Demand Footprint</div>
                            <div className="font-bold text-blue-800 text-sm mt-0.5">{sp.dailyDrinkingWaterLiters} L / day drinking</div>
                            <div className="text-[10px] text-blue-600 font-sans mt-0.5">
                              Fodder: {sp.fodderWaterM3PerHeadYr} m³/yr
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="text-slate-500 font-sans text-[11px]">IPCC Tier-2 Enteric CH₄</div>
                            <div className="font-bold text-amber-900 text-sm mt-0.5">{sp.entericMethaneKgPerHeadYr} kg CH₄ / yr</div>
                            <div className="text-[10px] text-amber-700 font-sans mt-0.5">
                              {Math.round(sp.entericMethaneKgPerHeadYr * 27)} kg CO₂e / head
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans pt-1">
                          <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1">
                            <span className="font-bold text-emerald-950 font-outfit">🌾 DLS Feed & Ration Recommendation:</span>
                            <p className="text-slate-700 leading-snug">{sp.feedProfile.primaryFeed}</p>
                            <div className="text-[11px] font-mono text-emerald-900 pt-1">
                              Dry Matter Intake: {sp.feedProfile.dryMatterIntakeKgDay} kg/day • Crude Protein Requirement: {sp.feedProfile.proteinRequirementPct}%
                            </div>
                          </div>

                          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 space-y-1">
                            <span className="font-bold text-blue-950 font-outfit">💰 Economic Product & Farmgate Realization:</span>
                            <p className="text-slate-700 leading-snug">{sp.economicProduct.productName}</p>
                            <div className="text-[11px] font-mono text-blue-900 pt-1">
                              Annual Yield: {sp.economicProduct.annualYieldPerHead} {sp.economicProduct.unit} • Farmgate Price: NPR {sp.economicProduct.farmgatePriceNpr.toLocaleString()} / unit
                            </div>
                          </div>
                        </div>

                        <div className="text-xs font-sans text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <strong>Recognized Breeds in Nepal:</strong> {sp.breeds.join(' • ')}
                          </div>
                          <div className="text-[11px] font-mono text-purple-900 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                            Female Labor: {sp.gesiProfile.laborRole}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ═══════════════════════════════════════════════════════════════
              INTERACTIVE LIVE MIXED-HERD SIMULATOR & WEFES BALANCE
             ═══════════════════════════════════════════════════════════════ */}
                  <div className="p-5 sm:p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                          Interactive Mixed-Herd Bioeconomy Ledger
                        </span>
                        <h4 className="text-base font-bold font-outfit mt-0.5 text-white">
                          Live Herd Composition & Interconnected WEFES Balance
                        </h4>
                        <p className="text-xs text-slate-400 font-sans mt-0.5">
                          Adjust herd counts below; watch biogas energy, organic fertilizer NPK, water footprint, carbon, and GESI cashflows update live!
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-slate-800 text-emerald-300 px-3 py-1.5 rounded-xl border border-slate-700">
                          Total LSU: {multiSpeciesLivestock.totalLivestockUnitsLSU} Units
                        </span>
                      </div>
                    </div>

                    {/* 5-Species Live Counter Steppers */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center space-y-1.5">
                        <div className="text-xs font-bold font-outfit text-slate-300">🐃 Buffaloes</div>
                        <div className="text-xl font-mono font-extrabold text-emerald-400">{livestockHerdConfig.buffaloHeads}</div>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setLivestockHerdConfig(prev => ({ ...prev, buffaloHeads: Math.max(0, prev.buffaloHeads - 1) }))}
                            className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <button
                            onClick={() => setLivestockHerdConfig(prev => ({ ...prev, buffaloHeads: prev.buffaloHeads + 1 }))}
                            className="w-6 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-xs cursor-pointer text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center space-y-1.5">
                        <div className="text-xs font-bold font-outfit text-slate-300">🐄 Cattle/Cows</div>
                        <div className="text-xl font-mono font-extrabold text-sky-400">{livestockHerdConfig.cattleHeads}</div>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setLivestockHerdConfig(prev => ({ ...prev, cattleHeads: Math.max(0, prev.cattleHeads - 1) }))}
                            className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <button
                            onClick={() => setLivestockHerdConfig(prev => ({ ...prev, cattleHeads: prev.cattleHeads + 1 }))}
                            className="w-6 h-6 rounded-lg bg-sky-600 hover:bg-sky-500 font-bold text-xs cursor-pointer text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center space-y-1.5">
                        <div className="text-xs font-bold font-outfit text-slate-300">🐐 Goats</div>
                        <div className="text-xl font-mono font-extrabold text-purple-400">{livestockHerdConfig.goatHeads}</div>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setLivestockHerdConfig(prev => ({ ...prev, goatHeads: Math.max(0, prev.goatHeads - 1) }))}
                            className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <button
                            onClick={() => setLivestockHerdConfig(prev => ({ ...prev, goatHeads: prev.goatHeads + 1 }))}
                            className="w-6 h-6 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold text-xs cursor-pointer text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center space-y-1.5">
                        <div className="text-xs font-bold font-outfit text-slate-300">🐔 Poultry</div>
                        <div className="text-xl font-mono font-extrabold text-amber-400">{livestockHerdConfig.poultryHeads}</div>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setLivestockHerdConfig(prev => ({ ...prev, poultryHeads: Math.max(0, prev.poultryHeads - 10) }))}
                            className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <button
                            onClick={() => setLivestockHerdConfig(prev => ({ ...prev, poultryHeads: prev.poultryHeads + 10 }))}
                            className="w-6 h-6 rounded-lg bg-amber-600 hover:bg-amber-500 font-bold text-xs cursor-pointer text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center space-y-1.5">
                        <div className="text-xs font-bold font-outfit text-slate-300">🐖 Swine/Pigs</div>
                        <div className="text-xl font-mono font-extrabold text-pink-400">{livestockHerdConfig.swineHeads}</div>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setLivestockHerdConfig(prev => ({ ...prev, swineHeads: Math.max(0, prev.swineHeads - 1) }))}
                            className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <button
                            onClick={() => setLivestockHerdConfig(prev => ({ ...prev, swineHeads: prev.swineHeads + 1 }))}
                            className="w-6 h-6 rounded-lg bg-pink-600 hover:bg-pink-500 font-bold text-xs cursor-pointer text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Real-time Dynamic WEFES Matrix Output */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono pt-2">
                      <div className="p-4 bg-slate-800/90 rounded-xl border border-slate-700 space-y-1.5">
                        <div className="text-emerald-400 font-bold text-xs font-sans flex items-center justify-between">
                          <span>⚡ AEPC Biogas Energy</span>
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                            {multiSpeciesLivestock.aepcRecommendedDigesterSize}
                          </span>
                        </div>
                        <div className="text-xl font-extrabold text-white">
                          {multiSpeciesLivestock.dailyBiogasM3} m³ <span className="text-xs font-normal text-slate-400">/ day</span>
                        </div>
                        <div className="text-[11px] text-slate-300 font-sans leading-snug">
                          Saves <strong>{multiSpeciesLivestock.annualLpgCylindersDisplaced} LPG Cylinders / yr</strong>
                        </div>
                        <div className="text-[11px] text-emerald-300 font-bold border-t border-slate-700 pt-1">
                          Annual LPG Savings: NPR {multiSpeciesLivestock.annualLpgSavingsNpr.toLocaleString()} / yr
                        </div>
                      </div>

                      <div className="p-4 bg-slate-800/90 rounded-xl border border-slate-700 space-y-1.5">
                        <div className="text-sky-400 font-bold text-xs font-sans flex items-center justify-between">
                          <span>🌱 Bio-Slurry NPK Fertilizer</span>
                          <span className="text-[10px] bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded border border-sky-800">
                            Organic Soil Return
                          </span>
                        </div>
                        <div className="text-sm font-extrabold text-white">
                          {multiSpeciesLivestock.annualOrganicNitrogenKg} kg N · {multiSpeciesLivestock.annualOrganicPhosphorusKg} kg P · {multiSpeciesLivestock.annualOrganicPotassiumKg} kg K
                        </div>
                        <div className="text-[11px] text-slate-300 font-sans leading-snug">
                          Displaces <strong>{multiSpeciesLivestock.chemicalUrea50kgBagsSubstituted} bags Urea</strong> + <strong>{multiSpeciesLivestock.chemicalDap50kgBagsSubstituted} bags DAP</strong>
                        </div>
                        <div className="text-[11px] text-sky-300 font-bold border-t border-slate-700 pt-1">
                          Chemical Fertilizer Saved: NPR {multiSpeciesLivestock.annualFertilizerCostSavingsNpr.toLocaleString()} / yr
                        </div>
                      </div>

                      <div className="p-4 bg-slate-800/90 rounded-xl border border-slate-700 space-y-1.5">
                        <div className="text-purple-400 font-bold text-xs font-sans flex items-center justify-between">
                          <span>👩‍🌾 GESI Income & Cashflow</span>
                          <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800">
                            {multiSpeciesLivestock.femaleControlledIncomeSharePct}% Female
                          </span>
                        </div>
                        <div className="text-xl font-extrabold text-white">
                          NPR {multiSpeciesLivestock.annualGrossLivestockRevenueNpr.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ yr</span>
                        </div>
                        <div className="text-[11px] text-slate-300 font-sans leading-snug">
                          Female-Controlled: <strong>NPR {multiSpeciesLivestock.femaleControlledRevenueNpr.toLocaleString()} / yr</strong>
                        </div>
                        <div className="text-[11px] text-purple-300 font-bold border-t border-slate-700 pt-1">
                          Monthly Cashflow: NPR {multiSpeciesLivestock.householdMonthlyLivestockCashflowNpr.toLocaleString()} / mo (DSCR: {multiSpeciesLivestock.dscrDebtServiceContribution}x)
                        </div>
                      </div>
                    </div>

                    {/* Bottom 2 mini metrics: Water & Carbon */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono border-t border-slate-800 pt-3">
                      <div className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-xl">
                        <span className="text-slate-400 font-sans">💧 Total Water Demand:</span>
                        <span className="text-blue-300 font-bold">
                          {multiSpeciesLivestock.totalAnnualLivestockWaterDemandM3.toLocaleString()} m³/yr ({multiSpeciesLivestock.dailyDrinkingWaterLiters} L/day drinking)
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-xl">
                        <span className="text-slate-400 font-sans">🌲 Net Carbon Balance (IPCC AR6):</span>
                        <span className="text-emerald-300 font-bold">
                          {multiSpeciesLivestock.netLivestockGhGEmissionsCo2eTonnesYr} t CO₂e/yr (Avoids {multiSpeciesLivestock.avoidedBiogasEmissionsCo2eTonnesYr} t via Biogas)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ═══════════════════════════════════════════════════════════════
              NARC 4% UREA-TREATED PADDY STRAW RESILIENCE PACKAGE
             ═══════════════════════════════════════════════════════════════ */}
                  <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950 font-outfit text-sm flex items-center gap-1.5">
                        🌾 NARC Official 4% Urea-Treated Straw Fodder Package (Winter Drought Buffer)
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded border border-amber-300">
                        NARC Animal Nutrition Division
                      </span>
                    </div>
                    <p className="text-slate-700 font-sans leading-relaxed">
                      Untreated paddy straw has poor crude protein ($3.5\%$) and low digestibility ($42\%$). Treating straw with $4\%$ urea under anaerobic conditions dramatically improves rumen microbial fermentation and prevents seasonal milk drops during dry winter months.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
                      <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                        <div className="text-slate-500 font-sans text-[11px]">Recipe Ratio</div>
                        <div className="font-bold text-slate-900 mt-0.5">100kg Straw + 4kg Urea</div>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                        <div className="text-slate-500 font-sans text-[11px]">Water Solution</div>
                        <div className="font-bold text-blue-900 mt-0.5">40 Liters Clean Water</div>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                        <div className="text-slate-500 font-sans text-[11px]">Anaerobic Pit Curing</div>
                        <div className="font-bold text-purple-900 mt-0.5">21 Days Airtight Seal</div>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                        <div className="text-slate-500 font-sans text-[11px]">Protein Nutrition Gain</div>
                        <div className="font-bold text-emerald-900 mt-0.5">+122% Crude Protein</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeDomain === 'precision_agronomy' && subTab === 'fisheries_aqua' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="Verified NARC/WB Empirical"
                source="Directorate of Fisheries Nepal & Dhanusha Fish Super-Zone Empirical Economics"
                limitation="Commercial pelleted feed represents 49.87% of production variable costs, creating high sensitivity to import price surges."
                recommendation="Establish municipal cooperative feed extrusion mills using local maize and mustard oilcake."
              />

              {/* Aquaculture Polyculture Donut & Metrics Chart if not empirical_only */}
              {studyViewMode !== 'empirical_only' && (
                <AquacultureMetricsChart
                  districtName={output.districtName}
                  annualFishYieldTonnesPerHa={aquaculture.pondOperationalModel.annualFishYieldTonnesPerHa}
                  feedConversionRatioFCR={aquaculture.pondOperationalModel.feedConversionRatioFCR}
                  feedCostSharePct={aquaculture.economicCostBreakdown.feedCostSharePct}
                  netAnnualReturnNprPerHa={aquaculture.economicCostBreakdown.netAnnualReturnNprPerHa}
                  totalAnnualAquacultureWaterDemandM3={aquaculture.waterAndEvaporationBudget.totalAnnualAquacultureWaterDemandM3}
                />
              )}

              {studyViewMode !== 'visual_only' && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs text-center">
                    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                      <div className="text-slate-500 font-sans text-xs">Annual Fish Yield</div>
                      <div className="text-2xl font-extrabold text-emerald-700 mt-1">{aquaculture.pondOperationalModel.annualFishYieldTonnesPerHa} <span className="text-xs font-normal text-slate-500">t/ha</span></div>
                      <div className="text-[10px] text-slate-400 font-sans">Stocking: {aquaculture.pondOperationalModel.stockingDensityFingerlingsPerHa} /ha</div>
                    </div>
                    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                      <div className="text-slate-500 font-sans text-xs">Feed Conversion Ratio (FCR)</div>
                      <div className="text-2xl font-extrabold text-blue-700 mt-1">{aquaculture.pondOperationalModel.feedConversionRatioFCR}</div>
                      <div className="text-[10px] text-slate-400 font-sans">Feed Cost Share: {aquaculture.economicCostBreakdown.feedCostSharePct}%</div>
                    </div>
                    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                      <div className="text-slate-500 font-sans text-xs">Net Return Per Hectare</div>
                      <div className="text-2xl font-extrabold text-purple-700 mt-1">NPR {(aquaculture.economicCostBreakdown.netAnnualReturnNprPerHa / 1000).toFixed(0)}k</div>
                      <div className="text-[10px] text-slate-400 font-sans">Benefit-Cost Ratio: {aquaculture.economicCostBreakdown.benefitCostRatioBCR}x</div>
                    </div>
                    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                      <div className="text-slate-500 font-sans text-xs">Pond Water Budget</div>
                      <div className="text-2xl font-extrabold text-teal-700 mt-1">{(aquaculture.waterAndEvaporationBudget.totalAnnualAquacultureWaterDemandM3 / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-500">m³</span></div>
                      <div className="text-[10px] text-slate-400 font-sans">{aquaculture.waterAndEvaporationBudget.groundwaterTubewellPumpingHours} Tubewell Pumping Hrs</div>
                    </div>
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs text-xs space-y-2">
                    <h5 className="font-bold text-slate-900 font-outfit">Polycarp Polyculture Species Mix</h5>
                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                      {aquaculture.pondOperationalModel.primarySpeciesMix.map((s, idx) => (
                        <span key={idx} className="bg-sky-50 text-sky-900 border border-sky-200 px-3 py-1 rounded-xl">
                          🐟 {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeDomain === 'precision_agronomy' && subTab === 'quefts_fertilizer' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="Verified NARC/WB Empirical"
                source="March 2023 MoALD Subsidized Fertilizer Directives & NARC-NSSRC Site-Specific Nutrient Database"
                limitation="Cooperative supply allocations face severe seasonal stockouts during monsoon top-dressing; informal border prices reflect a 40–80% scarcity premium."
                recommendation="Deploy municipal bio-slurry conditioning hubs and digital Palika soil cards to reduce import forex drain and bypass mountain freight penalties."
              />

              {/* Full Interactive Palika Fertilizer & Spatial Logistics Cockpit */}
              <PalikaFertilizerCockpit output={output} />

              {/* QUEFTS Nutrient Diagnostic Meter if not empirical_only */}
              {studyViewMode !== 'empirical_only' && (
                <QueftsNutrientGauge
                  districtName={output.districtName}
                  cropName={output.cropName}
                  nitrogenKgPerHa={fertilizerPrescription.nitrogenKgPerHa}
                  phosphorusKgPerHa={fertilizerPrescription.phosphorusP2O5KgPerHa}
                  potassiumKgPerHa={fertilizerPrescription.potassiumK2OKgPerHa}
                  zincKgPerHa={fertilizerPrescription.zincSulphateKgPerHa}
                  boraxKgPerHa={fertilizerPrescription.boraxKgPerHa}
                  ureaBags={fertilizerPrescription.commercialFertilizerBags.ureaBags50kg}
                  dapBags={fertilizerPrescription.commercialFertilizerBags.dapBags50kg}
                  mopBags={fertilizerPrescription.commercialFertilizerBags.mopBags50kg}
                />
              )}
            </div>
          )}

          {activeDomain === 'precision_agronomy' && subTab === 'agronomic_standards' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="Verified NARC/WB Empirical"
                source="Hoekstra (2011) Water Footprint, Hall (2014) EROI, Dobermann (2007) IFA NUE, IPCC AR6 GWP & NEA Hydro Grid"
                limitation="Grid electricity is calibrated using Nepal Electricity Authority (NEA) >95% clean hydropower (0.025 kg CO2/kWh)."
                recommendation="Adopt unified FAO/IPCC AR6 accounting for all municipal agriculture tenders and carbon reporting."
              />

              {/* Interactive Sunburst & Circle Packing if not empirical_only */}
              {studyViewMode !== 'empirical_only' && (
                <SunburstWaterCarbon
                  districtName={output.districtName}
                  cropName={output.cropName}
                  greenWaterPct={Math.round((agronomicStandards.waterFootprint.greenWaterM3PerTon / Math.max(1, agronomicStandards.waterFootprint.totalWaterFootprintM3PerTon)) * 100)}
                  blueWaterPct={Math.round((agronomicStandards.waterFootprint.blueWaterM3PerTon / Math.max(1, agronomicStandards.waterFootprint.totalWaterFootprintM3PerTon)) * 100)}
                  greyWaterPct={Math.round((agronomicStandards.waterFootprint.greyWaterM3PerTon / Math.max(1, agronomicStandards.waterFootprint.totalWaterFootprintM3PerTon)) * 100)}
                  totalWaterLPerKg={agronomicStandards.waterFootprint.waterFootprintLitersPerKg}
                  soilCarbonStockMgHa={output.ecosystem.carbonOffsetKgCo2 / 100}
                  totalCarbonEmissionKgHa={Math.round(agronomicStandards.ipccAr6Carbon.totalCarbonFootprintKgCo2ePerHa)}
                />
              )}

              {studyViewMode !== 'visual_only' && (
                <>
                  {/* 1. Hoekstra (2011) 3-Color Water Footprint */}
                  <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b pb-2">
                      <div>
                        <span className="font-bold text-sm text-slate-900 font-outfit flex items-center gap-1.5">
                          <span>1. 💧 Hoekstra et al. (2011) 3-Color Water Footprint Assessment</span>
                        </span>
                        <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                          Standardized hydrologic accounting partitioning precipitation, irrigation, and chemical dilution.
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 shrink-0">
                        Total Footprint: {agronomicStandards.waterFootprint.totalWaterFootprintM3PerTon.toLocaleString()} m³/ton ({agronomicStandards.waterFootprint.waterFootprintLitersPerKg} L/kg)
                      </span>
                    </div>

                    {/* Segmented Visual Proportion Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-sans text-slate-600 font-medium">
                        <span className="flex items-center gap-1 text-emerald-800">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                          Green Water (Rain): {((agronomicStandards.waterFootprint.greenWaterM3PerTon / Math.max(1, agronomicStandards.waterFootprint.totalWaterFootprintM3PerTon)) * 100).toFixed(0)}%
                        </span>
                        <span className="flex items-center gap-1 text-sky-800">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
                          Blue Water (Irrigation): {((agronomicStandards.waterFootprint.blueWaterM3PerTon / Math.max(1, agronomicStandards.waterFootprint.totalWaterFootprintM3PerTon)) * 100).toFixed(0)}%
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
                          Grey Water (Dilution): {((agronomicStandards.waterFootprint.greyWaterM3PerTon / Math.max(1, agronomicStandards.waterFootprint.totalWaterFootprintM3PerTon)) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full h-3.5 rounded-full bg-slate-100 flex overflow-hidden p-0.5 border border-slate-200">
                        <div
                          style={{ width: `${(agronomicStandards.waterFootprint.greenWaterM3PerTon / Math.max(1, agronomicStandards.waterFootprint.totalWaterFootprintM3PerTon)) * 100}%` }}
                          className="bg-emerald-500 rounded-l-full h-full transition-all"
                          title={`Green Water: ${agronomicStandards.waterFootprint.greenWaterM3PerTon} m3/ton`}
                        ></div>
                        <div
                          style={{ width: `${(agronomicStandards.waterFootprint.blueWaterM3PerTon / Math.max(1, agronomicStandards.waterFootprint.totalWaterFootprintM3PerTon)) * 100}%` }}
                          className="bg-sky-500 h-full transition-all"
                          title={`Blue Water: ${agronomicStandards.waterFootprint.blueWaterM3PerTon} m3/ton`}
                        ></div>
                        <div
                          style={{ width: `${(agronomicStandards.waterFootprint.greyWaterM3PerTon / Math.max(1, agronomicStandards.waterFootprint.totalWaterFootprintM3PerTon)) * 100}%` }}
                          className="bg-slate-400 rounded-r-full h-full transition-all"
                          title={`Grey Water: ${agronomicStandards.waterFootprint.greyWaterM3PerTon} m3/ton`}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-center pt-1">
                      <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200">
                        <div className="text-emerald-800 font-sans text-[11px]">Green Water (Rain)</div>
                        <div className="text-xl font-bold text-emerald-950 mt-0.5">{agronomicStandards.waterFootprint.greenWaterM3PerTon} m³/t</div>
                        <div className="text-[10px] text-emerald-700 font-sans">Effective Rainfall</div>
                      </div>
                      <div className="p-3 bg-sky-50/80 rounded-xl border border-sky-200">
                        <div className="text-sky-800 font-sans text-[11px]">Blue Water (Irrigation)</div>
                        <div className="text-xl font-bold text-sky-950 mt-0.5">{agronomicStandards.waterFootprint.blueWaterM3PerTon} m³/t</div>
                        <div className="text-[10px] text-sky-700 font-sans">Surface & Groundwater</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="text-slate-500 font-sans text-[11px]">Grey Water (Dilution)</div>
                        <div className="text-xl font-bold text-slate-900 mt-0.5">{agronomicStandards.waterFootprint.greyWaterM3PerTon} m³/t</div>
                        <div className="text-[10px] text-slate-400 font-sans">Pollution Assimilation</div>
                      </div>
                      <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200">
                        <div className="text-blue-800 font-sans text-[11px]">Water Use Efficiency</div>
                        <div className="text-xl font-bold text-blue-950 mt-0.5">{agronomicStandards.waterFootprint.waterUseEfficiencyKgPerHaPerMm} kg/ha/mm</div>
                        <div className="text-[10px] text-blue-700 font-sans">Depleted Fraction: {agronomicStandards.waterFootprint.depletedFractionETaOverInflow}</div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Hall (2014) & Lal (2004) Energy Budget & EROI */}
                  <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b pb-2">
                      <div>
                        <span className="font-bold text-sm text-slate-900 font-outfit flex items-center gap-1.5">
                          <span>2. ⚡ Hall et al. (2014) & Lal (2004) Energy Budgeting & EROI</span>
                        </span>
                        <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                          Agronomic thermodynamics measuring energetic profitability, fossil fuel offset, and human labor amplification.
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200 shrink-0">
                        EROI: {agronomicStandards.energyBudget.energyReturnOnInvestmentEROI}x ({agronomicStandards.energyBudget.eroiCategory})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-center">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="text-slate-500 font-sans text-[11px]">Total Energy Input</div>
                        <div className="text-xl font-bold text-slate-900 mt-0.5">{agronomicStandards.energyBudget.totalEnergyInputMJPerHa.toLocaleString()} MJ/ha</div>
                        <div className="text-[10px] text-slate-400 font-sans">Direct: {agronomicStandards.energyBudget.directEnergyInputMJPerHa} MJ</div>
                      </div>
                      <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200">
                        <div className="text-emerald-800 font-sans text-[11px]">Total Energy Output</div>
                        <div className="text-xl font-bold text-emerald-950 mt-0.5">{agronomicStandards.energyBudget.totalEnergyOutputMJPerHa.toLocaleString()} MJ/ha</div>
                        <div className="text-[10px] text-emerald-700 font-sans">Grain + Straw Energy</div>
                      </div>
                      <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200">
                        <div className="text-purple-800 font-sans text-[11px]">Net Energy Balance</div>
                        <div className="text-xl font-bold text-purple-950 mt-0.5">+{agronomicStandards.energyBudget.netEnergyMJPerHa.toLocaleString()} MJ/ha</div>
                        <div className="text-[10px] text-purple-700 font-sans">Thermodynamic Gain</div>
                      </div>
                      <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200">
                        <div className="text-amber-800 font-sans text-[11px]">Human Energy Gain (HEP)</div>
                        <div className="text-xl font-bold text-amber-950 mt-0.5">{agronomicStandards.energyBudget.humanEnergyProfitabilityHEP}x</div>
                        <div className="text-[10px] text-amber-700 font-sans">Labour Amplification Ratio</div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Dobermann (2007) / IFA Nutrient Use Efficiency & IPCC AR6 Carbon */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                      <span className="font-bold text-sm text-slate-900 font-outfit block border-b pb-2">
                        3. 🧪 Dobermann (2007) Nutrient Use Efficiency (NUE)
                      </span>
                      <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="text-slate-500 font-sans text-[10px]">Partial Factor (PFP)</div>
                          <div className="font-bold text-slate-900 mt-1">{agronomicStandards.nutrientEfficiency.partialFactorProductivityPfpN}</div>
                          <div className="text-[9px] text-slate-400 font-sans">kg grain / kg N</div>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                          <div className="text-emerald-800 font-sans text-[10px]">Agronomic Eff (AE)</div>
                          <div className="font-bold text-emerald-950 mt-1">{agronomicStandards.nutrientEfficiency.agronomicEfficiencyAeN}</div>
                          <div className="text-[9px] text-emerald-700 font-sans">kg gain / kg N</div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                          <div className="text-blue-800 font-sans text-[10px]">Recovery (RE)</div>
                          <div className="font-bold text-blue-950 mt-1">{agronomicStandards.nutrientEfficiency.apparentRecoveryEfficiencyRePct}%</div>
                          <div className="text-[9px] text-blue-700 font-sans">N Uptake Share</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                      <span className="font-bold text-sm text-slate-900 font-outfit block border-b pb-2">
                        4. 🌲 IPCC AR6 Carbon Footprint & Soil Carbon Stock
                      </span>
                      <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="text-slate-500 font-sans text-[10px]">Carbon Footprint</div>
                          <div className="font-bold text-slate-900 mt-1">{agronomicStandards.ipccAr6Carbon.totalCarbonFootprintKgCo2ePerHa}</div>
                          <div className="text-[9px] text-slate-400 font-sans">kg CO₂e/ha</div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                          <div className="text-purple-800 font-sans text-[10px]">Soil Carbon Stock</div>
                          <div className="font-bold text-purple-950 mt-1">{agronomicStandards.ipccAr6Carbon.soilOrganicCarbonStockMgCPerHa}</div>
                          <div className="text-[9px] text-purple-700 font-sans">Mg C/ha (30cm)</div>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                          <div className="text-emerald-800 font-sans text-[10px]">Carbon Efficiency</div>
                          <div className="font-bold text-emerald-950 mt-1">{agronomicStandards.ipccAr6Carbon.carbonEfficiencyKgYieldPerKgCo2e}</div>
                          <div className="text-[9px] text-emerald-700 font-sans">kg yield / kg CO₂e</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeDomain === 'precision_agronomy' && subTab === 'calendar' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="Calibrated Satellite Proxy"
                source="NASA MERRA-2 (39-Year Climatology) + FAO CropWat"
                limitation="DHM Nepal real-time automatic weather station feeds are not yet publicly exposed via machine API."
                recommendation="DHM and MoALD should sign an open-data protocol to stream live synoptic radar & rainfall telemetry directly."
              />

              {/* Interactive Phenology Timeline Chart if not empirical_only */}
              {studyViewMode !== 'empirical_only' && (
                <PhenologyTimelineChart
                  districtName={output.districtName}
                  cropName={output.cropName}
                  calendar={cropCalendar}
                />
              )}

              {studyViewMode !== 'visual_only' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {cropCalendar.map((m) => (
                    <div
                      key={m.bsMonth}
                      className={`p-4 rounded-2xl border transition-all space-y-2 shadow-2xs ${m.status === 'Deficit Irrigation Required'
                          ? 'bg-amber-50/70 border-amber-200'
                          : m.status === 'Surplus Rain'
                            ? 'bg-sky-50/70 border-sky-200'
                            : 'bg-white border-slate-200'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-bold text-sm text-slate-900 font-outfit">{m.bsMonth}</h5>
                          <span className="text-[10px] text-slate-500 font-mono">{m.adMonth}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold border ${m.status === 'Deficit Irrigation Required'
                            ? 'bg-amber-200 text-amber-950 border-amber-300'
                            : m.status === 'Surplus Rain'
                              ? 'bg-sky-200 text-sky-950 border-sky-300'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                          {m.status === 'Deficit Irrigation Required' ? 'Deficit' : m.status === 'Surplus Rain' ? 'Surplus' : 'Balanced'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 font-sans font-medium">
                        <strong>Activity:</strong> {m.activityStage}
                      </div>

                      <div className="pt-1.5 border-t border-slate-100 grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-600">
                        <div>Rain: <strong>{m.rainfallMm} mm</strong></div>
                        <div>Need: <strong>{m.cropWaterReqMm} mm</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
          DOMAIN 2: WATER SECURITY & SATELLITES VIEWS
         ═══════════════════════════════════════════════════════════════ */}
          {activeDomain === 'value_chain_satellite' && subTab === 'groundwater_terai' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="Verified NARC/WB Empirical"
                source="Groundwater Resources Development Board (GWRDB) & ADB MIIP Loan 3842-NEP (2024–2025)"
                limitation="88% of Madhesh depends on groundwater; zero-marginal-cost solar pumping accelerates annual water table drops (14.5 cm/yr)."
                recommendation="Enact mandatory municipal bylaws requiring every subsidized solar pump to pair with a 50 m² recharge pond."
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <span className="font-bold text-xs text-slate-500 uppercase tracking-wider font-mono">Aquifer Hydrogeology</span>
                  <h5 className="font-bold text-base text-slate-900 font-outfit">{groundwater.aquiferHydrogeology.shallowAquiferDepthMeters}</h5>
                  <div className="text-xs text-slate-700 font-sans">
                    Deep Confined Depth: <strong>{groundwater.aquiferHydrogeology.deepConfinedAquiferDepthMeters}</strong>
                  </div>
                  <div className="text-xs text-rose-700 font-bold pt-1 border-t">
                    Annual Depletion Rate: -{groundwater.aquiferHydrogeology.annualWaterTableDepletionRateCmPerYr} cm/year
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <span className="font-bold text-xs text-slate-500 uppercase tracking-wider font-mono">Solar Pumping Over-Extraction</span>
                  <h5 className="font-bold text-base text-slate-900 font-outfit">+{groundwater.solarGroundwaterNexusRisk.solarPumpingOverExtractionTendencyPct}% Drawdown Risk</h5>
                  <div className="text-xs text-slate-700 font-sans">
                    Seasonal Drop Severity: <strong>{groundwater.solarGroundwaterNexusRisk.seasonalWaterTableCollapseRisk}</strong>
                  </div>
                  <div className="text-xs text-blue-700 font-mono pt-1 border-t">
                    Chure-Bhabar Health Score: {groundwater.solarGroundwaterNexusRisk.chureBhabarRechargeHealthScore}/100
                  </div>
                </div>

                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-2xs space-y-2">
                  <span className="font-bold text-xs text-emerald-800 uppercase tracking-wider font-mono">Mandatory Recharge Mitigation</span>
                  <div className="text-2xl font-extrabold text-emerald-950 font-mono">+{groundwater.mandatoryRechargeMitigation.annualWaterTableRestorationCm} cm/yr</div>
                  <div className="text-xs text-emerald-900 font-sans">
                    Standard: <strong>{groundwater.mandatoryRechargeMitigation.farmRechargePondDimensions}</strong>
                  </div>
                  <div className="text-[11px] text-emerald-800 pt-1 border-t border-emerald-200">
                    Captures {groundwater.mandatoryRechargeMitigation.annualRunoffCapturedM3} m³ monsoon runoff
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeDomain === 'value_chain_satellite' && subTab === 'heat_stress_calendar' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="Verified NARC/WB Empirical"
                source="NWRP Bhairahawa & IAAS Paklihawa Thermal Agronomy Trials (Research on Crops 2024)"
                limitation="Spring maize suffers up to 75% yield loss from >37°C pollen sterility, and winter wheat loses 29%–64% when heading temps exceed 24.5°C."
                recommendation="Scale up foundation seed multiplication for terminal heat-tolerant varieties (NL 1368, BL 4919, Rampur Hybrid-10)."
              />

              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 font-outfit">{heatStress.cropName} Thermal Anthesis Risk</h4>
                    <span className="text-xs font-mono text-slate-500">Critical Stage: {heatStress.reproductiveStageName}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold font-mono border ${heatStress.heatStressSeverity.startsWith('Severe')
                      ? 'bg-rose-100 text-rose-900 border-rose-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}>
                    {heatStress.heatStressSeverity}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-slate-500 font-sans text-[11px]">Lethal Limit</div>
                    <div className="text-xl font-bold text-rose-700 mt-0.5">{heatStress.criticalLethalTemperatureCelsius}°C</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-slate-500 font-sans text-[11px]">Projected Peak</div>
                    <div className="text-xl font-bold text-slate-900 mt-0.5">{heatStress.projectedPeakTemperatureCelsius}°C</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-slate-500 font-sans text-[11px]">Yield Collapse Risk</div>
                    <div className="text-xl font-bold text-rose-800 mt-0.5">-{heatStress.projectedYieldCollapsePct}%</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-slate-500 font-sans text-[11px]">Adaptation Window</div>
                    <div className="text-xs font-bold text-emerald-700 mt-1 font-sans">Advance Sowing</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-sans leading-relaxed">
                  <strong>Biophysical Mechanism:</strong> {heatStress.biophysicalMechanism}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="font-bold text-xs text-slate-900 font-outfit block">Recommended Heat-Tolerant Genotypes:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {heatStress.recommendedHeatTolerantGenotypes.map((g, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                        <div className="font-bold text-slate-900 font-outfit">{g.varietyName}</div>
                        <div className="text-[11px] text-slate-500 font-sans">{g.breedingProgram}</div>
                        <p className="text-[11px] text-emerald-800 font-sans">{g.heatToleranceMechanism}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeDomain === 'value_chain_satellite' && subTab === 'post_harvest' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="Verified NARC/WB Empirical"
                source="Int J Appl Sci Biotechnol Wholesale Loss Survey & Swisscontact Nepal Study"
                limitation="Nepal has fewer than 50 certified cold store hubs, leading to regional transport bottlenecks during summer."
                recommendation="Provide 60% provincial matching grants for decentralized solar cold stores (20–50 MT) at ward cooperatives."
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <span className="font-bold text-xs text-slate-500 uppercase tracking-wider font-mono">Nearest Cold Store Hub</span>
                  <h5 className="font-bold text-base text-slate-900 font-outfit">{postHarvest.nearestColdStorage.name}</h5>
                  <div className="text-xs text-slate-600 font-sans">
                    Location: <strong>{postHarvest.nearestColdStorage.location}</strong> ({postHarvest.distanceToColdStorageKm} km away)
                  </div>
                  <div className="text-xs font-mono text-slate-500 pt-1 border-t">
                    Capacity: {postHarvest.nearestColdStorage.capacityMetricTons.toLocaleString()} MT • Tariff: NPR {postHarvest.nearestColdStorage.tariffPerKgPerMonthNpr}/kg/mo
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <span className="font-bold text-xs text-slate-500 uppercase tracking-wider font-mono">Transit Disruption Risk</span>
                  <h5 className="font-bold text-base text-slate-900 font-outfit">{postHarvest.roadTransportDisruptionRisk.roadType}</h5>
                  <div className="text-xs text-slate-600 font-sans">
                    Monsoon Delay: <strong>+{postHarvest.roadTransportDisruptionRisk.monsoonTransitDelayHours} Hours</strong> transit bottleneck
                  </div>
                  <div className="text-xs font-mono text-rose-700 pt-1 border-t">
                    Spoilage Acceleration: +{postHarvest.roadTransportDisruptionRisk.spoilageAccelerationPct}% during roadblocks
                  </div>
                </div>

                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-2xs space-y-2">
                  <span className="font-bold text-xs text-emerald-800 uppercase tracking-wider font-mono">Cold Chain Value Salvage</span>
                  <div className="text-2xl font-extrabold text-emerald-950 font-mono">+NPR {postHarvest.coldChainInterventionDividend.salvagedRevenueNpr.toLocaleString()}</div>
                  <div className="text-xs text-emerald-800 font-sans">
                    Salvages <strong>{postHarvest.coldChainInterventionDividend.salvagedVolumeKg.toLocaleString()} kg</strong> marketable produce
                  </div>
                  <div className="text-xs font-mono text-emerald-700 pt-1 border-t border-emerald-200">
                    Solar Cold Hub Payback: {postHarvest.coldChainInterventionDividend.solarColdStoragePaybackYears} Years
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeDomain === 'value_chain_satellite' && subTab === 'sentinel_health' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="Calibrated Satellite Proxy"
                source="ESA Copernicus Sentinel-2 MSI (10m Optical Resolution) & 3D CNN Model"
                limitation="Heavy monsoon cloud cover (July–August) may occasionally occlude optical satellite passes."
                recommendation="Integrate synthetic aperture radar (Sentinel-1 SAR) to penetrate monsoon cloud decks automatically."
              />

              {/* Sentinel-2 MSI Multi-Spectral Vegetation Health Trajectory if not empirical_only */}
              {studyViewMode !== 'empirical_only' && (
                <SentinelNdviChart
                  districtName={output.districtName}
                  cropName={output.cropName}
                  meanNdvi={sentinel.currentNdvi}
                  vegetativeHealthClassification={sentinel.canopyChlorophyllContent}
                  ndviAnomalyVsFiveYearMeanPct={sentinel.ndviAnomalyPct}
                  canopyChlorophyllIndex={sentinel.enhancedVegetationIndexEVI}
                  waterStressEsi={sentinel.leafAreaIndexLAI}
                />
              )}

              {studyViewMode !== 'visual_only' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs text-center">
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="text-slate-500 font-sans text-xs">Current NDVI (10m)</div>
                    <div className="text-2xl font-extrabold text-emerald-700 mt-1">{sentinel.currentNdvi}</div>
                    <div className="text-[10px] text-slate-400 font-sans">Baseline: {sentinel.baselineHistoricalNdvi}</div>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="text-slate-500 font-sans text-xs">Enhanced EVI</div>
                    <div className="text-2xl font-extrabold text-blue-700 mt-1">{sentinel.enhancedVegetationIndexEVI}</div>
                    <div className="text-[10px] text-slate-400 font-sans">Atmosphere-Corrected</div>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="text-slate-500 font-sans text-xs">Leaf Area Index (LAI)</div>
                    <div className="text-2xl font-extrabold text-purple-700 mt-1">{sentinel.leafAreaIndexLAI} <span className="text-xs font-normal text-slate-500">m²/m²</span></div>
                    <div className="text-[10px] text-slate-400 font-sans">Canopy Density</div>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="text-slate-500 font-sans text-xs">Forecasted Yield</div>
                    <div className="text-2xl font-extrabold text-emerald-800 mt-1">{sentinel.predictiveYieldForecast.forecastedYieldTonPerHa} <span className="text-xs font-normal text-slate-500">t/ha</span></div>
                    <div className="text-[10px] text-emerald-700 font-sans">{sentinel.predictiveYieldForecast.forecastLeadTimeWeeks} Weeks Lead Time</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeDomain === 'value_chain_satellite' && subTab === 'pest_early_warning' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="Verified NARC/WB Empirical"
                source="FAO DLIS Surveillance & PlantVillage Nepal AI Protocols"
                limitation="Pheromone trap logs require manual weekly counts by lead farmers in remote mountain wards."
                recommendation="Train Ward Agriculture Technicians (JTA/JT) on digital mobile pest logging into a centralized national registry."
              />

              <div className="space-y-4">
                {pestAlerts.map((p) => (
                  <div key={p.pestId} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-bold text-base text-slate-900 font-outfit">{p.commonName}</h5>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {p.vectorType}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-500 italic block mt-0.5">{p.scientificName} • Target: {p.targetCrops.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-700">Risk: {p.riskScore}/100</span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${p.currentThreatLevel.startsWith('High')
                            ? 'bg-rose-100 text-rose-900 border-rose-300'
                            : p.currentThreatLevel.startsWith('Moderate')
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}>
                          {p.currentThreatLevel}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                      <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 space-y-1">
                        <div className="font-bold text-blue-950 font-sans flex items-center gap-1">
                          <span>🌡️ Thermal Degree-Days:</span>
                        </div>
                        <p className="text-[11px] text-blue-900 font-sans leading-snug">{p.calibratedNexusFactors.gddThermalStatus}</p>
                      </div>

                      <div className="p-3 bg-sky-50/80 rounded-xl border border-sky-200 space-y-1">
                        <div className="font-bold text-sky-950 font-sans flex items-center gap-1">
                          <span>💧 Moisture Modulation:</span>
                        </div>
                        <p className="text-[11px] text-sky-900 font-sans leading-snug">{p.calibratedNexusFactors.moistureStressModulation}</p>
                      </div>

                      <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-1">
                        <div className="font-bold text-amber-950 font-sans flex items-center gap-1">
                          <span>🧪 Soil & Texture Factor:</span>
                        </div>
                        <p className="text-[11px] text-amber-900 font-sans leading-snug">{p.calibratedNexusFactors.soilFactorImpact}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                      <span className="text-slate-700 font-sans">
                        <strong>Diagnostic Signs:</strong> {p.symptomsAndDiagnosticSigns}
                      </span>
                      <span className="text-rose-700 font-mono font-bold shrink-0 ml-3">
                        Max Yield Impact: -{p.potentialYieldLossPct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
          DOMAIN 3: BIOENERGY, BANKABILITY & EXPORT VIEWS
         ═══════════════════════════════════════════════════════════════ */}
          {activeDomain === 'climate_finance' && subTab === 'circular_bioenergy' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="Verified NARC/WB Empirical"
                source="Alternative Energy Promotion Centre (AEPC) & NRREP Bioenergy Guidelines 2024"
                limitation="Over 400,000 domestic biogas plants are installed in Nepal, but bio-slurry nutrient value is rarely modeled in farm balance sheets."
                recommendation="AEPC and MoALD should formalize bio-slurry commercial packaging and provide subsidies for solar slurry distribution tankers."
              />

              {/* Interactive Resource Sankey Flow if not empirical_only */}
              {studyViewMode !== 'empirical_only' && (
                <CircularSankeyFlow
                  districtName={output.districtName}
                  cropName={output.cropName}
                  biogasM3PerDay={bioenergy.householdBiogasPlantModel.annualBiogasProductionM3 / 365}
                  lpgSavedPerYear={bioenergy.householdBiogasPlantModel.lpgCylindersSubstitutedPerYear}
                  organicNPKSavedKg={bioenergy.bioSlurryOrganicFertilizerDividend.chemicalFertilizerBagsSavedPerYear.ureaBags50kg * 23 + bioenergy.bioSlurryOrganicFertilizerDividend.chemicalFertilizerBagsSavedPerYear.dapBags50kg * 23}
                  annualStrawTonnes={output.food.yieldKg * 0.0013}
                />
              )}

              {studyViewMode !== 'visual_only' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <span className="font-bold text-xs text-slate-500 uppercase tracking-wider font-mono">Household Biogas Model</span>
                    <h5 className="font-bold text-base text-slate-900 font-outfit">{bioenergy.householdBiogasPlantModel.recommendedDigesterSizeM3}</h5>
                    <div className="text-xs text-slate-700 font-sans">
                      Annual Biogas: <strong>{bioenergy.householdBiogasPlantModel.annualBiogasProductionM3} m³</strong> ({bioenergy.householdBiogasPlantModel.thermalEnergyKwhEquivalent} kWh)
                    </div>
                    <div className="text-xs text-emerald-800 font-bold pt-1 border-t">
                      Fuel Savings: NPR {bioenergy.householdBiogasPlantModel.annualHouseholdFuelSavingsNpr.toLocaleString()} / year ({bioenergy.householdBiogasPlantModel.lpgCylindersSubstitutedPerYear} LPG Cylinders)
                    </div>
                  </div>

                  <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-2xs space-y-2">
                    <span className="font-bold text-xs text-emerald-800 uppercase tracking-wider font-mono">Digestate Bio-Slurry Dividend</span>
                    <div className="text-2xl font-extrabold text-emerald-950 font-mono">+{bioenergy.bioSlurryOrganicFertilizerDividend.annualSlurryProductionTons} Tons/yr</div>
                    <div className="text-xs text-emerald-900 font-sans">
                      Replaces <strong>{bioenergy.bioSlurryOrganicFertilizerDividend.chemicalFertilizerBagsSavedPerYear.ureaBags50kg} Bags Urea</strong> + <strong>{bioenergy.bioSlurryOrganicFertilizerDividend.chemicalFertilizerBagsSavedPerYear.dapBags50kg} Bags DAP</strong>
                    </div>
                    <div className="text-xs text-emerald-800 font-bold pt-1 border-t border-emerald-200">
                      Fertilizer Cost Saved: NPR {bioenergy.bioSlurryOrganicFertilizerDividend.annualFertilizerCostSavedNpr.toLocaleString()} / year
                    </div>
                  </div>

                  <div className="p-5 bg-blue-50 rounded-2xl border border-blue-200 shadow-2xs space-y-2">
                    <span className="font-bold text-xs text-blue-800 uppercase tracking-wider font-mono">Cooperative Chilling Microgrid</span>
                    <h5 className="font-bold text-base text-slate-900 font-outfit">{bioenergy.chillingCenterMiniGridPotential.cooperativeMiniGridCompatibility}</h5>
                    <div className="text-xs text-blue-900 font-sans">
                      Cooling Capacity: <strong>{bioenergy.chillingCenterMiniGridPotential.milkChillingCapacityLitersPerDay.toLocaleString()} L/day</strong>
                    </div>
                    <div className="text-xs text-blue-800 pt-1 border-t border-blue-200 font-mono">
                      Displaces {bioenergy.chillingCenterMiniGridPotential.dieselGeneratorFuelDisplacedLitersPerYr} L diesel/year
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeDomain === 'climate_finance' && subTab === 'export_gap_traceability' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="Verified NARC/WB Empirical"
                source="MoALD Agribusiness Promotion Standards & EU Organic Regulation (EC 834/2007)"
                limitation="High-value spices and tea face non-tariff pesticide residue and phytosanitary border testing barriers."
                recommendation="Accredit DFTQC laboratories internationally for rapid export residue clearance certificates."
              />

              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 font-outfit">{exportTrace.cropName} Export Market Access & Organic Premium</h4>
                    <span className="text-xs font-mono text-slate-500">{exportTrace.exportPotentialTier}</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold font-mono">
                    +{exportTrace.organicCertificationEconomics.organicPricePremiumPct}% Organic Price Premium
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="text-slate-500 font-sans text-[11px]">Conventional Farmgate</div>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">NPR {exportTrace.organicCertificationEconomics.conventionalFarmgatePriceNprPerKg}/kg</div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                    <div className="text-emerald-800 font-sans text-[11px]">Certified Organic Export</div>
                    <div className="text-lg font-bold text-emerald-950 mt-0.5">NPR {exportTrace.organicCertificationEconomics.certifiedOrganicExportPriceNprPerKg}/kg</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
                    <div className="text-blue-800 font-sans text-[11px]">Net Premium Dividend</div>
                    <div className="text-lg font-bold text-blue-950 mt-0.5">+NPR {exportTrace.organicCertificationEconomics.netAnnualFarmerPremiumIncomeNpr.toLocaleString()}</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-xl font-mono text-xs space-y-1.5">
                  <div className="font-bold text-emerald-400 font-sans">📱 Nepal-GAP QR Batch Traceability Certificate:</div>
                  <div className="text-slate-300 text-[11px]">Batch ID: {exportTrace.qrBlockchainTraceabilityLayer.batchId}</div>
                  <div className="text-slate-400 text-[10px]">Coordinates: {exportTrace.qrBlockchainTraceabilityLayer.geolocatedPlotCoordinates} • Seed Lot: {exportTrace.qrBlockchainTraceabilityLayer.narcCertifiedSeedLot}</div>
                  <div className="text-emerald-300 text-[10px]">Status: {exportTrace.qrBlockchainTraceabilityLayer.zeroSyntheticPesticideResidueVerification}</div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              NEW: NEXUS READINESS SCORECARD (GO / NO-GO GATE)
          ═══════════════════════════════════════════════════════════════ */}
          {activeDomain === 'climate_finance' && subTab === 'nexus_readiness' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="Verified NARC/WB Empirical"
                source="European Commission JRC Nexus Evaluation Framework & Aboelnga 3-Pillar Donor Methodology"
                limitation="Scorecard reflects modeled district-level biophysical & institutional readiness; field-level ward verification required."
                recommendation="Use this Go/No-Go assessment as the executive annex for GCF Simplified Approval Process (SAP) & World Bank PCN."
              />

              {/* Master Verdict Banner */}
              <div className={`p-6 rounded-2xl border ${
                readiness.verdictColor === 'emerald'
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                  : readiness.verdictColor === 'amber'
                  ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                  : 'bg-rose-50/90 border-rose-300 text-rose-950'
              } shadow-sm space-y-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-md bg-white/80 border border-black/10">
                        Pre-Submission Assessment
                      </span>
                      <span className="text-xs font-mono font-bold">
                        Score: {readiness.totalScore} / {readiness.maxScore} ({readiness.percentage}%)
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold font-outfit mt-1 flex items-center gap-2">
                      <span>{readiness.verdict}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono">
                      <span className="text-[10px] text-slate-600 block uppercase font-sans">Bankability Index</span>
                      <span className="text-lg font-black">{readiness.percentage}%</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/90 border border-black/10 flex items-center justify-center text-xl font-bold shrink-0 shadow-2xs">
                      {readiness.verdictColor === 'emerald' ? '✅' : readiness.verdictColor === 'amber' ? '⚠️' : '🛑'}
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-sans leading-relaxed text-slate-800">
                  {readiness.verdictDescription}
                </p>

                {/* Recommended Funding Windows */}
                <div className="pt-2 border-t border-black/10 flex flex-col md:flex-row md:items-center gap-2 text-xs">
                  <span className="font-bold text-slate-900 font-outfit shrink-0">🎯 Qualified Funding Windows:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {readiness.recommendedSubmissionWindows.map((win, idx) => (
                      <span key={idx} className="bg-white/80 px-2.5 py-0.5 rounded-lg border border-black/10 font-sans font-medium text-slate-800">
                        {win}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 7-Criteria Detailed Checklist */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 font-outfit flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>7-Dimension JRC/EC Pre-Submission Evaluation Matrix</span>
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  {readiness.criteria.map((c) => (
                    <div key={c.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm font-outfit">{c.title}</span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {c.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 font-sans">{c.evidence}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 font-mono">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                            c.score === 2
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : c.score === 1
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}>
                            {c.score} / {c.maxScore} pts
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 font-sans bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                        <span><strong>Funder Requirement:</strong> {c.funderRelevance}</span>
                        <span className={`font-bold font-mono text-[10px] ${
                          c.score === 2 ? 'text-emerald-700' : c.score === 1 ? 'text-amber-700' : 'text-rose-700'
                        }`}>
                          {c.statusLabel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Gaps & Action Items if any */}
              {readiness.criticalGaps.length > 0 && (
                <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2">
                  <h5 className="font-bold text-xs text-amber-950 font-outfit uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Critical Gaps to Address Prior to Board Submission</span>
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-xs text-amber-900 font-sans">
                    {readiness.criticalGaps.map((gap, i) => (
                      <li key={i}>{gap}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              NEW: STANDARDIZED 8-CRITERION WEFE COMPOSITE RATING (0-100)
          ═══════════════════════════════════════════════════════════════ */}
          {activeDomain === 'climate_finance' && subTab === 'wefe_composite' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="Verified NARC/WB Empirical"
                source="OECD-DAC / EU PRIMA Standardized 8-Dimension Nexus Composite Scoring Methodology"
                limitation="Weights normalized equally at 12.5 pts per dimension to ensure cross-district comparability across funding proposals."
                recommendation="Include this standardized rubric in Section 3 of multilateral grant concept notes."
              />

              {/* Master Rating Card */}
              <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Standardized Funder Rubric
                    </span>
                    <span className="text-xs text-slate-400 font-mono">OECD-DAC Aligned</span>
                  </div>
                  <h3 className="text-2xl font-extrabold font-outfit mt-1 text-slate-100">
                    WEFE Project Composite Score
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Universal 8-dimension rating for {output.cropName} in {output.districtName}.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-center font-mono">
                    <span className="text-3xl font-black text-emerald-400">{wefCompositeScore.totalScore}</span>
                    <span className="text-slate-500 text-xs font-normal"> / 100</span>
                  </div>
                  <div className="border-l border-slate-800 pl-4 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-sans uppercase">Funder Classification</span>
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                      {wefCompositeScore.funderLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* 8 Criteria Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
                {[
                  { label: '1. Water Impact', score: wefCompositeScore.waterImpact, desc: 'Efficiency & springshed harmony', icon: '💧', color: 'text-sky-700' },
                  { label: '2. Energy Integration', score: wefCompositeScore.energyIntegration, desc: 'Clean solar/hydro & tariff savings', icon: '⚡', color: 'text-amber-700' },
                  { label: '3. Food Security', score: wefCompositeScore.foodSecurityImpact, desc: 'Caloric density & import displacement', icon: '🌾', color: 'text-emerald-700' },
                  { label: '4. Ecosystem Health', score: wefCompositeScore.ecosystemBenefits, desc: 'Carbon sink & RUSLE soil binding', icon: '🌲', color: 'text-teal-700' },
                  { label: '5. Climate Resilience', score: wefCompositeScore.climateResilience, desc: 'IPCC vulnerability suppression', icon: '🛡️', color: 'text-blue-700' },
                  { label: '6. Financial Return', score: wefCompositeScore.financialAttractiveness, desc: 'EIRR hurdle & DSCR cushion', icon: '💰', color: 'text-purple-700' },
                  { label: '7. Innovation & GESI', score: wefCompositeScore.innovation, desc: 'Feminized labor & circular entropy', icon: '👩‍🌾', color: 'text-rose-700' },
                  { label: '8. Replicability', score: wefCompositeScore.replicability, desc: 'District GDP multiplier & basin reach', icon: '🔄', color: 'text-indigo-700' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-base">{item.icon}</span>
                      <span className={`font-bold text-sm ${item.color}`}>{item.score} / 12.5</span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 font-sans text-xs">{item.label}</div>
                      <div className="text-[11px] text-slate-500 font-sans mt-0.5">{item.desc}</div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${(item.score / 12.5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              ENHANCED GCF & WORLD BANK REED PIPELINE (WITH INCREMENTAL COST)
          ═══════════════════════════════════════════════════════════════ */}
          {activeDomain === 'climate_finance' && subTab === 'gcf_pipeline' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="Verified NARC/WB Empirical"
                source="World Bank REED Project Appraisal Document (PAD-3712) & GCF Blended Finance Policy"
                limitation="Actual farmgate financial returns depend on wholesale price volatility and seasonal freight fluctuations."
                recommendation="Establish cooperative forward contracting and warehouse receipt financing at local Agriculture Knowledge Centers."
              />

              {/* Incremental Cost / Nexus Premium Analysis Callout */}
              <div className="p-5 bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-2xl border border-emerald-800 shadow-md space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800/60 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700">
                      GEF / GCF Policy Hurdle
                    </span>
                    <h4 className="text-base font-bold font-outfit text-white mt-1">
                      Incremental Cost Analysis & Nexus Premium
                    </h4>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[10px] text-emerald-400 block font-sans">Co-Benefit Multiplier</span>
                    <span className="text-xl font-extrabold text-emerald-300">{gcfInvestment.incrementalBenefitMultiplier}x Return</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-slate-400 font-sans text-[11px]">Siloed Sector Baseline</div>
                    <div className="text-base font-bold text-slate-200 mt-0.5">${(gcfInvestment.baselineSiloedCostUsd / 1000000).toFixed(2)}M USD</div>
                    <div className="text-[10px] text-slate-500 font-sans mt-0.5">3 separate uncoordinated projects</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-slate-400 font-sans text-[11px]">Integrated Nexus Project</div>
                    <div className="text-base font-bold text-emerald-400 mt-0.5">${(gcfInvestment.totalProjectInvestmentUsd / 1000000).toFixed(2)}M USD</div>
                    <div className="text-[10px] text-slate-500 font-sans mt-0.5">Single multi-stakeholder facility</div>
                  </div>
                  <div className="p-3 bg-emerald-900/30 rounded-xl border border-emerald-700/60">
                    <div className="text-emerald-300 font-sans text-[11px]">Nexus Premium (+28%)</div>
                    <div className="text-base font-bold text-emerald-300 mt-0.5">+${(gcfInvestment.incrementalCostUsd / 1000000).toFixed(2)}M USD</div>
                    <div className="text-[10px] text-emerald-400 font-sans mt-0.5">Unlocks cross-pillar co-benefits</div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
                  {gcfInvestment.incrementalCostRationale}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1 text-center">
                  <div className="text-slate-500 font-sans text-xs">Benchmark Project EIRR</div>
                  <div className="text-2xl font-extrabold text-emerald-700 mt-1">{investmentBenchmark.economicInternalRateOfReturnEIRR}%</div>
                  <div className="text-[11px] text-slate-400 font-sans">{investmentBenchmark.sourceProject.split(' ')[0]} Verified</div>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1 text-center">
                  <div className="text-slate-500 font-sans text-xs">Financial Net Present Value</div>
                  <div className="text-2xl font-extrabold text-blue-700 mt-1">NPR {investmentBenchmark.financialNPVNpr.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-400 font-sans">@ {investmentBenchmark.discountRatePct}% Social Discount</div>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1 text-center">
                  <div className="text-slate-500 font-sans text-xs">Benefit-Cost Ratio (BCR)</div>
                  <div className="text-2xl font-extrabold text-purple-700 mt-1">{investmentBenchmark.benefitCostRatioBCR}x</div>
                  <div className="text-[11px] text-slate-400 font-sans">Payback: {investmentBenchmark.paybackPeriodYears} Years</div>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1 text-center">
                  <div className="text-slate-500 font-sans text-xs">Price Switching Value</div>
                  <div className="text-2xl font-extrabold text-rose-700 mt-1">{investmentBenchmark.farmgateSwitchingValuePriceDropPct}%</div>
                  <div className="text-[11px] text-slate-400 font-sans">Max Tolerable Price Crash</div>
                </div>
              </div>

              {/* GCF 6-Dimension Scorecard */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h5 className="font-bold text-sm text-slate-900 font-outfit flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>GCF Sovereign Investment Scorecard (Scale: 1–10)</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {gcfInvestment.gcfScorecard.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 font-sans">{item.criterion}</span>
                        <span className="font-mono font-bold text-emerald-700">{item.score} / {item.maxScore}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-sans">{item.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeDomain === 'climate_finance' && subTab === 'parametric_insurance' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="Calibrated Satellite Proxy"
                source="Nepal Insurance Authority (Beema Samiti) & NASA Precipitation Anomalies"
                limitation="Historical crop-cutting experiment (CCE) logs are currently stored in paper books at District AKCs."
                recommendation="Digitize historical paper CCE records into a centralized Actuarial Insurance Clearinghouse to calibrate triggers."
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-center">
                  <div className="text-slate-500 font-sans text-xs">Drought Strike Trigger</div>
                  <div className="text-2xl font-extrabold text-rose-700">&lt; {parametricInsurance.droughtTriggerMm} mm</div>
                  <div className="text-[11px] text-slate-400 font-sans">30-day cumulative rainfall threshold</div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-center">
                  <div className="text-slate-500 font-sans text-xs">Excess Cloudburst Trigger</div>
                  <div className="text-2xl font-extrabold text-sky-700">&gt; {parametricInsurance.excessRainTriggerMm} mm</div>
                  <div className="text-[11px] text-slate-400 font-sans">48-hour extreme deluge trigger</div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-center">
                  <div className="text-slate-500 font-sans text-xs">Subsidized Farmer Premium</div>
                  <div className="text-2xl font-extrabold text-emerald-700">NPR {parametricInsurance.subsidizedFarmerPremiumNpr} <span className="text-xs font-normal text-slate-500">/ ha</span></div>
                  <div className="text-[11px] text-slate-400 font-sans">70% GoN Premium Subsidy</div>
                </div>
              </div>
            </div>
          )}

          {activeDomain === 'climate_finance' && subTab === 'bank_credit' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="Verified NARC/WB Empirical"
                source="Nepal Rastra Bank (NRB) 15% Mandatory Agricultural Lending Directives"
                limitation="Commercial banks require land collateral in the absence of centralized digital crop lien registries."
                recommendation="Establish a digital Warehouse Receipt Registry & movable collateral registry to enable pure cash-flow based agri-lending."
              />

              {/* Interactive Financial DCF Chart if not empirical_only */}
              {studyViewMode !== 'empirical_only' && (
                <FinancialDcfChart
                  districtName={output.districtName}
                  cropName={output.cropName}
                  initialCapexNpr={deep.gcfInvestment.totalProjectInvestmentNpr || 450000}
                  netPresentValueNpr10Pct={deep.bankCredit.netPresentValueNpr10Pct}
                  economicInternalRateOfReturnEIRR={deep.gcfInvestment.eirrPercent || 18.4}
                  benefitCostRatioBCR={deep.gcfInvestment.benefitCostRatio || 2.35}
                  paybackPeriodYears={deep.bankCredit.paybackPeriodYears ?? undefined}
                />
              )}

              {studyViewMode !== 'visual_only' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center space-y-1">
                    <div className="text-slate-500 font-sans text-xs">Bank Credit Rating</div>
                    <div className="text-2xl font-extrabold text-emerald-700 mt-1">{bankCredit.bankRiskGrade.split(' ')[0]}</div>
                    <div className="text-[11px] text-slate-400 font-sans">{bankCredit.bankRiskGrade}</div>
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center space-y-1">
                    <div className="text-slate-500 font-sans text-xs">Debt-Service Ratio (DSCR)</div>
                    <div className="text-2xl font-extrabold text-blue-700 mt-1">{bankCredit.debtServiceCoverageRatio}x</div>
                    <div className="text-[11px] text-slate-400 font-sans">Min Benchmark: 1.30x</div>
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center space-y-1">
                    <div className="text-slate-500 font-sans text-xs">Max Safe Loan Ceiling</div>
                    <div className="text-xl font-extrabold text-purple-700 mt-1">NPR {bankCredit.maximumSafeLoanCeilingNpr.toLocaleString()}</div>
                    <div className="text-[11px] text-slate-400 font-sans">Cooperative Batch Limit</div>
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center space-y-1">
                    <div className="text-slate-500 font-sans text-xs">Default Risk Probability</div>
                    <div className="text-2xl font-extrabold text-teal-700 mt-1">{bankCredit.defaultRiskProbabilityPct}%</div>
                    <div className="text-[11px] text-slate-400 font-sans">36-Month Tenor Horizon</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
          DOMAIN 4: POLICY, DONOR MAP & SOVEREIGN PAD VIEWS
         ═══════════════════════════════════════════════════════════════ */}
          {activeDomain === 'policy_gesi_pad' && subTab === 'donor_project_map' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="Verified NARC/WB Empirical"
                source="Ministry of Finance IECCD Active Development Partner Portfolio (2024–2027)"
                limitation="Multilateral donors often operate in the same districts with overlapping subsidy schemes."
                recommendation="Mandate digital project alignment registries for all municipal agricultural tenders to capture co-financing."
              />

              {/* Interactive Multilateral Donor Network Graph if not empirical_only */}
              {studyViewMode !== 'empirical_only' && (
                <DonorNetworkGraph districtName={output.districtName} />
              )}

              {studyViewMode !== 'visual_only' && (
                <>
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-950 flex items-center justify-between">
                    <span className="font-sans font-medium">{donorAlignment.matchingStrategy}</span>
                    <span className="font-mono font-bold text-xs bg-blue-100 text-blue-900 px-3 py-1 rounded-xl border border-blue-300 shrink-0 ml-3">
                      ${donorAlignment.totalAvailableDonorBudgetUsd}M Active Pipeline
                    </span>
                  </div>

                  {/* Watershed & River Basin Governance Unit Card */}
                  <div className="p-5 bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl border border-sky-200 shadow-2xs space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-200/80 pb-2">
                      <div className="flex items-center gap-2">
                        <Waves className="w-4 h-4 text-sky-700" />
                        <span className="font-bold text-sm text-slate-900 font-outfit">
                          {basinCascade.basinName}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded border border-sky-300">
                          {basinCascade.elevationZone}
                        </span>
                      </div>
                      <span className="font-mono text-slate-600 text-xs">
                        Area: {basinCascade.basinAreaKm2.toLocaleString()} km² • Pop: {basinCascade.basinPopulationM}M
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                      <div className="p-2.5 bg-white rounded-xl border border-sky-100">
                        <div className="text-slate-500 font-sans">Downstream Impact Zone</div>
                        <div className="font-bold text-slate-900 mt-0.5">{basinCascade.downstreamDistrictsAffected} Districts Cascaded</div>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-sky-100">
                        <div className="text-slate-500 font-sans">Downstream Water Yield</div>
                        <div className="font-bold text-sky-800 mt-0.5">{basinCascade.downstreamWaterYieldRatio} Ratio Buffer</div>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-sky-100">
                        <div className="text-slate-500 font-sans">Upstream Soil Retention</div>
                        <div className="font-bold text-emerald-800 mt-0.5">+{basinCascade.sedimentMitigationTonsPerHa} t/ha/yr Silt Shield</div>
                      </div>
                    </div>

                    <div className="p-3 bg-white/90 rounded-xl border border-sky-200 text-slate-700 font-sans leading-relaxed">
                      <strong>Watershed Governance Mandate (Nepal Position Paper):</strong> {basinCascade.watershedGovernanceNote}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {donorAlignment.activeProjects.map((p) => (
                      <div key={p.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b pb-2">
                          <div>
                            <h5 className="font-bold text-sm text-slate-900 font-outfit">{p.projectName}</h5>
                            <span className="text-[11px] font-mono text-slate-500">{p.partnerName} • Code: {p.projectCode}</span>
                          </div>
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                            ${p.totalBudgetUsdMillion}M USD ({p.projectDuration})
                          </span>
                        </div>

                        <div className="text-slate-700 font-sans">
                          <strong>Core Sectors:</strong> {p.coreInterventionSectors.join(' • ')}
                        </div>

                        <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-emerald-950 font-sans">
                          <strong>Co-Financing Window:</strong> {p.coFinancingOpportunity}
                        </div>

                        <div className="text-[11px] text-slate-500 font-sans">
                          <strong>Anti-Duplication Guidance:</strong> {p.antiDuplicationPolicyGuidance}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeDomain === 'policy_gesi_pad' && subTab === 'gender_budget' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="User-Adjustable Baseline"
                source="MoALD Gender and Social Inclusion (GESI) Guidelines & SuTRA Budget Baseline"
                limitation="Palika agriculture budget allocations vary between 0.2% and 8.5% across different municipal leaderships."
                recommendation="Enact provincial bylaws mandating a minimum 5% municipal agriculture allocation for women-led custom hiring centers."
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {genderPlan.womenFriendlyMicroMechanization.map((w, idx) => (
                  <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <h5 className="font-bold text-sm text-slate-900 font-outfit">{w.toolName}</h5>
                    <div className="text-xs font-mono text-emerald-700 font-bold">-{w.drudgeryReductionPct}% Labor Drudgery</div>
                    <div className="text-xs text-slate-600 font-sans">Saves ~{w.laborHoursSavedPerHa} hours manual weeding per ha</div>
                    <div className="text-[11px] font-mono text-slate-500 pt-1 border-t">
                      Cost: NPR {w.costNpr.toLocaleString()} • {w.womenCooperativeSubsidyEligibility}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-sm text-slate-900 font-outfit">{municipalBudget.municipalityName} Agriculture Budget Allocation Optimizer</span>
                  <span className="text-xs font-mono text-slate-500">Agri Budget: NPR {municipalBudget.actualAgriAllocationNpr.toLocaleString()} ({municipalBudget.agriBudgetSharePct}% of total)</span>
                </div>

                <div className="space-y-2">
                  {municipalBudget.optimizedSubAllocations.map((a, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 font-sans">{a.program}</span>
                        <p className="text-[11px] text-slate-500 font-sans mt-0.5">{a.expectedOutcome}</p>
                      </div>
                      <div className="text-right shrink-0 font-mono">
                        <span className="font-bold text-emerald-800">NPR {a.allocatedAmountNpr.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 block">{a.currentSharePct}% → {a.recommendedSharePct}% share</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeDomain === 'policy_gesi_pad' && subTab === 'ndc_tracker' && (
            <div className="space-y-6">
              <ProvenanceBanner
                grade="Verified NARC/WB Empirical"
                source="Nepal Second Nationally Determined Contribution (2020) & Long-Term Strategy 2045"
                limitation="Sub-national municipal tracking of Soil Organic Matter (SOM) is not yet integrated into provincial reporting."
                recommendation="Institutionalize biennial municipal soil carbon reporting under the National Climate Change Policy."
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ndcTargets.map((t) => (
                  <div key={t.targetId} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">{t.sdgLinkage}</span>
                      <span className="font-mono text-xs font-bold text-slate-900">{t.districtProgressPct}% Progress</span>
                    </div>
                    <h5 className="font-bold text-sm text-slate-900 font-outfit">{t.ndcCommitmentTitle}</h5>
                    <p className="text-xs text-slate-600 font-sans leading-relaxed">{t.national2030Target}</p>
                    <div className="text-[11px] text-emerald-800 font-sans pt-1 border-t border-slate-100 font-medium">
                      Contribution: {t.currentDistrictContribution}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeDomain === 'policy_gesi_pad' && subTab === 'data_integrity' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <span className="text-sm">
                  <strong>Data Provenance, Integrity Matrix & Sovereign Action Roadmap:</strong> Full transparency statement declaring verified empirical datasets, satellite proxy fallbacks, current technological limitations in Nepal, and actionable institutional steps to bridge each gap.
                </span>
              </div>

              <div className="space-y-4">
                {DATA_INTEGRITY_MATRIX.map((d) => (
                  <div key={d.domainId} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b pb-2">
                      <div>
                        <h5 className="font-bold text-sm text-slate-900 font-outfit">{d.domainTitle}</h5>
                        <span className="text-[11px] text-slate-500 font-sans">Category: <strong>{d.category}</strong></span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border shrink-0 ${d.uncertaintyGrade === 'Verified NARC/WB Empirical'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : d.uncertaintyGrade === 'Calibrated Satellite Proxy'
                            ? 'bg-sky-100 text-sky-900 border-sky-300'
                            : d.uncertaintyGrade === 'Simulated Policy Scenario'
                              ? 'bg-purple-100 text-purple-900 border-purple-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}>
                        {d.uncertaintyGrade}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <div className="font-bold text-slate-700 font-sans">🇳🇵 Current Reality in Nepal (The Data Gap):</div>
                        <p className="text-[11px] text-slate-600 font-sans leading-relaxed">{d.nepalDataReality}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <div className="font-bold text-slate-700 font-sans">🛠️ Our Platform’s Transparent Method & Proxy:</div>
                        <p className="text-[11px] text-slate-600 font-sans leading-relaxed">{d.platformMethodologyAndProxy}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                      <div className="font-bold text-emerald-950 font-sans">🚀 Recommended Sovereign Action to Help Nepal:</div>
                      <p className="text-[11px] text-emerald-900 font-sans leading-relaxed">{d.sovereignActionToHelpNepal}</p>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono pt-1">
                      Primary Sources Cited: {d.primarySourcesCited.join(' • ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeDomain === 'policy_gesi_pad' && subTab === 'sovereign_pad' && (
            <div className="space-y-6">
              {/* 5-Pillar WEFES Nexus Radar Spider Chart if not empirical_only */}
              {studyViewMode !== 'empirical_only' && (
                <NexusRadarSpider
                  districtName={output.districtName}
                  cropName={output.cropName}
                  waterScore={Math.max(10, Math.min(100, Math.round(100 - output.water.waterStressIndex)))}
                  energyScore={Math.max(10, Math.min(100, Math.round(100 - output.energy.fossilSharePercent)))}
                  foodScore={output.food.foodSecurityIndex}
                  ecosystemScore={output.ecosystem.ecoHealthScore}
                  socioeconomicScore={Math.max(10, Math.min(100, Math.round(output.nexusBalanceIndex)))}
                />
              )}

              {studyViewMode !== 'visual_only' && (
                <div className="p-6 bg-white rounded-2xl border border-slate-300 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <span className="font-bold text-base text-slate-900 font-outfit flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        Official Sovereign Project Appraisal Document (PAD)
                      </span>
                      <span className="text-xs font-mono text-slate-500">Document Reference: GCF-NEPAL-SOVEREIGN-PAD-2026</span>
                    </div>
                    <button
                      onClick={handlePrintDossier}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:bg-slate-800 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Official PAD
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-slate-500 font-sans text-[11px]">Project Scale</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">${(gcfInvestment.totalProjectInvestmentUsd / 1000000).toFixed(1)}M USD</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-slate-500 font-sans text-[11px]">REED EIRR Financials</div>
                      <div className="font-bold text-emerald-800 text-sm mt-0.5">{investmentBenchmark.economicInternalRateOfReturnEIRR}% (BCR: {investmentBenchmark.benefitCostRatioBCR}x)</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-slate-500 font-sans text-[11px]">Beneficiary Target</div>
                      <div className="font-bold text-purple-800 text-sm mt-0.5">{gcfInvestment.directBeneficiariesTotal.toLocaleString()} smallholders</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-slate-500 font-sans text-[11px]">Bankability Grade</div>
                      <div className="font-bold text-blue-800 text-sm mt-0.5">{bankCredit.bankRiskGrade.split(' ')[0]} (DSCR: {bankCredit.debtServiceCoverageRatio}x)</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans pt-2 border-t border-slate-200">
                    <h5 className="font-bold text-slate-900 font-outfit">1. Strategic Objective & Context</h5>
                    <p>
                      This Sovereign Project Appraisal evaluates the deployment of climate-resilient agriculture for <strong>{output.cropName}</strong> across <strong>{output.districtName}</strong> District. The intervention addresses critical dry-season irrigation constraints, mountain terrace erosion, and youth outmigration through blended solar micro-drip mechanization.
                    </p>

                    <h5 className="font-bold text-slate-900 font-outfit pt-2">2. Financial & Economic Feasibility</h5>
                    <p>
                      The project achieves a benchmark Economic Internal Rate of Return (EIRR) of <strong>{investmentBenchmark.economicInternalRateOfReturnEIRR}%</strong> and a Benefit-Cost Ratio of <strong>{investmentBenchmark.benefitCostRatioBCR}x</strong>, backed by World Bank REED project models. The debt-service coverage ratio (DSCR) of <strong>{bankCredit.debtServiceCoverageRatio}x</strong> fully qualifies under Nepal Rastra Bank mandatory 15% priority agricultural credit allocations.
                    </p>

                    <h5 className="font-bold text-slate-900 font-outfit pt-2">3. Institutional Data Integrity Statement</h5>
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-200 font-sans">
                      <strong>Data Provenance Notice:</strong> Agronomic cultivars are drawn from NARC official registries (1999–2025); fertilizer dosing utilizes 2022 NARC-QUEFTS site-specific tables; financial projections are calibrated against World Bank REED project models (PAD-3712). Meteorological timelines utilize NASA MERRA-2 39-year gridded satellite proxies pending DHM real-time API integration. Carbon revenue is modeled as a sensitivity scenario pending Article 6.2 bilateral authorization bylaws.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* End of Active Sub-Module Views Canvas */}
        </div>
      </div>

      {/* Bottom Unified Quick Navigation Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 bg-white/95 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onBackToAnalysis}
            className="text-xs text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1 transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Analysis Report</span>
          </button>

          <button
            onClick={onBackToDistrict}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs"
          >
            <span>{output.districtName} District</span>
          </button>

          <button
            onClick={onBackToMap}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs"
          >
            <span>National Map</span>
          </button>
        </div>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs"
        >
          <ArrowUp className="w-4 h-4 text-slate-500" />
          <span>Scroll to Top</span>
        </button>
      </div>

    </div>
  );
};

interface ProvenanceBannerProps {
  grade: 'Verified NARC/WB Empirical' | 'Calibrated Satellite Proxy' | 'Simulated Policy Scenario' | 'User-Adjustable Baseline';
  source: string;
  limitation: string;
  recommendation: string;
}

const ProvenanceBanner: React.FC<ProvenanceBannerProps> = ({ grade, source, limitation, recommendation }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const badgeColor =
    grade === 'Verified NARC/WB Empirical'
      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
      : grade === 'Calibrated Satellite Proxy'
        ? 'bg-sky-100 text-sky-900 border-sky-300'
        : grade === 'Simulated Policy Scenario'
          ? 'bg-purple-100 text-purple-900 border-purple-300'
          : 'bg-amber-100 text-amber-900 border-amber-300';

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-slate-50 text-xs space-y-2.5 shadow-2xs transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-2">
        <div className="flex items-center gap-2 font-bold text-slate-800 font-outfit text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Data Provenance & Sovereign Audit Notice:</span>
          <span className="font-normal text-slate-500 font-sans text-[11px] truncate max-w-xs sm:max-w-md hidden sm:inline">
            {source}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${badgeColor}`}>
            {grade}
          </span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[11px] text-slate-600 hover:text-slate-900 font-semibold cursor-pointer flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs"
          >
            <span>{isOpen ? 'Collapse ▴' : 'Inspect Audit ▾'}</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] font-sans pt-0.5 animate-fade-in-up">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
            <strong className="text-slate-800 block text-[11px]">🏛️ Primary Empirical Source:</strong>
            <p className="text-slate-600 leading-relaxed">{source}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-0.5">
            <strong className="text-amber-900 block text-[11px]">⚠️ Nepal Boundary Reality:</strong>
            <p className="text-amber-950/80 leading-relaxed">{limitation}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 space-y-0.5">
            <strong className="text-emerald-950 block text-[11px]">💡 Sovereign Policy Action:</strong>
            <p className="text-emerald-900 leading-relaxed">{recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
};
