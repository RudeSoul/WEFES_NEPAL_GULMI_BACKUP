// [DATA PROVENANCE]
// Data Source: data/real/boundaries/gulmi_buildings.geojson, apps/web/public/tiles/gulmi_settlement_density_overlay.png
// Classification: PRE-RENDERED 250M GAUSSIAN DENSITY SURFACE (78,934 OSM Building Geometries)
// Citations: OpenStreetMap Contributors via QGIS QuickOSM; Survey Department of Nepal
// Consumed By: apps/web/src/features/map/DistrictMap.tsx

import React from 'react';
import { ImageOverlay } from 'react-leaflet';

// Bounding box matching the exact Gulmi district boundary extent
const SETTLEMENT_DENSITY_BOUNDS: [[number, number], [number, number]] = [
  [27.92173482, 83.02260552857142],
  [28.26996646, 83.6044254],
];

interface SpatialSettlementDensityOverlayProps {
  geoData?: any;
  bounds?: [[number, number], [number, number]];
  opacity?: number;
}

export const SpatialSettlementDensityOverlay: React.FC<SpatialSettlementDensityOverlayProps> = ({
  opacity = 0.78,
}) => {
  return (
    <ImageOverlay
      url="/tiles/gulmi_settlement_density_overlay.png"
      bounds={SETTLEMENT_DENSITY_BOUNDS}
      opacity={opacity}
      zIndex={360}
    />
  );
};
