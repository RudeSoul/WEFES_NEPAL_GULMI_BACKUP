// [DATA PROVENANCE]
// Data Source: data/real/boundaries/gulmi_buildings.geojson, apps/web/src/data/gulmiBuildingDensityGrid.json
// Classification: EMPIRICAL 250M GAUSSIAN DENSITY SURFACE (78,934 OSM Building Geometries)
// Citations: OpenStreetMap Contributors via QGIS QuickOSM; Survey Department of Nepal
// Consumed By: apps/web/src/features/map/DistrictMap.tsx

import React, { useMemo } from 'react';
import { ImageOverlay } from 'react-leaflet';
import densityGridData from '../../data/gulmiBuildingDensityGrid.json';

// Thermal heat wave palette for settlement building concentration (0 to 100 density score):
// Transparent/Forest (<2) -> Light Green/Agrarian (5) -> Golden yellow (20) -> Amber (45) -> Vibrant Coral (70) -> Intense Ruby Red (>85)
const SETTLEMENT_COLOR_STOPS: { val: number; rgb: [number, number, number]; alpha: number }[] = [
  { val: 0.0, rgb: [16, 185, 129], alpha: 0.0 },     // Completely transparent for zero building forest/ridges
  { val: 3.0, rgb: [34, 197, 94], alpha: 0.15 },    // Sparse agrarian valley slope
  { val: 10.0, rgb: [132, 204, 22], alpha: 0.35 },  // Dispersed rural hamlet
  { val: 25.0, rgb: [234, 179, 8], alpha: 0.55 },   // Clustered agricultural settlement
  { val: 50.0, rgb: [249, 115, 22], alpha: 0.72 },  // Commercial market town (Bazar)
  { val: 75.0, rgb: [239, 68, 68], alpha: 0.85 },   // Dense municipal core (Tamghas, Wami, Ridi)
  { val: 100.0, rgb: [185, 28, 28], alpha: 0.95 },  // Peak urban administrative center
];

function getSettlementRgba(val: number): [number, number, number, number] {
  if (val <= SETTLEMENT_COLOR_STOPS[0].val) return [...SETTLEMENT_COLOR_STOPS[0].rgb, SETTLEMENT_COLOR_STOPS[0].alpha];
  const last = SETTLEMENT_COLOR_STOPS[SETTLEMENT_COLOR_STOPS.length - 1];
  if (val >= last.val) return [...last.rgb, last.alpha];

  for (let i = 0; i < SETTLEMENT_COLOR_STOPS.length - 1; i++) {
    const s0 = SETTLEMENT_COLOR_STOPS[i];
    const s1 = SETTLEMENT_COLOR_STOPS[i + 1];
    if (val >= s0.val && val <= s1.val) {
      const factor = (val - s0.val) / (s1.val - s0.val);
      return [
        Math.round(s0.rgb[0] + (s1.rgb[0] - s0.rgb[0]) * factor),
        Math.round(s0.rgb[1] + (s1.rgb[1] - s0.rgb[1]) * factor),
        Math.round(s0.rgb[2] + (s1.rgb[2] - s0.rgb[2]) * factor),
        s0.alpha + (s1.alpha - s0.alpha) * factor,
      ];
    }
  }
  return [...last.rgb, last.alpha];
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

interface SpatialSettlementDensityOverlayProps {
  geoData: any; // Gulmi district boundary GeoJSON
  bounds: [[number, number], [number, number]];
  opacity?: number;
}

export const SpatialSettlementDensityOverlay: React.FC<SpatialSettlementDensityOverlayProps> = ({
  geoData,
  bounds,
  opacity = 0.85,
}) => {
  const overlay = useMemo(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return null;

    const { rows, cols, grid, lat_max, lat_min, lon_min, lon_max, step } = densityGridData as {
      rows: number;
      cols: number;
      grid: number[][];
      lat_max: number;
      lat_min: number;
      lon_min: number;
      lon_max: number;
      step: number;
    };

    // Extract Gulmi outer boundary polygon rings for clipping
    const rings: number[][][] = [];
    let polyMinLat = Infinity;
    let polyMaxLat = -Infinity;
    let polyMinLon = Infinity;
    let polyMaxLon = -Infinity;

    if (geoData?.features) {
      for (const feat of geoData.features) {
        const processRing = (ring: number[][]) => {
          rings.push(ring);
          for (const pt of ring) {
            const lng = pt[0];
            const lat = pt[1];
            if (lat < polyMinLat) polyMinLat = lat;
            if (lat > polyMaxLat) polyMaxLat = lat;
            if (lng < polyMinLon) polyMinLon = lng;
            if (lng > polyMaxLon) polyMaxLon = lng;
          }
        };

        if (feat.geometry?.type === 'Polygon') {
          for (const r of feat.geometry.coordinates) processRing(r);
        } else if (feat.geometry?.type === 'MultiPolygon') {
          for (const poly of feat.geometry.coordinates) {
            for (const r of poly) processRing(r);
          }
        }
      }
    }

    const pad = step * 1.5;
    const canvasLatMin = isFinite(polyMinLat) ? polyMinLat - pad : lat_min - pad;
    const canvasLatMax = isFinite(polyMaxLat) ? polyMaxLat + pad : lat_max + pad;
    const canvasLonMin = isFinite(polyMinLon) ? polyMinLon - pad : lon_min - pad;
    const canvasLonMax = isFinite(polyMaxLon) ? polyMaxLon + pad : lon_max + pad;

    const colsCount = Math.max(1, Math.round((canvasLonMax - canvasLonMin) / step));
    const rowsCount = Math.max(1, Math.round((canvasLatMax - canvasLatMin) / step));

    const scale = 3;
    const canvasWidth = colsCount * scale;
    const canvasHeight = rowsCount * scale;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const imgData = ctx.createImageData(canvasWidth, canvasHeight);
    const data = imgData.data;

    // Bilinear interpolation helper on raw grid
    const getGridValue = (gx: number, gy: number): number => {
      const c0 = Math.floor(gx);
      const c1 = Math.min(cols - 1, c0 + 1);
      const r0 = Math.floor(gy);
      const r1 = Math.min(rows - 1, r0 + 1);

      if (r0 < 0 || r0 >= rows || c0 < 0 || c0 >= cols) return 0;

      const v00 = grid[r0]?.[c0] ?? 0;
      const v01 = grid[r0]?.[c1] ?? 0;
      const v10 = grid[r1]?.[c0] ?? 0;
      const v11 = grid[r1]?.[c1] ?? 0;

      const tx = gx - c0;
      const ty = gy - r0;

      const vTop = v00 * (1 - tx) + v01 * tx;
      const vBottom = v10 * (1 - tx) + v11 * tx;
      return vTop * (1 - ty) + vBottom * ty;
    };

    for (let py = 0; py < canvasHeight; py++) {
      const curLat = canvasLatMax - (py / canvasHeight) * (canvasLatMax - canvasLatMin);
      const gy = ((lat_max - curLat) / (lat_max - lat_min)) * (rows - 1);

      for (let px = 0; px < canvasWidth; px++) {
        const curLon = canvasLonMin + (px / canvasWidth) * (canvasLonMax - canvasLonMin);
        const gx = ((curLon - lon_min) / (lon_max - lon_min)) * (cols - 1);

        const idx = (py * canvasWidth + px) * 4;

        if (rings.length > 0 && !isPointInPolygon([curLon, curLat], rings)) {
          data[idx + 3] = 0;
          continue;
        }

        const score = getGridValue(gx, gy);

        if (score < 1.0) {
          data[idx + 3] = 0;
          continue;
        }

        const [r, g, b, alpha] = getSettlementRgba(score);
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = Math.round(alpha * 255);
      }
    }

    ctx.putImageData(imgData, 0, 0);

    return {
      url: canvas.toDataURL(),
      bounds: [
        [canvasLatMin, canvasLonMin],
        [canvasLatMax, canvasLonMax],
      ] as [[number, number], [number, number]],
    };
  }, [geoData]);

  if (!overlay) return null;

  return (
    <ImageOverlay
      url={overlay.url}
      bounds={overlay.bounds}
      opacity={opacity}
      zIndex={360}
    />
  );
};
