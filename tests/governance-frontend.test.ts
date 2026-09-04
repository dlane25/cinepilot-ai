import { describe, it, expect } from "vitest";
import { AgentRecommendation } from "../types";

// Client-side calculations replica helper for testing
function computeImpactTotals(
  baselineSpend: number,
  baselineDays: number,
  baselineRisks: number,
  recommendations: AgentRecommendation[],
  approvedRecs: Record<string, "Approved" | "Rejected" | "Pending">
) {
  let approvedSavings = 0.0;
  let approvedDaysSaved = 0;
  let approvedRisksReduced = 0;

  recommendations.forEach(rec => {
    const state = approvedRecs[rec.recommendation_id] || "Pending";
    if (state === "Approved") {
      approvedSavings += rec.projected_savings;
      approvedDaysSaved += rec.shooting_days_saved;
      approvedRisksReduced += rec.risks_reduced;
    }
  });

  return {
    approvedSavings,
    approvedDaysSaved,
    approvedRisksReduced,
    committedSpend: baselineSpend - approvedSavings,
    committedDays: baselineDays - approvedDaysSaved,
    committedRisks: Math.max(0, baselineRisks - approvedRisksReduced)
  };
}

const mockRecommendations: AgentRecommendation[] = [
  {
    recommendation_id: "rec-opt-crane-001",
    originating_agent: "Producer Agent",
    title: "Convert weekly Technocrane rental to daily",
    explanation: "Save weekly crane fees.",
    confidence: 0.95,
    projected_savings: 5800.0,
    shooting_days_saved: 0,
    risks_reduced: 0,
    affected_scenes: ["42"]
  },
  {
    recommendation_id: "rec-opt-sched-002",
    originating_agent: "Scheduler Agent",
    title: "Consolidate adjacent night warehouse shoots",
    explanation: "Save days.",
    confidence: 0.90,
    projected_savings: 120080.0,
    shooting_days_saved: 2,
    risks_reduced: 1,
    affected_scenes: ["42", "43"]
  }
];

describe("Milestone 7 Frontend Human Governance calculations", () => {
  it("should calculate zero approved savings when all recommendations are Pending", () => {
    const approvedRecs: Record<string, "Approved" | "Rejected" | "Pending"> = {
      "rec-opt-crane-001": "Pending",
      "rec-opt-sched-002": "Pending"
    };

    const totals = computeImpactTotals(2617300.0, 31, 7, mockRecommendations, approvedRecs);
    expect(totals.approvedSavings).toBe(0.0);
    expect(totals.approvedDaysSaved).toBe(0);
    expect(totals.approvedRisksReduced).toBe(0);
    expect(totals.committedSpend).toBe(2617300.0);
  });

  it("should calculate correct approved committed metrics when an item is APPROVED", () => {
    const approvedRecs: Record<string, "Approved" | "Rejected" | "Pending"> = {
      "rec-opt-crane-001": "Approved",
      "rec-opt-sched-002": "Pending"
    };

    const totals = computeImpactTotals(2617300.0, 31, 7, mockRecommendations, approvedRecs);
    expect(totals.approvedSavings).toBe(5800.0);
    expect(totals.approvedDaysSaved).toBe(0);
    expect(totals.committedSpend).toBe(2617300.0 - 5800.0);
  });

  it("should recompute correctly when multiple recommendations are Approved", () => {
    const approvedRecs: Record<string, "Approved" | "Rejected" | "Pending"> = {
      "rec-opt-crane-001": "Approved",
      "rec-opt-sched-002": "Approved"
    };

    const totals = computeImpactTotals(2617300.0, 31, 7, mockRecommendations, approvedRecs);
    expect(totals.approvedSavings).toBe(125880.0);
    expect(totals.approvedDaysSaved).toBe(2);
    expect(totals.approvedRisksReduced).toBe(1);
    expect(totals.committedSpend).toBe(2617300.0 - 125880.0);
  });
});
