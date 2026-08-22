import React, { useState, useEffect } from 'react';
import { District, Crop, WEFESOutput, WEFESPillar } from '@wefes/shared-types';
import { db } from '@wefes/database';
import { Header } from './components/Header';
import { DistrictMap } from './components/DistrictMap';
import { DistrictDetail } from './components/DistrictDetail';
import { InputModal } from './components/InputModal';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { ScientificDossierScreen } from './components/ScientificDossierScreen';
import { ResearchSandboxScreen } from './components/ResearchSandboxScreen';
import { FloatingResearchLabTrigger } from './components/FloatingResearchLabTrigger';

export function App() {
  const [activeScreen, setActiveScreen] = useState<number>(1);
  const [previousScreen, setPreviousScreen] = useState<number>(1);
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

  // Pre-fetch the 39-year MERRA-2 gridded monthly climate dataset once at root level
  useEffect(() => {
    fetch('/geojson/nepal-climate-monthly.json')
      .then(res => res.json())
      .then(data => setClimateDataset(data))
      .catch(err => console.warn('MERRA-2 Climatology pre-fetch warning:', err));
  }, []);

  const handleSelectDistrictFromMap = (district: District) => {
    setSelectedDistrict(district);
    setActiveScreen(2);
  };

  const handleSelectCropFromMatrix = (crop: Crop) => {
    setSelectedCrop(crop);
    setIsInputModalOpen(true);
  };

  const handleRunAnalysis = (output: WEFESOutput) => {
    setAnalysisOutput(output);
    setIsInputModalOpen(false);
    setActiveScreen(4);
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
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        selectedPillar={selectedPillar}
        setSelectedPillar={handlePillarChange}
        selectedDistrictName={selectedDistrict?.name}
        selectedCropName={selectedCrop?.name}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {activeScreen === 1 && (
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
        )}

        {activeScreen === 2 && selectedDistrict && (
          <DistrictDetail
            district={selectedDistrict}
            onSelectCrop={handleSelectCropFromMatrix}
            onBackToMap={() => setActiveScreen(1)}
            climateDataset={climateDataset}
          />
        )}

        {activeScreen === 4 && analysisOutput && (
          <AnalysisDashboard
            output={analysisOutput}
            onOpenSimulator={() => setActiveScreen(5)}
            onOpenDossier={() => setActiveScreen(6)}
            onBackToDistrict={() => setActiveScreen(2)}
            onBackToMap={() => setActiveScreen(1)}
          />
        )}

        {activeScreen === 5 && analysisOutput && (
          <ScenarioSimulator
            baselineOutput={analysisOutput}
            onBackToAnalysis={() => setActiveScreen(4)}
            onBackToDistrict={() => setActiveScreen(2)}
            onBackToMap={() => setActiveScreen(1)}
          />
        )}

        {activeScreen === 6 && analysisOutput && (
          <ScientificDossierScreen
            output={analysisOutput}
            onBackToAnalysis={() => setActiveScreen(4)}
            onBackToDistrict={() => setActiveScreen(2)}
            onBackToMap={() => setActiveScreen(1)}
            onOpenSimulator={() => setActiveScreen(5)}
            onOpenResearchSandbox={() => setActiveScreen(7)}
          />
        )}

        {activeScreen === 7 && (
          <ResearchSandboxScreen
            output={analysisOutput}
            onBackToAnalysis={() => setActiveScreen(previousScreen === 7 ? (analysisOutput ? 4 : 1) : previousScreen)}
            onBackToMap={() => setActiveScreen(1)}
            onBackToDossier={analysisOutput ? () => setActiveScreen(6) : undefined}
          />
        )}
      </main>

      {/* Cool Floating Research Sandbox Trigger */}
      <FloatingResearchLabTrigger
        activeScreen={activeScreen}
        onOpenResearchLab={() => {
          setPreviousScreen(activeScreen);
          setActiveScreen(7);
        }}
        onExitResearchLab={() => {
          setActiveScreen(previousScreen === 7 ? 1 : previousScreen);
        }}
      />

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
