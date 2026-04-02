import api from './api';

export const assessmentService = {
  
  /**
   * Evaluates tabular patient data against the primary ML model.
   * Standard JSON payload.
   */
  predictTabular: async (payload: Record<string, any>) => {
    const response = await api.post('/predict/tabular', payload);
    return response.data;
  },

  /**
   * Uploads an image to the Retina ML model for DR prediction.
   * @param imageFile - The raw JavaScript File object from the file input.
   * @param patientKey - Optional identifier for tracking.
   */
  predictRetina: async (imageFile: File, patientKey?: string) => {
    const formData = new FormData();
    // The backend OpenAPI schema explicitly requires the field name 'file'
    formData.append('file', imageFile);
    
    if (patientKey) {
      formData.append('patient_key', patientKey);
    }

    // Override the default 'application/json' header for this specific request
    const response = await api.post('/retina/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Uploads an image to the Skin ML model for dermatological prediction.
   * @param imageFile - The raw JavaScript File object.
   */
  predictSkin: async (imageFile: File) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await api.post('/skin/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Uploads data to the complex Fusion endpoint, combining modalities.
   * @param tabularPayload - A stringified JSON object of the patient's vitals/history.
   * @param retinaFile - (Optional) The retina image File.
   * @param skinFile - (Optional) The skin image File.
   */
  predictFusion: async (tabularPayload: string, retinaFile?: File | null, skinFile?: File | null) => {
    const formData = new FormData();
    
    // The backend schema expects the tabular data as a stringified string, NOT a JSON object
    formData.append('payload', tabularPayload);

    if (retinaFile) {
      formData.append('retina', retinaFile);
    }
    if (skinFile) {
      formData.append('skin', skinFile);
    }

    const response = await api.post('/fusion/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  /**
   * Uploads a CSV to the Genomics model.
   */
  predictGenomics: async (payload: string, csvFile?: File | null, patientKey?: string) => {
    const formData = new FormData();
    // Use 'payload' as a string to match the complex multipart schema
    formData.append('payload', payload);
    
    if (csvFile) {
      // Backend expects 'row_csv' for the genomic file
      formData.append('row_csv', csvFile);
    }
    if (patientKey) {
      formData.append('patient_key', patientKey);
    }

    const response = await api.post('/genomics/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};