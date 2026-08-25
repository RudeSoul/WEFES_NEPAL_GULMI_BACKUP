import { db, getPalikaLogisticsRoute, NEPAL_CUSTOMS_BORDER_PORTS } from '@wefes/database';

export class LogisticsMarketService {
  public getPalikaRoute(districtId: string = 'gulmi', palikaName?: string) {
    return getPalikaLogisticsRoute(districtId, palikaName);
  }

  public getCustomsPorts() {
    return Object.values(NEPAL_CUSTOMS_BORDER_PORTS);
  }

  public getSocioeconomicProfile(districtId: string = 'gulmi') {
    const district = db.getDistrictById(districtId) || db.getDistrictById('gulmi');
    if (!district) throw new Error(`District '${districtId}' not found`);

    return {
      districtId: district.id,
      districtName: district.name,
      populationTotal: district.populationTotal,
      populationDensity: district.populationDensity,
      wealthIndexScore: district.wealthIndexScore,
      agriLandholdingAvgHa: district.agriLandholdingAvgHa,
      unemploymentRatePct: district.unemploymentRatePct,
      literacyRatePct: district.literacyRatePct,
      utilityAccessPct: district.utilityAccessPct,
      laborRateNprPerDay: district.laborRateNprPerDay,
      agriLaborMarketRateAvgNpr: district.agriLaborMarketRateAvgNpr,
      agriLaborMarketRateMinNpr: district.agriLaborMarketRateMinNpr,
      agriLaborMarketRateMaxNpr: district.agriLaborMarketRateMaxNpr,
      roadDensityKmPerKm2: district.roadDensityKmPerKm2,
      avgDistanceToPavedRoadKm: district.avgDistanceToPavedRoadKm,
      marketAccessIndex: district.marketAccessIndex,
      freightLogisticsTariffNprPerTonKm: district.freightLogisticsTariffNprPerTonKm,
    };
  }
}

export const logisticsMarketService = new LogisticsMarketService();
