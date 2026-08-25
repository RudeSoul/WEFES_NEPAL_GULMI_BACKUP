import React from 'react';
import { DeepNexusAnalysis } from '@wefes/wefes-engine';
import { ThermometerSnowflake, ShieldCheck } from 'lucide-react';

interface PhenologyImportTabProps {
  deep: DeepNexusAnalysis;
}

export const PhenologyImportTab: React.FC<PhenologyImportTabProps> = ({ deep }) => {
  const { phenology, importSubstitution } = deep;

  return (
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
  );
};
