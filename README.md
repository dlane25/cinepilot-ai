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

**Current Milestone 1 Capabilities (Implemented Now):**
- **Command Center Foundation:** A cinematic, responsive, enterprise-quality dashboard built with Next.js and Tailwind CSS.
- **Deterministic Production Model:** Robust TypeScript domain models representing production health, schedules, and financials.
- **Production Intelligence Presentation:** Visualization of schedule/budget insights and a dedicated production risks panel.
- **Governed Agent Architecture:** A demonstration of how future specialized agents (Director, Producer, Scheduling, Continuity, Risk, Optimizer) will interact with the human approval queue.
- **Impact Summary:** Clear, measurable projections comparing the current plan against an optimized, AI-recommended plan.

*Disclaimer: The current Milestone 1 application runs on deterministic demo fixture data. No live AI, Gemini inference, or backend autonomous orchestration is currently executing.*

## Architecture Direction (Planned)

CinePilot AI utilizes a hybrid application architecture:

- **Frontend (Current):** Next.js App Router, React, TypeScript, Tailwind CSS.
- **Agent Runtime (Planned):** Python service utilizing the Google Agent Development Kit (ADK).
- **Intelligence Layer (Planned):** Google Gemini and Vertex AI for reasoning and unstructured data extraction.
- **Agent Orchestration (Planned):** Vertex AI Agent Engine.
- **Production Memory (Planned):** ClickHouse Cloud with official MCP integrations.

## Local Development

### Installation

```bash
npm install
```

### Validation Commands

Ensure the codebase meets engineering standards before committing:

```bash
npm run lint       # Run ESLint
npm run typecheck  # Validate TypeScript strictly
npm test           # Run Vitest domain calculations
npm run build      # Validate the Next.js production build
```

### Starting the Development Server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app` - Next.js App Router pages and layouts.
- `/components` - Reusable UI components grouped by layout and dashboard features.
- `/lib/domain` - Pure TypeScript business logic and domain calculations.
- `/lib/fixtures` - Deterministic demo data (ECHO POINT).
- `/types` - TypeScript domain models defining the production intelligence contracts.
- `/tests` - Vitest test suites verifying financial invariants and domain calculations.

## Milestone Roadmap

- [x] **Milestone 1:** Command Center Foundation (UI and Deterministic Models).
- [ ] **Milestone 2:** Python ADK Agent Service.
- [ ] **Milestone 3:** Gemini + Vertex AI Integration.
- [ ] **Milestone 4:** ClickHouse Production Memory.
- [ ] **Milestone 5:** Screenplay Intelligence (Parsing & Ingestion).
- [ ] **Milestone 6:** Multi-Agent Production Optimization.
- [ ] **Milestone 7:** Human Approval + Audit Trail.
- [ ] **Milestone 8:** Deployment + Competition Demo.
