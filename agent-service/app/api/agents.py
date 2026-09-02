import json
import os
import re
from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException, status

from app.agents.director import director_agent
from app.agents.producer import producer_agent
from app.core.errors import ModelValidationError
from app.core.logging import logger
from app.memory.service import ProductionMemoryService
from app.models.production import ProductionAnalysisRequest
from app.models.responses import (
    AgentMetadata,
    DirectorAnalysisResult,
    ProducerAnalysisResult,
    ProductionAnalysisResponse,
)
from app.services.agent_runtime import run_agent

router = APIRouter()

def clean_and_parse_json(raw_text: str) -> dict:
    """Safely extracts JSON content from markdown blocks if present, then parses it."""
    cleaned = raw_text.strip()
    # Handle markdown wrappers if present
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned, re.IGNORECASE)
    if match:
        cleaned = match.group(1).strip()

    # Strip any possible leading/trailing junk
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse raw JSON. Raw content:\n{raw_text}")
        raise ModelValidationError(f"Invalid JSON produced by agent: {e!s}") from e

# High-fidelity mock responses for offline/test environments
MOCK_DIRECTOR_RESPONSE_42 = {
    "scene_complexity": "High",
    "location_requirements": ["EXT. INDUSTRIAL WAREHOUSE - NIGHT"],
    "production_requirements": ["Rain effects setup", "Police lighting rigs", "Two active picture vehicles", "50ft Technocrane (rental)"],
    "cast_background_requirements": ["Lead: Maya", "Lead: Detective Cole", "48 background extras", "2 stunt drivers"],
    "physical_production_considerations": "Heavy night shoot requiring wet down setups. Coordination of picture vehicle movement alongside stunts and lighting rigs.",
    "risk_observations": [
        {
            "title": "Weather Exposure: Rain Rig Water Runoff",
            "description": "The heavy rain effects may cause localized pooling/flooding near the warehouse entrance, posing safety hazards for crew and equipment.",
            "severity": "High",
            "probability": 0.65,
            "financial_exposure": 12000.0,
            "affected_production_area": "Budget / Schedule",
            "recommended_mitigation": "Arrange for high-capacity industrial drainage pumps and dedicated safety officers."
        },
        {
            "title": "SAG Turnaround Violation",
            "description": "Extended night shoot may conflict with the early morning schedule on Day 15, risking union turnaround penalties.",
            "severity": "Medium",
            "probability": 0.85,
            "financial_exposure": 6500.0,
            "affected_production_area": "Cast",
            "recommended_mitigation": "Adjust Day 15 call time to guarantee a minimum 12-hour rest window."
        }
    ],
    "production_notes": "Visually dense climax scene requiring tight department scheduling to avoid union overtime."
}

MOCK_PRODUCER_RESPONSE_42 = {
    "cost_concerns": ["Technocrane rental overhead", "Union night premium rates", "Rain effect water usage and clean up fees"],
    "expensive_requirements": ["50ft Technocrane", "48 Background Extras"],
    "financial_exposure": 18500.0,
    "optimization_opportunities": [
        {
            "title": "Convert weekly crane rental to Daily",
            "description": "The 50ft Technocrane is currently scheduled on a full-week rental but is only utilized for Scene 42. Converting this to a single day-rental rate saves significant budget.",
            "recommended_action": "Modify the rental agreement with the grip house to a daily rental rate for Day 14 only.",
            "estimated_savings": 5800.0,
            "confidence": 0.95
        }
    ],
    "potential_savings": 5800.0,
    "schedule_implications": "Rescheduling non-essential extra calls can save an additional $2,000 on overtime premiums.",
    "human_approval_required": True
}

# General mock responses for other scenes
MOCK_DIRECTOR_GENERAL = {
    "scene_complexity": "Medium",
    "location_requirements": ["INT. OFFICE - DAY"],
    "production_requirements": ["Standard interior lighting", "Desk props"],
    "cast_background_requirements": ["Lead: Maya", "2 background extras"],
    "physical_production_considerations": "Simple dialogue scene. No complex stunts or mechanical setups.",
    "risk_observations": [],
    "production_notes": "Standard coverage. Should move quickly."
}

MOCK_PRODUCER_GENERAL = {
    "cost_concerns": ["No significant cost overruns detected."],
    "expensive_requirements": [],
    "financial_exposure": 0.0,
    "optimization_opportunities": [],
    "potential_savings": 0.0,
    "schedule_implications": "No major schedule or union risk factors observed.",
    "human_approval_required": False
}

@router.post("/agents/analyze-production", response_model=ProductionAnalysisResponse)
@router.post("/api/v1/agents/analyze-production", response_model=ProductionAnalysisResponse)
async def analyze_production(payload: ProductionAnalysisRequest):
    """
    Executes the CinePilot Explicit Pipeline.

    1. Triggers Director Agent -> Validates output
    2. Triggers Producer Agent -> Validates output
    3. Merges results & metadata
    """
    logger.info(f"Initiating analysis pipeline for production '{payload.production_id}', scene '{payload.scene_input.scene_number}'")
    started_at = datetime.now(UTC)

    # Determine if we should mock the run
    gcp_project = os.getenv("GOOGLE_CLOUD_PROJECT")
    force_mock = os.getenv("MOCK_AGENTS", "false").lower() == "true"
    is_mock = force_mock or gcp_project is None

    if is_mock:
        logger.info("Executing pipeline in MOCK mode (no live Gemini calls).")

    # --- STAGE 1: DIRECTOR AGENT ---
    director_prompt = f"""
    Analyze the following scene input and production context details.

    Scene Number: {payload.scene_input.scene_number}
    Scene Heading: {payload.scene_input.scene_heading}
    INT/EXT: {payload.scene_input.int_ext}
    DAY/NIGHT: {payload.scene_input.day_night}
    Characters: {', '.join(payload.scene_input.characters)}
    Requirements identified: {', '.join(payload.scene_input.production_requirements)}

    Production Budget: ${payload.production_context.approved_budget:,.2f}
    Projected Spend: ${payload.production_context.projected_spend:,.2f}
    Planned Days: {payload.production_context.planned_shooting_days}
    Current Day: {payload.production_context.current_shooting_day}
    """

    # Resolve the correct mock response
    is_scene_42 = payload.scene_input.scene_number.strip() == "42"
    mock_dir_data = MOCK_DIRECTOR_RESPONSE_42 if is_scene_42 else MOCK_DIRECTOR_GENERAL
    mock_dir_str = json.dumps(mock_dir_data)

    try:
        raw_director_out = await run_agent(
            agent=director_agent,
            prompt=director_prompt,
            is_mock=is_mock,
            mock_response=mock_dir_str
        )

        # Validation Boundary 1
        director_dict = clean_and_parse_json(raw_director_out)
        director_result = DirectorAnalysisResult(**director_dict)
        logger.info("Stage 1 (Director Analysis) completed and validated successfully.")

    except ModelValidationError as e:
        logger.error(f"Director Agent schema validation failed: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Director Agent produced malformed output: {e!s}"
        ) from e
    except Exception as e:
        logger.error(f"Stage 1 failed: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Stage 1 (Director Agent) execution failed: {e!s}"
        ) from e

    # --- STAGE 2: PRODUCER AGENT ---
    producer_prompt = f"""
    Evaluate the following creative breakdown and risk observations provided by the Director Agent.
    Provide financial, operational, and scheduling analysis within the context of our production boundaries.

    Production Budget: ${payload.production_context.approved_budget:,.2f}
    Projected Spend: ${payload.production_context.projected_spend:,.2f}
    Planned Days: {payload.production_context.planned_shooting_days}
    Current Day: {payload.production_context.current_shooting_day}

    --- Creative breakdown ---
    Scene Complexity: {director_result.scene_complexity}
    Location requirements: {', '.join(director_result.location_requirements)}
    Department requirements: {', '.join(director_result.production_requirements)}
    Cast requirements: {', '.join(director_result.cast_background_requirements)}
    Physical considerations: {director_result.physical_production_considerations}

    --- Observed Risks ---
    {json.dumps([risk.model_dump() for risk in director_result.risk_observations], indent=2)}
    """

    mock_prod_data = MOCK_PRODUCER_RESPONSE_42 if is_scene_42 else MOCK_PRODUCER_GENERAL
    mock_prod_str = json.dumps(mock_prod_data)

    try:
        raw_producer_out = await run_agent(
            agent=producer_agent,
            prompt=producer_prompt,
            is_mock=is_mock,
            mock_response=mock_prod_str
        )

        # Validation Boundary 2
        producer_dict = clean_and_parse_json(raw_producer_out)
        producer_result = ProducerAnalysisResult(**producer_dict)
        logger.info("Stage 2 (Producer Analysis) completed and validated successfully.")

    except ModelValidationError as e:
        logger.error(f"Producer Agent schema validation failed: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Producer Agent produced malformed output: {e!s}"
        ) from e
    except Exception as e:
        logger.error(f"Stage 2 failed: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Stage 2 (Producer Agent) execution failed: {e!s}"
        ) from e

    # --- CONSOLIDATION ---
    response = ProductionAnalysisResponse(
        production_id=payload.production_id,
        scene_number=payload.scene_input.scene_number,
        director_analysis=director_result,
        producer_analysis=producer_result,
        metadata=AgentMetadata(
            director_agent_version="1.0.0",
            producer_agent_version="1.0.0",
            timestamp=datetime.now(UTC).isoformat()
        )
    )

    # Graceful degradation persistence call to ClickHouse Cloud via official mcp-clickhouse
    try:
        memory_service = ProductionMemoryService()
        await memory_service.save_analysis_run(response.model_dump(), started_at)
    except Exception as db_err:
        logger.error(f"[API ENDPOINT] Failed to persist analysis run to ClickHouse (degraded): {db_err!s}")
        # Graceful degradation: do NOT crash or fail the response. Proceed returning validated results.

    logger.info(f"Pipeline completed successfully for scene '{payload.scene_input.scene_number}'")
    return response
