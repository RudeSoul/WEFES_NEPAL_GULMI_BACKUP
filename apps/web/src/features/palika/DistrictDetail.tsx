import React, { useState, useEffect, useMemo } from 'react';
import { District, Crop } from '@wefes/shared-types';
import { db } from '@wefes/database';
import { DISTRICT_PALIKAS, PALIKA_GEO_CENTROIDS, DistrictPalika } from '../../data/districtPalikaAssets';
import { extractAnnualRainfallSeries, arimaForecast } from '@wefes/wefes-engine';
import { CloudRain, Mountain, Sparkles, Thermometer, ArrowLeft, ArrowUp } from 'lucide-react';
import { PalikaBenchmarkingWidget } from './PalikaBenchmarkingWidget';
import { PalikaDossierExportModal } from './PalikaDossierExportModal';
import { DistrictDetailMap } from '../map/DistrictDetailMap';
import { IndicatorModal, ModalKey } from './components/IndicatorModal';
import { PalikaLiveWeather, PalikaWeatherConsole } from './components/PalikaWeatherConsole';
import { PalikaHeroHeader } from './components/PalikaHeroHeader';
import { PalikaIndicatorsGrid } from './components/PalikaIndicatorsGrid';
import { PalikaSeasonalRotationsCard } from './components/PalikaSeasonalRotationsCard';
import { PalikaCropSuitabilityGrid } from './components/PalikaCropSuitabilityGrid';

export interface DistrictDetailProps {
  district: District;
  initialPalikaName?: string;
  onSelectCrop: (crop: Crop) => void;
  onBackToMap: () => void;
  climateDataset?: any;
}

const GULMI_PALIKA_NEPALI: Record<string, string> = {
  Resunga: 'रेसुङ्गा',
  Musikot: 'मुसिकोट',
  Ruru: 'रुरुक्षेत्र',
  Satyawati: 'सत्यवती',
  Kaligandaki: 'कालीगण्डकी',
  Chandrakot: 'चन्द्रकोट',
  Chatrakot: 'छत्रकोट',
  Gulmidarbar: 'गुल्मीदरबार',
  Dhurkot: 'धुर्कोट',
  Isma: 'इस्मा',
  Malika: 'मालिका',
  Madane: 'मदाने',
};

export const DistrictDetail: React.FC<DistrictDetailProps> = ({
  district,
  initialPalikaName,
  onSelectCrop,
  onBackToMap,
  climateDataset: initialClimateDataset,
}) => {
  const [cropSpectrumMode, setCropSpectrumMode] = useState<'verified' | 'all'>('verified');

  const verifiedDistrictCrops = useMemo(() => db.getDistrictCrops(district.id), [district.id]);
  const allDistrictCrops = useMemo(() => db.getAllDistrictCrops(district.id), [district.id]);
  const displayedDistrictCrops = cropSpectrumMode === 'verified' ? verifiedDistrictCrops : allDistrictCrops;

  const [activeHoverCrop, setActiveHoverCrop] = useState<Crop | null>(displayedDistrictCrops[0]?.crop || null);
  const [climateDataset, setClimateDataset] = useState<any>(initialClimateDataset || null);
  const [openModal, setOpenModal] = useState<ModalKey>(null);
  const [activePalikaName, setActivePalikaName] = useState<string>(initialPalikaName || 'Resunga');
  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(false);
  const [palikaWeather, setPalikaWeather] = useState<PalikaLiveWeather | null>(null);
  const [weatherTelemetryMode, setWeatherTelemetryMode] = useState<'live' | 'archive'>('live');

  useEffect(() => {
    if (initialClimateDataset) {
      setClimateDataset(initialClimateDataset);
      return;
    }
    fetch('/geojson/gulmi-climate-monthly.json')
      .then(res => res.json())
      .then(data => setClimateDataset(data))
      .catch(() => null);
  }, [initialClimateDataset]);

  useEffect(() => {
    if (displayedDistrictCrops && displayedDistrictCrops.length > 0) {
      setActiveHoverCrop(displayedDistrictCrops[0].crop);
    }
  }, [district.id, cropSpectrumMode]);

  useEffect(() => {
    if (initialPalikaName) {
      setActivePalikaName(initialPalikaName);
    }
  }, [initialPalikaName]);

  const gulmiPalikas = DISTRICT_PALIKAS['gulmi'] || [];
  const activePalika: DistrictPalika =
    gulmiPalikas.find(p => p.name.toLowerCase() === activePalikaName.toLowerCase()) || gulmiPalikas[0] || ({} as DistrictPalika);

  const activeSuitability =
    displayedDistrictCrops.find((c: any) => c.crop.id === activeHoverCrop?.id)?.suitability || displayedDistrictCrops[0]?.suitability;

  const radarData = activeSuitability
    ? [
        { pillar: 'Water', score: activeSuitability.pillarScores.water, fullMark: 100 },
        { pillar: 'Energy', score: activeSuitability.pillarScores.energy, fullMark: 100 },
        { pillar: 'Food', score: activeSuitability.pillarScores.food, fullMark: 100 },
        { pillar: 'Ecosystem', score: activeSuitability.pillarScores.ecosystem, fullMark: 100 },
        { pillar: 'Socioeconomics', score: activeSuitability.pillarScores.socioeconomics, fullMark: 100 },
      ]
    : [];

  const distClimatology = climateDataset?.climatologyMap?.[district.id];

  const { values: rainfallSeries, startYear: rfStartYear } = extractAnnualRainfallSeries(
    climateDataset?.climateMap ?? {},
    district.id
  );
  const hasRainfallSeries = rainfallSeries.length >= 8;
  const rainfallARIMA = hasRainfallSeries ? arimaForecast(rainfallSeries, rfStartYear, 10) : null;

  const arimaForecastValue = rainfallARIMA ? Math.round(rainfallARIMA.forecasts[4]) : null;
  const cardRainfallValue = arimaForecastValue ?? (district.avgRainfallMm || 0);

  // Live weather telemetry
  useEffect(() => {
    const coords = PALIKA_GEO_CENTROIDS[activePalika.name] || { lat: 28.068, lng: 83.248 };

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,wind_speed_10m,direct_radiation,cloud_cover,surface_pressure,et0_fao_evapotranspiration,vapour_pressure_deficit,soil_moisture_0_to_7cm,soil_moisture_7_to_28cm,uv_index,is_day&hourly=precipitation&forecast_days=3&timezone=Asia%2FKathmandu`
    )
      .then(res => res.json())
      .then(data => {
        if (data && data.current) {
          const c = data.current;
          const topsoil = c.soil_moisture_0_to_7cm ?? 0.35;
          const deepSoil = c.soil_moisture_7_to_28cm ?? 0.38;
          const vpdVal = c.vapour_pressure_deficit ?? 0.65;
          const rh = Math.round(c.relative_humidity_2m);
          const temp = Number(c.temperature_2m.toFixed(1));
          const wind = Number((c.wind_speed_10m / 3.6).toFixed(1));
          const solar = Math.round(c.direct_radiation || 0);

          const hourlyRain: number[] = data.hourly?.precipitation || [];
          const totalInflow72h = Number(hourlyRain.slice(0, 72).reduce((sum, v) => sum + (v || 0), 0).toFixed(1));
          const soilSat = Math.min(100, Math.round((topsoil / 0.55) * 100));

          const fungalStatus: 'Low' | 'Moderate' | 'High' =
            rh > 85 && vpdVal < 0.4 && temp > 15 ? 'High' : rh > 72 || vpdVal < 0.6 ? 'Moderate' : 'Low';
          const solarPumpScore = Math.min(100, Math.round((solar / 750) * 100));
          const fireIndex: 'Low' | 'Moderate' | 'High' | 'Extreme' =
            topsoil < 0.2 && vpdVal > 1.3 && wind > 3.5
              ? 'Extreme'
              : topsoil < 0.26 && vpdVal > 0.9
              ? 'High'
              : topsoil < 0.32
              ? 'Moderate'
              : 'Low';
          const landslideAlert: 'Low' | 'Moderate' | 'Alert' =
            totalInflow72h > 120 || (c.precipitation > 15 && soilSat > 82)
              ? 'Alert'
              : totalInflow72h > 60 || soilSat > 75
              ? 'Moderate'
              : 'Low';

          setPalikaWeather({
            temperature: temp,
            apparentTemp: Number(c.apparent_temperature.toFixed(1)),
            humidity: rh,
            precipitation: Number(c.precipitation.toFixed(1)),
            windSpeed: wind,
            solarRadiation: solar,
            cloudCover: Math.round(c.cloud_cover || 0),
            surfacePressure: Number((c.surface_pressure || 830).toFixed(1)),
            et0: Number((c.et0_fao_evapotranspiration || 0).toFixed(2)),
            vpd: Number(vpdVal.toFixed(2)),
            topsoilMoisture: Number(topsoil.toFixed(3)),
            deepSoilMoisture: Number(deepSoil.toFixed(3)),
            uvIndex: Number((c.uv_index || 0).toFixed(1)),
            isDay: c.is_day === 1,
            time: c.time,
            soilMoisturePct: soilSat,
            fungalRisk: fungalStatus,
            solarPumpingScore: solarPumpScore,
            fireDangerRating: fireIndex,
            landslideHazard: landslideAlert,
            hourlyInflow72h: totalInflow72h,
          });
        }
      })
      .catch(() => null);
  }, [activePalika.name]);

  const hasRealSoil = district.hasRealSoilData !== false && (district.soilSampleCount || 0) > 0 && district.baseSoilPh !== undefined;

  const indicators = [
    {
      key: 'rainfall' as ModalKey,
      icon: <CloudRain className="w-5 h-5 text-sky-600" />,
      label: 'Local Precipitation',
      value: activePalika.rainfallMm ? `${activePalika.rainfallMm} mm/yr` : `${cardRainfallValue} mm/yr`,
      badge: 'Elevation Adjusted',
      cardBg: 'bg-sky-50/70 border-sky-200/90 hover:border-sky-300 hover:bg-sky-50 cursor-pointer',
      iconBg: 'bg-sky-100 border-sky-200',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
      badgeDot: 'bg-sky-500',
    },
    {
      key: 'elevation' as ModalKey,
      icon: <Mountain className="w-5 h-5 text-amber-600" />,
      label: 'Mean Elevation',
      value: activePalika.elevation ? `${activePalika.elevation}m ASL` : `${district.elevationRange}m`,
      badge: 'Mid-Hills Belt',
      cardBg: 'bg-amber-50/70 border-amber-200/90 hover:border-amber-300 hover:bg-amber-50 cursor-pointer',
      iconBg: 'bg-amber-100 border-amber-200',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      badgeDot: 'bg-amber-500',
    },
    {
      key: 'soil' as ModalKey,
      icon: <Sparkles className="w-5 h-5 text-emerald-600" />,
      label: 'Soil Benchmark',
      value: activePalika.soilPh ? `pH ${activePalika.soilPh}` : hasRealSoil ? `pH ${district.baseSoilPh}` : 'No Data',
      badge: 'NARC Ground Grid',
      cardBg: 'bg-emerald-50/70 border-emerald-200/90 hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer',
      iconBg: 'bg-emerald-100 border-emerald-200',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      badgeDot: 'bg-emerald-500',
    },
    {
      key: 'temp' as ModalKey,
      icon: <Thermometer className="w-5 h-5 text-purple-600" />,
      label: 'Local Avg Temp',
      value: activePalika.avgTempC ? `${activePalika.avgTempC}°C` : `${distClimatology?.[7]?.t2m || 17.8}°C`,
      badge: 'Lapse Adjusted',
      cardBg: 'bg-purple-50/70 border-purple-200/90 hover:border-purple-300 hover:bg-purple-50 cursor-pointer',
      iconBg: 'bg-purple-100 border-purple-200',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
      badgeDot: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {openModal && (
        <IndicatorModal
          modalKey={openModal}
          district={district}
          activePalika={activePalika}
          distClimatology={distClimatology}
          climateDataset={climateDataset}
          rainfallSeries={rainfallSeries}
          rainfallARIMA={rainfallARIMA}
          rfStartYear={rfStartYear}
          onClose={() => setOpenModal(null)}
        />
      )}

      {isDossierModalOpen && (
        <PalikaDossierExportModal
          palika={activePalika}
          isOpen={isDossierModalOpen}
          onClose={() => setIsDossierModalOpen(false)}
        />
      )}

      {/* Top Header Card */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-slate-200 shadow-sm bg-white/95 space-y-5">
        <PalikaHeroHeader
          district={district}
          activePalika={activePalika}
          gulmiPalikas={gulmiPalikas}
          onSelectPalika={setActivePalikaName}
          onBackToMap={onBackToMap}
          onOpenDossierModal={() => setIsDossierModalOpen(true)}
          weatherTelemetryMode={weatherTelemetryMode}
          setWeatherTelemetryMode={setWeatherTelemetryMode}
          palikaWeather={palikaWeather}
          GULMI_PALIKA_NEPALI={GULMI_PALIKA_NEPALI}
        />

        <PalikaWeatherConsole
          activePalika={activePalika}
          palikaWeather={palikaWeather}
          weatherTelemetryMode={weatherTelemetryMode}
          PALIKA_GEO_CENTROIDS={PALIKA_GEO_CENTROIDS}
        />

        <PalikaIndicatorsGrid
          activePalika={activePalika}
          indicators={indicators}
          onOpenModal={setOpenModal}
        />

        <PalikaSeasonalRotationsCard
          activePalika={activePalika}
          onSelectCrop={onSelectCrop}
        />

        <PalikaBenchmarkingWidget currentPalika={activePalika} />
      </div>

      {/* Interactive Palika Spatial Map */}
      <DistrictDetailMap
        district={district}
        selectedPalikaName={activePalika.name}
        onSelectPalika={setActivePalikaName}
        distClimatology={distClimatology}
        rainfallARIMA={rainfallARIMA}
        districtCrops={verifiedDistrictCrops}
        onSelectCrop={onSelectCrop}
      />

      {/* Crop Suitability & Telemetry Grid */}
      <PalikaCropSuitabilityGrid
        district={district}
        displayedDistrictCrops={displayedDistrictCrops}
        verifiedDistrictCrops={verifiedDistrictCrops}
        allDistrictCrops={allDistrictCrops}
        cropSpectrumMode={cropSpectrumMode}
        setCropSpectrumMode={setCropSpectrumMode}
        activeHoverCrop={activeHoverCrop}
        setActiveHoverCrop={setActiveHoverCrop}
        activeSuitability={activeSuitability}
        radarData={radarData}
        onSelectCrop={onSelectCrop}
      />

      {/* Bottom Quick Navigation */}
      <div className="flex items-center justify-between p-4 bg-slate-50/90 rounded-2xl border border-slate-200">
        <button
          onClick={onBackToMap}
          className="text-xs text-slate-800 hover:text-slate-950 font-bold flex items-center gap-1.5 transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>Back to National Interactive Map</span>
        </button>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm"
        >
          <ArrowUp className="w-4 h-4 text-slate-500" />
          <span>Scroll to Top</span>
        </button>
      </div>
    </div>
  );
};

export default DistrictDetail;
