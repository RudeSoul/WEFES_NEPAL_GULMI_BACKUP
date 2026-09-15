import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { District, Crop, WEFESOutput, WEFESPillar } from '@wefes/shared-types';
import { db } from '@wefes/database';
import { Header, InputModal } from './components/common';
import { DistrictMap } from './features/map';
import { DistrictDetail } from './features/palika';
import { AnalysisDashboard } from './features/nexus';
import { ScenarioSimulator } from './features/simulator';
import { ScientificDossierScreen } from './features/scientific-dossier';
import { ResearchSandboxScreen } from './features/research-sandbox';
import { ROUTES } from './routes/paths';

function PalikaRouteWrapper({
  district,
  selectedPalikaName,
  onSelectPalika,
  onSelectCrop,
  onBackToMap,
  climateDataset,
}: {
  district: District;
  selectedPalikaName: string | null;
  onSelectPalika: (pName: string) => void;
  onSelectCrop: (crop: Crop) => void;
  onBackToMap: () => void;
  climateDataset: any;
}) {
  const { palikaName } = useParams<{ palikaName?: string }>();
  const effectivePalikaName = palikaName ? decodeURIComponent(palikaName) : (selectedPalikaName || 'Resunga');

  useEffect(() => {
    if (palikaName && decodeURIComponent(palikaName) !== selectedPalikaName) {
      onSelectPalika(decodeURIComponent(palikaName));
    }
  }, [palikaName, selectedPalikaName, onSelectPalika]);

  return (
    <DistrictDetail
      district={district}
      initialPalikaName={effectivePalikaName}
      onSelectPalika={onSelectPalika}
      onSelectCrop={onSelectCrop}
      onBackToMap={onBackToMap}
      climateDataset={climateDataset}
    />
  );
}

export function App() {
  const navigate = useNavigate();
  const [selectedPillar, setSelectedPillar] = useState<WEFESPillar>('water');
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(() => {
    return db.getDistrictById('gulmi') || null;
  });
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [selectedMapCropId, setSelectedMapCropId] = useState<string | null>(null);
  const [subFilters, setSubFilters] = useState<Record<string, string>>({});
  const [isInputModalOpen, setIsInputModalOpen] = useState<boolean>(false);
  const [analysisOutput, setAnalysisOutput] = useState<WEFESOutput | null>(null);
  const [climateDataset, setClimateDataset] = useState<any>(null);
  const [selectedPalikaName, setSelectedPalikaName] = useState<string | null>(null);

  // Pre-fetch the 39-year MERRA-2 gridded monthly climate dataset once at root level
  useEffect(() => {
    fetch('/geojson/gulmi-climate-monthly.json')
      .then(res => res.json())
      .then(data => setClimateDataset(data))
      .catch(err => console.warn('Gulmi MERRA-2 Climatology pre-fetch warning:', err));
  }, []);

  const handleSelectDistrictFromMap = (district: District, palikaName?: string) => {
    setSelectedDistrict(district);
    const pName = palikaName || 'Resunga';
    setSelectedPalikaName(pName);
    navigate(`/palikas/${encodeURIComponent(pName)}`);
  };

  const handleSelectCropFromMatrix = (crop: Crop) => {
    setSelectedCrop(crop);
    setIsInputModalOpen(true);
  };

  const handleRunAnalysis = (output: WEFESOutput) => {
    setAnalysisOutput(output);
    setIsInputModalOpen(false);
    navigate(ROUTES.ANALYSIS);
  };

  const handleSubFilterChange = (filters: Record<string, string>) => {
    setSubFilters(prev => ({ ...prev, ...filters }));
    if (filters.crop !== undefined) {
      setSelectedMapCropId(filters.crop || null);
    }
    if (filters.foodOverlayType !== undefined && filters.foodOverlayType !== 'crop_suitability') {
      setSelectedMapCropId(null);
    }
  };

  const handlePillarChange = (p: WEFESPillar) => {
    setSelectedPillar(p);
    if (p !== 'food') setSelectedMapCropId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      <Header
        selectedPillar={selectedPillar}
        setSelectedPillar={handlePillarChange}
        selectedDistrictName={selectedDistrict?.name}
        selectedCropName={selectedCrop?.name}
        selectedPalikaName={selectedPalikaName}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        <Routes>
          <Route
            path={ROUTES.HOME}
            element={
              <DistrictMap
                onSelectDistrict={handleSelectDistrictFromMap}
                selectedDistrict={selectedDistrict}
                selectedPillar={selectedPillar}
                setSelectedPillar={handlePillarChange}
                selectedMapCropId={selectedMapCropId}
                subFilters={subFilters}
                onSubFilterChange={handleSubFilterChange}
                climateDataset={climateDataset}
              />
            }
          />
          <Route
            path={ROUTES.MAP}
            element={
              <DistrictMap
                onSelectDistrict={handleSelectDistrictFromMap}
                selectedDistrict={selectedDistrict}
                selectedPillar={selectedPillar}
                setSelectedPillar={handlePillarChange}
                selectedMapCropId={selectedMapCropId}
                subFilters={subFilters}
                onSubFilterChange={handleSubFilterChange}
                climateDataset={climateDataset}
              />
            }
          />

          <Route
            path={ROUTES.PALIKAS}
            element={
              selectedDistrict ? (
                <PalikaRouteWrapper
                  district={selectedDistrict}
                  selectedPalikaName={selectedPalikaName}
                  onSelectPalika={setSelectedPalikaName}
                  onSelectCrop={handleSelectCropFromMatrix}
                  onBackToMap={() => navigate(ROUTES.MAP)}
                  climateDataset={climateDataset}
                />
              ) : (
                <Navigate to={ROUTES.MAP} replace />
              )
            }
          />

          <Route
            path={ROUTES.PALIKA_DETAIL}
            element={
              selectedDistrict ? (
                <PalikaRouteWrapper
                  district={selectedDistrict}
                  selectedPalikaName={selectedPalikaName}
                  onSelectPalika={setSelectedPalikaName}
                  onSelectCrop={handleSelectCropFromMatrix}
                  onBackToMap={() => navigate(ROUTES.MAP)}
                  climateDataset={climateDataset}
                />
              ) : (
                <Navigate to={ROUTES.MAP} replace />
              )
            }
          />

          <Route
            path={ROUTES.ANALYSIS}
            element={
              analysisOutput ? (
                <AnalysisDashboard
                  output={analysisOutput}
                  onOpenSimulator={() => navigate(ROUTES.SIMULATOR)}
                  onOpenDossier={() => navigate(ROUTES.DOSSIER)}
                  onBackToDistrict={() => navigate(selectedPalikaName ? `/palikas/${encodeURIComponent(selectedPalikaName)}` : ROUTES.PALIKAS)}
                  onBackToMap={() => navigate(ROUTES.MAP)}
                />
              ) : (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
                  <p className="text-slate-600 font-medium mb-4">No active analysis loaded. Please select a Palika and crop to run analysis.</p>
                  <button
                    onClick={() => navigate(ROUTES.MAP)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Go to District Map
                  </button>
                </div>
              )
            }
          />

          <Route
            path={ROUTES.SIMULATOR}
            element={
              analysisOutput ? (
                <ScenarioSimulator
                  baselineOutput={analysisOutput}
                  onBackToAnalysis={() => navigate(ROUTES.ANALYSIS)}
                  onBackToDistrict={() => navigate(selectedPalikaName ? `/palikas/${encodeURIComponent(selectedPalikaName)}` : ROUTES.PALIKAS)}
                  onBackToMap={() => navigate(ROUTES.MAP)}
                />
              ) : (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
                  <p className="text-slate-600 font-medium mb-4">Scenario Simulator requires an initial analysis baseline. Start from the map or a Palika profile.</p>
                  <button
                    onClick={() => navigate(ROUTES.MAP)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Go to District Map
                  </button>
                </div>
              )
            }
          />

          <Route
            path={ROUTES.DOSSIER}
            element={
              analysisOutput ? (
                <ScientificDossierScreen
                  output={analysisOutput}
                  onBackToAnalysis={() => navigate(ROUTES.ANALYSIS)}
                  onBackToDistrict={() => navigate(selectedPalikaName ? `/palikas/${encodeURIComponent(selectedPalikaName)}` : ROUTES.PALIKAS)}
                  onBackToMap={() => navigate(ROUTES.MAP)}
                  onOpenSimulator={() => navigate(ROUTES.SIMULATOR)}
                  onOpenResearchSandbox={() => navigate(ROUTES.RESEARCH_SANDBOX)}
                />
              ) : (
                <Navigate to={ROUTES.MAP} replace />
              )
            }
          />

          <Route
            path={ROUTES.RESEARCH_SANDBOX}
            element={
              <ResearchSandboxScreen
                output={analysisOutput}
                onBackToAnalysis={() => navigate(analysisOutput ? ROUTES.ANALYSIS : ROUTES.MAP)}
                onBackToMap={() => navigate(ROUTES.MAP)}
                onBackToDossier={analysisOutput ? () => navigate(ROUTES.DOSSIER) : undefined}
              />
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to={ROUTES.MAP} replace />} />
        </Routes>
      </main>

      {selectedDistrict && selectedCrop && (
        <InputModal
          district={selectedDistrict}
          crop={selectedCrop}
          isOpen={isInputModalOpen}
          onClose={() => setIsInputModalOpen(false)}
          onRunAnalysis={handleRunAnalysis}
        />
      )}

      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-slate-700">WEFES Nexus · Gulmi District (गुल्मी जिल्ला) • Lumbini Province, Nepal</span>
          <span className="text-[11px] text-slate-500 font-mono">
            Water · Energy · Food · Ecosystem · Socioeconomics
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;

