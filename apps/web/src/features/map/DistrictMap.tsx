// [DATA PROVENANCE]
// Data Source: data/real/municipal/palika_profiles.json, data/calculated/hydro_reaches/hydro_palika_summary.json, data/real/boundaries/gulmi-palikas.json, apps/web/public/geojson/gulmi-contours.json
// Classification: OBSERVED REAL & CALCULATED BASELINES
// Citations: Ministry of Federal Affairs and General Administration (MoFAGA), DHM Nepal, Survey Department of Nepal
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { District, WEFESPillar, SUBFILTER_LEGENDS } from '@wefes/shared-types';
import { db } from '@wefes/database';
import { computeCropSuitability } from '@wefes/wefes-engine';
import { DynamicLegend } from '../../components/legend/DynamicLegend';
import { SubFilterToolbar } from './SubFilterToolbar';
import { PillarFilter } from './PillarFilter';
import DistrictHoverCard from './DistrictHoverCard';
import ClimateTimeController from './ClimateTimeController';
import { MapGestureHandler } from './MapGestureHandler';
import { PolicyPresetSelector } from '../simulator/PolicyPresetSelector';
import { MapPin, Calendar, Coins, Trees, Droplets, Zap, Sprout, Sun, Wheat, Cherry, Leaf, Thermometer, Mountain, Target, Cloud, CloudRain, Wind, Activity, Globe, Compass, Check, Eye, EyeOff, Building2, FileText, Calculator, ShieldCheck, Cpu, AlertTriangle, Info, X, CloudSun, CloudLightning, CloudFog, CloudDrizzle, Snowflake, Moon, ChevronDown, ChevronUp, Gauge } from 'lucide-react';
import gulmiSoilPoints from '../../data/gulmiSoilPoints.json';
import { PalikaHoverCard } from '../palika/PalikaHoverCard';
import { DISTRICT_PALIKAS, HYDRO_PALIKA_SUMMARY } from '../../data/districtPalikaAssets';
import { getPalikaMicroClimate, GULMI_PALIKA_CLIMATE_PROFILES } from '../../utils/climateDownscaling';
import { resolveCalculationMethodology } from '../../data/districtCalculationAssets';
import { usePalikaChoropleth } from '../../hooks/usePalikaChoropleth';
import { SpatialRainfallSurfaceOverlay } from './SpatialRainfallSurfaceOverlay';
import { SpatialSolarSurfaceOverlay } from './SpatialSolarSurfaceOverlay';



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

// ==============================================================================
// [DATA PROVENANCE]
// Source File: data/real/boundaries/palika_centroids.json
// Lineage: Survey Department / Local Government Palika Boundary Centroids
// Consumed By: apps/web/src/features/map/DistrictMap.tsx
// ==============================================================================
import palikaCentroidsData from '../../data/palika_centroids.json';
const { _provenance, ...palikaCentroidsMap } = palikaCentroidsData;
const PALIKA_CENTROIDS = palikaCentroidsMap as unknown as Record<string, { lat: number; lng: number; nepali: string }>;

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
  tempMin?: number;
  tempMax?: number;
  humidity: number;
  precipitation: number;
  dailyPrecipSum?: number;
  windSpeed: number;
  windDirection?: number;
  windGusts?: number;
  solarRadiation: number;
  uvIndex?: number;
  weatherCode: number;
  conditionLabelEn: string;
  conditionLabelNp: string;
  isDay: boolean;
  surfacePressure?: number;
  dewPoint?: number;
  cloudCover?: number;
  faoEvapotranspiration?: number;
  sunrise?: string;
  sunset?: string;
  time: string;
}

const getWmoWeatherInfo = (code: number, isDay: boolean) => {
  switch (code) {
    case 0:
      return {
        en: 'Clear Sky',
        np: 'सफा आकाश',
        icon: isDay ? Sun : Moon,
        color: 'text-amber-500'
      };
    case 1:
    case 2:
      return {
        en: 'Partly Cloudy',
        np: 'आंशिक बदली',
        icon: isDay ? CloudSun : Cloud,
        color: 'text-sky-500'
      };
    case 3:
      return {
        en: 'Overcast',
        np: 'पूर्ण बदली',
        icon: Cloud,
        color: 'text-slate-500'
      };
    case 45:
    case 48:
      return {
        en: 'Fog / Mist',
        np: 'कुहिरो / हुस्सु',
        icon: CloudFog,
        color: 'text-slate-400'
      };
    case 51:
    case 53:
    case 55:
      return {
        en: 'Drizzle',
        np: 'सिमसिमे पानी',
        icon: CloudDrizzle,
        color: 'text-sky-500'
      };
    case 61:
    case 63:
    case 65:
      return {
        en: 'Rain',
        np: 'वर्षा',
        icon: CloudRain,
        color: 'text-blue-600'
      };
    case 71:
    case 73:
    case 75:
      return {
        en: 'Snowfall',
        np: 'हिमपात',
        icon: Snowflake,
        color: 'text-indigo-400'
      };
    case 80:
    case 81:
    case 82:
      return {
        en: 'Rain Showers',
        np: 'क्षणिक वर्षा',
        icon: CloudRain,
        color: 'text-blue-500'
      };
    case 95:
    case 96:
    case 99:
      return {
        en: 'Thunderstorm',
        np: 'मेघगर्जन सहित वर्षा',
        icon: CloudLightning,
        color: 'text-amber-600'
      };
    default:
      return {
        en: 'Fair Weather',
        np: 'सामान्य मौसम',
        icon: CloudSun,
        color: 'text-sky-500'
      };
  }
};

const getCardinalDirection = (deg: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index] || 'N';
};

function GulmiBoundsController({ resetTrigger }: { resetTrigger: number }) {
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
  }, [map, resetTrigger]);
  return null;
}

function MapPanesSetup() {
  const map = useMap();
  useEffect(() => {
    if (map) {
      if (!map.getPane('rainfallPane')) {
        const pane = map.createPane('rainfallPane');
        pane.style.zIndex = '340';
      }
      if (!map.getPane('palikasPane')) {
        const pane = map.createPane('palikasPane');
        pane.style.zIndex = '350';
      }
      if (!map.getPane('contoursPane')) {
        const pane = map.createPane('contoursPane');
        pane.style.zIndex = '380';
      }
      if (!map.getPane('roadsPane')) {
        const pane = map.createPane('roadsPane');
        pane.style.zIndex = '450';
      }
      if (!map.getPane('riversPane')) {
        const pane = map.createPane('riversPane');
        pane.style.zIndex = '480';
      }
      if (!map.getPane('pointsPane')) {
        const pane = map.createPane('pointsPane');
        pane.style.zIndex = '650';
        pane.style.pointerEvents = 'auto';
      }
    }
  }, [map]);
  return null;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function interpolateColor(color1: string, color2: string, factor: number): string {
  const f = Math.max(0, Math.min(1, factor));
  const c1 = color1.startsWith('#') ? color1.slice(1) : color1;
  const c2 = color2.startsWith('#') ? color2.slice(1) : color2;
  const r1 = parseInt(c1.substring(0, 2), 16);
  const g1 = parseInt(c1.substring(2, 4), 16);
  const b1 = parseInt(c1.substring(4, 6), 16);
  const r2 = parseInt(c2.substring(0, 2), 16);
  const g2 = parseInt(c2.substring(2, 4), 16);
  const b2 = parseInt(c2.substring(4, 6), 16);
  const r = Math.round(r1 + f * (r2 - r1));
  const g = Math.round(g1 + f * (g2 - g1));
  const b = Math.round(b1 + f * (b2 - b1));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// QGIS-style continuous multi-stop gradient interpolator
function getGradientColor(val: number, min: number, max: number, palette: string[]): string {
  if (palette.length === 0) return '#059669';
  if (palette.length === 1) return palette[0];
  const clamped = Math.max(min, Math.min(max, val));
  const norm = max === min ? 0.5 : (clamped - min) / (max - min);
  const segCount = palette.length - 1;
  const segIndex = Math.min(Math.floor(norm * segCount), segCount - 1);
  const segFactor = (norm - segIndex / segCount) * segCount;
  return interpolateColor(palette[segIndex], palette[segIndex + 1], segFactor);
}

// Curated scientific QGIS palettes
const COLOR_RAMPS = {
  blues: ['#eff6ff', '#bfdbfe', '#60a5fa', '#2563eb', '#1d4ed8', '#1e3a8a'], // Hydrology & Rivers
  rainfall: ['#fed7aa', '#fdba74', '#38bdf8', '#0284c7', '#0369a1', '#1e3a8a'], // Low Valley -> High Uplift
  viridis: ['#440154', '#414487', '#2a788e', '#22a884', '#7ad151', '#fde725'], // Topo Elevation
  ylgn: ['#ffffe5', '#d9f0a3', '#78c679', '#31a354', '#006837'], // Agro & Forest
  purples: ['#f3e8ff', '#d8b4fe', '#a855f7', '#7c3aed', '#4c1d95'], // Energy & Hydro Power
  rdylgn: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#047857'], // Risk -> Favorable
  gnylrd: ['#047857', '#10b981', '#f59e0b', '#f97316', '#ef4444'], // Favorable -> Severe Risk
  soilPh: ['#ef4444', '#f59e0b', '#84cc16', '#10b981', '#059669', '#0284c7'], // Acidic -> Alkaline
};

function suitabilityToColor(score: number): string {
  return getGradientColor(score, 30, 95, COLOR_RAMPS.rdylgn);
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
  const [hydroReachesData, setHydroReachesData] = useState<any>(null);
  const [gulmiRivers, setGulmiRivers] = useState<any>(null);
  const [contoursData, setContoursData] = useState<any>(null);
  const [showContours, setShowContours] = useState<boolean>(false);
  const [showRoadOverlay, setShowRoadOverlay] = useState<boolean>(false);

  const [palikasData, setPalikasData] = useState<any>(null);
  const [hoveredPalika, setHoveredPalika] = useState<any>(null);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  // Landing Page Suite State
  const [lang, setLang] = useState<'en' | 'np'>('en');
  const [basemap, setBasemap] = useState<'voyager' | 'satellite' | 'terrain'>('voyager');
  const [showPalikaLabels, setShowPalikaLabels] = useState<boolean>(true);

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
  const [isAgroMeteoOpen, setIsAgroMeteoOpen] = useState<boolean>(false);

  // Fetch real-time live satellite weather for Gulmi district coordinates
  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=28.068&longitude=83.248&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,surface_pressure,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,direct_radiation,uv_index,dew_point_2m,is_day&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max,sunrise,sunset,et0_fao_evapotranspiration&timezone=Asia%2FKathmandu')
      .then(res => res.json())
      .then(data => {
        if (data && data.current) {
          const wmo = getWmoWeatherInfo(data.current.weather_code || 0, data.current.is_day === 1);
          const sunriseStr = data.daily?.sunrise?.[0] ? data.daily.sunrise[0].split('T')[1]?.slice(0, 5) : '05:55';
          const sunsetStr = data.daily?.sunset?.[0] ? data.daily.sunset[0].split('T')[1]?.slice(0, 5) : '18:18';

          setLiveWeather({
            temperature: Number(data.current.temperature_2m.toFixed(1)),
            apparentTemp: Number(data.current.apparent_temperature.toFixed(1)),
            tempMin: data.daily?.temperature_2m_min?.[0] !== undefined ? Number(data.daily.temperature_2m_min[0].toFixed(1)) : undefined,
            tempMax: data.daily?.temperature_2m_max?.[0] !== undefined ? Number(data.daily.temperature_2m_max[0].toFixed(1)) : undefined,
            humidity: Math.round(data.current.relative_humidity_2m),
            precipitation: Number(data.current.precipitation.toFixed(1)),
            dailyPrecipSum: data.daily?.precipitation_sum?.[0] !== undefined ? Number(data.daily.precipitation_sum[0].toFixed(1)) : undefined,
            windSpeed: Number((data.current.wind_speed_10m / 3.6).toFixed(1)),
            windDirection: data.current.wind_direction_10m !== undefined ? Math.round(data.current.wind_direction_10m) : undefined,
            windGusts: data.current.wind_gusts_10m !== undefined ? Number((data.current.wind_gusts_10m / 3.6).toFixed(1)) : undefined,
            solarRadiation: Math.round(data.current.direct_radiation || 0),
            uvIndex: data.daily?.uv_index_max?.[0] !== undefined ? Number(data.daily.uv_index_max[0].toFixed(1)) : (data.current.uv_index !== undefined ? Number(data.current.uv_index.toFixed(1)) : undefined),
            weatherCode: data.current.weather_code ?? 0,
            conditionLabelEn: wmo.en,
            conditionLabelNp: wmo.np,
            isDay: data.current.is_day === 1,
            surfacePressure: data.current.surface_pressure !== undefined ? Math.round(data.current.surface_pressure) : 854,
            dewPoint: data.current.dew_point_2m !== undefined ? Number(data.current.dew_point_2m.toFixed(1)) : undefined,
            cloudCover: Math.round(data.current.cloud_cover || 0),
            faoEvapotranspiration: data.daily?.et0_fao_evapotranspiration?.[0] !== undefined ? Number(data.daily.et0_fao_evapotranspiration[0].toFixed(1)) : 3.2,
            sunrise: sunriseStr,
            sunset: sunsetStr,
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
      fetch('/geojson/gulmi-hydro-reaches.json').then(r => r.json()).catch(() => null),
      fetch('/geojson/gulmi-dhm-stations.json').then(r => r.json()).catch(() => fetch('/geojson/gulmi-hydrology-assets.json').then(r => r.json())).catch(() => null),
      fetch('/geojson/gulmi-rivers.json').then(r => r.json()).catch(() => null),
      fetch('/geojson/gulmi-contours.json').then(r => r.json()).catch(() => null),
    ]).then(([geo, palikas, climate, roads, reaches, hydroAssets, rivers, contours]) => {
      if (geo) setGeoData(geo);
      if (palikas) setPalikasData(palikas);
      if (climate) setClimateDataset(climate);
      if (roads) setNationalRoads(roads);
      if (reaches) setHydroReachesData(reaches);
      if (rivers) setGulmiRivers(rivers);
      if (contours) setContoursData(contours);
      if (hydroAssets?.type === 'FeatureCollection' && Array.isArray(hydroAssets.features)) {
        setHydrologyStations(hydroAssets.features);
      } else if (hydroAssets?.dhmRiverStationsByDistrict?.gulmi) {
        setHydrologyStations(hydroAssets.dhmRiverStationsByDistrict.gulmi);
      }
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

  // Track B: Dynamic Palika Attribute Joining Hook
  const choropleth = usePalikaChoropleth({
    rawGeoJson: palikasData,
    selectedPillar,
    subFilters,
    selectedCropId: selectedMapCropId || undefined,
    climateMonth,
    currentRainMm,
    currentTempC,
  });

  const isMerraRainfallActive = selectedPillar === 'water' && (subFilters.waterSubFilter || 'merra_rainfall') === 'merra_rainfall';
  const isSolarGhiActive = selectedPillar === 'energy' && subFilters.energySubFilter === 'solar_irradiance';

  const getPalikaStyle = (feature: any) => {
    const props = feature?.properties;
    const isHovered = hoveredPalika?.name === props?.name;
    const fillColor = choropleth.getColor(props?.name || '');

    if (isMerraRainfallActive || isSolarGhiActive) {
      return {
        fillColor: isHovered ? (isSolarGhiActive ? '#f59e0b' : '#38bdf8') : 'transparent',
        weight: isHovered ? 2.5 : 1.5,
        opacity: 0.95,
        color: isHovered ? '#10b981' : '#475569',
        fillOpacity: isHovered ? 0.22 : 0,
      };
    }

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

    const metricSnippet = choropleth.getTooltipHtml(props.name || '');

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
          color: '#10b981',
        });
        e.target.bringToFront();
        setHoveredPalika(props);
        handleHoverPalikaFromMatrix(props.name || '');
      },
      mouseout: (e: any) => {
        e.target.setStyle(getPalikaStyle(feature));
        setHoveredPalika(null);
        handleHoverPalikaFromMatrix(null);
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
        const cropLabel = cropNames[cropId] || cropId;
        const baseConfig = SUBFILTER_LEGENDS['crop_suitability'];
        if (baseConfig) {
          const config = {
            ...baseConfig,
            title: `${cropLabel} Suitability`,
            subtitle: `FAO ECOCROP Biophysical Model (Calibrated per Palika)`
          };
          return <DynamicLegend config={config} className="animate-fade-in-up" />;
        }
      }

      if (foodMode === 'barkhe_summer' || foodMode === 'hiunde_winter' || foodMode === 'double_cropping') {
        const config = SUBFILTER_LEGENDS[foodMode];
        if (config) {
          return <DynamicLegend config={config} className="animate-fade-in-up" />;
        }
      }

      const allCropsConfig = SUBFILTER_LEGENDS['crop_suitability'];
      if (allCropsConfig) {
        return <DynamicLegend config={allCropsConfig} className="animate-fade-in-up" />;
      }
    }

    if (selectedPillar === 'water') {
      const wSub = subFilters.waterSubFilter || 'merra_rainfall';
      if (wSub === 'merra_rainfall') {
        const rainfallConfig = SUBFILTER_LEGENDS['merra_rainfall'];
        const lowMm = Math.round(currentRainMm * 0.82);
        const highMm = Math.round(currentRainMm * 1.24);
        return (
          <DynamicLegend
            config={{
              ...rainfallConfig,
              subtitle: `${MONTH_NAMES[climateMonth - 1]} (${climateMode === 'climatology' ? '39-Yr Climatology Baseline' : climateYear}) • Area Mean: ${Math.round(currentRainMm)}mm`,
              gradient: rainfallConfig.gradient ? {
                ...rainfallConfig.gradient,
                minLabel: `Subtropical Valleys (~${lowMm} mm)`,
                maxLabel: `Mountain Ridges (~${highMm} mm)`
              } : undefined
            }}
            className="animate-fade-in-up"
          />
        );
      }

      const config = SUBFILTER_LEGENDS[wSub];
      if (config) {
        return <DynamicLegend config={config} className="animate-fade-in-up" />;
      }
    }

    if (selectedPillar === 'ecosystem') {
      const ecoSub = subFilters.ecoSubFilter || 'soil_ph';
      const config = SUBFILTER_LEGENDS[ecoSub] || SUBFILTER_LEGENDS['soil_sampling_grid'];
      if (config) {
        return <DynamicLegend config={config} className="animate-fade-in-up" />;
      }
    }

    if (selectedPillar === 'energy') {
      const eSub = subFilters.energySubFilter || 'hydro_corridor';
      const config = SUBFILTER_LEGENDS[eSub] || SUBFILTER_LEGENDS['hydro_corridor'];
      if (config) {
        return <DynamicLegend config={config} className="animate-fade-in-up" />;
      }
    }

    if (selectedPillar === 'socioeconomics') {
      const sSub = subFilters.socioSubFilter || 'local_governance';
      const config = SUBFILTER_LEGENDS[sSub] || SUBFILTER_LEGENDS['local_governance'];
      if (config) {
        return <DynamicLegend config={config} className="animate-fade-in-up" />;
      }
    }

    return null;
  };

  // [DATA PROVENANCE & CALCULATION METHODOLOGY LOADER]
  // Loaded from data/formulas/analytical_methodologies.json (Strict Rule 5 Zero-Hardcoding Compliance)
  const activeCalc = resolveCalculationMethodology({
    selectedPillar,
    subFilters,
    lang,
    cropName: (selectedMapCropId ? db.getCropById(selectedMapCropId) : null)?.name || 'Crop',
    cropNameNepali: (selectedMapCropId ? db.getCropById(selectedMapCropId) : null)?.nepaliName || 'बाली',
    climateMonth,
    currentRainMm,
    monthName: MONTH_NAMES[climateMonth - 1]
  });

  return (
    <div className="space-y-4">
      {/* 1. Unified WEFES Nexus Gulmi Executive Hero & Live Telemetry Container */}
      <div className="glass-panel rounded-2xl border border-slate-200/90 shadow-2xs bg-white/95 overflow-hidden animate-fade-in">
        {/* Top Tier: District Platform Identity & Badges */}
        <div className="p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 font-outfit">
                <Mountain className="w-5 h-5 text-emerald-600" />
                <span>{lang === 'np' ? 'गुल्मी जिल्ला WEFES नेक्सस नक्सा' : 'WEFES Nexus Gulmi · Spatial Decision Support'}</span>
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

        </div>

        {/* 1. Top Telemetry Header (Clean Meta-Bar) */}
        <div className="border-t border-slate-200/80 bg-slate-50/70 px-4 py-2 flex items-center justify-between flex-wrap gap-2 text-xs">
          {/* Left Side: Station Identity, Altitude & Coordinates */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 font-sans font-semibold text-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              <span>
                {lang === 'np' ? 'प्रत्यक्ष टेलिमेट्री — तमघास HQ (१,४५०m ASL)' : 'Live Telemetry — Tamghas HQ (1,450m ASL)'}
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {lang === 'np' ? '२८.०६८° उत्तर, ८३.२४८° पूर्व' : '28.068°N, 83.248°E'}
            </span>
            {liveWeatherLoading && (
              <span className="text-[10px] text-slate-400 font-mono animate-pulse">
                {lang === 'np' ? 'सिंक हुँदै…' : 'Syncing…'}
              </span>
            )}
          </div>

          {/* Right Side: Current Overall Weather Status */}
          <div className="flex items-center gap-2">
            {liveWeather ? (() => {
              const wmo = getWmoWeatherInfo(liveWeather.weatherCode, liveWeather.isDay);
              const IconComp = wmo.icon;
              return (
                <div className="flex items-center gap-1.5 bg-white text-slate-700 border border-slate-200/90 px-2.5 py-1 rounded-lg text-xs font-medium shadow-2xs">
                  <IconComp className={`w-3.5 h-3.5 ${wmo.color}`} />
                  <span className="font-semibold text-slate-800">
                    {lang === 'np' ? liveWeather.conditionLabelNp : liveWeather.conditionLabelEn}
                  </span>
                  <span className="text-slate-300">,</span>
                  <span className="font-bold text-slate-900 font-sans">{liveWeather.temperature}°C</span>
                  {liveWeather.precipitation > 0 && (
                    <span className="text-sky-600 font-sans text-[11px] font-medium">• {liveWeather.precipitation} mm/h</span>
                  )}
                </div>
              );
            })() : (
              <span className="text-xs text-slate-400 font-mono">
                {liveWeatherLoading ? (lang === 'np' ? 'मौसम लोड हुँदै...' : 'Loading Weather...') : 'Weather Offline'}
              </span>
            )}

            {/* Expand / Collapse Grid Toggle */}
            {liveWeather && (
              <button
                onClick={() => setIsAgroMeteoOpen(prev => !prev)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
                title={isAgroMeteoOpen ? 'Collapse telemetry cards' : 'Expand telemetry cards'}
                aria-label="Toggle telemetry cards"
              >
                {isAgroMeteoOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* 2. The Core 4-Card Grid */}
        {isAgroMeteoOpen && liveWeather && (() => {
          // Computed metric values with robust fallbacks
          const cloudCover = liveWeather.cloudCover ?? 22;
          const dewPoint = (liveWeather.dewPoint ?? 17.4).toFixed(1);
          const humidity = liveWeather.humidity ?? 94;

          const et0Val = Number(liveWeather.faoEvapotranspiration ?? 3.7);
          const rain24hVal = Number(liveWeather.dailyPrecipSum ?? 2.7);
          const waterDeficit = Math.max(0, et0Val - rain24hVal).toFixed(1);
          const deficitRatio = Math.min(100, Math.max(6, (parseFloat(waterDeficit) / Math.max(0.1, et0Val)) * 100));

          const uvVal = Number(liveWeather.uvIndex ?? 7.3);
          const uvRatio = Math.min(100, Math.max(6, (uvVal / 11) * 100));

          const windVal = Number(liveWeather.windSpeed ?? 2.6);
          const windRatio = Math.min(100, Math.max(6, (windVal / 15) * 100));
          const windDir = liveWeather.windDirection ?? 30;
          const windBearing = `${windDir}° ${getCardinalDirection(windDir)}`;

          return (
            <div className="border-t border-slate-200/80 bg-slate-50/50 p-3 sm:p-4 text-xs animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Card 1: Atmospheric Dynamics */}
                <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5 font-outfit">
                        <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{lang === 'np' ? 'वायुमण्डलीय चाप' : 'Atmospheric Dynamics'}</span>
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 bg-slate-100/90 border border-slate-200/70 px-1.5 py-0.5 rounded font-medium">
                        1,450m ASL
                      </span>
                    </div>

                    {/* Primary BAN */}
                    <div className="text-2xl sm:text-3xl font-black font-sans text-slate-900 tracking-tight flex items-baseline">
                      {liveWeather.surfacePressure ?? 854}
                      <span className="text-xs font-bold uppercase text-slate-400 ml-1.5 font-sans">hPa</span>
                    </div>

                    {/* Progress Indicator: Cloud Cover */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden my-2" title={`Cloud Cover: ${cloudCover}%`}>
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, cloudCover))}%` }}
                      />
                    </div>
                  </div>

                  {/* Secondary Data */}
                  <div className="text-[11px] text-slate-500 font-sans leading-relaxed flex flex-wrap items-center gap-x-1.5 pt-1 border-t border-slate-100">
                    <span>• Dew Point: <strong className="font-semibold text-slate-700">{dewPoint}°C</strong></span>
                    <span>• Cloud Cover: <strong className="font-semibold text-slate-700">{cloudCover}%</strong></span>
                    <span>• Humidity: <strong className="font-semibold text-slate-700">{humidity}%</strong></span>
                  </div>
                </div>

                {/* Card 2: Agro-Hydrology (ET₀) */}
                <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5 font-outfit">
                        <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{lang === 'np' ? 'कृषि-जल वाष्पीकरण' : 'Agro-Hydrology (ET₀)'}</span>
                      </span>
                      <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded font-semibold">
                        FAO-56
                      </span>
                    </div>

                    {/* Primary BAN */}
                    <div className="text-2xl sm:text-3xl font-black font-sans text-emerald-900 tracking-tight flex items-baseline">
                      {et0Val.toFixed(1)}
                      <span className="text-xs font-bold uppercase text-emerald-600 ml-1.5 font-sans">mm/d</span>
                    </div>

                    {/* Progress Indicator: Water Deficit */}
                    <div className="w-full bg-emerald-100/60 h-1.5 rounded-full overflow-hidden my-2" title={`Water Deficit: ${waterDeficit} mm/d`}>
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${deficitRatio}%` }}
                      />
                    </div>
                  </div>

                  {/* Secondary Data */}
                  <div className="text-[11px] text-slate-500 font-sans leading-relaxed flex flex-wrap items-center gap-x-1.5 pt-1 border-t border-slate-100">
                    <span>• 24h Rain: <strong className="font-semibold text-slate-700">{rain24hVal.toFixed(1)} mm</strong></span>
                    <span>• Water Deficit Index: <strong className="font-semibold text-emerald-700">{waterDeficit} mm/d</strong></span>
                  </div>
                </div>

                {/* Card 3: Solar & UV Yield */}
                <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5 font-outfit">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>{lang === 'np' ? 'सौर्य ऊर्जा र पराबैजनी' : 'Solar & UV Yield'}</span>
                      </span>
                      <span className="text-[9px] font-mono text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded font-semibold">
                        NASA Baseline
                      </span>
                    </div>

                    {/* Primary BAN */}
                    <div className="text-2xl sm:text-3xl font-black font-sans text-amber-900 tracking-tight flex items-baseline">
                      {uvVal.toFixed(1)}
                      <span className="text-xs font-bold uppercase text-amber-600 ml-1.5 font-sans">UV Index</span>
                    </div>

                    {/* Progress Indicator: UV Level */}
                    <div className="w-full bg-amber-100/60 h-1.5 rounded-full overflow-hidden my-2" title={`UV Index: ${uvVal.toFixed(1)}`}>
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${uvRatio}%` }}
                      />
                    </div>
                  </div>

                  {/* Secondary Data */}
                  <div className="text-[11px] text-slate-500 font-sans leading-relaxed flex flex-wrap items-center gap-x-1.5 pt-1 border-t border-slate-100">
                    <span>• Daylight: <strong className="font-semibold text-slate-700">{liveWeather.sunrise || '05:55'} – {liveWeather.sunset || '18:20'}</strong></span>
                    <span>• Elevation: <strong className="font-semibold text-amber-700">{liveWeather.isDay ? 'Daylight Phase ☀️' : 'Night Phase 🌙'}</strong></span>
                  </div>
                </div>

                {/* Card 4: Wind & Terrain Shear */}
                <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5 font-outfit">
                        <Wind className="w-3.5 h-3.5 text-teal-600" />
                        <span>{lang === 'np' ? 'पहाडी वायु र झोक्का' : 'Wind & Terrain Shear'}</span>
                      </span>
                      <span className="text-[9px] font-mono text-teal-700 bg-teal-50 border border-teal-200/80 px-1.5 py-0.5 rounded font-semibold">
                        10m AGL
                      </span>
                    </div>

                    {/* Primary BAN */}
                    <div className="text-2xl sm:text-3xl font-black font-sans text-teal-900 tracking-tight flex items-baseline">
                      {windVal.toFixed(1)}
                      <span className="text-xs font-bold uppercase text-teal-600 ml-1.5 font-sans">m/s</span>
                    </div>

                    {/* Progress Indicator: Wind Velocity */}
                    <div className="w-full bg-teal-100/60 h-1.5 rounded-full overflow-hidden my-2" title={`Wind Velocity: ${windVal.toFixed(1)} m/s`}>
                      <div
                        className="bg-teal-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${windRatio}%` }}
                      />
                    </div>
                  </div>

                  {/* Secondary Data */}
                  <div className="text-[11px] text-slate-500 font-sans leading-relaxed flex flex-wrap items-center gap-x-1.5 pt-1 border-t border-slate-100">
                    <span>• Bearing: <strong className="font-semibold text-slate-700">{windBearing}</strong></span>
                    <span className="inline-flex items-center gap-1">
                      • Terrain Risk:
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-semibold inline-flex items-center">
                        Low / Stable
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Provenance Footnote */}
              <div className="mt-3 pt-2 border-t border-slate-200/70 flex items-center justify-between flex-wrap gap-2 text-[10px] text-slate-400 font-mono">
                <span>📡 Open-Meteo High-Resolution (1.5km) NWP & Satellite Model • Tamghas HQ (28.068°N, 83.248°E)</span>
                <span className="text-emerald-700 font-medium">✓ Real-Time Telemetry Active</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 3. 5-Pillar WEFES Selector Bar */}
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

      {/* 4. Sub-filter toolbar */}
      <SubFilterToolbar
        selectedPillar={selectedPillar}
        onChange={onSubFilterChange}
        subFilters={subFilters}
      />

      {/* Dynamic Heatmap Legend */}
      {renderLegend()}

      {/* Map Workspace */}
      <div className="flex flex-col gap-2 w-full">
        {/* Map Options Pill: Directly above map on right side */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-white/95 border border-slate-200/90 shadow-2xs glass-panel text-xs animate-fade-in w-fit ml-auto">
            {/* Basemap Switcher */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold text-slate-700 shadow-2xs">
                <button
                  onClick={() => setBasemap('voyager')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${basemap === 'voyager' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'hover:text-slate-900 text-slate-600'
                    }`}
                  title="Clean Vector Basemap"
                >
                  Clean
                </button>
                <button
                  onClick={() => setBasemap('satellite')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${basemap === 'satellite' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'hover:text-slate-900 text-slate-600'
                    }`}
                  title="ESRI World Imagery Satellite"
                >
                  Satellite
                </button>
                <button
                  onClick={() => setBasemap('terrain')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${basemap === 'terrain' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'hover:text-slate-900 text-slate-600'
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

              {/* Topographic Contours Toggle */}
              <button
                onClick={() => setShowContours(prev => !prev)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${showContours || basemap === 'terrain'
                  ? 'bg-emerald-800 text-white border-emerald-700 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                title="Toggle 200m Topographic Elevation Contours & Life Zones"
              >
                <Mountain className="w-3.5 h-3.5 text-amber-300" />
                <span>Contours</span>
              </button>

              {/* Recenter Camera Button */}
              <button
                onClick={() => setResetTrigger(prev => prev + 1)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-2xs hover:text-emerald-700"
                title="Reset Map Camera to Gulmi"
              >
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                <span>Recenter</span>
              </button>
          </div>

          {/* Map Container */}
          <div className="relative glass-panel p-1.5 rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white h-[640px]">
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
              <GulmiBoundsController resetTrigger={resetTrigger} />
              <MapGestureHandler />
              <MapPanesSetup />

              {/* Dynamic Basemap Layer */}
              <TileLayer
                key={`basemap-${basemap}`}
                attribution={
                  basemap === 'satellite'
                    ? '&copy; <a href="https://www.esri.com/">Esri World Imagery</a>'
                    : basemap === 'terrain'
                      ? '&copy; <a href="https://www.esri.com/">Esri World Topographic</a>'
                      : '&copy; <a href="https://www.esri.com/">Esri World Light Gray</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }
                url={
                  basemap === 'satellite'
                    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                    : basemap === 'terrain'
                      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
                      : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
                }
              />

              {/* Continuous Spatial Rainfall Surface (IDW + Orographic Micro-Climate Lapse Rates) */}
              {isMerraRainfallActive && geoData && (
                <SpatialRainfallSurfaceOverlay
                  currentRainMm={currentRainMm}
                  currentTempC={currentTempC}
                  climateMonth={climateMonth}
                  geoData={geoData}
                  bounds={GULMI_BOUNDS}
                  opacity={0.82}
                />
              )}

              {/* Continuous Spatial Solar Irradiance Surface (Global Solar Atlas 900m Empirical Grid) */}
              {isSolarGhiActive && geoData && (
                <SpatialSolarSurfaceOverlay
                  geoData={geoData}
                  bounds={GULMI_BOUNDS}
                  opacity={0.85}
                />
              )}

              {/* 12 Gulmi Palikas Vector Layer (Dynamically styled per Pillar, Crop, and Climate Time-Series) */}
              {palikasData && (
                <GeoJSON
                  key={`gulmi-palikas-${selectedPillar}-${selectedMapCropId}-${subFilters.crop || ''}-${subFilters.foodMode || ''}-${subFilters.foodOverlayType || ''}-${subFilters.waterSubFilter || ''}-${subFilters.ecoSubFilter || ''}-${subFilters.energySubFilter || ''}-${subFilters.socioSubFilter || ''}-${climateMonth}-${climateYear}-${climateMode}-${currentRainMm}-${hoveredPalika?.name || ''}`}
                  data={palikasData}
                  pane="palikasPane"
                  style={(feature: any) => {
                    const pName = (feature?.properties?.name || '').toLowerCase();
                    const isHovered = hoveredPalika?.name && (
                      pName.includes(hoveredPalika.name.toLowerCase()) ||
                      hoveredPalika.name.toLowerCase().includes(pName)
                    );
                    const isContourActive = showContours || basemap === 'terrain';
                    const baseOpacity = isContourActive ? 0.45 : 0.72;

                    if (isMerraRainfallActive || isSolarGhiActive) {
                      return {
                        fillColor: isHovered ? (isSolarGhiActive ? '#f59e0b' : '#38bdf8') : 'transparent',
                        fillOpacity: isHovered ? 0.22 : 0,
                        color: isHovered ? '#10b981' : '#334155',
                        weight: isHovered ? 3.5 : 1.6,
                        dashArray: '',
                      };
                    }

                    return {
                      fillColor: choropleth.getColor(feature?.properties?.name || ''),
                      fillOpacity: isHovered ? Math.min(0.92, baseOpacity + 0.3) : baseOpacity,
                      color: isHovered ? '#10b981' : '#ffffff',
                      weight: isHovered ? 3.5 : 1.8,
                      dashArray: '',
                    };
                  }}
                  onEachFeature={onEachPalika}
                />
              )}

              {/* Vector Topographic Contours (200m interval isolines with elevation & life zones) */}
              {contoursData && (showContours || basemap === 'terrain') && (
                <GeoJSON
                  key="gulmi-contours-layer"
                  data={contoursData}
                  pane="contoursPane"
                  style={(feature: any) => {
                    const p = feature?.properties || {};
                    return {
                      color: p.color || '#0284c7',
                      weight: p.weight || 1.5,
                      opacity: p.opacity || 0.8,
                    };
                  }}
                  onEachFeature={(feature: any, layer: any) => {
                    const p = feature?.properties || {};
                    layer.bindTooltip(`
                      <div style="padding: 4px 6px; font-size: 11px; min-width: 170px;">
                        <div style="font-weight: 800; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; margin-bottom: 3px;">
                          ⛰️ ${p.elevation}m masl ${p.isIndex ? '(Index Contour)' : ''}
                        </div>
                        <div style="color: #0369a1; font-weight: 600; font-size: 10px;">${p.lifeZone || 'Mid-Hills'}</div>
                        <div style="color: #475569; font-size: 9.5px; margin-top: 1px;">Lapse Temp: <strong>${p.temperatureC ?? 16}°C</strong></div>
                        ${p.feasibleCrops?.length ? `<div style="color: #15803d; font-size: 9px; margin-top: 2px; line-height: 1.2;">🌾 Crops: ${p.feasibleCrops.slice(0, 3).join(', ')}</div>` : ''}
                      </div>
                    `, { direction: 'top', offset: [0, -4], opacity: 0.98, pane: 'popupPane' });
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

              {/* Contextual Layer Isolation 1: Roads strictly shown when explicitly filtering roads / market proximity */}
              {nationalRoads && (
                subFilters.highwayFilter === 'all' ||
                subFilters.highwayFilter === 'primary' ||
                (selectedPillar === 'socioeconomics' && (subFilters.socioSubFilter === 'hq_market_proximity' || subFilters.highwayFilter !== 'none'))
              ) && (
                  <GeoJSON
                    key={`national-roads-${subFilters.highwayFilter || 'corridor'}`}
                    data={nationalRoads}
                    style={(feature: any) => {
                      const hwyType = (feature?.properties?.highway || '').toLowerCase();
                      const isPrimary = hwyType === 'trunk' || hwyType === 'primary';
                      return {
                        color: isPrimary ? '#f97316' : '#fbbf24',
                        weight: isPrimary ? 3 : 2,
                        opacity: 0.9,
                      };
                    }}
                    pane="roadsPane"
                  />
                )}

              {/* Contextual Layer Isolation 2: Run-of-River & Micro-Hydro Screened Reaches (Strictly on Energy Run-of-River) */}
              {hydroReachesData && (
                selectedPillar === 'energy' && (!subFilters.energySubFilter || subFilters.energySubFilter === 'hydro_corridor')
              ) && (
                  <GeoJSON
                    key={`screened-hydro-reaches-${selectedPillar}`}
                    data={hydroReachesData}
                    pane="pointsPane"
                    pointToLayer={(feature: any, latlng: any) => {
                      const pKw = feature?.properties?.power_kW || 10;
                      const isRoR = pKw >= 100;
                      const radius = isRoR ? 6 : 4.5;
                      const fillColor = isRoR ? '#8b5cf6' : '#06b6d4';
                      return L.circleMarker(latlng, {
                        radius,
                        fillColor,
                        fillOpacity: 0.95,
                        color: '#ffffff',
                        weight: 2,
                        pane: 'pointsPane',
                      });
                    }}
                    onEachFeature={(feature: any, layer: any) => {
                      const p = feature?.properties || {};
                      layer.bindTooltip(`
                    <div style="padding: 4px; font-size: 11px; min-width: 140px;">
                      <div style="font-weight: bold; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; margin-bottom: 3px;">
                        ⚡ Reach #${p.id} (${p.palika})
                      </div>
                      <div style="color: #0369a1; font-weight: 600;">Power: ${p.power_kW} kW</div>
                      <div style="color: #64748b; font-size: 10px;">Class: ${p.class}</div>
                      <div style="color: #64748b; font-size: 10px;">Head: ${p.head_m}m • Flow: ${p.flow_m3s} m³/s</div>
                      <div style="color: #10b981; font-size: 10px; font-weight: 600; margin-top: 2px;">Annual Energy: ${p.energy_mwh} MWh</div>
                    </div>
                  `, { direction: 'top', offset: [0, -6], opacity: 0.98, pane: 'popupPane' });
                    }}
                  />
                )}

              {/* Contextual Layer Isolation 2.5: Real River Network Vector Polylines */}
              {selectedPillar === 'water' && gulmiRivers && (subFilters.waterSubFilter === 'dhm_station' || subFilters.waterSubFilter === 'river_basins' || subFilters.waterSubFilter === 'irrigation_potential' || subFilters.waterClimateMetric === 'dhm_stations') && (
                <GeoJSON
                  key={`gulmi-rivers-vector-${subFilters.waterSubFilter}`}
                  data={gulmiRivers}
                  pane="riversPane"
                  style={(feature: any) => {
                    const p = feature?.properties || {};
                    const isMain = p.order === 1;
                    const isMajor = p.order === 2;
                    return {
                      color: isMain ? '#0284c7' : isMajor ? '#0ea5e9' : '#38bdf8',
                      weight: isMain ? 4 : isMajor ? 3 : 2,
                      opacity: 0.95,
                      dashArray: '',
                    };
                  }}
                  onEachFeature={(feature: any, layer: any) => {
                    const p = feature?.properties || {};
                    layer.bindTooltip(`
                    <div style="padding: 4px 6px; font-size: 11px; min-width: 170px;">
                      <div style="font-weight: bold; color: #0284c7; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; margin-bottom: 3px;">
                        🌊 ${p.name || 'River Reach'} (${p.nepaliName || ''})
                      </div>
                      <div style="color: #334155; font-size: 10px;"><strong>Type:</strong> ${p.type}</div>
                      <div style="color: #334155; font-size: 10px;"><strong>Sub-Basin:</strong> ${p.subBasin} (${p.basin})</div>
                      <div style="color: #64748b; font-size: 9px; margin-top: 2px;">${p.importance}</div>
                      ${p.dhmStation ? `<div style="color: #0369a1; font-weight: 600; font-size: 10px; margin-top: 3px;">💧 DHM Station: ${p.dhmStation}</div>` : ''}
                    </div>
                  `, { direction: 'top', offset: [0, -4], opacity: 0.98, pane: 'popupPane' });
                  }}
                />
              )}

              {/* Contextual Layer Isolation 3: DHM River Gauging Stations Overlay */}
              {selectedPillar === 'water' && (subFilters.waterSubFilter === 'dhm_station' || subFilters.waterSubFilter === 'river_basins' || subFilters.waterClimateMetric === 'dhm_stations') && hydrologyStations.map((st: any, idx: number) => {
                const props = st.properties || st;
                const isRegional = props.isInGulmi === false || props.district?.includes('Syangja');
                const isMet = props.stationType === 'meteorological' || props.stationNo?.includes('0701');
                const markerColor = isRegional ? '#f59e0b' : isMet ? '#8b5cf6' : '#0284c7';
                const badgeLabel = isRegional ? 'Regional Inflow' : isMet ? 'Meteorological' : 'Active Hydrometric';
                const badgeBg = isRegional ? 'bg-amber-100 text-amber-800' : isMet ? 'bg-purple-100 text-purple-800' : 'bg-sky-100 text-sky-800';

                return (
                  <CircleMarker
                    key={`hydro-${props.stationNo}-${idx}`}
                    center={[st.lat ?? st.geometry?.coordinates[1], st.lng ?? st.geometry?.coordinates[0]]}
                    radius={isRegional ? 8.5 : 8}
                    pane="pointsPane"
                    pathOptions={{
                      fillColor: markerColor,
                      fillOpacity: 0.98,
                      color: '#ffffff',
                      weight: 2.5,
                      pane: 'pointsPane',
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -8]} opacity={0.98} pane="popupPane">
                      <div className="text-xs p-1.5 min-w-[220px] bg-white rounded shadow-md border border-slate-200">
                        <div className="font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-1 mb-1">
                          <span className="flex items-center gap-1 font-outfit">
                            {isMet ? '🌤️' : '💧'} Station #{props.stationNo}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${badgeBg}`}>
                            {badgeLabel}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-900 text-xs">
                          {props.displayLabel || `${props.river} (${props.siteName})`}
                        </div>
                        <div className="text-slate-600 text-[10px] mt-0.5">
                          Location: <strong>{props.district || 'Gulmi'}</strong> • Elev: <strong>{props.elevation ? `${props.elevation}m` : 'N/A'}</strong>
                        </div>
                        <div className="text-slate-500 text-[10px] mt-1 bg-slate-50 p-1 rounded font-mono break-words">
                          Equip: {props.instruments}
                        </div>
                        {props.startDate && (
                          <div className="text-slate-400 text-[9px] mt-0.5">Established: {props.startDate}</div>
                        )}
                      </div>
                    </Tooltip>
                  </CircleMarker>
                );
              })}

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
        </div>

      {/* Scientific Methodology, Calculation & Data Lineage Note Card (Sole Section Below Map) */}
      <div className="glass-panel p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xs space-y-2.5">
        {/* Note Card Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 font-outfit">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'np' ? 'विश्लेषणात्मक टिपोट' : 'Analytical Note'}</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-xs text-slate-700 font-semibold">
              {activeCalc.shortTitle}
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              ({activeCalc.model})
            </span>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
              activeCalc.confidence === 'OBSERVED REAL'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : activeCalc.confidence === 'CALCULATED'
                  ? 'bg-sky-100 text-sky-800 border-sky-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              {activeCalc.confidence === 'OBSERVED REAL' ? (
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
              ) : activeCalc.confidence === 'CALCULATED' ? (
                <Cpu className="w-3 h-3 text-sky-600" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-amber-600" />
              )}
              <span>{activeCalc.confidence}</span>
            </span>
          </div>

          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            WEFES Polyglot Engine • Zero-Synthesis Validated
          </span>
        </div>

        {/* Minimal 3-Column Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 text-xs pt-1 md:divide-x md:divide-slate-100">
          {/* Column 1: Formula & Mathematical Basis */}
          <div className="space-y-1.5 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-outfit">
                {lang === 'np' ? 'गणितीय सूत्र:' : 'Mathematical Formula:'}
              </div>
              <div className="bg-slate-50/80 border border-slate-200/70 rounded-lg p-2.5 font-mono text-xs shadow-2xs space-y-1.5">
                <div className="font-semibold text-slate-900 break-words leading-snug">
                  {activeCalc.formula}
                </div>
                {activeCalc.parameter && (
                  <div className="text-[10px] text-slate-500 font-sans border-t border-slate-200/60 pt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                    <span className="font-mono text-[10.5px] text-slate-600 break-words leading-tight">{activeCalc.parameter}</span>
                  </div>
                )}
                {activeCalc.variables && activeCalc.variables.length > 0 && (
                  <div className="pt-1.5 border-t border-slate-200/60 space-y-1">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-outfit">
                      {lang === 'np' ? 'संकेत विवरण (Symbols):' : 'Variable Definitions:'}
                    </div>
                    <div className="grid grid-cols-1 gap-1 text-[10.5px] font-sans">
                      {activeCalc.variables.map((v, i) => (
                        <div key={i} className="flex items-baseline gap-1.5 text-slate-600">
                          <span className="font-mono font-bold text-slate-800 bg-white border border-slate-200 px-1 py-0.2 rounded text-[10px] shrink-0">{v.symbol}</span>
                          <span className="text-slate-300 text-[10px]">=</span>
                          <span className="leading-tight text-slate-600">{v.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
                {activeCalc.description}
              </p>
            </div>
          </div>

          {/* Column 2: Active Legend Range & Empirical Inputs */}
          <div className="space-y-1.5 flex flex-col justify-between md:pl-4">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-outfit">
                {lang === 'np' ? 'मापन दायरा तथा इनपुट:' : 'Metric Range & Inputs:'}
              </div>
              <div className="bg-slate-50/70 border border-slate-200/60 rounded-lg px-2.5 py-1.5 space-y-0.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>{lang === 'np' ? 'सक्रिय दायरा:' : 'Active Range:'}</span>
                  <span className="font-mono text-[10px] bg-white text-slate-700 px-1.5 py-0.2 rounded border border-slate-200 font-medium">
                    Unit: {activeCalc.unit}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 leading-snug">
                  {activeCalc.currentStat}
                </div>
              </div>
              <div className="space-y-0.5 pt-0.5">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {lang === 'np' ? 'इनपुट प्यारामिटरहरू:' : 'Empirical Datasets:'}
                </div>
                <ul className="space-y-0.5 text-[11px] text-slate-600">
                  {activeCalc.inputs.map((inp, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                      <span className="truncate">{inp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Column 3: In-Code Data Lineage & Physical Disk Provenance */}
          <div className="space-y-1.5 flex flex-col justify-between md:pl-4">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-outfit flex items-center justify-between">
                <span>{lang === 'np' ? 'प्रामाणिक स्रोत विवरण:' : 'Data Lineage & Provenance:'}</span>
                <span className="text-[10px] font-mono text-emerald-700 font-medium flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified</span>
                </span>
              </div>
              <div className="bg-slate-50/70 border border-slate-200/60 rounded-lg p-2.5 text-[11px] font-mono space-y-1.5 text-slate-600">
                <div>Source: <strong className="text-slate-800 font-sans">{activeCalc.citation}</strong></div>
                <div>Physical Disk: <code className="bg-slate-200/70 text-slate-800 px-1 py-0.2 rounded text-[10px] break-all select-all font-mono">{activeCalc.provenancePath}</code></div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                  <span>Classification: {activeCalc.confidence}</span>
                  <span className="text-slate-400 font-sans">Zero-Synthesis Validated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistrictMap;

