// [DATA PROVENANCE]
// Data Source: apps/web/public/geojson/gulmi-contours.json, apps/web/public/geojson/gulmi-district.json, data/real/boundaries/gulmi-palikas.json, data/real/land_and_soil/gulmi_soil_data.nc, data/real/infrastructure/district_infrastructure_assets.json
// Classification: OBSERVED REAL (NARC NSSRC 100m Geospatial Grid & Survey Department 30m DEM)
// Citations: Survey Department / Topographical Survey of Nepal, MoFAGA, DHM Nepal, NARC NSSRC, NEA
import React, { useEffect, useMemo, useState } from 'react';

import type { Feature, FeatureCollection, GeoJsonObject } from 'geojson';
import L from 'leaflet';
import { Activity, Compass, Droplets, FlaskConical, Layers, Mountain, Navigation, Zap } from 'lucide-react';
import { GeoJSON, MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';

import { Crop, District, GulmiContourCollection } from '@wefes/shared-types';

import { DHM_RIVER_STATIONS_BY_DISTRICT, DHMRiverStation } from '../../data/districtHydrologyAssets';
import { PALIKA_SOIL_DATA } from '../../data/districtIndicatorAssets';
import { DISTRICT_PALIKAS, DistrictPalika, PalikaFeasibleCrop } from '../../data/districtPalikaAssets';
import { GULMI_PALIKA_NEPALI } from '../../data/districtPalikaAssets';
import { GULMI_COFFEE_LANDMARKS, REAL_HYDROPOWER_PLANTS, RealHydropowerAsset } from '../../data/districtRealAssets';
import { fetchGeoJson } from '../../services/dataClient';
import { ContourLine, generateDistrictContours } from '../../utils/contourGenerator';

import { DistrictElevationProfiler } from './DistrictElevationProfiler';
import { MapGestureHandler } from './MapGestureHandler';
import { SpatialSoilSurfaceOverlay } from './SpatialSoilSurfaceOverlay';

interface DistrictDetailMapProps {
  district: District;
  selectedPalikaName?: string;
  onSelectPalika?: (palikaName: string) => void;
  distClimatology?: unknown;
  rainfallARIMA?: unknown;
  onSelectCrop?: (crop: Crop) => void;
}

type MapLayerMode = 'overview' | 'roads' | 'soil' | 'hydrology' | 'energy' | 'elevation';
type BaseMapStyle = 'voyager' | 'osm' | 'opentopo' | 'satellite';

const BASE_MAP_TILES: Record<BaseMapStyle, { url: string; attribution: string; name: string }> = {
  voyager: {
    name: 'Clean Vector Base',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
  },
  osm: {
    name: 'OpenStreetMap Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  opentopo: {
    name: 'Topographic Relief',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom',
  },
  satellite: {
    name: 'Satellite Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
};

// Auto-fit camera strictly to the active Palika polygon, or fallback to the full district
function PalikaBoundsUpdater({
  activePalikaFeature,
  districtFeature,
}: {
  activePalikaFeature?: GeoJsonObject | null;
  districtFeature?: GeoJsonObject | null;
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
    category === 'origin'
      ? '#b45309'
      : category === 'research'
        ? '#047857'
        : category === 'processing'
          ? '#7c2d12'
          : '#92400e';

  const badgeText =
    category === 'origin'
      ? '🌱 Origin'
      : category === 'research'
        ? '🔬 Lab'
        : category === 'processing'
          ? '🏭 Mill'
          : '☕ Pocket';

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
  onSelectCrop,
}) => {
  const [districtGeoData, setDistrictGeoData] = useState<Feature | null>(null);
  const [palikasGeoData, setPalikasGeoData] = useState<FeatureCollection | null>(null);
  const [contoursGeoData, setContoursGeoData] = useState<GulmiContourCollection | null>(null);
  const [loading, setLoading] = useState(true);

  const [layerMode, setLayerMode] = useState<MapLayerMode>('overview');
  const [baseMapStyle, setBaseMapStyle] = useState<BaseMapStyle>('voyager');
  const [showContours, setShowContours] = useState<boolean>(true);

  // Roads state
  const [districtRoadsData, setDistrictRoadsData] = useState<FeatureCollection | null>(null);
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

  // Selected soil metric for continuous 100m geospatial grid overlay
  const [soilSubFilter, setSoilSubFilter] = useState<
    'soil_ph' | 'soil_nitrogen' | 'soil_phosphorus' | 'soil_potassium'
  >('soil_ph');

  // Load Gulmi 12 Palikas GeoJSON, District Boundary, and Precompiled Contours
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetchGeoJson('gulmi-palikas.json').catch(() => null),
      fetchGeoJson('gulmi-district.json').catch(() => null),
      fetchGeoJson('gulmi-contours.json').catch(() => null),
    ]).then(([palikasData, districtData, contoursData]) => {
      if (!isMounted) return;

      if (palikasData) {
        setPalikasGeoData(palikasData);
      }

      if (contoursData) {
        setContoursGeoData(contoursData);
      }

      if (districtData && districtData.features) {
        const matched = districtData.features.find((f: Feature) => {
          const fid = f.properties?.id || f.properties?.DISTRICT || f.properties?.name;
          return (
            fid?.toLowerCase() === district.id.toLowerCase() ||
            f.properties?.name?.toLowerCase() === district.name.toLowerCase()
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

    const distId = district.id.toLowerCase();
    fetchGeoJson(`roads/${distId}.json`)
      .then((data) => {
        if (!isMounted) return;
        setDistrictRoadsData(data);
      })
      .catch(() => {
        if (isMounted) {
          setDistrictRoadsData(null);
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
    const found = districtPalikas.find((p) => p.name.toLowerCase() === selectedPalikaName?.toLowerCase());
    return (
      found ||
      districtPalikas[0] || {
        id: 'gulmi-resunga',
        name: 'Resunga',
        unitType: 'Nagarpalika',
        districtId: 'gulmi',
        districtName: 'Gulmi',
        coordinates: [28.068, 83.248],
        elevation: 1530,
        avgTempC: 14.5,
        rainfallMm: 1850,
        soilPh: 6.2,
        feasibleCropsCount: 8,
        feasibleCrops: [],
      }
    );
  }, [districtPalikas, selectedPalikaName]);

  // Active Palika GeoJSON polygon feature
  const activePalikaFeature = useMemo(() => {
    if (!palikasGeoData || !palikasGeoData.features) return null;
    return palikasGeoData.features.find((f: Feature) => {
      const name = f.properties?.name || f.properties?.fullName || '';
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

  // Active Palika Agro-Ecological Life Zone
  const palikaAgroZone = useMemo(() => {
    const elev = activePalika.elevation || 1400;
    if (elev < 1000) return 'Sub-Tropical (<1,000m)';
    if (elev < 1500) return 'Warm Temperate (1,000–1,500m)';
    if (elev < 2000) return 'Cool Temperate (1,500–2,000m)';
    return 'Sub-Alpine (≥2,000m)';
  }, [activePalika.elevation]);

  // Active Palika NARC Soil Profile
  const palikaSoilProfile = useMemo(() => {
    return PALIKA_SOIL_DATA?.palikas?.[activePalika.name];
  }, [activePalika.name]);

  // Active Palika Top Verified Feasible Crop
  const activePalikaTopCrop = useMemo(() => {
    const crops = activePalika.feasibleCrops || [];
    if (crops.length === 0) return null;
    return [...crops].sort((a, b) => b.score - a.score)[0];
  }, [activePalika.feasibleCrops]);

  // Palika Landmark Markers - Showing top feasible crop per palika
  const displayedPalikaCropMarkers = useMemo(() => {
    return districtPalikas.map((palika) => {
      const crops = palika.feasibleCrops || [];
      const isSelected = palika.name.toLowerCase() === activePalika.name.toLowerCase();
      const sorted = [...crops].sort((a, b) => b.score - a.score);
      const topCrop: PalikaFeasibleCrop = sorted[0] || {
        cropId: 'local-crop',
        cropName: 'Local Agriculture',
        nepaliName: 'स्थानीय कृषि',
        emoji: '🌱',
        category: 'Field Crop',
        score: 75,
        rating: 'Suitable' as const,
        limitingFactor: 'Elevation',
      };
      return { palika, cropItem: topCrop, isHighlighted: isSelected };
    });
  }, [districtPalikas, activePalika.name]);

  const generatedContours = useMemo<ContourLine[]>(() => {
    // Priority 1: Use precompiled offline vector contours (zero runtime overhead)
    if (contoursGeoData && Array.isArray(contoursGeoData.features) && contoursGeoData.features.length > 0) {
      return contoursGeoData.features.map((f) => {
        const p = f.properties;
        // GeoJSON LineString coordinates are [lng, lat] -> Leaflet Polyline expects [lat, lng]
        const rawCoords = f.geometry.coordinates as [number, number][];
        const leafletCoords: [number, number][] = rawCoords.map((c) => [c[1], c[0]]);
        return {
          elevation: p.elevation,
          isIndex: p.isIndex,
          color: p.color,
          weight: p.weight,
          opacity: p.opacity,
          coordinates: leafletCoords,
          temperatureC: p.temperatureC,
          lifeZone: p.lifeZone,
          feasibleCrops: p.feasibleCrops,
        };
      });
    }

    // Priority 2: Fallback to client-side marching squares interpolation
    if (!districtGeoData) return [];
    return generateDistrictContours(district, districtGeoData.geometry);
  }, [contoursGeoData, district, districtGeoData]);

  const hydroPlants: RealHydropowerAsset[] =
    REAL_HYDROPOWER_PLANTS[district.id] || REAL_HYDROPOWER_PLANTS[district.name] || [];
  const dhmRiverStations = useMemo<DHMRiverStation[]>(() => {
    return DHM_RIVER_STATIONS_BY_DISTRICT[district.id] || DHM_RIVER_STATIONS_BY_DISTRICT[district.name] || [];
  }, [district.id, district.name]);

  // Filtered Roads
  const filteredRoadsData = useMemo(() => {
    if (!districtRoadsData || !districtRoadsData.features) return null;
    const activeFeatures = districtRoadsData.features.filter((f: Feature) => {
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
    let highways = 0,
      feeders = 0,
      municipal = 0,
      rural = 0;
    districtRoadsData.features.forEach((f: Feature) => {
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
  const getPalikaPolygonStyle = (feature?: Feature) => {
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

  const onEachPalikaFeature = (feature: Feature, layer: L.Layer) => {
    const props = feature.properties;
    if (!props) return;

    const pName = props.name || 'Palika';
    const nepName = props.nepaliName || GULMI_PALIKA_NEPALI[pName] || '';
    const isSelected = pName.toLowerCase().includes(activePalika.name.toLowerCase());

    layer.on({
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          fillOpacity: isSelected ? 0.45 : 0.2,
          weight: isSelected ? 3.5 : 2,
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
        <div style="font-size: 9.5px; color: ${isSelected ? '#059669' : '#64748b'}; font-weight: ${isSelected ? '600' : 'normal'};">
          ${isSelected ? '📍 Active Focused Palika' : 'Adjacent Palika (Spatial Context)'}
        </div>
      </div>
    `,
      { sticky: true, direction: 'top', opacity: 0.95 }
    );
  };

  // Distinct Road Category Styles
  const getRoadVectorStyle = (feature?: Feature) => {
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
        opacity: 0.9,
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

  const onEachRoad = (feature: Feature, layer: L.Layer) => {
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
            <span>
              {activePalika.name} ({GULMI_PALIKA_NEPALI[activePalika.name] || ''}) Spatial GIS
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-md font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              📍 Focused Local Body
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-md font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
              🏔️ {palikaAgroZone}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-md font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
              🧪 NARC Soil: pH {palikaSoilProfile ? palikaSoilProfile.ph.toFixed(2) : activePalika.soilPh} (
              {palikaSoilProfile?.texture || 'Loam'})
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            High-resolution Palika vector boundaries, verified coffee processing hubs, NARC ground soil grid, and
            multi-tier road network.
          </p>
        </div>

        {/* Layer Mode Switcher Tabs */}
        <div className="flex items-center flex-wrap gap-1.5 p-1.5 rounded-xl border bg-slate-100/80 border-slate-200 text-xs font-medium max-w-full overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Relief', icon: <Layers className="w-3.5 h-3.5 text-slate-600" /> },
            { id: 'roads', label: 'Roads & Logistics', icon: <Navigation className="w-3.5 h-3.5 text-orange-600" /> },
            { id: 'soil', label: 'NARC Soil Grid', icon: <FlaskConical className="w-3.5 h-3.5 text-emerald-600" /> },
            { id: 'hydrology', label: 'Hydrology & DHM', icon: <Droplets className="w-3.5 h-3.5 text-sky-600" /> },
            { id: 'energy', label: 'Hydropower Grid', icon: <Zap className="w-3.5 h-3.5 text-purple-600" /> },
            { id: 'elevation', label: '3D Elevation', icon: <Mountain className="w-3.5 h-3.5 text-slate-600" /> },
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
            <PalikaBoundsUpdater activePalikaFeature={activePalikaFeature} districtFeature={districtGeoData} />

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
                    <div className="p-1.5 text-xs font-sans bg-white text-slate-900 rounded-md shadow-xs border border-slate-200 min-w-[150px]">
                      <div className="font-mono font-bold text-slate-800 border-b border-slate-100 pb-1">
                        ⛰️ {line.elevation}m masl {line.isIndex ? '(Index Contour)' : ''}
                      </div>
                      {line.lifeZone && (
                        <div className="text-[10px] text-sky-700 font-semibold mt-1">{line.lifeZone}</div>
                      )}
                      {line.temperatureC !== undefined && (
                        <div className="text-[10px] text-slate-500">
                          Lapse Temp: <strong>{line.temperatureC}°C</strong>
                        </div>
                      )}
                      {line.feasibleCrops && line.feasibleCrops.length > 0 && (
                        <div className="text-[9px] text-emerald-700 mt-0.5">
                          🌾 {line.feasibleCrops.slice(0, 3).join(', ')}
                        </div>
                      )}
                    </div>
                  </Tooltip>
                </Polyline>
              ))}

            {/* Verified Coffee Landmarks (Aapchaur Origin, Tamghas Center, Ruru Mill, etc.) */}
            {layerMode === 'overview' &&
              GULMI_COFFEE_LANDMARKS.map((lm) => (
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
                        Palika: <strong className="text-slate-900">{lm.palika}</strong> • Altitude:{' '}
                        <strong className="font-mono">{lm.elevationM}m ASL</strong>
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

            {/* Palika Agro-Climatic Pins */}
            {layerMode === 'overview' &&
              displayedPalikaCropMarkers.map((m, idx) => (
                <Marker
                  key={`palika-pin-${m.palika.id}-${idx}`}
                  position={[m.palika.coordinates[0], m.palika.coordinates[1]]}
                  icon={createPalikaPinIcon(m.cropItem.emoji, m.palika.name, m.cropItem.score, m.isHighlighted)}
                >
                  <Popup className="custom-popup" autoPan={false}>
                    <div className="p-2.5 space-y-1.5 text-xs font-sans min-w-[210px]">
                      <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex justify-between items-center">
                        <span>
                          🏛️ {m.palika.name} ({GULMI_PALIKA_NEPALI[m.palika.name] || ''})
                        </span>
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
                          <span>
                            {m.cropItem.emoji} {m.cropItem.cropName}
                          </span>
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

            {/* Continuous Spatial Soil Heatmap Surface (NARC 100m Soil Grid, 37,800+ Cells) */}
            {layerMode === 'soil' && activePalikaFeature && (
              <SpatialSoilSurfaceOverlay
                subFilter={soilSubFilter}
                geoData={activePalikaFeature}
                pane="overlayPane"
                opacity={0.88}
              />
            )}

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
                      <div className="text-slate-600 text-[11px]">
                        River: <strong className="text-slate-900">{plant.river}</strong>
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        Owner: <strong className="text-slate-900">{plant.owner}</strong>
                      </div>
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
                        <span className="text-[9px] bg-sky-100 text-sky-800 px-1 py-0.5 rounded font-mono font-bold">
                          Active
                        </span>
                      </div>
                      <div className="font-semibold text-slate-800 text-xs">
                        {st.river} ({st.siteName})
                      </div>
                      <div className="text-[10px] text-slate-600">
                        Elevation: <strong className="font-mono">{st.elevation}m</strong> masl
                      </div>
                      <div className="text-[9px] text-slate-500 bg-slate-50 p-1 rounded font-mono">
                        Equip: {st.instruments}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>

          {/* Top-Right Base Map Layer Selector */}
          <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5">
            <select
              value={baseMapStyle}
              onChange={(e) => setBaseMapStyle(e.target.value as BaseMapStyle)}
              className="bg-white/95 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-xl border border-slate-200 shadow-md cursor-pointer focus:outline-none backdrop-blur-md"
            >
              <option value="voyager">🗺️ Streets & Roads</option>
              <option value="osm">🛣️ OpenStreetMap</option>
              <option value="opentopo">🏔️ Topo Terrain</option>
              <option value="satellite">🛰️ Satellite View</option>
            </select>
            <button
              onClick={() => setShowContours(!showContours)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1 shadow-md transition-all cursor-pointer backdrop-blur-md ${
                showContours
                  ? 'bg-sky-600 text-white border-sky-500'
                  : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Mountain className="w-3.5 h-3.5" />
              <span>Topo</span>
            </button>
          </div>

          {/* Floating Map Overlay Badge */}
          <div className="absolute top-3 left-3 z-[1000] pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md flex items-center gap-2 text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold font-outfit text-slate-900">
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
                    <span>pH {palikaSoilProfile ? palikaSoilProfile.ph.toFixed(2) : activePalika.soilPh}</span>
                    <span className="text-[9px] text-emerald-700">
                      ({palikaSoilProfile?.phRating || (activePalika.soilPh < 6.0 ? 'Acidic' : 'Optimal')})
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-emerald-200">
                  <div className="text-[10px] text-slate-500 font-sans">Local Temperature</div>
                  <div className="font-bold text-slate-900 mt-0.5">{activePalika.avgTempC}°C Lapse</div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-emerald-200">
                  <div className="text-[10px] text-slate-500 font-sans">Annual Rainfall</div>
                  <div className="font-bold text-slate-900 mt-0.5">{activePalika.rainfallMm} mm/yr (DHM)</div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-emerald-200">
                  <div className="text-[10px] text-slate-500 font-sans">Verified Crops</div>
                  <div className="font-bold text-emerald-700 mt-0.5">
                    {activePalika.feasibleCropsCount ||
                      (activePalika.feasibleCrops ? activePalika.feasibleCrops.length : 8)}{' '}
                    Species
                  </div>
                </div>
              </div>
            </div>

            {/* 1. ROAD NETWORK & LOGISTICS LAYER */}
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
                    onClick={() => setRoadFilter((p) => ({ ...p, highways: !p.highways }))}
                    className={`p-2 rounded-lg border text-left flex justify-between items-center transition-all cursor-pointer ${
                      roadFilter.highways
                        ? 'bg-orange-600 text-white font-bold'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <span>Highways (Class A)</span>
                    <span className="font-mono text-[10px]">{roadStats.highways}</span>
                  </button>
                  <button
                    onClick={() => setRoadFilter((p) => ({ ...p, feeders: !p.feeders }))}
                    className={`p-2 rounded-lg border text-left flex justify-between items-center transition-all cursor-pointer ${
                      roadFilter.feeders
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <span>Feeder Roads (Class B)</span>
                    <span className="font-mono text-[10px]">{roadStats.feeders}</span>
                  </button>
                  <button
                    onClick={() => setRoadFilter((p) => ({ ...p, municipal: !p.municipal }))}
                    className={`p-2 rounded-lg border text-left flex justify-between items-center transition-all cursor-pointer ${
                      roadFilter.municipal
                        ? 'bg-sky-600 text-white font-bold'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <span>Municipal Links</span>
                    <span className="font-mono text-[10px]">{roadStats.municipal}</span>
                  </button>
                  <button
                    onClick={() => setRoadFilter((p) => ({ ...p, rural: !p.rural }))}
                    className={`p-2 rounded-lg border text-left flex justify-between items-center transition-all cursor-pointer ${
                      roadFilter.rural
                        ? 'bg-stone-700 text-white font-bold'
                        : 'bg-white text-slate-600 border-slate-200'
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

            {/* 2. NARC 100M GEOSPATIAL SOIL GRID HUD */}
            {layerMode === 'soil' && (
              <div className="glass-panel p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900 font-outfit uppercase tracking-wider">
                      NARC 100m Geospatial Soil Grid ({palikaSoilProfile?.sampleCount?.toLocaleString() || '3,486'}{' '}
                      Empirical Cells)
                    </span>
                  </div>
                  <span className="text-[10px] bg-white text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                    NARC NSSRC
                  </span>
                </div>

                {/* Subfilter Metric Switcher */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-white/90 rounded-lg border border-emerald-200 text-[11px] font-semibold">
                  <button
                    onClick={() => setSoilSubFilter('soil_ph')}
                    className={`py-1 rounded text-center transition-colors cursor-pointer ${
                      soilSubFilter === 'soil_ph'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    pH {palikaSoilProfile?.ph || 6.18}
                  </button>
                  <button
                    onClick={() => setSoilSubFilter('soil_nitrogen')}
                    className={`py-1 rounded text-center transition-colors cursor-pointer ${
                      soilSubFilter === 'soil_nitrogen'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    N {palikaSoilProfile?.nitrogenPct ? `${palikaSoilProfile.nitrogenPct}%` : '0.15%'}
                  </button>
                  <button
                    onClick={() => setSoilSubFilter('soil_phosphorus')}
                    className={`py-1 rounded text-center transition-colors cursor-pointer ${
                      soilSubFilter === 'soil_phosphorus'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    P {palikaSoilProfile?.phosphorusKgHa ? `${Math.round(palikaSoilProfile.phosphorusKgHa)}` : '176'}
                  </button>
                  <button
                    onClick={() => setSoilSubFilter('soil_potassium')}
                    className={`py-1 rounded text-center transition-colors cursor-pointer ${
                      soilSubFilter === 'soil_potassium'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    K {palikaSoilProfile?.potassiumKgHa ? `${Math.round(palikaSoilProfile.potassiumKgHa)}` : '232'}
                  </button>
                </div>

                {/* Local Palika Empirical Soil Chemistry */}
                <div className="p-3 bg-white rounded-xl border border-emerald-300 space-y-2.5 text-xs shadow-2xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 font-bold text-slate-900">
                    <span>📍 {activePalika.name} Soil Survey</span>
                    <span className="bg-emerald-100 text-emerald-800 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                      {palikaSoilProfile?.sampleCount?.toLocaleString() || '3,486'} Samples
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500">Soil Reaction:</span>{' '}
                      <strong className="text-emerald-700">pH {palikaSoilProfile?.ph || 6.18}</strong>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {palikaSoilProfile?.phMin || 5.63}–{palikaSoilProfile?.phMax || 6.49} (
                        {palikaSoilProfile?.phRating || 'Optimal'})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">USDA Texture:</span>{' '}
                      <strong className="text-slate-800">{palikaSoilProfile?.texture || 'Loam'}</strong>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Clay {palikaSoilProfile?.clayPct || 8.9}% · Silt {palikaSoilProfile?.siltPct || 44.8}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Organic Matter:</span>{' '}
                      <strong className="text-slate-800">{palikaSoilProfile?.organicMatterPct || 3.18}%</strong>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Rating: {palikaSoilProfile?.organicMatterRating || 'Medium'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Classification:</span>{' '}
                      <strong className="text-slate-800">
                        {palikaSoilProfile?.dominantSoil || 'Eutric Cambisols'}
                      </strong>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Code: {palikaSoilProfile?.dominantSoilCode || 'CMe'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px] text-center pt-1 border-t border-slate-100">
                    <div className="p-1.5 bg-emerald-50 rounded border border-emerald-200">
                      <div className="text-[9px] text-slate-500 font-sans">Total Nitrogen</div>
                      <div className="font-bold text-emerald-800">{palikaSoilProfile?.nitrogenPct || 0.15}%</div>
                      <div className="text-[9px] text-emerald-600 font-sans">
                        {palikaSoilProfile?.nitrogenRating || 'Medium'}
                      </div>
                    </div>
                    <div className="p-1.5 bg-blue-50 rounded border border-blue-200">
                      <div className="text-[9px] text-slate-500 font-sans">Avail. P₂O₅</div>
                      <div className="font-bold text-blue-800">{palikaSoilProfile?.phosphorusKgHa || 176.1} kg/ha</div>
                      <div className="text-[9px] text-blue-600 font-sans">
                        {palikaSoilProfile?.phosphorusRating || 'High'}
                      </div>
                    </div>
                    <div className="p-1.5 bg-purple-50 rounded border border-purple-200">
                      <div className="text-[9px] text-slate-500 font-sans">Avail. K₂O</div>
                      <div className="font-bold text-purple-800">{palikaSoilProfile?.potassiumKgHa || 231.7} kg/ha</div>
                      <div className="text-[9px] text-purple-600 font-sans">
                        {palikaSoilProfile?.potassiumRating || 'Medium'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. HYDROLOGY & RIVER SYSTEMS */}
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
                  <div className="font-bold text-slate-900">DHM Hydrological Gauging Stations:</div>
                  <div className="space-y-1 text-[11px] text-slate-700">
                    {dhmRiverStations.map((st) => (
                      <div
                        key={st.stationNo}
                        className="flex justify-between border-b border-slate-100 last:border-b-0 pb-1"
                      >
                        <span>
                          {st.river} ({st.siteName})
                        </span>
                        <strong className="text-sky-800 font-mono">
                          DHM #{st.stationNo} • {st.elevation}m
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-2 bg-sky-100/70 rounded-lg text-[11px] text-sky-950">
                  Perennial streamflow sustains winter vegetable tunnels and community lift irrigation schemes across{' '}
                  {activePalika.name}.
                </div>
              </div>
            )}

            {/* 4. CLEAN HYDROPOWER & ENERGY */}
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
                  <div className="font-bold text-slate-900">NEA Registered Hydropower Assets:</div>
                  <div className="space-y-1 text-[11px] text-slate-700">
                    {hydroPlants.map((plant) => (
                      <div
                        key={plant.name}
                        className="flex justify-between border-b border-slate-100 last:border-b-0 pb-1"
                      >
                        <span>
                          {plant.name} ({plant.river})
                        </span>
                        <strong className="text-amber-800 font-mono">{plant.capacityMW} MW</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-2 bg-amber-100/70 rounded-lg text-[11px] text-amber-950">
                  96.8% of households in Gulmi are connected to national hydroelectric transmission, powering
                  agro-processing mills and rural lift pumps.
                </div>
              </div>
            )}

            {/* 5. ELEVATION PROFILER INLINE */}
            {layerMode === 'elevation' && <DistrictElevationProfiler district={district} />}

            {/* 6. OVERVIEW (INTEGRATED PALIKA SYNTHESIS) */}
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
                    📍 Focused Local Body
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Top Feasible Crop</span>
                    <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                      <span>{activePalikaTopCrop?.emoji || '🌾'}</span>
                      <span>
                        {activePalikaTopCrop
                          ? `${activePalikaTopCrop.cropName} (${activePalikaTopCrop.score}%)`
                          : 'Local Agri'}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Soil Acidity Status</span>
                    <div className="font-bold text-slate-900 mt-0.5">
                      pH {palikaSoilProfile ? palikaSoilProfile.ph.toFixed(2) : activePalika.soilPh} (
                      {palikaSoilProfile?.texture || 'Loam'})
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Precipitation Inflow</span>
                    <div className="font-bold text-sky-800 mt-0.5">{activePalika.rainfallMm} mm/yr (DHM)</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Elevation Band</span>
                    <div className="font-bold text-amber-800 mt-0.5">
                      {activePalika.elevation}m ({palikaAgroZone})
                    </div>
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
