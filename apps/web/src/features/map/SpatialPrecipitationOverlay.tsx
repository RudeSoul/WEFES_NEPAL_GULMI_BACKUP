// [DATA PROVENANCE]
// Data Source: data/real/hydrology/average_annual_precipitation.tif,
//              data/real/hydrology/average_monsoon_precipitation.tif,
//              data/real/hydrology/average_dry_season_precipitation.tif
// Classification: OBSERVED REAL (CHIRPS v2.0 0.05° High-Resolution Satellite & Rain Gauge Climate Grids)
// Citations: Funk, C. et al. (2015). The climate hazards group infrared precipitation with stations - a new environmental record for monitoring extremes. Scientific Data, 2:150066.
// Consumed By: apps/web/src/features/map/DistrictMap.tsx

import React, { useEffect, useState } from 'react';

import type { FeatureCollection, GeoJsonObject, Geometry, Position } from 'geojson';
import { fromArrayBuffer } from 'geotiff';
import { ImageOverlay } from 'react-leaflet';

import { getTileUrl } from '../../services/dataClient';

export type PrecipitationSeasonType = 'annual' | 'monsoon' | 'dry_season';

interface SpatialPrecipitationOverlayProps {
  type: PrecipitationSeasonType;
  opacity?: number;
  pane?: string;
  geoData?: GeoJsonObject | FeatureCollection | Geometry | null;
}

// In-memory cache for instantaneous switching between seasonal precipitation layers
const cacheMap = new Map<string, { url: string; bounds: [[number, number], [number, number]] }>();

interface ColorStop {
  val: number;
  rgb: [number, number, number];
}

/**
 * Unified precipitation color spectrum across all seasons:
 * - 100-180 mm  : Warm Yellow / Amber (Dry Season Deficit)
 * - 200-800 mm  : Transition Peach / Pale Cyan (Pre-Monsoon / Post-Monsoon)
 * - 1000-1400 mm: Sky Blue to Cerulean (Monsoon Runoff Core)
 * - 1400-1800 mm: Deep Ocean Blue (High Monsoon & Mid-Hills Annual)
 * - 1800-2200 mm: Dark Navy / Indigo (Peak Annual Orographic Ridge Deluge)
 */
const UNIFIED_PRECIP_STOPS: ColorStop[] = [
  { val: 100, rgb: [254, 240, 138] }, // #fef08a - High deficit dry season (100 mm)
  { val: 180, rgb: [254, 215, 170] }, // #fed7aa - Upper dry season threshold (180 mm)
  { val: 350, rgb: [253, 186, 116] }, // #fdba74 - Warm transitional (350 mm)
  { val: 700, rgb: [186, 230, 253] }, // #bae6fd - Light cyan (700 mm)
  { val: 1100, rgb: [56, 189, 248] }, // #38bdf8 - Lower monsoon valley floors (1,100 mm)
  { val: 1400, rgb: [2, 132, 199] }, // #0284c7 - Central monsoon terraces / Lower annual (1,400 mm)
  { val: 1750, rgb: [3, 105, 161] }, // #0369a1 - Upper monsoon / Mid-hill annual (1,750 mm)
  { val: 2100, rgb: [30, 58, 138] }, // #1e3a8a - Peak annual ridge deluge (2,100+ mm)
];

function getPrecipColor(val: number): [number, number, number] {
  if (val <= UNIFIED_PRECIP_STOPS[0].val) return UNIFIED_PRECIP_STOPS[0].rgb;
  if (val >= UNIFIED_PRECIP_STOPS[UNIFIED_PRECIP_STOPS.length - 1].val) {
    return UNIFIED_PRECIP_STOPS[UNIFIED_PRECIP_STOPS.length - 1].rgb;
  }
  for (let i = 0; i < UNIFIED_PRECIP_STOPS.length - 1; i++) {
    const s0 = UNIFIED_PRECIP_STOPS[i];
    const s1 = UNIFIED_PRECIP_STOPS[i + 1];
    if (val >= s0.val && val <= s1.val) {
      const factor = (val - s0.val) / (s1.val - s0.val);
      return [
        Math.round(s0.rgb[0] + factor * (s1.rgb[0] - s0.rgb[0])),
        Math.round(s0.rgb[1] + factor * (s1.rgb[1] - s0.rgb[1])),
        Math.round(s0.rgb[2] + factor * (s1.rgb[2] - s0.rgb[2])),
      ];
    }
  }
  return UNIFIED_PRECIP_STOPS[UNIFIED_PRECIP_STOPS.length - 1].rgb;
}

export const SpatialPrecipitationOverlay: React.FC<SpatialPrecipitationOverlayProps> = ({
  type,
  opacity = 0.85,
  pane = 'rainfallPane',
  geoData,
}) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const cacheKey = `${type}_${geoData ? 'clipped' : 'raw'}`;
    const cached = cacheMap.get(cacheKey);
    if (cached) {
      setDataUrl(cached.url);
      setBounds(cached.bounds);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadRaster() {
      try {
        setLoading(true);
        const fileName = `average_${type}_precipitation.tif`;
        const response = await fetch(getTileUrl(fileName));
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for ${fileName}`);
        const arrayBuffer = await response.arrayBuffer();

        const tiff = await fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        const width = image.getWidth();
        const height = image.getHeight();
        const [rasterData] = await image.readRasters();
        const bbox = image.getBoundingBox(); // [minX, minY, maxX, maxY]

        const leafletBounds: [[number, number], [number, number]] = [
          [bbox[1], bbox[0]],
          [bbox[3], bbox[2]],
        ];

        // Smooth high-resolution canvas interpolation (240x240)
        const renderWidth = Math.max(width * 16, 240);
        const renderHeight = Math.max(height * 16, 240);

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

          // NoData check (< 0, NaN, or -9999)
          if (val < 0 || isNaN(val) || val <= -9000) {
            pixels[pIdx] = 0;
            pixels[pIdx + 1] = 0;
            pixels[pIdx + 2] = 0;
            pixels[pIdx + 3] = 0;
            continue;
          }

          const [r, g, b] = getPrecipColor(val);
          pixels[pIdx] = r;
          pixels[pIdx + 1] = g;
          pixels[pIdx + 2] = b;
          pixels[pIdx + 3] = 230; // Rich opacity for smooth interpolation
        }

        tempCtx.putImageData(imgData, 0, 0);

        // Render smoothed upscale canvas
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
              if (rIdx === 0) {
                ctx.moveTo(px, py);
              } else {
                ctx.lineTo(px, py);
              }
            }
            ctx.closePath();
          };

          const processGeometry = (geom: Geometry | null | undefined) => {
            if (!geom) return;
            if (geom.type === 'Polygon' && Array.isArray(geom.coordinates)) {
              for (const ring of geom.coordinates) {
                drawRing(ring);
              }
            } else if (geom.type === 'MultiPolygon' && Array.isArray(geom.coordinates)) {
              for (const poly of geom.coordinates) {
                for (const ring of poly) {
                  drawRing(ring);
                }
              }
            }
          };

          if (geoData && 'features' in geoData && Array.isArray(geoData.features)) {
            for (const feat of geoData.features as Array<{ geometry?: Geometry }>) {
              if (feat.geometry) processGeometry(feat.geometry);
            }
          } else if (geoData && 'geometry' in geoData) {
            processGeometry((geoData as { geometry?: Geometry }).geometry);
          } else if (geoData && (geoData.type === 'Polygon' || geoData.type === 'MultiPolygon')) {
            processGeometry(geoData as Geometry);
          }

          ctx.clip('evenodd');
          ctx.drawImage(tempCanvas, 0, 0, renderWidth, renderHeight);
          ctx.restore();
        } else {
          ctx.drawImage(tempCanvas, 0, 0, renderWidth, renderHeight);
        }

        const generatedUrl = canvas.toDataURL('image/png');
        cacheMap.set(cacheKey, { url: generatedUrl, bounds: leafletBounds });

        if (isMounted) {
          setDataUrl(generatedUrl);
          setBounds(leafletBounds);
          setLoading(false);
        }
      } catch (err) {
        console.error(`Failed to load CHIRPS ${type} precipitation raster:`, err);
        if (isMounted) setLoading(false);
      }
    }

    loadRaster();

    return () => {
      isMounted = false;
    };
  }, [type, geoData]);

  if (loading || !dataUrl || !bounds) return null;

  return <ImageOverlay url={dataUrl} bounds={bounds} opacity={opacity} pane={pane} />;
};
