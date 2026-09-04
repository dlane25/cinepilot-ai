
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.core.logging import logger
from app.memory.service import ProductionMemoryService

router = APIRouter()

class HumanDecisionRequest(BaseModel):
    recommendation_id: str = Field(..., description="The unique ID of the target recommendation.")
    production_id: str = Field(..., description="The ID of the film production.")
    proposal_id: str | None = Field("", description="Unique optimization proposal ID.")
    decision: str = Field(..., description="Decision made: 'Approved' or 'Rejected'.")
    actor_name: str | None = Field("Production Executive", description="Name of the person making the decision.")
    actor_type: str | None = Field("human_demo_operator", description="Actor type (human, AI, system).")
    previous_state: str | None = Field("Pending Review", description="The state prior to this action.")
    new_state: str = Field(..., description="The new target state (APPROVED or REJECTED).")
    originating_agents: str | None = Field("", description="Comma-separated list of contributing agents.")
    projected_savings: float | None = Field(0.0, description="Projected savings in USD.")
    shooting_days_saved: int | None = Field(0, description="Shooting days compressed.")
    risks_reduced: int | None = Field(0, description="Risks reduced.")
    notes: str | None = Field("", description="Optional notes/reasons behind the decision.")

@router.post("/memory/decisions", status_code=status.HTTP_201_CREATED)
@router.post("/api/v1/memory/decisions", status_code=status.HTTP_201_CREATED)
async def log_human_decision(payload: HumanDecisionRequest):
    """
    Logs an immutable human-in-the-loop decision regarding an agent optimization recommendation.
    Validates state transitions (blocks illegal APPROVED -> APPROVED or REJECTED -> APPROVED).
    """
    if payload.decision not in ["Approved", "Rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid decision. Must be 'Approved' or 'Rejected'."
        )

    # Enforce state transition rules (Idempotency and transition validation)
    # Ensure previous state is exactly 'Pending Review' (or general PENDING)
    if payload.previous_state not in ["Pending Review", "Pending", "Pending Review Queue"]:
        logger.warning(f"[MEMORY API] Blocked illegal state transition from '{payload.previous_state}' to '{payload.new_state}'")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Illegal state transition: Cannot change status of an item already in state '{payload.previous_state}'."
        )

    try:
        memory_service = ProductionMemoryService()

        # Check if this exact decision is already registered in ClickHouse to prevent duplicates (idempotency!)
        existing_decisions = await memory_service.get_historical_decisions(payload.production_id)
        for dec in existing_decisions:
            if dec.get("recommendation_id") == payload.recommendation_id and dec.get("decision") == payload.decision:
                logger.info(f"[MEMORY API] Idempotency match: Decision '{payload.decision}' on recommendation '{payload.recommendation_id}' already registered.")
                return {
                    "status": "success",
                    "decision_id": dec.get("decision_id"),
                    "message": "Idempotency match: human decision already logged in production memory."
                }

        # Persist full enriched audit trail row
        decision_id = await memory_service.save_human_decision(
            recommendation_id=payload.recommendation_id,
            production_id=payload.production_id,
            decision=payload.decision,
            notes=payload.notes or "",
            proposal_id=payload.proposal_id or "",
            actor_name=payload.actor_name or "Production Executive",
            actor_type=payload.actor_type or "human_demo_operator",
            previous_state=payload.previous_state or "Pending Review",
            new_state=payload.new_state,
            originating_agents=payload.originating_agents or "",
            projected_savings=payload.projected_savings or 0.0,
            shooting_days_saved=payload.shooting_days_saved or 0,
            risks_reduced=payload.risks_reduced or 0
        )
        return {
            "status": "success",
            "decision_id": decision_id,
            "message": f"Immutable human decision '{payload.decision}' logged and persisted successfully to ClickHouse."
        }
    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        logger.error(f"[MEMORY API] Failed to log decision: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to write human decision to production memory: {e!s}"
        ) from e

@router.get("/memory/productions/{production_id}/analyses")
@router.get("/api/v1/memory/productions/{production_id}/analyses")
async def get_analyses(production_id: str):
    """Retrieves historical production analysis runs from ClickHouse production memory."""
    try:
        memory_service = ProductionMemoryService()
        results = await memory_service.get_historical_analyses(production_id)
        return {"production_id": production_id, "analyses": results}
    except Exception as e:
        logger.error(f"[MEMORY API] Failed to query analyses: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query historical analyses from ClickHouse: {e!s}"
        ) from e

@router.get("/memory/productions/{production_id}/risks")
@router.get("/api/v1/memory/productions/{production_id}/risks")
async def get_risks(production_id: str):
    """Retrieves historical production risks from ClickHouse production memory."""
    try:
        memory_service = ProductionMemoryService()
        results = await memory_service.get_historical_risks(production_id)
        return {"production_id": production_id, "risks": results}
    except Exception as e:
        logger.error(f"[MEMORY API] Failed to query risks: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query historical risks from ClickHouse: {e!s}"
        ) from e

@router.get("/memory/productions/{production_id}/recommendations")
@router.get("/api/v1/memory/productions/{production_id}/recommendations")
async def get_recommendations(production_id: str):
    """Retrieves historical production recommendations from ClickHouse production memory."""
    try:
        memory_service = ProductionMemoryService()
        results = await memory_service.get_historical_recommendations(production_id)
        return {"production_id": production_id, "recommendations": results}
    except Exception as e:
        logger.error(f"[MEMORY API] Failed to query recommendations: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query historical recommendations from ClickHouse: {e!s}"
        ) from e

@router.get("/memory/productions/{production_id}/decisions")
@router.get("/api/v1/memory/productions/{production_id}/decisions")
async def get_decisions(production_id: str):
    """Retrieves historical human-in-the-loop decisions (Audit Trail Ledger) from ClickHouse."""
    try:
        memory_service = ProductionMemoryService()
        results = await memory_service.get_historical_decisions(production_id)
        return {"production_id": production_id, "decisions": results}
    except Exception as e:
        logger.error(f"[MEMORY API] Failed to query decisions audit trail: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query historical decisions from ClickHouse: {e!s}"
        ) from e
