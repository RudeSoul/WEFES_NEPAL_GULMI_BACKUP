// [DATA PROVENANCE]
// Data Source: data/real/infrastructure/district_infrastructure_assets.json
// Classification: OBSERVED REAL (Nepal Electricity Authority, NARC, Department of Survey)
// Citations: Nepal Electricity Authority (NEA) Powerhouse Registry; National Tea and Coffee Development Board (NTCDB)

import rawAssets from '../../../../data/real/infrastructure/district_infrastructure_assets.json';

export interface DistrictLandmarks {
  peak: { name: string; elevation: number; lat: number; lon: number };
  valley: { name: string; elevation: number; lat: number; lon: number };
}

export interface RealHydropowerAsset {
  name: string;
  capacityMW: number;
  lat: number;
  lon: number;
  river: string;
  owner: string;
  commissioned: string;
}

export interface RealCropPocket {
  cropName: string;
  emoji: string;
  locationName: string;
  lat: number;
  lon: number;
  elevationM: number;
}

export interface CoffeeLandmark {
  id: string;
  name: string;
  nepaliName: string;
  category: 'origin' | 'research' | 'processing' | 'pocket';
  lat: number;
  lon: number;
  elevationM: number;
  palika: string;
  significance: string;
}

export const DISTRICT_LANDMARKS: Record<string, DistrictLandmarks> =
  rawAssets.districtLandmarks as Record<string, DistrictLandmarks>;

export const REAL_HYDROPOWER_PLANTS: Record<string, RealHydropowerAsset[]> =
  rawAssets.hydropowerPlants as Record<string, RealHydropowerAsset[]>;

export const GULMI_COFFEE_LANDMARKS: CoffeeLandmark[] =
  rawAssets.coffeeLandmarks as CoffeeLandmark[];

export const GULMI_CROP_POCKETS: Record<string, RealCropPocket[]> =
  ((rawAssets as any).cropPockets || {}) as Record<string, RealCropPocket[]>;

