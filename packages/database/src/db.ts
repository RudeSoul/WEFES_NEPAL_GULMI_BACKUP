import { District, Crop, CropSuitability } from '@wefes/shared-types';
import { DISTRICTS_SEED_DATA, CROPS_SEED_DATA } from './seed-data';
import { computeCropSuitability } from '@wefes/wefes-engine';

/**
 * Map from crop ID to the keyword patterns that match it
 * in the CSV's feasible lists (feasibleCrops, feasibleFruits, feasibleSpicesCashCrops).
 */
export const CROP_FEASIBILITY_KEYWORDS: Record<string, string[]> = {
  rice: ['paddy', 'rice', 'dhan', 'jumli marshi'],
  wheat: ['wheat', 'gahu'],
  maize: ['maize', 'makai'],
  potato: ['potato', 'aalu'],
  buckwheat: ['buckwheat', 'phapar'],
  tea: ['tea', 'chiya'],
  coffee: ['coffee', 'kafi'],
  cardamom: ['cardamom', 'alainchi'],
  ginger: ['ginger', 'aduwa'],
  apple: ['apple', 'syau'],
  orange: ['orange', 'mandarin', 'suntala', 'lemon', 'citrus'],
  mango: ['mango', 'aamp'],
  banana: ['banana', 'kera'],
  sugarcane: ['sugarcane', 'ukhu'],
  timber_sal: ['timber', 'sal', 'shorea', 'sakhu'],
  lentil: ['lentil', 'masur', 'dal', 'pulse'],
  mustard: ['mustard', 'tori', 'oilseed'],
  millet: ['millet', 'kodo', 'kaguno'],
};

export function isCropFeasibleInDistrict(cropOrId: Crop | string, district: District): boolean {
  const cropId = typeof cropOrId === 'string' ? cropOrId : cropOrId.id;
  const keywords = CROP_FEASIBILITY_KEYWORDS[cropId];

  // If district has no feasibility data, show all crops
  if (!district.feasibleCrops && !district.feasibleFruits && !district.feasibleSpicesCashCrops) {
    return true;
  }

  // Combine all feasibility lists into one searchable string
  const allFeasible = [
    ...(district.feasibleCrops || []),
    ...(district.feasibleVegetables || []),
    ...(district.feasibleFruits || []),
    ...(district.feasibleSpicesCashCrops || []),
  ].join(', ').toLowerCase();

  if (!keywords) {
    if (typeof cropOrId !== 'string' && cropOrId.name) {
      return allFeasible.includes(cropOrId.name.toLowerCase());
    }
    return true; // Unknown crops always shown
  }

  return keywords.some(kw => allFeasible.includes(kw.toLowerCase()));
}

export class WEFESDatabase {
  private districts: District[] = DISTRICTS_SEED_DATA;
  private crops: Crop[] = CROPS_SEED_DATA;
  private cachedGeoJSON: any = null;

  public getAllDistricts(): District[] {
    return this.districts;
  }

  public getDistrictById(id: string): District | undefined {
    return this.districts.find(d => d.id.toLowerCase() === id.toLowerCase());
  }

  public getAllCrops(): Crop[] {
    return this.crops;
  }

  public getCropById(id: string): Crop | undefined {
    return this.crops.find(c => c.id.toLowerCase() === id.toLowerCase());
  }

  /**
   * Returns crops with suitability scores, filtered to only feasible crops
   * for the district based on the Nepal_District_Crops_Feasibility.csv data.
   */
  public getDistrictCrops(districtId: string): { crop: Crop; suitability: CropSuitability }[] {
    const district = this.getDistrictById(districtId);
    if (!district) return [];

    return this.crops
      .filter(crop => isCropFeasibleInDistrict(crop, district))
      .map(crop => ({
        crop,
        suitability: computeCropSuitability(district, crop)
      }));
  }

  /**
   * Returns ALL crops with suitability (including unfeasible ones marked down).
   */
  public getAllDistrictCrops(districtId: string): { crop: Crop; suitability: CropSuitability; isFeasible: boolean }[] {
    const district = this.getDistrictById(districtId);
    if (!district) return [];

    return this.crops.map(crop => ({
      crop,
      suitability: computeCropSuitability(district, crop),
      isFeasible: isCropFeasibleInDistrict(crop, district),
    }));
  }

  public getGeoJSON(): any {
    if (this.cachedGeoJSON) {
      return this.cachedGeoJSON;
    }

    const features = this.districts.map((district, idx) => {
      const lat = district.coordinates?.lat ?? 28.0;
      const lng = district.coordinates?.lng ?? 84.0;
      
      // Smooth polygon bounding box for 77 Nepal districts
      const r = 0.18 + ((idx % 5) * 0.03);
      const polygon = [
        [
          [lng - r * 0.9, lat - r * 0.5],
          [lng - r * 0.2, lat - r * 0.95],
          [lng + r * 0.8, lat - r * 0.6],
          [lng + r * 0.95, lat + r * 0.4],
          [lng + r * 0.3, lat + r * 0.9],
          [lng - r * 0.75, lat + r * 0.7],
          [lng - r * 0.9, lat - r * 0.5]
        ]
      ];

      return {
        type: 'Feature',
        id: district.id,
        properties: {
          id: district.id,
          name: district.name,
          nepaliName: district.nepaliName,
          province: district.province,
          ecoZone: district.ecoZone,
          avgRainfallMm: district.avgRainfallMm,
          solarRadiationKwh: district.solarRadiationKwh,
          baseSoilPh: district.baseSoilPh,
          soilNitrogen: district.soilNitrogen,
          soilPhosphorus: district.soilPhosphorus,
          soilPotassium: district.soilPotassium,
          soilType: district.soilType,
          soilSampleCount: district.soilSampleCount,
          hasRealSoilData: district.hasRealSoilData,
          populationTotal: district.populationTotal,
          populationDensity: district.populationDensity,
          wealthIndexScore: district.wealthIndexScore,
          agriLandholdingAvgHa: district.agriLandholdingAvgHa,
          unemploymentRatePct: district.unemploymentRatePct,
          literacyRatePct: district.literacyRatePct,
          utilityAccessPct: district.utilityAccessPct,
          totalHydroCapacityMW: district.totalHydroCapacityMW,
          hydroStationCount: district.hydroStationCount,
          hydroStationsList: district.hydroStationsList,
          nasaSolarRadiationKwh: district.nasaSolarRadiationKwh,
          nasaSolarYearly: district.nasaSolarYearly,
          laborRateNprPerDay: district.laborRateNprPerDay,
          // Crop Feasibility Fields
          physiographicRegion: district.physiographicRegion,
          climateZone: district.climateZone,
          elevationRange: district.elevationRange,
          feasibleCrops: district.feasibleCrops,
          feasibleVegetables: district.feasibleVegetables,
          feasibleFruits: district.feasibleFruits,
          feasibleSpicesCashCrops: district.feasibleSpicesCashCrops,
          feasibilityReasoning: district.feasibilityReasoning,
          // Real Coffee Statistics
          coffeeProductionMt: district.coffeeProductionMt,
          coffeeAreaHa: district.coffeeAreaHa,
          coffeeYieldKgHa: district.coffeeYieldKgHa,
          coffeeFarmersCount: district.coffeeFarmersCount,
          // Real Agricultural Labor Rates
          agriLaborRateBaselineNpr: district.agriLaborRateBaselineNpr,
          agriLaborMarketRateMinNpr: district.agriLaborMarketRateMinNpr,
          agriLaborMarketRateMaxNpr: district.agriLaborMarketRateMaxNpr,
          agriLaborMarketRateAvgNpr: district.agriLaborMarketRateAvgNpr,
          agriLaborRateRange: district.agriLaborRateRange,
          agriLaborEcoBelt: district.agriLaborEcoBelt,
        },
        geometry: {
          type: 'Polygon',
          coordinates: polygon
        }
      };
    });

    this.cachedGeoJSON = {
      type: 'FeatureCollection',
      features
    };

    return this.cachedGeoJSON;
  }
}

export const db = new WEFESDatabase();
