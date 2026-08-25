import React from 'react';
import { District } from '@wefes/shared-types';
import { DistrictPalika } from '../../../data/districtPalikaAssets';
import { PalikaLiveWeather } from './PalikaWeatherConsole';
import {
  ArrowLeft, FileText, CloudRain, Thermometer, Droplets, Wind, Sun, Cloud
} from 'lucide-react';

interface PalikaHeroHeaderProps {
  district: District;
  activePalika: DistrictPalika;
  gulmiPalikas: DistrictPalika[];
  onSelectPalika: (name: string) => void;
  onBackToMap: () => void;
  onOpenDossierModal: () => void;
  weatherTelemetryMode: 'live' | 'archive';
  setWeatherTelemetryMode: React.Dispatch<React.SetStateAction<'live' | 'archive'>>;
  palikaWeather: PalikaLiveWeather | null;
  GULMI_PALIKA_NEPALI: Record<string, string>;
}

export const PalikaHeroHeader: React.FC<PalikaHeroHeaderProps> = ({
  district,
  activePalika,
  gulmiPalikas,
  onSelectPalika,
  onBackToMap,
  onOpenDossierModal,
  weatherTelemetryMode,
  setWeatherTelemetryMode,
  palikaWeather,
  GULMI_PALIKA_NEPALI,
}) => {
  return (
    <div className="space-y-5">
      {/* Navigation & Action Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToMap}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2 font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            ← Back to Gulmi Spatial Map
          </button>
          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-outfit">
              {activePalika.name} {activePalika.unitType}
            </h2>
            {GULMI_PALIKA_NEPALI[activePalika.name] && (
              <span className="text-lg font-serif text-slate-600 font-semibold">
                ({GULMI_PALIKA_NEPALI[activePalika.name]} {activePalika.unitType === 'Nagarpalika' ? 'नगरपालिका' : 'गाउँपालिका'})
              </span>
            )}
            <span className="text-xs px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              Gulmi District • {activePalika.unitType}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-normal leading-relaxed">
            Precision Agro-Ecological Dossier and 4-Season Cropping Calendar for <strong>{activePalika.name}</strong> ({activePalika.elevation}m ASL, {activePalika.rainfallMm} mm/yr). Parameterized from NARC ground soil surveys and NASA/MERRA-2 micro-climatology.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center">
          <button
            onClick={onOpenDossierModal}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Export Municipal Brief</span>
          </button>
        </div>
      </div>

      {/* 12-Palika Quick-Switch Carousel Ribbon */}
      <div className="pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-outfit flex items-center gap-1.5">
            <span>🏛️ Switch Palika ({gulmiPalikas.length} Local Bodies in Gulmi):</span>
          </span>
          <span className="text-[10px] text-slate-400 italic">Click to switch dossier</span>
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
                  ({GULMI_PALIKA_NEPALI[p.name] || ''})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Satellite Weather Telemetry for Active Palika */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-2.5 rounded-2xl bg-white/95 text-slate-800 shadow-xs border border-slate-200/90 text-xs animate-fade-in glass-panel">
        <div className="flex items-center gap-2 flex-wrap">
          {weatherTelemetryMode === 'live' && palikaWeather ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-900 font-outfit uppercase tracking-wider text-[11px]">
                Live Satellite Weather Telemetry ({activePalika.name} Micro-Climate)
              </span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
                Real-Time Today
              </span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="font-bold text-slate-900 font-outfit uppercase tracking-wider text-[11px]">
                NASA POWER / MERRA-2 39-Yr Climatology ({activePalika.name} Baseline)
              </span>
              <span className="bg-sky-50 text-sky-800 border border-sky-300 text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
                Historical
              </span>
            </>
          )}

          {palikaWeather && (
            <button
              onClick={() => setWeatherTelemetryMode(prev => (prev === 'live' ? 'archive' : 'live'))}
              className="ml-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer transition-colors"
            >
              {weatherTelemetryMode === 'live' ? '⇄ 39-Yr Archive' : '⇄ 🟢 Live Weather'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3.5 sm:gap-4 flex-wrap text-[11px] font-mono">
          {weatherTelemetryMode === 'live' && palikaWeather ? (
            <>
              <div className="flex items-center gap-1.5" title="Live Precipitation Rate">
                <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-slate-500">Rain:</span>
                <strong className="text-sky-900 font-bold">{palikaWeather.precipitation} mm/hr</strong>
              </div>

              <div className="flex items-center gap-1.5" title="Live Ambient Air Temperature">
                <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-slate-500">Temp:</span>
                <strong className="text-amber-900 font-bold">{palikaWeather.temperature}°C</strong>
                <span className="text-[10px] text-slate-500">(Feels {palikaWeather.apparentTemp}°)</span>
              </div>

              <div className="flex items-center gap-1.5" title="Live Relative Humidity">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-slate-500">Humidity:</span>
                <strong className="text-blue-900 font-bold">{palikaWeather.humidity}%</strong>
              </div>

              <div className="flex items-center gap-1.5" title="Live Surface Wind Speed">
                <Wind className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-slate-500">Wind:</span>
                <strong className="text-teal-900 font-bold">{palikaWeather.windSpeed} m/s</strong>
              </div>

              <div className="flex items-center gap-1.5" title="Live Direct Solar Flux">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-slate-500">Solar:</span>
                <strong className="text-amber-900 font-bold">{palikaWeather.solarRadiation} W/m²</strong>
              </div>

              <div className="flex items-center gap-1.5" title="Live Cloud Cover">
                <Cloud className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-slate-500">Clouds:</span>
                <strong className="text-indigo-900 font-bold">{palikaWeather.cloudCover}%</strong>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-slate-500">Annual Rain:</span>
                <strong className="text-sky-900 font-bold">{activePalika.rainfallMm} mm/yr</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-slate-500">Mean Temp:</span>
                <strong className="text-amber-900 font-bold">{activePalika.avgTempC || 17.8}°C</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-slate-500">Insolation:</span>
                <strong className="text-amber-900 font-bold">{district.solarRadiationKwh || 5.2} kWh/m²/d</strong>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
