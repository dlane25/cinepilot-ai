"use client";

import React, { useState } from "react";
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
import { Cpu, Play, Loader2, AlertCircle, RefreshCw } from "lucide-react";

type AnalysisState = "IDLE" | "ANALYZING" | "SUCCESS" | "ERROR";
type DashboardMode = "DEMO" | "LIVE";

export function CommandCenterDashboard() {
  const [state, setState] = useState<AnalysisState>("IDLE");
  const [mode, setMode] = useState<DashboardMode>("DEMO");
  const [rawResponse, setRawResponse] = useState<ProductionAnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Stored state for active recommendations (so user can Approve/Reject them in real-time)
  const [liveRecommendations, setLiveRecommendations] = useState<ProductionRecommendation[]>([]);
  const [demoRecommendations, setDemoRecommendations] = useState<ProductionRecommendation[]>(echoPointRecommendations);

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

    } catch (err: unknown) {
      console.error("[FRONTEND] Live production analysis failed:", err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to establish communication with the Vertex AI agent gateway.");
      setState("ERROR");
      setMode("DEMO"); // Revert back to safe demo mode on failure
    }
  };

  const handleApproveRecommendation = (id: string) => {
    if (mode === "LIVE") {
      setLiveRecommendations(prev => 
        prev.map(rec => rec.id === id ? { ...rec, approvalState: "Approved" as const } : rec)
      );
    } else {
      setDemoRecommendations(prev => 
        prev.map(rec => rec.id === id ? { ...rec, approvalState: "Approved" as const } : rec)
      );
    }
  };

  const handleRejectRecommendation = (id: string) => {
    if (mode === "LIVE") {
      setLiveRecommendations(prev => 
        prev.map(rec => rec.id === id ? { ...rec, approvalState: "Rejected" as const } : rec)
      );
    } else {
      setDemoRecommendations(prev => 
        prev.map(rec => rec.id === id ? { ...rec, approvalState: "Rejected" as const } : rec)
      );
    }
  };

  // Resolve dynamic dashboard datasets depending on active mode (DEMO vs LIVE)
  let activeProduction: Production = echoPointProduction;
  let activeRisks: ProductionRisk[] = echoPointRisks;
  let activeInsights: ProductionInsight[] = echoPointInsights;
  let activeRecs: ProductionRecommendation[] = demoRecommendations;
  let activeProjection: ImpactProjection = echoPointImpactProjection;

  if (mode === "LIVE" && rawResponse) {
    activeProduction = mapLiveProduction(rawResponse, echoPointProduction);
    activeRisks = mapLiveRisks(rawResponse);
    activeInsights = mapLiveInsights(rawResponse);
    activeRecs = liveRecommendations;
    
    // Recalculate impact projection dynamically based on actual live findings!
    activeProjection = generateImpactProjection(
      echoPointProduction.financials.projectedSpend,
      activeProduction.financials.projectedSpend,
      echoPointProduction.schedule.plannedShootingDays,
      echoPointProduction.schedule.plannedShootingDays - (rawResponse.producer_analysis.schedule_implications ? 1 : 0),
      echoPointRisks.filter(r => r.severity === "Critical" || r.severity === "High").length,
      activeRisks.filter(r => r.severity === "Critical" || r.severity === "High").length
    );
  }

  return (
    <>
      {/* Dynamic Header */}
      <ProductionHeader metadata={activeProduction.metadata} />

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
      </div>
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
