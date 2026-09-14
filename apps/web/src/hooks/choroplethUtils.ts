// [DATA PROVENANCE]
// Data Source: data/real/boundaries/gulmi-palikas.json, data/real/municipal/palika_profiles.json
// Classification: OBSERVED REAL & EMPIRICAL DOWNSCALING
// Citations: MoFAGA Nepal, DHM Nepal, CBS 2021 Census, NASA POWER / MERRA-2

export const CHOROPLETH_RAMPS = {
  blues: ['#eff6ff', '#bfdbfe', '#60a5fa', '#2563eb', '#1d4ed8', '#1e3a8a'],
  rainfall: ['#fed7aa', '#fdba74', '#38bdf8', '#0284c7', '#0369a1', '#1e3a8a'],
  viridis: ['#440154', '#414487', '#2a788e', '#22a884', '#7ad151', '#fde725'],
  ylgn: ['#ffffe5', '#d9f0a3', '#78c679', '#31a354', '#006837'],
  purples: ['#f3e8ff', '#d8b4fe', '#a855f7', '#7c3aed', '#4c1d95'],
  rdylgn: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#047857'],
  gnylrd: ['#047857', '#10b981', '#f59e0b', '#f97316', '#ef4444'],
  soilPh: ['#ef4444', '#f59e0b', '#84cc16', '#10b981', '#059669', '#0284c7'],
};

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ];
}

function interpolateRgb(c1: string, c2: string, factor: number): string {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));
  return `rgb(${r},${g},${b})`;
}

export function computeGradientColor(val: number, min: number, max: number, palette: string[]): string {
  if (isNaN(val) || val === null || val === undefined) return '#94a3b8';
  const clamped = Math.max(min, Math.min(max, val));
  const norm = max === min ? 0.5 : (clamped - min) / (max - min);
  const segCount = palette.length - 1;
  const segIndex = Math.min(Math.floor(norm * segCount), segCount - 1);
  const segFactor = (norm - segIndex / segCount) * segCount;
  return interpolateRgb(palette[segIndex], palette[segIndex + 1], segFactor);
}

export function normalizePalikaName(name: string): string {
  return (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}
