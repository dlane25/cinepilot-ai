import React from "react";
import { Production, ImpactProjection } from "../../types";
import { formatCurrency } from "../../lib/utils/format";
import { ArrowRight, Zap, Target } from "lucide-react";

interface ImpactSummaryProps {
  production: Production;
  projection: ImpactProjection;
}

export function ImpactSummary({ production, projection }: ImpactSummaryProps) {
  return (
    <section className="mb-12 bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-900/50 rounded-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Target className="w-64 h-64 text-indigo-400" />
      </div>
      
      <div className="p-6 md:p-8 relative z-10">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-indigo-400" />
          Projected Optimization Impact
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Spend */}
          <div className="flex flex-col">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Projected Spend</h3>
            <div className="flex items-center gap-4">
              <div className="text-xl text-slate-300 line-through decoration-slate-500">
                {formatCurrency(production.financials.projectedSpend)}
              </div>
              <ArrowRight className="w-5 h-5 text-indigo-500/50" />
              <div className="text-3xl font-bold text-white">
                {formatCurrency(projection.projectedSpend)}
              </div>
            </div>
            <div className="mt-2 text-sm font-medium text-emerald-400">
              Potential Savings: {formatCurrency(projection.projectedSavings)}
            </div>
          </div>

          {/* Schedule */}
          <div className="flex flex-col">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Shooting Days</h3>
            <div className="flex items-center gap-4">
              <div className="text-xl text-slate-300 line-through decoration-slate-500">
                {production.schedule.plannedShootingDays}
              </div>
              <ArrowRight className="w-5 h-5 text-indigo-500/50" />
              <div className="text-3xl font-bold text-white">
                {projection.projectedShootingDays}
              </div>
            </div>
            <div className="mt-2 text-sm font-medium text-sky-400">
              {projection.shootingDaysSaved} Days Saved
            </div>
          </div>

          {/* Risk */}
          <div className="flex flex-col">
            <h3 className="text-sm font-medium text-slate-400 mb-3">High-Risk Events</h3>
            <div className="flex items-center gap-4">
              <div className="text-xl text-slate-300 line-through decoration-slate-500">
                7 {/* Based on fixture initial state */}
              </div>
              <ArrowRight className="w-5 h-5 text-indigo-500/50" />
              <div className="text-3xl font-bold text-white">
                {projection.projectedHighRiskEvents}
              </div>
            </div>
            <div className="mt-2 text-sm font-medium text-amber-400">
              {projection.highRiskEventsReduced} Events Mitigated
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-indigo-500/10">
          <p className="text-xs text-indigo-300/70 max-w-3xl">
            This projection represents the cumulative impact if all pending recommendations are approved and successfully executed. It is generated deterministically for demonstration purposes and does not represent live autonomous execution.
          </p>
        </div>
      </div>
    </section>
  );
}
