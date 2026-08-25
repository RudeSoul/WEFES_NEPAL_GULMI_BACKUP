import React, { useState } from 'react';

interface SunburstWaterCarbonProps {
  districtName: string;
  cropName: string;
  greenWaterPct: number;
  blueWaterPct: number;
  greyWaterPct: number;
  totalWaterLPerKg: number;
  soilCarbonStockMgHa: number;
  totalCarbonEmissionKgHa: number;
}

export const SunburstWaterCarbon: React.FC<SunburstWaterCarbonProps> = ({
  districtName,
  cropName,
  greenWaterPct,
  blueWaterPct,
  greyWaterPct,
  totalWaterLPerKg,
  soilCarbonStockMgHa,
  totalCarbonEmissionKgHa,
}) => {
  const [activeTab, setActiveTab] = useState<'water' | 'carbon'>('water');
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  return (
    <div className="p-5 sm:p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              Sunburst & Circle Packing Hierarchies
            </span>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              {districtName} · {cropName}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Switch between Hoekstra 3-Color Water Footprint and IPCC AR6 Carbon Stock to inspect hierarchical components.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-800 rounded-xl border border-slate-700 text-xs font-outfit">
          <button
            onClick={() => setActiveTab('water')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'water' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
          >
            💧 Hoekstra Water Footprint
          </button>
          <button
            onClick={() => setActiveTab('carbon')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'carbon' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:bg-slate-700/50'
              }`}
          >
            🌲 IPCC Carbon Breakdown
          </button>
        </div>
      </div>

      {/* Visual Canvas */}
      {activeTab === 'water' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* SVG Sunburst Ring (7 cols) */}
          <div className="md:col-span-7 flex items-center justify-center p-4">
            <svg viewBox="0 0 320 320" className="w-64 h-64 select-none">
              {/* Outer Ring Segments */}
              {/* Green Water Arc (68% -> ~245 deg) */}
              <circle
                cx="160"
                cy="160"
                r="110"
                fill="none"
                stroke="#10b981"
                strokeWidth="32"
                strokeDasharray={`${(greenWaterPct / 100) * 691} 691`}
                strokeDashoffset="0"
                onMouseEnter={() => setHoveredSlice('green')}
                onMouseLeave={() => setHoveredSlice(null)}
                className="cursor-pointer hover:opacity-90 transition-all"
              />
              {/* Blue Water Arc (24% -> ~86 deg) */}
              <circle
                cx="160"
                cy="160"
                r="110"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="32"
                strokeDasharray={`${(blueWaterPct / 100) * 691} 691`}
                strokeDashoffset={`-${(greenWaterPct / 100) * 691}`}
                onMouseEnter={() => setHoveredSlice('blue')}
                onMouseLeave={() => setHoveredSlice(null)}
                className="cursor-pointer hover:opacity-90 transition-all"
              />
              {/* Grey Water Arc (8% -> ~29 deg) */}
              <circle
                cx="160"
                cy="160"
                r="110"
                fill="none"
                stroke="#64748b"
                strokeWidth="32"
                strokeDasharray={`${(greyWaterPct / 100) * 691} 691`}
                strokeDashoffset={`-${((greenWaterPct + blueWaterPct) / 100) * 691}`}
                onMouseEnter={() => setHoveredSlice('grey')}
                onMouseLeave={() => setHoveredSlice(null)}
                className="cursor-pointer hover:opacity-90 transition-all"
              />

              {/* Inner Center Circle */}
              <circle cx="160" cy="160" r="76" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              <text x="160" y="145" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                Total Water Footprint
              </text>
              <text x="160" y="170" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="bold" fontFamily="Outfit, sans-serif">
                {totalWaterLPerKg.toLocaleString()}
              </text>
              <text x="160" y="186" textAnchor="middle" fill="#34d399" fontSize="10" fontFamily="monospace">
                Liters / kg grain
              </text>
            </svg>
          </div>

          {/* Breakdown Stats (5 cols) */}
          <div className="md:col-span-5 space-y-2.5 text-xs font-mono">
            <div
              onMouseEnter={() => setHoveredSlice('green')}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${hoveredSlice === 'green' ? 'bg-emerald-950/80 border-emerald-500 shadow-xs' : 'bg-slate-800/80 border-slate-700'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold font-sans">🌿 Green Water (Rainfed)</span>
                <span className="font-bold text-white text-sm">{greenWaterPct}%</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-snug">
                Rainfall stored in root-zone soil pore space consumed via crop transpiration.
              </p>
            </div>

            <div
              onMouseEnter={() => setHoveredSlice('blue')}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${hoveredSlice === 'blue' ? 'bg-sky-950/80 border-sky-500 shadow-xs' : 'bg-slate-800/80 border-slate-700'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sky-400 font-bold font-sans">💧 Blue Water (Irrigation)</span>
                <span className="font-bold text-white text-sm">{blueWaterPct}%</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-snug">
                Surface canal abstractions and shallow tubewell groundwater pumping.
              </p>
            </div>

            <div
              onMouseEnter={() => setHoveredSlice('grey')}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${hoveredSlice === 'grey' ? 'bg-slate-800 border-slate-500 shadow-xs' : 'bg-slate-800/80 border-slate-700'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold font-sans">🌫️ Grey Water (Dilution)</span>
                <span className="font-bold text-white text-sm">{greyWaterPct}%</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-snug">
                Freshwater volume required to assimilate agricultural agrochemical runoff.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Carbon Circle Packing (7 cols) */}
          <div className="md:col-span-7 flex items-center justify-center p-4">
            <svg viewBox="0 0 340 300" className="w-full max-w-sm h-auto select-none font-sans">
              {/* Outer Soil Carbon Sink Bubble */}
              <circle cx="170" cy="150" r="135" fill="#064e3b" fillOpacity="0.4" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
              <text x="170" y="8" textAnchor="middle" fill="#34d399" fontSize="10.5" fontWeight="bold" fontFamily="monospace">
                Soil Organic Carbon Sink: {soilCarbonStockMgHa} Mg C/ha
              </text>

              {/* Nested Source Circles */}
              {/* Fertilizer N2O Bubble */}
              <circle cx="120" cy="130" r="50" fill="#7c2d12" fillOpacity="0.7" stroke="#ea580c" strokeWidth="1.5" />
              <text x="120" y="125" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                Soil N₂O
              </text>
              <text x="120" y="142" textAnchor="middle" fill="#fdba74" fontSize="9.5" fontFamily="monospace">
                GWP: 273x
              </text>

              {/* Enteric / Farm Diesel Bubble */}
              <circle cx="225" cy="120" r="42" fill="#1e1b4b" fillOpacity="0.8" stroke="#6366f1" strokeWidth="1.5" />
              <text x="225" y="115" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                Diesel/Pumping
              </text>
              <text x="225" y="130" textAnchor="middle" fill="#c7d2fe" fontSize="9" fontFamily="monospace">
                2.68 kg/L
              </text>

              {/* Paddy Methane CH4 Bubble */}
              <circle cx="170" cy="205" r="44" fill="#701a75" fillOpacity="0.7" stroke="#c026d3" strokeWidth="1.5" />
              <text x="170" y="200" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                Paddy CH₄
              </text>
              <text x="170" y="215" textAnchor="middle" fill="#f5d0fe" fontSize="9.5" fontFamily="monospace">
                GWP: 27x
              </text>
            </svg>
          </div>

          {/* Carbon Stats (5 cols) */}
          <div className="md:col-span-5 space-y-2.5 text-xs font-mono">
            <div className="p-3 bg-emerald-950/70 rounded-xl border border-emerald-700">
              <span className="text-emerald-300 font-bold font-sans text-xs">🌲 Soil Organic Carbon (SOC) Stock</span>
              <div className="text-xl font-bold text-white mt-0.5">{soilCarbonStockMgHa} Mg C/ha</div>
              <p className="text-[10px] text-emerald-200 font-sans mt-0.5">
                Topsoil (0–30cm) carbon reservoir calculated via Walkley-Black soil organic matter index.
              </p>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="text-amber-400 font-bold font-sans text-xs">🔥 Gross Farm GHG Emissions</span>
              <div className="text-xl font-bold text-white mt-0.5">{totalCarbonEmissionKgHa} kg CO₂e/ha</div>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                IPCC AR6 source emissions combining diesel pumping, synthetic N manufacturing & soil flux.
              </p>
            </div>

            <div className="p-3 bg-blue-950/70 rounded-xl border border-blue-800">
              <span className="text-blue-300 font-bold font-sans text-xs">⚡ Clean NEA Hydro Pumping Advantage</span>
              <div className="text-sm font-bold text-white mt-0.5">0.025 kg CO₂/kWh (95% Clean Hydro)</div>
              <p className="text-[10px] text-blue-200 font-sans mt-0.5">
                Massive 97% emission reduction compared to Indian fossil grid (0.82 kg CO₂/kWh).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
