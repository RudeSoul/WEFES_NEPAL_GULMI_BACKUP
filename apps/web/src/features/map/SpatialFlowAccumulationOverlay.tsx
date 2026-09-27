// [DATA PROVENANCE]
// Data Source: data/real/hydrology/flow_accumulation.tif
// Classification: OBSERVED REAL (HydroSHEDS 3 Arc-Second / 90m Flow Accumulation Grid)
// Citations: HydroSHEDS Technical Documentation (Lehner, Verdin, & Jarvis, 2008), WWF / USGS
// Consumed By: apps/web/src/features/map/DistrictMap.tsx

import React, { useEffect, useState } from 'react';
import { ImageOverlay } from 'react-leaflet';
import { fromArrayBuffer } from 'geotiff';

interface SpatialFlowAccumulationOverlayProps {
  opacity?: number;
  pane?: string;
}

// Module-level in-memory cache for instant switching
let cachedAccumulationUrl: string | null = null;
let cachedBounds: [[number, number], [number, number]] | null = null;

export const SpatialFlowAccumulationOverlay: React.FC<SpatialFlowAccumulationOverlayProps> = ({
  opacity = 0.88,
  pane = 'rainfallPane',
}) => {
  const [dataUrl, setDataUrl] = useState<string | null>(cachedAccumulationUrl);
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(cachedBounds);
  const [loading, setLoading] = useState<boolean>(!cachedAccumulationUrl);

  useEffect(() => {
    if (cachedAccumulationUrl && cachedBounds) {
      setDataUrl(cachedAccumulationUrl);
      setBounds(cachedBounds);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadRaster() {
      try {
        const response = await fetch('/tiles/flow_accumulation.tif');
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

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imgData = ctx.createImageData(width, height);
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

        ctx.putImageData(imgData, 0, 0);
        const generatedUrl = canvas.toDataURL('image/png');

        cachedAccumulationUrl = generatedUrl;
        cachedBounds = leafletBounds;

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
  }, []);

  if (loading || !dataUrl || !bounds) return null;

  return (
    <ImageOverlay
      url={dataUrl}
      bounds={bounds}
      opacity={opacity}
      pane={pane}
    />
  );
};
