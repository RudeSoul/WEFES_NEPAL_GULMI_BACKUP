import React, { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';

export const MapGestureHandler: React.FC = () => {
  const map = useMap();
  const [showHint, setShowHint] = useState(false);
  const timeoutRef = useRef<any>(null);
  const lastZoomTimeRef = useRef<number>(0);
  const deltaAccumulatorRef = useRef<number>(0);

  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;

    // Ensure Leaflet's aggressive default scroll-wheel capture is disabled
    map.scrollWheelZoom.disable();

    const handleWheel = (e: WheelEvent) => {
      if (e.metaKey || e.ctrlKey) {
        // Holding ⌘ (Mac) or Ctrl (Windows/Linux) -> Zoom the map
        e.preventDefault();
        setShowHint(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        deltaAccumulatorRef.current += e.deltaY;
        const now = Date.now();

        // Throttle zoom steps to provide smooth, responsive zoom
        if (Math.abs(deltaAccumulatorRef.current) >= 40 && now - lastZoomTimeRef.current > 90) {
          const currentZoom = map.getZoom();
          const minZoom = map.getMinZoom();
          const maxZoom = map.getMaxZoom();

          const zoomDelta = deltaAccumulatorRef.current < 0 ? 1 : -1;
          const targetZoom = Math.min(maxZoom, Math.max(minZoom, currentZoom + zoomDelta));

          if (targetZoom !== currentZoom) {
            try {
              const latlng = map.mouseEventToLatLng(e);
              map.setZoomAround(latlng, targetZoom, { animate: true });
            } catch {
              if (zoomDelta > 0) map.zoomIn();
              else map.zoomOut();
            }
          }

          deltaAccumulatorRef.current = 0;
          lastZoomTimeRef.current = now;
        }
      } else {
        // Normal scroll without modifier key -> let the page scroll naturally!
        setShowHint(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setShowHint(false);
        }, 1300);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [map]);

  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent || '');
  const keyName = isMac ? '⌘' : 'Ctrl';

  if (!showHint) return null;

  return (
    <div className="absolute inset-0 z-[1200] pointer-events-none flex items-center justify-center bg-slate-900/35 backdrop-blur-[1.5px] transition-all duration-200 animate-fade-in">
      <div className="bg-slate-900/95 text-white font-sans text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-white/20 flex items-center gap-2.5 tracking-wide font-medium">
        <kbd className="px-2 py-0.5 bg-white/20 rounded font-mono font-bold text-white text-xs shadow-xs border border-white/30">
          {keyName}
        </kbd>
        <span>+ scroll to zoom map</span>
      </div>
    </div>
  );
};
