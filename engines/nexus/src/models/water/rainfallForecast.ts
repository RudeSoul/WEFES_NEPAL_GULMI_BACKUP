/**
 * rainfallForecast.ts
 * Pure-JS ARIMA(2,1,1) for annual rainfall time-series forecasting.
 * No external models or packages required — runs entirely in the browser.
 *
 * Steps:
 *   1. d=1 differencing:  diff[t] = series[t] - series[t-1]
 *   2. AR(p=2) via Yule-Walker equations on the differenced series
 *   3. MA(q=1) from lag-1 autocorrelation of fitted residuals
 *   4. Recursive multi-step forecast with expanding 95% CI
 */

function mean(arr: number[]): number {
  return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function autocovariance(arr: number[], lag: number, mu: number): number {
  let sum = 0;
  for (let i = lag; i < arr.length; i++) {
    sum += (arr[i] - mu) * (arr[i - lag] - mu);
  }
  return sum / arr.length;
}

function yuleWalker(series: number[], order: number): number[] {
  const mu = mean(series);
  const gamma: number[] = [];
  for (let lag = 0; lag <= order; lag++) {
    gamma.push(autocovariance(series, lag, mu));
  }
  if (gamma[0] < 1e-12) return Array(order).fill(0);
  if (order === 1) {
    return [Math.max(-0.99, Math.min(0.99, gamma[1] / gamma[0]))];
  }
  if (order === 2) {
    const r0 = gamma[0], r1 = gamma[1], r2 = gamma[2];
    const det = r0 * r0 - r1 * r1;
    if (Math.abs(det) < 1e-12) return [0, 0];
    const phi1 = (r1 * r0 - r2 * r1) / det;
    const phi2 = (r2 * r0 - r1 * r1) / det;
    const clamp = (v: number) => Math.max(-0.95, Math.min(0.95, v));
    return [clamp(phi1), clamp(phi2)];
  }
  return Array(order).fill(0);
}

export interface ARIMAResult {
  historicalYears: number[];
  historicalValues: number[];
  forecastYears: number[];
  forecasts: number[];
  lower95: number[];
  upper95: number[];
  modelInfo: {
    order: string;
    arCoefficients: number[];
    maCoefficient: number;
    residualStd: number;
    meanDiff: number;
  };
}

export function arimaForecast(
  series: number[],
  startYear: number,
  steps: number = 10
): ARIMAResult {
  const n = series.length;
  const historicalYears = Array.from({ length: n }, (_, i) => startYear + i);
  const lastYear = startYear + n - 1;
  const forecastYears = Array.from({ length: steps }, (_, i) => lastYear + 1 + i);

  if (n < 8) {
    const flat = series[n - 1] ?? 0;
    return {
      historicalYears, historicalValues: series, forecastYears,
      forecasts: Array(steps).fill(flat),
      lower95: Array(steps).fill(Math.max(0, flat * 0.8)),
      upper95: Array(steps).fill(flat * 1.2),
      modelInfo: { order: 'insufficient data', arCoefficients: [], maCoefficient: 0, residualStd: 0, meanDiff: 0 },
    };
  }

  // Step 1: d=1 differencing
  const diff: number[] = [];
  for (let i = 1; i < n; i++) diff.push(series[i] - series[i - 1]);
  const diffMu = mean(diff);

  // Step 2: AR(2) via Yule-Walker
  const phi = yuleWalker(diff, 2);

  // Step 3: Initial residuals
  const res1: number[] = [0, 0];
  for (let i = 2; i < diff.length; i++) {
    const fitted = diffMu + phi[0] * (diff[i - 1] - diffMu) + phi[1] * (diff[i - 2] - diffMu);
    res1.push(diff[i] - fitted);
  }

  // Step 4: MA(1) coefficient from lag-1 autocorrelation of residuals
  const resMu = mean(res1);
  const cov0 = autocovariance(res1, 0, resMu);
  const cov1 = autocovariance(res1, 1, resMu);
  const theta = cov0 > 1e-10 ? Math.max(-0.85, Math.min(0.85, cov1 / cov0)) : 0;

  // Step 5: Refined residuals with MA(1) term
  const res2: number[] = [0, 0];
  for (let i = 2; i < diff.length; i++) {
    const fitted = diffMu + phi[0] * (diff[i - 1] - diffMu) + phi[1] * (diff[i - 2] - diffMu) + theta * res2[i - 1];
    res2.push(diff[i] - fitted);
  }

  const window = Math.min(15, res2.length);
  const residualStd = Math.sqrt(mean(res2.slice(-window).map(r => r * r)));

  // Step 6: Recursive forecast
  const extDiff = [...diff];
  const extRes = [...res2];
  const forecasts: number[] = [];
  const lower95: number[] = [];
  const upper95: number[] = [];
  let level = series[n - 1];

  for (let h = 0; h < steps; h++) {
    const d1 = extDiff[extDiff.length - 1] - diffMu;
    const d2 = extDiff[extDiff.length - 2] - diffMu;
    const maTerm = h === 0 ? theta * extRes[extRes.length - 1] : 0;
    const nextDiff = diffMu + phi[0] * d1 + phi[1] * d2 + maTerm;
    extDiff.push(nextDiff);
    extRes.push(0);
    level = level + nextDiff;
    const f = Math.max(0, level);
    const margin = 1.96 * residualStd * Math.sqrt(h + 1);
    forecasts.push(Number(f.toFixed(1)));
    lower95.push(Math.max(0, Number((f - margin).toFixed(1))));
    upper95.push(Number((f + margin).toFixed(1)));
  }

  return {
    historicalYears, historicalValues: series, forecastYears, forecasts, lower95, upper95,
    modelInfo: {
      order: 'ARIMA(2,1,1)',
      arCoefficients: phi.map(v => Number(v.toFixed(4))),
      maCoefficient: Number(theta.toFixed(4)),
      residualStd: Number(residualStd.toFixed(1)),
      meanDiff: Number(diffMu.toFixed(1)),
    },
  };
}

/** Extract annual rainfall totals (mm/yr) from MERRA-2 climateMap. prectot = monthly total in mm. */
export function extractAnnualRainfallSeries(
  climateMap: Record<string, Record<string, Record<string, { prectot?: number }>>>,
  districtId: string
): { values: number[]; startYear: number } {
  const distMap = climateMap?.[districtId];
  if (!distMap) return { values: [], startYear: 1981 };
  const years = Object.keys(distMap).map(Number).sort((a, b) => a - b);
  const values: number[] = [];
  for (const yr of years) {
    let annual = 0;
    const mMap = distMap[yr];
    for (let m = 1; m <= 12; m++) annual += mMap?.[m]?.prectot ?? 0;
    if (annual > 0) values.push(Number(annual.toFixed(1)));
  }
  return { values, startYear: years[0] ?? 1981 };
}
