import { useState } from 'react';
import { useAssessmentStore } from '../store/assessmentStore';
import type { AssessmentData } from '../store/assessmentStore'; 
import { assessmentService } from '../services/assessmentService';

/**
 * Maps frontend Zustand state to the exact feature names expected by the ML backend.
 * CRITICAL: Update these keys to match your Python model's required features perfectly.
 */
const formatTabularPayload = (data: AssessmentData): Record<string, any> => {
  return {
    age: data.age,
    bmi: data.bmi,
    // Example mappings - adjust these to your actual Zustand fields and ML feature names:
    // hba1c: data.hba1c,
    // fasting_glucose: data.fastingGlucose,
    // systolic_bp: data.systolicBP,
    // diastolic_bp: data.diastolicBP,
    // gender: data.gender === 'male' ? 1 : 0, 
  };
};

export function useSubmitAssessment() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { data } = useAssessmentStore();

  const submitAssessment = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // 1. Format the tabular data
      const tabularPayload = formatTabularPayload(data);
      let predictionResult;

      // 2. Intelligent Routing based on modalities present
      if (data.retinaImageFile || data.skinImageFile) {
         // FUSION MODEL: Hit /api/fusion/predict
         // The service takes the tabular payload as a stringified JSON string
         predictionResult = await assessmentService.predictFusion(
           JSON.stringify(tabularPayload),
           data.retinaImageFile,
           data.skinImageFile
         );
      } else {
         // TABULAR ONLY: Hit /api/predict/tabular
         // The service takes the standard JSON object
         predictionResult = await assessmentService.predictTabular(tabularPayload);
      }

      // 3. Save and return results
      setResults(predictionResult);
      return predictionResult;

    } catch (err: any) {
      console.error("Diagnostic Prediction Failed:", err);
      // Extract detail from FastAPI validation errors if available
      setError(err.response?.data?.detail || "An error occurred during AI analysis.");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitAssessment, isSubmitting, results, error };
}