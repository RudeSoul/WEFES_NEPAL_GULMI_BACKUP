import React from 'react';
import { WEFESOutput } from '@wefes/shared-types';
import { DeepNexusAnalysis } from '@wefes/wefes-engine';
import { Cpu, CheckCircle2, Sparkles, AlertTriangle, Layers } from 'lucide-react';

interface MathTabProps {
  output: WEFESOutput;
  deep: DeepNexusAnalysis;
}

export const MathTab: React.FC<MathTabProps> = ({ output, deep }) => {
  const {
    pillarScores,
    synergies,
    tradeoffs,
    synergyScoreTotal,
    tradeoffPenaltyTotal,
    couplingMatrix,
    shannonH,
    shannonEntropy,
    giniIndex,
    systemicState,
  } = deep;

  return (
    <div className="space-y-5">
      <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 shadow-md space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between text-slate-400 font-sans border-b border-slate-800 pb-2">
          <span className="font-bold flex items-center gap-1.5 text-emerald-400">
            <Cpu className="w-4 h-4" />
            JRC Non-Compensatory Multi-Criteria Formulation
          </span>
          <span className="text-[10px] text-slate-400">Standardized Equation</span>
        </div>

        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-slate-200 leading-relaxed font-mono">
          <div className="text-slate-400 text-[11px] font-sans mb-1">General Governance Formula:</div>
          <div className="text-emerald-300 font-bold text-sm">
            NexusScore = [ 0.40 · Φ(Synergies) + 0.35 · S(Socioeconomics) - 0.25 · Ψ(Trade-off Penalty) ] × E(Shannon)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
            <div className="text-emerald-400 font-sans font-bold">1. Synergy Vector Φ:</div>
            <div className="text-slate-300 mt-1">Φ = 0.50·FoodSec + 0.50·EcoHealth</div>
            <div className="text-slate-400 text-[10px] mt-0.5">Biomass, calories & CO₂ carbon offset</div>
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
            <div className="text-purple-400 font-sans font-bold">2. Economic Return S:</div>
            <div className="text-slate-300 mt-1">S = (NetRevenue / Gross) × 100</div>
            <div className="text-slate-400 text-[10px] mt-0.5">Deducting district daily labor wage & tariffs</div>
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
            <div className="text-rose-400 font-sans font-bold">3. Trade-off Penalty Ψ:</div>
            <div className="text-slate-300 mt-1">Ψ = 0.60·WaterStress + 0.40·FossilShare</div>
            <div className="text-slate-400 text-[10px] mt-0.5">Irrigation drawdown & grid energy draw</div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Live Substitution Card */}
      <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 space-y-3">
        <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider font-outfit flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Live Numerical Substitution for {output.cropName} in {output.districtName}</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
          <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-center">
            <div className="text-[10px] text-slate-500 font-sans">💧 Water Pillar</div>
            <div className="font-bold text-sky-800 text-sm mt-0.5">{pillarScores.water}/100</div>
            <div className="text-[9px] text-slate-500">Stress: {output.water.waterStressIndex}%</div>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-center">
            <div className="text-[10px] text-slate-500 font-sans">⚡ Energy Pillar</div>
            <div className="font-bold text-amber-800 text-sm mt-0.5">{pillarScores.energy}/100</div>
            <div className="text-[9px] text-slate-500">Renewable: {Math.round(100 - output.energy.fossilSharePercent)}%</div>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-center">
            <div className="text-[10px] text-slate-500 font-sans">🌾 Food Pillar</div>
            <div className="font-bold text-emerald-800 text-sm mt-0.5">{pillarScores.food}/100</div>
            <div className="text-[9px] text-slate-500">Security: {output.food.foodSecurityIndex}</div>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-center">
            <div className="text-[10px] text-slate-500 font-sans">🌲 Ecosystem Pillar</div>
            <div className="font-bold text-teal-800 text-sm mt-0.5">{pillarScores.ecosystem}/100</div>
            <div className="text-[9px] text-slate-500">Health: {output.ecosystem.ecoHealthScore}</div>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-center col-span-2 sm:col-span-1">
            <div className="text-[10px] text-slate-500 font-sans">💼 Socioeconomics</div>
            <div className="font-bold text-purple-800 text-sm mt-0.5">{pillarScores.socioeconomics}/100</div>
            <div className="text-[9px] text-slate-500">Margin: {Math.round((output.socioeconomics.netRevenueNpr / Math.max(1, output.socioeconomics.grossRevenueNpr)) * 100)}%</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-emerald-200 font-mono text-xs space-y-1.5 text-slate-800">
          <div className="flex justify-between border-b border-slate-100 pb-1">
            <span className="text-slate-600 font-sans">1. Co-benefit Output (0.40 × Φ):</span>
            <span className="font-bold text-emerald-800">0.40 × ({output.food.foodSecurityIndex} + {output.ecosystem.ecoHealthScore})/2 = +{((output.food.foodSecurityIndex + output.ecosystem.ecoHealthScore) * 0.2).toFixed(1)} pts</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-1">
            <span className="text-slate-600 font-sans">2. Economic Margin Return (0.35 × S):</span>
            <span className="font-bold text-purple-800">0.35 × {Math.round((output.socioeconomics.netRevenueNpr / Math.max(1, output.socioeconomics.grossRevenueNpr)) * 100)}% = +{(Math.round((output.socioeconomics.netRevenueNpr / Math.max(1, output.socioeconomics.grossRevenueNpr)) * 100) * 0.35).toFixed(1)} pts</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-1">
            <span className="text-slate-600 font-sans">3. Resource Conflict Penalty (-0.25 × Ψ):</span>
            <span className="font-bold text-rose-700">-[0.30 × {output.water.waterStressIndex} + 0.20 × {output.energy.fossilSharePercent}] = -{(output.water.waterStressIndex * 0.3 + output.energy.fossilSharePercent * 0.2).toFixed(1)} pts</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-1">
            <span className="text-slate-600 font-sans">4. Shannon Entropy Equilibrium (E):</span>
            <span className="font-bold text-blue-800">H({shannonH.toFixed(3)}) / ln(5) = {shannonEntropy} (Gini Asymmetry: {giniIndex})</span>
          </div>
          <div className="flex justify-between pt-1 text-emerald-950 font-extrabold text-sm">
            <span className="font-sans">Final Calculated Composite Score:</span>
            <span>{output.nexusBalanceIndex} / 100 ({systemicState.title})</span>
          </div>
        </div>
      </div>

      {/* Quantified Active Synergies with Temporal Tags */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-outfit flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Quantified Active Synergies (Co-benefits)</span>
          </h4>
          <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            +{synergyScoreTotal} Total Synergy Pts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {synergies.map((s) => (
            <div key={s.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 font-sans">{s.title}</div>
                    <div className="text-[10px] font-mono text-slate-500">{s.metric}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900">
                    +{s.pointsContribution} pts
                  </span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                    s.timeHorizon === 'short' ? 'bg-sky-100 text-sky-800' : s.timeHorizon === 'long' ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {s.timeHorizon === 'both' ? 'ST + LT' : s.timeHorizon === 'short' ? 'Short-Term' : 'Long-Term'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 font-sans leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quantified Active Trade-offs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-outfit flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Resource Conflicts & Temporal Trade-off Dynamics</span>
          </h4>
          <span className="text-[10px] font-mono text-rose-800 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            -{tradeoffPenaltyTotal} Penalty Pts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tradeoffs.map((t) => (
            <div key={t.id} className={`p-3 rounded-xl border shadow-2xs space-y-1.5 text-xs ${
              t.timeHorizon === 'reversal' ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`p-1 rounded-lg shrink-0 ${
                    t.timeHorizon === 'reversal' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 font-sans">{t.title}</div>
                    <div className="text-[10px] font-mono text-slate-500">{t.metric}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-900">
                    -{t.pointsPenalty} pts
                  </span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                    t.timeHorizon === 'reversal'
                      ? 'bg-amber-200 text-amber-900 border border-amber-400 font-black'
                      : t.timeHorizon === 'short'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-teal-100 text-teal-800'
                  }`}>
                    {t.timeHorizon === 'reversal' ? '⚠️ Reversal Risk' : t.timeHorizon === 'both' ? 'ST + LT' : t.timeHorizon === 'short' ? 'Short-Term' : 'Long-Term'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 font-sans leading-relaxed">{t.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5x5 Cross-Sector Coupling Matrix */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-outfit flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Cross-Sector Coupling Matrix (Coefficients: -1.0 to +1.0)</span>
          </h4>
          <span className="text-[10px] font-mono text-slate-500">
            {couplingMatrix.length} Direct Interactions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {couplingMatrix.map((cell, idx) => (
            <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-sans">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-slate-900 text-[11px]">
                  {cell.from} &rarr; {cell.to}
                </span>
                <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                  cell.coefficient > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {cell.coefficient > 0 ? `+${cell.coefficient}` : cell.coefficient} ({cell.type})
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">{cell.mechanism}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
