export const ROUTES = {
  HOME: '/',
  MAP: '/map',
  PALIKAS: '/palikas',
  PALIKA_DETAIL: '/palikas/:palikaName',
  ANALYSIS: '/analysis',
  SIMULATOR: '/simulator',
  DOSSIER: '/dossier',
  RESEARCH_SANDBOX: '/research-sandbox',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
