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
