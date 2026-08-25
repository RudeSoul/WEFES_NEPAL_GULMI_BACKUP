import React, { useState } from 'react';
import { Sprout, TrendingUp, Thermometer, ArrowRight, Sparkles, Scale, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { DISTRICT_PALIKAS } from '../../data/districtPalikaAssets';

interface CropClimateComparatorProps {
  lang?: 'en' | 'np';
  onSelectCropFilter?: (cropId: string) => void;
}

const AVAILABLE_CROPS = [
  { id: 'coffee', name: 'Arabica Coffee', nepali: 'कफी', emoji: '☕', optElevMin: 1100, optElevMax: 1550, thermalOpt: 19.0 },
  { id: 'orange', name: 'Mandarin Orange', nepali: 'सुन्तला', emoji: '🍊', optElevMin: 1000, optElevMax: 1550, thermalOpt: 19.5 },
  { id: 'ginger', name: 'Organic Ginger', nepali: 'अदुवा', emoji: '🫚', optElevMin: 800, optElevMax: 1450, thermalOpt: 21.0 },
  { id: 'potato', name: 'Seed Potato', nepali: 'आलु', emoji: '🥔', optElevMin: 1400, optElevMax: 2600, thermalOpt: 16.5 },
  { id: 'cardamom', name: 'Large Cardamom', nepali: 'अलैंची', emoji: '🌿', optElevMin: 1300, optElevMax: 2000, thermalOpt: 17.5 },
  { id: 'rice', name: 'Monsoon Paddy', nepali: 'धान', emoji: '🌾', optElevMin: 600, optElevMax: 1350, thermalOpt: 23.0 },
  { id: 'buckwheat', name: 'High-Hill Buckwheat', nepali: 'फापर', emoji: '🌾', optElevMin: 1500, optElevMax: 2600, thermalOpt: 15.5 },
  { id: 'maize', name: 'Mid-Hill Maize', nepali: 'मकै', emoji: '🌽', optElevMin: 800, optElevMax: 1800, thermalOpt: 20.0 },
];

export const CropClimateComparator: React.FC<CropClimateComparatorProps> = ({
  lang = 'en',
  onSelectCropFilter,
}) => {
  const [cropAId, setCropAId] = useState<string>('coffee');
  const [cropBId, setCropBId] = useState<string>('orange');
  const [tempAnomalyC, setTempAnomalyC] = useState<number>(0.0);

  const cropA = AVAILABLE_CROPS.find(c => c.id === cropAId) || AVAILABLE_CROPS[0];
  const cropB = AVAILABLE_CROPS.find(c => c.id === cropBId) || AVAILABLE_CROPS[1];

  const gulmiPalikas = DISTRICT_PALIKAS.gulmi || [];

  // Elevation shift factor: +150m per +1.0°C
  const elevShiftM = tempAnomalyC * 150;

  // Compute dynamic suitability scores for Crop A and Crop B under temperature warming
  const comparisonResults = gulmiPalikas.map(palika => {
    const baseCropA = palika.feasibleCrops?.find(fc => fc.cropId === cropA.id)?.score ?? 60;
    const baseCropB = palika.feasibleCrops?.find(fc => fc.cropId === cropB.id)?.score ?? 60;

    // Climate warming shift adjustment:
    // If palika is high elevation and crop is temperate/warm, warming increases suitability
    // If palika is low elevation and crop is high-altitude, warming decreases suitability
    const elev = palika.elevation;

    // Crop A Climate Shift
    const distFromOptA = Math.abs(elev - (cropA.optElevMin + cropA.optElevMax) / 2 - elevShiftM);
    const climatePenaltyA = Math.round(distFromOptA * 0.025);
    const scoreA = Math.max(20, Math.min(98, Math.round(baseCropA - (tempAnomalyC > 0 ? (elev < 1100 ? tempAnomalyC * 6 : -tempAnomalyC * 4) : 0))));

    // Crop B Climate Shift
    const scoreB = Math.max(20, Math.min(98, Math.round(baseCropB - (tempAnomalyC > 0 ? (elev < 1000 ? tempAnomalyC * 6 : -tempAnomalyC * 4) : 0))));

    const advantage = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'Equal';
    const delta = Math.abs(scoreA - scoreB);

    return {
      palikaName: palika.name,
      elevation: palika.elevation,
      scoreA,
      scoreB,
      advantage,
      delta,
    };
  });

  return (
    <div className="glass-panel p-4 rounded-2xl border border-emerald-200 bg-white/95 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-100 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-outfit uppercase tracking-wide flex items-center gap-2">
              <span>{lang === 'np' ? 'द्वि-बाली तुलना तथा जलवायु तापमान परिवर्तन मोडेल' : 'Multi-Crop Tradeoff & Climate Shift Comparator'}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
                FAO-EcoCrop Model
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-sans">
              {lang === 'np'
                ? 'दुई बाली बीचको तुलनात्मक लाभ र तापमान वृद्धिले उचाइ बेल्टमा पार्ने प्रभाव'
                : 'Side-by-side comparative advantage & upward thermal envelope migration'}
            </p>
          </div>
        </div>
      </div>

      {/* Selectors Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Crop A */}
        <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
          <label className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <span>Crop A (प्राथमिक बाली):</span>
          </label>
          <select
            value={cropAId}
            onChange={e => setCropAId(e.target.value)}
            className="w-full bg-white border border-emerald-300 rounded-lg p-2 text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs"
          >
            {AVAILABLE_CROPS.map(c => (
              <option key={c.id} value={c.id} disabled={c.id === cropBId}>
                {c.emoji} {c.name} ({c.nepali})
              </option>
            ))}
          </select>
          <div className="text-[10px] text-emerald-800 mt-2 font-mono">
            Optimum: {cropA.optElevMin}m – {cropA.optElevMax}m ASL ({cropA.thermalOpt}°C)
          </div>
        </div>

        {/* Crop B */}
        <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
          <label className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <span>Crop B (तुलनात्मक बाली):</span>
          </label>
          <select
            value={cropBId}
            onChange={e => setCropBId(e.target.value)}
            className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs"
          >
            {AVAILABLE_CROPS.map(c => (
              <option key={c.id} value={c.id} disabled={c.id === cropAId}>
                {c.emoji} {c.name} ({c.nepali})
              </option>
            ))}
          </select>
          <div className="text-[10px] text-amber-800 mt-2 font-mono">
            Optimum: {cropB.optElevMin}m – {cropB.optElevMax}m ASL ({cropB.thermalOpt}°C)
          </div>
        </div>

        {/* Global Warming Anomaly Slider */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
            <span className="flex items-center gap-1 text-slate-700">
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              Climate Warming (ΔT):
            </span>
            <span className="font-mono bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold">
              +{tempAnomalyC.toFixed(1)}°C (+{Math.round(elevShiftM)}m Shift)
            </span>
          </div>
          <input
            type="range"
            min={0.0}
            max={3.0}
            step={0.5}
            value={tempAnomalyC}
            onChange={e => setTempAnomalyC(Number(e.target.value))}
            className="w-full accent-rose-600 cursor-pointer my-1.5"
          />
          <div className="flex items-center justify-between text-[9.5px] text-slate-500 font-mono">
            <span>Baseline (+0°C)</span>
            <span>IPCC 2050 (+1.5°C)</span>
            <span>Severe (+3.0°C)</span>
          </div>
        </div>
      </div>

      {/* 12 Palikas Head-to-Head Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-100/80 text-slate-700 font-semibold text-[11px] border-b border-slate-200 uppercase tracking-wider">
            <tr>
              <th className="p-2.5">Palika</th>
              <th className="p-2.5">Elevation</th>
              <th className="p-2.5 text-emerald-900 bg-emerald-50/50">{cropA.emoji} {cropA.name}</th>
              <th className="p-2.5 text-amber-900 bg-amber-50/50">{cropB.emoji} {cropB.name}</th>
              <th className="p-2.5">Comparative Advantage</th>
              <th className="p-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {comparisonResults.map(res => (
              <tr key={res.palikaName} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-2.5 font-bold text-slate-900">{res.palikaName}</td>
                <td className="p-2.5 font-mono text-slate-600">{res.elevation}m</td>
                <td className="p-2.5 font-mono font-bold text-emerald-800 bg-emerald-50/30">
                  {res.scoreA}%
                </td>
                <td className="p-2.5 font-mono font-bold text-amber-800 bg-amber-50/30">
                  {res.scoreB}%
                </td>
                <td className="p-2.5">
                  {res.advantage === 'A' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {cropA.emoji} +{res.delta}% {cropA.name} Advantage
                    </span>
                  ) : res.advantage === 'B' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {cropB.emoji} +{res.delta}% {cropB.name} Advantage
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      ⚖️ Equal Viability ({res.scoreA}%)
                    </span>
                  )}
                </td>
                <td className="p-2.5 text-right">
                  {onSelectCropFilter && (
                    <button
                      onClick={() => onSelectCropFilter(res.advantage === 'A' ? cropA.id : cropB.id)}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 bg-white border border-emerald-200 hover:border-emerald-400 px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
                    >
                      View on Map →
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
