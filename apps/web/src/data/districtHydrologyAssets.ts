// [DATA PROVENANCE]
// Data Source: data/real/hydrology/gulmi_hydrology_assets.json, data/real/hydrology/gulmi_dhm_stations.geojson
// Classification: OBSERVED REAL (DHM National River Network & Kali Gandaki / Badigad Sub-Catchments)
// Citations: Department of Hydrology and Meteorology (DHM), Government of Nepal

import rawHydro from '@data/real/hydrology/gulmi_hydrology_assets.json';

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

export const DHM_RIVER_STATIONS_BY_DISTRICT: Record<string, DHMRiverStation[]> =
  rawHydro.dhmRiverStationsByDistrict as Record<string, DHMRiverStation[]>;

