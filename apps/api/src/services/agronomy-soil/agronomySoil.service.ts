import { db } from '@wefes/database';
import { Crop, District } from '@wefes/shared-types';
import { computeCropSuitability } from '@wefes/wefes-engine';

export class AgronomySoilService {
  public getAllCrops(): Crop[] {
    return db.getAllCrops();
  }

  public getCropById(id: string): Crop | undefined {
    return db.getCropById(id);
  }

  public getDistrictSuitability(districtId: string) {
    const district = db.getDistrictById(districtId) || db.getDistrictById('gulmi');
    if (!district) throw new Error(`District '${districtId}' not found`);
    return db.getDistrictCrops(district.id);
  }

  public getSoilProfile(districtId: string = 'gulmi') {
    const district = db.getDistrictById(districtId) || db.getDistrictById('gulmi');
    if (!district) throw new Error(`District '${districtId}' not found`);

    return {
      districtId: district.id,
      districtName: district.name,
      baseSoilPh: district.baseSoilPh,
      soilNitrogen: district.soilNitrogen,
      soilPhosphorus: district.soilPhosphorus,
      soilPotassium: district.soilPotassium,
      soilType: district.soilType,
      soilSampleCount: district.soilSampleCount,
      soilTextureShares: district.soilTextureShares,
      annualSoilErosionRiskTonnesPerHa: district.annualSoilErosionRiskTonnesPerHa,
    };
  }
}

export const agronomySoilService = new AgronomySoilService();
