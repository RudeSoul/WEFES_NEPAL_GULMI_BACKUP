// [DATA PROVENANCE]
// Data Source: data/real/boundaries/gulmi-palikas.json, data/real/agriculture/crop_requirement.json, data/formulas/analytical_methodologies.json
// Classification: OBSERVED REAL & EMPIRICAL SCIENTIFIC SURFACES
// Citations: Survey Department Nepal, DHM, NARC, MoALD, DOED, NEA, ICIMOD, FAO ECOCROP, NASA POWER

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Check, CloudRain, Layers, MapPin, Mountain, Route, Sprout, Target, Waves, X } from 'lucide-react';

import { VALIDATED_CROPS } from '../../data/cropSuitabilityAssets';
import { useNexusStore } from '../../store';

interface MapLayerControlProps {
  onResetCamera?: () => void;
  className?: string;
}

interface SurfaceOption {
  id: string;
  title: string;
  nepaliTitle?: string;
  subtitle: string;
  icon: string;
  category?: string;
  badge?: string;
}

export const MapLayerControl: React.FC<MapLayerControlProps> = ({ onResetCamera, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'surfaces' | 'overlays' | 'basemap'>('surfaces');

  const selectedPillar = useNexusStore((s) => s.selectedPillar);
  const subFilters = useNexusStore((s) => s.subFilters);
  const setSubFilters = useNexusStore((s) => s.setSubFilters);
  const setSubFilter = useNexusStore((s) => s.setSubFilter);

  const basemap = useNexusStore((s) => s.basemap);
  const setBasemap = useNexusStore((s) => s.setBasemap);
  const showContours = useNexusStore((s) => s.showContours);
  const setShowContours = useNexusStore((s) => s.setShowContours);
  const showPalikaLabels = useNexusStore((s) => s.showPalikaLabels);
  const setShowPalikaLabels = useNexusStore((s) => s.setShowPalikaLabels);
  const lang = useNexusStore((s) => s.lang);

  // Surface options definitions per pillar
  const waterOptions: SurfaceOption[] = useMemo(
    () => [
      {
        id: 'merra_rainfall',
        title: 'Dynamic Monthly Rainfall',
        nepaliTitle: 'मासिक वर्षा (MERRA-2)',
        subtitle: 'MERRA-2 Topographic Downscaling (Live Gauge)',
        icon: '🌧️',
        category: 'Precipitation',
        badge: 'Heatmap',
      },
      {
        id: 'annual_precipitation',
        title: 'Observed Annual Precipitation',
        nepaliTitle: 'वार्षिक वर्षा (CHIRPS)',
        subtitle: 'CHIRPS Gridded 5km Satellite-Gauge Reanalysis',
        icon: '🌧️',
        category: 'Precipitation',
      },
      {
        id: 'monsoon_precipitation',
        title: 'Monsoon Season Rainfall',
        nepaliTitle: 'मनसुनी वर्षा (असार–असोज)',
        subtitle: 'June–September Total Gridded Rain',
        icon: '⛈️',
        category: 'Precipitation',
      },
      {
        id: 'dry_season_precipitation',
        title: 'Dry Season Rainfall',
        nepaliTitle: 'हिउँदे तथा सुक्खा वर्षा',
        subtitle: 'October–May Cumulative Rain Deficit',
        icon: '❄️',
        category: 'Precipitation',
      },
      {
        id: 'river_basins',
        title: 'Gandaki Basin Drainage Corridors',
        nepaliTitle: 'गण्डकी बेसिन जलाधार कोरिडोर',
        subtitle: 'Kali Gandaki, Badigad, Ridi Arteries',
        icon: '🌊',
        category: 'Drainage',
      },
      {
        id: 'catchments',
        title: 'Sub-Basin Catchments',
        nepaliTitle: 'उप-जलाधार क्षेत्र (HydroBASINS)',
        subtitle: 'HydroBASINS Level 10 Watershed Basins',
        icon: '🏔️',
        category: 'Drainage',
      },
      {
        id: 'rivers_streams',
        title: 'Rivers & Stream Drainage Network',
        nepaliTitle: 'नदी तथा खोला सञ्जाल',
        subtitle: 'HydroRIVERS Strahler Stream Orders (1–6)',
        icon: '🌊',
        category: 'Drainage',
      },
      {
        id: 'flow_accumulation',
        title: 'Surface Flow Accumulation',
        nepaliTitle: 'सतही बहाव संकलन ग्रिड',
        subtitle: 'Upslope Drainage Concentration Grid',
        icon: '💧',
        category: 'Drainage',
      },
      {
        id: 'flow_direction',
        title: 'D8 Flow Direction Raster',
        nepaliTitle: 'D8 बहाव दिशा ग्रिड',
        subtitle: '8-Direction Topographic Flow Slopes',
        icon: '🧭',
        category: 'Drainage',
      },
      {
        id: 'spring_vulnerability',
        title: 'Watershed Spring Depletion Risk',
        nepaliTitle: 'मुहान सुक्ने जोखिम',
        subtitle: 'Springshed Vulnerability & Discharge Decline',
        icon: '🏔️',
        category: 'Water Security',
      },
      {
        id: 'irrigation_potential',
        title: 'River Lift Irrigation Potential',
        nepaliTitle: 'नदी लिफ्ट सिँचाइ सम्भाव्यता',
        subtitle: 'Riverbed Agricultural Flats (<150m Lift)',
        icon: '🌾',
        category: 'Water Security',
      },
      {
        id: 'dhm_station',
        title: 'DHM Gauge & Hydro Stations',
        nepaliTitle: 'DHM जल-मौसम केन्द्रहरू',
        subtitle: 'Real-Time AWS & Climatological Network',
        icon: '💧',
        category: 'Stations',
      },
    ],
    []
  );

  const foodOptions: SurfaceOption[] = useMemo(
    () => [
      {
        id: 'single_crop',
        title: 'Agro-Climatic Crop Suitability',
        nepaliTitle: 'बाली उपयुक्तता विश्लेषण',
        subtitle: 'FAO ECOCROP Biophysical Thermal & Rain Fit',
        icon: '🌱',
      },
      {
        id: 'crop_water_stress',
        title: 'Crop Water & Moisture Stress',
        nepaliTitle: 'बाली जल तनाव तथा अभाव',
        subtitle: 'FAO-56 Soil Moisture Depletion (Ks Deficit)',
        icon: '💧',
      },
      {
        id: 'land_typology',
        title: 'Land Typology & Terraces',
        nepaliTitle: 'जग्गाको प्रकार (खेत/बारी)',
        subtitle: 'NSO Census 2021 Khet vs Bari Farmland Tiers',
        icon: '🌾',
      },
    ],
    []
  );

  const ecoOptions: SurfaceOption[] = useMemo(
    () => [
      {
        id: 'soil_ph',
        title: 'Soil pH & Liming Need',
        nepaliTitle: 'माटोको pH तथा चुना आवश्यकता',
        subtitle: 'NARC 100m Grid (Acidic Ridge vs Neutral Valley)',
        icon: '🧪',
        badge: 'GeoTIFF',
      },
      {
        id: 'soil_nitrogen',
        title: 'Soil Available Nitrogen (N)',
        nepaliTitle: 'उपलब्ध नाइट्रोजन',
        subtitle: 'NARC Fertility Grid (Low to High kg/ha)',
        icon: '🌱',
        badge: 'GeoTIFF',
      },
      {
        id: 'soil_phosphorus',
        title: 'Soil Phosphorus (P₂O₅)',
        nepaliTitle: 'उपलब्ध फस्फोरस',
        subtitle: 'NARC Available Phosphorus Rating',
        icon: '🌱',
        badge: 'GeoTIFF',
      },
      {
        id: 'soil_potassium',
        title: 'Soil Potassium (K₂O)',
        nepaliTitle: 'उपलब्ध पोटासियम',
        subtitle: 'NARC Exchangeable Potassium Grid',
        icon: '🌱',
        badge: 'GeoTIFF',
      },
      {
        id: 'elevation_zones',
        title: 'Topographic Life Zones',
        nepaliTitle: 'भौगोलिक उचाइ क्षेत्र',
        subtitle: 'SRTM 30m DEM Elevation Agro-Ecological Zones',
        icon: '🏔️',
        badge: 'GeoTIFF',
      },
      {
        id: 'agroforestry_belt',
        title: 'Agroforestry & Forest Cover',
        nepaliTitle: 'कृषि-वन तथा सामुदायिक वन',
        subtitle: 'Community Forestry & Subtropical Pine/Sal Belts',
        icon: '🌲',
        badge: 'GeoTIFF',
      },
    ],
    []
  );

  const energyOptions: SurfaceOption[] = useMemo(
    () => [
      {
        id: 'hydro_corridor',
        title: 'Hydropower Potential Reaches',
        nepaliTitle: 'जलविद्युत सम्भाव्यता कोरिडोर',
        subtitle: '2,620 Curvilinear Reaches (>1 MW, Mini, Micro)',
        icon: '⚡',
      },
      {
        id: 'solar_irradiance',
        title: 'Solar PV Potential & Optimum Tilt',
        nepaliTitle: 'सौर्य विकिरण तथा क्षमता',
        subtitle: 'Global Solar Atlas PVOUT & OPTA (kWh/m²)',
        icon: '☀️',
        badge: 'Heatmap',
      },
      {
        id: 'clean_cooking_biomass',
        title: 'Clean Cooking & Firewood Reliance',
        nepaliTitle: 'स्वच्छ ऊर्जा तथा दाउरा निर्भरता',
        subtitle: 'NSO Census 2021 Solid Biomass Dependence (%)',
        icon: '🪵',
      },
      {
        id: 'grid_electrification',
        title: 'NEA Substation Transmission Grid',
        nepaliTitle: 'विद्युत प्रसारण तथा सब-स्टेशन',
        subtitle: '132kV Trunk & 33kV Rural Substations & Buffers',
        icon: '🔌',
      },
    ],
    []
  );

  const socioOptions: SurfaceOption[] = useMemo(
    () => [
      {
        id: 'local_governance',
        title: 'Local Governance Classification',
        nepaliTitle: 'स्थानीय तह वर्गीकरण',
        subtitle: 'Municipalities (2) & Rural Palikas (10)',
        icon: '🏛️',
      },
      {
        id: 'agri_landholding',
        title: 'Agricultural Landholding per HH',
        nepaliTitle: 'घरधुरी अनुसार कृषि जमिन',
        subtitle: 'NSO Agriculture Census 2021 Average Landholding',
        icon: '🚜',
        badge: 'Census',
      },
    ],
    []
  );

  // Get active surface information
  const { currentOptions, activeSurfaceId, activeSurfaceTitle, activeIcon } = useMemo(() => {
    switch (selectedPillar) {
      case 'water': {
        const id = subFilters.waterSubFilter || 'merra_rainfall';
        const match = waterOptions.find((o) => o.id === id) || waterOptions[0];
        return {
          currentOptions: waterOptions,
          activeSurfaceId: id,
          activeSurfaceTitle: lang === 'np' ? match.nepaliTitle || match.title : match.title,
          activeIcon: match.icon,
        };
      }
      case 'food': {
        const mode = subFilters.foodMode || 'single_crop';
        const cropId = subFilters.crop || 'coffee';
        const crop = VALIDATED_CROPS[cropId];
        const cropName = crop ? (lang === 'np' ? crop.nepaliName : crop.name) : cropId;
        const match = foodOptions.find((o) => o.id === mode) || foodOptions[0];
        const title =
          mode === 'single_crop'
            ? `${cropName} Suitability`
            : mode === 'crop_water_stress'
              ? `${cropName} Water Stress`
              : match.title;
        return {
          currentOptions: foodOptions,
          activeSurfaceId: mode,
          activeSurfaceTitle: title,
          activeIcon: match.icon,
        };
      }
      case 'ecosystem': {
        const id = subFilters.ecoSubFilter || 'soil_ph';
        const match = ecoOptions.find((o) => o.id === id) || ecoOptions[0];
        return {
          currentOptions: ecoOptions,
          activeSurfaceId: id,
          activeSurfaceTitle: lang === 'np' ? match.nepaliTitle || match.title : match.title,
          activeIcon: match.icon,
        };
      }
      case 'energy': {
        const id = subFilters.energySubFilter || 'hydro_corridor';
        const match = energyOptions.find((o) => o.id === id) || energyOptions[0];
        return {
          currentOptions: energyOptions,
          activeSurfaceId: id,
          activeSurfaceTitle: lang === 'np' ? match.nepaliTitle || match.title : match.title,
          activeIcon: match.icon,
        };
      }
      case 'socioeconomics': {
        const id = subFilters.socioSubFilter || 'local_governance';
        const match = socioOptions.find((o) => o.id === id) || socioOptions[0];
        return {
          currentOptions: socioOptions,
          activeSurfaceId: id,
          activeSurfaceTitle: lang === 'np' ? match.nepaliTitle || match.title : match.title,
          activeIcon: match.icon,
        };
      }
      default:
        return {
          currentOptions: waterOptions,
          activeSurfaceId: 'merra_rainfall',
          activeSurfaceTitle: 'Hydrological Surface',
          activeIcon: '🌧️',
        };
    }
  }, [selectedPillar, subFilters, lang, waterOptions, foodOptions, ecoOptions, energyOptions, socioOptions]);

  const handleSelectSurface = (id: string) => {
    switch (selectedPillar) {
      case 'water':
        setSubFilters({ waterSubFilter: id });
        break;
      case 'food':
        setSubFilters({ foodMode: id });
        break;
      case 'ecosystem':
        setSubFilters({ ecoSubFilter: id });
        break;
      case 'energy':
        setSubFilters({ energySubFilter: id });
        break;
      case 'socioeconomics':
        setSubFilters({ socioSubFilter: id });
        break;
    }
  };

  const isHighwayActive = subFilters.highwayFilter === 'all' || subFilters.highwayFilter === 'primary';
  const toggleHighway = () => {
    setSubFilter('highwayFilter', isHighwayActive ? 'none' : 'all');
  };

  // Grouped water options if in water pillar
  const groupedWater = useMemo(() => {
    if (selectedPillar !== 'water') return null;
    const groups: Record<string, SurfaceOption[]> = {};
    waterOptions.forEach((opt) => {
      const cat = opt.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(opt);
    });
    return groups;
  }, [selectedPillar, waterOptions]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close floating layer panel when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`absolute top-3.5 right-3.5 z-[1000] font-sans flex flex-col items-end ${className}`}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* ─── 1. Collapsed Floating Trigger (Google Maps Style Icon-Only Button) ─── */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="glass-panel backdrop-blur-md bg-white/95 text-slate-800 border border-slate-200/90 shadow-md hover:shadow-xl rounded-2xl p-1.5 flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 group select-none relative"
          title={
            lang === 'np' ? `नक्सा तह तथा तथ्यांक: ${activeSurfaceTitle}` : `Map Layers & Data (${activeSurfaceTitle})`
          }
          aria-label={lang === 'np' ? 'नक्सा तह तथा तथ्यांक' : 'Map Layers & Data'}
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-600/10 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
            <Layers className="w-4.5 h-4.5" />
          </div>
        </button>
      )}

      {/* ─── 2. Expanded Floating GIS Layer Panel ─── */}
      {isOpen && (
        <div className="glass-panel w-[320px] sm:w-[370px] max-h-[520px] flex flex-col bg-white/98 backdrop-blur-xl border border-slate-200/90 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800 origin-top-right">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/10 text-emerald-700 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs text-slate-900 font-outfit leading-none">
                    {lang === 'np' ? 'नक्सा तह तथा तथ्यांक' : 'Map Layers & Data'}
                  </h3>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded-full font-semibold uppercase bg-slate-200 text-slate-700">
                    {selectedPillar}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  {lang === 'np' ? 'वैज्ञानिक सतह र ओभरले चयन' : 'Scientific surfaces & overlays'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="px-3 pt-2 pb-1 border-b border-slate-100 bg-white flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('surfaces')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'surfaces'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{activeIcon}</span>
              <span>{lang === 'np' ? 'सतहहरू' : 'Surfaces'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('overlays')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'overlays'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Mountain className="w-3.5 h-3.5" />
              <span>{lang === 'np' ? 'ओभरले' : 'Overlays'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('basemap')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'basemap'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <CompassIcon className="w-3.5 h-3.5" />
              <span>{lang === 'np' ? 'बेसमेप' : 'Basemap'}</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar text-xs">
            {/* ─── TAB 1: SCIENTIFIC SURFACES ─── */}
            {activeTab === 'surfaces' && (
              <div className="space-y-3">
                {/* Food Pillar: Mode Picker + Contextual Crop/Season Pills */}
                {selectedPillar === 'food' && (
                  <div className="space-y-2.5">
                    {/* Primary Mode Cards */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-outfit px-0.5">
                        {lang === 'np' ? 'विश्लेषण विधि' : 'Food Analysis Mode'}
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {foodOptions.map((opt) => {
                          const isSelected = activeSurfaceId === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectSurface(opt.id)}
                              className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-400/40'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">{opt.icon}</span>
                                <div>
                                  <div className="font-semibold text-xs leading-snug">
                                    {lang === 'np' ? opt.nepaliTitle || opt.title : opt.title}
                                  </div>
                                  <div className="text-[10px] text-slate-500 leading-tight">{opt.subtitle}</div>
                                </div>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Contextual Crop Selector Pills */}
                    {(subFilters.foodMode === 'single_crop' ||
                      subFilters.foodMode === 'crop_water_stress' ||
                      !subFilters.foodMode) && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10.5px] font-bold text-slate-700 font-outfit flex items-center gap-1.5">
                            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{lang === 'np' ? 'बाली चयन (FAO EcoCrop)' : 'Select Target Crop'}</span>
                          </span>
                          <span className="text-[9.5px] text-slate-400">8 Validated Species</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          {Object.values(VALIDATED_CROPS).map((crop) => {
                            const isSelected = (subFilters.crop || 'coffee') === crop.id;
                            return (
                              <button
                                key={crop.id}
                                type="button"
                                onClick={() => setSubFilters({ crop: crop.id })}
                                className={`px-2 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all text-left border ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-2xs'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                              >
                                <span>{crop.emoji}</span>
                                <span className="truncate">{lang === 'np' ? crop.nepaliName : crop.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Contextual Season Selector Pills for Water Stress */}
                    {subFilters.foodMode === 'crop_water_stress' && (
                      <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10.5px] font-bold text-sky-900 font-outfit flex items-center gap-1.5">
                            <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                            <span>{lang === 'np' ? 'मूल्यांकन याम (FAO Ks Deficit)' : 'Moisture Deficit Window'}</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: 'cycle', label: '🌱 Full Cycle', desc: 'Lifecycle' },
                            { id: 'winter_dry', label: '❄️ Winter Dry', desc: 'Nov–Feb' },
                            { id: 'pre_monsoon', label: '☀️ Pre-Monsoon', desc: 'Mar–May' },
                            { id: 'monsoon_wet', label: '🌊 Monsoon Wet', desc: 'Jun–Sep' },
                          ].map((season) => {
                            const isSelected = (subFilters.waterSeason || 'cycle') === season.id;
                            return (
                              <button
                                key={season.id}
                                type="button"
                                onClick={() => setSubFilters({ waterSeason: season.id })}
                                className={`px-2 py-1.5 rounded-lg text-[10.5px] font-medium flex flex-col items-start transition-all border ${
                                  isSelected
                                    ? 'bg-sky-600 text-white border-sky-600 font-semibold shadow-2xs'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-100/50'
                                }`}
                              >
                                <span>{season.label}</span>
                                <span className={`text-[9px] ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                                  {season.desc}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Contextual Land Typology Metric */}
                    {subFilters.foodMode === 'land_typology' && (
                      <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                        <span className="text-[10.5px] font-bold text-emerald-900 font-outfit">
                          {lang === 'np' ? 'कृषि जग्गा सूचक' : 'Terrace Land Metric'}
                        </span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {[
                            { id: 'khet_pct', label: '🌊 Lowland Irrigated Terraces (Khet %)' },
                            { id: 'bari_pct', label: '⛰️ Sloping Rainfed Terraces (Bari %)' },
                            { id: 'parcel_density', label: '🧩 Average Parcels per Holding' },
                          ].map((metric) => {
                            const isSelected = (subFilters.landMetric || 'khet_pct') === metric.id;
                            return (
                              <button
                                key={metric.id}
                                type="button"
                                onClick={() => setSubFilters({ landMetric: metric.id })}
                                className={`p-2 rounded-lg text-left text-xs font-medium transition-all border ${
                                  isSelected
                                    ? 'bg-emerald-700 text-white border-emerald-700 font-semibold'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {metric.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Water Pillar: Grouped surfaces */}
                {selectedPillar === 'water' && groupedWater && (
                  <div className="space-y-3">
                    {Object.entries(groupedWater).map(([category, options]) => (
                      <div key={category} className="space-y-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-outfit px-0.5">
                          {category}
                        </div>
                        <div className="grid grid-cols-1 gap-1.5">
                          {options.map((opt) => {
                            const isSelected = activeSurfaceId === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleSelectSurface(opt.id)}
                                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                                  isSelected
                                    ? 'bg-sky-50 border-sky-500 text-sky-950 shadow-xs ring-1 ring-sky-400/40'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{opt.icon}</span>
                                  <div>
                                    <div className="font-semibold text-xs leading-snug">
                                      {lang === 'np' ? opt.nepaliTitle || opt.title : opt.title}
                                    </div>
                                    <div className="text-[10px] text-slate-500 leading-tight">{opt.subtitle}</div>
                                  </div>
                                </div>
                                {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ecosystem Pillar: Continuous GeoTIFF Rasters */}
                {selectedPillar === 'ecosystem' && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-outfit px-0.5 flex items-center justify-between">
                      <span>
                        {lang === 'np' ? 'NARC १०० मिटर माटो र भू-उपग्रह ग्रिड' : 'NARC 100m Soil & DEM Grids'}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold">
                        GeoTIFF Continuous
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      {ecoOptions.map((opt) => {
                        const isSelected = activeSurfaceId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectSurface(opt.id)}
                            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                              isSelected
                                ? 'bg-teal-50 border-teal-500 text-teal-950 shadow-xs ring-1 ring-teal-400/40'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{opt.icon}</span>
                              <div>
                                <div className="font-semibold text-xs leading-snug flex items-center gap-1.5">
                                  <span>{lang === 'np' ? opt.nepaliTitle || opt.title : opt.title}</span>
                                  {opt.badge && (
                                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                                      {opt.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-500 leading-tight">{opt.subtitle}</div>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Energy Pillar */}
                {selectedPillar === 'energy' && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-outfit px-0.5">
                      {lang === 'np' ? 'नवीकरणीय ऊर्जा सतहहरू' : 'Renewable Energy Infrastructure'}
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      {energyOptions.map((opt) => {
                        const isSelected = activeSurfaceId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectSurface(opt.id)}
                            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                              isSelected
                                ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-400/40'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{opt.icon}</span>
                              <div>
                                <div className="font-semibold text-xs leading-snug">
                                  {lang === 'np' ? opt.nepaliTitle || opt.title : opt.title}
                                </div>
                                <div className="text-[10px] text-slate-500 leading-tight">{opt.subtitle}</div>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Socioeconomics Pillar */}
                {selectedPillar === 'socioeconomics' && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-outfit px-0.5">
                      {lang === 'np' ? 'शासन तथा सामाजिक-आर्थिक सतहहरू' : 'Governance & Socioeconomic Layers'}
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      {socioOptions.map((opt) => {
                        const isSelected = activeSurfaceId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectSurface(opt.id)}
                            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-xs ring-1 ring-indigo-400/40'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{opt.icon}</span>
                              <div>
                                <div className="font-semibold text-xs leading-snug">
                                  {lang === 'np' ? opt.nepaliTitle || opt.title : opt.title}
                                </div>
                                <div className="text-[10px] text-slate-500 leading-tight">{opt.subtitle}</div>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 2: CONTEXTUAL VECTOR OVERLAYS ─── */}
            {activeTab === 'overlays' && (
              <div className="space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-outfit px-0.5">
                  {lang === 'np' ? 'स्वतन्त्र भेक्टर ओभरले' : 'Independent Vector Overlays'}
                </div>

                {/* 1. Topographic Contours Toggle */}
                <div className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                      <Mountain className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900 leading-snug">
                        {lang === 'np' ? 'उचाइ कन्टुर रेखाहरू' : 'Topographic Contours'}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {lang === 'np'
                          ? '२०० मिटर उचाइ अन्तराल तथा जीवन-क्षेत्र'
                          : '200m interval isolines & thermal life zones'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowContours((prev) => !prev)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                      showContours || basemap === 'terrain' ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        showContours || basemap === 'terrain' ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Palika Centroid Labels Toggle */}
                <div className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900 leading-snug">
                        {lang === 'np' ? 'पालिका नाम तथा केन्द्रहरू' : 'Palika Centroid Labels'}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {lang === 'np' ? '१२ पालिकाको द्विभाषी नामाकरण' : 'Bilingual text labels with halo styling'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPalikaLabels((prev) => !prev)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                      showPalikaLabels ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        showPalikaLabels ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 3. National Highway & Road Corridor Network Toggle */}
                <div className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center shrink-0">
                      <Route className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900 leading-snug">
                        {lang === 'np' ? 'राजमार्ग तथा सडक सञ्जाल' : 'National Roads & Corridors'}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {lang === 'np' ? 'मदन भण्डारी तथा मुख्य फिडर सडक' : 'Madan Bhandari & feeder highways'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={toggleHighway}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                      isHighwayActive ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        isHighwayActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 4. Quick Shortcut: HydroSHEDS River Network */}
                <div className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <Waves className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900 leading-snug">
                        {lang === 'np' ? 'जलप्रवाह तथा नदी सञ्जाल' : 'HydroRIVERS Stream Network'}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {lang === 'np'
                          ? 'कालीगण्डकी, बडिगाड र शाखा खोलाहरू'
                          : 'Kali Gandaki, Badigad & Strahler order streams'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (subFilters.waterSubFilter === 'rivers_streams') {
                        setSubFilters({ waterSubFilter: 'merra_rainfall' });
                      } else {
                        setSubFilters({ waterSubFilter: 'rivers_streams' });
                      }
                    }}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                      subFilters.waterSubFilter === 'rivers_streams' ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        subFilters.waterSubFilter === 'rivers_streams' ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* ─── TAB 3: BASEMAP SELECTOR ─── */}
            {activeTab === 'basemap' && (
              <div className="space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-outfit px-0.5">
                  {lang === 'np' ? 'बेसमेप शैली चयन' : 'Basemap Tile Provider'}
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {[
                    {
                      id: 'voyager' as const,
                      title: 'Clean Vector Map',
                      nepaliTitle: 'सफा भेक्टर नक्सा',
                      subtitle: 'Esri World Light Gray Canvas & OpenStreetMap',
                      icon: '🗺️',
                      badge: 'High Contrast',
                    },
                    {
                      id: 'satellite' as const,
                      title: 'Esri World Imagery',
                      nepaliTitle: 'उपग्रह तस्बिर (Satellite)',
                      subtitle: 'High-Resolution Real Satellite Aerial Photography',
                      icon: '🛰️',
                      badge: 'True Color',
                    },
                    {
                      id: 'terrain' as const,
                      title: 'Topographic Shaded Relief',
                      nepaliTitle: 'टोपोग्राफिक धरातल',
                      subtitle: 'Esri Shaded Elevation & Mountain Ridges',
                      icon: '⛰️',
                      badge: 'Terrain',
                    },
                  ].map((tile) => {
                    const isSelected = basemap === tile.id;
                    return (
                      <button
                        key={tile.id}
                        type="button"
                        onClick={() => setBasemap(tile.id)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-400/40'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{tile.icon}</span>
                          <div>
                            <div className="font-semibold text-xs leading-snug flex items-center gap-1.5">
                              <span>{lang === 'np' ? tile.nepaliTitle : tile.title}</span>
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                                {tile.badge}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 leading-tight">{tile.subtitle}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer with Camera Recenter & Status */}
          <div className="px-3.5 py-2.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
            {onResetCamera ? (
              <button
                type="button"
                onClick={onResetCamera}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-emerald-700 shadow-2xs"
                title="Reset Camera to Gulmi Extent"
              >
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'np' ? 'केन्द्रित गर्नुहोस्' : 'Recenter Map'}</span>
              </button>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">Gulmi Extent Locked</span>
            )}

            <span className="text-[10px] text-slate-400 font-medium">WEFES Platform</span>
          </div>
        </div>
      )}
    </div>
  );
};

function CompassIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
