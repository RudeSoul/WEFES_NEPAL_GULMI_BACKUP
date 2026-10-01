// [DATA PROVENANCE]
// Data Source: data/calculated/indicators/gulmi_palika_agro_hydrology.json
// Classification: CALCULATED EMPIRICAL (WMO Standard Normal & Physical Balance)
// Citations: CHIRPS v2.0 (1981–2025), FAO-56 Penman-Monteith, NARC Soil Science Division, NASA POWER MERRA-2
import React, { useMemo, useState } from 'react';

import { AlertTriangle, Droplets, ShieldCheck, Sun } from 'lucide-react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ClimateDataset } from '@wefes/shared-types';

import {
  MonthAgroHydrology,
  PALIKA_AGRO_HYDROLOGY_DATA,
  PalikaAgroHydrologyProfile,
} from '../../../data/districtIndicatorAssets';
import { DistrictPalika } from '../../../data/districtPalikaAssets';

interface SeasonalAgroHydrologyProps {
  activePalika: DistrictPalika;
  climateDataset?: ClimateDataset | null;
}

export const PalikaAgroHydrologyCalendar: React.FC<SeasonalAgroHydrologyProps> = ({ activePalika }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'soil'>('balance');

  // Load canonical agro-hydrological indicators for this palika
  const palikaData: PalikaAgroHydrologyProfile | undefined = useMemo(() => {
    return PALIKA_AGRO_HYDROLOGY_DATA.palikas[activePalika.name];
  }, [activePalika.name]);

  if (!palikaData) {
    return (
      <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 italic">
        No agro-hydrological climatology record found for {activePalika.name}.
      </div>
    );
  }

  const { annual_summary: summary, months, taw_mm, raw_mm, awc_volumetric, soil_lithology, elevation_m } = palikaData;

  return (
    <div className="p-5 rounded-2xl bg-white/95 text-slate-800 border border-slate-200/90 shadow-xs space-y-4 animate-fade-in glass-panel">
      {/* Header and Lineage Badges */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-900 font-outfit uppercase tracking-wider flex items-center gap-1.5">
              <span>📅 12-Month Agro-Hydrological Calendar</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-sky-50 text-sky-800 border border-sky-300">
              CHIRPS 5km WMO 1991–2020 Normal
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-300">
              FAO-56 Penman-Monteith ET₀ & ETc
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
              NARC Root-Zone Storage (TAW: {taw_mm}mm)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Area-weighted precipitation ($P$), crop evapotranspiration ($ET_c$), and soil carry-over balance for{' '}
            <strong>{activePalika.name}</strong> ({elevation_m}m ASL · {soil_lithology}).
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('balance')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'balance'
                  ? 'bg-white shadow-xs text-sky-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Water Demand & Deficit
            </button>
            <button
              onClick={() => setActiveTab('soil')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'soil'
                  ? 'bg-white shadow-xs text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Root-Zone Soil Storage
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate Indicators Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200">
          <div className="text-[10px] text-sky-700 uppercase font-sans font-semibold">Annual Precipitation</div>
          <div className="text-base font-extrabold text-sky-950 mt-0.5">
            {summary.precipitation_wmo_normal_mm} <span className="text-[10px] font-normal text-slate-500">mm/yr</span>
          </div>
          <div className="text-[10px] text-slate-500 font-sans">Effective: {summary.effective_precipitation_mm} mm</div>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
          <div className="text-[10px] text-amber-700 uppercase font-sans font-semibold">Crop Water Demand (ETc)</div>
          <div className="text-base font-extrabold text-amber-950 mt-0.5">
            {summary.etc_crop_demand_mm} <span className="text-[10px] font-normal text-slate-500">mm/yr</span>
          </div>
          <div className="text-[10px] text-slate-500 font-sans">Reference ET₀: {summary.et0_reference_mm} mm</div>
        </div>

        <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200">
          <div className="text-[10px] text-rose-700 uppercase font-sans font-semibold">Net Irrigation Deficit</div>
          <div className="text-base font-extrabold text-rose-950 mt-0.5">
            {summary.net_irrigation_requirement_mm}{' '}
            <span className="text-[10px] font-normal text-slate-500">mm/yr</span>
          </div>
          <div className="text-[10px] text-slate-500 font-sans">
            {summary.irrigation_deficit_months} deficit months (Falgun–Baisakh)
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <div className="text-[10px] text-emerald-700 uppercase font-sans font-semibold">Monsoon Surplus Drainage</div>
          <div className="text-base font-extrabold text-emerald-950 mt-0.5">
            {summary.monsoon_surplus_drainage_mm} <span className="text-[10px] font-normal text-slate-500">mm/yr</span>
          </div>
          <div className="text-[10px] text-slate-500 font-sans">Terrace runoff & recharge capture</div>
        </div>
      </div>

      {/* Main Agro-Hydrology Chart */}
      <div className="h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'balance' ? (
            <ComposedChart data={months} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="month_en"
                tickFormatter={(val, idx) => `${val} (${months[idx]?.month_np || ''})`}
                tick={{ fontSize: 10, fill: '#475569' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={{ stroke: '#cbd5e1' }} unit=" mm" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d: MonthAgroHydrology = payload[0].payload;
                    return (
                      <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 font-sans max-w-xs">
                        <div className="font-bold border-b border-slate-700 pb-1 text-sky-300 flex items-center justify-between">
                          <span>
                            {d.month_en} ({d.month_np}) · {d.agro_season}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">Kc: {d.crop_kc}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[11px]">
                          <span className="text-slate-400">WMO Precip Normal:</span>
                          <strong className="text-sky-400">{d.precip_wmo_normal_mm} mm</strong>
                          <span className="text-slate-400">Historical P10–P90:</span>
                          <span className="text-slate-300">
                            {d.precip_p10_mm} – {d.precip_p90_mm} mm
                          </span>
                          <span className="text-slate-400">Effective Precip:</span>
                          <strong className="text-sky-300">{d.effective_precip_mm} mm</strong>
                          <span className="text-slate-400">Reference ET₀:</span>
                          <span className="text-amber-300">{d.et0_reference_mm} mm</span>
                          <span className="text-slate-400">Crop Demand ETc:</span>
                          <strong className="text-amber-400">{d.etc_crop_demand_mm} mm</strong>
                          <span className="text-slate-400">Net Irrigation Req:</span>
                          <strong className={d.net_irrigation_req_mm > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                            {d.net_irrigation_req_mm} mm
                          </strong>
                          <span className="text-slate-400">Soil Storage:</span>
                          <span className="text-emerald-300">
                            {d.soil_storage_end_mm} / {taw_mm} mm ({d.soil_depletion_pct}% depleted)
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-300 pt-1.5 border-t border-slate-800 leading-snug">
                          {d.advisory}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} iconType="circle" />
              <ReferenceLine y={0} stroke="#94a3b8" />
              {/* Historical 10-90th percentile variability range */}
              <Area
                type="monotone"
                dataKey="precip_p90_mm"
                name="Historical P90 Ceiling"
                stroke="none"
                fill="#38bdf8"
                fillOpacity={0.12}
              />
              <Bar
                dataKey="precip_wmo_normal_mm"
                name="Precipitation Normal (mm)"
                fill="#0284c7"
                radius={[4, 4, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="et0_reference_mm"
                name="Reference ET₀ (mm)"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 2.5 }}
              />
              <Line
                type="monotone"
                dataKey="etc_crop_demand_mm"
                name="Crop Demand ETc (mm)"
                stroke="#d97706"
                strokeWidth={2.5}
                strokeDasharray="4 3"
                dot={{ r: 3 }}
              />
              <Bar
                dataKey="net_irrigation_req_mm"
                name="Net Irrigation Deficit (mm)"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          ) : (
            <ComposedChart data={months} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="month_en"
                tickFormatter={(val, idx) => `${val} (${months[idx]?.month_np || ''})`}
                tick={{ fontSize: 10, fill: '#475569' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#475569' }}
                axisLine={{ stroke: '#cbd5e1' }}
                unit=" mm"
                domain={[0, Math.ceil(taw_mm * 1.15)]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d: MonthAgroHydrology = payload[0].payload;
                    return (
                      <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 font-sans max-w-xs">
                        <div className="font-bold border-b border-slate-700 pb-1 text-emerald-300">
                          {d.month_en} ({d.month_np}) · Soil Storage Dynamics
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[11px]">
                          <span className="text-slate-400">Total Available (TAW):</span>
                          <strong className="text-slate-200">{taw_mm} mm</strong>
                          <span className="text-slate-400">Readily Available (RAW):</span>
                          <strong className="text-amber-300">{raw_mm} mm</strong>
                          <span className="text-slate-400">End-of-Month Storage:</span>
                          <strong className="text-emerald-400">{d.soil_storage_end_mm} mm</strong>
                          <span className="text-slate-400">Soil Depletion:</span>
                          <strong className={d.soil_depletion_pct > 50 ? 'text-rose-400' : 'text-emerald-400'}>
                            {d.soil_depletion_pct}%
                          </strong>
                          <span className="text-slate-400">Surplus Runoff/Percolation:</span>
                          <span className="text-sky-300">{d.surplus_drainage_mm} mm</span>
                        </div>
                        <div className="text-[10px] text-slate-300 pt-1.5 border-t border-slate-800 leading-snug">
                          {d.advisory}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} iconType="circle" />
              <ReferenceLine
                y={taw_mm}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{ value: `TAW Capacity (${taw_mm} mm)`, fontSize: 10, fill: '#059669', position: 'top' }}
              />
              <ReferenceLine
                y={taw_mm - raw_mm}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                label={{
                  value: `Irrigation Threshold (${Math.round(taw_mm - raw_mm)} mm)`,
                  fontSize: 10,
                  fill: '#d97706',
                  position: 'bottom',
                }}
              />
              <Area
                type="monotone"
                dataKey="soil_storage_end_mm"
                name="Root-Zone Storage St (mm)"
                fill="#10b981"
                stroke="#059669"
                strokeWidth={2}
                fillOpacity={0.25}
              />
              <Bar
                dataKey="surplus_drainage_mm"
                name="Surplus Drainage / Runoff (mm)"
                fill="#0ea5e9"
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 4 Scientifically Grounded Seasonal Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1">
        <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200">
          <div className="flex items-center gap-1.5 text-rose-900 font-bold uppercase text-[10px]">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Winter / Spring Deficit Peak</span>
          </div>
          <div className="text-base font-extrabold text-rose-950 font-mono mt-1">
            {summary.net_irrigation_requirement_mm}{' '}
            <span className="text-[10px] font-normal text-slate-500">mm cumulative</span>
          </div>
          <div className="text-[10px] text-slate-600 mt-1 leading-snug">
            Root-zone storage drops below allowable depletion ($RAW$). Triggers high water stress for winter wheat,
            potato, and spring maize.
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold uppercase text-[10px]">
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            <span>Solar Pumping Window (Chaitra–Baisakh)</span>
          </div>
          <div className="text-base font-extrabold text-amber-950 font-mono mt-1">
            5.8 – 6.2 <span className="text-[10px] font-normal text-slate-500">kWh/m²/day</span>
          </div>
          <div className="text-[10px] text-slate-600 mt-1 leading-snug">
            Maximum solar irradiance coincides directly with peak root-zone depletion. Ideal window for river-lift solar
            pumping.
          </div>
        </div>

        <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200">
          <div className="flex items-center gap-1.5 text-sky-900 font-bold uppercase text-[10px]">
            <Droplets className="w-3.5 h-3.5 text-sky-600" />
            <span>Monsoon Recharge (Asar–Ashwin)</span>
          </div>
          <div className="text-base font-extrabold text-sky-950 font-mono mt-1">
            {summary.monsoon_surplus_drainage_mm}{' '}
            <span className="text-[10px] font-normal text-slate-500">mm surplus</span>
          </div>
          <div className="text-[10px] text-slate-600 mt-1 leading-snug">
            100% soil saturation reached by July. Capturing excess terrace runoff replenishes community recharge ponds
            and mountain springs.
          </div>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <div className="flex items-center gap-1.5 text-emerald-900 font-bold uppercase text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Soil Moisture Carry-Over</span>
          </div>
          <div className="text-xs font-bold text-emerald-950 font-mono mt-1">
            Kartik Buffer: {months[9]?.soil_storage_end_mm || 0} mm
          </div>
          <div className="text-[10px] text-slate-600 mt-1 leading-snug">
            Monsoon storage buffers soil moisture through October/November, sustaining winter sowing before irrigation
            is required.
          </div>
        </div>
      </div>
    </div>
  );
};
