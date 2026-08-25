import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { WEFESOutput } from '@wefes/shared-types';
import { computeDeepNexusAnalysis, simulateSensitivity } from '@wefes/wefes-engine';
import { X, Scale, Printer, Award, ArrowUpRight } from 'lucide-react';
import { MathTab } from './components/scientific-modal/MathTab';
import { SensitivityTab } from './components/scientific-modal/SensitivityTab';
import { RusleSpringsTab } from './components/scientific-modal/RusleSpringsTab';
import { GesiTab } from './components/scientific-modal/GesiTab';
import { PhenologyImportTab } from './components/scientific-modal/PhenologyImportTab';
import { ShadowSdgTab } from './components/scientific-modal/ShadowSdgTab';
import { InterventionsTab } from './components/scientific-modal/InterventionsTab';

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
  const { shannonEntropy, rusle, systemicState } = deep;

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
                <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-mono font-bold border border-emerald-300">
                  {output.cropName} • {output.districtName}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-sans mt-0.5">
                Multi-Sector Interaction Matrices, Shock Sensitivity, & Policy Recommendations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
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
          {activeTab === 'math' && <MathTab output={output} deep={deep} />}
          {activeTab === 'sensitivity' && (
            <SensitivityTab
              rainfallShift={rainfallShift}
              setRainfallShift={setRainfallShift}
              wageShift={wageShift}
              setWageShift={setWageShift}
              tariffShift={tariffShift}
              setTariffShift={setTariffShift}
              solarShift={solarShift}
              setSolarShift={setSolarShift}
              sensitivityResult={sensitivityResult}
              onReset={handleResetSensitivity}
            />
          )}
          {activeTab === 'rusle_springs' && <RusleSpringsTab deep={deep} />}
          {activeTab === 'gesi' && <GesiTab deep={deep} />}
          {activeTab === 'phenology_import' && <PhenologyImportTab deep={deep} />}
          {activeTab === 'shadow_sdg' && <ShadowSdgTab deep={deep} />}
          {activeTab === 'interventions' && <InterventionsTab output={output} deep={deep} />}
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
