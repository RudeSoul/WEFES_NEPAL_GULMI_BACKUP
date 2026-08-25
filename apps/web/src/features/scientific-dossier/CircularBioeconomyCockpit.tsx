import React, { useState, useMemo } from 'react';
import {
  computeCircularBioeconomy,
  CircularBioeconomyInput,
  CircularBioeconomyResult
} from '../../utils/circularBioeconomyEngine';
import {
  RefreshCw, Sprout, Milk, Fish, Flame, Waves, TrendingUp,
  DollarSign, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight,
  Download, Layers, Sliders, ChevronDown, ChevronUp, PieChart,
  Landmark, Activity, Zap, Sparkles
} from 'lucide-react';

interface CircularBioeconomyCockpitProps {
  districtName: string;
  cropName: string;
}

export const CircularBioeconomyCockpit: React.FC<CircularBioeconomyCockpitProps> = ({
  districtName,
  cropName,
}) => {
  // Interactive Slider States
  const [cropLandHa, setCropLandHa] = useState<number>(2.0);
  const [dairyHerdSize, setDairyHerdSize] = useState<number>(4);
  const [isBuffalo, setIsBuffalo] = useState<boolean>(true);
  const [aquaculturePondHa, setAquaculturePondHa] = useState<number>(0.5);
  const [biogasDigestersCount, setBiogasDigestersCount] = useState<number>(2);
  const [rechargePondEnabled, setRechargePondEnabled] = useState<boolean>(true);
  const [showFullDcfTable, setShowFullDcfTable] = useState<boolean>(false);

  const input: CircularBioeconomyInput = useMemo(() => ({
    districtName,
    cropName,
    cropLandHa,
    dairyHerdSize,
    isBuffalo,
    aquaculturePondHa,
    biogasDigestersCount,
    rechargePondEnabled,
  }), [districtName, cropName, cropLandHa, dairyHerdSize, isBuffalo, aquaculturePondHa, biogasDigestersCount, rechargePondEnabled]);

  const result: CircularBioeconomyResult = useMemo(() => {
    return computeCircularBioeconomy(input);
  }, [input]);

  const { circularResourceFlows, unified5PillarScorecard, financialSummary, discountedCashFlow15Years, enterpriseProductionTotals } = result;

  const handleExportCsv = () => {
    const headers = 'Year,CAPEX (NPR),Gross Revenue (NPR),OPEX (NPR),Net Cash Flow (NPR),Discounted Flow @ 10% (NPR),Cumulative Flow (NPR)\n';
    const rows = discountedCashFlow15Years.cashFlowSchedule.map(c => 
      `${c.year},${c.capexNpr},${c.grossRevenueNpr},${c.opexNpr},${c.netCashFlowNpr},${c.discountedCashFlow10Pct},${c.cumulativeCashFlowNpr}`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `15Year_DCF_${districtName}_${cropName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* Cockpit Top Header */}
      <div className="p-6 rounded-2xl border border-emerald-300/80 bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-slate-50/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-2xs">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-900 font-outfit tracking-tight">
                  Interactive Circular Bioeconomy Simulator & 15-Year DCF Cockpit
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-950 border border-emerald-300">
                  Closed-Loop Feedback
                </span>
              </div>
              <p className="text-xs text-slate-600 font-sans mt-0.5">
                Simulate mass-balance bio-slurry fertilizer replacement, livestock fodder cycles, and 15-year bankable cash flows.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Unified Nexus Score</span>
              <span className="text-xl font-extrabold text-emerald-950 font-outfit">{unified5PillarScorecard.compositeNexusBalanceScore} <span className="text-xs text-slate-500 font-normal">/ 100</span></span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-extrabold text-xl font-mono shadow-2xs border border-slate-800">
              {unified5PillarScorecard.compositeNexusBalanceScore}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            5 INTERACTIVE ENTERPRISE SLIDERS
           ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {/* Lever 1: Crop Land */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-2xs space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900 font-outfit flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <span>Crop Area ({cropName})</span>
              </span>
              <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{cropLandHa} ha</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="10.0"
              step="0.2"
              value={cropLandHa}
              onChange={(e) => setCropLandHa(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-100">
              <span>Grain: {(enterpriseProductionTotals.totalCropBiomassKg / 1000).toFixed(1)} t</span>
              <span>Straw: {circularResourceFlows.cropResidueFodderTonsPerYear} t</span>
            </div>
          </div>

          {/* Lever 2: Dairy Herd */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-2xs space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900 font-outfit flex items-center gap-1.5">
                <Milk className="w-4 h-4 text-blue-600" />
                <span>Dairy Herd</span>
              </span>
              <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{dairyHerdSize} Heads</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={dairyHerdSize}
              onChange={(e) => setDairyHerdSize(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
            <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
              <button
                onClick={() => setIsBuffalo(!isBuffalo)}
                className="text-blue-700 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>{isBuffalo ? 'Murrah Buffalo (71%)' : 'Crossbred Cow'}</span>
              </button>
              <span className="text-slate-500 font-mono">{(enterpriseProductionTotals.totalMilkLitersPerYear / 1000).toFixed(0)}k L/yr</span>
            </div>
          </div>

          {/* Lever 3: Aquaculture */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-2xs space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900 font-outfit flex items-center gap-1.5">
                <Fish className="w-4 h-4 text-cyan-600" />
                <span>Fish Pond Area</span>
              </span>
              <span className="font-mono font-bold text-cyan-900 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">{aquaculturePondHa} ha</span>
            </div>
            <input
              type="range"
              min="0"
              max="3.0"
              step="0.25"
              value={aquaculturePondHa}
              onChange={(e) => setAquaculturePondHa(Number(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-100">
              <span>Fish: {(enterpriseProductionTotals.totalFishBiomassKg / 1000).toFixed(1)} t</span>
              <span>FCR: 1.55</span>
            </div>
          </div>

          {/* Lever 4: AEPC Biogas Plants */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-2xs space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900 font-outfit flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>Biogas Plants</span>
              </span>
              <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{biogasDigestersCount} Plants</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={biogasDigestersCount}
              onChange={(e) => setBiogasDigestersCount(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-100">
              <span>{circularResourceFlows.lpgCylindersSavedPerYear} LPG Saved</span>
              <span>{circularResourceFlows.bioSlurryGeneratedTonsPerYear} t Slurry</span>
            </div>
          </div>

          {/* Lever 5: Recharge Pond Toggle */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900 font-outfit flex items-center gap-1.5">
                <Waves className="w-4 h-4 text-sky-600" />
                <span>50m² Recharge Pond</span>
              </span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                rechargePondEnabled ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-slate-100 text-slate-500'
              }`}>
                {rechargePondEnabled ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
            <button
              onClick={() => setRechargePondEnabled(!rechargePondEnabled)}
              className={`w-full py-1.5 rounded-xl text-xs font-bold font-outfit transition-all cursor-pointer ${
                rechargePondEnabled ? 'bg-emerald-700 text-white shadow-2xs hover:bg-emerald-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {rechargePondEnabled ? '✓ Restoring Groundwater' : 'Enable Recharge Pond'}
            </button>
            <div className="text-[10px] text-slate-500 font-mono text-center pt-1 border-t border-slate-100">
              Aquifer Shift: <strong className={circularResourceFlows.netGroundwaterImpactCmPerYear >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                {circularResourceFlows.netGroundwaterImpactCmPerYear > 0 ? `+${circularResourceFlows.netGroundwaterImpactCmPerYear}` : circularResourceFlows.netGroundwaterImpactCmPerYear} cm/yr
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CIRCULAR RESOURCE CONSERVATION FLOW MATRIX
         ═══════════════════════════════════════════════════════════════ */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm text-emerald-400 font-outfit">
              Live Circular Conservation Feedback Ledger (Mass & Energy Transfers)
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-300 font-bold bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-800">
            Total Resource Savings: +NPR {financialSummary.annualResourceCostSavingsNpr.toLocaleString()} / year
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 font-mono text-xs">
          {/* Loop 1: Crop Residue to Fodder */}
          <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 font-sans text-[11px] flex items-center justify-between">
              <span>🌾 Straw Residue</span>
              <span className="text-emerald-400">→ Fodder</span>
            </div>
            <div className="text-lg font-bold text-white mt-1">{circularResourceFlows.cropResidueFodderTonsPerYear} Tons/yr</div>
            <div className="text-[10px] text-slate-400 font-sans">Meets <strong>{circularResourceFlows.dairyFodderDemandMetPct}%</strong> of herd dry matter</div>
          </div>

          {/* Loop 2: Dung to Biogas */}
          <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 font-sans text-[11px] flex items-center justify-between">
              <span>🐄 Animal Dung</span>
              <span className="text-amber-400">→ Biogas</span>
            </div>
            <div className="text-lg font-bold text-amber-400 mt-1">{circularResourceFlows.lpgCylindersSavedPerYear} Cylinders</div>
            <div className="text-[10px] text-slate-400 font-sans">Saved: <strong>NPR {circularResourceFlows.lpgCostSavingsNprPerYear.toLocaleString()}</strong>/yr</div>
          </div>

          {/* Loop 3: Bio-Slurry to Fertilizer */}
          <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 font-sans text-[11px] flex items-center justify-between">
              <span>🧪 Bio-Slurry</span>
              <span className="text-blue-400">→ Saves Urea</span>
            </div>
            <div className="text-lg font-bold text-blue-400 mt-1">-{circularResourceFlows.chemicalFertilizerSubstituted.ureaBags50kgSaved} Bags</div>
            <div className="text-[10px] text-slate-400 font-sans">Saved: <strong>NPR {circularResourceFlows.chemicalFertilizerSubstituted.fertilizerCostSavedNpr.toLocaleString()}</strong>/yr</div>
          </div>

          {/* Loop 4: Recharge Pond to Groundwater */}
          <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 font-sans text-[11px] flex items-center justify-between">
              <span>🌊 Recharge Pond</span>
              <span className="text-cyan-400">→ Aquifer</span>
            </div>
            <div className={`text-lg font-bold mt-1 ${circularResourceFlows.netGroundwaterImpactCmPerYear >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {circularResourceFlows.netGroundwaterImpactCmPerYear >= 0 ? `+${circularResourceFlows.netGroundwaterImpactCmPerYear}` : circularResourceFlows.netGroundwaterImpactCmPerYear} cm/yr
            </div>
            <div className="text-[10px] text-slate-400 font-sans">{rechargePondEnabled ? 'Aquifer Restored' : 'Depletion Warning'}</div>
          </div>

          {/* Loop 5: Hoekstra Water Footprint */}
          <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 font-sans text-[11px] flex items-center justify-between">
              <span>💧 Water Footprint</span>
              <span className="text-sky-400 font-sans">Hoekstra 2011</span>
            </div>
            <div className="text-lg font-bold text-sky-400 mt-1">1,240 m³/t</div>
            <div className="text-[10px] text-slate-400 font-sans">Green (Rain): 68% • Blue: 24%</div>
          </div>

          {/* Loop 6: Hall EROI & Energy */}
          <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 font-sans text-[11px] flex items-center justify-between">
              <span>⚡ EROI (Energy)</span>
              <span className="text-purple-400 font-sans">Hall 2014</span>
            </div>
            <div className="text-lg font-bold text-purple-400 mt-1">4.2x</div>
            <div className="text-[10px] text-slate-400 font-sans">Energy-Positive Ecosystem</div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          15-YEAR BANKABLE DISCOUNTED CASH FLOW (DCF) SUMMARY & SPREADSHEET
         ═══════════════════════════════════════════════════════════════ */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-base text-slate-900 font-outfit">
                15-Year Bankable Discounted Cash Flow (DCF) & Investment Appraisal
              </h4>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              Calculated using standard 10% and 12% social discount rates for multilateral bankability (World Bank / ADB / ADBL).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV (Excel)</span>
            </button>
            <button
              onClick={() => setShowFullDcfTable(!showFullDcfTable)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs hover:bg-slate-800"
            >
              <span>{showFullDcfTable ? 'Hide 15-Yr Table' : 'Show 15-Yr Table'}</span>
              {showFullDcfTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs text-center">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-slate-500 font-sans text-xs">Initial Total CAPEX</div>
            <div className="text-lg font-bold text-slate-900 mt-1">NPR {(discountedCashFlow15Years.initialTotalCapexNpr / 100000).toFixed(2)} Lakh</div>
            <div className="text-[10px] text-slate-400 font-sans">Year 0 Assets</div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div className="text-emerald-800 font-sans text-xs">Net Present Value (NPV)</div>
            <div className="text-lg font-bold text-emerald-950 mt-1">NPR {(discountedCashFlow15Years.netPresentValueNpr10Pct / 100000).toFixed(2)} Lakh</div>
            <div className="text-[10px] text-emerald-700 font-sans">@ 10% Discount</div>
          </div>

          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <div className="text-blue-800 font-sans text-xs">Economic IRR (EIRR)</div>
            <div className="text-xl font-extrabold text-blue-950 mt-1">{discountedCashFlow15Years.economicInternalRateOfReturnEIRR}%</div>
            <div className="text-[10px] text-blue-700 font-sans">Benchmark: &gt; 12%</div>
          </div>

          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
            <div className="text-purple-800 font-sans text-xs">Benefit-Cost Ratio (BCR)</div>
            <div className="text-xl font-extrabold text-purple-950 mt-1">{discountedCashFlow15Years.benefitCostRatioBCR}x</div>
            <div className="text-[10px] text-purple-700 font-sans">High Commercial Viability</div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 col-span-2 sm:col-span-1">
            <div className="text-amber-800 font-sans text-xs">Payback Period</div>
            <div className="text-xl font-extrabold text-amber-950 mt-1">{discountedCashFlow15Years.paybackPeriodYears} <span className="text-xs font-normal">Years</span></div>
            <div className="text-[10px] text-amber-700 font-sans">Rapid Capital Amortization</div>
          </div>
        </div>

        {/* 15-Year Interactive DCF Table (Collapsible) */}
        {showFullDcfTable && (
          <div className="overflow-x-auto border rounded-xl border-slate-200 pt-1">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-sans">
                <tr>
                  <th className="p-2.5 text-center">Year</th>
                  <th className="p-2.5 text-right">CAPEX (NPR)</th>
                  <th className="p-2.5 text-right">Gross Revenue (NPR)</th>
                  <th className="p-2.5 text-right">OPEX (NPR)</th>
                  <th className="p-2.5 text-right">Net Cash Flow (NPR)</th>
                  <th className="p-2.5 text-right">Discounted @ 10%</th>
                  <th className="p-2.5 text-right">Cumulative Flow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {discountedCashFlow15Years.cashFlowSchedule.map((c) => (
                  <tr key={c.year} className={`hover:bg-slate-50 ${c.year === 0 ? 'bg-slate-50/50 font-bold' : ''}`}>
                    <td className="p-2.5 text-center font-bold font-sans">Yr {c.year}</td>
                    <td className="p-2.5 text-right text-rose-700">{c.capexNpr > 0 ? `-${c.capexNpr.toLocaleString()}` : '-'}</td>
                    <td className="p-2.5 text-right text-slate-800">{c.grossRevenueNpr > 0 ? c.grossRevenueNpr.toLocaleString() : '-'}</td>
                    <td className="p-2.5 text-right text-slate-500">{c.opexNpr > 0 ? `-${c.opexNpr.toLocaleString()}` : '-'}</td>
                    <td className={`p-2.5 text-right font-bold ${c.netCashFlowNpr >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {c.netCashFlowNpr.toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right text-blue-700">{c.discountedCashFlow10Pct.toLocaleString()}</td>
                    <td className={`p-2.5 text-right font-bold ${c.cumulativeCashFlowNpr >= 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {c.cumulativeCashFlowNpr.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
