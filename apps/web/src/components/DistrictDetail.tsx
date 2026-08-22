import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { District, Crop, CropSuitability } from '@wefes/shared-types';
import { db } from '@wefes/database';
import { computeCropSuitability } from '@wefes/wefes-engine';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip,
  ComposedChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ReferenceLine, Cell
} from 'recharts';
import { arimaForecast, extractAnnualRainfallSeries, ARIMAResult } from '../utils/rainfallForecast';
import {
  Sprout, CloudRain, Sun, Mountain, DollarSign, ArrowLeft, ChevronRight, Sparkles,
  Layers, GitCompare, Calendar, Wind, Thermometer, Gauge, Zap, X, Info, TrendingUp,
  MapPin, Leaf, Cherry, Wheat as WheatIcon, ArrowUpRight, ArrowUp
} from 'lucide-react';
import { FeasibilityMatrix } from './FeasibilityMatrix';
import { CropComparativeAnalysis } from './CropComparativeAnalysis';
import { DistrictDetailMap } from './DistrictDetailMap';

interface DistrictDetailProps {
  district: District;
  onSelectCrop: (crop: Crop) => void;
  onBackToMap: () => void;
  climateDataset?: any;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type ModalKey = 'rainfall' | 'solar' | 'soil' | 'labor' | null;

interface IndicatorModalProps {
  modalKey: ModalKey;
  district: District;
  distClimatology: any;
  climateDataset: any;
  rainfallSeries: number[];
  rainfallARIMA: ARIMAResult | null;
  rfStartYear: number;
  onClose: () => void;
}

const IndicatorModal: React.FC<IndicatorModalProps> = ({ modalKey, district, distClimatology, climateDataset, rainfallSeries, rainfallARIMA, rfStartYear, onClose }) => {
  useEffect(() => {
    if (!modalKey) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [modalKey, onClose]);

  if (!modalKey) return null;

  let modalContent: React.ReactNode = null;
  let maxWidth = 'max-w-2xl';

  if (modalKey === 'rainfall') {
    maxWidth = 'max-w-3xl';
    const annualSeries = rainfallSeries;
    const startYear = rfStartYear;
    const arima = rainfallARIMA;

    // Build unified chart data with seamless overlap at boundary year
    const chartData: any[] = [];
    if (arima && arima.historicalYears.length > 0) {
      const lastHistYear = arima.historicalYears[arima.historicalYears.length - 1];
      const lastHistVal = arima.historicalValues[arima.historicalValues.length - 1];

      arima.historicalYears.forEach((yr, i) => {
        chartData.push({
          year: yr,
          historical: arima.historicalValues[i],
          forecast: yr === lastHistYear ? lastHistVal : undefined,
          lower: yr === lastHistYear ? lastHistVal : undefined,
          upper: yr === lastHistYear ? lastHistVal : undefined,
        });
      });

      arima.forecastYears.forEach((yr, i) => {
        chartData.push({
          year: yr,
          forecast: arima.forecasts[i],
          lower: arima.lower95[i],
          upper: arima.upper95[i],
        });
      });
    }

    const histMean = annualSeries.length > 0
      ? Math.round(annualSeries.reduce((s, v) => s + v, 0) / annualSeries.length)
      : district.avgRainfallMm;
    const predictedVal = arima ? Math.round(arima.forecasts[4]) : histMean; // 5-Year Ahead Forecast (~2024)
    const forecastEndYear = arima ? arima.forecastYears[arima.forecastYears.length - 1] : null;

    modalContent = (
      <>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
              <CloudRain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-outfit">Predicted Annual Rainfall — {district.name}</h3>
              <p className="text-xs text-slate-500">Pure-JS ARIMA(2,1,1) Time Series Forecasting</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        {/* Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-sky-50/80 rounded-xl px-4 py-3 border border-sky-200">
            <div className="text-[10px] text-sky-800 uppercase font-semibold tracking-wider">
              Predicted Rainfall (2024)
            </div>
            <div className="text-2xl font-extrabold text-sky-950 mt-0.5">{predictedVal} <span className="text-xs font-normal text-sky-700">mm/yr</span></div>
            {arima && (
              <div className="text-[10px] text-sky-700 font-mono mt-1">
                95% CI: [{Math.round(arima.lower95[4])} – {Math.round(arima.upper95[4])}] mm
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
            <div className="text-[10px] text-slate-600 uppercase font-semibold tracking-wider">
              39-Year Historical Mean
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{histMean} <span className="text-xs font-normal text-slate-500">mm/yr</span></div>
            <div className="text-[10px] text-slate-600 mt-1">
              MERRA-2 ({startYear}–{startYear + annualSeries.length - 1})
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 flex flex-col justify-between">
            <div className="text-[10px] text-slate-600 uppercase font-semibold tracking-wider">
              ARIMA(2,1,1) Parameters
            </div>
            {arima ? (
              <div className="space-y-1 font-mono text-[10px] text-slate-700 mt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">AR(2) [φ₁, φ₂]:</span>
                  <span className="font-semibold text-slate-900">[{arima.modelInfo.arCoefficients.join(', ')}]</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MA(1) θ:</span>
                  <span className="font-semibold text-slate-900">{arima.modelInfo.maCoefficient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Residual Std σ:</span>
                  <span className="font-semibold text-slate-900">{arima.modelInfo.residualStd} mm</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">Baseline value</div>
            )}
          </div>
        </div>

        {/* Time-Series Chart */}
        {arima && (
          <div>
            <div className="text-xs text-slate-700 mb-2 font-medium flex items-center justify-between">
              <span>Annual History + 10-Year ARIMA Forecast ({startYear}–{forecastEndYear})</span>
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="inline-block w-3.5 h-0.5 bg-sky-600"></span><span className="text-[10px] text-slate-600">Historical (1981–2019)</span></span>
                <span className="flex items-center gap-1"><span className="inline-block w-3.5 h-0.5 border-t-2 border-dashed border-teal-500"></span><span className="text-[10px] text-slate-600">Forecast (2020–2029)</span></span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded bg-sky-200"></span><span className="text-[10px] text-slate-600">95% CI</span></span>
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} unit=" mm" width={55} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.5rem', color: '#0f172a', fontSize: 11, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  formatter={(v: any, name: string) => {
                    if (name === 'lower' || name === 'upper') return null;
                    if (name === 'historical') return [`${Math.round(v)} mm/yr`, 'Historical (MERRA-2)'];
                    if (name === 'forecast') return [`${Math.round(v)} mm/yr`, 'ARIMA Forecast'];
                    return [v, name];
                  }}
                />
                {/* 95% CI band */}
                <Area dataKey="upper" stroke="none" fill="#bae6fd" isAnimationActive={false} />
                <Area dataKey="lower" stroke="none" fill="#ffffff" isAnimationActive={false} />
                {/* Historical line */}
                <Line type="monotone" dataKey="historical" stroke="#0284c7" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                {/* Forecast line (dashed) */}
                <Line type="monotone" dataKey="forecast" stroke="#0d9488" strokeWidth={2.5} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
                {/* Dividing reference line at boundary year */}
                <ReferenceLine x={startYear + annualSeries.length - 1} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Forecast →', fill: '#64748b', fontSize: 10 }} />
              </ComposedChart>
            </ResponsiveContainer>

            {/* 10-Year Forecast Horizon Breakdown */}
            <div className="mt-3">
              <div className="text-[10px] text-slate-700 uppercase font-semibold tracking-wider mb-1.5">10-Year Forecast Trajectory (2020–2029)</div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {arima.forecastYears.map((yr, i) => (
                  <div key={yr} className={`p-1.5 rounded-lg text-center border text-[10px] transition-colors ${i === 4 ? 'bg-sky-50 border-sky-300 font-bold text-sky-950 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <div className="text-slate-500 font-mono text-[9px]">{yr}</div>
                    <div className="font-bold font-mono mt-0.5">{Math.round(arima.forecasts[i])}</div>
                    <div className="text-[8px] text-slate-500 font-mono mt-0.5">±{Math.round(arima.upper95[i] - arima.forecasts[i])}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="text-[11px] text-slate-500 flex items-start gap-1.5 pt-2 border-t border-slate-200">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-sky-600" />
          <span>ARIMA(2,1,1) client-side forecasting computed directly from 39-year MERRA-2 historical series (1981–2019). Expanding 95% confidence intervals reflect uncertainty over time horizon.</span>
        </div>
      </>
    );
  } else if (modalKey === 'solar') {
    maxWidth = 'max-w-2xl';
    const nasaYearly = (district as any).nasaSolarYearly || {};
    const yearKeys = Object.keys(nasaYearly).map(Number).sort();
    const lineData = yearKeys.map(y => ({ year: y, solar: nasaYearly[y] }));
    const avg = yearKeys.length > 0
      ? Number((yearKeys.reduce((s, y) => s + nasaYearly[y], 0) / yearKeys.length).toFixed(3))
      : ((district as any).nasaSolarRadiationKwh || district.solarRadiationKwh);
    const isReal = yearKeys.length > 0;

    modalContent = (
      <>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <Sun className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-outfit">NASA POWER Solar Irradiance — {district.name}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex items-center gap-3 bg-amber-50/80 rounded-xl px-4 py-3 border border-amber-200">
          <div>
            <div className="text-[10px] text-amber-800 uppercase font-semibold tracking-wider">
              {isReal ? `${yearKeys.length}-Year Avg Daily Solar Irradiance (${yearKeys[0]}–${yearKeys[yearKeys.length-1]})` : 'Solar Radiation (Proxy)'}
            </div>
            <div className="text-2xl font-extrabold text-amber-950 mt-0.5">{avg} <span className="text-sm font-normal text-amber-700">kWh/m²/day</span></div>
            <div className="text-xs text-amber-800/80 mt-0.5">
              {isReal ? `Satellite observations from NASA POWER MERRA-2` : 'Proxy estimate'}
            </div>
          </div>
          <span className={`ml-auto text-[10px] px-2.5 py-1 rounded-md border font-mono font-semibold shrink-0 ${isReal ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {isReal ? 'NASA POWER' : 'Proxy'}
          </span>
        </div>
        {isReal && lineData.length > 0 && (
          <div>
            <div className="text-xs text-slate-700 mb-2 font-medium">Annual Solar Irradiance Trend ({yearKeys[0]}–{yearKeys[yearKeys.length-1]})</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={lineData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 10 }} unit=" kWh" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.5rem', color: '#0f172a', fontSize: 11 }} formatter={(v: any) => [`${v} kWh/m²/day`, 'Solar']} />
                <ReferenceLine y={avg} stroke="#d97706" strokeDasharray="4 4" label={{ value: `Avg ${avg}`, fill: '#b45309', fontSize: 10 }} />
                <Line type="monotone" dataKey="solar" stroke="#d97706" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="text-[11px] text-slate-500 flex items-start gap-1.5 pt-2 border-t border-slate-200">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
          <span>Annual average daily solar irradiance (kWh/m²/day) from NASA POWER satellite observations. Dashed line indicates multi-decadal mean.</span>
        </div>
      </>
    );
  } else if (modalKey === 'soil') {
    maxWidth = 'max-w-2xl';
    const hasReal = district.hasRealSoilData !== false && (district.soilSampleCount || 0) > 0 && district.baseSoilPh !== undefined;
    const ph = district.baseSoilPh;
    const phClass = ph === undefined ? 'No Data' : ph > 7.5 ? 'Alkaline' : ph >= 6.5 ? 'Optimal Neutral' : ph >= 5.5 ? 'Moderately Acidic' : 'Strongly Acidic';
    const phScale = [
      { label: '<5.5', desc: 'Strongly Acidic', color: '#e11d48' },
      { label: '5.5–6.5', desc: 'Mod. Acidic', color: '#d97706' },
      { label: '6.5–7.5', desc: 'Optimal Neutral', color: '#059669' },
      { label: '>7.5', desc: 'Alkaline', color: '#0284c7' },
    ];

    modalContent = (
      <>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Mountain className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-outfit">Soil pH & Nutrients — {district.name}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 border bg-emerald-50/80 border-emerald-200">
          <div>
            <div className="text-[10px] text-emerald-800 uppercase font-semibold tracking-wider">
              {hasReal ? `NARC Ground Survey (${district.soilSampleCount} field samples)` : 'Soil pH Data'}
            </div>
            <div className="text-2xl font-extrabold text-emerald-950 mt-0.5">
              {ph !== undefined ? `pH ${ph}` : 'No Data'}
              <span className="text-sm font-semibold text-emerald-800 ml-2 font-mono">({phClass})</span>
            </div>
            {hasReal && <div className="text-xs text-emerald-800 mt-0.5">Dominant soil type: <strong className="text-emerald-950">{district.soilType || 'N/A'}</strong></div>}
          </div>
          <span className={`ml-auto text-[10px] px-2.5 py-1 rounded-md border font-mono font-semibold shrink-0 ${hasReal ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {hasReal ? 'NARC Ground' : 'No Data'}
          </span>
        </div>
        <div>
          <div className="text-xs text-slate-700 mb-2 font-medium">pH Classification Range</div>
          <div className="flex gap-1.5">
            {phScale.map(({ label, desc, color }) => (
              <div key={label} className={`flex-1 rounded-lg py-2.5 text-center border transition-all ${ph !== undefined && ((label === '<5.5' && ph < 5.5)||(label === '5.5–6.5' && ph >= 5.5 && ph < 6.5)||(label === '6.5–7.5' && ph >= 6.5 && ph <= 7.5)||(label === '>7.5' && ph > 7.5)) ? 'border-slate-400 bg-slate-100 shadow-sm font-bold' : 'border-slate-200 bg-slate-50/80 opacity-70'}`}>
                <div className="text-[11px] font-bold font-mono" style={{ color }}>{label}</div>
                <div className="text-[9px] text-slate-600 mt-0.5">{desc}</div>
              </div>
            ))}
          </div>
        </div>
        {hasReal && district.soilNitrogen !== undefined && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total N', value: `${district.soilNitrogen}%`, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
              { label: 'P₂O₅', value: `${district.soilPhosphorus} kg/ha`, color: 'text-sky-700 bg-sky-50 border-sky-200' },
              { label: 'K₂O', value: `${district.soilPotassium} kg/ha`, color: 'text-purple-700 bg-purple-50 border-purple-200' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-lg p-2.5 border text-center font-mono ${color}`}>
                <div className="text-[10px] uppercase font-sans font-semibold text-slate-600">{label}</div>
                <div className="text-sm font-bold mt-0.5">{value}</div>
              </div>
            ))}
          </div>
        )}
        {!hasReal && <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs text-slate-600">Soil measurements were not recorded in the 45,000-point NARC ground survey for {district.name}.</div>}
        <div className="text-[11px] text-slate-500 flex items-start gap-1.5 pt-2 border-t border-slate-200">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
          <span>Soil pH from Nepal Agriculture Research Council (NARC) ground field sampling. Optimal crop pH range: 6.0–7.0.</span>
        </div>
      </>
    );
  } else if (modalKey === 'labor') {
    maxWidth = 'max-w-xl';
    const nprPerDay = district.laborRateNprPerDay || district.agriLaborMarketRateAvgNpr || 750;
    const baseline = district.agriLaborRateBaselineNpr || 754;
    const range = district.agriLaborRateRange || '650 - 750';
    const ecoBelt = district.agriLaborEcoBelt || district.ecoZone;
    const usdPerDay = (nprPerDay / 134).toFixed(1);
    const nationalAvg = 760;
    const comparison = nprPerDay >= nationalAvg + 100 ? 'Higher than National Avg' : nprPerDay >= nationalAvg - 60 ? 'Near National Avg' : 'Lower than National Avg';

    const beltBands = [
      { belt: 'Tarai Agricultural Belt', range: 'NPR 550 – 680', desc: 'Flatland mechanization, seasonal harvest labor', min: 550, max: 680 },
      { belt: 'Mid-Hills Agroforestry Belt', range: 'NPR 680 – 880', desc: 'Terrace farming, labor-intensive Tea & Coffee', min: 680, max: 880 },
      { belt: 'Kathmandu Valley & Urban Fringe', range: 'NPR 800 – 950', desc: 'Commercial vegetable tunnels, urban wage competition', min: 800, max: 950 },
      { belt: 'Mountain / Remote Belt', range: 'NPR 850 – 1,150', desc: 'Alpine terrain hardship, short growing season', min: 850, max: 1150 },
    ];

    modalContent = (
      <>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-outfit">Agricultural Labor Wage — {district.name}</h3>
              <span className="text-[10px] text-slate-500 font-sans">कृषि श्रमिक दैनिक ज्याला दर (Official 77-District Dataset)</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Prevailing Market Rate Card */}
          <div className="bg-purple-50/80 rounded-xl p-3.5 border border-purple-200 flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-purple-800 uppercase font-bold tracking-wider">Prevailing Farmgate Market Wage</div>
              <div className="text-2xl font-extrabold text-purple-950 mt-1">NPR {nprPerDay} <span className="text-xs font-normal text-purple-700">/ day (avg)</span></div>
              <div className="text-xs text-purple-900 font-mono mt-0.5">Range: <strong>NPR {range}</strong> / day</div>
            </div>
            <div className="text-[10px] text-purple-700 mt-2">≈ USD ${usdPerDay}/day · <span className="font-semibold">{comparison}</span></div>
          </div>

          {/* Official Jilla Dar Baseline Card */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">District Admin Rate (जिल्ला दररेट)</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">NPR {baseline} <span className="text-xs font-normal text-slate-500">/ day</span></div>
              <div className="text-xs text-slate-600 font-sans mt-0.5">Belt: <strong>{ecoBelt}</strong></div>
            </div>
            <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit font-mono font-semibold">
              Official Baseline Benchmark
            </span>
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-800 mb-2 font-bold font-outfit">Regional Agricultural Wage Spectrum (National Belts)</div>
          <div className="space-y-2">
            {beltBands.map(({ belt, range: bRange, desc, min, max }) => {
              const isThisBelt = (belt.includes('Mountain') && district.ecoZone === 'Mountain') ||
                                 (belt.includes('Hills') && district.ecoZone === 'Hill' && !ecoBelt.includes('Valley')) ||
                                 (belt.includes('Valley') && ecoBelt.includes('Valley')) ||
                                 (belt.includes('Tarai') && district.ecoZone === 'Terai');
              return (
                <div key={belt} className={`rounded-lg px-3 py-2 border transition-all ${isThisBelt ? 'bg-purple-50/90 border-purple-300 shadow-2xs font-semibold' : 'bg-slate-50 border-slate-200 opacity-75'}`}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-800 font-medium">{belt} {isThisBelt && <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded font-mono ml-1">Current District</span>}</span>
                    <span className="text-slate-700 font-mono font-bold">{bRange}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-purple-500" style={{ width: `${Math.min(100, ((max - 450) / 750) * 100)}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-500 truncate max-w-[200px]">{desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-[11px] text-slate-600 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-700" />
          <span>
            <strong>Agricultural Field Labor Specificity:</strong> These figures specifically represent farmgate field labor (खेतीपाती, रोपाईं, गोडमेल, बाली कटानी) as surveyed across all 77 districts, distinct from specialized industrial or urban construction wages.
          </span>
        </div>
      </>
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`glass-panel bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-h-[90vh] overflow-y-auto space-y-4 animate-fade-in-up ${maxWidth}`}
        onClick={(e) => e.stopPropagation()}
      >
        {modalContent}
      </div>
    </div>,
    document.body
  );
};

export const DistrictDetail: React.FC<DistrictDetailProps> = ({
  district,
  onSelectCrop,
  onBackToMap,
  climateDataset: initialClimateDataset,
}) => {
  const [cropSpectrumMode, setCropSpectrumMode] = useState<'verified' | 'all'>('verified');
  
  const verifiedDistrictCrops = useMemo(() => db.getDistrictCrops(district.id), [district.id]);
  const allDistrictCrops = useMemo(() => db.getAllDistrictCrops(district.id), [district.id]);
  
  const displayedDistrictCrops = cropSpectrumMode === 'verified' ? verifiedDistrictCrops : allDistrictCrops;

  const [activeHoverCrop, setActiveHoverCrop] = useState<Crop | null>(displayedDistrictCrops[0]?.crop || null);
  const [showComparison, setShowComparison] = useState(false);
  const [climateDataset, setClimateDataset] = useState<any>(initialClimateDataset || null);
  const [openModal, setOpenModal] = useState<ModalKey>(null);

  useEffect(() => {
    if (initialClimateDataset) {
      setClimateDataset(initialClimateDataset);
      return;
    }
    fetch('/geojson/nepal-climate-monthly.json')
      .then(res => res.json())
      .then(data => setClimateDataset(data))
      .catch(() => null);
  }, [initialClimateDataset]);

  useEffect(() => {
    if (displayedDistrictCrops && displayedDistrictCrops.length > 0) {
      setActiveHoverCrop(displayedDistrictCrops[0].crop);
    }
  }, [district.id, cropSpectrumMode]);

  const activeSuitability = displayedDistrictCrops.find((c: any) => c.crop.id === activeHoverCrop?.id)?.suitability || displayedDistrictCrops[0]?.suitability;

  const radarData = activeSuitability ? [
    { pillar: 'Water', score: activeSuitability.pillarScores.water, fullMark: 100 },
    { pillar: 'Energy', score: activeSuitability.pillarScores.energy, fullMark: 100 },
    { pillar: 'Food', score: activeSuitability.pillarScores.food, fullMark: 100 },
    { pillar: 'Ecosystem', score: activeSuitability.pillarScores.ecosystem, fullMark: 100 },
    { pillar: 'Socioeconomics', score: activeSuitability.pillarScores.socioeconomics, fullMark: 100 },
  ] : [];

  const distClimatology = climateDataset?.climatologyMap?.[district.id];

  // Predicted Rainfall via ARIMA(2,1,1)
  const { values: rainfallSeries, startYear: rfStartYear } = extractAnnualRainfallSeries(
    climateDataset?.climateMap ?? {},
    district.id
  );
  const hasRainfallSeries = rainfallSeries.length >= 8;
  const rainfallARIMA = hasRainfallSeries
    ? arimaForecast(rainfallSeries, rfStartYear, 10)
    : null;

  // 5-Year Ahead Forecast (~2024)
  const arimaForecastValue = rainfallARIMA ? Math.round(rainfallARIMA.forecasts[4]) : null;
  const cardRainfallValue = arimaForecastValue ?? (district.avgRainfallMm || 0);
  const cardRainfallBadge = rainfallARIMA
    ? { text: 'ARIMA(2,1,1)' }
    : district.avgRainfallMm
    ? { text: 'Historical' }
    : { text: 'Proxy' };

  const nasaYearly = (district as any).nasaSolarYearly || {};
  const nasaYearKeys = Object.keys(nasaYearly).map(Number);
  const nasa41YrAvg = nasaYearKeys.length > 0
    ? Number((nasaYearKeys.reduce((s, y) => s + nasaYearly[y], 0) / nasaYearKeys.length).toFixed(2))
    : null;

  const hasRealSoil = district.hasRealSoilData !== false && (district.soilSampleCount || 0) > 0 && district.baseSoilPh !== undefined;

  const indicators = [
    {
      key: 'rainfall' as ModalKey,
      icon: <CloudRain className="w-5 h-5 text-sky-600" />,
      label: 'Predicted Rainfall',
      value: `${cardRainfallValue} mm/yr`,
      badge: cardRainfallBadge.text,
      cardBg: 'bg-sky-50/70 border-sky-200/90 hover:border-sky-300 hover:bg-sky-50',
      iconBg: 'bg-sky-100 border-sky-200',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
      badgeDot: 'bg-sky-500',
    },
    {
      key: 'solar' as ModalKey,
      icon: <Sun className="w-5 h-5 text-amber-600" />,
      label: 'Solar Radiation',
      value: nasa41YrAvg !== null ? `${nasa41YrAvg} kWh/m²/d` : `${district.solarRadiationKwh} kWh/m²`,
      badge: nasa41YrAvg !== null ? 'NASA POWER' : 'Proxy',
      cardBg: 'bg-amber-50/70 border-amber-200/90 hover:border-amber-300 hover:bg-amber-50',
      iconBg: 'bg-amber-100 border-amber-200',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      badgeDot: 'bg-amber-500',
    },
    {
      key: 'soil' as ModalKey,
      icon: <Mountain className="w-5 h-5 text-emerald-600" />,
      label: 'Soil pH Level',
      value: hasRealSoil ? `pH ${district.baseSoilPh}` : 'No Data',
      badge: hasRealSoil ? 'NARC Ground' : 'No Data',
      cardBg: 'bg-emerald-50/70 border-emerald-200/90 hover:border-emerald-300 hover:bg-emerald-50',
      iconBg: 'bg-emerald-100 border-emerald-200',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      badgeDot: 'bg-emerald-500',
    },
    {
      key: 'labor' as ModalKey,
      icon: <DollarSign className="w-5 h-5 text-purple-600" />,
      label: 'Agri Labor Rate',
      value: `NPR ${district.laborRateNprPerDay}/day`,
      badge: '77-District Dar',
      cardBg: 'bg-purple-50/70 border-purple-200/90 hover:border-purple-300 hover:bg-purple-50',
      iconBg: 'bg-purple-100 border-purple-200',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
      badgeDot: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {openModal && (
        <IndicatorModal
          modalKey={openModal}
          district={district}
          distClimatology={distClimatology}
          climateDataset={climateDataset}
          rainfallSeries={rainfallSeries}
          rainfallARIMA={rainfallARIMA}
          rfStartYear={rfStartYear}
          onClose={() => setOpenModal(null)}
        />
      )}

      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-slate-200 shadow-sm bg-white/95">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <button onClick={onBackToMap} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2 font-semibold transition-colors cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to District Map
            </button>
            <div className="flex items-center space-x-3 flex-wrap gap-y-1">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-outfit">{district.name} District</h2>
              {district.nepaliName && <span className="text-base font-serif text-slate-500 font-medium">({district.nepaliName})</span>}
              <span className="text-xs px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                {district.ecoZone} Zone
              </span>
            </div>
            {/* Climate Zone, Elevation, Physiographic Region badges */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {district.climateZone && (
                <span className="text-[10px] px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1.5 bg-sky-50 text-sky-800 border border-sky-200">
                  <Thermometer className="w-3 h-3" />
                  {district.climateZone}
                </span>
              )}
              {district.elevationRange && (
                <span className="text-[10px] px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200">
                  <MapPin className="w-3 h-3" />
                  {district.elevationRange}m
                </span>
              )}
              {district.physiographicRegion && (
                <span className="text-[10px] px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Mountain className="w-3 h-3" />
                  {district.physiographicRegion}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl font-normal leading-relaxed">{district.description}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs text-slate-400 font-medium">Administrative Unit</span>
            <div className="text-sm font-bold text-slate-800">{district.province}</div>
          </div>
        </div>

        {/* 4 Clickable Colorful Indicator Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-200">
          {indicators.map(({ key, icon, label, value, badge, cardBg, iconBg, badgeClass, badgeDot }) => (
            <button
              key={key}
              onClick={() => setOpenModal(key)}
              className={`p-3.5 rounded-xl border flex items-start gap-3 text-left transition-all cursor-pointer elevation-hover group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-slate-300 ${cardBg}`}
            >
              <div className="absolute top-2 right-2 flex items-center gap-0.5 text-[9px] font-sans font-medium text-slate-400 group-hover:text-slate-700 opacity-70 group-hover:opacity-100 transition-all">
                <span>Inspect</span>
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs ${iconBg}`}>
                {icon}
              </div>
              <div className="min-w-0 pr-6">
                <div className="text-[10px] text-slate-600 uppercase font-semibold flex items-center gap-1 tracking-wider">
                  {label}
                </div>
                <div className="text-sm font-extrabold text-slate-900 truncate mt-0.5 font-outfit">{value}</div>
                <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono font-semibold inline-flex items-center gap-1 mt-1 border ${badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${badgeDot}`} />
                  {badge}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* MERRA-2 39-Year Monthly Climate Table */}
        {distClimatology && (
          <div className="mt-5 p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>MERRA-2 39-Year Monthly Climatology Baseline (1981–2019)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-sans italic hidden sm:inline">← Scroll 12 months →</span>
                <span className="text-[10px] bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-mono font-medium">12-Month Cycle</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] text-slate-500 uppercase font-mono bg-slate-100/80">
                    <th className="py-2 px-2.5 font-semibold">Metric</th>
                    {MONTH_NAMES.map(m => <th key={m} className="py-2 px-2 text-center font-semibold">{m}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 font-mono text-[11px]">
                  <tr className="hover:bg-white transition-colors">
                    <td className="py-2 px-2.5 font-semibold text-slate-800 flex items-center gap-1.5 font-sans"><CloudRain className="w-3.5 h-3.5 text-sky-600" /> Rainfall (mm)</td>
                    {MONTH_NAMES.map((_, i) => {
                      const v = distClimatology[i + 1]?.prectot;
                      return (
                        <td key={i} className={`py-2 px-2 text-center font-semibold ${v >= 200 ? 'text-sky-700 bg-sky-50/60 font-bold' : 'text-slate-700'}`}>
                          {v ?? '-'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="hover:bg-white transition-colors">
                    <td className="py-2 px-2.5 font-semibold text-slate-800 flex items-center gap-1.5 font-sans"><Thermometer className="w-3.5 h-3.5 text-amber-600" /> Air Temp (°C)</td>
                    {MONTH_NAMES.map((_, i) => {
                      const v = distClimatology[i + 1]?.t2m;
                      return (
                        <td key={i} className={`py-2 px-2 text-center font-semibold ${v >= 25 ? 'text-amber-700 bg-amber-50/60' : 'text-slate-700'}`}>
                          {v ?? '-'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="hover:bg-white transition-colors">
                    <td className="py-2 px-2.5 font-semibold text-slate-800 flex items-center gap-1.5 font-sans"><Wind className="w-3.5 h-3.5 text-purple-600" /> Wind 50m (m/s)</td>
                    {MONTH_NAMES.map((_, i) => <td key={i} className="py-2 px-2 text-center text-slate-700">{distClimatology[i + 1]?.ws50m ?? '-'}</td>)}
                  </tr>
                  <tr className="hover:bg-white transition-colors">
                    <td className="py-2 px-2.5 font-semibold text-slate-800 flex items-center gap-1.5 font-sans"><Gauge className="w-3.5 h-3.5 text-emerald-600" /> Humidity (%)</td>
                    {MONTH_NAMES.map((_, i) => <td key={i} className="py-2 px-2 text-center text-slate-700">{distClimatology[i + 1]?.rh2m ?? '-'}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Real NEA Hydropower Infrastructure Table */}
        {district.hydroStationsList && district.hydroStationsList.length > 0 && (
          <div className="mt-5 p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Hydropower Stations ({district.hydroStationCount} Plants • <strong className="text-purple-700">{district.totalHydroCapacityMW} MW</strong> Installed Capacity)</span>
              </div>
              <span className="text-[10px] bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-mono font-medium">NEA Database</span>
            </div>
            <div className="overflow-x-auto max-h-52 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] text-slate-500 uppercase font-mono sticky top-0 bg-slate-100">
                    <th className="py-2 px-2.5 font-semibold">Station Name</th>
                    <th className="py-2 px-2.5 text-right font-semibold">Installed MW</th>
                    <th className="py-2 px-2.5 text-center font-semibold">Commissioned</th>
                    <th className="py-2 px-2.5 font-semibold">Owner / Developer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 font-mono text-[11px]">
                  {district.hydroStationsList.map((st, idx) => (
                    <tr key={idx} className="hover:bg-white transition-colors">
                      <td className="py-2 px-2.5 font-semibold text-slate-800 font-sans">{st.name}</td>
                      <td className="py-2 px-2.5 text-right font-extrabold text-purple-700">{st.capacityMW} MW</td>
                      <td className="py-2 px-2.5 text-center text-slate-600">{st.commissioned}</td>
                      <td className="py-2 px-2.5 text-slate-600 font-sans">{st.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Real DHM National River Gauging Stations */}
        {district.hydrologyStationsList && district.hydrologyStationsList.length > 0 && (
          <div className="mt-4 p-4 bg-sky-50/70 rounded-xl border border-sky-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-950 font-semibold text-xs uppercase tracking-wider">
                <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                <span>DHM River Gauging Stations ({district.hydrologyStationsCount} Active Gauges)</span>
              </div>
              <span className="text-[10px] bg-white text-sky-800 px-2 py-0.5 rounded-md border border-sky-300 font-mono font-medium">DHM Hydrology</span>
            </div>
            <div className="overflow-x-auto max-h-48 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-sky-200 text-[10px] text-sky-900 uppercase font-mono sticky top-0 bg-sky-100/90">
                    <th className="py-2 px-2.5 font-semibold">Station #</th>
                    <th className="py-2 px-2.5 font-semibold">River Name</th>
                    <th className="py-2 px-2.5 font-semibold">Gauging Site</th>
                    <th className="py-2 px-2.5 text-right font-semibold">Elevation</th>
                    <th className="py-2 px-2.5 font-semibold">Instrumentation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-200/70 font-mono text-[11px]">
                  {district.hydrologyStationsList.map((st, idx) => (
                    <tr key={idx} className="hover:bg-white/80 transition-colors">
                      <td className="py-2 px-2.5 font-extrabold text-sky-700">#{st.stationNo}</td>
                      <td className="py-2 px-2.5 font-semibold text-slate-900 font-sans">{st.river}</td>
                      <td className="py-2 px-2.5 text-slate-700 font-sans">{st.siteName}</td>
                      <td className="py-2 px-2.5 text-right text-slate-700 font-mono">{st.elevation ? `${st.elevation} m` : 'N/A'}</td>
                      <td className="py-2 px-2.5 text-slate-600 font-sans text-[10px]">{st.instruments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Glacial Lakes, Alpine Water Bodies & GLOF Hazard Ledger */}
        {((district.totalLakesCount || 0) > 0 || (district.dangerousGlacialLakes && district.dangerousGlacialLakes.length > 0)) && (
          <div className="mt-4 p-4 bg-cyan-50/80 rounded-xl border border-cyan-200 space-y-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 border border-cyan-300 flex items-center justify-center shrink-0">
                  <Mountain className="w-4 h-4 text-cyan-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-950 text-sm font-outfit">Glacial Lakes, Alpine Water Bodies & GLOF Risk</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold border ${
                      district.glofRiskLevel === 'Critical' ? 'bg-red-100 text-red-800 border-red-300' :
                      district.glofRiskLevel === 'High' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      'bg-cyan-100 text-cyan-800 border-cyan-300'
                    }`}>
                      {district.glofRiskLevel || 'Low'} Risk
                    </span>
                  </div>
                  <div className="text-cyan-900 text-xs mt-0.5 font-sans">
                    Total District Lakes: <strong className="font-mono">{district.totalLakesCount || 0}</strong> • High-Altitude (&gt;3,000m): <strong className="font-mono">{district.highAltitudeLakesCount || 0} Lakes</strong>
                  </div>
                </div>
              </div>
              <span className="text-[10px] bg-white text-cyan-900 px-2 py-0.5 rounded-md border border-cyan-200 font-mono font-medium">ICIMOD / UNDP Registry</span>
            </div>

            {/* Dangerous Glacial Lakes Table if present in this district */}
            {district.dangerousGlacialLakes && district.dangerousGlacialLakes.length > 0 && (
              <div className="bg-white rounded-lg border border-cyan-200/90 overflow-hidden shadow-2xs">
                <div className="px-3 py-2 bg-red-50/60 border-b border-red-200 text-xs font-semibold text-red-950 flex items-center gap-1.5">
                  <span className="text-sm">❄️</span>
                  <span>Potentially Dangerous Glacial Lakes in {district.name} ({district.dangerousGlacialLakes.length} High-Risk Lakes)</span>
                </div>
                <div className="overflow-x-auto max-h-48 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] text-slate-500 uppercase font-mono sticky top-0 bg-slate-100/90">
                        <th className="py-2 px-3 font-semibold">Glacial Lake Name</th>
                        <th className="py-2 px-3 text-right font-semibold">Altitude (masl)</th>
                        <th className="py-2 px-3 text-right font-semibold">Surface Area</th>
                        <th className="py-2 px-3 font-semibold">River Basin</th>
                        <th className="py-2 px-3 text-center font-semibold">GLOF Hazard Tier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {district.dangerousGlacialLakes.map((lake, idx) => (
                        <tr key={idx} className="hover:bg-cyan-50/50 transition-colors">
                          <td className="py-2 px-3 font-bold text-slate-900 font-sans flex items-center gap-1.5">
                            <span className="text-cyan-600">❄️</span>
                            {lake.name}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-cyan-900">{lake.altitude.toLocaleString()} m</td>
                          <td className="py-2 px-3 text-right text-slate-700">
                            {lake.areaSqM ? `${(lake.areaSqM / 10000).toFixed(1)} ha` : 'N/A'}
                          </td>
                          <td className="py-2 px-3 text-slate-700 font-sans">{lake.basin || 'Koshi Basin'}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                              lake.hazardLevel === 'Critical' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {lake.hazardLevel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Lake Count by Altitude Elevation Band */}
            {district.lakeAltitudeDistribution && (
              <div className="bg-white p-3 rounded-lg border border-cyan-200/90 space-y-2">
                <div className="text-[11px] font-semibold text-slate-800 flex items-center justify-between">
                  <span>Elevation Band Distribution of Water Bodies ({district.totalLakesCount || 0} Total Lakes)</span>
                  <span className="text-[10px] text-slate-500 font-normal">CBS National Water Census</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs font-mono">
                  <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-sans font-medium">&lt;100m (Terai)</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{district.lakeAltitudeDistribution.under100m}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-sans font-medium">100–499m</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{district.lakeAltitudeDistribution.from100to499m}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-sans font-medium">500–1,999m</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{district.lakeAltitudeDistribution.from500to1999m}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-sans font-medium">2,000–2,999m</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{district.lakeAltitudeDistribution.from2000to2999m}</div>
                  </div>
                  <div className="bg-sky-50 p-2 rounded-md border border-sky-200">
                    <div className="text-[10px] text-sky-800 font-sans font-semibold">3,000–4,999m</div>
                    <div className="text-sm font-extrabold text-sky-700 mt-0.5">{district.lakeAltitudeDistribution.from3000to4999m}</div>
                  </div>
                  <div className="bg-cyan-50 p-2 rounded-md border border-cyan-200">
                    <div className="text-[10px] text-cyan-800 font-sans font-semibold">&gt;5,000m Alpine</div>
                    <div className="text-sm font-extrabold text-cyan-700 mt-0.5">{district.lakeAltitudeDistribution.above5000m}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Strategic Road Density & Market Transport Logistics */}
        {district.roadDensityKmPerKm2 !== undefined && (
          <div className="mt-4 p-3.5 bg-purple-50/60 rounded-xl border border-purple-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-purple-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 font-outfit">Strategic Road Network & Market Access</span>
                  <span className="text-[10px] bg-white text-purple-800 border border-purple-200 px-2 py-0.5 rounded-md font-mono font-semibold">610K Road Vectors</span>
                </div>
                <div className="text-slate-600 text-xs mt-0.5">
                  Road Density: <strong className="text-purple-950 font-bold font-mono">{district.roadDensityKmPerKm2} km/km²</strong> • Avg Highway Distance: <strong className="text-purple-950 font-bold font-mono">{district.avgDistanceToPavedRoadKm} km</strong>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-purple-200 font-mono shadow-2xs">
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Market Index</div>
                <div className="text-sm font-extrabold text-purple-700">{district.marketAccessIndex || 60}/100</div>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Freight Tariff</div>
                <div className="text-sm font-extrabold text-slate-800">NPR {district.freightLogisticsTariffNprPerTonKm || 20} <span className="text-[10px] font-normal text-slate-500">/t-km</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Ground Soil Survey N-P-K & Texture Breakdown */}
        {district.hasRealSoilData !== false && district.soilNitrogen !== undefined && district.soilPhosphorus !== undefined && district.soilPotassium !== undefined && (district.soilSampleCount || 0) > 0 ? (
          <div className="mt-4 p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm font-outfit">Ground Soil Survey & Texture Composition</span>
                  <span className="text-[10px] bg-white text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-mono font-semibold">{district.soilSampleCount} NARC Samples</span>
                </div>
                <div className="text-slate-600 text-xs mt-0.5">
                  Dominant: <strong className="text-emerald-950 font-bold">{district.soilType}</strong>
                  {district.soilTextureShares && ` (Loam ${district.soilTextureShares.loamPct}% • Sand ${district.soilTextureShares.sandPct}% • Silt ${district.soilTextureShares.siltPct}% • Clay ${district.soilTextureShares.clayPct}%)`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-emerald-200 font-mono shadow-2xs">
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Total N</div>
                <div className="text-sm font-extrabold text-emerald-700">{district.soilNitrogen}%</div>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Available P₂O₅</div>
                <div className="text-sm font-extrabold text-sky-700">{district.soilPhosphorus} <span className="text-[10px] font-normal text-slate-500">kg/ha</span></div>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Available K₂O</div>
                <div className="text-sm font-extrabold text-purple-700">{district.soilPotassium} <span className="text-[10px] font-normal text-slate-500">kg/ha</span></div>
              </div>
              {district.annualSoilErosionRiskTonnesPerHa !== undefined && (
                <>
                  <div className="w-px h-6 bg-slate-200" />
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Erosion Risk</div>
                    <div className="text-sm font-extrabold text-amber-700">{district.annualSoilErosionRiskTonnesPerHa} <span className="text-[10px] font-normal text-slate-500">t/ha/yr</span></div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 text-sm font-outfit">Ground Soil Survey Data</span>
                  <span className="text-[10px] bg-white text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md font-mono">No Data (0 Samples)</span>
                </div>
                <div className="text-slate-500 text-xs mt-0.5">Ground soil measurements were not recorded for {district.name}.</div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Crop Feasibility Section from CSV ─── */}
        {(district.feasibleCrops?.length || district.feasibleFruits?.length || district.feasibleSpicesCashCrops?.length) ? (
          <div className="mt-5 p-4 bg-white rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs uppercase tracking-wider">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>Crop Feasibility Profile</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200 font-mono font-medium normal-case">NARC Field Data</span>
            </div>

            {/* Feasible Crops (Cereals/Grains) */}
            {district.feasibleCrops && district.feasibleCrops.length > 0 && (
              <div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1.5 flex items-center gap-1">
                  <WheatIcon className="w-3 h-3 text-amber-600" />
                  Feasible Crops ({district.feasibleCrops.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {district.feasibleCrops.map((c, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Feasible Vegetables */}
            {district.feasibleVegetables && district.feasibleVegetables.length > 0 && (
              <div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1.5 flex items-center gap-1">
                  <Sprout className="w-3 h-3 text-emerald-600" />
                  Feasible Vegetables ({district.feasibleVegetables.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {district.feasibleVegetables.map((v, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">{v}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Feasible Fruits */}
            {district.feasibleFruits && district.feasibleFruits.length > 0 && (
              <div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1.5 flex items-center gap-1">
                  <Cherry className="w-3 h-3 text-orange-600" />
                  Feasible Fruits ({district.feasibleFruits.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {district.feasibleFruits.map((f, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-orange-50 text-orange-800 border border-orange-200 font-medium">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Feasible Spices & Cash Crops */}
            {district.feasibleSpicesCashCrops && district.feasibleSpicesCashCrops.length > 0 && (
              <div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  Spices & Cash Crops ({district.feasibleSpicesCashCrops.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {district.feasibleSpicesCashCrops.map((s, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Commercial Coffee Production 2080 Callout */}
            {district.coffeeProductionMt !== undefined && (
              <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">☕</span>
                  <div>
                    <span className="font-bold text-amber-950 font-outfit">MoALD 2080 Commercial Coffee Production Record</span>
                    <div className="text-[11px] text-amber-900 mt-0.5">
                      Production: <strong className="font-mono">{district.coffeeProductionMt} MT</strong> • Farm Area: <strong className="font-mono">{district.coffeeAreaHa} Ha</strong> • Smallholders: <strong className="font-mono">{district.coffeeFarmersCount} Farmers</strong>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 font-mono bg-white px-2.5 py-1 rounded-md border border-amber-200 text-amber-900 font-bold text-[11px]">
                  Yield: {district.coffeeYieldKgHa} kg/ha
                </div>
              </div>
            )}

            {/* Feasibility Reasoning */}
            {district.feasibilityReasoning && (
              <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1 flex items-center gap-1">
                  <Info className="w-3 h-3 text-slate-400" />
                  Agronomic Reasoning
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{district.feasibilityReasoning}"
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Interactive District Spatial Map & Real-time Variable Inspector */}
      <DistrictDetailMap
        district={district}
        distClimatology={distClimatology}
        rainfallARIMA={rainfallARIMA}
        districtCrops={verifiedDistrictCrops}
        onSelectCrop={onSelectCrop}
      />

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm bg-white/95">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-outfit">
                  <Sprout className="w-5 h-5 text-emerald-600" />
                  <span>Crop Suitability Matrix</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-sans">
                  {cropSpectrumMode === 'verified'
                    ? `${verifiedDistrictCrops.length} officially verified cultivars for ${district.name} (${district.climateZone || district.ecoZone}).`
                    : `Evaluating all ${allDistrictCrops.length} crops across ${district.name}'s soil, rainfall, temperature, and elevation.`
                  }
                </p>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                {/* View Spectrum Mode Toggle */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                  <button
                    onClick={() => setCropSpectrumMode('verified')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      cropSpectrumMode === 'verified'
                        ? 'bg-white text-emerald-800 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ⭐ मुख्य सिफारिस ({verifiedDistrictCrops.length})
                  </button>
                  <button
                    onClick={() => setCropSpectrumMode('all')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      cropSpectrumMode === 'all'
                        ? 'bg-white text-emerald-800 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🌐 सम्पूर्ण बाली ({allDistrictCrops.length})
                  </button>
                </div>

                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    showComparison
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                  }`}
                >
                  <GitCompare className="w-3.5 h-3.5 text-emerald-600" />
                  {showComparison ? 'Hide Comparison' : 'Compare All Crops'}
                </button>
              </div>
            </div>

            {/* Rich Colorful Crop Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
              {displayedDistrictCrops.map(({ crop, suitability, isFeasible }: any) => {
                const isSelected = activeHoverCrop?.id === crop.id;
                const score = suitability.suitabilityScore;
                
                // Color scale and FAO Class
                let scoreBadgeClass = 'bg-rose-50 text-rose-800 border-rose-200';
                let barClass = 'bg-rose-500';
                let faoClassBadge = 'N Not Recommended';
                if (score >= 80) {
                  scoreBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  barClass = 'bg-emerald-500';
                  faoClassBadge = 'S1 Optimal';
                } else if (score >= 65) {
                  scoreBadgeClass = 'bg-teal-50 text-teal-800 border-teal-200';
                  barClass = 'bg-teal-500';
                  faoClassBadge = 'S2 Moderate';
                } else if (score >= 45) {
                  scoreBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
                  barClass = 'bg-amber-500';
                  faoClassBadge = 'S3 Marginal';
                }

                // Season pill color
                const seasonLabel = crop.seasonLabelNepali || (
                  crop.season === 'barkhe' ? '🌧️ बर्खे बाली' :
                  crop.season === 'hiunde' ? '❄️ हिउँदे बाली' :
                  crop.season === 'chaite' ? '☀️ चैते बाली' : '🌳 बाह्रमासे'
                );

                return (
                  <div
                    key={crop.id}
                    onMouseEnter={() => setActiveHoverCrop(crop)}
                    onClick={() => onSelectCrop(crop)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 elevation-hover group ${
                      isSelected
                        ? 'bg-emerald-50/50 border-emerald-400 shadow-md ring-1 ring-emerald-300'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Top Row: Crop Name & Season / Category */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 font-outfit group-hover:text-emerald-700 transition-colors">
                            {crop.name}
                          </span>
                          {crop.nepaliName && (
                            <span className="text-xs text-slate-500 font-serif font-medium">({crop.nepaliName})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {seasonLabel}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            {crop.category}
                          </span>
                          {cropSpectrumMode === 'all' && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                              isFeasible
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              {isFeasible ? '✓ सिफारिस' : '✕ गैर-सिफारिस'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Suitability Score & FAO Class Pill */}
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <span className={`text-xs px-2.5 py-1 rounded-lg font-mono font-extrabold border shadow-2xs inline-flex items-center gap-1 ${scoreBadgeClass}`}>
                          <span>{score}/100</span>
                        </span>
                        <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-50 px-1.5 py-0.2 rounded border border-slate-200">
                          {faoClassBadge}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Progress Bar & Limiting Factor if sub-optimal */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div className={`h-full rounded-full transition-all duration-300 ${barClass}`} style={{ width: `${score}%` }} />
                      </div>
                      {score < 75 && suitability.limitingFactor && suitability.limitingFactor !== 'None' && (
                        <div className="text-[10px] text-amber-700 font-mono flex items-center gap-1">
                          <span>⚠️ मुख्य अवरोध:</span>
                          <strong>{suitability.limitingFactor}</strong>
                        </div>
                      )}
                    </div>

                    {/* Bottom: 5-Pillar Score Mini Dots & Quick Economic Metric */}
                    <div className="flex items-center justify-between gap-2 text-[10px] font-mono pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5 text-sky-700" title={`Water: ${suitability.pillarScores.water}/100`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" />
                          <span>{suitability.pillarScores.water}</span>
                        </span>
                        <span className="flex items-center gap-0.5 text-amber-700" title={`Energy: ${suitability.pillarScores.energy}/100`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                          <span>{suitability.pillarScores.energy}</span>
                        </span>
                        <span className="flex items-center gap-0.5 text-emerald-700" title={`Food: ${suitability.pillarScores.food}/100`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          <span>{suitability.pillarScores.food}</span>
                        </span>
                        <span className="flex items-center gap-0.5 text-teal-700" title={`Ecosystem: ${suitability.pillarScores.ecosystem}/100`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
                          <span>{suitability.pillarScores.ecosystem}</span>
                        </span>
                        <span className="flex items-center gap-0.5 text-purple-700" title={`Socioeconomics: ${suitability.pillarScores.socioeconomics}/100`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
                          <span>{suitability.pillarScores.socioeconomics}</span>
                        </span>
                      </div>

                      <div className="text-slate-600 font-sans flex items-center gap-1 font-medium">
                        <span>NPR {crop.marketValuePerUnit}/{crop.baseUnitName}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {activeHoverCrop && activeSuitability && (
              <FeasibilityMatrix district={district} crop={activeHoverCrop} suitabilityScore={activeSuitability.suitabilityScore} />
            )}
          </div>

          {showComparison && (
            <CropComparativeAnalysis district={district} crops={displayedDistrictCrops} selectedCropId={activeHoverCrop?.id || displayedDistrictCrops[0]?.crop.id || 'rice'} />
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm bg-white/95 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1 font-outfit">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>WEFES Nexus Spider Graph</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">Multi-pillar balance profile for <strong className="text-slate-800">{activeHoverCrop?.name}</strong> in {district.name}.</p>
              
              <div className="min-h-[300px] w-full flex items-center justify-center bg-slate-50/60 rounded-xl p-2 border border-slate-200/80">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis dataKey="pillar" stroke="#475569" tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                    <Radar name="Pillar Score" dataKey="score" stroke="#0284c7" fill="#0284c7" fillOpacity={0.25} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.5rem', color: '#0f172a', fontSize: 11, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <button
              onClick={() => activeHoverCrop && onSelectCrop(activeHoverCrop)}
              className="mt-5 w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Simulate WEFES Nexus for {activeHoverCrop?.name}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Quick Navigation Bar */}
      <div className="flex items-center justify-between p-4 bg-slate-50/90 rounded-2xl border border-slate-200">
        <button
          onClick={onBackToMap}
          className="text-xs text-slate-800 hover:text-slate-950 font-bold flex items-center gap-1.5 transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>Back to National Interactive Map</span>
        </button>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm"
        >
          <ArrowUp className="w-4 h-4 text-slate-500" />
          <span>Scroll to Top</span>
        </button>
      </div>
    </div>
  );
};

export default DistrictDetail;
