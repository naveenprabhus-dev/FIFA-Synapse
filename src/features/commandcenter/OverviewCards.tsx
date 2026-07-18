/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseFullContext } from '../../ai/orchestrator/ContextBuilder';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { 
  Users, Accessibility, ShieldAlert, Activity, Flame, Clock, 
  MapPin, HelpCircle, HeartPulse, UserCheck, CheckSquare, Trash2 
} from 'lucide-react';

// 1. CrowdOverviewCard
interface CrowdOverviewCardProps {
  context: SynapseFullContext;
}

export function CrowdOverviewCard({ context }: CrowdOverviewCardProps) {
  const crowdData = context.crowdAnalysis || [];
  
  return (
    <Card className="p-5 bg-slate-900/30 border border-slate-800/80 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-blue-500/10 text-blue-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
              Crowd Dynamics & Flow Heat
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">Live Sector Ingress Analysis</span>
          </div>
        </div>
        <Badge variant={crowdData.some(c => c.status === 'CRITICAL') ? 'error' : 'success'} className="text-[9px] font-mono">
          {crowdData.some(c => c.status === 'CRITICAL') ? 'CRITICAL SPIKES' : 'FLOW OPTIMAL'}
        </Badge>
      </div>

      <div className="space-y-3">
        {crowdData.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono text-center py-6">No crowd telemetry streams available.</p>
        ) : (
          crowdData.map((sector, i) => {
            const isSpike = sector.occupancyPercent >= 90;
            const isCongested = sector.occupancyPercent >= 75 && sector.occupancyPercent < 90;

            let barColor = 'bg-emerald-500';
            let textColor = 'text-emerald-400';
            if (isSpike) {
              barColor = 'bg-rose-500';
              textColor = 'text-rose-400';
            } else if (isCongested) {
              barColor = 'bg-amber-500';
              textColor = 'text-amber-400';
            }

            return (
              <div key={sector.sectorId || i} className="space-y-1.5 p-2 rounded bg-slate-950/20 border border-slate-900/60">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-200">{sector.sectorId}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({sector.flowRatePerMin} patrons/min)</span>
                  </div>
                  <span className={`font-mono font-bold ${textColor}`}>
                    {sector.occupancyPercent}% Occupied
                  </span>
                </div>
                <div className="relative w-full h-2 bg-slate-800 rounded overflow-hidden">
                  <div 
                    className={`h-full ${barColor} transition-all duration-1000`} 
                    style={{ width: `${sector.occupancyPercent}%` }} 
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

// 2. AccessibilityOverview
interface AccessibilityOverviewProps {
  context: SynapseFullContext;
}

export function AccessibilityOverview({ context }: AccessibilityOverviewProps) {
  const incidents = context.activeIncidents || [];
  
  // Filter for structural accessibility blockages
  const accessibilityOutages = incidents.filter(i => 
    i.category === 'INFRASTRUCTURE_FAILURE' && 
    (i.description.toLowerCase().includes('elevator') || 
     i.description.toLowerCase().includes('ramp') || 
     i.description.toLowerCase().includes('wheelchair') || 
     i.description.toLowerCase().includes('accessibility'))
  );

  return (
    <Card className="p-5 bg-slate-900/30 border border-slate-800/80 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400">
            <Accessibility className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
              Accessibility (ADA) Grid
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">Mechanical & Step-Free Transits</span>
          </div>
        </div>
        <Badge variant={accessibilityOutages.length > 0 ? 'error' : 'success'} className="text-[9px] font-mono">
          {accessibilityOutages.length > 0 ? 'OUTAGES DETECTED' : 'SYSTEMS ONLINE'}
        </Badge>
      </div>

      <div className="space-y-3">
        {accessibilityOutages.length === 0 ? (
          <div className="p-3 rounded bg-emerald-950/10 border border-emerald-900/40 text-xs text-emerald-400 flex items-start gap-2">
            <CheckSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="space-y-0.5">
              <span className="font-bold">All elevators, ramps, and tactical lanes fully operational.</span>
              <p className="text-[10px] text-emerald-500 leading-relaxed">No mechanical faults detected. Volunteers are stationed at standard concourse intersections.</p>
            </div>
          </div>
        ) : (
          accessibilityOutages.map((outage, i) => (
            <div key={outage.id || i} className="p-3 rounded bg-rose-950/10 border border-rose-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 font-sans uppercase">Outage Alert</span>
                <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>5 mins ago</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                <span className="font-bold text-slate-200">{outage.locationName}:</span> {outage.description}
              </p>
              <div className="text-[10px] text-amber-400 font-mono font-semibold pt-1 border-t border-rose-900/20">
                RECOMMENDED ACTION: Dynamic wheelchair reroutes routed to Ramp 4.
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

// 3. EmergencyOverview
interface EmergencyOverviewProps {
  context: SynapseFullContext;
}

export function EmergencyOverview({ context }: EmergencyOverviewProps) {
  const incidents = context.activeIncidents || [];
  
  // Filter for safety emergencies
  const emergencyIncidents = incidents.filter(i => 
    i.severity === 'CRITICAL' || 
    i.category === 'SECURITY_BREACH' || 
    i.category === 'MEDICAL_EMERGENCY'
  );

  return (
    <Card className="p-5 bg-slate-900/30 border border-slate-800/80 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-rose-500/10 text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
              Emergency Dispatch Matrix
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">Medical & Security Command</span>
          </div>
        </div>
        <Badge variant={emergencyIncidents.length > 0 ? 'error' : 'success'} className="text-[9px] font-mono">
          {emergencyIncidents.length > 0 ? 'ACTIVE DISPATCH' : 'PERIMETER SECURE'}
        </Badge>
      </div>

      <div className="space-y-3">
        {emergencyIncidents.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 font-mono space-y-2">
            <UserCheck className="w-6 h-6 text-slate-600 mx-auto" />
            <p>Zero active medical or security emergencies reported.</p>
          </div>
        ) : (
          emergencyIncidents.map((incident, i) => (
            <div key={incident.id || i} className="p-3.5 rounded bg-slate-950/40 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                    {incident.category.replace('_', ' ')}
                  </span>
                </div>
                <Badge variant="error" className="text-[9px] font-mono">
                  {incident.severity}
                </Badge>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {incident.description} at <span className="text-slate-100 font-semibold">{incident.locationName}</span>.
              </p>

              <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-slate-800/60 font-mono">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                  <span>MEDICS: Unit 2 Dispatched</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 justify-end">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>SLA TIMER: 3m 42s</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

// 4. OperationsOverview
interface OperationsOverviewProps {
  context: SynapseFullContext;
}

export function OperationsOverview({ context }: OperationsOverviewProps) {
  const incidents = context.activeIncidents || [];
  
  // Filter for lower-level operational cleaning or facility requests
  const operationsIncidents = incidents.filter(i => 
    i.category === 'INFRASTRUCTURE_FAILURE' && 
    !i.description.toLowerCase().includes('elevator') && 
    !i.description.toLowerCase().includes('ramp')
  );

  return (
    <Card className="p-5 bg-slate-900/30 border border-slate-800/80 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-amber-500/10 text-amber-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
              Operations & Sanitation
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">Shift & Facility Tasks</span>
          </div>
        </div>
        <Badge variant={operationsIncidents.length > 0 ? 'warning' : 'success'} className="text-[9px] font-mono">
          {operationsIncidents.length > 0 ? 'LOGS REQUIRING SWEEP' : 'OPERATIONS BALANCED'}
        </Badge>
      </div>

      <div className="space-y-3">
        {operationsIncidents.length === 0 ? (
          <div className="p-3 rounded bg-slate-950/20 border border-slate-900/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Volunteer Allocation</span>
              <span className="text-emerald-400">42 On Duty</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans">All sanitation squads logged checklist rounds. VIP lounges and general concourses are serviced on schedule.</p>
          </div>
        ) : (
          operationsIncidents.map((task, i) => (
            <div key={task.id || i} className="p-3 rounded bg-slate-950/20 border border-slate-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-sans uppercase">Sanitation / Facilities</span>
                <Badge variant="warning" className="text-[9px] font-mono">Assigned</Badge>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                <span className="font-bold text-slate-200">{task.locationName}:</span> {task.description}
              </p>
              <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-900/40 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                <span>CLEANUP SQUAD: Team Alpha alerted</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
