import React from "react";
import { ProductionAnalysisResponse } from "../../types";
import { formatCurrency } from "../../lib/utils/format";
import { Cpu, Film, DollarSign, Calendar, ShieldAlert } from "lucide-react";

interface LiveAnalysisSummaryProps {
  response: ProductionAnalysisResponse;
}

export function LiveAnalysisSummary({ response }: LiveAnalysisSummaryProps) {
  const { director_analysis, producer_analysis, metadata, scene_number } = response;

  return (
    <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-6 mb-8 relative overflow-hidden shadow-lg shadow-indigo-500/5">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-indigo-500/3s rounded-full blur-3xl pointer-events-none" />

      {/* Header with Live badge */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold tracking-wider text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                LIVE AI ANALYSIS
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-slate-400 text-xs font-medium">Scene {scene_number}</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Autonomous Production Optimization Report</h2>
          </div>
        </div>
        
        {/* Agent version / timestamp */}
        <div className="text-right text-xs text-slate-500">
          <p>Director: v{metadata.director_agent_version} | Producer: v{metadata.producer_agent_version}</p>
          <p className="mt-0.5">Analyzed: {new Date(metadata.timestamp).toLocaleString()}</p>
        </div>
      </div>

      {/* Side-by-Side Agent breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Director Agent Card */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4 text-indigo-400 font-semibold border-b border-slate-800/50 pb-2">
            <Film className="w-5 h-5" />
            <h3>Director Agent Intelligence</h3>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 block">Scene Complexity</span>
                <span className={`text-sm font-semibold uppercase ${
                  director_analysis.scene_complexity === 'High' ? 'text-rose-400' :
                  director_analysis.scene_complexity === 'Medium' ? 'text-amber-400' :
                  'text-slate-300'
                }`}>
                  {director_analysis.scene_complexity}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Location Requirements</span>
                <span className="text-sm font-medium text-slate-300 line-clamp-1">
                  {director_analysis.location_requirements.join(", ") || "None"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-1">Staging & Physical Considerations</span>
              <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/30">
                {director_analysis.physical_production_considerations}
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-1">Department Requirements</span>
              <div className="flex flex-wrap gap-1.5">
                {director_analysis.production_requirements.map((req, i) => (
                  <span key={i} className="text-xs bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    {req}
                  </span>
                ))}
                {director_analysis.production_requirements.length === 0 && (
                  <span className="text-xs text-slate-600 italic">None identified</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-1">Stunt / Cast Requirements</span>
              <div className="flex flex-wrap gap-1.5">
                {director_analysis.cast_background_requirements.map((cast, i) => (
                  <span key={i} className="text-xs bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    {cast}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Producer Agent Card */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4 text-emerald-400 font-semibold border-b border-slate-800/50 pb-2">
            <DollarSign className="w-5 h-5" />
            <h3>Producer Agent Intelligence</h3>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 block">Potential Savings</span>
                <span className="text-sm font-bold text-emerald-400">
                  {formatCurrency(producer_analysis.potential_savings)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Calculated Exposure</span>
                <span className="text-sm font-medium text-rose-400">
                  {formatCurrency(producer_analysis.financial_exposure)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-1">Cost Overrun Concerns</span>
              <ul className="text-sm text-slate-400 list-disc list-inside space-y-1 bg-slate-900/50 p-3 rounded-lg border border-slate-800/30">
                {producer_analysis.cost_concerns.map((concern, i) => {
                  const desc = Array.isArray(concern) ? concern.join(", ") : concern;
                  return (
                    <li key={i} className="line-clamp-1">{desc}</li>
                  );
                })}
                {producer_analysis.cost_concerns.length === 0 && (
                  <li className="text-slate-500 italic list-none">No cost overruns flagged.</li>
                )}
              </ul>
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-1">Expensive Scene Triggers</span>
              <div className="flex flex-wrap gap-1.5">
                {producer_analysis.expensive_requirements.map((trig, i) => (
                  <span key={i} className="text-xs bg-slate-900 border border-slate-800 text-rose-300 px-2.5 py-0.5 rounded">
                    {trig}
                  </span>
                ))}
                {producer_analysis.expensive_requirements.length === 0 && (
                  <span className="text-xs text-slate-600 italic">None flagged</span>
                )}
              </div>
            </div>

            {producer_analysis.schedule_implications && (
              <div>
                <span className="text-xs text-slate-500 block mb-1">Schedule Implications</span>
                <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {producer_analysis.schedule_implications}
                </div>
              </div>
            )}
            
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                Human-in-the-Loop Approval Required
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
