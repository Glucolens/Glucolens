/**
 * @file src/services/mockAdapter.ts
 * @description
 * This file implements the "Mock Mode" for the frontend.
 * It intercepts HTTP requests sent via the global Axios instance and returns
 * simulated responses. This allows frontend development to proceed independently
 * of backend availability.
 * * @note This file is ONLY active when import.meta.env.DEV is true or VITE_USE_MOCK is set.
 */

import MockAdapter from 'axios-mock-adapter';
import api from '@/services/api';

// Define the simulated user delay (in milliseconds) to mimic real network latency
const RESPONSE_DELAY = 800;

/**
 * Initialize the Mock Adapter on the 'api' axios instance.
 * We use { onNoMatch: "passthrough" } to allow un-mocked requests (like external APIs)
 * to still go through to the real internet if needed.
 */
const mock = new MockAdapter(api, { 
  delayResponse: RESPONSE_DELAY,
  onNoMatch: "passthrough" 
});

// ----------------------------------------------------------------------
// MOCK DATA CONSTANTS
// ----------------------------------------------------------------------

const MOCK_USER = {
  id: 'user_12345',
  name: 'Jean Pierre', // Personalized for the developer
  email: 'jp@glucolens.com',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JeanPierre',
  role: 'researcher'
};

const MOCK_TOKEN = {
  access_token: 'mock_jwt_token_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  expires_in: 3600, // 1 hour
  token_type: 'bearer'
};

// ----------------------------------------------------------------------
// ENDPOINTS
// ----------------------------------------------------------------------

/**
 * POST /auth/login
 * @returns {AuthResponse}
 */
mock.onPost('/auth/login').reply((config) => {
  console.info(`[MockAPI] 🟢 POST ${config.url}`, JSON.parse(config.data));
  
  // Simulate a successful login for ANY valid email/password combo
  return [200, {
    ...MOCK_TOKEN,
    user: MOCK_USER
  }];
});

/**
 * POST /auth/register
 * @returns {AuthResponse}
 */
mock.onPost('/auth/register').reply((config) => {
  console.info(`[MockAPI] 🟢 POST ${config.url}`, JSON.parse(config.data));
  
  const requestData = JSON.parse(config.data);

  return [201, {
    ...MOCK_TOKEN,
    user: {
      ...MOCK_USER,
      name: requestData.full_name || 'New User',
      email: requestData.email
    }
  }];
});


// ----------------------------------------------------------------------
// ASSESSMENT MOCKS (Modular Phase 2)
// ----------------------------------------------------------------------

mock.onPost('/data/anthropometric').reply(200, {
  status: "success",
  message: "Anthropometric data saved securely."
});

mock.onPost('/data/lifestyle').reply(200, {
  status: "success",
  message: "Lifestyle data saved securely."
});

mock.onPost('/images/signs').reply(200, {
  status: "success",
  message: "Physical sign images analyzed and saved."
});

// The final trigger
mock.onPost('/predict').reply((config: any) => {
  const payload = JSON.parse(config.data);
  
  // Dynamic Mock Risk Calculation
  let baseScore = 35; // Default healthy
  let riskLevel = 'Low';

  if (payload.hba1c && payload.hba1c > 6.0) baseScore += 30;
  if (payload.fasting_glucose && payload.fasting_glucose > 100) baseScore += 25;
  if (payload.systolic_bp && payload.systolic_bp > 130) baseScore += 10;
  
  baseScore = Math.min(baseScore, 98);

  if (baseScore > 75) riskLevel = 'Critical';
  else if (baseScore > 50) riskLevel = 'High';
  else if (baseScore > 30) riskLevel = 'Moderate';

  return [200, {
    id: `pred_${Math.random().toString(36).substr(2, 9)}`,
    date: new Date().toISOString(),
    riskScore: baseScore,
    riskLevel: riskLevel,
    contributingFactors: [
      { feature: "HbA1c / Glucose", impact: payload.hba1c > 6.0 ? 0.8 : 0.2, description: "Recent lab values indicate metabolic state." },
      { feature: "Anthropometrics", impact: 0.6, description: "BMI and waist circumference analysis." },
      { feature: "Lifestyle", impact: 0.4, description: "Self-reported activity and sleep metrics." }
    ]
  }];
});

// ----------------------------------------------------------------------
// SETTINGS MOCKS
// ----------------------------------------------------------------------

const MOCK_PREFERENCES = {
  emailNotifications: true,
  pushNotifications: false,
  marketingEmails: false,
  twoFactorAuth: true
};

// GET /user/preferences
mock.onGet('/user/preferences').reply(200, MOCK_PREFERENCES);

// PUT /user/profile (Simulate updating details)
mock.onPut('/user/profile').reply((config) => {
  console.info('[MockAPI] 🔵 Updating Profile:', JSON.parse(config.data));
  return [200, { success: true, message: 'Profile updated successfully' }];
});

// PUT /user/preferences (Simulate toggling switches)
mock.onPut('/user/preferences').reply((config) => {
  console.info('[MockAPI] 🔵 Updating Preferences:', JSON.parse(config.data));
  return [200, { success: true, message: 'Preferences saved' }];
});


// --- Dashboard Endpoints ---
  
  mock.onGet('/dashboard/stats').reply(() => {
    // MAGIC TRICK FOR DEMO: Read the Zustand session storage to make the dashboard 
    // reflect the user's actual inputs, simulating a real backend database!
    let dynamicProfile = {
      weight: 70,
      height: 175,
      waistCircumference: 80,
      activityLevel: 'moderate',
      riskScore: 35 // Default healthy score
    };

    try {
      const stored = sessionStorage.getItem('glucolens-assessment-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        const data = parsed?.state?.data;
        if (data) {
          if (data.weight) dynamicProfile.weight = Number(data.weight);
          if (data.height) dynamicProfile.height = Number(data.height);
          if (data.waistCircumference) dynamicProfile.waistCircumference = Number(data.waistCircumference);
          if (data.activityLevel) dynamicProfile.activityLevel = data.activityLevel;
          
          // Simple dynamic score for the demo based on their inputs
          let score = 35;
          if (data.hba1c && Number(data.hba1c) > 6.0) score += 30;
          if (data.hasDiabetes === true) score += 40;
          dynamicProfile.riskScore = Math.min(score, 98);
        }
      }
    } catch (e) {
      console.warn("Mock API could not read session storage", e);
    }

    return [200, {
      avgGlucose: 105,
      glucoseChange: -2.5,
      riskScore: dynamicProfile.riskScore,
      riskConfidence: 89,
      hba1c: 5.4,
      // The new profile fields expected by the Dashboard:
      weight: dynamicProfile.weight,
      height: dynamicProfile.height,
      waistCircumference: dynamicProfile.waistCircumference,
      activityLevel: dynamicProfile.activityLevel
    }];
  });