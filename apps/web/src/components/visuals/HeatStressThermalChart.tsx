import React, { useState } from 'react';

interface HeatStressThermalChartProps {
  districtName: string;
  cropName: string;
  criticalThresholdTempC: number;
  floweringSterilityRiskPct: number;
  recommendedMitigationAction: string;
}

export const HeatStressThermalChart: React.FC<HeatStressThermalChartProps> = ({
  districtName,
  cropName,
  criticalThresholdTempC,
  floweringSterilityRiskPct,
  recommendedMitigationAction,
}) => {
  const [hoveredMonth, setHoveredMonth] = useState<number>(2);

  const thermalMonths = [
    { month: 'Chaitra', maxTemp: 32.5, minTemp: 18.2, vpdKpa: 2.1, risk: 'Low', sterilRisk: 8 },
    { month: 'Baisakh', maxTemp: 36.8, minTemp: 22.4, vpdKpa: 3.4, risk: 'Moderate', sterilRisk: 24 },
    { month: 'Jestha', maxTemp: 39.2, minTemp: 25.8, vpdKpa: 4.1, risk: 'High', sterilRisk: floweringSterilityRiskPct },
    { month: 'Ashadh', maxTemp: 35.0, minTemp: 26.2, vpdKpa: 2.2, risk: 'Moderate', sterilRisk: 16 },
    { month: 'Shrawan', maxTemp: 33.2, minTemp: 25.5, vpdKpa: 1.6, risk: 'Low', sterilRisk: 6 },
    { month: 'Bhadra', maxTemp: 32.8, minTemp: 24.8, vpdKpa: 1.7, risk: 'Low', sterilRisk: 5 },
  ];

  const activeM = thermalMonths[hoveredMonth] || thermalMonths[2];

  return (
    <div className="p-5 sm:p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              Thermal Exceedance & Canopy Heat Stress Diagnostics
            </span>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              NASA MERRA-2 Climatology · {districtName}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Thermal threshold exceedance tracking flowering pollen sterility and high vapor-pressure deficit (VPD).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800">
            🌡️ Critical Threshold: {criticalThresholdTempC}°C
          </span>
        </div>
      </div>

      {/* SVG Thermal Range Bar Chart */}
      <div className="w-full overflow-x-auto">
        <svg viewBox="0 0 780 230" className="w-full min-w-[650px] h-auto font-sans select-none">
          {/* 35°C Critical Threshold Line */}
          <line x1="50" y1="85" x2="740" y2="85" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" />
          <text x="55" y="78" fill="#ef4444" fontSize="9" fontWeight="bold" fontFamily="monospace">
            Critical Sterility Threshold ({criticalThresholdTempC}°C)
          </text>

          {/* Grid lines */}
          <line x1="50" y1="130" x2="740" y2="130" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="50" y1="175" x2="740" y2="175" stroke="#475569" strokeWidth="1.5" />

          {/* Thermal Month Ranges */}
          {thermalMonths.map((m, idx) => {
            const colX = 100 + idx * 115;
            const topY = 175 - (m.maxTemp / 45) * 140;
            const bottomY = 175 - (m.minTemp / 45) * 140;
            const barHeight = bottomY - topY;
            const isHovered = hoveredMonth === idx;
            const isExceeded = m.maxTemp > criticalThresholdTempC;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredMonth(idx)}
                onClick={() => setHoveredMonth(idx)}
                className="cursor-pointer group"
              >
                {/* Active Backdrop */}
                {isHovered && (
                  <rect
                    x={colX - 35}
                    y="25"
                    width="70"
                    height="160"
                    rx="10"
                    fill="#334155"
                    fillOpacity="0.4"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                  />
                )}

                {/* Thermal Range Bar */}
                <rect
                  x={colX - 16}
                  y={topY}
                  width="32"
                  height={barHeight}
                  rx="6"
                  fill={isExceeded ? '#ef4444' : '#f59e0b'}
                  fillOpacity={isHovered ? 0.95 : 0.75}
                  className="transition-all duration-200"
                />

                {/* Temp Values */}
                <text x={colX} y={topY - 6} textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="bold" fontFamily="monospace">
                  {m.maxTemp}°
                </text>
                <text x={colX} y={bottomY + 12} textAnchor="middle" fill="#94a3b8" fontSize="8.5" fontFamily="monospace">
                  {m.minTemp}°
                </text>

                {/* Month Name */}
                <text
                  x={colX}
                  y="204"
                  textAnchor="middle"
                  fill={isHovered ? '#fbbf24' : '#cbd5e1'}
                  fontSize="10.5"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                  fontFamily="Outfit, sans-serif"
                >
                  {m.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Detail Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-slate-800 text-xs font-mono">
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
          <span className="text-slate-400 font-sans text-[11px] block">{activeM.month} Daytime Peak:</span>
          <div className={`text-sm font-bold mt-0.5 ${activeM.maxTemp > criticalThresholdTempC ? 'text-rose-400' : 'text-amber-400'}`}>
            {activeM.maxTemp}°C (VPD: {activeM.vpdKpa} kPa)
          </div>
        </div>
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
          <span className="text-slate-400 font-sans text-[11px] block">Pollen Sterility Risk:</span>
          <div className={`text-sm font-bold mt-0.5 ${activeM.sterilRisk > 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {activeM.sterilRisk}% Loss Potential
          </div>
        </div>
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 col-span-2">
          <span className="text-slate-400 font-sans text-[11px] block">Agronomic Heat Mitigation:</span>
          <div className="text-emerald-300 font-sans text-[11px] mt-0.5 font-medium">
            {recommendedMitigationAction}
          </div>
        </div>
      </div>
    </div>
  );
};
