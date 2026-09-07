"use client";

import React, { useState, useEffect } from "react";
import { DecisionRecord } from "../../types/governance";
import { formatCurrency } from "../../lib/utils/format";
import { Database, User } from "lucide-react";

interface DecisionAuditTrailProps {
  refreshTrigger?: number;
}

export function DecisionAuditTrail({ refreshTrigger = 0 }: DecisionAuditTrailProps) {
  const [auditLedger, setAuditLedger] = useState<DecisionRecord[]>([]);

  useEffect(() => {
    let active = true;
    const loadAuditLedger = async () => {
      try {
        const res = await fetch("/api/production-memory/decisions/history?production_id=prod-echopoint-001");
        if (res.ok && active) {
          const data = await res.json();
          setAuditLedger(data.decisions || []);
        }
      } catch (err) {
        console.warn("[FRONTEND] Failed to fetch decisions audit history:", err);
      }
    };
    loadAuditLedger();
    return () => {
      active = false;
    };
  }, [refreshTrigger]);

  return (
    <section className="bg-slate-950 border border-slate-800 rounded-xl p-6 mt-8">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
        <Database className="w-5 h-5 text-indigo-400" />
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-white leading-tight">Human Decisions Audit Trail</h2>
          <p className="text-xs text-slate-500 font-medium">Immutable append-only ledger logs retrieved chronologically from ClickHouse Cloud over MCP</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse table-fixed">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="pb-3 pr-4 w-[10%]">Action</th>
              <th className="pb-3 pr-4 w-[14%]">Actor</th>
              <th className="pb-3 pr-4 w-[16%]">Recommendation ID</th>
              <th className="pb-3 pr-4 w-[15%]">State Transition</th>
              <th className="pb-3 pr-4 w-[15%]">Committed Impact</th>
              <th className="pb-3 pr-4 w-[20%]">Reason Notes</th>
              <th className="pb-3 text-right w-[10%]">Timestamp (UTC)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {auditLedger.map((dec, idx) => (
              <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-3.5 pr-4 align-top">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                    dec.decision === "Approved" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}>
                    {dec.decision.toUpperCase()}
                  </span>
                </td>
                <td className="py-3.5 pr-4 text-slate-300 align-top">
                  <div className="flex items-start gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-semibold block truncate">{dec.actor_name}</span>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold truncate">{dec.actor_type.replace(/_/g, " ")}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 pr-4 text-slate-400 font-mono text-[10px] break-all align-top">
                  {dec.recommendation_id}
                </td>
                <td className="py-3.5 pr-4 text-[10px] uppercase tracking-wider align-top">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-slate-500 font-semibold">{dec.previous_state || "&mdash;"}</span>
                    <span className="text-slate-700 font-bold">&rarr;</span>
                    <span className={`font-bold ${
                      dec.new_state === "APPROVED" ? "text-emerald-400" :
                      dec.new_state === "REJECTED" ? "text-rose-400" :
                      "text-slate-300"
                    }`}>{dec.new_state || "&mdash;"}</span>
                  </div>
                </td>
                <td className="py-3.5 pr-4 align-top">
                  <div className="text-slate-300 space-y-1">
                    {parseFloat(String(dec.projected_savings)) > 0 && (
                      <span className="text-emerald-400 font-bold block">{formatCurrency(parseFloat(String(dec.projected_savings)))}</span>
                    )}
                    {parseInt(String(dec.shooting_days_saved)) > 0 && (
                      <span className="text-indigo-400 block leading-tight">{dec.shooting_days_saved} Days Saved</span>
                    )}
                    {parseInt(String(dec.risks_reduced)) > 0 && (
                      <span className="text-rose-400 block leading-tight">{dec.risks_reduced} Risks Reduced</span>
                    )}
                    {parseFloat(String(dec.projected_savings)) === 0 && parseInt(String(dec.shooting_days_saved)) === 0 && (
                      <span className="text-slate-500 italic block leading-tight">None</span>
                    )}
                  </div>
                </td>
                <td className="py-3.5 pr-4 text-slate-400 align-top">
                  <p className="text-[11px] leading-snug break-words" title={dec.notes}>
                    {dec.notes}
                  </p>
                </td>
                <td className="py-3.5 text-right align-top">
                  <div className="font-mono text-slate-500 text-[10px] whitespace-nowrap">
                    {new Date(dec.decided_at).toLocaleDateString()}
                  </div>
                  <div className="font-mono text-slate-600 text-[9px] whitespace-nowrap">
                    {new Date(dec.decided_at).toLocaleTimeString()}
                  </div>
                </td>
              </tr>
            ))}
            {auditLedger.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-xs text-slate-600 italic">No human decisions logged in production memory yet. Execute review decisions above to begin auditing.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
