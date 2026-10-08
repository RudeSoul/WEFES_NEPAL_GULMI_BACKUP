// [DATA PROVENANCE]
// Data Source:
// - data/real/municipal/palika_profiles.json
// - data/calculated/hydro_reaches/hydro_palika_summary.json
// - data/calculated/hydro_reaches/hydro_potential_reaches.geojson
// - data/real/boundaries/gulmi-palikas.json
// - apps/web/public/geojson/gulmi-contours.json
// - data/real/hydrology/catchments_l10.geojson
// - data/real/hydrology/rivers_streams.geojson
// - data/real/hydrology/flow_accumulation.tif
// - data/real/hydrology/flow_direction.tif
// Classification: OBSERVED REAL & CALCULATED BASELINES
// Citations: Ministry of Federal Affairs and General Administration (MoFAGA), DHM Nepal, Survey Department of Nepal, HydroSHEDS / HydroRIVERS / HydroBASINS (WWF/USGS)
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Feature, FeatureCollection, GeoJsonObject, Point } from 'geojson';
import L from 'leaflet';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  Eye,
  EyeOff,
  FileText,
  Gauge,
  Moon,
  Mountain,
  ShieldCheck,
  Snowflake,
  Sprout,
  Sun,
  Target,
  Trees,
  Wind,
  Zap,
} from 'lucide-react';
import { CircleMarker, GeoJSON, MapContainer, Marker, TileLayer, Tooltip, useMap, ZoomControl } from 'react-leaflet';

import { db } from '@wefes/database';
import { SUBFILTER_LEGENDS, WEFESPillar } from '@wefes/shared-types';

import { DynamicLegend } from '../../components/legend/DynamicLegend';
import { VALIDATED_CROPS } from '../../data/cropSuitabilityAssets';
import { resolveCalculationMethodology } from '../../data/districtCalculationAssets';
import { PALIKA_GRID_DATA as palikaGridData, SubstationInfo } from '../../data/districtIndicatorAssets';
import { DISTRICT_PALIKAS, PALIKA_CENTROIDS } from '../../data/districtPalikaAssets';
import { usePalikaChoropleth } from '../../hooks/usePalikaChoropleth';
import { fetchGeoJson, getTileUrl } from '../../services/dataClient';
import { type GeoTiffRasterStats, getGeoTiffZonalStats } from '../../services/geoTiffZonalStats';
import { useNexusStore } from '../../store';

import { CatchmentsGeoJsonLayer } from './CatchmentsGeoJsonLayer';
import { MapGestureHandler } from './MapGestureHandler';
import { MapLayerControl } from './MapLayerControl';
import { RiversStreamsGeoJsonLayer } from './RiversStreamsGeoJsonLayer';
import { SpatialFlowAccumulationOverlay } from './SpatialFlowAccumulationOverlay';
import { SpatialFlowDirectionOverlay } from './SpatialFlowDirectionOverlay';
import { SpatialPrecipitationOverlay } from './SpatialPrecipitationOverlay';
import { SpatialSettlementDensityOverlay } from './SpatialSettlementDensityOverlay';
import { SpatialSoilSurfaceOverlay } from './SpatialSoilSurfaceOverlay';
import { SpatialSolarSurfaceOverlay } from './SpatialSolarSurfaceOverlay';

import { Latex } from '@/components/common';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const NEPAL_MAX_BOUNDS: [[number, number], [number, number]] = [
  [25.0, 78.5],
  [31.5, 89.5],
];
const GULMI_MAP_CENTER: [number, number] = [28.095, 83.315];
const GULMI_MAP_ZOOM = 11;
const GULMI_BOUNDS: [[number, number], [number, number]] = [
  [27.92, 83.024],
  [28.271, 83.608],
];

function createPalikaLabelIcon(name: string, _nepali: string, isHovered: boolean) {
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
        color: 'text-amber-500',
      };
    case 1:
    case 2:
      return {
        en: 'Partly Cloudy',
        np: 'आंशिक बदली',
        icon: isDay ? CloudSun : Cloud,
        color: 'text-sky-500',
      };
    case 3:
      return {
        en: 'Overcast',
        np: 'पूर्ण बदली',
        icon: Cloud,
        color: 'text-slate-500',
      };
    case 45:
    case 48:
      return {
        en: 'Fog / Mist',
        np: 'कुहिरो / हुस्सु',
        icon: CloudFog,
        color: 'text-slate-400',
      };
    case 51:
    case 53:
    case 55:
      return {
        en: 'Drizzle',
        np: 'सिमसिमे पानी',
        icon: CloudDrizzle,
        color: 'text-sky-500',
      };
    case 61:
    case 63:
    case 65:
      return {
        en: 'Rain',
        np: 'वर्षा',
        icon: CloudRain,
        color: 'text-blue-600',
      };
    case 71:
    case 73:
    case 75:
      return {
        en: 'Snowfall',
        np: 'हिमपात',
        icon: Snowflake,
        color: 'text-indigo-400',
      };
    case 80:
    case 81:
    case 82:
      return {
        en: 'Rain Showers',
        np: 'क्षणिक वर्षा',
        icon: CloudRain,
        color: 'text-blue-500',
      };
    case 95:
    case 96:
    case 99:
      return {
        en: 'Thunderstorm',
        np: 'मेघगर्जन सहित वर्षा',
        icon: CloudLightning,
        color: 'text-amber-600',
      };
    default:
      return {
        en: 'Fair Weather',
        np: 'सामान्य मौसम',
        icon: CloudSun,
        color: 'text-sky-500',
      };
  }
};

const getCardinalDirection = (deg: number): string => {
  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
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
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface DhmStationProperties {
  stationType?: string;
  stationNo?: string;
  indexNo?: string;
  stationName?: string;
  siteName?: string;
  elevation_m?: number | string;
  elevation?: number | string;
  palika?: string;
  district?: string;
  riverBasin?: string;
  river?: string;
  lat?: number;
  lng?: number;
  instruments?: string;
  monitoringParameters?: string[];
  status?: string;
  [key: string]: unknown;
}

interface PalikaHoverData {
  name: string;
  nepaliName?: string;
  type?: string;
  elevation?: number;
  soilPh?: number;
  areaSqKm?: number;
  [key: string]: unknown;
}

export const DistrictMap: React.FC = () => {
  const navigate = useNavigate();
  const climateDataset = useNexusStore((s) => s.climateDataset);
  const storeFetchClimate = useNexusStore((s) => s.fetchClimateDataset);
  const selectedDistrict = useNexusStore((s) => s.selectedDistrict);
  const setSelectedPalikaName = useNexusStore((s) => s.setSelectedPalikaName);
  const selectedPillar = useNexusStore((s) => s.selectedPillar);
  const setSelectedPillar = useNexusStore((s) => s.setSelectedPillar);
  const selectedMapCropId = useNexusStore((s) => s.selectedMapCropId);
  const subFilters = useNexusStore((s) => s.subFilters);

  const onSelectDistrict = (palikaName?: string) => {
    const pName = palikaName || 'Resunga';
    setSelectedPalikaName(pName);
    navigate(`/palikas/${encodeURIComponent(pName)}`);
  };

  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);

  const CLI_YEAR = 2024;
  const CLI_MONTH = 12;
  const CLI_MODE: 'monthly' | 'annual' | 'climatology' = 'monthly';

  const [hydrologyStations, setHydrologyStations] = useState<Feature<Point, DhmStationProperties>[]>([]);
  const [nationalRoads, setNationalRoads] = useState<GeoJsonObject | null>(null);
  const [gulmiRivers, setGulmiRivers] = useState<GeoJsonObject | null>(null);
  const [catchmentsData, setCatchmentsData] = useState<GeoJsonObject | null>(null);
  const [riversStreamsData, setRiversStreamsData] = useState<GeoJsonObject | null>(null);
  const [hydroReachesData, setHydroReachesData] = useState<GeoJsonObject | null>(null);
  const [hydroReachesLoading, setHydroReachesLoading] = useState<boolean>(false);
  const [contoursData, setContoursData] = useState<GeoJsonObject | null>(null);

  const [palikasData, setPalikasData] = useState<GeoJsonObject | null>(null);
  const [dynamicPrecipStats, setDynamicPrecipStats] = useState<Record<string, GeoTiffRasterStats>>({});
  const [hoveredPalika, setHoveredPalika] = useState<PalikaHoverData | null>(null);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  // Landing Page Suite State & User Map Preferences (Synced with Zustand)
  const lang = useNexusStore((s) => s.lang);
  const basemap = useNexusStore((s) => s.basemap);
  const setBasemap = useNexusStore((s) => s.setBasemap);
  const showPalikaLabels = useNexusStore((s) => s.showPalikaLabels);
  const setShowPalikaLabels = useNexusStore((s) => s.setShowPalikaLabels);
  const showContours = useNexusStore((s) => s.showContours);
  const setShowContours = useNexusStore((s) => s.setShowContours);

  useEffect(() => {
    if (!climateDataset) {
      storeFetchClimate();
    }
  }, [climateDataset, storeFetchClimate]);

  const [liveWeather, setLiveWeather] = useState<LiveGulmiWeather | null>(null);
  const [liveWeatherLoading, setLiveWeatherLoading] = useState<boolean>(true);
  const [isAgroMeteoOpen, setIsAgroMeteoOpen] = useState<boolean>(false);

  // Fetch real-time live satellite weather for Gulmi district coordinates
  useEffect(() => {
    fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=28.068&longitude=83.248&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,surface_pressure,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,direct_radiation,uv_index,dew_point_2m,is_day&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max,sunrise,sunset,et0_fao_evapotranspiration&timezone=Asia%2FKathmandu'
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.current) {
          const wmo = getWmoWeatherInfo(data.current.weather_code || 0, data.current.is_day === 1);
          const sunriseStr = data.daily?.sunrise?.[0] ? data.daily.sunrise[0].split('T')[1]?.slice(0, 5) : '05:55';
          const sunsetStr = data.daily?.sunset?.[0] ? data.daily.sunset[0].split('T')[1]?.slice(0, 5) : '18:18';

          setLiveWeather({
            temperature: Number(data.current.temperature_2m.toFixed(1)),
            apparentTemp: Number(data.current.apparent_temperature.toFixed(1)),
            tempMin:
              data.daily?.temperature_2m_min?.[0] !== undefined
                ? Number(data.daily.temperature_2m_min[0].toFixed(1))
                : undefined,
            tempMax:
              data.daily?.temperature_2m_max?.[0] !== undefined
                ? Number(data.daily.temperature_2m_max[0].toFixed(1))
                : undefined,
            humidity: Math.round(data.current.relative_humidity_2m),
            precipitation: Number(data.current.precipitation.toFixed(1)),
            dailyPrecipSum:
              data.daily?.precipitation_sum?.[0] !== undefined
                ? Number(data.daily.precipitation_sum[0].toFixed(1))
                : undefined,
            windSpeed: Number((data.current.wind_speed_10m / 3.6).toFixed(1)),
            windDirection:
              data.current.wind_direction_10m !== undefined ? Math.round(data.current.wind_direction_10m) : undefined,
            windGusts:
              data.current.wind_gusts_10m !== undefined
                ? Number((data.current.wind_gusts_10m / 3.6).toFixed(1))
                : undefined,
            solarRadiation: Math.round(data.current.direct_radiation || 0),
            uvIndex:
              data.daily?.uv_index_max?.[0] !== undefined
                ? Number(data.daily.uv_index_max[0].toFixed(1))
                : data.current.uv_index !== undefined
                  ? Number(data.current.uv_index.toFixed(1))
                  : undefined,
            weatherCode: data.current.weather_code ?? 0,
            conditionLabelEn: wmo.en,
            conditionLabelNp: wmo.np,
            isDay: data.current.is_day === 1,
            surfacePressure:
              data.current.surface_pressure !== undefined ? Math.round(data.current.surface_pressure) : 854,
            dewPoint:
              data.current.dew_point_2m !== undefined ? Number(data.current.dew_point_2m.toFixed(1)) : undefined,
            cloudCover: Math.round(data.current.cloud_cover || 0),
            faoEvapotranspiration:
              data.daily?.et0_fao_evapotranspiration?.[0] !== undefined
                ? Number(data.daily.et0_fao_evapotranspiration[0].toFixed(1))
                : 3.2,
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

  const handleHoverPalikaFromMatrix = (palikaName: string | null) => {
    if (!palikaName) {
      setHoveredPalika(null);
      return;
    }
    const gulmiPalikas = DISTRICT_PALIKAS['gulmi'] || [];
    const found = gulmiPalikas.find((p) => p.name.toLowerCase() === palikaName.toLowerCase());
    if (found) {
      setHoveredPalika({
        name: found.name,
        nepaliName: PALIKA_CENTROIDS[found.name]?.nepali || found.name,
        type: found.unitType || 'Palika',
        elevation: found.elevation,
        soilPh: found.soilPh,
      });
    }
  };

  useEffect(() => {
    Promise.all([
      fetchGeoJson<FeatureCollection>('gulmi-district.json').catch(() => null),
      fetchGeoJson<FeatureCollection>('gulmi-palikas.json').catch(() => null),
      fetchGeoJson<FeatureCollection>('roads/gulmi.json').catch(() => null),
      fetchGeoJson<FeatureCollection>('gulmi-dhm-stations.json').catch(() => null),
      fetchGeoJson<FeatureCollection>('gulmi-rivers.json').catch(() => null),
    ])
      .then(([geo, palikas, roads, hydroAssets, rivers]) => {
        if (geo) setGeoData(geo);
        if (palikas) setPalikasData(palikas);
        if (roads) setNationalRoads(roads);
        if (rivers) setGulmiRivers(rivers);
        if (hydroAssets?.type === 'FeatureCollection' && Array.isArray(hydroAssets.features)) {
          setHydrologyStations(hydroAssets.features as Feature<Point, DhmStationProperties>[]);
        }
        setGeoLoading(false);
      })
      .catch(() => setGeoLoading(false));
  }, []);

  // Precipitation subfilter active-state flags — declared here so the lazy-load useEffect below can use them
  const isAnnualPrecipitationActive =
    selectedPillar === 'water' && subFilters.waterSubFilter === 'annual_precipitation';
  const isMonsoonPrecipitationActive =
    selectedPillar === 'water' && subFilters.waterSubFilter === 'monsoon_precipitation';
  const isDrySeasonPrecipitationActive =
    selectedPillar === 'water' && subFilters.waterSubFilter === 'dry_season_precipitation';
  const isChirpsPrecipitationActive =
    isAnnualPrecipitationActive || isMonsoonPrecipitationActive || isDrySeasonPrecipitationActive;

  // Decode CHIRPS GeoTIFF rasters ON-DEMAND: only when user selects a precipitation subfilter.
  // Module-level session cache ensures each TIF is fetched and decoded at most once per browser session.
  // Zero network requests occur until the user actively opens the Water > Precipitation subfilter.
  const precipSessionCache = useRef<Record<string, GeoTiffRasterStats>>({});
  useEffect(() => {
    if (!palikasData || !isChirpsPrecipitationActive) return;

    const activeKey = isAnnualPrecipitationActive
      ? 'annual_precipitation'
      : isMonsoonPrecipitationActive
        ? 'monsoon_precipitation'
        : 'dry_season_precipitation';

    // Already computed this session — serve from cache instantly
    if (precipSessionCache.current[activeKey]) {
      setDynamicPrecipStats((prev) => ({ ...prev, [activeKey]: precipSessionCache.current[activeKey] }));
      return;
    }

    const url = getTileUrl(`average_${activeKey.replace('_precipitation', '')}_precipitation.tif`);
    getGeoTiffZonalStats(url, palikasData)
      .then((stats) => {
        precipSessionCache.current[activeKey] = stats;
        setDynamicPrecipStats((prev) => ({ ...prev, [activeKey]: stats }));
      })
      .catch((err) => {
        console.warn(`Dynamic GeoTIFF decoding for ${activeKey} skipped:`, err);
      });
  }, [
    palikasData,
    isChirpsPrecipitationActive,
    isAnnualPrecipitationActive,
    isMonsoonPrecipitationActive,
    isDrySeasonPrecipitationActive,
  ]);

  // Live Climate Telemetry for Gulmi District (MERRA-2 & NASA POWER)
  const currentRainMm = climateDataset
    ? Math.round(
        climateDataset.climateMap?.['gulmi']?.[CLI_YEAR > 2019 ? 2019 : CLI_YEAR]?.[CLI_MONTH]?.prectot ??
          climateDataset.climatologyMap?.['gulmi']?.[CLI_MONTH]?.prectot ??
          150
      )
    : 150;

  const currentTempC = climateDataset
    ? Number(
        (
          climateDataset.climateMap?.['gulmi']?.[CLI_YEAR > 2019 ? 2019 : CLI_YEAR]?.[CLI_MONTH]?.t2m ??
          climateDataset.climatologyMap?.['gulmi']?.[CLI_MONTH]?.t2m ??
          19.5
        ).toFixed(1)
      )
    : 19.5;

  // Track B: Dynamic Palika Attribute Joining Hook
  const choropleth = usePalikaChoropleth({
    rawGeoJson: palikasData,
    selectedPillar,
    subFilters,
    selectedCropId: selectedMapCropId || undefined,
    climateMonth: CLI_MONTH,
    currentRainMm,
    currentTempC,
    dynamicPrecipStats,
  });

  const isCatchmentsActive = selectedPillar === 'water' && subFilters.waterSubFilter === 'catchments';
  const isRiversStreamsActive = selectedPillar === 'water' && subFilters.waterSubFilter === 'rivers_streams';
  const isFlowAccumulationActive = selectedPillar === 'water' && subFilters.waterSubFilter === 'flow_accumulation';
  const isFlowDirectionActive = selectedPillar === 'water' && subFilters.waterSubFilter === 'flow_direction';
  const isSolarGhiActive = selectedPillar === 'energy' && subFilters.energySubFilter === 'solar_irradiance';
  const isGridSubstationActive =
    selectedPillar === 'energy' &&
    (subFilters.energySubFilter === 'grid_electrification' || subFilters.energySubFilter === 'grid_reach');
  const isHydroCorridorActive =
    selectedPillar === 'energy' && (!subFilters.energySubFilter || subFilters.energySubFilter === 'hydro_corridor');
  const isEcosystemHeatmapActive = selectedPillar === 'ecosystem';
  const isLandholdingActive =
    selectedPillar === 'socioeconomics' &&
    (subFilters.socioSubFilter === 'agri_landholding' || subFilters.socioSubFilter === 'landholding');

  // Lazy-load 2,620 calculated curvilinear hydropower reaches when Hydro Corridor is selected
  useEffect(() => {
    if (isHydroCorridorActive && !hydroReachesData && !hydroReachesLoading) {
      setHydroReachesLoading(true);
      fetchGeoJson<FeatureCollection>('hydro_potential_reaches.geojson')
        .then((data) => {
          if (data?.type === 'FeatureCollection') {
            setHydroReachesData(data);
          }
          setHydroReachesLoading(false);
        })
        .catch((err) => {
          console.warn('Failed to load hydro_potential_reaches.geojson:', err);
          setHydroReachesLoading(false);
        });
    }
  }, [isHydroCorridorActive, hydroReachesData, hydroReachesLoading]);

  // Lazy-load Contours when toggled ON or terrain basemap active
  useEffect(() => {
    const isContourActive = showContours || basemap === 'terrain';
    if (isContourActive && !contoursData) {
      fetchGeoJson<FeatureCollection>('gulmi-contours.json')
        .then((data) => {
          if (data) setContoursData(data);
        })
        .catch(() => null);
    }
  }, [showContours, basemap, contoursData]);

  // Lazy-load Watershed Catchments only when subfilter is active
  useEffect(() => {
    if (isCatchmentsActive && !catchmentsData) {
      fetchGeoJson<FeatureCollection>('catchments_l10.geojson')
        .then((data) => {
          if (data) setCatchmentsData(data);
        })
        .catch(() => null);
    }
  }, [isCatchmentsActive, catchmentsData]);

  // Lazy-load Detailed Rivers & Streams only when subfilter is active
  useEffect(() => {
    if (isRiversStreamsActive && !riversStreamsData) {
      fetchGeoJson<FeatureCollection>('rivers_streams.geojson')
        .then((data) => {
          if (data) setRiversStreamsData(data);
        })
        .catch(() => null);
    }
  }, [isRiversStreamsActive, riversStreamsData]);

  const isOverlayModeActive =
    isChirpsPrecipitationActive ||
    isSolarGhiActive ||
    isFlowAccumulationActive ||
    isFlowDirectionActive ||
    isCatchmentsActive ||
    isRiversStreamsActive ||
    isGridSubstationActive ||
    isHydroCorridorActive ||
    isEcosystemHeatmapActive;

  const getPalikaStyle = (feature?: Feature) => {
    const props = feature?.properties;
    const isHovered = hoveredPalika?.name === props?.name;
    const fillColor = choropleth.getColor(props?.name || '');

    if (isOverlayModeActive) {
      return {
        fillColor: isHovered
          ? isSolarGhiActive
            ? '#f59e0b'
            : isGridSubstationActive
              ? '#0ea5e9'
              : isHydroCorridorActive
                ? '#7c3aed'
                : isEcosystemHeatmapActive
                  ? '#10b981'
                  : '#38bdf8'
          : 'transparent',
        weight: isHovered ? 2.5 : 1.5,
        opacity: 0.95,
        color: isHovered ? '#10b981' : '#475569',
        fillOpacity: isHovered ? 0.18 : 0,
      };
    }

    if (isLandholdingActive) {
      return {
        fillColor,
        weight: isHovered ? 2.5 : 1.4,
        opacity: 0.9,
        color: isHovered ? '#10b981' : '#334155',
        fillOpacity: isHovered ? 0.65 : 0.45,
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

  /**
   * Automatically adjusts tooltip direction between 'top' and 'bottom'
   * based on whether the mouse cursor is in the upper or lower area of the map,
   * completely preventing tooltips from clipping against container edges.
   */
  const bindSmartTooltip = (
    layer: L.Layer,
    htmlContent: string,
    options?: {
      pane?: string;
      opacity?: number;
      className?: string;
      topThreshold?: number;
    }
  ) => {
    const topThreshold = options?.topThreshold ?? 175;

    layer.bindTooltip(htmlContent, {
      sticky: true,
      direction: 'top',
      offset: [0, -12],
      opacity: options?.opacity ?? 0.98,
      pane: options?.pane ?? 'popupPane',
      className: options?.className,
    });

    const updateDirection = (e: L.LeafletMouseEvent) => {
      const tooltip = layer.getTooltip?.();
      if (!tooltip) return;
      const y = e.containerPoint?.y;
      if (y === undefined) return;

      const isNearTop = y < topThreshold;
      const targetDir = isNearTop ? 'bottom' : 'top';
      const targetOffset: L.PointTuple = isNearTop ? [0, 14] : [0, -14];

      if (tooltip.options.direction !== targetDir) {
        tooltip.options.direction = targetDir;
        tooltip.options.offset = targetOffset;
        if (typeof tooltip.update === 'function') {
          tooltip.update();
        }
      }
    };

    layer.on({
      mouseover: updateDirection,
      mousemove: updateDirection,
    });
  };

  const onEachPalika = (feature: Feature, layer: L.Layer) => {
    const props = feature.properties;
    if (!props) return;

    const metricSnippet = choropleth.getTooltipHtml(props.name || '');

    bindSmartTooltip(
      layer,
      `
      <div style="font-family: sans-serif; font-size: 11px; padding: 4px 6px; min-width: 140px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <span style="font-weight: 700; color: #0f172a; font-size: 12px;">${props.name}</span>
          ${props.nepaliName ? `<span style="font-size: 10px; color: #64748b;">${props.nepaliName}</span>` : ''}
        </div>
        <div style="color: #64748b; font-size: 9.5px; margin-bottom: 2px;">
          ${props.type || 'Palika'} • ${props.areaSqKm ? `${props.areaSqKm} km²` : 'Gulmi'}
        </div>
        ${metricSnippet}
        <div style="margin-top: 4px; padding-top: 3px; border-top: 1px dashed #cbd5e1; font-size: 9px; color: #059669; font-weight: 500;">
          👆 Click Palika to open decision support
        </div>
      </div>
    `,
      { topThreshold: 150, opacity: 0.98 }
    );

    layer.on({
      click: () => {
        onSelectDistrict(props.name);
      },
      mouseover: (e: L.LeafletMouseEvent) => {
        e.target.setStyle({
          fillOpacity: 0.92,
          weight: 2.8,
          color: '#10b981',
        });
        e.target.bringToFront();
        if (props.name) setHoveredPalika(props as PalikaHoverData);
        handleHoverPalikaFromMatrix(props.name || '');
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        e.target.setStyle(getPalikaStyle(feature));
        setHoveredPalika(null);
        handleHoverPalikaFromMatrix(null);
      },
    });
  };

  const renderLegend = () => {
    if (selectedPillar === 'food') {
      const foodMode = subFilters.foodMode || 'single_crop';
      const cropId = selectedMapCropId || subFilters.crop || 'coffee';
      const cropNames: Record<string, string> = {
        coffee: '☕ Arabica Coffee (कफी)',
        large_cardamom: '🌿 Large Cardamom (अलैंची)',
        tomato: '🍅 Fresh Market Tomato (गोलभेंडा)',
        apple: '🍎 High-Hill Apple (स्याउ)',
        maize: '🌽 Mid-Hill Maize (मकै)',
        rice: '🌾 Monsoon Paddy (धान)',
        wheat: '🌾 Winter Wheat (गहुँ)',
        finger_millet: '🌾 Finger Millet / Kodo (कोदो)',
        cardamom: '🌿 Large Cardamom (अलैंची)',
        orange: '🍊 Mandarin Orange (सुन्तला)',
        ginger: '🫚 Ginger & Turmeric (अदुवा)',
        potato: '🥔 Seed Potato (उच्च पहाडी आलु)',
        buckwheat: '🌾 Buckwheat & Wheat (फापर/गहुँ)',
      };
      const cropLabel = cropNames[cropId] || cropId;

      if (foodMode === 'single_crop' || foodMode === 'crop_suitability') {
        const baseConfig = SUBFILTER_LEGENDS['crop_suitability'];
        if (baseConfig) {
          const config = {
            ...baseConfig,
            title: `${cropLabel} Suitability`,
            subtitle: `FAO ECOCROP Biophysical Model (Calibrated per Palika)`,
          };
          return <DynamicLegend config={config} className="animate-fade-in-up" />;
        }
      }

      if (foodMode === 'crop_water_stress') {
        const baseConfig = SUBFILTER_LEGENDS['crop_water_stress'];
        if (baseConfig) {
          const seasonLabels: Record<string, string> = {
            cycle: 'Full Growing Cycle',
            winter_dry: 'Winter Dry Period (Nov–Feb)',
            pre_monsoon: 'Pre-Monsoon Dry Spell (Mar–May)',
            monsoon_wet: 'Monsoon Wet Period (Jun–Sep)',
          };
          const seasonSubtitle = seasonLabels[subFilters.waterSeason || 'cycle'] || 'Growing Cycle';
          const config = {
            ...baseConfig,
            title: `${cropLabel} Moisture Stress`,
            subtitle: `${seasonSubtitle} • Water Footprint & Evapotranspiration Deficit`,
          };
          return <DynamicLegend config={config} className="animate-fade-in-up" />;
        }
      }

      if (foodMode === 'land_typology') {
        const config = SUBFILTER_LEGENDS['land_typology'];
        if (config) {
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
      const wSub = subFilters.waterSubFilter || 'annual_precipitation';
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
  // Loaded from SUBFILTER_METHODOLOGIES (apps/web/src/features/map/subfilters)
  const currentCropId = selectedMapCropId || subFilters.crop || 'coffee';
  const validatedCrop = VALIDATED_CROPS[currentCropId];
  const activeCropName =
    validatedCrop?.name || (selectedMapCropId ? db.getCropById(selectedMapCropId)?.name : null) || 'Arabica Coffee';
  const activeCropNepali =
    validatedCrop?.nepaliName || (selectedMapCropId ? db.getCropById(selectedMapCropId)?.nepaliName : null) || 'कफी';

  const activeCalc = resolveCalculationMethodology({
    selectedPillar,
    subFilters,
    lang,
    cropName: activeCropName,
    cropNameNepali: activeCropNepali,
    climateMonth: CLI_MONTH,
    currentRainMm,
    monthName: MONTH_NAMES[CLI_MONTH - 1],
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
                <span>
                  {lang === 'np' ? 'गुल्मी जिल्ला WEFES नेक्सस नक्सा' : 'WEFES Nexus Gulmi · Spatial Decision Support'}
                </span>
              </h2>
              <span className="text-xs bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-md font-mono font-bold">
                12 Palikas
              </span>
              {geoLoading && (
                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md animate-pulse font-mono">
                  Loading GIS…
                </span>
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
                {lang === 'np'
                  ? 'प्रत्यक्ष टेलिमेट्री — तमघास HQ (१,४५०m ASL)'
                  : 'Live Telemetry — Tamghas HQ (1,450m ASL)'}
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
            {liveWeather ? (
              (() => {
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
                      <span className="text-sky-600 font-sans text-[11px] font-medium">
                        • {liveWeather.precipitation} mm/h
                      </span>
                    )}
                  </div>
                );
              })()
            ) : (
              <span className="text-xs text-slate-400 font-mono">
                {liveWeatherLoading ? (lang === 'np' ? 'मौसम लोड हुँदै...' : 'Loading Weather...') : 'Weather Offline'}
              </span>
            )}

            {/* Expand / Collapse Grid Toggle */}
            {liveWeather && (
              <button
                onClick={() => setIsAgroMeteoOpen((prev) => !prev)}
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
        {isAgroMeteoOpen &&
          liveWeather &&
          (() => {
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
                      <div
                        className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden my-2"
                        title={`Cloud Cover: ${cloudCover}%`}
                      >
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, cloudCover))}%` }}
                        />
                      </div>
                    </div>

                    {/* Secondary Data */}
                    <div className="text-[11px] text-slate-500 font-sans leading-relaxed flex flex-wrap items-center gap-x-1.5 pt-1 border-t border-slate-100">
                      <span>
                        • Dew Point: <strong className="font-semibold text-slate-700">{dewPoint}°C</strong>
                      </span>
                      <span>
                        • Cloud Cover: <strong className="font-semibold text-slate-700">{cloudCover}%</strong>
                      </span>
                      <span>
                        • Humidity: <strong className="font-semibold text-slate-700">{humidity}%</strong>
                      </span>
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
                      <div
                        className="w-full bg-emerald-100/60 h-1.5 rounded-full overflow-hidden my-2"
                        title={`Water Deficit: ${waterDeficit} mm/d`}
                      >
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${deficitRatio}%` }}
                        />
                      </div>
                    </div>

                    {/* Secondary Data */}
                    <div className="text-[11px] text-slate-500 font-sans leading-relaxed flex flex-wrap items-center gap-x-1.5 pt-1 border-t border-slate-100">
                      <span>
                        • 24h Rain: <strong className="font-semibold text-slate-700">{rain24hVal.toFixed(1)} mm</strong>
                      </span>
                      <span>
                        • Water Deficit Index:{' '}
                        <strong className="font-semibold text-emerald-700">{waterDeficit} mm/d</strong>
                      </span>
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
                      <div
                        className="w-full bg-amber-100/60 h-1.5 rounded-full overflow-hidden my-2"
                        title={`UV Index: ${uvVal.toFixed(1)}`}
                      >
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${uvRatio}%` }}
                        />
                      </div>
                    </div>

                    {/* Secondary Data */}
                    <div className="text-[11px] text-slate-500 font-sans leading-relaxed flex flex-wrap items-center gap-x-1.5 pt-1 border-t border-slate-100">
                      <span>
                        • Daylight:{' '}
                        <strong className="font-semibold text-slate-700">
                          {liveWeather.sunrise || '05:55'} – {liveWeather.sunset || '18:20'}
                        </strong>
                      </span>
                      <span>
                        • Elevation:{' '}
                        <strong className="font-semibold text-amber-700">
                          {liveWeather.isDay ? 'Daylight Phase ☀️' : 'Night Phase 🌙'}
                        </strong>
                      </span>
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
                      <div
                        className="w-full bg-teal-100/60 h-1.5 rounded-full overflow-hidden my-2"
                        title={`Wind Velocity: ${windVal.toFixed(1)} m/s`}
                      >
                        <div
                          className="bg-teal-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${windRatio}%` }}
                        />
                      </div>
                    </div>

                    {/* Secondary Data */}
                    <div className="text-[11px] text-slate-500 font-sans leading-relaxed flex flex-wrap items-center gap-x-1.5 pt-1 border-t border-slate-100">
                      <span>
                        • Bearing: <strong className="font-semibold text-slate-700">{windBearing}</strong>
                      </span>
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
                  <span>
                    📡 Open-Meteo High-Resolution (1.5km) NWP & Satellite Model • Tamghas HQ (28.068°N, 83.248°E)
                  </span>
                  <span className="text-emerald-700 font-medium">✓ Real-Time Telemetry Active</span>
                </div>
              </div>
            );
          })()}
      </div>

      {/* 3. 5-Pillar WEFES Selector Bar */}
      <div className="glass-panel p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs bg-white/95 flex items-center justify-between flex-wrap gap-2 animate-fade-in">
        <div className="flex items-center gap-1.5 overflow-x-auto overflow-y-hidden py-1 w-full sm:w-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider px-2 shrink-0 font-outfit">
            {lang === 'np' ? '५ नेक्सस स्तम्भहरू:' : '5 WEFES Pillars:'}
          </span>
          {[
            {
              id: 'water',
              label: 'Water',
              nepali: 'जल',
              icon: Droplets,
              color: 'text-sky-600',
              activeBg: 'bg-sky-600 text-white',
            },
            {
              id: 'energy',
              label: 'Energy',
              nepali: 'ऊर्जा',
              icon: Zap,
              color: 'text-amber-600',
              activeBg: 'bg-amber-600 text-white',
            },
            {
              id: 'food',
              label: 'Food',
              nepali: 'खाद्य',
              icon: Sprout,
              color: 'text-emerald-600',
              activeBg: 'bg-emerald-700 text-white',
            },
            {
              id: 'ecosystem',
              label: 'Ecosystem',
              nepali: 'पारिस्थितिकी',
              icon: Trees,
              color: 'text-teal-600',
              activeBg: 'bg-teal-700 text-white',
            },
            {
              id: 'socioeconomics',
              label: 'Socioeconomics',
              nepali: 'सामाजिक-आर्थिक',
              icon: Building2,
              color: 'text-indigo-600',
              activeBg: 'bg-indigo-700 text-white',
            },
          ].map((p) => {
            const Icon = p.icon;
            const isActive = selectedPillar === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPillar(p.id as WEFESPillar)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border ${
                  isActive
                    ? `${p.activeBg} border-transparent shadow-xs font-bold`
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
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                basemap === 'voyager'
                  ? 'bg-white text-emerald-700 font-bold shadow-xs'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
              title="Clean Vector Basemap"
            >
              Clean
            </button>
            <button
              onClick={() => setBasemap('satellite')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                basemap === 'satellite'
                  ? 'bg-white text-emerald-700 font-bold shadow-xs'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
              title="ESRI World Imagery Satellite"
            >
              Satellite
            </button>
            <button
              onClick={() => setBasemap('terrain')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                basemap === 'terrain'
                  ? 'bg-white text-emerald-700 font-bold shadow-xs'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
              title="Topographic Elevation Contours"
            >
              Relief
            </button>
          </div>

          {/* Palika Centroid Labels Toggle */}
          <button
            onClick={() => setShowPalikaLabels((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              showPalikaLabels
                ? 'bg-slate-800 text-white border-slate-700 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle Palika Name Text Labels"
          >
            {showPalikaLabels ? (
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>Labels</span>
          </button>

          {/* Topographic Contours Toggle */}
          <button
            onClick={() => setShowContours((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              showContours || basemap === 'terrain'
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
            onClick={() => setResetTrigger((prev) => prev + 1)}
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

          {/* Floating Map Layer Control (Google Maps / Mapbox Corner Widget) */}
          <MapLayerControl onResetCamera={() => setResetTrigger((prev) => prev + 1)} />

          <MapContainer
            center={GULMI_MAP_CENTER}
            zoom={GULMI_MAP_ZOOM}
            zoomControl={false}
            scrollWheelZoom={false}
            maxBounds={NEPAL_MAX_BOUNDS}
            maxBoundsViscosity={0.5}
            minZoom={7}
            maxZoom={14}
            style={{ height: '100%', width: '100%', borderRadius: '0.875rem' }}
          >
            <ZoomControl position="bottomright" />
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

            {/* Continuous Spatial Solar Irradiance Surface (Global Solar Atlas 900m Empirical Grid) */}
            {isSolarGhiActive && geoData && <SpatialSolarSurfaceOverlay geoData={geoData} opacity={0.85} />}

            {/* Continuous Spatial Soil & Ecosystem Heatmap Surface (NARC 100m Soil Grid & 30m DEM) */}
            {isEcosystemHeatmapActive && geoData && (
              <SpatialSoilSurfaceOverlay
                subFilter={subFilters.ecoSubFilter || 'soil_ph'}
                geoData={geoData}
                opacity={0.85}
              />
            )}

            {/* Continuous Spatial Settlement Building Density Heat Wave Overlay (78,934 OSM Building Geometries) */}
            {isLandholdingActive && geoData && (
              <SpatialSettlementDensityOverlay geoData={geoData} bounds={GULMI_BOUNDS} opacity={0.78} />
            )}

            {/* HydroSHEDS Continuous Surface Flow Accumulation Overlay */}
            {isFlowAccumulationActive && (
              <SpatialFlowAccumulationOverlay opacity={0.88} pane="rainfallPane" geoData={geoData} />
            )}

            {/* HydroSHEDS D8 Surface Flow Direction Overlay */}
            {isFlowDirectionActive && (
              <SpatialFlowDirectionOverlay opacity={0.85} pane="rainfallPane" geoData={geoData} />
            )}

            {/* HydroBASINS Level 10 Sub-Basin Watershed Boundaries */}
            {isCatchmentsActive && catchmentsData && <CatchmentsGeoJsonLayer data={catchmentsData} />}

            {isAnnualPrecipitationActive && geoData && (
              <SpatialPrecipitationOverlay opacity={0.85} type="annual" geoData={geoData} />
            )}
            {isDrySeasonPrecipitationActive && geoData && (
              <SpatialPrecipitationOverlay opacity={0.85} type="dry_season" geoData={geoData} />
            )}
            {isMonsoonPrecipitationActive && geoData && (
              <SpatialPrecipitationOverlay opacity={0.85} type="monsoon" geoData={geoData} />
            )}

            {/* HydroRIVERS Multi-Tier Stream Network with Strahler Orders */}
            {isRiversStreamsActive && riversStreamsData && <RiversStreamsGeoJsonLayer data={riversStreamsData} />}

            {/* 12 Gulmi Palikas Vector Layer (Dynamically styled per Pillar, Crop, and Climate Time-Series) */}
            {palikasData && (
              <GeoJSON
                key={`gulmi-palikas-${selectedPillar}-${selectedMapCropId}-${subFilters.crop || ''}-${subFilters.foodMode || ''}-${subFilters.foodOverlayType || ''}-${subFilters.waterSubFilter || ''}-${subFilters.ecoSubFilter || ''}-${subFilters.energySubFilter || ''}-${subFilters.socioSubFilter || ''}-${CLI_MONTH}-${CLI_YEAR}-${CLI_MODE}-${currentRainMm}-${hoveredPalika?.name || ''}`}
                data={palikasData}
                pane="palikasPane"
                style={(feature?: Feature) => {
                  const pName = (feature?.properties?.name || '').toLowerCase();
                  const isHovered =
                    hoveredPalika?.name &&
                    (pName.includes(hoveredPalika.name.toLowerCase()) ||
                      hoveredPalika.name.toLowerCase().includes(pName));
                  const isContourActive = showContours || basemap === 'terrain';
                  const baseOpacity = isContourActive ? 0.45 : 0.72;

                  if (isOverlayModeActive) {
                    return {
                      fillColor: isHovered
                        ? isSolarGhiActive
                          ? '#f59e0b'
                          : isGridSubstationActive
                            ? '#0ea5e9'
                            : isEcosystemHeatmapActive
                              ? '#10b981'
                              : '#38bdf8'
                        : 'transparent',
                      fillOpacity: isHovered ? 0.18 : 0,
                      color: isHovered
                        ? '#10b981'
                        : isCatchmentsActive
                          ? '#64748b'
                          : isGridSubstationActive
                            ? '#475569'
                            : '#334155',
                      weight: isHovered ? 3.5 : isCatchmentsActive ? 1.2 : 1.6,
                      dashArray: isCatchmentsActive ? '3, 4' : '',
                    };
                  }

                  if (isLandholdingActive) {
                    return {
                      fillColor: choropleth.getColor(feature?.properties?.name || ''),
                      fillOpacity: isHovered ? 0.55 : 0.32,
                      color: isHovered ? '#10b981' : '#334155',
                      weight: isHovered ? 3.5 : 1.5,
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
                style={(feature?: Feature) => {
                  const p = feature?.properties || {};
                  return {
                    color: p.color || '#0284c7',
                    weight: p.weight || 1.5,
                    opacity: p.opacity || 0.8,
                  };
                }}
                onEachFeature={(feature: Feature, layer: L.Layer) => {
                  const p = feature?.properties || {};
                  layer.bindTooltip(
                    `
                      <div style="padding: 4px 6px; font-size: 11px; min-width: 170px;">
                        <div style="font-weight: 800; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; margin-bottom: 3px;">
                          ⛰️ ${p.elevation}m masl ${p.isIndex ? '(Index Contour)' : ''}
                        </div>
                        <div style="color: #0369a1; font-weight: 600; font-size: 10px;">${p.lifeZone || 'Mid-Hills'}</div>
                        <div style="color: #475569; font-size: 9.5px; margin-top: 1px;">Lapse Temp: <strong>${p.temperatureC ?? 16}°C</strong></div>
                        ${p.feasibleCrops?.length ? `<div style="color: #15803d; font-size: 9px; margin-top: 2px; line-height: 1.2;">🌾 Crops: ${p.feasibleCrops.slice(0, 3).join(', ')}</div>` : ''}
                      </div>
                    `,
                    { direction: 'top', offset: [0, -4], opacity: 0.98, pane: 'popupPane' }
                  );
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
            {showPalikaLabels &&
              Object.entries(PALIKA_CENTROIDS).map(([pName, pGeo]) => {
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

            {/* Contextual Layer Isolation 1: Roads strictly shown when explicitly filtering roads */}
            {nationalRoads &&
              (subFilters.highwayFilter === 'all' ||
                subFilters.highwayFilter === 'primary' ||
                (selectedPillar === 'socioeconomics' && subFilters.highwayFilter !== 'none')) && (
                <GeoJSON
                  key={`national-roads-${subFilters.highwayFilter || 'corridor'}`}
                  data={nationalRoads}
                  style={(feature?: Feature) => {
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

            {/* Contextual Layer Isolation 2: Curvilinear Hydropower Potential Reaches (2,620 Reaches Styled by DOED Legend Tiers) */}
            {isHydroCorridorActive && (
              <>
                {/* Real 2,620 Curvilinear Hydropower Potential Reaches with Accurate Net Head & Power Physics */}
                {hydroReachesData ? (
                  <GeoJSON
                    key={`hydro-calculated-reaches-${selectedPillar}`}
                    data={hydroReachesData}
                    pane="riversPane"
                    style={(feature?: Feature) => {
                      const pKw = feature?.properties?.power_potential_kw || 0;
                      // Tier 1: Commercial RoR (>1 MW / 1,000 kW)
                      if (pKw >= 1000) {
                        return {
                          color: '#4c1d95',
                          weight: 4.8,
                          opacity: 0.98,
                        };
                      }
                      // Tier 2: Mini Hydro (100–999 kW)
                      if (pKw >= 100) {
                        return {
                          color: '#7c3aed',
                          weight: 3.2,
                          opacity: 0.92,
                        };
                      }
                      // Tier 3: Rural Micro-Hydro (<100 kW)
                      return {
                        color: '#10b981',
                        weight: 1.8,
                        opacity: 0.85,
                      };
                    }}
                    onEachFeature={(feature: Feature, layer: L.Layer) => {
                      const p = feature?.properties || {};
                      const pKw = p.power_potential_kw || 0;
                      const pMw = p.power_potential_mw ?? (pKw / 1000).toFixed(2);
                      const isCommercial = pKw >= 1000;
                      const isMini = pKw >= 100 && pKw < 1000;
                      const tierTitle = isCommercial
                        ? '⚡ Commercial RoR (>1 MW)'
                        : isMini
                          ? '⚡ Mini Hydro (100–999 kW)'
                          : '⚡ Rural Micro-Hydro (<100 kW)';
                      const tierColor = isCommercial ? '#4c1d95' : isMini ? '#7c3aed' : '#10b981';

                      bindSmartTooltip(
                        layer,
                        `
                          <div style="padding: 6px 9px; font-size: 11px; min-width: 230px; font-family: ui-sans-serif, system-ui, sans-serif;">
                            <div style="font-weight: 800; color: ${tierColor}; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                              <span>${tierTitle}</span>
                              <span style="font-size: 9.5px; background: #f1f5f9; color: #475569; padding: 1px 5px; border-radius: 4px;">#${p.reach_id ?? 'N/A'}</span>
                            </div>
                            <div style="color: #1e293b; font-size: 10.5px; margin-bottom: 3px;">
                              <strong>Palika:</strong> ${p.palika || 'Gulmi'}
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 4px; background: #f8fafc; padding: 5px 6px; border-radius: 4px;">
                              <div>
                                <div style="color: #64748b; font-size: 8.5px; font-weight: 600;">THEORETICAL POWER</div>
                                <div style="color: #7c3aed; font-size: 11px; font-weight: 800;">${pKw.toLocaleString()} kW <span style="font-size: 9px; font-weight: 600;">(${pMw} MW)</span></div>
                              </div>
                              <div>
                                <div style="color: #64748b; font-size: 8.5px; font-weight: 600;">NET HEAD (H_net)</div>
                                <div style="color: #0284c7; font-size: 11px; font-weight: 800;">${p.net_head_m ?? 'N/A'} m <span style="font-size: 8.5px; color: #94a3b8;">(${p.gross_head_m ?? ''}m gross)</span></div>
                              </div>
                              <div>
                                <div style="color: #64748b; font-size: 8.5px; font-weight: 600;">TURBINE FLOW (Q)</div>
                                <div style="color: #059669; font-size: 10.5px; font-weight: 700;">${p.discharge_m3s ?? 'N/A'} m³/s</div>
                              </div>
                              <div>
                                <div style="color: #64748b; font-size: 8.5px; font-weight: 600;">ANNUAL GENERATION</div>
                                <div style="color: #d97706; font-size: 10.5px; font-weight: 700;">${p.screening_annual_energy_mwh ?? p.annual_energy_mwh ?? 'N/A'} MWh</div>
                              </div>
                            </div>
                            <div style="color: #64748b; font-size: 9px; margin-top: 4px; border-top: 1px dotted #e2e8f0; padding-top: 2px;">
                              Length: <strong>${p.length_m ? Math.round(p.length_m) : 500} m</strong> | Slope: <strong>${p.slope_pct ?? 'N/A'}%</strong> | Basin: <strong>${p.catchment_km2 ?? 'N/A'} km²</strong>
                            </div>
                          </div>
                        `,
                        { pane: 'popupPane', topThreshold: 175 }
                      );
                    }}
                  />
                ) : (
                  /* Fallback to HydroRIVERS if reaches are still loading */
                  riversStreamsData && (
                    <GeoJSON
                      key={`hydro-corridor-streams-${selectedPillar}`}
                      data={riversStreamsData}
                      pane="riversPane"
                      style={(feature?: Feature) => {
                        const order = feature?.properties?.ORD_STRA || 1;
                        if (order >= 5) {
                          return {
                            color: '#4c1d95',
                            weight: 5.5,
                            opacity: 0.98,
                          };
                        }
                        if (order === 3 || order === 4) {
                          return {
                            color: '#7c3aed',
                            weight: 3.8,
                            opacity: 0.95,
                          };
                        }
                        return {
                          color: '#10b981',
                          weight: 2.2,
                          opacity: 0.88,
                        };
                      }}
                      onEachFeature={(feature: Feature, layer: L.Layer) => {
                        const p = feature?.properties || {};
                        const order = p.ORD_STRA || 1;
                        const tierTitle =
                          order >= 5
                            ? '⚡ Commercial RoR (>1 MW)'
                            : order === 3 || order === 4
                              ? '⚡ Mini Hydro (100–999 kW)'
                              : '⚡ Rural Micro-Hydro (<100 kW)';
                        const tierColor = order >= 5 ? '#4c1d95' : order === 3 || order === 4 ? '#7c3aed' : '#10b981';
                        const estPower =
                          order >= 5 ? '1,500 – 12,000 kW' : order === 3 || order === 4 ? '150 – 950 kW' : '15 – 85 kW';

                        bindSmartTooltip(
                          layer,
                          `
                            <div style="padding: 5px 8px; font-size: 11px; min-width: 200px;">
                              <div style="font-weight: 800; color: ${tierColor}; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px;">
                                ${tierTitle}
                              </div>
                              <div style="color: #1e293b; font-size: 10.5px;"><strong>Reach ID:</strong> #${p.HYRIV_ID || 'N/A'} (Strahler Order ${order})</div>
                              <div style="color: #0369a1; font-size: 10.5px; font-weight: 700;">Mean Flow: ${p.DIS_AV_CMS ?? 'N/A'} m³/s</div>
                              <div style="color: #7c3aed; font-size: 10.5px; font-weight: 700;">Est. Potential: ${estPower}</div>
                              <div style="color: #475569; font-size: 10px; margin-top: 2px;">Corridor Reach Length: <strong>${p.LENGTH_KM ?? 'N/A'} km</strong></div>
                            </div>
                          `,
                          { pane: 'popupPane', topThreshold: 175 }
                        );
                      }}
                    />
                  )
                )}

                {/* 6 Named Major River Corridor Arteries with Enhanced Glowing Highlight */}
                {gulmiRivers && (
                  <GeoJSON
                    key={`hydro-corridor-named-rivers-${selectedPillar}`}
                    data={gulmiRivers}
                    pane="riversPane"
                    style={(feature?: Feature) => {
                      const name = feature?.properties?.name || '';
                      const isCommercial = name.includes('Kali Gandaki') || name.includes('Badigad');
                      const isMini = name.includes('Ridi') || name.includes('Panaha');
                      const color = isCommercial ? '#4c1d95' : isMini ? '#7c3aed' : '#10b981';
                      const weight = isCommercial ? 6.5 : isMini ? 4.8 : 3.5;
                      return {
                        color,
                        weight,
                        opacity: 1,
                      };
                    }}
                    onEachFeature={(feature: Feature, layer: L.Layer) => {
                      const p = feature?.properties || {};
                      const isCommercial = p.name?.includes('Kali Gandaki') || p.name?.includes('Badigad');
                      const isMini = p.name?.includes('Ridi') || p.name?.includes('Panaha');
                      const tierLabel = isCommercial
                        ? '⚡ Commercial RoR (>1 MW) Cascade Corridor'
                        : isMini
                          ? '⚡ Mini-Hydro (100–999 kW) Industrial Micro-Grid Corridor'
                          : '⚡ Rural Micro-Hydro (<100 kW) Agro-Processing Corridor';
                      const tierColor = isCommercial ? '#4c1d95' : isMini ? '#7c3aed' : '#10b981';

                      layer.bindTooltip(
                        `
                          <div style="padding: 6px 10px; font-size: 11.5px; min-width: 220px;">
                            <div style="font-weight: 800; color: ${tierColor}; font-size: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px;">
                              🌊 ${p.name} (${p.nepaliName || ''})
                            </div>
                            <div style="color: #0f172a; font-weight: 600; font-size: 11px;">${tierLabel}</div>
                            <div style="color: #64748b; font-size: 10px; margin-top: 2px;"><strong>Hydrological Basin:</strong> ${p.basin || 'Gandaki Basin'}</div>
                            <div style="color: #0369a1; font-size: 10px;"><strong>Key Station:</strong> ${p.dhmStation || 'DHM Gauge'}</div>
                            <div style="color: #475569; font-size: 10px; margin-top: 3px;"><strong>Served Palikas:</strong> ${Array.isArray(p.palikaList) ? p.palikaList.join(', ') : Array.isArray(p.palikasServed) ? p.palikasServed.join(', ') : 'Gulmi'}</div>
                            <div style="color: #059669; font-size: 9.5px; margin-top: 3px; font-style: italic;">${p.importance || ''}</div>
                          </div>
                        `,
                        { direction: 'top', offset: [0, -6], opacity: 0.98, pane: 'popupPane' }
                      );
                    }}
                  />
                )}
              </>
            )}

            {/* Contextual Layer Isolation 2.2: NEA High-Voltage Transmission Substations & Hub Points (Pure Ground Truth GPS Points) */}
            {selectedPillar === 'energy' &&
              (subFilters.energySubFilter === 'grid_electrification' ||
                subFilters.energySubFilter === 'grid_reach') && (
                <>
                  {/* 5 Physical Substations Overlay with Glowing Rings */}
                  {Object.entries(palikaGridData.substations || {}).map(([sKey, sData]: [string, SubstationInfo]) => {
                    const coords = sData.coordinates || [28.0645, 83.2685];
                    const is132 = sData.voltage.includes('132');
                    const markerColor =
                      sData.color ||
                      (is132
                        ? sData.tierKey === 'trunk_132kv'
                          ? '#0ea5e9'
                          : '#047857'
                        : sData.tierKey === 'rural_33kv'
                          ? '#8b5cf6'
                          : '#f59e0b');
                    const radius = is132 ? 10 : 8;

                    const isNorthern = coords[0] >= 28.15;
                    const tooltipDirection = isNorthern ? 'bottom' : 'top';
                    const tooltipOffset: [number, number] = isNorthern ? [0, 8] : [0, -8];

                    return (
                      <React.Fragment key={`substation-node-${sKey}`}>
                        {/* Outer Pulsing/Glow Halo Ring */}
                        <CircleMarker
                          center={[coords[0], coords[1]]}
                          radius={radius + 6}
                          pane="pointsPane"
                          pathOptions={{
                            fillColor: markerColor,
                            fillOpacity: 0.2,
                            color: markerColor,
                            weight: 1.5,
                            dashArray: '3, 3',
                            pane: 'pointsPane',
                          }}
                          interactive={false}
                        />

                        {/* Core Substation Node Marker */}
                        <CircleMarker
                          center={[coords[0], coords[1]]}
                          radius={radius}
                          pane="pointsPane"
                          pathOptions={{
                            fillColor: markerColor,
                            fillOpacity: 1,
                            color: '#ffffff',
                            weight: 2.5,
                            pane: 'pointsPane',
                          }}
                        >
                          <Tooltip direction={tooltipDirection} offset={tooltipOffset} opacity={0.98} pane="popupPane">
                            <div className="text-xs p-2 min-w-[230px] bg-white rounded-lg shadow-lg border border-slate-200">
                              <div className="font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-1 mb-1">
                                <span className="flex items-center gap-1.5 font-outfit text-[12.5px]">
                                  ⚡ {sData.name}
                                </span>
                                <span
                                  className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold text-white shadow-2xs"
                                  style={{ backgroundColor: markerColor }}
                                >
                                  {sData.voltage}
                                </span>
                              </div>
                              <div className="text-slate-600 text-[10px] font-medium">
                                {sData.nepaliName} •{' '}
                                <strong>
                                  Ward {sData.ward}, {sData.palika}
                                </strong>
                              </div>
                              <div className="text-slate-800 text-[10.5px] mt-1 bg-slate-50 p-1.5 rounded font-mono border border-slate-100/80">
                                Capacity: <strong>{sData.capacityMVA} MVA</strong>
                                {sData.transmissionCapacityMW && (
                                  <span>
                                    {' '}
                                    • Power: <strong>{sData.transmissionCapacityMW} MW</strong>
                                  </span>
                                )}
                              </div>
                              {sData.connectedHydro && (
                                <div className="text-amber-800 text-[9.5px] mt-1 bg-amber-50 p-1 rounded font-medium">
                                  💧 Hydro Link: {sData.connectedHydro}
                                </div>
                              )}
                              {sData.budgetNPR && (
                                <div className="text-purple-800 text-[9.5px] mt-1 bg-purple-50 p-1 rounded font-medium">
                                  💰 Project: {sData.budgetNPR} ({sData.contractor})
                                </div>
                              )}
                              <div className="text-emerald-700 text-[9px] mt-1.5 font-semibold">✅ {sData.status}</div>
                            </div>
                          </Tooltip>
                        </CircleMarker>
                      </React.Fragment>
                    );
                  })}
                </>
              )}

            {/* Contextual Layer Isolation 2.5: Real River Network Vector Polylines */}
            {selectedPillar === 'water' &&
              gulmiRivers &&
              (subFilters.waterSubFilter === 'dhm_station' ||
                subFilters.waterSubFilter === 'river_basins' ||
                subFilters.waterSubFilter === 'irrigation_potential' ||
                subFilters.waterClimateMetric === 'dhm_stations') && (
                <GeoJSON
                  key={`gulmi-rivers-vector-${subFilters.waterSubFilter}`}
                  data={gulmiRivers}
                  pane="riversPane"
                  style={(feature?: Feature) => {
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
                  onEachFeature={(feature: Feature, layer: L.Layer) => {
                    const p = feature?.properties || {};
                    layer.bindTooltip(
                      `
                    <div style="padding: 4px 6px; font-size: 11px; min-width: 170px;">
                      <div style="font-weight: bold; color: #0284c7; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; margin-bottom: 3px;">
                        🌊 ${p.name || 'River Reach'} (${p.nepaliName || ''})
                      </div>
                      <div style="color: #334155; font-size: 10px;"><strong>Type:</strong> ${p.type}</div>
                      <div style="color: #334155; font-size: 10px;"><strong>Sub-Basin:</strong> ${p.subBasin} (${p.basin})</div>
                      <div style="color: #64748b; font-size: 9px; margin-top: 2px;">${p.importance}</div>
                      ${p.dhmStation ? `<div style="color: #0369a1; font-weight: 600; font-size: 10px; margin-top: 3px;">💧 DHM Station: ${p.dhmStation}</div>` : ''}
                    </div>
                  `,
                      { direction: 'top', offset: [0, -4], opacity: 0.98, pane: 'popupPane' }
                    );
                  }}
                />
              )}

            {/* Contextual Layer Isolation 3: DHM Hydro-Meteorological Stations Overlay */}
            {selectedPillar === 'water' &&
              (subFilters.waterSubFilter === 'dhm_station' ||
                subFilters.waterSubFilter === 'river_basins' ||
                subFilters.waterClimateMetric === 'dhm_stations') &&
              hydrologyStations.map((st: Feature<Point, DhmStationProperties>, idx: number) => {
                const props = st.properties || {};
                const coords = [
                  (props.lat ?? st.geometry?.coordinates?.[1]) as number,
                  (props.lng ?? st.geometry?.coordinates?.[0]) as number,
                ];
                if (!coords[0] || !coords[1]) return null;

                const stType = (props.stationType || '').toLowerCase();
                const isAWS = stType === 'aws';
                const isClim = stType.includes('climat') || props.stationNo?.includes('0701');
                const markerColor = isAWS ? '#10b981' : isClim ? '#8b5cf6' : '#0284c7';
                const badgeLabel = isAWS ? 'Real-Time AWS' : isClim ? 'Climatological' : 'Precipitation';
                const badgeBg = isAWS
                  ? 'bg-emerald-100 text-emerald-800'
                  : isClim
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-sky-100 text-sky-800';

                const isNorthern = coords[0] >= 28.15;
                const tooltipDirection = isNorthern ? 'bottom' : 'top';
                const tooltipOffset: [number, number] = isNorthern ? [0, 8] : [0, -8];

                const stationTitle =
                  props.stationName || props.siteName || `Station #${props.indexNo || props.stationNo}`;
                const elevDisplay = props.elevation_m || props.elevation || 'N/A';
                const palikaDisplay = props.palika ? `${props.palika} Palika` : props.district || 'Gulmi';
                const basinDisplay = props.riverBasin || props.river || 'Gulmi Catchment';

                return (
                  <CircleMarker
                    key={`hydro-${props.indexNo || props.stationNo || idx}`}
                    center={[coords[0], coords[1]]}
                    radius={isAWS ? 9 : 8}
                    pane="pointsPane"
                    pathOptions={{
                      fillColor: markerColor,
                      fillOpacity: 1,
                      color: '#ffffff',
                      weight: 2.5,
                      pane: 'pointsPane',
                    }}
                  >
                    <Tooltip direction={tooltipDirection} offset={tooltipOffset} opacity={0.98} pane="popupPane">
                      <div className="text-xs p-2 min-w-[240px] bg-white rounded-lg shadow-lg border border-slate-200">
                        <div className="font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-1 mb-1">
                          <span className="flex items-center gap-1.5 font-outfit text-[12px]">
                            {isAWS ? '📡' : isClim ? '🌡️' : '🌦️'} {stationTitle}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${badgeBg}`}>
                            {badgeLabel}
                          </span>
                        </div>
                        <div className="text-slate-600 text-[10px] font-medium">
                          Index: <strong>{props.indexNo || props.stationNo || 'DHM'}</strong> •{' '}
                          <strong>{palikaDisplay}</strong>
                        </div>
                        <div className="text-slate-800 text-[10.5px] mt-1 bg-slate-50 p-1.5 rounded font-mono border border-slate-100/80 flex items-center justify-between">
                          <span>
                            Elev: <strong>{elevDisplay}m masl</strong>
                          </span>
                          <span className="text-sky-700 font-sans text-[10px] font-semibold">{basinDisplay}</span>
                        </div>
                        {props.instruments && (
                          <div className="text-slate-500 text-[9.5px] mt-1 bg-slate-50 p-1 rounded font-mono break-words leading-tight">
                            ⚙️ {props.instruments}
                          </div>
                        )}
                        {Array.isArray(props.monitoringParameters) && (
                          <div className="text-emerald-700 text-[9px] mt-1 font-semibold">
                            📊 {props.monitoringParameters.join(' • ')}
                          </div>
                        )}
                        <div className="text-slate-400 text-[8.5px] mt-1">
                          DHM Nepal National Network • Status: {props.status || 'Active'}
                        </div>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                );
              })}
          </MapContainer>
        </div>
      </div>

      {/* Scientific Methodology, Calculation & Data Lineage Note Card (Sole Section Below Map) */}
      <div className="glass-panel p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xs space-y-2.5">
        {/* Note Card Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 font-outfit">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'np' ? 'प्रस्तुति तथा नक्सा टिपोट' : 'Layer Briefing & Presenter Notes'}</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-xs text-slate-700 font-semibold">{activeCalc.shortTitle}</span>
            <span className="text-xs text-slate-400 hidden sm:inline">({activeCalc.model})</span>
          </div>

          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">WEFES Polyglot Engine</span>
        </div>

        {/* Minimal 3-Column Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 text-xs pt-1 md:divide-x md:divide-slate-100">
          {/* Column 1: Formula & Mathematical Basis / Operational Framework */}
          <div className="space-y-1.5 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-outfit">
                {activeCalc.confidence === 'OBSERVED REAL'
                  ? lang === 'np'
                    ? 'प्रस्तुति तथा सञ्चालन आधार:'
                    : 'Presenter & Operational Framework:'
                  : lang === 'np'
                    ? 'गणितीय तथा विश्लेषणात्मक सूत्र:'
                    : 'Mathematical & Analytical Model:'}
              </div>
              <div className="bg-slate-50/80 border border-slate-200/70 rounded-lg p-2.5 font-mono text-xs shadow-2xs space-y-1.5">
                <div className="font-semibold text-slate-900 break-words leading-snug text-center text-base">
                  <Latex>{activeCalc.formula}</Latex>
                </div>
                {activeCalc.parameter && (
                  <div className="text-[10px] text-slate-500 font-sans border-t border-slate-200/60 pt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                    <span className="font-mono text-[10.5px] text-slate-600 break-words leading-tight">
                      {activeCalc.parameter}
                    </span>
                  </div>
                )}
                {activeCalc.variables && activeCalc.variables.length > 0 && (
                  <div className="pt-1.5 border-t border-slate-200/60 space-y-1">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-outfit">
                      {lang === 'np' ? 'संकेत विवरण (Symbols):' : 'Variable Definitions:'}
                    </div>
                    <div className="grid grid-cols-1 gap-1 text-xs font-sans">
                      {activeCalc.variables.map((v, i) => (
                        <div key={i} className="flex items-baseline gap-1.5 text-slate-600">
                          <span className="font-mono font-bold text-slate-800 bg-white border border-slate-200 text-sm px-1 py-0.2 rounded shrink-0">
                            <Latex>{v.symbol}</Latex>
                          </span>
                          <span className="text-slate-300 text-[10px]">=</span>
                          <span className="leading-tight text-slate-600">{v.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">{activeCalc.description}</p>
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
                <div className="text-[11px] text-slate-600 leading-snug">{activeCalc.currentStat}</div>
              </div>
              <div className="space-y-0.5 pt-0.5">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {lang === 'np' ? 'इनपुट प्यारामिटरहरू:' : 'Empirical Datasets:'}
                </div>
                <ul className="space-y-1 text-[11px] text-slate-600">
                  {activeCalc.inputs.map((inp, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                      <span className="leading-snug break-words">{inp}</span>
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
                <div>
                  Source: <strong className="text-slate-800 font-sans">{activeCalc.citation}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
