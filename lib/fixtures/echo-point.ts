import { 
  Production, 
  ProductionInsight, 
  ProductionRisk, 
  AgentActivity, 
  ProductionRecommendation,
  ImpactProjection
} from "../../types";
import { generateImpactProjection } from "../domain/calculations";

// ----------------------------------------------------------------------
// DETERMINISTIC DEMO FIXTURE: ECHO POINT
// This file contains static data intended to demonstrate the UI structure 
// without relying on live AI agents or backend generation.
// ----------------------------------------------------------------------

export const echoPointProduction: Production = {
  metadata: {
    id: "prod-echopoint-001",
    title: "ECHO POINT",
    type: "Feature Film",
    status: "Active Production",
    currentPhase: "Principal Photography",
    director: "J. Miller",
    producers: ["A. Rossi", "T. Chen"],
  },
  financials: {
    approvedBudget: 2400000,
    projectedSpend: 2617300,
    currency: "USD",
  },
  schedule: {
    plannedShootingDays: 31,
    currentShootingDay: 14,
    estimatedRemainingDays: 17,
  }
};

export const echoPointImpactProjection: ImpactProjection = generateImpactProjection(
  echoPointProduction.financials.projectedSpend,
  2491420, // projected optimized spend
  echoPointProduction.schedule.plannedShootingDays,
  29,      // projected optimized days
  7,       // current high risk (Critical/High)
  3        // optimized high risk
);

export const echoPointInsights: ProductionInsight[] = [
  {
    id: "insight-001",
    title: "Scene Consolidation Opportunity",
    description: "Scenes 42, 44, and 47 use the same exterior location but are scheduled across different weeks. Consolidating them could reduce company moves.",
    category: "Schedule",
    financialImpact: 14500,
    scheduleImpactDays: 1,
    affectedScenes: ["42", "44", "47"],
    recommendedAction: "Move Scene 44 and 47 to Day 16.",
  },
  {
    id: "insight-002",
    title: "Location Cost Anomaly",
    description: "The projected cost for the 'Warehouse Ext' location is tracking 35% above the originally planned budget due to unexpected security and permitting requirements.",
    category: "Budget",
    financialImpact: 8200,
    affectedScenes: ["11", "12", "15"],
  },
  {
    id: "insight-003",
    title: "Equipment Utilization Opportunity",
    description: "The 50ft Technocrane is scheduled for a full week rental, but only utilized in scenes shot on Tuesday and Friday. Converting to daily rentals or rescheduling scenes could yield savings.",
    category: "Equipment",
    financialImpact: 5800,
    recommendedAction: "Consolidate crane shots or shift to daily rental.",
  }
];

export const echoPointRisks: ProductionRisk[] = [
  {
    id: "risk-001",
    title: "Weather Disruption Probability",
    description: "A major storm front is projected to impact the region during the planned exterior shoot for the mountain road sequence.",
    severity: "Critical",
    probability: 0.81,
    financialExposure: 24800,
    status: "Open",
    affectedProductionArea: "Schedule / Locations",
    affectedScenes: ["77", "78", "80"],
    recommendedMitigation: "Prepare cover set 'Interior Cabin' for Days 21-22.",
    originatingAgent: "Risk Agent"
  },
  {
    id: "risk-002",
    title: "Actor Availability Conflict",
    description: "Lead actor's availability window closes exactly on Day 31. Any schedule overrun will trigger severe penalty rates or require recasting key pick-ups.",
    severity: "High",
    probability: 0.45,
    financialExposure: 55000,
    status: "Open",
    affectedProductionArea: "Cast",
    recommendedMitigation: "Prioritize all lead actor scenes before Day 28.",
    originatingAgent: "Scheduling Agent"
  },
  {
    id: "risk-003",
    title: "Continuity Conflict: Timeline",
    description: "Character A sustains a visible injury in Scene 34 (Day 12), but Scene 40 (Day 8) which takes place chronologically later in the story currently lacks prosthetic makeup requirements.",
    severity: "High",
    probability: 0.95,
    financialExposure: 3500,
    status: "Open",
    affectedProductionArea: "Makeup / Story",
    affectedScenes: ["34", "40"],
    recommendedMitigation: "Add prosthetic requirement to Scene 40.",
    originatingAgent: "Continuity Agent"
  },
  {
    id: "risk-004",
    title: "Location Overtime Exposure",
    description: "The schedule for Day 18 is extremely dense. Historical velocity suggests a high probability of entering 2nd meal penalties and location overtime.",
    severity: "High",
    probability: 0.65,
    financialExposure: 12000,
    status: "Open",
    affectedProductionArea: "Budget / Schedule",
    affectedScenes: ["55", "56", "57"],
    originatingAgent: "Producer Agent"
  },
  {
    id: "risk-005",
    title: "Critical Prop Sourcing",
    description: "The hero prop vehicle for the finale has not yet cleared customs and may not arrive by the scheduled shoot date.",
    severity: "Medium",
    probability: 0.30,
    financialExposure: 8000,
    status: "Open",
    affectedProductionArea: "Art Dept / Props",
  },
  {
    id: "risk-006",
    title: "Excessive Turnaround Violation",
    description: "Current scheduling between Day 14 and Day 15 violates SAG turnaround minimums for supporting cast.",
    severity: "Medium",
    probability: 0.85,
    financialExposure: 6500,
    status: "Mitigated",
    affectedProductionArea: "Cast",
  },
  {
    id: "risk-007",
    title: "Wardrobe Continuity",
    description: "Scene 12 requires a torn jacket, but the clean version is needed for Scene 84 which shoots later.",
    severity: "Medium",
    probability: 1.0,
    financialExposure: 1500,
    status: "Open",
    affectedProductionArea: "Wardrobe",
  }
];

export const echoPointAgentActivity: AgentActivity[] = [
  {
    id: "act-001",
    agent: "Producer Agent",
    activity: "Detected projected budget variance of $217,300.",
    category: "Analysis",
    status: "Completed",
    timestamp: "2 minutes ago",
    isDemoFixture: true,
  },
  {
    id: "act-002",
    agent: "Scheduling Agent",
    activity: "Identified a potential location consolidation opportunity for Scenes 42, 44, and 47.",
    category: "Analysis",
    status: "Completed",
    timestamp: "15 minutes ago",
    isDemoFixture: true,
  },
  {
    id: "act-003",
    agent: "Risk Agent",
    activity: "Flagged 81% weather disruption probability for exterior mountain road sequence.",
    category: "Analysis",
    status: "Completed",
    timestamp: "1 hour ago",
    isDemoFixture: true,
  },
  {
    id: "act-004",
    agent: "Continuity Agent",
    activity: "Detected missing prosthetic makeup requirement in Scene 40.",
    category: "Analysis",
    status: "Completed",
    timestamp: "3 hours ago",
    isDemoFixture: true,
  },
  {
    id: "act-005",
    agent: "Optimizer Agent",
    activity: "Prepared a projected optimization scenario requiring human review.",
    category: "Recommendation",
    status: "Pending",
    timestamp: "Just now",
    isDemoFixture: true,
  },
  {
    id: "act-006",
    agent: "Director Agent",
    activity: "Identified a production-impact consideration related to timeline continuity between Scene 34 and 40.",
    category: "Analysis",
    status: "Completed",
    timestamp: "4 hours ago",
    isDemoFixture: true,
  },
];

export const echoPointRecommendations: ProductionRecommendation[] = [
  {
    id: "rec-001",
    title: "Consolidate Exterior Warehouse Scenes",
    explanation: "Moving scenes 42, 44, and 47 to Day 16 allows for release of the location two days early and reduces company moves.",
    originatingAgent: "Optimizer Agent",
    approvalState: "Pending Review",
    confidence: 0.92,
    impact: {
      projectedSavings: 14500,
      projectedScheduleDaysSaved: 1,
      projectedRiskReductionCount: 1,
    },
    timestamp: "Just now",
    isDemoFixture: true,
  },
  {
    id: "rec-002",
    title: "Activate Weather Cover Set (Interior Cabin)",
    explanation: "Due to 81% weather risk on Day 21, preemptively activating the cover set schedule avoids a lost shoot day.",
    originatingAgent: "Optimizer Agent",
    approvalState: "Pending Review",
    confidence: 0.88,
    impact: {
      projectedSavings: 24800, // Avoiding the financial exposure
      projectedRiskReductionCount: 2,
    },
    timestamp: "15 minutes ago",
    isDemoFixture: true,
  },
  {
    id: "rec-003",
    title: "Shift Technocrane Rental to Daily",
    explanation: "Current schedule only requires the crane on Tuesday and Friday. Switching to a daily rental is more cost-effective than the weekly rate.",
    originatingAgent: "Producer Agent",
    approvalState: "Approved",
    confidence: 0.95,
    impact: {
      projectedSavings: 5800,
    },
    timestamp: "Yesterday",
    isDemoFixture: true,
  }
];
