import React from 'react';
import { DistrictPalika } from '../../../data/districtPalikaAssets';
import { ArrowUpRight } from 'lucide-react';
import { ModalKey } from './IndicatorModal';

interface IndicatorCard {
  key: ModalKey;
  icon: React.ReactNode;
  label: string;
  value: string;
  badge: string;
  cardBg: string;
  iconBg: string;
  badgeClass: string;
  badgeDot: string;
}

interface PalikaIndicatorsGridProps {
  activePalika: DistrictPalika;
  indicators: IndicatorCard[];
  onOpenModal: (key: ModalKey) => void;
}

export const PalikaIndicatorsGrid: React.FC<PalikaIndicatorsGridProps> = ({
  activePalika,
  indicators,
  onOpenModal,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="pt-4 mt-2 border-t border-slate-200/90 flex items-center justify-between flex-wrap gap-2 animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100/80 border border-emerald-300/80 flex items-center justify-center text-emerald-800 text-xs font-bold shadow-2xs">
            📊
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 font-outfit uppercase tracking-wider flex items-center gap-2">
              <span>{activePalika.name} Agro-Ecological Baseline Benchmarks</span>
              <span className="text-[10px] font-mono font-normal text-slate-500 lowercase">(ground surveys & climatology)</span>
            </h4>
            <p className="text-[10px] text-slate-500">
              Calibrated against NARC ground soil grid & NASA MERRA-2 lapse climatology • Click any pillar to inspect time-series & forecasts
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
          4 Interactive Micro-Dossiers
        </span>
      </div>

      {/* 4 Clickable Palika Micro-Indicator Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {indicators.map(({ key, icon, label, value, badge, cardBg, iconBg, badgeClass, badgeDot }) => (
          <button
            key={key}
            onClick={() => onOpenModal(key)}
            className={`p-3.5 rounded-xl border flex items-start gap-3 text-left transition-all cursor-pointer elevation-hover group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-slate-300 ${cardBg}`}
          >
            <div className="absolute top-2 right-2 flex items-center gap-0.5 text-[9px] font-sans font-medium text-slate-400 group-hover:text-slate-700 opacity-70 group-hover:opacity-100 transition-all">
              <span>Inspect</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs ${iconBg}`}>
              {icon}
            </div>
            <div className="min-w-0 pr-6">
              <div className="text-[10px] text-slate-600 uppercase font-semibold flex items-center gap-1 tracking-wider">
                {label}
              </div>
              <div className="text-sm font-extrabold text-slate-900 truncate mt-0.5 font-outfit">{value}</div>
              <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono font-semibold inline-flex items-center gap-1 mt-1 border ${badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${badgeDot}`} />
                {badge}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Palika Soil Health & Liming Advisory Banner */}
      <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🧪</span>
          <div>
            <div className="font-bold font-outfit text-emerald-900 uppercase tracking-wider text-[11px]">
              NARC Soil Health Diagnosis for {activePalika.name}:
            </div>
            <div className="text-[11px] text-emerald-800 mt-0.5">
              Benchmark Soil pH: <strong className="font-mono">{activePalika.soilPh}</strong> •{' '}
              {activePalika.soilPh && activePalika.soilPh < 6.0
                ? 'Acidic Hill Slope (Moderate Lime Required)'
                : 'Near-Neutral Balanced Soil (Optimal Micronutrient Availability)'}
            </div>
          </div>
        </div>
        <div className="shrink-0 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-800 font-semibold font-mono text-[11px]">
          {activePalika.soilPh && activePalika.soilPh < 6.0
            ? 'Advisory: Apply 2.0 t/ha Agri-Lime'
            : 'Advisory: Standard N-P-K Organic Compost'}
        </div>
      </div>
    </div>
  );
};
