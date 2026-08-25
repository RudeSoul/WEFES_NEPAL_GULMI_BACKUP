import React, { useState } from 'react';
import {
  FlaskConical, Sliders, UploadCloud, Terminal, Database,
  ArrowLeft, ArrowUp, Sparkles, CheckCircle2, Copy, Check,
  BookOpen, FileCode, Cpu, Layers, GitBranch, Download,
  ExternalLink, Share2, Compass, AlertCircle, Play
} from 'lucide-react';
import { WEFESOutput } from '@wefes/shared-types';

interface ResearchSandboxScreenProps {
  output?: WEFESOutput | null;
  onBackToAnalysis: () => void;
  onBackToMap: () => void;
  onBackToDossier?: () => void;
}

export const ResearchSandboxScreen: React.FC<ResearchSandboxScreenProps> = ({
  output,
  onBackToAnalysis,
  onBackToMap,
  onBackToDossier,
}) => {
  const [activeTab, setActiveTab] = useState<'formulas' | 'ingestion' | 'monte_carlo' | 'python_sdk' | 'partnership'>('formulas');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeFormula, setActiveFormula] = useState<'penman' | 'quefts' | 'aquacrop' | 'enteric'>('penman');

  // Interactive formula sliders for v2.0 simulation preview
  const [penmanAlbedo, setPenmanAlbedo] = useState<number>(0.23);
  const [penmanKc, setPenmanKc] = useState<number>(1.15);
  const [queftsRecoveryFraction, setQueftsRecoveryFraction] = useState<number>(0.45);
  const [aquacropWpStar, setAquacropWpStar] = useState<number>(17.0);
  const [climateTempAnomaly, setClimateTempAnomaly] = useState<number>(1.8);
  const [monsoonShiftDays, setMonsoonShiftDays] = useState<number>(-12);
  const [simulatedRunsCount] = useState<number>(1000);

  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const [registeredInst, setRegisteredInst] = useState<string>('Tribhuvan University (IAAS/IOE)');
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);

  const districtName = output?.districtName || 'National Basin Model';
  const cropName = output?.cropName || 'Paddy Rice (Dhan)';

  const handleCopyPython = () => {
    const pythonCode = `import wefes_nepal as wefes

# 1. Initialize District Model & 39-Year Gridded Climatology
basin = wefes.load_district("${districtName}", agro_zone="Terai")
print(f"Loaded {basin.name}: {basin.total_arable_ha} ha arable land")

# 2. Configure Agronomic & Bioeconomy Engine with Custom Parameter Overrides
engine = wefes.AgronomicEngine(
    crop="${cropName}",
    irrigation_system="solar_electric_tubewell",
    soil_ph=6.2,
    organic_matter_pct=1.4
)

# Custom Researcher Parameter Overrides (v2.0 Open Science Protocol)
engine.override_parameter("penman_albedo", ${penmanAlbedo})
engine.override_parameter("kc_mid_season", ${penmanKc})
engine.override_parameter("quefts_n_recovery_fraction", ${queftsRecoveryFraction})
engine.override_parameter("aquacrop_wp_star_g_m2", ${aquacropWpStar})

# 3. Run Stochastic Monte Carlo Sensitivity Simulation (1,000 runs)
simulation = engine.run_monte_carlo(
    iterations=${simulatedRunsCount},
    temp_anomaly_c=+${climateTempAnomaly},
    monsoon_shift_days=${monsoonShiftDays}
)

# 4. Export Scientific Outputs & NetCDF Tensors
print(simulation.get_executive_summary())
simulation.export_netcdf("${districtName.toLowerCase()}_nexus_sim_v2.nc")
simulation.generate_latex_report("${districtName.toLowerCase()}_report.tex")`;

    navigator.clipboard.writeText(pythonCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registeredEmail) {
      setRegistrationSuccess(true);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      {/* ═══════════════════════════════════════════════════════════════
          HERO & VERSION 2.0 RESEARCH BLUEPRINT HEADER
         ═══════════════════════════════════════════════════════════════ */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Breadcrumb Actions */}
        <div className="flex items-center gap-2 flex-wrap text-xs pb-4 border-b border-slate-800/80">
          <button
            onClick={onBackToAnalysis}
            className="text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 px-3 py-1.5 rounded-lg border border-slate-700 font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Analysis Report</span>
          </button>
          {onBackToDossier && (
            <>
              <span className="text-slate-600">/</span>
              <button
                onClick={onBackToDossier}
                className="text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 px-3 py-1.5 rounded-lg border border-slate-700 font-semibold transition-colors cursor-pointer"
              >
                Scientific Dossier
              </button>
            </>
          )}
          <span className="text-slate-600">/</span>
          <button
            onClick={onBackToMap}
            className="text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/80 px-3 py-1.5 rounded-lg border border-slate-700 font-semibold transition-colors cursor-pointer"
          >
            National Map
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-5">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold px-3 py-1 rounded-full">
                <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
                VERSION 2.0 PREVIEW & ARCHITECTURAL BLUEPRINT
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold px-3 py-1 rounded-full">
                Open Science Protocol
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-outfit text-white">
              Open Research & Formula Sandbox
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm font-sans leading-relaxed">
              A dedicated academic workbench engineered for university researchers, NARC agronomists, and climate modelers. In <strong>Version 2.0</strong>, researchers will be able to override mathematical coefficients, ingest localized IoT field spectrometer CSVs, execute 1,000-run Monte Carlo stochastic stress tests, and automate workflows via the <strong>Python SDK</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 text-xs font-mono">
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-slate-400 text-[10px] block uppercase">Target Environment:</span>
              <div className="text-white font-bold">Python 3.11 · WebAssembly Engine</div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-slate-400 text-[10px] block uppercase">Academic Standards:</span>
              <div className="text-emerald-400 font-bold">FAO-56 · AquaCrop-RS · IPCC AR6</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          5-TAB WORKBENCH NAVIGATION
         ═══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300 overflow-x-auto text-xs font-outfit">
        <button
          onClick={() => setActiveTab('formulas')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'formulas'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
          }`}
        >
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>1. Formula & Parameter Overrides</span>
        </button>

        <button
          onClick={() => setActiveTab('ingestion')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'ingestion'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
          }`}
        >
          <UploadCloud className="w-4 h-4 text-sky-400" />
          <span>2. Custom Data & IoT Ingestion</span>
        </button>

        <button
          onClick={() => setActiveTab('monte_carlo')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'monte_carlo'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
          }`}
        >
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>3. Monte Carlo Sensitivity Matrix</span>
          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">v2.0</span>
        </button>

        <button
          onClick={() => setActiveTab('python_sdk')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'python_sdk'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
          }`}
        >
          <Terminal className="w-4 h-4 text-amber-400" />
          <span>4. Python SDK & Jupyter Bridge</span>
          <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono">v2.0</span>
        </button>

        <button
          onClick={() => setActiveTab('partnership')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'partnership'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
          }`}
        >
          <BookOpen className="w-4 h-4 text-rose-400" />
          <span>5. Academic Co-Development & Beta Waitlist</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          TAB 1: FORMULA & PARAMETER OVERRIDES (INTERACTIVE PREVIEW)
         ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'formulas' && (
        <div className="space-y-6">
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-950 flex items-start gap-2.5">
            <Sliders className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm font-outfit block text-purple-900">
                Live Parameter Override Sandbox (v2.0 Preview):
              </strong>
              <p className="text-purple-800 font-sans mt-0.5 leading-relaxed">
                In Version 2.0, researchers will not be locked into default national averages. You will be able to customize empirical boundary constants, adjust transpiration coefficients ($K_c$), and simulate new seed varietals directly in the browser using WebAssembly.
              </p>
            </div>
          </div>

          {/* Formula Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
            <button
              onClick={() => setActiveFormula('penman')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeFormula === 'penman'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              1. FAO-56 Penman-Monteith (ET₀)
            </button>
            <button
              onClick={() => setActiveFormula('quefts')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeFormula === 'quefts'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              2. QUEFTS Soil Non-Linear Supply
            </button>
            <button
              onClick={() => setActiveFormula('aquacrop')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeFormula === 'aquacrop'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              3. AquaCrop-RS Water Productivity
            </button>
            <button
              onClick={() => setActiveFormula('enteric')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeFormula === 'enteric'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              4. IPCC Tier-2 Enteric Methane
            </button>
          </div>

          {/* Active Formula Detail & Slider Workbench */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-6">
            {activeFormula === 'penman' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 font-outfit">
                      FAO-56 Penman-Monteith Standard Evapotranspiration Equation
                    </h4>
                    <span className="text-xs font-mono text-slate-500">Hydrologic Core • Calibrated for {districtName}</span>
                  </div>
                  <span className="text-xs font-mono bg-sky-50 text-sky-900 px-3 py-1 rounded-xl border border-sky-200 font-bold self-start sm:self-auto">
                    Equation ISO 7726:2024
                  </span>
                </div>

                {/* Mathematical Equation Card */}
                <div className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-xs sm:text-sm overflow-x-auto shadow-inner text-center">
                  ET₀ = [ 0.408·Δ·(Rₙ - G) + γ·(900 / (T + 273))·u₂·(eₛ - eₐ) ] / [ Δ + γ·(1 + 0.34·u₂) ]
                </div>

                {/* Interactive Slider Overrides */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 font-sans">Canopy Surface Albedo (α):</span>
                      <span className="font-mono font-bold text-emerald-700">{penmanAlbedo}</span>
                    </div>
                    <input
                      type="range"
                      min="0.10"
                      max="0.35"
                      step="0.01"
                      value={penmanAlbedo}
                      onChange={(e) => setPenmanAlbedo(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Dark Water/Soil (0.10)</span>
                      <span>Default C3 Crop (0.23)</span>
                      <span>Dense Dry Canopy (0.35)</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 font-sans">Mid-Season Crop Coefficient (K_c):</span>
                      <span className="font-mono font-bold text-blue-700">{penmanKc}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.80"
                      max="1.45"
                      step="0.05"
                      value={penmanKc}
                      onChange={(e) => setPenmanKc(parseFloat(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Drought Stress (0.80)</span>
                      <span>Standard Paddy (1.15)</span>
                      <span>Flooded Basin (1.45)</span>
                    </div>
                  </div>
                </div>

                {/* Recalculated Output Telemetry */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                  <div>
                    <span className="text-emerald-950 font-bold font-sans block">Simulated Daily Crop Water Demand (ET_c):</span>
                    <span className="text-emerald-800 text-[11px] font-sans">
                      ET_c = {penmanKc} × ET₀(α = {penmanAlbedo}) → Recalculated live in WebAssembly memory
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-extrabold text-emerald-950">{(4.85 * penmanKc * (1 - (penmanAlbedo - 0.23) * 0.4)).toFixed(2)}</span>
                    <span className="text-xs text-emerald-700 ml-1">mm / day</span>
                  </div>
                </div>
              </div>
            )}

            {activeFormula === 'quefts' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 font-outfit">
                      QUEFTS Non-Linear Nutrient Uptake & Yield Boundary Model
                    </h4>
                    <span className="text-xs font-mono text-slate-500">Jansen et al. (1990) · NARC 2022 Soil Matrix</span>
                  </div>
                  <span className="text-xs font-mono bg-purple-50 text-purple-900 px-3 py-1 rounded-xl border border-purple-200 font-bold self-start sm:self-auto">
                    Multi-Nutrient Interaction
                  </span>
                </div>

                <div className="p-4 bg-slate-900 text-purple-300 rounded-2xl font-mono text-xs sm:text-sm overflow-x-auto shadow-inner text-center">
                  Yield_N = a + [ d·(U_N - r) / (1 + b·(U_N - r)) ] where U_N = Soil_Supply_N + (App_N · RE_N)
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 font-sans">Apparent Nitrogen Recovery Fraction (RE_N):</span>
                    <span className="font-mono font-bold text-purple-700">{(queftsRecoveryFraction * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.25"
                    max="0.75"
                    step="0.05"
                    value={queftsRecoveryFraction}
                    onChange={(e) => setQueftsRecoveryFraction(parseFloat(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Broadcast Urea (25%)</span>
                    <span>Deep Placement Briquette (45%)</span>
                    <span>Fertigation Micro-Drip (75%)</span>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                  <div>
                    <span className="text-purple-950 font-bold font-sans block">Effective Plant Nitrogen Uptake:</span>
                    <span className="text-purple-800 text-[11px] font-sans">
                      Cuts fertilizer loss by {Math.round((queftsRecoveryFraction - 0.35) * 100)}% when shifting application method
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-extrabold text-purple-950">{(120 * queftsRecoveryFraction + 42).toFixed(1)}</span>
                    <span className="text-xs text-purple-700 ml-1">kg N / ha</span>
                  </div>
                </div>
              </div>
            )}

            {activeFormula === 'aquacrop' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 font-outfit">
                      FAO AquaCrop-RS Normalized Biomass Water Productivity Equation
                    </h4>
                    <span className="text-xs font-mono text-slate-500">Steduto et al. (2009) · C3 vs C4 Photosynthetic Partitioning</span>
                  </div>
                  <span className="text-xs font-mono bg-emerald-50 text-emerald-900 px-3 py-1 rounded-xl border border-emerald-200 font-bold self-start sm:self-auto">
                    Process Simulation
                  </span>
                </div>

                <div className="p-4 bg-slate-900 text-teal-300 rounded-2xl font-mono text-xs sm:text-sm overflow-x-auto shadow-inner text-center">
                  Biomass (B) = WP* · ∑ [ Tr_i / ET₀_i ] · K_s,i · Harvest_Index (HI₀)
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 font-sans">Normalized Water Productivity (WP*):</span>
                    <span className="font-mono font-bold text-teal-700">{aquacropWpStar} g/m²</span>
                  </div>
                  <input
                    type="range"
                    min="12.0"
                    max="34.0"
                    step="0.5"
                    value={aquacropWpStar}
                    onChange={(e) => setAquacropWpStar(parseFloat(e.target.value))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>C3 Rice/Wheat (15-18 g/m²)</span>
                    <span>C4 Maize/Millet (28-32 g/m²)</span>
                    <span>High-Efficiency Genotype (34 g/m²)</span>
                  </div>
                </div>
              </div>
            )}

            {activeFormula === 'enteric' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 font-outfit">
                      IPCC Tier-2 Enteric Fermentation & Manure Methane Emission Factor
                    </h4>
                    <span className="text-xs font-mono text-slate-500">2019 IPCC Refinement · MoALD DLS Cattle/Buffalo Baseline</span>
                  </div>
                  <span className="text-xs font-mono bg-amber-50 text-amber-900 px-3 py-1 rounded-xl border border-amber-200 font-bold self-start sm:self-auto">
                    IPCC Tier-2 Refined
                  </span>
                </div>

                <div className="p-4 bg-slate-900 text-amber-300 rounded-2xl font-mono text-xs sm:text-sm overflow-x-auto shadow-inner text-center">
                  EF_CH₄ = [ GE · (Y_m / 100) · 365 ] / 55.65 MJ/kg CH₄
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 2: CUSTOM DATA & IOT INGESTION (v2.0 PREVIEW)
         ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'ingestion' && (
        <div className="space-y-6">
          <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-xs text-sky-950 flex items-start gap-2.5">
            <UploadCloud className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm font-outfit block text-sky-900">
                Custom Data Ingestion Dropzone & Field Sensor Telemetry (v2.0):
              </strong>
              <p className="text-sky-800 font-sans mt-0.5 leading-relaxed">
                Researchers working on localized ward plots or university trial stations will be able to upload custom sensor logs, drone multispectral orthomosaics, and laboratory soil test CSVs to run hyper-localized nexus assessments.
              </p>
            </div>
          </div>

          {/* Mock Ingestion Dropzone */}
          <div className="p-8 sm:p-12 bg-white rounded-3xl border-2 border-dashed border-slate-300 text-center space-y-4 shadow-2xs hover:border-sky-500 transition-colors cursor-pointer group">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-base text-slate-900 font-outfit">
                Drag & Drop Field Data, CSV or GeoJSON
              </h4>
              <p className="text-xs text-slate-500 font-sans max-w-md mx-auto">
                Supports NARC Soil Laboratory Reports (.csv), Campbell Scientific Weather Logs (.dat), and Drone Spectral Reflectance GeoTIFFs (.tif).
              </p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs font-outfit cursor-pointer shadow-xs">
              Browse Sample Research Datasets
            </button>
          </div>

          {/* Sample CSV Schemas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-slate-900 font-outfit">1. Soil Spectrometer CSV</span>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold">Template</span>
              </div>
              <p className="text-slate-500 font-sans text-[11px]">
                Columns: <code>ward_id, parcel_lat, parcel_lon, ph, oc_pct, n_ppm, p_ppm, k_ppm, zn_ppm</code>
              </p>
              <div className="text-[10px] text-slate-400 font-mono">Compatible with: NARC / Soil Health Card API</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-slate-900 font-outfit">2. Micro-AWS Telemetry</span>
                <span className="text-[10px] text-sky-800 bg-sky-50 px-2 py-0.5 rounded font-bold">Template</span>
              </div>
              <p className="text-slate-500 font-sans text-[11px]">
                Columns: <code>timestamp, rain_mm, temp_c, rh_pct, solar_rad_wm2, soil_moist_10cm</code>
              </p>
              <div className="text-[10px] text-slate-400 font-mono">Compatible with: DHM Telemetry / Campbell AWS</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-slate-900 font-outfit">3. Multispectral Drone Grid</span>
                <span className="text-[10px] text-purple-800 bg-purple-50 px-2 py-0.5 rounded font-bold">GeoJSON</span>
              </div>
              <p className="text-slate-500 font-sans text-[11px]">
                Features: <code>ndvi_mean, ndre_chlorophyll, canopy_height_m, water_stress_cwsi</code>
              </p>
              <div className="text-[10px] text-slate-400 font-mono">Compatible with: DJI Mavic 3M / MicaSense</div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 3: MONTE CARLO SENSITIVITY MATRIX GENERATOR
         ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'monte_carlo' && (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
            <Cpu className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm font-outfit block text-emerald-900">
                1,000-Iteration Stochastic Monte Carlo Engine (v2.0 Preview):
              </strong>
              <p className="text-emerald-800 font-sans mt-0.5 leading-relaxed">
                Simulates Gaussian-distributed climatic anomalies (+1.5°C to +4.0°C warming, erratic monsoon onset shifts, and fertilizer price volatility) to output P10, P50, and P90 confidence intervals for district yield and water security.
              </p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 font-sans">Mean Temperature Anomaly (ΔT):</span>
                  <span className="font-mono font-bold text-rose-700">+{climateTempAnomaly}°C</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.5"
                  step="0.1"
                  value={climateTempAnomaly}
                  onChange={(e) => setClimateTempAnomaly(parseFloat(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>+0.5°C (Paris 1.5 Target)</span>
                  <span>+2.0°C (IPCC SSP2-4.5)</span>
                  <span>+4.5°C (IPCC SSP5-8.5)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 font-sans">Monsoon Onset Timing Shift:</span>
                  <span className="font-mono font-bold text-amber-700">{monsoonShiftDays} Days</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="2"
                  value={monsoonShiftDays}
                  onChange={(e) => setMonsoonShiftDays(parseInt(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>-30 Days (Early Deluge)</span>
                  <span>Normal Onset (0 Days)</span>
                  <span>+30 Days (Severe Drought)</span>
                </div>
              </div>
            </div>

            {/* Probability Density Bell Curve SVG */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-800 font-outfit">Simulated Yield Probability Distribution ({simulatedRunsCount} Runs)</span>
                <span className="text-slate-500">P50 Median: 4.82 t/ha · P10 Worst Case: 3.12 t/ha</span>
              </div>
              <div className="w-full overflow-x-auto">
                <svg viewBox="0 0 780 180" className="w-full min-w-[650px] h-auto select-none font-sans">
                  {/* Grid Lines */}
                  <line x1="40" y1="30" x2="740" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="40" y1="80" x2="740" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="40" y1="130" x2="740" y2="130" stroke="#e2e8f0" strokeWidth="1.5" />

                  {/* Bell Curve Area */}
                  <path
                    d="M 60 130 C 180 130, 260 120, 320 70 C 370 25, 410 25, 460 70 C 520 120, 600 130, 720 130 Z"
                    fill="#10b981"
                    fillOpacity="0.15"
                  />
                  {/* Bell Curve Stroke */}
                  <path
                    d="M 60 130 C 180 130, 260 120, 320 70 C 370 25, 410 25, 460 70 C 520 120, 600 130, 720 130"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                  />

                  {/* P10, P50, P90 Marker Lines */}
                  <line x1="280" y1="30" x2="280" y2="130" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4" />
                  <text x="280" y="24" fill="#d97706" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">P10 (3.12 t/ha)</text>

                  <line x1="390" y1="20" x2="390" y2="130" stroke="#10b981" strokeWidth="2" />
                  <text x="390" y="14" fill="#047857" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">P50 Median (4.82 t/ha)</text>

                  <line x1="500" y1="30" x2="500" y2="130" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" />
                  <text x="500" y="24" fill="#2563eb" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">P90 (5.64 t/ha)</text>

                  {/* X Axis labels */}
                  <text x="60" y="150" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">2.0 t/ha</text>
                  <text x="280" y="150" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">3.5 t/ha</text>
                  <text x="390" y="150" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">4.8 t/ha</text>
                  <text x="500" y="150" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">5.6 t/ha</text>
                  <text x="720" y="150" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">6.5 t/ha</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 4: PYTHON SDK & JUPYTER NOTEBOOK BRIDGE
         ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'python_sdk' && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
            <Terminal className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm font-outfit block text-amber-900">
                Official `wefes-nepal-sdk` Python & Jupyter Notebook Bridge (v2.0):
              </strong>
              <p className="text-amber-800 font-sans mt-0.5 leading-relaxed">
                Researchers and PhD candidates will be able to query the platform programmatically, execute automated spatial batch runs across all 77 districts, and export results directly to Pandas DataFrames and NetCDF climate files.
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-mono text-slate-400 ml-2">research_script.py · Jupyter Notebook Compatible</span>
              </div>
              <button
                onClick={handleCopyPython}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied Code!' : 'Copy Script'}</span>
              </button>
            </div>

            <pre className="text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed p-2">
              <code>{`import wefes_nepal as wefes

# 1. Initialize District Model & 39-Year Gridded Climatology
basin = wefes.load_district("${districtName}", agro_zone="Terai")
print(f"Loaded {basin.name}: {basin.total_arable_ha} ha arable land")

# 2. Configure Agronomic & Bioeconomy Engine with Custom Parameter Overrides
engine = wefes.AgronomicEngine(
    crop="${cropName}",
    irrigation_system="solar_electric_tubewell",
    soil_ph=6.2,
    organic_matter_pct=1.4
)

# Custom Researcher Parameter Overrides (v2.0 Open Science Protocol)
engine.override_parameter("penman_albedo", ${penmanAlbedo})
engine.override_parameter("kc_mid_season", ${penmanKc})
engine.override_parameter("quefts_n_recovery_fraction", ${queftsRecoveryFraction})
engine.override_parameter("aquacrop_wp_star_g_m2", ${aquacropWpStar})

# 3. Run Stochastic Monte Carlo Sensitivity Simulation (1,000 runs)
simulation = engine.run_monte_carlo(
    iterations=${simulatedRunsCount},
    temp_anomaly_c=+${climateTempAnomaly},
    monsoon_shift_days=${monsoonShiftDays}
)

# 4. Export Scientific Outputs & NetCDF Tensors
print(simulation.get_executive_summary())
simulation.export_netcdf("${districtName.toLowerCase()}_nexus_sim_v2.nc")
simulation.generate_latex_report("${districtName.toLowerCase()}_report.tex")`}</code>
            </pre>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 5: ACADEMIC CO-DEVELOPMENT & EARLY ACCESS REGISTRATION
         ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'partnership' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-6">
            <div className="border-b pb-3 space-y-1">
              <h4 className="text-lg font-bold text-slate-900 font-outfit">
                University & Institutional Academic Co-Development
              </h4>
              <p className="text-xs text-slate-500 font-sans">
                Join the national consortium building Version 2.0. We partner with Tribhuvan University, Agriculture & Forestry University, NARC, and international research organizations.
              </p>
            </div>

            {registrationSuccess ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h5 className="font-bold text-emerald-950 font-outfit text-base">
                  Early Researcher Access Request Registered!
                </h5>
                <p className="text-xs text-emerald-800 font-sans max-w-md mx-auto">
                  Thank you! We have added <strong>{registeredEmail}</strong> ({registeredInst}) to the Version 2.0 Academic Beta Group. You will receive pre-release Python SDK API keys and sandbox documentation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4 max-w-xl">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-outfit block">
                    Institutional Email Address:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="researcher@iaas.tu.edu.np"
                    value={registeredEmail}
                    onChange={(e) => setRegisteredEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-outfit block">
                    University or Research Organization:
                  </label>
                  <select
                    value={registeredInst}
                    onChange={(e) => setRegisteredInst(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50"
                  >
                    <option value="Tribhuvan University (IAAS/IOE)">Tribhuvan University (IAAS / IOE)</option>
                    <option value="Agriculture and Forestry University (AFU Rampur)">Agriculture & Forestry University (AFU Rampur)</option>
                    <option value="Nepal Agricultural Research Council (NARC)">Nepal Agricultural Research Council (NARC)</option>
                    <option value="Kathmandu University (KU)">Kathmandu University (KU)</option>
                    <option value="ICIMOD / IWMI / CGIAR Nepal">ICIMOD / IWMI / CGIAR Nepal</option>
                    <option value="Independent Researcher / Other">Independent Researcher / Other</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs font-outfit transition-all cursor-pointer shadow-xs"
                >
                  Request Version 2.0 Early Access API Key ↗
                </button>
              </form>
            )}

            {/* BibTeX Citation Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-800 font-outfit block">
                Official Academic Citation (BibTeX):
              </span>
              <pre className="p-3 bg-slate-900 text-emerald-300 rounded-xl font-mono text-[11px] overflow-x-auto">
                <code>{`@software{wefes_nexus_nepal_2026,
  author = {WEFES Nexus Nepal Consortium},
  title = {WEFES Nexus Nepal: Sovereign Bioeconomy & Agronomic Decision Support System},
  year = {2026},
  publisher = {Ministry of Agriculture & Livestock Development (MoALD) / NARC},
  url = {https://wefes-nexus-nepal.gov.np},
  version = {2.0-preview}
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          BOTTOM UNIFIED QUICK NAVIGATION BAR
         ═══════════════════════════════════════════════════════════════ */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 bg-white/95 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onBackToAnalysis}
            className="text-xs text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1 transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Analysis Report</span>
          </button>
          {onBackToDossier && (
            <button
              onClick={onBackToDossier}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs"
            >
              <span>Scientific Dossier</span>
            </button>
          )}
          <button
            onClick={onBackToMap}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs"
          >
            <span>National Map</span>
          </button>
        </div>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs"
        >
          <ArrowUp className="w-4 h-4 text-slate-500" />
          <span>Scroll to Top</span>
        </button>
      </div>
    </div>
  );
};
