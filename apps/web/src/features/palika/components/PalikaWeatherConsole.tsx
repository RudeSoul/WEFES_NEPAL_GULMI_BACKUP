// [DATA PROVENANCE]
// Data Source: Open-Meteo NWP assimilation (ECMWF/GFS) & Biophysical Heuristics (Palpa I-D Curve)
// Classification: EXPERIMENTAL OPERATIONAL ADVISORY (Downscaled Numerical Model)
// Citations: Open-Meteo Historical & Live Weather API; FAO-56 Penman-Monteith; Dahal & Hasegawa (2008)
import React, { useState } from 'react';
import { DistrictPalika } from '../../../data/districtPalikaAssets';

export interface PalikaLiveWeather {
  temperature?: number | null;
  apparentTemp?: number | null;
  humidity?: number | null;
  precipitation?: number | null;
  windSpeed?: number | null;
  solarRadiation?: number | null;
  cloudCover?: number | null;
  surfacePressure?: number | null;
  et0?: number | null;
  vpd?: number | null;
  topsoilMoisture?: number | null;
  deepSoilMoisture?: number | null;
  uvIndex?: number | null;
  isDay?: boolean | null;
  time?: string | null;
  // Scientifically precision-calibrated & dynamic metrics
  soilWaterIndex?: number | null; // Relative soil wetness % (topsoil / saturation porosity config)
  coffeeRustRisk?: 'Low' | 'Moderate' | 'High' | null; // Weather-favourability for coffee leaf rust (Hemileia vastatrix)
  solarYieldKwhPerM2?: number | null; // Integrated daily solar radiation yield in kWh/m²
  solarPumpingScore?: number | null; // Solar irrigation pumping viability % based on daily irradiance target
  fireWeatherHeuristic?: 'Low' | 'Moderate' | 'High' | 'Extreme' | null; // Micro-climate fuel dryness & fire weather heuristic
  landslideExceedanceRatio?: number | null; // Rainfall intensity-duration exceedance ratio (Dahal-Hasegawa / Palpa I-D curve)
  landslideHazard?: 'Low' | 'Moderate' | 'Alert' | null; // Slope stability hazard warning
  hourlyInflow24h?: number | null; // 24-hour accumulated rainfall (mm)
  hourlyInflow72h?: number | null; // 72-hour accumulated rainfall (mm)
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

  const lat = PALIKA_GEO_CENTROIDS[activePalika.name]?.lat;
  const lng = PALIKA_GEO_CENTROIDS[activePalika.name]?.lng;

  return (
    <div className="p-4 rounded-2xl bg-white/95 text-slate-800 border border-slate-200/90 shadow-sm space-y-3.5 animate-fade-in glass-panel">
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 font-outfit uppercase tracking-wider">
                ⚡ Live Operational Advisory (Beta)
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-semibold border border-amber-300">
                Non-Validated Telemetry
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono font-normal">
              {activePalika.name} Micro-Climate · {lat != null && lng != null ? `${lat}°N, ${lng}°E` : 'No coordinate data'} · Elevation: {activePalika.elevation ?? 'No data'}m ASL
            </span>
          </div>
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

      {/* Tab 1: Soil Water Index & ET0 */}
      {satConsoleTab === 'soil' && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs animate-fade-in">
          <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-200/80">
            <div className="text-[10px] text-cyan-800 font-semibold uppercase">Topsoil Moisture (0–7cm)</div>
            <div className="text-lg font-extrabold text-cyan-950 font-mono mt-0.5">
              {palikaWeather.topsoilMoisture != null ? (
                <>
                  {palikaWeather.topsoilMoisture} <span className="text-[10px] font-normal text-slate-500">m³/m³</span>
                </>
              ) : (
                <span className="text-slate-400 font-normal italic text-sm">No data</span>
              )}
            </div>
            <div className="text-[10px] text-cyan-700 font-mono mt-0.5">
              {palikaWeather.soilWaterIndex != null ? `${palikaWeather.soilWaterIndex}% Soil Water Index` : 'No data'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-200/80">
            <div className="text-[10px] text-cyan-800 font-semibold uppercase">Deep Root-Zone (7–28cm)</div>
            <div className="text-lg font-extrabold text-cyan-950 font-mono mt-0.5">
              {palikaWeather.deepSoilMoisture != null ? (
                <>
                  {palikaWeather.deepSoilMoisture} <span className="text-[10px] font-normal text-slate-500">m³/m³</span>
                </>
              ) : (
                <span className="text-slate-400 font-normal italic text-sm">No data</span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Subsoil Storage Reserve</div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-200/80">
            <div className="text-[10px] text-cyan-800 font-semibold uppercase">FAO-56 Evapotranspiration (ET₀)</div>
            <div className="text-lg font-extrabold text-cyan-950 font-mono mt-0.5">
              {palikaWeather.et0 != null ? (
                <>
                  {palikaWeather.et0} <span className="text-[10px] font-normal text-slate-500">mm/day</span>
                </>
              ) : (
                <span className="text-slate-400 font-normal italic text-sm">No data</span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Atmospheric Crop Water Loss</div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-200/80 flex flex-col justify-between">
            <div className="text-[10px] text-cyan-800 font-semibold uppercase">Irrigation Balance Status</div>
            <div className="text-xs font-bold text-emerald-800 mt-1 font-mono">
              {palikaWeather.precipitation != null && palikaWeather.et0 != null ? (
                palikaWeather.precipitation > palikaWeather.et0 ? '🌧️ Inflow Hydration' : '☀️ Evaporative Deficit'
              ) : (
                <span className="text-slate-400 font-normal italic">No data</span>
              )}
            </div>
            <div className="text-[9px] text-slate-500">{activePalika.name} Micro-Climate Soil Balance</div>
          </div>
        </div>
      )}

      {/* Tab 2: Plant Biophysics & VPD */}
      {satConsoleTab === 'vpd' && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs animate-fade-in">
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="text-[10px] text-emerald-800 font-semibold uppercase">Vapor Pressure Deficit (VPD)</div>
            <div className="text-lg font-extrabold text-emerald-950 font-mono mt-0.5">
              {palikaWeather.vpd != null ? (
                <>
                  {palikaWeather.vpd} <span className="text-[10px] font-normal text-slate-500">kPa</span>
                </>
              ) : (
                <span className="text-slate-400 font-normal italic text-sm">No data</span>
              )}
            </div>
            <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
              {palikaWeather.vpd != null ? (
                palikaWeather.vpd < 0.4 ? 'Humid Stomatal Closure' : palikaWeather.vpd <= 1.2 ? 'Optimal Transpiration Window' : 'Dry Atmospheric Stress'
              ) : (
                'No data'
              )}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="text-[10px] text-emerald-800 font-semibold uppercase">Coffee Leaf Rust (*Hemileia*)</div>
            {palikaWeather.coffeeRustRisk ? (
              <div className={`text-sm font-extrabold mt-1 font-mono inline-flex items-center px-2 py-0.5 rounded ${
                palikaWeather.coffeeRustRisk === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                palikaWeather.coffeeRustRisk === 'Moderate' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {palikaWeather.coffeeRustRisk} Favourability
              </div>
            ) : (
              <div className="text-slate-400 font-normal italic text-sm mt-1">No data</div>
            )}
            <div className="text-[9px] text-slate-500 mt-1">Weather-Favourability Proxy</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="text-[10px] text-emerald-800 font-semibold uppercase">Micro-Climate Incubation</div>
            <div className="text-sm font-bold text-slate-800 mt-1 font-mono">
              {palikaWeather.humidity != null ? (
                palikaWeather.humidity > 80 ? '⚠️ High Moisture Incubation' : '✅ Moderate Incubation Risk'
              ) : (
                <span className="text-slate-400 font-normal italic text-sm">No data</span>
              )}
            </div>
            <div className="text-[9px] text-slate-500 mt-1">
              Relative Humidity: {palikaWeather.humidity != null ? `${palikaWeather.humidity}%` : 'No data'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="text-[10px] text-emerald-800 font-semibold uppercase">Stomatal Transpiration</div>
            <div className="text-xs font-bold text-emerald-800 mt-1 font-mono">
              {palikaWeather.vpd != null ? (
                palikaWeather.vpd >= 0.4 && palikaWeather.vpd <= 1.2 ? 'Active Transpiration' : 'Regulated Stomatal Flow'
              ) : (
                <span className="text-slate-400 font-normal italic">No data</span>
              )}
            </div>
            <div className="text-[9px] text-slate-500 mt-1">{activePalika.elevation != null ? `${activePalika.elevation}m ASL Canopy Dynamics` : 'Canopy Dynamics'}</div>
          </div>
        </div>
      )}

      {/* Tab 3: Solar Pumping Viability */}
      {satConsoleTab === 'solar' && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs animate-fade-in">
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <div className="text-[10px] text-amber-800 font-semibold uppercase">Direct Normal Solar Flux</div>
            <div className="text-lg font-extrabold text-amber-950 font-mono mt-0.5">
              {palikaWeather.solarRadiation != null ? (
                <>
                  {palikaWeather.solarRadiation} <span className="text-[10px] font-normal text-slate-500">W/m²</span>
                </>
              ) : (
                <span className="text-slate-400 font-normal italic text-sm">No data</span>
              )}
            </div>
            <div className="text-[10px] text-amber-700 font-mono mt-0.5">Instantaneous Ground Insolation</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <div className="text-[10px] text-amber-800 font-semibold uppercase">Solar River-Lifting Potential</div>
            <div className="text-lg font-extrabold text-amber-800 font-mono mt-0.5">
              {palikaWeather.solarPumpingScore != null ? (
                <>
                  {palikaWeather.solarPumpingScore}% <span className="text-[10px] font-normal text-slate-500">Viability</span>
                </>
              ) : (
                <span className="text-slate-400 font-normal italic text-sm">No data</span>
              )}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">Daily Irradiance Benchmark</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <div className="text-[10px] text-amber-800 font-semibold uppercase">Solar UV Index (Daily Peak)</div>
            <div className="text-lg font-extrabold text-amber-950 font-mono mt-0.5">
              {palikaWeather.uvIndex != null ? (
                <>
                  {palikaWeather.uvIndex} <span className="text-[10px] font-normal text-slate-500">UVI</span>
                </>
              ) : (
                <span className="text-slate-400 font-normal italic text-sm">No data</span>
              )}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">Atmospheric Irradiance Transmission</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <div className="text-[10px] text-amber-800 font-semibold uppercase">Integrated Solar Energy</div>
            <div className="text-xs font-bold text-amber-900 mt-1 font-mono">
              {palikaWeather.solarYieldKwhPerM2 != null ? `${palikaWeather.solarYieldKwhPerM2} kWh/m²/day` : <span className="text-slate-400 font-normal italic">No data</span>}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">24-Hour Integrated Yield</div>
          </div>
        </div>
      )}

      {/* Tab 4: Hazard & Disaster Early Warning */}
      {satConsoleTab === 'hazard' && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs animate-fade-in">
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80">
            <div className="text-[10px] text-rose-800 font-semibold uppercase">Rainfall (Past 24h / Forecast 24h)</div>
            <div className="text-lg font-extrabold text-rose-950 font-mono mt-0.5">
              {palikaWeather.hourlyInflow24h != null && palikaWeather.hourlyInflow72h != null ? (
                <>
                  {palikaWeather.hourlyInflow24h} / {palikaWeather.hourlyInflow72h} <span className="text-[10px] font-normal text-slate-500">mm</span>
                </>
              ) : (
                <span className="text-slate-400 font-normal italic text-sm">No data</span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Past 24h Rain & Next 24h Forecast</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80">
            <div className="text-[10px] text-rose-800 font-semibold uppercase">Landslide I-D Exceedance</div>
            {palikaWeather.landslideHazard ? (
              <div className={`text-sm font-extrabold mt-1 font-mono inline-flex items-center px-2 py-0.5 rounded ${
                palikaWeather.landslideHazard === 'Alert' ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse' :
                palikaWeather.landslideHazard === 'Moderate' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {palikaWeather.landslideHazard} {palikaWeather.landslideExceedanceRatio != null ? `(${palikaWeather.landslideExceedanceRatio}x Ratio)` : ''}
              </div>
            ) : (
              <div className="text-slate-400 font-normal italic text-sm mt-1">No data</div>
            )}
            <div className="text-[9px] text-slate-500 mt-1">Palpa I-D Curve (I = 58.67·D⁻⁰·⁸⁴)</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80">
            <div className="text-[10px] text-rose-800 font-semibold uppercase">Fire Weather Dryness Heuristic</div>
            {palikaWeather.fireWeatherHeuristic ? (
              <div className={`text-sm font-extrabold mt-1 font-mono inline-flex items-center px-2 py-0.5 rounded ${
                palikaWeather.fireWeatherHeuristic === 'Extreme' ? 'bg-rose-200 text-rose-900 border border-rose-400 animate-pulse' :
                palikaWeather.fireWeatherHeuristic === 'High' ? 'bg-orange-100 text-orange-900 border border-orange-300' :
                palikaWeather.fireWeatherHeuristic === 'Moderate' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {palikaWeather.fireWeatherHeuristic} Rating
              </div>
            ) : (
              <div className="text-slate-400 font-normal italic text-sm mt-1">No data</div>
            )}
            <div className="text-[9px] text-slate-500 mt-1">VPD + Soil Moisture + Wind Heuristic</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80">
            <div className="text-[10px] text-rose-800 font-semibold uppercase">Terrain Advisory</div>
            <div className="text-xs font-bold text-slate-800 mt-1 font-mono">
              {palikaWeather.landslideHazard != null ? (
                palikaWeather.landslideHazard === 'Alert' ? '⚠️ High Slope Inflow Precaution' : '✅ Normal Slope Condition'
              ) : (
                <span className="text-slate-400 font-normal italic">No data</span>
              )}
            </div>
            <div className="text-[9px] text-slate-500 mt-1">{activePalika.name} Slope Monitoring</div>
          </div>
        </div>
      )}

      {/* Tab 5: Micro-Atmosphere */}
      {satConsoleTab === 'atmosphere' && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs animate-fade-in">
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
            <div className="text-[10px] text-indigo-800 font-semibold uppercase">Surface Pressure</div>
            <div className="text-lg font-extrabold text-indigo-950 font-mono mt-0.5">
              {palikaWeather.surfacePressure != null ? (
                <>
                  {palikaWeather.surfacePressure} <span className="text-[10px] font-normal text-slate-500">hPa</span>
                </>
              ) : (
                <span className="text-slate-400 font-normal italic text-sm">No data</span>
              )}
            </div>
            <div className="text-[10px] text-indigo-700 font-mono mt-0.5">
              {activePalika.elevation != null ? `${activePalika.elevation}m ASL Barometric Level` : 'Barometric Level'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
            <div className="text-[10px] text-indigo-800 font-semibold uppercase">Diurnal Temperature</div>
            <div className="text-lg font-extrabold text-amber-800 font-mono mt-0.5">
              {palikaWeather.temperature != null ? (
                <>
                  {palikaWeather.temperature}°C{' '}
                  <span className="text-[10px] font-normal text-slate-500">
                    {palikaWeather.apparentTemp != null ? `(Feels ${palikaWeather.apparentTemp}°)` : ''}
                  </span>
                </>
              ) : (
                <span className="text-slate-400 font-normal italic text-sm">No data</span>
              )}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">Live Ambient Telemetry</div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
            <div className="text-[10px] text-indigo-800 font-semibold uppercase">Wind Speed & Flow</div>
            <div className="text-lg font-extrabold text-teal-800 font-mono mt-0.5">
              {palikaWeather.windSpeed != null ? (
                <>
                  {palikaWeather.windSpeed} <span className="text-[10px] font-normal text-slate-500">m/s</span>
                </>
              ) : (
                <span className="text-slate-400 font-normal italic text-sm">No data</span>
              )}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">Surface Wind Speed (10m)</div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
            <div className="text-[10px] text-indigo-800 font-semibold uppercase">Cloud Cover & Attenuation</div>
            <div className="text-lg font-extrabold text-indigo-900 font-mono mt-0.5">
              {palikaWeather.cloudCover != null ? `${palikaWeather.cloudCover}%` : <span className="text-slate-400 font-normal italic text-sm">No data</span>}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">Satellite Cloud Attenuation</div>
          </div>
        </div>
      )}
    </div>
  );
};
