import React, { useState } from 'react';

interface AquacultureMetricsChartProps {
  districtName: string;
  annualFishYieldTonnesPerHa: number;
  feedConversionRatioFCR: number;
  feedCostSharePct: number;
  netAnnualReturnNprPerHa: number;
  totalAnnualAquacultureWaterDemandM3: number;
}

export const AquacultureMetricsChart: React.FC<AquacultureMetricsChartProps> = ({
  districtName,
  annualFishYieldTonnesPerHa,
  feedConversionRatioFCR,
  feedCostSharePct,
  netAnnualReturnNprPerHa,
  totalAnnualAquacultureWaterDemandM3,
}) => {
  const [hoveredSpecies, setHoveredSpecies] = useState<string | null>(null);

  const polycarpSpecies = [
    { id: 'rohu', name: 'Rohu (Labeo rohita)', share: 35, feedingLayer: 'Column Feeder', color: '#0ea5e9' },
    { id: 'catla', name: 'Catla (Gibelion catla)', share: 20, feedingLayer: 'Surface Feeder', color: '#38bdf8' },
    { id: 'naini', name: 'Mrigal/Naini (Cirrhinus mrigala)', share: 20, feedingLayer: 'Bottom Feeder', color: '#06b6d4' },
    { id: 'grass', name: 'Grass Carp (Ctenopharyngodon)', share: 15, feedingLayer: 'Macrophyte Grazer', color: '#10b981' },
    { id: 'silver', name: 'Silver Carp (Hypophthalmichthys)', share: 10, feedingLayer: 'Phytoplankton Filter', color: '#8b5cf6' },
  ];

  return (
    <div className="p-5 sm:p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
              Aquaculture Super-Zone & Polyculture Metrics
            </span>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              {districtName} · Polycarp Polyculture
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Multi-tier ecological stocking model partitioning surface, column, and benthic pond niches.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-sky-950 text-sky-300 border border-sky-800">
            🐟 Yield: {annualFishYieldTonnesPerHa} t/ha · FCR: {feedConversionRatioFCR}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* SVG Polyculture Donut Ring (7 cols) */}
        <div className="md:col-span-7 flex items-center justify-center p-2">
          <svg viewBox="0 0 300 300" className="w-full max-w-[260px] h-auto select-none font-sans">
            {/* Rohu (35% -> 220 dash) */}
            <circle
              cx="150"
              cy="150"
              r="95"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="28"
              strokeDasharray="208 597"
              strokeDashoffset="0"
              onMouseEnter={() => setHoveredSpecies('rohu')}
              onMouseLeave={() => setHoveredSpecies(null)}
              className="cursor-pointer hover:opacity-80 transition-all"
            />
            {/* Catla (20% -> 119 dash) */}
            <circle
              cx="150"
              cy="150"
              r="95"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="28"
              strokeDasharray="119 597"
              strokeDashoffset="-208"
              onMouseEnter={() => setHoveredSpecies('catla')}
              onMouseLeave={() => setHoveredSpecies(null)}
              className="cursor-pointer hover:opacity-80 transition-all"
            />
            {/* Naini (20% -> 119 dash) */}
            <circle
              cx="150"
              cy="150"
              r="95"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="28"
              strokeDasharray="119 597"
              strokeDashoffset="-327"
              onMouseEnter={() => setHoveredSpecies('naini')}
              onMouseLeave={() => setHoveredSpecies(null)}
              className="cursor-pointer hover:opacity-80 transition-all"
            />
            {/* Grass Carp (15% -> 90 dash) */}
            <circle
              cx="150"
              cy="150"
              r="95"
              fill="none"
              stroke="#10b981"
              strokeWidth="28"
              strokeDasharray="90 597"
              strokeDashoffset="-446"
              onMouseEnter={() => setHoveredSpecies('grass')}
              onMouseLeave={() => setHoveredSpecies(null)}
              className="cursor-pointer hover:opacity-80 transition-all"
            />
            {/* Silver Carp (10% -> 60 dash) */}
            <circle
              cx="150"
              cy="150"
              r="95"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="28"
              strokeDasharray="60 597"
              strokeDashoffset="-536"
              onMouseEnter={() => setHoveredSpecies('silver')}
              onMouseLeave={() => setHoveredSpecies(null)}
              className="cursor-pointer hover:opacity-80 transition-all"
            />

            <circle cx="150" cy="150" r="68" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
            <text x="150" y="145" textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontFamily="monospace">
              Stocking Density
            </text>
            <text x="150" y="165" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold" fontFamily="Outfit, sans-serif">
              8,000 / ha
            </text>
          </svg>
        </div>

        {/* Polyculture Mix List (5 cols) */}
        <div className="md:col-span-5 space-y-2 text-xs font-mono">
          {polycarpSpecies.map((s) => (
            <div
              key={s.id}
              onMouseEnter={() => setHoveredSpecies(s.id)}
              onMouseLeave={() => setHoveredSpecies(null)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                hoveredSpecies === s.id ? 'bg-sky-950/80 border-sky-500 shadow-xs' : 'bg-slate-800/80 border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></span>
                <div>
                  <div className="text-white font-sans font-bold text-xs">{s.name.split(' (')[0]}</div>
                  <div className="text-[10px] text-slate-400 font-sans">{s.feedingLayer}</div>
                </div>
              </div>
              <span className="font-bold text-sky-400 text-sm">{s.share}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Economics & Water Footprint Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800 text-xs font-mono">
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
          <span className="text-slate-400 font-sans text-[11px] block">Feed Cost Share:</span>
          <div className="text-sm font-bold text-amber-400 mt-0.5">{feedCostSharePct}% of OPEX</div>
        </div>
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
          <span className="text-slate-400 font-sans text-[11px] block">Net Return / Hectare:</span>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">NPR {(netAnnualReturnNprPerHa / 1000).toFixed(0)}k / ha</div>
        </div>
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
          <span className="text-slate-400 font-sans text-[11px] block">Pond Water Demand:</span>
          <div className="text-sm font-bold text-sky-400 mt-0.5">{(totalAnnualAquacultureWaterDemandM3 / 1000).toFixed(1)}k m³ / yr</div>
        </div>
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
          <span className="text-slate-400 font-sans text-[11px] block">Recycled Irrigation:</span>
          <div className="text-sm font-bold text-teal-400 mt-0.5">100% Water Reusable</div>
        </div>
      </div>
    </div>
  );
};
