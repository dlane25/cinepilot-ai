"use client";

import React, { useState } from "react";
import { ProductionOptimizationResponse } from "../../types/optimization";
import { formatCurrency } from "../../lib/utils/format";
import {
  Cpu,
  Play,
  Loader2,
  AlertCircle,
  CheckCircle,
  ShieldAlert,
  Sparkles
} from "lucide-react";

export function MultiAgentOptimization() {
  const [loading, setLoading] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Holds our retrieved synthesized proposal response
  const [optimizationData, setOptimizationData] = useState<ProductionOptimizationResponse | null>(null);
  const [approvedRecs, setApprovedRecs] = useState<Record<string, "Approved" | "Rejected" | "Pending">>({});

  // Simulated live scanning steps representing specialized agent collaborations E2E
  const SCAN_STEPS = [
    { name: "Director Agent", log: "Evaluating screenplay Scene 42 creative feasibility and wet-down staging constraints..." },
    { name: "Producer Agent", log: "Analyzing Technocrane lease overruns ($18,500 exposure) and daily rate substitutions..." },
    { name: "Scheduler Agent", log: "Recalculating calendar tracks to compress planned 31 days down to 29..." },
    { name: "Continuity Agent", log: "CRITICAL ALERT: Scene 42 (wet/injured Maya) adjacent to Scene 1 (dry/clean) creates visual clash!" },
    { name: "Risk Agent", log: "Checking scaffold structural integrity and water safety wrangling margins..." },
    { name: "Optimizer Agent", log: "Synthesizing tradeoffs, isolating overlapping savings, and writing coordinated proposal..." }
  ];

  const handleRunOptimization = async () => {
    setLoading(true);
    setError(null);
    setOptimizationData(null);
    setApprovedRecs({});

    // Simulate real E2E multi-agent pipeline logs so the user sees the collaboration step-by-step
    try {
      for (let i = 0; i < SCAN_STEPS.length; i++) {
        setActiveStep(i);
        await new Promise(r => setTimeout(r, 1000));
      }

      const res = await fetch("/api/production-optimization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          production_id: "prod-echopoint-001",
          baseline_spend: 2617300.0,
          baseline_days: 31,
          baseline_risks: 7
        }),
      });

      if (!res.ok) {
        throw new Error("FastAPI optimization route returned an error state.");
      }

      const data = (await res.json()) as ProductionOptimizationResponse;
      setOptimizationData(data);

      // Initialize states
      const states: Record<string, "Approved" | "Rejected" | "Pending"> = {};
      data.proposal.recommendations.forEach(rec => {
        states[rec.recommendation_id] = "Pending";
      });
      setApprovedRecs(states);

    } catch (err: unknown) {
      console.error("[FRONTEND] Live Multi-Agent Optimization failed:", err);
      setError(err instanceof Error ? err.message : "Failed to establish a secure connection with the multi-agent optimization service.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRecommendation = async (id: string) => {
    setApprovedRecs(prev => ({ ...prev, [id]: "Approved" }));

    try {
      // Persist the human governance decision inside ClickHouse Cloud over standard MCP!
      await fetch("/api/production-memory/decisions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recommendation_id: id,
          production_id: "prod-echopoint-001",
          decision: "Approved",
          notes: "Approved under human-in-the-loop multi-agent optimization review."
        }),
      });
    } catch (err) {
      console.error("[FRONTEND] ClickHouse decision log failed:", err);
    }
  };

  const handleRejectRecommendation = async (id: string) => {
    setApprovedRecs(prev => ({ ...prev, [id]: "Rejected" }));

    try {
      // Persist the human governance decision inside ClickHouse Cloud over standard MCP!
      await fetch("/api/production-memory/decisions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recommendation_id: id,
          production_id: "prod-echopoint-001",
          decision: "Rejected",
          notes: "Rejected under human-in-the-loop multi-agent optimization review."
        }),
      });
    } catch (err) {
      console.error("[FRONTEND] ClickHouse decision log failed:", err);
    }
  };

  return (
    <div className="space-y-8">

      {/* Header and trigger action */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            Coordinated Multi-Agent Optimization Suite
          </h2>
          <p className="text-xs text-slate-500 font-medium">Coordinate specialized production agents, resolve logistical conflicts, and calculate aggregated budget impacts</p>
        </div>

        <div>
          <button
            onClick={handleRunOptimization}
            disabled={loading}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-500 border border-indigo-500/20 shadow-lg shadow-indigo-600/10 flex items-center gap-2 transition-all active:scale-95 disabled:active:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                Orchestrating agents...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-white" />
                Run Coordinated Optimization
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading simulated progress blocks */}
      {loading && (
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-6 space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Live Agent Scan logs</h4>
          <div className="space-y-3">
            {SCAN_STEPS.map((step, idx) => {
              const isCurrent = activeStep === idx;
              const isCompleted = activeStep > idx;
              return (
                <div key={idx} className={`p-3 rounded-lg border flex items-center justify-between text-left transition-all ${
                  isCurrent ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300 animate-pulse" :
                  isCompleted ? "bg-slate-900/40 border-slate-850 text-slate-500" :
                  "bg-slate-950 border-transparent text-slate-700"
                }`}>
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-800" />
                    )}
                    <div>
                      <span className="text-xs font-bold block">{step.name}</span>
                      <p className="text-[10px] mt-0.5 line-clamp-1">{step.log}</p>
                    </div>
                  </div>
                  <span className="text-[9px] uppercase font-bold">
                    {isCompleted ? "Completed" : isCurrent ? "Active" : "Waiting"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Results Board */}
      {optimizationData && (
        <div className="space-y-8 animate-fadeIn">

          {/* Comparison and proposal stats */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Summary card */}
            <div className="xl:col-span-2 bg-slate-900 border border-indigo-500/20 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                Synthesized Coordinated Proposal
              </div>
              <h3 className="text-base font-bold text-white tracking-tight mb-2">Optimal Scenario Synthesis</h3>
              <p className="text-sm text-slate-400 leading-relaxed bg-slate-950/40 p-4 rounded-lg border border-slate-850">
                {optimizationData.proposal.summary}
              </p>
            </div>

            {/* Impact stats compared */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Calculated Impact Summary</h4>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded border border-slate-850">
                    <div className="text-[10px] text-slate-500 block uppercase font-bold">Projected Spend</div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block line-through">{formatCurrency(optimizationData.impact.baseline_projected_spend)}</span>
                      <span className="text-sm font-bold text-emerald-400">{formatCurrency(optimizationData.impact.optimized_projected_spend)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded border border-slate-850">
                    <div className="text-[10px] text-slate-500 block uppercase font-bold">Shooting Days</div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block line-through">{optimizationData.impact.baseline_shooting_days} Days</span>
                      <span className="text-sm font-bold text-white">{optimizationData.impact.optimized_shooting_days} Days</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded border border-slate-850">
                    <div className="text-[10px] text-slate-500 block uppercase font-bold">High-Risk Events</div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block line-through">{optimizationData.impact.baseline_high_risk_events} Events</span>
                      <span className="text-sm font-bold text-rose-400">{optimizationData.impact.optimized_high_risk_events} Events</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-850 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400">Total savings:</span>
                <span className="text-base font-bold text-emerald-400">
                  {formatCurrency(optimizationData.impact.total_potential_savings)}
                </span>
              </div>
            </div>

          </div>

          {/* Tradeoffs & Disagreements Section (Crucial!) */}
          {optimizationData.proposal.conflicts.length > 0 && (
            <div className="bg-slate-900 border border-rose-500/20 rounded-xl p-6">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Agentic Conflicts & Logistical Tradeoffs Detected
              </h4>

              <div className="space-y-4">
                {optimizationData.proposal.conflicts.map((conflict, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-850 p-5 rounded-lg">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        CONFLICT {conflict.conflict_id}
                      </span>
                      <span className="text-slate-600 text-xs">•</span>
                      <span className="text-xs font-bold text-slate-300">
                        {conflict.agents.join(" vs ")}
                      </span>
                    </div>

                    <h5 className="text-sm font-bold text-white mb-2">{conflict.title}</h5>
                    <p className="text-xs text-slate-400 mb-4 leading-normal bg-slate-900/50 p-3 rounded border border-slate-850/50">
                      <span className="text-slate-500 font-bold uppercase block text-[9px] mb-1">Clash Description</span>
                      {conflict.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-900/40 p-3 rounded border border-slate-850">
                        <span className="text-slate-500 font-bold uppercase block text-[9px] mb-1">Tradeoff / Compromise Metrics</span>
                        <p className="text-slate-300 leading-normal">{conflict.tradeoff_explanation}</p>
                      </div>
                      <div className="bg-slate-900/40 p-3 rounded border border-slate-850">
                        <span className="text-slate-500 font-bold uppercase block text-[9px] mb-1">Optimizer Recommendation</span>
                        <p className="text-indigo-400 font-semibold mb-1">Recommended Option ID: {conflict.recommended_option}</p>
                        <p className="text-slate-400 leading-normal">
                          Prioritizing the non-destructive state prevents costly screen continuity errors while sacrificing minor schedule grouping overruns.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agreements Consensus */}
          {optimizationData.proposal.agreements.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Consensuses & Joint Opportunities</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {optimizationData.proposal.agreements.map((agree, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-850 p-4 rounded-lg">
                    <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {agree.agents.join(" + ")}
                    </div>
                    <h5 className="text-xs font-bold text-white mb-1">{agree.title}</h5>
                    <p className="text-xs text-slate-400 leading-normal">{agree.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Individual Human Approval Queue */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Human Governance Review Queue</h4>
            <div className="space-y-4">
              {optimizationData.proposal.recommendations.map((rec, i) => {
                const state = approvedRecs[rec.recommendation_id] || "Pending";
                return (
                  <div key={i} className="bg-slate-950 border border-slate-850 p-5 rounded-lg flex flex-wrap md:flex-nowrap justify-between gap-6 hover:border-slate-700 transition-colors">
                    <div className="space-y-2 flex-1 min-w-[300px]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-wider">
                          {rec.originating_agent}
                        </span>
                        <span className="text-slate-600 text-xs">•</span>
                        <span className="text-slate-500 text-[10px]">ID: {rec.recommendation_id}</span>
                      </div>

                      <h5 className="text-sm font-bold text-white">{rec.title}</h5>
                      <p className="text-xs text-slate-400 leading-normal">{rec.explanation}</p>

                      <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        <span>Savings: <span className="text-emerald-400 font-bold">{rec.projected_savings > 0 ? formatCurrency(rec.projected_savings) : "None"}</span></span>
                        <span>Days Saved: <span className="text-white font-bold">{rec.shooting_days_saved}</span></span>
                        <span>Risks reduced: <span className="text-rose-400 font-bold">{rec.risks_reduced}</span></span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end gap-3 flex-shrink-0 min-w-[150px]">
                      {/* State badge */}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${
                        state === "Approved" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                        state === "Rejected" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                        "bg-amber-500/10 border-amber-500/20 text-amber-300 animate-pulse"
                      }`}>
                        {state}
                      </span>

                      {/* Approval buttons */}
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => handleApproveRecommendation(rec.recommendation_id)}
                          disabled={state !== "Pending"}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 disabled:text-slate-600 text-white text-xs font-semibold py-1.5 px-3 rounded transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRecommendation(rec.recommendation_id)}
                          disabled={state !== "Pending"}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900/50 disabled:text-slate-700 text-white text-xs font-semibold py-1.5 px-3 rounded border border-slate-700 disabled:border-slate-800 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
