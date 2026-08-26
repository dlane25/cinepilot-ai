export type AgentIdentity = 
  | "Director Agent"
  | "Producer Agent"
  | "Scheduling Agent"
  | "Continuity Agent"
  | "Risk Agent"
  | "Optimizer Agent"
  | "System";

export type AgentActivityStatus = "Pending" | "Active" | "Completed" | "Failed";

export interface AgentActivity {
  id: string;
  agent: AgentIdentity;
  activity: string;
  category: "Analysis" | "Simulation" | "Recommendation" | "Validation";
  status: AgentActivityStatus;
  timestamp: string; // ISO 8601 or relative fixture time
  isDemoFixture: boolean; // Must be true for Milestone 1
}

export type ApprovalState = "Pending Review" | "Approved" | "Rejected";

export interface ImpactProjection {
  projectedSpend: number;
  projectedSavings: number;
  projectedShootingDays: number;
  shootingDaysSaved: number;
  projectedHighRiskEvents: number;
  highRiskEventsReduced: number;
}

export interface ProductionRecommendation {
  id: string;
  title: string;
  explanation: string;
  originatingAgent: AgentIdentity;
  approvalState: ApprovalState;
  confidence: number; // 0.0 to 1.0
  impact: {
    projectedSavings?: number;
    projectedScheduleDaysSaved?: number;
    projectedRiskReductionCount?: number;
  };
  timestamp: string;
  isDemoFixture: boolean; // Must be true for Milestone 1
}
