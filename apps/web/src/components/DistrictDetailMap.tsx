import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { District, Crop, CropSuitability } from '@wefes/shared-types';
import { db } from '@wefes/database';
import {
  MapPin, Droplets, Zap, Sprout, Trees, Coins, Layers, Eye,
  Compass, Sparkles, RotateCcw, Info, CloudRain, Sun, Mountain,
  Users, CheckCircle2, TrendingUp, ChevronRight, DollarSign, Award, Leaf,
  Thermometer, FlaskConical, ArrowUpRight, CheckCircle, Wheat, X, Sliders,
  Navigation, Route, ShieldAlert, Activity, BarChart3, Filter, CheckSquare, Square
} from 'lucide-react';
import { MapGestureHandler } from './MapGestureHandler';
import { DistrictElevationProfiler } from './DistrictElevationProfiler';
import { DISTRICT_LANDMARKS, REAL_HYDROPOWER_PLANTS, DistrictLandmarks, RealHydropowerAsset } from '../data/districtRealAssets';
import { DISTRICT_PALIKAS, DistrictPalika, PalikaFeasibleCrop } from '../data/districtPalikaAssets';
import {
  DANGEROUS_GLACIAL_LAKES_BY_DISTRICT,
  LAKE_ALTITUDE_DISTRIBUTION,
  DHM_RIVER_STATIONS_BY_DISTRICT,
  DetailedGlacialLake,
  DHMRiverStation
} from '../data/districtHydrologyAssets';
import { generateDistrictContours, ContourLine } from '../utils/contourGenerator';

interface DistrictDetailMapProps {
  district: District;
  selectedPalikaName?: string;
  onSelectPalika?: (palikaName: string) => void;
  distClimatology?: any;
  rainfallARIMA?: any;
  districtCrops?: { crop: Crop; suitability: CropSuitability }[];
  onSelectCrop?: (crop: Crop) => void;
}

type MapLayerMode = 'overview' | 'elevation' | 'crops' | 'energy' | 'hydrology' | 'soil' | 'climate' | 'labor' | 'roads';
type BaseMapStyle = 'voyager' | 'osm' | 'opentopo' | 'satellite';

const BASE_MAP_TILES: Record<BaseMapStyle, { url: string; attribution: string; name: string }> = {
  voyager: {
    name: 'Carto Voyager Clean',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  osm: {
    name: 'OpenStreetMap Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  opentopo: {
    name: 'Topographic Relief',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap'
  },
  satellite: {
    name: 'Satellite Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
};

// Helper component to auto-fit bounds strictly on the active district polygon
function MapBoundsUpdater({ feature }: { feature: any }) {
  const map = useMap();
  useEffect(() => {
    if (feature && map) {
      try {
        const layer = L.geoJSON(feature);
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [45, 45],
            maxZoom: 11,
            animate: true,
          });
          map.setMaxBounds(bounds.pad(0.4));
        }
      } catch (e) {
        console.error('Error fitting bounds:', e);
      }
    }
  }, [feature, map]);
  return null;
}

// ─── CUSTOM MAP ICONS ───

const createDHMStationPinIcon = (stationNo: string) => {
  return L.divIcon({
    className: 'custom-dhm-marker',
    html: `
      <div style="
        background: #0284c7;
        color: #ffffff;
        padding: 2px 7px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 3px;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 8px rgba(2, 132, 199, 0.4);
        font-size: 11px;
        font-weight: 800;
        font-family: monospace;
        white-space: nowrap;
        cursor: pointer;
      ">
        <span>💧</span>
        <span>#${stationNo}</span>
      </div>
    `,
    iconSize: [60, 24],
    iconAnchor: [30, 12],
    popupAnchor: [0, -12],
  });
};

const createGlacialLakePinIcon = (name: string, level: string) => {
  const bg = level === 'Critical' ? '#dc2626' : level === 'High' ? '#ea580c' : '#0284c7';
  return L.divIcon({
    className: 'custom-glof-marker',
    html: `
      <div style="
        background: ${bg};
        color: #ffffff;
        padding: 2px 8px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(220, 38, 38, 0.4);
        font-size: 11px;
        font-weight: 800;
        font-family: monospace;
        white-space: nowrap;
        cursor: pointer;
      ">
        <span>❄️</span>
        <span>${name}</span>
      </div>
    `,
    iconSize: [110, 24],
    iconAnchor: [55, 12],
    popupAnchor: [0, -12],
  });
};

const createHydroPinIcon = (mw: number) => {
  const size = mw >= 100 ? 32 : mw >= 25 ? 28 : 24;
  return L.divIcon({
    className: 'custom-hydro-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, #7c3aed, #4f46e5);
        color: #ffffff;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(124, 58, 237, 0.4);
        font-size: 11px;
        font-weight: bold;
        cursor: pointer;
      ">
        ⚡
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const createPalikaPinIcon = (emoji: string, palikaName: string, score: number) => {
  const bg = score >= 75 ? '#059669' : score >= 55 ? '#d97706' : '#64748b';
  return L.divIcon({
    className: 'custom-palika-marker',
    html: `
      <div style="
        background: ${bg};
        color: #ffffff;
        padding: 3px 8px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        gap: 4px;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
        font-size: 11px;
        font-weight: 700;
        font-family: system-ui, sans-serif;
        white-space: nowrap;
        cursor: pointer;
      ">
        <span>${emoji}</span>
        <span>${palikaName}</span>
      </div>
    `,
    iconSize: [110, 24],
    iconAnchor: [55, 12],
    popupAnchor: [0, -12],
  });
};

function parseElevationRange(elevationStr?: string, ecoZone?: string): { min: number; max: number; span: number } {
  if (elevationStr) {
    const parts = elevationStr.replace(/m/gi, '').split('-').map(s => parseFloat(s.trim()));
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { min: parts[0], max: parts[1], span: Math.max(1, parts[1] - parts[0]) };
    }
  }
  if (ecoZone === 'Terai') return { min: 60, max: 400, span: 340 };
  if (ecoZone === 'Mountain') return { min: 1800, max: 7000, span: 5200 };
  return { min: 600, max: 2800, span: 2200 };
}

export const DistrictDetailMap: React.FC<DistrictDetailMapProps> = ({
  district,
  distClimatology,
  rainfallARIMA,
  districtCrops = [],
  onSelectCrop,
}) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [layerMode, setLayerMode] = useState<MapLayerMode>('overview');
  const [baseMapStyle, setBaseMapStyle] = useState<BaseMapStyle>('voyager');
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('all');
  const [selectedNepaliSeason, setSelectedNepaliSeason] = useState<string>('all'); // 'all' | 'barkhe' | 'hiunde' | 'chaite' | 'baahramase'
  const [showContours, setShowContours] = useState<boolean>(true);
  const [districtRoadsData, setDistrictRoadsData] = useState<any>(null);
  const [roadsLoading, setRoadsLoading] = useState<boolean>(false);

  // Interactive Road Hierarchy Filters
  const [roadFilter, setRoadFilter] = useState<{
    highways: boolean;
    feeders: boolean;
    municipal: boolean;
    rural: boolean;
  }>({
    highways: true,
    feeders: true,
    municipal: true,
    rural: true,
  });

  const elevationInfo = useMemo(() => {
    return parseElevationRange(district.elevationRange, district.ecoZone);
  }, [district.elevationRange, district.ecoZone]);

  // Verified crops specifically for this district
  const availableDistrictCrops = useMemo(() => {
    if (districtCrops && districtCrops.length > 0) {
      return districtCrops.map(dc => dc.crop);
    }
    return db.getDistrictCrops(district.id).map(dc => dc.crop);
  }, [districtCrops, district.id]);

  const districtPalikas = useMemo<DistrictPalika[]>(() => {
    return DISTRICT_PALIKAS[district.id] || DISTRICT_PALIKAS[district.name] || [];
  }, [district.id, district.name]);

  const displayedPalikaCropMarkers = useMemo(() => {
    const list: { palika: DistrictPalika; cropItem: PalikaFeasibleCrop; isRotation?: boolean }[] = [];
    districtPalikas.forEach(palika => {
      const crops = palika.feasibleCrops || [];
      if (selectedCropFilter !== 'all') {
        const match = crops.find((c: PalikaFeasibleCrop) => c.cropId === selectedCropFilter);
        if (match) {
          list.push({ palika, cropItem: match, isRotation: false });
        }
      } else {
        if (selectedNepaliSeason === 'barkhe') {
          const item = palika.seasonalRotations?.barkhe || crops.find(c => c.season === 'barkhe') || crops[0];
          if (item) list.push({ palika, cropItem: item, isRotation: false });
        } else if (selectedNepaliSeason === 'hiunde') {
          const item = palika.seasonalRotations?.hiunde || crops.find(c => c.season === 'hiunde') || crops[0];
          if (item) list.push({ palika, cropItem: item, isRotation: false });
        } else if (selectedNepaliSeason === 'chaite') {
          const item = palika.seasonalRotations?.chaite || crops.find(c => c.season === 'chaite') || crops[0];
          if (item) list.push({ palika, cropItem: item, isRotation: false });
        } else if (selectedNepaliSeason === 'baahramase') {
          const item = palika.seasonalRotations?.baahramase || crops.find(c => c.season === 'baahramase') || crops[0];
          if (item) list.push({ palika, cropItem: item, isRotation: false });
        } else {
          // 'all' Annual Rotation
          const topRot = palika.seasonalRotations?.barkhe || palika.seasonalRotations?.hiunde || palika.seasonalRotations?.baahramase || crops[0] || {
            cropId: 'rice',
            cropName: 'Paddy Rice',
            nepaliName: 'धान',
            emoji: '🌾',
            category: 'Cereal',
            score: 75,
            rating: 'Optimal' as const,
            limitingFactor: 'None'
          };
          list.push({ palika, cropItem: topRot, isRotation: true });
        }
      }
    });
    return list;
  }, [districtPalikas, selectedCropFilter, selectedNepaliSeason]);

  const glacialLakesList = useMemo<DetailedGlacialLake[]>(() => {
    return DANGEROUS_GLACIAL_LAKES_BY_DISTRICT[district.id] || DANGEROUS_GLACIAL_LAKES_BY_DISTRICT[district.name] || [];
  }, [district.id, district.name]);

  const lakeAltitudeStats = useMemo(() => {
    return LAKE_ALTITUDE_DISTRIBUTION[district.id] || LAKE_ALTITUDE_DISTRIBUTION[district.name] || null;
  }, [district.id, district.name]);

  const dhmRiverStations = useMemo<DHMRiverStation[]>(() => {
    return DHM_RIVER_STATIONS_BY_DISTRICT[district.id] || DHM_RIVER_STATIONS_BY_DISTRICT[district.name] || [];
  }, [district.id, district.name]);

  // Load District Boundary Polygon
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch('/geojson/nepal-districts-enriched.json')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        const matched = data.features.find((f: any) => {
          const fid = f.properties.id || f.properties.DISTRICT || f.properties.name;
          return fid?.toLowerCase() === district.id.toLowerCase() ||
                 f.properties.name?.toLowerCase() === district.name.toLowerCase();
        });

        if (matched) {
          setGeoData(matched);
        } else {
          setGeoData(data.features[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load district vector geojson:', err);
        setLoading(false);
      });

    return () => { isMounted = false; };
  }, [district.id, district.name]);

  // Load Per-District Road GeoJSON
  useEffect(() => {
    let isMounted = true;
    setRoadsLoading(true);

    const distId = district.id.toLowerCase();
    fetch(`/geojson/roads/${distId}.json`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!isMounted) return;
        setDistrictRoadsData(data);
        setRoadsLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setDistrictRoadsData(null);
          setRoadsLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [district.id]);

  const centroid = useMemo<[number, number]>(() => {
    if (district.coordinates?.lat && district.coordinates?.lng) {
      return [district.coordinates.lat, district.coordinates.lng];
    }
    if (geoData?.geometry) {
      try {
        const layer = L.geoJSON(geoData);
        const bounds = layer.getBounds();
        const center = bounds.getCenter();
        return [center.lat, center.lng];
      } catch (e) {
        return [28.2, 84.0];
      }
    }
    return [28.2, 84.0];
  }, [district, geoData]);

  const generatedContours = useMemo<ContourLine[]>(() => {
    if (!geoData) return [];
    return generateDistrictContours(district, geoData.geometry, 10);
  }, [district, geoData]);

  const landmarks: DistrictLandmarks | undefined = DISTRICT_LANDMARKS[district.id] || DISTRICT_LANDMARKS[district.name];
  const hydroPlants: RealHydropowerAsset[] = REAL_HYDROPOWER_PLANTS[district.id] || REAL_HYDROPOWER_PLANTS[district.name] || [];

  // Filter Road Features Based on Active Checkboxes
  const filteredRoadsData = useMemo(() => {
    if (!districtRoadsData || !districtRoadsData.features) return null;
    const activeFeatures = districtRoadsData.features.filter((f: any) => {
      const hwy = f?.properties?.highway?.toLowerCase();
      if (hwy === 'trunk' || hwy === 'primary') return roadFilter.highways;
      if (hwy === 'secondary') return roadFilter.feeders;
      if (hwy === 'tertiary' || hwy === 'residential' || hwy === 'unclassified' || hwy === 'road' || hwy === 'living_street') return roadFilter.municipal;
      return roadFilter.rural;
    });
    return {
      ...districtRoadsData,
      features: activeFeatures
    };
  }, [districtRoadsData, roadFilter]);

  // Road counts by category
  const roadStats = useMemo(() => {
    if (!districtRoadsData || !districtRoadsData.features) {
      return { total: 0, highways: 0, feeders: 0, municipal: 0, rural: 0 };
    }
    let highways = 0, feeders = 0, municipal = 0, rural = 0;
    districtRoadsData.features.forEach((f: any) => {
      const hwy = f?.properties?.highway?.toLowerCase();
      if (hwy === 'trunk' || hwy === 'primary') highways++;
      else if (hwy === 'secondary') feeders++;
      else if (hwy === 'tertiary' || hwy === 'residential' || hwy === 'unclassified' || hwy === 'road' || hwy === 'living_street') municipal++;
      else rural++;
    });
    return {
      total: districtRoadsData.features.length,
      highways,
      feeders,
      municipal,
      rural
    };
  }, [districtRoadsData]);

  const getDistrictFeatureStyle = () => {
    switch (layerMode) {
      case 'elevation':
        return {
          fillColor: '#0f172a',
          fillOpacity: 0.12,
          color: '#0284c7',
          weight: 2.5,
          dashArray: '3, 3'
        };
      case 'crops':
        return {
          fillColor: '#047857',
          fillOpacity: 0.15,
          color: '#10b981',
          weight: 2.5
        };
      case 'roads':
        return {
          fillColor: '#000000',
          fillOpacity: 0.03,
          color: '#ea580c',
          weight: 2.5
        };
      case 'energy':
        return {
          fillColor: '#7c3aed',
          fillOpacity: 0.15,
          color: '#8b5cf6',
          weight: 2.5
        };
      case 'hydrology':
        return {
          fillColor: '#0284c7',
          fillOpacity: 0.18,
          color: '#38bdf8',
          weight: 2.5
        };
      case 'soil':
        return {
          fillColor: '#b45309',
          fillOpacity: 0.15,
          color: '#d97706',
          weight: 2.5
        };
      case 'climate':
        return {
          fillColor: '#0369a1',
          fillOpacity: 0.15,
          color: '#0ea5e9',
          weight: 2.5
        };
      case 'labor':
        return {
          fillColor: '#4f46e5',
          fillOpacity: 0.15,
          color: '#6366f1',
          weight: 2.5
        };
      default:
        return {
          fillColor: '#059669',
          fillOpacity: 0.12,
          color: '#10b981',
          weight: 2.5
        };
    }
  };

  // Distinct Road Category Styles
  const getRoadVectorStyle = (feature: any) => {
    const hwy = feature?.properties?.highway?.toLowerCase();
    if (hwy === 'trunk' || hwy === 'primary') {
      return {
        color: '#ea580c', // High-visibility Orange-Red for Strategic Highways
        weight: 4.0,
        opacity: 0.95
      };
    }
    if (hwy === 'secondary') {
      return {
        color: '#f59e0b', // Amber-Gold for Feeder Roads
        weight: 2.8,
        opacity: 0.90
      };
    }
    if (hwy === 'tertiary') {
      return {
        color: '#0284c7', // Sky Blue for District Paved Links
        weight: 2.2,
        opacity: 0.85
      };
    }
    if (hwy === 'residential' || hwy === 'unclassified') {
      return {
        color: '#64748b', // Slate for Municipal Streets
        weight: 1.6,
        opacity: 0.80
      };
    }
    // Rural agricultural tracks
    return {
      color: '#78716c', // Stone/Brown for Farm Tracks
      weight: 1.2,
      dashArray: '3, 3',
      opacity: 0.75
    };
  };

  const onEachRoad = (feature: any, layer: L.Layer) => {
    const props = feature.properties;
    if (!props) return;
    const hwy = props.highway?.toLowerCase();
    const categoryLabel =
      hwy === 'trunk' || hwy === 'primary' ? 'National Strategic Highway (Class A)' :
      hwy === 'secondary' ? 'Feeder Road (Class B)' :
      hwy === 'tertiary' ? 'District / Urban Road (Class C)' :
      hwy === 'residential' ? 'Municipal / Settlement Street' : 'Agricultural Track / Rural Link';

    const badgeBg =
      hwy === 'trunk' || hwy === 'primary' ? '#ea580c' :
      hwy === 'secondary' ? '#d97706' :
      hwy === 'tertiary' ? '#0284c7' : '#64748b';

    layer.bindPopup(`
      <div style="font-family: system-ui, sans-serif; font-size: 11px; padding: 4px; min-width: 190px;">
        <div style="font-weight: 800; font-size: 12px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; display: flex; justify-content: space-between; align-items: center;">
          <span>🛣️ ${props.name || 'Local Route'}</span>
          <span style="background: ${badgeBg}; color: white; padding: 1px 5px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase;">${props.highway}</span>
        </div>
        <div style="margin-top: 4px; color: #475569; font-size: 10px;">Classification: <strong style="color: #0f172a;">${categoryLabel}</strong></div>
        <div style="margin-top: 2px; color: #475569; font-size: 10px;">Surface: <strong style="color: #0f172a; text-transform: capitalize;">${props.surface || 'Paved / Gravel'}</strong></div>
        <div style="margin-top: 2px; color: #475569; font-size: 10px;">Lanes: <strong style="color: #0f172a;">${props.lanes || 1}</strong></div>
      </div>
    `, { autoPan: false });
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm bg-white/95 space-y-5 animate-fade-in-up">
      {/* Top Header & Layer Switcher Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold mb-1">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-500 font-sans tracking-wide">
              Interactive District Spatial Explorer
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight font-outfit text-slate-900 flex items-center gap-2 flex-wrap">
            <span>{district.name} Spatial Topography & Assets</span>
            <span className="text-xs px-2.5 py-0.5 rounded-md font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {centroid[0].toFixed(2)}°N, {centroid[1].toFixed(2)}°E
            </span>
            {district.elevationRange && (
              <span className="text-xs px-2.5 py-0.5 rounded-md font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
                ⛰️ {district.elevationRange}m
              </span>
            )}
            <span className="text-xs px-2.5 py-0.5 rounded-md font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              🏛️ {districtPalikas.length} Palikas
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            5m/10m elevation contours, palika microclimates, complete categorized road network, glacial lakes & river gauges.
          </p>
        </div>

        {/* Layer Mode Switcher Tabs */}
        <div className="flex items-center flex-wrap gap-1.5 p-1.5 rounded-xl border bg-slate-100/80 border-slate-200 text-xs font-medium max-w-full overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: <Layers className="w-3.5 h-3.5 text-slate-500" /> },
            { id: 'roads', label: 'Road Network', icon: <Navigation className="w-3.5 h-3.5 text-orange-600" /> },
            { id: 'elevation', label: 'Elevation Contours', icon: <Mountain className="w-3.5 h-3.5 text-sky-600" /> },
            { id: 'crops', label: 'Palika Crop Niches', icon: <Sprout className="w-3.5 h-3.5 text-emerald-600" /> },
            { id: 'energy', label: 'Hydropower', icon: <Zap className="w-3.5 h-3.5 text-purple-600" /> },
            { id: 'hydrology', label: 'Hydrology & Lakes', icon: <Droplets className="w-3.5 h-3.5 text-sky-600" /> },
            { id: 'soil', label: 'Soil N-P-K', icon: <FlaskConical className="w-3.5 h-3.5 text-emerald-600" /> },
            { id: 'climate', label: 'Climate & Solar', icon: <CloudRain className="w-3.5 h-3.5 text-sky-600" /> },
            { id: 'labor', label: 'Agri Wage', icon: <DollarSign className="w-3.5 h-3.5 text-amber-600" /> },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setLayerMode(mode.id as MapLayerMode)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs cursor-pointer ${
                layerMode === mode.id
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {mode.icon}
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Map (Left 7 Cols) & Real-Time Variable Inspector (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Interactive Leaflet Map Container */}
        <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-950 min-h-[460px] h-[560px]">
          {(loading || (layerMode === 'roads' && roadsLoading)) && (
            <div className="absolute inset-0 z-[2000] flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-sm">
              <div className="w-10 h-10 border-2 border-slate-400 border-t-emerald-400 rounded-full animate-spin mb-3" />
              <p className="text-white text-xs font-medium">Rendering high-resolution spatial GIS layers…</p>
            </div>
          )}

          {geoData && (
            <MapContainer
              center={centroid}
              zoom={10}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
            >
              <MapGestureHandler />
              <MapBoundsUpdater feature={geoData} />

              <TileLayer
                key={baseMapStyle}
                attribution={BASE_MAP_TILES[baseMapStyle].attribution}
                url={BASE_MAP_TILES[baseMapStyle].url}
              />

              {/* Base District Boundary Polygon */}
              <GeoJSON
                key={`${district.id}-${layerMode}`}
                data={geoData}
                style={getDistrictFeatureStyle()}
              />

              {/* 5m / 10m High-Resolution Contours */}
              {showContours &&
                generatedContours.map((line, idx) => (
                  <Polyline
                    key={`contour-${line.elevation}-${idx}`}
                    positions={line.coordinates}
                    pathOptions={{
                      color: line.color,
                      weight: line.weight,
                      opacity: line.opacity,
                    }}
                  >
                    <Tooltip sticky={true} direction="top" opacity={0.98}>
                      <div className="p-1 text-xs font-mono font-bold bg-white text-slate-900 rounded shadow-xs border border-slate-200">
                        ⛰️ {line.elevation}m masl {line.isIndex ? '(Index Contour)' : ''}
                      </div>
                    </Tooltip>
                  </Polyline>
                ))}

              {/* Categorized District Roads Overlay */}
              {(layerMode === 'roads' || layerMode === 'overview') && filteredRoadsData && (
                <GeoJSON
                  key={`roads-${district.id}-${roadFilter.highways}-${roadFilter.feeders}-${roadFilter.municipal}-${roadFilter.rural}-${filteredRoadsData.features.length}`}
                  data={filteredRoadsData}
                  style={getRoadVectorStyle}
                  onEachFeature={onEachRoad}
                />
              )}

              {/* Palika Agro-Climatic Pins */}
              {(layerMode === 'crops' || layerMode === 'overview') &&
                displayedPalikaCropMarkers.map((m, idx) => (
                  <Marker
                    key={`palika-${m.palika.id}-${idx}`}
                    position={[m.palika.coordinates[0], m.palika.coordinates[1]]}
                    icon={createPalikaPinIcon(m.cropItem.emoji, m.palika.name, m.cropItem.score)}
                  >
                    <Popup className="custom-popup" autoPan={false}>
                      <div className="p-2 space-y-1.5 text-xs font-sans min-w-[210px]">
                        <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex justify-between items-center">
                          <span>🏛️ {m.palika.name}</span>
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-600">
                            {m.palika.unitType}
                          </span>
                        </div>
                        <div className="font-mono text-slate-700 text-[11px] space-y-0.5">
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-sans">Elevation:</span>
                            <strong>{m.palika.elevation}m masl</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-sans">Avg Temp:</span>
                            <strong>{m.palika.avgTempC}°C</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-sans">Soil Reaction:</span>
                            <strong>{m.palika.soilPh} pH</strong>
                          </div>
                        </div>
                        <div className="mt-1 p-1.5 bg-emerald-50 rounded border border-emerald-200 text-emerald-950 font-mono text-[11px]">
                          <div className="font-bold flex items-center gap-1">
                            <span>{m.cropItem.emoji}</span>
                            <span>{m.cropItem.cropName}: {m.cropItem.score}%</span>
                          </div>
                          <div className="text-[10px] text-emerald-700 font-sans">
                            Rating: <strong>{m.cropItem.rating}</strong>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

              {/* Real Hydropower Powerhouse Pins */}
              {(layerMode === 'energy' || layerMode === 'overview') &&
                hydroPlants.map((plant, idx) => (
                  <Marker
                    key={`hydro-real-${plant.name}-${idx}`}
                    position={[plant.lat, plant.lon]}
                    icon={createHydroPinIcon(plant.capacityMW)}
                  >
                    <Popup className="custom-popup" autoPan={false}>
                      <div className="p-2 space-y-1 text-xs font-sans min-w-[200px]">
                        <div className="font-bold text-purple-950 border-b border-purple-100 pb-1 flex justify-between items-center">
                          <span>⚡ {plant.name}</span>
                          <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-mono font-bold">
                            {plant.capacityMW} MW
                          </span>
                        </div>
                        <div className="text-slate-600 text-[11px]">River: <strong className="text-slate-900">{plant.river}</strong></div>
                        <div className="text-slate-600 text-[11px]">Owner: <strong className="text-slate-900">{plant.owner}</strong></div>
                        {plant.commissioned && (
                          <div className="text-[10px] text-slate-500">Commissioned: {plant.commissioned}</div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}

              {/* DHM River Gauging Stations */}
              {(layerMode === 'hydrology' || layerMode === 'overview') &&
                dhmRiverStations.map((st, idx) => (
                  <Marker
                    key={`detail-dhm-${st.stationNo}-${idx}`}
                    position={[st.lat, st.lng]}
                    icon={createDHMStationPinIcon(st.stationNo)}
                  >
                    <Popup className="custom-popup" autoPan={false}>
                      <div className="p-2 space-y-1 text-xs font-sans min-w-[200px]">
                        <div className="font-bold text-sky-950 flex items-center justify-between border-b border-sky-100 pb-1">
                          <span>💧 DHM Station #{st.stationNo}</span>
                          <span className="text-[9px] bg-sky-100 text-sky-800 px-1 py-0.2 rounded font-mono font-bold">Active</span>
                        </div>
                        <div className="font-semibold text-slate-800 text-xs">{st.river} ({st.siteName})</div>
                        <div className="text-[10px] text-slate-600">Elevation: <strong className="font-mono">{st.elevation}m</strong> masl</div>
                        <div className="text-[9px] text-slate-500 bg-slate-50 p-1 rounded font-mono">Equip: {st.instruments}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

              {/* Glacial Lakes */}
              {(layerMode === 'hydrology' || layerMode === 'overview') &&
                glacialLakesList.map((lake, idx) => (
                  <Marker
                    key={`detail-glof-lake-${lake.name}-${idx}`}
                    position={[lake.lat, lake.lng]}
                    icon={createGlacialLakePinIcon(lake.name, lake.hazardLevel)}
                  >
                    <Popup className="custom-popup" autoPan={false}>
                      <div className="p-2 space-y-1.5 text-xs font-sans min-w-[210px]">
                        <div className="font-bold text-red-950 flex items-center justify-between border-b border-red-100 pb-1">
                          <span>❄️ {lake.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            lake.hazardLevel === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>{lake.hazardLevel} GLOF</span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-700 space-y-0.5">
                          <div className="flex justify-between">
                            <span className="font-sans text-slate-500">Altitude:</span>
                            <strong>{lake.altitude} masl</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-sans text-slate-500">Surface Area:</span>
                            <strong>{lake.areaHa} Ha</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-sans text-slate-500">Est. Volume:</span>
                            <strong className="text-sky-700">{lake.volumeMcm} MCM</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-sans text-slate-500">Max Depth:</span>
                            <strong>{lake.depthM} m</strong>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-500 bg-slate-50 p-1 rounded font-sans">
                          Downstream Basin: <strong>{lake.basin}</strong>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          )}

          {/* Top-Right Base Map Layer Selector */}
          <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5">
            <select
              value={baseMapStyle}
              onChange={(e) => setBaseMapStyle(e.target.value as BaseMapStyle)}
              className="bg-slate-900/90 text-white text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-700 shadow-sm cursor-pointer focus:outline-none"
            >
              <option value="voyager">🗺️ Streets & Highways</option>
              <option value="osm">🛣️ OpenStreetMap Full</option>
              <option value="opentopo">🏔️ Topo Contours</option>
              <option value="satellite">🛰️ Satellite View</option>
            </select>
            <button
              onClick={() => setShowContours(!showContours)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 shadow-xs transition-all cursor-pointer ${
                showContours
                  ? 'bg-sky-600 text-white border-sky-500'
                  : 'bg-slate-900/85 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Mountain className="w-3.5 h-3.5" />
              <span>5m/10m Topo</span>
            </button>
          </div>

          {/* Floating Map Overlay Badge */}
          <div className="absolute top-3 left-3 z-[1000] pointer-events-none">
            <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 shadow-sm flex items-center gap-2 text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold font-outfit">
                {district.name} ({district.ecoZone} Zone • {districtPalikas.length} Palikas)
              </span>
            </div>
          </div>
        </div>

        {/* Real-Time Variable Inspector Panel (Right 5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 overflow-y-auto">
          <div className="space-y-3">
            {/* 1. DEDICATED ROAD NETWORK & LOGISTICS (APPROACH A) */}
            {layerMode === 'roads' && (
              <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-bold text-slate-800 font-outfit uppercase tracking-wider">
                      Categorized Road Network & Logistics
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-orange-100 text-orange-800 border border-orange-300 font-mono">
                    {roadStats.total} Mapped Vectors
                  </span>
                </div>

                {/* Interactive Road Hierarchy Filter Toggles */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span className="flex items-center gap-1 font-outfit">
                      <Filter className="w-3.5 h-3.5 text-orange-600" />
                      Filter Road Hierarchies:
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Click to toggle layer</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {/* Tier 1: National Highways */}
                    <button
                      onClick={() => setRoadFilter(prev => ({ ...prev, highways: !prev.highways }))}
                      className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                        roadFilter.highways
                          ? 'bg-orange-50/90 border-orange-300 text-orange-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-1.5 rounded-full bg-orange-600 inline-block shrink-0" />
                        <span className="text-[11px]">Highways (Class A)</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold">{roadStats.highways}</span>
                    </button>

                    {/* Tier 2: Feeder Roads */}
                    <button
                      onClick={() => setRoadFilter(prev => ({ ...prev, feeders: !prev.feeders }))}
                      className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                        roadFilter.feeders
                          ? 'bg-amber-50/90 border-amber-300 text-amber-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-1.5 rounded-full bg-amber-500 inline-block shrink-0" />
                        <span className="text-[11px]">Feeder Roads (Class B)</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold">{roadStats.feeders}</span>
                    </button>

                    {/* Tier 3: District & Municipal */}
                    <button
                      onClick={() => setRoadFilter(prev => ({ ...prev, municipal: !prev.municipal }))}
                      className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                        roadFilter.municipal
                          ? 'bg-sky-50/90 border-sky-300 text-sky-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-1.5 rounded-full bg-sky-600 inline-block shrink-0" />
                        <span className="text-[11px]">Municipal (Class C)</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold">{roadStats.municipal}</span>
                    </button>

                    {/* Tier 4: Rural Tracks */}
                    <button
                      onClick={() => setRoadFilter(prev => ({ ...prev, rural: !prev.rural }))}
                      className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                        roadFilter.rural
                          ? 'bg-stone-50 border-stone-300 text-stone-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 border-t border-dashed border-stone-600 inline-block shrink-0" />
                        <span className="text-[11px]">Rural Farm Tracks</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold">{roadStats.rural}</span>
                    </button>
                  </div>
                </div>

                {/* Road Infrastructure Metrics */}
                <div className="p-3 bg-orange-50/80 rounded-xl border border-orange-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center font-sans">
                    <span className="font-bold text-orange-950 font-outfit">Road Infrastructure Metrics:</span>
                    <span className="font-mono text-orange-900 font-bold">{district.roadDensityKmPerKm2 || 0.45} km/km²</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="p-2 bg-white rounded border border-orange-200">
                      <div className="text-[10px] text-slate-500 font-sans">Avg Highway Dist</div>
                      <div className="font-bold text-slate-900 mt-0.5">{district.avgDistanceToPavedRoadKm || 12} km</div>
                    </div>
                    <div className="p-2 bg-white rounded border border-orange-200">
                      <div className="text-[10px] text-slate-500 font-sans">Market Access Index</div>
                      <div className="font-bold text-orange-700 mt-0.5">{district.marketAccessIndex || 60}/100</div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Freight Logistics Tariff:</div>
                  <div className="text-[11px] text-slate-700 font-mono flex justify-between">
                    <span>Average Haulage Cost:</span>
                    <strong>NPR {district.freightLogisticsTariffNprPerTonKm || 20} / ton-km</strong>
                  </div>
                </div>
              </div>
            )}

            {/* 2. DEDICATED ELEVATION & RELIEF PROFILE */}
            {layerMode === 'elevation' && (
              <DistrictElevationProfiler
                district={district}
                districtCrops={districtCrops}
              />
            )}

            {/* 3. DEDICATED PALIKA CROP NICHES VIEW */}
            {layerMode === 'crops' && (
              <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800 font-outfit uppercase tracking-wider">
                      Palika Agro-Climatic Suitability
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                    {districtPalikas.length} Palikas
                  </span>
                </div>

                {/* Nepali Season Filter Selector */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1 font-outfit">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      नेपाली बाली मौसम (Seasonal Cycle):
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Season filter</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 text-[11px] font-sans">
                    {[
                      { id: 'all', label: '🌟 सबै चक्र', sub: 'Annual Rotation' },
                      { id: 'barkhe', label: '🌧️ बर्खे बाली', sub: 'असार–कात्तिक' },
                      { id: 'hiunde', label: '❄️ हिउँदे बाली', sub: 'मंसिर–फागुन' },
                      { id: 'chaite', label: '☀️ चैते बाली', sub: 'चैत–जेठ' },
                      { id: 'baahramase', label: '🌳 बाह्रमासे', sub: 'वर्षभरि फलफूल' },
                    ].map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSelectedNepaliSeason(s.id);
                          setSelectedCropFilter('all');
                        }}
                        className={`p-1.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          selectedNepaliSeason === s.id && selectedCropFilter === 'all'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-semibold text-[11px] truncate">{s.label}</span>
                        <span className={`text-[9px] ${selectedNepaliSeason === s.id && selectedCropFilter === 'all' ? 'text-emerald-100' : 'text-slate-500'}`}>{s.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specific Crop Filter Selector - STRICTLY FROM VERIFIED DISTRICT CROPS */}
                <div className="flex items-center gap-2 text-xs pt-1">
                  <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-slate-600 font-medium shrink-0">Filter by Crop:</span>
                  <select
                    value={selectedCropFilter}
                    onChange={(e) => setSelectedCropFilter(e.target.value)}
                    className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer w-full"
                  >
                    <option value="all">🌟 All Viable Crops in {district.name} ({availableDistrictCrops.length} Species)</option>
                    {availableDistrictCrops.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.nepaliName ? `(${c.nepaliName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Summary Banner */}
                <div className="p-2.5 bg-emerald-50/90 rounded-lg border border-emerald-200 text-xs font-sans">
                  {selectedCropFilter === 'all' && selectedNepaliSeason === 'all' ? (
                    <div className="text-emerald-950">
                      Showing <strong>{displayedPalikaCropMarkers.length} local government bodies</strong> with complete annual crop rotation (बर्खे ➔ हिउँदे ➔ बाह्रमासे).
                    </div>
                  ) : selectedCropFilter === 'all' ? (
                    <div className="text-emerald-950 flex justify-between items-center font-mono">
                      <span>Season: <strong>{selectedNepaliSeason === 'barkhe' ? '🌧️ बर्खे बाली' : selectedNepaliSeason === 'hiunde' ? '❄️ हिउँदे बाली' : selectedNepaliSeason === 'chaite' ? '☀️ चैते बाली' : '🌳 बाह्रमासे फलफूल'}</strong></span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                        {displayedPalikaCropMarkers.length} Palikas
                      </span>
                    </div>
                  ) : (
                    <div className="text-emerald-950 flex justify-between items-center font-mono">
                      <span>Feasible in: <strong>{displayedPalikaCropMarkers.length} of {districtPalikas.length} Palikas</strong></span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                        {((displayedPalikaCropMarkers.length / Math.max(1, districtPalikas.length)) * 100).toFixed(0)}% Coverage
                      </span>
                    </div>
                  )}
                </div>

                {/* Palika List with Coordinates, Elevation and Viable Crops */}
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {displayedPalikaCropMarkers.map((m, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-2xs">
                      <div className="flex justify-between items-center border-b pb-1">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>🏛️ {m.palika.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({m.palika.unitType})</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200 px-1.5 py-0.2 rounded">
                          {m.palika.elevation}m masl
                        </span>
                      </div>

                      {/* If Annual Rotation Mode, display the 3-Season Rotation Badges */}
                      {m.isRotation && m.palika.seasonalRotations ? (
                        <div className="space-y-1 pt-0.5 font-sans">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                            वार्षिक बाली चक्र (Annual Crop Cycle):
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-[11px] font-mono">
                            {m.palika.seasonalRotations.barkhe && (
                              <div className="p-1 bg-emerald-50/80 rounded border border-emerald-200 flex items-center justify-between">
                                <span className="text-[10px] text-emerald-950">🌧️ {m.palika.seasonalRotations.barkhe.cropName.split(' ')[0]}</span>
                                <span className="font-bold text-emerald-700 text-[10px]">{m.palika.seasonalRotations.barkhe.score}%</span>
                              </div>
                            )}
                            {m.palika.seasonalRotations.hiunde && (
                              <div className="p-1 bg-sky-50/80 rounded border border-sky-200 flex items-center justify-between">
                                <span className="text-[10px] text-sky-950">❄️ {m.palika.seasonalRotations.hiunde.cropName.split(' ')[0]}</span>
                                <span className="font-bold text-sky-700 text-[10px]">{m.palika.seasonalRotations.hiunde.score}%</span>
                              </div>
                            )}
                            {m.palika.seasonalRotations.baahramase && (
                              <div className="p-1 bg-amber-50/80 rounded border border-amber-200 flex items-center justify-between">
                                <span className="text-[10px] text-amber-950">🌳 {m.palika.seasonalRotations.baahramase.cropName.split(' ')[0]}</span>
                                <span className="font-bold text-amber-700 text-[10px]">{m.palika.seasonalRotations.baahramase.score}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center font-mono text-[11px]">
                          <span className="font-bold text-emerald-900 flex items-center gap-1">
                            <span>{m.cropItem.emoji}</span>
                            <span>{m.cropItem.cropName}</span>
                          </span>
                          <span className="font-extrabold text-emerald-700">{m.cropItem.score}% Suitability ({m.cropItem.rating})</span>
                        </div>
                      )}

                      <div className="text-[10px] text-slate-500 flex justify-between font-mono pt-0.5">
                        <span>Lapse Temp: {m.palika.avgTempC}°C</span>
                        <span>Soil pH: {m.palika.soilPh}</span>
                        <span>Limiting: <strong className="text-slate-700 font-sans">{m.cropItem.limitingFactor}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. DEDICATED HYDROLOGY, GLACIAL LAKES & DHM GAUGES */}
            {layerMode === 'hydrology' && (
              <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold text-slate-800 font-outfit uppercase tracking-wider">
                      Hydrology, Glacial Lakes & Cryosphere
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-sky-100 text-sky-800 border border-sky-300 font-mono">
                    {glacialLakesList.length} Glacial Lakes • {dhmRiverStations.length} Gauges
                  </span>
                </div>

                {lakeAltitudeStats && (
                  <div className="p-3 bg-sky-50/80 rounded-xl border border-sky-200 space-y-2 text-xs">
                    <div className="flex justify-between items-center font-bold text-sky-950 font-outfit">
                      <span>Lake Distribution by Altitude Belts:</span>
                      <span className="font-mono text-sky-900">{lakeAltitudeStats.totalLakes} Total Lakes</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                      <div className="p-1.5 bg-white rounded border border-sky-100 text-center">
                        <div className="text-slate-500">&gt;5,000m (Nival)</div>
                        <div className="font-bold text-sky-900 text-xs mt-0.5">{lakeAltitudeStats.highNivalAbove5000m} Lakes</div>
                      </div>
                      <div className="p-1.5 bg-white rounded border border-sky-100 text-center">
                        <div className="text-slate-500">3,000–5,000m</div>
                        <div className="font-bold text-sky-900 text-xs mt-0.5">{lakeAltitudeStats.alpine3000to4999m} Lakes</div>
                      </div>
                      <div className="p-1.5 bg-white rounded border border-sky-100 text-center">
                        <div className="text-slate-500">&lt;3,000m (Lowland)</div>
                        <div className="font-bold text-emerald-900 text-xs mt-0.5">
                          {lakeAltitudeStats.lowlandUnder100m + lakeAltitudeStats.foothill100to499m + lakeAltitudeStats.midHill500to1999m + lakeAltitudeStats.montane2000to2999m} Lakes
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Glacial Lakes Details */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                      Named Glacial Lakes & GLOF Hazard:
                    </span>
                    <span className="font-mono text-[10px] text-red-700 font-bold">{glacialLakesList.length} Monitored</span>
                  </div>

                  {glacialLakesList.length > 0 ? (
                    <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                      {glacialLakesList.map((lake, i) => (
                        <div key={i} className="p-2 bg-white rounded-lg border border-red-200 text-xs space-y-1 shadow-2xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-red-950 flex items-center gap-1">
                              <span>❄️ {lake.name}</span>
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                              lake.hazardLevel === 'Critical' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>{lake.hazardLevel} GLOF</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-600">
                            <div>Altitude: <strong>{lake.altitude} masl</strong></div>
                            <div>Area: <strong>{lake.areaHa} Ha</strong></div>
                            <div>Est Volume: <strong className="text-sky-700">{lake.volumeMcm} MCM</strong></div>
                            <div>Max Depth: <strong>{lake.depthM} m</strong></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-100 rounded-lg text-xs text-slate-500 italic">
                      No dangerous high-risk glacial lakes identified within this specific administrative boundary.
                    </div>
                  )}
                </div>

                {/* DHM River Gauging Stations */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-sky-600" />
                      DHM Hydrometric River Gauging Stations:
                    </span>
                    <span className="font-mono text-[10px] text-sky-700 font-bold">{dhmRiverStations.length} Active</span>
                  </div>

                  {dhmRiverStations.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                      {dhmRiverStations.map((st, i) => (
                        <div key={i} className="p-2 bg-white rounded-lg border border-sky-200 text-xs flex justify-between items-center shadow-2xs">
                          <div>
                            <div className="font-bold text-slate-900 text-xs">#{st.stationNo} {st.river} ({st.siteName})</div>
                            <div className="text-[9px] text-slate-500 font-mono">Instruments: {st.instruments}</div>
                          </div>
                          <div className="text-right font-mono text-sky-700 font-bold text-xs">
                            {st.elevation}m
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-100 rounded-lg text-xs text-slate-500 italic">
                      Primary river gauging records connected via upstream basin network.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. DEDICATED ENERGY & HYDROPOWER VIEW */}
            {layerMode === 'energy' && (
              <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-slate-800 font-outfit uppercase tracking-wider">
                      Hydropower Capacity & Solar Irradiance
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-purple-100 text-purple-800 border border-purple-300 font-mono">
                    {district.totalHydroCapacityMW || 0} MW Total
                  </span>
                </div>

                <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-purple-950 font-outfit">Installed NEA Grid Hydropower:</span>
                    <span className="font-mono text-purple-900 font-bold text-sm">{district.totalHydroCapacityMW || 0} MW</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="p-2 bg-white rounded border border-purple-200">
                      <div className="text-[10px] text-slate-500 font-sans">Powerhouses</div>
                      <div className="font-bold text-slate-900 mt-0.5">{hydroPlants.length} Plants</div>
                    </div>
                    <div className="p-2 bg-white rounded border border-purple-200">
                      <div className="text-[10px] text-slate-500 font-sans">NASA Solar Irradiance</div>
                      <div className="font-bold text-amber-700 mt-0.5">{district.nasaSolarRadiationKwh || district.solarRadiationKwh || 4.8} kWh/m²/d</div>
                    </div>
                  </div>
                </div>

                {/* List of Hydropower Plants */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-600 uppercase">Operating Powerhouses:</div>
                  {hydroPlants.length > 0 ? (
                    <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                      {hydroPlants.map((plant, i) => (
                        <div key={i} className="p-2 bg-white rounded-lg border border-purple-200 text-xs flex justify-between items-center shadow-2xs">
                          <div>
                            <div className="font-bold text-slate-900 text-xs">⚡ {plant.name}</div>
                            <div className="text-[9px] text-slate-500 font-mono">{plant.river} • {plant.owner}</div>
                          </div>
                          <div className="text-right font-mono text-purple-700 font-bold text-xs">
                            {plant.capacityMW} MW
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-100 rounded-lg text-xs text-slate-500 italic">
                      No utility-scale hydropower plants mapped directly inside this district boundary.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. DEDICATED SOIL N-P-K & TEXTURE VIEW */}
            {layerMode === 'soil' && (
              <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800 font-outfit uppercase tracking-wider">
                      NARC Ground Soil Core Lab Survey
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                    {district.soilSampleCount || 100}+ Core Samples
                  </span>
                </div>

                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-950 font-outfit">Soil Reaction (Acidity):</span>
                    <span className="font-mono text-emerald-900 font-bold text-sm">{district.baseSoilPh || 6.2} pH</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px] text-center">
                    <div className="p-2 bg-white rounded border border-emerald-200">
                      <div className="text-[10px] text-slate-500 font-sans">Nitrogen (N)</div>
                      <div className="font-bold text-emerald-700 mt-0.5">{district.soilNitrogen ? `${district.soilNitrogen}%` : 'Medium'}</div>
                    </div>
                    <div className="p-2 bg-white rounded border border-emerald-200">
                      <div className="text-[10px] text-slate-500 font-sans">Phosphorus (P)</div>
                      <div className="font-bold text-emerald-700 mt-0.5">{district.soilPhosphorus ? `${district.soilPhosphorus} kg/ha` : 'Medium'}</div>
                    </div>
                    <div className="p-2 bg-white rounded border border-emerald-200">
                      <div className="text-[10px] text-slate-500 font-sans">Potassium (K)</div>
                      <div className="font-bold text-emerald-700 mt-0.5">{district.soilPotassium ? `${district.soilPotassium} kg/ha` : 'High'}</div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Soil Texture & Soil Type:</div>
                  <div className="font-bold text-slate-900">Loamy / Silt Loam (Eutric Fluvisols / Cambisols)</div>
                </div>
              </div>
            )}

            {/* 7. DEDICATED CLIMATE & SOLAR VIEW */}
            {layerMode === 'climate' && (
              <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold text-slate-800 font-outfit uppercase tracking-wider">
                      NASA MERRA-2 39-Yr Climate Climatology
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-sky-100 text-sky-800 border border-sky-300 font-mono">
                    1981–2019
                  </span>
                </div>

                <div className="p-3 bg-sky-50/80 rounded-xl border border-sky-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sky-950 font-outfit">Precipitation & Thermal Regime:</span>
                    <span className="font-mono text-sky-900 font-bold text-sm">{district.avgRainfallMm} mm/yr</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="p-2 bg-white rounded border border-sky-200">
                      <div className="text-[10px] text-slate-500 font-sans">Avg Temperature</div>
                      <div className="font-bold text-slate-900 mt-0.5">{(district as any).avgTempC || 18.5}°C</div>
                    </div>
                    <div className="p-2 bg-white rounded border border-sky-200">
                      <div className="text-[10px] text-slate-500 font-sans">Solar Radiation</div>
                      <div className="font-bold text-amber-700 mt-0.5">{district.nasaSolarRadiationKwh || district.solarRadiationKwh || 4.8} kWh/m²/d</div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Agro-Climatic Classification:</div>
                  <div className="font-bold text-slate-900">{district.climateZone || 'Sub-Tropical / Warm Temperate'}</div>
                  <div className="text-[11px] text-slate-600">Physiographic Region: <strong className="text-slate-800">{district.physiographicRegion || district.ecoZone}</strong></div>
                </div>
              </div>
            )}

            {/* 8. DEDICATED AGRI LABOR & SOCIOECONOMICS VIEW */}
            {layerMode === 'labor' && (
              <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-slate-800 font-outfit uppercase tracking-wider">
                      Agricultural Daily Labor Market
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 border border-amber-300 font-mono">
                    NPR {district.laborRateNprPerDay}/day
                  </span>
                </div>

                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-950 font-outfit">Local Market Labor Rate:</span>
                    <span className="font-mono text-amber-900 font-bold text-sm">NPR {district.agriLaborRateRange || '650 - 850'}/day</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="p-2 bg-white rounded border border-amber-200">
                      <div className="text-[10px] text-slate-500 font-sans">Official District Jilla Dar</div>
                      <div className="font-bold text-slate-900 mt-0.5">NPR {district.agriLaborRateBaselineNpr || district.laborRateNprPerDay}/day</div>
                    </div>
                    <div className="p-2 bg-white rounded border border-amber-200">
                      <div className="text-[10px] text-slate-500 font-sans">Eco-Belt Grouping</div>
                      <div className="font-bold text-amber-800 mt-0.5">{district.agriLaborEcoBelt || district.ecoZone} Zone</div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Economic Infrastructure:</div>
                  <div className="text-[11px] text-slate-700">Market Accessibility Index: <strong className="font-mono text-slate-900">{district.marketAccessIndex || 60}/100</strong></div>
                  <div className="text-[11px] text-slate-700">Logistics Freight Rate: <strong className="font-mono text-slate-900">NPR {district.freightLogisticsTariffNprPerTonKm || 20}/t-km</strong></div>
                </div>
              </div>
            )}

            {/* 9. OVERVIEW GENERAL SNAPSHOT */}
            {layerMode === 'overview' && (
              <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800 font-outfit uppercase tracking-wider">
                      {district.name} Variable Inspector
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {district.ecoZone} Zone
                  </span>
                </div>

                {/* Overview Summary */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-900 flex items-center justify-between border-b pb-1.5 font-outfit">
                    <span>{district.name} Summary Snapshot</span>
                    <span className="font-mono text-[10px] text-slate-500">{district.province}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-sans">Elevation Range</div>
                      <div className="font-bold text-slate-900 mt-0.5">{elevationInfo.min}m – {elevationInfo.max}m</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-sans">Road Network</div>
                      <div className="font-bold text-orange-700 mt-0.5">{roadStats.total} Segments</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-sans">Hydro Power</div>
                      <div className="font-bold text-purple-700 mt-0.5">{district.totalHydroCapacityMW || 0} MW</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-sans">Palikas</div>
                      <div className="font-bold text-emerald-700 mt-0.5">{districtPalikas.length} Bodies</div>
                    </div>
                  </div>
                </div>

                {/* Landmark Peaks / Key Features if any */}
                {landmarks && (
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Key Geographic Landmarks:</div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 bg-sky-50 text-sky-800 rounded border border-sky-200 font-medium">
                        🏔️ Peak: {landmarks.peak.name} ({landmarks.peak.elevation}m)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 font-medium">
                        🌊 Valley: {landmarks.valley.name} ({landmarks.valley.elevation}m)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
