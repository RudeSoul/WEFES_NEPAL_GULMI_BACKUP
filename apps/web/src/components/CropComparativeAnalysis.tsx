import React from 'react';
import { District, Crop, CropSuitability } from '@wefes/shared-types';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Sparkles } from 'lucide-react';

interface CropComparativeAnalysisProps {
  district: District;
  crops: { crop: Crop; suitability: CropSuitability }[];
  selectedCropId: string;
}

const CROP_COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];

export const CropComparativeAnalysis: React.FC<CropComparativeAnalysisProps> = ({ district, crops, selectedCropId }) => {
  // Show selected crop + top 2 alternatives by suitability score (excluding selected)
  const selected = crops.find(c => c.crop.id === selectedCropId);
  const alternatives = crops
    .filter(c => c.crop.id !== selectedCropId)
    .sort((a, b) => b.suitability.suitabilityScore - a.suitability.suitabilityScore)
    .slice(0, 2);

  const displayCrops = [selected, ...alternatives].filter(Boolean) as { crop: Crop; suitability: CropSuitability }[];

  const pillars = ['water', 'energy', 'food', 'ecosystem', 'socioeconomics'] as const;
  const pillarLabels: Record<string, string> = {
    water: 'Water',
    energy: 'Energy',
    food: 'Food',
    ecosystem: 'Ecosystem',
    socioeconomics: 'Socioeconomics',
  };

  // Build radar data — one entry per pillar, multiple crop values
  const radarData = pillars.map(p => {
    const entry: Record<string, number | string> = { pillar: pillarLabels[p] };
    displayCrops.forEach(({ crop, suitability }) => {
      entry[crop.name] = suitability.pillarScores[p];
    });
    return entry;
  });

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm bg-white/95 space-y-4 animate-fade-in-up">
      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-outfit">
        <Sparkles className="w-4 h-4 text-emerald-600" />
        Comparative Crop Analysis — {district.name}
      </h3>
      <p className="text-xs text-slate-500">
        Side-by-side WEFES suitability comparison of your selected crop vs. top alternatives for this district.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <div className="h-[260px] bg-slate-50/60 rounded-xl p-2 border border-slate-200/80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#cbd5e1" />
              <PolarAngleAxis dataKey="pillar" stroke="#475569" tick={{ fill: '#334155', fontSize: 10, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" tick={{ fill: '#64748b', fontSize: 8 }} />
              {displayCrops.map(({ crop }, i) => (
                <Radar
                  key={crop.id}
                  name={crop.name}
                  dataKey={crop.name}
                  stroke={CROP_COLORS[i]}
                  fill={CROP_COLORS[i]}
                  fillOpacity={i === 0 ? 0.3 : 0.1}
                  strokeWidth={i === 0 ? 2 : 1.5}
                  strokeDasharray={i === 0 ? undefined : '4 2'}
                />
              ))}
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.5rem', color: '#0f172a', fontSize: 11, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#475569' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-800 border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-2 px-2.5 text-slate-600 font-semibold uppercase tracking-wider font-sans">Metric</th>
                {displayCrops.map(({ crop }, i) => (
                  <th key={crop.id} className="py-2 px-2 text-center font-bold" style={{ color: CROP_COLORS[i] }}>
                    {crop.name}
                    {i === 0 && <span className="ml-1 text-[9px] bg-slate-200 text-slate-800 border border-slate-300 px-1.5 py-0.5 rounded font-sans font-bold">Selected</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { key: 'overall', label: 'Overall Fit %' },
                { key: 'water', label: 'Water Score' },
                { key: 'energy', label: 'Energy Score' },
                { key: 'food', label: 'Food Score' },
                { key: 'ecosystem', label: 'Ecosystem Score' },
                { key: 'socioeconomics', label: 'Socioeconomics' },
                { key: 'market', label: 'Market Value (NPR)' },
                { key: 'water_footprint', label: 'Water Footprint (L)' },
              ].map(({ key, label }) => (
                <tr key={key} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-2.5 text-slate-600 font-sans font-medium">{label}</td>
                  {displayCrops.map(({ crop, suitability }) => {
                    const val =
                      key === 'overall' ? suitability.suitabilityScore :
                      key === 'market' ? crop.marketValuePerUnit.toLocaleString() :
                      key === 'water_footprint' ? crop.waterFootprintPerUnit.toLocaleString() :
                      suitability.pillarScores[key as keyof typeof suitability.pillarScores];
                    const isNum = typeof val === 'number';
                    const numVal = isNum ? val : 0;
                    return (
                      <td key={crop.id} className="py-2 px-2 text-center font-semibold">
                        <span className={isNum && key !== 'market' && key !== 'water_footprint'
                          ? numVal >= 75 ? 'text-emerald-700 font-bold' : numVal >= 50 ? 'text-amber-700 font-bold' : 'text-rose-700 font-bold'
                          : 'text-slate-800'
                        }>
                          {val}{isNum && key !== 'market' && key !== 'water_footprint' ? '%' : ''}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
