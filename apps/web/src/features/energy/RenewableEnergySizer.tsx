import React, { useState } from 'react';
import { Zap, Sun, Droplets, Flame, Sparkles, TrendingUp, Calculator, ShieldCheck, BatteryCharging, Leaf } from 'lucide-react';
import { DISTRICT_PALIKAS } from '../../data/districtPalikaAssets';

interface RenewableEnergySizerProps {
  lang?: 'en' | 'np';
}

export const RenewableEnergySizer: React.FC<RenewableEnergySizerProps> = ({
  lang = 'en',
}) => {
  const [selectedPalikaName, setSelectedPalikaName] = useState<string>('Resunga');
  const [systemType, setSystemType] = useState<'solar' | 'hydro' | 'cooking'>('solar');

  // Solar state
  const [rooftopKw, setRooftopKw] = useState<number>(15); // kWp
  const [solarHours, setSolarHours] = useState<number>(5.1); // kWh/m²/d

  // Hydro state
  const [streamFlowLps, setStreamFlowLps] = useState<number>(120); // Liters/sec
  const [hydraulicHeadM, setHydraulicHeadM] = useState<number>(45); // Meters

  // Clean cooking state
  const [householdTransitionCount, setHouseholdTransitionCount] = useState<number>(250); // Households

  const gulmiPalikas = DISTRICT_PALIKAS.gulmi || [];
  const currentPalika = gulmiPalikas.find(p => p.name === selectedPalikaName) || gulmiPalikas[0];

  // Calculations
  // 1. Solar: Annual kWh = kWp * solarHours * 365 * 0.78 (Performance Ratio)
  const annualSolarKwh = Math.round(rooftopKw * solarHours * 365 * 0.78);
  const batteryStorageKwh = Math.round(rooftopKw * 3.5);
  const solarCarbonOffsetTons = Number((annualSolarKwh * 0.00082).toFixed(1)); // 0.82 kg CO2/kWh displaced grid/diesel
  const solarEstimatedCostNpr = rooftopKw * 85000;

  // 2. Micro-Hydro: P (kW) = 9.81 * Q (m³/s) * H (m) * efficiency (0.72)
  const streamFlowM3s = streamFlowLps / 1000;
  const hydroKw = Number((9.81 * streamFlowM3s * hydraulicHeadM * 0.72).toFixed(1));
  const annualHydroKwh = Math.round(hydroKw * 24 * 365 * 0.65); // 65% Capacity Factor
  const hydroCarbonOffsetTons = Number((annualHydroKwh * 0.00082).toFixed(1));

  // 3. Clean Cooking: 1 HH burns ~3.2 tons firewood/yr. Induction reduces firewood by 85%.
  const firewoodDisplacedTons = Math.round(householdTransitionCount * 3.2 * 0.85);
  const cookingCo2OffsetTons = Number((firewoodDisplacedTons * 1.65).toFixed(1)); // 1.65 tCO2 per ton firewood
  const forestSavedHectares = Number((firewoodDisplacedTons / 45).toFixed(2)); // ~45 tons woody biomass per hectare

  return (
    <div className="glass-panel p-4 rounded-2xl border border-amber-200 bg-white/95 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-100 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-outfit uppercase tracking-wide flex items-center gap-2">
              <span>{lang === 'np' ? 'नवीकरणीय ऊर्जा तथा स्वच्छ चुलो रूपान्तरण क्यालकुलेटर' : 'Renewable Energy Sizing & Clean Cooking Transition Tool'}</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-mono font-bold">
                NASA POWER & NEA Specs
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-sans">
              {lang === 'np'
                ? 'सौर्य ऊर्जा, लघु-जलविद्युत क्षमता, र दाउरा विस्थापनको इन्जिनियरिङ विश्लेषण'
                : 'Solar PV sizing, micro-hydro cascade potential, and firewood displacement modeling'}
            </p>
          </div>
        </div>

        {/* Palika Selector */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-xs">
          <span className="text-slate-600 font-medium">Palika:</span>
          <select
            value={selectedPalikaName}
            onChange={e => setSelectedPalikaName(e.target.value)}
            className="bg-transparent font-bold text-slate-900 cursor-pointer focus:outline-none"
          >
            {gulmiPalikas.map(p => (
              <option key={p.id} value={p.name}>
                {p.name} ({p.elevation}m)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <button
          onClick={() => setSystemType('solar')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            systemType === 'solar'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>☀️ Community Solar PV Sizer</span>
        </button>

        <button
          onClick={() => setSystemType('hydro')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            systemType === 'hydro'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>⚡ Micro-Hydro Cascade Sizer</span>
        </button>

        <button
          onClick={() => setSystemType('cooking')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            systemType === 'cooking'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>🪵 Clean Cooking & Firewood Offset</span>
        </button>
      </div>

      {/* 1. SOLAR VIEW */}
      {systemType === 'solar' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-200">
            <div>
              <label className="text-[11px] font-bold text-slate-800 block mb-1 flex items-center justify-between">
                <span>Installed Solar PV Capacity (kWp):</span>
                <span className="text-amber-800 font-mono font-bold bg-amber-100 px-2 py-0.5 rounded">{rooftopKw} kWp</span>
              </label>
              <input
                type="range"
                min={3}
                max={100}
                step={1}
                value={rooftopKw}
                onChange={e => setRooftopKw(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
                <span>3 kWp (Homestead)</span>
                <span>25 kWp (Cooperative)</span>
                <span>100 kWp (Mini-Grid)</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-800 block mb-1 flex items-center justify-between">
                <span>NASA POWER Solar Insolation (kWh/m²/day):</span>
                <span className="text-amber-800 font-mono font-bold bg-amber-100 px-2 py-0.5 rounded">{solarHours} kWh/m²/d</span>
              </label>
              <input
                type="range"
                min={4.0}
                max={5.8}
                step={0.1}
                value={solarHours}
                onChange={e => setSolarHours(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
                <span>4.0 (Valley Shaded)</span>
                <span>5.1 (Gulmi Ridge Avg)</span>
                <span>5.8 (Peak Ridge Clear)</span>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="p-3 bg-white rounded-xl border border-amber-200">
              <div className="text-[10px] text-slate-500 font-medium">Annual Clean Generation</div>
              <div className="text-xl font-black text-amber-900 font-mono mt-0.5">{annualSolarKwh.toLocaleString()}</div>
              <div className="text-[9px] text-slate-400 font-mono">kWh/year</div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-amber-200">
              <div className="text-[10px] text-slate-500 font-medium">Battery Storage Bank</div>
              <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{batteryStorageKwh}</div>
              <div className="text-[9px] text-slate-400 font-mono">kWh (LFP Pack)</div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-amber-200">
              <div className="text-[10px] text-slate-500 font-medium">CO₂ Emissions Avoided</div>
              <div className="text-xl font-black text-emerald-800 font-mono mt-0.5">{solarCarbonOffsetTons}</div>
              <div className="text-[9px] text-emerald-600 font-mono">tCO₂e / year</div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-amber-200">
              <div className="text-[10px] text-slate-500 font-medium">Estimated CAPEX</div>
              <div className="text-xl font-black text-slate-900 font-mono mt-0.5">NPR {(solarEstimatedCostNpr / 100000).toFixed(1)}L</div>
              <div className="text-[9px] text-slate-400 font-mono">~4.8 yr Payback</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MICRO-HYDRO VIEW */}
      {systemType === 'hydro' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-purple-50/50 p-3 rounded-xl border border-purple-200">
            <div>
              <label className="text-[11px] font-bold text-slate-800 block mb-1 flex items-center justify-between">
                <span>Design Stream Discharge ($Q$):</span>
                <span className="text-purple-800 font-mono font-bold bg-purple-100 px-2 py-0.5 rounded">{streamFlowLps} L/s</span>
              </label>
              <input
                type="range"
                min={20}
                max={500}
                step={10}
                value={streamFlowLps}
                onChange={e => setStreamFlowLps(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
                <span>20 L/s (Tributary)</span>
                <span>200 L/s (Chhaldi/Panaha)</span>
                <span>500 L/s (Badigad Branch)</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-800 block mb-1 flex items-center justify-between">
                <span>Gross Hydraulic Head ($H$):</span>
                <span className="text-purple-800 font-mono font-bold bg-purple-100 px-2 py-0.5 rounded">{hydraulicHeadM} Meters</span>
              </label>
              <input
                type="range"
                min={10}
                max={150}
                step={5}
                value={hydraulicHeadM}
                onChange={e => setHydraulicHeadM(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
                <span>10m (Low Head)</span>
                <span>50m (Standard Hill)</span>
                <span>150m (High Cascade)</span>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="p-3 bg-white rounded-xl border border-purple-200">
              <div className="text-[10px] text-slate-500 font-medium">Rated Plant Capacity</div>
              <div className="text-xl font-black text-purple-900 font-mono mt-0.5">{hydroKw} kW</div>
              <div className="text-[9px] text-purple-700 font-mono">Run-of-River</div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-purple-200">
              <div className="text-[10px] text-slate-500 font-medium">Annual Hydro Generation</div>
              <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{annualHydroKwh.toLocaleString()}</div>
              <div className="text-[9px] text-slate-400 font-mono">kWh / year</div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-purple-200">
              <div className="text-[10px] text-slate-500 font-medium">Households Powered</div>
              <div className="text-xl font-black text-emerald-800 font-mono mt-0.5">{Math.round(hydroKw * 7.5)} HH</div>
              <div className="text-[9px] text-emerald-600 font-mono">Continuous Baseline</div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-purple-200">
              <div className="text-[10px] text-slate-500 font-medium">CO₂ Emissions Offset</div>
              <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{hydroCarbonOffsetTons} t</div>
              <div className="text-[9px] text-slate-400 font-mono">tCO₂e avoided/yr</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CLEAN COOKING VIEW */}
      {systemType === 'cooking' && (
        <div className="space-y-3">
          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200">
            <label className="text-[11px] font-bold text-slate-800 block mb-1 flex items-center justify-between">
              <span>Target Household Induction Transition Count:</span>
              <span className="text-emerald-800 font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded">{householdTransitionCount} Households</span>
            </label>
            <input
              type="range"
              min={50}
              max={2500}
              step={50}
              value={householdTransitionCount}
              onChange={e => setHouseholdTransitionCount(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
              <span>50 HH (Ward Pilot)</span>
              <span>500 HH (Village Cluster)</span>
              <span>2,500 HH (Full Municipality)</span>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="p-3 bg-white rounded-xl border border-emerald-200">
              <div className="text-[10px] text-slate-500 font-medium">Firewood Displaced</div>
              <div className="text-xl font-black text-emerald-900 font-mono mt-0.5">{firewoodDisplacedTons.toLocaleString()}</div>
              <div className="text-[9px] text-slate-400 font-mono">Tons / year</div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-emerald-200">
              <div className="text-[10px] text-slate-500 font-medium">Forest Biomass Preserved</div>
              <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{forestSavedHectares} ha</div>
              <div className="text-[9px] text-emerald-600 font-mono">Community Forest Equivalent</div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-emerald-200">
              <div className="text-[10px] text-slate-500 font-medium">Greenhouse Gas Offset</div>
              <div className="text-xl font-black text-emerald-800 font-mono mt-0.5">{cookingCo2OffsetTons.toLocaleString()}</div>
              <div className="text-[9px] text-emerald-600 font-mono">tCO₂e / year</div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-emerald-200">
              <div className="text-[10px] text-slate-500 font-medium">Indoor Smoke Reduction</div>
              <div className="text-xl font-black text-teal-800 font-mono mt-0.5">-88%</div>
              <div className="text-[9px] text-teal-600 font-mono">PM2.5 Exposure Drop</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
