import React from "react";
import { ProductionInsight, AgentActivity } from "../../types";
import { formatCurrency } from "../../lib/utils/format";
import { Bot, Lightbulb, TrendingDown, Clock, ShieldAlert } from "lucide-react";

interface IntelligenceFeedProps {
  insights: ProductionInsight[];
  activities: AgentActivity[];
}

export function IntelligenceFeed({ insights, activities }: IntelligenceFeedProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Production Insights Section */}
      <section className="flex flex-col">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          Production Intelligence
        </h2>
        
        <div className="flex-1 space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-slate-100 font-medium">{insight.title}</h4>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-xs font-medium text-slate-300">
                  {insight.category}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                {insight.description}
              </p>
              
              {(insight.financialImpact || insight.scheduleImpactDays || insight.affectedScenes) && (
                <div className="bg-slate-950/50 rounded-lg p-3 text-sm grid grid-cols-2 gap-y-2 border border-slate-800/50">
                  {insight.financialImpact && (
                    <div>
                      <span className="text-slate-500 text-xs block mb-0.5">Potential Impact</span>
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5" />
                        {formatCurrency(insight.financialImpact)}
                      </span>
                    </div>
                  )}
                  {insight.scheduleImpactDays && (
                    <div>
                      <span className="text-slate-500 text-xs block mb-0.5">Schedule Impact</span>
                      <span className="text-sky-400 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {insight.scheduleImpactDays} {insight.scheduleImpactDays === 1 ? "day" : "days"} saved
                      </span>
                    </div>
                  )}
                  {insight.affectedScenes && (
                    <div className="col-span-2">
                      <span className="text-slate-500 text-xs block mb-0.5">Affected Scenes</span>
                      <span className="text-slate-300">{insight.affectedScenes.join(", ")}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Agent Activity Section */}
      <section className="flex flex-col">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            Agent Activity
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded-md">
            Demo Fixture
          </span>
        </h2>

        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 bottom-0 left-8 w-px bg-slate-800" />
          
          <div className="space-y-6 relative z-10">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-slate-950 border-2 border-indigo-500/30 flex items-center justify-center shrink-0 z-10 relative">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-indigo-300 text-sm">{activity.agent}</span>
                    <span className="text-xs text-slate-500">{activity.timestamp}</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {activity.activity}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-800/50 flex justify-center">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              This activity represents simulated deterministic analysis.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
