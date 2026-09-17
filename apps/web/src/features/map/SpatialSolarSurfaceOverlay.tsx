// [DATA PROVENANCE]
// Data Source: data/real/climate/gulmiGHI.geojson, apps/web/src/data/gulmiGhiGrid.json, apps/web/public/geojson/gulmi-district.json
// Classification: EMPIRICAL 900M RASTER GRID (Global Solar Atlas / ESMAP / World Bank / Solargis)
// Citations: Global Solar Atlas (https://globalsolaratlas.info/download/nepal); Survey Department of Nepal
// Consumed By: apps/web/src/features/map/DistrictMap.tsx

import React, { useMemo } from 'react';
import { ImageOverlay } from 'react-leaflet';
import ghiGridData from '../../data/gulmiGhiGrid.json';

// Rich, multi-stop QGIS-matched solar radiation thermal palette (GHI in kWh/m2/day):
// Deep gorge shadow (3.03) -> Shaded north slopes (3.6) -> Lower valleys (3.9) -> Mid-hills (4.15) -> Sunny terraces (4.3) -> High ridge summits (4.53+)
const SOLAR_GHI_COLOR_STOPS: { val: number; rgb: [number, number, number] }[] = [
  { val: 3.00, rgb: [69, 10, 10] },     // #450a0a - Deepest canyon shadow (<3.2)
  { val: 3.50, rgb: [124, 45, 18] },    // #7c2d12 - Severe river ravine shading (3.2–3.6)
  { val: 3.80, rgb: [194, 65, 12] },    // #c2410c - Partially shaded lower slopes (3.6–3.9)
  { val: 4.05, rgb: [234, 88, 12] },    // #ea580c - Lower mid-hills (3.9–4.1)
  { val: 4.18, rgb: [245, 158, 11] },   // #f59e0b - District mean solar baseline (~4.16–4.20)
  { val: 4.28, rgb: [251, 191, 36] },   // #fbbf24 - Bright south & west agricultural terraces (4.20–4.32)
  { val: 4.38, rgb: [253, 224, 71] },   // #fde047 - High elevation sunny plateau (4.32–4.42)
  { val: 4.54, rgb: [254, 240, 138] },  // #fef08a - Peak high mountain ridge crest (>4.42)
];

function getGhiRgb(val: number): [number, number, number] {
  if (val <= SOLAR_GHI_COLOR_STOPS[0].val) return SOLAR_GHI_COLOR_STOPS[0].rgb;
  const last = SOLAR_GHI_COLOR_STOPS[SOLAR_GHI_COLOR_STOPS.length - 1];
  if (val >= last.val) return last.rgb;

  for (let i = 0; i < SOLAR_GHI_COLOR_STOPS.length - 1; i++) {
    const s0 = SOLAR_GHI_COLOR_STOPS[i];
    const s1 = SOLAR_GHI_COLOR_STOPS[i + 1];
    if (val >= s0.val && val <= s1.val) {
      const factor = (val - s0.val) / (s1.val - s0.val);
      return [
        Math.round(s0.rgb[0] + (s1.rgb[0] - s0.rgb[0]) * factor),
        Math.round(s0.rgb[1] + (s1.rgb[1] - s0.rgb[1]) * factor),
        Math.round(s0.rgb[2] + (s1.rgb[2] - s0.rgb[2]) * factor),
      ];
    }
  }
  return last.rgb;
}

// Ray-casting point-in-polygon algorithm for boundary clipping
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

interface SpatialSolarSurfaceOverlayProps {
  geoData: any; // Gulmi district boundary GeoJSON
  bounds: [[number, number], [number, number]];
  opacity?: number;
}

export const SpatialSolarSurfaceOverlay: React.FC<SpatialSolarSurfaceOverlayProps> = ({
  geoData,
  bounds,
  opacity = 0.88,
}) => {
  const dataUrl = useMemo(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return null;

    const { rows, cols, grid, lat_max, lat_min, lon_min, lon_max, step } = ghiGridData as {
      rows: number;
      cols: number;
      grid: (number | null)[][];
      lat_max: number;
      lat_min: number;
      lon_min: number;
      lon_max: number;
      step: number;
    };

    // Extract Gulmi outer boundary polygon rings for crisp clipping
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

    // High resolution render canvas (interpolated 4x super-sampled for smooth QGIS appearance)
    const scale = 4;
    const canvasWidth = cols * scale;
    const canvasHeight = rows * scale;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const imgData = ctx.createImageData(canvasWidth, canvasHeight);
    const data = imgData.data;

    // Fast bilinear interpolation over the 41x69 empirical grid with boundary clipping
    for (let py = 0; py < canvasHeight; py++) {
      // Leaflet y=0 is north (lat_max)
      const rFloat = (py / (canvasHeight - 1)) * (rows - 1);
      const lat = lat_max - (py / (canvasHeight - 1)) * (lat_max - lat_min);

      const r0 = Math.floor(rFloat);
      const r1 = Math.min(rows - 1, r0 + 1);
      const rFrac = rFloat - r0;

      for (let px = 0; px < canvasWidth; px++) {
        const cFloat = (px / (canvasWidth - 1)) * (cols - 1);
        const lng = lon_min + (px / (canvasWidth - 1)) * (lon_max - lon_min);

        const pixelIdx = (py * canvasWidth + px) * 4;

        // Clip strictly outside Gulmi district border
        if (rings.length > 0 && !isPointInPolygon([lng, lat], rings)) {
          data[pixelIdx] = 0;
          data[pixelIdx + 1] = 0;
          data[pixelIdx + 2] = 0;
          data[pixelIdx + 3] = 0;
          continue;
        }

        const c0 = Math.floor(cFloat);
        const c1 = Math.min(cols - 1, c0 + 1);
        const cFrac = cFloat - c0;

        // Bilinear sampling across 4 adjacent empirical grid points
        const v00 = grid[r0][c0];
        const v01 = grid[r0][c1];
        const v10 = grid[r1][c0];
        const v11 = grid[r1][c1];

        const validNeighbors: number[] = [];
        if (v00 !== null) validNeighbors.push(v00);
        if (v01 !== null) validNeighbors.push(v01);
        if (v10 !== null) validNeighbors.push(v10);
        if (v11 !== null) validNeighbors.push(v11);

        let finalVal: number | null = null;

        if (v00 !== null && v01 !== null && v10 !== null && v11 !== null) {
          const top = v00 * (1 - cFrac) + v01 * cFrac;
          const bot = v10 * (1 - cFrac) + v11 * cFrac;
          finalVal = top * (1 - rFrac) + bot * rFrac;
        } else if (validNeighbors.length > 0) {
          // Average nearby valid points along edge
          finalVal = validNeighbors.reduce((a, b) => a + b, 0) / validNeighbors.length;
        } else {
          // Default to center cell value or skip
          finalVal = null;
        }

        if (finalVal === null) {
          data[pixelIdx] = 0;
          data[pixelIdx + 1] = 0;
          data[pixelIdx + 2] = 0;
          data[pixelIdx + 3] = 0;
          continue;
        }

        const rgb = getGhiRgb(finalVal);
        data[pixelIdx] = rgb[0];
        data[pixelIdx + 1] = rgb[1];
        data[pixelIdx + 2] = rgb[2];
        data[pixelIdx + 3] = 230; // Solid empirical contrast
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  }, [geoData]);

  if (!dataUrl) return null;

  const { lat_min, lat_max, lon_min, lon_max, step } = ghiGridData as {
    lat_min: number;
    lat_max: number;
    lon_min: number;
    lon_max: number;
    step: number;
  };

  const exactGridBounds: [[number, number], [number, number]] = [
    [lat_min - step / 2, lon_min - step / 2],
    [lat_max + step / 2, lon_max + step / 2],
  ];

  return (
    <ImageOverlay
      bounds={exactGridBounds}
      url={dataUrl}
      opacity={opacity}
      pane="rainfallPane"
      zIndex={340}
    />
  );
};
