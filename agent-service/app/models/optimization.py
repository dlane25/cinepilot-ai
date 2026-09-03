from datetime import datetime

from pydantic import BaseModel, Field


class AgentRecommendation(BaseModel):
    recommendation_id: str = Field(..., description="Unique ID for this recommendation.")
    originating_agent: str = Field(..., description="The name of the agent proposing this (e.g. 'Scheduler Agent').")
    title: str = Field(..., description="Short name of the recommendation.")
    explanation: str = Field(..., description="Detailed analytical justification.")
    evidence: str | None = Field(None, description="Direct script or budgetary evidence.")
    confidence: float = Field(..., description="Agent confidence (0.0 to 1.0).")
    projected_savings: float = Field(default=0.0, description="Projected savings in USD.")
    projected_cost: float = Field(default=0.0, description="Projected implementational cost in USD.")
    shooting_days_saved: int = Field(default=0, description="Estimated days saved.")
    risks_reduced: int = Field(default=0, description="Number of critical/high risks mitigated.")
    affected_scenes: list[str] = Field(default_factory=list, description="List of scene numbers affected.")
    dependencies: list[str] = Field(default_factory=list, description="Other recommendation IDs this depends on.")
    conflicts: list[str] = Field(default_factory=list, description="Other recommendation IDs this conflicts with.")
    approval_state: str = Field(default="Pending Review", description="Pending Review, Approved, or Rejected.")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp.")

class AgentConflict(BaseModel):
    conflict_id: str = Field(..., description="Unique conflict identifier.")
    agents: list[str] = Field(..., description="The agents involved in the disagreement.")
    title: str = Field(..., description="Short title of the conflict.")
    description: str = Field(..., description="Detailed explanation of the disagreement.")
    tradeoff_explanation: str = Field(..., description="Creative vs financial tradeoffs.")
    recommended_option: str = Field(..., description="The Optimizer's recommended compromise.")

class AgentAgreement(BaseModel):
    agreement_id: str = Field(..., description="Unique agreement identifier.")
    agents: list[str] = Field(..., description="The cooperating agents.")
    title: str = Field(..., description="Short title of the shared consensus.")
    description: str = Field(..., description="Detailed explanation of why these agents agree.")

class CoordinatedProposal(BaseModel):
    proposal_id: str = Field(..., description="Unique ID for this synthesized proposal.")
    summary: str = Field(..., description="High-level Optimizer agent summary of the scenario.")
    recommendations: list[AgentRecommendation] = Field(default_factory=list, description="The complete list of parsed, isolated recommendations.")
    conflicts: list[AgentConflict] = Field(default_factory=list, description="Disagreements and logistical tradeoffs.")
    agreements: list[AgentAgreement] = Field(default_factory=list, description="Consensuses and joint opportunities.")

class OptimizationImpact(BaseModel):
    baseline_projected_spend: float = Field(..., description="Baseline spend in USD.")
    optimized_projected_spend: float = Field(..., description="Optimized spend after compatible savings.")
    total_potential_savings: float = Field(..., description="Cumulative compatible savings.")
    baseline_shooting_days: int = Field(..., description="Baseline planned days.")
    optimized_shooting_days: int = Field(..., description="Optimized shooting days.")
    shooting_days_saved: int = Field(..., description="Shooting days reduced.")
    baseline_high_risk_events: int = Field(..., description="Baseline critical/high risks count.")
    optimized_high_risk_events: int = Field(..., description="Optimized risks count.")
    high_risk_events_reduced: int = Field(..., description="Risks count reduced.")

class ProductionOptimizationRequest(BaseModel):
    production_id: str = Field(..., description="Unique production ID.")
    baseline_spend: float = Field(..., description="Baseline projected spend.")
    baseline_days: int = Field(..., description="Baseline shooting days.")
    baseline_risks: int = Field(..., description="Baseline risk count.")

class ProductionOptimizationResponse(BaseModel):
    production_id: str = Field(..., description="Unique production ID.")
    proposal: CoordinatedProposal = Field(..., description="Synthesized coordinated proposal.")
    impact: OptimizationImpact = Field(..., description="Coordinated deterministic arithmetic impact.")
    timestamp: str = Field(..., description="Completion timestamp.")
