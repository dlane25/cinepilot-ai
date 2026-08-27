# CinePilot AI

CinePilot AI is an autonomous production intelligence platform for film and television.

It is designed to help producers, production managers, directors, studios, and production teams understand and optimize their budgets, schedules, continuity, and production logistics.

## Problem Statement

Film and television production is a complex, capital-intensive logistical puzzle. A single delay, weather event, actor conflict, or continuity error can cost tens of thousands of dollars and trigger cascading schedule failures. Production teams currently rely on disjointed tools, manual analysis, and institutional memory to manage these risks.

## Product Vision & Why It Matters

CinePilot AI provides a centralized **Command Center** that surfaces actionable production intelligence. By employing specialized AI agents, CinePilot can autonomously analyze screenplays, budgets, and schedules to identify risks before they manifest and recommend measurable optimizations.

CinePilot demonstrates real business value by:
- Catching costly schedule and logistical anomalies.
- Identifying location and scene consolidation opportunities.
- Preemptively mitigating weather, cast, and equipment risks.
- Enforcing narrative and visual continuity.
- Providing governed autonomy through human-in-the-loop decision-making.

## The ECHO POINT Demo

To demonstrate the platform's value, we use a fictional feature film called **ECHO POINT**.

**Current Capabilities (Implemented Now):**
- **Command Center Foundation (Milestone 1):** A cinematic, responsive, enterprise-quality dashboard built with Next.js and Tailwind CSS representing our ECHO POINT fictional film scenario.
- **Python ADK Agent Service (Milestone 2):** An authoritative, type-safe Python backend utilizing Google's Agent Development Kit (ADK) and Gemini via Vertex AI. The backend features a strict Explicit Pipeline:
  - **Director Agent:** Performs deep screenplay and scene creative breakdowns, departments requirement identification, and risk assessments.
  - **Producer Agent:** Runs downstream financial/operational analysis on the Director's output to find cost-saving opportunities and scheduling optimizations.
  - **Pydantic Validation Boundaries:** Prevents malformed LLM responses from entering downstream workflows using strict schema checks.
- **Offline testing / Live verification:** Complete mock-friendly backend test suite allowing developers to run pytest offline, and a separate, secure live Vertex script to test active Google Cloud ADC authentication.

*Disclaimer: The Next.js frontend currently runs on deterministic demo fixture data for presentation stability. The backend Python agent-service runs independently with its own mock testing and live Vertex verification scripts in this milestone.*

## Architecture

CinePilot AI utilizes a hybrid application architecture:

- **Frontend:** Next.js App Router, React, TypeScript, Tailwind CSS.
- **Agent Backend:** FastAPI Python service utilizing the Google Agent Development Kit (ADK) and `google-genai` SDK.
- **Intelligence Layer:** Google Gemini 2.0 and Vertex AI for reasoning and structured data extraction.
- **Agent Orchestration:** Vertex AI Agent Engine.
- **Production Memory (Planned):** ClickHouse Cloud with official MCP integrations.

## Local Development

### Frontend Installation & Validation

To set up and run the Next.js frontend command center:

```bash
# Install Node dependencies
npm install

# Run Frontend Validations
npm run lint       # Run ESLint
npm run typecheck  # Validate TypeScript strictly
npm test           # Run Vitest domain calculations
npm run build      # Validate the Next.js production build

# Start the dev server
npm run dev
```

### Backend Installation & Validation

To set up and run the Python ADK Agent Service:

```bash
cd agent-service

# Create virtual environment
python -m venv .venv
.venv\Scripts\Activate.ps1   # (On Windows PowerShell)

# Install Python dependencies
pip install -e .

# Run Backend Validations
ruff check                  # Lint python codebase
pytest                      # Run offline tests
python tests/live_vertex_verification.py  # (Optional) Live Vertex AI ADC check
```

## Project Structure

- `/app` - Next.js App Router pages and layouts.
- `/components` - Reusable UI components grouped by layout and dashboard features.
- `/lib/domain` - Pure TypeScript business logic and domain calculations.
- `/lib/fixtures` - Deterministic demo data (ECHO POINT).
- `/types` - TypeScript domain models defining the production intelligence contracts.
- `/tests` - Vitest test suites verifying financial invariants and domain calculations.
- `/agent-service` - Authoritative Python backend agent pipeline using FastAPI, Pydantic v2, and Google ADK.

## Milestone Roadmap

- [x] **Milestone 1:** Command Center Foundation (UI and Deterministic Models).
- [x] **Milestone 2:** Python ADK Agent Service.
- [ ] **Milestone 3:** Gemini + Vertex AI Integration.
- [ ] **Milestone 4:** ClickHouse Production Memory.
- [ ] **Milestone 5:** Screenplay Intelligence (Parsing & Ingestion).
- [ ] **Milestone 6:** Multi-Agent Production Optimization.
- [ ] **Milestone 7:** Human Approval + Audit Trail.
- [ ] **Milestone 8:** Deployment + Competition Demo.
