import React from "react";
import { Production, ProductionRisk } from "../../types";
import { formatCurrency } from "../../lib/utils/format";
import { countHighRiskEvents, calculateBudgetVariance } from "../../lib/domain/calculations";

interface ProductionHealthProps {
  production: Production;
  risks: ProductionRisk[];
}

export function ProductionHealth({ production, risks }: ProductionHealthProps) {
  const variance = calculateBudgetVariance(production.financials);
  const highRiskCount = countHighRiskEvents(risks);
  const variancePercent = (variance / production.financials.approvedBudget) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Budget Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-medium text-slate-400 mb-1">Approved Budget</h3>
        <p className="text-2xl font-bold text-white mb-2">
          {formatCurrency(production.financials.approvedBudget)}
        </p>
        <div className="text-xs text-slate-500">
          Baseline financial plan
        </div>
      </div>

      {/* Spend / Variance Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-medium text-slate-400 mb-1">Projected Spend</h3>
        <p className="text-2xl font-bold text-white mb-2">
          {formatCurrency(production.financials.projectedSpend)}
        </p>
        <div className="text-xs flex items-center gap-1.5">
          <span className="text-rose-400 font-medium">+{formatCurrency(variance)}</span>
          <span className="text-slate-500">({variancePercent.toFixed(1)}% variance)</span>
        </div>
      </div>

      {/* Schedule Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-medium text-slate-400 mb-1">Schedule Status</h3>
        <p className="text-2xl font-bold text-white mb-2">
          Day {production.schedule.currentShootingDay} <span className="text-slate-500 text-lg font-normal">of {production.schedule.plannedShootingDays}</span>
        </p>
        <div className="text-xs text-slate-500">
          {production.schedule.estimatedRemainingDays} estimated days remaining
        </div>
      </div>

      {/* Risk Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        <h3 className="text-sm font-medium text-slate-400 mb-1">Production Risk</h3>
        <p className="text-2xl font-bold text-white mb-2 flex items-baseline gap-2">
          {highRiskCount}
          <span className="text-sm font-normal text-slate-500">High/Critical Events</span>
        </p>
        <div className="text-xs text-rose-400 font-medium">
          Requires attention
        </div>
      </div>
    </div>
  );
}
