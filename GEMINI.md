# CinePilot AI — Project Instructions

## Project Mission

CinePilot AI is an autonomous production intelligence platform for film and television.

The system converts screenplay and production data into actionable production intelligence using specialized AI agents.

The primary competition objective is to build a polished, production-ready agentic workflow for the Google Cloud Agentic Cinema Hackathon.

CinePilot should demonstrate real business value for filmmakers, production companies, and studios by reducing production cost, schedule risk, continuity errors, and operational inefficiency.

---

## Core Product Capabilities

CinePilot should support:

- screenplay ingestion and structured scene breakdown
- scene, character, location, prop, and production-requirement extraction
- production budgeting and variance detection
- production scheduling
- continuity analysis
- production risk analysis
- production optimization
- measurable recommendations
- human approval of consequential production changes
- agent decision and action auditing
- production intelligence querying
- measurable production impact such as:
  - dollars saved
  - shooting days saved
  - financial exposure avoided
  - risks reduced
  - production efficiency improved

---

## Technology

### Frontend

Use:

- Next.js
- React
- TypeScript
- Next.js App Router
- Tailwind CSS

### Agent Runtime

Use:

- Python
- Python Google Agent Development Kit (ADK)
- Google Gemini
- Vertex AI
- Vertex AI Agent Engine and applicable Google Cloud Agent Builder services

### Cloud

Use:

- Google Cloud
- Vertex AI
- appropriate Google Cloud deployment and infrastructure services

### Partner Technology

Use:

- ClickHouse Cloud
- official mcp-clickhouse integration where required by the competition track

Do not introduce alternative AI providers or third-party agent frameworks unless explicitly approved.

Do not integrate OpenAI, Anthropic, AWS AI, Microsoft AI, or unrelated external AI providers into the competition runtime.

Gemini must remain the primary intelligence layer.

Google ADK must remain the authoritative agent framework.

---

## Architecture

CinePilot uses a hybrid monorepo-style architecture.

Primary repository boundaries:

app/
components/
lib/
types/
tests/
public/
docs/

agent-service/
  app/
    agents/
    models/
    services/
    api/
  tests/

### Frontend Responsibilities

The Next.js application is responsible for:

- application shell
- CinePilot Command Center
- production dashboards
- production visualization
- screenplay upload interface
- production intelligence presentation
- typed API client
- human approval workflows
- presentation of agent recommendations
- production risk visualization
- agent activity visualization
- audit-history visualization

Frontend-specific utilities may live under:

lib/

Core AI agent implementations must NOT live under:

lib/agents/

The authoritative AI agent implementations belong under:

agent-service/app/agents/

Expected Python agent domains:

- director
- producer
- scheduler
- continuity
- risk
- optimizer

Shared Python production models belong under:

agent-service/app/models/

Backend services and infrastructure integrations belong under:

agent-service/app/services/

Backend API routes and API contracts belong under:

agent-service/app/api/

Infrastructure-specific code must remain isolated from UI components.

Do not couple React components directly to:

- Google ADK
- Gemini
- Vertex AI
- Agent Engine
- ClickHouse
- MCP

The frontend communicates with the Python agent service through typed API contracts.

---

## Runtime Architecture

CinePilot uses a hybrid application architecture.

Frontend:

- Next.js
- React
- TypeScript
- Tailwind CSS

Agent backend:

- Python
- Google Agent Development Kit (ADK)
- Gemini
- Vertex AI
- Vertex AI Agent Engine

Partner integration:

- ClickHouse Cloud
- official mcp-clickhouse runtime integration

The Next.js application is the user interface and production command center.

The Python service is the authoritative AI agent runtime.

Do not implement core production-agent orchestration directly inside Next.js.

Frontend and agent runtime communicate through typed API contracts.

Future agent domains include:

- Director Agent
- Producer Agent
- Scheduling Agent
- Continuity Agent
- Risk Agent
- Optimizer Agent

Keep Google AI infrastructure, ClickHouse connectivity, secrets, credentials, and agent execution server-side.

---

## Agent Responsibilities

### Director Agent

Responsible for understanding screenplay structure and production requirements.

Future responsibilities include:

- screenplay breakdown
- scene extraction
- character extraction
- location extraction
- prop identification
- vehicle identification
- INT/EXT identification
- DAY/NIGHT identification
- production requirement identification

### Producer Agent

Responsible for financial and operational production intelligence.

Future responsibilities include:

- budget analysis
- cost variance detection
- production-cost forecasting
- expensive-scene detection
- savings opportunities
- financial exposure calculations

### Scheduling Agent

Responsible for production schedule intelligence.

Future responsibilities include:

- scene scheduling
- actor availability
- location availability
- scene consolidation
- travel reduction
- production-day optimization
- equipment scheduling conflicts

### Continuity Agent

Responsible for story and visual continuity.

Future responsibilities include:

- wardrobe continuity
- prop continuity
- character-state continuity
- story timeline continuity
- vehicle continuity
- scene-to-scene inconsistencies

### Risk Agent

Responsible for production-risk intelligence.

Future responsibilities include:

- weather exposure
- actor conflicts
- location risk
- overtime risk
- equipment conflicts
- schedule risk
- financial exposure

### Optimizer Agent

Responsible for coordinating production optimization.

Future responsibilities include:

- gathering recommendations from specialized agents
- evaluating alternative production plans
- calculating savings
- validating schedule changes
- validating continuity
- evaluating risk
- preparing governed recommendations for human approval

---

## Agent Governance

Agents must not silently make consequential production changes.

Use the workflow:

analyze
→ recommend
→ quantify impact
→ validate
→ request human approval
→ execute
→ record decision

Every important recommendation should include:

- recommendation ID
- originating agent
- explanation
- evidence when available
- confidence when applicable
- projected financial impact
- projected schedule impact
- projected risk impact
- timestamp
- approval state

Consequential recommendations require explicit human approval before execution.

Every approved or rejected recommendation should eventually be auditable.

CinePilot should favor governed autonomy rather than uncontrolled autonomy.

---

## TypeScript Engineering Standards

- Use TypeScript strict mode.
- Do not weaken TypeScript configuration to suppress errors.
- No implicit any unless unavoidable and documented.
- Prefer explicit domain types.
- Keep components small and reusable.
- Separate presentation from business logic.
- Separate production-domain logic from UI components.
- Keep API communication behind defined interfaces.
- Avoid hard-coded secrets.
- Never commit credentials or API keys.
- Add environment variables to .env.example only as placeholders.
- Preserve deterministic behavior where AI is not required.
- Validate external and AI-generated data before use.
- Add meaningful error handling.
- Prefer server-side access for protected APIs.
- Maintain accessibility.
- Maintain responsive design.
- Avoid unnecessary dependencies.

---

## Python Engineering Standards

- Use a supported modern Python version.
- Use explicit Python type hints.
- Prefer Pydantic models for validated agent and API data contracts where appropriate.
- Keep Google ADK orchestration isolated from HTTP/API handlers.
- Keep Gemini interaction behind service boundaries.
- Keep Vertex AI integration behind service boundaries.
- Keep ClickHouse integration behind infrastructure/service boundaries.
- Keep MCP integration behind infrastructure/service boundaries.
- Use pytest for backend automated tests.
- Use Ruff or an equivalent approved Python linter/formatter.
- Do not expose Google Cloud credentials to the frontend.
- Do not expose ClickHouse credentials to the frontend.
- Validate model-produced structured output before it enters production-domain workflows.
- Agent failures must produce controlled errors.
- Agent failures must never silently mutate production state.
- Prefer deterministic domain logic when AI reasoning is unnecessary.

---

## Security Standards

Never commit:

- Google Cloud credentials
- service-account credentials
- API keys
- ClickHouse passwords
- database connection secrets
- OAuth tokens
- access tokens
- refresh tokens

Secrets must remain server-side.

Use environment variables or appropriate Google Cloud secret-management services.

Provide placeholders only in:

.env.example

Never expose privileged environment variables through client-side Next.js code.

Never place secrets in demo fixtures.

---

## Product Design

The application should feel like premium film-studio production software.

Visual direction:

- cinematic
- dark command-center interface
- sophisticated
- restrained
- enterprise-quality
- information dense but readable
- premium typography
- clear hierarchy
- responsive
- accessible
- minimal decorative clutter

The interface should feel closer to a studio operations command center than a generic SaaS dashboard.

Do not build a generic chatbot interface as the primary experience.

Conversational production intelligence may exist later, but the primary experience is the CinePilot Command Center.

Important production metrics should be understandable within seconds.

Whenever possible, recommendations should communicate measurable value.

Examples:

- $18,600 potential savings
- 2 production days eliminated
- 81% weather disruption probability
- $24,800 financial exposure
- 4 continuity conflicts detected

---

## Demo Production

Use the fictional feature film:

ECHO POINT

All ECHO POINT production information used during early milestones is deterministic demo fixture data.

It must never be represented as real production information.

### Initial Scenario

Approved budget:

$2,400,000

Projected spend:

$2,617,300

Initial variance:

+$217,300

Planned shooting days:

31

High-risk production events:

7

### Target Optimized State

Projected spend:

approximately $2,491,420

Projected savings:

approximately $125,880

Shooting days:

29

High-risk production events:

3

These values exist to demonstrate CinePilot's intended product experience before live agent functionality is introduced.

---

## Demo Risk Scenarios

Representative deterministic demo risks may include:

- weather exposure
- location inefficiency
- actor scheduling conflict
- continuity conflict
- equipment conflict
- location overtime
- transportation inefficiency

Production risks should support useful fields such as:

- ID
- title
- description
- severity
- probability
- financial exposure
- status
- affected production entity
- recommended action
- originating agent when applicable

---

## Demo Production Insights

Representative deterministic demo insights may include:

- scene consolidation opportunity
- location cost anomaly
- weather schedule risk
- actor availability conflict
- continuity inconsistency
- equipment utilization opportunity

Insights should communicate measurable impact wherever appropriate.

During milestones before live Gemini integration, demo insights and demo agent activity must be clearly labeled as fixture/demo information.

Never imply that deterministic fixture activity was generated by a live Gemini agent.

---

## Testing Philosophy

Tests should validate meaningful behavior.

Prefer tests for:

- production-domain calculations
- budget variance calculations
- fixture invariants
- risk classification
- approval-state behavior
- schedule calculations
- deterministic recommendation calculations
- API contracts
- structured data validation

Avoid meaningless snapshot tests that provide little confidence.

Future agent tests should separate:

- deterministic domain behavior
- model integration behavior
- infrastructure integration behavior

---

## Required Validation

Before declaring a milestone complete, run all validation relevant to the code changed.

### Frontend Validation

Run:

npm run lint
npm run typecheck
npm test
npm run build

### Python Agent-Service Validation

Once agent-service exists, run:

- Python linting
- Python formatting validation where configured
- Python type validation where configured
- pytest
- application import/startup validation

Do not claim completion if any required validation step fails.

For Milestone 1, only the frontend validation suite is required because the Python agent-service is introduced in Milestone 2.

---

## Milestone Boundaries

Do not implement functionality scheduled for a later milestone unless explicitly instructed.

### Milestone 1 — Command Center Foundation

Build:

- Next.js application foundation
- TypeScript domain models
- CinePilot visual system
- Command Center
- deterministic ECHO POINT fixtures
- deterministic production risks
- deterministic production insights
- deterministic demo agent activity
- frontend tests
- frontend validation

Do NOT implement during Milestone 1:

- Gemini API calls
- Vertex AI calls
- Google ADK
- Python agent runtime
- ClickHouse
- MCP
- screenplay parsing
- PDF ingestion
- autonomous production mutations

### Milestone 2 — Python ADK Agent Service

Introduce:

- agent-service/
- Python environment
- Google ADK
- Python production models
- agent contracts
- API boundary
- initial agent implementations
- backend tests

### Milestone 3 — Gemini + Vertex AI

Introduce:

- real Gemini reasoning
- Vertex AI
- structured model outputs
- applicable Agent Engine integration

### Milestone 4 — ClickHouse Production Memory

Introduce:

- ClickHouse Cloud
- production-event storage
- agent-action storage
- recommendation history
- approval history
- production analytics
- official mcp-clickhouse integration required by the competition track

### Milestone 5 — Screenplay Intelligence

Introduce:

- screenplay upload
- document processing
- structured screenplay analysis
- scene extraction
- character extraction
- location extraction
- production requirement extraction

### Milestone 6 — Multi-Agent Production Optimization

Introduce:

- agent collaboration
- budget optimization
- schedule optimization
- continuity validation
- production-risk validation
- alternative-plan simulation

### Milestone 7 — Human Approval + Audit Trail

Introduce:

- governed recommendations
- approval workflows
- rejection workflows
- production-plan versioning
- agent decision trace
- auditable actions

### Milestone 8 — Deployment + Competition Demo

Complete:

- Google Cloud deployment
- production configuration
- runtime validation
- demo scenario
- competition-quality README
- architecture documentation
- final testing
- three-minute demo preparation

---

## Git Workflow

Stable branch:

main

Current development branch:

milestone-1-foundation

Use small, coherent commits.

Do not work directly on main.

Do not merge to main unless explicitly instructed.

Do not push automatically unless explicitly instructed.

Do not create tags unless explicitly instructed.

Milestone 1 target commit:

feat(core): establish CinePilot production foundation

Future milestones should use dedicated working branches.

Before committing:

- inspect git status
- inspect git diff
- run required validation
- run git diff --check
- confirm no secrets exist
- confirm milestone boundaries were respected

---

## Current Milestone

Current milestone:

Milestone 1 — Command Center Foundation

Current objective:

Establish the production-quality Next.js and TypeScript foundation for CinePilot AI.

During this milestone, build the UI and deterministic domain foundation only.

Do not begin the Python agent service until Milestone 2.

Do not pretend deterministic demo agents are live Gemini agents.

Do not implement ClickHouse or MCP until the appropriate milestone.

Do not implement real production optimization until the appropriate milestone.

---

## Completion Standard

A milestone is complete only when:

- requested functionality is implemented
- milestone boundaries are respected
- architecture remains clean
- validation passes
- tests pass
- production build succeeds
- git diff --check passes
- no credentials or secrets are present
- documentation accurately distinguishes implemented functionality from planned functionality
- no unsupported claims about AI functionality are made

When asked to complete a milestone:

1. inspect the repository
2. verify the current branch
3. review GEMINI.md
4. create a concise implementation plan
5. implement only the requested milestone
6. run validation
7. inspect Git changes
8. report results
9. stop before commit/push unless explicitly instructed