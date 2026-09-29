import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { db } from '@wefes/database';
import { ClimateDataset, Crop, District, WEFESOutput, WEFESPillar } from '@wefes/shared-types';

export interface NexusState {
  // --- 1. Pillar & Sub-filter State ---
  selectedPillar: WEFESPillar;
  subFilters: Record<string, string>;
  selectedMapCropId: string | null;
  setSelectedPillar: (pillar: WEFESPillar) => void;
  setSubFilter: (key: string, value: string) => void;
  setSubFilters: (filters: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  setSelectedMapCropId: (cropId: string | null) => void;
  resetFilters: () => void;

  // --- 2. Geographic & Administrative Selection ---
  selectedDistrict: District | null;
  selectedPalikaName: string | null;
  hoveredPalikaName: string | null;
  setSelectedDistrict: (district: District | null) => void;
  setSelectedPalikaName: (name: string | null) => void;
  setHoveredPalikaName: (name: string | null) => void;

  // --- 3. Analysis & Modeling Flow ---
  selectedCrop: Crop | null;
  analysisOutput: WEFESOutput | null;
  isInputModalOpen: boolean;
  setSelectedCrop: (crop: Crop | null) => void;
  setAnalysisOutput: (output: WEFESOutput | null) => void;
  setIsInputModalOpen: (isOpen: boolean) => void;
  openAnalysisModal: (crop: Crop) => void;
  closeAnalysisModal: () => void;

  // --- 4. User Preferences & Map Visualization Settings ---
  basemap: 'voyager' | 'satellite' | 'terrain';
  lang: 'en' | 'np';
  showContours: boolean;
  showPalikaLabels: boolean;
  setBasemap: (basemap: 'voyager' | 'satellite' | 'terrain') => void;
  setLang: (lang: 'en' | 'np') => void;
  setShowContours: (show: boolean | ((prev: boolean) => boolean)) => void;
  setShowPalikaLabels: (show: boolean | ((prev: boolean) => boolean)) => void;

  // --- 5. Climate Telemetry & Spatial Cache ---
  climateDataset: ClimateDataset | null;
  isClimateLoading: boolean;
  fetchClimateDataset: () => Promise<void>;
}

export const useNexusStore = create<NexusState>()(
  persist(
    (set, get) => ({
      // Defaults
      selectedPillar: 'water',
      subFilters: {},
      selectedMapCropId: null,

      setSelectedPillar: (pillar) => {
        set((state) => ({
          selectedPillar: pillar,
          selectedMapCropId: pillar !== 'food' ? null : state.selectedMapCropId,
        }));
      },

      setSubFilter: (key, value) => {
        set((state) => {
          const next = { ...state.subFilters, [key]: value };
          let nextCropId = state.selectedMapCropId;

          if (key === 'crop') {
            nextCropId = value || null;
          }
          if (key === 'foodOverlayType' && value !== 'crop_suitability') {
            nextCropId = null;
          }

          return { subFilters: next, selectedMapCropId: nextCropId };
        });
      },

      setSubFilters: (updater) => {
        set((state) => {
          const next = typeof updater === 'function' ? updater(state.subFilters) : { ...state.subFilters, ...updater };
          let nextCropId = state.selectedMapCropId;

          if (next.crop !== undefined) {
            nextCropId = next.crop || null;
          }
          if (next.foodOverlayType !== undefined && next.foodOverlayType !== 'crop_suitability') {
            nextCropId = null;
          }

          return { subFilters: next, selectedMapCropId: nextCropId };
        });
      },

      setSelectedMapCropId: (cropId) => set({ selectedMapCropId: cropId }),

      resetFilters: () => set({ subFilters: {}, selectedMapCropId: null }),

      // Geography
      selectedDistrict: db.getDistrictById('gulmi') || null,
      selectedPalikaName: 'Resunga',
      hoveredPalikaName: null,

      setSelectedDistrict: (district) => set({ selectedDistrict: district }),
      setSelectedPalikaName: (name) => set({ selectedPalikaName: name }),
      setHoveredPalikaName: (name) => set({ hoveredPalikaName: name }),

      // Analysis
      selectedCrop: null,
      analysisOutput: null,
      isInputModalOpen: false,

      setSelectedCrop: (crop) => set({ selectedCrop: crop }),
      setAnalysisOutput: (output) => set({ analysisOutput: output }),
      setIsInputModalOpen: (isOpen) => set({ isInputModalOpen: isOpen }),

      openAnalysisModal: (crop) => {
        set({ selectedCrop: crop, isInputModalOpen: true });
      },

      closeAnalysisModal: () => {
        set({ isInputModalOpen: false });
      },

      // Preferences
      basemap: 'voyager',
      lang: 'en',
      showContours: false,
      showPalikaLabels: true,

      setBasemap: (basemap) => set({ basemap }),
      setLang: (lang) => set({ lang }),
      setShowContours: (updater) =>
        set((state) => ({
          showContours: typeof updater === 'function' ? updater(state.showContours) : updater,
        })),
      setShowPalikaLabels: (updater) =>
        set((state) => ({
          showPalikaLabels: typeof updater === 'function' ? updater(state.showPalikaLabels) : updater,
        })),

      // Climate Cache
      climateDataset: null,
      isClimateLoading: false,

      fetchClimateDataset: async () => {
        if (get().climateDataset || get().isClimateLoading) return;
        set({ isClimateLoading: true });
        try {
          const res = await fetch('/geojson/gulmi-climate-monthly.json');
          if (res.ok) {
            const data = await res.json();
            set({ climateDataset: data, isClimateLoading: false });
          } else {
            set({ isClimateLoading: false });
          }
        } catch (err) {
          console.warn('Gulmi MERRA-2 Climatology fetch warning:', err);
          set({ isClimateLoading: false });
        }
      },
    }),
    {
      name: 'wefes-nexus-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      // Only persist user preferences and current view selections, not large in-memory caches or transient modal state
      partialize: (state) => ({
        selectedPillar: state.selectedPillar,
        subFilters: state.subFilters,
        selectedMapCropId: state.selectedMapCropId,
        selectedPalikaName: state.selectedPalikaName,
        basemap: state.basemap,
        lang: state.lang,
        showContours: state.showContours,
        showPalikaLabels: state.showPalikaLabels,
      }),
    }
  )
);
