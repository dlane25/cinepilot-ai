import React from "react";
import { ProductionRisk } from "../../types";
import { formatCurrency, formatPercentage } from "../../lib/utils/format";
import { calculateAggregateFinancialExposure } from "../../lib/domain/calculations";
import { AlertTriangle, Activity } from "lucide-react";

interface RiskPanelProps {
  risks: ProductionRisk[];
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "Critical": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    case "High": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    case "Medium": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "Low": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
}

export function RiskPanel({ risks }: RiskPanelProps) {
  const totalExposure = calculateAggregateFinancialExposure(risks);
  
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          Production Risks
        </h2>
        <div className="text-sm">
          <span className="text-slate-400 mr-2">Aggregate Exposure:</span>
          <span className="font-semibold text-rose-400">{formatCurrency(totalExposure)}</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3 font-medium">Risk Event</th>
                <th className="px-5 py-3 font-medium">Area</th>
                <th className="px-5 py-3 font-medium">Severity</th>
                <th className="px-5 py-3 font-medium">Probability</th>
                <th className="px-5 py-3 font-medium">Exposure</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {risks.map((risk) => (
                <tr key={risk.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-200 mb-1">{risk.title}</div>
                    <div className="text-slate-500 text-xs line-clamp-1">{risk.description}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-400">{risk.affectedProductionArea}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getSeverityColor(risk.severity)}`}>
                      {risk.severity}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">{formatPercentage(risk.probability)}</span>
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-slate-500" 
                          style={{ width: `${risk.probability * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-300">
                    {formatCurrency(risk.financialExposure)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${
                      risk.status === 'Open' ? 'text-amber-400' : 'text-slate-500'
                    }`}>
                      {risk.status === 'Open' && <Activity className="w-3.5 h-3.5" />}
                      {risk.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
