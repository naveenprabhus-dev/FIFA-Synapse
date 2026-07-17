/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CrowdAlert } from '../types';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { ShieldAlert, AlertCircle, XCircle, CheckCircle } from 'lucide-react';

interface CrowdAlertsProps {
  alerts: CrowdAlert[];
  onResolveAlert: (id: string) => void;
}

export function CrowdAlerts({ alerts, onResolveAlert }: CrowdAlertsProps) {
  const getSeverityBadge = (severity: CrowdAlert['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return <Badge variant="error" className="text-[8px] uppercase tracking-wider font-mono animate-pulse">CRITICAL DISPATCH</Badge>;
      case 'HIGH':
        return <Badge variant="error" className="text-[8px] uppercase tracking-wider font-mono">HIGH RISK</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning" className="text-[8px] uppercase tracking-wider font-mono">MODERATE LEVEL</Badge>;
      case 'LOW':
      default:
        return <Badge variant="info" className="text-[8px] uppercase tracking-wider font-mono">MONITOR ONLY</Badge>;
    }
  };

  return (
    <Card className="p-6 bg-slate-950/40 border border-slate-900 flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-200 font-sans uppercase flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Active Crowd Alerts</span>
          </h4>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mt-0.5">
            Active crowd compressions or structural disruptions on foot
          </p>
        </div>
        <Badge variant="error" className="text-[9px] px-2 py-0.5 font-mono uppercase">
          {alerts.length} ALARM{alerts.length !== 1 ? 'S' : ''}
        </Badge>
      </div>

      <div className="space-y-3">
        {alerts.length > 0 ? (
          alerts.map((a) => (
            <div
              key={a.id}
              className={`p-3.5 rounded-xl border flex gap-3.5 transition-all duration-200 ${
                a.severity === 'CRITICAL' || a.severity === 'HIGH'
                  ? 'bg-red-950/10 border-red-900/30'
                  : 'bg-slate-900/10 border-slate-900'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <AlertCircle className={`w-4 h-4 ${a.severity === 'CRITICAL' || a.severity === 'HIGH' ? 'text-red-400' : 'text-amber-400'}`} />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-200 block font-sans">{a.title}</span>
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">{a.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(a.severity)}
                    <span className="text-[8px] font-mono text-slate-500">{a.timestamp}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-normal font-sans">
                  {a.description}
                </p>

                {/* Resolve Action */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onResolveAlert(a.id)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/10 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label={`Mark incident ${a.title} as resolved`}
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>RESOLVE INCIDENT</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 border border-dashed border-slate-900 rounded-xl bg-slate-950/20">
            <CheckCircle className="w-6 h-6 text-emerald-500/40 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-sans font-medium">All sectors fully stabilized</p>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">No critical crowding conditions detected.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
