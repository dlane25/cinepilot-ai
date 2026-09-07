"use client";

import React, { useState, useEffect } from "react";
import {
  echoPointProduction,
  echoPointInsights,
  echoPointAgentActivity,
  echoPointRisks,
  echoPointRecommendations,
  echoPointImpactProjection
} from "../../lib/fixtures/echo-point";
import { ProductionHealth } from "./ProductionHealth";
import { ImpactSummary } from "./ImpactSummary";
import { IntelligenceFeed } from "./IntelligenceFeed";
import { DecisionQueue } from "./DecisionQueue";
import { RiskPanel } from "./RiskPanel";
import { LiveAnalysisSummary } from "./LiveAnalysisSummary";
import { ProductionHeader } from "../layout/ProductionHeader";
import { ScreenplayIntelligence } from "../screenplay/ScreenplayIntelligence";
import { MultiAgentOptimization } from "./MultiAgentOptimization";
import { DecisionAuditTrail } from "./DecisionAuditTrail";

import {
  ProductionAnalysisResponse,
  Production,
  ProductionRisk,
  ProductionInsight,
  ProductionRecommendation,
  ImpactProjection
} from "../../types";

import {
  mapLiveProduction,
  mapLiveRisks,
  mapLiveInsights,
  mapLiveRecommendations
} from "../../lib/mappers/production-analysis";

import { generateImpactProjection } from "../../lib/domain/calculations";
import { Cpu, Play, Loader2, AlertCircle, RefreshCw, Database, Clock } from "lucide-react";

type AnalysisState = "IDLE" | "ANALYZING" | "SUCCESS" | "ERROR";
type DashboardMode = "DEMO" | "LIVE";

interface HistoricalAnalysisRun {
  scene_number: string;
  completed_at: string;
  model: string;
  runtime: string;
  total_opportunity_count: number;
  projected_savings: string | number;
}

interface HistoricalRecommendation {
  title: string;
  projected_savings: string | number;
  confidence: number;
  approval_state: string;
}

interface MemoryHistoryState {
  analyses: HistoricalAnalysisRun[];
  risks: unknown[];
  recommendations: HistoricalRecommendation[];
}

export function CommandCenterDashboard() {
  const [activeTab, setActiveTab] = useState<"PRODUCTION" | "SCREENPLAY" | "OPTIMIZATION" | "DECISIONS">("PRODUCTION");
  const [state, setState] = useState<AnalysisState>("IDLE");
  const [mode, setMode] = useState<DashboardMode>("DEMO");
  const [rawResponse, setRawResponse] = useState<ProductionAnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stored state for active recommendations (so user can Approve/Reject them in real-time)
  const [liveRecommendations, setLiveRecommendations] = useState<ProductionRecommendation[]>([]);
  const [demoRecommendations, setDemoRecommendations] = useState<ProductionRecommendation[]>(echoPointRecommendations);

  // ClickHouse Production Memory state
  const [memoryHistory, setMemoryHistory] = useState<MemoryHistoryState | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Global committed impact state from MultiAgentOptimization approvals
  const [committedImpact, setCommittedImpact] = useState({ savings: 0, daysSaved: 0, risksReduced: 0 });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#decisions") {
        setActiveTab("DECISIONS");
      } else if (window.location.hash === "" || window.location.hash === "#") {
        setActiveTab("PRODUCTION");
      }
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    let active = true;
    const loadMemory = async () => {
      try {
        const res = await fetch("/api/production-memory/history?production_id=prod-echopoint-001");
        if (res.ok && active) {
          const data = await res.json();
          setMemoryHistory(data);
        }
      } catch (err) {
        console.warn("[FRONTEND] Failed to connect to ClickHouse memory service:", err);
      }
    };
    loadMemory();
    return () => {
      active = false;
    };
  }, [refreshTrigger]);

  const handleRunAnalysis = async () => {
    setState("ANALYZING");
    setErrorMessage(null);

    const requestPayload = {
      production_id: "prod-echopoint-001",
      scene_input: {
        scene_number: "42",
        scene_heading: "EXT. INDUSTRIAL WAREHOUSE - NIGHT",
        int_ext: "EXT" as const,
        day_night: "NIGHT" as const,
        characters: ["Maya", "Detective Cole"],
        production_requirements: ["50ft Technocrane", "48 extras", "rain effects", "police lighting"]
      },
      production_context: {
        approved_budget: echoPointProduction.financials.approvedBudget,
        projected_spend: echoPointProduction.financials.projectedSpend,
        planned_shooting_days: echoPointProduction.schedule.plannedShootingDays,
        current_shooting_day: echoPointProduction.schedule.currentShootingDay
      }
    };

    try {
      const res = await fetch("/api/production-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
      }

      const responseData = (await res.json()) as ProductionAnalysisResponse;

      setRawResponse(responseData);
      setLiveRecommendations(mapLiveRecommendations(responseData));
      setState("SUCCESS");
      setMode("LIVE");

      // Reload ClickHouse history trigger
      setRefreshTrigger(prev => prev + 1);

    } catch (err: unknown) {
      console.error("[FRONTEND] Live production analysis failed:", err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to establish communication with the Vertex AI agent gateway.");
      setState("ERROR");
      setMode("DEMO"); // Revert back to safe demo mode on failure
    }
  };

  const handleApproveRecommendation = async (id: string) => {
    const isLive = mode === "LIVE";

    // Optimistic UI update
    if (isLive) {
      setLiveRecommendations(prev =>
        prev.map(rec => rec.id === id ? { ...rec, approvalState: "Approved" as const } : rec)
      );
    } else {
      setDemoRecommendations(prev =>
        prev.map(rec => rec.id === id ? { ...rec, approvalState: "Approved" as const } : rec)
      );
    }

    // Persist human decision record to ClickHouse via MCP
    try {
      await fetch("/api/production-memory/decisions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recommendation_id: id,
          production_id: "prod-echopoint-001",
          decision: "Approved",
          notes: "Approved via ClickHouse human-in-the-loop audit trail.",
          new_state: "APPROVED",
          previous_state: "Pending Review",
          actor_name: "Production Executive",
          actor_type: "human_demo_operator"
        }),
      });
      // Refresh the historical trigger
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("[FRONTEND] Failed to log decision to ClickHouse:", err);
    }
  };

  const handleRejectRecommendation = async (id: string) => {
    const isLive = mode === "LIVE";

    // Optimistic UI update
    if (isLive) {
      setLiveRecommendations(prev =>
        prev.map(rec => rec.id === id ? { ...rec, approvalState: "Rejected" as const } : rec)
      );
    } else {
      setDemoRecommendations(prev =>
        prev.map(rec => rec.id === id ? { ...rec, approvalState: "Rejected" as const } : rec)
      );
    }

    // Persist human decision record to ClickHouse via MCP
    try {
      await fetch("/api/production-memory/decisions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recommendation_id: id,
          production_id: "prod-echopoint-001",
          decision: "Rejected",
          notes: "Rejected via ClickHouse human-in-the-loop audit trail.",
          new_state: "REJECTED",
          previous_state: "Pending Review",
          actor_name: "Production Executive",
          actor_type: "human_demo_operator"
        }),
      });
      // Refresh the historical trigger
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("[FRONTEND] Failed to log decision to ClickHouse:", err);
    }
  };

  // Resolve dynamic dashboard datasets depending on active mode (DEMO vs LIVE)
  let baseProduction: Production = echoPointProduction;
  let activeRisks: ProductionRisk[] = echoPointRisks;
  let activeInsights: ProductionInsight[] = echoPointInsights;
  let activeRecs: ProductionRecommendation[] = demoRecommendations;
  let activeProjection: ImpactProjection = echoPointImpactProjection;

  if (mode === "LIVE" && rawResponse) {
    baseProduction = mapLiveProduction(rawResponse, echoPointProduction);
    activeRisks = mapLiveRisks(rawResponse);
    activeInsights = mapLiveInsights(rawResponse);
    activeRecs = liveRecommendations;

    // Recalculate impact projection dynamically based on actual live findings!
    activeProjection = generateImpactProjection(
      echoPointProduction.financials.projectedSpend,
      baseProduction.financials.projectedSpend,
      echoPointProduction.schedule.plannedShootingDays,
      echoPointProduction.schedule.plannedShootingDays - (rawResponse.producer_analysis.schedule_implications ? 1 : 0),
      echoPointRisks.filter(r => r.severity === "Critical" || r.severity === "High").length,
      activeRisks.filter(r => r.severity === "Critical" || r.severity === "High").length
    );
  }

  // APPLY DETERMINISTIC COMMITTED IMPACT (The Finish Line)
  // Derive a new activeProduction via immutable object spreads
  const activeProduction: Production = {
    ...baseProduction,
    financials: {
      ...baseProduction.financials,
      projectedSpend: baseProduction.financials.projectedSpend - committedImpact.savings
    },
    schedule: {
      ...baseProduction.schedule,
      plannedShootingDays: baseProduction.schedule.plannedShootingDays - committedImpact.daysSaved
    }
  };

  return (
    <>
      {/* Dynamic Header */}
      <ProductionHeader metadata={activeProduction.metadata} />

      {/* Tab Switcher */}
      <div className="px-8 py-2.5 border-b border-slate-800 bg-slate-950 flex gap-5">
        <button
          onClick={() => {
            setActiveTab("PRODUCTION");
            window.location.hash = "";
          }}
          className={`text-sm font-bold pb-2 border-b-2 transition-all ${
            activeTab === "PRODUCTION"
              ? "border-indigo-500 text-white"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Production Command Center
        </button>
        <button
          onClick={() => {
            setActiveTab("SCREENPLAY");
            window.location.hash = "";
          }}
          className={`text-sm font-bold pb-2 border-b-2 transition-all ${
            activeTab === "SCREENPLAY"
              ? "border-indigo-500 text-white"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Screenplay Intelligence
        </button>
        <button
          onClick={() => {
            setActiveTab("OPTIMIZATION");
            window.location.hash = "";
          }}
          className={`text-sm font-bold pb-2 border-b-2 transition-all ${
            activeTab === "OPTIMIZATION"
              ? "border-indigo-500 text-white"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Multi-Agent Optimization
        </button>
        <button
          onClick={() => {
            setActiveTab("DECISIONS");
            window.location.hash = "#decisions";
          }}
          className={`text-sm font-bold pb-2 border-b-2 transition-all ${
            activeTab === "DECISIONS"
              ? "border-indigo-500 text-white"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Human Decisions
        </button>
      </div>

      {activeTab === "SCREENPLAY" ? (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
          <ScreenplayIntelligence />
        </div>
      ) : activeTab === "OPTIMIZATION" ? (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
          <MultiAgentOptimization
            onCommitImpact={(savings, days, risks) => {
              setCommittedImpact({ savings, daysSaved: days, risksReduced: risks });
            }}
          />
        </div>
      ) : activeTab === "DECISIONS" ? (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
          <DecisionAuditTrail refreshTrigger={refreshTrigger} />
        </div>
      ) : (
        <>
          <div className="px-8 py-4 border-b border-slate-800 bg-slate-950 flex flex-wrap justify-between items-center gap-4 sticky top-[89px] z-10">
        {/* Toggle Mode and status indicators */}
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setMode("DEMO")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                mode === "DEMO"
                  ? "bg-slate-800 text-white border border-slate-700/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              DEMO FIXTURE
            </button>
            <button
              disabled={!rawResponse}
              onClick={() => setMode("LIVE")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                mode === "LIVE"
                  ? "bg-indigo-600 text-white"
                  : rawResponse
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-600 cursor-not-allowed"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              LIVE ANALYSIS
            </button>
          </div>

          {mode === "LIVE" && rawResponse && (
            <div className="text-xs text-indigo-400 font-medium flex items-center gap-1.5 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              ACTIVE: Viewing Live Agentic Results (Model: {rawResponse.producer_analysis.potential_savings > 0 ? "Gemini 2.5" : "Stub"})
            </div>
          )}
          {mode === "DEMO" && (
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
              ACTIVE: Viewing Static Screenplay Fixture (Echo Point)
            </div>
          )}
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={handleRunAnalysis}
            disabled={state === "ANALYZING"}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-500 border border-indigo-500/20 shadow-lg shadow-indigo-600/15 flex items-center gap-2 transition-all active:scale-95 disabled:active:scale-100"
          >
            {state === "ANALYZING" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                Analyzing Scene 42...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-white" />
                Run Production Analysis
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-[1600px] mx-auto">

        {/* Loader Progress Alert */}
        {state === "ANALYZING" && (
          <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-6 mb-8 text-center flex flex-col items-center justify-center py-10 shadow-lg animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
            <h4 className="text-base font-bold text-white mb-1">Director & Producer Agents Active</h4>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Google ADK is orchestrating the multi-agent pipeline. The Director Agent is breaking down scene logistics and the Producer Agent is evaluating financial risks...
            </p>
          </div>
        )}

        {/* Error Alert Panel */}
        {state === "ERROR" && errorMessage && (
          <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-5 mb-8 flex items-start gap-4">
            <AlertTriangleIcon />
            <div className="flex-1">
              <h4 className="text-base font-bold text-rose-300 mb-1">Live Agent Execution Failed</h4>
              <p className="text-sm text-rose-400/90 leading-relaxed mb-3">
                {errorMessage}
              </p>
              <button
                onClick={handleRunAnalysis}
                className="text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-3 py-1.5 rounded border border-rose-500/30 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Live Analysis
              </button>
            </div>
          </div>
        )}

        {/* Live Analysis Metadata Summary Report Card */}
        {mode === "LIVE" && rawResponse && (
          <LiveAnalysisSummary response={rawResponse} />
        )}

        {/* Normal Dashboard Cards */}
        <ProductionHealth
          production={activeProduction}
          risks={activeRisks}
          resolvedRiskCount={committedImpact.risksReduced}
        />

        <ImpactSummary
          production={activeProduction}
          projection={activeProjection}
        />

        <IntelligenceFeed
          insights={activeInsights}
          activities={mode === "LIVE" ? [] : echoPointAgentActivity}
        />

        <DecisionQueue
          recommendations={activeRecs}
          onApprove={handleApproveRecommendation}
          onReject={handleRejectRecommendation}
        />

        <RiskPanel
          risks={activeRisks}
        />

        {/* CLICKHOUSE PRODUCTION MEMORY SECTION */}
        {memoryHistory && (
          <section className="bg-slate-950 border border-slate-800 rounded-xl p-6 mt-8">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
              <Database className="w-5 h-5 text-indigo-400" />
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-white leading-tight">ClickHouse Production Memory Logs</h2>
                <p className="text-xs text-slate-500 font-medium">Historical Multi-Agent Runs and Decisions fetched via official mcp-clickhouse</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Recent Analyses Runs Card */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 flex flex-col h-[340px]">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/50">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-300">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <h4>Recent Analysis History</h4>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                    {memoryHistory.analyses.length} Runs
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {memoryHistory.analyses.map((run, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-850 p-3 rounded-lg flex justify-between items-center hover:border-slate-700 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-indigo-400">Scene {run.scene_number}</span>
                          <span className="text-slate-600 text-xs">•</span>
                          <span className="text-slate-500 text-[10px]">{new Date(run.completed_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">Model: {run.model} | Runtime: {run.runtime}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs block font-bold text-emerald-400">+{parseFloat(String(run.projected_savings)).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</span>
                        <span className="text-[9px] text-slate-500 block">Savings Opps: {run.total_opportunity_count}</span>
                      </div>
                    </div>
                  ))}
                  {memoryHistory.analyses.length === 0 && (
                    <div className="text-center py-12 text-xs text-slate-600 italic">No historical runs recorded in ClickHouse.</div>
                  )}
                </div>
              </div>

              {/* Human Decision Audit Callout Card */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-center items-center text-center h-[340px]">
                <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-indigo-400" />
                </div>
                <h4 className="text-lg font-bold text-slate-200 mb-2">Human Decision Audit</h4>
                <p className="text-sm text-slate-400 mb-6 max-w-sm">
                  Human-approved production changes are recorded in the immutable ClickHouse decision ledger.
                </p>
                <button
                  onClick={() => {
                    setActiveTab("DECISIONS");
                    window.location.hash = "#decisions";
                  }}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                  <Database className="w-4 h-4 text-indigo-400" />
                  View Decision Audit Trail
                </button>
              </div>

            </div>
          </section>
        )}

      </div>
    </>)}
    </>
  );
}

function AlertTriangleIcon() {
  return (
    <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20 text-rose-400 flex-shrink-0">
      <AlertCircle className="w-6 h-6" />
    </div>
  );
}
