import React, { useState, useMemo } from 'react';

interface FinancialDcfChartProps {
  districtName: string;
  cropName: string;
  initialCapexNpr: number;
  netPresentValueNpr10Pct: number;
  economicInternalRateOfReturnEIRR: number;
  benefitCostRatioBCR: number;
  /** Unused — payback is computed dynamically from real cashflow schedule */
  paybackPeriodYears?: number;
}

interface CropLifecycleProfile {
  categoryLabel: string;
  getYieldFactor: (yr: number) => number;
  getPhaseDescription: (yr: number) => string;
}

function getCropLifecycleProfile(cropName: string): CropLifecycleProfile {
  const norm = cropName.toLowerCase();

  if (norm.includes('timber') || norm.includes('sal')) {
    return {
      categoryLabel: 'Long-Rotation Forestry (15-Yr Biomass Schedule)',
      getYieldFactor: (yr) => {
        if (yr === 1) return 0.05;
        if (yr === 2) return 0.12;
        if (yr === 3) return 0.22;
        if (yr === 4) return 0.38;
        if (yr === 5) return 0.55;
        if (yr === 6) return 0.75;
        if (yr === 7) return 1.25; // commercial thinning dividend
        if (yr === 8) return 0.85;
        if (yr <= 11) return 1.05;
        return 1.30; // mature standing volume
      },
      getPhaseDescription: (yr) => {
        if (yr <= 2) return 'Sapling Nursery & Plantation Establishment';
        if (yr <= 6) return 'Canopy Closure & Biomass Accumulation';
        if (yr === 7) return 'Commercial Intermediate Thinning Harvest';
        return 'Sustained Timber Volume Accumulation';
      },
    };
  }

  if (norm.includes('apple') || norm.includes('orange') || norm.includes('citrus')) {
    return {
      categoryLabel: 'Perennial Fruit Orchard (4-Yr Gestation J-Curve)',
      getYieldFactor: (yr) => {
        if (yr === 1) return 0.10; // sapling stage
        if (yr === 2) return 0.32; // vegetative branching
        if (yr === 3) return 0.65; // first commercial bearing
        if (yr === 4) return 0.92; // near full yield
        if (yr === 7) return 0.82; // canopy pruning & solar pump maintenance
        if (yr <= 11) return 1.08;
        return 1.15; // peak mature fruit load
      },
      getPhaseDescription: (yr) => {
        if (yr <= 2) return 'Orchard Root Establishment & Canopy Training';
        if (yr === 3) return 'First Commercial Bearing (Juvenile Crop)';
        if (yr === 7) return 'Mid-Life Canopy Pruning & Drip Maintenance';
        return 'Peak Mature Commercial Production';
      },
    };
  }

  if (norm.includes('coffee') || norm.includes('tea') || norm.includes('cardamom')) {
    return {
      categoryLabel: 'High-Value Agroforestry Bush (3-Yr Gestation S-Curve)',
      getYieldFactor: (yr) => {
        if (yr === 1) return 0.18; // transplant & shade canopy growth
        if (yr === 2) return 0.52; // secondary shoot development
        if (yr === 3) return 0.85; // first full commercial harvest
        if (yr === 4) return 1.02; // prime harvest
        if (yr === 8) return 0.86; // coppicing / shade tree thinning
        if (yr <= 12) return 1.10;
        return 1.14;
      },
      getPhaseDescription: (yr) => {
        if (yr === 1) return 'Nursery Transplant & Agroforestry Shade Setup';
        if (yr === 2) return 'Secondary Branching & Root Deepening';
        if (yr === 3) return 'Initial Commercial Flush Harvest';
        if (yr === 8) return 'Bush Rejuvenation & Shade Canopy Regulation';
        return 'Optimal Sustained Export-Grade Harvest';
      },
    };
  }

  if (norm.includes('banana')) {
    return {
      categoryLabel: 'Fast Perennial / Multi-Ratoon Cycle',
      getYieldFactor: (yr) => {
        if (yr === 1) return 0.65; // mother plant growth
        if (yr === 2) return 1.05; // 1st ratoon peak
        if (yr === 5 || yr === 10) return 0.78; // field renewal / sucker replanting
        return 1.08;
      },
      getPhaseDescription: (yr) => {
        if (yr === 1) return 'Primary Tissue-Culture Sucker Establishment';
        if (yr === 5 || yr === 10) return 'Ratoon Re-plantation & Soil Solarization';
        return 'Continuous Multi-Ratoon Commercial Harvest';
      },
    };
  }

  // Default: Annual Field Crops (Rice, Maize, Wheat, Potato, Ginger, Mustard, Lentil, Millet, Sugarcane)
  return {
    categoryLabel: 'Annual Cropping System (Adoption & Soil Building Ramp)',
    getYieldFactor: (yr) => {
      if (yr === 1) return 0.72; // adoption learning curve & micro-irrigation commissioning
      if (yr === 2) return 0.90; // full adoption of precision agronomy
      if (yr === 7) return 0.84; // solar pump inverter & drip emitter overhaul
      if (yr <= 6) return 1.00;
      return Math.min(1.18, 1.00 + (yr - 7) * 0.022); // biochar / organic fertility compounding
    },
    getPhaseDescription: (yr) => {
      if (yr === 1) return 'Farmer Adoption, Land Prep & Smart Drip Setup';
      if (yr === 2) return 'Full Agronomic Efficiency & Off-Take Integration';
      if (yr === 7) return 'Mid-Life Equipment Overhaul & Solar Servicing';
      return 'Mature Sustainable High-Efficiency Yield';
    },
  };
}

export const FinancialDcfChart: React.FC<FinancialDcfChartProps> = ({
  districtName,
  cropName,
  initialCapexNpr,
  netPresentValueNpr10Pct,
  economicInternalRateOfReturnEIRR,
  benefitCostRatioBCR,
}) => {
  const [hoveredYear, setHoveredYear] = useState<number>(5);
  const [viewMode, setViewMode] = useState<'discounted_dcf' | 'undiscounted_cashflow'>('discounted_dcf');

  const lifecycle = useMemo(() => getCropLifecycleProfile(cropName), [cropName]);

  // ── Build 15-Year Non-Linear DCF Schedule ──────────────────────────────────
  const years = useMemo(() => {
    const eirrDecimal = economicInternalRateOfReturnEIRR / 100;
    // Peak annual revenue benchmark
    const peakAnnualNet = initialCapexNpr * eirrDecimal;

    const rows: Array<{
      year: number;
      yieldFactor: number;
      phase: string;
      annualNominalCashNpr: number;
      cumulativeNominalNpr: number;
      annualDiscountedNpr: number;
      cumulativeDiscountedNpvNpr: number;
    }> = [];

    let cumNominal = -initialCapexNpr;
    let cumDiscounted = -initialCapexNpr;

    rows.push({
      year: 0,
      yieldFactor: 0,
      phase: 'Initial Capital Outlay (CAPEX)',
      annualNominalCashNpr: -initialCapexNpr,
      cumulativeNominalNpr: -initialCapexNpr,
      annualDiscountedNpr: -initialCapexNpr,
      cumulativeDiscountedNpvNpr: -initialCapexNpr,
    });

    for (let yr = 1; yr <= 15; yr++) {
      const factor = lifecycle.getYieldFactor(yr);
      const phase = lifecycle.getPhaseDescription(yr);

      // Annual nominal net cashflow shaped by crop gestation lifecycle
      const yrNominal = Math.round(peakAnnualNet * factor);
      // Discounted cashflow: PV = CF / (1 + 0.10)^yr
      const yrDiscounted = Math.round(yrNominal / Math.pow(1.10, yr));

      cumNominal += yrNominal;
      cumDiscounted += yrDiscounted;

      rows.push({
        year: yr,
        yieldFactor: factor,
        phase,
        annualNominalCashNpr: yrNominal,
        cumulativeNominalNpr: cumNominal,
        annualDiscountedNpr: yrDiscounted,
        cumulativeDiscountedNpvNpr: cumDiscounted,
      });
    }

    return rows;
  }, [economicInternalRateOfReturnEIRR, initialCapexNpr, lifecycle]);

  // ── Dynamic Payback Calculation based on active view mode ──────────────────
  const paybackPeriodYears = useMemo(() => {
    if (economicInternalRateOfReturnEIRR <= 0) return 'N/A';

    const targetKey = viewMode === 'discounted_dcf' ? 'cumulativeDiscountedNpvNpr' : 'cumulativeNominalNpr';
    const annualKey = viewMode === 'discounted_dcf' ? 'annualDiscountedNpr' : 'annualNominalCashNpr';

    for (let yr = 1; yr <= 15; yr++) {
      if (years[yr][targetKey] >= 0) {
        const prevCum = Math.abs(years[yr - 1][targetKey]);
        const currAnnual = years[yr][annualKey];
        return Number(((yr - 1) + (prevCum / Math.max(1, currAnnual))).toFixed(1));
      }
    }
    return '>15';
  }, [years, economicInternalRateOfReturnEIRR, viewMode]);

  const activeData = years[hoveredYear] ?? years[5];

  // ── SVG Coordinate Mapping ──────────────────────────────────────────────────
  const activeSeries = useMemo(() => {
    return years.map(y => viewMode === 'discounted_dcf' ? y.cumulativeDiscountedNpvNpr : y.cumulativeNominalNpr);
  }, [years, viewMode]);

  const minVal = Math.min(...activeSeries);
  const maxVal = Math.max(...activeSeries);
  const valRange = Math.max(1, maxVal - minVal);

  function toSvgY(val: number): number {
    // Range maps from 195 (bottom) to 25 (top)
    return Math.round(195 - ((val - minVal) / valRange) * 170);
  }

  function toSvgX(yr: number): number {
    // 16 points spread across x=60 to x=740
    return Math.round(60 + (yr / 15) * 680);
  }

  const zeroY = toSvgY(0);

  // Payback X coordinate
  const paybackX = typeof paybackPeriodYears === 'number'
    ? Math.round(60 + (paybackPeriodYears / 15) * 680)
    : null;

  // Build SVG path strings
  const linePoints = years.map(y => {
    const val = viewMode === 'discounted_dcf' ? y.cumulativeDiscountedNpvNpr : y.cumulativeNominalNpr;
    return `${toSvgX(y.year)},${toSvgY(val)}`;
  }).join(' L ');

  const areaPath = `M ${linePoints} L ${toSvgX(15)},${zeroY} L ${toSvgX(0)},${zeroY} Z`;

  // Secondary comparative line (the other mode, rendered as dashed line)
  const secondaryPoints = years.map(y => {
    const val = viewMode === 'discounted_dcf' ? y.cumulativeNominalNpr : y.cumulativeDiscountedNpvNpr;
    return `${toSvgX(y.year)},${toSvgY(val)}`;
  }).join(' L ');

  const isFeasible = economicInternalRateOfReturnEIRR > 0;
  const primaryColor = isFeasible ? '#10b981' : '#f43f5e';
  const areaColor = isFeasible ? '#10b981' : '#f43f5e';

  return (
    <div className="p-5 sm:p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-md space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              15-Year Non-Linear DCF Cashflow &amp; Sovereign Bankability
            </span>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              {lifecycle.categoryLabel}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            {cropName} · {districtName} — Displays non-linear gestation S-curves, mid-life maintenance cycles, and discounted capital recovery.
          </p>
        </div>

        {/* View Toggle & KPI Pill */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[11px] font-mono">
            <button
              onClick={() => setViewMode('discounted_dcf')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'discounted_dcf'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Discounted NPV (10% DCF)
            </button>
            <button
              onClick={() => setViewMode('undiscounted_cashflow')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'undiscounted_cashflow'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Undiscounted Cash Flow
            </button>
          </div>

          <span className={`px-2.5 py-1 rounded-lg border text-xs font-mono ${
            isFeasible
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
              : 'bg-rose-950 text-rose-300 border-rose-800'
          }`}>
            {isFeasible ? '⭐' : '⚠️'} EIRR: {economicInternalRateOfReturnEIRR}% · BCR: {benefitCostRatioBCR}x
          </span>
        </div>
      </div>

      {/* SVG Financial Area Chart */}
      <div className="w-full overflow-x-auto">
        <svg viewBox="0 0 780 230" className="w-full min-w-[650px] h-auto font-sans select-none">
          {/* Zero baseline */}
          <line x1="50" y1={zeroY} x2="750" y2={zeroY} stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="55" y={zeroY - 6} fill="#94a3b8" fontSize="9" fontFamily="monospace">
            Break-even Line (NPR 0)
          </text>

          {/* Secondary Comparative Line (Dashed Slate) */}
          <polyline
            points={secondaryPoints}
            fill="none"
            stroke="#475569"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Area fill */}
          <path d={areaPath} fill={areaColor} fillOpacity="0.15" />

          {/* Primary Curve Polyline */}
          <polyline
            points={linePoints}
            fill="none"
            stroke={primaryColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Payback Marker Line */}
          {paybackX !== null && typeof paybackPeriodYears === 'number' && (
            <>
              <line x1={paybackX} y1="18" x2={paybackX} y2="195" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
              <text x={paybackX + 4} y="32" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="monospace">
                Payback: {paybackPeriodYears} Yrs ({viewMode === 'discounted_dcf' ? 'NPV Breakeven' : 'Nominal Breakeven'})
              </text>
            </>
          )}

          {paybackPeriodYears === '>15' && (
            <text x="400" y="36" fill="#f43f5e" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              ⚠ Capital not recovered within 15-year DCF horizon
            </text>
          )}

          {paybackPeriodYears === 'N/A' && (
            <text x="400" y="36" fill="#f43f5e" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              ⚠ Negative EIRR — non-viable investment
            </text>
          )}

          {/* Interactive Year Dots */}
          {years.map((y) => {
            const val = viewMode === 'discounted_dcf' ? y.cumulativeDiscountedNpvNpr : y.cumulativeNominalNpr;
            const ptX = toSvgX(y.year);
            const ptY = toSvgY(val);
            const isHovered = hoveredYear === y.year;

            return (
              <g
                key={y.year}
                onMouseEnter={() => setHoveredYear(y.year)}
                onClick={() => setHoveredYear(y.year)}
                className="cursor-pointer"
              >
                <circle
                  cx={ptX}
                  cy={ptY}
                  r={isHovered ? 6.5 : 4}
                  fill={isHovered ? '#34d399' : primaryColor}
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
                <text
                  x={ptX}
                  y="218"
                  textAnchor="middle"
                  fill={isHovered ? '#34d399' : '#94a3b8'}
                  fontSize="9.5"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                  fontFamily="monospace"
                >
                  Yr{y.year}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Year Financial & Agronomic Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono pt-1">
        <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
            <span>Year {activeData.year} Status:</span>
            <span className="text-emerald-400 font-mono">{(activeData.yieldFactor * 100).toFixed(0)}% Capacity</span>
          </div>
          <div className="text-[11px] text-slate-300 font-sans mt-1 line-clamp-1 font-medium">
            {activeData.phase}
          </div>
        </div>

        <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700">
          <span className="text-slate-400 font-sans text-[11px] block">
            Yr {activeData.year} Cumulative {viewMode === 'discounted_dcf' ? 'NPV' : 'Cash'}:
          </span>
          <div className={`text-sm font-bold mt-0.5 ${
            (viewMode === 'discounted_dcf' ? activeData.cumulativeDiscountedNpvNpr : activeData.cumulativeNominalNpr) >= 0
              ? 'text-emerald-400'
              : 'text-rose-400'
          }`}>
            NPR {(
              (viewMode === 'discounted_dcf' ? activeData.cumulativeDiscountedNpvNpr : activeData.cumulativeNominalNpr) / 1000
            ).toLocaleString(undefined, { maximumFractionDigits: 0 })}k
          </div>
        </div>

        <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700">
          <span className="text-slate-400 font-sans text-[11px] block">
            Annual Net {viewMode === 'discounted_dcf' ? 'Discounted (PV)' : 'Nominal'}:
          </span>
          <div className="text-sm font-bold text-sky-400 mt-0.5">
            NPR {(
              (viewMode === 'discounted_dcf' ? activeData.annualDiscountedNpr : activeData.annualNominalCashNpr) / 1000
            ).toLocaleString(undefined, { maximumFractionDigits: 0 })}k / yr
          </div>
        </div>

        <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700">
          <span className="text-slate-400 font-sans text-[11px] block">
            Break-even Payback ({viewMode === 'discounted_dcf' ? '10% Discounted' : 'Nominal'}):
          </span>
          <div className={`text-sm font-bold mt-0.5 ${
            typeof paybackPeriodYears === 'number' ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {paybackPeriodYears} {typeof paybackPeriodYears === 'number' ? 'Years' : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

