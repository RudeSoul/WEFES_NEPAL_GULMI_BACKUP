import { db } from '@wefes/database';

export class EnergyHydroService {
  public getHydropowerProfile(districtId: string = 'gulmi') {
    const district = db.getDistrictById(districtId) || db.getDistrictById('gulmi');
    if (!district) throw new Error(`District '${districtId}' not found`);

    return {
      districtId: district.id,
      districtName: district.name,
      totalHydroCapacityMW: district.totalHydroCapacityMW,
      hydroStationCount: district.hydroStationCount,
      hydroStationsList: district.hydroStationsList,
    };
  }

  public getSolarProfile(districtId: string = 'gulmi') {
    const district = db.getDistrictById(districtId) || db.getDistrictById('gulmi');
    if (!district) throw new Error(`District '${districtId}' not found`);

    return {
      districtId: district.id,
      districtName: district.name,
      solarRadiationKwh: district.solarRadiationKwh,
      nasaSolarRadiationKwh: district.nasaSolarRadiationKwh,
      nasaSolarYearly: district.nasaSolarYearly,
    };
  }

  public getHydrologyStations(districtId: string = 'gulmi') {
    const district = db.getDistrictById(districtId) || db.getDistrictById('gulmi');
    if (!district) throw new Error(`District '${districtId}' not found`);

    return {
      districtId: district.id,
      districtName: district.name,
      hydrologyStationsCount: district.hydrologyStationsCount,
      hydrologyStationsList: district.hydrologyStationsList,
      totalLakesCount: district.totalLakesCount,
      glofRiskLevel: district.glofRiskLevel,
    };
  }
}

export const energyHydroService = new EnergyHydroService();
