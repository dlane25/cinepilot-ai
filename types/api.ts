import { Severity } from "./production";

export interface ProductionContext {
  approved_budget: number;
  projected_spend: number;
  planned_shooting_days: number;
  current_shooting_day: number;
}

export interface SceneInput {
  scene_number: string;
  scene_heading: string;
  int_ext: "INT" | "EXT";
  day_night: "DAY" | "NIGHT";
  characters: string[];
  production_requirements: string[];
}

export interface ProductionAnalysisRequest {
  production_id: string;
  scene_input: SceneInput;
  production_context: ProductionContext;
}

export interface ProductionRiskObservation {
  title: string;
  description: string;
  severity: Severity;
  probability: number; // 0.0 to 1.0
  financial_exposure: number;
  affected_production_area: string;
  recommended_mitigation: string;
}

export interface DirectorAnalysisResult {
  scene_complexity: "High" | "Medium" | "Low";
  location_requirements: string[];
  production_requirements: string[];
  cast_background_requirements: string[];
  physical_production_considerations: string;
  risk_observations: ProductionRiskObservation[];
  production_notes: string;
}

export interface ProductionOpportunity {
  title: string;
  description: string;
  recommended_action: string;
  estimated_savings: number;
  confidence: number; // 0.0 to 1.0
}

export interface ProducerAnalysisResult {
  cost_concerns: string[];
  expensive_requirements: string[];
  financial_exposure: number;
  optimization_opportunities: ProductionOpportunity[];
  potential_savings: number;
  schedule_implications: string | null;
  human_approval_required: boolean;
}

export interface AgentMetadata {
  director_agent_version: string;
  producer_agent_version: string;
  timestamp: string;
}

export interface ProductionAnalysisResponse {
  production_id: string;
  scene_number: string;
  director_analysis: DirectorAnalysisResult;
  producer_analysis: ProducerAnalysisResult;
  metadata: AgentMetadata;
}
