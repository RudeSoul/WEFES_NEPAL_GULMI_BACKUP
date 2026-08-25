import React from 'react';
import { Crop } from '@wefes/shared-types';
import { db } from '@wefes/database';
import { DistrictPalika } from '../../../data/districtPalikaAssets';

interface PalikaSeasonalRotationsCardProps {
  activePalika: DistrictPalika;
  onSelectCrop: (crop: Crop) => void;
}

export const PalikaSeasonalRotationsCard: React.FC<PalikaSeasonalRotationsCardProps> = ({
  activePalika,
  onSelectCrop,
}) => {
  return (
    <div className="pt-4 border-t border-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-outfit flex items-center gap-1.5">
          <span>🌿 Recommended 4-Season Cropping Pattern ({activePalika.name})</span>
        </span>
        <span className="text-[10px] text-slate-500 font-mono">Bikram Sambat (BS) Calendar</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Barkhe (Monsoon) */}
        <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-sky-900 font-outfit uppercase">
              <span>🌧️ बरखे (Monsoon)</span>
              <span className="text-[10px] text-sky-700 font-normal font-sans">असार – कात्तिक</span>
            </div>
            {activePalika.seasonalRotations?.barkhe ? (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                  <span>{activePalika.seasonalRotations.barkhe.emoji}</span>
                  <span>{activePalika.seasonalRotations.barkhe.cropName}</span>
                </div>
                <div className="text-[11px] text-slate-600 font-serif">
                  ({activePalika.seasonalRotations.barkhe.nepaliName})
                </div>
                <div className="text-[10px] text-sky-800 font-mono font-semibold">
                  Suitability: {activePalika.seasonalRotations.barkhe.score}% ({activePalika.seasonalRotations.barkhe.rating})
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic mt-2">Monsoon Paddy / Maize / Ginger</div>
            )}
          </div>
          {activePalika.seasonalRotations?.barkhe && (
            <button
              onClick={() => {
                const c = db.getCropById(activePalika.seasonalRotations?.barkhe?.cropId || '') || db.getAllCrops()[0];
                onSelectCrop(c);
              }}
              className="w-full py-1 px-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>⚡ Run WEFES Simulation</span>
            </button>
          )}
        </div>

        {/* Hiunde (Winter) */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-amber-900 font-outfit uppercase">
              <span>❄️ हिउँदे (Winter)</span>
              <span className="text-[10px] text-amber-700 font-normal font-sans">कात्तिक – फागुन</span>
            </div>
            {activePalika.seasonalRotations?.hiunde ? (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                  <span>{activePalika.seasonalRotations.hiunde.emoji}</span>
                  <span>{activePalika.seasonalRotations.hiunde.cropName}</span>
                </div>
                <div className="text-[11px] text-slate-600 font-serif">
                  ({activePalika.seasonalRotations.hiunde.nepaliName})
                </div>
                <div className="text-[10px] text-amber-800 font-mono font-semibold">
                  Suitability: {activePalika.seasonalRotations.hiunde.score}% ({activePalika.seasonalRotations.hiunde.rating})
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic mt-2">Winter Wheat / Seed Potato</div>
            )}
          </div>
          {activePalika.seasonalRotations?.hiunde && (
            <button
              onClick={() => {
                const c = db.getCropById(activePalika.seasonalRotations?.hiunde?.cropId || '') || db.getAllCrops()[0];
                onSelectCrop(c);
              }}
              className="w-full py-1 px-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>⚡ Run WEFES Simulation</span>
            </button>
          )}
        </div>

        {/* Chaite (Spring) */}
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 font-outfit uppercase">
              <span>🌱 चैते (Spring)</span>
              <span className="text-[10px] text-emerald-700 font-normal font-sans">फागुन – जेठ</span>
            </div>
            {activePalika.seasonalRotations?.chaite ? (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                  <span>{activePalika.seasonalRotations.chaite.emoji}</span>
                  <span>{activePalika.seasonalRotations.chaite.cropName}</span>
                </div>
                <div className="text-[11px] text-slate-600 font-serif">
                  ({activePalika.seasonalRotations.chaite.nepaliName})
                </div>
                <div className="text-[10px] text-emerald-800 font-mono font-semibold">
                  Suitability: {activePalika.seasonalRotations.chaite.score}% ({activePalika.seasonalRotations.chaite.rating})
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic mt-2">Spring Maize / Seasonal Cucurbits</div>
            )}
          </div>
          {activePalika.seasonalRotations?.chaite && (
            <button
              onClick={() => {
                const c = db.getCropById(activePalika.seasonalRotations?.chaite?.cropId || '') || db.getAllCrops()[0];
                onSelectCrop(c);
              }}
              className="w-full py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>⚡ Run WEFES Simulation</span>
            </button>
          )}
        </div>

        {/* Baahramase (Perennial Cash Crops) */}
        <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-purple-900 font-outfit uppercase">
              <span>☕ बाह्रमासे (Perennial)</span>
              <span className="text-[10px] text-purple-700 font-normal font-sans">वर्षभरि (Perennial)</span>
            </div>
            {activePalika.seasonalRotations?.baahramase ? (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                  <span>{activePalika.seasonalRotations.baahramase.emoji}</span>
                  <span>{activePalika.seasonalRotations.baahramase.cropName}</span>
                </div>
                <div className="text-[11px] text-slate-600 font-serif">
                  ({activePalika.seasonalRotations.baahramase.nepaliName})
                </div>
                <div className="text-[10px] text-purple-800 font-mono font-semibold">
                  Suitability: {activePalika.seasonalRotations.baahramase.score}% ({activePalika.seasonalRotations.baahramase.rating})
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic mt-2">Arabica Coffee / Mandarin Orange</div>
            )}
          </div>
          {activePalika.seasonalRotations?.baahramase && (
            <button
              onClick={() => {
                const c = db.getCropById(activePalika.seasonalRotations?.baahramase?.cropId || '') || db.getAllCrops()[0];
                onSelectCrop(c);
              }}
              className="w-full py-1 px-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>⚡ Run WEFES Simulation</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
