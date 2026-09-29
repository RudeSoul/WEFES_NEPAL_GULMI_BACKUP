import { describe, it, expect, beforeEach } from 'vitest';
import { useNexusStore } from '../store/nexusStore';

describe('useNexusStore (Zustand State Management)', () => {
  beforeEach(() => {
    // Reset store to known baseline before each test
    useNexusStore.setState({
      selectedPillar: 'water',
      subFilters: {},
      selectedMapCropId: null,
      selectedPalikaName: 'Resunga',
      hoveredPalikaName: null,
      selectedCrop: null,
      analysisOutput: null,
      isInputModalOpen: false,
      basemap: 'voyager',
      lang: 'en',
      showContours: false,
      showPalikaLabels: true,
      climateDataset: null,
      isClimateLoading: false,
    });
  });

  it('initializes with expected default values', () => {
    const state = useNexusStore.getState();
    expect(state.selectedPillar).toBe('water');
    expect(state.selectedPalikaName).toBe('Resunga');
    expect(state.subFilters).toEqual({});
    expect(state.isInputModalOpen).toBe(false);
    expect(state.basemap).toBe('voyager');
  });

  it('updates selected pillar and clears crop when switching away from food', () => {
    useNexusStore.getState().setSelectedPillar('food');
    useNexusStore.getState().setSelectedMapCropId('coffee');
    expect(useNexusStore.getState().selectedPillar).toBe('food');
    expect(useNexusStore.getState().selectedMapCropId).toBe('coffee');

    // Switch to water
    useNexusStore.getState().setSelectedPillar('water');
    expect(useNexusStore.getState().selectedPillar).toBe('water');
    expect(useNexusStore.getState().selectedMapCropId).toBeNull();
  });

  it('handles subfilter changes and synchronized crop selection', () => {
    useNexusStore.getState().setSubFilter('crop', 'large_cardamom');
    expect(useNexusStore.getState().subFilters.crop).toBe('large_cardamom');
    expect(useNexusStore.getState().selectedMapCropId).toBe('large_cardamom');

    useNexusStore.getState().setSubFilter('foodOverlayType', 'land_typology');
    expect(useNexusStore.getState().selectedMapCropId).toBeNull();
  });

  it('manages modal open/close flow and crop assignment', () => {
    const mockCrop: any = {
      id: 'ginger',
      name: 'Ginger (अदुवा)',
      defaultUnit: 'kg',
      baseUnitName: 'kg',
    };

    useNexusStore.getState().openAnalysisModal(mockCrop);
    expect(useNexusStore.getState().isInputModalOpen).toBe(true);
    expect(useNexusStore.getState().selectedCrop?.id).toBe('ginger');

    useNexusStore.getState().closeAnalysisModal();
    expect(useNexusStore.getState().isInputModalOpen).toBe(false);
  });

  it('updates map and user display preferences', () => {
    useNexusStore.getState().setBasemap('satellite');
    useNexusStore.getState().setLang('np');
    useNexusStore.getState().setShowContours(true);
    useNexusStore.getState().setShowPalikaLabels(false);

    const state = useNexusStore.getState();
    expect(state.basemap).toBe('satellite');
    expect(state.lang).toBe('np');
    expect(state.showContours).toBe(true);
    expect(state.showPalikaLabels).toBe(false);
  });
});
