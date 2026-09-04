from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

@pytest.fixture
def mock_history_empty():
    return []

@pytest.mark.asyncio
async def test_human_decision_successful_transitions():
    """Verify that human decision POST endpoint accepts valid PENDING -> APPROVED/REJECTED transitions."""
    payload_approve = {
        "recommendation_id": "rec-opt-crane-001",
        "production_id": "prod-echopoint-001",
        "proposal_id": "proposal-xyz-123",
        "decision": "Approved",
        "previous_state": "Pending Review",
        "new_state": "APPROVED",
        "originating_agents": "Producer Agent",
        "projected_savings": 5800.0,
        "notes": "Approved Crane Optimization."
    }

    # Mock ClickHouse calls to return empty history (no duplicates) and accept INSERTs
    with patch("app.memory.service.ProductionMemoryService.get_historical_decisions", new_callable=AsyncMock) as mock_get, \
         patch("app.memory.service.ProductionMemoryService.save_human_decision", new_callable=AsyncMock) as mock_save:

        mock_get.return_value = []
        mock_save.return_value = "decision-id-123"

        response = client.post("/api/v1/memory/decisions", json=payload_approve)
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"
        assert data["decision_id"] == "decision-id-123"
        assert "logged and persisted" in data["message"]

@pytest.mark.asyncio
async def test_human_decision_illegal_transition_rejection():
    """Verify that human decision POST endpoint blocks illegal state transitions (e.g. APPROVED -> APPROVED)."""
    payload_invalid = {
        "recommendation_id": "rec-opt-crane-001",
        "production_id": "prod-echopoint-001",
        "decision": "Approved",
        "previous_state": "APPROVED",  # Already approved! Illegal transition.
        "new_state": "APPROVED"
    }

    response = client.post("/api/v1/memory/decisions", json=payload_invalid)
    assert response.status_code == 422
    assert "Illegal state transition" in response.json()["detail"]

@pytest.mark.asyncio
async def test_human_decision_idempotency():
    """Verify that human decision endpoint handles duplicate retries safely via idempotency check."""
    payload_dup = {
        "recommendation_id": "rec-opt-crane-001",
        "production_id": "prod-echopoint-001",
        "decision": "Approved",
        "previous_state": "Pending Review",
        "new_state": "APPROVED"
    }

    # Mock ClickHouse to return an already existing matching decision
    with patch("app.memory.service.ProductionMemoryService.get_historical_decisions", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = [
            {
                "decision_id": "existing-decision-id-789",
                "recommendation_id": "rec-opt-crane-001",
                "decision": "Approved",
                "production_id": "prod-echopoint-001"
            }
        ]

        response = client.post("/api/v1/memory/decisions", json=payload_dup)
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"
        assert data["decision_id"] == "existing-decision-id-789"
        assert "Idempotency match" in data["message"]
