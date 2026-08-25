import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { WEFESOutput } from '@wefes/shared-types';
import { computeDeepNexusAnalysis, simulateSensitivity } from '../../utils/nexusMath';
import {
  X, Scale, Sparkles, TrendingUp, AlertTriangle, CheckCircle2,
  Info, Cpu, Trees, Zap, Sprout, Droplets, Coins, Users,
  Mountain, ArrowUpRight, Layers, HelpCircle, ShieldAlert,
  SlidersHorizontal, Lightbulb, Compass, Award, FlaskConical,
  ArrowRight, RefreshCw, Printer, FileText, Target, ShieldCheck,
  Activity, BarChart3, Waves, Globe2, ChevronRight, HeartHandshake,
  ThermometerSnowflake, Shield, DollarSign
} from 'lucide-react';

interface NexusScientificModalProps {
  output: WEFESOutput;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'math' | 'sensitivity' | 'rusle_springs' | 'gesi' | 'phenology_import' | 'shadow_sdg' | 'interventions';

export const NexusScientificModal: React.FC<NexusScientificModalProps> = ({
  output,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('math');
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);

  // Live Sensitivity Sliders State
  const [rainfallShift, setRainfallShift] = useState<number>(0);
  const [wageShift, setWageShift] = useState<number>(0);
  const [tariffShift, setTariffShift] = useState<number>(0);
  const [solarShift, setSolarShift] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const deep = useMemo(() => computeDeepNexusAnalysis(output), [output]);
  const {
    pillarScores, shannonEntropy, shannonH, giniIndex, synergies, tradeoffs,
    synergyScoreTotal, tradeoffPenaltyTotal,
    couplingMatrix, interventions, naturalCapital, sdgAlignments, basinCascade,
    ipccVulnerability, rusle, springshed, gesi, phenology, importSubstitution, systemicState
  } = deep;

  const sensitivityResult = useMemo(() => {
    return simulateSensitivity(output, {
      rainfallShiftPct: rainfallShift,
      wageShiftPct: wageShift,
      tariffShiftPct: tariffShift,
      solarAdoptionShiftPct: solarShift,
    });
  }, [output, rainfallShift, wageShift, tariffShift, solarShift]);

  const handleResetSensitivity = () => {
    setRainfallShift(0);
    setWageShift(0);
    setTariffShift(0);
    setSolarShift(0);
  };

  const handlePrintDossier = () => {
    window.print();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-2 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-panel bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 border border-emerald-700 flex items-center justify-center text-white shadow-sm shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-outfit">
                  Advanced WEFES Scientific & Decision Dossier
                </h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md font-mono font-bold">
                  JRC-COIN & FAO
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded-md font-mono font-bold">
                  ICIMOD & NARC
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                RUSLE slope erosion, springshed hydrogeology, GESI feminization, and natural capital for <strong className="text-slate-800">{output.cropName}</strong> in <strong className="text-slate-800">{output.districtName}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrintDossier}
              title="Print / Save Technical Policy Dossier"
              className="p-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Print Dossier</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Systemic Status Strip */}
        <div className="px-4 sm:px-5 py-2.5 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold font-outfit ${systemicState.badgeBg} ${systemicState.color} ${systemicState.badgeBorder}`}>
              {systemicState.title}
            </span>
            <span className="text-xs text-slate-600 hidden md:inline truncate max-w-md">
              {systemicState.description}
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">Nexus Score</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-900">{output.nexusBalanceIndex} <span className="text-xs font-normal text-slate-500">/ 100</span></span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">Shannon Entropy (E)</span>
              <span className="text-sm sm:text-base font-extrabold text-blue-900">{shannonEntropy} <span className="text-xs font-normal text-slate-500">({Math.round(shannonEntropy * 100)}%)</span></span>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">Topsoil Retained</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-800">+{rusle.topsoilPreservedTons} t/ha</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-5 pt-2.5 bg-slate-100/70 border-b border-slate-200 flex gap-1.5 shrink-0 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'math', label: '🧮 1. Mathematical Proof' },
            { id: 'sensitivity', label: '🎛️ 2. Live Sensitivity Engine' },
            { id: 'rusle_springs', label: '⛰️ 3. RUSLE Erosion & Springshed' },
            { id: 'gesi', label: '👩‍🌾 4. Feminization & GESI Labor' },
            { id: 'phenology_import', label: '🌡️ 5. GDD & Import Substitution' },
            { id: 'shadow_sdg', label: '💎 6. Natural Capital & SDG 2030' },
            { id: 'interventions', label: '🔮 7. Pareto Levers & Policy Dossier' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`px-3.5 py-2 border-b-2 font-outfit transition-all cursor-pointer whitespace-nowrap ${
                activeTab === id
                  ? 'border-emerald-600 text-emerald-900 font-bold bg-white rounded-t-xl border-t border-x border-slate-200 shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">

          {/* ══════════ TAB 1: MATHEMATICAL MODEL & STEP-BY-STEP PROOF ══════════ */}
          {activeTab === 'math' && (
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

              {/* Quantified Active Trade-offs & Reversals with Temporal Tags */}
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
          )}

          {/* ══════════ TAB 2: LIVE SENSITIVITY & ELASTICITY ENGINE ══════════ */}
          {activeTab === 'sensitivity' && (
            <div className="space-y-5">
              <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-950 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Dynamic Sobol Sensitivity Simulator:</strong> Drag the parameter levers below to test how climate shocks, wage inflation, and energy policies shift the Nexus Balance Score in real time.
                  </span>
                </div>
                <button
                  onClick={handleResetSensitivity}
                  className="px-2.5 py-1 bg-white border border-sky-300 rounded-lg text-[10px] font-bold text-sky-800 hover:bg-sky-100 flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              {/* 4 Interactive Levers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 font-outfit">
                      <Droplets className="w-4 h-4 text-sky-600" />
                      <span>Monsoon Rainfall Shock</span>
                    </span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${rainfallShift < 0 ? 'bg-rose-100 text-rose-800' : rainfallShift > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                      {rainfallShift > 0 ? `+${rainfallShift}%` : `${rainfallShift}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="5"
                    value={rainfallShift}
                    onChange={(e) => setRainfallShift(Number(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>-30% Drought Shock</span>
                    <span>0% Baseline</span>
                    <span>+30% Surplus Rain</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 font-outfit">
                      <Coins className="w-4 h-4 text-purple-600" />
                      <span>Agricultural Labor Wage Rate</span>
                    </span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${wageShift > 0 ? 'bg-rose-100 text-rose-800' : wageShift < 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                      {wageShift > 0 ? `+${wageShift}%` : `${wageShift}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="40"
                    step="5"
                    value={wageShift}
                    onChange={(e) => setWageShift(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>-30% Wage Deflation</span>
                    <span>NPR 750/d</span>
                    <span>+40% Labor Inflation</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 font-outfit">
                      <Zap className="w-4 h-4 text-amber-600" />
                      <span>Grid Electricity Tariff (NEA)</span>
                    </span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${tariffShift > 0 ? 'bg-rose-100 text-rose-800' : tariffShift < 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                      {tariffShift > 0 ? `+${tariffShift}%` : `${tariffShift}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="50"
                    step="10"
                    value={tariffShift}
                    onChange={(e) => setTariffShift(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>-40% Solar Subsidy</span>
                    <span>10.5 NPR/kWh</span>
                    <span>+50% Tariff Hike</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 font-outfit">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Solar Drip & Agrivoltaics</span>
                    </span>
                    <span className="font-mono font-bold px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-800">
                      +{solarShift}% Adoption
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="10"
                    value={solarShift}
                    onChange={(e) => setSolarShift(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0% Status Quo</span>
                    <span>+30% Pilot</span>
                    <span>+60% Full Scale</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Output */}
              <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-emerald-400 font-sans flex items-center gap-1.5">
                    <Activity className="w-4 h-4" />
                    Real-Time Shock Response & Elasticity
                  </span>
                  <span className="text-xs font-mono">
                    Score Shift: <strong className={sensitivityResult.scoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{sensitivityResult.scoreDelta > 0 ? `+${sensitivityResult.scoreDelta}` : sensitivityResult.scoreDelta} pts</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 font-sans">Simulated Nexus Score</div>
                    <div className="text-xl font-extrabold text-white mt-1">{sensitivityResult.simulatedScore} <span className="text-xs font-normal text-slate-400">/ 100</span></div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 font-sans">Simulated Water Stress</div>
                    <div className={`text-xl font-extrabold mt-1 ${sensitivityResult.simulatedWaterStress > 50 ? 'text-rose-400' : 'text-sky-400'}`}>
                      {sensitivityResult.simulatedWaterStress}%
                    </div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 font-sans">Net Farmer Margin</div>
                    <div className="text-xl font-extrabold text-purple-400 mt-1">{sensitivityResult.simulatedNetMarginPct}%</div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 font-sans">MRTS (Water/Capital)</div>
                    <div className="text-xl font-extrabold text-emerald-400 mt-1">{sensitivityResult.mrtsWaterToCapital} <span className="text-xs font-normal text-slate-400">m³/k NPR</span></div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-sans">
                  <strong>Marginal Rate of Technical Substitution (MRTS):</strong> Every NPR 1,000 invested in clean solar drip irrigation recovers approximately <strong>{sensitivityResult.mrtsWaterToCapital} m³</strong> of agricultural water footprint under current district agro-climatic conditions.
                </div>
              </div>
            </div>
          )}

          {/* ══════════ TAB 3: RUSLE SLOPE EROSION & SPRINGSHED HYDROGEOLOGY ══════════ */}
          {activeTab === 'rusle_springs' && (
            <div className="space-y-5">
              {/* RUSLE Equation & Topsoil Retention Engine */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Mountain className="w-5 h-5 text-emerald-700" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950 font-outfit">
                        RUSLE Empirical Mountain Slope & Topsoil Loss Engine
                      </h4>
                      <span className="text-[10px] text-emerald-800 font-mono">A = R × K × LS × C × P</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-white text-emerald-950 border border-emerald-300 px-2 py-0.5 rounded-md font-mono font-bold">
                    {rusle.riskCategory}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-center">
                    <div className="text-[10px] text-slate-500 font-sans">Annual Soil Loss (A)</div>
                    <div className="text-base font-extrabold text-slate-900 mt-0.5">{rusle.annualSoilLossTonsPerHa} <span className="text-xs font-normal text-slate-500">t/ha/yr</span></div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-center">
                    <div className="text-[10px] text-slate-500 font-sans">Topsoil Preserved</div>
                    <div className="text-base font-extrabold text-emerald-700 mt-0.5">+{rusle.topsoilPreservedTons} <span className="text-xs font-normal text-slate-500">t/ha</span></div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-center">
                    <div className="text-[10px] text-slate-500 font-sans">Cover Factor (C)</div>
                    <div className="text-base font-extrabold text-blue-800 mt-0.5">{rusle.cropCoverC} <span className="text-xs font-normal text-slate-500">canopy</span></div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-center">
                    <div className="text-[10px] text-slate-500 font-sans">Topsoil Capital Value</div>
                    <div className="text-base font-extrabold text-purple-800 mt-0.5">NPR {rusle.topsoilEconomicValueNpr.toLocaleString()}</div>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-900/90 font-sans leading-relaxed">
                  <strong>Agronomic Mechanism:</strong> With a canopy cover factor of $C = {rusle.cropCoverC}$, root architecture and vegetative intercept significantly dissipate monsoon raindrop kinetic energy ($R = {rusle.rainfallErosivityR}$), preventing approximately <strong>{rusle.topsoilPreservedTons} tons/ha</strong> of nutrient-rich organic topsoil from washing into river siltation.
                </p>
              </div>

              {/* ICIMOD Springshed Hydrogeology & Recharge Area */}
              <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/70 space-y-3">
                <div className="flex items-center justify-between border-b border-sky-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Waves className="w-5 h-5 text-sky-700" />
                    <div>
                      <h4 className="text-xs font-bold text-sky-950 font-outfit">
                        ICIMOD Springshed Hydrogeology & Aquifer Recharge Index
                      </h4>
                      <span className="text-[10px] text-sky-800 font-sans">Dying Springs of Nepal's Mid-Hills (Mulpani Restoration)</span>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold border ${springshed.aquiferRechargeStatus === 'Aquifer Recharging Sponge' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-sky-100 text-sky-900 border-sky-300'}`}>
                    {springshed.aquiferRechargeStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-sky-200 text-center">
                    <div className="text-[10px] text-slate-500 font-sans">Annual Aquifer Percolation</div>
                    <div className="text-base font-extrabold text-sky-900 mt-0.5">+{springshed.annualPercolationMm} <span className="text-xs font-normal text-slate-500">mm/yr</span></div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-sky-200 text-center">
                    <div className="text-[10px] text-slate-500 font-sans">Recharge Coefficient</div>
                    <div className="text-base font-extrabold text-blue-900 mt-0.5">{springshed.rechargeCoefficient} <span className="text-xs font-normal text-slate-500">ratio</span></div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-sky-200 text-center">
                    <div className="text-[10px] text-slate-500 font-sans">Drinking Springs Protected</div>
                    <div className="text-base font-extrabold text-emerald-800 mt-0.5">~{springshed.drinkingSpringsProtected} <span className="text-xs font-normal text-slate-500">households</span></div>
                  </div>
                </div>

                <p className="text-[11px] text-sky-900/90 font-sans leading-relaxed">
                  {springshed.springInfiltrationMechanism}
                </p>
              </div>
            </div>
          )}

          {/* ══════════ TAB 4: FEMINIZATION, OUTMIGRATION & GESI ══════════ */}
          {activeTab === 'gesi' && (
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
          )}

          {/* ══════════ TAB 5: GDD PHENOLOGY & IMPORT SUBSTITUTION ══════════ */}
          {activeTab === 'phenology_import' && (
            <div className="space-y-5">
              {/* Phenology & Upward Thermal Migration Radar */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <div className="flex items-center gap-2">
                    <ThermometerSnowflake className="w-5 h-5 text-amber-700" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-950 font-outfit">
                        Crop Phenology & Shifting Agro-Climatic Thermal Bands (GDD)
                      </h4>
                      <span className="text-[10px] text-amber-800 font-sans">{phenology.phenologyWindow}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-white text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-mono font-bold">
                    {phenology.heatStressVulnerability}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-amber-200 text-center">
                    <div className="text-[10px] text-slate-500 font-sans">Growing Degree Days (GDD)</div>
                    <div className="text-base font-extrabold text-amber-900 mt-0.5">{phenology.growingDegreeDays} <span className="text-xs font-normal text-slate-500">°C-days</span></div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-amber-200 text-center col-span-2">
                    <div className="text-[10px] text-slate-500 font-sans">Optimal Thermal Altitude Band</div>
                    <div className="text-xs font-extrabold text-slate-900 mt-1">{phenology.optimalThermalAltitudeBand}</div>
                  </div>
                </div>

                <div className="text-[11px] text-amber-950 font-sans bg-white/80 p-2.5 rounded-lg border border-amber-200">
                  <strong>Climate Warming Trend:</strong> In the Hindu Kush Himalaya region, thermal bands are shifting upward at approximately +0.038°C/year ({phenology.projected2040AltitudeShift}).
                </div>
              </div>

              {/* National Import Substitution & Food Sovereignty */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950 font-outfit">
                        National Import Substitution & Foreign Exchange Dividend
                      </h4>
                      <span className="text-[10px] text-emerald-800 font-sans">Nepal 15th Plan Food Sovereignty Contribution</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-white text-emerald-950 border border-emerald-300 px-2 py-0.5 rounded-md font-mono font-bold">
                    GDP Multiplier: {importSubstitution.districtGdpMultiplier}x
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-center">
                    <div className="text-[10px] text-slate-500 font-sans">Agri-Import Displaced</div>
                    <div className="text-base font-extrabold text-emerald-800 mt-0.5">NPR {importSubstitution.annualImportDisplacedNpr.toLocaleString()}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-center">
                    <div className="text-[10px] text-slate-500 font-sans">USD Reserve Retained</div>
                    <div className="text-base font-extrabold text-blue-900 mt-0.5">${importSubstitution.foreignExchangeRetainedUsd.toLocaleString()} USD</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-center col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-slate-500 font-sans">Food Sovereignty Score</div>
                    <div className="text-base font-extrabold text-purple-900 mt-0.5">{importSubstitution.nationalFoodSovereigntyIndex}/100</div>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-900/90 font-sans leading-relaxed">
                  {importSubstitution.strategicSignificance}
                </p>
              </div>
            </div>
          )}

          {/* ══════════ TAB 6: NATURAL CAPITAL & UN SDG 2030 ══════════ */}
          {activeTab === 'shadow_sdg' && (
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
          )}

          {/* ══════════ TAB 7: PARETO FRONTIER LEVERS & POLICY DOSSIER ══════════ */}
          {activeTab === 'interventions' && (
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
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0 text-xs text-slate-500 font-sans">
          <span className="flex items-center gap-1.5 text-center sm:text-left">
            <Award className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Aligned with ICIMOD HKH Mountain Framework & JRC-COIN WEFE Guidelines</span>
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrintDossier}
              className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all text-xs cursor-pointer shadow-2xs flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-xs"
            >
              Close Scientific Inspector
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
