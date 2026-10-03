// [DATA PROVENANCE]
// Data Source: data/real/land_and_soil/gulmi_soil_data.nc, data/real/rasters/gulmi_dem_30m.tif, apps/web/public/geojson/gulmi-district.json
// Classification: OBSERVED REAL (NARC NSSRC 100m Geospatial Soil Grid & Survey Department 30m DEM)
// Citations: National Soil Science Research Centre (NSSRC), Nepal Agricultural Research Council (NARC); Survey Department of Nepal
// Consumed By: apps/web/src/features/map/DistrictMap.tsx

import React, { useEffect, useState } from 'react';

import type { GeoJsonObject, Position } from 'geojson';
import { fromArrayBuffer } from 'geotiff';
import { ImageOverlay } from 'react-leaflet';

import { getTileUrl } from '../../services/dataClient';

export type SoilSubFilterType =
  'soil_ph' | 'soil_nitrogen' | 'soil_phosphorus' | 'soil_potassium' | 'elevation_zones' | string;

interface SpatialSoilSurfaceOverlayProps {
  subFilter: SoilSubFilterType;
  opacity?: number;
  pane?: string;
  geoData?: GeoJsonObject | null;
}

interface ColorStop {
  val: number;
  rgb: [number, number, number];
}

// Module-level cache for instantaneous switching across subfilters
const soilCacheMap = new Map<string, { url: string; bounds: [[number, number], [number, number]] }>();

// Scientific multi-stop gradient color stops calibrated to official NARC & FAO thresholds
const COLOR_STOPS: Record<string, ColorStop[]> = {
  // Soil pH: Strongly Acidic (#ef4444) -> Moderately Acidic (#f59e0b) -> Optimal/Neutral (#10b981) -> Alkaline (#3b82f6)
  soil_ph: [
    { val: 4.8, rgb: [239, 68, 68] },
    { val: 5.3, rgb: [249, 115, 22] },
    { val: 5.8, rgb: [245, 158, 11] },
    { val: 6.2, rgb: [132, 204, 22] },
    { val: 6.6, rgb: [16, 185, 129] },
    { val: 7.0, rgb: [4, 120, 87] },
    { val: 7.4, rgb: [59, 130, 246] },
  ],
  // Available Nitrogen (%): Low (<0.10) -> Medium (0.10-0.19) -> High (>=0.20)
  soil_nitrogen: [
    { val: 0.05, rgb: [239, 68, 68] },
    { val: 0.09, rgb: [245, 158, 11] },
    { val: 0.13, rgb: [132, 204, 22] },
    { val: 0.17, rgb: [16, 185, 129] },
    { val: 0.22, rgb: [4, 120, 87] },
    { val: 0.32, rgb: [6, 78, 59] },
  ],
  // Available Phosphorus (kg/ha): Low (<15) -> Medium (15-34) -> High (>=35)
  soil_phosphorus: [
    { val: 12, rgb: [239, 68, 68] },
    { val: 20, rgb: [251, 146, 60] },
    { val: 28, rgb: [56, 189, 248] },
    { val: 45, rgb: [2, 132, 199] },
    { val: 120, rgb: [30, 58, 138] },
  ],
  // Available Potassium (kg/ha): Low (<110) -> Medium (110-179) -> High (>=180)
  soil_potassium: [
    { val: 90, rgb: [239, 68, 68] },
    { val: 125, rgb: [251, 146, 60] },
    { val: 160, rgb: [56, 189, 248] },
    { val: 220, rgb: [2, 132, 199] },
    { val: 380, rgb: [30, 58, 138] },
  ],
  // Elevation Tiers: Subtropical Valley -> Lower Hill -> Mid-Hill -> Alpine Ridge
  elevation_zones: [
    { val: 550, rgb: [2, 132, 199] },
    { val: 850, rgb: [16, 185, 129] },
    { val: 1250, rgb: [245, 158, 11] },
    { val: 1750, rgb: [124, 58, 237] },
    { val: 2400, rgb: [76, 29, 149] },
  ],
};

function interpolateColor(val: number, stops: ColorStop[]): [number, number, number] {
  if (val <= stops[0].val) return stops[0].rgb;
  const last = stops[stops.length - 1];
  if (val >= last.val) return last.rgb;

  for (let i = 0; i < stops.length - 1; i++) {
    const s0 = stops[i];
    const s1 = stops[i + 1];
    if (val >= s0.val && val <= s1.val) {
      const factor = (val - s0.val) / (s1.val - s0.val);
      return [
        Math.round(s0.rgb[0] + factor * (s1.rgb[0] - s0.rgb[0])),
        Math.round(s0.rgb[1] + factor * (s1.rgb[1] - s0.rgb[1])),
        Math.round(s0.rgb[2] + factor * (s1.rgb[2] - s0.rgb[2])),
      ];
    }
  }
  return last.rgb;
}

export const SpatialSoilSurfaceOverlay: React.FC<SpatialSoilSurfaceOverlayProps> = ({
  subFilter,
  opacity = 0.85,
  pane = 'rainfallPane',
  geoData,
}) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(null);

  useEffect(() => {
    const activeKey =
      subFilter === 'elevation_zones' || subFilter === 'agroforestry_belt' ? 'elevation_zones' : subFilter;

    const cacheKey = `${activeKey}_${geoData ? 'clipped' : 'raw'}`;
    const cached = soilCacheMap.get(cacheKey);
    if (cached) {
      setDataUrl(cached.url);
      setBounds(cached.bounds);
      return;
    }

    let isMounted = true;

    async function loadRaster() {
      try {
        const tifName = activeKey === 'elevation_zones' ? 'elevation_zones.tif' : `${activeKey}.tif`;
        const response = await fetch(getTileUrl(tifName));
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for ${tifName}`);
        const arrayBuffer = await response.arrayBuffer();

        const tiff = await fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        const width = image.getWidth();
        const height = image.getHeight();
        const [rasterData] = await image.readRasters();
        const bbox = image.getBoundingBox(); // [minLng, minLat, maxLng, maxLat]

        const leafletBounds: [[number, number], [number, number]] = [
          [bbox[1], bbox[0]],
          [bbox[3], bbox[2]],
        ];

        const stops = COLOR_STOPS[activeKey] || COLOR_STOPS.soil_ph;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        const imgData = tempCtx.createImageData(width, height);
        const pixels = imgData.data;

        for (let i = 0; i < rasterData.length; i++) {
          const val = Number(rasterData[i]);
          const pIdx = i * 4;

          // NoData check
          if (isNaN(val) || val <= -9000 || val === 0) {
            pixels[pIdx] = 0;
            pixels[pIdx + 1] = 0;
            pixels[pIdx + 2] = 0;
            pixels[pIdx + 3] = 0;
            continue;
          }

          const [r, g, b] = interpolateColor(val, stops);
          pixels[pIdx] = r;
          pixels[pIdx + 1] = g;
          pixels[pIdx + 2] = b;
          pixels[pIdx + 3] = 230;
        }

        tempCtx.putImageData(imgData, 0, 0);

        // Smooth high-resolution upscaling (interpolated canvas)
        const renderWidth = Math.max(width * 2, 280);
        const renderHeight = Math.max(height * 2, 260);

        const canvas = document.createElement('canvas');
        canvas.width = renderWidth;
        canvas.height = renderHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Clip strictly within Gulmi boundary if geoData is provided
        if (geoData) {
          const [minLng, minLat, maxLng, maxLat] = bbox;
          const lngSpan = maxLng - minLng;
          const latSpan = maxLat - minLat;

          ctx.save();
          ctx.beginPath();

          const drawRing = (ring: Position[] | number[][]) => {
            for (let rIdx = 0; rIdx < ring.length; rIdx++) {
              const [lng, lat] = ring[rIdx];
              const px = ((lng - minLng) / lngSpan) * renderWidth;
              const py = ((maxLat - lat) / latSpan) * renderHeight;
              if (rIdx === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
          };

          const fc = geoData as {
            features?: Array<{ geometry?: { type: string; coordinates: unknown } }>;
            geometry?: { type: string; coordinates: unknown };
          };

          if (fc.features && Array.isArray(fc.features)) {
            for (const feat of fc.features) {
              const geom = feat.geometry;
              if (geom?.type === 'Polygon' && Array.isArray(geom.coordinates)) {
                for (const ring of geom.coordinates as number[][][]) drawRing(ring);
              } else if (geom?.type === 'MultiPolygon' && Array.isArray(geom.coordinates)) {
                for (const poly of geom.coordinates as number[][][][]) {
                  for (const ring of poly) drawRing(ring);
                }
              }
            }
          }

          ctx.clip('evenodd');
          ctx.drawImage(tempCanvas, 0, 0, renderWidth, renderHeight);
          ctx.restore();
        } else {
          ctx.drawImage(tempCanvas, 0, 0, renderWidth, renderHeight);
        }

        const generatedUrl = canvas.toDataURL('image/png');
        soilCacheMap.set(cacheKey, { url: generatedUrl, bounds: leafletBounds });

        if (isMounted) {
          setDataUrl(generatedUrl);
          setBounds(leafletBounds);
        }
      } catch (err) {
        console.warn(`Failed to render spatial soil surface for ${activeKey}:`, err);
      }
    }

    loadRaster();

    return () => {
      isMounted = false;
    };
  }, [subFilter, geoData]);

  if (!dataUrl || !bounds) return null;

  return <ImageOverlay bounds={bounds} url={dataUrl} opacity={opacity} pane={pane} zIndex={330} />;
};

export default SpatialSoilSurfaceOverlay;
