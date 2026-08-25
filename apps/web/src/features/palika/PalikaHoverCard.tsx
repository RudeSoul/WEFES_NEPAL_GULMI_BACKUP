import React from 'react';
import { DISTRICT_PALIKAS, DistrictPalika, PalikaFeasibleCrop } from '../../data/districtPalikaAssets';
import { Mountain, Thermometer, CloudRain, Sparkles, Sprout, ArrowRight, Layers, Compass } from 'lucide-react';
import { getPalikaMicroClimate, GULMI_PALIKA_CLIMATE_PROFILES } from '../../utils/climateDownscaling';

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
  currentRainMm?: number;
  currentTempC?: number;
  climateMonth?: number;
  climateMode?: string;
  climateYear?: number;
}

export const PalikaHoverCard: React.FC<PalikaHoverCardProps> = ({
  palikaProp,
  currentRainMm = 150,
  currentTempC = 19.5,
  climateMonth = 7,
  climateMode = 'climatology',
  climateYear = 2019,
}) => {
  if (!palikaProp) return null;

  // Find rich agro-ecological asset data for this palika in Gulmi
  const gulmiPalikas = DISTRICT_PALIKAS['gulmi'] || [];
  const richData = gulmiPalikas.find(
    p => p.name.toLowerCase() === palikaProp.name.toLowerCase() ||
         palikaProp.name.toLowerCase().includes(p.name.toLowerCase()) ||
         p.name.toLowerCase().includes(palikaProp.name.toLowerCase())
  );

  const elevation = richData?.elevation || 1450;
  const soilPh = richData?.soilPh || 6.5;
  const topCrops: PalikaFeasibleCrop[] = richData?.feasibleCrops || [];
  const rotations = richData?.seasonalRotations;

  // Compute topographically downscaled micro-climate metrics
  const micro = getPalikaMicroClimate(palikaProp.name, currentRainMm, currentTempC, climateMonth, elevation);
  const orographicDiff = Math.round((micro.orographicFactor - 1) * 100);
  const orographicStr = orographicDiff >= 0 ? `+${orographicDiff}%` : `${orographicDiff}%`;

  return (
    <div className="absolute top-3 right-3 z-[1000] w-80 sm:w-88 glass-panel rounded-xl p-3.5 bg-white/95 border border-emerald-300/80 shadow-lg backdrop-blur-md animate-fade-in pointer-events-none transition-all duration-150">
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

      {/* Micro-Climate Niche Description */}
      <div className="mb-2 px-2 py-1 rounded bg-sky-50/80 border border-sky-200/70 text-[10px] text-sky-900 flex items-center gap-1.5">
        <Compass className="w-3 h-3 text-sky-600 shrink-0" />
        <span className="truncate font-medium">{micro.microClimateNiche}</span>
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
          <span className="text-[11px] font-bold text-slate-900 font-mono">{micro.monthlyTempC}°C</span>
        </div>

        <div>
          <div className="flex items-center justify-center gap-0.5 text-[9px] text-slate-500 font-medium">
            <CloudRain className="w-2.5 h-2.5 text-blue-600" />
            <span>Rain/Mo</span>
          </div>
          <span className="text-[11px] font-bold text-blue-900 font-mono" title={`${micro.monthlyRainMm} mm in active month (${orographicStr} Orographic uplift vs Tamghas)`}>
            {micro.monthlyRainMm}mm
          </span>
        </div>

        <div>
          <div className="flex items-center justify-center gap-0.5 text-[9px] text-slate-500 font-medium">
            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
            <span>pH</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 font-mono">{soilPh}</span>
        </div>
      </div>

      {/* Downscaled Micro-Climate Telemetry Row */}
      <div className="flex items-center justify-between text-[9.5px] px-2 py-1 mb-2 bg-slate-100/70 rounded border border-slate-200 text-slate-600 font-mono">
        <span>Orographic Factor: <strong className="text-slate-900">{orographicStr}</strong></span>
        <span>Annual Rain: <strong className="text-slate-900">{micro.annualRainMm} mm</strong></span>
      </div>

      {/* Feasible Crops List */}
      {topCrops.length > 0 && (
        <div className="mb-2">
          <div className="text-[10px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sprout className="w-3 h-3 text-emerald-600" />
              Calibrated Feasible Crops
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
