import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AssessmentData {
  // Tabular Clinical Data
  fullName?: string;
  age?: number | string;
  height?: number | string;
  weight?: number | string;
  waistCircumference?: number | string;
  armCircumference?: number | string;
  gender?: string;
  
  // Medical & Family History
  familyHistory?: boolean | string;
  familyCondition?: string;
  familyRelationship?: string;
  hasDiabetes?: boolean | string;
  diabetesType?: string;
  otherConditions?: string;
  currentMedication?: string;

  // Lifestyle
  educationLevel?: string;
  socialLife?: string;
  activityLevel?: string;
  sleepHours?: number | string;
  smoking?: string;
  alcohol?: string;

  // Labs
  hba1c?: number | string;
  fastingGlucose?: number | string;
  systolicBP?: number | string;
  diastolicBP?: number | string;
  totalCholesterol?: number | string;
  labFile?: File | null;
  
  // ML Modality Files
  retinaImageFile: File | null;
  skinImageFile: File | null;
  genomicFile?: File | null;
  genomicsCsvFile: File | null;
  
  retinaImagePreviewUrl?: string | null;
  skinImagePreviewUrl?: string | null;

  [key: string]: any;
}

interface AssessmentStore {
  data: AssessmentData;
  currentStep: number;
  totalSteps: number;
  updateData: (newData: Partial<AssessmentData>) => void;
  resetData: () => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const initialData: AssessmentData = {
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
      currentStep: 1,
      totalSteps: 5, 
      
      updateData: (newData) => 
        set((state) => ({ data: { ...state.data, ...newData } })),
        
      resetData: () => 
        set({ data: initialData, currentStep: 1 }),
        
      setStep: (step) => 
        set({ currentStep: step }),
        
      nextStep: () => 
        set((state) => ({ currentStep: Math.min(state.currentStep + 1, state.totalSteps) })),
        
      prevStep: () => 
        set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
    }),
    {
      name: 'glucolens-assessment-storage',
      partialize: (state) => {
        const { 
          retinaImageFile, 
          skinImageFile, 
          genomicsCsvFile, 
          genomicFile,
          labFile,
          ...persistedData 
        } = state.data;
        return { ...state, data: persistedData };
      },
    }
  )
);