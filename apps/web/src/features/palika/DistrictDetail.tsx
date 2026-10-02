// [DATA PROVENANCE]
// Data Source: data/real/municipal/palika_profiles.json, data/calculated/indicators/gulmi_palika_agro_hydrology.json
// Classification: SCIENTIFIC EVIDENCE & DECISION SUPPORT (MoALD, NARC, CHIRPS v2.0, FAO-56 Penman-Monteith)
// Citations: Ministry of Agriculture and Livestock Development (MoALD); NARC Soil Science; Funk et al. (2015); Allen et al. (1998)

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ArrowLeft, ArrowUp, CloudRain, Mountain, Sparkles, Thermometer } from 'lucide-react';

import { db } from '@wefes/database';
import { ClimateDataset, Crop, District } from '@wefes/shared-types';
import { arimaForecast, extractAnnualRainfallSeries } from '@wefes/wefes-engine';

import { PALIKA_AGRO_HYDROLOGY_DATA } from '../../data/districtIndicatorAssets';
import { DISTRICT_PALIKAS, DistrictPalika } from '../../data/districtPalikaAssets';
import { fetchGeoJson } from '../../services/dataClient';
import { DistrictDetailMap } from '../map/DistrictDetailMap';

import { IndicatorModal, ModalKey } from './components/IndicatorModal';
import { PalikaAgroHydrologyCalendar } from './components/PalikaAgroHydrologyCalendar';
import { PalikaCropSuitabilityGrid } from './components/PalikaCropSuitabilityGrid';
import { PalikaHeroHeader } from './components/PalikaHeroHeader';
import { PalikaIndicatorsGrid } from './components/PalikaIndicatorsGrid';
import { PalikaSeasonalRotationsCard } from './components/PalikaSeasonalRotationsCard';
import { PalikaBenchmarkingWidget } from './PalikaBenchmarkingWidget';

export interface DistrictDetailProps {
  district: District;
  initialPalikaName?: string;
  onSelectPalika?: (palikaName: string) => void;
  onSelectCrop: (crop: Crop) => void;
  onBackToMap: () => void;
  climateDataset?: ClimateDataset | null;
}

export const DistrictDetail: React.FC<DistrictDetailProps> = ({
  district,
  initialPalikaName,
  onSelectPalika,
  onSelectCrop,
  onBackToMap,
  climateDataset: initialClimateDataset,
}) => {
  const [cropSpectrumMode, setCropSpectrumMode] = useState<'verified' | 'all'>('verified');

  const verifiedDistrictCrops = useMemo(() => db.getDistrictCrops(district.id), [district.id]);
  const allDistrictCrops = useMemo(() => db.getAllDistrictCrops(district.id), [district.id]);
  const displayedDistrictCrops = cropSpectrumMode === 'verified' ? verifiedDistrictCrops : allDistrictCrops;

  const [activeHoverCrop, setActiveHoverCrop] = useState<Crop | null>(displayedDistrictCrops[0]?.crop || null);
  const [climateDataset, setClimateDataset] = useState<ClimateDataset | null>(initialClimateDataset || null);
  const [openModal, setOpenModal] = useState<ModalKey>(null);
  const [activePalikaName, setActivePalikaNameState] = useState<string>(initialPalikaName || 'Resunga');

  const setActivePalikaName = useCallback(
    (pName: string) => {
      setActivePalikaNameState(pName);
      if (onSelectPalika) onSelectPalika(pName);
    },
    [onSelectPalika]
  );

  useEffect(() => {
    if (initialClimateDataset) {
      setClimateDataset(initialClimateDataset);
      return;
    }
    fetchGeoJson<ClimateDataset>('gulmi-climate-monthly.json')
      .then((data) => setClimateDataset(data))
      .catch(() => null);
  }, [initialClimateDataset]);

  useEffect(() => {
    if (displayedDistrictCrops && displayedDistrictCrops.length > 0) {
      setActiveHoverCrop(displayedDistrictCrops[0].crop);
    }
  }, [displayedDistrictCrops]);

  useEffect(() => {
    if (initialPalikaName) {
      setActivePalikaName(initialPalikaName);
    }
  }, [initialPalikaName, setActivePalikaName]);

  const gulmiPalikas = DISTRICT_PALIKAS['gulmi'] || [];
  const activePalika: DistrictPalika =
    gulmiPalikas.find((p) => p.name.toLowerCase() === activePalikaName.toLowerCase()) ||
    gulmiPalikas[0] ||
    ({} as DistrictPalika);

  const activeSuitability =
    displayedDistrictCrops.find((c) => c.crop.id === activeHoverCrop?.id)?.suitability ||
    displayedDistrictCrops[0]?.suitability;

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

  // Canonical agro-hydrology normal from CHIRPS 30-year dataset (Funk et al., 2015)
  const agroProfile = PALIKA_AGRO_HYDROLOGY_DATA.palikas[activePalika.name];
  const canonicalRainfall =
    agroProfile?.annual_summary?.precipitation_wmo_normal_mm ?? activePalika.rainfallMm ?? cardRainfallValue;

  const hasRealSoil =
    district.hasRealSoilData !== false && (district.soilSampleCount || 0) > 0 && district.baseSoilPh !== undefined;

  const indicators = [
    {
      key: 'rainfall' as ModalKey,
      icon: <CloudRain className="w-5 h-5 text-sky-600" />,
      label: 'Local Precipitation',
      value: `${canonicalRainfall} mm/yr`,
      badge: '30-Yr WMO Normal (CHIRPS)',
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

      {/* Top Header Card */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-slate-200 shadow-sm bg-white/95 space-y-5">
        <PalikaHeroHeader
          district={district}
          activePalika={activePalika}
          gulmiPalikas={gulmiPalikas}
          onSelectPalika={setActivePalikaName}
          onBackToMap={onBackToMap}
        />

        <PalikaAgroHydrologyCalendar activePalika={activePalika} climateDataset={climateDataset} />

        <PalikaIndicatorsGrid activePalika={activePalika} indicators={indicators} onOpenModal={setOpenModal} />

        <PalikaSeasonalRotationsCard activePalika={activePalika} onSelectCrop={onSelectCrop} />

        <PalikaBenchmarkingWidget currentPalika={activePalika} />
      </div>

      {/* Interactive Palika Spatial Map */}
      <DistrictDetailMap
        district={district}
        selectedPalikaName={activePalika.name}
        onSelectPalika={setActivePalikaName}
        distClimatology={distClimatology}
        rainfallARIMA={rainfallARIMA}
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
