import React, { useState } from 'react';
import { WEFESOutput } from '@wefes/shared-types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { X, TrendingUp, TrendingDown, Info, SlidersHorizontal } from 'lucide-react';

interface FactorDetailModalProps {
  factorKey: string;
  output: WEFESOutput;
  onClose: () => void;
}

interface FactorMeta {
  title: string;
  color: string;
  unit: string;
  why: string;
  how: string;
  what: string;
  baseValue: number;
  sliderLabel: string;
  sliderMin: number;
  sliderMax: number;
  sliderStep: number;
  projectFn: (base: number, year: number, param: number) => number;
}

const FACTOR_META: Record<string, FactorMeta> = {
  water: {
    title: 'Severe Water Stress Index',
    color: '#0ea5e9',
    unit: 'Index (0–100)',
    why: 'Water stress measures how much water the agricultural activity consumes relative to the district rainfall availability. A high index (>75) signals unsustainable irrigation pressure, risking long-term water table depletion.',
    how: 'Computed as (Total Water Consumed m³) ÷ (District Rainfall Factor × 50) × 15. Rainfall factor is normalized against the 1500 mm national average.',
    what: 'A score below 25 = Low Stress (sustainable). 25–50 = Moderate. 50–75 = High Risk. >75 = Severe — indicating the crop choice demands water conservation interventions.',
    baseValue: 0,
    sliderLabel: 'Rainfall Increase (%)',
    sliderMin: -30,
    sliderMax: 50,
    sliderStep: 5,
    projectFn: (base, year, rain) =>
      Math.min(100, Math.max(5, base * Math.pow(0.97 + rain * 0.003, year) * (1 - rain / 200))),
  },
  energy: {
    title: 'Energy Requirement (kWh)',
    color: '#eab308',
    unit: 'kWh',
    why: 'Energy requirements for crop processing, irrigation pumping, and cold-chain logistics directly affect both cost and carbon footprint. Higher renewable share reduces dependency and emissions.',
    how: 'Calculated as baseQuantity × crop.energyReqPerUnit. Solar radiation of the district adjusts the renewable share baseline (0.25 + (solar - 4.0) × 0.1, capped at 80%).',
    what: 'Total energy load, renewable vs. fossil split. Used to compute energy cost (NPR/kWh) and net carbon balance.',
    baseValue: 0,
    sliderLabel: 'Renewable Energy Adoption (%)',
    sliderMin: 0,
    sliderMax: 100,
    sliderStep: 5,
    projectFn: (base, year, renew) =>
      Math.round(base * Math.pow(0.98, year) * (1 - (renew / 100) * 0.3)),
  },
  food: {
    title: 'Crop Yield Biomass (kg)',
    color: '#10b981',
    unit: 'kg',
    why: 'Crop yield represents the total harvestable biomass. It feeds into food security scoring, market revenue calculation, and determines the scale of downstream WEFES impacts.',
    how: 'For crops with kg base unit: yieldKg = baseQuantity. For timber: yieldKg = baseQuantity × 650 (biomass conversion). Food Security Index = min(100, (kcal/100000 × 20) + (yieldKg/500 × 15) + 30).',
    what: '10-year projection accounts for soil depletion, climate variability, and regenerative farming adoption multipliers.',
    baseValue: 0,
    sliderLabel: 'Regenerative Farming Adoption (%)',
    sliderMin: 0,
    sliderMax: 100,
    sliderStep: 5,
    projectFn: (base, year, regen) =>
      Math.round(base * Math.pow(1.015 + regen * 0.001, year)),
  },
  ecosystem: {
    title: 'Carbon Offset (kg CO₂e)',
    color: '#14b8a6',
    unit: 'kg CO₂e',
    why: 'Carbon offset reflects the ecosystem service value of sequestering carbon in biomass and soil. It directly feeds into Nepal\'s REDD+ national carbon credit accounting.',
    how: 'carbonOffset = baseQuantity × crop.carbonOffsetPerUnit. Eco health score is composited with erosion mitigation index weighted by eco-zone.',
    what: 'A higher carbon offset means the crop activity contributes positively to climate goals. This can be monetized as carbon credits (e.g., ~NPR 500/t CO₂e).',
    baseValue: 0,
    sliderLabel: 'Deforestation Rate Change (%)',
    sliderMin: -50,
    sliderMax: 0,
    sliderStep: 5,
    projectFn: (base, year, deforest) =>
      Math.round(base * Math.pow(1.02 + Math.abs(deforest) * 0.003, year)),
  },
  revenue: {
    title: 'Net Economic Return (NPR)',
    color: '#8b5cf6',
    unit: 'NPR',
    why: 'Net revenue is the primary socioeconomic viability indicator. It captures the surplus after deducting labor, energy, and input costs from gross farmgate revenue.',
    how: 'netRevenue = grossRevenue − laborCost − energyCost. Labor cost = laborDays × district.laborRateNprPerDay. Energy cost ≈ loadKwh × 10.5 NPR.',
    what: 'Positive net revenue enables loan repayment, household food security, and reinvestment. Used to compute Jobs Created per FTE (250 person-days = 1 FTE).',
    baseValue: 0,
    sliderLabel: 'Market Price Change (%)',
    sliderMin: -50,
    sliderMax: 100,
    sliderStep: 5,
    projectFn: (base, year, price) =>
      Math.round(base * Math.pow(1.04 + price * 0.004, year)),
  },
  jobs: {
    title: 'Jobs Created (Direct FTE)',
    color: '#06b6d4',
    unit: 'FTE',
    why: 'Job creation is the most tangible socioeconomic output — directly reducing rural out-migration and poverty. Each FTE is 250 person-days of agricultural labor.',
    how: 'directJobs = laborDays ÷ 250. Indirect jobs = directJobs × 0.5 (supply chain multiplier). Regenerative farming is ~20% more labor-intensive than conventional methods.',
    what: 'FTE count drives community-level income generation, school enrollment, healthcare access, and reduces Nepal\'s remittance-dependency cycle.',
    baseValue: 0,
    sliderLabel: 'Labor Market Expansion (%)',
    sliderMin: 0,
    sliderMax: 100,
    sliderStep: 5,
    projectFn: (base, year, labor) =>
      Math.round((base * Math.pow(1.03 + labor * 0.002, year)) * 10) / 10,
  },
};

export const FactorDetailModal: React.FC<FactorDetailModalProps> = ({ factorKey, output, onClose }) => {
  const meta = FACTOR_META[factorKey];
  const [sliderVal, setSliderVal] = useState(0);

  if (!meta) return null;

  const getBaseValue = () => {
    switch (factorKey) {
      case 'water': return output.water.waterStressIndex;
      case 'energy': return output.energy.loadKwh;
      case 'food': return output.food.yieldKg;
      case 'ecosystem': return output.ecosystem.carbonOffsetKgCo2;
      case 'revenue': return output.socioeconomics.netRevenueNpr;
      case 'jobs': return output.socioeconomics.directJobsCreated;
      default: return 0;
    }
  };

  const base = getBaseValue();

  // Build 10-year projection data
  const projectionData = Array.from({ length: 11 }, (_, i) => ({
    year: `Y${i}`,
    baseline: Math.round(meta.projectFn(base, i, 0) * 10) / 10,
    simulated: Math.round(meta.projectFn(base, i, sliderVal) * 10) / 10,
  }));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="glass-panel max-w-3xl w-full rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto bg-white">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.color }} />
            <h3 className="text-base font-bold text-slate-900 font-outfit">{meta.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Explanation */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 uppercase tracking-wider">
              <Info className="w-3.5 h-3.5 text-emerald-600" />
              WEFES Factor Explanation
            </div>
            {[
              { label: 'Why it matters', text: meta.why },
              { label: 'How it is calculated', text: meta.how },
              { label: 'What the value means', text: meta.what },
            ].map(({ label, text }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-bold text-slate-900 mb-1 font-outfit">{label}</p>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{text}</p>
              </div>
            ))}
          </div>

          {/* 10-Year Projection Chart */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              10-Year Longitudinal Impact Projection
            </h4>
            <div className="h-[240px] bg-slate-50/60 rounded-xl p-2 border border-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectionData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }}
                    tickFormatter={(v) => v > 999999 ? `${(v/1000000).toFixed(1)}M` : v > 999 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.5rem', color: '#0f172a', fontSize: 11, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    formatter={(v: number) => [v.toLocaleString(), '']}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#475569' }} />
                  <ReferenceLine y={base} stroke="#94a3b8" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 3" name="Baseline" dot={false} />
                  <Line type="monotone" dataKey="simulated" stroke={meta.color} strokeWidth={2.5} name="Simulated" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Micro Scenario Slider */}
          <div className="space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 uppercase tracking-wider">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
              Micro Scenario Slider
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-700 font-medium">{meta.sliderLabel}</span>
              <span className="font-bold font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                {sliderVal > 0 ? `+${sliderVal}` : sliderVal}{meta.sliderLabel.includes('%') ? '%' : ''}
              </span>
            </div>
            <input
              type="range"
              min={meta.sliderMin}
              max={meta.sliderMax}
              step={meta.sliderStep}
              value={sliderVal}
              onChange={e => setSliderVal(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200"
              style={{ accentColor: meta.color }}
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>{meta.sliderMin}</span>
              <span>Baseline (0)</span>
              <span>+{meta.sliderMax}</span>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-200 text-xs">
              <span className="text-slate-600">Year 10 projection:</span>
              <span className="font-bold font-mono text-slate-900">
                {projectionData[10]?.simulated.toLocaleString()} {meta.unit}
              </span>
              {projectionData[10]?.simulated > projectionData[10]?.baseline
                ? <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                : <TrendingDown className="w-3.5 h-3.5 text-rose-600" />}
              <span className={`font-mono font-semibold ${projectionData[10]?.simulated > projectionData[10]?.baseline ? 'text-emerald-700' : 'text-rose-700'}`}>
                ({projectionData[10]?.simulated > projectionData[10]?.baseline ? '+' : ''}
                {Math.round(((projectionData[10]?.simulated - projectionData[10]?.baseline) / Math.max(1, projectionData[10]?.baseline)) * 1000) / 10}% vs baseline)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
