import React from 'react';
import { WEFESOutput } from '@wefes/shared-types';
import { DeepNexusAnalysis } from '@wefes/wefes-engine';
import { Lightbulb, FileText } from 'lucide-react';

interface InterventionsTabProps {
  output: WEFESOutput;
  deep: DeepNexusAnalysis;
}

export const InterventionsTab: React.FC<InterventionsTabProps> = ({ output, deep }) => {
  const { interventions, rusle, importSubstitution } = deep;

  return (
    <div className="space-y-5">
      <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
        <Lightbulb className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <span>
          <strong>Pareto Frontier Optimal Levers:</strong> Prioritized technological and policy interventions shift current district resource bottlenecks toward the Pareto frontier, generating co-benefits without added environmental friction.
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {interventions.map((item) => (
          <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">{item.domain}</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                  +{item.projectedScoreGain} pts
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 font-outfit mt-1">{item.name}</h4>

              <div className="mt-2 space-y-1 text-xs">
                <div className="text-rose-700 text-[11px]">
                  <strong>Resolves:</strong> {item.targetTradeoffResolved}
                </div>
                <div className="text-emerald-700 text-[11px]">
                  <strong>Creates:</strong> {item.synergyCreated}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Est. Capital: <strong>{item.implementationCostNpr}</strong></span>
              <span>Payback: <strong className="text-emerald-700">{item.paybackPeriodYears}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Policy Dossier Brief Section */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 font-outfit flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-600" />
            Institutional Recommendation for MoALD & District Coordination Committee (DCC)
          </span>
          <span className="text-[10px] font-mono text-slate-500">Document Ref: WEFES-NP-2026</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-sans">
          Cultivation of <strong>{output.cropName}</strong> in <strong>{output.districtName}</strong> generates a baseline Nexus Harmony Score of <strong>{output.nexusBalanceIndex}/100</strong>. Subsidized <em>Smart Solar Micro-Drip Irrigation</em> combined with <em>Biochar Soil Conditioning</em> is projected to elevate the district nexus equilibrium to <strong>{Math.min(100, output.nexusBalanceIndex + 21.3)}/100</strong>, preserving <strong>+{rusle.topsoilPreservedTons} t/ha</strong> of topsoil and displacing NPR {importSubstitution.annualImportDisplacedNpr.toLocaleString()} in agricultural imports.
        </p>
      </div>
    </div>
  );
};
