/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GateTelemetry } from '../types';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Radio, Users, Clock, Flame } from 'lucide-react';

interface QueueForecastProps {
  gates: GateTelemetry[];
}

export function QueueForecast({ gates }: QueueForecastProps) {
  return (
    <Card className="p-6 bg-slate-950/40 border border-slate-900 flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-200 font-sans uppercase flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>Smart Queue Wait Forecasts</span>
          </h4>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mt-0.5">
            Predictive checkpoint queueing curves & dispatch bottlenecks
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {gates.map((g) => {
          const isCrowded = g.predictedWaitTimeMins >= 6;
          return (
            <div
              key={g.id}
              className="p-3 bg-slate-900/10 border border-slate-900 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 font-sans">{g.name}</span>
                  {isCrowded ? (
                    <Badge variant="error" className="text-[8px] tracking-wide px-1.5 py-0.5 animate-pulse uppercase">
                      Bottleneck Risk
                    </Badge>
                  ) : (
                    <Badge variant="success" className="text-[8px] tracking-wide px-1.5 py-0.5 uppercase">
                      Nominal Queue
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> Queue count: {g.currentQueueLength} fans
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Rate: {g.processingRatePerMin} /min
                  </span>
                </div>
              </div>

              <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center">
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block sm:hidden">
                  Estimated Wait:
                </span>
                <span className={`text-sm font-extrabold font-mono ${isCrowded ? 'text-amber-400' : 'text-slate-300'}`}>
                  {g.predictedWaitTimeMins.toFixed(1)} min
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
