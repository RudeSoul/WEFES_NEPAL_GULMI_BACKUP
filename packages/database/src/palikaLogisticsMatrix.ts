import { PalikaLogisticsRoute } from '@wefes/shared-types';

export interface CustomsPortInfo {
  id: PalikaLogisticsRoute['customsPortId'];
  name: string;
  district: string;
  province: string;
  elevationM: number;
}

export const NEPAL_CUSTOMS_BORDER_PORTS: Record<string, CustomsPortInfo> = {
  birgunj: { id: 'birgunj', name: 'Birgunj Integrated Check Post (ICP)', district: 'Parsa', province: 'Madhesh', elevationM: 80 },
  bhairahawa: { id: 'bhairahawa', name: 'Bhairahawa / Belahiya ICP', district: 'Rupandehi', province: 'Lumbini', elevationM: 105 },
  biratnagar: { id: 'biratnagar', name: 'Biratnagar / Rani ICP', district: 'Morang', province: 'Koshi', elevationM: 72 },
  nepalgunj: { id: 'nepalgunj', name: 'Nepalgunj / Jamunaha ICP', district: 'Banke', province: 'Lumbini', elevationM: 145 },
  kakarbhitta: { id: 'kakarbhitta', name: 'Mechi / Kakarbhitta Border Depot', district: 'Jhapa', province: 'Koshi', elevationM: 120 },
  dhangadhi: { id: 'dhangadhi', name: 'Mohana / Trinagar Border Depot', district: 'Kailali', province: 'Sudurpashchim', elevationM: 109 },
};

// District-level logistics routing defaults
interface DistrictLogisticsBaseline {
  customsPortId: PalikaLogisticsRoute['customsPortId'];
  avgTeraiKm: number;
  avgHillKm: number;
  avgLastMileKm: number;
  avgElevationDeltaM: number;
  roadType: PalikaLogisticsRoute['lastMileRoadType'];
}

export const DISTRICT_LOGISTICS_BASELINES: Record<string, DistrictLogisticsBaseline> = {
  // Koshi Province (Eastern Region -> Biratnagar / Kakarbhitta)
  taplejung: { customsPortId: 'biratnagar', avgTeraiKm: 65, avgHillKm: 235, avgLastMileKm: 38, avgElevationDeltaM: 1750, roadType: 'Earthen Mountain' },
  sankhuwasabha: { customsPortId: 'biratnagar', avgTeraiKm: 70, avgHillKm: 210, avgLastMileKm: 32, avgElevationDeltaM: 1450, roadType: 'Earthen Mountain' },
  solukhumbu: { customsPortId: 'biratnagar', avgTeraiKm: 90, avgHillKm: 260, avgLastMileKm: 45, avgElevationDeltaM: 2100, roadType: 'Seasonal Rough Earthen' },
  okhaldhunga: { customsPortId: 'biratnagar', avgTeraiKm: 95, avgHillKm: 180, avgLastMileKm: 28, avgElevationDeltaM: 1500, roadType: 'Earthen Mountain' },
  khotang: { customsPortId: 'biratnagar', avgTeraiKm: 85, avgHillKm: 195, avgLastMileKm: 34, avgElevationDeltaM: 1520, roadType: 'Earthen Mountain' },
  bhojpur: { customsPortId: 'biratnagar', avgTeraiKm: 75, avgHillKm: 165, avgLastMileKm: 30, avgElevationDeltaM: 1480, roadType: 'Earthen Mountain' },
  dhankuta: { customsPortId: 'biratnagar', avgTeraiKm: 55, avgHillKm: 68, avgLastMileKm: 18, avgElevationDeltaM: 1150, roadType: 'Gravel Valley' },
  terhathum: { customsPortId: 'biratnagar', avgTeraiKm: 60, avgHillKm: 145, avgLastMileKm: 24, avgElevationDeltaM: 1420, roadType: 'Earthen Mountain' },
  panchthar: { customsPortId: 'biratnagar', avgTeraiKm: 50, avgHillKm: 190, avgLastMileKm: 28, avgElevationDeltaM: 1400, roadType: 'Earthen Mountain' },
  ilam: { customsPortId: 'kakarbhitta', avgTeraiKm: 35, avgHillKm: 78, avgLastMileKm: 16, avgElevationDeltaM: 1180, roadType: 'Gravel Valley' },
  jhapa: { customsPortId: 'kakarbhitta', avgTeraiKm: 28, avgHillKm: 0, avgLastMileKm: 12, avgElevationDeltaM: 40, roadType: 'Paved Highway' },
  morang: { customsPortId: 'biratnagar', avgTeraiKm: 22, avgHillKm: 0, avgLastMileKm: 10, avgElevationDeltaM: 25, roadType: 'Paved Highway' },
  sunsari: { customsPortId: 'biratnagar', avgTeraiKm: 42, avgHillKm: 0, avgLastMileKm: 12, avgElevationDeltaM: 35, roadType: 'Paved Highway' },
  udayapur: { customsPortId: 'biratnagar', avgTeraiKm: 65, avgHillKm: 48, avgLastMileKm: 20, avgElevationDeltaM: 380, roadType: 'Gravel Valley' },

  // Madhesh Province (Terai Flat Corridors -> Birgunj / Biratnagar)
  saptari: { customsPortId: 'biratnagar', avgTeraiKm: 75, avgHillKm: 0, avgLastMileKm: 14, avgElevationDeltaM: 20, roadType: 'Paved Highway' },
  siraha: { customsPortId: 'biratnagar', avgTeraiKm: 115, avgHillKm: 0, avgLastMileKm: 15, avgElevationDeltaM: 25, roadType: 'Paved Highway' },
  dhanusha: { customsPortId: 'birgunj', avgTeraiKm: 125, avgHillKm: 0, avgLastMileKm: 14, avgElevationDeltaM: 15, roadType: 'Paved Highway' },
  mahottari: { customsPortId: 'birgunj', avgTeraiKm: 98, avgHillKm: 0, avgLastMileKm: 14, avgElevationDeltaM: 15, roadType: 'Paved Highway' },
  sarlahi: { customsPortId: 'birgunj', avgTeraiKm: 72, avgHillKm: 0, avgLastMileKm: 12, avgElevationDeltaM: 20, roadType: 'Paved Highway' },
  rautahat: { customsPortId: 'birgunj', avgTeraiKm: 48, avgHillKm: 0, avgLastMileKm: 12, avgElevationDeltaM: 18, roadType: 'Paved Highway' },
  bara: { customsPortId: 'birgunj', avgTeraiKm: 24, avgHillKm: 0, avgLastMileKm: 10, avgElevationDeltaM: 15, roadType: 'Paved Highway' },
  parsa: { customsPortId: 'birgunj', avgTeraiKm: 12, avgHillKm: 0, avgLastMileKm: 8, avgElevationDeltaM: 5, roadType: 'Paved Highway' },

  // Bagmati Province (Central Hills & Valleys -> Birgunj)
  dolakha: { customsPortId: 'birgunj', avgTeraiKm: 135, avgHillKm: 168, avgLastMileKm: 32, avgElevationDeltaM: 1650, roadType: 'Earthen Mountain' },
  sindhupalchok: { customsPortId: 'birgunj', avgTeraiKm: 135, avgHillKm: 145, avgLastMileKm: 28, avgElevationDeltaM: 1400, roadType: 'Earthen Mountain' },
  rasuwa: { customsPortId: 'birgunj', avgTeraiKm: 145, avgHillKm: 162, avgLastMileKm: 34, avgElevationDeltaM: 1850, roadType: 'Seasonal Rough Earthen' },
  dhading: { customsPortId: 'birgunj', avgTeraiKm: 125, avgHillKm: 85, avgLastMileKm: 22, avgElevationDeltaM: 1100, roadType: 'Gravel Valley' },
  nuwakot: { customsPortId: 'birgunj', avgTeraiKm: 140, avgHillKm: 98, avgLastMileKm: 24, avgElevationDeltaM: 1050, roadType: 'Gravel Valley' },
  kathmandu: { customsPortId: 'birgunj', avgTeraiKm: 135, avgHillKm: 65, avgLastMileKm: 10, avgElevationDeltaM: 1250, roadType: 'Paved Highway' },
  bhaktapur: { customsPortId: 'birgunj', avgTeraiKm: 135, avgHillKm: 72, avgLastMileKm: 10, avgElevationDeltaM: 1240, roadType: 'Paved Highway' },
  lalitpur: { customsPortId: 'birgunj', avgTeraiKm: 130, avgHillKm: 70, avgLastMileKm: 15, avgElevationDeltaM: 1280, roadType: 'Gravel Valley' },
  kavrepalanchok: { customsPortId: 'birgunj', avgTeraiKm: 135, avgHillKm: 95, avgLastMileKm: 20, avgElevationDeltaM: 1350, roadType: 'Gravel Valley' },
  ramechhap: { customsPortId: 'birgunj', avgTeraiKm: 130, avgHillKm: 142, avgLastMileKm: 26, avgElevationDeltaM: 1380, roadType: 'Earthen Mountain' },
  sindhuli: { customsPortId: 'birgunj', avgTeraiKm: 95, avgHillKm: 68, avgLastMileKm: 20, avgElevationDeltaM: 850, roadType: 'Gravel Valley' },
  makwanpur: { customsPortId: 'birgunj', avgTeraiKm: 52, avgHillKm: 35, avgLastMileKm: 16, avgElevationDeltaM: 650, roadType: 'Gravel Valley' },
  chitwan: { customsPortId: 'birgunj', avgTeraiKm: 68, avgHillKm: 0, avgLastMileKm: 12, avgElevationDeltaM: 120, roadType: 'Paved Highway' },

  // Gandaki Province (Western Hills & High Mountains -> Bhairahawa / Birgunj)
  gorkha: { customsPortId: 'birgunj', avgTeraiKm: 120, avgHillKm: 92, avgLastMileKm: 28, avgElevationDeltaM: 1250, roadType: 'Earthen Mountain' },
  manang: { customsPortId: 'bhairahawa', avgTeraiKm: 125, avgHillKm: 245, avgLastMileKm: 52, avgElevationDeltaM: 2850, roadType: 'Seasonal Rough Earthen' },
  mustang: { customsPortId: 'bhairahawa', avgTeraiKm: 125, avgHillKm: 265, avgLastMileKm: 58, avgElevationDeltaM: 3100, roadType: 'Seasonal Rough Earthen' },
  myagdi: { customsPortId: 'bhairahawa', avgTeraiKm: 120, avgHillKm: 155, avgLastMileKm: 32, avgElevationDeltaM: 1650, roadType: 'Earthen Mountain' },
  kaski: { customsPortId: 'bhairahawa', avgTeraiKm: 110, avgHillKm: 85, avgLastMileKm: 15, avgElevationDeltaM: 850, roadType: 'Paved Highway' },
  lamjung: { customsPortId: 'bhairahawa', avgTeraiKm: 115, avgHillKm: 110, avgLastMileKm: 25, avgElevationDeltaM: 1150, roadType: 'Gravel Valley' },
  tanahun: { customsPortId: 'bhairahawa', avgTeraiKm: 95, avgHillKm: 62, avgLastMileKm: 18, avgElevationDeltaM: 620, roadType: 'Gravel Valley' },
  nawalparasi: { customsPortId: 'bhairahawa', avgTeraiKm: 38, avgHillKm: 12, avgLastMileKm: 12, avgElevationDeltaM: 85, roadType: 'Paved Highway' },
  syangja: { customsPortId: 'bhairahawa', avgTeraiKm: 85, avgHillKm: 58, avgLastMileKm: 20, avgElevationDeltaM: 950, roadType: 'Gravel Valley' },
  parbat: { customsPortId: 'bhairahawa', avgTeraiKm: 105, avgHillKm: 115, avgLastMileKm: 24, avgElevationDeltaM: 1150, roadType: 'Gravel Valley' },
  baglung: { customsPortId: 'bhairahawa', avgTeraiKm: 110, avgHillKm: 135, avgLastMileKm: 28, avgElevationDeltaM: 1350, roadType: 'Earthen Mountain' },

  // Lumbini Province (Western Terai & Inner Mid-Hills -> Bhairahawa / Nepalgunj)
  gulmi: { customsPortId: 'bhairahawa', avgTeraiKm: 85, avgHillKm: 92, avgLastMileKm: 26, avgElevationDeltaM: 1250, roadType: 'Earthen Mountain' },
  palpa: { customsPortId: 'bhairahawa', avgTeraiKm: 45, avgHillKm: 42, avgLastMileKm: 18, avgElevationDeltaM: 950, roadType: 'Gravel Valley' },
  arghakhanchi: { customsPortId: 'bhairahawa', avgTeraiKm: 65, avgHillKm: 78, avgLastMileKm: 24, avgElevationDeltaM: 1180, roadType: 'Gravel Valley' },
  rupandehi: { customsPortId: 'bhairahawa', avgTeraiKm: 15, avgHillKm: 0, avgLastMileKm: 8, avgElevationDeltaM: 10, roadType: 'Paved Highway' },
  kapilvastu: { customsPortId: 'bhairahawa', avgTeraiKm: 42, avgHillKm: 0, avgLastMileKm: 12, avgElevationDeltaM: 20, roadType: 'Paved Highway' },
  pyuthan: { customsPortId: 'nepalgunj', avgTeraiKm: 85, avgHillKm: 95, avgLastMileKm: 28, avgElevationDeltaM: 1100, roadType: 'Earthen Mountain' },
  rolpa: { customsPortId: 'nepalgunj', avgTeraiKm: 90, avgHillKm: 145, avgLastMileKm: 36, avgElevationDeltaM: 1650, roadType: 'Earthen Mountain' },
  dang: { customsPortId: 'nepalgunj', avgTeraiKm: 65, avgHillKm: 32, avgLastMileKm: 16, avgElevationDeltaM: 450, roadType: 'Paved Highway' },
  banke: { customsPortId: 'nepalgunj', avgTeraiKm: 12, avgHillKm: 0, avgLastMileKm: 8, avgElevationDeltaM: 10, roadType: 'Paved Highway' },
  bardiya: { customsPortId: 'nepalgunj', avgTeraiKm: 45, avgHillKm: 0, avgLastMileKm: 14, avgElevationDeltaM: 25, roadType: 'Paved Highway' },

  // Karnali Province (Mid-Western & High Remote Mountains -> Nepalgunj)
  dolpa: { customsPortId: 'nepalgunj', avgTeraiKm: 95, avgHillKm: 285, avgLastMileKm: 65, avgElevationDeltaM: 2950, roadType: 'Seasonal Rough Earthen' },
  mugu: { customsPortId: 'nepalgunj', avgTeraiKm: 95, avgHillKm: 295, avgLastMileKm: 62, avgElevationDeltaM: 2650, roadType: 'Seasonal Rough Earthen' },
  humla: { customsPortId: 'nepalgunj', avgTeraiKm: 95, avgHillKm: 345, avgLastMileKm: 78, avgElevationDeltaM: 3200, roadType: 'Seasonal Rough Earthen' },
  jumla: { customsPortId: 'nepalgunj', avgTeraiKm: 95, avgHillKm: 235, avgLastMileKm: 42, avgElevationDeltaM: 2350, roadType: 'Earthen Mountain' },
  kalikot: { customsPortId: 'nepalgunj', avgTeraiKm: 95, avgHillKm: 195, avgLastMileKm: 38, avgElevationDeltaM: 1750, roadType: 'Earthen Mountain' },
  dailekh: { customsPortId: 'nepalgunj', avgTeraiKm: 85, avgHillKm: 98, avgLastMileKm: 26, avgElevationDeltaM: 1250, roadType: 'Earthen Mountain' },
  jajarkot: { customsPortId: 'nepalgunj', avgTeraiKm: 90, avgHillKm: 142, avgLastMileKm: 34, avgElevationDeltaM: 1350, roadType: 'Earthen Mountain' },
  rukum: { customsPortId: 'nepalgunj', avgTeraiKm: 95, avgHillKm: 165, avgLastMileKm: 38, avgElevationDeltaM: 1550, roadType: 'Earthen Mountain' },
  salyan: { customsPortId: 'nepalgunj', avgTeraiKm: 75, avgHillKm: 88, avgLastMileKm: 24, avgElevationDeltaM: 1120, roadType: 'Gravel Valley' },
  surkhet: { customsPortId: 'nepalgunj', avgTeraiKm: 75, avgHillKm: 32, avgLastMileKm: 15, avgElevationDeltaM: 520, roadType: 'Paved Highway' },

  // Sudurpashchim Province (Far-Western Region -> Dhangadhi)
  bajura: { customsPortId: 'dhangadhi', avgTeraiKm: 85, avgHillKm: 245, avgLastMileKm: 52, avgElevationDeltaM: 2150, roadType: 'Seasonal Rough Earthen' },
  bajhang: { customsPortId: 'dhangadhi', avgTeraiKm: 85, avgHillKm: 225, avgLastMileKm: 48, avgElevationDeltaM: 1950, roadType: 'Earthen Mountain' },
  darchula: { customsPortId: 'dhangadhi', avgTeraiKm: 85, avgHillKm: 215, avgLastMileKm: 45, avgElevationDeltaM: 1850, roadType: 'Earthen Mountain' },
  baitadi: { customsPortId: 'dhangadhi', avgTeraiKm: 75, avgHillKm: 165, avgLastMileKm: 32, avgElevationDeltaM: 1450, roadType: 'Earthen Mountain' },
  dadeldhura: { customsPortId: 'dhangadhi', avgTeraiKm: 55, avgHillKm: 98, avgLastMileKm: 22, avgElevationDeltaM: 1250, roadType: 'Gravel Valley' },
  doti: { customsPortId: 'dhangadhi', avgTeraiKm: 65, avgHillKm: 125, avgLastMileKm: 26, avgElevationDeltaM: 1150, roadType: 'Gravel Valley' },
  achham: { customsPortId: 'dhangadhi', avgTeraiKm: 85, avgHillKm: 175, avgLastMileKm: 35, avgElevationDeltaM: 1350, roadType: 'Earthen Mountain' },
  kailali: { customsPortId: 'dhangadhi', avgTeraiKm: 20, avgHillKm: 0, avgLastMileKm: 10, avgElevationDeltaM: 15, roadType: 'Paved Highway' },
  kanchanpur: { customsPortId: 'dhangadhi', avgTeraiKm: 38, avgHillKm: 0, avgLastMileKm: 10, avgElevationDeltaM: 20, roadType: 'Paved Highway' },
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
  const baseline = DISTRICT_LOGISTICS_BASELINES[dNorm] || {
    customsPortId: 'birgunj',
    avgTeraiKm: 100,
    avgHillKm: 100,
    avgLastMileKm: 25,
    avgElevationDeltaM: 1000,
    roadType: 'Gravel Valley' as const,
  };

  const port = NEPAL_CUSTOMS_BORDER_PORTS[baseline.customsPortId] || NEPAL_CUSTOMS_BORDER_PORTS.birgunj;
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
