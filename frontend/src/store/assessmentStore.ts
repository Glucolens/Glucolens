import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Expand your existing AssessmentData interface
export interface AssessmentData {
  // ... your existing tabular fields (fullName, age, etc.) ...
  
  // --- ML Modality Files ---
  // We store the raw File objects here so they are ready for the FormData construction
  retinaImageFile: File | null;
  skinImageFile: File | null;
  genomicsCsvFile: File | null;
  
  // (Optional) You can keep the preview URLs if you are using them to display thumbnails in the UI
  retinaImagePreviewUrl?: string | null;
  skinImagePreviewUrl?: string | null;
}

interface AssessmentStore {
  data: AssessmentData;
  updateData: (newData: Partial<AssessmentData>) => void;
  resetData: () => void;
}

const initialData: AssessmentData = {
  // ... your existing initial tabular data ...
  retinaImageFile: null,
  skinImageFile: null,
  genomicsCsvFile: null,
  retinaImagePreviewUrl: null,
  skinImagePreviewUrl: null,
};

export const useAssessmentStore = create<AssessmentStore>()(
  persist(
    (set) => ({
      data: initialData,
      updateData: (newData) => 
        set((state) => ({ data: { ...state.data, ...newData } })),
      resetData: () => set({ data: initialData }),
    }),
    {
      name: 'glucolens-assessment-storage',
      // CRITICAL STEP: File objects cause JSON.stringify to fail or return empty objects {}.
      // We must exclude the File objects from local storage persistence. 
      // If the user refreshes the page, they will need to re-upload the images, 
      // but their typed text data will be saved safely.
      partialize: (state) => {
        const { 
          retinaImageFile, 
          skinImageFile, 
          genomicsCsvFile, 
          ...persistedData 
        } = state.data;
        
        return { 
          ...state, 
          data: persistedData 
        };
      },
    }
  )
);