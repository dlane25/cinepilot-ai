import { describe, it, expect } from "vitest";
import {
  calculateBudgetVariance,
  calculateProjectedSavings,
  calculateShootingDaysSaved,
  calculateHighRiskEventReduction,
  countHighRiskEvents,
  generateImpactProjection,
} from "../lib/domain/calculations";
import { ProductionRisk } from "../types";

describe("Production Domain Calculations", () => {
  it("should calculate correct budget variance (Expected: $217,300)", () => {
    const variance = calculateBudgetVariance({
      approvedBudget: 2400000,
      projectedSpend: 2617300,
      currency: "USD",
    });
    expect(variance).toBe(217300);
  });

  it("should calculate correct projected savings (Expected: $125,880)", () => {
    const savings = calculateProjectedSavings(2617300, 2491420);
    expect(savings).toBe(125880);
  });

  it("should calculate correct shooting-day improvement (Expected: 2)", () => {
    const daysSaved = calculateShootingDaysSaved(31, 29);
    expect(daysSaved).toBe(2);
  });

  it("should calculate correct high-risk-event reduction (Expected: 4)", () => {
    const riskReduction = calculateHighRiskEventReduction(7, 3);
    expect(riskReduction).toBe(4);
  });

  it("should correctly count high-risk events", () => {
    const mockRisks: Partial<ProductionRisk>[] = [
      { severity: "Critical" },
      { severity: "High" },
      { severity: "Medium" },
      { severity: "Low" },
      { severity: "High" },
    ];
    const count = countHighRiskEvents(mockRisks as ProductionRisk[]);
    expect(count).toBe(3);
  });

  it("should generate a consistent impact projection for ECHO POINT fixture", () => {
    const projection = generateImpactProjection(
      2617300, // current spend
      2491420, // optimized spend
      31,      // current days
      29,      // optimized days
      7,       // current high risk
      3        // optimized high risk
    );

    expect(projection.projectedSavings).toBe(125880);
    expect(projection.shootingDaysSaved).toBe(2);
    expect(projection.highRiskEventsReduced).toBe(4);
    expect(projection.projectedSpend).toBe(2491420);
  });
});
