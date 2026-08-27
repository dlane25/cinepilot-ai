
class CinePilotError(Exception):
    """Base exception for CinePilot AI Agent Service."""
    pass

class ConfigurationError(CinePilotError):
    """Raised when there is a configuration mismatch or missing requirement."""
    pass

class AgentExecutionError(CinePilotError):
    """Raised when an ADK agent fails to execute or return output."""
    pass

class ModelValidationError(CinePilotError):
    """Raised when raw model output fails validation against Pydantic domain schemas."""
    pass

class UpstreamModelError(CinePilotError):
    """Raised when Gemini/Vertex AI returns an API error."""
    pass
