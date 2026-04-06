import { useState } from 'react';
import { useAssessmentStore } from '../store/assessmentStore';
import type { AssessmentData } from '../store/assessmentStore'; 
import { assessmentService } from '../services/assessmentService';

const formatTabularPayload = (data: AssessmentData): Record<string, any> => {
  // Safe BMI Calculation
  let calculatedBmi = null;
  const heightInMeters = Number(data.height) / 100;
  if (heightInMeters > 0 && Number(data.weight) > 0) {
    calculatedBmi = Number(data.weight) / (heightInMeters * heightInMeters);
  }

  return {
    age: Number(data.age),
    bmi: calculatedBmi,
    // Un-commented and safely cast to numbers!
    hba1c: Number(data.hba1c) || null,
    fasting_glucose: Number(data.fastingGlucose) || null,
    systolic_bp: Number(data.systolicBP) || null,
    diastolic_bp: Number(data.diastolicBP) || null,
    gender: data.gender === 'male' ? 1 : 0, 
    family_history: data.familyHistory === true ? 1 : 0,
  };
};

export function useSubmitAssessment() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data } = useAssessmentStore();

  const submitAssessment = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const tabularPayload = formatTabularPayload(data);
      let predictionResult;

      if (data.retinaImageFile || data.skinImageFile) {
         predictionResult = await assessmentService.predictFusion(
           JSON.stringify(tabularPayload),
           data.retinaImageFile,
           data.skinImageFile
         );
      } else {
         predictionResult = await assessmentService.predictTabular(tabularPayload);
      }
      return predictionResult;
    } catch (err: any) {
      console.error("Diagnostic Prediction Failed:", err);
      setError(err.response?.data?.detail || "An error occurred during AI analysis.");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitAssessment, isSubmitting, error };
}