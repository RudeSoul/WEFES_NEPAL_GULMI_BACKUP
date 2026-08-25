import React from 'react';
import { DeepNexusAnalysis } from '@wefes/wefes-engine';
import { Mountain, Waves } from 'lucide-react';

interface RusleSpringsTabProps {
  deep: DeepNexusAnalysis;
}

export const RusleSpringsTab: React.FC<RusleSpringsTabProps> = ({ deep }) => {
  const { rusle, springshed } = deep;

  return (
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
  );
};
