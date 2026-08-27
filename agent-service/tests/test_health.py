from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

def test_health_endpoint():
    """Verify health endpoints respond with success and expected fields."""
    for path in ["/health", "/api/v1/health"]:
        response = client.get(path)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "cinepilot-agent-service"
        assert "agent_runtime_configured" in data
        assert "environment" in data
