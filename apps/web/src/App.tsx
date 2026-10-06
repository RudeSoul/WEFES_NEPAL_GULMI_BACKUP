import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import { Header, InputModal } from './components/common';
import { initializeRemoteIndicatorData } from './data/districtIndicatorAssets';
import { DistrictMap } from './features/map';
import { AnalysisDashboard } from './features/nexus';
import { DistrictDetail } from './features/palika';
import { ResearchSandboxScreen } from './features/research-sandbox';
import { ScientificDossierScreen } from './features/scientific-dossier';
import { ScenarioSimulator } from './features/simulator';
import { ROUTES } from './routes/paths';
import { useNexusStore } from './store';

export function App() {
  const { t } = useTranslation();
  // Zustand Store Selectors
  const fetchClimateDataset = useNexusStore((s) => s.fetchClimateDataset);

  // Pre-fetch climate dataset and remote indicators on bootstrap
  useEffect(() => {
    fetchClimateDataset();
    initializeRemoteIndicatorData();
  }, [fetchClimateDataset]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        <Routes>
          <Route path={ROUTES.HOME} element={<DistrictMap />} />
          <Route path={ROUTES.MAP} element={<DistrictMap />} />
          <Route path={ROUTES.PALIKAS} element={<DistrictDetail />} />
          <Route path={ROUTES.PALIKA_DETAIL} element={<DistrictDetail />} />
          <Route path={ROUTES.ANALYSIS} element={<AnalysisDashboard />} />
          <Route path={ROUTES.SIMULATOR} element={<ScenarioSimulator />} />
          <Route path={ROUTES.DOSSIER} element={<ScientificDossierScreen />} />
          <Route path={ROUTES.RESEARCH_SANDBOX} element={<ResearchSandboxScreen />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to={ROUTES.MAP} replace />} />
        </Routes>
      </main>

      <InputModal />

      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-slate-700">{t('footer.title')}</span>
          <span className="text-[11px] text-slate-500 font-mono">{t('footer.pillars')}</span>
        </div>
      </footer>
    </div>
  );
}
