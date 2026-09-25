// [DATA PROVENANCE]
// Data Source: data/real/boundaries/palika_centroids.json, data/real/boundaries/gulmi-district.json
// Classification: SCIENTIFIC CONTINUOUS SPATIAL INTERPOLATION (IDW + Orographic Micro-Climate Lapse)
// Citations: NASA MERRA-2 (0.5°x0.625° Gridded Climate Reanalysis), DHM Nepal Baseline Benchmarks
// Consumed By: apps/web/src/features/map/DistrictMap.tsx

import React, { useMemo } from 'react';
import { ImageOverlay } from 'react-leaflet';
import { GULMI_PALIKA_CLIMATE_PROFILES, getPalikaMicroClimate } from '../../utils/climateDownscaling';
import { PALIKA_CENTROIDS } from '../../data/districtPalikaAssets';

// Scientific multi-stop gradient color ramp for precipitation (mm/month)
// Deep subtropical gorge (#fed7aa) -> Mid-hills moderate (#38bdf8 -> #0284c7) -> High orographic ridge (#1e3a8a)
const RAINFALL_COLOR_RAMP: [number, number, number][] = [
  [254, 215, 170], // #fed7aa - Low valley
  [253, 186, 116], // #fdba74 - Warm subtropical
  [56, 189, 248],  // #38bdf8 - Lower mid-hills
  [2, 132, 199],   // #0284c7 - Central mid-hills
  [3, 105, 161],   // #0369a1 - Upper ridge
  [30, 58, 138],   // #1e3a8a - Peak high mountain ridge
];

function interpolateRgb(factor: number): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, factor));
  const segCount = RAINFALL_COLOR_RAMP.length - 1;
  const segIndex = Math.min(Math.floor(clamped * segCount), segCount - 1);
  const segFactor = (clamped - segIndex / segCount) * segCount;

  const c0 = RAINFALL_COLOR_RAMP[segIndex];
  const c1 = RAINFALL_COLOR_RAMP[segIndex + 1];

  return [
    Math.round(c0[0] + (c1[0] - c0[0]) * segFactor),
    Math.round(c0[1] + (c1[1] - c0[1]) * segFactor),
    Math.round(c0[2] + (c1[2] - c0[2]) * segFactor),
  ];
}

// Point-in-polygon ray casting algorithm to mask pixels strictly inside Gulmi district boundary
function isPointInPolygon(point: [number, number], vs: number[][][]): boolean {
  const x = point[0]; // lng
  const y = point[1]; // lat
  let inside = false;

  for (const ring of vs) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0];
      const yi = ring[i][1];
      const xj = ring[j][0];
      const yj = ring[j][1];

      const intersect = ((yi > y) !== (yj > y)) &&
        (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
  }
  return inside;
}

interface SpatialRainfallSurfaceOverlayProps {
  currentRainMm: number;
  currentTempC: number;
  climateMonth: number;
  geoData: any; // Gulmi district FeatureCollection
  bounds: [[number, number], [number, number]];
  opacity?: number;
}

export const SpatialRainfallSurfaceOverlay: React.FC<SpatialRainfallSurfaceOverlayProps> = ({
  currentRainMm,
  currentTempC,
  climateMonth,
  geoData,
  bounds,
  opacity = 0.78,
}) => {
  const dataUrl = useMemo(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return null;

    // 1. Gather all 12 Palika centroid sample points with their dynamic downscaled rainfall
    const samples: { lat: number; lng: number; rainMm: number; rainFactor: number }[] = [];

    for (const [pName, pGeo] of Object.entries(PALIKA_CENTROIDS)) {
      const micro = getPalikaMicroClimate(pName, currentRainMm, currentTempC, climateMonth);
      samples.push({
        lat: pGeo.lat,
        lng: pGeo.lng,
        rainMm: micro.monthlyRainMm,
        rainFactor: micro.orographicFactor,
      });
    }

    if (samples.length === 0) return null;

    // Determine min/max range for normalizing color stops across Gulmi
    const minFactor = 0.82;
    const maxFactor = 1.25;

    // 2. Extract polygon rings for clipping
    const rings: number[][][] = [];
    if (geoData?.features) {
      for (const feat of geoData.features) {
        if (feat.geometry?.type === 'Polygon') {
          rings.push(...feat.geometry.coordinates);
        } else if (feat.geometry?.type === 'MultiPolygon') {
          for (const poly of feat.geometry.coordinates) {
            rings.push(...poly);
          }
        }
      }
    }

    // 3. Setup offscreen canvas with high spatial fidelity (160x160 grid)
    const width = 160;
    const height = 160;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    const south = bounds[0][0];
    const west = bounds[0][1];
    const north = bounds[1][0];
    const east = bounds[1][1];

    const latSpan = north - south;
    const lngSpan = east - west;

    // 4. Compute Inverse Distance Weighting (IDW with power=2.2 for smooth natural diffusion)
    const idwPower = 2.2;

    for (let py = 0; py < height; py++) {
      // Leaflet y=0 is north (top)
      const lat = north - (py / (height - 1)) * latSpan;

      for (let px = 0; px < width; px++) {
        const lng = west + (px / (width - 1)) * lngSpan;
        const pixelIdx = (py * width + px) * 4;

        // Check if inside Gulmi district polygon boundary
        if (rings.length > 0 && !isPointInPolygon([lng, lat], rings)) {
          // Transparent outside Gulmi
          data[pixelIdx] = 0;
          data[pixelIdx + 1] = 0;
          data[pixelIdx + 2] = 0;
          data[pixelIdx + 3] = 0;
          continue;
        }

        // IDW interpolation against 12 centroids
        let weightSum = 0;
        let weightedFactor = 0;
        let exactMatch: number | null = null;

        for (const sample of samples) {
          const dLat = lat - sample.lat;
          const dLng = lng - sample.lng;
          const distSq = dLat * dLat + dLng * dLng;

          if (distSq < 1e-8) {
            exactMatch = sample.rainFactor;
            break;
          }

          const weight = 1 / Math.pow(distSq, idwPower / 2);
          weightSum += weight;
          weightedFactor += weight * sample.rainFactor;
        }

        const interpolatedFactor = exactMatch !== null
          ? exactMatch
          : weightedFactor / weightSum;

        // Normalize factor [0.82, 1.25] -> [0, 1]
        const norm = (interpolatedFactor - minFactor) / (maxFactor - minFactor);
        const rgb = interpolateRgb(norm);

        data[pixelIdx] = rgb[0];
        data[pixelIdx + 1] = rgb[1];
        data[pixelIdx + 2] = rgb[2];
        data[pixelIdx + 3] = 230; // High alpha for rich contrast
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  }, [currentRainMm, currentTempC, climateMonth, geoData, bounds]);

  if (!dataUrl) return null;

  return (
    <ImageOverlay
      bounds={bounds}
      url={dataUrl}
      opacity={opacity}
      pane="rainfallPane"
      zIndex={340}
    />
  );
};
