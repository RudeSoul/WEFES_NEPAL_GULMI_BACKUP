import { PalikaLogisticsRoute } from '@wefes/shared-types';

export interface CustomsPortInfo {
  id: PalikaLogisticsRoute['customsPortId'];
  name: string;
  district: string;
  province: string;
  elevationM: number;
}

export const NEPAL_CUSTOMS_BORDER_PORTS: Record<string, CustomsPortInfo> = {
  bhairahawa: { id: 'bhairahawa', name: 'Bhairahawa / Belahiya ICP', district: 'Rupandehi', province: 'Lumbini', elevationM: 105 },
  birgunj: { id: 'birgunj', name: 'Birgunj Integrated Check Post (ICP)', district: 'Parsa', province: 'Madhesh', elevationM: 80 },
  nepalgunj: { id: 'nepalgunj', name: 'Nepalgunj / Jamunaha ICP', district: 'Banke', province: 'Lumbini', elevationM: 145 },
  biratnagar: { id: 'biratnagar', name: 'Biratnagar / Rani ICP', district: 'Morang', province: 'Koshi', elevationM: 72 },
  kakarbhitta: { id: 'kakarbhitta', name: 'Mechi / Kakarbhitta Border Depot', district: 'Jhapa', province: 'Koshi', elevationM: 120 },
  dhangadhi: { id: 'dhangadhi', name: 'Mohana / Trinagar Border Depot', district: 'Kailali', province: 'Sudurpashchim', elevationM: 109 },
};

// District-level logistics routing defaults for Gulmi & its transport corridor
interface DistrictLogisticsBaseline {
  customsPortId: PalikaLogisticsRoute['customsPortId'];
  avgTeraiKm: number;
  avgHillKm: number;
  avgLastMileKm: number;
  avgElevationDeltaM: number;
  roadType: PalikaLogisticsRoute['lastMileRoadType'];
}

export const DISTRICT_LOGISTICS_BASELINES: Record<string, DistrictLogisticsBaseline> = {
  gulmi: { customsPortId: 'bhairahawa', avgTeraiKm: 85, avgHillKm: 92, avgLastMileKm: 26, avgElevationDeltaM: 1250, roadType: 'Earthen Mountain' },
  palpa: { customsPortId: 'bhairahawa', avgTeraiKm: 45, avgHillKm: 42, avgLastMileKm: 18, avgElevationDeltaM: 950, roadType: 'Gravel Valley' },
  arghakhanchi: { customsPortId: 'bhairahawa', avgTeraiKm: 65, avgHillKm: 78, avgLastMileKm: 24, avgElevationDeltaM: 1180, roadType: 'Gravel Valley' },
  rupandehi: { customsPortId: 'bhairahawa', avgTeraiKm: 15, avgHillKm: 0, avgLastMileKm: 8, avgElevationDeltaM: 10, roadType: 'Paved Highway' },
};

/**
 * Computes or retrieves the exact segmented route for a Palika or District.
 */
export function getPalikaLogisticsRoute(
  districtId: string,
  palikaName?: string,
  palikaId?: string
): PalikaLogisticsRoute {
  const dNorm = districtId.toLowerCase();
  const baseline = DISTRICT_LOGISTICS_BASELINES[dNorm] || DISTRICT_LOGISTICS_BASELINES.gulmi;

  const port = NEPAL_CUSTOMS_BORDER_PORTS[baseline.customsPortId] || NEPAL_CUSTOMS_BORDER_PORTS.bhairahawa;
  const totalDistanceKm = baseline.avgTeraiKm + baseline.avgHillKm + baseline.avgLastMileKm;

  return {
    palikaId: palikaId || `${dNorm}-hq`,
    palikaName: palikaName || `${districtId.toUpperCase()} Center`,
    districtId: dNorm,
    districtName: districtId,
    customsPortId: baseline.customsPortId,
    customsPortName: port.name,
    distanceTeraiKm: baseline.avgTeraiKm,
    distanceHillKm: baseline.avgHillKm,
    distanceLastMileKm: baseline.avgLastMileKm,
    totalDistanceKm,
    elevationDeltaM: baseline.avgElevationDeltaM,
    lastMileRoadType: baseline.roadType,
  };
}
