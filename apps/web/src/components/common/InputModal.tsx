import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ArrowRight, Banknote, Calculator, ChevronDown, Droplets, Scale, Sparkles, Sprout, X, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { CropUnit } from '@wefes/shared-types';
import { calculateHarvestImpact } from '@wefes/wefes-engine';
import { UNIT_CONVERSIONS } from '@wefes/wefes-engine';

import { ROUTES } from '../../routes/paths';
import { useNexusStore } from '../../store';

export const InputModal: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const district = useNexusStore((s) => s.selectedDistrict);
  const crop = useNexusStore((s) => s.selectedCrop);
  const isOpen = useNexusStore((s) => s.isInputModalOpen);
  const onClose = useNexusStore((s) => s.closeAnalysisModal);
  const setAnalysisOutput = useNexusStore((s) => s.setAnalysisOutput);

  const [quantity, setQuantity] = useState<number>(1000);
  const [unit, setUnit] = useState<CropUnit>(crop?.defaultUnit ?? 'kg');

  useEffect(() => {
    if (crop?.defaultUnit) {
      setUnit(crop.defaultUnit);
    }
  }, [crop]);

  if (!isOpen || !district || !crop) return null;

  // Live instant pre-calculation preview
  const liveOutput = calculateHarvestImpact(district, crop, quantity > 0 ? quantity : 1, unit);

  // Quick fill presets depending on base unit
  const presets =
    crop.baseUnitName === 'm3'
      ? [
          { label: t('modal.preset_small_logging'), value: 10, unit: 'm3' as CropUnit },
          { label: t('modal.preset_medium_logging'), value: 50, unit: 'm3' as CropUnit },
          {
            label: t('modal.preset_commercial_harvest'),
            value: 250,
            unit: 'm3' as CropUnit,
          },
        ]
      : [
          { label: t('modal.preset_smallholder'), value: 500, unit: 'kg' as CropUnit },
          { label: t('modal.preset_commercial'), value: 5000, unit: 'kg' as CropUnit },
          { label: t('modal.preset_regional'), value: 25, unit: 'metric_ton' as CropUnit },
        ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;
    const result = calculateHarvestImpact(district, crop, quantity, unit);
    setAnalysisOutput(result);
    navigate(ROUTES.ANALYSIS);
    onClose();
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
              </h3>
              <p className="text-xs text-slate-500">{t('modal.input_subtitle')}</p>
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
              {t('modal.quick_presets')}
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
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-xs text-slate-700 hover:text-emerald-800 font-semibold transition-all text-center cursor-pointer shadow-2xs hover:shadow-sm"
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
                <span>{t('modal.production_amount')}</span>
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-bold text-base focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all"
                placeholder={t('modal.enter_quantity')}
                required
              />
            </div>

            <div className="sm:col-span-5 relative">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('modal.unit')}</span>
              </label>
              <div className="relative">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as CropUnit)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3 pr-10 py-2.5 text-slate-900 font-bold text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all cursor-pointer appearance-none"
                >
                  {crop.supportedUnits.map((u) => (
                    <option key={u} value={u}>
                      {UNIT_CONVERSIONS[u]?.label || u}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Instant Impact Preview Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 border-b border-slate-200 pb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-sm">{t('modal.live_preview')}</span>
              </span>
              <span className="bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border border-slate-300/50">
                {t('modal.base_output', {
                  quantity: liveOutput.baseQuantity.toLocaleString(),
                  unit: liveOutput.baseUnit,
                })}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="bg-sky-50/50 p-3 rounded-xl border border-sky-200 shadow-2xs relative overflow-hidden group">
                <Droplets className="w-10 h-10 text-sky-500/10 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-slate-500 block font-sans font-semibold mb-0.5 relative z-10">
                  {t('modal.water')}
                </span>
                <span className="font-extrabold text-sky-700 text-sm relative z-10">
                  {liveOutput.water.consumptionLiters.toLocaleString()} L
                </span>
              </div>
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200 shadow-2xs relative overflow-hidden group">
                <Zap className="w-10 h-10 text-amber-500/10 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-slate-500 block font-sans font-semibold mb-0.5 relative z-10">
                  {t('modal.energy')}
                </span>
                <span className="font-extrabold text-amber-700 text-sm relative z-10">
                  {liveOutput.energy.loadKwh.toLocaleString()} kWh
                </span>
              </div>
              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 shadow-2xs relative overflow-hidden group">
                <Banknote className="w-10 h-10 text-emerald-500/10 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-slate-500 block font-sans font-semibold mb-0.5 relative z-10">
                  {t('modal.est_revenue')}
                </span>
                <span className="font-extrabold text-emerald-700 text-sm relative z-10">
                  NPR {liveOutput.socioeconomics.grossRevenueNpr.toLocaleString()}
                </span>
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
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-xs font-bold shadow-md hover:shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>{t('common.run_analysis')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
