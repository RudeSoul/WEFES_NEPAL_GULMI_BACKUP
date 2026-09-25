/// <reference types="vite/client" />

// [DATA PROVENANCE]
// Data Source: apps/web/public/data/, apps/web/public/geojson/, or external CDN/API
// Classification: CLIENT DATA ADAPTER (Static Assets / REST Endpoints)
// Citations: WEFE Nexus Nepal Platform Data Governance

/**
 * Data Client for decoupled asset fetching.
 * In local dev/static mode, fetches from `/data` or `/geojson` static folders.
 * In remote/production mode, seamlessly redirects to VITE_DATA_BASE_URL (CDN or API).
 */

const DATA_BASE_URL = ((import.meta as any).env?.VITE_DATA_BASE_URL as string) || '';
const GEOJSON_BASE_URL = ((import.meta as any).env?.VITE_GEOJSON_BASE_URL as string) || '';

export async function fetchDataset<T = any>(endpoint: string): Promise<T> {
  const cleanPath = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const baseUrl = DATA_BASE_URL || '/data';
  const url = `${baseUrl.replace(/\/$/, '')}/${cleanPath}`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`[DataClient] Failed to load dataset from ${url} (HTTP ${response.status})`);
  }

  return response.json();
}

export async function fetchGeoJson<T = any>(filename: string): Promise<T> {
  const cleanName = filename.startsWith('/') ? filename.slice(1) : filename;
  const baseUrl = GEOJSON_BASE_URL || '/geojson';
  const url = `${baseUrl.replace(/\/$/, '')}/${cleanName}`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json, application/geo+json',
    },
  });

  if (!response.ok) {
    throw new Error(`[DataClient] Failed to load GeoJSON from ${url} (HTTP ${response.status})`);
  }

  return response.json();
}
