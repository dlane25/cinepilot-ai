from typing import Literal

from pydantic import BaseModel, Field

# Severity definition matching frontend types/production.ts
Severity = Literal["Critical", "High", "Medium", "Low"]

class ProductionContext(BaseModel):
    """Provides high-level financial and scheduling metadata of the film production."""
    approved_budget: float = Field(..., description="The officially approved total budget in USD.")
    projected_spend: float = Field(..., description="The currently projected total spend in USD.")
    planned_shooting_days: int = Field(..., description="Number of planned days for principal photography.")
    current_shooting_day: int = Field(..., description="The day of production currently being scheduled or shot.")

class SceneInput(BaseModel):
    """Represents a specific screenplay scene to analyze."""
    scene_number: str = Field(..., description="Unique alphanumeric identifier for the scene (e.g., '42', '12A').")
    scene_heading: str = Field(..., description="Standard screenplay scene header (e.g., 'EXT. WAREHOUSE - NIGHT').")
    int_ext: Literal["INT", "EXT"] = Field(..., description="Whether the scene takes place interior or exterior.")
    day_night: Literal["DAY", "NIGHT"] = Field(..., description="Chronological time window of the scene.")
    characters: list[str] = Field(default_factory=list, description="List of characters appearing in this scene.")
    production_requirements: list[str] = Field(default_factory=list, description="Requirements identified like Props, Special FX, Vehicles.")

class ProductionAnalysisRequest(BaseModel):
    """Trigger payload for sequential agent workflow."""
    production_id: str = Field(..., description="Identifier of the production (e.g. 'prod-echopoint-001').")
    scene_input: SceneInput = Field(..., description="The specific scene detail to analyze.")
    production_context: ProductionContext = Field(..., description="Current financial and schedule envelope.")
