// [DATA PROVENANCE]
// Data Source: data/real/hydrology/flow_direction.tif, apps/web/public/geojson/gulmi-district.json
// Classification: OBSERVED REAL (HydroSHEDS 3 Arc-Second / 90m D8 Surface Flow Direction)
// Citations: HydroSHEDS Technical Documentation (Lehner, Verdin, & Jarvis, 2008), WWF / USGS; Survey Department of Nepal
// Consumed By: apps/web/src/features/map/DistrictMap.tsx

import React, { useEffect, useState } from 'react';
import { ImageOverlay } from 'react-leaflet';
import { fromArrayBuffer } from 'geotiff';

interface SpatialFlowDirectionOverlayProps {
  opacity?: number;
  pane?: string;
  geoData?: any;
}

// Module-level in-memory cache for instant switching
let cachedDirectionUrl: string | null = null;
let cachedBounds: [[number, number], [number, number]] | null = null;
let cachedGeoDataRef: any = null;

export const SpatialFlowDirectionOverlay: React.FC<SpatialFlowDirectionOverlayProps> = ({
  opacity = 0.85,
  pane = 'rainfallPane',
  geoData,
}) => {
  const [dataUrl, setDataUrl] = useState<string | null>(cachedDirectionUrl);
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(cachedBounds);
  const [loading, setLoading] = useState<boolean>(!cachedDirectionUrl);

  useEffect(() => {
    if (cachedDirectionUrl && cachedBounds && cachedGeoDataRef === geoData) {
      setDataUrl(cachedDirectionUrl);
      setBounds(cachedBounds);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadRaster() {
      try {
        const response = await fetch('/tiles/flow_direction.tif');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();

        const tiff = await fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        const width = image.getWidth();
        const height = image.getHeight();
        const [rasterData] = await image.readRasters();
        const bbox = image.getBoundingBox();

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

          // D8 standard flow directions
          switch (val) {
            case 1:
              // East (90°) - Red
              pixels[pIdx] = 239;
              pixels[pIdx + 1] = 68;
              pixels[pIdx + 2] = 68;
              pixels[pIdx + 3] = 220;
              break;
            case 2:
              // South-East (135°) - Orange
              pixels[pIdx] = 249;
              pixels[pIdx + 1] = 115;
              pixels[pIdx + 2] = 22;
              pixels[pIdx + 3] = 220;
              break;
            case 4:
              // South (180°) - Yellow
              pixels[pIdx] = 234;
              pixels[pIdx + 1] = 179;
              pixels[pIdx + 2] = 8;
              pixels[pIdx + 3] = 220;
              break;
            case 8:
              // South-West (225°) - Green
              pixels[pIdx] = 34;
              pixels[pIdx + 1] = 197;
              pixels[pIdx + 2] = 94;
              pixels[pIdx + 3] = 220;
              break;
            case 16:
              // West (270°) - Cyan
              pixels[pIdx] = 6;
              pixels[pIdx + 1] = 182;
              pixels[pIdx + 2] = 212;
              pixels[pIdx + 3] = 220;
              break;
            case 32:
              // North-West (315°) - Blue
              pixels[pIdx] = 59;
              pixels[pIdx + 1] = 130;
              pixels[pIdx + 2] = 246;
              pixels[pIdx + 3] = 220;
              break;
            case 64:
              // North (0°) - Purple
              pixels[pIdx] = 168;
              pixels[pIdx + 1] = 85;
              pixels[pIdx + 2] = 247;
              pixels[pIdx + 3] = 220;
              break;
            case 128:
              // North-East (45°) - Pink
              pixels[pIdx] = 236;
              pixels[pIdx + 1] = 72;
              pixels[pIdx + 2] = 153;
              pixels[pIdx + 3] = 220;
              break;
            default:
              // NoData (255 or boundary mask) -> Transparent
              pixels[pIdx] = 0;
              pixels[pIdx + 1] = 0;
              pixels[pIdx + 2] = 0;
              pixels[pIdx + 3] = 0;
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

          const processGeometry = (geom: any) => {
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

          if (geoData.features && Array.isArray(geoData.features)) {
            for (const feat of geoData.features) {
              processGeometry(feat.geometry);
            }
          } else if (geoData.geometry) {
            processGeometry(geoData.geometry);
          } else if (geoData.type === 'Polygon' || geoData.type === 'MultiPolygon') {
            processGeometry(geoData);
          }

          ctx.clip('evenodd');
          ctx.drawImage(tempCanvas, 0, 0);
          ctx.restore();
        } else {
          ctx.drawImage(tempCanvas, 0, 0);
        }

        const generatedUrl = canvas.toDataURL('image/png');

        cachedDirectionUrl = generatedUrl;
        cachedBounds = leafletBounds;
        cachedGeoDataRef = geoData;

        if (isMounted) {
          setDataUrl(generatedUrl);
          setBounds(leafletBounds);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load HydroSHEDS flow direction raster:', err);
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
