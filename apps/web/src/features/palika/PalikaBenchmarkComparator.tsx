import React, { useState } from 'react';
import { DISTRICT_PALIKAS, DistrictPalika } from '../../data/districtPalikaAssets';
import { Scale, Sparkles, Mountain, Thermometer, CloudRain, Zap, Sprout, Coins, Droplets, ArrowRight } from 'lucide-react';
import { getPalikaMicroClimate } from '../../utils/climateDownscaling';

interface PalikaBenchmarkComparatorProps {
  lang?: 'en' | 'np';
  initialPalika1?: string;
  initialPalika2?: string;
}

export const PalikaBenchmarkComparator: React.FC<PalikaBenchmarkComparatorProps> = ({
  lang = 'en',
  initialPalika1 = 'Ruru',
  initialPalika2 = 'Madane',
}) => {
  const [palika1Name, setPalika1Name] = useState<string>(initialPalika1);
  const [palika2Name, setPalika2Name] = useState<string>(initialPalika2);

  const gulmiPalikas = DISTRICT_PALIKAS.gulmi || [];
  const p1 = gulmiPalikas.find(p => p.name === palika1Name) || gulmiPalikas[10]; // Ruru
  const p2 = gulmiPalikas.find(p => p.name === palika2Name) || gulmiPalikas[6]; // Madane

  // Downscaled micro-climate calculations for baseline month (July, 318mm base, 19.5C base)
  const micro1 = getPalikaMicroClimate(p1.name, 318, 19.5, 7, p1.elevation);
  const micro2 = getPalikaMicroClimate(p2.name, 318, 19.5, 7, p2.elevation);

  // Compute 5-Pillar Score estimates (0-100)
  const getPillarScores = (p: DistrictPalika, micro: any) => {
    const foodScore = Math.round(
      (p.feasibleCrops?.reduce((acc, c) => acc + c.score, 0) || 600) / (p.feasibleCrops?.length || 8)
    );
    const waterScore = Math.min(100, Math.round((micro.annualRainMm / 2200) * 100));
    const ecoScore = Math.min(100, Math.round((p.soilPh / 7.2) * 55 + (p.elevation > 1400 ? 40 : 25)));
    const energyScore = Math.min(100, Math.round(p.elevation > 1400 ? 88 : 74));
    const socioScore = Math.min(100, Math.round(p.name === 'Resunga' ? 95 : p.name === 'Musikot' ? 90 : 75));

    return {
      food: foodScore,
      water: waterScore,
      ecosystem: ecoScore,
      energy: energyScore,
      socioeconomics: socioScore,
    };
  };

  const scores1 = getPillarScores(p1, micro1);
  const scores2 = getPillarScores(p2, micro2);

  const pillars = [
    { key: 'food', label: 'Food & Crops', icon: '🌾' },
    { key: 'water', label: 'Water Security', icon: '💧' },
    { key: 'ecosystem', label: 'Ecosystem & Soil', icon: '🌲' },
    { key: 'energy', label: 'Clean Energy', icon: '⚡' },
    { key: 'socioeconomics', label: 'Governance & Trade', icon: '🏛️' },
  ] as const;

  // Radar Polygon coordinates calculation (Center: 120, 120, Radius: 90)
  const cx = 120;
  const cy = 120;
  const r = 85;

  const getCoordinates = (scores: Record<string, number>) => {
    return pillars.map((p, i) => {
      const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
      const val = scores[p.key] / 100;
      const x = cx + r * val * Math.cos(angle);
      const y = cy + r * val * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  const poly1 = getCoordinates(scores1);
  const poly2 = getCoordinates(scores2);

  return (
    <div className="glass-panel p-4 rounded-2xl border border-indigo-200 bg-white/95 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-100 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-outfit uppercase tracking-wide flex items-center gap-2">
              <span>{lang === 'np' ? 'दुई स्थानीय तह बेन्चमार्क राडार तुलना' : 'Two-Palika Side-by-Side Benchmark Radar'}</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-mono font-bold">
                Nexus Dual-Radar
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-sans">
              {lang === 'np'
                ? '५ नेक्सस आयाम, माटोको गुणस्तर, र जलवायु सूचकांकको तुलनात्मक विश्लेषण'
                : 'Direct head-to-head biophysical, soil chemistry & 5-pillar radar comparison'}
            </p>
          </div>
        </div>
      </div>

      {/* Selector Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Palika 1 */}
        <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 ring-2 ring-emerald-300" />
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Palika 1 (Primary)</div>
              <select
                value={palika1Name}
                onChange={e => setPalika1Name(e.target.value)}
                className="bg-white border border-emerald-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 cursor-pointer shadow-2xs mt-0.5"
              >
                {gulmiPalikas.map(p => (
                  <option key={p.id} value={p.name} disabled={p.name === palika2Name}>
                    {p.name} ({p.elevation}m)
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-right text-xs font-mono text-emerald-900 font-bold">
            pH {p1.soilPh} • {p1.elevation}m
          </div>
        </div>

        {/* Palika 2 */}
        <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-600 ring-2 ring-indigo-300" />
            <div>
              <div className="text-[10px] uppercase font-bold text-indigo-800 tracking-wider">Palika 2 (Benchmark)</div>
              <select
                value={palika2Name}
                onChange={e => setPalika2Name(e.target.value)}
                className="bg-white border border-indigo-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 cursor-pointer shadow-2xs mt-0.5"
              >
                {gulmiPalikas.map(p => (
                  <option key={p.id} value={p.name} disabled={p.name === palika1Name}>
                    {p.name} ({p.elevation}m)
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-right text-xs font-mono text-indigo-900 font-bold">
            pH {p2.soilPh} • {p2.elevation}m
          </div>
        </div>
      </div>

      {/* Dual Radar & Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Dual Radar Chart Canvas */}
        <div className="flex flex-col items-center justify-center p-3 bg-slate-50/80 rounded-xl border border-slate-200">
          <svg width="240" height="240" viewBox="0 0 240 240" className="overflow-visible">
            {/* Concentric Guide Circles */}
            {[0.25, 0.5, 0.75, 1.0].map((level, idx) => (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r={r * level}
                fill="none"
                stroke="#cbd5e1"
                strokeDasharray={level === 1 ? '' : '2,2'}
                strokeWidth="1"
              />
            ))}

            {/* Radial Axes & Labels */}
            {pillars.map((p, i) => {
              const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
              const x2 = cx + r * Math.cos(angle);
              const y2 = cy + r * Math.sin(angle);
              const labelX = cx + (r + 18) * Math.cos(angle);
              const labelY = cy + (r + 18) * Math.sin(angle);
              return (
                <g key={p.key}>
                  <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#cbd5e1" strokeWidth="1" />
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[9px] fill-slate-700 font-semibold font-sans"
                  >
                    {p.icon} {p.label.split('&')[0]}
                  </text>
                </g>
              );
            })}

            {/* Palika 1 Polygon (Emerald) */}
            <polygon
              points={poly1}
              fill="#059669"
              fillOpacity="0.35"
              stroke="#059669"
              strokeWidth="2.5"
            />

            {/* Palika 2 Polygon (Indigo) */}
            <polygon
              points={poly2}
              fill="#6366f1"
              fillOpacity="0.30"
              stroke="#4f46e5"
              strokeWidth="2.5"
            />
          </svg>

          {/* Radar Legend */}
          <div className="flex items-center gap-4 mt-2 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
              {p1.name}
            </span>
            <span className="flex items-center gap-1.5 text-indigo-800">
              <span className="w-3 h-3 rounded-sm bg-indigo-600 inline-block" />
              {p2.name}
            </span>
          </div>
        </div>

        {/* Head-to-Head Comparison Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-2">Indicator</th>
                <th className="p-2 text-emerald-800 bg-emerald-50/50">{p1.name}</th>
                <th className="p-2 text-indigo-800 bg-indigo-50/50">{p2.name}</th>
                <th className="p-2 text-slate-500">Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-2 font-medium text-slate-700 flex items-center gap-1">
                  <Mountain className="w-3 h-3 text-slate-500" /> Elevation
                </td>
                <td className="p-2 font-mono font-bold text-slate-900">{p1.elevation}m</td>
                <td className="p-2 font-mono font-bold text-slate-900">{p2.elevation}m</td>
                <td className="p-2 text-[10px] font-mono text-slate-500">Δ {Math.abs(p1.elevation - p2.elevation)}m</td>
              </tr>
              <tr>
                <td className="p-2 font-medium text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> Soil pH
                </td>
                <td className="p-2 font-mono font-bold text-emerald-800">{p1.soilPh} ({p1.soilPh < 6.0 ? 'Acidic' : 'Neutral'})</td>
                <td className="p-2 font-mono font-bold text-indigo-800">{p2.soilPh} ({p2.soilPh < 6.0 ? 'Acidic' : 'Neutral'})</td>
                <td className="p-2 text-[10px] font-bold text-emerald-700">{p1.soilPh >= p2.soilPh ? p1.name : p2.name}</td>
              </tr>
              <tr>
                <td className="p-2 font-medium text-slate-700 flex items-center gap-1">
                  <CloudRain className="w-3 h-3 text-sky-600" /> Annual Rain
                </td>
                <td className="p-2 font-mono font-bold text-slate-900">{micro1.annualRainMm} mm</td>
                <td className="p-2 font-mono font-bold text-slate-900">{micro2.annualRainMm} mm</td>
                <td className="p-2 text-[10px] font-bold text-sky-700">{micro1.annualRainMm >= micro2.annualRainMm ? p1.name : p2.name}</td>
              </tr>
              <tr>
                <td className="p-2 font-medium text-slate-700 flex items-center gap-1">
                  <Sprout className="w-3 h-3 text-emerald-600" /> ☕ Arabica Coffee
                </td>
                <td className="p-2 font-mono font-bold text-emerald-800">
                  {p1.feasibleCrops?.find(c => c.cropId === 'coffee')?.score ?? 70}%
                </td>
                <td className="p-2 font-mono font-bold text-indigo-800">
                  {p2.feasibleCrops?.find(c => c.cropId === 'coffee')?.score ?? 70}%
                </td>
                <td className="p-2 text-[10px] font-bold text-emerald-700">
                  {(p1.feasibleCrops?.find(c => c.cropId === 'coffee')?.score ?? 0) >= (p2.feasibleCrops?.find(c => c.cropId === 'coffee')?.score ?? 0) ? p1.name : p2.name}
                </td>
              </tr>
              <tr>
                <td className="p-2 font-medium text-slate-700 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-amber-600" /> Labor Wage
                </td>
                <td className="p-2 font-mono text-slate-900">NPR {p1.name === 'Resunga' ? 900 : p1.name === 'Musikot' ? 850 : 700}/day</td>
                <td className="p-2 font-mono text-slate-900">NPR {p2.name === 'Resunga' ? 900 : p2.name === 'Musikot' ? 850 : 700}/day</td>
                <td className="p-2 text-[10px] text-slate-500">Regional Standard</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
