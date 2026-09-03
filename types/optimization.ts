export interface AgentRecommendation {
  recommendation_id: string;
  originating_agent: string;
  title: string;
  explanation: string;
  confidence: number; // 0.0 to 1.0
  projected_savings: number;
  shooting_days_saved: number;
  risks_reduced: number;
  affected_scenes: string[];
}

export interface AgentConflict {
  conflict_id: string;
  agents: string[];
  title: string;
  description: string;
  tradeoff_explanation: string;
  recommended_option: string;
}

export interface AgentAgreement {
  agreement_id: string;
  agents: string[];
  title: string;
  description: string;
}

export interface CoordinatedProposal {
  proposal_id: string;
  summary: string;
  recommendations: AgentRecommendation[];
  conflicts: AgentConflict[];
  agreements: AgentAgreement[];
}

export interface OptimizationImpact {
  baseline_projected_spend: number;
  optimized_projected_spend: number;
  total_potential_savings: number;
  baseline_shooting_days: number;
  optimized_shooting_days: number;
  shooting_days_saved: number;
  baseline_high_risk_events: number;
  optimized_high_risk_events: number;
  high_risk_events_reduced: number;
}

export interface ProductionOptimizationRequest {
  production_id: string;
  baseline_spend: number;
  baseline_days: number;
  baseline_risks: number;
}

export interface ProductionOptimizationResponse {
  production_id: string;
  proposal: CoordinatedProposal;
  impact: OptimizationImpact;
  timestamp: string;
}
