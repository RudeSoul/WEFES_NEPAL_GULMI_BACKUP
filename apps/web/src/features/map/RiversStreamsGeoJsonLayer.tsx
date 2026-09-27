import { GeoJSON } from 'react-leaflet';

interface RiversStreamsGeoJsonLayerProps {
  data: any;
}

export function RiversStreamsGeoJsonLayer({ data }: RiversStreamsGeoJsonLayerProps) {
  return (
    <GeoJSON
      key="gulmi-rivers-streams-hydrorivers-layer"
      data={data}
      pane="riversPane"
      style={(feature: any) => {
        const order = feature?.properties?.ORD_STRA || 1;
        const is1 = order === 1;
        const is2 = order === 2;
        const is34 = order === 3 || order === 4;

        return {
          color: is1 ? '#7dd3fc' : is2 ? '#38bdf8' : is34 ? '#0284c7' : '#1e3a8a',
          weight: is1 ? 1.8 : is2 ? 2.8 : is34 ? 4.2 : 5.5,
          opacity: is1 ? 0.85 : 0.98,
        };
      }}
      onEachFeature={(feature: any, layer: any) => {
        const p = feature?.properties || {};

        layer.bindTooltip(`
          <div style="padding: 5px 8px; font-size: 11px; min-width: 190px;">
            <div style="font-weight: 800; color: #0284c7; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px;">
              🌊 HydroRIVERS Stream Reach #${p.HYRIV_ID || ''}
            </div>
            <div style="color: #1e293b; font-size: 10.5px;"><strong>Strahler Stream Order:</strong> Order ${p.ORD_STRA ?? 1}</div>
            <div style="color: #0369a1; font-size: 10.5px; font-weight: 700;">Mean Discharge: ${p.DIS_AV_CMS ?? 'N/A'} m³/s</div>
            <div style="color: #475569; font-size: 10px; margin-top: 2px;">Reach Length: <strong>${p.LENGTH_KM ?? 'N/A'} km</strong></div>
            <div style="color: #64748b; font-size: 9.5px;">Upland Catchment: ${p.UPLAND_SKM ?? 'N/A'} km²</div>
          </div>
        `, { direction: 'top', offset: [0, -4], opacity: 0.98, pane: 'popupPane' });
      }}
    />
  );
}
