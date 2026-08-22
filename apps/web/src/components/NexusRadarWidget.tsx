import React from 'react';
import { WEFESPillar } from '@wefes/shared-types';
import { Droplets, Sprout, Zap, Sparkles, Coins, ShieldCheck } from 'lucide-react';

interface NexusRadarWidgetProps {
  activePillar: WEFESPillar;
  onSelectPillar: (pillar: WEFESPillar) => void;
  lang: 'en' | 'np';
}

export const NexusRadarWidget: React.FC<NexusRadarWidgetProps> = ({
  activePillar,
  onSelectPillar,
  lang
}) => {
  const axes = [
    {
      pillar: 'water' as WEFESPillar,
      label: lang === 'np' ? 'जलस्रोत' : 'Water Security',
      score: 84,
      icon: Droplets,
      color: '#0284c7',
      desc: 'Glacial Kali Gandaki + Perennial Badigad Basin'
    },
    {
      pillar: 'food' as WEFESPillar,
      label: lang === 'np' ? 'खाद्य विविधता' : 'Food Diversity',
      score: 78,
      icon: Sprout,
      color: '#059669',
      desc: 'Arabica Coffee, Citrus, Grains & Potato Pockets'
    },
    {
      pillar: 'energy' as WEFESPillar,
      label: lang === 'np' ? 'नवीकरणीय ऊर्जा' : 'Clean Energy',
      score: 64,
      icon: Zap,
      color: '#d97706',
      desc: 'Hydro Corridors & 5.1 kWh/m² Solar Ridges'
    },
    {
      pillar: 'ecosystem' as WEFESPillar,
      label: lang === 'np' ? 'माटो र वन' : 'Soil & Ecosystem',
      score: 72,
      icon: Sparkles,
      color: '#10b981',
      desc: 'Community Forestry & NARC Ground Samples'
    },
    {
      pillar: 'socioeconomics' as WEFESPillar,
      label: lang === 'np' ? 'बजार र पूर्वाधार' : 'Socioeconomic Access',
      score: 69,
      icon: Coins,
      color: '#4f46e5',
      desc: 'Tamghas Hub Proximity & Feeder Road Corridors'
    }
  ];

  // Calculate radar polygon points (radius 75, center 90, 90)
  const size = 180;
  const center = size / 2;
  const radius = 65;

  const getCoordinates = (index: number, total: number, valueRatio: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = radius * valueRatio;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const polyPoints = axes
    .map((a, i) => {
      const { x, y } = getCoordinates(i, axes.length, a.score / 100);
      return `${x},${y}`;
    })
    .join(' ');

  const gridCircles = [0.25, 0.5, 0.75, 1.0];

  const compositeScore = Math.round(axes.reduce((acc, a) => acc + a.score, 0) / axes.length);

  return (
    <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs bg-white/95 flex flex-col justify-between gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-slate-900 font-outfit flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {lang === 'np' ? 'गुल्मी नेक्सस समष्टिगत सूचकांक' : 'Gulmi WEFES Nexus Resilience Radar'}
          </h3>
          <p className="text-xs text-slate-500">
            {lang === 'np' ? '५ स्तम्भहरूको अन्तरसम्बन्ध र सबल पक्षहरू' : '5-Pillar Integrated Systemic Equilibrium'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl font-mono">
          <span className="text-[10px] text-emerald-700 font-semibold uppercase">Composite Index:</span>
          <strong className="text-sm text-emerald-900 font-bold">{compositeScore}%</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Radar SVG Diagram */}
        <div className="md:col-span-5 flex items-center justify-center">
          <div className="relative">
            <svg width={size} height={size} className="overflow-visible">
              {/* Background grid rings */}
              {gridCircles.map(ratio => (
                <polygon
                  key={ratio}
                  points={axes
                    .map((_, i) => {
                      const { x, y } = getCoordinates(i, axes.length, ratio);
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={ratio < 1 ? '2 2' : 'none'}
                />
              ))}

              {/* Axis lines */}
              {axes.map((_, i) => {
                const { x, y } = getCoordinates(i, axes.length, 1.0);
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Filled Polygon */}
              <polygon
                points={polyPoints}
                fill="rgba(16, 185, 129, 0.25)"
                stroke="#059669"
                strokeWidth="2.2"
                className="transition-all duration-500"
              />

              {/* Data points */}
              {axes.map((a, i) => {
                const { x, y } = getCoordinates(i, axes.length, a.score / 100);
                const isSelected = activePillar === a.pillar;
                return (
                  <circle
                    key={a.pillar}
                    cx={x}
                    cy={y}
                    r={isSelected ? 5.5 : 4}
                    fill={isSelected ? '#ffffff' : a.color}
                    stroke={isSelected ? a.color : '#ffffff'}
                    strokeWidth="2"
                    className="cursor-pointer transition-all"
                    onClick={() => onSelectPillar(a.pillar)}
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* Pillar Metric Cards List */}
        <div className="md:col-span-7 space-y-2">
          {axes.map(a => {
            const isSelected = activePillar === a.pillar;
            const Icon = a.icon;
            return (
              <div
                key={a.pillar}
                onClick={() => onSelectPillar(a.pillar)}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${a.color}15`, color: a.color }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{a.label}</div>
                    <div className="text-[10px] text-slate-500 truncate">{a.desc}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 font-mono font-bold text-xs text-slate-800">
                  <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${a.score}%`, backgroundColor: a.color }}
                    />
                  </div>
                  <span>{a.score}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
