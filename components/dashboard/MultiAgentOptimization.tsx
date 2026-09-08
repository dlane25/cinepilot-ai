"use client";

import React, { useState, useEffect } from "react";
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

interface MultiAgentOptimizationProps {
  approvedBudget?: number;
  onCommitImpact?: (savings: number, daysSaved: number, risksReduced: number) => void;
}

export function MultiAgentOptimization({ approvedBudget, onCommitImpact }: MultiAgentOptimizationProps = {}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Holds our retrieved synthesized proposal response
  const [optimizationData, setOptimizationData] = useState<ProductionOptimizationResponse | null>(null);

  // Track state of each recommendation ID: "Pending" | "Approved" | "Rejected"
  const [approvedRecs, setApprovedRecs] = useState<Record<string, "Approved" | "Rejected" | "Pending">>({});

  // Track optional human reasons/notes typed for each recommendation ID
  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({});

  // Confirmation modal active recommendation ID
  const [confirmingRecId, setConfirmingRecId] = useState<string | null>(null);
  const [confirmingAction, setConfirmingAction] = useState<"Approved" | "Rejected" | null>(null);

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
    setDecisionNotes({});
    setConfirmingRecId(null);
    setConfirmingAction(null);

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

  const triggerDecisionModal = (id: string, action: "Approved" | "Rejected") => {
    setConfirmingRecId(id);
    setConfirmingAction(action);
  };

  const submitHumanDecision = async () => {
    if (!confirmingRecId || !confirmingAction || !optimizationData) return;

    const recId = confirmingRecId;
    const action = confirmingAction;
    const notes = decisionNotes[recId] || `Committed ${action} via human-in-the-loop optimization queue.`;

    const recommendation = optimizationData.proposal.recommendations.find(r => r.recommendation_id === recId);
    if (!recommendation) return;

    // Optimistic state transition update
    setApprovedRecs(prev => ({ ...prev, [recId]: action }));
    setConfirmingRecId(null);
    setConfirmingAction(null);

    try {
      // Persist human decision with complete metadata metrics to ClickHouse over MCP!
      const res = await fetch("/api/production-memory/decisions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recommendation_id: recId,
          production_id: "prod-echopoint-001",
          proposal_id: optimizationData.proposal.proposal_id,
          decision: action,
          actor_name: "Production Executive",
          actor_type: "human_demo_operator",
          previous_state: "Pending Review",
          new_state: action === "Approved" ? "APPROVED" : "REJECTED",
          originating_agents: recommendation.originating_agent,
          projected_savings: recommendation.projected_savings,
          shooting_days_saved: recommendation.shooting_days_saved,
          risks_reduced: recommendation.risks_reduced,
          notes: notes
        }),
      });

      if (!res.ok) {
        throw new Error("FastAPI decisions endpoint rejected the submission.");
      }

    } catch (err) {
      console.error("[FRONTEND] Failed to persist decision to ClickHouse:", err);
    }
  };

  // --- DETERMINISTIC RECALCULATION ENGINE (Approved vs Pending) ---
  let pendingSavings = 0.0;
  let pendingDaysSaved = 0;
  let pendingRisksReduced = 0;

  let approvedSavings = 0.0;
  let approvedDaysSaved = 0;
  let approvedRisksReduced = 0;

  if (optimizationData) {
    optimizationData.proposal.recommendations.forEach(rec => {
      const state = approvedRecs[rec.recommendation_id] || "Pending";

      if (state === "Approved") {
        approvedSavings += rec.projected_savings;
        approvedDaysSaved += rec.shooting_days_saved;
        approvedRisksReduced += rec.risks_reduced;
      } else if (state === "Pending") {
        pendingSavings += rec.projected_savings;
        pendingDaysSaved += rec.shooting_days_saved;
        pendingRisksReduced += rec.risks_reduced;
      }
    });
  }

  // Calculate dynamic outputs
  const baselineSpend = 2617300.0;
  const baselineDays = 31;
  const baselineRisks = 7;

  useEffect(() => {
  onCommitImpact?.(approvedSavings, approvedDaysSaved, approvedRisksReduced);
  }, [approvedSavings, approvedDaysSaved, approvedRisksReduced, onCommitImpact]);

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

      {/* Confirmation Modal */}
      {confirmingRecId && confirmingAction && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Confirm Human-in-the-Loop Decision
            </h3>

            <p className="text-xs text-slate-400 leading-normal">
              You are about to log an immutable decision on the following proposed recommendation. This will recompute the committed spend and record your audit trail in ClickHouse.
            </p>

            <div className="bg-slate-950 p-3 rounded border border-slate-850 text-xs space-y-2">
              <p className="text-slate-500 font-bold">RECOMMENDATION:</p>
              <p className="text-slate-300 font-semibold">{optimizationData?.proposal.recommendations.find(r => r.recommendation_id === confirmingRecId)?.title}</p>
              <p className="text-indigo-400 font-bold">ACTION TARGET: {confirmingAction.toUpperCase()}</p>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Optional Decision Note / Reasons</label>
              <textarea
                value={decisionNotes[confirmingRecId] || ""}
                onChange={(e) => setDecisionNotes(prev => ({ ...prev, [confirmingRecId]: e.target.value }))}
                placeholder="Type the operational justification for auditing..."
                className="w-full text-xs bg-slate-950 border border-slate-850 rounded p-2.5 text-slate-300 focus:outline-none focus:border-indigo-500 min-h-[70px] custom-scrollbar"
              />
            </div>

            <div className="flex gap-3 justify-end text-xs">
              <button
                onClick={() => { setConfirmingRecId(null); setConfirmingAction(null); }}
                className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={submitHumanDecision}
                className={`px-4 py-2 rounded text-white font-bold ${
                  confirmingAction === "Approved" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"
                }`}
              >
                Confirm {confirmingAction}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Results Board */}
      {optimizationData && (
        <div className="space-y-8 animate-fadeIn">

          {/* Approved vs Pending double-impact comparison stats */}
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

            {/* Side-by-Side Recalculated impact counters */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Committed vs Potential Impact</h4>

                <div className="space-y-3 text-xs">
                  {/* Spend Impact */}
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Projected Spend</span>
                      <span className="text-[9px] text-emerald-400 font-bold block bg-emerald-500/10 px-1.5 py-0.25 rounded border border-emerald-500/10 w-fit">Committed: {formatCurrency(approvedSavings)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 line-through block">{formatCurrency(baselineSpend)}</span>
                      <span className="text-xs text-slate-400 block">Pending: {formatCurrency(pendingSavings)}</span>
                    </div>
                  </div>

                  {approvedBudget !== undefined && (() => {
                    const targetOptimizedSpend = baselineSpend - (approvedSavings + pendingSavings);
                    const gap = targetOptimizedSpend - approvedBudget;
                    return (
                      <div className="bg-amber-500/5 border border-amber-500/10 px-2.5 py-1.5 rounded flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Approved Budget Goal • {formatCurrency(approvedBudget)}</span>
                        <span className="text-[10px] text-amber-400/90 font-medium">Projected gap: {formatCurrency(gap)} above</span>
                      </div>
                    );
                  })()}

                  {/* Day Impact */}
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Shooting Days</span>
                      <span className="text-[9px] text-indigo-400 font-bold block bg-indigo-500/10 px-1.5 py-0.25 rounded border border-indigo-500/10 w-fit">Committed: {approvedDaysSaved} Saved</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 line-through block">{baselineDays} Days</span>
                      <span className="text-xs text-slate-400 block">Pending: {pendingDaysSaved} Saved</span>
                    </div>
                  </div>

                  {/* Risk Impact */}
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">High-Risk Events</span>
                      <span className="text-[9px] text-rose-400 font-bold block bg-rose-500/10 px-1.5 py-0.25 rounded border border-rose-500/10 w-fit">Committed: {approvedRisksReduced} Reduced</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 line-through block">{baselineRisks} Events</span>
                      <span className="text-xs text-slate-400 block">Pending: {pendingRisksReduced} Reduced</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-850 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400">Total Approved savings:</span>
                <span className="text-base font-bold text-emerald-400">
                  {formatCurrency(approvedSavings)}
                </span>
              </div>
            </div>

          </div>

          {/* Tradeoffs & Disagreements Section (Conflict Governance!) */}
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

          {/* Individual Human Approval Queue with Conflict & Dependency Blockers! */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Human Governance Review Queue</h4>
            <div className="space-y-4">
              {optimizationData.proposal.recommendations.map((rec, i) => {
                const state = approvedRecs[rec.recommendation_id] || "Pending";

                // CONFLICT GOVERNANCE: Evaluate if a conflicting recommendation has already been approved!
                // If yes, this recommendation is locked out with a strict warning.
                let isBlockedByConflict = false;
                let conflictWarning = "";

                optimizationData.proposal.conflicts.forEach(conf => {
                  // Find the other recommendation in the conflict
                  const otherRec = optimizationData.proposal.recommendations.find(r => r.recommendation_id === conf.recommended_option);
                  if (otherRec && approvedRecs[otherRec.recommendation_id] === "Approved" && rec.recommendation_id !== otherRec.recommendation_id) {
                    isBlockedByConflict = true;
                    conflictWarning = `Locked: Conflict with approved recommendation ID '${otherRec.recommendation_id}' (${otherRec.title}).`;
                  }
                });

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

                      {isBlockedByConflict && (
                        <div className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-semibold bg-rose-500/5 border border-rose-500/10 px-3 py-1 rounded">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {conflictWarning}
                        </div>
                      )}

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
                          onClick={() => triggerDecisionModal(rec.recommendation_id, "Approved")}
                          disabled={state !== "Pending" || isBlockedByConflict}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 disabled:text-slate-600 text-white text-xs font-semibold py-1.5 px-3 rounded transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => triggerDecisionModal(rec.recommendation_id, "Rejected")}
                          disabled={state !== "Pending"}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900/50 disabled:text-slate-750 text-white text-xs font-semibold py-1.5 px-3 rounded border border-slate-700 disabled:border-slate-800 transition-colors"
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
