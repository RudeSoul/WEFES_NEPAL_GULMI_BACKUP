// [DATA PROVENANCE]
// Data Source: FAO AquaCrop/WEI+, NARC AEZ Suitability, IPCC Tier 1/2, RUSLE Soil Conservation, CBS/DAO Nepal
// Classification: SCIENTIFIC FACTOR PROJECTIONS & SCENARIO SIMULATION
// Citations: FAO (1998, 2012), NARC Nepal, DHM Gauge Network, CBS Agriculture Census 2021/22, NEA Tariffs

import React, { useState } from 'react';

import { CheckCircle2, Info, SlidersHorizontal, TrendingDown, TrendingUp, X } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useNexusStore } from '../../store';

interface FactorDetailModalProps {
  factorKey: string;
  onClose: () => void;
}

interface FactorMeta {
  title: string;
  color: string;
  unit: string;
  methodology: string;
  why: string;
  how: string;
  what: string;
  sliderLabel: string;
  sliderMin: number;
  sliderMax: number;
  sliderStep: number;
  projectFn: (base: number, year: number, param: number) => { baseline: number; simulated: number };
}

const FACTOR_META: Record<string, FactorMeta> = {
  water: {
    title: 'Water Resource & Stress Index',
    color: '#0ea5e9',
    unit: 'Index (0–100)',
    methodology: 'FAO WEI+ / DHM Station Gauges',
    why: 'Water stress quantifies total consumptive crop evapotranspiration against renewable hydrological yield and district precipitation. An elevated index (>40) indicates irrigation deficit risk and competitive abstraction pressure on local springs and aquifers.',
    how: 'Derived using the FAO Water Exploitation Index (WEI+) standard: consumptive irrigation demand (m³) divided by effective precipitation and runoff yield, normalized onto a 0–100 scale calibrated with DHM gauge records.',
    what: 'Score <20 = Low Stress (sustainable, water-secure); 20–40 = Moderate (manageable recharge balance); 40–70 = High Stress (requires micro-irrigation/mulching); >70 = Severe Stress (unsustainable without reservoir buffering).',
    sliderLabel: 'Precipitation Anomaly Scenario (%)',
    sliderMin: -30,
    sliderMax: 50,
    sliderStep: 5,
    projectFn: (base, year, rain) => {
      const baseline = base;
      if (rain === 0) return { baseline, simulated: base };
      // Physical stress response: rainfall deficit compounds soil moisture drawdown over time
      const factor = rain < 0 ? 1 - (rain / 100) * (0.6 + year * 0.04) : 1 - (rain / 100) * (0.5 + year * 0.02);
      const simulated = Math.min(100, Math.max(5, base * factor));
      return { baseline, simulated };
    },
  },
  energy: {
    title: 'Grid Energy Demand (kWh)',
    color: '#eab308',
    unit: 'kWh',
    methodology: 'NEA Agricultural Power Tariffs',
    why: 'Captures total electric energy demanded by crop irrigation pumping, sorting, drying, and cold-chain storage. Higher renewable self-consumption lowers operational power tariff costs and grid emissions.',
    how: 'Calculated as base physical power demand (kWh/unit) multiplied by target harvest volume, split across renewable generation (district solar and micro-hydro) and fossil-backed grid supply.',
    what: 'Quantifies cumulative energy load and clean energy fraction (%). Directly determines farm electricity expenditures under Nepal Electricity Authority (NEA) agricultural tariffs.',
    sliderLabel: 'Renewable Solar/Hydro Self-Generation (%)',
    sliderMin: 0,
    sliderMax: 100,
    sliderStep: 5,
    projectFn: (base, year, renew) => {
      const baseline = base;
      // Solar/micro-hydro capacity rollout over a 4-year transition period
      const rollout = Math.min(1, year / 4);
      const displacedFraction = (renew / 100) * rollout;
      const simulated = Math.max(0, base * (1 - displacedFraction));
      return { baseline, simulated };
    },
  },
  food: {
    title: 'Crop Yield Harvest (kg)',
    color: '#10b981',
    unit: 'kg',
    methodology: 'FAO-33 Ky & NARC AEZ Guidelines',
    why: 'Harvestable crop yield represents the total biomass available for household consumption and local market supply, bolstering municipal food sovereignty and caloric resilience.',
    how: 'Computed using FAO Agro-Ecological Zoning (AEZ) suitability guidelines and realized harvest biomass ratios, benchmarked against NARC crop performance trials and CBS district statistics.',
    what: 'Realized harvestable yield in kilograms. Accounts for agro-climatic terrain suitability discounts, nutritional caloric energy yield (kcal), and post-harvest storage stability.',
    sliderLabel: 'Regenerative Soil Management Adoption (%)',
    sliderMin: 0,
    sliderMax: 100,
    sliderStep: 5,
    projectFn: (base, year, regen) => {
      const baseline = base;
      // Soil organic carbon and biological fertility build up over time (up to +25% on adopted area)
      const soilMaturity = Math.min(0.25, year * 0.025);
      const gain = (regen / 100) * soilMaturity;
      const simulated = base * (1 + gain);
      return { baseline, simulated };
    },
  },
  ecosystem: {
    title: 'Carbon Sequestration & Soil Protection',
    color: '#14b8a6',
    unit: 'kg CO₂e',
    methodology: 'IPCC Tier 1 AFOLU & RUSLE',
    why: 'Measures net greenhouse gas sequestration across woody biomass and root systems, combined with topsoil erosion prevention in steep mid-hill terraced slopes.',
    how: 'Integrates IPCC Tier 1/2 biophysical carbon storage coefficients with the Revised Universal Soil Loss Equation (RUSLE) erosion mitigation index calibrated for steep mountain terrain.',
    what: 'Total net sequestered carbon (kg CO₂e) and soil protection rating. High ratings signify minimized landslide risk, enhanced watershed infiltration, and potential REDD+ carbon credit eligibility.',
    sliderLabel: 'Agroforestry Canopy Expansion Area (%)',
    sliderMin: 0,
    sliderMax: 100,
    sliderStep: 5,
    projectFn: (base, year, agro) => {
      const baseline = base;
      // Perennial tree biomass and root carbon stock accumulation as saplings mature
      const treeGrowth = year * 0.06;
      const stockAddition = (agro / 100) * treeGrowth;
      const simulated = base * (1 + stockAddition);
      return { baseline, simulated };
    },
  },
  revenue: {
    title: 'Net Farmgate Profit (NPR)',
    color: '#8b5cf6',
    unit: 'NPR',
    methodology: 'DAO Wage Rates & Wholesale Indices',
    why: 'Net return is the primary commercial viability indicator. It represents the grower surplus retained after paying wages, power tariffs, seeds, and organic inputs.',
    how: 'Net Revenue = Gross Farmgate Revenue − Labor Costs − Energy Tariffs − Material Input Costs. Grounded in local Kalimati/Gulmi wholesale indices, DAO statutory wage rates, and NEA power tariffs.',
    what: 'Net financial return generated. Positive operating margins (>30%) ensure economic sustainability, debt service capability, and reinvestment capacity for smallholder farmers.',
    sliderLabel: 'Farmgate Market Wholesale Price Shift (%)',
    sliderMin: -50,
    sliderMax: 100,
    sliderStep: 5,
    projectFn: (base, _year, price) => {
      const baseline = base;
      // Constant real terms: user-defined economic sensitivity shock
      const simulated = Math.max(0, base * (1 + price / 100));
      return { baseline, simulated };
    },
  },
  jobs: {
    title: 'Direct & Value-Chain Employment (FTE)',
    color: '#06b6d4',
    unit: 'Direct FTE',
    methodology: 'ILO Agrarian Benchmark (250 Days/FTE)',
    why: 'Agricultural and processing employment directly mitigates rural out-migration and stimulates the local agrarian economy in Gulmi.',
    how: 'Direct FTE is calculated as cumulative on-farm and processing labor days divided by the standard agrarian benchmark of 250 person-days per FTE year. Multipliers account for cooperative packaging and transport.',
    what: 'Full-Time Equivalent jobs created. Higher FTE counts improve local household income stability, youth retention, and cooperative vitality.',
    sliderLabel: 'Cooperative Local Processing Expansion (%)',
    sliderMin: 0,
    sliderMax: 100,
    sliderStep: 5,
    projectFn: (base, year, coop) => {
      const baseline = base;
      // Downstream grading, packaging, and milling labor phased in up to +50%
      const rollout = Math.min(0.5, year * 0.05);
      const addedJobs = (coop / 100) * rollout;
      const simulated = base * (1 + addedJobs);
      return { baseline, simulated };
    },
  },
};

export const FactorDetailModal: React.FC<FactorDetailModalProps> = ({ factorKey, onClose }) => {
  const output = useNexusStore((s) => s.analysisOutput);
  const meta = FACTOR_META[factorKey];
  const [sliderVal, setSliderVal] = useState(0);

  if (!meta || !output) return null;

  const getBaseValue = () => {
    switch (factorKey) {
      case 'water':
        return output.water.waterStressIndex;
      case 'energy':
        return output.energy.loadKwh;
      case 'food':
        return output.food.yieldKg;
      case 'ecosystem':
        return output.ecosystem.carbonOffsetKgCo2;
      case 'revenue':
        return output.socioeconomics.netRevenueNpr;
      case 'jobs':
        return output.socioeconomics.directJobsCreated;
      default:
        return 0;
    }
  };

  const base = getBaseValue();

  // Build 10-year projection data with physical response
  const projectionData = Array.from({ length: 11 }, (_, i) => {
    const res = meta.projectFn(base, i, sliderVal);
    return {
      year: `Y${i}`,
      baseline: Math.round(res.baseline * 10) / 10,
      simulated: Math.round(res.simulated * 10) / 10,
    };
  });

  const year10Baseline = projectionData[10]?.baseline ?? base;
  const year10Simulated = projectionData[10]?.simulated ?? base;
  const delta = year10Simulated - year10Baseline;
  const deltaPct = year10Baseline > 0 ? (delta / year10Baseline) * 100 : 0;
  const hasChanged = Math.abs(delta) > 0.01;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="glass-panel max-w-4xl w-full rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-fade-in-up max-h-[92vh] overflow-y-auto bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: meta.color }} />
            <div>
              <h3 className="text-base font-bold text-slate-900 font-outfit">{meta.title}</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Standard: <span className="font-semibold text-slate-700">{meta.methodology}</span> • Baseline Value:{' '}
                <span className="font-mono font-bold text-slate-900">
                  {base.toLocaleString()} {meta.unit}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Explanation in 3 Compact Side-by-Side Cards */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                Scientific Methodology & Evidence Basis
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: 'Why It Matters', text: meta.why, icon: '🎯' },
                { label: 'How It Is Calculated', text: meta.how, icon: '📐' },
                { label: 'Scientific Interpretation', text: meta.what, icon: '📊' },
              ].map(({ label, text, icon }) => (
                <div
                  key={label}
                  className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200/90 flex flex-col justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 mb-1.5 font-outfit flex items-center gap-1.5">
                      <span>{icon}</span> {label}
                    </p>
                    <p className="text-[11.5px] text-slate-600 leading-relaxed font-normal">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 10-Year Scenario Sensitivity Chart */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider font-outfit">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  10-Year Scenario Sensitivity & Stress Test
                </h4>
                <p className="text-[11px] text-slate-500">
                  Simulating physical response trajectory against steady Status Quo (BAU) baseline
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-3.5 h-0.5 border-t-2 border-dashed border-slate-400 inline-block" /> Status Quo
                </span>
                <span className="flex items-center gap-1.5 font-semibold" style={{ color: meta.color }}>
                  <span className="w-3 h-1 rounded inline-block" style={{ backgroundColor: meta.color }} /> Scenario
                </span>
              </div>
            </div>
            <div className="h-[210px] bg-slate-50/60 rounded-xl p-2 border border-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectionData} margin={{ top: 8, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    domain={['auto', 'auto']}
                    tickFormatter={(v) =>
                      v > 999999 ? `${(v / 1000000).toFixed(1)}M` : v > 999 ? `${(v / 1000).toFixed(0)}k` : v
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '0.5rem',
                      color: '#0f172a',
                      fontSize: 11,
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                    formatter={(v: number) => [v.toLocaleString(), '']}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#475569' }} />
                  <ReferenceLine y={base} stroke="#cbd5e1" strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="5 3"
                    name="Status Quo (BAU)"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="simulated"
                    stroke={meta.color}
                    strokeWidth={2.5}
                    name="Simulated Scenario"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Micro Scenario Slider */}
          <div className="space-y-3 bg-slate-50/90 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 uppercase tracking-wider">
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                Scenario Intervention Parameter
              </div>
              <div className="text-[11px] text-slate-500">Adjust slider to simulate physical & economic shifts</div>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-700 font-semibold">{meta.sliderLabel}</span>
              <span className="font-bold font-mono text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                {sliderVal > 0 ? `+${sliderVal}` : sliderVal}
                {meta.sliderLabel.includes('%') ? '%' : ''}
              </span>
            </div>
            <input
              type="range"
              min={meta.sliderMin}
              max={meta.sliderMax}
              step={meta.sliderStep}
              value={sliderVal}
              onChange={(e) => setSliderVal(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200"
              style={{ accentColor: meta.color }}
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>{meta.sliderMin}%</span>
              <span>Status Quo (0%)</span>
              <span>+{meta.sliderMax}%</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">Year 10 Outcome:</span>
                <span className="font-bold font-mono text-slate-900 text-sm">
                  {year10Simulated.toLocaleString()} {meta.unit}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                {!hasChanged ? (
                  <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                    Matches Status Quo Baseline (0.0% variance)
                  </span>
                ) : (
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded font-semibold border ${
                      delta > 0
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-rose-700 bg-rose-50 border-rose-200'
                    }`}
                  >
                    {delta > 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    {delta > 0 ? '+' : ''}
                    {deltaPct.toFixed(1)}% vs Status Quo at Y10
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
