import api from './api';
import { type AssessmentData } from '@/store/assessmentStore';

/**
 * Assessment Service
 * Connected to GlucoLens API 0.1.0 Prediction Endpoints
 */
export const assessmentService = {
  
  // Steps 1, 2, and 3 now resolve locally. Zustand handles the state!
  async submitAnthropometrics(data: Partial<AssessmentData>) {
    return Promise.resolve({ status: "saved_to_store" });
  },

  async submitLifestyle(data: Partial<AssessmentData>) {
    return Promise.resolve({ status: "saved_to_store" });
  },

  async uploadPhysicalSigns(data: Partial<AssessmentData>) {
    return Promise.resolve({ status: "saved_to_store" });
  },

  // The Grand Finale: Sending Tabular + Images to the Fusion Endpoint
  async runPrediction(data: Partial<AssessmentData>) {
    const formData = new FormData();
    
    // 1. Build the Tabular Payload (matching typical ML feature columns)
    const tabularPayload = {
      age: data.age,
      gender: data.gender,
      height: data.height,
      weight: data.weight,
      waist_circumference: data.waistCircumference,
      arm_circumference: data.armCircumference,
      family_history: data.familyHistory,
      has_diabetes: data.hasDiabetes,
      diabetes_type: data.diabetesType,
      education_level: data.educationLevel,
      social_life: data.socialLife,
      activity_level: data.activityLevel,
      sleep_hours: data.sleepHours,
      smoking: data.smoking,
      alcohol: data.alcohol,
      fasting_glucose: data.fastingGlucose,
      total_cholesterol: data.totalCholesterol,
      hba1c: data.hba1c,
      systolic_bp: data.systolicBP
    };

    // The Fusion endpoint expects 'payload' as a stringified JSON object
    formData.append('payload', JSON.stringify(tabularPayload));

    // 2. Append the Skin Image if available (we prioritize Acanthosis, fallback to Skin Tags)
    const skinImage = data.acanthosisImage || data.skinTagsImage;
    if (skinImage) {
      formData.append('skin', skinImage);
    }

    // (Note: 'retina' field is omitted here since the UI doesn't collect eye scans yet)

    const response = await api.post('/fusion/predict', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response.data;
  }
};