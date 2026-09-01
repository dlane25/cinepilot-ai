import { 
  ProductionAnalysisResponse, 
  ProductionRisk, 
  ProductionInsight, 
  ProductionRecommendation,
  Severity,
  Production
} from "../../types";

export function mapLiveRisks(response: ProductionAnalysisResponse): ProductionRisk[] {
  return response.director_analysis.risk_observations.map((risk, index) => ({
    id: `risk-live-${index}`,
    title: risk.title,
    description: risk.description,
    severity: risk.severity as Severity,
    probability: risk.probability,
    financialExposure: risk.financial_exposure,
    status: "Open" as const,
    affectedProductionArea: risk.affected_production_area,
    recommendedMitigation: risk.recommended_mitigation,
    originatingAgent: "Director Agent"
  }));
}

export function mapLiveInsights(response: ProductionAnalysisResponse): ProductionInsight[] {
  const insights: ProductionInsight[] = [];
  
  response.producer_analysis.cost_concerns.map((concern, index) => {
    // Flatten if is array of strings due to union typed pydantic
    const desc = Array.isArray(concern) ? concern.join(", ") : concern;
    insights.push({
      id: `insight-live-concern-${index}`,
      title: "Cost Concern Detected",
      description: desc,
      category: "Budget" as const,
      financialImpact: response.producer_analysis.financial_exposure
    });
  });

  response.producer_analysis.expensive_requirements.map((req, index) => {
    insights.push({
      id: `insight-live-req-${index}`,
      title: "High-Spend Trigger Identified",
      description: `Requirement '${req}' increases overall production financial exposure.`,
      category: "Equipment" as const
    });
  });

  return insights;
}

export function mapLiveRecommendations(response: ProductionAnalysisResponse): ProductionRecommendation[] {
  return response.producer_analysis.optimization_opportunities.map((opp, index) => ({
    id: `rec-live-${index}`,
    title: opp.title,
    explanation: opp.description,
    originatingAgent: "Producer Agent",
    approvalState: "Pending Review" as const,
    confidence: opp.confidence,
    impact: {
      projectedSavings: opp.estimated_savings,
      projectedScheduleDaysSaved: response.producer_analysis.schedule_implications ? 1 : undefined
    },
    timestamp: "Just Now",
    isDemoFixture: false
  }));
}

export function mapLiveProduction(
  response: ProductionAnalysisResponse, 
  baseProduction: Production
): Production {
  return {
    ...baseProduction,
    financials: {
      ...baseProduction.financials,
      projectedSpend: baseProduction.financials.projectedSpend - response.producer_analysis.potential_savings
    }
  };
}
