import React from 'react';

import { Building2, CloudRain, Sprout, Trees, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useNexusStore } from '../../store';

export const SubFilterToolbar: React.FC = () => {
  const { t } = useTranslation();
  const selectedPillar = useNexusStore((s) => s.selectedPillar);
  const subFilters = useNexusStore((s) => s.subFilters);
  const setSubFilters = useNexusStore((s) => s.setSubFilters);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSubFilters({ [name]: value });
  };

  const selectClass =
    'bg-white border border-slate-300 text-slate-800 text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-300 cursor-pointer transition-colors hover:border-slate-400 shadow-sm';

  const renderFilters = () => {
    switch (selectedPillar) {
      case 'water':
        return (
          <>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <CloudRain className="w-3.5 h-3.5 text-sky-600" />
              <span>{t('subfilters.water.label')}</span>
            </div>
            <select
              name="waterSubFilter"
              className={selectClass}
              value={subFilters.waterSubFilter || 'merra_rainfall'}
              onChange={handleChange}
            >
              <optgroup label={t('subfilters.water.group_precipitation')}>
                <option value="annual_precipitation">🌧️ {t('subfilters.water.annual_precipitation')}</option>
                <option value="monsoon_precipitation">⛈️ {t('subfilters.water.monsoon_precipitation')}</option>
                <option value="dry_season_precipitation">❄️ {t('subfilters.water.dry_season_precipitation')}</option>
                <option value="merra_rainfall">🌧️ {t('subfilters.water.merra_rainfall')}</option>
                <option value="river_basins">🌊 {t('subfilters.water.river_basins')}</option>
                <option value="dhm_station">💧 {t('subfilters.water.dhm_station')}</option>
              </optgroup>
              <optgroup label={t('subfilters.water.group_hydrosheds')}>
                <option value="catchments">🏔️ {t('subfilters.water.catchments')}</option>
                <option value="rivers_streams">🌊 {t('subfilters.water.rivers_streams')}</option>
                <option value="flow_accumulation">💧 {t('subfilters.water.flow_accumulation')}</option>
                <option value="flow_direction">🧭 {t('subfilters.water.flow_direction')}</option>
              </optgroup>
              <optgroup label={t('subfilters.water.group_terrain')}>
                <option value="spring_vulnerability">🏔️ {t('subfilters.water.spring_vulnerability')}</option>
                <option value="irrigation_potential">🌾 {t('subfilters.water.irrigation_potential')}</option>
              </optgroup>
            </select>
          </>
        );

      case 'food': {
        const foodMode = subFilters.foodMode || 'single_crop';
        return (
          <>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('subfilters.food.label')}</span>
            </div>
            <select name="foodMode" className={selectClass} value={foodMode} onChange={handleChange}>
              <option value="single_crop">🌱 {t('subfilters.food.single_crop')}</option>
              <option value="crop_water_stress">💧 {t('subfilters.food.crop_water_stress')}</option>
              <option value="land_typology">🌾 {t('subfilters.food.land_typology')}</option>
            </select>

            {(foodMode === 'single_crop' || foodMode === 'crop_water_stress') && (
              <select name="crop" className={selectClass} value={subFilters.crop || 'coffee'} onChange={handleChange}>
                <optgroup label={t('subfilters.food.cash_crops_group')}>
                  <option value="coffee">☕ {t('subfilters.food.crops.coffee')}</option>
                  <option value="large_cardamom">🌿 {t('subfilters.food.crops.large_cardamom')}</option>
                  <option value="tomato">🍅 {t('subfilters.food.crops.tomato')}</option>
                  <option value="apple">🍎 {t('subfilters.food.crops.apple')}</option>
                </optgroup>
                <optgroup label={t('subfilters.food.cereals_group')}>
                  <option value="maize">🌽 {t('subfilters.food.crops.maize')}</option>
                  <option value="rice">🌾 {t('subfilters.food.crops.rice')}</option>
                  <option value="wheat">🌾 {t('subfilters.food.crops.wheat')}</option>
                  <option value="finger_millet">🌾 {t('subfilters.food.crops.finger_millet')}</option>
                </optgroup>
              </select>
            )}

            {foodMode === 'crop_water_stress' && (
              <select
                name="waterSeason"
                className={selectClass}
                value={subFilters.waterSeason || 'cycle'}
                onChange={handleChange}
                title={t('subfilters.food.select_period_title')}
              >
                <option value="cycle">🌱 {t('subfilters.food.seasons.cycle')}</option>
                <option value="winter_dry">❄️ {t('subfilters.food.seasons.winter_dry')}</option>
                <option value="pre_monsoon">☀️ {t('subfilters.food.seasons.pre_monsoon')}</option>
                <option value="monsoon_wet">🌊 {t('subfilters.food.seasons.monsoon_wet')}</option>
              </select>
            )}

            {foodMode === 'land_typology' && (
              <select
                name="landMetric"
                className={selectClass}
                value={subFilters.landMetric || 'khet_pct'}
                onChange={handleChange}
              >
                <option value="khet_pct">🌊 {t('subfilters.food.land_metrics.khet_pct')}</option>
                <option value="bari_pct">⛰️ {t('subfilters.food.land_metrics.bari_pct')}</option>
                <option value="parcel_density">🧩 {t('subfilters.food.land_metrics.parcel_density')}</option>
              </select>
            )}
          </>
        );
      }

      case 'ecosystem':
        return (
          <>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <Trees className="w-3.5 h-3.5 text-teal-600" />
              <span>{t('subfilters.ecosystem.label')}</span>
            </div>
            <select
              name="ecoSubFilter"
              className={selectClass}
              value={subFilters.ecoSubFilter || 'soil_ph'}
              onChange={handleChange}
            >
              <optgroup label={t('subfilters.ecosystem.group_soil')}>
                <option value="soil_ph">🧪 {t('subfilters.ecosystem.soil_ph')}</option>
                <option value="soil_nitrogen">🌱 {t('subfilters.ecosystem.soil_nitrogen')}</option>
                <option value="soil_phosphorus">🌱 {t('subfilters.ecosystem.soil_phosphorus')}</option>
                <option value="soil_potassium">🌱 {t('subfilters.ecosystem.soil_potassium')}</option>
              </optgroup>
              <optgroup label={t('subfilters.ecosystem.group_topography')}>
                <option value="elevation_zones">🏔️ {t('subfilters.ecosystem.elevation_zones')}</option>
                <option value="agroforestry_belt">🌲 {t('subfilters.ecosystem.agroforestry_belt')}</option>
              </optgroup>
            </select>
          </>
        );

      case 'energy':
        return (
          <>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('subfilters.energy.label')}</span>
            </div>
            <select
              name="energySubFilter"
              className={selectClass}
              value={subFilters.energySubFilter || 'hydro_corridor'}
              onChange={handleChange}
            >
              <option value="hydro_corridor">⚡ {t('subfilters.energy.hydro_corridor')}</option>
              <option value="solar_irradiance">☀️ {t('subfilters.energy.solar_irradiance')}</option>
              <option value="clean_cooking_biomass">🪵 {t('subfilters.energy.clean_cooking_biomass')}</option>
              <option value="grid_electrification">🔌 {t('subfilters.energy.grid_electrification')}</option>
            </select>
          </>
        );

      case 'socioeconomics':
        return (
          <>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t('subfilters.socioeconomics.label')}</span>
            </div>
            <select
              name="socioSubFilter"
              className={selectClass}
              value={subFilters.socioSubFilter || 'local_governance'}
              onChange={handleChange}
            >
              <option value="local_governance">🏛️ {t('subfilters.socioeconomics.local_governance')}</option>
              <option value="agri_landholding">🚜 {t('subfilters.socioeconomics.agri_landholding')}</option>
            </select>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="glass-panel px-4 py-2.5 rounded-xl flex flex-wrap items-center gap-3 border border-slate-200 shadow-sm animate-fade-in-up bg-white/95">
      {renderFilters()}
    </div>
  );
};
