import React, { useState } from 'react';
import { WEFESOutput, ScenarioParameters } from '@wefes/shared-types';
import { simulateScenario } from '@wefes/wefes-engine';
import { SlidersHorizontal, CloudRain, Zap, TrendingUp, Sprout, ArrowUpRight, ArrowDownRight, RefreshCw, Layers, ShieldCheck, DollarSign, Trees, Droplets, Sun, ChevronDown, ChevronUp, Coins, ArrowLeft, ArrowUp } from 'lucide-react';

interface ScenarioSimulatorProps {
  baselineOutput: WEFESOutput;
  onBackToAnalysis?: () => void;
  onBackToDistrict?: () => void;
  onBackToMap?: () => void;
}

const DEFAULT_PARAMS: ScenarioParameters = {
  // Climate & Water
  rainfallVariation: 0,
  monsoonShift: 0,
  droughtFrequency: 1.0,
  glacierFlowVariation: 0,
  groundwaterLimit: 2500,

  // Energy
  renewableEnergyShare: 30,
  solarIrrigationAdoption: 20,
  microHydroAccess: 15,
  dieselDependency: 10,
  gridTariffNpr: 10.5,

  // Agronomic & Ecological
  regenerativeFarmingAdoption: 10,
  bioFertilizerRatio: 15,
  erosionBarrierRate: 20,
  deforestationRate: 2,

  // Socioeconomic & Market
  marketPriceFluctuation: 0,
  laborRemittanceRate: 0,
  transportInfraIndex: 50,
  exportTaxSubsidyRate: 0,
};

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  baselineOutput,
  onBackToAnalysis,
  onBackToDistrict,
  onBackToMap,
}) => {
  const initialParams = React.useMemo<ScenarioParameters>(() => ({
    ...DEFAULT_PARAMS,
    renewableEnergyShare: Math.round(100 - baselineOutput.energy.fossilSharePercent),
  }), [baselineOutput]);

  const [parameters, setParameters] = useState<ScenarioParameters>(initialParams);
  const [activeTab, setActiveTab] = useState<'climate' | 'energy' | 'agronomic' | 'socio'>('climate');

  React.useEffect(() => {
    setParameters(initialParams);
  }, [initialParams]);

  const scenarioResult = simulateScenario(baselineOutput, parameters);
  const { simulated, differentials } = scenarioResult;

  const handleReset = () => {
    setParameters(initialParams);
  };

  const updateParam = (key: keyof ScenarioParameters, val: number) => {
    setParameters(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* Simulator Header & Controls Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm bg-white/95 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {onBackToAnalysis && (
              <button
                onClick={onBackToAnalysis}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Analysis Report
              </button>
            )}
            {onBackToDistrict && (
              <>
                <span className="text-slate-300">•</span>
                <button
                  onClick={onBackToDistrict}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors cursor-pointer"
                >
                  {baselineOutput.districtName} District
                </button>
              </>
            )}
            {onBackToMap && (
              <>
                <span className="text-slate-300">•</span>
                <button
                  onClick={onBackToMap}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors cursor-pointer"
                >
                  National Map
                </button>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold mb-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
            <span>EXPANDED MULTI-SECTOR REAL-TIME SCENARIO SIMULATOR</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-outfit">
            Simulating {baselineOutput.cropName} in {baselineOutput.districtName}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            16 real-world climate, technological, ecological & market levers recalculating WEFES trade-offs in real time.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Levers</span>
        </button>
      </div>

      {/* Main Grid: 16 Slider Controls (Left 6 Cols) vs Comparison & Differentials (Right 6 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Controls Panel with Tabs */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm bg-white/95 space-y-5">

          {/* Tab Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
            {[
              { id: 'climate', label: 'Climate & Water', icon: <Droplets className="w-3.5 h-3.5 text-sky-600" /> },
              { id: 'energy', label: 'Energy System', icon: <Zap className="w-3.5 h-3.5 text-amber-600" /> },
              { id: 'agronomic', label: 'Agronomy & Eco', icon: <Sprout className="w-3.5 h-3.5 text-emerald-600" /> },
              { id: 'socio', label: 'Socio & Market', icon: <Coins className="w-3.5 h-3.5 text-purple-600" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-[11px] cursor-pointer ${activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
              >
                {tab.icon}
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 1: Climate & Water Levers */}
          {activeTab === 'climate' && (
            <div className="space-y-4 animate-fade-in-up">
              {/* Slider 1.1: Monsoon Shift */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">Monsoon Shift (%)</span>
                  <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs font-bold">
                    {parameters.monsoonShift > 0 ? `+${parameters.monsoonShift}%` : `${parameters.monsoonShift}%`}
                  </span>
                </div>
                <input
                  type="range" min="-30" max="30" step="1"
                  value={parameters.monsoonShift}
                  onChange={(e) => updateParam('monsoonShift', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Delayed (-30%)</span>
                  <span>Normal (0%)</span>
                  <span>Heavy (+30%)</span>
                </div>
              </div>

              {/* Slider 1.2: Drought Frequency */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">Drought Frequency Multiplier</span>
                  <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs font-bold">
                    {parameters.droughtFrequency}x
                  </span>
                </div>
                <input
                  type="range" min="1.0" max="3.0" step="0.1"
                  value={parameters.droughtFrequency}
                  onChange={(e) => updateParam('droughtFrequency', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Baseline (1.0x)</span>
                  <span>Moderate (2.0x)</span>
                  <span>Extreme Drought (3.0x)</span>
                </div>
              </div>

              {/* Slider 1.3: Glacier Flow Variation */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">Glacier / Stream Flow Variation (%)</span>
                  <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs font-bold">
                    {parameters.glacierFlowVariation > 0 ? `+${parameters.glacierFlowVariation}%` : `${parameters.glacierFlowVariation}%`}
                  </span>
                </div>
                <input
                  type="range" min="-40" max="40" step="5"
                  value={parameters.glacierFlowVariation}
                  onChange={(e) => updateParam('glacierFlowVariation', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Reduced (-40%)</span>
                  <span>Normal (0%)</span>
                  <span>Surge (+40%)</span>
                </div>
              </div>

              {/* Slider 1.4: Groundwater Extraction Limit */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">Groundwater Extraction Cap (m³)</span>
                  <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs font-bold">
                    {parameters.groundwaterLimit.toLocaleString()} m³
                  </span>
                </div>
                <input
                  type="range" min="500" max="5000" step="250"
                  value={parameters.groundwaterLimit}
                  onChange={(e) => updateParam('groundwaterLimit', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Strict (500 m³)</span>
                  <span>Standard (2,500 m³)</span>
                  <span>High (5,000 m³)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Energy System Levers */}
          {activeTab === 'energy' && (
            <div className="space-y-4 animate-fade-in-up">
              {/* Slider 2.1: Solar Irrigation Adoption */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">Solar Irrigation Adoption (%)</span>
                  <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs font-bold">
                    {parameters.solarIrrigationAdoption}%
                  </span>
                </div>
                <input
                  type="range" min="0" max="100" step="5"
                  value={parameters.solarIrrigationAdoption}
                  onChange={(e) => updateParam('solarIrrigationAdoption', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0% (Traditional)</span>
                  <span>50% Hybrid</span>
                  <span>100% Solar</span>
                </div>
              </div>

              {/* Slider 2.2: Micro-Hydro Access */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">Micro-Hydro Access (%)</span>
                  <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs font-bold">
                    {parameters.microHydroAccess}%
                  </span>
                </div>
                <input
                  type="range" min="0" max="100" step="5"
                  value={parameters.microHydroAccess}
                  onChange={(e) => updateParam('microHydroAccess', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0% Access</span>
                  <span>50% Integrated</span>
                  <span>100% Full Access</span>
                </div>
              </div>

              {/* Slider 2.3: Off-Grid Diesel Dependency */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">Off-Grid Diesel Dependency (%)</span>
                  <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs font-bold">
                    {parameters.dieselDependency}%
                  </span>
                </div>
                <input
                  type="range" min="0" max="100" step="5"
                  value={parameters.dieselDependency}
                  onChange={(e) => updateParam('dieselDependency', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0% Clean Grid</span>
                  <span>50% Hybrid</span>
                  <span>100% Full Diesel</span>
                </div>
              </div>

              {/* Slider 2.4: Grid Electricity Tariff */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">Grid Tariff (NPR/kWh)</span>
                  <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs font-bold">
                    NPR {parameters.gridTariffNpr}/kWh
                  </span>
                </div>
                <input
                  type="range" min="5.0" max="25.0" step="0.5"
                  value={parameters.gridTariffNpr}
                  onChange={(e) => updateParam('gridTariffNpr', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Subsidized (NPR 5)</span>
                  <span>Standard (NPR 10.5)</span>
                  <span>High Peak (NPR 25)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Agronomy & Eco Levers */}
          {activeTab === 'agronomic' && (
            <div className="space-y-4 animate-fade-in-up">
              {/* Slider 3.1: Regenerative Farming Adoption */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">Regenerative Farming Adoption (%)</span>
                  <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs font-bold">
                    {parameters.regenerativeFarmingAdoption}%
                  </span>
                </div>
                <input
                  type="range" min="0" max="100" step="5"
                  value={parameters.regenerativeFarmingAdoption}
                  onChange={(e) => updateParam('regenerativeFarmingAdoption', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0% Conventional</span>
                  <span>50% Transition</span>
                  <span>100% Full Organic</span>
                </div>
              </div>

              {/* Slider 3.2: Bio-Fertilizer Ratio */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">Bio-Fertilizer Ratio (%)</span>
                  <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs font-bold">
                    {parameters.bioFertilizerRatio}%
                  </span>
                </div>
                <input
                  type="range" min="0" max="100" step="5"
                  value={parameters.bioFertilizerRatio}
                  onChange={(e) => updateParam('bioFertilizerRatio', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0% Chemical</span>
                  <span>50% Bio Mix</span>
                  <span>100% Pure Bio</span>
                </div>
              </div>

              {/* Slider 3.3: Soil Erosion Protection Barriers */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">Soil Erosion Barrier Coverage (%)</span>
                  <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs font-bold">
                    {parameters.erosionBarrierRate}%
                  </span>
                </div>
                <input
                  type="range" min="0" max="100" step="5"
                  value={parameters.erosionBarrierRate}
                  onChange={(e) => updateParam('erosionBarrierRate', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0% Unprotected</span>
                  <span>50% Terraced</span>
                  <span>100% Full Protection</span>
                </div>
              </div>

              {/* Slider 3.4: Deforestation Rate */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">Local Deforestation Rate (%)</span>
                  <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs font-bold">
                    {parameters.deforestationRate}%/yr
                  </span>
                </div>
                <input
                  type="range" min="0" max="20" step="1"
                  value={parameters.deforestationRate}
                  onChange={(e) => updateParam('deforestationRate', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0% Zero Loss</span>
                  <span>10% Moderate</span>
                  <span>20% Severe</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Socio & Market Levers */}
          {activeTab === 'socio' && (
            <div className="space-y-4 animate-fade-in-up">
              {/* Slider 4.1: Market Price Fluctuation */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">Farmgate Market Price Change (%)</span>
                  <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs font-bold">
                    {parameters.marketPriceFluctuation > 0 ? `+${parameters.marketPriceFluctuation}%` : `${parameters.marketPriceFluctuation}%`}
                  </span>
                </div>
                <input
                  type="range" min="-50" max="100" step="5"
                  value={parameters.marketPriceFluctuation}
                  onChange={(e) => updateParam('marketPriceFluctuation', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Crash (-50%)</span>
                  <span>Baseline (0%)</span>
                  <span>Premium (+100%)</span>
                </div>
              </div>

              {/* Slider 4.2: Labor Supply / Remittance Rate */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">Labor Supply / Remittance Inflow (%)</span>
                  <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs font-bold">
                    {parameters.laborRemittanceRate > 0 ? `+${parameters.laborRemittanceRate}%` : `${parameters.laborRemittanceRate}%`}
                  </span>
                </div>
                <input
                  type="range" min="-30" max="30" step="5"
                  value={parameters.laborRemittanceRate}
                  onChange={(e) => updateParam('laborRemittanceRate', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Out-Migration (-30%)</span>
                  <span>Balanced (0%)</span>
                  <span>In-Labor Gain (+30%)</span>
                </div>
              </div>

              {/* Slider 4.3: Transport Infrastructure Index */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">Transport Infrastructure Index (1-100)</span>
                  <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs font-bold">
                    {parameters.transportInfraIndex} / 100
                  </span>
                </div>
                <input
                  type="range" min="10" max="100" step="5"
                  value={parameters.transportInfraIndex}
                  onChange={(e) => updateParam('transportInfraIndex', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Remote (10)</span>
                  <span>Average (50)</span>
                  <span>Highway (100)</span>
                </div>
              </div>

              {/* Slider 4.4: Export Tax / Subsidy Rate */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">Export Tax / Subsidy Rate (%)</span>
                  <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs font-bold">
                    {parameters.exportTaxSubsidyRate > 0 ? `+${parameters.exportTaxSubsidyRate}% Subsidy` : `${parameters.exportTaxSubsidyRate}% Tax`}
                  </span>
                </div>
                <input
                  type="range" min="-20" max="50" step="5"
                  value={parameters.exportTaxSubsidyRate}
                  onChange={(e) => updateParam('exportTaxSubsidyRate', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>20% Tax</span>
                  <span>0% Neutral</span>
                  <span>50% Subsidy</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Split Screen Comparison & Differentials (Right 6 Cols) */}
        <div className="lg:col-span-6 space-y-4">

          {/* Differentials Summary Banner */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-900 bg-slate-900 text-white shadow-md flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold">Simulated Nexus Balance Score</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-3xl font-extrabold text-white font-outfit">{simulated.nexusBalanceIndex} / 100</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 font-mono ${differentials.nexusBalanceDelta >= 0 ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                  {differentials.nexusBalanceDelta >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {differentials.nexusBalanceDelta > 0 ? `+${differentials.nexusBalanceDelta}` : differentials.nexusBalanceDelta} pts
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Nexus Synergy State</span>
              <span className="text-xs font-bold text-emerald-500">{simulated.nexusRating}</span>
            </div>
          </div>

          {/* Side-by-Side Baseline vs Simulated Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Baseline Column */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Baseline Profile</span>
                <span className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-mono font-semibold">Current</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Water Consumed:</span>
                  <span className="font-bold text-slate-800">{baselineOutput.water.consumptionLiters.toLocaleString()} L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Grid Energy:</span>
                  <span className="font-bold text-slate-800">{baselineOutput.energy.gridKwh} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Carbon Offset:</span>
                  <span className="font-bold text-slate-800">{baselineOutput.ecosystem.carbonOffsetKgCo2} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Net Revenue:</span>
                  <span className="font-bold text-slate-800">NPR {baselineOutput.socioeconomics.netRevenueNpr.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Direct FTE Jobs:</span>
                  <span className="font-bold text-slate-800">{baselineOutput.socioeconomics.directJobsCreated} Jobs</span>
                </div>
              </div>
            </div>

            {/* Simulated Column */}
            <div className="p-4 rounded-xl border border-emerald-300 bg-white space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Simulated Scenario</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold font-mono">Real-time</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Water Consumed:</span>
                  <span className="font-bold text-sky-700 flex items-center gap-1">
                    {simulated.water.consumptionLiters.toLocaleString()} L
                    <span className={`text-[10px] font-bold ${differentials.waterDeltaPercent <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      ({differentials.waterDeltaPercent}%)
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Grid Energy:</span>
                  <span className="font-bold text-amber-700 flex items-center gap-1">
                    {simulated.energy.gridKwh} kWh ({simulated.energy.fossilSharePercent}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Carbon Offset:</span>
                  <span className="font-bold text-teal-700 flex items-center gap-1">
                    {simulated.ecosystem.carbonOffsetKgCo2} kg
                    <span className="text-[10px] text-emerald-600 font-bold">(+{differentials.carbonDeltaPercent}%)</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Net Revenue:</span>
                  <span className="font-bold text-purple-700 flex items-center gap-1">
                    NPR {simulated.socioeconomics.netRevenueNpr.toLocaleString()}
                    <span className={`text-[10px] font-bold ${differentials.revenueDeltaPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      ({differentials.revenueDeltaPercent > 0 ? `+${differentials.revenueDeltaPercent}` : differentials.revenueDeltaPercent}%)
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Direct FTE Jobs:</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    {simulated.socioeconomics.directJobsCreated} Jobs
                    <span className="text-[10px] text-emerald-600 font-bold">(+{differentials.jobsDeltaPercent}%)</span>
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Trade-Off Differential Percentages Bar */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Water Stress Delta</span>
              <span className={`text-sm font-extrabold font-mono ${differentials.waterDeltaPercent <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {differentials.waterDeltaPercent}%
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Eco Health Index</span>
              <span className="text-sm font-extrabold font-mono text-teal-700">
                +{differentials.ecoHealthDeltaPercent}%
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Net Revenue Delta</span>
              <span className={`text-sm font-extrabold font-mono ${differentials.revenueDeltaPercent >= 0 ? 'text-purple-700' : 'text-rose-700'}`}>
                {differentials.revenueDeltaPercent > 0 ? `+${differentials.revenueDeltaPercent}` : differentials.revenueDeltaPercent}%
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Quick Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50/90 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 flex-wrap">
          {onBackToAnalysis && (
            <button
              onClick={onBackToAnalysis}
              className="text-xs text-slate-800 hover:text-slate-950 font-bold flex items-center gap-1.5 transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600" />
              <span>Back to Analysis Report</span>
            </button>
          )}
          {onBackToDistrict && (
            <button
              onClick={onBackToDistrict}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 transition-colors cursor-pointer bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm"
            >
              <span>{baselineOutput.districtName} District</span>
            </button>
          )}
          {onBackToMap && (
            <button
              onClick={onBackToMap}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 transition-colors cursor-pointer bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm"
            >
              <span>National Map</span>
            </button>
          )}
        </div>

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
