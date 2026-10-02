// [DATA PROVENANCE]
// Data Source: data/real/hydrology/flow_accumulation.tif, apps/web/public/geojson/gulmi-district.json
// Classification: OBSERVED REAL (HydroSHEDS 3 Arc-Second / 90m Flow Accumulation Grid)
// Citations: HydroSHEDS Technical Documentation (Lehner, Verdin, & Jarvis, 2008), WWF / USGS; Survey Department of Nepal
// Consumed By: apps/web/src/features/map/DistrictMap.tsx

import React, { useEffect, useState } from 'react';

import type { GeoJsonObject, Geometry } from 'geojson';
import { fromArrayBuffer } from 'geotiff';
import { ImageOverlay } from 'react-leaflet';
import { getTileUrl } from '../../services/dataClient';

interface SpatialFlowAccumulationOverlayProps {
  opacity?: number;
  pane?: string;
  geoData?: GeoJsonObject | null;
}

// Module-level in-memory cache for instant switching
let cachedAccumulationUrl: string | null = null;
let cachedBounds: [[number, number], [number, number]] | null = null;
let cachedGeoDataRef: GeoJsonObject | null = null;

export const SpatialFlowAccumulationOverlay: React.FC<SpatialFlowAccumulationOverlayProps> = ({
  opacity = 0.88,
  pane = 'rainfallPane',
  geoData,
}) => {
  const [dataUrl, setDataUrl] = useState<string | null>(cachedAccumulationUrl);
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(cachedBounds);
  const [loading, setLoading] = useState<boolean>(!cachedAccumulationUrl);

  useEffect(() => {
    if (cachedAccumulationUrl && cachedBounds && cachedGeoDataRef === geoData) {
      setDataUrl(cachedAccumulationUrl);
      setBounds(cachedBounds);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadRaster() {
      try {
        const response = await fetch(getTileUrl('flow_accumulation.tif'));
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();

        const tiff = await fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        const width = image.getWidth();
        const height = image.getHeight();
        const [rasterData] = await image.readRasters();
        const bbox = image.getBoundingBox(); // [minX, minY, maxX, maxY]

        // Convert bbox [minLng, minLat, maxLng, maxLat] to Leaflet bounds [[south, west], [north, east]]
        const leafletBounds: [[number, number], [number, number]] = [
          [bbox[1], bbox[0]],
          [bbox[3], bbox[2]],
        ];

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

          // NoData (< 0 or NaN)
          if (val < 0 || isNaN(val)) {
            pixels[pIdx] = 0;
            pixels[pIdx + 1] = 0;
            pixels[pIdx + 2] = 0;
            pixels[pIdx + 3] = 0;
            continue;
          }

          // HydroSHEDS accumulation tiers
          switch (val) {
            case 0:
              // Tier 0: Ridge crests & hillslopes (soft atmospheric sky tint)
              pixels[pIdx] = 224;
              pixels[pIdx + 1] = 242;
              pixels[pIdx + 2] = 254;
              pixels[pIdx + 3] = 95;
              break;
            case 1:
              // Tier 1: Ephemeral swales & rills
              pixels[pIdx] = 125;
              pixels[pIdx + 1] = 211;
              pixels[pIdx + 2] = 252;
              pixels[pIdx + 3] = 175;
              break;
            case 2:
              // Tier 2: Headwater stream tributaries
              pixels[pIdx] = 56;
              pixels[pIdx + 1] = 189;
              pixels[pIdx + 2] = 248;
              pixels[pIdx + 3] = 220;
              break;
            case 3:
              // Tier 3: Secondary stream corridors
              pixels[pIdx] = 14;
              pixels[pIdx + 1] = 165;
              pixels[pIdx + 2] = 233;
              pixels[pIdx + 3] = 245;
              break;
            case 4:
              // Tier 4: Major valley riverbeds
              pixels[pIdx] = 2;
              pixels[pIdx + 1] = 132;
              pixels[pIdx + 2] = 199;
              pixels[pIdx + 3] = 255;
              break;
            case 5:
              // Tier 5: Perennial river trunk channels
              pixels[pIdx] = 3;
              pixels[pIdx + 1] = 105;
              pixels[pIdx + 2] = 161;
              pixels[pIdx + 3] = 255;
              break;
            default:
              // Tier 6: Main Gandaki / Badigad drainage axis
              pixels[pIdx] = 30;
              pixels[pIdx + 1] = 58;
              pixels[pIdx + 2] = 138;
              pixels[pIdx + 3] = 255;
              break;
          }
        }

        tempCtx.putImageData(imgData, 0, 0);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clip strictly within Gulmi vector boundary if geoData is provided
        if (geoData) {
          const [minLng, minLat, maxLng, maxLat] = bbox;
          const lngSpan = maxLng - minLng;
          const latSpan = maxLat - minLat;

          ctx.save();
          ctx.beginPath();

          const drawRing = (ring: number[][]) => {
            for (let rIdx = 0; rIdx < ring.length; rIdx++) {
              const [lng, lat] = ring[rIdx];
              const px = ((lng - minLng) / lngSpan) * width;
              const py = ((maxLat - lat) / latSpan) * height;
              if (rIdx === 0) {
                ctx.moveTo(px, py);
              } else {
                ctx.lineTo(px, py);
              }
            }
            ctx.closePath();
          };

          const processGeometry = (geom?: Geometry | GeoJsonObject | null) => {
            if (!geom || !('type' in geom)) return;
            const typedGeom = geom as Geometry;
            if (typedGeom.type === 'Polygon' && Array.isArray(typedGeom.coordinates)) {
              for (const ring of typedGeom.coordinates) {
                drawRing(ring);
              }
            } else if (typedGeom.type === 'MultiPolygon' && Array.isArray(typedGeom.coordinates)) {
              for (const poly of typedGeom.coordinates) {
                for (const ring of poly) {
                  drawRing(ring);
                }
              }
            }
          };

          const anyGeo = geoData as GeoJsonObject & {
            features?: Array<{ geometry: Geometry }>;
            geometry?: Geometry;
          };
          if (anyGeo.features && Array.isArray(anyGeo.features)) {
            for (const feat of anyGeo.features) {
              processGeometry(feat.geometry);
            }
          } else if (anyGeo.geometry) {
            processGeometry(anyGeo.geometry);
          } else if (geoData.type === 'Polygon' || geoData.type === 'MultiPolygon') {
            processGeometry(geoData as Geometry);
          }

          ctx.clip('evenodd');
          ctx.drawImage(tempCanvas, 0, 0);
          ctx.restore();
        } else {
          ctx.drawImage(tempCanvas, 0, 0);
        }

        const generatedUrl = canvas.toDataURL('image/png');

        cachedAccumulationUrl = generatedUrl;
        cachedBounds = leafletBounds;
        cachedGeoDataRef = geoData ?? null;

        if (isMounted) {
          setDataUrl(generatedUrl);
          setBounds(leafletBounds);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load HydroSHEDS flow accumulation raster:', err);
        if (isMounted) setLoading(false);
      }
    }

    loadRaster();

    return () => {
      isMounted = false;
    };
  }, [geoData]);

  if (loading || !dataUrl || !bounds) return null;

  return <ImageOverlay url={dataUrl} bounds={bounds} opacity={opacity} pane={pane} />;
};
