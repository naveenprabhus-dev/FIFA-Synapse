/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SectorTelemetry } from '../types';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Layers, AlertCircle } from 'lucide-react';

interface CrowdHeatmapProps {
  sectors: SectorTelemetry[];
  selectedSectorId: string | null;
  onSelectSector: (sectorId: string) => void;
}

export function CrowdHeatmap({ sectors, selectedSectorId, onSelectSector }: CrowdHeatmapProps) {
  // Helper to resolve colors based on status
  const getHeatColor = (status: SectorTelemetry['status'], isSelected: boolean) => {
    switch (status) {
      case 'CRITICAL':
        return isSelected ? 'fill-red-500/80 stroke-red-400 stroke-2' : 'fill-red-600/40 stroke-red-500/60 hover:fill-red-500/60';
      case 'CONGESTED':
        return isSelected ? 'fill-amber-500/80 stroke-amber-400 stroke-2' : 'fill-amber-600/40 stroke-amber-500/60 hover:fill-amber-500/60';
      case 'MODERATE':
        return isSelected ? 'fill-blue-500/80 stroke-blue-400 stroke-2' : 'fill-blue-600/40 stroke-blue-500/60 hover:fill-blue-500/60';
      case 'OPTIMAL':
      default:
        return isSelected ? 'fill-emerald-500/80 stroke-emerald-400 stroke-2' : 'fill-emerald-600/40 stroke-emerald-500/60 hover:fill-emerald-500/60';
    }
  };

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

  return (
    <Card className="p-6 bg-slate-950/40 border border-slate-900 flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-200 font-sans uppercase flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Interactive Bowl Heatmap</span>
          </h4>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mt-0.5">
            Real-time sector density load matching physical sensor streams
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500/40 inline-block"></span> Optimal</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-500/40 inline-block"></span> Moderate</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500/40 inline-block"></span> Congested</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500/40 inline-block"></span> Critical</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Interactive Stadium Bowl SVG */}
        <div className="relative flex-1 w-full max-w-[340px] aspect-square flex items-center justify-center bg-slate-950/60 border border-slate-900 rounded-xl p-4">
          <svg viewBox="0 0 200 200" className="w-full h-full max-h-[280px]">
            {/* Inner Pitch */}
            <rect x="70" y="55" width="60" height="90" rx="3" className="fill-emerald-900/10 stroke-emerald-800/40" />
            <line x1="70" y1="100" x2="130" y2="100" className="stroke-emerald-800/20" />
            <circle cx="100" cy="100" r="15" className="fill-none stroke-emerald-800/20" />

            {/* Sector A (West) */}
            <path
              id="SEC_A_svg"
              d="M 65,45 L 35,45 A 75,75 0 0,0 35,155 L 65,155 A 45,45 0 0,1 65,45 Z"
              className={`transition-all duration-300 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 ${getHeatColor(
                sectors.find(s => s.id === 'SEC_A')?.status || 'OPTIMAL',
                selectedSectorId === 'SEC_A'
              )}`}
              onClick={() => onSelectSector('SEC_A')}
              tabIndex={0}
              aria-label="Sector A, West Stand. Click for detail."
              onKeyDown={(e) => e.key === 'Enter' && onSelectSector('SEC_A')}
            />
            <text x="44" y="103" className="fill-slate-300 text-[9px] font-bold font-sans pointer-events-none text-center">A</text>

            {/* Sector B (East) */}
            <path
              id="SEC_B_svg"
              d="M 135,45 L 165,45 A 75,75 0 0,1 165,155 L 135,155 A 45,45 0 0,0 135,45 Z"
              className={`transition-all duration-300 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 ${getHeatColor(
                sectors.find(s => s.id === 'SEC_B')?.status || 'OPTIMAL',
                selectedSectorId === 'SEC_B'
              )}`}
              onClick={() => onSelectSector('SEC_B')}
              tabIndex={0}
              aria-label="Sector B, East Stand. Click for detail."
              onKeyDown={(e) => e.key === 'Enter' && onSelectSector('SEC_B')}
            />
            <text x="150" y="103" className="fill-slate-300 text-[9px] font-bold font-sans pointer-events-none">B</text>

            {/* Sector C (North) */}
            <path
              id="SEC_C_svg"
              d="M 68,40 A 45,45 0 0,1 132,40 L 162,15 A 75,75 0 0,0 38,15 Z"
              className={`transition-all duration-300 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 ${getHeatColor(
                sectors.find(s => s.id === 'SEC_C')?.status || 'OPTIMAL',
                selectedSectorId === 'SEC_C'
              )}`}
              onClick={() => onSelectSector('SEC_C')}
              tabIndex={0}
              aria-label="Sector C, North Stand. Click for detail."
              onKeyDown={(e) => e.key === 'Enter' && onSelectSector('SEC_C')}
            />
            <text x="97" y="30" className="fill-slate-300 text-[9px] font-bold font-sans pointer-events-none">C</text>

            {/* Sector D (South) */}
            <path
              id="SEC_D_svg"
              d="M 68,160 A 45,45 0 0,0 132,160 L 162,185 A 75,75 0 0,1 38,185 Z"
              className={`transition-all duration-300 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 ${getHeatColor(
                sectors.find(s => s.id === 'SEC_D')?.status || 'OPTIMAL',
                selectedSectorId === 'SEC_D'
              )}`}
              onClick={() => onSelectSector('SEC_D')}
              tabIndex={0}
              aria-label="Sector D, South Stand. Click for detail."
              onKeyDown={(e) => e.key === 'Enter' && onSelectSector('SEC_D')}
            />
            <text x="97" y="176" className="fill-slate-300 text-[9px] font-bold font-sans pointer-events-none">D</text>
          </svg>
          <div className="absolute top-2 left-2 bg-slate-900/90 border border-slate-800 text-[8px] font-mono rounded px-1.5 py-0.5 text-slate-400">
            Click Bowl Sector
          </div>
        </div>

        {/* Selected Sector Context Sidebar */}
        <div className="flex-1 w-full space-y-3.5">
          {selectedSectorId ? (
            (() => {
              const sec = sectors.find(s => s.id === selectedSectorId);
              if (!sec) return null;
              return (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-xs font-bold text-slate-200">{sec.name}</span>
                    <Badge variant={getBadgeVariant(sec.status)} className="text-[9px] uppercase px-2 py-0.5 font-mono">
                      {sec.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-900">
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Current Load</span>
                      <span className="text-sm font-bold text-slate-200 font-sans">{sec.occupancyPercent}%</span>
                      <p className="text-[8px] text-slate-400 mt-0.5 font-sans leading-tight">Sector volume saturation</p>
                    </div>

                    <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-900">
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Transit Speed</span>
                      <span className="text-sm font-bold text-slate-200 font-sans">{sec.walkingSpeedMs} m/s</span>
                      <p className="text-[8px] text-slate-400 mt-0.5 font-sans leading-tight">Average movement velocity</p>
                    </div>

                    <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-900">
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Flow Rate</span>
                      <span className="text-sm font-bold text-slate-200 font-sans">{sec.flowRatePerMin} /min</span>
                      <p className="text-[8px] text-slate-400 mt-0.5 font-sans leading-tight">Persons traversing sensors</p>
                    </div>

                    <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-900">
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Escalators</span>
                      <span className={`text-xs font-bold font-mono block ${sec.escalatorStatus === 'OPERATIONAL' ? 'text-emerald-400' : sec.escalatorStatus === 'DEGRADED' ? 'text-amber-400' : 'text-red-400'}`}>
                        {sec.escalatorStatus}
                      </span>
                      <p className="text-[8px] text-slate-400 mt-0.5 font-sans leading-tight">Concourse elevator links</p>
                    </div>
                  </div>

                  {sec.status === 'CRITICAL' && (
                    <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-2.5 flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-[9px] text-red-300 leading-normal font-sans">
                        <strong>Red Alert:</strong> Density is above safe structural limits. Egress flow-stretching protocol recommended through auxiliary gates.
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-900 rounded-xl bg-slate-950/20">
              <Layers className="w-6 h-6 text-slate-700 mb-2" />
              <p className="text-xs text-slate-400 font-sans">
                Select any arena sector on the left to review dynamic local parameters and sensory load matrices.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
