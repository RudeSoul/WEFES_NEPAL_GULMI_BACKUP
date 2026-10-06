import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calculator,
  Coins,
  Droplets,
  FileText,
  Info,
  Scale,
  SlidersHorizontal,
  Sprout,
  Trees,
  Users,
  Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

import { ROUTES } from '../../routes/paths';
import { useNexusStore } from '../../store';

import { FactorDetailModal } from './FactorDetailModal';
import { NexusScientificModal } from './NexusScientificModal';

export const AnalysisDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const output = useNexusStore((s) => s.analysisOutput);
  const selectedPalikaName = useNexusStore((s) => s.selectedPalikaName);

  const onOpenSimulator = () => navigate(ROUTES.SIMULATOR);
  const onOpenDossier = () => navigate(ROUTES.DOSSIER);
  const onBackToDistrict = () =>
    navigate(selectedPalikaName ? `/palikas/${encodeURIComponent(selectedPalikaName)}` : ROUTES.PALIKAS);
  const onBackToMap = () => navigate(ROUTES.MAP);

  const [selectedFactorKey, setSelectedFactorKey] = useState<string | null>(null);
  const [isScientificModalOpen, setIsScientificModalOpen] = useState(false);

  if (!output) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-600 font-medium mb-4">{t('analysis.no_analysis')}</p>
        <button
          onClick={onBackToMap}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
        >
          {t('analysis.go_to_map')}
        </button>
      </div>
    );
  }

  const radarData = [
    { pillar: t('analysis.water_resource'), score: 100 - output.water.waterStressIndex },
    { pillar: t('analysis.energy_clean'), score: 100 - output.energy.fossilSharePercent },
    { pillar: t('analysis.food_security'), score: output.food.foodSecurityIndex },
    { pillar: t('analysis.ecosystem_health'), score: output.ecosystem.ecoHealthScore },
    {
      pillar: t('analysis.socio_return'),
      score: Math.min(
        100,
        Math.round((output.socioeconomics.netRevenueNpr / Math.max(1, output.socioeconomics.grossRevenueNpr)) * 100)
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Header Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm bg-white/95 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Column: Navigation, Title & Crop Specs */}
        <div className="space-y-1.5">
          {/* Breadcrumbs & Domain Tag */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <button
              onClick={onBackToDistrict}
              className="hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('common.back_to_district', { district: output.districtName })}</span>
            </button>
            <span className="text-slate-300">/</span>
            <button
              onClick={onBackToMap}
              className="hover:text-emerald-700 transition-colors cursor-pointer text-slate-400"
            >
              {t('common.back_to_map')}
            </button>
            <span className="text-slate-300">/</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
              <Activity className="w-3 h-3 text-emerald-600" />
              <span>5-Pillar Nexus Analysis</span>
            </span>
          </div>

          {/* Title & Harvest Target Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-outfit">
              {t('analysis.crop_in_district', { crop: output.cropName, district: output.districtName })}
            </h2>
            <div className="inline-flex items-center gap-1.5 text-xs bg-slate-100/90 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/80 font-medium">
              <span className="text-slate-400 font-normal">{t('analysis.harvest_target')}</span>
              <strong className="text-slate-900 font-bold">
                {output.inputQuantity.toLocaleString()} {output.inputUnit}
              </strong>
              {output.inputUnit !== output.baseUnit && (
                <span className="text-slate-500 text-[11px]">
                  ({output.baseQuantity.toLocaleString()} {output.baseUnit})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Streamlined Toolbar (Unified 40px Height) */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
          {/* Score & Rating Pill */}
          <div className="h-10 flex items-center gap-2.5 bg-slate-50/90 border border-slate-200 rounded-xl px-3 shadow-2xs">
            <div className="flex items-center justify-center h-6 min-w-6 px-1.5 rounded-md bg-emerald-600 text-white font-extrabold text-xs font-outfit shadow-2xs">
              {output.nexusBalanceIndex}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-slate-900">{output.nexusRating}</span>
              <span className="text-[11px] font-semibold text-slate-400">({output.nexusBalanceIndex}/100)</span>
            </div>
          </div>

          <div className="hidden sm:block h-5 w-px bg-slate-200 mx-0.5" />

          {/* Action: Quick Math Modal */}
          <button
            type="button"
            onClick={() => setIsScientificModalOpen(true)}
            className="h-10 flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 px-3.5 rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer font-semibold text-xs group"
            title="Inspect live mathematical equations and numerical substitution"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span>Inspect Math</span>
          </button>

          {/* Action: Navigate to Full Policy Dossier */}
          <button
            type="button"
            onClick={onOpenDossier}
            className="h-10 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 rounded-xl border border-emerald-600 hover:border-emerald-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer font-semibold text-xs group"
            title="Open the complete multi-sector policy dossier"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-100 group-hover:scale-110 transition-transform" />
            <span>Policy Dossier</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* ── BIOPHYSICAL FEASIBILITY BANNER ─────────────────────────────────────── */}
      {output.agroSuitability.suitabilityFactor < 0.95 && (
        <div
          className={`rounded-xl border px-4 py-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-3 ${
            !output.agroSuitability.isBiophysicallyFeasible
              ? 'bg-red-50 border-red-300'
              : output.agroSuitability.suitabilityScore < 65
                ? 'bg-amber-50 border-amber-300'
                : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <div className={`text-2xl shrink-0 ${!output.agroSuitability.isBiophysicallyFeasible ? '' : ''}`}>
            {!output.agroSuitability.isBiophysicallyFeasible
              ? '🚫'
              : output.agroSuitability.suitabilityScore < 65
                ? '⚠️'
                : '📉'}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className={`text-xs font-bold uppercase tracking-wide mb-0.5 ${
                !output.agroSuitability.isBiophysicallyFeasible ? 'text-red-800' : 'text-amber-800'
              }`}
            >
              {!output.agroSuitability.isBiophysicallyFeasible
                ? 'Biophysical Feasibility Failure — Crop Incompatible With This District'
                : 'Suboptimal Agro-Ecological Conditions Detected'}
            </div>
            <p
              className={`text-xs leading-relaxed ${
                !output.agroSuitability.isBiophysicallyFeasible ? 'text-red-700' : 'text-amber-700'
              }`}
            >
              FAO suitability: <strong>{output.agroSuitability.faoClass}</strong>
              {' · '}Limiting factor: <strong>{output.agroSuitability.limitingFactor}</strong>
              {' · '}Suitability score: <strong>{output.agroSuitability.suitabilityScore}/100</strong>
            </p>
          </div>
          <div className="shrink-0 text-right bg-white/80 border border-current/20 rounded-lg px-3 py-2">
            <div
              className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                !output.agroSuitability.isBiophysicallyFeasible ? 'text-red-700' : 'text-amber-700'
              }`}
            >
              Realized Yield
            </div>
            <div
              className={`text-lg font-black font-mono ${
                !output.agroSuitability.isBiophysicallyFeasible ? 'text-red-800' : 'text-amber-800'
              }`}
            >
              {output.agroSuitability.realizedQuantity.toLocaleString()}
              <span className="text-xs font-normal ml-0.5">{output.baseUnit}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              of {output.baseQuantity.toLocaleString()} target (
              <span
                className={`font-bold ${!output.agroSuitability.isBiophysicallyFeasible ? 'text-red-600' : 'text-amber-600'}`}
              >
                -{output.agroSuitability.unrealizedQuantityPct}% yield loss
              </span>
              )
            </div>
          </div>
        </div>
      )}
      {/* ─────────────────────────────────────────────────────────────────────── */}

      <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
        <span className="flex items-center gap-1.5 font-medium text-slate-600">
          <Info className="w-3.5 h-3.5 text-emerald-600" />
          <span>Click any factor card to inspect 10-year predictive impact & micro-scenarios</span>
        </span>
        <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-400">
          6 Multi-Pillar Dimensions
        </span>
      </div>

      {/* 6 Top Clickable KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Water KPI */}
        <div
          onClick={() => setSelectedFactorKey('water')}
          className="p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-sky-300 hover:shadow-md cursor-pointer transition-all group flex flex-col justify-between shadow-2xs relative"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Droplets className="w-4 h-4" />
              </div>
              <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200/80 px-2 py-0.5 rounded-md font-semibold tracking-tight">
                {output.water.rating.replace(/ Water Stress/i, '')}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Water Stress</span>
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-sky-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5 font-outfit">
              {output.water.waterStressIndex} <span className="text-xs font-semibold text-slate-400">/ 100</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-2 pt-2 border-t border-slate-100">
            {output.water.consumptionLiters.toLocaleString()} L total
          </div>
        </div>

        {/* Energy KPI */}
        <div
          onClick={() => setSelectedFactorKey('energy')}
          className="p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-amber-300 hover:shadow-md cursor-pointer transition-all group flex flex-col justify-between shadow-2xs relative"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200/80 px-2 py-0.5 rounded-md font-semibold tracking-tight">
                {Math.round(100 - output.energy.fossilSharePercent)}% Clean
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Energy Load</span>
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5 font-outfit">
              {output.energy.loadKwh.toLocaleString()} <span className="text-xs font-semibold text-slate-400">kWh</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-2 pt-2 border-t border-slate-100">
            {output.energy.fossilSharePercent}% Grid draw
          </div>
        </div>

        {/* Food KPI */}
        <div
          onClick={() => setSelectedFactorKey('food')}
          className="p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-emerald-300 hover:shadow-md cursor-pointer transition-all group flex flex-col justify-between shadow-2xs relative"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-md font-semibold tracking-tight">
                Score {output.food.foodSecurityIndex}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Yield Biomass</span>
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5 font-outfit">
              {output.food.yieldKg.toLocaleString()} <span className="text-xs font-semibold text-slate-400">kg</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-2 pt-2 border-t border-slate-100">
            {output.food.nutritionalKcal.toLocaleString()} kcal caloric
          </div>
        </div>

        {/* Ecosystem KPI */}
        <div
          onClick={() => setSelectedFactorKey('ecosystem')}
          className="p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-teal-300 hover:shadow-md cursor-pointer transition-all group flex flex-col justify-between shadow-2xs relative"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Trees className="w-4 h-4" />
              </div>
              <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200/80 px-2 py-0.5 rounded-md font-semibold tracking-tight">
                Health {output.ecosystem.ecoHealthScore}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Carbon Offset</span>
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-teal-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5 font-outfit">
              {output.ecosystem.carbonOffsetKgCo2.toLocaleString()}{' '}
              <span className="text-xs font-semibold text-slate-400">kg</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-2 pt-2 border-t border-slate-100">
            Erosion score: {output.ecosystem.erosionMitigationIndex}
          </div>
        </div>

        {/* Net Revenue KPI */}
        <div
          onClick={() => setSelectedFactorKey('revenue')}
          className="p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-purple-300 hover:shadow-md cursor-pointer transition-all group flex flex-col justify-between shadow-2xs relative"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200/80 px-2 py-0.5 rounded-md font-semibold tracking-tight">
                Net Profit
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Net Revenue</span>
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-purple-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5 font-outfit">
              NPR {output.socioeconomics.netRevenueNpr.toLocaleString()}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-2 pt-2 border-t border-slate-100">
            Gross: NPR {output.socioeconomics.grossRevenueNpr.toLocaleString()}
          </div>
        </div>

        {/* Jobs Created KPI */}
        <div
          onClick={() => setSelectedFactorKey('jobs')}
          className="p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all group flex flex-col justify-between shadow-2xs relative"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded-md font-semibold tracking-tight">
                {output.socioeconomics.laborDays} Days
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Jobs Created</span>
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5 font-outfit">
              {output.socioeconomics.directJobsCreated}{' '}
              <span className="text-xs font-semibold text-slate-400">Direct FTE</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-2 pt-2 border-t border-slate-100">
            +{output.socioeconomics.indirectJobsCreated} Indirect jobs
          </div>
        </div>
      </div>

      {/* Main Visuals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart (6 cols) */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm bg-white/95">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1 font-outfit">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>WEFES 5-Pillar Equilibrium Spider Radar</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Normalized balance profile across Water, Energy, Food, Ecosystem, and Socioeconomic sectors.
          </p>

          <div className="h-[300px] w-full bg-slate-50/60 rounded-xl p-2 border border-slate-200/80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis
                  dataKey="pillar"
                  stroke="#475569"
                  tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  stroke="#cbd5e1"
                  tick={{ fill: '#64748b', fontSize: 9 }}
                />
                <Radar name="Baseline Profile" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '0.5rem',
                    color: '#0f172a',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Footprint vs Value Creation (Input vs Output Balance) */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm bg-white/95 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-outfit">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>Resource Footprint vs. Value Creation</span>
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Input vs. Output
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Clear breakdown of natural resources consumed (costs) versus socioeconomic & ecological value returned.
            </p>

            {/* 2-Column Inputs vs Outputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
              {/* INPUTS / FOOTPRINT (What you spend) */}
              <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/90 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  <span className="flex items-center gap-1 text-sky-700">
                    <Droplets className="w-3.5 h-3.5" />
                    Resource Inputs
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">CONSUMPTION</span>
                </div>

                <div className="space-y-3">
                  {/* Water Item */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                        Water Footprint
                      </span>
                      <span className="font-mono font-bold text-sky-900">
                        {output.water.consumptionM3.toLocaleString()} m³
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-sky-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(8, output.water.waterStressIndex))}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span>{output.water.consumptionLiters.toLocaleString()} L total</span>
                      <span className="font-medium text-sky-700">{output.water.rating}</span>
                    </div>
                  </div>

                  {/* Energy Item */}
                  <div className="pt-2 border-t border-slate-200/60">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Energy Demand
                      </span>
                      <span className="font-mono font-bold text-amber-900">
                        {output.energy.loadKwh.toLocaleString()} kWh
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(8, 100 - output.energy.fossilSharePercent))}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span>{100 - output.energy.fossilSharePercent}% Clean Solar/Hydro</span>
                      <span className="font-medium text-amber-700">{output.energy.fossilSharePercent}% Grid</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* OUTPUTS / VALUE (What you gain) */}
              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/70 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-2.5">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <Coins className="w-3.5 h-3.5" />
                    Value Created
                  </span>
                  <span className="text-[10px] text-emerald-600 font-mono">BENEFITS</span>
                </div>

                <div className="space-y-3">
                  {/* Net Revenue Item */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        Net Farm Profit
                      </span>
                      <span className="font-mono font-bold text-purple-900">
                        NPR {output.socioeconomics.netRevenueNpr.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-purple-500 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, Math.max(10, Math.round((output.socioeconomics.netRevenueNpr / Math.max(1, output.socioeconomics.grossRevenueNpr)) * 100)))}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span>Gross: NPR {output.socioeconomics.grossRevenueNpr.toLocaleString()}</span>
                      <span className="font-medium text-purple-700">
                        {Math.round(
                          (output.socioeconomics.netRevenueNpr / Math.max(1, output.socioeconomics.grossRevenueNpr)) *
                            100
                        )}
                        % Margin
                      </span>
                    </div>
                  </div>

                  {/* Carbon Offset Item */}
                  <div className="pt-2 border-t border-emerald-200/60">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                        Carbon Offset
                      </span>
                      <span className="font-mono font-bold text-teal-900">
                        {(output.ecosystem.carbonOffsetKgCo2 / 1000).toFixed(2)} t CO₂e
                      </span>
                    </div>
                    <div className="w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-teal-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(10, output.ecosystem.ecoHealthScore))}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span>{output.ecosystem.carbonOffsetKgCo2.toLocaleString()} kg sequestered</span>
                      <span className="font-medium text-teal-700">Health: {output.ecosystem.ecoHealthScore}/100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Nexus Eco-Efficiency Ratios (Meaningful Trade-off Insight) */}
          <div className="pt-3 border-t border-slate-200/80 bg-slate-50/70 -mx-6 -mb-6 p-4 rounded-b-2xl">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Nexus Eco-Productivity (Return per Unit of Resource)</span>
              <span className="text-emerald-700 font-semibold font-mono">Efficiency Multipliers</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                <div className="text-[10px] text-slate-500 font-medium">Water Productivity</div>
                <div className="text-xs font-bold text-sky-950 font-mono mt-0.5">
                  NPR {(output.socioeconomics.netRevenueNpr / Math.max(1, output.water.consumptionM3)).toFixed(1)}{' '}
                  <span className="text-[10px] font-normal text-slate-400">/ m³</span>
                </div>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                <div className="text-[10px] text-slate-500 font-medium">Energy Productivity</div>
                <div className="text-xs font-bold text-amber-950 font-mono mt-0.5">
                  NPR {(output.socioeconomics.netRevenueNpr / Math.max(1, output.energy.loadKwh)).toFixed(1)}{' '}
                  <span className="text-[10px] font-normal text-slate-400">/ kWh</span>
                </div>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
                <div className="text-[10px] text-slate-500 font-medium">Carbon per Energy</div>
                <div className="text-xs font-bold text-teal-950 font-mono mt-0.5">
                  {(output.ecosystem.carbonOffsetKgCo2 / Math.max(1, output.energy.loadKwh)).toFixed(2)}{' '}
                  <span className="text-[10px] font-normal text-slate-400">kg CO₂/kWh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Card to Launch Scenario Simulator */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white/95 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-outfit">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>Simulate Climate, Market & Policy Scenarios</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Test 15+ environmental, energy, agronomic, and socioeconomic variables in real-time to observe trade-offs
            and 10-year projections.
          </p>
        </div>

        <button
          onClick={onOpenSimulator}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition-all shrink-0 cursor-pointer"
        >
          <span>{t('analysis.open_simulator')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Quick Navigation Bar */}
      <div className="flex items-center justify-between gap-3 p-4 bg-slate-50/90 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToDistrict}
            className="text-xs text-slate-800 hover:text-slate-950 font-bold flex items-center gap-1.5 transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600" />
            <span>{t('common.back_to_district', { district: output.districtName })}</span>
          </button>
          <button
            onClick={onBackToMap}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 transition-colors cursor-pointer bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm"
          >
            <span>{t('common.back_to_map')}</span>
          </button>
        </div>
      </div>

      {/* Factor Detail Modal */}
      {selectedFactorKey && (
        <FactorDetailModal factorKey={selectedFactorKey} onClose={() => setSelectedFactorKey(null)} />
      )}

      {/* WEFES Deep Scientific & Mathematical Proof Modal */}
      <NexusScientificModal isOpen={isScientificModalOpen} onClose={() => setIsScientificModalOpen(false)} />
    </div>
  );
};
