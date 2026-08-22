import React, { useState, useMemo } from 'react';
import { District, Crop } from '@wefes/shared-types';
import {
  Mountain, Thermometer, Wind, Sprout, CheckCircle2,
  AlertCircle, XCircle, ArrowUpRight, ChevronRight, Layers,
  Compass, Info, Sliders, TrendingUp
} from 'lucide-react';

interface DistrictElevationProfilerProps {
  district: District;
  districtCrops?: { crop: Crop; suitability: any }[];
  onSelectElevation?: (elevation: number) => void;
}

// Ecological zone classification based on altitude
function getEcologicalZone(meters: number): {
  zone: string;
  subBelt: string;
  color: string;
  bgColor: string;
  description: string;
} {
  if (meters < 1000) {
    return {
      zone: 'Tropical & Outer Foothills',
      subBelt: 'Terai, Bhabar & Inner Terai Valleys',
      color: '#059669',
      bgColor: 'bg-emerald-50 text-emerald-900 border-emerald-300',
      description: 'Sal forests, fertile alluvial floodplains, warm all year with high summer monsoons.'
    };
  } else if (meters < 1800) {
    return {
      zone: 'Subtropical Mid-Hills',
      subBelt: 'Lower Mountain Slopes & River Gorges',
      color: '#0284c7',
      bgColor: 'bg-sky-50 text-sky-900 border-sky-300',
      description: 'Chir pine, Schima-Castanopsis broadleaf forests; prime horticultural and coffee-growing belt.'
    };
  } else if (meters < 2400) {
    return {
      zone: 'Warm Temperate Hills',
      subBelt: 'Mid-Elevation Montane Forests',
      color: '#7c3aed',
      bgColor: 'bg-purple-50 text-purple-900 border-purple-300',
      description: 'Oak, rhododendron, and laurel forests; temperate fruit orchards, cardamom, and off-season vegetables.'
    };
  } else if (meters < 3000) {
    return {
      zone: 'Cool Temperate Mountain',
      subBelt: 'High Montane Conifer Belt',
      color: '#4f46e5',
      bgColor: 'bg-indigo-50 text-indigo-900 border-indigo-300',
      description: 'Hemlock, blue pine, and spruce forests; apple orchards, potato seed production, and livestock rangeland.'
    };
  } else if (meters < 4000) {
    return {
      zone: 'Subalpine Birch-Fir Belt',
      subBelt: 'Tree-line Transition Zone',
      color: '#d97706',
      bgColor: 'bg-amber-50 text-amber-900 border-amber-300',
      description: 'Silver fir, birch, and juniper scrub; alpine summer pastures, medicinal and aromatic plants (MAPs).'
    };
  } else if (meters < 5000) {
    return {
      zone: 'Alpine Rangelands',
      subBelt: 'High Alpine Shrub & Tundra Grasslands',
      color: '#ea580c',
      bgColor: 'bg-orange-50 text-orange-900 border-orange-300',
      description: 'Dwarf rhododendron, mosses, cushion plants, yak grazing pastures; extreme diurnal temperature swings.'
    };
  } else {
    return {
      zone: 'Nival Glacial & Permafrost',
      subBelt: 'Permanent Snow, Glaciers & Himalayan Summits',
      color: '#dc2626',
      bgColor: 'bg-rose-50 text-rose-900 border-rose-300',
      description: 'Permanent snowfields, moraines, hanging glaciers, and high-altitude glacial tarns.'
    };
  }
}

// Crop feasibility rules by elevation band
const CROP_ELEVATION_PROFILES: {
  name: string;
  emoji: string;
  min: number;
  max: number;
  optimalMin: number;
  optimalMax: number;
  category: string;
}[] = [
  { name: 'Paddy (Rice)', emoji: '🌾', min: 60, max: 1800, optimalMin: 100, optimalMax: 1200, category: 'Cereal' },
  { name: 'Maize (Corn)', emoji: '🌽', min: 100, max: 2400, optimalMin: 400, optimalMax: 1800, category: 'Cereal' },
  { name: 'Wheat', emoji: '🌾', min: 100, max: 2800, optimalMin: 300, optimalMax: 2000, category: 'Cereal' },
  { name: 'Millet (Finger Millet)', emoji: '🌾', min: 300, max: 2400, optimalMin: 600, optimalMax: 1800, category: 'Millet' },
  { name: 'Buckwheat', emoji: '🌾', min: 1200, max: 3800, optimalMin: 1800, optimalMax: 3200, category: 'Mountain Grain' },
  { name: 'Potato', emoji: '🥔', min: 300, max: 4000, optimalMin: 1400, optimalMax: 3200, category: 'Tuber' },
  { name: 'Arabica Coffee', emoji: '☕', min: 800, max: 1800, optimalMin: 1000, optimalMax: 1600, category: 'Cash Crop' },
  { name: 'Large Cardamom', emoji: '🌿', min: 900, max: 2000, optimalMin: 1200, optimalMax: 1800, category: 'Spice' },
  { name: 'Orthodox Tea', emoji: '🍵', min: 800, max: 2200, optimalMin: 1200, optimalMax: 1900, category: 'Cash Crop' },
  { name: 'Mandarin Orange', emoji: '🍊', min: 600, max: 1600, optimalMin: 800, optimalMax: 1400, category: 'Fruit' },
  { name: 'High-Altitude Apple', emoji: '🍎', min: 1800, max: 3400, optimalMin: 2200, optimalMax: 3000, category: 'Fruit' },
  { name: 'Sugarcane', emoji: '🎋', min: 60, max: 900, optimalMin: 80, optimalMax: 500, category: 'Cash Crop' },
  { name: 'Mustard (Oilseed)', emoji: '🌼', min: 80, max: 2000, optimalMin: 150, optimalMax: 1400, category: 'Oilseed' },
  { name: 'Lentils (Pulses)', emoji: '🫘', min: 80, max: 1600, optimalMin: 100, optimalMax: 1000, category: 'Pulse' },
  { name: 'Highland Ginger', emoji: '🫚', min: 400, max: 1800, optimalMin: 700, optimalMax: 1400, category: 'Spice' },
];

export const DistrictElevationProfiler: React.FC<DistrictElevationProfilerProps> = ({
  district,
  districtCrops = [],
  onSelectElevation,
}) => {
  // Parse min and max elevation from string
  const { minElev, maxElev } = useMemo(() => {
    let min = 100;
    let max = 2500;
    if (district.elevationRange) {
      const parts = district.elevationRange.replace(/m/gi, '').split('-').map(s => parseFloat(s.trim()));
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        min = Math.floor(parts[0] / 5) * 5;
        max = Math.ceil(parts[1] / 5) * 5;
      }
    } else {
      if (district.ecoZone === 'Terai') { min = 60; max = 400; }
      else if (district.ecoZone === 'Mountain') { min = 1500; max = 6500; }
      else { min = 600; max = 2800; }
    }
    return { minElev: min, maxElev: Math.max(min + 20, max) };
  }, [district]);

  // Default active elevation to middle-lower zone
  const [activeElevation, setActiveElevation] = useState<number>(() => {
    const mid = Math.round((minElev + (maxElev - minElev) * 0.35) / 5) * 5;
    return Math.max(minElev, Math.min(maxElev, mid));
  });

  const handleElevationChange = (val: number) => {
    const clamped = Math.max(minElev, Math.min(maxElev, Math.round(val / 5) * 5));
    setActiveElevation(clamped);
    if (onSelectElevation) onSelectElevation(clamped);
  };

  // Environmental Physics calculations at this active elevation
  const physics = useMemo(() => {
    const baseTemp = (district as any).avgTempC ?? (district.ecoZone === 'Terai' ? 25 : district.ecoZone === 'Mountain' ? 10 : 18);
    const baseAlt = minElev;
    const deltaH = activeElevation - baseAlt;

    // Environmental Lapse Rate (Standard ISA lapse rate: 6.5°C per 1,000m)
    const estimatedTemp = +(baseTemp - (deltaH / 1000) * 6.5).toFixed(1);

    // Barometric Formula for atmospheric pressure: P = 101.325 * (1 - 2.25577e-5 * h)^5.25588 kPa
    const pKPa = Math.max(25, 101.325 * Math.pow(1 - 2.25577e-5 * activeElevation, 5.25588));
    const oxygenPct = Math.max(30, (pKPa / 101.325) * 100);

    // Estimated Hypsographic percentage of district land below this elevation (logistic sigmoid)
    const normalizedH = (activeElevation - minElev) / (maxElev - minElev);
    const hypsographicPct = +(100 / (1 + Math.exp(-6 * (normalizedH - 0.45)))).toFixed(1);
    const estimatedHa = Math.round(((district as any).areaSqKm || 1500) * 100 * (hypsographicPct / 100));

    return {
      tempC: estimatedTemp,
      pressureKPa: +pKPa.toFixed(1),
      oxygenPct: +oxygenPct.toFixed(1),
      hypsographicPct,
      estimatedHa,
    };
  }, [activeElevation, minElev, maxElev, district]);

  const activeZone = useMemo(() => getEcologicalZone(activeElevation), [activeElevation]);

  // Crop Feasibility at this exact 5m elevation slice
  const cropEvaluations = useMemo(() => {
    return CROP_ELEVATION_PROFILES.map((crop) => {
      let status: 'optimal' | 'moderate' | 'unfeasible' = 'unfeasible';
      let reason = 'Outside thermal & altitudinal window';

      if (activeElevation >= crop.optimalMin && activeElevation <= crop.optimalMax) {
        status = 'optimal';
        reason = `Prime altitude (${crop.optimalMin}–${crop.optimalMax}m)`;
      } else if (activeElevation >= crop.min && activeElevation <= crop.max) {
        status = 'moderate';
        reason = `Marginal growth window (${crop.min}–${crop.max}m)`;
      }

      return { ...crop, status, reason };
    });
  }, [activeElevation]);

  const optimalCrops = cropEvaluations.filter(c => c.status === 'optimal');
  const moderateCrops = cropEvaluations.filter(c => c.status === 'moderate');
  const unfeasibleCrops = cropEvaluations.filter(c => c.status === 'unfeasible');

  // Topographic cross-section points for SVG visualization
  const crossSectionPoints = useMemo(() => {
    const pointsCount = 30;
    const pts: { x: number; y: number; elevation: number }[] = [];
    for (let i = 0; i <= pointsCount; i++) {
      const t = i / pointsCount;
      // Realistic Himalayan terrain curve (concave valley to steep ridge)
      const elev = minElev + (maxElev - minElev) * Math.pow(t, 1.6);
      pts.push({ x: t * 100, y: elev, elevation: Math.round(elev / 5) * 5 });
    }
    return pts;
  }, [minElev, maxElev]);

  return (
    <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white/95 space-y-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center space-x-2 text-xs text-sky-700 font-bold uppercase tracking-wider">
            <Mountain className="w-4 h-4 text-sky-600" />
            <span>5-Meter Precision Topographic Elevation Profiler</span>
          </div>
          <h4 className="text-base font-bold text-slate-900 font-outfit mt-0.5 flex items-center gap-2">
            <span>{district.name} Topography & Microclimate Slice</span>
            <span className="text-xs px-2 py-0.5 rounded-md font-mono font-bold bg-sky-100 text-sky-900 border border-sky-200">
              5m Resolution
            </span>
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
            Min: <strong>{minElev}m</strong>
          </span>
          <span className="text-slate-400">→</span>
          <span className="px-2.5 py-1 bg-sky-50 text-sky-800 rounded-lg border border-sky-200 font-bold">
            Max: <strong>{maxElev}m</strong> (Span: {(maxElev - minElev).toLocaleString()}m)
          </span>
        </div>
      </div>

      {/* Main Interactive 5m Elevation Scrubber */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-sans">
              Selected 5m Elevation Slice:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleElevationChange(activeElevation - 5)}
              disabled={activeElevation <= minElev}
              className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-xs font-mono font-bold cursor-pointer transition-colors"
            >
              -5m
            </button>
            <div className="text-2xl font-black font-mono text-sky-400 tracking-tight">
              {activeElevation.toLocaleString()} <span className="text-sm font-normal text-slate-300">masl</span>
            </div>
            <button
              onClick={() => handleElevationChange(activeElevation + 5)}
              disabled={activeElevation >= maxElev}
              className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-xs font-mono font-bold cursor-pointer transition-colors"
            >
              +5m
            </button>
          </div>
        </div>

        {/* Range Slider (Step = 5 meters) */}
        <div className="space-y-1">
          <input
            type="range"
            min={minElev}
            max={maxElev}
            step={5}
            value={activeElevation}
            onChange={(e) => handleElevationChange(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>{minElev}m (Valley Basin)</span>
            <span>{Math.round((minElev + maxElev) / 2)}m (Mid-Slope)</span>
            <span>{maxElev}m (High Ridge/Summit)</span>
          </div>
        </div>

        {/* Dynamic Ecological Life Belt Badge */}
        <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-sans text-slate-400 font-semibold">Life Zone:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold font-sans text-xs border ${activeZone.bgColor}`}>
              {activeZone.zone}
            </span>
          </div>
          <span className="text-[11px] text-slate-300 font-sans italic">
            {activeZone.subBelt}
          </span>
        </div>
      </div>

      {/* Real-time Environmental Physics & Hypsographic Distribution Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        {/* Estimated Temperature */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-sans font-semibold">
            <Thermometer className="w-3.5 h-3.5 text-rose-500" />
            <span>Lapse Temp</span>
          </div>
          <div className={`text-lg font-extrabold mt-1 ${physics.tempC <= 0 ? 'text-blue-700' : 'text-slate-900'}`}>
            {physics.tempC}°C
          </div>
          <div className="text-[9px] text-slate-500 font-sans mt-0.5">
            -6.5°C per 1,000m lapse rate
          </div>
        </div>

        {/* Barometric Pressure */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-sans font-semibold">
            <Wind className="w-3.5 h-3.5 text-sky-500" />
            <span>Air Pressure</span>
          </div>
          <div className="text-lg font-extrabold text-slate-900 mt-1">
            {physics.pressureKPa} <span className="text-xs font-normal text-slate-500">kPa</span>
          </div>
          <div className="text-[9px] text-slate-500 font-sans mt-0.5">
            Oxygen: {physics.oxygenPct}% of sea level
          </div>
        </div>

        {/* District Land Area Below this Altitude */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-sans font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hypsography</span>
          </div>
          <div className="text-lg font-extrabold text-emerald-800 mt-1">
            ~{physics.hypsographicPct}%
          </div>
          <div className="text-[9px] text-slate-500 font-sans mt-0.5">
            District land &le; {activeElevation}m
          </div>
        </div>

        {/* Estimated Cumulative Hectares */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-sans font-semibold">
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>Land Coverage</span>
          </div>
          <div className="text-lg font-extrabold text-purple-900 mt-1">
            {physics.estimatedHa.toLocaleString()} <span className="text-xs font-normal text-slate-500">ha</span>
          </div>
          <div className="text-[9px] text-slate-500 font-sans mt-0.5">
            Topographic footprint
          </div>
        </div>
      </div>

      {/* SVG Topographic Relief Profile Cross-Section */}
      <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 font-outfit flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            Topographic Relief Cross-Section (Valley to Summit)
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Interactive Elevation Marker: <strong>{activeElevation}m</strong>
          </span>
        </div>

        <div className="relative h-28 w-full bg-white rounded-lg border border-slate-200 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
            <defs>
              <linearGradient id="topoGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="35%" stopColor="#0ea5e9" stopOpacity="0.5" />
                <stop offset="70%" stopColor="#8b5cf6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Topographic fill polygon */}
            <path
              d={`M 0 50 L ${crossSectionPoints.map(p => `${p.x} ${50 - ((p.y - minElev) / (maxElev - minElev)) * 42}`).join(' L ')} L 100 50 Z`}
              fill="url(#topoGradient)"
            />

            {/* Topographic line */}
            <path
              d={`M ${crossSectionPoints.map(p => `${p.x} ${50 - ((p.y - minElev) / (maxElev - minElev)) * 42}`).join(' L ')}`}
              fill="none"
              stroke="#0f172a"
              strokeWidth="1"
            />

            {/* Active elevation horizontal guide line */}
            <line
              x1="0"
              y1={50 - ((activeElevation - minElev) / (maxElev - minElev)) * 42}
              x2="100"
              y2={50 - ((activeElevation - minElev) / (maxElev - minElev)) * 42}
              stroke="#0284c7"
              strokeWidth="0.8"
              strokeDasharray="2 2"
            />
          </svg>

          {/* Active elevation pin badge */}
          <div
            className="absolute z-10 -translate-y-1/2 flex items-center gap-1 bg-sky-900 text-white px-2 py-0.5 rounded shadow text-[10px] font-mono font-bold"
            style={{
              top: `${Math.max(10, Math.min(90, 100 - ((activeElevation - minElev) / (maxElev - minElev)) * 84))}%`,
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <span>⛰️</span>
            <span>{activeElevation}m</span>
          </div>
        </div>
      </div>

      {/* Crop Suitability Matrix at this Exact 5m Elevation */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900 font-outfit flex items-center gap-1.5">
            <Sprout className="w-4 h-4 text-emerald-600" />
            Agricultural & Crop Feasibility at {activeElevation}m:
          </span>
          <div className="flex items-center gap-2 text-[10px] font-medium">
            <span className="text-emerald-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {optimalCrops.length} Optimal
            </span>
            <span className="text-amber-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> {moderateCrops.length} Marginal
            </span>
          </div>
        </div>

        {optimalCrops.length === 0 && moderateCrops.length === 0 ? (
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              At <strong>{activeElevation}m</strong>, thermal limitations and sub-zero frost prohibit commercial crop cultivation. Suitable primarily for alpine rangeland, medicinal plants, and cryospheric storage.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {optimalCrops.map((c) => (
              <div key={c.name} className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-start justify-between gap-1">
                <div>
                  <div className="font-bold text-emerald-950 flex items-center gap-1">
                    <span>{c.emoji}</span>
                    <span>{c.name}</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">{c.reason}</div>
                </div>
                <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-mono font-bold">
                  Prime
                </span>
              </div>
            ))}

            {moderateCrops.map((c) => (
              <div key={c.name} className="p-2 rounded-lg bg-amber-50/70 border border-amber-200 flex items-start justify-between gap-1">
                <div>
                  <div className="font-bold text-amber-950 flex items-center gap-1">
                    <span>{c.emoji}</span>
                    <span>{c.name}</span>
                  </div>
                  <div className="text-[10px] text-amber-700 mt-0.5">{c.reason}</div>
                </div>
                <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-mono font-semibold">
                  Marginal
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
