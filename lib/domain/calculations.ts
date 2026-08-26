import { ProductionFinancials, ProductionRisk, ImpactProjection } from "../../types";

export function calculateBudgetVariance(financials: ProductionFinancials): number {
  return financials.projectedSpend - financials.approvedBudget;
}

export function calculateProjectedSavings(currentProjectedSpend: number, optimizedProjectedSpend: number): number {
  return currentProjectedSpend - optimizedProjectedSpend;
}

export function calculateShootingDaysSaved(currentDays: number, optimizedDays: number): number {
  return currentDays - optimizedDays;
}

export function calculateHighRiskEventReduction(currentRiskCount: number, optimizedRiskCount: number): number {
  return currentRiskCount - optimizedRiskCount;
}

export function countHighRiskEvents(risks: ProductionRisk[]): number {
  return risks.filter(r => r.severity === "Critical" || r.severity === "High").length;
}

export function calculateAggregateFinancialExposure(risks: ProductionRisk[]): number {
  return risks.reduce((total, risk) => total + risk.financialExposure, 0);
}

export function generateImpactProjection(
  currentSpend: number,
  optimizedSpend: number,
  currentDays: number,
  optimizedDays: number,
  currentHighRiskCount: number,
  optimizedHighRiskCount: number
): ImpactProjection {
  return {
    projectedSpend: optimizedSpend,
    projectedSavings: calculateProjectedSavings(currentSpend, optimizedSpend),
    projectedShootingDays: optimizedDays,
    shootingDaysSaved: calculateShootingDaysSaved(currentDays, optimizedDays),
    projectedHighRiskEvents: optimizedHighRiskCount,
    highRiskEventsReduced: calculateHighRiskEventReduction(currentHighRiskCount, optimizedHighRiskCount)
  };
}
