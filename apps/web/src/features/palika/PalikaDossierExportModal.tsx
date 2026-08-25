import React from 'react';
import { createPortal } from 'react-dom';
import { DistrictPalika } from '../../data/districtPalikaAssets';
import { Printer, Download, X, Mountain, CloudRain, Thermometer, Sparkles, Sprout, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

interface PalikaDossierExportModalProps {
  palika: DistrictPalika;
  isOpen: boolean;
  onClose: () => void;
  lang?: 'en' | 'np';
}

const GULMI_PALIKA_NEPALI: Record<string, string> = {
  'Resunga': 'रेसुङ्गा',
  'Musikot': 'मुसिकोट',
  'Ruru': 'रुरुक्षेत्र',
  'Satyawati': 'सत्यवती',
  'Kaligandaki': 'कालीगण्डकी',
  'Chandrakot': 'चन्द्रकोट',
  'Chatrakot': 'छत्रकोट',
  'Gulmidarbar': 'गुल्मीदरबार',
  'Dhurkot': 'धुर्कोट',
  'Isma': 'इस्मा',
  'Malika': 'मालिका',
  'Madane': 'मदाने',
};

export const PalikaDossierExportModal: React.FC<PalikaDossierExportModalProps> = ({
  palika,
  isOpen,
  onClose,
  lang = 'en'
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-md overflow-y-auto animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                Official Municipal Decision Support Brief
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-outfit">
                {palika.name} ({GULMI_PALIKA_NEPALI[palika.name] || ''}) — Agro-Ecological Dossier
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 font-sans text-xs print:p-0">
          {/* Executive Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="text-slate-500 font-semibold uppercase text-[10px]">Local Body Type</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{palika.unitType}</div>
            </div>
            <div>
              <div className="text-slate-500 font-semibold uppercase text-[10px]">Mean Elevation</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{palika.elevation}m ASL</div>
            </div>
            <div>
              <div className="text-slate-500 font-semibold uppercase text-[10px]">Annual Precipitation</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{palika.rainfallMm} mm/year</div>
            </div>
            <div>
              <div className="text-slate-500 font-semibold uppercase text-[10px]">Soil Benchmark</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">pH {palika.soilPh}</div>
            </div>
          </div>

          {/* Top Feasible Crops Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 font-outfit uppercase tracking-wider">
              <Sprout className="w-4 h-4 text-emerald-600" />
              Verified Agro-Ecological Crop Feasibility Rankings
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 text-[11px] font-semibold border-b border-slate-200">
                    <th className="p-2.5">Crop Name</th>
                    <th className="p-2.5">Season</th>
                    <th className="p-2.5">Suitability Score</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Key Limiting Factor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {palika.feasibleCrops?.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{c.emoji}</span>
                        <span>{c.cropName}</span>
                        {c.nepaliName && <span className="text-slate-500 font-normal">({c.nepaliName})</span>}
                      </td>
                      <td className="p-2.5 text-slate-600">{c.seasonNepali || c.season || 'Annual'}</td>
                      <td className="p-2.5 font-mono font-bold text-emerald-700">{c.score}%</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          c.score >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.rating}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-500">{c.limitingFactor || 'None'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strategic Planning Recommendations */}
          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
            <h5 className="font-bold text-emerald-950 font-outfit uppercase tracking-wider text-xs">
              🏛️ Key Municipal Policy Recommendations for {palika.name}:
            </h5>
            <ul className="space-y-1.5 text-emerald-900 list-disc list-inside leading-relaxed text-[11px]">
              <li>
                <strong>Prioritize Signature Cash Crop Clusters</strong>: Allocate municipal agriculture grants for nursery distribution of certified {palika.feasibleCrops?.[0]?.cropName || 'specialty crops'}.
              </li>
              <li>
                <strong>Soil Health Interventions</strong>: {palika.soilPh < 6.2 ? 'Promote agricultural lime (चुन) subsidies to rectify high-slope soil acidity.' : 'Maintain soil organic carbon via balanced compost and bio-fertilizer programs.'}
              </li>
              <li>
                <strong>Irrigation Resilience</strong>: Target lift irrigation schemes from river corridors and conservation water ponds on terraced slopes.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>Generated by WEFES Nexus Decision Platform • Government of Nepal / Gulmi District</div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
