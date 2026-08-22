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
    id: 'cs-ilam-fikkal',
    name: 'Fikkal Cooperative Agro Cold Store',
    location: 'Fikkal, Suryodaya-10',
    district: 'Ilam',
    capacityMetricTons: 1500,
    facilityType: 'Cooperative Solar-Powered',
    corridor: 'Mechi Highway (Charali–Ilam–Taplejung)',
    tariffPerKgPerMonthNpr: 2.2,
    contactNumber: '027-540112',
  },
  {
    id: 'cs-chitwan-ratnanagar',
    name: 'Chitwan Central Multi-Chamber Cold Store',
    location: 'Ratnanagar-2',
    district: 'Chitwan',
    capacityMetricTons: 5000,
    facilityType: 'Multi-Chamber Commercial',
    corridor: 'East-West Highway (Narayangarh–Hetauda)',
    tariffPerKgPerMonthNpr: 1.8,
    contactNumber: '056-560245',
  },
  {
    id: 'cs-kavre-panauti',
    name: 'Panauti Agro Processing & Cold Storage Hub',
    location: 'Panauti-4',
    district: 'Kavrepalanchok',
    capacityMetricTons: 3500,
    facilityType: 'Multi-Chamber Commercial',
    corridor: 'Araniko / BP Highway (Banepa–Sindhuli)',
    tariffPerKgPerMonthNpr: 2.0,
    contactNumber: '011-440332',
  },
  {
    id: 'cs-kaski-pokhara',
    name: 'Pokhara Regional Valley Cold Storage',
    location: 'Kundahar, Pokhara-14',
    district: 'Kaski',
    capacityMetricTons: 4000,
    facilityType: 'Government CA (Controlled Atmosphere)',
    corridor: 'Prithvi Highway (Mugling–Pokhara)',
    tariffPerKgPerMonthNpr: 2.1,
    contactNumber: '061-532190',
  },
  {
    id: 'cs-banke-nepalgunj',
    name: 'Mid-Western Agricultural Cold Hub',
    location: 'Karkando, Nepalgunj-18',
    district: 'Banke',
    capacityMetricTons: 6000,
    facilityType: 'Multi-Chamber Commercial',
    corridor: 'Ratna Highway (Nepalgunj–Surkhet)',
    tariffPerKgPerMonthNpr: 1.7,
    contactNumber: '081-521088',
  },
  {
    id: 'cs-mustang-marpha',
    name: 'Marpha Controlled Atmosphere Apple Store',
    location: 'Marpha, Gharapjhong-2',
    district: 'Mustang',
    capacityMetricTons: 800,
    facilityType: 'Government CA (Controlled Atmosphere)',
    corridor: 'Beni–Jomsom Mountain Corridor',
    tariffPerKgPerMonthNpr: 2.8,
    contactNumber: '069-440012',
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

  if (normCrop.includes('rice') || normCrop.includes('paddy') || normCrop.includes('maize') || normCrop.includes('wheat')) {
    cropCategory = 'Grains & Cereals';
    lossPct = 14.8;
  } else if (normCrop.includes('cardamom') || normCrop.includes('ginger') || normCrop.includes('tea') || normCrop.includes('coffee')) {
    cropCategory = 'Perennial Spices';
    lossPct = 18.2;
  } else if (normCrop.includes('potato')) {
    cropCategory = 'Tubers & Roots';
    lossPct = 22.0;
  } else if (normCrop.includes('apple') || normCrop.includes('tomato') || normCrop.includes('orange')) {
    cropCategory = 'Fruits & Vegetables';
    lossPct = 36.5;
  }

  const financialLossNpr = Math.round(farmgateRevenueNpr * (lossPct / 100));

  // Find closest cold storage
  const dNorm = districtName.toLowerCase();
  let nearestColdStorage = NEPAL_COLD_STORAGE_REGISTRY[1]; // Default Chitwan
  let distanceKm = 45;

  const directMatch = NEPAL_COLD_STORAGE_REGISTRY.find(c => c.district.toLowerCase() === dNorm);
  if (directMatch) {
    nearestColdStorage = directMatch;
    distanceKm = 18;
  } else if (['taplejung', 'panchthar', 'sankhuwasabha', 'dhankuta', 'jhapa', 'morang'].includes(dNorm)) {
    nearestColdStorage = NEPAL_COLD_STORAGE_REGISTRY[0]; // Ilam
    distanceKm = 72;
  } else if (['bhaktapur', 'lalitpur', 'kathmandu', 'sindhupalchok', 'dhading', 'nuwakot'].includes(dNorm)) {
    nearestColdStorage = NEPAL_COLD_STORAGE_REGISTRY[2]; // Panauti
    distanceKm = 34;
  } else if (['syangja', 'tanahun', 'lamjung', 'parbat', 'myagdi', 'baglung'].includes(dNorm)) {
    nearestColdStorage = NEPAL_COLD_STORAGE_REGISTRY[3]; // Pokhara
    distanceKm = 48;
  } else if (['surkhet', 'bardiya', 'dang', 'salyan', 'dailekh'].includes(dNorm)) {
    nearestColdStorage = NEPAL_COLD_STORAGE_REGISTRY[4]; // Nepalgunj
    distanceKm = 65;
  } else if (['jumla', 'dolpa', 'manang', 'mustang'].includes(dNorm)) {
    nearestColdStorage = NEPAL_COLD_STORAGE_REGISTRY[5]; // Marpha
    distanceKm = 52;
  }

  // Road transport delay risk
  let roadType: PostHarvestLossModel['roadTransportDisruptionRisk']['roadType'] = 'Feeder Asphalt Road';
  let monsoonTransitDelayHours = 8;
  let spoilageAccelerationPct = 14;

  if (distanceKm > 60 || ['mustang', 'jumla', 'taplejung', 'sankhuwasabha'].includes(dNorm)) {
    roadType = 'Earthen Mountain Track';
    monsoonTransitDelayHours = 28; // Landslides / roadblocks
    spoilageAccelerationPct = 24;
  } else if (['chitwan', 'jhapa', 'morang', 'kailali', 'rupandehi'].includes(dNorm)) {
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
      { factor: 'Lack of Farmgate Pre-Cooling & Cold Storage', sharePct: 45, mechanism: 'Rapid enzymatic degradation and respiration heat accumulation in ambient mountain summer temperatures.' },
      { factor: 'Monsoon Roadway Landslide Transit Delays', sharePct: 30, mechanism: 'Vehicle stranding along landslide-prone highway bottlenecks (e.g. Mugling-Narayangarh, BP Highway).' },
      { factor: 'Sub-standard Jute / Poly-Bag Packaging', sharePct: 25, mechanism: 'Mechanical compression damage and puncture bruising during rough transit on earthen rural roads.' },
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
