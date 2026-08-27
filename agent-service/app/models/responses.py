from typing import Literal

from pydantic import BaseModel, Field

from app.models.production import Severity


class ProductionRiskObservation(BaseModel):
    """A risk flagged by the Director Agent regarding scene execution."""
    title: str = Field(..., description="Short name of the risk (e.g. 'Weather exposure').")
    description: str = Field(..., description="Detailed description of why this is a risk.")
    severity: Severity = Field(..., description="Severity matching our standard scales.")
    probability: float = Field(..., ge=0.0, le=1.0, description="Estimated likelihood (0.0 to 1.0).")
    financial_exposure: float = Field(..., description="Projected financial risk exposure in USD.")
    affected_production_area: str = Field(..., description="Area affected (e.g. 'Schedule / Locations').")
    recommended_mitigation: str = Field(..., description="Proposed immediate action to mitigate.")

class DirectorAnalysisResult(BaseModel):
    """The structured output schema of the Director Agent."""
    scene_complexity: Literal["High", "Medium", "Low"] = Field(..., description="Subjective scene complexity.")
    location_requirements: list[str] = Field(..., description="Specific physical or location needs.")
    production_requirements: list[str] = Field(..., description="Technical department needs (e.g., Rain SFX, Crane).")
    cast_background_requirements: list[str] = Field(..., description="Actor or background extra requirements.")
    physical_production_considerations: str = Field(..., description="Directorial view of physical shoot mechanics.")
    risk_observations: list[ProductionRiskObservation] = Field(default_factory=list, description="Direct production risks observed.")
    production_notes: str = Field(..., description="General directorial or continuity notes.")

class ProductionOpportunity(BaseModel):
    """An optimization opportunity identified by the Producer Agent."""
    title: str = Field(..., description="Short name of the opportunity.")
    description: str = Field(..., description="Detailed explanation of the optimization.")
    recommended_action: str = Field(..., description="Concrete instruction for the production team.")
    estimated_savings: float = Field(..., description="Estimated savings in USD.")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Agent's confidence in this outcome (0.0 to 1.0).")

class ProducerAnalysisResult(BaseModel):
    """The structured output schema of the Producer Agent."""
    cost_concerns: list[list[str] | str] = Field(..., description="High cost items or operational issues.")
    expensive_requirements: list[str] = Field(..., description="Identified high-spend triggers in the scene.")
    financial_exposure: float = Field(..., description="Calculated total potential exposure based on risks.")
    optimization_opportunities: list[ProductionOpportunity] = Field(default_factory=list, description="Actionable saving opportunities.")
    potential_savings: float = Field(..., description="Sum of viable potential savings in USD.")
    schedule_implications: str | None = Field(None, description="Inferred impacts on overall days or SAG overtime.")
    human_approval_required: bool = Field(..., description="True if any opportunity requires human-in-the-loop review.")

class AgentMetadata(BaseModel):
    """Metadata regarding agent execution for auditing."""
    director_agent_version: str = Field(default="1.0.0")
    producer_agent_version: str = Field(default="1.0.0")
    timestamp: str = Field(..., description="ISO 8601 timestamp of analysis completion.")

class ProductionAnalysisResponse(BaseModel):
    """The complete consolidated output of the multi-agent pipeline."""
    production_id: str = Field(..., description="ID of the analyzed production.")
    scene_number: str = Field(..., description="Scene ID.")
    director_analysis: DirectorAnalysisResult = Field(..., description="Analysis from Director Agent.")
    producer_analysis: ProducerAnalysisResult = Field(..., description="Analysis from Producer Agent.")
    metadata: AgentMetadata = Field(..., description="Execution auditing metadata.")
