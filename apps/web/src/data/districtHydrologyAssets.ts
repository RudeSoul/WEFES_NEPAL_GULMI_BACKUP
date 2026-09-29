// [DATA PROVENANCE]
// Data Source: data/real/hydrology/gulmi_hydrology_assets.json, data/real/hydrology/gulmi_dhm_stations.geojson
// Classification: OBSERVED REAL (DHM National River Network & Kali Gandaki / Badigad Sub-Catchments)
// Citations: Department of Hydrology and Meteorology (DHM), Government of Nepal

import rawHydro from '../../../../data/real/hydrology/gulmi_hydrology_assets.json';
import rawDhmStations from '../../public/geojson/gulmi-dhm-stations.json';

export interface DetailedGlacialLake {
  name: string;
  district: string;
  altitude: number;
  areaSqM: number;
  areaHa: number;
  depthM: number;
  volumeMcm: number;
  hazardLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
  basin: string;
  lat: number;
  lng: number;
}

export interface LakeAltitudeDistribution {
  totalLakes: number;
  lowlandUnder100m: number;
  foothill100to499m: number;
  midHill500to1999m: number;
  montane2000to2999m: number;
  alpine3000to4999m: number;
  highNivalAbove5000m: number;
}

export interface DHMRiverStation {
  stationNo: string;
  river: string;
  siteName: string;
  lat: number;
  lng: number;
  elevation: number;
  instruments: string;
  startDate: string;
}

export const DANGEROUS_GLACIAL_LAKES_BY_DISTRICT: Record<string, DetailedGlacialLake[]> =
  rawHydro.dangerousGlacialLakesByDistrict as Record<string, DetailedGlacialLake[]>;

export const LAKE_ALTITUDE_DISTRIBUTION_BY_DISTRICT: Record<string, LakeAltitudeDistribution> =
  rawHydro.lakeAltitudeDistributionByDistrict as Record<string, LakeAltitudeDistribution>;

export const DHM_RIVER_STATIONS_BY_DISTRICT: Record<string, DHMRiverStation[]> =
  rawHydro.dhmRiverStationsByDistrict as Record<string, DHMRiverStation[]>;

export interface PalikaDhmStationInfo {
  station: string;
  type: string;
  elev: number;
  color: string;
}

export const DHM_PALIKA_STATIONS_MAP: Record<string, PalikaDhmStationInfo> = (
  (rawDhmStations as any).features || []
).reduce((acc: Record<string, PalikaDhmStationInfo>, f: any) => {
  const p = f.properties || {};
  const palikaKey = (p.palika || '').toLowerCase().replace(/[^a-z]/g, '');
  if (palikaKey) {
    const isAws = p.stationType === 'AWS' || (p.monitoringParameters || []).includes('Solar Radiation');
    const isClim = p.stationType === 'Climatology' || p.stationType === 'Climatology/Rain';
    acc[palikaKey] = {
      station: `${p.stationName} (#${p.indexNo} ${p.stationType})`,
      type: p.stationType,
      elev: p.elevation_m || 0,
      color: isAws ? '#10b981' : isClim ? '#8b5cf6' : '#0284c7',
    };
  }
  return acc;
}, {});

