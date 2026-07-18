/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  Users, Radio, Clock, Shield, Activity, Heart, Sparkles, CheckCircle2,
  Trash2, Wrench, AlertTriangle, Play, Square, Volume2, VolumeX, Info, MapPin, Check
} from 'lucide-react';
import { SynapsePriority } from '../../types/synapse';
import { OperationalArea, OperationsRecommendation } from '../../types/operations';

// ==========================================
// 1. REUSABLE: PriorityIndicator
// ==========================================
export function PriorityIndicator({ priority }: { priority: SynapsePriority }) {
  const getStyle = () => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'LOW':
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-extrabold uppercase tracking-wide ${getStyle()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{priority} PRIORITY</span>
    </span>
  );
}

// ==========================================
// 2. REUSABLE: OperationsDashboard (Wrapper Container)
// ==========================================
export function OperationsDashboard({ children }: { children: React.ReactNode }) {
  return (
    <section className="space-y-6" aria-label="Operations Intelligence Monitor">
      {children}
    </section>
  );
}

// ==========================================
// 3. REUSABLE: OperationsCard (Individual Metric Card)
// ==========================================
export function OperationsCard({
  title,
  value,
  subtitle,
  status,
  icon: Icon,
  onClick
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  status?: 'OPTIMAL' | 'MODERATE' | 'CRITICAL';
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}) {
  const getStatusColor = () => {
    if (status === 'CRITICAL') return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
    if (status === 'MODERATE') return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
  };

  const CardWrapper = onClick ? 'button' : 'div';

  return (
    <Card 
      className={`p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-4 text-left transition-all focus:ring-1 focus:ring-blue-500 outline-none ${
        onClick ? 'cursor-pointer hover:border-slate-700/80 hover:bg-slate-900/60 w-full' : ''
      } ${status ? getStatusColor() : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="space-y-1">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
          {title}
        </span>
        <div className="text-xl font-extrabold text-slate-100 uppercase tracking-tight">
          {value}
        </div>
        {subtitle && (
          <span className="text-[10px] text-slate-400 block font-sans">
            {subtitle}
          </span>
        )}
      </div>
      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-850">
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
    </Card>
  );
}

// ==========================================
// 4. REUSABLE: ResourceStatusCard
// ==========================================
export function ResourceStatusCard({
  volunteerCount,
  securityCount,
  medicalAvailable,
  onAdjust
}: {
  volunteerCount: number;
  securityCount: number;
  medicalAvailable: boolean;
  onAdjust?: () => void;
}) {
  return (
    <Card className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <h4 className="text-xs font-extrabold text-slate-200 uppercase font-sans tracking-wide">
            Live Resource Status Telemetry
          </h4>
        </div>
        {onAdjust && (
          <button
            onClick={onAdjust}
            className="text-[10px] font-mono text-blue-400 hover:underline cursor-pointer uppercase"
          >
            Adjust levels
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
          <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block">Volunteers</span>
          <span className="text-lg font-black text-slate-100">{volunteerCount}</span>
          <span className="text-[8px] text-slate-400 block font-mono">On-Duty</span>
        </div>
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
          <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block">Security</span>
          <span className="text-lg font-black text-slate-100">{securityCount}</span>
          <span className="text-[8px] text-slate-400 block font-mono">In Field</span>
        </div>
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
          <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block">Medical Unit</span>
          <span className={`text-xs font-black block leading-7 ${medicalAvailable ? 'text-emerald-400' : 'text-rose-400'}`}>
            {medicalAvailable ? 'AVAILABLE' : 'DECOY_BUSY'}
          </span>
          <span className="text-[8px] text-slate-400 block font-mono">Primary Alpha</span>
        </div>
      </div>
    </Card>
  );
}

// ==========================================
// 5. REUSABLE: DeploymentCard
// ==========================================
export function DeploymentCard({
  title,
  recommendedDeployments,
  status,
  requiredResources,
  onTriggerAction
}: {
  title: string;
  recommendedDeployments: string;
  status: string;
  requiredResources: string[];
  onTriggerAction?: () => void;
}) {
  return (
    <Card className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col justify-between h-full space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-extrabold">
            DEPLOYMENT DIRECTIVE
          </span>
          <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {status}
          </span>
        </div>
        <h4 className="text-sm font-bold text-slate-200 leading-tight">
          {title}
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          {recommendedDeployments}
        </p>

        {requiredResources.length > 0 && (
          <div className="space-y-1 pt-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">
              Allocated Assets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {requiredResources.map((res, i) => (
                <span key={i} className="text-[9px] font-mono px-2 py-0.5 bg-slate-950 text-slate-300 rounded border border-slate-850">
                  {res}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {onTriggerAction && (
        <button
          onClick={onTriggerAction}
          className="w-full text-center py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 hover:border-blue-500/50 text-xs font-extrabold text-blue-400 uppercase rounded-xl transition-all cursor-pointer tracking-wider"
        >
          EXECUTE STAFF DEPLOYMENT
        </button>
      )}
    </Card>
  );
}

// ==========================================
// 6. REUSABLE: OperationalRecommendationCard
// ==========================================
export function OperationalRecommendationCard({
  recommendation,
  isSpeaking,
  onSpeakToggle
}: {
  recommendation: OperationsRecommendation;
  isSpeaking?: boolean;
  onSpeakToggle?: () => void;
}) {
  return (
    <Card className="border border-slate-800/80 bg-gradient-to-br from-slate-900/50 via-slate-900/30 to-slate-950 p-5 rounded-2xl space-y-5 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/15 rounded-xl border border-blue-500/25">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black">
                SYNAPSE AI DIRECT DIRECTIVE
              </span>
              <PriorityIndicator priority={recommendation.priority} />
            </div>
            <h3 className="text-sm font-extrabold text-slate-100 uppercase font-sans tracking-wide">
              {recommendation.operationType.replace(/_/g, ' ')}
            </h3>
          </div>
        </div>

        {onSpeakToggle && (
          <button
            onClick={onSpeakToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-slate-950 hover:bg-slate-900 text-slate-300 border-slate-800'
            }`}
            aria-label={isSpeaking ? "Stop Voice Wayfinding Broadcast" : "Start Voice Wayfinding Broadcast"}
          >
            {isSpeaking ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isSpeaking ? 'STOP BROADCAST' : 'READ DIRECTIVE'}</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Situation Description */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">
            Live Telemetry Assessment
          </span>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {recommendation.currentSituation}
          </p>
        </div>

        {/* Primary Action Recommendation */}
        <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-blue-400 uppercase block font-bold tracking-wide">
            REASONED RECOMMENDATION
          </span>
          <p className="text-xs font-bold text-slate-100 leading-relaxed">
            {recommendation.recommendation}
          </p>
        </div>

        {/* Cognitive Justification explanation */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">
            Cognitive Justification (WHY this was selected)
          </span>
          <ul className="space-y-1.5">
            {recommendation.reasoning.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span className="font-sans leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Impact and Resources Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-850">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">
              Expected Outcome / Impact
            </span>
            <p className="text-xs text-emerald-400 font-sans">
              {recommendation.estimatedImpact}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">
              Required Operations Resources
            </span>
            <div className="flex flex-wrap gap-1">
              {recommendation.requiredResources.map((res, idx) => (
                <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-950 text-slate-300 border border-slate-850 rounded">
                  {res}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Confidence rating */}
        <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-xl border border-slate-850">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>AI COGNITIVE CONFIDENCE COEFFICIENT</span>
          </div>
          <span className="text-xs font-mono font-bold text-blue-400">
            {(recommendation.confidenceScore * 100).toFixed(0)}% CONFIDENCE
          </span>
        </div>

        {/* Alternative Action Plans */}
        {recommendation.alternativeActions.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-850">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">
              Secondary / Alternative Action Plans
            </span>
            <ul className="space-y-1">
              {recommendation.alternativeActions.map((alt, idx) => (
                <li key={idx} className="text-xs text-slate-400 flex items-start gap-1.5">
                  <span className="text-[10px] font-mono text-slate-500 font-extrabold mt-0.5">[{idx + 1}]</span>
                  <span className="font-sans leading-relaxed">{alt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

// ==========================================
// 7. REUSABLE: QueueStatusCard
// ==========================================
export function QueueStatusCard({
  queueLength,
  waitTimeMinutes,
  statusLabel
}: {
  queueLength: number;
  waitTimeMinutes: number;
  statusLabel: string;
}) {
  return (
    <Card className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col justify-between h-full space-y-3">
      <div className="space-y-1">
        <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">
          Queue Analysis
        </span>
        <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wide">
          Turnstile Queue Backlog
        </h4>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-2xl font-black text-slate-100">{queueLength}</span>
          <span className="text-xs text-slate-400 font-sans">guests waiting</span>
        </div>
      </div>

      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-sans">Est. Wait-time:</span>
        <span className="text-xs font-mono font-bold text-blue-400">{waitTimeMinutes} mins ({statusLabel})</span>
      </div>
    </Card>
  );
}

// ==========================================
// 8. REUSABLE: GateStatusCard
// ==========================================
export function GateStatusCard({
  gateName,
  gateStatus,
  onToggleStatus
}: {
  gateName: string;
  gateStatus: 'NORMAL' | 'CONGESTED' | 'CLOSED';
  onToggleStatus?: () => void;
}) {
  const getStatusStyle = () => {
    switch (gateStatus) {
      case 'CLOSED':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'CONGESTED':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <Card className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col justify-between h-full space-y-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">
            Access Controls
          </span>
          <span className={`text-[9px] font-mono font-extrabold px-2 py-0.5 border rounded uppercase ${getStatusStyle()}`}>
            {gateStatus}
          </span>
        </div>
        <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wide pt-1">
          {gateName}
        </h4>
        <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
          {gateStatus === 'CLOSED'
            ? 'Access channel blocked. Directing guests away.'
            : gateStatus === 'CONGESTED'
            ? 'High traffic volume. Manual pacing required.'
            : 'Operational baseline flow.'}
        </p>
      </div>

      {onToggleStatus && (
        <button
          onClick={onToggleStatus}
          className="w-full text-center py-1.5 bg-slate-950 hover:bg-slate-900 text-[10px] font-mono font-bold border border-slate-850 hover:border-slate-800 text-slate-400 uppercase rounded-lg cursor-pointer"
        >
          Toggle Gate Power Grid
        </button>
      )}
    </Card>
  );
}

// ==========================================
// 9. REUSABLE: MaintenanceAlertCard
// ==========================================
export function MaintenanceAlertCard({
  equipmentName,
  status,
  reportedTime,
  onResolve
}: {
  equipmentName: string;
  status: string;
  reportedTime: string;
  onResolve?: () => void;
}) {
  return (
    <Card className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col justify-between h-full space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">
            System Maintenance
          </span>
          <span className="text-[9px] font-mono text-amber-400 font-extrabold bg-amber-500/10 px-2 py-0.5 border border-amber-500/20 rounded">
            ALERT ACTIVE
          </span>
        </div>
        <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wide">
          {equipmentName}
        </h4>
        <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
          <div>Status: <span className="text-slate-300">{status}</span></div>
          <div>Reported: <span className="text-slate-300">{reportedTime}</span></div>
        </div>
      </div>

      {onResolve && (
        <button
          onClick={onResolve}
          className="w-full text-center py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-[10px] font-mono font-bold text-emerald-400 uppercase rounded-lg cursor-pointer"
        >
          Dispatch repair tech
        </button>
      )}
    </Card>
  );
}

// ==========================================
// 10. REUSABLE: CleaningStatusCard
// ==========================================
export function CleaningStatusCard({
  facilityName,
  cleaningStatus,
  onTriggerClean
}: {
  facilityName: string;
  cleaningStatus: 'CLEAN' | 'NEEDS_CLEANING' | 'CRITICAL';
  onTriggerClean?: () => void;
}) {
  const getStatusColor = () => {
    if (cleaningStatus === 'CRITICAL') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (cleaningStatus === 'NEEDS_CLEANING') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  };

  return (
    <Card className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col justify-between h-full space-y-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">
            Sanitation logs
          </span>
          <span className={`text-[9px] font-mono font-extrabold px-2 py-0.5 border rounded uppercase ${getStatusColor()}`}>
            {cleaningStatus}
          </span>
        </div>
        <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wide pt-1">
          {facilityName}
        </h4>
        <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
          {cleaningStatus === 'CRITICAL'
            ? 'Sanitation compliance breached. Janitorial dispatch required.'
            : cleaningStatus === 'NEEDS_CLEANING'
            ? 'Moderate usage recorded. Sweep scheduled.'
            : 'Fully sterilized & clean.'}
        </p>
      </div>

      {onTriggerClean && (
        <button
          onClick={onTriggerClean}
          className="w-full text-center py-1.5 bg-slate-950 hover:bg-slate-900 text-[10px] font-mono font-bold border border-slate-850 hover:border-slate-800 text-slate-400 uppercase rounded-lg cursor-pointer"
        >
          {cleaningStatus === 'CLEAN' ? 'Schedule Sweep' : 'Dispatch Janitor Taskforce'}
        </button>
      )}
    </Card>
  );
}
