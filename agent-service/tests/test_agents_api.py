import os
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

@pytest.fixture
def valid_payload():
    return {
        "production_id": "prod-echopoint-001",
        "scene_input": {
            "scene_number": "42",
            "scene_heading": "EXT. INDUSTRIAL WAREHOUSE - NIGHT",
            "int_ext": "EXT",
            "day_night": "NIGHT",
            "characters": ["Maya", "Detective Cole"],
            "production_requirements": ["50ft Technocrane", "48 extras", "rain effects"]
        },
        "production_context": {
            "approved_budget": 2400000.0,
            "projected_spend": 2617300.0,
            "planned_shooting_days": 31,
            "current_shooting_day": 14
        }
    }

def test_analyze_production_scene_42_mock(valid_payload):
    """Verify standard mock analysis workflow for ECHO POINT Scene 42."""
    with patch.dict(os.environ, {"MOCK_AGENTS": "true", "GOOGLE_CLOUD_PROJECT": ""}):
        response = client.post("/api/v1/agents/analyze-production", json=valid_payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify Director Analysis fields
        assert data["production_id"] == "prod-echopoint-001"
        assert data["scene_number"] == "42"
        assert data["director_analysis"]["scene_complexity"] == "High"
        assert "EXT. INDUSTRIAL WAREHOUSE - NIGHT" in data["director_analysis"]["location_requirements"]
        assert len(data["director_analysis"]["risk_observations"]) == 2
        
        # Verify Producer Analysis fields
        assert data["producer_analysis"]["financial_exposure"] == 18500.0
        assert len(data["producer_analysis"]["optimization_opportunities"]) == 1
        opp = data["producer_analysis"]["optimization_opportunities"][0]
        assert opp["estimated_savings"] == 5800.0
        assert opp["confidence"] == 0.95
        assert data["producer_analysis"]["human_approval_required"] is True

def test_analyze_production_general_scene(valid_payload):
    """Verify general analysis route returning simpler fallback mock data."""
    valid_payload["scene_input"]["scene_number"] = "15"
    valid_payload["scene_input"]["scene_heading"] = "INT. OFFICE - DAY"
    valid_payload["scene_input"]["int_ext"] = "INT"
    valid_payload["scene_input"]["day_night"] = "DAY"
    valid_payload["scene_input"]["characters"] = ["Maya"]
    valid_payload["scene_input"]["production_requirements"] = []
    
    with patch.dict(os.environ, {"MOCK_AGENTS": "true", "GOOGLE_CLOUD_PROJECT": ""}):
        response = client.post("/api/v1/agents/analyze-production", json=valid_payload)
        assert response.status_code == 200
        data = response.json()
        assert data["scene_number"] == "15"
        assert data["director_analysis"]["scene_complexity"] == "Medium"
        assert data["producer_analysis"]["potential_savings"] == 0.0

def test_analyze_production_validation_error(valid_payload):
    """Verify 422 is returned when client sends invalid JSON schema payloads."""
    # Break payload format
    valid_payload["scene_input"]["int_ext"] = "OUTSIDE" # invalid literal
    response = client.post("/api/v1/agents/analyze-production", json=valid_payload)
    assert response.status_code == 422

@pytest.mark.asyncio
@patch("app.api.agents.run_agent")
async def test_analyze_production_malformed_model_output(mock_run_agent, valid_payload):
    """Verify controlled error boundary handling if an agent returns malformed un-parseable JSON."""
    # First mock return succeeds, second mock return throws or returns malformed text
    mock_run_agent.return_value = "This is not valid JSON string."
    
    response = client.post("/api/v1/agents/analyze-production", json=valid_payload)
    # The API catches the ModelValidationError/JSONDecodeError and returns 422 with clear context
    assert response.status_code == 422
    assert "produced malformed output" in response.json()["detail"]
