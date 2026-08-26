import React from "react";
import { ProductionMetadata } from "../../types";
import { Clapperboard } from "lucide-react";

interface ProductionHeaderProps {
  metadata: ProductionMetadata;
}

export function ProductionHeader({ metadata }: ProductionHeaderProps) {
  return (
    <header className="px-8 py-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
              {metadata.type}
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-xs font-medium text-slate-400">
              ID: {metadata.id}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-3">
            <Clapperboard className="w-8 h-8 text-slate-500" />
            {metadata.title}
          </h1>
          <div className="flex gap-6 text-sm text-slate-400">
            <p><span className="font-medium text-slate-300">Director:</span> {metadata.director}</p>
            <p><span className="font-medium text-slate-300">Producers:</span> {metadata.producers.join(", ")}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            {metadata.status}
          </div>
          <div className="text-sm font-medium text-slate-400">
            Phase: <span className="text-slate-200">{metadata.currentPhase}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
