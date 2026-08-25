import React, { useState } from 'react';
import { DistrictPalika } from '../../../data/districtPalikaAssets';

export interface PalikaLiveWeather {
  temperature: number;
  apparentTemp: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  solarRadiation: number;
  cloudCover: number;
  surfacePressure: number;
  et0: number;
  vpd: number;
  topsoilMoisture: number;
  deepSoilMoisture: number;
  uvIndex: number;
  isDay: boolean;
  time: string;
  soilMoisturePct: number;
  fungalRisk: 'Low' | 'Moderate' | 'High';
  solarPumpingScore: number;
  fireDangerRating: 'Low' | 'Moderate' | 'High' | 'Extreme';
  landslideHazard: 'Low' | 'Moderate' | 'Alert';
  hourlyInflow72h: number;
}

interface PalikaWeatherConsoleProps {
  activePalika: DistrictPalika;
  palikaWeather: PalikaLiveWeather | null;
  weatherTelemetryMode: 'live' | 'archive';
  PALIKA_GEO_CENTROIDS: Record<string, { lat: number; lng: number }>;
}

export const PalikaWeatherConsole: React.FC<PalikaWeatherConsoleProps> = ({
  activePalika,
  palikaWeather,
  weatherTelemetryMode,
  PALIKA_GEO_CENTROIDS,
}) => {
  const [satConsoleTab, setSatConsoleTab] = useState<'soil' | 'vpd' | 'solar' | 'hazard' | 'atmosphere'>('soil');

  if (weatherTelemetryMode !== 'live' || !palikaWeather) return null;

  return (
    <div className="p-4 rounded-2xl bg-white/95 text-slate-800 border border-slate-200/90 shadow-sm space-y-3.5 animate-fade-in glass-panel">
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <span className="text-xs font-bold text-slate-900 font-outfit uppercase tracking-wider flex items-center gap-1.5">
            <span>🛰️ Real-Time Earth Observation Radar</span>
            <span className="text-[10px] text-slate-500 font-mono font-normal">
              ({activePalika.name} Coordinates: {PALIKA_GEO_CENTROIDS[activePalika.name]?.lat}°N, {PALIKA_GEO_CENTROIDS[activePalika.name]?.lng}°E)
            </span>
          </span>
        </div>

        {/* 5 Modular Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-sans">
          <button
            onClick={() => setSatConsoleTab('soil')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              satConsoleTab === 'soil' ? 'bg-cyan-700 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>💧 Soil Moisture & ET₀</span>
          </button>
          <button
            onClick={() => setSatConsoleTab('vpd')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              satConsoleTab === 'vpd' ? 'bg-emerald-700 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>🍃 Plant VPD & Disease</span>
          </button>
          <button
            onClick={() => setSatConsoleTab('solar')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              satConsoleTab === 'solar' ? 'bg-amber-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>⚡ Solar Pumping</span>
          </button>
          <button
            onClick={() => setSatConsoleTab('hazard')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              satConsoleTab === 'hazard' ? 'bg-rose-700 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>⚠️ Hazard & Fire Early Warning</span>
          </button>
          <button
            onClick={() => setSatConsoleTab('atmosphere')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              satConsoleTab === 'atmosphere' ? 'bg-indigo-700 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>⛅ Micro-Atmosphere</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Soil Moisture & ET0 */}
      {satConsoleTab === 'soil' && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs animate-fade-in">
          <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-200/80">
            <div className="text-[10px] text-cyan-800 font-semibold uppercase">Topsoil Moisture (0–7cm)</div>
            <div className="text-lg font-extrabold text-cyan-950 font-mono mt-0.5">
              {palikaWeather.topsoilMoisture} <span className="text-[10px] font-normal text-slate-500">m³/m³</span>
            </div>
            <div className="text-[10px] text-cyan-700 font-mono mt-0.5">{palikaWeather.soilMoisturePct}% Saturation Ratio</div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-200/80">
            <div className="text-[10px] text-cyan-800 font-semibold uppercase">Deep Root-Zone (7–28cm)</div>
            <div className="text-lg font-extrabold text-cyan-950 font-mono mt-0.5">
              {palikaWeather.deepSoilMoisture} <span className="text-[10px] font-normal text-slate-500">m³/m³</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Hydraulic Mountain Buffer</div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-200/80">
            <div className="text-[10px] text-cyan-800 font-semibold uppercase">FAO-56 Evapotranspiration (ET₀)</div>
            <div className="text-lg font-extrabold text-cyan-950 font-mono mt-0.5">
              {palikaWeather.et0} <span className="text-[10px] font-normal text-slate-500">mm/day</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Atmospheric Crop Water Loss</div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-200/80 flex flex-col justify-between">
            <div className="text-[10px] text-cyan-800 font-semibold uppercase">Irrigation Balance Status</div>
            <div className="text-xs font-bold text-emerald-800 mt-1 font-mono">
              {palikaWeather.precipitation > palikaWeather.et0 ? '🌧️ Inflow Hydration' : '☀️ Evaporative Deficit'}
            </div>
            <div className="text-[9px] text-slate-500">Terraced Bari Soil Drainage Monitored</div>
          </div>
        </div>
      )}

      {/* Tab 2: Plant Biophysics & VPD */}
      {satConsoleTab === 'vpd' && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs animate-fade-in">
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="text-[10px] text-emerald-800 font-semibold uppercase">Vapor Pressure Deficit (VPD)</div>
            <div className="text-lg font-extrabold text-emerald-950 font-mono mt-0.5">
              {palikaWeather.vpd} <span className="text-[10px] font-normal text-slate-500">kPa</span>
            </div>
            <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
              {palikaWeather.vpd < 0.4 ? 'Humid Stomatal Closure' : palikaWeather.vpd <= 1.2 ? 'Optimal Transpiration Window' : 'Dry Atmospheric Stress'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="text-[10px] text-emerald-800 font-semibold uppercase">Coffee Leaf Rust (*Hemileia*)</div>
            <div className={`text-sm font-extrabold mt-1 font-mono inline-flex items-center px-2 py-0.5 rounded ${
              palikaWeather.fungalRisk === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
              palikaWeather.fungalRisk === 'Moderate' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
              'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}>
              {palikaWeather.fungalRisk} Risk Level
            </div>
            <div className="text-[9px] text-slate-500 mt-1">Spore Germination Probability</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="text-[10px] text-emerald-800 font-semibold uppercase">Citrus Canker Vulnerability</div>
            <div className="text-sm font-bold text-slate-800 mt-1 font-mono">
              {palikaWeather.humidity > 80 ? '⚠️ High Moisture Incubation' : '✅ Safe Micro-Climate'}
            </div>
            <div className="text-[9px] text-slate-500 mt-1">Relative Humidity: {palikaWeather.humidity}%</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="text-[10px] text-emerald-800 font-semibold uppercase">Crop Stomatal Health</div>
            <div className="text-xs font-bold text-emerald-800 mt-1 font-mono">
              Active Photosynthetic Pumping
            </div>
            <div className="text-[9px] text-slate-500 mt-1">Slow High-Altitude Acid Synthesis</div>
          </div>
        </div>
      )}

      {/* Tab 3: Solar Pumping Viability */}
      {satConsoleTab === 'solar' && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs animate-fade-in">
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <div className="text-[10px] text-amber-800 font-semibold uppercase">Direct Normal Solar Flux</div>
            <div className="text-lg font-extrabold text-amber-950 font-mono mt-0.5">
              {palikaWeather.solarRadiation} <span className="text-[10px] font-normal text-slate-500">W/m²</span>
            </div>
            <div className="text-[10px] text-amber-700 font-mono mt-0.5">Clear-Sky Ground Insolation</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <div className="text-[10px] text-amber-800 font-semibold uppercase">Solar River-Lifting Efficiency</div>
            <div className="text-lg font-extrabold text-amber-800 font-mono mt-0.5">
              {palikaWeather.solarPumpingScore}% <span className="text-[10px] font-normal text-slate-500">Operational</span>
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">Badigad / Kaligandaki River Pump</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <div className="text-[10px] text-amber-800 font-semibold uppercase">Solar UV Index (Daily Peak)</div>
            <div className="text-lg font-extrabold text-amber-950 font-mono mt-0.5">
              {palikaWeather.uvIndex} <span className="text-[10px] font-normal text-slate-500">UVI</span>
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">Photovoltaic Photons Cleared</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <div className="text-[10px] text-amber-800 font-semibold uppercase">Clean Energy Yield</div>
            <div className="text-xs font-bold text-amber-900 mt-1 font-mono">~4.9 kWh/kWp Daily Capacity</div>
            <div className="text-[9px] text-slate-500 mt-0.5">Municipal Micro-Grid Viable</div>
          </div>
        </div>
      )}

      {/* Tab 4: Hazard & Disaster Early Warning */}
      {satConsoleTab === 'hazard' && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs animate-fade-in">
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80">
            <div className="text-[10px] text-rose-800 font-semibold uppercase">72-Hour Inflow Accumulation</div>
            <div className="text-lg font-extrabold text-rose-950 font-mono mt-0.5">
              {palikaWeather.hourlyInflow72h} <span className="text-[10px] font-normal text-slate-500">mm / 72h</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Rolling Satellite Accumulation</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80">
            <div className="text-[10px] text-rose-800 font-semibold uppercase">Landslide Trigger Hazard</div>
            <div className={`text-sm font-extrabold mt-1 font-mono inline-flex items-center px-2 py-0.5 rounded ${
              palikaWeather.landslideHazard === 'Alert' ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse' :
              palikaWeather.landslideHazard === 'Moderate' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
              'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}>
              {palikaWeather.landslideHazard} Trigger Status
            </div>
            <div className="text-[9px] text-slate-500 mt-1">Threshold: 120 mm/72h on slopes</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80">
            <div className="text-[10px] text-rose-800 font-semibold uppercase">Forest Fire Danger Index (FDRI)</div>
            <div className={`text-sm font-extrabold mt-1 font-mono inline-flex items-center px-2 py-0.5 rounded ${
              palikaWeather.fireDangerRating === 'Extreme' ? 'bg-rose-200 text-rose-900 border border-rose-400 animate-pulse' :
              palikaWeather.fireDangerRating === 'High' ? 'bg-orange-100 text-orange-900 border border-orange-300' :
              palikaWeather.fireDangerRating === 'Moderate' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
              'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}>
              {palikaWeather.fireDangerRating} Fire Rating
            </div>
            <div className="text-[9px] text-slate-500 mt-1">Community Forest Pinewood Aridity</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80">
            <div className="text-[10px] text-rose-800 font-semibold uppercase">Disaster Advisory</div>
            <div className="text-xs font-bold text-slate-800 mt-1 font-mono">
              {palikaWeather.landslideHazard === 'Alert' ? '⚠️ High Inflow Precaution' : '✅ Slopes Mechanically Stable'}
            </div>
            <div className="text-[9px] text-slate-500 mt-1">Satyawati & Madane Ward Radar</div>
          </div>
        </div>
      )}

      {/* Tab 5: Micro-Atmosphere */}
      {satConsoleTab === 'atmosphere' && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs animate-fade-in">
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
            <div className="text-[10px] text-indigo-800 font-semibold uppercase">Surface Pressure</div>
            <div className="text-lg font-extrabold text-indigo-950 font-mono mt-0.5">
              {palikaWeather.surfacePressure} <span className="text-[10px] font-normal text-slate-500">hPa</span>
            </div>
            <div className="text-[10px] text-indigo-700 font-mono mt-0.5">High-Elevation Barometric Level</div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
            <div className="text-[10px] text-indigo-800 font-semibold uppercase">Diurnal Temperature</div>
            <div className="text-lg font-extrabold text-amber-800 font-mono mt-0.5">
              {palikaWeather.temperature}°C <span className="text-[10px] font-normal text-slate-500">(Feels {palikaWeather.apparentTemp}°)</span>
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">Lapse-Adjusted Ambient Sensor</div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
            <div className="text-[10px] text-indigo-800 font-semibold uppercase">Wind Speed & Direction</div>
            <div className="text-lg font-extrabold text-teal-800 font-mono mt-0.5">
              {palikaWeather.windSpeed} <span className="text-[10px] font-normal text-slate-500">m/s</span>
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">Kali Gandaki Gorge Valley Breeze</div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
            <div className="text-[10px] text-indigo-800 font-semibold uppercase">Cloud Cover & Attenuation</div>
            <div className="text-lg font-extrabold text-indigo-900 font-mono mt-0.5">{palikaWeather.cloudCover}%</div>
            <div className="text-[9px] text-slate-500 mt-0.5">Monsoon Cloud Blanket Ratio</div>
          </div>
        </div>
      )}
    </div>
  );
};
