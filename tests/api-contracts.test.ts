import { describe, it, expect } from "vitest";
import { 
  mapLiveRisks, 
  mapLiveInsights, 
  mapLiveRecommendations, 
  mapLiveProduction 
} from "../lib/mappers/production-analysis";
import { ProductionAnalysisResponse, Production } from "../types";

const mockResponse: ProductionAnalysisResponse = {
  production_id: "prod-echopoint-001",
  scene_number: "42",
  director_analysis: {
    scene_complexity: "High",
    location_requirements: ["EXT. INDUSTRIAL WAREHOUSE - NIGHT"],
    production_requirements: ["Rain effects setup", "Police lighting rigs", "Two active picture vehicles", "50ft Technocrane (rental)"],
    cast_background_requirements: ["Lead: Maya", "Lead: Detective Cole", "48 background extras", "2 stunt drivers"],
    physical_production_considerations: "Heavy night shoot requiring wet down setups.",
    risk_observations: [
      {
        title: "Weather Exposure: Rain Rig Water Runoff",
        description: "The heavy rain effects may cause localized pooling/flooding near the warehouse entrance.",
        severity: "High",
        probability: 0.65,
        financial_exposure: 12000.0,
        affected_production_area: "Budget / Schedule",
        recommended_mitigation: "Arrange for drainage pumps."
      }
    ],
    production_notes: "Climax scene."
  },
  producer_analysis: {
    cost_concerns: ["Technocrane rental overhead", "Union night premium rates"],
    expensive_requirements: ["50ft Technocrane", "48 Background Extras"],
    financial_exposure: 12000.0,
    optimization_opportunities: [
      {
        title: "Convert weekly crane rental to Daily",
        description: "The 50ft Technocrane is currently scheduled on a full-week rental but is only utilized for Scene 42.",
        recommended_action: "Modify the rental agreement to a daily rate for Day 14.",
        estimated_savings: 5800.0,
        confidence: 0.95
      }
    ],
    potential_savings: 5800.0,
    schedule_implications: "Saves SAG night turnaround fees.",
    human_approval_required: true
  },
  metadata: {
    director_agent_version: "1.0.0",
    producer_agent_version: "1.0.0",
    timestamp: "2026-08-26T21:00:00Z"
  }
};

const baseProduction: Production = {
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

describe("Milestone 3 API Contract Mapping Utility Tests", () => {
  it("should correctly map live risk observations to ProductionRisk UI types", () => {
    const risks = mapLiveRisks(mockResponse);
    expect(risks).toHaveLength(1);
    expect(risks[0].id).toBe("risk-live-0");
    expect(risks[0].title).toBe("Weather Exposure: Rain Rig Water Runoff");
    expect(risks[0].severity).toBe("High");
    expect(risks[0].probability).toBe(0.65);
    expect(risks[0].financialExposure).toBe(12000.0);
    expect(risks[0].originatingAgent).toBe("Director Agent");
  });

  it("should correctly map live cost concerns and triggers to ProductionInsight types", () => {
    const insights = mapLiveInsights(mockResponse);
    // Cost concerns (2) + expensive triggers (2) = 4 insights
    expect(insights).toHaveLength(4);
    expect(insights[0].id).toBe("insight-live-concern-0");
    expect(insights[0].category).toBe("Budget");
    expect(insights[0].financialImpact).toBe(12000.0);
    expect(insights[2].id).toBe("insight-live-req-0");
    expect(insights[2].category).toBe("Equipment");
  });

  it("should correctly map live opportunities to ProductionRecommendation types", () => {
    const recommendations = mapLiveRecommendations(mockResponse);
    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].id).toBe("rec-live-0");
    expect(recommendations[0].confidence).toBe(0.95);
    expect(recommendations[0].approvalState).toBe("Pending Review");
    expect(recommendations[0].impact.projectedSavings).toBe(5800.0);
  });

  it("should correctly calculate updated live financials by applying potential savings", () => {
    const liveProduction = mapLiveProduction(mockResponse, baseProduction);
    expect(liveProduction.financials.projectedSpend).toBe(2617300 - 5800);
  });
});
