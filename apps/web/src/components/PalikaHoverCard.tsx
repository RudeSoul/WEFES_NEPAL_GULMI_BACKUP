import React from 'react';
import { DISTRICT_PALIKAS, DistrictPalika, PalikaFeasibleCrop } from '../data/districtPalikaAssets';
import { Mountain, Thermometer, CloudRain, Sparkles, Sprout, ArrowRight, Layers } from 'lucide-react';

interface PalikaHoverCardProps {
  palikaProp: {
    id?: string;
    name: string;
    type?: string;
    fullName?: string;
    nepaliName?: string;
    code?: string;
    areaSqKm?: number;
  } | null;
}

export const PalikaHoverCard: React.FC<PalikaHoverCardProps> = ({ palikaProp }) => {
  if (!palikaProp) return null;

  // Find rich agro-ecological asset data for this palika in Gulmi
  const gulmiPalikas = DISTRICT_PALIKAS['gulmi'] || [];
  const richData = gulmiPalikas.find(
    p => p.name.toLowerCase() === palikaProp.name.toLowerCase() ||
         palikaProp.name.toLowerCase().includes(p.name.toLowerCase()) ||
         p.name.toLowerCase().includes(palikaProp.name.toLowerCase())
  );

  const elevation = richData?.elevation || 1450;
  const avgTemp = richData?.avgTempC || 14.5;
  const rainfall = richData?.rainfallMm || 1850;
  const soilPh = richData?.soilPh || 6.5;
  const topCrops: PalikaFeasibleCrop[] = richData?.feasibleCrops || [];
  const rotations = richData?.seasonalRotations;

  return (
    <div className="absolute top-3 right-3 z-[1000] w-72 sm:w-80 glass-panel rounded-xl p-3.5 bg-white/95 border border-emerald-300/80 shadow-lg backdrop-blur-md animate-fade-in pointer-events-none transition-all duration-150">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-2 mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm font-outfit">
              {palikaProp.name}
            </h3>
            {palikaProp.nepaliName && (
              <span className="text-[11px] text-slate-500 font-sans">
                ({palikaProp.nepaliName})
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500">
            Gulmi • {palikaProp.type || 'Palika'} {palikaProp.areaSqKm ? `• ${palikaProp.areaSqKm} km²` : ''}
          </p>
        </div>
        <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
          {palikaProp.type || 'Palika'}
        </span>
      </div>

      {/* Environmental & Soil Indicators Grid */}
      <div className="grid grid-cols-4 gap-1 mb-2 bg-slate-50/90 p-1.5 rounded-lg border border-slate-200/60 text-center">
        <div>
          <div className="flex items-center justify-center gap-0.5 text-[9px] text-slate-500 font-medium">
            <Mountain className="w-2.5 h-2.5 text-slate-600" />
            <span>Elev</span>
          </div>
          <span className="text-[11px] font-bold text-slate-900 font-mono">{elevation}m</span>
        </div>

        <div>
          <div className="flex items-center justify-center gap-0.5 text-[9px] text-slate-500 font-medium">
            <Thermometer className="w-2.5 h-2.5 text-amber-600" />
            <span>Temp</span>
          </div>
          <span className="text-[11px] font-bold text-slate-900 font-mono">{avgTemp}°C</span>
        </div>

        <div>
          <div className="flex items-center justify-center gap-0.5 text-[9px] text-slate-500 font-medium">
            <CloudRain className="w-2.5 h-2.5 text-blue-600" />
            <span>Rain</span>
          </div>
          <span className="text-[11px] font-bold text-slate-900 font-mono">{rainfall}mm</span>
        </div>

        <div>
          <div className="flex items-center justify-center gap-0.5 text-[9px] text-slate-500 font-medium">
            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
            <span>pH</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 font-mono">{soilPh}</span>
        </div>
      </div>

      {/* Feasible Crops List */}
      {topCrops.length > 0 && (
        <div className="mb-2">
          <div className="text-[10px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sprout className="w-3 h-3 text-emerald-600" />
              Top Feasible Crops
            </span>
            <span className="text-[9px] font-mono text-slate-500">
              {topCrops.length} Crops
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {topCrops.slice(0, 4).map((crop) => (
              <span
                key={crop.cropId}
                className="inline-flex items-center gap-1 text-[9px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-medium text-slate-800 shadow-2xs"
              >
                <span>{crop.emoji}</span>
                <span>{crop.cropName.split('(')[0].trim()}</span>
                <span className="text-emerald-700 font-mono font-bold">{crop.score}%</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Seasonal Rotations */}
      {rotations && (rotations.barkhe || rotations.hiunde) && (
        <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-lg p-1.5 mb-1.5 text-[9px] text-slate-700 flex items-center justify-between">
          {rotations.barkhe && (
            <div>
              <span className="text-emerald-900 font-bold block">बरखे (Summer):</span>
              <span>{rotations.barkhe.emoji} {rotations.barkhe.cropName.split('(')[0]}</span>
            </div>
          )}
          {rotations.hiunde && (
            <div className="text-right">
              <span className="text-emerald-900 font-bold block">हिउँदे (Winter):</span>
              <span>{rotations.hiunde.emoji} {rotations.hiunde.cropName.split('(')[0]}</span>
            </div>
          )}
        </div>
      )}

      {/* Call to action */}
      <div className="flex items-center justify-between text-[9px] text-emerald-700 font-medium pt-1 border-t border-slate-100">
        <span>Click Palika to open decision support</span>
        <ArrowRight className="w-2.5 h-2.5" />
      </div>
    </div>
  );
};
