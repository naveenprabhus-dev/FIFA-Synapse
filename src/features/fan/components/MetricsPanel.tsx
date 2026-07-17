/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Users, AlertTriangle, Accessibility, ShieldCheck, Thermometer, Radio } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { NavigationSimulatorState } from '../types';

interface MetricsPanelProps {
  simulator: NavigationSimulatorState;
  densityScore: number;
}

export function MetricsPanel({ simulator, densityScore }: MetricsPanelProps) {
  // Colour blind friendly / high contrast definitions:
  // We use standard accessible icons with detailed status text so we don't rely purely on color.

  const getCrowdStatus = () => {
    if (simulator.crowdSurgeZone !== 'NONE') {
      return {
        label: `CRITICAL Surge (${simulator.crowdSurgeZone})`,
        desc: 'Crowd size > 4.5 people/m². Strict pathing is active.',
        badge: 'error' as const,
      };
    }
    if (densityScore > 0.6) {
      return {
        label: 'HEAVY CONGESTION',
        desc: 'Crowd size ~ 3.2 people/m². Move with caution.',
        badge: 'warning' as const,
      };
    }
    return {
      label: 'OPTIMAL CIRCULATION',
      desc: 'Crowd size < 1.2 people/m². Normal transit flow.',
      badge: 'success' as const,
    };
  };

  const getElevatorStatus = () => {
    if (!simulator.elevatorsActive) {
      return {
        label: 'ELEVATOR OUTAGE REPORTED',
        desc: 'West Concourse Elevator 2 is undergoing repair.',
        badge: 'error' as const,
      };
    }
    return {
      label: 'ELEVATORS OPERATIONAL',
      desc: 'All 14 ADA vertical transit units are online.',
      badge: 'success' as const,
    };
  };

  const crowd = getCrowdStatus();
  const elevator = getElevatorStatus();

  return (
    <Card className="bg-slate-900/30 border border-slate-800/80 p-5 space-y-4">
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
              Cognitive Decision Vectors
            </span>
            <h4 className="text-xs font-bold text-slate-200 font-sans uppercase">
              Stadium Safety Telemetry Metrics
            </h4>
          </div>
        </div>
      </div>

      {/* Grid of inclusive metrics */}
      <div className="space-y-4">
        {/* Crowd Flow Indicator */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-200">
              <Users className="w-4.5 h-4.5 text-blue-400" />
              <span className="text-xs font-bold font-sans">Crowd Density Matrix</span>
            </div>
            <Badge variant={crowd.badge} className="text-[9px] font-mono px-2 py-0.5">
              {crowd.label}
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans pl-6">
            {crowd.desc}
          </p>
        </div>

        {/* Accessibility Lifts & Elevators */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-200">
              <Accessibility className="w-4.5 h-4.5 text-emerald-400" />
              <span className="text-xs font-bold font-sans">ADA Lift & Escalator State</span>
            </div>
            <Badge variant={elevator.badge} className="text-[9px] font-mono px-2 py-0.5">
              {elevator.label}
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans pl-6">
            {elevator.desc}
          </p>
        </div>

        {/* Weather Hazards */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-200">
              <Thermometer className="w-4.5 h-4.5 text-amber-400" />
              <span className="text-xs font-bold font-sans">Environmental Safety Checks</span>
            </div>
            <Badge variant={simulator.weatherCondition === 'RAIN' ? 'warning' : 'success'} className="text-[9px] font-mono px-2 py-0.5">
              {simulator.weatherCondition} CONDITION
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans pl-6">
            {simulator.weatherCondition === 'RAIN' 
              ? 'Moderate rain detected. Steps are damp; outdoor promenade speed-routing is restricted.' 
              : simulator.weatherCondition === 'WINDY' 
              ? 'High wind velocity registered at Level 3. Outer promenades under wind alert.' 
              : 'Thermal metrics optimum. Pitch ventilation roof active.'}
          </p>
        </div>

        {/* Emergency status checks */}
        {simulator.emergencyLockdown && (
          <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertTriangle className="w-4.5 h-4.5 animate-bounce" />
              <span className="text-xs font-bold font-sans uppercase">Crisis Operational Override</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans pl-6">
              Sector lockdown simulation is active. Evacuation dispatch rules override standard concession routes.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
