import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Polyline, Tooltip, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { District, Crop, CropSuitability } from '@wefes/shared-types';
import { db } from '@wefes/database';
import {
  MapPin, Droplets, Zap, Sprout, Layers, Eye,
  Compass, Sparkles, Info, CloudRain, Sun, Mountain,
  TrendingUp, Leaf, Thermometer, FlaskConical, ArrowUpRight,
  Navigation, Filter, Award, CheckCircle2, Sliders, Activity
} from 'lucide-react';
import { MapGestureHandler } from './MapGestureHandler';
import { DistrictElevationProfiler } from './DistrictElevationProfiler';
import {
  DISTRICT_LANDMARKS,
  REAL_HYDROPOWER_PLANTS,
  GULMI_COFFEE_LANDMARKS,
  DistrictLandmarks,
  RealHydropowerAsset,
  CoffeeLandmark
} from '../data/districtRealAssets';
import { DISTRICT_PALIKAS, DistrictPalika, PalikaFeasibleCrop } from '../data/districtPalikaAssets';
import {
  DANGEROUS_GLACIAL_LAKES_BY_DISTRICT,
  DHM_RIVER_STATIONS_BY_DISTRICT,
  DetailedGlacialLake,
  DHMRiverStation
} from '../data/districtHydrologyAssets';
import { generateDistrictContours, ContourLine } from '../utils/contourGenerator';
import gulmiSoilPoints from '../data/gulmiSoilPoints.json';

const GULMI_PALIKA_NEPALI: Record<string, string> = {
  'Resunga': 'रेसुङ्गा',
  'Musikot': 'मुसिकोट',
  'Ruru': 'रुरुक्षेत्र',
  'Satyawati': 'सत्यवती',
  'Kaligandaki': 'कालीगण्डकी',
  'Chandrakot': 'चन्द्रकोट',
  'Chatrakot': 'छत्रकोट',
  'Gulmidarbar': 'गुल्मीदरबार',
  'Dhurkot': 'धुर्कोट',
  'Isma': 'इस्मा',
  'Malika': 'मालिका',
  'Madane': 'मदाने',
};

interface DistrictDetailMapProps {
  district: District;
  selectedPalikaName?: string;
  onSelectPalika?: (palikaName: string) => void;
  distClimatology?: any;
  rainfallARIMA?: any;
  districtCrops?: { crop: Crop; suitability: CropSuitability }[];
  onSelectCrop?: (crop: Crop) => void;
}

type MapLayerMode = 'overview' | 'coffee' | 'crops' | 'roads' | 'soil' | 'hydrology' | 'energy' | 'elevation';
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

// Auto-fit camera strictly to the active Palika polygon, or fallback to the full district
function PalikaBoundsUpdater({
  activePalikaFeature,
  districtFeature
}: {
  activePalikaFeature: any;
  districtFeature: any;
}) {
  const map = useMap();

  useEffect(() => {
    if (activePalikaFeature && map) {
      try {
        const layer = L.geoJSON(activePalikaFeature);
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.flyToBounds(bounds, {
            padding: [45, 45],
            maxZoom: 12.5,
            animate: true,
            duration: 0.7,
          });
          return;
        }
      } catch (e) {
        console.error('Error fitting bounds to Palika:', e);
      }
    }

    if (districtFeature && map) {
      try {
        const layer = L.geoJSON(districtFeature);
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [35, 35],
            maxZoom: 11,
            animate: true,
          });
        }
      } catch (e) {
        console.error('Error fitting bounds to District:', e);
      }
    }
  }, [activePalikaFeature, districtFeature, map]);

  return null;
}

// Custom Map Markers
const createCoffeeLandmarkIcon = (category: 'origin' | 'research' | 'processing' | 'pocket') => {
  const bg =
    category === 'origin' ? '#b45309' :
    category === 'research' ? '#047857' :
    category === 'processing' ? '#7c2d12' : '#92400e';

  const badgeText =
    category === 'origin' ? '🌱 Origin' :
    category === 'research' ? '🔬 Lab' :
    category === 'processing' ? '🏭 Mill' : '☕ Pocket';

  return L.divIcon({
    className: 'custom-coffee-marker',
    html: `
      <div style="
        background: ${bg};
        color: #ffffff;
        padding: 3px 8px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
        font-size: 10.5px;
        font-weight: 800;
        font-family: system-ui, sans-serif;
        white-space: nowrap;
        cursor: pointer;
      ">
        <span>☕</span>
        <span>${badgeText}</span>
      </div>
    `,
    iconSize: [85, 24],
    iconAnchor: [42, 12],
    popupAnchor: [0, -12],
  });
};

const createPalikaPinIcon = (emoji: string, palikaName: string, score: number, isSelected: boolean) => {
  const bg = isSelected ? '#047857' : score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#475569';
  const border = isSelected ? '#34d399' : '#ffffff';
  const scale = isSelected ? 'scale(1.08)' : 'scale(1)';

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
        border: 2px solid ${border};
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        font-size: 11px;
        font-weight: 700;
        font-family: system-ui, sans-serif;
        white-space: nowrap;
        cursor: pointer;
        transform: ${scale};
        transition: transform 0.2s ease;
      ">
        <span>${emoji}</span>
        <span>${palikaName}</span>
        <span style="background: rgba(255,255,255,0.25); padding: 1px 4px; border-radius: 6px; font-size: 9.5px; font-mono: monospace;">${score}%</span>
      </div>
    `,
    iconSize: [120, 26],
    iconAnchor: [60, 13],
    popupAnchor: [0, -13],
  });
};

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

const createHydroPinIcon = (mw: number) => {
  const size = mw >= 20 ? 30 : 26;
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

export const DistrictDetailMap: React.FC<DistrictDetailMapProps> = ({
  district,
  selectedPalikaName = 'Resunga',
  onSelectPalika,
  distClimatology,
  rainfallARIMA,
  districtCrops = [],
  onSelectCrop,
}) => {
  const [districtGeoData, setDistrictGeoData] = useState<any>(null);
  const [palikasGeoData, setPalikasGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [layerMode, setLayerMode] = useState<MapLayerMode>('overview');
  const [baseMapStyle, setBaseMapStyle] = useState<BaseMapStyle>('voyager');
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('all');
  const [showContours, setShowContours] = useState<boolean>(true);
  const [showCoffeeBelt, setShowCoffeeBelt] = useState<boolean>(true);
  const [showSoilGrid, setShowSoilGrid] = useState<boolean>(true);

  // Roads state
  const [districtRoadsData, setDistrictRoadsData] = useState<any>(null);
  const [roadsLoading, setRoadsLoading] = useState<boolean>(false);
  const [roadFilter, setRoadFilter] = useState<{
    highways: boolean;
    feeders: boolean;
    municipal: boolean;
    rural: boolean;
  }>({
    highways: true,
    feeders: true,
    municipal: true,
    rural: false,
  });

  // Selected soil point for detailed drawer inspection
  const [inspectedSoilPoint, setInspectedSoilPoint] = useState<any>(null);

  // Load Gulmi 12 Palikas GeoJSON and District Boundary
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetch('/geojson/gulmi-palikas.json').then(r => (r.ok ? r.json() : null)).catch(() => null),
      fetch('/geojson/nepal-districts-enriched.json').then(r => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([palikasData, districtData]) => {
      if (!isMounted) return;

      if (palikasData) {
        setPalikasGeoData(palikasData);
      }

      if (districtData && districtData.features) {
        const matched = districtData.features.find((f: any) => {
          const fid = f.properties.id || f.properties.DISTRICT || f.properties.name;
          return (
            fid?.toLowerCase() === district.id.toLowerCase() ||
            f.properties.name?.toLowerCase() === district.name.toLowerCase()
          );
        });
        setDistrictGeoData(matched || districtData.features[0]);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [district.id, district.name]);

  // Load Gulmi Roads
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

    return () => {
      isMounted = false;
    };
  }, [district.id]);

  const districtPalikas = useMemo<DistrictPalika[]>(() => {
    return DISTRICT_PALIKAS[district.id] || DISTRICT_PALIKAS[district.name] || [];
  }, [district.id, district.name]);

  // Active Palika metadata object
  const activePalika = useMemo<DistrictPalika>(() => {
    const found = districtPalikas.find(
      p => p.name.toLowerCase() === selectedPalikaName?.toLowerCase()
    );
    return found || districtPalikas[0] || {
      id: 'gulmi-resunga',
      name: 'Resunga',
      unitType: 'Nagarpalika',
      districtId: 'gulmi',
      districtName: 'Gulmi',
      coordinates: [28.0680, 83.2480],
      elevation: 1530,
      avgTempC: 14.5,
      rainfallMm: 1850,
      soilPh: 6.2,
      feasibleCropsCount: 8,
      feasibleCrops: [],
    };
  }, [districtPalikas, selectedPalikaName]);

  // Active Palika GeoJSON polygon feature
  const activePalikaFeature = useMemo(() => {
    if (!palikasGeoData || !palikasGeoData.features) return null;
    return palikasGeoData.features.find((f: any) => {
      const name = f.properties.name || f.properties.fullName || '';
      return name.toLowerCase().includes(activePalika.name.toLowerCase());
    });
  }, [palikasGeoData, activePalika.name]);

  // Map Centroid
  const centroid = useMemo<[number, number]>(() => {
    if (activePalika?.coordinates) {
      return [activePalika.coordinates[0], activePalika.coordinates[1]];
    }
    return [28.095, 83.315];
  }, [activePalika]);

  // Verified crops specifically for this district
  const availableDistrictCrops = useMemo(() => {
    if (districtCrops && districtCrops.length > 0) {
      return districtCrops.map(dc => dc.crop);
    }
    return db.getDistrictCrops(district.id).map(dc => dc.crop);
  }, [districtCrops, district.id]);

  // Palika Crop Markers - Prioritizing high-value cash crops (Arabica Coffee, Orange, Potato, Ginger)
  const displayedPalikaCropMarkers = useMemo(() => {
    const list: {
      palika: DistrictPalika;
      cropItem: PalikaFeasibleCrop;
      isHighlighted: boolean;
    }[] = [];

    districtPalikas.forEach(palika => {
      const crops = palika.feasibleCrops || [];
      const isSelected = palika.name.toLowerCase() === activePalika.name.toLowerCase();

      if (selectedCropFilter !== 'all') {
        const match = crops.find((c: PalikaFeasibleCrop) => c.cropId === selectedCropFilter);
        if (match) {
          list.push({ palika, cropItem: match, isHighlighted: isSelected });
        }
      } else {
        // Prioritize signature cash crops: Coffee ☕, Orange 🍊, Potato 🥔, Ginger 🫚
        const coffeeCrop = crops.find(c => c.cropId === 'coffee');
        const orangeCrop = crops.find(c => c.cropId === 'orange');
        const topRot =
          coffeeCrop ||
          orangeCrop ||
          palika.seasonalRotations?.baahramase ||
          palika.seasonalRotations?.hiunde ||
          crops[0] || {
            cropId: 'coffee',
            cropName: 'Arabica Coffee',
            nepaliName: 'कफी',
            emoji: '☕',
            category: 'Cash Crop',
            score: 95,
            rating: 'Optimal' as const,
            limitingFactor: 'None',
          };
        list.push({ palika, cropItem: topRot, isHighlighted: isSelected });
      }
    });

    return list;
  }, [districtPalikas, selectedCropFilter, activePalika.name]);

  const generatedContours = useMemo<ContourLine[]>(() => {
    if (!districtGeoData) return [];
    return generateDistrictContours(district, districtGeoData.geometry, 10);
  }, [district, districtGeoData]);

  const landmarks: DistrictLandmarks | undefined =
    DISTRICT_LANDMARKS[district.id] || DISTRICT_LANDMARKS[district.name];
  const hydroPlants: RealHydropowerAsset[] =
    REAL_HYDROPOWER_PLANTS[district.id] || REAL_HYDROPOWER_PLANTS[district.name] || [];
  const dhmRiverStations = useMemo<DHMRiverStation[]>(() => {
    return DHM_RIVER_STATIONS_BY_DISTRICT[district.id] || DHM_RIVER_STATIONS_BY_DISTRICT[district.name] || [];
  }, [district.id, district.name]);

  // Filtered Roads
  const filteredRoadsData = useMemo(() => {
    if (!districtRoadsData || !districtRoadsData.features) return null;
    const activeFeatures = districtRoadsData.features.filter((f: any) => {
      const hwy = f?.properties?.highway?.toLowerCase();
      if (hwy === 'trunk' || hwy === 'primary') return roadFilter.highways;
      if (hwy === 'secondary') return roadFilter.feeders;
      if (
        hwy === 'tertiary' ||
        hwy === 'residential' ||
        hwy === 'unclassified' ||
        hwy === 'road' ||
        hwy === 'living_street'
      )
        return roadFilter.municipal;
      return roadFilter.rural;
    });
    return {
      ...districtRoadsData,
      features: activeFeatures,
    };
  }, [districtRoadsData, roadFilter]);

  const roadStats = useMemo(() => {
    if (!districtRoadsData || !districtRoadsData.features) {
      return { total: 0, highways: 0, feeders: 0, municipal: 0, rural: 0 };
    }
    let highways = 0, feeders = 0, municipal = 0, rural = 0;
    districtRoadsData.features.forEach((f: any) => {
      const hwy = f?.properties?.highway?.toLowerCase();
      if (hwy === 'trunk' || hwy === 'primary') highways++;
      else if (hwy === 'secondary') feeders++;
      else if (
        hwy === 'tertiary' ||
        hwy === 'residential' ||
        hwy === 'unclassified' ||
        hwy === 'road' ||
        hwy === 'living_street'
      )
        municipal++;
      else rural++;
    });
    return {
      total: districtRoadsData.features.length,
      highways,
      feeders,
      municipal,
      rural,
    };
  }, [districtRoadsData]);

  // Styling for Palika GeoJSON Polygons
  const getPalikaPolygonStyle = (feature: any) => {
    const palikaName = feature?.properties?.name || feature?.properties?.fullName || '';
    const isSelected = palikaName.toLowerCase().includes(activePalika.name.toLowerCase());

    if (isSelected) {
      return {
        fillColor: '#10b981',
        fillOpacity: 0.32,
        color: '#059669',
        weight: 3.5,
        dashArray: undefined,
      };
    }

    return {
      fillColor: '#334155',
      fillOpacity: 0.08,
      color: '#64748b',
      weight: 1.2,
      dashArray: '2, 3',
    };
  };

  const onEachPalikaFeature = (feature: any, layer: L.Layer) => {
    const props = feature.properties;
    if (!props) return;

    const pName = props.name || 'Palika';
    const nepName = props.nepaliName || GULMI_PALIKA_NEPALI[pName] || '';

    layer.on({
      click: () => {
        if (onSelectPalika) {
          onSelectPalika(pName);
        }
      },
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          fillOpacity: 0.45,
          weight: 3,
        });
      },
      mouseout: (e) => {
        const target = e.target;
        target.setStyle(getPalikaPolygonStyle(feature));
      },
    });

    layer.bindTooltip(
      `
      <div style="font-family: system-ui, sans-serif; font-size: 11px; padding: 2px;">
        <strong>${pName}</strong> ${nepName ? `(${nepName})` : ''}
        <div style="font-size: 9.5px; color: #475569;">Click to inspect dossier</div>
      </div>
    `,
      { sticky: true, direction: 'top', opacity: 0.95 }
    );
  };

  // Distinct Road Category Styles
  const getRoadVectorStyle = (feature: any) => {
    const hwy = feature?.properties?.highway?.toLowerCase();
    if (hwy === 'trunk' || hwy === 'primary') {
      return {
        color: '#ea580c', // Orange-Red for Strategic Highways
        weight: 3.8,
        opacity: 0.95,
      };
    }
    if (hwy === 'secondary') {
      return {
        color: '#f59e0b', // Amber for Feeder Roads
        weight: 2.6,
        opacity: 0.90,
      };
    }
    if (hwy === 'tertiary') {
      return {
        color: '#0284c7', // Sky Blue for Municipal Links
        weight: 2.0,
        opacity: 0.85,
      };
    }
    return {
      color: '#64748b',
      weight: 1.4,
      opacity: 0.75,
    };
  };

  const onEachRoad = (feature: any, layer: L.Layer) => {
    const props = feature.properties;
    if (!props) return;
    const hwy = props.highway?.toLowerCase();
    const categoryLabel =
      hwy === 'trunk' || hwy === 'primary'
        ? 'National Strategic Highway (Madan Bhandari / Mid-Hill)'
        : hwy === 'secondary'
        ? 'Feeder Road (Class B)'
        : hwy === 'tertiary'
        ? 'Municipal Main Arterial'
        : 'Local Agricultural Access Road';

    layer.bindPopup(
      `
      <div style="font-family: system-ui, sans-serif; font-size: 11px; padding: 4px; min-width: 190px;">
        <div style="font-weight: 800; font-size: 12px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; display: flex; justify-content: space-between; align-items: center;">
          <span>🛣️ ${props.name || 'Local Route'}</span>
          <span style="background: #ea580c; color: white; padding: 1px 5px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase;">${props.highway}</span>
        </div>
        <div style="margin-top: 4px; color: #475569; font-size: 10px;">Classification: <strong style="color: #0f172a;">${categoryLabel}</strong></div>
        <div style="margin-top: 2px; color: #475569; font-size: 10px;">Surface: <strong style="color: #0f172a; text-transform: capitalize;">${props.surface || 'Paved / Bitumen'}</strong></div>
      </div>
    `,
      { autoPan: false }
    );
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm bg-white/95 space-y-5 animate-fade-in-up">
      {/* ─── Top Header & Palika Spatial Context Ribbon ─── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold mb-1">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-500 font-sans tracking-wide uppercase text-[11px]">
              Interactive Palika Spatial Explorer (पालिका स्थानिक अन्वेषक)
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight font-outfit text-slate-900 flex items-center gap-2 flex-wrap">
            <span>{activePalika.name} ({GULMI_PALIKA_NEPALI[activePalika.name] || ''}) Spatial GIS</span>
            <span className="text-xs px-2.5 py-0.5 rounded-md font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              📍 Focused Local Body
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-md font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
              ☕ Arabica Belt: 800–1,600m
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-md font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
              🧪 81 NARC Soil Points
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            High-resolution Palika vector boundaries, verified coffee processing hubs, NARC ground soil grid, and multi-tier road network.
          </p>
        </div>

        {/* Layer Mode Switcher Tabs */}
        <div className="flex items-center flex-wrap gap-1.5 p-1.5 rounded-xl border bg-slate-100/80 border-slate-200 text-xs font-medium max-w-full overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: <Layers className="w-3.5 h-3.5 text-slate-600" /> },
            { id: 'coffee', label: '☕ Coffee Belt', icon: <Award className="w-3.5 h-3.5 text-amber-600" /> },
            { id: 'crops', label: 'Crops & Niches', icon: <Sprout className="w-3.5 h-3.5 text-emerald-600" /> },
            { id: 'roads', label: 'Roads & Logistics', icon: <Navigation className="w-3.5 h-3.5 text-orange-600" /> },
            { id: 'soil', label: 'NARC Soil Grid', icon: <FlaskConical className="w-3.5 h-3.5 text-emerald-600" /> },
            { id: 'hydrology', label: 'Hydrology', icon: <Droplets className="w-3.5 h-3.5 text-sky-600" /> },
            { id: 'energy', label: 'Hydropower', icon: <Zap className="w-3.5 h-3.5 text-purple-600" /> },
            { id: 'elevation', label: '3D Elevation', icon: <Mountain className="w-3.5 h-3.5 text-slate-600" /> },
          ].map(mode => (
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

      {/* ─── Quick Crop Filter Chips Bar ─── */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Quick Cash Crop Spatial Filter:</span>
        </div>
        <div className="flex items-center flex-wrap gap-1.5 text-xs">
          {[
            { id: 'all', label: '🌟 Signature Crops', desc: 'Highest Value Cash Crop' },
            { id: 'coffee', label: '☕ Arabica Coffee', desc: 'Gulmi #1 Cash Crop' },
            { id: 'orange', label: '🍊 Mandarin Orange', desc: 'Horticulture Belt' },
            { id: 'potato', label: '🥔 High-Altitude Potato', desc: 'Seed Tuber' },
            { id: 'ginger', label: '🫚 Organic Ginger', desc: 'Export Spice' },
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => setSelectedCropFilter(chip.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedCropFilter === chip.id
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Main Map & Spatial Telemetry Cockpit Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Interactive Leaflet Map Container */}
        <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-950 min-h-[480px] h-[580px]">
          {loading && (
            <div className="absolute inset-0 z-[2000] flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-sm">
              <div className="w-10 h-10 border-2 border-slate-400 border-t-emerald-400 rounded-full animate-spin mb-3" />
              <p className="text-white text-xs font-medium">Rendering Palika vector GIS & soil grid…</p>
            </div>
          )}

          <MapContainer
            center={centroid}
            zoom={11}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
          >
            <MapGestureHandler />
            <PalikaBoundsUpdater
              activePalikaFeature={activePalikaFeature}
              districtFeature={districtGeoData}
            />

            <TileLayer
              key={baseMapStyle}
              attribution={BASE_MAP_TILES[baseMapStyle].attribution}
              url={BASE_MAP_TILES[baseMapStyle].url}
            />

            {/* 12 Gulmi Palika Vector Boundaries */}
            {palikasGeoData && (
              <GeoJSON
                key={`palikas-${selectedPalikaName}-${layerMode}`}
                data={palikasGeoData}
                style={getPalikaPolygonStyle}
                onEachFeature={onEachPalikaFeature}
              />
            )}

            {/* 5m / 10m Topographic Contours */}
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

            {/* Verified Coffee Landmarks (Aapchaur Origin, Tamghas Center, Ruru Mill, etc.) */}
            {(layerMode === 'coffee' || layerMode === 'crops' || layerMode === 'overview') &&
              GULMI_COFFEE_LANDMARKS.map(lm => (
                <Marker
                  key={`coffee-landmark-${lm.id}`}
                  position={[lm.lat, lm.lon]}
                  icon={createCoffeeLandmarkIcon(lm.category)}
                >
                  <Popup className="custom-popup" autoPan={false}>
                    <div className="p-2.5 space-y-1.5 text-xs font-sans min-w-[220px]">
                      <div className="font-bold text-amber-950 border-b border-amber-200 pb-1 flex justify-between items-center">
                        <span>☕ {lm.name}</span>
                      </div>
                      <div className="text-[11px] text-amber-900 font-serif italic">{lm.nepaliName}</div>
                      <div className="text-[11px] text-slate-700 mt-1">
                        Palika: <strong className="text-slate-900">{lm.palika}</strong> • Altitude: <strong className="font-mono">{lm.elevationM}m ASL</strong>
                      </div>
                      <div className="p-1.5 bg-amber-50 rounded border border-amber-200 text-[10px] text-amber-950 font-sans mt-1">
                        {lm.significance}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

            {/* Categorized Road Network */}
            {(layerMode === 'roads' || layerMode === 'overview') && filteredRoadsData && (
              <GeoJSON
                key={`roads-${district.id}-${roadFilter.highways}-${roadFilter.feeders}-${roadFilter.municipal}-${roadFilter.rural}-${filteredRoadsData.features.length}`}
                data={filteredRoadsData}
                style={getRoadVectorStyle}
                onEachFeature={onEachRoad}
              />
            )}

            {/* Palika Agro-Climatic & Coffee Pins */}
            {(layerMode === 'crops' || layerMode === 'coffee' || layerMode === 'overview') &&
              displayedPalikaCropMarkers.map((m, idx) => (
                <Marker
                  key={`palika-pin-${m.palika.id}-${idx}`}
                  position={[m.palika.coordinates[0], m.palika.coordinates[1]]}
                  icon={createPalikaPinIcon(
                    m.cropItem.emoji,
                    m.palika.name,
                    m.cropItem.score,
                    m.isHighlighted
                  )}
                  eventHandlers={{
                    click: () => {
                      if (onSelectPalika) onSelectPalika(m.palika.name);
                    },
                  }}
                >
                  <Popup className="custom-popup" autoPan={false}>
                    <div className="p-2.5 space-y-1.5 text-xs font-sans min-w-[210px]">
                      <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex justify-between items-center">
                        <span>🏛️ {m.palika.name} ({GULMI_PALIKA_NEPALI[m.palika.name] || ''})</span>
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
                          <span className="text-slate-500 font-sans">Soil Benchmark:</span>
                          <strong>pH {m.palika.soilPh}</strong>
                        </div>
                      </div>
                      <div className="mt-1 p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950 font-mono text-[11px]">
                        <div className="font-bold flex items-center justify-between">
                          <span>{m.cropItem.emoji} {m.cropItem.cropName}</span>
                          <span className="text-emerald-700 font-extrabold">{m.cropItem.score}%</span>
                        </div>
                        <div className="text-[10px] text-emerald-800 font-sans mt-0.5">
                          Suitability: <strong>{m.cropItem.rating}</strong>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

            {/* 81 Verified NARC Ground Soil Testing Sampling Points */}
            {(layerMode === 'soil' || showSoilGrid || layerMode === 'overview') &&
              gulmiSoilPoints.map((pt: any, idx: number) => {
                const nColor =
                  pt.nitrogen >= 0.18 ? '#059669' : pt.nitrogen >= 0.14 ? '#10b981' : '#f59e0b';
                return (
                  <CircleMarker
                    key={`soil-pt-${idx}`}
                    center={[pt.lat, pt.lon]}
                    radius={5}
                    pane="markerPane"
                    pathOptions={{
                      fillColor: nColor,
                      fillOpacity: 0.92,
                      color: '#ffffff',
                      weight: 1.5,
                    }}
                    eventHandlers={{
                      click: () => {
                        setInspectedSoilPoint({ ...pt, id: idx + 1 });
                      },
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -6]} opacity={0.98} pane="popupPane">
                      <div className="text-xs p-2 min-w-[200px] bg-white rounded-lg shadow-lg border border-slate-200">
                        <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1 flex items-center justify-between">
                          <span>🧪 Soil Point #{idx + 1}</span>
                          <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                            pH {pt.ph}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 space-y-0.5">
                          <div>Geology: <strong className="text-slate-800">{pt.soilType}</strong></div>
                          <div className="grid grid-cols-2 gap-1 bg-slate-50 p-1 rounded text-[10px] font-mono mt-1">
                            <div>N: <strong className="text-emerald-700">{pt.nitrogen}%</strong></div>
                            <div>P₂O₅: <strong className="text-blue-700">{pt.phosphorus} kg/ha</strong></div>
                            <div className="col-span-2">K₂O: <strong className="text-purple-700">{pt.potassium} kg/ha</strong></div>
                          </div>
                        </div>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                );
              })}

            {/* Hydropower Powerhouses */}
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
                        <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-mono font-bold">
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
                        <span className="text-[9px] bg-sky-100 text-sky-800 px-1 py-0.5 rounded font-mono font-bold">Active</span>
                      </div>
                      <div className="font-semibold text-slate-800 text-xs">{st.river} ({st.siteName})</div>
                      <div className="text-[10px] text-slate-600">Elevation: <strong className="font-mono">{st.elevation}m</strong> masl</div>
                      <div className="text-[9px] text-slate-500 bg-slate-50 p-1 rounded font-mono">Equip: {st.instruments}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>

          {/* Top-Right Base Map Layer Selector */}
          <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5">
            <select
              value={baseMapStyle}
              onChange={e => setBaseMapStyle(e.target.value as BaseMapStyle)}
              className="bg-slate-900/90 text-white text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-700 shadow-sm cursor-pointer focus:outline-none"
            >
              <option value="voyager">🗺️ Streets & Roads</option>
              <option value="osm">🛣️ OpenStreetMap</option>
              <option value="opentopo">🏔️ Topo Terrain</option>
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
              <span>Topo</span>
            </button>
          </div>

          {/* Floating Map Overlay Badge */}
          <div className="absolute top-3 left-3 z-[1000] pointer-events-none">
            <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 shadow-sm flex items-center gap-2 text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold font-outfit">
                {activePalika.name} ({activePalika.elevation}m ASL • pH {activePalika.soilPh})
              </span>
            </div>
          </div>
        </div>

        {/* ─── Real-Time Palika Spatial Telemetry & Layer Inspector (Right 5 Cols) ─── */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 overflow-y-auto">
          <div className="space-y-3">
            {/* Active Palika Executive Focus Card */}
            <div className="glass-panel p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2.5">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    🏛️
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 font-outfit text-sm">
                      {activePalika.name} ({GULMI_PALIKA_NEPALI[activePalika.name] || ''})
                    </h4>
                    <div className="text-[10px] text-emerald-800 font-sans">
                      {activePalika.unitType} • Gulmi District, Lumbini Province
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-white text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                  {activePalika.elevation}m ASL
                </span>
              </div>

              {/* 4 Precision Micro-Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 bg-white rounded-lg border border-emerald-200">
                  <div className="text-[10px] text-slate-500 font-sans">Soil Reaction</div>
                  <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                    <span>pH {activePalika.soilPh}</span>
                    <span className="text-[9px] text-emerald-700">({activePalika.soilPh < 6.0 ? 'Acidic' : 'Neutral'})</span>
                  </div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-emerald-200">
                  <div className="text-[10px] text-slate-500 font-sans">Local Temperature</div>
                  <div className="font-bold text-slate-900 mt-0.5">{activePalika.avgTempC}°C Lapse</div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-emerald-200">
                  <div className="text-[10px] text-slate-500 font-sans">Annual Rainfall</div>
                  <div className="font-bold text-slate-900 mt-0.5">{activePalika.rainfallMm} mm/yr</div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-emerald-200">
                  <div className="text-[10px] text-slate-500 font-sans">Verified Crops</div>
                  <div className="font-bold text-emerald-700 mt-0.5">{activePalika.feasibleCropsCount || 8} Species</div>
                </div>
              </div>
            </div>

            {/* 1. COFFEE BELT (DEDICATED COFFEE VIEW) */}
            {layerMode === 'coffee' && (
              <div className="glass-panel p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">☕</span>
                    <div>
                      <div className="text-xs font-bold text-amber-950 font-outfit uppercase tracking-wide">
                        Specialty Arabica Coffee Heritage Belt
                      </div>
                      <div className="text-[10px] text-amber-800 font-sans">
                        800m–1,600m Sub-Tropical Agro-Forestry Slopes
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-white text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                    MoALD Capital
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-xs space-y-1.5">
                  <div className="font-bold text-slate-900 flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <span>🌱</span>
                      <span>{activePalika.name} Coffee Agro-Suitability:</span>
                    </span>
                    <span className="font-extrabold text-amber-700 font-mono">95% Optimal</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Gulmi is the historic birthplace of Nepali Coffee (introduced in Aapchaur, 1938 BS). Over 2,500 smallholder farmers cultivate shade-grown organic Arabica in Ruru, Resunga, Gulmidarbar, and Satyawati.
                  </p>
                  {onSelectCrop && (
                    <button
                      onClick={() => {
                        const coffee = db.getCropById('coffee') || db.getAllCrops()[0];
                        onSelectCrop(coffee);
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-amber-700 hover:bg-amber-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>⚡ Run WEFES Arabica Coffee Simulation</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Coffee Landmarks List */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-amber-900 uppercase font-outfit">
                    Verified Coffee Hubs & Pockets in Gulmi:
                  </div>
                  <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto font-sans text-xs">
                    {GULMI_COFFEE_LANDMARKS.map(lm => (
                      <div
                        key={lm.id}
                        onClick={() => onSelectPalika && onSelectPalika(lm.palika)}
                        className={`p-2 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                          lm.palika.toLowerCase() === activePalika.name.toLowerCase()
                            ? 'bg-amber-100 border-amber-300 font-bold'
                            : 'bg-white border-slate-200 hover:bg-amber-50'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-[11px] text-slate-900 truncate flex items-center gap-1">
                            <span>☕</span>
                            <span>{lm.name}</span>
                          </div>
                          <div className="text-[9.5px] text-slate-500 font-serif">{lm.nepaliName}</div>
                        </div>
                        <span className="text-[9.5px] font-mono text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                          {lm.elevationM}m
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. CROPS & NICHES (DEDICATED CROP VIEW) */}
            {layerMode === 'crops' && (
              <div className="glass-panel p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-xs font-bold text-emerald-950 font-outfit uppercase tracking-wide">
                        {activePalika.name} Agro-Ecological Crop Niches
                      </div>
                      <div className="text-[10px] text-emerald-800 font-sans">
                        4-Season Cropping Calendar & Verified Cultivars
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-white text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                    {activePalika.feasibleCropsCount || 8} Cultivars
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="p-2 bg-white rounded-lg border border-emerald-200 space-y-1">
                    <div className="font-bold text-slate-900 flex justify-between">
                      <span>🌧️ बर्खे बाली (Monsoon Peak):</span>
                      <strong className="text-emerald-700">{activePalika.seasonalRotations?.barkhe?.cropName || 'Paddy Rice / Millet'}</strong>
                    </div>
                    <div className="font-bold text-slate-900 flex justify-between">
                      <span>❄️ हिउँदे बाली (Winter Cereal):</span>
                      <strong className="text-emerald-700">{activePalika.seasonalRotations?.hiunde?.cropName || 'Winter Wheat'}</strong>
                    </div>
                    <div className="font-bold text-slate-900 flex justify-between">
                      <span>☀️ चैते बाली (Spring Cash/Grain):</span>
                      <strong className="text-emerald-700">{activePalika.seasonalRotations?.chaite?.cropName || 'Organic Ginger / Spring Maize'}</strong>
                    </div>
                    <div className="font-bold text-slate-900 flex justify-between">
                      <span>🌳 बाह्रमासे बाली (Perennial):</span>
                      <strong className="text-emerald-700">{activePalika.seasonalRotations?.baahramase?.cropName || 'Arabica Coffee'}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-100/70 rounded-lg text-[11px] text-emerald-950">
                  Click any crop on the map pins to simulate multi-pillar yield, water productivity, and carbon sequestration.
                </div>
              </div>
            )}

            {/* 3. ROAD NETWORK & LOGISTICS LAYER */}
            {layerMode === 'roads' && (
              <div className="glass-panel p-4 rounded-xl border border-orange-200 bg-orange-50/60 space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-between border-b border-orange-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-bold text-slate-900 font-outfit uppercase tracking-wider">
                      Strategic Roads & Market Access
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-white text-orange-800 border border-orange-300">
                    {roadStats.total} Mapped Vectors
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    onClick={() => setRoadFilter(p => ({ ...p, highways: !p.highways }))}
                    className={`p-2 rounded-lg border text-left flex justify-between items-center transition-all cursor-pointer ${
                      roadFilter.highways ? 'bg-orange-600 text-white font-bold' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <span>Highways (Class A)</span>
                    <span className="font-mono text-[10px]">{roadStats.highways}</span>
                  </button>
                  <button
                    onClick={() => setRoadFilter(p => ({ ...p, feeders: !p.feeders }))}
                    className={`p-2 rounded-lg border text-left flex justify-between items-center transition-all cursor-pointer ${
                      roadFilter.feeders ? 'bg-amber-600 text-white font-bold' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <span>Feeder Roads (Class B)</span>
                    <span className="font-mono text-[10px]">{roadStats.feeders}</span>
                  </button>
                  <button
                    onClick={() => setRoadFilter(p => ({ ...p, municipal: !p.municipal }))}
                    className={`p-2 rounded-lg border text-left flex justify-between items-center transition-all cursor-pointer ${
                      roadFilter.municipal ? 'bg-sky-600 text-white font-bold' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <span>Municipal Links</span>
                    <span className="font-mono text-[10px]">{roadStats.municipal}</span>
                  </button>
                  <button
                    onClick={() => setRoadFilter(p => ({ ...p, rural: !p.rural }))}
                    className={`p-2 rounded-lg border text-left flex justify-between items-center transition-all cursor-pointer ${
                      roadFilter.rural ? 'bg-stone-700 text-white font-bold' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <span>Rural Tracks</span>
                    <span className="font-mono text-[10px]">{roadStats.rural}</span>
                  </button>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-orange-200 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>Madan Bhandari Highway Corridor:</span>
                    <strong className="text-slate-900">Ridi–Tamghas–Sandhikharka</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Pushpalal Mid-Hill Highway:</span>
                    <strong className="text-slate-900">Tamghas–Musikot–Burtibang</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Avg Distance to Paved Road:</span>
                    <strong className="text-orange-700">{district.avgDistanceToPavedRoadKm || 12} km</strong>
                  </div>
                </div>
              </div>
            )}

            {/* 4. NARC GROUND SOIL GRID (CLICK-TO-INSPECT HUD) */}
            {layerMode === 'soil' && (
              <div className="glass-panel p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 space-y-2.5 animate-fade-in-up">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900 font-outfit uppercase tracking-wider">
                      NARC Ground Soil Chemical Survey (81 Sampling Points)
                    </span>
                  </div>
                  <span className="text-[10px] bg-white text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                    NARC Registry
                  </span>
                </div>

                {inspectedSoilPoint ? (
                  <div className="p-3 bg-white rounded-xl border border-emerald-300 space-y-2 text-xs">
                    <div className="flex justify-between items-center border-b pb-1 font-bold text-slate-900">
                      <span>🧪 Inspected Soil Point #{inspectedSoilPoint.id}</span>
                      <span className="bg-emerald-100 text-emerald-800 font-mono text-[10px] px-2 py-0.5 rounded">
                        pH {inspectedSoilPoint.ph}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Soil Geology Classification: <strong className="text-slate-900">{inspectedSoilPoint.soilType}</strong>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px] text-center">
                      <div className="p-1.5 bg-emerald-50 rounded border border-emerald-200">
                        <div className="text-[9px] text-slate-500 font-sans">Total Nitrogen</div>
                        <div className="font-bold text-emerald-800">{inspectedSoilPoint.nitrogen}%</div>
                      </div>
                      <div className="p-1.5 bg-blue-50 rounded border border-blue-200">
                        <div className="text-[9px] text-slate-500 font-sans">Avail. P₂O₅</div>
                        <div className="font-bold text-blue-800">{inspectedSoilPoint.phosphorus} kg/ha</div>
                      </div>
                      <div className="p-1.5 bg-purple-50 rounded border border-purple-200">
                        <div className="text-[9px] text-slate-500 font-sans">Avail. K₂O</div>
                        <div className="font-bold text-purple-800">{inspectedSoilPoint.potassium} kg/ha</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-600">
                    Click any point marker on the map to inspect localized Nitrogen, Phosphorus, Potassium, and Soil pH readings.
                  </div>
                )}
              </div>
            )}

            {/* 5. HYDROLOGY & RIVER SYSTEMS */}
            {layerMode === 'hydrology' && (
              <div className="glass-panel p-4 rounded-xl border border-sky-200 bg-sky-50/70 space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-between border-b border-sky-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-sky-600" />
                    <div>
                      <div className="text-xs font-bold text-sky-950 font-outfit uppercase tracking-wider">
                        Hydrology & River Systems
                      </div>
                      <div className="text-[10px] text-sky-800 font-sans">
                        Kali Gandaki, Badigad, Ridi Khola Catchments
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-white text-sky-800 border border-sky-300 px-2 py-0.5 rounded font-mono font-bold">
                    DHM Active
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-sky-200 text-xs space-y-1.5">
                  <div className="font-bold text-slate-900">Major Watershed Basins:</div>
                  <div className="space-y-1 text-[11px] text-slate-700">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span>Kali Gandaki River (Ruru/Kaligandaki border)</span>
                      <strong className="text-sky-800 font-mono">DHM #415</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span>Badigad River (Musikot/Isma watershed)</span>
                      <strong className="text-sky-800 font-mono">DHM #406</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Ridi Khola Catchment (Resunga/Gulmidarbar)</span>
                      <strong className="text-sky-800 font-mono">Irrigation</strong>
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-sky-100/70 rounded-lg text-[11px] text-sky-950">
                  Perennial streamflow sustains winter vegetable tunnels and community lift irrigation schemes across {activePalika.name}.
                </div>
              </div>
            )}

            {/* 6. CLEAN HYDROPOWER & ENERGY */}
            {layerMode === 'energy' && (
              <div className="glass-panel p-4 rounded-xl border border-amber-200 bg-amber-50/70 space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="text-xs font-bold text-amber-950 font-outfit uppercase tracking-wider">
                        Hydropower & Clean Energy Grid
                      </div>
                      <div className="text-[10px] text-amber-800 font-sans">
                        Hydro Generation & Electrification Assets
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-white text-amber-800 border border-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                    NEA Grid
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-xs space-y-1.5">
                  <div className="font-bold text-slate-900">Key Hydropower Powerhouses:</div>
                  <div className="space-y-1 text-[11px] text-slate-700">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span>Ridi Khola Hydro Project (Ruru)</span>
                      <strong className="text-amber-800 font-mono">2.4 MW</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span>Badigad Khola Micro-Hydel (Musikot)</span>
                      <strong className="text-amber-800 font-mono">1.2 MW</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Tamghas 132kV Substation (Resunga)</span>
                      <strong className="text-emerald-700 font-mono">Grid Node</strong>
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-amber-100/70 rounded-lg text-[11px] text-amber-950">
                  96.8% of households in Gulmi are connected to national hydroelectric transmission, powering coffee pulp processing mills.
                </div>
              </div>
            )}

            {/* 7. ELEVATION PROFILER INLINE */}
            {layerMode === 'elevation' && (
              <DistrictElevationProfiler
                district={district}
                districtCrops={districtCrops}
              />
            )}

            {/* 8. OVERVIEW (INTEGRATED PALIKA SYNTHESIS) */}
            {layerMode === 'overview' && (
              <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-white space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900 font-outfit uppercase tracking-wider">
                      {activePalika.name} Spatial Profile Synthesis
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Nexus 73%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Priority Cash Crop</span>
                    <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                      <span>☕</span>
                      <span>Arabica Coffee (95%)</span>
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Soil Acidity Status</span>
                    <div className="font-bold text-slate-900 mt-0.5">pH {activePalika.soilPh || 6.7} (Optimal)</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Precipitation Inflow</span>
                    <div className="font-bold text-sky-800 mt-0.5">{activePalika.rainfallMm || 1850} mm/yr</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Elevation Band</span>
                    <div className="font-bold text-amber-800 mt-0.5">{activePalika.elevation || 1400}m ASL</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
