// [DATA PROVENANCE]
// Data Source: data/real/municipal/palika_profiles.json, data/calculated/indicators/gulmi_palika_agro_hydrology.json
// Classification: SCIENTIFIC EVIDENCE & DECISION SUPPORT (MoALD, NARC, CHIRPS v2.0, FAO-56 Penman-Monteith)
// Citations: Ministry of Agriculture and Livestock Development (MoALD); NARC Soil Science; Funk et al. (2015); Allen et al. (1998)

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ArrowLeft, ArrowUp } from 'lucide-react';

import { db } from '@wefes/database';
import { ClimateDataset, Crop, District } from '@wefes/shared-types';
import { arimaForecast, extractAnnualRainfallSeries } from '@wefes/wefes-engine';

import { DISTRICT_PALIKAS, DistrictPalika } from '../../data/districtPalikaAssets';
import { fetchGeoJson } from '../../services/dataClient';
import { DistrictDetailMap } from '../map/DistrictDetailMap';

import { IndicatorModal, ModalKey } from './components/IndicatorModal';
import { PalikaAgroHydrologyCalendar } from './components/PalikaAgroHydrologyCalendar';
import { PalikaCropSuitabilityGrid } from './components/PalikaCropSuitabilityGrid';
import { PalikaHeroHeader } from './components/PalikaHeroHeader';
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

        <PalikaAgroHydrologyCalendar
          activePalika={activePalika}
          climateDataset={climateDataset}
          onOpenSoilModal={() => setOpenModal('soil')}
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
