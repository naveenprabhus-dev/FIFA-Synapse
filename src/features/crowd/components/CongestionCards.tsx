/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SectorTelemetry } from '../types';
import { Card } from '../../../components/ui/Card';
import { Users, TrendingUp, AlertTriangle, Gauge } from 'lucide-react';

interface CongestionCardsProps {
  sectors: SectorTelemetry[];
}

export function CongestionCards({ sectors }: CongestionCardsProps) {
  // Calculations
  const averageOccupancy = Math.round(
    sectors.reduce((acc, s) => acc + s.occupancyPercent, 0) / sectors.length
  );

  const peakSector = [...sectors].sort((a, b) => b.occupancyPercent - a.occupancyPercent)[0];

  const averageWalkingSpeed = (
    sectors.reduce((acc, s) => acc + s.walkingSpeedMs, 0) / sectors.length
  ).toFixed(2);

  const degradedFacilities = sectors.filter(
    s => s.escalatorStatus !== 'OPERATIONAL' || s.elevatorStatus !== 'OPERATIONAL'
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Average Occupancy Card */}
      <Card className="p-4 bg-slate-900/40 border border-slate-800/80 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block">
            Average Stadium Occupancy
          </span>
          <span className="text-xl font-extrabold text-slate-200 font-sans tracking-tight block">
            {averageOccupancy}%
          </span>
          <span className="text-[8px] text-emerald-400 font-mono flex items-center gap-0.5">
            <TrendingUp className="w-2.5 h-2.5" /> Stable threshold limit
          </span>
        </div>
        <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
          <Users className="w-4 h-4" />
        </div>
      </Card>

      {/* Peak Saturation Point Card */}
      <Card className="p-4 bg-slate-900/40 border border-slate-800/80 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block">
            Peak Saturation Area
          </span>
          <span className="text-xl font-extrabold text-amber-500 font-sans tracking-tight block">
            {peakSector.name.split(' ')[0]} {peakSector.name.split(' ')[1] || ''}
          </span>
          <span className="text-[8px] text-amber-400 font-mono">
            Occupancy rate: {peakSector.occupancyPercent}% (CRITICAL)
          </span>
        </div>
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
          <AlertTriangle className="w-4 h-4" />
        </div>
      </Card>

      {/* Flow Speed Meter Card */}
      <Card className="p-4 bg-slate-900/40 border border-slate-800/80 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block">
            Concourse Velocity Meter
          </span>
          <span className="text-xl font-extrabold text-slate-200 font-sans tracking-tight block">
            {averageWalkingSpeed} m/s
          </span>
          <span className="text-[8px] text-slate-500 font-sans">
            Safety floor baseline: 1.0 m/s
          </span>
        </div>
        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400">
          <Gauge className="w-4 h-4" />
        </div>
      </Card>

      {/* Outage Alerts Card */}
      <Card className="p-4 bg-slate-900/40 border border-slate-800/80 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block">
            Active Mechanical Issues
          </span>
          <span className={`text-xl font-extrabold font-sans tracking-tight block ${degradedFacilities > 0 ? 'text-red-400' : 'text-slate-200'}`}>
            {degradedFacilities} Incident{degradedFacilities !== 1 ? 's' : ''}
          </span>
          <span className="text-[8px] text-slate-500 font-sans">
            Elevator & Escalator nodes checked
          </span>
        </div>
        <div className={`p-2.5 rounded-xl ${degradedFacilities > 0 ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-slate-950 border border-slate-800 text-slate-400'}`}>
          <AlertTriangle className="w-4 h-4" />
        </div>
      </Card>
    </div>
  );
}
