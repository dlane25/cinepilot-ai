from datetime import datetime

from pydantic import BaseModel


class ClickHouseAnalysisRun(BaseModel):
    analysis_run_id: str
    production_id: str
    scene_number: str
    started_at: datetime
    completed_at: datetime
    model: str
    runtime: str
    director_complexity: str
    total_risk_count: int
    total_opportunity_count: int
    projected_savings: float
    status: str

class ClickHouseRisk(BaseModel):
    risk_id: str
    analysis_run_id: str
    production_id: str
    scene_number: str
    originating_agent: str
    title: str
    description: str
    severity: str
    probability: float
    financial_exposure: float
    affected_area: str
    mitigation: str
    created_at: datetime

class ClickHouseRecommendation(BaseModel):
    recommendation_id: str
    analysis_run_id: str
    production_id: str
    scene_number: str
    originating_agent: str
    title: str
    description: str
    recommended_action: str
    projected_savings: float
    confidence: float
    human_approval_required: bool
    approval_state: str
    created_at: datetime

class ClickHouseDecision(BaseModel):
    decision_id: str
    recommendation_id: str
    production_id: str
    proposal_id: str = ""
    decision: str  # "Approved" | "Rejected"
    actor_name: str = "Production Executive"
    actor_type: str = "human_demo_operator"
    previous_state: str = "Pending Review"
    new_state: str  # "APPROVED" | "REJECTED"
    originating_agents: str
    projected_savings: float = 0.0
    shooting_days_saved: int = 0
    risks_reduced: int = 0
    decided_at: datetime
    notes: str
