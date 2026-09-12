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
                <option value="dhm_station">💧 River Network & DHM Gauging Stations (Stations #410, #430, #435)</option>
              </optgroup>
              <optgroup label="⛰️ Terrain Water Security">
                <option value="spring_vulnerability">🏔️ Spring Scarcity Risk (मुहान सुक्ने जोखिम - Ridge vs Valley)</option>
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
              <span>Agro-Feasibility Focus:</span>
            </div>
            <select
              name="foodMode"
              className={selectClass}
              value={foodMode}
              onChange={handleChange}
            >
              <option value="single_crop">🎯 Signature Crop Suitability Model</option>
              <option value="barkhe_summer">☀️ Barkhe (बरखे - Summer Monsoon Crops)</option>
              <option value="hiunde_winter">❄️ Hiunde (हिउँदे - Winter Crops)</option>
              <option value="double_cropping">🔄 Double-Cropping Feasibility (Irrigated vs Rainfed)</option>
            </select>

            {foodMode === 'single_crop' && (
              <select
                name="crop"
                className={selectClass}
                value={subFilters.crop || 'coffee'}
                onChange={handleChange}
              >
                <optgroup label="☕ Signature Cash Crops">
                  <option value="coffee">☕ Arabica Coffee (कफी)</option>
                  <option value="orange">🍊 Mandarin Orange (सुन्तला)</option>
                  <option value="ginger">🫚 Ginger & Turmeric (अदुवा / बेसार)</option>
                  <option value="cardamom">🌿 Large Cardamom (अलैंची)</option>
                </optgroup>
                <optgroup label="🌾 Cereals & High-Altitude Crops">
                  <option value="potato">🥔 Seed Potato (आलु)</option>
                  <option value="buckwheat">🌾 Buckwheat (फापर)</option>
                  <option value="rice">🌾 Monsoon Paddy (धान)</option>
                  <option value="maize">🌽 Mid-Hill Maize (मकै)</option>
                </optgroup>
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
                <option value="soil_nitrogen">🌱 NARC Soil Nitrogen (81 Sampling Points)</option>
                <option value="soil_phosphorus">🌱 NARC Soil Phosphorus (P₂O₅)</option>
                <option value="soil_potassium">🌱 NARC Soil Potassium (K₂O)</option>
              </optgroup>
              <optgroup label="🏔️ Topography & Flora">
                <option value="elevation_zones">🏔️ Elevation Tiers (Valley &lt;800m, Slopes 800–1500m, Ridges &gt;1500m)</option>
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
              <option value="solar_irradiance">☀️ Ridge Solar Potential (NASA POWER 4.9 kWh/m²/d)</option>
              <option value="clean_cooking_biomass">🪵 Clean Cooking & Biomass Transition Zone</option>
              <option value="grid_electrification">🔌 NEA Distribution Reach (Tamghas Grid Core vs Perimeter)</option>
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
              <option value="local_governance">🏛️ Local Body Type (2 Municipalities vs 10 Rural Palikas)</option>
              <option value="hq_market_proximity">🛣️ Proximity to Tamghas HQ & Madan Bhandari Highway</option>
              <option value="agri_landholding">🚜 Average Agricultural Landholding per Household</option>
              <option value="labor_wages">💼 Daily Agricultural Labor Rate (NPR/Day)</option>
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
