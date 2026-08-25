// ─── GULMI HYDROLOGY, LAKES & RIVER GAUGES DATASET ───
// Verified from DHM National River Network & Kali Gandaki / Badigad Sub-Catchments.

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

// Gulmi is a Mid-Hill district with zero dangerous high-altitude glacial lakes
export const DANGEROUS_GLACIAL_LAKES_BY_DISTRICT: Record<string, DetailedGlacialLake[]> = {
  gulmi: [],
  palpa: [],
  rupandehi: [],
  arghakhanchi: [],
};

export const LAKE_ALTITUDE_DISTRIBUTION_BY_DISTRICT: Record<string, LakeAltitudeDistribution> = {
  gulmi: {
    totalLakes: 11,
    lowlandUnder100m: 0,
    foothill100to499m: 0,
    midHill500to1999m: 7,
    montane2000to2999m: 4,
    alpine3000to4999m: 0,
    highNivalAbove5000m: 0,
  },
  palpa: {
    totalLakes: 12,
    lowlandUnder100m: 0,
    foothill100to499m: 0,
    midHill500to1999m: 12,
    montane2000to2999m: 0,
    alpine3000to4999m: 0,
    highNivalAbove5000m: 0,
  },
};

export const DHM_RIVER_STATIONS_BY_DISTRICT: Record<string, DHMRiverStation[]> = {
  gulmi: [
    {
      stationNo: '410',
      river: 'Kali Gandaki',
      siteName: 'Seti Beni / Ruru Confluence',
      lat: 28.0167,
      lng: 83.5833,
      elevation: 546,
      instruments: 'Cable Way & Automated Logger',
      startDate: '1964-02-21',
    },
    {
      stationNo: '430',
      river: 'Badigad Khola',
      siteName: 'Rudrabeni / Ridi',
      lat: 27.9500,
      lng: 83.4333,
      elevation: 465,
      instruments: 'Staff Gauge & Discharge Measurement',
      startDate: '1975-04-01',
    },
    {
      stationNo: '435',
      river: 'Panaha Khola',
      siteName: 'Tamghas Basin Station',
      lat: 28.0650,
      lng: 83.2450,
      elevation: 1480,
      instruments: 'Staff Gauge',
      startDate: '1988-06-15',
    },
  ],
  palpa: [
    {
      stationNo: '420',
      river: 'Kali Gandaki',
      siteName: 'Ramdi Ghat',
      lat: 27.8833,
      lng: 83.6500,
      elevation: 420,
      instruments: 'Cable Way',
      startDate: '1968-01-01',
    },
  ],
};
