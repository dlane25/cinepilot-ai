export interface HumanDecisionRequest {
  recommendation_id: string;
  production_id: string;
  proposal_id: string;
  decision: "Approved" | "Rejected";
  actor_name?: string;
  actor_type?: string;
  previous_state?: string;
  new_state: "APPROVED" | "REJECTED";
  originating_agents?: string;
  projected_savings?: number;
  shooting_days_saved?: number;
  risks_reduced?: number;
  notes?: string;
}

export interface HumanDecisionResponse {
  status: "success";
  decision_id: string;
  message: string;
}

export interface DecisionRecord {
  decision_id: string;
  recommendation_id: string;
  production_id: string;
  proposal_id: string;
  decision: "Approved" | "Rejected";
  actor_name: string;
  actor_type: string;
  previous_state: string;
  new_state: "APPROVED" | "REJECTED";
  originating_agents: string;
  projected_savings: number;
  shooting_days_saved: number;
  risks_reduced: number;
  decided_at: string;
  notes: string;
}
