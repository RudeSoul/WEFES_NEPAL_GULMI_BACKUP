import React from 'react';

import { ArrowLeft, MapPin, Mountain } from 'lucide-react';

import { District } from '@wefes/shared-types';

import { DistrictPalika, GULMI_PALIKA_NEPALI } from '@/data/districtPalikaAssets';

interface PalikaHeroHeaderProps {
  district: District;
  activePalika: DistrictPalika;
  gulmiPalikas: DistrictPalika[];
  onSelectPalika: (name: string) => void;
  onBackToMap: () => void;
}

export const PalikaHeroHeader: React.FC<PalikaHeroHeaderProps> = ({
  activePalika,
  gulmiPalikas,
  onSelectPalika,
  onBackToMap,
}) => {
  return (
    <div className="space-y-4">
      {/* Navigation & Action Bar */}
      <div>
        <button
          onClick={onBackToMap}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2 font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Gulmi Spatial Map
        </button>
        <div className="flex items-center space-x-3 flex-wrap gap-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-outfit">
            {activePalika.name} {activePalika.unitType}
          </h2>
          {GULMI_PALIKA_NEPALI[activePalika.name] && (
            <span className="text-lg font-serif text-slate-600 font-semibold">
              ({GULMI_PALIKA_NEPALI[activePalika.name]})
            </span>
          )}
          <span className="text-[10px] px-2.5 py-0.5 rounded-md font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <Mountain className="w-3 h-3 text-emerald-600" />
            <span>
              {activePalika.elevation}m ASL ·{' '}
              {activePalika.unitType === 'Municipality' ? 'Urban Municipality' : 'Rural Municipality'}
            </span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-500" />
            <span>Lumbini Province, Nepal</span>
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl font-normal leading-relaxed">
          Integrated Water-Energy-Food-Ecosystem (WEFE) Decision Support System &amp; Agro-Hydrological Infrastructure
          Platform.
        </p>
      </div>

      {/* 12-Palika Quick-Switch Carousel Ribbon */}
      <div className="pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-outfit flex items-center gap-1.5">
            <span>🏛️ Switch Palika ({gulmiPalikas.length} Local Bodies in Gulmi):</span>
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {gulmiPalikas.map((p) => {
            const isSelected = p.name.toLowerCase() === activePalika.name?.toLowerCase();
            return (
              <button
                key={p.name}
                onClick={() => onSelectPalika(p.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm font-bold scale-102'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{p.name}</span>
                <span className={`text-[10px] ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                  ({(GULMI_PALIKA_NEPALI[p.name] || '').replace(/\s*(गाउँपालिका|नगरपालिका)$/, '')})
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
