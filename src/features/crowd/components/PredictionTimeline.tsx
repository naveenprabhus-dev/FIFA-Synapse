/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CrowdPredictionItem } from '../types';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Hourglass, AlertCircle } from 'lucide-react';

interface PredictionTimelineProps {
  predictions: CrowdPredictionItem[];
}

export function PredictionTimeline({ predictions }: PredictionTimelineProps) {
  const getBadgeVariant = (status: CrowdPredictionItem['status']) => {
    switch (status) {
      case 'CRITICAL':
        return 'error';
      case 'CONGESTED':
        return 'warning';
      case 'MODERATE':
        return 'info';
      case 'OPTIMAL':
      default:
        return 'success';
    }
  };

  const getBorderColor = (status: CrowdPredictionItem['status']) => {
    switch (status) {
      case 'CRITICAL':
        return 'border-red-500 bg-red-950/40 text-red-400';
      case 'CONGESTED':
        return 'border-amber-500 bg-amber-950/40 text-amber-400';
      case 'MODERATE':
        return 'border-blue-500 bg-blue-950/40 text-blue-400';
      case 'OPTIMAL':
      default:
        return 'border-emerald-500 bg-emerald-950/40 text-emerald-400';
    }
  };

  return (
    <Card className="p-6 bg-slate-950/40 border border-slate-900 flex flex-col space-y-4">
      <div>
        <h4 className="text-sm font-bold text-slate-200 font-sans uppercase flex items-center gap-2">
          <Hourglass className="w-4 h-4 text-blue-400" />
          <span>Crowd Flow Prediction Timeline</span>
        </h4>
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mt-0.5">
          Forward-looking neural density model forecasts (15-60 min horizons)
        </p>
      </div>

      <div className="relative border-l border-slate-800 ml-3.5 pl-6 space-y-6">
        {predictions.map((p, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline Connector Bulb */}
            <span className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${getBorderColor(p.status)}`}>
              <span className="w-1 h-1 bg-current rounded-full" />
            </span>

            <div className="space-y-1.5 bg-slate-900/10 hover:bg-slate-900/30 border border-transparent hover:border-slate-850 p-3 rounded-xl transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-slate-300">
                  T + {p.timeOffsetMins} Minutes
                </span>
                <Badge variant={getBadgeVariant(p.status)} className="text-[8px] uppercase tracking-wider px-2 py-0.5">
                  {p.predictedOccupancy}% Occupancy
                </Badge>
              </div>

              <div className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-normal font-sans">
                  {p.eventDescription}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
