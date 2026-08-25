import React from 'react';
import { DeepNexusAnalysis } from '@wefes/wefes-engine';

interface ShadowSdgTabProps {
  deep: DeepNexusAnalysis;
}

export const ShadowSdgTab: React.FC<ShadowSdgTabProps> = ({ deep }) => {
  const { naturalCapital, sdgAlignments } = deep;

  return (
    <div className="space-y-5">
      {/* Natural Capital Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="font-bold text-xs text-slate-900 font-outfit">1. Conventional Financial Ledger</span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">Standard Ledger</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-700">
              <span className="font-sans">Gross Farmgate Revenue:</span>
              <span className="font-bold text-emerald-700">+NPR {naturalCapital.grossFinancialRevenueNpr.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span className="font-sans">(-) Direct Labor Wage:</span>
              <span className="font-bold text-rose-700">-NPR {naturalCapital.laborDirectCostNpr.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span className="font-sans">(-) Irrigation & Energy Cost:</span>
              <span className="font-bold text-rose-700">-NPR {naturalCapital.energyDirectCostNpr.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-bold text-slate-900 text-sm">
              <span className="font-sans">Conventional Net Profit:</span>
              <span className="text-emerald-800">NPR {naturalCapital.conventionalNetProfitNpr.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-purple-200 pb-2">
            <span className="font-bold text-xs text-purple-950 font-outfit">2. True Ecological Nexus Valuation</span>
            <span className="text-[10px] bg-purple-200 text-purple-950 px-2 py-0.5 rounded font-mono font-bold">Natural Capital</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-700">
              <span className="font-sans">Conventional Net Profit:</span>
              <span className="font-bold">NPR {naturalCapital.conventionalNetProfitNpr.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span className="font-sans">(-) Water Shadow Scarcity (14.5 NPR/m³):</span>
              <span className="font-bold text-rose-700">-NPR {naturalCapital.waterShadowCostNpr.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span className="font-sans">(-) Soil N-P-K Depletion:</span>
              <span className="font-bold text-rose-700">-NPR {naturalCapital.soilNutrientDepletionCostNpr.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span className="font-sans">(+) Carbon Sequestration Credit:</span>
              <span className="font-bold text-emerald-700">+NPR {naturalCapital.carbonCreditAssetNpr.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-purple-200 font-bold text-purple-950 text-sm">
              <span className="font-sans">True Nexus Net Value:</span>
              <span className="text-purple-900">NPR {naturalCapital.trueNexusNetValueNpr.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* UN SDG Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {sdgAlignments.map((sdg) => (
          <div key={sdg.sdgNumber} className="p-3 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${sdg.color}`}>
                {sdg.sdgNumber}
              </span>
              <span className="text-xs font-mono font-bold text-slate-900">{sdg.alignmentScore}/100</span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 font-outfit">{sdg.targetTitle}</div>
              <div className="text-[11px] text-slate-500 font-sans mt-0.5">{sdg.sdgName}</div>
            </div>
            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-600">
              <span>{sdg.metricLabel}:</span>
              <strong className="text-slate-900">{sdg.metricValue}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
