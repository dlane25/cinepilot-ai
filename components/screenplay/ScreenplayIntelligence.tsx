"use client";

import React, { useState } from "react";
import {
  FileText,
  UploadCloud,
  Loader2,
  AlertCircle,
  Sparkles,
  Database,
  MapPin,
  Users,
  ShieldAlert,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { ScreenplayAnalysisResponse } from "../../types";

// High fidelity local screenplay fallback fixture representing ECHO POINT Climax script
const MOCK_ECHO_POINT_SCREENPLAY_DATA: ScreenplayAnalysisResponse = {
  production_id: "prod-echopoint-001",
  metadata: {
    title: "ECHO POINT (Screenplay Breakdown)",
    author: "J. Miller",
    total_scenes: 2,
    total_characters: 2,
    interior_scenes_count: 1,
    exterior_scenes_count: 1,
    day_scenes_count: 1,
    night_scenes_count: 1
  },
  scene_analyses: [
    {
      scene_number: "1",
      creative_complexity: "Medium",
      production_complexity: "Medium",
      cast_requirements: ["Maya", "Detective Cole"],
      extras_background_performers: ["None"],
      props: ["Old brass key", "Manila folder file"],
      wardrobe: ["Maya's trenchcoat", "Cole's leather jacket"],
      vehicles: [],
      animals: [],
      stunts: [],
      vfx: [],
      sfx: [],
      practical_effects: ["Glass door lock click"],
      special_equipment: [],
      location_complexity: "INT. CABINET - DAY. Standard interior office environment. High vertical bookshelf.",
      night_exterior_requirements: [],
      weather_exposure: ["None"],
      safety_concerns: [],
      schedule_sensitivity: "Standard turnaround rest limits.",
      estimated_setup_complexity: "Medium",
      production_risk_signals: []
    },
    {
      scene_number: "42",
      creative_complexity: "High",
      production_complexity: "High",
      cast_requirements: ["Maya", "Detective Cole"],
      extras_background_performers: ["48 background extras"],
      props: ["Briefcase", "Handcuffs"],
      wardrobe: ["Maya's wet trenchcoat", "Cole's police uniform"],
      vehicles: ["Two active police picture cars"],
      animals: [],
      stunts: ["Scaffolding lane wire-stunts", "Precision car slides"],
      vfx: ["CGI rooftop background plates"],
      sfx: ["High-capacity rain effects", "Water pooling rigs", "Sparks trigger"],
      practical_effects: ["Breakaway window panes", "Mechanical wooden boxes"],
      special_equipment: ["50ft Technocrane (rental)"],
      location_complexity: "Slippery wet floors inside massive open warehouse. Tight lanes between high metal shelves.",
      night_exterior_requirements: ["3x 100kW Generator trucks", "Lighting balloon structures"],
      weather_exposure: ["Night damp cold", "Rain rig water run-offs"],
      safety_concerns: ["Stunt coordinator wet-down supervision", "Dedicated water safety officers"],
      schedule_sensitivity: "SAG minimum turnaround limits. Crew night premium penalties.",
      estimated_setup_complexity: "High",
      production_risk_signals: ["Crew fatigue on Day 14 night. SAG turnaround rest windows violation risk on Day 15 call."]
    }
  ],
  timestamp: "2026-08-26T21:00:00Z"
};

export function ScreenplayIntelligence() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Holds either our uploaded parsed response or our deterministic fallback
  const [screenplayData, setScreenplayData] = useState<ScreenplayAnalysisResponse | null>(null);
  const [selectedSceneNum, setSelectedSceneNum] = useState<string>("42");
  const [commitSuccess, setCommitSuccess] = useState<boolean>(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFileSelection(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFileSelection(selectedFile);
    }
  };

  const processFileSelection = (selectedFile: File) => {
    setError(null);
    setCommitSuccess(false);

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File exceeds 5MB upload limit. Only standard screenwriting files < 5MB are permitted.");
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Unsupported media format. Only text-based PDF screenplays are supported.");
      return;
    }

    setFile(selectedFile);
  };

  const handleAnalyzeScreenplay = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setCommitSuccess(false);

    try {
      setProgressStep("1/3 Extracting PDF page strings...");
      await new Promise(r => setTimeout(r, 1000));

      setProgressStep("2/3 Slicing scene sluglines & dialogue blocks...");
      await new Promise(r => setTimeout(r, 1000));

      setProgressStep("3/3 Running Gemini ADK Screenplay Agent...");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("production_id", "prod-echopoint-001");

      const res = await fetch("/api/screenplay-analysis", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errObj = await res.json().catch(() => ({}));
        throw new Error(errObj.error || `HTTP Ingestion failed! Status: ${res.status}`);
      }

      const data = (await res.json()) as ScreenplayAnalysisResponse;
      setScreenplayData(data);
      if (data.scene_analyses.length > 0) {
        setSelectedSceneNum(data.scene_analyses[0].scene_number);
      }

    } catch (err: unknown) {
      console.error("[FRONTEND] Screenplay processing failed:", err);
      setError(err instanceof Error ? err.message : "Failed to establish secure communications with the Screenplay Ingestion server.");
    } finally {
      setLoading(false);
      setProgressStep("");
    }
  };

  const handleLoadFallback = () => {
    setError(null);
    setFile(null);
    setCommitSuccess(false);
    setScreenplayData(MOCK_ECHO_POINT_SCREENPLAY_DATA);
    setSelectedSceneNum("42");
  };

  const handleCommitToMemory = async () => {
    if (!screenplayData) return;
    setCommitSuccess(false);

    try {
      // Simulate committing screenplay summary metadata metrics into ClickHouse Memory
      await fetch("/api/production-memory/decisions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recommendation_id: `rec-screenplay-meta-${Date.now().toString().slice(-4)}`,
          production_id: "prod-echopoint-001",
          decision: "Approved",
          notes: `Committed metadata title: ${screenplayData.metadata.title} | Scenes count: ${screenplayData.metadata.total_scenes} to Production Memory.`
        }),
      });
      setCommitSuccess(true);
    } catch (err) {
      console.error("Failed to commit screenplay metadata to ClickHouse:", err);
    }
  };

  const activeSceneAnalysis = screenplayData?.scene_analyses.find(
    (scene) => scene.scene_number === selectedSceneNum
  );

  return (
    <div className="space-y-8">
      {/* Upload Dropzone Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Dropzone Card */}
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-center min-h-[220px] relative">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-lg p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-colors group"
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={loading}
            />
            <UploadCloud className="w-12 h-12 text-slate-500 group-hover:text-indigo-400 mb-3 transition-colors" />
            <p className="text-sm font-semibold text-white mb-1">
              {file ? file.name : "Drag & Drop Screenplay PDF here"}
            </p>
            <p className="text-xs text-slate-500">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Only text-based PDF scripts up to 5MB are accepted"}
            </p>
          </div>

          {error && (
            <div className="mt-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap gap-3 justify-between items-center">
            <button
              onClick={handleLoadFallback}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-750 hover:border-slate-600 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Echo Point Screenplay Fixture
            </button>

            <button
              onClick={handleAnalyzeScreenplay}
              disabled={!file || loading}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-500 border border-indigo-500/20 shadow-lg shadow-indigo-600/10 transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  {progressStep}
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  Process & Ingest Screenplay
                </>
              )}
            </button>
          </div>
        </div>

        {/* Metatrends/Summary Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Screenplay Summary metrics
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">Deterministic parsed screenplay statistics</p>

            {screenplayData ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Total Scenes</span>
                  <span className="text-xl font-bold text-white">{screenplayData.metadata.total_scenes}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Unique Speakers</span>
                  <span className="text-xl font-bold text-white">{screenplayData.metadata.total_characters}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 col-span-2">
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                    <span>INT vs EXT</span>
                    <span>{screenplayData.metadata.interior_scenes_count} INT / {screenplayData.metadata.exterior_scenes_count} EXT</span>
                  </div>
                  <div className="h-2 w-full bg-slate-850 rounded-full overflow-hidden flex">
                    <div className="bg-indigo-500 h-full" style={{ width: `${(screenplayData.metadata.interior_scenes_count / screenplayData.metadata.total_scenes) * 100}%` }} />
                    <div className="bg-emerald-500 h-full" style={{ width: `${(screenplayData.metadata.exterior_scenes_count / screenplayData.metadata.total_scenes) * 100}%` }} />
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 col-span-2">
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                    <span>DAY vs NIGHT</span>
                    <span>{screenplayData.metadata.day_scenes_count} DAY / {screenplayData.metadata.night_scenes_count} NIGHT</span>
                  </div>
                  <div className="h-2 w-full bg-slate-850 rounded-full overflow-hidden flex">
                    <div className="bg-amber-400 h-full" style={{ width: `${(screenplayData.metadata.day_scenes_count / screenplayData.metadata.total_scenes) * 100}%` }} />
                    <div className="bg-slate-700 h-full" style={{ width: `${(screenplayData.metadata.night_scenes_count / screenplayData.metadata.total_scenes) * 100}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-slate-600 italic border border-slate-800/50 rounded-lg bg-slate-950/20">
                Injest a script or load the Echo Point demo fixture to explore analytics.
              </div>
            )}
          </div>

          {screenplayData && (
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={handleCommitToMemory}
                disabled={commitSuccess}
                className={`w-full py-2 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  commitSuccess
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/10 hover:border-indigo-500/30"
                }`}
              >
                {commitSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Ingested Metadata Saved to ClickHouse Memory
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    Commit Screenplay Summary to ClickHouse
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Screenplay Scene split-screen Viewer */}
      {screenplayData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Sidebar: Scene List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-[550px] flex flex-col">
            <h4 className="text-sm font-bold text-white mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              Scene segments list
            </h4>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
              {screenplayData.scene_analyses.map((scene, i) => {
                const isSelected = selectedSceneNum === scene.scene_number;
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedSceneNum(scene.scene_number)}
                    className={`p-3 rounded-lg cursor-pointer border text-left transition-all ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-500 shadow-md shadow-indigo-600/10"
                        : "bg-slate-950 border-slate-850 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[10px] font-bold ${isSelected ? "text-indigo-200" : "text-indigo-400"}`}>
                        SCENE {scene.scene_number}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${
                        scene.creative_complexity === "High"
                          ? isSelected ? "bg-rose-500/20 border-rose-400/20 text-rose-200" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                          : isSelected ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-950 border-slate-850 text-slate-500"
                      }`}>
                        {scene.creative_complexity} Complexity
                      </span>
                    </div>
                    <p className={`text-xs font-semibold leading-snug line-clamp-1 ${isSelected ? "text-white" : "text-slate-300"}`}>
                      {scene.scene_number === "42" ? "EXT. INDUSTRIAL WAREHOUSE - NIGHT" : "INT. CABINET - DAY"}
                    </p>
                    <p className={`text-[10px] mt-1 ${isSelected ? "text-indigo-200" : "text-slate-500"}`}>
                      Cast: {scene.cast_requirements.slice(0, 3).join(", ") || "None"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Selected Scene Breakdown */}
          {activeSceneAnalysis ? (
            <div className="lg:col-span-2 bg-slate-900 border border-indigo-500/20 rounded-xl p-6 h-[550px] overflow-y-auto custom-scrollbar relative">

              {/* Header */}
              <div className="flex flex-wrap justify-between items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-0.5">Scene Segment breakdown</span>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {activeSceneAnalysis.scene_number === "42" ? "EXT. INDUSTRIAL WAREHOUSE - NIGHT" : "INT. CABINET - DAY"}
                  </h3>
                </div>

                <div className="flex gap-2">
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-slate-500">Creative Complexity</span>
                    <span className={`text-xs font-bold uppercase ${activeSceneAnalysis.creative_complexity === "High" ? "text-rose-400" : "text-amber-400"}`}>
                      {activeSceneAnalysis.creative_complexity}
                    </span>
                  </div>
                  <span className="text-slate-700 font-light px-1">|</span>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-slate-500">Production Complexity</span>
                    <span className={`text-xs font-bold uppercase ${activeSceneAnalysis.production_complexity === "High" ? "text-rose-400" : "text-amber-400"}`}>
                      {activeSceneAnalysis.production_complexity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid content */}
              <div className="space-y-6">

                {/* Department Breakdowns cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-850">
                    <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      Cast & Performers
                    </h5>
                    <div className="text-xs text-slate-300 space-y-1">
                      <p><span className="text-slate-500 font-medium">Cast:</span> {activeSceneAnalysis.cast_requirements.join(", ") || "None"}</p>
                      <p><span className="text-slate-500 font-medium">Background:</span> {activeSceneAnalysis.extras_background_performers.join(", ") || "None"}</p>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-850">
                    <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Location complexity
                    </h5>
                    <p className="text-xs text-slate-300 leading-normal">{activeSceneAnalysis.location_complexity}</p>
                  </div>
                </div>

                {/* Requirements Grid */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Creative Department Logistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

                    <div className="bg-slate-950/40 p-3 rounded border border-slate-850">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Props</span>
                      <p className="text-xs text-slate-300 line-clamp-2">{activeSceneAnalysis.props.join(", ") || "None"}</p>
                    </div>

                    <div className="bg-slate-950/40 p-3 rounded border border-slate-850">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Wardrobe</span>
                      <p className="text-xs text-slate-300 line-clamp-2">{activeSceneAnalysis.wardrobe.join(", ") || "None"}</p>
                    </div>

                    <div className="bg-slate-950/40 p-3 rounded border border-slate-850">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Vehicles</span>
                      <p className="text-xs text-slate-300 line-clamp-2">{activeSceneAnalysis.vehicles.join(", ") || "None"}</p>
                    </div>

                    <div className="bg-slate-950/40 p-3 rounded border border-slate-850">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Stunts</span>
                      <p className="text-xs text-rose-300 line-clamp-2">{activeSceneAnalysis.stunts.join(", ") || "None"}</p>
                    </div>

                    <div className="bg-slate-950/40 p-3 rounded border border-slate-850">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Special SFX</span>
                      <p className="text-xs text-indigo-300 line-clamp-2">{activeSceneAnalysis.sfx.join(", ") || "None"}</p>
                    </div>

                    <div className="bg-slate-950/40 p-3 rounded border border-slate-850">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Visual VFX</span>
                      <p className="text-xs text-slate-400 line-clamp-2">{activeSceneAnalysis.vfx.join(", ") || "None"}</p>
                    </div>

                  </div>
                </div>

                {/* Staging & Safety warnings card */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    Logistical & Safety Risk Signals
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-normal">
                    <div>
                      <p className="mb-2"><span className="text-slate-500 font-bold block">Safety Concerns:</span> {activeSceneAnalysis.safety_concerns.join(", ") || "None"}</p>
                      <p><span className="text-slate-500 font-bold block">Weather Exposure:</span> {activeSceneAnalysis.weather_exposure.join(", ") || "None"}</p>
                    </div>
                    <div>
                      <p className="mb-2"><span className="text-slate-500 font-bold block">Schedule Sensitivity:</span> {activeSceneAnalysis.schedule_sensitivity}</p>
                      <p><span className="text-slate-500 font-bold block">Risk Warning Signals:</span> {activeSceneAnalysis.production_risk_signals.join(", ") || "None"}</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="lg:col-span-2 bg-slate-900 border border-slate-850 rounded-xl p-6 flex flex-col items-center justify-center h-[550px]">
              <HelpCircle className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-sm text-slate-400 font-medium">Select a scene from the sidebar to inspect detailed creative breakdowns.</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
