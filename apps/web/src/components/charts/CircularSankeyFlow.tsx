import React, { useState } from 'react';

interface CircularSankeyFlowProps {
  districtName: string;
  cropName: string;
  biogasM3PerDay: number;
  lpgSavedPerYear: number;
  organicNPKSavedKg: number;
  annualStrawTonnes: number;
}

export const CircularSankeyFlow: React.FC<CircularSankeyFlowProps> = ({
  districtName,
  cropName,
  biogasM3PerDay,
  lpgSavedPerYear,
  organicNPKSavedKg,
  annualStrawTonnes,
}) => {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const nodes = [
    { id: 'crop', label: `${cropName} Crop Land`, sub: `${annualStrawTonnes.toFixed(1)}t Residue/yr`, x: 95, y: 150, color: '#10b981', type: 'source' },
    { id: 'livestock', label: 'Mixed Livestock Herd', sub: 'Buffalo, Cows & Goats', x: 340, y: 100, color: '#0ea5e9', type: 'process' },
    { id: 'aquaculture', label: 'Aquaculture Ponds', sub: 'Effluent Recycling', x: 340, y: 230, color: '#06b6d4', type: 'process' },
    { id: 'biogas', label: 'AEPC Biogas Digester', sub: `${biogasM3PerDay.toFixed(1)} m³/day gas`, x: 585, y: 80, color: '#f59e0b', type: 'energy' },
    { id: 'slurry', label: 'Bio-Slurry Conditioner', sub: `${organicNPKSavedKg} kg NPK saved`, x: 585, y: 200, color: '#8b5cf6', type: 'fertilizer' },
    { id: 'clean_cooking', label: 'Clean Cooking Energy', sub: `${lpgSavedPerYear} LPG Cylinders/yr`, x: 825, y: 60, color: '#ef4444', type: 'output' },
    { id: 'soil_health', label: 'Recharged Soil Carbon', sub: 'Replaces Urea & DAP', x: 825, y: 160, color: '#10b981', type: 'output' },
    { id: 'aquifer', label: 'Aquifer Recharge Pond', sub: '50m² Percolation', x: 825, y: 260, color: '#3b82f6', type: 'output' },
  ];

  const links = [
    { from: 'crop', to: 'livestock', label: 'Fodder & Straw', path: 'M 180 150 C 240 150, 260 110, 260 110', color: '#10b981' },
    { from: 'crop', to: 'aquaculture', label: 'Plant By-products', path: 'M 180 160 C 240 160, 260 230, 260 230', color: '#06b6d4' },
    { from: 'livestock', to: 'biogas', label: 'Daily Dung', path: 'M 420 100 C 480 100, 500 85, 505 85', color: '#f59e0b' },
    { from: 'livestock', to: 'slurry', label: 'Composting', path: 'M 420 115 C 480 115, 500 200, 505 200', color: '#8b5cf6' },
    { from: 'aquaculture', to: 'crop', label: 'Nutrient Water', path: 'M 260 240 C 190 240, 180 175, 180 165', color: '#0ea5e9' },
    { from: 'biogas', to: 'clean_cooking', label: 'Biomethane', path: 'M 665 80 C 720 80, 740 65, 745 65', color: '#ef4444' },
    { from: 'biogas', to: 'slurry', label: 'Digestate Effluent', path: 'M 585 105 C 585 140, 585 160, 585 175', color: '#8b5cf6' },
    { from: 'slurry', to: 'soil_health', label: 'NPK Dressing', path: 'M 665 200 C 720 200, 740 165, 745 165', color: '#10b981' },
    { from: 'aquaculture', to: 'aquifer', label: 'Pond Seepage', path: 'M 420 240 C 580 240, 680 265, 745 265', color: '#3b82f6' },
  ];

  return (
    <div className="p-5 sm:p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              Circular Resource Sankey & Bioeconomy Flows
            </span>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              {districtName} · Zero-Waste Nexus
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Hover over any node or flow ribbon to inspect mass, energy, and nutrient balances connecting crop, dairy, biogas, and soil.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
            🔄 Circularity: 94.2%
          </span>
        </div>
      </div>

      {/* SVG Canvas - Expanded Viewbox with zero text truncation */}
      <div className="w-full overflow-x-auto">
        <svg viewBox="0 0 940 320" className="w-full min-w-[780px] h-auto font-sans select-none">
          <defs>
            <linearGradient id="flowGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="flowGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="flowGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="flowGrad4" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Flow Links */}
          {links.map((link, idx) => {
            const isHighlighted = activeNode === link.from || activeNode === link.to;
            return (
              <g key={idx} className="transition-all duration-200">
                <path
                  d={link.path}
                  fill="none"
                  stroke={link.color}
                  strokeWidth={isHighlighted ? 6 : activeNode ? 1.5 : 3.5}
                  strokeOpacity={isHighlighted ? 0.95 : activeNode ? 0.2 : 0.65}
                  strokeLinecap="round"
                  className="cursor-pointer hover:stroke-white transition-all"
                />
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = activeNode === node.id;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => setActiveNode(node.id)}
                onMouseLeave={() => setActiveNode(null)}
                className="cursor-pointer"
              >
                {/* Node Box - Generous width of 165px to prevent text overflow */}
                <rect
                  x="-82"
                  y="-24"
                  width="164"
                  height="48"
                  rx="14"
                  fill="#1e293b"
                  stroke={isSelected ? '#34d399' : node.color}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="transition-all duration-200 drop-shadow-md"
                />
                <circle cx="-65" cy="0" r="5" fill={node.color} />
                <text x="-52" y="-3" fill="#ffffff" fontSize="10.5" fontWeight="bold" fontFamily="Outfit, sans-serif">
                  {node.label}
                </text>
                <text x="-52" y="12" fill="#94a3b8" fontSize="8.5" fontFamily="monospace">
                  {node.sub}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend & Active Node Feedback */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
        <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
          <span className="text-slate-300 text-[11px]">Crop & Soil Nexus</span>
        </div>
        <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0"></span>
          <span className="text-slate-300 text-[11px]">Livestock & Fodder</span>
        </div>
        <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
          <span className="text-slate-300 text-[11px]">AEPC Biogas Energy</span>
        </div>
        <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0"></span>
          <span className="text-slate-300 text-[11px]">Bio-Slurry NPK Return</span>
        </div>
      </div>
    </div>
  );
};
