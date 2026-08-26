export type ProductionStatus = "Pre-Production" | "Active Production" | "Post-Production" | "Wrapped";
export type ProductionPhase = "Prep" | "Principal Photography" | "Reshoots" | "VFX";

export interface ProductionMetadata {
  id: string;
  title: string;
  type: "Feature Film" | "Television" | "Commercial";
  status: ProductionStatus;
  currentPhase: ProductionPhase;
  director: string;
  producers: string[];
}

export interface ProductionFinancials {
  approvedBudget: number;
  projectedSpend: number;
  currency: string;
}

export interface ProductionSchedule {
  plannedShootingDays: number;
  currentShootingDay: number;
  estimatedRemainingDays: number;
}

export type Severity = "Critical" | "High" | "Medium" | "Low";

export interface ProductionRisk {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  probability: number; // 0.0 to 1.0
  financialExposure: number;
  status: "Open" | "Mitigated" | "Accepted";
  affectedProductionArea: string;
  affectedScenes?: string[];
  recommendedMitigation?: string;
  originatingAgent?: string;
}

export interface ProductionInsight {
  id: string;
  title: string;
  description: string;
  category: "Schedule" | "Budget" | "Logistics" | "Continuity" | "Equipment";
  financialImpact?: number;
  scheduleImpactDays?: number;
  affectedScenes?: string[];
  recommendedAction?: string;
}

export interface Production {
  metadata: ProductionMetadata;
  financials: ProductionFinancials;
  schedule: ProductionSchedule;
}
