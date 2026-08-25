import React, { useState } from 'react';

interface NexusRadarSpiderProps {
  districtName: string;
  cropName: string;
  waterScore: number;
  energyScore: number;
  foodScore: number;
  ecosystemScore: number;
  socioeconomicScore: number;
}

export const NexusRadarSpider: React.FC<NexusRadarSpiderProps> = ({
  districtName,
  cropName,
  waterScore,
  energyScore,
  foodScore,
  ecosystemScore,
  socioeconomicScore,
}) => {
  const [hoveredPillar, setHoveredPillar] = useState<string | null>(null);

  // Pillars around 360 degrees (72 deg increments, starting from top at -90 deg)
  const pillars = [
    { id: 'water', label: 'Water Security', score: waterScore, baseline: Math.max(30, waterScore - 28), angle: -90, color: '#0ea5e9' },
    { id: 'energy', label: 'Clean Energy', score: energyScore, baseline: Math.max(25, energyScore - 32), angle: -18, color: '#f59e0b' },
    { id: 'food', label: 'Food & Nutrition', score: foodScore, baseline: Math.max(35, foodScore - 20), angle: 54, color: '#10b981' },
    { id: 'ecosystem', label: 'Ecosystem Carbon', score: ecosystemScore, baseline: Math.max(20, ecosystemScore - 35), angle: 126, color: '#8b5cf6' },
    { id: 'socio', label: 'Socioeconomics', score: socioeconomicScore, baseline: Math.max(30, socioeconomicScore - 25), angle: 198, color: '#ec4899' },
  ];

  const center = 160;
  const radius = 105;

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  // Generate polygon points for active scores
  const scorePoints = pillars.map(p => {
    const pt = polarToCartesian(center, center, (p.score / 100) * radius, p.angle);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  // Generate polygon points for baseline
  const baselinePoints = pillars.map(p => {
    const pt = polarToCartesian(center, center, (p.baseline / 100) * radius, p.angle);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  const activePillarObj = pillars.find(p => p.id === hoveredPillar);

  return (
    <div className="p-5 sm:p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              5-Pillar WEFES Nexus Radar & Diagnostic Spider
            </span>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              {districtName} · {cropName}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Hover over any pillar axis to inspect baseline status vs recommended cross-sectoral interventions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
            ⭐ Composite Balance: {Math.round((waterScore + energyScore + foodScore + ecosystemScore + socioeconomicScore) / 5)} / 100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* SVG Radar Chart (7 cols) */}
        <div className="md:col-span-7 flex items-center justify-center p-2">
          <svg viewBox="0 0 320 320" className="w-full max-w-[290px] h-auto select-none font-sans">
            {/* Concentric Background Grid Rings (20%, 40%, 60%, 80%, 100%) */}
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, i) => (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius * level}
                fill="none"
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray={i === 4 ? 'none' : '3 3'}
              />
            ))}

            {/* Pillar Radial Axes */}
            {pillars.map((p, i) => {
              const outerPt = polarToCartesian(center, center, radius, p.angle);
              const labelPt = polarToCartesian(center, center, radius + 24, p.angle);
              return (
                <g key={i}>
                  <line x1={center} y1={center} x2={outerPt.x} y2={outerPt.y} stroke="#475569" strokeWidth="1" />
                  <text
                    x={labelPt.x}
                    y={labelPt.y + 3}
                    textAnchor="middle"
                    fill={hoveredPillar === p.id ? '#34d399' : '#94a3b8'}
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="Outfit, sans-serif"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredPillar(p.id)}
                    onMouseLeave={() => setHoveredPillar(null)}
                  >
                    {p.label.split(' ')[0]}
                  </text>
                </g>
              );
            })}

            {/* Baseline Polygon (Gray/Orange Dotted) */}
            <polygon
              points={baselinePoints}
              fill="#f59e0b"
              fillOpacity="0.12"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />

            {/* Optimized Nexus Polygon (Emerald Glowing) */}
            <polygon
              points={scorePoints}
              fill="#10b981"
              fillOpacity="0.35"
              stroke="#34d399"
              strokeWidth="2.5"
              className="transition-all duration-300 drop-shadow-md"
            />

            {/* Vertex Score Markers */}
            {pillars.map((p, i) => {
              const pt = polarToCartesian(center, center, (p.score / 100) * radius, p.angle);
              const isHovered = hoveredPillar === p.id;
              return (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#34d399' : p.color}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredPillar(p.id)}
                  onMouseLeave={() => setHoveredPillar(null)}
                />
              );
            })}
          </svg>
        </div>

        {/* Pillar Details Column (5 cols) */}
        <div className="md:col-span-5 space-y-2.5 text-xs font-mono">
          <div className="flex items-center justify-between p-2.5 bg-slate-800 rounded-xl border border-slate-700 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              Synergistic Nexus Score
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              Business-As-Usual
            </span>
          </div>

          <div className="space-y-1.5">
            {pillars.map((p) => (
              <div
                key={p.id}
                onMouseEnter={() => setHoveredPillar(p.id)}
                onMouseLeave={() => setHoveredPillar(null)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  hoveredPillar === p.id ? 'bg-emerald-950/80 border-emerald-500 shadow-xs' : 'bg-slate-800/80 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
                  <span className="text-white font-sans font-bold text-xs">{p.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-[11px]">BAU: {p.baseline}</span>
                  <span className="font-bold text-emerald-400 text-sm">{p.score} / 100</span>
                </div>
              </div>
            ))}
          </div>

          {activePillarObj && (
            <div className="p-3 bg-emerald-950/90 rounded-xl border border-emerald-700 text-emerald-200 text-[11px] font-sans">
              <strong>{activePillarObj.label} Leverage:</strong> +{activePillarObj.score - activePillarObj.baseline} point gain through integrated agro-solar pumping, bio-slurry substitution, and climate-resilient varietals.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
