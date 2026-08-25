import React, { useState } from 'react';

interface SentinelNdviChartProps {
  districtName: string;
  cropName: string;
  meanNdvi: number;
  vegetativeHealthClassification: string;
  ndviAnomalyVsFiveYearMeanPct: number;
  canopyChlorophyllIndex: number;
  waterStressEsi: number;
}

export const SentinelNdviChart: React.FC<SentinelNdviChartProps> = ({
  districtName,
  cropName,
  meanNdvi,
  vegetativeHealthClassification,
  ndviAnomalyVsFiveYearMeanPct,
  canopyChlorophyllIndex,
  waterStressEsi,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<number>(3);

  // 6-step Sentinel-2 time series across crop cycle
  const timeSteps = [
    { stage: 'Sowing/Emergence', doy: 'Day 15', currentNdvi: 0.22, baselineNdvi: 0.20, esi: 0.12 },
    { stage: 'Active Tillering', doy: 'Day 45', currentNdvi: 0.48, baselineNdvi: 0.44, esi: 0.28 },
    { stage: 'Panicle Initiation', doy: 'Day 75', currentNdvi: 0.72, baselineNdvi: 0.65, esi: 0.45 },
    { stage: 'Peak Flowering', doy: 'Day 95', currentNdvi: meanNdvi, baselineNdvi: Math.max(0.3, meanNdvi - 0.08), esi: waterStressEsi },
    { stage: 'Grain Filling', doy: 'Day 115', currentNdvi: Math.max(0.35, meanNdvi - 0.12), baselineNdvi: Math.max(0.3, meanNdvi - 0.18), esi: 0.38 },
    { stage: 'Physiological Maturity', doy: 'Day 135', currentNdvi: 0.38, baselineNdvi: 0.35, esi: 0.20 },
  ];

  const activeStep = timeSteps[hoveredPoint] || timeSteps[3];

  return (
    <div className="p-5 sm:p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              Sentinel-2 MSI Multi-Spectral Vegetation Health Trajectory
            </span>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              ESA Copernicus 10m Ground Resolution · {districtName}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Near-infrared (B8A) vs Red (B4) reflectance trajectory benchmarked against 5-year climatological baseline.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
            🛰️ Mean NDVI: {meanNdvi.toFixed(2)} ({vegetativeHealthClassification})
          </span>
        </div>
      </div>

      {/* SVG Time Series Curve */}
      <div className="w-full overflow-x-auto">
        <svg viewBox="0 0 780 230" className="w-full min-w-[650px] h-auto font-sans select-none">
          {/* Grid lines */}
          <line x1="50" y1="35" x2="740" y2="35" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="50" y1="80" x2="740" y2="80" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="50" y1="125" x2="740" y2="125" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="50" y1="170" x2="740" y2="170" stroke="#475569" strokeWidth="1.5" />

          {/* Y Axis Labels */}
          <text x="35" y="40" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">1.0</text>
          <text x="35" y="85" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">0.7</text>
          <text x="35" y="130" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">0.4</text>
          <text x="35" y="175" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">0.1</text>

          {/* Baseline 5-Yr Mean Dotted Path */}
          <path
            d="M 90 156 L 210 120 L 330 89 L 450 72 L 570 102 L 690 133"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Current Crop Season Filled Glowing Area */}
          <path
            d="M 90 153 L 210 114 L 330 79 L 450 58 L 570 88 L 690 129 L 690 170 L 90 170 Z"
            fill="#10b981"
            fillOpacity="0.18"
          />
          {/* Current Crop Season NDVI Solid Path */}
          <path
            d="M 90 153 L 210 114 L 330 79 L 450 58 L 570 88 L 690 129"
            fill="none"
            stroke="#34d399"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Data Points */}
          {timeSteps.map((step, idx) => {
            const ptX = 90 + idx * 120;
            const ptY = 170 - (step.currentNdvi / 1.0) * 135;
            const isHovered = hoveredPoint === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredPoint(idx)}
                onClick={() => setHoveredPoint(idx)}
                className="cursor-pointer group"
              >
                <circle
                  cx={ptX}
                  cy={ptY}
                  r={isHovered ? 7 : 4.5}
                  fill={isHovered ? '#34d399' : '#10b981'}
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
                <text
                  x={ptX}
                  y="190"
                  textAnchor="middle"
                  fill={isHovered ? '#34d399' : '#94a3b8'}
                  fontSize="9.5"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                  fontFamily="Outfit, sans-serif"
                >
                  {step.doy}
                </text>
                <text
                  x={ptX}
                  y="204"
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {step.stage.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Point Metadata Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-slate-800 text-xs font-mono">
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
          <span className="text-slate-400 font-sans text-[11px] block">{activeStep.stage}:</span>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">NDVI: {activeStep.currentNdvi.toFixed(2)}</div>
        </div>
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
          <span className="text-slate-400 font-sans text-[11px] block">5-Yr Baseline Mean:</span>
          <div className="text-sm font-bold text-slate-300 mt-0.5">NDVI: {activeStep.baselineNdvi.toFixed(2)}</div>
        </div>
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
          <span className="text-slate-400 font-sans text-[11px] block">Vegetative Anomaly:</span>
          <div className="text-sm font-bold text-sky-400 mt-0.5">
            {ndviAnomalyVsFiveYearMeanPct >= 0 ? `+${ndviAnomalyVsFiveYearMeanPct}%` : `${ndviAnomalyVsFiveYearMeanPct}%`}
          </div>
        </div>
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
          <span className="text-slate-400 font-sans text-[11px] block">Chlorophyll (NDRE):</span>
          <div className="text-sm font-bold text-teal-400 mt-0.5">{canopyChlorophyllIndex} Index</div>
        </div>
      </div>
    </div>
  );
};
