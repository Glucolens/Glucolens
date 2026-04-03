# Glucolens Frontend Architecture
![React](https://img.shields.io/badge/React-18.x-blue)
![Vite](https://img.shields.io/badge/Vite-5.x-purple)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)

The frontend client for Glucolens is a clinical-grade React application. It manages complex, multi-step diagnostic assessments, strict OpenAPI payload mapping, and secure JWT authentication.

---

## 1. Core Technologies
* **Framework:** React + Vite
* **State Management:** Zustand (with persistent storage middleware)
* **Styling:** Tailwind CSS (Custom Medical Blue theme)
* **Form Validation:** React Hook Form + Zod
* **API Client:** Axios (with automated token refresh interceptors)

---

## 2. Development Standards & "Pro" Etiquette

To ensure maintainability and scalability, all contributors must adhere to these standards:

### **Code Quality**
* **Strict Typing:** No `any` types permitted in core data structures. All payloads must map precisely to the backend OpenAPI specification.
* **Absolute Imports:** Use path aliases.
    * *Avoid:* `import { Button } from '../../../components/ui/Button'`
    * *Use:* `import { Button } from '@/components/ui/Button'`
* **Graceful Degradation:** If a non-critical backend endpoint (e.g., Dashboard Stats) returns a `404 Not Found`, the frontend must catch the error and render fallback UI rather than crashing the application.

### **Commit Convention (Conventional Commits)**
We follow the conventional commit structure: `type(scope): description`
* `feat(auth): implement two-step JWT login flow`
* `fix(wizard): resolve string/number math conflicts in BMI calculator`
* `style(ui): update primary borders to medical blue`

---

## 3. State Management Architecture

Glucolens utilizes **Zustand** for global, conflict-free state management, separating UI logic from data storage.

### `authStore.ts`
Manages the user's secure session. 
* Handles the two-step login flow (`/auth/login` -> `/auth/me`).
* Maintains the `accessToken` and `refreshToken`.
* Persists the session to LocalStorage so users remain logged in across reloads.

### `assessmentStore.ts`
Acts as the central nervous system for the Diagnostic Wizard.
* Cumulatively collects data across multiple wizard steps.
* Handles progressive disclosure (e.g., clearing dependent fields if a user changes a previous answer).
* **Crucial Security Feature:** Persists tabular data to LocalStorage to prevent data loss on refresh, but intentionally *omits* File objects (Retina/Skin images) from persistence to avoid serialization crashes.

---

## 4. API Integration & Routing

The frontend directly interfaces with the FastAPI backend using strict schemas. 

### Dynamic ML Routing (`useSubmitAssessment.ts`)
The frontend is responsible for determining the correct ML pipeline based on the data provided by the clinician:
1.  **Tabular Only:** If no images are uploaded, the payload is mapped and sent to `/api/predict/tabular`.
2.  **Fusion:** If a Retina or Skin image is detected in the `AssessmentStore`, the tabular data is stringified and packaged alongside the binary files as `multipart/form-data`, routing to `/api/fusion/predict`.

### Critical Endpoints Utilized
* `POST /api/auth/login` (Token generation)
* `POST /api/auth/register-public` (Account creation)
* `GET /api/auth/me` (Profile hydration)
* `GET /api/health` (UX patch: Used to silently wake sleeping free-tier servers)
* `POST /api/fusion/predict` (Primary diagnostic engine)

---

## 5. UI/UX Features

1.  **Server Wake-up Patch:** Silent `/health` pings initiate server cold-starts during form entry, accompanied by dynamic "Establishing secure connection..." banners for slow responses.
2.  **Clinical Animations:** A dedicated `AnalysisScreen` provides secure, professional visual feedback while the tensor operations run on the backend.
3.  **Responsive Form Handling:** Safe numeric parsing prevents `NaN` errors if clinicians clear inputs mid-assessment.
```