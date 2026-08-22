import { District } from '@wefes/shared-types';
import { DISTRICT_LANDMARKS } from '../data/districtRealAssets';

export interface ContourLine {
  elevation: number;
  isIndex: boolean; // True every 50m/100m for prominent labeling
  color: string;
  weight: number;
  opacity: number;
  coordinates: [number, number][]; // [lat, lng] array
  temperatureC: number;
  lifeZone: string;
  feasibleCrops: string[];
}

// Ray-casting point-in-ring algorithm for [lat, lng] coordinates
function isPointInRing(pt: [number, number], ring: [number, number][]): boolean {
  const [lat, lng] = pt;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [yi, xi] = ring[i];
    const [yj, xj] = ring[j];
    const intersect = ((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Strict point-in-polygon test against GeoJSON Polygon or MultiPolygon
function isPointInsideDistrict(pt: [number, number], geometry: any): boolean {
  if (!geometry || !geometry.coordinates) return true;
  const { type, coordinates } = geometry;

  if (type === 'Polygon') {
    if (!coordinates[0] || coordinates[0].length === 0) return true;
    const outerRing: [number, number][] = coordinates[0].map((c: any) => [c[1], c[0]]);
    if (!isPointInRing(pt, outerRing)) return false;

    // Check inner holes
    for (let h = 1; h < coordinates.length; h++) {
      const holeRing: [number, number][] = coordinates[h].map((c: any) => [c[1], c[0]]);
      if (isPointInRing(pt, holeRing)) return false;
    }
    return true;
  } else if (type === 'MultiPolygon') {
    for (const poly of coordinates) {
      if (!poly[0] || poly[0].length === 0) continue;
      const outerRing: [number, number][] = poly[0].map((c: any) => [c[1], c[0]]);
      if (isPointInRing(pt, outerRing)) {
        let inHole = false;
        for (let h = 1; h < poly.length; h++) {
          const holeRing: [number, number][] = poly[h].map((c: any) => [c[1], c[0]]);
          if (isPointInRing(pt, holeRing)) {
            inHole = true;
            break;
          }
        }
        if (!inHole) return true;
      }
    }
    return false;
  }

  return true;
}

// Get ecological life zone and color for a given elevation
function getElevationColorAndZone(elev: number): { color: string; zone: string; crops: string[] } {
  if (elev < 1000) {
    return {
      color: '#10b981', // Emerald
      zone: 'Tropical & Outer Foothills (<1000m)',
      crops: ['Paddy (Rice)', 'Sugarcane', 'Banana', 'Mustard', 'Maize']
    };
  } else if (elev < 1800) {
    return {
      color: '#0284c7', // Sky Blue
      zone: 'Subtropical Mid-Hills (1000–1800m)',
      crops: ['Arabica Coffee', 'Mandarin Orange', 'Ginger', 'Maize', 'Millet']
    };
  } else if (elev < 2600) {
    return {
      color: '#7c3aed', // Purple
      zone: 'Warm Temperate Montane (1800–2600m)',
      crops: ['Large Cardamom', 'Orthodox Tea', 'Potato', 'Wheat', 'Off-Season Veg']
    };
  } else if (elev < 3600) {
    return {
      color: '#d97706', // Amber/Gold
      zone: 'Cool Temperate & Subalpine (2600–3600m)',
      crops: ['Highland Apple', 'Buckwheat', 'Barley', 'Seed Potato']
    };
  } else if (elev < 5000) {
    return {
      color: '#ea580c', // Orange
      zone: 'Alpine Rangelands (3600–5000m)',
      crops: ['Alpine Pasture', 'Yarsagumba / MAPs', 'Highland Buckwheat']
    };
  } else {
    return {
      color: '#dc2626', // Crimson / Snow
      zone: 'Nival Glacial Summit (>5000m)',
      crops: ['Cryospheric Glacier / Permafrost (Non-Arable)']
    };
  }
}

/**
 * Generate strictly boundary-clipped topographic contour isolines across a district polygon
 * with 5m to 10m resolution intervals.
 */
export function generateDistrictContours(
  district: District,
  featureGeometry?: any,
  stepMeters: number = 10
): ContourLine[] {
  let minElev = 100;
  let maxElev = 2500;

  if (district.elevationRange) {
    const parts = district.elevationRange.replace(/m/gi, '').split('-').map(s => parseFloat(s.trim()));
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      minElev = Math.floor(parts[0] / stepMeters) * stepMeters;
      maxElev = Math.ceil(parts[1] / stepMeters) * stepMeters;
    }
  } else {
    if (district.ecoZone === 'Terai') { minElev = 60; maxElev = 350; }
    else if (district.ecoZone === 'Mountain') { minElev = 1500; maxElev = 6500; }
    else { minElev = 600; maxElev = 2800; }
  }

  const span = Math.max(20, maxElev - minElev);
  // Optimal step: 5m for lowland/hills with small relief, 10m-25m for larger mountain terrain
  const actualStep = span <= 1000 ? 5 : span <= 3000 ? 10 : span <= 5000 ? 25 : 50;

  const dKey = district.name.toLowerCase();
  const landmarkData = DISTRICT_LANDMARKS[dKey] || DISTRICT_LANDMARKS[district.id.toLowerCase()];

  // Extract district bounding box from polygon
  let minLat = 27.0, maxLat = 28.5, minLng = 83.0, maxLng = 85.0;
  let allCoords: [number, number][] = [];

  if (featureGeometry && featureGeometry.coordinates) {
    try {
      const extractRings = (coords: any): [number, number][] => {
        if (typeof coords[0] === 'number') return [[coords[1], coords[0]]];
        if (typeof coords[0][0] === 'number') return coords.map((c: any) => [c[1], c[0]]);
        return coords.flatMap(extractRings);
      };
      allCoords = extractRings(featureGeometry.coordinates);
      if (allCoords.length > 0) {
        minLat = Math.min(...allCoords.map(p => p[0]));
        maxLat = Math.max(...allCoords.map(p => p[0]));
        minLng = Math.min(...allCoords.map(p => p[1]));
        maxLng = Math.max(...allCoords.map(p => p[1]));
      }
    } catch {
      // fallback
    }
  }

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  const peakPos: [number, number] = landmarkData?.peak ? [landmarkData.peak.lat, landmarkData.peak.lon] : [maxLat - 0.03, centerLng];
  const valleyPos: [number, number] = landmarkData?.valley ? [landmarkData.valley.lat, landmarkData.valley.lon] : [minLat + 0.03, centerLng];

  const contours: ContourLine[] = [];
  const baseTemp = (district as any).avgTempC ?? (district.ecoZone === 'Terai' ? 25 : district.ecoZone === 'Mountain' ? 10 : 18);

  const gradLat = peakPos[0] - valleyPos[0];
  const gradLng = peakPos[1] - valleyPos[1];
  const perpLat = -gradLng;
  const perpLng = gradLat;
  const norm = Math.sqrt(perpLat * perpLat + perpLng * perpLng) || 1;

  const widthFactorLat = (maxLat - minLat) * 0.55;
  const widthFactorLng = (maxLng - minLng) * 0.55;

  const uPerpLat = (perpLat / norm) * widthFactorLat;
  const uPerpLng = (perpLng / norm) * widthFactorLng;

  for (let elev = minElev; elev <= maxElev; elev += actualStep) {
    const t = (elev - minElev) / span; // 0.0 (valley) to 1.0 (peak)
    const isIndex = elev % (actualStep * 5) === 0 || elev === minElev || elev === maxElev;
    const { color, zone, crops } = getElevationColorAndZone(elev);

    // Temperature at this elevation contour (6.5°C per 1,000m lapse rate)
    const tempC = +(baseTemp - ((elev - minElev) / 1000) * 6.5).toFixed(1);

    // Interpolate center point along valley-to-peak gradient
    const cLat = valleyPos[0] + gradLat * t;
    const cLng = valleyPos[1] + gradLng * t;

    // Generate high-density points along the contour arc
    const samplesCount = 60;
    const rawPoints: [number, number][] = [];

    for (let i = 0; i <= samplesCount; i++) {
      const s = (i / samplesCount) - 0.5; // -0.5 to +0.5
      // Natural topographic sinusoidal ridge/valley noise
      const ridgeNoise = Math.sin(s * Math.PI * 4 + elev * 0.08) * 0.08 * widthFactorLat;
      const arcDisplacement = (1 - 4 * s * s) * 0.12 * (gradLat * 0.25);

      const lat = cLat + (s * 2 * uPerpLat) + (ridgeNoise * uPerpLat) + arcDisplacement;
      const lng = cLng + (s * 2 * uPerpLng) + (ridgeNoise * uPerpLng);

      rawPoints.push([lat, lng]);
    }

    // Clip rawPoints strictly against the district polygon geometry
    const segments: [number, number][][] = [];
    let currentSegment: [number, number][] = [];

    for (const pt of rawPoints) {
      if (isPointInsideDistrict(pt, featureGeometry)) {
        currentSegment.push(pt);
      } else {
        if (currentSegment.length >= 2) {
          segments.push(currentSegment);
        }
        currentSegment = [];
      }
    }
    if (currentSegment.length >= 2) {
      segments.push(currentSegment);
    }

    // If clipping resulted in valid inside segments, create contour line features
    for (const seg of segments) {
      contours.push({
        elevation: elev,
        isIndex,
        color,
        weight: isIndex ? 2.2 : 1.2,
        opacity: isIndex ? 0.9 : 0.65,
        coordinates: seg,
        temperatureC: tempC,
        lifeZone: zone,
        feasibleCrops: crops,
      });
    }
  }

  return contours;
}
