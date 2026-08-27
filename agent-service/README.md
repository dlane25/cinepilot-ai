# CinePilot AI — Python ADK Agent Service

This is the authoritative backend agent service for **CinePilot AI**, the autonomous production intelligence platform for film and television. It handles screenplay analysis, department requirements breakdown, and financial/operational optimization using **Google's Agent Development Kit (ADK)** and **Gemini via Vertex AI**.

---

## Architecture

The Python service follows a decoupled, domain-driven structure to enforce clean boundaries around LLM reasoning:

```
agent-service/
  app/
    main.py               # FastAPI application entrypoint
    api/                  # REST API routes (Health & Agents)
    agents/               # Authoritative Google ADK agents
    models/               # Pydantic v2 schemas mirroring film production domain
    services/             # Agent runtime execution & utilities
    config/               # Pydantic-settings local configuration
    core/                 # Shared exceptions and structured logging
  tests/                  # Offline unit/integration tests & live verification
```

### Core Pipeline
The service implements a strict, sequential **Explicit Pipeline** at `POST /api/v1/agents/analyze-production`:
1. **Request Intake:** The API validates the `SceneInput` and `ProductionContext` against strict Pydantic schemas.
2. **Director Agent:** Invoked with scene metadata to generate creative breakdown (scene complexity, department requirements, and physical execution risks).
3. **Pydantic Validation (Boundary 1):** The raw ADK response is parsed, stripped of markdown wrappers, and parsed into a Pydantic `DirectorAnalysisResult`.
4. **Producer Agent:** Receives the validated Director output along with production financials to calculate financial exposure and propose operational saving opportunities.
5. **Pydantic Validation (Boundary 2):** The raw Producer output is parsed into a Pydantic `ProducerAnalysisResult`.
6. **Consolidation:** The endpoint merges both validated stages along with auditing metadata into a `ProductionAnalysisResponse`.

If any intermediate LLM call produces malformed structures, the pipeline raises a controlled validation exception, preventing corruption of downstream client workflows.

---

## Setup & Local Installation

### Prerequisites
- Python `3.13` (3.13.4 is verified compatible)
- Google Cloud SDK CLI (`gcloud` tool) for Vertex AI access

### 1. Initialize Virtual Environment
From the `agent-service` directory, initialize and activate your virtual environment:

```powershell
# Create venv
python -m venv .venv

# Activate venv (Windows PowerShell)
.venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
```powershell
pip install -e .
```
*(Dependencies include: FastAPI, Uvicorn, Pydantic, Pydantic-Settings, Google ADK, Google GenAI SDK, Pytest, and Ruff.)*

### 3. Local Environment Variables
Copy `.env.example` to `.env` and fill in your GCP parameters:
```bash
cp .env.example .env
```
Key variables:
- `GOOGLE_CLOUD_PROJECT`: Your GCP project ID.
- `GOOGLE_CLOUD_LOCATION`: Region (e.g. `us-central1`).
- `GOOGLE_GENAI_USE_VERTEXAI`: Set to `true` to target Vertex AI.

### 4. Running the Server Locally
To start the FastAPI service:
```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Interactive Swagger docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health check: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

---

## Testing & Verification

We separate offline unit tests from live Google Cloud Vertex AI integrations:

### 1. Offline Test Suite (Default)
Our standard test suite runs 100% offline without hitting Vertex AI. It uses strict Pydantic mocks to test JSON decoding, pipeline chaining, model schemas, and error boundaries.

To execute offline tests:
```powershell
pytest
```

### 2. Live Vertex AI Verification
We maintain a standalone verification script `tests/live_vertex_verification.py` to confirm that standard Google ADK can successfully connect to your GCP project and complete a Gemini 2.0 reasoning loop.

This script **never runs by default** during pytest execution to prevent cost, quota, and authentication dependency issues.

**To run the live check:**
1. Securely log in to Application Default Credentials (ADC) on your machine:
   ```bash
   gcloud auth application-default login
   ```
2. Configure your project ID in the environment:
   ```powershell
   $env:GOOGLE_CLOUD_PROJECT="your-gcp-project-id"
   ```
3. Run the live verification script:
   ```powershell
   python tests/live_vertex_verification.py
   ```

---

## Milestone Boundaries (Current Limitations)
As we are strictly adhering to **Milestone 2 boundaries**, please note:
- **ClickHouse / MCP:** Not yet integrated (belongs to Milestone 4).
- **Screenplay PDF Ingestion:** Not yet implemented (belongs to Milestone 5).
- **Frontend Integration:** Next.js currently continues to use stable deterministic mocks to prevent untracked state mutations (belongs to a later milestone).
- **Autonomous mutations:** The agents only offer advisory saving recommendations requiring explicit human approval; they do not mutate state autonomously.
