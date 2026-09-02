
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.core.logging import logger
from app.memory.service import ProductionMemoryService

router = APIRouter()

class HumanDecisionRequest(BaseModel):
    recommendation_id: str = Field(..., description="The unique ID of the target recommendation.")
    production_id: str = Field(..., description="The ID of the film production.")
    decision: str = Field(..., description="Decision made: 'Approved' or 'Rejected'.")
    notes: str | None = Field("", description="Optional notes/reasons behind the decision.")

@router.post("/memory/decisions", status_code=status.HTTP_201_CREATED)
@router.post("/api/v1/memory/decisions", status_code=status.HTTP_201_CREATED)
async def log_human_decision(payload: HumanDecisionRequest):
    """Logs a human-in-the-loop decision regarding an advisory recommendation."""
    if payload.decision not in ["Approved", "Rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid decision. Must be 'Approved' or 'Rejected'."
        )
        
    try:
        memory_service = ProductionMemoryService()
        decision_id = await memory_service.save_human_decision(
            recommendation_id=payload.recommendation_id,
            production_id=payload.production_id,
            decision=payload.decision,
            notes=payload.notes or ""
        )
        return {
            "status": "success",
            "decision_id": decision_id,
            "message": f"Decision '{payload.decision}' logged and persisted successfully to ClickHouse."
        }
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
