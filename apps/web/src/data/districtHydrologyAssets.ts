// ─── COMPREHENSIVE HYDROLOGY, LAKES & GLACIERS DATASET ───
// Verified from DHM National River Network & ICIMOD Glacial Lakes Inventories.

export interface DetailedGlacialLake {
  name: string;
  district: string;
  altitude: number;
  areaSqM: number;
  areaHa: number;
  depthM: number;
  volumeMcm: number;
  hazardLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
  basin: string;
  lat: number;
  lng: number;
}

export interface LakeAltitudeDistribution {
  totalLakes: number;
  lowlandUnder100m: number;
  foothill100to499m: number;
  midHill500to1999m: number;
  montane2000to2999m: number;
  alpine3000to4999m: number;
  highNivalAbove5000m: number;
}

export interface DHMRiverStation {
  stationNo: string;
  river: string;
  siteName: string;
  lat: number;
  lng: number;
  elevation: number;
  instruments: string;
  startDate: string;
}

export const DANGEROUS_GLACIAL_LAKES_BY_DISTRICT: Record<string, DetailedGlacialLake[]> = {
  "sankhuwasabha": [
    {
      "name": "Lower Barun",
      "district": "sankhuwasabha",
      "altitude": 4550,
      "areaSqM": 100000,
      "areaHa": 10.0,
      "depthM": 118,
      "volumeMcm": 112.3,
      "hazardLevel": "Critical",
      "basin": "Arun / Koshi",
      "lat": 27.7915,
      "lng": 87.0984
    }
  ],
  "solukhumbu": [
    {
      "name": "Lumding Tsho",
      "district": "solukhumbu",
      "altitude": 4846,
      "areaSqM": 104943,
      "areaHa": 10.49,
      "depthM": 64,
      "volumeMcm": 48.5,
      "hazardLevel": "Critical",
      "basin": "Dudhkoshi / Koshi",
      "lat": 27.7833,
      "lng": 86.6167
    },
    {
      "name": "Dig Tsho",
      "district": "solukhumbu",
      "altitude": 4364,
      "areaSqM": 143249,
      "areaHa": 14.32,
      "depthM": 42,
      "volumeMcm": 32.0,
      "hazardLevel": "High",
      "basin": "Bhote Koshi / Koshi",
      "lat": 27.8767,
      "lng": 86.5867
    },
    {
      "name": "Imja Tsho",
      "district": "solukhumbu",
      "altitude": 5023,
      "areaSqM": 48811,
      "areaHa": 4.88,
      "depthM": 149.8,
      "volumeMcm": 78.2,
      "hazardLevel": "Critical",
      "basin": "Imja Khola / Koshi",
      "lat": 27.9011,
      "lng": 86.9264
    },
    {
      "name": "Tam Pokhari",
      "district": "solukhumbu",
      "altitude": 4431,
      "areaSqM": 138846,
      "areaHa": 13.88,
      "depthM": 38,
      "volumeMcm": 24.1,
      "hazardLevel": "High",
      "basin": "Inkhu Khola / Koshi",
      "lat": 27.7417,
      "lng": 86.8458
    },
    {
      "name": "Dudh Pokhari",
      "district": "solukhumbu",
      "altitude": 4760,
      "areaSqM": 274296,
      "areaHa": 27.43,
      "depthM": 72,
      "volumeMcm": 54.0,
      "hazardLevel": "Critical",
      "basin": "Dudhkoshi / Koshi",
      "lat": 27.9583,
      "lng": 86.6833
    },
    {
      "name": "Unnamed 1",
      "district": "solukhumbu",
      "altitude": 5266,
      "areaSqM": 133752,
      "areaHa": 13.38,
      "depthM": 50,
      "volumeMcm": 5.35,
      "hazardLevel": "Critical",
      "basin": "Koshi River Basin",
      "lat": 28.0,
      "lng": 86.85000000000001
    },
    {
      "name": "Unnamed 2",
      "district": "solukhumbu",
      "altitude": 5056,
      "areaSqM": 112398,
      "areaHa": 11.24,
      "depthM": 50,
      "volumeMcm": 4.5,
      "hazardLevel": "Critical",
      "basin": "Koshi River Basin",
      "lat": 28.03,
      "lng": 86.88000000000001
    },
    {
      "name": "Hungu",
      "district": "solukhumbu",
      "altitude": 5181,
      "areaSqM": 198905,
      "areaHa": 19.89,
      "depthM": 55,
      "volumeMcm": 41.2,
      "hazardLevel": "Critical",
      "basin": "Hungu Khola / Koshi",
      "lat": 27.8167,
      "lng": 86.95
    },
    {
      "name": "East Hungu 1",
      "district": "solukhumbu",
      "altitude": 5379,
      "areaSqM": 78760,
      "areaHa": 7.88,
      "depthM": 40,
      "volumeMcm": 20.0,
      "hazardLevel": "High",
      "basin": "Hungu Khola / Koshi",
      "lat": 27.8333,
      "lng": 86.9667
    },
    {
      "name": "East Hungu 2",
      "district": "solukhumbu",
      "altitude": 5483,
      "areaSqM": 211877,
      "areaHa": 21.19,
      "depthM": 60,
      "volumeMcm": 45.0,
      "hazardLevel": "Critical",
      "basin": "Hungu Khola / Koshi",
      "lat": 27.85,
      "lng": 86.9833
    },
    {
      "name": "Unnamed 3",
      "district": "solukhumbu",
      "altitude": 5205,
      "areaSqM": 349396,
      "areaHa": 34.94,
      "depthM": 50,
      "volumeMcm": 13.98,
      "hazardLevel": "Critical",
      "basin": "Koshi River Basin",
      "lat": 28.150000000000002,
      "lng": 87.0
    },
    {
      "name": "West Chamjang",
      "district": "solukhumbu",
      "altitude": 4983,
      "areaSqM": 6446,
      "areaHa": 0.64,
      "depthM": 30,
      "volumeMcm": 12.0,
      "hazardLevel": "Moderate",
      "basin": "Koshi",
      "lat": 27.9833,
      "lng": 86.9167
    },
    {
      "name": "Unnamed 7",
      "district": "solukhumbu",
      "altitude": 5452,
      "areaSqM": 1015173,
      "areaHa": 101.52,
      "depthM": 50,
      "volumeMcm": 40.61,
      "hazardLevel": "Critical",
      "basin": "Koshi River Basin",
      "lat": 28.21,
      "lng": 87.06
    }
  ],
  "dolakha": [
    {
      "name": "Tsho Rolpa",
      "district": "dolakha",
      "altitude": 4556,
      "areaSqM": 231693,
      "areaHa": 23.17,
      "depthM": 132,
      "volumeMcm": 85.9,
      "hazardLevel": "Critical",
      "basin": "Rolwaling / Tamakoshi",
      "lat": 27.8592,
      "lng": 86.4806
    }
  ],
  "taplejung": [
    {
      "name": "Unnamed 4",
      "district": "taplejung",
      "altitude": 4876,
      "areaSqM": 179820,
      "areaHa": 17.98,
      "depthM": 50,
      "volumeMcm": 7.19,
      "hazardLevel": "Critical",
      "basin": "Koshi River Basin",
      "lat": 27.85,
      "lng": 86.7
    },
    {
      "name": "Nagma Pokhari",
      "district": "taplejung",
      "altitude": 4907,
      "areaSqM": 18971,
      "areaHa": 1.9,
      "depthM": 45,
      "volumeMcm": 18.5,
      "hazardLevel": "High",
      "basin": "Tamor / Koshi",
      "lat": 27.7125,
      "lng": 87.9542
    }
  ],
  "gorkha": [
    {
      "name": "Unnamed 5",
      "district": "gorkha",
      "altitude": 3590,
      "areaSqM": 81520,
      "areaHa": 8.15,
      "depthM": 50,
      "volumeMcm": 3.26,
      "hazardLevel": "High",
      "basin": "Koshi River Basin",
      "lat": 27.85,
      "lng": 86.7
    },
    {
      "name": "Thulagi",
      "district": "gorkha",
      "altitude": 3825,
      "areaSqM": 223385,
      "areaHa": 22.34,
      "depthM": 81,
      "volumeMcm": 36.4,
      "hazardLevel": "Critical",
      "basin": "Dona Khola / Marsyangdi",
      "lat": 28.4981,
      "lng": 84.4842
    }
  ],
  "mustang": [
    {
      "name": "Unnamed 6",
      "district": "mustang",
      "altitude": 5419,
      "areaSqM": 149544,
      "areaHa": 14.95,
      "depthM": 50,
      "volumeMcm": 5.98,
      "hazardLevel": "Critical",
      "basin": "Koshi River Basin",
      "lat": 27.85,
      "lng": 86.7
    }
  ]
};

export const LAKE_ALTITUDE_DISTRIBUTION: Record<string, LakeAltitudeDistribution> = {
  "taplejung": {
    "totalLakes": 380,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 0,
    "montane2000to2999m": 2,
    "alpine3000to4999m": 297,
    "highNivalAbove5000m": 81
  },
  "panchthar": {
    "totalLakes": 17,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 2,
    "montane2000to2999m": 8,
    "alpine3000to4999m": 7,
    "highNivalAbove5000m": 0
  },
  "ilam": {
    "totalLakes": 30,
    "lowlandUnder100m": 0,
    "foothill100to499m": 14,
    "midHill500to1999m": 14,
    "montane2000to2999m": 1,
    "alpine3000to4999m": 1,
    "highNivalAbove5000m": 0
  },
  "jhapa": {
    "totalLakes": 136,
    "lowlandUnder100m": 59,
    "foothill100to499m": 78,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "morang": {
    "totalLakes": 184,
    "lowlandUnder100m": 123,
    "foothill100to499m": 60,
    "midHill500to1999m": 1,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "sunsari": {
    "totalLakes": 69,
    "lowlandUnder100m": 41,
    "foothill100to499m": 28,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "dhankuta": {
    "totalLakes": 4,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 4,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "terathum": {
    "totalLakes": 4,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 2,
    "montane2000to2999m": 2,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "sankhuwasabha": {
    "totalLakes": 159,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 3,
    "montane2000to2999m": 4,
    "alpine3000to4999m": 109,
    "highNivalAbove5000m": 43
  },
  "bhojpur": {
    "totalLakes": 7,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 5,
    "montane2000to2999m": 1,
    "alpine3000to4999m": 1,
    "highNivalAbove5000m": 0
  },
  "solukhumbu": {
    "totalLakes": 339,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 1,
    "montane2000to2999m": 1,
    "alpine3000to4999m": 112,
    "highNivalAbove5000m": 225
  },
  "okhaldhunga": {
    "totalLakes": 0,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "khotang": {
    "totalLakes": 10,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 4,
    "montane2000to2999m": 5,
    "alpine3000to4999m": 1,
    "highNivalAbove5000m": 0
  },
  "udaypur": {
    "totalLakes": 14,
    "lowlandUnder100m": 4,
    "foothill100to499m": 4,
    "midHill500to1999m": 6,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "saptari": {
    "totalLakes": 46,
    "lowlandUnder100m": 35,
    "foothill100to499m": 11,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "siraha": {
    "totalLakes": 140,
    "lowlandUnder100m": 67,
    "foothill100to499m": 73,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "dhanusha": {
    "totalLakes": 230,
    "lowlandUnder100m": 193,
    "foothill100to499m": 37,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "mahottari": {
    "totalLakes": 186,
    "lowlandUnder100m": 173,
    "foothill100to499m": 13,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "sarlahi": {
    "totalLakes": 74,
    "lowlandUnder100m": 47,
    "foothill100to499m": 27,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "sindhuli": {
    "totalLakes": 9,
    "lowlandUnder100m": 0,
    "foothill100to499m": 4,
    "midHill500to1999m": 5,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "ramechhap": {
    "totalLakes": 25,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 1,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 21,
    "highNivalAbove5000m": 3
  },
  "dolakha": {
    "totalLakes": 42,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 3,
    "montane2000to2999m": 5,
    "alpine3000to4999m": 23,
    "highNivalAbove5000m": 11
  },
  "sindhupalchwok": {
    "totalLakes": 75,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 12,
    "montane2000to2999m": 5,
    "alpine3000to4999m": 58,
    "highNivalAbove5000m": 0
  },
  "kavrepalanchok": {
    "totalLakes": 1,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 1,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "lalitpur": {
    "totalLakes": 3,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 3,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "bhaktapur": {
    "totalLakes": 2,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 2,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "kathmandu": {
    "totalLakes": 1,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 1,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "nuwakot": {
    "totalLakes": 3,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 0,
    "montane2000to2999m": 1,
    "alpine3000to4999m": 2,
    "highNivalAbove5000m": 0
  },
  "rasuwa": {
    "totalLakes": 38,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 34,
    "highNivalAbove5000m": 4
  },
  "dhading": {
    "totalLakes": 5,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 5,
    "highNivalAbove5000m": 0
  },
  "makwanpur": {
    "totalLakes": 2,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 1,
    "montane2000to2999m": 1,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "rautahat": {
    "totalLakes": 85,
    "lowlandUnder100m": 68,
    "foothill100to499m": 17,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "bara": {
    "totalLakes": 93,
    "lowlandUnder100m": 75,
    "foothill100to499m": 18,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "parsa": {
    "totalLakes": 71,
    "lowlandUnder100m": 63,
    "foothill100to499m": 8,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "chitwan": {
    "totalLakes": 40,
    "lowlandUnder100m": 0,
    "foothill100to499m": 40,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "gorkha": {
    "totalLakes": 36,
    "lowlandUnder100m": 0,
    "foothill100to499m": 1,
    "midHill500to1999m": 5,
    "montane2000to2999m": 3,
    "alpine3000to4999m": 26,
    "highNivalAbove5000m": 1
  },
  "lamjung": {
    "totalLakes": 23,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 5,
    "montane2000to2999m": 4,
    "alpine3000to4999m": 14,
    "highNivalAbove5000m": 0
  },
  "tanahun": {
    "totalLakes": 2,
    "lowlandUnder100m": 0,
    "foothill100to499m": 1,
    "midHill500to1999m": 1,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "syangja": {
    "totalLakes": 4,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 1,
    "montane2000to2999m": 3,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "kaski": {
    "totalLakes": 29,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 22,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 7,
    "highNivalAbove5000m": 0
  },
  "manang": {
    "totalLakes": 66,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 26,
    "highNivalAbove5000m": 40
  },
  "mustang": {
    "totalLakes": 78,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 0,
    "montane2000to2999m": 2,
    "alpine3000to4999m": 5,
    "highNivalAbove5000m": 71
  },
  "myagdi": {
    "totalLakes": 33,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 5,
    "montane2000to2999m": 14,
    "alpine3000to4999m": 13,
    "highNivalAbove5000m": 1
  },
  "parbat": {
    "totalLakes": 5,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 5,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "baglung": {
    "totalLakes": 60,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 15,
    "montane2000to2999m": 37,
    "alpine3000to4999m": 8,
    "highNivalAbove5000m": 0
  },
  "gulmi": {
    "totalLakes": 11,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 7,
    "montane2000to2999m": 4,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "palpa": {
    "totalLakes": 12,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 12,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "nawalparasi": {
    "totalLakes": 163,
    "lowlandUnder100m": 0,
    "foothill100to499m": 163,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "rupandehi": {
    "totalLakes": 289,
    "lowlandUnder100m": 131,
    "foothill100to499m": 158,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "kapilvastu": {
    "totalLakes": 351,
    "lowlandUnder100m": 190,
    "foothill100to499m": 161,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "arghakhanchi": {
    "totalLakes": 3,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 3,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "pyuthan": {
    "totalLakes": 19,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 13,
    "montane2000to2999m": 6,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "rolpa": {
    "totalLakes": 16,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 11,
    "montane2000to2999m": 1,
    "alpine3000to4999m": 4,
    "highNivalAbove5000m": 0
  },
  "rukum": {
    "totalLakes": 70,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 13,
    "montane2000to2999m": 14,
    "alpine3000to4999m": 31,
    "highNivalAbove5000m": 12
  },
  "salyan": {
    "totalLakes": 5,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 5,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "dang": {
    "totalLakes": 38,
    "lowlandUnder100m": 0,
    "foothill100to499m": 8,
    "midHill500to1999m": 30,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "banke": {
    "totalLakes": 243,
    "lowlandUnder100m": 0,
    "foothill100to499m": 243,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "bardiya": {
    "totalLakes": 82,
    "lowlandUnder100m": 0,
    "foothill100to499m": 82,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "surkhet": {
    "totalLakes": 22,
    "lowlandUnder100m": 0,
    "foothill100to499m": 1,
    "midHill500to1999m": 21,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "dailekh": {
    "totalLakes": 7,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 5,
    "montane2000to2999m": 2,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "jajarkot": {
    "totalLakes": 16,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 16,
    "highNivalAbove5000m": 0
  },
  "dolpa": {
    "totalLakes": 210,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 47,
    "highNivalAbove5000m": 163
  },
  "jumla": {
    "totalLakes": 99,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 0,
    "montane2000to2999m": 1,
    "alpine3000to4999m": 97,
    "highNivalAbove5000m": 1
  },
  "kalikot": {
    "totalLakes": 1,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 1,
    "highNivalAbove5000m": 0
  },
  "mugu": {
    "totalLakes": 125,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 0,
    "montane2000to2999m": 3,
    "alpine3000to4999m": 93,
    "highNivalAbove5000m": 29
  },
  "humla": {
    "totalLakes": 381,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 0,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 147,
    "highNivalAbove5000m": 234
  },
  "bajura": {
    "totalLakes": 57,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 0,
    "montane2000to2999m": 5,
    "alpine3000to4999m": 45,
    "highNivalAbove5000m": 7
  },
  "bajhang": {
    "totalLakes": 25,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 0,
    "montane2000to2999m": 2,
    "alpine3000to4999m": 19,
    "highNivalAbove5000m": 4
  },
  "achham": {
    "totalLakes": 13,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 3,
    "montane2000to2999m": 7,
    "alpine3000to4999m": 3,
    "highNivalAbove5000m": 0
  },
  "doti": {
    "totalLakes": 19,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 9,
    "montane2000to2999m": 4,
    "alpine3000to4999m": 6,
    "highNivalAbove5000m": 0
  },
  "kailali": {
    "totalLakes": 114,
    "lowlandUnder100m": 0,
    "foothill100to499m": 113,
    "midHill500to1999m": 1,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "kanchanpur": {
    "totalLakes": 85,
    "lowlandUnder100m": 2,
    "foothill100to499m": 79,
    "midHill500to1999m": 4,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "dadheldhura": {
    "totalLakes": 2,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 2,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "baitadi": {
    "totalLakes": 1,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 1,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 0,
    "highNivalAbove5000m": 0
  },
  "darchula": {
    "totalLakes": 19,
    "lowlandUnder100m": 0,
    "foothill100to499m": 0,
    "midHill500to1999m": 1,
    "montane2000to2999m": 0,
    "alpine3000to4999m": 16,
    "highNivalAbove5000m": 2
  }
};

export const DHM_RIVER_STATIONS_BY_DISTRICT: Record<string, DHMRiverStation[]> = {
  "kaski": [
    {
      "stationNo": "120",
      "river": "Chamelia",
      "siteName": "Karkale Gaon",
      "lat": 29.67222,
      "lng": 80.55833,
      "elevation": 685,
      "instruments": "Cable Way",
      "startDate": "1965-01-01"
    },
    {
      "stationNo": "169",
      "river": "Surnaya Gad",
      "siteName": "Gujar Gaon",
      "lat": 29.51667,
      "lng": 80.58333,
      "elevation": 1275,
      "instruments": "Cable Way",
      "startDate": "1983-05-11"
    },
    {
      "stationNo": "240",
      "river": "Karnali",
      "siteName": "Asaraghat",
      "lat": 29.95278,
      "lng": 81.44167,
      "elevation": 629,
      "instruments": "Cable Way",
      "startDate": "1961-01-01"
    },
    {
      "stationNo": "250",
      "river": "Karnali",
      "siteName": "Benighat",
      "lat": 28.96111,
      "lng": 81.11944,
      "elevation": 320,
      "instruments": "Cable Way",
      "startDate": "1963-02-01"
    },
    {
      "stationNo": "260",
      "river": "West Seti",
      "siteName": "Banga",
      "lat": 28.97778,
      "lng": 81.14444,
      "elevation": 328,
      "instruments": "Recorder- Cableway- S",
      "startDate": "1963-02-06"
    },
    {
      "stationNo": "270",
      "river": "Bheri",
      "siteName": "Jamu",
      "lat": 28.75556,
      "lng": 81.35,
      "elevation": 246,
      "instruments": "Cable Way",
      "startDate": "1963-01-23"
    },
    {
      "stationNo": "286",
      "river": "Sarada Khola",
      "siteName": "Daredhunga",
      "lat": 28.29944,
      "lng": 82.025,
      "elevation": 579,
      "instruments": "Cable Way",
      "startDate": "1972-01-01"
    },
    {
      "stationNo": "290",
      "river": "Babai River",
      "siteName": "Chepang",
      "lat": 28.34139,
      "lng": 82.4,
      "elevation": 325,
      "instruments": "Cable Way",
      "startDate": "1989-10-01"
    },
    {
      "stationNo": "350",
      "river": "Rapti River",
      "siteName": "Bagasoti Gaun",
      "lat": 27.9,
      "lng": 82.85,
      "elevation": 381,
      "instruments": "Cableway- Recorder- Rain Gauge- V",
      "startDate": "1975-08-05"
    },
    {
      "stationNo": "360",
      "river": "Rapti River",
      "siteName": "Jalkundi",
      "lat": 27.94722,
      "lng": 82.225,
      "elevation": 218,
      "instruments": "Cable Way",
      "startDate": "1964-04-08"
    },
    {
      "stationNo": "375",
      "river": "Rapti River",
      "siteName": "Kusum",
      "lat": 28.0075,
      "lng": 82.09306,
      "elevation": 235,
      "instruments": "W",
      "startDate": "2002-12-21"
    },
    {
      "stationNo": "390",
      "river": "Tinau",
      "siteName": "Butwal",
      "lat": 27.70278,
      "lng": 83.46389,
      "elevation": 184,
      "instruments": "Cable Way",
      "startDate": "1963-12-09"
    },
    {
      "stationNo": "415",
      "river": "Andhi Khola",
      "siteName": "Borlangpul",
      "lat": 27.97222,
      "lng": 83.58889,
      "elevation": 749,
      "instruments": "-",
      "startDate": "1964-04-01"
    },
    {
      "stationNo": "419",
      "river": "Kali Gandaki",
      "siteName": "Angsing",
      "lat": 27.89,
      "lng": 83.8,
      "elevation": 351,
      "instruments": "Cableway- Recorder- Rain Gauge- V",
      "startDate": "1989-04-13"
    },
    {
      "stationNo": "420",
      "river": "Kali Gandaki",
      "siteName": "Kota Gaon",
      "lat": 27.75,
      "lng": 84.34722,
      "elevation": 198,
      "instruments": "Cable Way",
      "startDate": "1964-04-15"
    },
    {
      "stationNo": "440",
      "river": "Chepe Khola",
      "siteName": "Garambesi",
      "lat": 28.06139,
      "lng": 84.48972,
      "elevation": 442,
      "instruments": "Cable Way",
      "startDate": "1963-11-20"
    },
    {
      "stationNo": "445",
      "river": "Budhi Gandaki",
      "siteName": "Arughat",
      "lat": 28.04361,
      "lng": 84.81639,
      "elevation": 485,
      "instruments": "Cableway- Recorder- G",
      "startDate": "1963-11-28"
    },
    {
      "stationNo": "448",
      "river": "Tadi Khola",
      "siteName": "Belkot",
      "lat": 27.85972,
      "lng": 85.13833,
      "elevation": 610,
      "instruments": "Cable Way",
      "startDate": "1968-04-17"
    },
    {
      "stationNo": "460",
      "river": "Rapti River",
      "siteName": "Rajaiya",
      "lat": 27.44167,
      "lng": 84.97083,
      "elevation": 332,
      "instruments": "Cable Way",
      "startDate": "1963-01-01"
    },
    {
      "stationNo": "465",
      "river": "Manahari River",
      "siteName": "Manahari",
      "lat": 27.55,
      "lng": 84.80278,
      "elevation": 305,
      "instruments": "Cable Way",
      "startDate": "1963-06-13"
    },
    {
      "stationNo": "470",
      "river": "Lothar",
      "siteName": "Lothar",
      "lat": 27.59444,
      "lng": 84.71667,
      "elevation": 336,
      "instruments": "Cable Way",
      "startDate": "1963-11-30"
    },
    {
      "stationNo": "505",
      "river": "Bagmati River",
      "siteName": "Sundarijal",
      "lat": 27.775,
      "lng": 85.42778,
      "elevation": 1600,
      "instruments": "Cableway- Recorder",
      "startDate": "1962-12-07"
    },
    {
      "stationNo": "550",
      "river": "Bagmati River",
      "siteName": "Khokana",
      "lat": 27.26667,
      "lng": 85.21667,
      "elevation": 1255,
      "instruments": "-",
      "startDate": "1991-06-01"
    },
    {
      "stationNo": "589",
      "river": "Bagmati River",
      "siteName": "Pendheradovan",
      "lat": 27.10556,
      "lng": 85.475,
      "elevation": 127,
      "instruments": "Cableway- Rain Gauge- W",
      "startDate": "1978-01-28"
    },
    {
      "stationNo": "602",
      "river": "Sabhaya Khola",
      "siteName": "Tumlingtar",
      "lat": 27.30556,
      "lng": 87.22083,
      "elevation": 305,
      "instruments": "Cable Way",
      "startDate": "1974-01-02"
    },
    {
      "stationNo": "602",
      "river": "Hinwa Khola",
      "siteName": "Pipletar",
      "lat": 27.29583,
      "lng": 87.225,
      "elevation": 500,
      "instruments": "Cable Way",
      "startDate": "0000-00-00"
    },
    {
      "stationNo": "620",
      "river": "Balephi Khola",
      "siteName": "Jalbire",
      "lat": 27.80556,
      "lng": 85.76944,
      "elevation": 793,
      "instruments": "Cable Way",
      "startDate": "1963-12-25"
    },
    {
      "stationNo": "625",
      "river": "Sunkoshi River",
      "siteName": "Dolalghat",
      "lat": 28.64167,
      "lng": 85.71667,
      "elevation": 500,
      "instruments": "Cable Way",
      "startDate": "0000-00-00"
    },
    {
      "stationNo": "627",
      "river": "Melanchi Khola",
      "siteName": "Helambu",
      "lat": 28.04167,
      "lng": 85.53333,
      "elevation": 2134,
      "instruments": "Cable Way",
      "startDate": "0000-00-00"
    },
    {
      "stationNo": "629",
      "river": "Indrawati River",
      "siteName": "Dolalghat",
      "lat": 27.63889,
      "lng": 85.70833,
      "elevation": 500,
      "instruments": "Cable Way",
      "startDate": "1972-09-17"
    },
    {
      "stationNo": "630",
      "river": "Sunkoshi River",
      "siteName": "PachuwaRain Gaugehat",
      "lat": 27.55833,
      "lng": 85.75278,
      "elevation": 589,
      "instruments": "Cableway- Recorder- Rain Gauge-V",
      "startDate": "1964-03-26"
    },
    {
      "stationNo": "650",
      "river": "Khimti Khola",
      "siteName": "Rasnalu",
      "lat": 27.575,
      "lng": 86.19722,
      "elevation": 1520,
      "instruments": "Cable Way",
      "startDate": "1964-04-06"
    },
    {
      "stationNo": "652",
      "river": "Sunkoshi River",
      "siteName": "Khurkot",
      "lat": 27.33333,
      "lng": 86.0,
      "elevation": 455,
      "instruments": "Cable Way",
      "startDate": "1967-07-01"
    },
    {
      "stationNo": "660",
      "river": "Likhu Khola",
      "siteName": "Sangutar",
      "lat": 27.33611,
      "lng": 86.21944,
      "elevation": 543,
      "instruments": "Cable Way",
      "startDate": "1964-03-24"
    },
    {
      "stationNo": "665",
      "river": "Sunkoshi River",
      "siteName": "Tokselghat",
      "lat": 27.175,
      "lng": 86.36667,
      "elevation": 500,
      "instruments": "Cable Way",
      "startDate": "1986-02-20"
    },
    {
      "stationNo": "684",
      "river": "Tamor River",
      "siteName": "Majhitar",
      "lat": 27.15833,
      "lng": 87.7125,
      "elevation": 533,
      "instruments": "Cableway- Recorder- Rain Gauge- V",
      "startDate": "0000-00-00"
    },
    {
      "stationNo": "690",
      "river": "Tamor River",
      "siteName": "Mulghat",
      "lat": 26.93056,
      "lng": 87.32917,
      "elevation": 276,
      "instruments": "-",
      "startDate": "1977-10-01"
    },
    {
      "stationNo": "695",
      "river": "Saptakoshi River",
      "siteName": "Chatara",
      "lat": 26.86667,
      "lng": 87.15833,
      "elevation": 140,
      "instruments": "Cableway- Recorder- Rain Gauge- V",
      "startDate": "1977-10-01"
    },
    {
      "stationNo": "738",
      "river": "Maikhola",
      "siteName": "Rajdwali",
      "lat": 26.87917,
      "lng": 87.92917,
      "elevation": 609,
      "instruments": "Cable Way",
      "startDate": "1983-01-01"
    },
    {
      "stationNo": "795",
      "river": "Kankai River",
      "siteName": "Mainachuli",
      "lat": 26.68667,
      "lng": 87.87833,
      "elevation": 125,
      "instruments": "Cableway- Recorder- Rain Gauge- V",
      "startDate": "1971-05-01"
    }
  ],
  "syangja": [
    {
      "stationNo": "410",
      "river": "Kali Gandaki",
      "siteName": "Seti Beni",
      "lat": 28.00833,
      "lng": 83.60278,
      "elevation": 546,
      "instruments": "Cable Way",
      "startDate": "1964-02-21"
    }
  ],
  "tanahun": [
    {
      "stationNo": "439",
      "river": "Marsandi River",
      "siteName": "Bimalnagar",
      "lat": 27.95,
      "lng": 84.43,
      "elevation": 354,
      "instruments": "Cable Way",
      "startDate": "1987-03-31"
    }
  ],
  "rasuwa": [
    {
      "stationNo": "446",
      "river": "Phalanku Khola",
      "siteName": "Betrawati",
      "lat": 27.97361,
      "lng": 85.1875,
      "elevation": 630,
      "instruments": "-",
      "startDate": "1969-04-24"
    },
    {
      "stationNo": "447",
      "river": "Trisuli River",
      "siteName": "Betrawati",
      "lat": 27.96889,
      "lng": 85.18333,
      "elevation": 600,
      "instruments": "Recorder- Cableway- Rain Gauge",
      "startDate": "1967-01-04"
    }
  ],
  "chitwan": [
    {
      "stationNo": "450",
      "river": "Narayani River",
      "siteName": "Devghat",
      "lat": 27.70833,
      "lng": 84.43056,
      "elevation": 180,
      "instruments": "Recorder-Cableway- Rain Gauge",
      "startDate": "1962-10-02"
    }
  ],
  "sankhuwasabha": [
    {
      "stationNo": "600",
      "river": "Arun River",
      "siteName": "Uwa Goan",
      "lat": 27.6,
      "lng": 87.335,
      "elevation": 1294,
      "instruments": "Cable Way",
      "startDate": "1972-05-11"
    },
    {
      "stationNo": "604",
      "river": "Arun River",
      "siteName": "Turkeghat",
      "lat": 27.33333,
      "lng": 87.19167,
      "elevation": 414,
      "instruments": "Cableway-Recorder- Rain Gauge- V",
      "startDate": "1975-05-23"
    },
    {
      "stationNo": "606",
      "river": "Arun River",
      "siteName": "Simle",
      "lat": 26.925,
      "lng": 87.15833,
      "elevation": 152,
      "instruments": "Cable Way",
      "startDate": "0000-00-00"
    }
  ],
  "sindhupalchok": [
    {
      "stationNo": "610",
      "river": "Bhote Koshi",
      "siteName": "Barhbise",
      "lat": 27.78611,
      "lng": 85.88889,
      "elevation": 840,
      "instruments": "-",
      "startDate": "1965-02-17"
    }
  ],
  "dolakha": [
    {
      "stationNo": "647",
      "river": "Tamakoshi River",
      "siteName": "Busti",
      "lat": 27.63472,
      "lng": 86.08667,
      "elevation": 849,
      "instruments": "Cable Way",
      "startDate": "1970-01-14"
    }
  ],
  "solukhumbu": [
    {
      "stationNo": "670",
      "river": "Dudhkoshi River",
      "siteName": "Rabuwa Bazar",
      "lat": 27.26667,
      "lng": 86.66389,
      "elevation": 460,
      "instruments": "Cableway- Recorder- Rain Gauge- V",
      "startDate": "1964-10-03"
    }
  ]
};

export const BASIN_GLACIATION_STATISTICS = {
  "koshi": {
    "glaciersCount": 845,
    "glaciersAreaSqKm": 1103,
    "glacialLakesCount": 599,
    "glacialLakesAreaSqKm": 26.0
  },
  "gandaki": {
    "glaciersCount": 1340,
    "glaciersAreaSqKm": 1665,
    "glacialLakesCount": 116,
    "glacialLakesAreaSqKm": 9.54
  },
  "karnali": {
    "glaciersCount": 1459,
    "glaciersAreaSqKm": 1023,
    "glacialLakesCount": 742,
    "glacialLakesAreaSqKm": 29.15
  },
  "mahakali": {
    "glaciersCount": 164,
    "glaciersAreaSqKm": 112.5,
    "glacialLakesCount": 9,
    "glacialLakesAreaSqKm": 0.14
  }
};
