from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import agents, health
from app.config.settings import settings
from app.core.logging import logger

app = FastAPI(
    title="CinePilot AI - Python ADK Agent Service",
    description="Authoritative AI runtime platform for production intelligence.",
    version="1.0.0"
)

# Standard CORS setups for film studio security
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed for specific environments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health.router, tags=["Health"])
app.include_router(agents.router, prefix="/api/v1", tags=["Agents"])

@app.on_event("startup")
def on_startup():
    logger.info("==================================================")
    logger.info("CinePilot AI Agent Service starting up...")
    logger.info(f"Host: {settings.host} | Port: {settings.port}")
    logger.info(f"Vertex AI Mode: {settings.google_genai_use_vertexai}")
    logger.info(f"Target Region: {settings.google_cloud_location}")
    logger.info("==================================================")
