// [DATA PROVENANCE]
// Data Source: data/real/municipal/palika_profiles.json
// Classification: OBSERVED REAL (Nepal Local Levels 774 Palikas, CBS 2021 Census, NARC Soil Matrix)
// Citations: Ministry of Federal Affairs and General Administration (MoFAGA); MoALD; Central Bureau of Statistics Nepal

import rawPalikaData from '../../../../data/real/municipal/palika_profiles.json';

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

