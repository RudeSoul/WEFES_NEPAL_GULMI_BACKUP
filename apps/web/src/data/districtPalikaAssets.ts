// [DATA PROVENANCE]
// Data Source: data/real/municipal/palika_profiles.json, data/real/boundaries/gulmi-palikas.json
// Classification: OBSERVED REAL (Nepal Local Levels 774 Palikas, CBS 2021 Census, Survey Department)
// Citations: Ministry of Federal Affairs and General Administration (MoFAGA); MoALD; Survey Department Nepal

import rawPalikaData from '../../../../data/real/municipal/palika_profiles.json';
import boundaryData from '../../../../data/real/boundaries/gulmi-palikas.json';
import hydroSummaryData from '../../../../data/calculated/hydro_reaches/hydro_palika_summary.json';

export interface PalikaFeasibleCrop {
  cropId: string;
  cropName: string;
  nepaliName?: string;
  emoji: string;
  category: string;
  season?: 'barkhe' | 'hiunde' | 'chaite' | 'baahramase';
  seasonNepali?: string;
  seasonMonths?: string;
  score: number;
  rating: 'Optimal' | 'Very High' | 'High' | 'Moderate' | 'Marginal' | 'Constrained' | string;
  limitingFactor: string;
}

export interface PalikaSeasonalRotations {
  barkhe?: PalikaFeasibleCrop | null;
  hiunde?: PalikaFeasibleCrop | null;
  chaite?: PalikaFeasibleCrop | null;
  baahramase?: PalikaFeasibleCrop | null;
}

export interface DistrictPalika {
  id: string;
  name: string;
  unitType: string;
  districtId: string;
  districtName: string;
  coordinates: [number, number]; // [lat, lng]
  elevation: number;
  avgTempC: number;
  tempMaxC?: number;
  tempMinC?: number;
  rainfallMm: number;
  soilPh: number;
  feasibleCropsCount: number;
  feasibleCrops: PalikaFeasibleCrop[];
  seasonalRotations?: PalikaSeasonalRotations;
  topCrops: PalikaFeasibleCrop[];
}

export const PALIKA_GEO_CENTROIDS: Record<string, { lat: number; lng: number }> =
  rawPalikaData.palikaCentroids as Record<string, { lat: number; lng: number }>;

export const DISTRICT_PALIKAS: Record<string, DistrictPalika[]> =
  (rawPalikaData.palikas as unknown) as Record<string, DistrictPalika[]>;

export const GULMI_PALIKA_NEPALI: Record<string, string> = (
  (boundaryData as any).features || []
).reduce((acc: Record<string, string>, f: any) => {
  if (f.properties?.name) {
    acc[f.properties.name] = f.properties.nepaliName || f.properties.name;
  }
  return acc;
}, {});

export const HYDRO_PALIKA_SUMMARY: any[] = hydroSummaryData as any[];


