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
            if (c.score >= 80) return '#059669'; // Optimal - Deep Emerald
            if (c.score >= 60) return '#10b981'; // High - Green
            if (c.score >= 40) return '#f59e0b'; // Moderate - Amber
            return '#ef4444'; // Challenging - Red
          }
        }
        // Fallbacks for signature Gulmi crops
        if (cropId === 'coffee') {
          if (['ruru', 'satyawati', 'chatrakot', 'gulmidarbar', 'kaligandaki', 'dhurkot'].some(n => palikaName.includes(n))) return '#059669';
          if (['resunga', 'chandrakot'].some(n => palikaName.includes(n))) return '#10b981';
          return '#f59e0b';
        }
        if (cropId === 'orange') {
          if (['dhurkot', 'resunga', 'musikot', 'chatrakot', 'ruru', 'gulmidarbar'].some(n => palikaName.includes(n))) return '#059669';
          if (['kaligandaki', 'isma', 'chandrakot'].some(n => palikaName.includes(n))) return '#10b981';
          return '#f59e0b';
        }
        if (cropId === 'ginger') {
          if (['satyawati', 'kaligandaki', 'ruru', 'gulmidarbar', 'chatrakot'].some(n => palikaName.includes(n))) return '#059669';
          if (['chandrakot', 'musikot', 'dhurkot'].some(n => palikaName.includes(n))) return '#10b981';
          return '#f59e0b';
        }
        if (cropId === 'potato') {
          if (['resunga', 'madane', 'malika', 'chandrakot', 'isma', 'dhurkot'].some(n => palikaName.includes(n))) return '#059669';
          if (['musikot', 'gulmidarbar', 'chatrakot'].some(n => palikaName.includes(n))) return '#10b981';
          return '#f59e0b';
        }
        if (cropId === 'buckwheat') {
          if (['chandrakot', 'madane', 'malika', 'resunga', 'isma'].some(n => palikaName.includes(n))) return '#059669';
          if (['musikot', 'dhurkot', 'gulmidarbar', 'chatrakot'].some(n => palikaName.includes(n))) return '#10b981';
          return '#f59e0b';
        }
        if (cropId === 'rice') {
          if (['musikot', 'kaligandaki', 'ruru', 'satyawati'].some(n => palikaName.includes(n))) return '#059669';
          if (['chatrakot', 'gulmidarbar', 'chandrakot', 'dhurkot', 'isma'].some(n => palikaName.includes(n))) return '#10b981';
          return '#ef4444';
        }
        if (cropId === 'cardamom') {
          if (['chandrakot', 'chatrakot', 'ruru', 'gulmidarbar'].some(n => palikaName.includes(n))) return '#059669';
          if (['resunga', 'dhurkot', 'isma'].some(n => palikaName.includes(n))) return '#10b981';
          return '#f59e0b';
        }
        return '#059669';
      }

      if (foodMode === 'barkhe_summer') {
        if (['musikot', 'kaligandaki', 'ruru', 'satyawati'].some(n => palikaName.includes(n))) return '#059669'; // Irrigated river flats
        if (['dhurkot', 'chatrakot', 'chandrakot', 'gulmidarbar', 'isma'].some(n => palikaName.includes(n))) return '#10b981'; // Slope terraces
        return '#f59e0b'; // High ridges
      }

      if (foodMode === 'hiunde_winter') {
        if (['dhurkot', 'resunga', 'chatrakot', 'gulmidarbar', 'chandrakot'].some(n => palikaName.includes(n))) return '#059669'; // Mid-hill winter pocket
        if (['madane', 'malika', 'isma', 'musikot'].some(n => palikaName.includes(n))) return '#10b981'; // Ridge/valley winter
        return '#f59e0b';
      }

      if (foodMode === 'double_cropping') {
        if (['musikot', 'kaligandaki', 'ruru', 'satyawati'].some(n => palikaName.includes(n))) return '#059669'; // 2-3 Crops (Year-round water)
        if (['dhurkot', 'chatrakot', 'chandrakot', 'gulmidarbar'].some(n => palikaName.includes(n))) return '#10b981'; // 2 Crops (Seasonal spring)
        return '#f59e0b'; // 1-2 Crops (Rainfed upland)
      }

      return '#059669';
    }

    // ==========================================
    // 2. WATER PILLAR (Gulmi Hydrology & Basins)
    // ==========================================
    if (selectedPillar === 'water') {
      const wSub = subFilters.waterSubFilter || 'merra_rainfall';

      if (wSub === 'river_basins') {
        if (['kaligandaki', 'satyawati', 'ruru'].some(n => palikaName.includes(n))) return '#0284c7'; // Kali Gandaki Corridor (Ocean Blue)
        if (['musikot', 'isma'].some(n => palikaName.includes(n))) return '#0ea5e9'; // Badigad River Corridor (Azure)
        if (['resunga', 'gulmidarbar', 'chatrakot', 'chandrakot'].some(n => palikaName.includes(n))) return '#06b6d4'; // Ridi Khola Basin (Teal)
        return '#3b82f6'; // Panaha & Chhaldi Khola Basin (Indigo)
      }

      if (wSub === 'dhm_station') {
        if (['kaligandaki', 'satyawati', 'ruru'].some(n => palikaName.includes(n))) return '#0284c7'; // Seti Beni DHM Station #410 Corridor
        return '#64748b'; // Upstream Catchment
      }

      if (wSub === 'spring_vulnerability') {
        if (['resunga', 'madane', 'malika', 'isma'].some(n => palikaName.includes(n))) return '#ef4444'; // High Ridge Spring Drying Risk (Red)
        if (['dhurkot', 'gulmidarbar', 'chatrakot', 'chandrakot'].some(n => palikaName.includes(n))) return '#f59e0b'; // Moderate Slope Springs (Amber)
        return '#10b981'; // Valley Perennial Access (Emerald)
      }

      if (wSub === 'irrigation_potential') {
        if (['musikot', 'kaligandaki', 'ruru', 'satyawati'].some(n => palikaName.includes(n))) return '#059669'; // High River Lift Potential
        if (['dhurkot', 'chatrakot', 'chandrakot', 'gulmidarbar'].some(n => palikaName.includes(n))) return '#10b981'; // Stream Diversion Canals
        return '#f59e0b'; // Rainfed Terraces
      }

      // Default: Dynamic MERRA-2 Rainfall Animation
      const elev = pData?.elevation || 1450;
      const elevFactor = 1 + (elev - 1000) / 10000;
      const localRain = currentRainMm * elevFactor;

      if (localRain >= 350) return '#0369a1'; // Deep Monsoon Indigo
      if (localRain >= 220) return '#0284c7'; // Heavy Rain Azure
      if (localRain >= 120) return '#0ea5e9'; // Moderate Sky Blue
      if (localRain >= 50) return '#38bdf8';  // Light Rain
      if (localRain >= 20) return '#facc15';  // Pre-Monsoon Golden
      return '#f97316';                       // Winter Arid
    }

    // ==========================================
    // 3. ECOSYSTEM & SOIL PILLAR (Gulmi Relief & Soils)
    // ==========================================
    if (selectedPillar === 'ecosystem') {
      const ecoSub = subFilters.ecoSubFilter || 'soil_ph';

      if (ecoSub === 'soil_ph') {
        const ph = pData?.soilPh || 6.5;
        if (ph >= 6.4 && ph <= 7.2) return '#059669'; // Ideal Neutral Alluvium
        if (ph >= 5.8 && ph < 6.4) return '#10b981'; // Slightly Acidic
        return '#f59e0b'; // Acidic Hill Slope (Needs Liming)
      }

      if (ecoSub === 'elevation_zones') {
        const elev = pData?.elevation || 1450;
        if (elev >= 1550) return '#8b5cf6'; // High Mountain Ridges (>1550m) (Purple)
        if (elev >= 1150) return '#0284c7'; // Mid-Hill Slopes (1150–1550m) (Blue)
        return '#10b981'; // River Basin Lowlands (<1150m) (Green)
      }

      if (ecoSub === 'agroforestry_belt') {
        if (['resunga', 'madane', 'malika', 'dhurkot'].some(n => palikaName.includes(n))) return '#059669'; // Dense Community & Pine Forest
        if (['isma', 'chandrakot', 'chatrakot', 'gulmidarbar'].some(n => palikaName.includes(n))) return '#10b981'; // Agroforestry Terraces
        return '#0ea5e9'; // River Basin Farmland
      }

      if (ecoSub === 'soil_nitrogen') {
        if (['satyawati', 'kaligandaki', 'ruru'].some(n => palikaName.includes(n))) return '#059669'; // Rich alluvial nitrogen
        return '#10b981';
      }

      if (ecoSub === 'soil_phosphorus' || ecoSub === 'soil_potassium') {
        if (['satyawati', 'kaligandaki', 'ruru'].some(n => palikaName.includes(n))) return '#0284c7';
        return '#38bdf8';
      }

      return '#059669';
    }

    // ==========================================
    // 4. ENERGY PILLAR (Gulmi Energy Infrastructure)
    // ==========================================
    if (selectedPillar === 'energy') {
      const eSub = subFilters.energySubFilter || 'hydro_corridor';

      if (eSub === 'hydro_corridor') {
        if (['kaligandaki', 'ruru', 'satyawati', 'musikot'].some(n => palikaName.includes(n))) return '#6d28d9'; // Major Hydro Run-of-River Corridor
        if (['dhurkot', 'chandrakot', 'chatrakot'].some(n => palikaName.includes(n))) return '#8b5cf6'; // Micro-Hydro Stream Catchment
        return '#a855f7';
      }

      if (eSub === 'solar_irradiance') {
        const elev = pData?.elevation || 1450;
        if (elev >= 1500) return '#d97706'; // High Solar Potential on Ridges (5.1 kWh/m²)
        if (elev >= 1100) return '#f59e0b'; // Mid-Hill Solar (4.9 kWh/m²)
        return '#fbbf24'; // Valley (4.6 kWh/m²)
      }

      if (eSub === 'clean_cooking_biomass') {
        if (['madane', 'malika', 'isma'].some(n => palikaName.includes(n))) return '#ef4444'; // High Firewood Dependence (>85%)
        if (['dhurkot', 'chatrakot', 'satyawati', 'chandrakot'].some(n => palikaName.includes(n))) return '#f59e0b'; // Moderate Transition
        return '#10b981'; // Urban/Commercial Transition (Resunga, Musikot)
      }

      if (eSub === 'grid_electrification') {
        if (['resunga', 'gulmidarbar', 'musikot'].some(n => palikaName.includes(n))) return '#059669'; // 33kV Tamghas Grid Core (>95%)
        if (['dhurkot', 'chatrakot', 'ruru', 'chandrakot', 'isma'].some(n => palikaName.includes(n))) return '#10b981'; // 11kV Feeder Line
        return '#f59e0b'; // Tail Feeder Lines
      }

      return '#6d28d9';
    }

    // ==========================================
    // 5. SOCIOECONOMICS PILLAR (Gulmi Governance & Roads)
    // ==========================================
    if (selectedPillar === 'socioeconomics') {
      const sSub = subFilters.socioSubFilter || 'local_governance';

      if (sSub === 'local_governance') {
        if (['resunga', 'musikot'].some(n => palikaName.includes(n))) return '#4f46e5'; // Municipalities (नगरपालिका) (Indigo)
        return '#10b981'; // Rural Municipalities (गाउँपालिका) (Green)
      }

      if (sSub === 'hq_market_proximity') {
        if (['resunga', 'gulmidarbar', 'dhurkot'].some(n => palikaName.includes(n))) return '#059669'; // Direct Proximity (<15 km to Tamghas)
        if (['chatrakot', 'isma', 'musikot', 'ruru'].some(n => palikaName.includes(n))) return '#10b981'; // Arterial Link (15–35 km)
        if (['satyawati', 'chandrakot', 'malika'].some(n => palikaName.includes(n))) return '#f59e0b'; // Secondary Link (35–55 km)
        return '#ef4444'; // Remote Perimeter (>55 km)
      }

      if (sSub === 'agri_landholding') {
        if (['madane', 'malika', 'dhurkot'].some(n => palikaName.includes(n))) return '#059669'; // Larger Holdings (>0.6 ha/hh)
        if (['isma', 'chandrakot', 'chatrakot', 'gulmidarbar'].some(n => palikaName.includes(n))) return '#10b981'; // Moderate (0.4–0.6 ha)
        return '#0ea5e9'; // Dense Urban/Valley (<0.4 ha)
      }

      if (sSub === 'labor_wages') {
        if (['resunga', 'musikot'].some(n => palikaName.includes(n))) return '#4f46e5'; // Commercial Hub (NPR 850–950/day)
        if (['ruru', 'satyawati', 'dhurkot'].some(n => palikaName.includes(n))) return '#6366f1'; // Semi-Commercial (NPR 750–850)
        return '#818cf8'; // Rural Ag Wage (NPR 650–750)
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
          metricSnippet = `<div style="color: #059669; font-weight: 600; font-size: 10px; margin-top: 2px;">
            ${c.emoji} ${c.cropName.split('(')[0]}: <strong>${c.score}% Suitability</strong> (${c.rating})
          </div>`;
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
        const localRain = Math.round(currentRainMm * (1 + ((pData?.elevation || 1450) - 1000) / 10000));
        metricSnippet = `<div style="color: #0284c7; font-size: 10px; margin-top: 2px;">🌧️ Est. Rain: <strong>${localRain} mm/mo</strong> (${currentSeason})</div>`;
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
          ['#059669', '≥80% Optimal Synergy (Primary Pocket)'],
          ['#10b981', '60–79% High Suitability'],
          ['#f59e0b', '40–59% Moderate / Secondary'],
          ['#ef4444', '<40% Challenging (Terrain/Frost Limiting)']
        ];
        return (
          <div className="flex flex-col glass-panel px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 animate-fade-in-up justify-between gap-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                {title}
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-mono font-semibold">
                Gulmi Agro-Ecological Model
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
        const title = '☀️ Barkhe (बरखे - Summer Monsoon) Crop Feasibility:';
        const items: [string, string][] = [
          ['#059669', 'High Monsoon Capacity (Paddy, Ginger, Commercial Maize in River Valleys)'],
          ['#10b981', 'Terrace Agroforestry (Maize, Millet, Arabica Coffee)'],
          ['#f59e0b', 'Ridge Subsistence Farming']
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
        const title = '❄️ Hiunde (हिउँदे - Winter Season) Crop Feasibility:';
        const items: [string, string][] = [
          ['#059669', 'Mid-Hill Winter Pockets (Wheat, Mustard, Winter Vegetables)'],
          ['#10b981', 'High-Altitude Winter Crops (Seed Potato, Buckwheat)'],
          ['#f59e0b', 'Rainfed Slopes with Low Moisture']
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
        const title = '🔄 Double & Triple Cropping Rotation Intensity:';
        const items: [string, string][] = [
          ['#059669', '2–3 Crops/Year (Perennial Riverbed Irrigation: Musikot, Kaligandaki, Ruru)'],
          ['#10b981', '2 Crops/Year (Mid-Hill Spring-fed Terraces: Dhurkot, Chatrakot, Chandrakot)'],
          ['#f59e0b', '1–2 Crops/Year (High Rainfed Slopes: Resunga, Madane, Malika)']
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
        const title = '🌊 Gulmi Major River Basin Corridors:';
        const items: [string, string][] = [
          ['#0284c7', 'Kali Gandaki Basin (Kaligandaki, Satyawati, Ruru) - Glacial/Snowmelt Flow'],
          ['#0ea5e9', 'Badigad River Valley (Musikot, Isma) - Major Irrigation Lifeline'],
          ['#06b6d4', 'Ridi Khola & Hugdi Basin (Resunga, Gulmidarbar, Chatrakot, Chandrakot)'],
          ['#3b82f6', 'Panaha & Chhaldi Khola (Dhurkot, Malika, Madane)']
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
        const title = '🏔️ Spring-Fed Water Vulnerability (मुहान सुक्ने जोखिम):';
        const items: [string, string][] = [
          ['#ef4444', 'High Risk: Mountain Ridges (Resunga, Madane, Malika, Isma) - Spring Dry-up in Mar-May'],
          ['#f59e0b', 'Moderate Risk: Mid-Hill Slopes (Dhurkot, Gulmidarbar, Chatrakot, Chandrakot)'],
          ['#10b981', 'Low Risk / Secure: Perennial River Valleys (Kaligandaki, Satyawati, Ruru, Musikot)']
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
        const title = '🌾 Agricultural Lift & Canal Irrigation Feasibility:';
        const items: [string, string][] = [
          ['#059669', 'High Potential: Riverbed Lift & Canal Irrigation (Musikot, Kaligandaki, Ruru, Satyawati)'],
          ['#10b981', 'Moderate: Stream Diversion & Gravity Kulos (Dhurkot, Chatrakot, Chandrakot)'],
          ['#f59e0b', 'Rainfed: Rainwater Harvesting & Conservation Ponds Required']
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

      // Default: MERRA-2 Rainfall Legend
      const title = `🌧️ MERRA-2 Rainfall Climatology (${MONTH_NAMES[climateMonth - 1]} ${climateMode === 'climatology' ? '39-Yr Baseline' : climateYear}):`;
      const items: [string, string][] = [
        ['#0369a1', '≥350 mm Extreme Monsoon (Heavy Runoff)'],
        ['#0284c7', '220–350 mm High Rainfall (Monsoon Surge)'],
        ['#0ea5e9', '120–220 mm Moderate Rain'],
        ['#38bdf8', '50–120 mm Light Showers'],
        ['#facc15', '20–50 mm Pre-Monsoon Dry'],
        ['#f97316', '<20 mm Arid Winter Drought']
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
        const title = '🧪 Soil pH & Agricultural Lime Requirement:';
        const items: [string, string][] = [
          ['#059669', 'Neutral / Optimal (pH 6.5–7.2) — River Alluvium (Kaligandaki, Ruru, Satyawati, Musikot)'],
          ['#10b981', 'Slightly Acidic (pH 5.8–6.4) — Mid-Hill Agroforestry Soils'],
          ['#f59e0b', 'Acidic (pH <5.8) — Pine/Sal Slopes (Agricultural Lime Application Recommended)']
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
        const title = '🏔️ Topographic & Hypsometric Elevation Tiers:';
        const items: [string, string][] = [
          ['#8b5cf6', 'High Mountain Ridges (>1,550m to 2,690m) — Resunga, Madane, Malika (Cool Temperate)'],
          ['#0284c7', 'Mid-Hill Slopes (1,150–1,550m) — Dhurkot, Isma, Gulmidarbar, Chatrakot (Coffee/Orange Belt)'],
          ['#10b981', 'River Valleys & Low Hills (<1,150m) — Musikot, Kaligandaki, Ruru (Subtropical Riverbed)']
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
        const title = '🌲 Community Forestry & Pine/Sal Agroforestry Coverage:';
        const items: [string, string][] = [
          ['#059669', 'High Woodland Cover (>55% Forest) — Resunga, Madane, Malika, Dhurkot'],
          ['#10b981', 'Terraced Agroforestry (35–55% Forest Cover)'],
          ['#0ea5e9', 'Intensive Agricultural Farmland (<35% Forest Cover)']
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

      const title = '🌱 NARC 81-Point Ground Soil Sampling Grid:';
      const items: [string, string][] = [
        ['#059669', 'Sampled River Valley Soil (High Nitrogen ≥0.18% / Optimal pH)'],
        ['#10b981', 'Medium Nutrient Holdings (N: 0.12–0.18%)'],
        ['#f59e0b', 'Low/Moderate Holdings (<0.12%)']
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
        const title = '⚡ Run-of-River & Micro-Hydro Catchment Potential:';
        const items: [string, string][] = [
          ['#6d28d9', 'Major Hydropower Corridors (Kali Gandaki & Badigad Basins)'],
          ['#8b5cf6', 'Micro-Hydro Stream Catchments (Dhurkot, Chandrakot, Chatrakot)'],
          ['#a855f7', 'Upland Solar/Wind Hybrid Zones']
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
        const title = '☀️ Solar Photovoltaic Irradiance (NASA POWER Daily Avg):';
        const items: [string, string][] = [
          ['#d97706', 'High Irradiance: Sun-Exposed South Ridges (≥5.1 kWh/m²/d)'],
          ['#f59e0b', 'Good Irradiance: Mid-Hill Terraced Slopes (4.8–5.1 kWh/m²/d)'],
          ['#fbbf24', 'Moderate: Shaded River Gorges (<4.8 kWh/m²/d)']
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
        const title = '🪵 Clean Cooking & Firewood Transition Demand:';
        const items: [string, string][] = [
          ['#ef4444', 'High Firewood Dependence (>85% hh): Madane, Malika, Isma'],
          ['#f59e0b', 'Moderate Transition: Mid-Hills (65–85% hh)'],
          ['#10b981', 'Advanced LPG & Induction Adoption (<65% Firewood): Resunga, Musikot']
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
        const title = '🏛️ Local Government Body Classification:';
        const items: [string, string][] = [
          ['#4f46e5', 'Urban Municipalities (नगरपालिका): Resunga & Musikot'],
          ['#10b981', 'Rural Municipalities (गाउँपालिका): 10 Local Bodies']
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
        const title = '🛣️ Road Proximity to Tamghas District Headquarters:';
        const items: [string, string][] = [
          ['#059669', '<15 km Direct Urban Access (Resunga, Gulmidarbar, Dhurkot)'],
          ['#10b981', '15–35 km Arterial Corridor (Chatrakot, Isma, Musikot, Ruru)'],
          ['#f59e0b', '35–55 km Secondary Link (Satyawati, Chandrakot, Malika)'],
          ['#ef4444', '>55 km Remote Perimeter (Madane, Kaligandaki)']
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
              <div className="flex items-center gap-1.5" title="Estimated Monthly Precipitation">
                <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-slate-500">Rain:</span>
                <strong className="text-sky-900 font-bold">{currentRainMm} mm/mo</strong>
              </div>

              <div className="flex items-center gap-1.5" title="Air Temperature at 2m">
                <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-slate-500">Temp:</span>
                <strong className="text-amber-900 font-bold">{currentTempC}°C</strong>
                <span className="text-[10px] text-slate-500">({currentTempMin}°–{currentTempMax}°)</span>
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
                key={`gulmi-palikas-${selectedPillar}-${selectedMapCropId}-${subFilters.crop || ''}-${subFilters.foodMode || ''}-${subFilters.foodOverlayType || ''}-${subFilters.soilMetric || ''}-${subFilters.waterClimateMetric || ''}-${subFilters.energyClimateMetric || ''}-${subFilters.socioMetric || ''}-${hoveredPalika?.name || ''}`}
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
          {hoveredPalika && <PalikaHoverCard palikaProp={hoveredPalika} />}

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

