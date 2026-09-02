from datetime import UTC, datetime
from unittest.mock import AsyncMock, patch

import pytest

from app.config.settings import settings
from app.memory.mcp_client import ClickHouseMcpClient
from app.memory.service import ProductionMemoryService


@pytest.fixture
def mock_mcp_client():
    client = ClickHouseMcpClient()
    client.run_query = AsyncMock(return_value=[])
    return client

def test_sql_injection_escaping():
    """Verify that single quotes are correctly doubled to avoid SQL injection."""
    service = ProductionMemoryService()
    unsafe = "Maya's Warehouse Stunts"
    safe = service._escape(unsafe)
    assert safe == "Maya''s Warehouse Stunts"

@pytest.mark.asyncio
async def test_memory_save_analysis_run_without_host():
    """Verify that saving analysis run immediately skips if host is not configured."""
    with patch.object(settings, "clickhouse_host", None):
        service = ProductionMemoryService()
        result = await service.save_analysis_run({}, datetime.now(UTC))
        assert result is None

@pytest.mark.asyncio
async def test_memory_save_analysis_run_with_host(mock_mcp_client):
    """Verify that save_analysis_run correctly constructs and issues multiple SQL inserts."""
    with patch.object(settings, "clickhouse_host", "some-host.clickhouse.cloud"):
        service = ProductionMemoryService()
        service.mcp_client = mock_mcp_client
        
        mock_response = {
            "production_id": "prod-echopoint-001",
            "scene_number": "42",
            "director_analysis": {
                "scene_complexity": "High",
                "risk_observations": [
                    {
                        "title": "Weather Exposure",
                        "description": "Heavy rain rig",
                        "severity": "High",
                        "probability": 0.8,
                        "financial_exposure": 12000.0,
                        "affected_production_area": "Logistics",
                        "recommended_mitigation": "pumps"
                    }
                ]
            },
            "producer_analysis": {
                "potential_savings": 5800.0,
                "optimization_opportunities": [
                    {
                        "title": "Shift Rental",
                        "description": "Weekly to daily",
                        "recommended_action": "grip",
                        "estimated_savings": 5800.0,
                        "confidence": 0.95
                    }
                ]
            }
        }
        
        run_id = await service.save_analysis_run(mock_response, datetime.now(UTC))
        assert run_id is not None
        
        # We expect 3 distinct run_query calls (1 for run, 1 for risk, 1 for recommendation)
        assert mock_mcp_client.run_query.call_count == 3
        
        # Verify first call contains our generated run_id and table target
        first_call_arg = mock_mcp_client.run_query.call_args_list[0][0][0]
        assert "INSERT INTO production_analysis_runs" in first_call_arg
        assert run_id in first_call_arg

@pytest.mark.asyncio
async def test_save_human_decision(mock_mcp_client):
    """Verify that save_human_decision inserts the decision and triggers an update mutation."""
    with patch.object(settings, "clickhouse_host", "some-host.clickhouse.cloud"):
        service = ProductionMemoryService()
        service.mcp_client = mock_mcp_client
        
        decision_id = await service.save_human_decision(
            recommendation_id="rec-abc-123",
            production_id="prod-xyz",
            decision="Approved",
            notes="Ready to commit"
        )
        assert decision_id is not None
        
        # 1 insert and 1 update = 2 calls
        assert mock_mcp_client.run_query.call_count == 2
        
        # Verify UPDATE contains ALTER mutation
        update_call = mock_mcp_client.run_query.call_args_list[1][0][0]
        assert "ALTER TABLE production_recommendations" in update_call
        assert "UPDATE approval_state = 'Approved'" in update_call
        assert "rec-abc-123" in update_call
