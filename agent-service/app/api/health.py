from fastapi import APIRouter

from app.config.settings import settings

router = APIRouter()

@router.get("/health")
@router.get("/api/v1/health")
def get_health():
    """Simple status check reporting configuration readiness securely."""
    # Check readiness without exposing secrets
    has_gcp_project = settings.google_cloud_project is not None and settings.google_cloud_project != ""

    return {
        "status": "healthy",
        "service": "cinepilot-agent-service",
        "version": "1.0.0",
        "agent_runtime_configured": has_gcp_project,
        "environment": {
            "vertex_ai_mode": settings.google_genai_use_vertexai,
            "region": settings.google_cloud_location,
        }
    }

@router.get("/ready")
@router.get("/api/v1/ready")
def get_ready():
    """Detailed readiness probe for deployment environments."""
    has_gcp_project = settings.google_cloud_project is not None and settings.google_cloud_project != ""
    has_clickhouse = settings.clickhouse_host is not None and settings.clickhouse_host != ""

    return {
        "status": "ready",
        "service": "cinepilot-agent-service",
        "readiness": {
            "vertex_ai_configured": has_gcp_project,
            "clickhouse_configured": has_clickhouse,
            "port_configured": settings.port is not None,
        }
    }
