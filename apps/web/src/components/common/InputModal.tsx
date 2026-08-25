import React, { useState } from 'react';
import { District, Crop, CropUnit, WEFESOutput } from '@wefes/shared-types';
import { UNIT_CONVERSIONS } from '@wefes/wefes-engine';
import { calculateHarvestImpact } from '@wefes/wefes-engine';
import { X, Sprout, Layers, Zap, Droplets, Sparkles, ArrowRight, Scale, Calculator } from 'lucide-react';

interface InputModalProps {
  district: District;
  crop: Crop;
  isOpen: boolean;
  onClose: () => void;
  onRunAnalysis: (output: WEFESOutput) => void;
}

export const InputModal: React.FC<InputModalProps> = ({
  district,
  crop,
  isOpen,
  onClose,
  onRunAnalysis
}) => {
  const [quantity, setQuantity] = useState<number>(1000);
  const [unit, setUnit] = useState<CropUnit>(crop.defaultUnit);

  if (!isOpen) return null;

  // Live instant pre-calculation preview
  const liveOutput = calculateHarvestImpact(district, crop, quantity > 0 ? quantity : 1, unit);

  // Quick fill presets depending on base unit
  const presets = crop.baseUnitName === 'm3'
    ? [
        { label: 'Small Scale (10 m³)', value: 10, unit: 'm3' as CropUnit },
        { label: 'Medium Logging (50 m³)', value: 50, unit: 'm3' as CropUnit },
        { label: 'Commercial Harvest (250 m³)', value: 250, unit: 'm3' as CropUnit }
      ]
    : [
        { label: 'Smallholder (500 kg)', value: 500, unit: 'kg' as CropUnit },
        { label: 'Commercial Farm (5,000 kg)', value: 5000, unit: 'kg' as CropUnit },
        { label: 'Regional Supply (25 MT)', value: 25, unit: 'metric_ton' as CropUnit }
      ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;
    const result = calculateHarvestImpact(district, crop, quantity, unit);
    onRunAnalysis(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel max-w-xl w-full rounded-2xl border border-slate-200 shadow-2xl overflow-hidden relative bg-white">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center shadow-2xs">
              <Sprout className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-outfit">
                <span>{crop.name}</span>
                <span className="text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md font-mono font-bold border border-slate-300">
                  {district.name}
                </span>
              </h3>
              <p className="text-xs text-slate-500">Specify harvest production quantity and target units</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Quick-Fill Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2 font-outfit">
              Quick Presets:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setQuantity(p.value);
                    setUnit(p.unit);
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-400 hover:bg-slate-100 text-xs text-slate-700 font-semibold transition-all text-center cursor-pointer shadow-2xs"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Quantity & Dynamic Units Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-7">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-slate-500" />
                <span>Production Amount</span>
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 font-extrabold text-base focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors font-mono"
                placeholder="Enter quantity"
                required
              />
            </div>

            <div className="sm:col-span-5">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-slate-500" />
                <span>Unit</span>
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as CropUnit)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 font-bold text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors cursor-pointer"
              >
                {crop.supportedUnits.map((u) => (
                  <option key={u} value={u}>
                    {UNIT_CONVERSIONS[u]?.label || u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Instant Impact Preview Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Impact Preview</span>
              </span>
              <span className="font-mono text-slate-500 text-[11px] font-medium">Base: {liveOutput.baseQuantity.toLocaleString()} {liveOutput.baseUnit}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-xs font-mono">
              <div className="bg-white p-2.5 rounded-lg border border-sky-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block font-sans font-medium">Water</span>
                <span className="font-extrabold text-sky-700 text-xs">{liveOutput.water.consumptionLiters.toLocaleString()} L</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-amber-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block font-sans font-medium">Energy</span>
                <span className="font-extrabold text-amber-700 text-xs">{liveOutput.energy.loadKwh.toLocaleString()} kWh</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block font-sans font-medium">Est. Revenue</span>
                <span className="font-extrabold text-emerald-700 text-xs">NPR {liveOutput.socioeconomics.grossRevenueNpr.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm hover:shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Run Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
