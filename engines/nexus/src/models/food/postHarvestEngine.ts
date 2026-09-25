export interface ColdStorageFacility {
  id: string;
  name: string;
  location: string;
  district: string;
  capacityMetricTons: number;
  facilityType: 'Multi-Chamber Commercial' | 'Cooperative Solar-Powered' | 'Government CA (Controlled Atmosphere)';
  corridor: string;
  tariffPerKgPerMonthNpr: number;
  contactNumber: string;
}

export interface PostHarvestLossModel {
  cropCategory: 'Grains & Cereals' | 'Perennial Spices' | 'Fruits & Vegetables' | 'Tubers & Roots';
  baselineFieldToMarketLossPct: number; // e.g. 15% for grains, 32% for fruits
  financialLossNpr: number;
  primaryLossFactors: { factor: string; sharePct: number; mechanism: string }[];
  nearestColdStorage: ColdStorageFacility;
  distanceToColdStorageKm: number;
  roadTransportDisruptionRisk: {
    roadType: 'Paved Highway (BP / Prithvi / East-West)' | 'Feeder Asphalt Road' | 'Earthen Mountain Track';
    monsoonTransitDelayHours: number;
    spoilageAccelerationPct: number;
  };
  coldChainInterventionDividend: {
    salvagedVolumeKg: number;
    salvagedRevenueNpr: number;
    solarColdStoragePaybackYears: number;
    ghgMethaneMitigationKgCo2e: number;
  };
}

export const NEPAL_COLD_STORAGE_REGISTRY: ColdStorageFacility[] = [
  {
    id: 'cs-tamghas-citrus',
    name: 'Tamghas Municipal Potato & Citrus Cold Chamber',
    location: 'Tamghas-2, Resunga',
    district: 'Gulmi',
    capacityMetricTons: 1200,
    facilityType: 'Cooperative Solar-Powered',
    corridor: 'Madan Bhandari Highway (Tamghas–Sandhikharka)',
    tariffPerKgPerMonthNpr: 2.0,
    contactNumber: '079-520114',
  },
  {
    id: 'cs-ridi-precooling',
    name: 'Ridi Confluence Agro Pre-Cooling Center',
    location: 'Ridi Bazar, Ruru-1',
    district: 'Gulmi',
    capacityMetricTons: 800,
    facilityType: 'Cooperative Solar-Powered',
    corridor: 'Ridi–Tamghas Feeder Highway',
    tariffPerKgPerMonthNpr: 2.2,
    contactNumber: '079-540028',
  },
  {
    id: 'cs-butwal-regional',
    name: 'Butwal Regional Agro Multi-Chamber Cold Hub',
    location: 'Ramnagar, Butwal-12',
    district: 'Rupandehi',
    capacityMetricTons: 6500,
    facilityType: 'Multi-Chamber Commercial',
    corridor: 'Siddhartha Highway (Palpa–Butwal–Bhairahawa)',
    tariffPerKgPerMonthNpr: 1.7,
    contactNumber: '071-540223',
  },
  {
    id: 'cs-pokhara-regional',
    name: 'Pokhara Valley Controlled Atmosphere Cold Storage',
    location: 'Kundahar, Pokhara-14',
    district: 'Kaski',
    capacityMetricTons: 4000,
    facilityType: 'Government CA (Controlled Atmosphere)',
    corridor: 'Mid-Hill Highway (Pokhara–Baglung–Gulmi)',
    tariffPerKgPerMonthNpr: 2.1,
    contactNumber: '061-532190',
  },
];

export function computePostHarvestLoss(
  districtName: string,
  cropName: string,
  grossYieldKg: number,
  farmgateRevenueNpr: number
): PostHarvestLossModel {
  const normCrop = cropName.toLowerCase();
  let cropCategory: PostHarvestLossModel['cropCategory'] = 'Fruits & Vegetables';
  let lossPct = 28.5; // Default 28.5% for fruits & vegetables

  if (normCrop.includes('rice') || normCrop.includes('paddy') || normCrop.includes('maize') || normCrop.includes('wheat') || normCrop.includes('millet')) {
    cropCategory = 'Grains & Cereals';
    lossPct = 14.8;
  } else if (normCrop.includes('cardamom') || normCrop.includes('ginger') || normCrop.includes('tea') || normCrop.includes('coffee')) {
    cropCategory = 'Perennial Spices';
    lossPct = 18.2;
  } else if (normCrop.includes('potato')) {
    cropCategory = 'Tubers & Roots';
    lossPct = 22.0;
  } else if (normCrop.includes('apple') || normCrop.includes('tomato') || normCrop.includes('orange') || normCrop.includes('citrus')) {
    cropCategory = 'Fruits & Vegetables';
    lossPct = 36.5;
  }

  const financialLossNpr = Math.round(farmgateRevenueNpr * (lossPct / 100));

  // Find closest cold storage in Gulmi / Lumbini corridor
  const dNorm = districtName.toLowerCase();
  let nearestColdStorage = NEPAL_COLD_STORAGE_REGISTRY[0]; // Default Tamghas
  let distanceKm = 14;

  if (dNorm === 'rupandehi') {
    nearestColdStorage = NEPAL_COLD_STORAGE_REGISTRY[2]; // Butwal
    distanceKm = 12;
  } else if (dNorm === 'palpa') {
    nearestColdStorage = NEPAL_COLD_STORAGE_REGISTRY[1]; // Ridi
    distanceKm = 24;
  }

  // Road transport delay risk along hill feeder tracks
  let roadType: PostHarvestLossModel['roadTransportDisruptionRisk']['roadType'] = 'Earthen Mountain Track';
  let monsoonTransitDelayHours = 18;
  let spoilageAccelerationPct = 16;

  if (['rupandehi'].includes(dNorm)) {
    roadType = 'Paved Highway (BP / Prithvi / East-West)';
    monsoonTransitDelayHours = 3;
    spoilageAccelerationPct = 6;
  }

  const salvagedVolumeKg = Math.round(grossYieldKg * (lossPct * 0.72 / 100));
  const salvagedRevenueNpr = Math.round(financialLossNpr * 0.72);
  const ghgMethaneMitigationKgCo2e = Math.round(salvagedVolumeKg * 0.45);

  return {
    cropCategory,
    baselineFieldToMarketLossPct: lossPct,
    financialLossNpr,
    primaryLossFactors: [
      { factor: 'Lack of Palika-Level Pre-Cooling & Solar Storage', sharePct: 45, mechanism: 'Rapid enzymatic degradation and respiration heat accumulation in ambient hill valley temperatures.' },
      { factor: 'Monsoon Feeder Road Landslide Transit Delays', sharePct: 30, mechanism: 'Vehicle stranding along steep feeder road bottlenecks during peak monsoon harvest.' },
      { factor: 'Rough Terrain Mechanical Damage', sharePct: 25, mechanism: 'Mechanical compression damage and bruising during rough transit on unpaved mountain tracks.' },
    ],
    nearestColdStorage,
    distanceToColdStorageKm: distanceKm,
    roadTransportDisruptionRisk: {
      roadType,
      monsoonTransitDelayHours,
      spoilageAccelerationPct,
    },
    coldChainInterventionDividend: {
      salvagedVolumeKg,
      salvagedRevenueNpr,
      solarColdStoragePaybackYears: salvagedRevenueNpr > 50000
        ? Number(Math.min(10, Math.max(0.8, 1250000 / salvagedRevenueNpr)).toFixed(1))
        : 9.5,
      ghgMethaneMitigationKgCo2e,
    },
  };
}
