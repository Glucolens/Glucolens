# Glucolens

![Project Status](https://img.shields.io/badge/Status-Active_Development-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-green)
![License](https://img.shields.io/badge/License-Proprietary-red)

**A Fault-Tolerant Multimodal Medical ML System for Diabetic Risk Prediction.**

Glucolens is a clinical-grade health-tech platform designed to predict Type 2 Diabetes risk using a cutting-edge multimodal approach. By combining traditional tabular data (anthropometrics, lifestyle, labs) with computer vision analysis of physical signs (Acanthosis Nigricans) and retinal scans, Glucolens provides highly accurate, explainable risk assessments.

---

## 🏗️ System Architecture

Glucolens operates on a decoupled monorepo architecture, ensuring strict separation of concerns between the user interface and the machine learning inference engine.

* **Frontend (The Client):** A highly responsive, strictly-typed React application powered by Vite. It utilizes Zustand for complex state management across the diagnostic wizard and handles intelligent routing of modalities before submitting payloads.
* **Backend (The ML Engine):** A high-performance FastAPI server designed to handle tensor operations, strict OpenAPI schema validation, and secure authentication.

### Supported ML Modalities
1.  **Tabular Model:** Analyzes clinical history, blood pressure, and lab results.
2.  **Retina Model:** Computer vision analysis of fundus imaging.
3.  **Skin Model:** Dermatological topographical analysis for insulin resistance markers.
4.  **Fusion Model:** A comprehensive ensemble endpoint that synthesizes Tabular, Retina, and Skin data into a single, highly-calibrated diagnostic probability.

---

## 📂 Repository Structure

```text
glucolens/
├── frontend/           # React, Vite, Zustand, TailwindCSS
├── backend/            # FastAPI, Python, ML Models (PyTorch/TensorFlow)
└── README.md           # Master project documentation
```

## 🚀 Quick Start

To run the full stack locally for development:

1.  **Start the Backend API:**
    *(See `backend/README.md` for Python environment setup and ML dependencies)*
2.  **Start the Frontend Client:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
```
