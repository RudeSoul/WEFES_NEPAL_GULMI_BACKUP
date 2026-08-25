import React, { useState } from 'react';
import { CropCalendarMonth } from '@wefes/wefes-engine';

interface PhenologyTimelineChartProps {
  districtName: string;
  cropName: string;
  calendar: CropCalendarMonth[];
}

export const PhenologyTimelineChart: React.FC<PhenologyTimelineChartProps> = ({
  districtName,
  cropName,
  calendar,
}) => {
  const [activeMonthIdx, setActiveMonthIdx] = useState<number>(0);

  const activeMonth = calendar[activeMonthIdx] || calendar[0];

  // Max scale values for SVG graph
  const maxRain = Math.max(...calendar.map(c => c.rainfallMm), 350);
  const maxReq = Math.max(...calendar.map(c => c.cropWaterReqMm), 180);

  return (
    <div className="p-5 sm:p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              12-Month Agro-Climate & Phenology Timeline
            </span>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              Bikram Sambat (BS) · DHM Weather Grids
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Click or hover on any month to inspect monsoon rainfall vs crop water demand, irrigation deficits, and agronomic stages.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
            📅 Active Month: {activeMonth.bsMonth} ({activeMonth.adMonth})
          </span>
        </div>
      </div>

      {/* SVG Multi-Axis Curve & Bar Chart */}
      <div className="w-full overflow-x-auto">
        <svg viewBox="0 0 780 230" className="w-full min-w-[650px] h-auto font-sans select-none">
          {/* Grid lines */}
          <line x1="40" y1="40" x2="760" y2="40" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="40" y1="90" x2="760" y2="90" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="40" y1="140" x2="760" y2="140" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="40" y1="190" x2="760" y2="190" stroke="#475569" strokeWidth="1.5" />

          {/* 12 Month Columns */}
          {calendar.map((c, idx) => {
            const colX = 70 + idx * 58;
            const rainHeight = (c.rainfallMm / maxRain) * 140;
            const reqHeight = (c.cropWaterReqMm / maxReq) * 140;
            const isSelected = activeMonthIdx === idx;

            return (
              <g
                key={idx}
                onClick={() => setActiveMonthIdx(idx)}
                onMouseEnter={() => setActiveMonthIdx(idx)}
                className="cursor-pointer group"
              >
                {/* Active Column Highlighting */}
                {isSelected && (
                  <rect
                    x={colX - 24}
                    y="25"
                    width="48"
                    height="170"
                    rx="8"
                    fill="#334155"
                    fillOpacity="0.4"
                    stroke="#10b981"
                    strokeWidth="1.5"
                  />
                )}

                {/* Rainfall Bar (Blue) */}
                <rect
                  x={colX - 16}
                  y={190 - rainHeight}
                  width="14"
                  height={rainHeight}
                  rx="3"
                  fill="#0ea5e9"
                  fillOpacity={isSelected ? 0.95 : 0.65}
                  className="transition-all duration-200"
                />

                {/* Crop Water Requirement Bar (Green) */}
                <rect
                  x={colX + 2}
                  y={190 - reqHeight}
                  width="14"
                  height={reqHeight}
                  rx="3"
                  fill="#10b981"
                  fillOpacity={isSelected ? 0.95 : 0.65}
                  className="transition-all duration-200"
                />

                {/* Month Name */}
                <text
                  x={colX}
                  y="208"
                  textAnchor="middle"
                  fill={isSelected ? '#34d399' : '#94a3b8'}
                  fontSize="10"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fontFamily="Outfit, sans-serif"
                >
                  {c.bsMonth.slice(0, 4)}
                </text>
                <text
                  x={colX}
                  y="220"
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="7.5"
                  fontFamily="monospace"
                >
                  {c.adMonth.slice(0, 3)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Active Month Insights Card */}
      <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-2">
          <div className="flex items-center gap-2">
            <h5 className="font-bold text-white text-sm font-outfit">
              {activeMonth.bsMonth} ({activeMonth.adMonth})
            </h5>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Activity: {activeMonth.activityStage}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-sky-400">🌧️ Rain: {activeMonth.rainfallMm} mm</span>
            <span className="text-emerald-400">💧 Crop Need: {activeMonth.cropWaterReqMm} mm</span>
            <span className="text-amber-400">📊 Status: {activeMonth.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div>
            <span className="text-slate-400 font-sans text-[11px] block">💧 Irrigation Balance:</span>
            <div className="font-bold text-white mt-0.5">
              {activeMonth.irrigationDeficitMm > 0 ? (
                <span className="text-amber-400">⚠️ {activeMonth.irrigationDeficitMm} mm Deficit (Supplemental Irrigation Required)</span>
              ) : (
                <span className="text-emerald-400">✅ Monsoon Rainfall Surplus (Zero Irrigation Required)</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-sans text-[11px] block">🌾 Risk & Operational Alert:</span>
            <div className="text-slate-200 font-sans text-[11px] mt-0.5">
              {activeMonth.riskAlert || 'Normal agronomic window: Maintain weed control and inspect canopy moisture.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
