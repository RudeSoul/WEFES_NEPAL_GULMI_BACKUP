import React, { useState } from 'react';
import { WEFESOutput } from '@wefes/shared-types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Droplets, Zap, Sprout, Trees, Coins, Users, ArrowRight, Activity, SlidersHorizontal, Scale, Info, ArrowLeft, ArrowUp, ArrowUpRight } from 'lucide-react';
import { FactorDetailModal } from './FactorDetailModal';
import { NexusScientificModal } from './NexusScientificModal';

interface AnalysisDashboardProps {
  output: WEFESOutput;
  onOpenSimulator: () => void;
  onOpenDossier?: () => void;
  onBackToDistrict?: () => void;
  onBackToMap?: () => void;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  output,
  onOpenSimulator,
  onOpenDossier,
  onBackToDistrict,
  onBackToMap,
}) => {
  const [selectedFactorKey, setSelectedFactorKey] = useState<string | null>(null);
  const [isScientificModalOpen, setIsScientificModalOpen] = useState(false);

  const radarData = [
    { pillar: 'Water (Resource)', score: 100 - output.water.waterStressIndex },
    { pillar: 'Energy (Clean)', score: 100 - output.energy.fossilSharePercent },
    { pillar: 'Food (Security)', score: output.food.foodSecurityIndex },
    { pillar: 'Ecosystem (Health)', score: output.ecosystem.ecoHealthScore },
    { pillar: 'Socioeconomics (Return)', score: Math.min(100, Math.round((output.socioeconomics.netRevenueNpr / Math.max(1, output.socioeconomics.grossRevenueNpr)) * 100)) },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* Top Header Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm bg-white/95 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {onBackToDistrict && (
              <button
                onClick={onBackToDistrict}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to {output.districtName} District
              </button>
            )}
            {onBackToMap && (
              <>
                <span className="text-slate-300">•</span>
                <button
                  onClick={onBackToMap}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors cursor-pointer"
                >
                  National Map
                </button>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold mb-1">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>WEFES 5-PILLAR NEXUS ANALYSIS REPORT</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-outfit">
            {output.cropName} in {output.districtName} District
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Harvest Target: <strong className="text-slate-800">{output.inputQuantity.toLocaleString()} {output.inputUnit}</strong> ({output.baseQuantity.toLocaleString()} {output.baseUnit})
          </p>
        </div>

        {/* Interactive Overall Nexus Balance & Scientific Justification Badge */}
        <button
          onClick={() => {
            if (onOpenDossier) onOpenDossier();
            else setIsScientificModalOpen(true);
          }}
          className="flex items-center gap-4 bg-emerald-50 hover:bg-emerald-100/70 p-3.5 px-4 rounded-2xl border border-emerald-300 hover:border-emerald-400 shadow-2xs hover:shadow-md transition-all cursor-pointer text-left group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
              <span>Nexus Balance Score</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <div className="text-xs font-bold text-emerald-950 mt-0.5">{output.nexusRating}</div>
            <span className="text-[9px] text-emerald-700 font-sans font-medium flex items-center justify-end gap-1 mt-0.5">
              <span>Inspect Deep Science & Policy Dossier ↗</span>
            </span>
          </div>

          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 transition-colors font-extrabold text-xl text-white shadow-sm font-outfit shrink-0">
            {output.nexusBalanceIndex}
          </div>
        </button>
      </div>

      {/* ── BIOPHYSICAL FEASIBILITY BANNER ─────────────────────────────────────── */}
      {output.agroSuitability.suitabilityFactor < 0.95 && (
        <div className={`rounded-xl border px-4 py-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-3 ${
          !output.agroSuitability.isBiophysicallyFeasible
            ? 'bg-red-50 border-red-300'
            : output.agroSuitability.suitabilityScore < 65
            ? 'bg-amber-50 border-amber-300'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className={`text-2xl shrink-0 ${!output.agroSuitability.isBiophysicallyFeasible ? '' : ''}`}>
            {!output.agroSuitability.isBiophysicallyFeasible ? '🚫' : output.agroSuitability.suitabilityScore < 65 ? '⚠️' : '📉'}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-xs font-bold uppercase tracking-wide mb-0.5 ${
              !output.agroSuitability.isBiophysicallyFeasible ? 'text-red-800' : 'text-amber-800'
            }`}>
              {!output.agroSuitability.isBiophysicallyFeasible
                ? 'Biophysical Feasibility Failure — Crop Incompatible With This District'
                : 'Suboptimal Agro-Ecological Conditions Detected'}
            </div>
            <p className={`text-xs leading-relaxed ${
              !output.agroSuitability.isBiophysicallyFeasible ? 'text-red-700' : 'text-amber-700'
            }`}>
              FAO suitability: <strong>{output.agroSuitability.faoClass}</strong>
              {' · '}Limiting factor: <strong>{output.agroSuitability.limitingFactor}</strong>
              {' · '}Suitability score: <strong>{output.agroSuitability.suitabilityScore}/100</strong>
            </p>
          </div>
          <div className="shrink-0 text-right bg-white/80 border border-current/20 rounded-lg px-3 py-2">
            <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
              !output.agroSuitability.isBiophysicallyFeasible ? 'text-red-700' : 'text-amber-700'
            }`}>Realized Yield</div>
            <div className={`text-lg font-black font-mono ${
              !output.agroSuitability.isBiophysicallyFeasible ? 'text-red-800' : 'text-amber-800'
            }`}>
              {output.agroSuitability.realizedQuantity.toLocaleString()}
              <span className="text-xs font-normal ml-0.5">{output.baseUnit}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              of {output.baseQuantity.toLocaleString()} target
              {' '}(<span className={`font-bold ${!output.agroSuitability.isBiophysicallyFeasible ? 'text-red-600' : 'text-amber-600'}`}>
                -{output.agroSuitability.unrealizedQuantityPct}% yield loss
              </span>)
            </div>
          </div>
        </div>
      )}
      {/* ─────────────────────────────────────────────────────────────────────── */}

      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span className="flex items-center gap-1.5 font-medium text-slate-600">
          <Info className="w-3.5 h-3.5 text-emerald-600" />
          Click any KPI factor card below to view 10-year predictive impact & micro-scenario controls.
        </span>
      </div>


      {/* 6 Top Clickable KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">

        {/* Water KPI */}
        <div
          onClick={() => setSelectedFactorKey('water')}
          className="p-4 rounded-xl border border-sky-200/90 bg-sky-50/70 hover:bg-sky-50 hover:border-sky-300 cursor-pointer transition-all elevation-hover group shadow-2xs"
        >
          <div className="flex items-center justify-between text-sky-700 mb-2">
            <Droplets className="w-4 h-4" />
            <span className="text-[10px] bg-white border border-sky-200 text-sky-800 px-2 py-0.5 rounded-md font-mono font-semibold">
              {output.water.rating}
            </span>
          </div>
          <div className="text-xs text-slate-600 font-semibold uppercase flex items-center justify-between">
            <span>Water Stress</span>
            <Info className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-sky-600" />
          </div>
          <div className="text-lg font-extrabold text-sky-950 mt-1 font-mono">
            {output.water.waterStressIndex} <span className="text-xs font-normal text-slate-500">/ 100</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">({output.water.consumptionLiters.toLocaleString()} L)</div>
        </div>

        {/* Energy KPI */}
        <div
          onClick={() => setSelectedFactorKey('energy')}
          className="p-4 rounded-xl border border-amber-200/90 bg-amber-50/70 hover:bg-amber-50 hover:border-amber-300 cursor-pointer transition-all elevation-hover group shadow-2xs"
        >
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-[10px] bg-white border border-amber-200 text-amber-800 px-2 py-0.5 rounded-md font-mono font-semibold">
              {output.energy.renewableKwh} kWh Clean
            </span>
          </div>
          <div className="text-xs text-slate-600 font-semibold uppercase flex items-center justify-between">
            <span>Energy Load</span>
            <Info className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-amber-600" />
          </div>
          <div className="text-lg font-extrabold text-amber-950 mt-1 font-mono">
            {output.energy.loadKwh.toLocaleString()} <span className="text-xs font-normal text-slate-500">kWh</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">({output.energy.fossilSharePercent}% Grid)</div>
        </div>

        {/* Food KPI */}
        <div
          onClick={() => setSelectedFactorKey('food')}
          className="p-4 rounded-xl border border-emerald-200/90 bg-emerald-50/70 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer transition-all elevation-hover group shadow-2xs"
        >
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <Sprout className="w-4 h-4" />
            <span className="text-[10px] bg-white border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md font-mono font-semibold">
              {output.food.foodSecurityIndex}/100
            </span>
          </div>
          <div className="text-xs text-slate-600 font-semibold uppercase flex items-center justify-between">
            <span>Yield Biomass</span>
            <Info className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600" />
          </div>
          <div className="text-lg font-extrabold text-emerald-950 mt-1 font-mono">
            {output.food.yieldKg.toLocaleString()} <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">{output.food.nutritionalKcal.toLocaleString()} kcal</div>
        </div>

        {/* Ecosystem KPI */}
        <div
          onClick={() => setSelectedFactorKey('ecosystem')}
          className="p-4 rounded-xl border border-teal-200/90 bg-teal-50/70 hover:bg-teal-50 hover:border-teal-300 cursor-pointer transition-all elevation-hover group shadow-2xs"
        >
          <div className="flex items-center justify-between text-teal-700 mb-2">
            <Trees className="w-4 h-4" />
            <span className="text-[10px] bg-white border border-teal-200 text-teal-800 px-2 py-0.5 rounded-md font-mono font-semibold">
              {output.ecosystem.ecoHealthScore}/100
            </span>
          </div>
          <div className="text-xs text-slate-600 font-semibold uppercase flex items-center justify-between">
            <span>Carbon Offset</span>
            <Info className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-teal-600" />
          </div>
          <div className="text-lg font-extrabold text-teal-950 mt-1 font-mono">
            {output.ecosystem.carbonOffsetKgCo2.toLocaleString()} <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">Erosion: {output.ecosystem.erosionMitigationIndex}</div>
        </div>

        {/* Net Revenue KPI */}
        <div
          onClick={() => setSelectedFactorKey('revenue')}
          className="p-4 rounded-xl border border-purple-200/90 bg-purple-50/70 hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition-all elevation-hover group shadow-2xs"
        >
          <div className="flex items-center justify-between text-purple-700 mb-2">
            <Coins className="w-4 h-4" />
            <span className="text-[10px] bg-white border border-purple-200 text-purple-800 px-2 py-0.5 rounded-md font-mono font-semibold">
              Net Profit
            </span>
          </div>
          <div className="text-xs text-slate-600 font-semibold uppercase flex items-center justify-between">
            <span>Net Revenue</span>
            <Info className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-purple-600" />
          </div>
          <div className="text-lg font-extrabold text-purple-950 mt-1 font-mono">
            NPR {output.socioeconomics.netRevenueNpr.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">Gross: NPR {output.socioeconomics.grossRevenueNpr.toLocaleString()}</div>
        </div>

        {/* Jobs Created KPI */}
        <div
          onClick={() => setSelectedFactorKey('jobs')}
          className="p-4 rounded-xl border border-indigo-200/90 bg-indigo-50/70 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition-all elevation-hover group shadow-2xs"
        >
          <div className="flex items-center justify-between text-indigo-700 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-[10px] bg-white border border-indigo-200 text-indigo-800 px-2 py-0.5 rounded-md font-mono font-semibold">
              {output.socioeconomics.laborDays} Days
            </span>
          </div>
          <div className="text-xs text-slate-600 font-semibold uppercase flex items-center justify-between">
            <span>Jobs Created</span>
            <Info className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600" />
          </div>
          <div className="text-lg font-extrabold text-indigo-950 mt-1 font-mono">
            {output.socioeconomics.directJobsCreated} <span className="text-xs font-normal text-slate-500">Direct FTE</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">+{output.socioeconomics.indirectJobsCreated} Indirect</div>
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
                <PolarAngleAxis dataKey="pillar" stroke="#475569" tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" tick={{ fill: '#64748b', fontSize: 9 }} />
                <Radar
                  name="Baseline Profile"
                  dataKey="score"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.25}
                />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.5rem', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
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
                      <span className="font-mono font-bold text-sky-900">{output.water.consumptionM3.toLocaleString()} m³</span>
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
                      <span className="font-mono font-bold text-amber-900">{output.energy.loadKwh.toLocaleString()} kWh</span>
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
                          width: `${Math.min(100, Math.max(10, Math.round((output.socioeconomics.netRevenueNpr / Math.max(1, output.socioeconomics.grossRevenueNpr)) * 100)))}%`
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span>Gross: NPR {output.socioeconomics.grossRevenueNpr.toLocaleString()}</span>
                      <span className="font-medium text-purple-700">
                        {Math.round((output.socioeconomics.netRevenueNpr / Math.max(1, output.socioeconomics.grossRevenueNpr)) * 100)}% Margin
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
                  NPR {(output.socioeconomics.netRevenueNpr / Math.max(1, output.water.consumptionM3)).toFixed(1)} <span className="text-[10px] font-normal text-slate-400">/ m³</span>
                </div>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                <div className="text-[10px] text-slate-500 font-medium">Energy Productivity</div>
                <div className="text-xs font-bold text-amber-950 font-mono mt-0.5">
                  NPR {(output.socioeconomics.netRevenueNpr / Math.max(1, output.energy.loadKwh)).toFixed(1)} <span className="text-[10px] font-normal text-slate-400">/ kWh</span>
                </div>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
                <div className="text-[10px] text-slate-500 font-medium">Carbon per Energy</div>
                <div className="text-xs font-bold text-teal-950 font-mono mt-0.5">
                  {(output.ecosystem.carbonOffsetKgCo2 / Math.max(1, output.energy.loadKwh)).toFixed(2)} <span className="text-[10px] font-normal text-slate-400">kg CO₂/kWh</span>
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
            Test 15+ environmental, energy, agronomic, and socioeconomic variables in real-time to observe trade-offs and 10-year projections.
          </p>
        </div>

        <button
          onClick={onOpenSimulator}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition-all shrink-0 cursor-pointer"
        >
          <span>Launch Scenario Simulator</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Quick Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50/90 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          {onBackToDistrict && (
            <button
              onClick={onBackToDistrict}
              className="text-xs text-slate-800 hover:text-slate-950 font-bold flex items-center gap-1.5 transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600" />
              <span>Back to {output.districtName} District</span>
            </button>
          )}
          {onBackToMap && (
            <button
              onClick={onBackToMap}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 transition-colors cursor-pointer bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm"
            >
              <span>National Map</span>
            </button>
          )}
        </div>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm"
        >
          <ArrowUp className="w-4 h-4 text-slate-500" />
          <span>Scroll to Top</span>
        </button>
      </div>

      {/* Factor Detail Modal */}
      {selectedFactorKey && (
        <FactorDetailModal
          factorKey={selectedFactorKey}
          output={output}
          onClose={() => setSelectedFactorKey(null)}
        />
      )}

      {/* WEFES Deep Scientific & Mathematical Proof Modal */}
      <NexusScientificModal
        output={output}
        isOpen={isScientificModalOpen}
        onClose={() => setIsScientificModalOpen(false)}
      />

    </div>
  );
};
