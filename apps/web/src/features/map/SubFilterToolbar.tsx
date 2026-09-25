import React from 'react';
import { WEFESPillar } from '@wefes/shared-types';
import { Droplets, Zap, Sprout, Trees, Coins, Layers, CloudRain, Mountain, ShieldAlert, Sparkles, Building2, Compass, Waves } from 'lucide-react';

interface SubFilterToolbarProps {
  selectedPillar: WEFESPillar;
  onChange: (filters: Record<string, string>) => void;
  subFilters?: Record<string, string>;
}

export const SubFilterToolbar: React.FC<SubFilterToolbarProps> = ({
  selectedPillar,
  onChange,
  subFilters = {}
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
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
              <span>Hydrological Layer:</span>
            </div>
            <select
              name="waterSubFilter"
              className={selectClass}
              value={subFilters.waterSubFilter || 'merra_rainfall'}
              onChange={handleChange}
            >
              <optgroup label="🌧️ Precipitation & Watersheds">
                <option value="merra_rainfall">🌧️ Dynamic Monthly Rainfall (MERRA-2 Topographic Downscaling)</option>
                <option value="river_basins">🌊 Gandaki Basin Drainage Corridors (Kali Gandaki, Badigad, Ridi)</option>
                <option value="dhm_station">💧 DHM Hydro-Meteorological Stations</option>
              </optgroup>
              <optgroup label="⛰️ Terrain Water Security">
                <option value="spring_vulnerability">🏔️ Watershed Spring Depletion Vulnerability (मुहान सुक्ने जोखिम)</option>
                <option value="irrigation_potential">🌾 River Lift Irrigation Potential (Riverbed Flats)</option>
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
              <span>Food Analysis:</span>
            </div>
            <select
              name="foodMode"
              className={selectClass}
              value={foodMode}
              onChange={handleChange}
            >
              <option value="single_crop">🌱 Crop Suitability (Agro-Climatic Fit)</option>
              <option value="crop_water_stress">💧 Crop Water & Moisture Stress</option>
              <option value="land_typology">🌾 Land Typology & Terraces (Khet vs Bari)</option>
            </select>

            {(foodMode === 'single_crop' || foodMode === 'crop_water_stress') && (
              <select
                name="crop"
                className={selectClass}
                value={subFilters.crop || 'coffee'}
                onChange={handleChange}
              >
                <optgroup label="☕ Cash & Horticultural Crops">
                  <option value="coffee">☕ Arabica Coffee (कफी)</option>
                  <option value="large_cardamom">🌿 Large Cardamom (अलैंची)</option>
                  <option value="tomato">🍅 Fresh Market Tomato (गोलभेंडा)</option>
                  <option value="apple">🍎 High-Hill Apple (स्याउ)</option>
                </optgroup>
                <optgroup label="🌾 Cereals & Staple Crops">
                  <option value="maize">🌽 Mid-Hill Maize (मकै)</option>
                  <option value="rice">🌾 Monsoon Paddy Rice (धान)</option>
                  <option value="wheat">🌾 Winter Wheat (गहुँ)</option>
                  <option value="finger_millet">🌾 Finger Millet / Kodo (कोदो)</option>
                </optgroup>
              </select>
            )}

            {foodMode === 'crop_water_stress' && (
              <select
                name="waterSeason"
                className={selectClass}
                value={subFilters.waterSeason || 'cycle'}
                onChange={handleChange}
                title="Select Moisture Evaluation Period"
              >
                <option value="cycle">🌱 Full Growing Cycle (Crop Lifecycle Deficit)</option>
                <option value="winter_dry">❄️ Winter Dry Period (Nov–Feb Deficit)</option>
                <option value="pre_monsoon">☀️ Pre-Monsoon Dry Spell (Mar–May Deficit)</option>
                <option value="monsoon_wet">🌊 Monsoon Wet Period (Jun–Sep Surplus)</option>
              </select>
            )}

            {foodMode === 'land_typology' && (
              <select
                name="landMetric"
                className={selectClass}
                value={subFilters.landMetric || 'khet_pct'}
                onChange={handleChange}
              >
                <option value="khet_pct">🌊 Lowland Irrigated Terraces (Khet %)</option>
                <option value="bari_pct">⛰️ Sloping Rainfed Terraces (Bari %)</option>
                <option value="parcel_density">🧩 Average Parcels per Holding</option>
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
              <span>Ecosystem & Soil Domain:</span>
            </div>
            <select
              name="ecoSubFilter"
              className={selectClass}
              value={subFilters.ecoSubFilter || 'soil_ph'}
              onChange={handleChange}
            >
              <optgroup label="🧪 Soil Geology & Chemistry">
                <option value="soil_ph">🧪 Soil pH & Liming Need (Acidic Ridge vs Neutral Valley)</option>
                <option value="soil_nitrogen">🌱 Soil Available Nitrogen (NARC Soil Fertility Grid)</option>
                <option value="soil_phosphorus">🌱 NARC Soil Phosphorus (P₂O₅)</option>
                <option value="soil_potassium">🌱 NARC Soil Potassium (K₂O)</option>
              </optgroup>
              <optgroup label="🏔️ Topography & Flora">
                <option value="elevation_zones">🏔️ Topographic Elevation Tiers & Agro-Ecological Zones</option>
                <option value="agroforestry_belt">🌲 Community Forestry & Pine/Sal Agroforestry Belt</option>
              </optgroup>
            </select>
          </>
        );

      case 'energy':
        return (
          <>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Renewable Energy Domain:</span>
            </div>
            <select
              name="energySubFilter"
              className={selectClass}
              value={subFilters.energySubFilter || 'hydro_corridor'}
              onChange={handleChange}
            >
              <option value="hydro_corridor">⚡ Run-of-River & Micro-Hydro Corridors (Kali Gandaki, Badigad)</option>
              <option value="solar_irradiance">☀️ Solar PV Potential & Tilt (PVOUT & OPTA • Global Solar Atlas)</option>
              <option value="clean_cooking_biomass">🪵 Clean Cooking & Firewood Reliance (Census 2021 • NSO Nepal)</option>
              <option value="grid_electrification">🔌 NEA Substation Grid Reach</option>
            </select>
          </>
        );

      case 'socioeconomics':
        return (
          <>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Governance & Infrastructure:</span>
            </div>
            <select
              name="socioSubFilter"
              className={selectClass}
              value={subFilters.socioSubFilter || 'local_governance'}
              onChange={handleChange}
            >
              <option value="local_governance">🏛️ Local Governance Classification (Municipalities & Rural Palikas)</option>
              <option value="agri_landholding">🚜 Average Agricultural Landholding per Household</option>
            </select>
          </>
        );

      default:
        return null;
    }
  };

  const iconMap: Record<string, React.ReactNode> = {
    water: <Droplets className="w-3.5 h-3.5 text-sky-600" />,
    energy: <Zap className="w-3.5 h-3.5 text-amber-600" />,
    food: <Sprout className="w-3.5 h-3.5 text-emerald-600" />,
    ecosystem: <Trees className="w-3.5 h-3.5 text-teal-600" />,
    socioeconomics: <Building2 className="w-3.5 h-3.5 text-indigo-600" />,
  };

  return (
    <div className="glass-panel px-4 py-2.5 rounded-xl flex flex-wrap items-center gap-3 border border-slate-200 shadow-sm animate-fade-in-up bg-white/95">
      {renderFilters()}
    </div>
  );
};

export default SubFilterToolbar;
