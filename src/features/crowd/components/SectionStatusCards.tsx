/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SectorTelemetry } from '../types';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { LayoutGrid, Flame, ArrowUpRight, Ban, CheckCircle } from 'lucide-react';

interface SectionStatusCardsProps {
  sectors: SectorTelemetry[];
  selectedSectorId: string | null;
  onSelectSector: (sectorId: string) => void;
}

export function SectionStatusCards({ sectors, selectedSectorId, onSelectSector }: SectionStatusCardsProps) {
  const getBadgeVariant = (status: SectorTelemetry['status']) => {
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

  const getProgressColor = (status: SectorTelemetry['status']) => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-red-500';
      case 'CONGESTED':
        return 'bg-amber-500';
      case 'MODERATE':
        return 'bg-blue-500';
      case 'OPTIMAL':
      default:
        return 'bg-emerald-500';
    }
  };

  return (
    <Card className="p-6 bg-slate-950/40 border border-slate-900 flex flex-col space-y-4">
      <div>
        <h4 className="text-sm font-bold text-slate-200 font-sans uppercase flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-blue-400" />
          <span>Real-time Concourse Sector Log</span>
        </h4>
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mt-0.5">
          Detailed telemetry indexes across sectors, mechanical lanes & elevator corridors
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sectors.map((sec) => {
          const isSelected = selectedSectorId === sec.id;
          return (
            <div
              key={sec.id}
              onClick={() => onSelectSector(sec.id)}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer space-y-3 ${
                isSelected
                  ? 'bg-blue-950/20 border-blue-500/40 shadow-sm shadow-blue-500/5'
                  : 'bg-slate-900/20 border-slate-900/60 hover:bg-slate-900/40 hover:border-slate-800'
              }`}
              tabIndex={0}
              role="button"
              aria-label={`Sector ${sec.name} detailed analysis`}
              onKeyDown={(e) => e.key === 'Enter' && onSelectSector(sec.id)}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-sans">{sec.name}</span>
                <Badge variant={getBadgeVariant(sec.status)} className="text-[9px] font-mono px-2 py-0.5 uppercase">
                  {sec.status}
                </Badge>
              </div>

              {/* Progress meter */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Occupancy Index</span>
                  <span>{sec.occupancyPercent}%</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getProgressColor(sec.status)}`}
                    style={{ width: `${sec.occupancyPercent}%` }}
                  />
                </div>
              </div>

              {/* Secondary Telemetry Details */}
              <div className="grid grid-cols-3 gap-2 border-t border-slate-950 pt-2.5">
                <div className="space-y-0.5 text-center">
                  <span className="text-[8px] font-mono text-slate-500 uppercase block">Flow rate</span>
                  <span className="text-xs font-extrabold text-slate-300 font-sans flex items-center justify-center gap-0.5">
                    {sec.flowRatePerMin} <ArrowUpRight className="w-3 h-3 text-slate-500" />
                  </span>
                </div>

                <div className="space-y-0.5 text-center">
                  <span className="text-[8px] font-mono text-slate-500 uppercase block">Escalator</span>
                  <span className="text-[9px] font-bold font-mono flex items-center justify-center gap-0.5">
                    {sec.escalatorStatus === 'OPERATIONAL' ? (
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Ban className="w-3 h-3 text-red-400" />
                    )}
                    <span className={sec.escalatorStatus === 'OPERATIONAL' ? 'text-slate-300' : 'text-red-400'}>
                      {sec.escalatorStatus === 'OPERATIONAL' ? 'OK' : 'ERR'}
                    </span>
                  </span>
                </div>

                <div className="space-y-0.5 text-center">
                  <span className="text-[8px] font-mono text-slate-500 uppercase block">Elevator</span>
                  <span className="text-[9px] font-bold font-mono flex items-center justify-center gap-0.5">
                    {sec.elevatorStatus === 'OPERATIONAL' ? (
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Ban className="w-3 h-3 text-red-400" />
                    )}
                    <span className={sec.elevatorStatus === 'OPERATIONAL' ? 'text-slate-300' : 'text-red-400'}>
                      {sec.elevatorStatus === 'OPERATIONAL' ? 'OK' : 'ERR'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
