import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { District, WEFESPillar } from '@wefes/shared-types';
import { db } from '@wefes/database';
import { computeCropSuitability } from '@wefes/wefes-engine';
import { SubFilterToolbar } from './SubFilterToolbar';
import { PillarFilter } from './PillarFilter';
import DistrictHoverCard from './DistrictHoverCard';
import ClimateTimeController from './ClimateTimeController';
import { MapGestureHandler } from './MapGestureHandler';
import { ExecutiveHeroBanner } from './ExecutiveHeroBanner';
import { PolicyPresetSelector } from '../simulator/PolicyPresetSelector';
import { PalikaQuickMatrix } from '../palika/PalikaQuickMatrix';
import { ElevationCrossSection } from './ElevationCrossSection';
import { NexusRadarWidget } from '../nexus/NexusRadarWidget';
import { MapPin, Sparkles, Calendar, Coins, Trees, Droplets, Zap, Sprout, Sun, Wheat, Cherry, Leaf, Thermometer, Mountain, Target, Layers, CloudRain, Wind, Activity, Globe, Compass, Check, Eye, EyeOff, Building2 } from 'lucide-react';
import gulmiSoilPoints from '../../data/gulmiSoilPoints.json';
import { PalikaHoverCard } from '../palika/PalikaHoverCard';
import { DISTRICT_PALIKAS } from '../../data/districtPalikaAssets';
import { getPalikaMicroClimate, GULMI_PALIKA_CLIMATE_PROFILES } from '../../utils/climateDownscaling';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const NEPAL_MAX_BOUNDS: [[number, number], [number, number]] = [[25.0, 78.5], [31.5, 89.5]];
const GULMI_MAP_CENTER: [number, number] = [28.095, 83.315];
const GULMI_MAP_ZOOM = 11;
const GULMI_BOUNDS: [[number, number], [number, number]] = [
  [27.920, 83.024],
  [28.271, 83.608],
];

// Palika centroid geographical coordinates for bilingual map labels (Exact Polygon Centroids from GeoJSON)
const PALIKA_CENTROIDS: Record<string, { lat: number; lng: number; nepali: string }> = {
  'Resunga': { lat: 28.0531, lng: 83.2658, nepali: 'रेसुङ्गा' },
  'Musikot': { lat: 28.1846, lng: 83.2826, nepali: 'मुसिकोट' },
  'Ruru': { lat: 27.9822, lng: 83.4256, nepali: 'रुरुक्षेत्र' },
  'Satyawati': { lat: 28.0300, lng: 83.4689, nepali: 'सत्यवती' },
  'Kaligandaki': { lat: 28.0502, lng: 83.5436, nepali: 'कालीगण्डकी' },
  'Chandrakot': { lat: 28.1070, lng: 83.4208, nepali: 'चन्द्रकोट' },
  'Chatrakot': { lat: 27.9862, lng: 83.3472, nepali: 'छत्रकोट' },
  'Gulmidarbar': { lat: 28.0398, lng: 83.3167, nepali: 'गुल्मीदरबार' },
  'Dhurkot': { lat: 28.1181, lng: 83.1408, nepali: 'धुर्कोट' },
  'Isma': { lat: 28.1643, lng: 83.2054, nepali: 'इस्मा' },
  'Malika': { lat: 28.2131, lng: 83.1426, nepali: 'मालिका' },
  'Madane': { lat: 28.1750, lng: 83.0753, nepali: 'मदाने' },
};

function createPalikaLabelIcon(name: string, nepali: string, isHovered: boolean) {
  return L.divIcon({
    className: 'custom-palika-label',
    html: `
      <div style="
        background: transparent;
        color: ${isHovered ? '#047857' : '#0f172a'};
        text-align: center;
        font-family: system-ui, -apple-system, sans-serif;
        white-space: nowrap;
        pointer-events: none;
        transform: translate(-50%, -50%);
        text-shadow:
          -1.5px -1.5px 0 #ffffff,
          1.5px -1.5px 0 #ffffff,
          -1.5px 1.5px 0 #ffffff,
          1.5px 1.5px 0 #ffffff,
          0 0 4px #ffffff,
          0 0 8px #ffffff;
      ">
        <div style="font-weight: 800; font-size: 11.5px; line-height: 1.15; letter-spacing: -0.01em;">${name}</div>
        <div style="font-size: 9.5px; font-weight: 700; opacity: 0.85; color: ${isHovered ? '#047857' : '#334155'};">${nepali}</div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

interface LiveGulmiWeather {
  temperature: number;
  apparentTemp: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  solarRadiation: number;
  cloudCover: number;
  isDay: boolean;
  time: string;
}

function GulmiBoundsController({ resetTrigger, activeDrawerTab }: { resetTrigger: number; activeDrawerTab?: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      const timer = setTimeout(() => {
        map.invalidateSize({ animate: true });
        map.fitBounds(GULMI_BOUNDS, {
          padding: [15, 15],
          maxZoom: 11.8,
          animate: true,
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [map, resetTrigger, activeDrawerTab]);
  return null;
}

function MapPanesSetup() {
  const map = useMap();
  useEffect(() => {
    if (map && !map.getPane('roadsPane')) {
      const pane = map.createPane('roadsPane');
      pane.style.zIndex = '450';
      pane.style.pointerEvents = 'auto';
    }
  }, [map]);
  return null;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function suitabilityToColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 75) return '#2b2870ff';
  if (score >= 70) return '#55799fff';
  if (score >= 60) return '#84cc16';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

function getFoodFeasibilityColor(
  props: any,
  overlayType: string,
  selectedMapCropId: string | null,
  cropSuitabilityMap: Record<string, number>
): string {
  if (!props) return '#1e293b';

  // 1. Specific Crop Suitability overlay
  if (overlayType === 'crop_suitability' && selectedMapCropId) {
    const score = cropSuitabilityMap[props.id];
    if (score !== undefined) {
      return suitabilityToColor(score);
    }
  }

  // 2. Feasible Cereal Crops Count
  if (overlayType === 'cereal_crops') {
    const count = props.feasibleCrops?.length || 0;
    if (count >= 8) return '#059669';
    if (count >= 6) return '#10b981';
    if (count >= 4) return '#f59e0b';
    return '#ef4444';
  }

  // 3. Feasible Vegetables Count
  if (overlayType === 'vegetables') {
    const count = props.feasibleVegetables?.length || 0;
    if (count >= 16) return '#059669';
    if (count >= 12) return '#10b981';
    if (count >= 8) return '#0ea5e9';
    return '#f59e0b';
  }

  // 4. Feasible Fruits Count
  if (overlayType === 'fruits') {
    const count = props.feasibleFruits?.length || 0;
    if (count >= 8) return '#d97706';
    if (count >= 5) return '#f59e0b';
    if (count >= 2) return '#0ea5e9';
    return '#8b5cf6';
  }

  // 5. Spices & Cash Crops Count
  if (overlayType === 'spices_cash') {
    const count = props.feasibleSpicesCashCrops?.length || 0;
    if (count >= 6) return '#7c3aed';
    if (count >= 4) return '#a855f7';
    if (count >= 2) return '#c084fc';
    return '#94a3b8';
  }

  // 6. Agro-Climatic Zone
  if (overlayType === 'climate_zone') {
    const cz = (props.climateZone || '').toLowerCase();
    if (cz.includes('tropical')) return '#059669';
    if (cz.includes('subtropical')) return '#10b981';
    if (cz.includes('temperate')) return '#0ea5e9';
    if (cz.includes('subalpine') || cz.includes('alpine')) return '#8b5cf6';
    if (cz.includes('trans-himalayan')) return '#f59e0b';
    return '#64748b';
  }

  // 7. Physiographic Region
  if (overlayType === 'physiographic') {
    const pr = (props.physiographicRegion || props.ecoZone || '').toLowerCase();
    if (pr.includes('terai')) return '#facc15';
    if (pr.includes('hill')) return '#10b981';
    if (pr.includes('mountain')) return '#0ea5e9';
    if (pr.includes('valley')) return '#8b5cf6';
    return '#64748b';
  }

  // Default: Total Agricultural Diversity (variety count)
  const total =
    (props.feasibleCrops?.length || 0) +
    (props.feasibleVegetables?.length || 0) +
    (props.feasibleFruits?.length || 0) +
    (props.feasibleSpicesCashCrops?.length || 0);

  if (total >= 32) return '#059669';
  if (total >= 24) return '#10b981';
  if (total >= 16) return '#0ea5e9';
  if (total >= 8) return '#f59e0b';
  return '#8b5cf6';
}

function getNarcSoilColor(props: any, ecoSubFilter: string, subFilters: Record<string, string>): string {
  if (!props || props.hasRealSoilData === false || props.soilSampleCount === 0 || props.soilNitrogen === undefined) {
    return '#1e293b';
  }

  if (ecoSubFilter === 'soil_nitrogen') {
    const n = props.soilNitrogen;
    const range = subFilters.nitrogenRange;
    if (range === 'high' && n <= 0.20) return '#1e293b';
    if (range === 'med' && (n < 0.10 || n > 0.20)) return '#1e293b';
    if (range === 'low' && n >= 0.10) return '#1e293b';
    if (n > 0.20) return '#059669';
    if (n >= 0.10) return '#10b981';
    return '#ef4444';
  }

  if (ecoSubFilter === 'soil_phosphorus') {
    const p = props.soilPhosphorus;
    const range = subFilters.phosphorusRange;
    if (range === 'high' && p <= 55) return '#1e293b';
    if (range === 'med' && (p < 30 || p > 55)) return '#1e293b';
    if (range === 'low' && p >= 30) return '#1e293b';
    if (p > 55) return '#0284c7';
    if (p >= 30) return '#38bdf8';
    return '#ef4444';
  }

  if (ecoSubFilter === 'soil_potassium') {
    const k = props.soilPotassium;
    const range = subFilters.potassiumRange;
    if (range === 'high' && k <= 280) return '#1e293b';
    if (range === 'med' && (k < 110 || k > 280)) return '#1e293b';
    if (range === 'low' && k >= 110) return '#1e293b';
    if (k > 280) return '#7c3aed';
    if (k >= 110) return '#a855f7';
    return '#ef4444';
  }

  if (ecoSubFilter === 'soil_ph') {
    const ph = props.baseSoilPh;
    const range = subFilters.phRange;
    if (range === 'alkaline' && ph <= 7.5) return '#1e293b';
    if (range === 'neutral' && (ph < 6.5 || ph > 7.5)) return '#1e293b';
    if (range === 'acidic' && (ph < 5.5 || ph >= 6.5)) return '#1e293b';
    if (range === 'strongly_acidic' && ph >= 5.5) return '#1e293b';
    if (ph > 7.5) return '#06b6d4';
    if (ph >= 6.5) return '#10b981';
    if (ph >= 5.5) return '#f59e0b';
    return '#ef4444';
  }

  if (ecoSubFilter === 'soil_type') {
    const st = (props.soilType || '').toLowerCase();
    const typeClass = subFilters.soilTypeClass;
    if (typeClass === 'gneiss' && !st.includes('gneiss')) return '#1e293b';
    if (typeClass === 'slate' && !st.includes('slate')) return '#1e293b';
    if (typeClass === 'quartzite' && !st.includes('quartzite')) return '#1e293b';
    if (typeClass === 'fluvial' && !(st.includes('fluvial') && st.includes('calcareous'))) return '#1e293b';
    if (typeClass === 'fluvial_non' && !(st.includes('fluvial') && !st.includes('calcareous'))) return '#1e293b';
    if (typeClass === 'colluvial' && !st.includes('colluvial')) return '#1e293b';
    if (typeClass === 'sandstone' && !st.includes('sandstone')) return '#1e293b';
    if (typeClass === 'lacustrine' && !st.includes('lacustrine')) return '#1e293b';
    if (st.includes('gneiss') || st.includes('migmatite')) return '#6366f1';
    if (st.includes('slate') || st.includes('phyllite')) return '#06b6d4';
    if (st.includes('quartzite')) return '#f59e0b';
    if (st.includes('fluvial') && st.includes('calcareous')) return '#10b981';
    if (st.includes('fluvial')) return '#14b8a6';
    if (st.includes('colluvial')) return '#0ea5e9';
    if (st.includes('sandstone')) return '#ec4899';
    if (st.includes('lacustrine')) return '#8b5cf6';
    return '#3b82f6';
  }

  return '#0284c7';
}

function getClimateMetricColor(val: number, metric: string): string {
  if (val === undefined || isNaN(val)) return '#1e293b';

  if (metric === 'prectot' || metric === 'prectot_max') {
    if (val >= 350) return '#0284c7';
    if (val >= 200) return '#0ea5e9';
    if (val >= 100) return '#38bdf8';
    if (val >= 30) return '#a5f3fc';
    if (val >= 10) return '#facc15';
    return '#ef4444';
  }

  if (metric.startsWith('t2m') || metric === 'ts') {
    if (val >= 32) return '#dc2626';
    if (val >= 26) return '#f97316';
    if (val >= 20) return '#f59e0b';
    if (val >= 14) return '#10b981';
    if (val >= 6) return '#06b6d4';
    if (val >= 0) return '#3b82f6';
    return '#8b5cf6';
  }

  if (metric.startsWith('ws')) {
    if (val >= 5.5) return '#6d28d9';
    if (val >= 4.0) return '#8b5cf6';
    if (val >= 2.8) return '#06b6d4';
    if (val >= 1.8) return '#10b981';
    return '#94a3b8';
  }

  if (metric === 'rh2m') {
    if (val >= 85) return '#0284c7';
    if (val >= 70) return '#10b981';
    if (val >= 50) return '#f59e0b';
    return '#ef4444';
  }

  if (metric === 'qv2m') {
    if (val >= 16) return '#0284c7';
    if (val >= 11) return '#10b981';
    if (val >= 6) return '#f59e0b';
    return '#ef4444';
  }

  if (metric === 'ps') {
    if (val >= 95) return '#0284c7';
    if (val >= 80) return '#10b981';
    return '#8b5cf6';
  }

  return '#0284c7';
}

function parseCommissionedYear(commStr?: string): number | null {
  if (!commStr) return null;
  const match = commStr.match(/\b(19\d\d|20\d\d)\b/);
  return match ? parseInt(match[1], 10) : null;
}

function getActiveHydroCapacityForYear(props: any, year: number): number {
  if (!props || !props.hydroStationsList || props.hydroStationsList.length === 0) return 0;

  let activeMW = 0;
  for (const st of props.hydroStationsList) {
    const commYear = parseCommissionedYear(st.commissioned);
    if (commYear !== null && commYear <= year) {
      activeMW += st.capacityMW;
    }
  }
  return Number(activeMW.toFixed(2));
}

function getEnergyInfrastructureColor(props: any, metric: string, climateYear: number): string {
  if (!props) return '#1e293b';

  if (metric === 'totalHydroCapacityMW') {
    const mw = getActiveHydroCapacityForYear(props, climateYear);
    if (mw >= 200) return '#6d28d9'; // Mega Powerhouse Deep Purple
    if (mw >= 80) return '#8b5cf6'; // High Capacity Hydro Violet
    if (mw >= 20) return '#06b6d4'; // Medium Capacity Cyan
    if (mw >= 1) return '#10b981'; // Small Hydro Emerald
    return '#1e293b';                // No Active Hydro Power Stations as of selected year
  }

  if (metric === 'nasaSolarRadiationKwh') {
    const yearlyMap = props.nasaSolarYearly || {};
    const solar = yearlyMap[climateYear] || props.nasaSolarRadiationKwh || props.solarRadiationKwh || 4.8;
    if (solar >= 5.0) return '#d97706'; // High Insolation Amber
    if (solar >= 4.4) return '#f59e0b'; // Good Solar Yellow
    if (solar >= 4.0) return '#eab308'; // Moderate Solar
    return '#38bdf8';                   // Lower Insolation
  }

  return '#8b5cf6';
}

function getSocioMetricColor(props: any, metric: string): string {
  if (!props) return '#1e293b';

  if (metric === 'national_road_network') {
    return '#0f172a'; // Base dark slate background for highway map
  }

  if (metric === 'popDensity') {
    const d = props.populationDensity ?? 180;
    if (d >= 1000) return '#7c3aed';
    if (d >= 300) return '#8b5cf6';
    if (d >= 100) return '#c084fc';
    return '#e9d5ff';
  }

  if (metric === 'laborRateNprPerDay') {
    const rate = props.laborRateNprPerDay ?? props.agriLaborMarketRateAvgNpr ?? 750;
    if (rate >= 950) return '#7c3aed'; // High Alpine Hardship / Remote Mountain (>950 NPR)
    if (rate >= 800) return '#f59e0b'; // Kathmandu Valley & Upper Hills (800-950 NPR)
    if (rate >= 680) return '#38bdf8'; // Mid-Hills Moderate (680-800 NPR)
    return '#10b981'; // Tarai Low Cost (<680 NPR)
  }

  if (metric === 'wealthIndexScore') {
    const w = props.wealthIndexScore ?? 50;
    if (w >= 75) return '#059669';
    if (w >= 55) return '#10b981';
    if (w >= 40) return '#f59e0b';
    return '#ef4444';
  }

  if (metric === 'agriLandholdingAvgHa') {
    const l = props.agriLandholdingAvgHa ?? 0.5;
    if (l >= 0.8) return '#10b981';
    if (l >= 0.5) return '#84cc16';
    if (l >= 0.35) return '#f59e0b';
    return '#ef4444';
  }

  if (metric === 'unemploymentRatePct') {
    const u = props.unemploymentRatePct ?? 11;
    if (u >= 14) return '#ef4444';
    if (u >= 11) return '#f59e0b';
    return '#10b981';
  }

  if (metric === 'literacyRatePct') {
    const lit = props.literacyRatePct ?? 70;
    if (lit >= 80) return '#0284c7';
    if (lit >= 68) return '#38bdf8';
    if (lit >= 58) return '#f59e0b';
    return '#ef4444';
  }

  if (metric === 'utilityAccessPct') {
    const util = props.utilityAccessPct ?? 65;
    if (util >= 85) return '#059669';
    if (util >= 65) return '#10b981';
    if (util >= 50) return '#f59e0b';
    return '#ef4444';
  }

  if (metric === 'roadDensityKmPerKm2') {
    const rd = props.roadDensityKmPerKm2 ?? 0.4;
    if (rd >= 1.0) return '#059669';
    if (rd >= 0.6) return '#10b981';
    if (rd >= 0.3) return '#f59e0b';
    return '#ef4444';
  }

  if (metric === 'avgDistanceToPavedRoadKm') {
    const dist = props.avgDistanceToPavedRoadKm ?? 10;
    if (dist <= 5) return '#059669';
    if (dist <= 15) return '#10b981';
    if (dist <= 30) return '#f59e0b';
    return '#ef4444';
  }

  if (metric === 'marketAccessIndex') {
    const mai = props.marketAccessIndex ?? 50;
    if (mai >= 80) return '#7c3aed';
    if (mai >= 60) return '#a855f7';
    if (mai >= 40) return '#c084fc';
    return '#e9d5ff';
  }

  if (metric === 'freightLogisticsTariffNprPerTonKm') {
    const t = props.freightLogisticsTariffNprPerTonKm ?? 20;
    if (t <= 15) return '#059669';
    if (t <= 25) return '#f59e0b';
    return '#ef4444';
  }

  return '#8b5cf6';
}

interface DistrictMapProps {
  onSelectDistrict: (district: District, palikaName?: string) => void;
  selectedDistrict: District | null;
  selectedPillar: WEFESPillar;
  setSelectedPillar: (pillar: WEFESPillar) => void;
  selectedMapCropId: string | null;
  subFilters?: Record<string, string>;
  onSubFilterChange: (filters: Record<string, string>) => void;
  climateDataset?: any;
}

function getDistrictFromProps(props: any): District {
  if (!props) {
    return {
      id: 'unknown',
      name: 'Unknown',
      nepaliName: '',
      province: 'Nepal',
      ecoZone: 'Hill',
      avgRainfallMm: 1500,
      solarRadiationKwh: 5.0,
      baseSoilPh: 6.5,
      laborRateNprPerDay: 750,
      coordinates: { lat: 28.0, lng: 84.0 },
    };
  }
  const dbDistrict = db.getDistrictById(props.id);
  if (dbDistrict) return dbDistrict;
  return {
    id: props.id || 'district',
    name: props.name || props.id || 'District',
    nepaliName: props.nepaliName || props.name || '',
    province: props.province || 'Nepal',
    ecoZone: props.ecoZone || 'Hill',
    avgRainfallMm: props.avgRainfallMm || 1500,
    solarRadiationKwh: props.solarRadiationKwh || props.nasaSolarRadiationKwh || 5.0,
    baseSoilPh: props.baseSoilPh,
    soilNitrogen: props.soilNitrogen,
    soilPhosphorus: props.soilPhosphorus,
    soilPotassium: props.soilPotassium,
    soilType: props.soilType,
    soilSampleCount: props.soilSampleCount,
    hasRealSoilData: props.hasRealSoilData ?? (props.soilSampleCount > 0),
    populationTotal: props.populationTotal,
    populationDensity: props.populationDensity,
    wealthIndexScore: props.wealthIndexScore,
    agriLandholdingAvgHa: props.agriLandholdingAvgHa,
    unemploymentRatePct: props.unemploymentRatePct,
    literacyRatePct: props.literacyRatePct,
    utilityAccessPct: props.utilityAccessPct,
    totalHydroCapacityMW: props.totalHydroCapacityMW,
    hydroStationCount: props.hydroStationCount,
    hydroStationsList: props.hydroStationsList,
    nasaSolarRadiationKwh: props.nasaSolarRadiationKwh,
    nasaSolarYearly: props.nasaSolarYearly,
    laborRateNprPerDay: props.laborRateNprPerDay || 750,
    coordinates: { lat: 28.0, lng: 84.0 },
    description: props.description || `${props.name} district in ${props.province}.`,
    physiographicRegion: props.physiographicRegion,
    climateZone: props.climateZone,
    elevationRange: props.elevationRange,
    feasibleCrops: props.feasibleCrops,
    feasibleVegetables: props.feasibleVegetables,
    feasibleFruits: props.feasibleFruits,
    feasibleSpicesCashCrops: props.feasibleSpicesCashCrops,
    feasibilityReasoning: props.feasibilityReasoning,
  };
}

export const DistrictMap: React.FC<DistrictMapProps> = ({
  onSelectDistrict,
  selectedDistrict,
  selectedPillar,
  setSelectedPillar,
  selectedMapCropId,
  subFilters = {},
  onSubFilterChange,
  climateDataset: initialClimateDataset,
}) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [climateDataset, setClimateDataset] = useState<any>(initialClimateDataset || null);
  const [geoLoading, setGeoLoading] = useState(true);
  const [hoveredDistrict, setHoveredDistrict] = useState<District | null>(null);

  // Time-Series Animation State (Defaults to latest year 2024)
  const [climateYear, setClimateYear] = useState<number>(2024);
  const [climateMonth, setClimateMonth] = useState<number>(12);
  const [climateMode, setClimateMode] = useState<'monthly' | 'annual' | 'climatology'>('monthly');

  const cropSuitabilityMap = React.useMemo<Record<string, number>>(() => {
    if (selectedPillar !== 'food' || !selectedMapCropId) return {};
    const crop = db.getCropById(selectedMapCropId);
    if (!crop) return {};
    const result: Record<string, number> = {};
    db.getAllDistricts().forEach(d => {
      result[d.id] = computeCropSuitability(d, crop).suitabilityScore;
    });
    return result;
  }, [selectedPillar, selectedMapCropId]);

  const [hydrologyStations, setHydrologyStations] = useState<any[]>([]);
  const [glacialLakes, setGlacialLakes] = useState<any[]>([]);
  const [nationalRoads, setNationalRoads] = useState<any>(null);
  const [showRoadOverlay, setShowRoadOverlay] = useState<boolean>(false);

  const [palikasData, setPalikasData] = useState<any>(null);
  const [hoveredPalika, setHoveredPalika] = useState<any>(null);
  const [showSoilGrid, setShowSoilGrid] = useState<boolean>(true);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  // Landing Page Suite State
  const [lang, setLang] = useState<'en' | 'np'>('en');
  const [basemap, setBasemap] = useState<'voyager' | 'satellite' | 'terrain'>('voyager');
  const [showPalikaLabels, setShowPalikaLabels] = useState<boolean>(true);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'matrix' | 'elevation' | 'radar' | null>(null);

  // Search autocomplete handler
  const handleSearchSelect = (type: 'palika' | 'filter' | 'crop', value: string) => {
    if (type === 'palika') {
      const gulmiPalikas = DISTRICT_PALIKAS['gulmi'] || [];
      const found = gulmiPalikas.find(p => p.name.toLowerCase() === value.toLowerCase());
      if (found) {
        setHoveredPalika({
          name: found.name,
          nepaliName: PALIKA_CENTROIDS[found.name]?.nepali || found.name,
          type: found.unitType || 'Palika',
          elevation: found.elevation,
          soilPh: found.soilPh
        });
      }
    } else if (type === 'crop') {
      setSelectedPillar('food');
      onSubFilterChange({ foodMode: 'single_crop', crop: value });
    } else if (type === 'filter') {
      if (['river_basins', 'spring_vulnerability', 'irrigation_potential'].includes(value)) {
        setSelectedPillar('water');
        onSubFilterChange({ waterSubFilter: value });
      } else if (['soil_ph', 'elevation_zones', 'agroforestry_belt'].includes(value)) {
        setSelectedPillar('ecosystem');
        onSubFilterChange({ ecoSubFilter: value });
      } else if (['hydro_corridor', 'solar_irradiance', 'clean_cooking_biomass'].includes(value)) {
        setSelectedPillar('energy');
        onSubFilterChange({ energySubFilter: value });
      } else if (['local_governance', 'hq_market_proximity', 'agri_landholding', 'labor_wages'].includes(value)) {
        setSelectedPillar('socioeconomics');
        onSubFilterChange({ socioSubFilter: value });
      }
    }
  };

  // 1-Click Policy Preset Handler
  const handleApplyPreset = (pillar: WEFESPillar, presetFilters: Record<string, string>, cropId?: string) => {
    setSelectedPillar(pillar);
    onSubFilterChange(presetFilters);
  };

  const [liveWeather, setLiveWeather] = useState<LiveGulmiWeather | null>(null);
  const [liveWeatherLoading, setLiveWeatherLoading] = useState<boolean>(true);
  const [weatherMode, setWeatherMode] = useState<'live' | 'archive'>('live');

  // Fetch real-time live satellite weather for Gulmi district coordinates
  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=28.068&longitude=83.248&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,wind_speed_10m,direct_radiation,cloud_cover,is_day&timezone=Asia%2FKathmandu')
      .then(res => res.json())
      .then(data => {
        if (data && data.current) {
          setLiveWeather({
            temperature: Number(data.current.temperature_2m.toFixed(1)),
            apparentTemp: Number(data.current.apparent_temperature.toFixed(1)),
            humidity: Math.round(data.current.relative_humidity_2m),
            precipitation: Number(data.current.precipitation.toFixed(1)),
            windSpeed: Number((data.current.wind_speed_10m / 3.6).toFixed(1)),
            solarRadiation: Math.round(data.current.direct_radiation || 0),
            cloudCover: Math.round(data.current.cloud_cover || 0),
            isDay: data.current.is_day === 1,
            time: data.current.time,
          });
        }
        setLiveWeatherLoading(false);
      })
      .catch(() => {
        setLiveWeatherLoading(false);
      });
  }, []);

  // Palika Quick Matrix Handlers
  const handleSelectPalikaFromMatrix = (palikaName: string) => {
    const gulmiDistrict = db.getDistrictById('gulmi');
    if (gulmiDistrict) onSelectDistrict(gulmiDistrict, palikaName);
  };

  const handleHoverPalikaFromMatrix = (palikaName: string | null) => {
    if (!palikaName) {
      setHoveredPalika(null);
      return;
    }
    const gulmiPalikas = DISTRICT_PALIKAS['gulmi'] || [];
    const found = gulmiPalikas.find(p => p.name.toLowerCase() === palikaName.toLowerCase());
    if (found) {
      setHoveredPalika({
        name: found.name,
        nepaliName: PALIKA_CENTROIDS[found.name]?.nepali || found.name,
        type: found.unitType || 'Palika',
        elevation: found.elevation,
        soilPh: found.soilPh
      });
    }
  };

  useEffect(() => {
    if (initialClimateDataset) {
      setClimateDataset(initialClimateDataset);
    }
  }, [initialClimateDataset]);

  useEffect(() => {
    Promise.all([
      fetch('/geojson/gulmi-district.json').then(r => r.json()).catch(() => null),
      fetch('/geojson/gulmi-palikas.json').then(r => r.json()).catch(() => null),
      initialClimateDataset ? Promise.resolve(initialClimateDataset) : fetch('/geojson/gulmi-climate-monthly.json').then(r => r.json()).catch(() => null),
      fetch('/geojson/roads/gulmi.json').then(r => r.json()).catch(() => null),
    ]).then(([geo, palikas, climate, roads]) => {
      if (geo) setGeoData(geo);
      if (palikas) setPalikasData(palikas);
      if (climate) setClimateDataset(climate);
      if (roads) setNationalRoads(roads);
      setGeoLoading(false);
    }).catch(() => setGeoLoading(false));
  }, [initialClimateDataset]);

  const getActiveClimateMetricKey = (): string | null => {
    if (selectedPillar === 'water') return subFilters.waterClimateMetric || 'prectot';
    if (selectedPillar === 'energy') {
      const eMetric = subFilters.energyClimateMetric || 'totalHydroCapacityMW';
      if (eMetric === 'ws50m' || eMetric === 'ws50mMax' || eMetric === 'ts') return eMetric;
      return null;
    }
    if (selectedPillar === 'ecosystem') {
      const ecoSub = subFilters.ecoSubFilter || 'soil_nitrogen';
      if (!ecoSub.startsWith('soil_')) {
        if (ecoSub === 'prectot_max') return 'prectot';
        if (ecoSub === 't2m_max') return 't2mMax';
        if (ecoSub === 't2m_min') return 't2mMin';
        if (ecoSub === 't2m_range') return 't2mRange';
        if (ecoSub === 'ws10m_max') return 'ws10mMax';
        if (ecoSub === 'ws50m_max') return 'ws50mMax';
        return ecoSub;
      }
    }
    return null;
  };

  const getClimateMetricValue = (distId: string, metricKey: string): number | undefined => {
    if (!climateDataset) return undefined;

    if (climateMode === 'climatology') {
      const clim = climateDataset.climatologyMap?.[distId]?.[climateMonth];
      return clim ? clim[metricKey] : undefined;
    }

    if (climateMode === 'annual') {
      const targetYear = climateYear > 2019 ? 2019 : climateYear;
      const yrMap = climateDataset.climateMap?.[distId]?.[targetYear];
      if (!yrMap) return undefined;
      let sum = 0, count = 0;
      for (let m = 1; m <= 12; m++) {
        if (yrMap[m] && yrMap[m][metricKey] !== undefined) {
          sum += yrMap[m][metricKey];
          count++;
        }
      }
      return count > 0 ? Number((sum / count).toFixed(2)) : undefined;
    }

    const targetYear = climateYear > 2019 ? 2019 : climateYear;
    const mData = climateDataset.climateMap?.[distId]?.[targetYear]?.[climateMonth]
      || climateDataset.climatologyMap?.[distId]?.[climateMonth];
    return mData ? mData[metricKey] : undefined;
  };

  // Base District Map Style - Dims all non-Gulmi districts
  const getStyle = (feature: any) => {
    const props = feature?.properties;
    if (!props) return { fillColor: '#334155', weight: 1, color: '#475569', fillOpacity: 0.6 };

    const isGulmi = props.id === 'gulmi';

    // Completely dim and disable all other districts
    if (!isGulmi) {
      return {
        fillColor: '#f1f5f9',
        weight: 0.8,
        opacity: 0.45,
        color: '#cbd5e1',
        fillOpacity: 0.12,
        dashArray: '3, 4',
      };
    }

    // Outer Gulmi District boundary: transparent so the 12 survey-aligned Palikas fill it seamlessly
    return {
      fillColor: 'transparent',
      weight: 0,
      opacity: 0,
      color: 'transparent',
      fillOpacity: 0,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const props = feature.properties;
    if (!props || props.id !== 'gulmi') {
      // Disable interaction on all other districts
      (layer as any).options.interactive = false;
      return;
    }

    layer.on({
      click: () => {
        const full = getDistrictFromProps(props);
        onSelectDistrict(full);
      },
      mouseover: (e: any) => {
        e.target.setStyle({
          weight: 4,
          color: '#10b981',
        });
        const full = getDistrictFromProps(props);
        setHoveredDistrict(full);
      },
      mouseout: (e: any) => {
        const defaultStyle = getStyle(feature);
        e.target.setStyle(defaultStyle);
        setHoveredDistrict(null);
      },
    });
  };

  // Live Climate Telemetry for Gulmi District (MERRA-2 & NASA POWER)
  const currentRainMm = climateDataset ? Math.round(
    climateMode === 'climatology'
      ? climateDataset.climatologyMap?.['gulmi']?.[climateMonth]?.prectot ?? 150
      : (climateDataset.climateMap?.['gulmi']?.[climateYear > 2019 ? 2019 : climateYear]?.[climateMonth]?.prectot
        ?? climateDataset.climatologyMap?.['gulmi']?.[climateMonth]?.prectot ?? 150)
  ) : 150;

  const currentTempC = climateDataset ? Number((
    climateMode === 'climatology'
      ? climateDataset.climatologyMap?.['gulmi']?.[climateMonth]?.t2m ?? 19.5
      : (climateDataset.climateMap?.['gulmi']?.[climateYear > 2019 ? 2019 : climateYear]?.[climateMonth]?.t2m
        ?? climateDataset.climatologyMap?.['gulmi']?.[climateMonth]?.t2m ?? 19.5)
  ).toFixed(1)) : 19.5;

  const currentTempMax = climateDataset ? Number((
    climateMode === 'climatology'
      ? climateDataset.climatologyMap?.['gulmi']?.[climateMonth]?.t2mMax ?? 23.5
      : (climateDataset.climateMap?.['gulmi']?.[climateYear > 2019 ? 2019 : climateYear]?.[climateMonth]?.t2mMax
        ?? climateDataset.climatologyMap?.['gulmi']?.[climateMonth]?.t2mMax ?? 23.5)
  ).toFixed(1)) : 23.5;

  const currentTempMin = climateDataset ? Number((
    climateMode === 'climatology'
      ? climateDataset.climatologyMap?.['gulmi']?.[climateMonth]?.t2mMin ?? 16.2
      : (climateDataset.climateMap?.['gulmi']?.[climateYear > 2019 ? 2019 : climateYear]?.[climateMonth]?.t2mMin
        ?? climateDataset.climatologyMap?.['gulmi']?.[climateMonth]?.t2mMin ?? 16.2)
  ).toFixed(1)) : 16.2;

  const currentHumidity = climateDataset ? Math.round(
    climateMode === 'climatology'
      ? climateDataset.climatologyMap?.['gulmi']?.[climateMonth]?.rh2m ?? 80
      : (climateDataset.climateMap?.['gulmi']?.[climateYear > 2019 ? 2019 : climateYear]?.[climateMonth]?.rh2m
        ?? climateDataset.climatologyMap?.['gulmi']?.[climateMonth]?.rh2m ?? 80)
  ) : 80;

  const currentWind = climateDataset ? Number((
    climateMode === 'climatology'
      ? climateDataset.climatologyMap?.['gulmi']?.[climateMonth]?.ws10m ?? 2.5
      : (climateDataset.climateMap?.['gulmi']?.[climateYear > 2019 ? 2019 : climateYear]?.[climateMonth]?.ws10m
        ?? climateDataset.climatologyMap?.['gulmi']?.[climateMonth]?.ws10m ?? 2.5)
  ).toFixed(1)) : 2.5;

  const currentSeason = [6, 7, 8, 9].includes(climateMonth)
    ? 'Monsoon Peak'
    : [10, 11].includes(climateMonth)
      ? 'Post-Monsoon'
      : [12, 1, 2].includes(climateMonth)
        ? 'Winter Dry'
        : 'Pre-Monsoon Spring';

  // Dynamic Palika Color Resolution based on active Gulmi Micro-Intelligence Suite
  const getGulmiPalikaColor = (props: any) => {
    if (!props) return '#059669';
    const palikaName = (props.name || '').toLowerCase();
    const gulmiPalikas = DISTRICT_PALIKAS['gulmi'] || [];
    const pData = gulmiPalikas.find(
      p => p.name.toLowerCase() === palikaName ||
        palikaName.includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(palikaName)
    );

    // ==========================================
    // 1. FOOD PILLAR (Gulmi Signature Agro-Economy)
    // ==========================================
    if (selectedPillar === 'food') {
      const foodMode = subFilters.foodMode || (selectedMapCropId ? 'single_crop' : 'single_crop');

      if (foodMode === 'single_crop') {
        const cropId = selectedMapCropId || subFilters.crop || 'coffee';
        if (pData?.feasibleCrops) {
          const c = pData.feasibleCrops.find(
            fc => fc.cropId.toLowerCase() === cropId.toLowerCase() ||
              cropId.toLowerCase().includes(fc.cropId.toLowerCase())
          );
          if (c) {
            if (c.score >= 90) return '#047857'; // Tier 1: ≥90% Optimal Prime Pocket
            if (c.score >= 80) return '#059669'; // Tier 2: 80–89% Very High Suitability
            if (c.score >= 70) return '#10b981'; // Tier 3: 70–79% High Suitability
            if (c.score >= 60) return '#14b8a6'; // Tier 4: 60–69% Moderate-High
            if (c.score >= 45) return '#f59e0b'; // Tier 5: 45–59% Marginal / Secondary
            return '#ef4444';                  // Tier 6: <45% Severely Constrained
          }
        }
        // Fallbacks for signature Gulmi crops across 6 tiers
        if (cropId === 'coffee') {
          if (['ruru', 'chatrakot', 'satyawati', 'gulmidarbar'].some(n => palikaName.includes(n))) return '#047857'; // Tier 1: ≥90% Optimal Prime Belt (92–97%)
          if (['resunga', 'dhurkot', 'isma'].some(n => palikaName.includes(n))) return '#059669'; // Tier 2: 80–89% Very High Suitability (80–88%)
          if (['chandrakot'].some(n => palikaName.includes(n))) return '#10b981'; // Tier 3: 70–79% High Suitability (74%)
          if (['musikot'].some(n => palikaName.includes(n))) return '#14b8a6'; // Tier 4: 60–69% Moderate-High (68%)
          if (['malika', 'kaligandaki'].some(n => palikaName.includes(n))) return '#f59e0b'; // Tier 5: 45–59% Marginal / Sub-Optimal (52–58%)
          return '#ef4444'; // Tier 6: <45% Constrained High Frost (Madane 42%)
        }
        if (cropId === 'orange') {
          if (['dhurkot', 'resunga', 'chatrakot', 'gulmidarbar', 'musikot'].some(n => palikaName.includes(n))) return '#047857'; // Tier 1: ≥90%
          if (['satyawati', 'isma', 'ruru', 'chandrakot'].some(n => palikaName.includes(n))) return '#059669'; // Tier 2: 80–89%
          if (['malika'].some(n => palikaName.includes(n))) return '#10b981'; // Tier 3: 70–79%
          if (['kaligandaki'].some(n => palikaName.includes(n))) return '#14b8a6'; // Tier 4: 60–69%
          if (['madane'].some(n => palikaName.includes(n))) return '#f59e0b'; // Tier 5: 45–59%
          return '#ef4444';
        }
        if (cropId === 'ginger') {
          if (['kaligandaki', 'satyawati', 'ruru', 'chatrakot'].some(n => palikaName.includes(n))) return '#047857'; // Tier 1: ≥90%
          if (['gulmidarbar', 'musikot', 'chandrakot', 'dhurkot'].some(n => palikaName.includes(n))) return '#059669'; // Tier 2: 80–89%
          if (['isma', 'resunga'].some(n => palikaName.includes(n))) return '#10b981'; // Tier 3: 70–79%
          if (['malika'].some(n => palikaName.includes(n))) return '#14b8a6'; // Tier 4: 60–69%
          if (['madane'].some(n => palikaName.includes(n))) return '#f59e0b'; // Tier 5: 45–59%
          return '#ef4444';
        }
        if (cropId === 'potato') {
          if (['madane', 'malika', 'resunga', 'chandrakot', 'isma', 'dhurkot'].some(n => palikaName.includes(n))) return '#047857'; // Tier 1: ≥90%
          if (['gulmidarbar', 'satyawati', 'chatrakot', 'musikot'].some(n => palikaName.includes(n))) return '#059669'; // Tier 2: 80–89%
          if (['ruru'].some(n => palikaName.includes(n))) return '#10b981'; // Tier 3: 70–79%
          if (['kaligandaki'].some(n => palikaName.includes(n))) return '#14b8a6'; // Tier 4: 60–69%
          return '#f59e0b';
        }
        if (cropId === 'buckwheat') {
          if (['madane', 'malika', 'chandrakot'].some(n => palikaName.includes(n))) return '#047857';
          if (['isma', 'dhurkot', 'resunga', 'gulmidarbar'].some(n => palikaName.includes(n))) return '#059669';
          if (['chatrakot', 'satyawati', 'ruru', 'musikot'].some(n => palikaName.includes(n))) return '#10b981';
          if (['kaligandaki'].some(n => palikaName.includes(n))) return '#f59e0b';
          return '#ef4444';
        }
        if (cropId === 'rice') {
          if (['kaligandaki', 'musikot', 'ruru'].some(n => palikaName.includes(n))) return '#047857';
          if (['satyawati', 'chatrakot', 'dhurkot'].some(n => palikaName.includes(n))) return '#059669';
          if (['gulmidarbar', 'chandrakot', 'resunga'].some(n => palikaName.includes(n))) return '#10b981';
          if (['isma'].some(n => palikaName.includes(n))) return '#14b8a6';
          if (['malika'].some(n => palikaName.includes(n))) return '#f59e0b';
          return '#ef4444'; // Madane (<45%)
        }
        if (cropId === 'cardamom') {
          if (['chandrakot', 'malika', 'resunga'].some(n => palikaName.includes(n))) return '#047857';
          if (['dhurkot', 'satyawati', 'chatrakot', 'isma', 'madane', 'gulmidarbar'].some(n => palikaName.includes(n))) return '#059669';
          if (['ruru', 'musikot'].some(n => palikaName.includes(n))) return '#10b981';
          if (['kaligandaki'].some(n => palikaName.includes(n))) return '#f59e0b';
          return '#ef4444';
        }
        return '#059669';
      }

      if (foodMode === 'barkhe_summer') {
        if (['kaligandaki', 'musikot'].some(n => palikaName.includes(n))) return '#047857'; // ≥90% Prime Irrigated Valleys
        if (['ruru', 'satyawati'].some(n => palikaName.includes(n))) return '#059669'; // 80–89% Alluvial Terraces
        if (['dhurkot', 'chatrakot'].some(n => palikaName.includes(n))) return '#10b981'; // 70–79% Agroforestry Terraces
        if (['chandrakot', 'gulmidarbar'].some(n => palikaName.includes(n))) return '#14b8a6'; // 60–69% Rainfed Slopes
        if (['isma', 'malika'].some(n => palikaName.includes(n))) return '#f59e0b'; // 50–59% High Upland
        return '#ef4444'; // <50% High Ridge Runoff
      }

      if (foodMode === 'hiunde_winter') {
        if (['dhurkot', 'resunga'].some(n => palikaName.includes(n))) return '#047857'; // ≥90% Optimal Winter Niche
        if (['chatrakot', 'gulmidarbar'].some(n => palikaName.includes(n))) return '#059669'; // 80–89% High Cold-Hardy Zone
        if (['chandrakot', 'musikot'].some(n => palikaName.includes(n))) return '#10b981'; // 70–79% Mid-Hill Winter Terraces
        if (['isma', 'ruru'].some(n => palikaName.includes(n))) return '#14b8a6'; // 60–69% Temperate Highlands
        if (['satyawati', 'kaligandaki'].some(n => palikaName.includes(n))) return '#f59e0b'; // 50–59% Low-Moisture Slopes
        return '#ef4444'; // <50% Severe Frost Ridges
      }

      if (foodMode === 'double_cropping') {
        if (['kaligandaki', 'musikot'].some(n => palikaName.includes(n))) return '#047857'; // 300% Triple-Cropping (Perennial)
        if (['ruru', 'satyawati'].some(n => palikaName.includes(n))) return '#059669'; // 250% Intensive Double-to-Triple
        if (['dhurkot', 'chatrakot'].some(n => palikaName.includes(n))) return '#10b981'; // 200% Standard Double-Cropping
        if (['chandrakot', 'gulmidarbar'].some(n => palikaName.includes(n))) return '#14b8a6'; // 175% Semi-Irrigated Double
        if (['isma', 'malika'].some(n => palikaName.includes(n))) return '#f59e0b'; // 130% Single-to-Double Rainfed
        return '#ef4444'; // 100% Strict Single Crop Slopes
      }

      return '#059669';
    }

    // ==========================================
    // 2. WATER PILLAR (Gulmi Hydrology & Basins)
    // ==========================================
    if (selectedPillar === 'water') {
      const wSub = subFilters.waterSubFilter || 'merra_rainfall';

      if (wSub === 'river_basins') {
        if (['kaligandaki'].some(n => palikaName.includes(n))) return '#0369a1'; // Kali Gandaki Mainstem
        if (['satyawati', 'ruru'].some(n => palikaName.includes(n))) return '#0284c7'; // Kali Gandaki Confluence
        if (['musikot', 'isma'].some(n => palikaName.includes(n))) return '#0ea5e9'; // Badigad River Corridor
        if (['resunga', 'gulmidarbar', 'chatrakot'].some(n => palikaName.includes(n))) return '#06b6d4'; // Ridi Khola Sub-Basin
        if (['chandrakot'].some(n => palikaName.includes(n))) return '#38bdf8'; // Hugdi Khola Catchment
        return '#3b82f6'; // Panaha & Chhaldi Basins (Dhurkot, Malika, Madane)
      }

      if (wSub === 'dhm_station') {
        if (['kaligandaki'].some(n => palikaName.includes(n))) return '#0284c7'; // Seti Beni DHM Station #410 Primary
        if (['satyawati', 'ruru'].some(n => palikaName.includes(n))) return '#0ea5e9'; // Downstream Direct Catchment
        if (['musikot', 'isma'].some(n => palikaName.includes(n))) return '#06b6d4'; // Badigad Gauging Inflow
        if (['chandrakot', 'chatrakot'].some(n => palikaName.includes(n))) return '#38bdf8'; // Middle Tributaries
        if (['gulmidarbar', 'dhurkot'].some(n => palikaName.includes(n))) return '#94a3b8'; // Headwater Tributaries
        return '#64748b'; // Distant Highland Catchment (Madane, Malika, Resunga)
      }

      if (wSub === 'spring_vulnerability') {
        if (['madane'].some(n => palikaName.includes(n))) return '#991b1b'; // Extreme Risk (>85% Dry-up Risk)
        if (['resunga', 'malika'].some(n => palikaName.includes(n))) return '#ef4444'; // Severe Risk (70–85% Reduction)
        if (['isma'].some(n => palikaName.includes(n))) return '#f97316'; // Moderate-High Risk (50–70% Seasonal Drop)
        if (['dhurkot', 'gulmidarbar'].some(n => palikaName.includes(n))) return '#f59e0b'; // Moderate Risk (30–50% Depletion)
        if (['chatrakot', 'chandrakot'].some(n => palikaName.includes(n))) return '#10b981'; // Low Risk (15–30% Variance)
        return '#059669'; // Secure / Perennial (<15% Fluctuation: Kaligandaki, Satyawati, Ruru, Musikot)
      }

      if (wSub === 'irrigation_potential') {
        if (['musikot', 'kaligandaki'].some(n => palikaName.includes(n))) return '#047857'; // Deep Lift Electric (>150 ha)
        if (['ruru', 'satyawati'].some(n => palikaName.includes(n))) return '#059669'; // Medium River Lift (75–150 ha)
        if (['dhurkot', 'chatrakot'].some(n => palikaName.includes(n))) return '#10b981'; // Perennial Canal Kulo (30–75 ha)
        if (['chandrakot', 'gulmidarbar'].some(n => palikaName.includes(n))) return '#14b8a6'; // Spring Diversion Tank (15–30 ha)
        if (['isma', 'malika'].some(n => palikaName.includes(n))) return '#f59e0b'; // Conservation Pond / Drip (5–15 ha)
        return '#ef4444'; // Strictly Rainfed (<5 ha: Madane, Resunga Ridge)
      }

      // Default: Dynamic MERRA-2 Topographically Downscaled Rainfall across 6 Tiers
      const micro = getPalikaMicroClimate(palikaName, currentRainMm, currentTempC, climateMonth, pData?.elevation);
      const factor = micro.orographicFactor;

      if (factor >= 1.19) return '#0369a1'; // Tier 1: Peak Ridge Lekh (+20% to +24% Uplift: Madane, Resunga)
      if (factor >= 1.10) return '#0284c7'; // Tier 2: High Mountain Ridge (+12% to +16%: Malika, Chandrakot)
      if (factor >= 1.03) return '#0ea5e9'; // Tier 3: Upper Mid-Hill (+4% to +6%: Isma, Dhurkot)
      if (factor >= 0.96) return '#38bdf8'; // Tier 4: Central Mid-Hill Baseline (-2% to +1%: Gulmidarbar, Satyawati)
      if (factor >= 0.90) return '#f59e0b'; // Tier 5: Lower Valley Transition (-6% to -8%: Musikot, Chatrakot)
      return '#ea580c';                      // Tier 6: Subtropical Riverbed (-12% to -18%: Ruru, Kaligandaki)
    }

    // ==========================================
    // 3. ECOSYSTEM & SOIL PILLAR (Gulmi Relief & Soils)
    // ==========================================
    if (selectedPillar === 'ecosystem') {
      const ecoSub = subFilters.ecoSubFilter || 'soil_ph';

      if (ecoSub === 'soil_ph') {
        const ph = pData?.soilPh || 6.5;
        if (ph >= 7.0) return '#0284c7'; // Tier 1: Neutral-Alkaline Valley Alluvium (Ruru 7.1)
        if (ph >= 6.6) return '#059669'; // Tier 2: Optimum Neutral Agricultural (Kaligandaki 6.9, Satyawati 6.8, Chandrakot 6.7, Musikot 6.6)
        if (ph >= 6.2) return '#10b981'; // Tier 3: Slightly Acidic Agroforestry (Chatrakot 6.4, Gulmidarbar 6.3, Resunga 6.2)
        if (ph >= 5.8) return '#84cc16'; // Tier 4: Moderately Acidic (Dhurkot 6.1, Isma 5.9)
        if (ph >= 5.4) return '#f59e0b'; // Tier 5: Strongly Acidic / Lime Needed (Malika 5.7, Madane 5.4)
        return '#ef4444';                  // Tier 6: Highly Acidic (<5.4)
      }

      if (ecoSub === 'elevation_zones') {
        const elev = pData?.elevation || 1450;
        if (elev >= 1700) return '#4c1d95'; // Tier 1: >1,700m Alpine Ridges (Madane 1740m, Resunga Peak)
        if (elev >= 1550) return '#7c3aed'; // Tier 2: 1,550–1,700m Cool Temperate (Malika 1680m, Chandrakot 1603m)
        if (elev >= 1450) return '#0284c7'; // Tier 3: 1,450–1,550m Coffee Belt (Resunga 1530m, Dhurkot 1520m, Isma 1480m)
        if (elev >= 1200) return '#0ea5e9'; // Tier 4: 1,200–1,450m Mid-Hill Slopes (Chatrakot 1420m, Gulmidarbar 1350m)
        if (elev >= 950) return '#10b981';  // Tier 5: 950–1,200m Lower Mid-Hills (Musikot 1120m, Satyawati 980m)
        return '#059669';                   // Tier 6: <950m Subtropical Riverbed (Ruru 935m, Kaligandaki 890m)
      }

      if (ecoSub === 'agroforestry_belt') {
        if (['resunga'].some(n => palikaName.includes(n))) return '#047857'; // >65% Forest Sanctuary
        if (['madane', 'malika'].some(n => palikaName.includes(n))) return '#059669'; // 55–65% Dense Pine/Sal
        if (['dhurkot', 'chandrakot'].some(n => palikaName.includes(n))) return '#10b981'; // 45–54% Agroforestry
        if (['chatrakot', 'isma'].some(n => palikaName.includes(n))) return '#84cc16'; // 35–44% Terrace Farming
        if (['gulmidarbar', 'satyawati'].some(n => palikaName.includes(n))) return '#f59e0b'; // 25–34% Intensive Slopes
        return '#0ea5e9'; // <25% Riverbed Farmland (Musikot, Ruru, Kaligandaki)
      }

      if (ecoSub === 'soil_nitrogen') {
        if (['kaligandaki'].some(n => palikaName.includes(n))) return '#047857'; // ≥0.22% Very High
        if (['satyawati', 'ruru'].some(n => palikaName.includes(n))) return '#059669'; // 0.18–0.21% High
        if (['musikot', 'chandrakot'].some(n => palikaName.includes(n))) return '#10b981'; // 0.14–0.17% Medium-High
        if (['chatrakot', 'gulmidarbar'].some(n => palikaName.includes(n))) return '#84cc16'; // 0.10–0.13% Medium
        if (['dhurkot', 'isma'].some(n => palikaName.includes(n))) return '#f59e0b'; // 0.06–0.09% Low
        return '#ef4444'; // <0.06% Low Nitrogen (Malika, Madane)
      }

      if (ecoSub === 'soil_phosphorus') {
        if (['ruru', 'kaligandaki'].some(n => palikaName.includes(n))) return '#0284c7'; // ≥45 kg/ha High
        if (['satyawati', 'musikot'].some(n => palikaName.includes(n))) return '#0ea5e9'; // 35–44 kg/ha Adequate
        if (['chatrakot', 'chandrakot'].some(n => palikaName.includes(n))) return '#38bdf8'; // 25–34 kg/ha Medium
        if (['gulmidarbar', 'dhurkot'].some(n => palikaName.includes(n))) return '#7dd3fc'; // 18–24 kg/ha Low-Medium
        if (['isma', 'resunga'].some(n => palikaName.includes(n))) return '#f59e0b'; // 12–17 kg/ha Low
        return '#ef4444'; // <12 kg/ha Deficient (Malika, Madane)
      }

      if (ecoSub === 'soil_potassium') {
        if (['satyawati', 'kaligandaki'].some(n => palikaName.includes(n))) return '#0284c7'; // ≥220 kg/ha Very High
        if (['ruru', 'musikot'].some(n => palikaName.includes(n))) return '#0ea5e9'; // 180–219 kg/ha High
        if (['chandrakot', 'chatrakot'].some(n => palikaName.includes(n))) return '#38bdf8'; // 140–179 kg/ha Adequate
        if (['gulmidarbar', 'dhurkot'].some(n => palikaName.includes(n))) return '#7dd3fc'; // 110–139 kg/ha Medium
        if (['isma', 'resunga'].some(n => palikaName.includes(n))) return '#f59e0b'; // 80–109 kg/ha Low
        return '#ef4444'; // <80 kg/ha Leached Slopes (Malika, Madane)
      }

      return '#059669';
    }

    // ==========================================
    // 4. ENERGY PILLAR (Gulmi Energy Infrastructure)
    // ==========================================
    if (selectedPillar === 'energy') {
      const eSub = subFilters.energySubFilter || 'hydro_corridor';

      if (eSub === 'hydro_corridor') {
        if (['kaligandaki'].some(n => palikaName.includes(n))) return '#4c1d95'; // >20 MW Major Corridor
        if (['musikot'].some(n => palikaName.includes(n))) return '#6d28d9'; // 10–20 MW Commercial Cascade
        if (['ruru', 'satyawati'].some(n => palikaName.includes(n))) return '#8b5cf6'; // 3–10 MW Small Hydro
        if (['dhurkot', 'chandrakot'].some(n => palikaName.includes(n))) return '#a855f7'; // 1–3 MW Mini Hydro
        if (['chatrakot', 'gulmidarbar'].some(n => palikaName.includes(n))) return '#c084fc'; // 100–1000 kW Micro Hydro
        return '#d8b4fe'; // <100 kW Solar/Wind Hybrid (Isma, Malika, Madane)
      }

      if (eSub === 'solar_irradiance') {
        if (['resunga', 'madane'].some(n => palikaName.includes(n))) return '#b45309'; // ≥5.3 kWh/m²/d Optimal Ridge
        if (['malika', 'chandrakot'].some(n => palikaName.includes(n))) return '#d97706'; // 5.0–5.2 kWh/m²/d High Solar
        if (['dhurkot', 'isma'].some(n => palikaName.includes(n))) return '#f59e0b'; // 4.7–4.9 kWh/m²/d Good Mid-Hill
        if (['chatrakot', 'gulmidarbar'].some(n => palikaName.includes(n))) return '#fbbf24'; // 4.4–4.6 kWh/m²/d Moderate
        if (['musikot', 'satyawati'].some(n => palikaName.includes(n))) return '#fde047'; // 4.0–4.3 kWh/m²/d Lower Valley
        return '#fef08a'; // <4.0 kWh/m²/d Shaded Gorge (Ruru, Kaligandaki)
      }

      if (eSub === 'clean_cooking_biomass') {
        if (['madane'].some(n => palikaName.includes(n))) return '#991b1b'; // >88% Extreme Firewood
        if (['malika', 'isma'].some(n => palikaName.includes(n))) return '#ef4444'; // 80–88% High Reliance
        if (['dhurkot', 'chandrakot'].some(n => palikaName.includes(n))) return '#f97316'; // 72–79% Moderate-High
        if (['chatrakot', 'satyawati'].some(n => palikaName.includes(n))) return '#f59e0b'; // 65–71% Transitioning
        if (['gulmidarbar', 'ruru', 'kaligandaki'].some(n => palikaName.includes(n))) return '#84cc16'; // 55–64% Modern Adoption
        return '#059669'; // <55% Clean Cooking (Resunga, Musikot)
      }

      if (eSub === 'grid_electrification') {
        if (['resunga'].some(n => palikaName.includes(n))) return '#047857'; // ≥98% 33kV Substation Core
        if (['musikot', 'gulmidarbar'].some(n => palikaName.includes(n))) return '#059669'; // 92–97% Primary 11kV Radial
        if (['chatrakot', 'ruru'].some(n => palikaName.includes(n))) return '#10b981'; // 85–91% Municipal Main Line
        if (['dhurkot', 'chandrakot'].some(n => palikaName.includes(n))) return '#84cc16'; // 75–84% Secondary Feeders
        if (['isma', 'satyawati', 'kaligandaki'].some(n => palikaName.includes(n))) return '#f59e0b'; // 65–74% Feeder Tails
        return '#ef4444'; // <65% Off-Grid Pockets (Madane, Malika)
      }

      return '#6d28d9';
    }

    // ==========================================
    // 5. SOCIOECONOMICS PILLAR (Gulmi Governance & Roads)
    // ==========================================
    if (selectedPillar === 'socioeconomics') {
      const sSub = subFilters.socioSubFilter || 'local_governance';

      if (sSub === 'local_governance') {
        if (['resunga'].some(n => palikaName.includes(n))) return '#3730a3'; // District Administrative Capital
        if (['musikot'].some(n => palikaName.includes(n))) return '#4f46e5'; // Commercial Western Hub Municipality
        if (['chatrakot', 'ruru'].some(n => palikaName.includes(n))) return '#059669'; // High-Pop Trade Corridors
        if (['dhurkot', 'chandrakot', 'gulmidarbar'].some(n => palikaName.includes(n))) return '#10b981'; // Cash Crop Agroforestry Palikas
        if (['kaligandaki', 'satyawati'].some(n => palikaName.includes(n))) return '#0ea5e9'; // River Basin Lowland Palikas
        return '#14b8a6'; // Highland Watershed Palikas (Madane, Malika, Isma)
      }

      if (sSub === 'hq_market_proximity') {
        if (['resunga'].some(n => palikaName.includes(n))) return '#047857'; // <10 km Direct Urban Access
        if (['gulmidarbar', 'dhurkot'].some(n => palikaName.includes(n))) return '#059669'; // 10–20 km Fast Arterial Corridor
        if (['chatrakot', 'isma'].some(n => palikaName.includes(n))) return '#10b981'; // 20–35 km Paved Corridor
        if (['musikot', 'ruru', 'chandrakot'].some(n => palikaName.includes(n))) return '#84cc16'; // 35–50 km Secondary Feeder
        if (['satyawati', 'malika'].some(n => palikaName.includes(n))) return '#f59e0b'; // 50–65 km Distant Rural Road
        return '#ef4444'; // >65 km Remote Perimeter (Madane, Kaligandaki)
      }

      if (sSub === 'agri_landholding') {
        if (['madane'].some(n => palikaName.includes(n))) return '#047857'; // >0.75 ha/hh Upper Highland
        if (['malika', 'dhurkot'].some(n => palikaName.includes(n))) return '#059669'; // 0.60–0.75 ha/hh Large Hill Farms
        if (['isma', 'chandrakot'].some(n => palikaName.includes(n))) return '#10b981'; // 0.45–0.59 ha/hh Moderate Terraced
        if (['chatrakot', 'gulmidarbar'].some(n => palikaName.includes(n))) return '#84cc16'; // 0.35–0.44 ha/hh Medium-Small
        if (['satyawati', 'ruru', 'kaligandaki'].some(n => palikaName.includes(n))) return '#f59e0b'; // 0.25–0.34 ha/hh Fragmented Plots
        return '#0ea5e9'; // <0.25 ha/hh Urban Homestead Density (Resunga, Musikot)
      }

      if (sSub === 'labor_wages') {
        if (['resunga'].some(n => palikaName.includes(n))) return '#3730a3'; // >NPR 900/day Commercial Hub
        if (['musikot'].some(n => palikaName.includes(n))) return '#4f46e5'; // NPR 825–900/day Trade Node
        if (['ruru', 'satyawati'].some(n => palikaName.includes(n))) return '#6366f1'; // NPR 760–824/day Corridor
        if (['dhurkot', 'chatrakot', 'gulmidarbar'].some(n => palikaName.includes(n))) return '#818cf8'; // NPR 700–759/day Mid-Hill
        if (['chandrakot', 'isma', 'kaligandaki'].some(n => palikaName.includes(n))) return '#a5b4fc'; // NPR 640–699/day Rural
        return '#c7d2fe'; // <NPR 640/day Remote Highland (Madane, Malika)
      }

      return '#4f46e5';
    }

    return '#059669';
  };

  const getPalikaStyle = (feature: any) => {
    const props = feature?.properties;
    const isHovered = hoveredPalika?.name === props?.name;
    const fillColor = getGulmiPalikaColor(props);

    return {
      fillColor,
      weight: isHovered ? 2.5 : 1.4,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: isHovered ? 0.92 : 0.75,
    };
  };

  const onEachPalika = (feature: any, layer: L.Layer) => {
    const props = feature.properties;
    if (!props) return;

    const palikaName = (props.name || '').toLowerCase();
    const gulmiPalikas = DISTRICT_PALIKAS['gulmi'] || [];
    const pData = gulmiPalikas.find(
      p => p.name.toLowerCase() === palikaName ||
        palikaName.includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(palikaName)
    );

    let metricSnippet = '';
    if (selectedPillar === 'food') {
      const cropId = selectedMapCropId || subFilters.crop || 'coffee';
      if (pData?.feasibleCrops) {
        const c = pData.feasibleCrops.find(
          fc => fc.cropId.toLowerCase() === cropId.toLowerCase() ||
            cropId.toLowerCase().includes(fc.cropId.toLowerCase())
        );
        if (c) {
          metricSnippet = `
            <div style="color: #059669; font-weight: 600; font-size: 10px; margin-top: 2px;">
              ${c.emoji} ${c.cropName.split('(')[0].trim()}: <strong>${c.score}% Suitability</strong> (${c.rating})
            </div>
            <div style="color: #64748b; font-size: 9px;">
              Biophysical: ${pData?.elevation || 1450}m Elev • pH ${pData?.soilPh || 6.5}
            </div>
          `;
        }
      }
    } else if (selectedPillar === 'water') {
      const wSub = subFilters.waterSubFilter || 'merra_rainfall';
      if (wSub === 'river_basins') {
        const basin = ['kaligandaki', 'satyawati', 'ruru'].some(n => palikaName.includes(n)) ? 'Kali Gandaki Basin'
          : ['musikot', 'isma'].some(n => palikaName.includes(n)) ? 'Badigad River Basin'
            : ['resunga', 'gulmidarbar', 'chatrakot', 'chandrakot'].some(n => palikaName.includes(n)) ? 'Ridi Khola Basin' : 'Panaha/Chhaldi Basin';
        metricSnippet = `<div style="color: #0284c7; font-size: 10px; margin-top: 2px;">🌊 Watershed: <strong>${basin}</strong></div>`;
      } else {
        const micro = getPalikaMicroClimate(palikaName, currentRainMm, currentTempC, climateMonth, pData?.elevation);
        const orographicDiff = Math.round((micro.orographicFactor - 1) * 100);
        const orographicStr = orographicDiff >= 0 ? `+${orographicDiff}%` : `${orographicDiff}%`;
        metricSnippet = `
          <div style="color: #0284c7; font-size: 10px; margin-top: 2px;">
            🌧️ Downscaled Rain: <strong>${micro.monthlyRainMm} mm/mo</strong> (${orographicStr} Orographic)
          </div>
          <div style="color: #475569; font-size: 9.5px; margin-top: 1px;">
            🌡️ Micro-Temp: <strong>${micro.monthlyTempC}°C</strong> • Baseline: <strong>${micro.annualRainMm} mm/yr</strong>
          </div>
        `;
      }
    } else if (selectedPillar === 'ecosystem') {
      metricSnippet = `<div style="color: #059669; font-size: 10px; margin-top: 2px;">🧪 Soil pH: <strong>${pData?.soilPh || 6.5}</strong> • Elev: <strong>${pData?.elevation || 1450}m</strong></div>`;
    } else if (selectedPillar === 'energy') {
      metricSnippet = `<div style="color: #7c3aed; font-size: 10px; margin-top: 2px;">⚡ Renewable Pot.: <strong>Solar & Micro-Hydro</strong></div>`;
    } else if (selectedPillar === 'socioeconomics') {
      metricSnippet = `<div style="color: #4f46e5; font-size: 10px; margin-top: 2px;">🏛️ Governance: <strong>${props.type || 'Palika'}</strong></div>`;
    }

    layer.bindTooltip(`
      <div style="font-family: sans-serif; font-size: 11px; padding: 3px 5px;">
        <div style="font-weight: 700; color: #0f172a;">${props.name} (${props.nepaliName || ''})</div>
        <div style="color: #475569; font-size: 10px;">${props.type || 'Palika'} • ${props.areaSqKm ? `${props.areaSqKm} km²` : 'Gulmi'}</div>
        ${metricSnippet}
      </div>
    `, { sticky: true, direction: 'top', opacity: 0.95 });

    layer.on({
      click: () => {
        const gulmiDistrict = db.getDistrictById('gulmi');
        if (gulmiDistrict) onSelectDistrict(gulmiDistrict, props.name);
      },
      mouseover: (e: any) => {
        e.target.setStyle({
          fillOpacity: 0.92,
          weight: 2.8,
          color: '#ffffff',
        });
        e.target.bringToFront();
        setHoveredPalika(props);
      },
      mouseout: (e: any) => {
        e.target.setStyle(getPalikaStyle(feature));
        setHoveredPalika(null);
      },
    });
  };

  const renderLegend = () => {
    if (selectedPillar === 'food') {
      const foodMode = subFilters.foodMode || 'single_crop';
      if (foodMode === 'single_crop') {
        const cropId = selectedMapCropId || subFilters.crop || 'coffee';
        const cropNames: Record<string, string> = {
          coffee: '☕ Arabica Coffee (कफी)',
          orange: '🍊 Mandarin Orange (सुन्तला)',
          ginger: '🫚 Ginger & Turmeric (अदुवा)',
          potato: '🥔 Seed Potato (उच्च पहाडी आलु)',
          buckwheat: '🌾 Buckwheat & Wheat (फापर/गहुँ)',
          rice: '🌾 Monsoon / Spring Paddy (धान)',
          cardamom: '🌿 Large Cardamom (अलैंची)',
          maize: '🌽 Mid-Hill Maize (मकै)'
        };
        const title = `${cropNames[cropId] || cropId} Suitability across Gulmi's 12 Palikas:`;
        const items: [string, string][] = [
          ['#047857', '≥90% Optimal Prime Pocket (Optimal Micro-Climate & Soil)'],
          ['#059669', '80–89% High Commercial Potential'],
          ['#10b981', '70–79% Good Suitability'],
          ['#14b8a6', '60–69% Moderate-High Viability'],
          ['#f59e0b', '45–59% Marginal / Secondary Cultivation'],
          ['#ef4444', '<45% Severely Constrained / Altitude-Frost Limiting']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                {title}
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-mono font-semibold" title="Suitability dynamically calibrated per Palika via FAO-EcoCrop, NARC Soil pH, and Topographic Temperature/Elevation Lapse Model">
                🔬 Calibrated via WEFE Biophysical Model (FAO-EcoCrop & NARC Altitude/Soil Matrix)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }

      if (foodMode === 'barkhe_summer') {
        const title = '☀️ Barkhe (बरखे - Summer Monsoon) Crop Feasibility (6 Tiers):';
        const items: [string, string][] = [
          ['#047857', '≥90% Prime Irrigated Valleys (Monsoon Paddy, Commercial Ginger, Spring Maize)'],
          ['#059669', '80–89% Alluvial Terraces (Monsoon Paddy, Hybrid Maize, Turmeric)'],
          ['#10b981', '70–79% Agroforestry Terraces (Arabica Coffee, Finger Millet, Vegetables)'],
          ['#14b8a6', '60–69% Rainfed Slopes (Millet, Pulses, Legumes, Fodder)'],
          ['#f59e0b', '50–59% High Upland Terraces (Subsistence Cereals & Forage)'],
          ['#ef4444', '<50% Steep Ridge Slopes (High Runoff & Erosion Risk)']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              {title}
            </span>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }

      if (foodMode === 'hiunde_winter') {
        const title = '❄️ Hiunde (हिउँदे - Winter Season) Crop Feasibility (6 Tiers):';
        const items: [string, string][] = [
          ['#047857', '≥90% Optimal Winter Niche (Winter Wheat, Yellow Mustard, Commercial Vegetables)'],
          ['#059669', '80–89% High Cold-Hardy Zone (Seed Potato, High-Altitude Wheat)'],
          ['#10b981', '70–79% Mid-Hill Winter Terraces (Off-Season Vegetables, Legumes)'],
          ['#14b8a6', '60–69% Temperate Highlands (Buckwheat, Barley, Cover Crops)'],
          ['#f59e0b', '50–59% Low-Moisture Rainfed Slopes (Winter Drought Constrained)'],
          ['#ef4444', '<50% Severe Frost / High Mountain Ridge Slopes']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
              <Wheat className="w-3.5 h-3.5 text-amber-600" />
              {title}
            </span>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }

      if (foodMode === 'double_cropping') {
        const title = '🔄 Double & Triple Cropping Rotation Intensity (6 Tiers):';
        const items: [string, string][] = [
          ['#047857', '300% Triple-Cropping (Year-Round River Canal Lift: Paddy-Wheat-Maize: Kaligandaki, Musikot)'],
          ['#059669', '250% Intensive Double-to-Triple (Paddy-Potato-Vegetables: Ruru, Satyawati)'],
          ['#10b981', '200% Standard Double-Cropping (Perennial Spring Kulos: Dhurkot, Chatrakot)'],
          ['#14b8a6', '175% Semi-Irrigated Double-Crop (Monsoon Maize + Winter Legumes: Chandrakot, Gulmidarbar)'],
          ['#f59e0b', '130% Single-to-Double Rainfed (Maize + Fallow/Millet: Isma, Malika)'],
          ['#ef4444', '100% Single-Cropping (High Rainfed Mountain Slopes: Madane, Resunga Ridge)']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              {title}
            </span>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }
    }

    if (selectedPillar === 'water') {
      const wSub = subFilters.waterSubFilter || 'merra_rainfall';
      if (wSub === 'river_basins') {
        const title = '🌊 Gulmi Major River Basins & Watershed Corridors (6 Hydrological Zones):';
        const items: [string, string][] = [
          ['#0369a1', 'Kali Gandaki Mainstem (Kaligandaki) — Glacier/Snowmelt High Flow'],
          ['#0284c7', 'Kali Gandaki Confluence Corridor (Satyawati, Ruru) — Hydro/Lift Hub'],
          ['#0ea5e9', 'Badigad River Valley (Musikot, Isma) — Irrigation Lifeline Corridor'],
          ['#06b6d4', 'Ridi Khola Sub-Basin (Resunga, Gulmidarbar, Chatrakot) — Central Drainage'],
          ['#38bdf8', 'Hugdi Khola Catchment (Chandrakot) — East River Drainage'],
          ['#3b82f6', 'Panaha & Chhaldi Headwaters (Dhurkot, Malika, Madane) — Western Watersheds']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
              <Droplets className="w-3.5 h-3.5 text-sky-600" />
              {title}
            </span>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }

      if (wSub === 'dhm_station') {
        const title = '💧 DHM Hydrological Station #410 at Seti Beni (6 Gauging Catchment Tiers):';
        const items: [string, string][] = [
          ['#0284c7', 'Seti Beni DHM Station #410 Primary Gauging Site (Kaligandaki)'],
          ['#0ea5e9', 'Downstream Direct Catchment (Satyawati, Ruru) — Real-Time Monitored'],
          ['#06b6d4', 'Badigad Inflow Gauging Corridor (Musikot, Isma) — Major Inflow'],
          ['#38bdf8', 'Middle Tributaries (Chandrakot, Chatrakot) — Secondary Catchment'],
          ['#94a3b8', 'Headwater Tributaries (Gulmidarbar, Dhurkot) — Stream Sources'],
          ['#64748b', 'Distant Mountain Catchment (Madane, Malika, Resunga) — Headwater Divides']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
              <Droplets className="w-3.5 h-3.5 text-sky-600" />
              {title}
            </span>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }

      if (wSub === 'spring_vulnerability') {
        const title = '🏔️ ICIMOD Springshed Hydro-Vulnerability (मुहान सुक्ने जोखिम - 6 Tiers):';
        const items: [string, string][] = [
          ['#991b1b', 'Extreme Risk (>85% Spring Discharge Reduction: Madane Lekh Ridges)'],
          ['#ef4444', 'Severe Risk (70–85% Reduction: Resunga & Malika Mountain Ridges)'],
          ['#f97316', 'Moderate-High Risk (50–70% Seasonal Drop: Isma Steep Slopes)'],
          ['#f59e0b', 'Moderate Risk (30–50% Depletion: Dhurkot, Gulmidarbar Mid-Hills)'],
          ['#10b981', 'Low Risk (15–30% Seasonal Variance: Chatrakot, Chandrakot Terraces)'],
          ['#059669', 'Secure / Perennial Access (<15% Variance: Kaligandaki, Satyawati, Ruru, Musikot)']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
              <Droplets className="w-3.5 h-3.5 text-sky-600" />
              {title}
            </span>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }

      if (wSub === 'irrigation_potential') {
        const title = '🌾 Agricultural Lift & Canal Irrigation Feasibility (6 Tiers):';
        const items: [string, string][] = [
          ['#047857', 'Major River Lift & Deep Intake (>150 ha Command: Musikot, Kaligandaki)'],
          ['#059669', 'Medium River Lift & Piped Feeder Networks (75–150 ha: Ruru, Satyawati)'],
          ['#10b981', 'Perennial Stream Gravity Canal / Kulos (30–75 ha: Dhurkot, Chatrakot)'],
          ['#14b8a6', 'Spring Diversion & Upland Storage Tanks (15–30 ha: Chandrakot, Gulmidarbar)'],
          ['#f59e0b', 'Conservation Ponds & Drip / Micro-Sprinklers (5–15 ha: Isma, Malika)'],
          ['#ef4444', 'Strictly Rainfed Mountain Terraces (<5 ha: Madane, Resunga Ridge)']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
              <Droplets className="w-3.5 h-3.5 text-sky-600" />
              {title}
            </span>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }

      // Default: MERRA-2 Topographically Downscaled Rainfall Legend (6 Tiers)
      const title = `🌧️ MERRA-2 Topographically Downscaled Rainfall Micro-Climates (${MONTH_NAMES[climateMonth - 1]} ${climateMode === 'climatology' ? '39-Yr Baseline' : climateYear} - 6 Tiers):`;
      const items: [string, string][] = [
        ['#0369a1', `Tier 1: Peak Ridge Lekh (+20% to +24% Uplift: Madane ${Math.round(currentRainMm * 1.24)}mm, Resunga ${Math.round(currentRainMm * 1.20)}mm)`],
        ['#0284c7', `Tier 2: High Mountain Ridge (+12% to +16%: Malika ${Math.round(currentRainMm * 1.16)}mm, Chandrakot ${Math.round(currentRainMm * 1.12)}mm)`],
        ['#0ea5e9', `Tier 3: Upper Mid-Hill (+4% to +6%: Isma ${Math.round(currentRainMm * 1.06)}mm, Dhurkot ${Math.round(currentRainMm * 1.04)}mm)`],
        ['#38bdf8', `Tier 4: Central Mid-Hill Baseline (-2% to +1%: Gulmidarbar ${Math.round(currentRainMm * 1.01)}mm, Satyawati ${Math.round(currentRainMm * 0.98)}mm)`],
        ['#f59e0b', `Tier 5: Lower Valley Transition (-6% to -8%: Musikot ${Math.round(currentRainMm * 0.94)}mm, Chatrakot ${Math.round(currentRainMm * 0.92)}mm)`],
        ['#ea580c', `Tier 6: Subtropical Riverbed (-12% to -18%: Ruru ${Math.round(currentRainMm * 0.88)}mm, Kaligandaki ${Math.round(currentRainMm * 0.82)}mm)`],
      ];
      return (
        <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
          <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
            <CloudRain className="w-3.5 h-3.5 text-sky-600" />
            {title}
          </span>
          <div className="flex flex-wrap items-center gap-3.5">
            {items.map(([c, l]) => (
              <span key={l} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                <span className="text-slate-700 font-medium">{l}</span>
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (selectedPillar === 'ecosystem') {
      const ecoSub = subFilters.ecoSubFilter || 'soil_ph';
      if (ecoSub === 'soil_ph') {
        const title = '🧪 Soil Reaction (pH) & Agricultural Lime Requirement (6 Tiers):';
        const items: [string, string][] = [
          ['#0284c7', 'pH ≥7.0 Neutral / Slightly Alkaline River Alluvium (Ruru)'],
          ['#059669', 'pH 6.6–6.9 Optimal Benchmark Agricultural Soil (Kaligandaki, Satyawati, Chandrakot, Musikot)'],
          ['#10b981', 'pH 6.2–6.5 Slightly Acidic / Prime Agroforestry (Chatrakot, Gulmidarbar, Resunga)'],
          ['#84cc16', 'pH 5.8–6.1 Moderately Acidic (Dhurkot, Isma)'],
          ['#f59e0b', 'pH 5.4–5.7 Strongly Acidic / Agricultural Lime Recommended (Malika, Madane)'],
          ['#ef4444', 'pH <5.4 Highly Acidic Pine / Sal Ridges (Heavy Liming Required)']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              {title}
            </span>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }

      if (ecoSub === 'elevation_zones') {
        const title = '🏔️ Topographic & Hypsometric Elevation Tiers (6 Agro-Ecological Zones):';
        const items: [string, string][] = [
          ['#4c1d95', '>1,700m Alpine Ridges & Sacred Forests (Madane Lekh 1740m, Resunga Peak)'],
          ['#7c3aed', '1,550–1,700m Cool Temperate Highlands (Malika 1680m, Chandrakot 1603m)'],
          ['#0284c7', '1,450–1,550m Upper Mid-Hills Coffee Belt (Resunga 1530m, Dhurkot 1520m, Isma 1480m)'],
          ['#0ea5e9', '1,200–1,450m Middle Sub-Tropical Slopes (Chatrakot 1420m, Gulmidarbar 1350m)'],
          ['#10b981', '950–1,200m Lower Mid-Hills Valley Slopes (Musikot 1120m, Satyawati 980m)'],
          ['#059669', '<950m Sub-Tropical Riverbed Terraces (Ruru 935m, Kaligandaki 890m)']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
              <Mountain className="w-3.5 h-3.5 text-emerald-600" />
              {title}
            </span>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }

      if (ecoSub === 'agroforestry_belt') {
        const title = '🌲 Community Forestry & Pine/Sal Agroforestry Coverage (6 Tiers):';
        const items: [string, string][] = [
          ['#047857', '>65% Forest Cover (Protected Community & Religious Forests: Resunga)'],
          ['#059669', '55–65% Dense Pine & Sal Woodlands (Madane, Malika)'],
          ['#10b981', '45–54% Integrated Coffee & Fruit Agroforestry (Dhurkot, Chandrakot)'],
          ['#84cc16', '35–44% Mixed Agroforestry / Terrace Farming (Chatrakot, Isma)'],
          ['#f59e0b', '25–34% Intensive Agricultural Slopes (Gulmidarbar, Satyawati)'],
          ['#0ea5e9', '<25% Riverbed Agricultural Farmland (Musikot, Ruru, Kaligandaki)']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
              <Trees className="w-3.5 h-3.5 text-emerald-600" />
              {title}
            </span>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }

      if (ecoSub === 'soil_nitrogen') {
        const title = '🌱 NARC Soil Nitrogen Content (81 Field Points - 6 Tiers):';
        const items: [string, string][] = [
          ['#047857', '≥0.22% N Very High Organic Nitrogen (Kaligandaki)'],
          ['#059669', '0.18–0.21% N High Available Nitrogen (Satyawati, Ruru)'],
          ['#10b981', '0.14–0.17% N Medium-High Nitrogen (Musikot, Chandrakot)'],
          ['#84cc16', '0.10–0.13% N Medium Nitrogen (Chatrakot, Gulmidarbar)'],
          ['#f59e0b', '0.06–0.09% N Low Nitrogen (Dhurkot, Isma)'],
          ['#ef4444', '<0.06% N Low / Deficient Slopes (Malika, Madane)']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              {title}
            </span>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }

      if (ecoSub === 'soil_phosphorus') {
        const title = '🧪 NARC Available Phosphorus (P₂O₅) Distribution (6 Tiers):';
        const items: [string, string][] = [
          ['#0284c7', '≥45 kg/ha P₂O₅ High Available Phosphorus (Ruru, Kaligandaki)'],
          ['#0ea5e9', '35–44 kg/ha P₂O₅ Adequate Available Phosphorus (Satyawati, Musikot)'],
          ['#38bdf8', '25–34 kg/ha P₂O₅ Medium Phosphorus (Chatrakot, Chandrakot)'],
          ['#7dd3fc', '18–24 kg/ha P₂O₅ Low-Medium Phosphorus (Gulmidarbar, Dhurkot)'],
          ['#f59e0b', '12–17 kg/ha P₂O₅ Low Phosphorus (Isma, Resunga)'],
          ['#ef4444', '<12 kg/ha P₂O₅ Deficient Acidic Slopes (Malika, Madane)']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              {title}
            </span>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }

      if (ecoSub === 'soil_potassium') {
        const title = '🥔 NARC Available Potassium (K₂O) Distribution (6 Tiers):';
        const items: [string, string][] = [
          ['#0284c7', '≥220 kg/ha K₂O Very High Available Potassium (Satyawati, Kaligandaki)'],
          ['#0ea5e9', '180–219 kg/ha K₂O High Available Potassium (Ruru, Musikot)'],
          ['#38bdf8', '140–179 kg/ha K₂O Adequate Potassium (Chandrakot, Chatrakot)'],
          ['#7dd3fc', '110–139 kg/ha K₂O Medium Potassium (Gulmidarbar, Dhurkot)'],
          ['#f59e0b', '80–109 kg/ha K₂O Low Potassium (Isma, Resunga)'],
          ['#ef4444', '<80 kg/ha K₂O Leached Highland Slopes (Malika, Madane)']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              {title}
            </span>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }

      const title = '🌱 NARC 81-Point Ground Soil Sampling Grid (6 Tiers):';
      const items: [string, string][] = [
        ['#047857', 'Optimal Prime Soil (N ≥0.22% / pH 6.6–7.2 / P₂O₅ ≥45)'],
        ['#059669', 'High Quality Soil (N 0.18–0.21% / pH 6.4–6.8)'],
        ['#10b981', 'Medium-High Soil (N 0.14–0.17% / pH 6.0–6.4)'],
        ['#84cc16', 'Medium Soil (N 0.10–0.13% / pH 5.8–6.1)'],
        ['#f59e0b', 'Low/Moderate Holdings (N 0.06–0.09% / pH 5.4–5.7)'],
        ['#ef4444', 'Leached Acidic Slopes (N <0.06% / pH <5.4)']
      ];
      return (
        <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
          <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            {title}
          </span>
          <div className="flex flex-wrap items-center gap-3.5">
            {items.map(([c, l]) => (
              <span key={l} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                <span className="text-slate-700 font-medium">{l}</span>
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (selectedPillar === 'energy') {
      const eSub = subFilters.energySubFilter || 'hydro_corridor';
      if (eSub === 'hydro_corridor') {
        const title = '⚡ Run-of-River & Micro-Hydro Potential (6 Energy Corridors):';
        const items: [string, string][] = [
          ['#4c1d95', '>20 MW Major Run-of-River Hydro Corridor (Kaligandaki Basin)'],
          ['#6d28d9', '10–20 MW Commercial Hydropower Cascade (Badigad: Musikot)'],
          ['#8b5cf6', '3–10 MW Small Hydro Corridors (Ruru, Satyawati)'],
          ['#a855f7', '1–3 MW Mini-Hydro Stream Catchments (Dhurkot, Chandrakot)'],
          ['#c084fc', '100–1000 kW Micro-Hydro & Solar Hybrid (Chatrakot, Gulmidarbar)'],
          ['#d8b4fe', '<100 kW Standalone Solar / Micro-Grid Pockets (Isma, Malika, Madane)']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              {title}
            </span>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }

      if (eSub === 'solar_irradiance') {
        const title = '☀️ Solar Photovoltaic Irradiance (NASA POWER Daily Avg - 6 Tiers):';
        const items: [string, string][] = [
          ['#b45309', '≥5.3 kWh/m²/d Optimal Solar Ridge (Resunga, Madane Ridges)'],
          ['#d97706', '5.0–5.2 kWh/m²/d High Solar Slopes (Malika, Chandrakot)'],
          ['#f59e0b', '4.7–4.9 kWh/m²/d Good Mid-Hill Terraces (Dhurkot, Isma)'],
          ['#fbbf24', '4.4–4.6 kWh/m²/d Moderate Upland Solar (Chatrakot, Gulmidarbar)'],
          ['#fde047', '4.0–4.3 kWh/m²/d Lower Valley Solar (Musikot, Satyawati)'],
          ['#fef08a', '<4.0 kWh/m²/d Shaded Deep River Gorges (Ruru, Kaligandaki)']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              {title}
            </span>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }

      if (eSub === 'clean_cooking_biomass') {
        const title = '🪵 Clean Cooking & Firewood Transition Demand (6 Tiers):';
        const items: [string, string][] = [
          ['#991b1b', '>88% Extreme Traditional Firewood Dependence (Madane)'],
          ['#ef4444', '80–88% High Firewood Reliance (Malika, Isma)'],
          ['#f97316', '72–79% Moderate-High Biomass (Dhurkot, Chandrakot)'],
          ['#f59e0b', '65–71% Transitioning Mid-Hills (Chatrakot, Satyawati)'],
          ['#84cc16', '55–64% Modern Fuel Adoption (Gulmidarbar, Ruru, Kaligandaki)'],
          ['#059669', '<55% Advanced Clean Cooking & Induction (Resunga Tamghas, Musikot)']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              {title}
            </span>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }

      if (eSub === 'grid_electrification') {
        const title = '🔌 NEA Distribution Grid Reach (Tamghas Grid Core vs Perimeter - 6 Tiers):';
        const items: [string, string][] = [
          ['#047857', '≥98% 33kV Substation Core / 24/7 Grid (Resunga Tamghas Center)'],
          ['#059669', '92–97% Primary Town Radial 11kV Feeders (Musikot, Gulmidarbar)'],
          ['#10b981', '85–91% Municipal Main Distribution (Chatrakot, Ruru)'],
          ['#84cc16', '75–84% Secondary Feeder Lines (Dhurkot, Chandrakot)'],
          ['#f59e0b', '65–74% Distant Feeder Tails / Single-Phase (Isma, Satyawati, Kaligandaki)'],
          ['#ef4444', '<65% Remote Off-Grid / Micro-Hydro Pockets (Madane, Malika)']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              {title}
            </span>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }
    }

    if (selectedPillar === 'socioeconomics') {
      const sSub = subFilters.socioSubFilter || 'local_governance';
      if (sSub === 'local_governance') {
        const title = '🏛️ Local Government Body Classification (6 Governance Zones):';
        const items: [string, string][] = [
          ['#3730a3', 'District Administrative Capital: Resunga Municipality (रेसुङ्गा)'],
          ['#4f46e5', 'Western Commercial Hub: Musikot Municipality (मुसिकोट)'],
          ['#059669', 'Trade & Religious Corridors: Chatrakot & Ruru (रुरु / छत्रकोट)'],
          ['#10b981', 'Agroforestry & Coffee Belt: Dhurkot, Chandrakot, Gulmidarbar'],
          ['#0ea5e9', 'River Basin Lowlands: Kaligandaki & Satyawati (कालीगण्डकी / सत्यवती)'],
          ['#14b8a6', 'Highland Watershed Belt: Madane, Malika, Isma (मदाने / मालिका / इस्मा)']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
              <Coins className="w-3.5 h-3.5 text-indigo-600" />
              {title}
            </span>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }

      if (sSub === 'hq_market_proximity') {
        const title = '🛣️ Road Proximity to Tamghas District Headquarters (6 Tiers):';
        const items: [string, string][] = [
          ['#047857', '<10 km Direct Urban Access (Resunga District HQ)'],
          ['#059669', '10–20 km Fast Arterial Corridor (Gulmidarbar, Dhurkot)'],
          ['#10b981', '20–35 km Paved Highway Corridor (Chatrakot, Isma)'],
          ['#84cc16', '35–50 km Secondary Feeder Link (Musikot, Ruru, Chandrakot)'],
          ['#f59e0b', '50–65 km Distant Rural Mountain Road (Satyawati, Malika)'],
          ['#ef4444', '>65 km Remote Perimeter Border (Madane, Kaligandaki)']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
              <Coins className="w-3.5 h-3.5 text-indigo-600" />
              {title}
            </span>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }

      if (sSub === 'agri_landholding') {
        const title = '🚜 Average Agricultural Landholding per Household (6 Tiers):';
        const items: [string, string][] = [
          ['#047857', '>0.75 ha/hh Upper Highland Holdings (Madane)'],
          ['#059669', '0.60–0.75 ha/hh Large Hill Family Farms (Malika, Dhurkot)'],
          ['#10b981', '0.45–0.59 ha/hh Moderate Terraced Holdings (Isma, Chandrakot)'],
          ['#84cc16', '0.35–0.44 ha/hh Medium-Small Family Plots (Chatrakot, Gulmidarbar)'],
          ['#f59e0b', '0.25–0.34 ha/hh Fragmented Semi-Urban Plots (Satyawati, Ruru, Kaligandaki)'],
          ['#0ea5e9', '<0.25 ha/hh Intensive Urban Homestead Holdings (Resunga, Musikot)']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
              <Coins className="w-3.5 h-3.5 text-indigo-600" />
              {title}
            </span>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }

      if (sSub === 'labor_wages') {
        const title = '💼 Daily Agricultural Labor Rate (NPR / Day - 6 Tiers):';
        const items: [string, string][] = [
          ['#3730a3', '>NPR 900/day Commercial Urban Hub (Resunga Tamghas)'],
          ['#4f46e5', 'NPR 825–900/day Major Trade & Transport Center (Musikot)'],
          ['#6366f1', 'NPR 760–824/day Semi-Commercial Corridor (Ruru, Satyawati)'],
          ['#818cf8', 'NPR 700–759/day Mid-Hill Road Corridors (Dhurkot, Chatrakot, Gulmidarbar)'],
          ['#a5b4fc', 'NPR 640–699/day Rural Agricultural Valleys (Chandrakot, Isma, Kaligandaki)'],
          ['#c7d2fe', '<NPR 640/day Remote Highland Farming (Madane, Malika)']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
              <Coins className="w-3.5 h-3.5 text-indigo-600" />
              {title}
            </span>
            <div className="flex flex-wrap items-center gap-3.5">
              {items.map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block border border-slate-300 shadow-xs" style={{ backgroundColor: c }} />
                  <span className="text-slate-700 font-medium">{l}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className="space-y-4">
      {/* 1. Main Map Header & Pillar Filter Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-4 border border-slate-200/90 shadow-2xs bg-white/95">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 font-outfit">
              <Mountain className="w-5 h-5 text-emerald-600" />
              <span>{lang === 'np' ? 'गुल्मी जिल्ला कृषि-पारिस्थितिकी नक्सा' : 'Gulmi District Spatial Nexus Map'}</span>
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-md font-mono font-bold">
              गुल्मी • 12 Palikas
            </span>
            <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-mono">
              Lumbini Province
            </span>
            {geoLoading && (
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md animate-pulse font-mono">Loading GIS…</span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-sans">
            {lang === 'np'
              ? '१२ स्थानीय तहहरूको एकीकृत नक्सा। कुनै पनि पालिकामा क्लिक गरी विस्तृत विवरण हेर्नुहोस्।'
              : 'Interactive 12-Palika spatial model. Hover or click any local body for real-time agro-ecological intelligence.'}
          </p>
        </div>

        {/* Map Quick Action Controls & Basemap Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Basemap Switcher */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold text-slate-700 shadow-2xs">
            <button
              onClick={() => setBasemap('voyager')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${basemap === 'voyager' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'hover:text-slate-900'
                }`}
              title="Clean Vector Basemap"
            >
              Clean
            </button>
            <button
              onClick={() => setBasemap('satellite')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${basemap === 'satellite' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'hover:text-slate-900'
                }`}
              title="ESRI World Imagery Satellite"
            >
              Satellite
            </button>
            <button
              onClick={() => setBasemap('terrain')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${basemap === 'terrain' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'hover:text-slate-900'
                }`}
              title="Topographic Elevation Contours"
            >
              Relief
            </button>
          </div>

          {/* Palika Centroid Labels Toggle */}
          <button
            onClick={() => setShowPalikaLabels(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${showPalikaLabels
              ? 'bg-slate-800 text-white border-slate-700 shadow-2xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            title="Toggle Palika Name Text Labels"
          >
            {showPalikaLabels ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <span>Labels</span>
          </button>

          {/* Soil Grid Toggle */}
          <button
            onClick={() => setShowSoilGrid(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${showSoilGrid
              ? 'bg-emerald-700 text-white border-emerald-600 shadow-2xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Soil Grid (81)</span>
          </button>

          {/* Recenter Camera Button */}
          <button
            onClick={() => setResetTrigger(prev => prev + 1)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-2xs"
            title="Reset Map Camera to Gulmi"
          >
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span>Recenter</span>
          </button>
        </div>
      </div>

      {/* 5-Pillar WEFES Selector Bar */}
      <div className="glass-panel p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs bg-white/95 flex items-center justify-between flex-wrap gap-2 animate-fade-in">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider px-2 shrink-0 font-outfit">
            {lang === 'np' ? '५ नेक्सस स्तम्भहरू:' : '5 WEFES Pillars:'}
          </span>
          {[
            { id: 'water', label: 'Water', nepali: 'जल', icon: Droplets, color: 'text-sky-600', activeBg: 'bg-sky-600 text-white' },
            { id: 'energy', label: 'Energy', nepali: 'ऊर्जा', icon: Zap, color: 'text-amber-600', activeBg: 'bg-amber-600 text-white' },
            { id: 'food', label: 'Food', nepali: 'खाद्य', icon: Sprout, color: 'text-emerald-600', activeBg: 'bg-emerald-700 text-white' },
            { id: 'ecosystem', label: 'Ecosystem', nepali: 'पारिस्थितिकी', icon: Trees, color: 'text-teal-600', activeBg: 'bg-teal-700 text-white' },
            { id: 'socioeconomics', label: 'Socioeconomics', nepali: 'सामाजिक-आर्थिक', icon: Building2, color: 'text-indigo-600', activeBg: 'bg-indigo-700 text-white' },
          ].map(p => {
            const Icon = p.icon;
            const isActive = selectedPillar === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPillar(p.id as WEFESPillar)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border ${isActive
                  ? `${p.activeBg} border-transparent shadow-xs scale-[1.02]`
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : p.color}`} />
                <span>{lang === 'np' ? p.nepali : p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-filter toolbar */}
      <SubFilterToolbar
        selectedPillar={selectedPillar}
        onChange={onSubFilterChange}
        subFilters={subFilters}
      />

      {/* Live Satellite Weather vs 39-Yr NASA Climatology Telemetry Ribbon */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-2.5 rounded-2xl bg-white/95 text-slate-800 shadow-xs border border-slate-200/90 text-xs animate-fade-in glass-panel">
        <div className="flex items-center gap-2 flex-wrap">
          {weatherMode === 'live' && liveWeather ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-900 font-outfit uppercase tracking-wider text-[11px]">
                {lang === 'np' ? 'प्रत्यक्ष भू-उपग्रह मौसमी टेलिमेट्री (गुल्मी)' : 'Live Satellite Weather Telemetry (Gulmi HQ)'}
              </span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
                {lang === 'np' ? 'आजको वास्तविक समय' : 'Real-Time Today'}
              </span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="font-bold text-slate-900 font-outfit uppercase tracking-wider text-[11px]">
                NASA POWER / MERRA-2 Climatology Archive ({MONTH_NAMES[climateMonth - 1]} {climateMode === 'climatology' ? '39-Yr Baseline' : climateYear})
              </span>
              <span className="bg-sky-50 text-sky-800 border border-sky-300 text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
                {currentSeason}
              </span>
            </>
          )}

          {/* Toggle Button */}
          {liveWeather && (
            <button
              onClick={() => setWeatherMode(prev => prev === 'live' ? 'archive' : 'live')}
              className="ml-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer transition-colors"
            >
              {weatherMode === 'live' ? '⇄ 39-Yr Archive' : '⇄ 🟢 Live Weather'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 flex-wrap text-[11px] font-mono">
          {weatherMode === 'live' && liveWeather ? (
            <>
              <div className="flex items-center gap-1.5" title="Live Rain">
                <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-slate-500">Rain:</span>
                <strong className="text-sky-900 font-bold">{liveWeather.precipitation} mm/hr</strong>
              </div>

              <div className="flex items-center gap-1.5" title="Live Air Temperature">
                <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-slate-500">Temp:</span>
                <strong className="text-amber-900 font-bold">{liveWeather.temperature}°C</strong>
                <span className="text-[10px] text-slate-500">(Feels {liveWeather.apparentTemp}°)</span>
              </div>

              <div className="flex items-center gap-1.5" title="Live Relative Humidity">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-slate-500">Humidity:</span>
                <strong className="text-blue-900 font-bold">{liveWeather.humidity}%</strong>
              </div>

              <div className="flex items-center gap-1.5" title="Live Wind Speed">
                <Wind className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-slate-500">Wind:</span>
                <strong className="text-teal-900 font-bold">{liveWeather.windSpeed} m/s</strong>
              </div>

              <div className="flex items-center gap-1.5" title="Live Direct Solar Irradiance">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-slate-500">Solar:</span>
                <strong className="text-amber-900 font-bold">{liveWeather.solarRadiation} W/m²</strong>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5" title="Estimated Monthly Precipitation across Gulmi & 12 Palikas">
                <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-slate-500">District Avg Rain:</span>
                <strong className="text-sky-900 font-bold">{currentRainMm} mm/mo</strong>
                <span className="text-[10px] text-sky-700 bg-sky-100/80 px-1.5 py-0.2 rounded font-sans font-semibold">
                  ({Math.round(currentRainMm * 0.82)}–{Math.round(currentRainMm * 1.24)} mm across Palikas)
                </span>
              </div>

              <div className="flex items-center gap-1.5" title="Air Temperature at 2m (Tamghas Baseline & Topographic Range)">
                <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-slate-500">Temp:</span>
                <strong className="text-amber-900 font-bold">{currentTempC}°C</strong>
                <span className="text-[10px] text-slate-500">
                  ({(currentTempC - 1.7).toFixed(1)}° at 1750m – {(currentTempC + 3.2).toFixed(1)}° at 890m)
                </span>
              </div>

              <div className="flex items-center gap-1.5" title="Relative Humidity">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-slate-500">Humidity:</span>
                <strong className="text-blue-900 font-bold">{currentHumidity}%</strong>
              </div>

              <div className="flex items-center gap-1.5" title="Wind Speed at 10m">
                <Wind className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-slate-500">Wind:</span>
                <strong className="text-teal-900 font-bold">{currentWind} m/s</strong>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dynamic Heatmap Legend */}
      {renderLegend()}

      {/* Map & Dock Responsive Workspace */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        {/* Map Container */}
        <div className={`relative glass-panel p-1.5 rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white h-[640px] transition-all duration-300 ${activeDrawerTab === 'matrix' ? 'w-full lg:flex-1' : 'w-full'
          }`}>
          {geoLoading && (
            <div className="absolute inset-0 z-[2000] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-xl">
              <div className="w-10 h-10 border-2 border-slate-300 border-t-white rounded-full animate-spin mb-3" />
              <p className="text-white text-xs font-medium">Loading climate GIS datasets…</p>
            </div>
          )}
          <MapContainer
            center={GULMI_MAP_CENTER}
            zoom={GULMI_MAP_ZOOM}
            scrollWheelZoom={false}
            maxBounds={NEPAL_MAX_BOUNDS}
            maxBoundsViscosity={0.5}
            minZoom={7}
            maxZoom={14}
            style={{ height: '100%', width: '100%', borderRadius: '0.875rem' }}
          >
            <GulmiBoundsController resetTrigger={resetTrigger} activeDrawerTab={activeDrawerTab} />
            <MapGestureHandler />
            <MapPanesSetup />

            {/* Dynamic Basemap Layer */}
            <TileLayer
              key={`basemap-${basemap}`}
              attribution={
                basemap === 'satellite'
                  ? '&copy; <a href="https://www.esri.com/">Esri World Imagery</a>'
                  : basemap === 'terrain'
                    ? '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
                    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              }
              url={
                basemap === 'satellite'
                  ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                  : basemap === 'terrain'
                    ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
                    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
              }
            />

            {/* 12 Gulmi Palikas Vector Layer (Dynamically styled per Pillar, Crop, and Climate Time-Series) */}
            {palikasData && (
              <GeoJSON
                key={`gulmi-palikas-${selectedPillar}-${selectedMapCropId}-${subFilters.crop || ''}-${subFilters.foodMode || ''}-${subFilters.foodOverlayType || ''}-${subFilters.waterSubFilter || ''}-${subFilters.ecoSubFilter || ''}-${subFilters.energySubFilter || ''}-${subFilters.socioSubFilter || ''}-${climateMonth}-${climateYear}-${climateMode}-${currentRainMm}-${hoveredPalika?.name || ''}`}
                data={palikasData}
                style={(feature: any) => {
                  const pName = (feature?.properties?.name || '').toLowerCase();
                  const isHovered = hoveredPalika?.name && (
                    pName.includes(hoveredPalika.name.toLowerCase()) ||
                    hoveredPalika.name.toLowerCase().includes(pName)
                  );
                  return {
                    fillColor: getGulmiPalikaColor(feature?.properties),
                    fillOpacity: isHovered ? 0.92 : 0.72,
                    color: isHovered ? '#10b981' : '#ffffff',
                    weight: isHovered ? 3.5 : 1.8,
                    dashArray: '',
                  };
                }}
                onEachFeature={(feature: any, layer: any) => {
                  layer.on({
                    mouseover: () => {
                      const name = feature?.properties?.name || '';
                      handleHoverPalikaFromMatrix(name);
                    },
                    mouseout: () => {
                      handleHoverPalikaFromMatrix(null);
                    },
                    click: () => {
                      const name = feature?.properties?.name || '';
                      const gulmiDistrict = db.getDistrictById('gulmi');
                      if (gulmiDistrict) onSelectDistrict(gulmiDistrict, name);
                    }
                  });
                }}
              />
            )}

            {/* Bold Outer Perimeter Frame for Gulmi District */}
            {geoData && (
              <GeoJSON
                key={`gulmi-outer-frame-${selectedDistrict?.id}`}
                data={geoData}
                style={{
                  fillColor: 'transparent',
                  fillOpacity: 0,
                  color: '#475569',
                  weight: 3.5,
                  opacity: 1,
                }}
                interactive={false}
              />
            )}

            {/* Bilingual Palika Center Labels (Transparent text with halo glow) */}
            {showPalikaLabels && Object.entries(PALIKA_CENTROIDS).map(([pName, pGeo]) => {
              const isHovered = hoveredPalika?.name?.toLowerCase() === pName.toLowerCase();
              return (
                <Marker
                  key={`label-${pName}`}
                  position={[pGeo.lat, pGeo.lng]}
                  icon={createPalikaLabelIcon(pName, pGeo.nepali, isHovered)}
                  interactive={false}
                />
              );
            })}

            {/* National Highways (Class A) & Feeder Roads Overlays */}
            {nationalRoads && subFilters.highwayFilter !== 'none' && (
              <GeoJSON
                key={`national-roads-${subFilters.highwayFilter}`}
                data={nationalRoads}
                style={(feature: any) => {
                  const hwyType = (feature?.properties?.highway || '').toLowerCase();
                  const isPrimary = hwyType === 'trunk' || hwyType === 'primary';
                  return {
                    color: isPrimary ? '#f97316' : '#fbbf24',
                    weight: isPrimary ? 3 : 2,
                    opacity: 0.85,
                  };
                }}
                pane="roadsPane"
              />
            )}

            {/* 81 Ground Testing Points (NARC Survey Soil Grid) */}
            {showSoilGrid && (gulmiSoilPoints as any[]).map((pt: any) => {
              let markerColor = '#10b981';
              let valLabel = `pH ${pt.ph}`;
              if (subFilters.soilMetric === 'nitrogen') {
                markerColor = pt.nitrogen >= 0.20 ? '#047857' : pt.nitrogen >= 0.15 ? '#10b981' : '#f59e0b';
                valLabel = `N: ${pt.nitrogen}%`;
              } else if (subFilters.soilMetric === 'phosphorus') {
                markerColor = pt.phosphorus >= 50 ? '#0369a1' : pt.phosphorus >= 30 ? '#0ea5e9' : '#f59e0b';
                valLabel = `P: ${pt.phosphorus} kg/ha`;
              } else if (subFilters.soilMetric === 'potassium') {
                markerColor = pt.potassium >= 250 ? '#7e22ce' : pt.potassium >= 150 ? '#a855f7' : '#f59e0b';
                valLabel = `K: ${pt.potassium} kg/ha`;
              } else {
                markerColor = pt.ph >= 6.5 ? '#10b981' : pt.ph >= 6.0 ? '#f59e0b' : '#ef4444';
              }

              return (
                <CircleMarker
                  key={`soil-${pt.id}`}
                  center={[pt.lat, pt.lon]}
                  radius={4.5}
                  pane="markerPane"
                  pathOptions={{
                    fillColor: markerColor,
                    fillOpacity: 0.9,
                    color: '#ffffff',
                    weight: 1.5,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -6]} opacity={0.98} pane="popupPane">
                    <div className="text-xs p-1 min-w-[160px] bg-white rounded shadow-sm">
                      <div className="font-bold text-slate-800 flex justify-between border-b pb-0.5 mb-1">
                        <span>🧪 Soil Point #{pt.id}</span>
                        <span className="font-mono text-emerald-700">{valLabel}</span>
                      </div>
                      <div className="text-slate-600 text-[10px]">{pt.soilType}</div>
                      <div className="mt-1 pt-1 border-t text-[10px] font-mono grid grid-cols-2 gap-x-2 gap-y-0.5">
                        <div>pH: <strong>{pt.ph}</strong></div>
                        <div>N: <strong className="text-emerald-700">{pt.nitrogen}%</strong></div>
                        <div>P₂O₅: <strong className="text-blue-700">{pt.phosphorus} kg/ha</strong></div>
                        <div className="col-span-2">K₂O: <strong className="text-purple-700">{pt.potassium} kg/ha</strong></div>
                      </div>
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}

            {/* DHM River Gauging Stations Overlay */}
            {selectedPillar === 'water' && subFilters.waterClimateMetric === 'dhm_stations' && hydrologyStations.map((st: any, idx: number) => (
              <CircleMarker
                key={`hydro-${st.properties.stationNo}-${idx}`}
                center={[st.geometry.coordinates[1], st.geometry.coordinates[0]]}
                radius={7}
                pane="markerPane"
                pathOptions={{
                  fillColor: '#0284c7',
                  fillOpacity: 0.95,
                  color: '#ffffff',
                  weight: 2.5,
                }}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={0.98} pane="popupPane">
                  <div className="text-xs p-1.5 min-w-[200px] bg-white rounded shadow-md border border-sky-200">
                    <div className="font-bold text-sky-800 flex items-center justify-between border-b border-slate-100 pb-1 mb-1">
                      <span className="flex items-center gap-1">💧 DHM Station #{st.properties.stationNo}</span>
                      <span className="text-[9px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-mono font-bold">Active</span>
                    </div>
                    <div className="font-semibold text-slate-900 text-xs">{st.properties.river} ({st.properties.siteName})</div>
                    <div className="text-slate-600 text-[10px] mt-0.5">District: <strong>{st.properties.district}</strong> • Elevation: <strong>{st.properties.elevation ? `${st.properties.elevation}m` : 'N/A'}</strong></div>
                    <div className="text-slate-500 text-[10px] mt-1 bg-slate-50 p-1 rounded font-mono">Equip: {st.properties.instruments}</div>
                    {st.properties.startDate && st.properties.startDate !== 'Historical' && (
                      <div className="text-slate-400 text-[9px] mt-0.5">Established: {st.properties.startDate}</div>
                    )}
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}

            {/* 20 Potentially Dangerous Glacial Lakes Overlay */}
            {selectedPillar === 'water' && subFilters.waterClimateMetric === 'glof_lakes' && glacialLakes.map((l: any, idx: number) => (
              <CircleMarker
                key={`glof-${l.properties.sn}-${idx}`}
                center={[l.geometry.coordinates[1], l.geometry.coordinates[0]]}
                radius={l.properties.hazardLevel === 'Critical' ? 8.5 : 7}
                pane="markerPane"
                pathOptions={{
                  fillColor: l.properties.hazardLevel === 'Critical' ? '#dc2626' : '#ea580c',
                  fillOpacity: 0.98,
                  color: '#ffffff',
                  weight: 2.5,
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.98} pane="popupPane">
                  <div className="text-xs p-1.5 min-w-[210px] bg-white rounded shadow-md border border-red-200">
                    <div className="font-bold text-red-700 flex items-center justify-between border-b border-slate-100 pb-1 mb-1">
                      <span className="flex items-center gap-1">❄️ {l.properties.lakeName}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${l.properties.hazardLevel === 'Critical' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                        {l.properties.hazardLevel} GLOF Risk
                      </span>
                    </div>
                    <div className="text-slate-700 text-[10px]">District: <strong>{l.properties.district}</strong> • Altitude: <strong className="font-mono">{l.properties.altitude}m</strong></div>
                    {l.properties.basin && <div className="text-slate-600 text-[10px]">Basin: <strong>{l.properties.basin}</strong></div>}
                    {l.properties.areaSqM && (
                      <div className="text-slate-500 text-[10px] mt-1 bg-red-50/70 p-1 rounded font-mono text-red-950">
                        Surface Area: <strong>{(l.properties.areaSqM / 10000).toFixed(1)} ha</strong> ({l.properties.areaSqM.toLocaleString()} m²)
                      </div>
                    )}
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>

          {/* Palika-Specific Hover Card: Shows strictly when hovering a Palika */}
          {hoveredPalika && (
            <PalikaHoverCard
              palikaProp={hoveredPalika}
              currentRainMm={currentRainMm}
              currentTempC={currentTempC}
              climateMonth={climateMonth}
              climateMode={climateMode}
              climateYear={climateYear}
            />
          )}

          {/* District Hover Card: Shows strictly when hovering the district boundary directly without a palika */}
          {hoveredDistrict && !hoveredPalika && (
            <DistrictHoverCard
              district={hoveredDistrict}
              climateDataset={climateDataset}
              climateYear={climateYear}
              climateMonth={climateMonth}
              climateMode={climateMode}
              activeClimateMetric={getActiveClimateMetricKey() || undefined}
              selectedPillar={selectedPillar}
              selectedCropId={selectedMapCropId}
            />
          )}
        </div>

        {/* Side-by-Side Docked 12-Palika Matrix: ZERO coverage of map, pristine side-by-side analytics */}
        {activeDrawerTab === 'matrix' && (
          <div className="w-full lg:w-[380px] xl:w-[420px] h-[640px] shrink-0 animate-fade-in">
            <PalikaQuickMatrix
              docked={true}
              onClose={() => setActiveDrawerTab(null)}
              onSelectPalika={handleSelectPalikaFromMatrix}
              hoveredPalikaName={hoveredPalika?.name || null}
              onHoverPalika={handleHoverPalikaFromMatrix}
              selectedPillar={selectedPillar}
              selectedCropId={selectedMapCropId || subFilters.crop || null}
              subFilters={subFilters}
              lang={lang}
            />
          </div>
        )}
      </div>

      {/* 2. Sleek Collapsible Bottom Analytics Dock Bar */}
      <div className="glass-panel p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-2xs bg-white/95 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-outfit">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'np' ? 'गुल्मी विश्लेषणात्मक डक:' : 'Gulmi Spatial Analytics Dock:'}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveDrawerTab(prev => prev === 'matrix' ? null : 'matrix')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${activeDrawerTab === 'matrix'
              ? 'bg-emerald-700 text-white border-emerald-600 shadow-xs ring-1 ring-emerald-500'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === 'np' ? '१२ स्थानीय तह म्याट्रिक्स (डक)' : '12 Palikas Matrix (Dock)'}</span>
          </button>

          <button
            onClick={() => setActiveDrawerTab(prev => prev === 'elevation' ? null : 'elevation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${activeDrawerTab === 'elevation'
              ? 'bg-emerald-700 text-white border-emerald-600 shadow-xs'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
          >
            <Mountain className="w-3.5 h-3.5" />
            <span>{lang === 'np' ? 'उचाइ प्रोफाइल र बाली बेल्ट' : 'Elevation Profile'}</span>
          </button>

          <button
            onClick={() => setActiveDrawerTab(prev => prev === 'radar' ? null : 'radar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${activeDrawerTab === 'radar'
              ? 'bg-emerald-700 text-white border-emerald-600 shadow-xs'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'np' ? 'नेक्सस राडार सूचकांक' : 'Nexus Radar (73%)'}</span>
          </button>

          {activeDrawerTab && (
            <button
              onClick={() => setActiveDrawerTab(null)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Close Drawer"
            >
              ✕ {lang === 'np' ? 'बन्द गर्नुहोस्' : 'Close'}
            </button>
          )}
        </div>
      </div>

      {/* 3. Collapsible Drawer Content for Elevation and Radar: Smooth Slide-In */}
      {activeDrawerTab && activeDrawerTab !== 'matrix' && (
        <div className="relative animate-fade-in-up">
          {activeDrawerTab === 'elevation' && (
            <ElevationCrossSection
              lang={lang}
              onSelectCropFilter={(cropId) => {
                setSelectedPillar('food');
                onSubFilterChange({ foodMode: 'single_crop', crop: cropId });
              }}
            />
          )}

          {activeDrawerTab === 'radar' && (
            <NexusRadarWidget
              activePillar={selectedPillar}
              onSelectPillar={setSelectedPillar}
              lang={lang}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default DistrictMap;

