import React from 'react';
import { DeepNexusAnalysis } from '@wefes/wefes-engine';
import { HeartHandshake } from 'lucide-react';

interface GesiTabProps {
  deep: DeepNexusAnalysis;
}

export const GesiTab: React.FC<GesiTabProps> = ({ deep }) => {
  const { gesi } = deep;

  return (
    <div className="space-y-5">
      <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-950 flex items-start gap-2">
        <HeartHandshake className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
        <span>
          <strong>Agrarian Feminization & Youth Outmigration Dynamics:</strong> Due to heavy male labor outmigration to foreign employment, over 70% of day-to-day farming in rural Nepal is managed by female smallholders and elderly family members. Managing labor bottlenecks is critical to prevent land abandonment (*Banjho Jameen*).
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1 text-center">
          <div className="text-[10px] text-slate-500 font-sans">Peak Labor Deficit</div>
          <div className="text-xl font-extrabold text-rose-700">{gesi.peakSeasonLaborDeficitPct}%</div>
          <div className="text-[10px] text-slate-400 font-sans">Outmigration shortage</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1 text-center">
          <div className="text-[10px] text-slate-500 font-sans">Female Drudgery Index</div>
          <div className="text-xl font-extrabold text-amber-700">{gesi.femaleDrudgeryIndex}/100</div>
          <div className="text-[10px] text-slate-400 font-sans">Weeding/Harvest burden</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1 text-center">
          <div className="text-[10px] text-slate-500 font-sans">Fallow Land Risk</div>
          <div className="text-sm font-extrabold text-purple-800 mt-1">{gesi.fallowLandRiskCategory}</div>
          <div className="text-[10px] text-slate-400 font-sans">Banjho Jameen hazard</div>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-purple-200 bg-white space-y-2 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-purple-950 font-outfit">Micro-Mechanization & Women Empowerment Dividend</span>
          <span className="text-[10px] bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded font-mono font-bold">
            {gesi.mechanizationSuitability}
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-sans">
          {gesi.womenEmpowermentDividend}
        </p>
      </div>
    </div>
  );
};
