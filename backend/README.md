# Glucolens ML Engine & API
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688)
![Python](https://img.shields.io/badge/Python-3.10+-blue)
![Status](https://img.shields.io/badge/Status-Active_Development-blue)

The backend for Glucolens is a high-performance, strictly-typed Python API powered by **FastAPI**. It serves as the secure gateway for patient data and the primary inference engine for our multimodal Type 2 Diabetes risk prediction models.

---

## 🧠 Machine Learning Modalities

The inference engine utilizes a multimodal ensemble approach to calculate calibrated diagnostic probabilities:

1. **Tabular Engine (`/api/predict/tabular`)**: Processes clinical anthropometrics, lifestyle factors, and lab results. Returns calibrated probabilities alongside **SHAP** (SHapley Additive exPlanations) values for feature importance.
2. **Retina Engine (`/api/retina/predict`)**: Computer vision model analyzing fundus imagery for microvascular biomarkers.
3. **Skin Engine (`/api/skin/predict`)**: Dermatological analysis model detecting topographical signs of insulin resistance, specifically Acanthosis Nigricans and skin tags.
4. **Fusion Engine (`/api/fusion/predict`)**: The master ensemble model. Accepts stringified tabular payloads alongside multipart binary image files to generate a holistic, high-confidence risk assessment.

---

## 🏗️ Core Architecture & Security

* **Validation:** Strict OpenAPI 3.1.0 schema enforcement via **Pydantic**. Any malformed payloads from the client are instantly rejected with `422 Unprocessable Content`.
* **Authentication:** Stateless JWT (JSON Web Token) architecture. Utilizes short-lived access tokens and secure refresh token rotation (`/api/auth/login`, `/api/auth/refresh`).
* **Tenancy & RBAC:** Multi-tenant architecture supporting individual patients, clinical facilities, and overarching healthcare organizations (`/api/tenancy`).

---

## 🚀 Local Development Setup

### 1. Prerequisites
* Python 3.10 or higher
* `pip` and `virtualenv`

### 2. Environment Setup
```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file in the root of the `backend` directory. You will need configuration for the database, JWT secret keys, and ML model weights paths:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/glucolens
SECRET_KEY=your_super_secret_jwt_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
MODEL_WEIGHTS_PATH=./ml_models/weights/
```

### 4. Running the Server
```bash
# Start the FastAPI development server with hot-reloading
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
The interactive API documentation (Swagger UI) will be available at `http://localhost:8000/docs`.

---

## ☁️ Deployment Notes (Render)

This API is configured for deployment on Render. 
* **Cold Starts:** On free-tier instances, the server spins down after 15 minutes of inactivity. Cold boots require loading PyTorch/TensorFlow tensors into memory, which can take 1-3 minutes. 
* **Health Checks:** The frontend utilizes the `/api/health` endpoint to silently trigger server wake-ups during the authentication and registration flows to mitigate cold-start latency.
```