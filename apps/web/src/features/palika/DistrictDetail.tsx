// [DATA PROVENANCE]
// Data Source: data/real/municipal/palika_profiles.json, data/calculated/indicators/gulmi_palika_agro_hydrology.json
// Classification: SCIENTIFIC EVIDENCE & DECISION SUPPORT (MoALD, NARC, CHIRPS v2.0, FAO-56 Penman-Monteith)
// Citations: Ministry of Agriculture and Livestock Development (MoALD); NARC Soil Science; Funk et al. (2015); Allen et al. (1998)

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { db } from '@wefes/database';
import { Crop, District } from '@wefes/shared-types';
import { arimaForecast, extractAnnualRainfallSeries } from '@wefes/wefes-engine';

import { ROUTES } from '../../routes/paths';
import { useNexusStore } from '../../store';
import { DistrictDetailMap } from '../map/DistrictDetailMap';

import { IndicatorModal, ModalKey } from './components/IndicatorModal';
import { PalikaAgroHydrologyCalendar } from './components/PalikaAgroHydrologyCalendar';
import { PalikaCropSuitabilityGrid } from './components/PalikaCropSuitabilityGrid';
import { PalikaHeroHeader } from './components/PalikaHeroHeader';

import { DISTRICT_PALIKAS, DistrictPalika } from '@/data/districtPalikaAssets';

export const DistrictDetail: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { palikaName: urlPalikaParam } = useParams<{ palikaName?: string }>();

  // --- Zustand Nexus Store Integrations ---
  const storeDistrict = useNexusStore((s) => s.selectedDistrict);
  const storePalikaName = useNexusStore((s) => s.selectedPalikaName);
  const setStorePalikaName = useNexusStore((s) => s.setSelectedPalikaName);
  const selectedMapCropId = useNexusStore((s) => s.selectedMapCropId);
  const openAnalysisModal = useNexusStore((s) => s.openAnalysisModal);
  const climateDataset = useNexusStore((s) => s.climateDataset);
  const fetchClimateDataset = useNexusStore((s) => s.fetchClimateDataset);

  // Resolved District (Store > Database Fallback)
  const district: District = useMemo(
    () => storeDistrict || db.getDistrictById('gulmi') || ({} as District),
    [storeDistrict]
  );

  // URL param takes precedence on mount/route change, fallback to store or Resunga
  const activePalikaName = useMemo(() => {
    if (urlPalikaParam) return decodeURIComponent(urlPalikaParam);
    return storePalikaName || 'Resunga';
  }, [urlPalikaParam, storePalikaName]);

  // Synchronize store when URL palika changes
  useEffect(() => {
    if (urlPalikaParam) {
      const decoded = decodeURIComponent(urlPalikaParam);
      if (decoded !== storePalikaName) {
        setStorePalikaName(decoded);
      }
    }
  }, [urlPalikaParam, storePalikaName, setStorePalikaName]);

  const handleSelectPalika = useCallback(
    (pName: string) => {
      setStorePalikaName(pName);
      navigate(`/palikas/${encodeURIComponent(pName)}`);
    },
    [navigate, setStorePalikaName]
  );

  const handleBackToMap = useCallback(() => {
    navigate(ROUTES.MAP);
  }, [navigate]);

  const gulmiPalikas = DISTRICT_PALIKAS['gulmi'] || [];
  const activePalika: DistrictPalika =
    gulmiPalikas.find((p) => p.name.toLowerCase() === activePalikaName.toLowerCase()) ||
    gulmiPalikas[0] ||
    ({} as DistrictPalika);

  const palikaContext = useMemo(
    () => ({
      name: activePalika.name,
      elevation: activePalika.elevation,
      avgTempC: activePalika.avgTempC,
      rainfallMm: activePalika.rainfallMm,
      soilPh: activePalika.soilPh,
    }),
    [activePalika.name, activePalika.elevation, activePalika.avgTempC, activePalika.rainfallMm, activePalika.soilPh]
  );

  const displayedDistrictCrops = useMemo(
    () => (district.id ? db.getDistrictCrops(district.id, palikaContext) : []),
    [district.id, palikaContext]
  );

  const [activeHoverCrop, setActiveHoverCrop] = useState<Crop | null>(displayedDistrictCrops[0]?.crop || null);

  useEffect(() => {
    if (!climateDataset) {
      fetchClimateDataset();
    }
  }, [climateDataset, fetchClimateDataset]);

  const [openModal, setOpenModal] = useState<ModalKey>(null);

  useEffect(() => {
    if (displayedDistrictCrops && displayedDistrictCrops.length > 0) {
      const exists = displayedDistrictCrops.some((c) => c.crop.id === activeHoverCrop?.id);
      if (!exists) {
        const cropFromStore = selectedMapCropId
          ? displayedDistrictCrops.find((c) => c.crop.id === selectedMapCropId)?.crop
          : null;
        setActiveHoverCrop(cropFromStore || displayedDistrictCrops[0].crop);
      }
    }
  }, [displayedDistrictCrops, activeHoverCrop, selectedMapCropId]);

  const handleSelectCrop = useCallback(
    (crop: Crop) => {
      openAnalysisModal(crop);
    },
    [openAnalysisModal]
  );

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
          activePalika={activePalika}
          gulmiPalikas={gulmiPalikas}
          onSelectPalika={handleSelectPalika}
          onBackToMap={handleBackToMap}
        />

        <PalikaAgroHydrologyCalendar
          activePalika={activePalika}
          climateDataset={climateDataset}
          onOpenSoilModal={() => setOpenModal('soil')}
        />
      </div>

      {/* Interactive Palika Spatial Map */}
      <DistrictDetailMap
        district={district}
        selectedPalikaName={activePalika.name}
        distClimatology={distClimatology}
        rainfallARIMA={rainfallARIMA}
      />

      {/* Crop Suitability & Telemetry Grid */}
      <PalikaCropSuitabilityGrid
        district={district}
        activePalika={activePalika}
        displayedDistrictCrops={displayedDistrictCrops}
        activeHoverCrop={activeHoverCrop}
        setActiveHoverCrop={setActiveHoverCrop}
        activeSuitability={activeSuitability}
        radarData={radarData}
        onSelectCrop={handleSelectCrop}
      />

      {/* Bottom Quick Navigation */}
      <div className="flex items-center justify-between p-4 bg-slate-50/90 rounded-2xl border border-slate-200">
        <button
          onClick={handleBackToMap}
          className="text-xs text-slate-800 hover:text-slate-950 font-bold flex items-center gap-1.5 transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>{t('common.back_to_map_interactive')}</span>
        </button>
      </div>
    </div>
  );
};
