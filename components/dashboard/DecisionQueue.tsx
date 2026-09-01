import React from "react";
import { ProductionRecommendation } from "../../types";
import { formatCurrency, formatPercentage } from "../../lib/utils/format";
import { Inbox, CheckCircle2, XCircle, Clock } from "lucide-react";

interface DecisionQueueProps {
  recommendations: ProductionRecommendation[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function DecisionQueue({ recommendations, onApprove, onReject }: DecisionQueueProps) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Inbox className="w-5 h-5 text-indigo-400" />
        Pending Decisions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                {rec.originatingAgent}
              </span>
              <span className={`text-xs font-medium flex items-center gap-1 ${
                rec.approvalState === 'Approved' ? 'text-emerald-400' :
                rec.approvalState === 'Rejected' ? 'text-rose-400' :
                'text-amber-400'
              }`}>
                {rec.approvalState === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {rec.approvalState === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                {rec.approvalState === 'Pending Review' && <Clock className="w-3.5 h-3.5" />}
                {rec.approvalState}
              </span>
            </div>

            <h3 className="text-base font-semibold text-white mb-2">{rec.title}</h3>
            <p className="text-sm text-slate-400 mb-5 flex-1">{rec.explanation}</p>

            <div className="bg-slate-950 rounded-lg p-3 mb-5 border border-slate-800/50 flex justify-between items-center">
              <div>
                <div className="text-xs text-slate-500 mb-0.5">Projected Value</div>
                <div className="font-semibold text-emerald-400">
                  {rec.impact.projectedSavings ? formatCurrency(rec.impact.projectedSavings) : 'Non-financial'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 mb-0.5">Confidence</div>
                <div className="font-medium text-slate-300">
                  {formatPercentage(rec.confidence)}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onApprove?.(rec.id)}
                disabled={rec.approvalState !== 'Pending Review'}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-medium py-2 rounded-md transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => onReject?.(rec.id)}
                disabled={rec.approvalState !== 'Pending Review'}
                className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900/50 disabled:text-slate-600 text-white text-sm font-medium py-2 rounded-md border border-slate-700 disabled:border-slate-800 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
