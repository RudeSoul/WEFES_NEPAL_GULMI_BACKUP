import React from 'react';
import { SensitivitySimulationResult } from '@wefes/wefes-engine';
import { SlidersHorizontal, RefreshCw, Droplets, Coins, Zap, Sparkles, Activity } from 'lucide-react';

interface SensitivityTabProps {
  rainfallShift: number;
  setRainfallShift: (v: number) => void;
  wageShift: number;
  setWageShift: (v: number) => void;
  tariffShift: number;
  setTariffShift: (v: number) => void;
  solarShift: number;
  setSolarShift: (v: number) => void;
  sensitivityResult: SensitivitySimulationResult;
  onReset: () => void;
}

export const SensitivityTab: React.FC<SensitivityTabProps> = ({
  rainfallShift,
  setRainfallShift,
  wageShift,
  setWageShift,
  tariffShift,
  setTariffShift,
  solarShift,
  setSolarShift,
  sensitivityResult,
  onReset,
}) => {
  return (
    <div className="space-y-5">
      <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-950 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <SlidersHorizontal className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
          <span>
            <strong>Dynamic Sobol Sensitivity Simulator:</strong> Drag the parameter levers below to test how climate shocks, wage inflation, and energy policies shift the Nexus Balance Score in real time.
          </span>
        </div>
        <button
          onClick={onReset}
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
  );
};
