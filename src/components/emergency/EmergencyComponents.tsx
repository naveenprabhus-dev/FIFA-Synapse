/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  ShieldAlert, Compass, Clock, Map, ChevronRight, Radio, Flame,
  Accessibility, CheckCircle2, Sparkles, Volume2, VolumeX, AlertTriangle, Info,
  Activity, ArrowRight, ShieldCheck, Heart, Users
} from 'lucide-react';

// ==========================================
// 1. REUSABLE: Priority Badge Component (Color Independent + Iconography)
// ==========================================
export function PriorityBadge({ priority, ariaLabel }: { priority: string; ariaLabel?: string }) {
  const isCritical = priority === 'CRITICAL';
  const isHigh = priority === 'HIGH';

  return (
    <Badge
      variant={isCritical ? 'error' : isHigh ? 'warning' : 'info'}
      className="text-xs px-3 py-1 font-mono font-bold flex items-center gap-1.5 border border-current"
      aria-label={ariaLabel || `${priority} Priority Alert`}
    >
      <ShieldAlert className="w-3.5 h-3.5" />
      <span>{priority}</span>
    </Badge>
  );
}

// ==========================================
// 2. REUSABLE: Severity Indicator (Graphic bar/scale representation)
// ==========================================
export function SeverityIndicator({ severity }: { severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }) {
  const getBlocks = () => {
    switch (severity) {
      case 'LOW':
        return { count: 1, color: 'bg-emerald-500', text: 'Low Risk Profile' };
      case 'MEDIUM':
        return { count: 2, color: 'bg-amber-500', text: 'Medium Risk Profile' };
      case 'HIGH':
        return { count: 3, color: 'bg-orange-500', text: 'High Risk Profile' };
      case 'CRITICAL':
        return { count: 4, color: 'bg-rose-600 animate-pulse', text: 'Critical Risk Profile' };
      default:
        return { count: 2, color: 'bg-blue-500', text: 'Unspecified Risk' };
    }
  };

  const { count, color, text } = getBlocks();

  return (
    <div className="space-y-1.5" aria-label={`Threat Level: ${severity}`}>
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span className="uppercase font-bold">Severity Matrix:</span>
        <span className="font-extrabold uppercase tracking-wider text-slate-300">{severity}</span>
      </div>
      <div className="flex gap-1 h-2">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className={`flex-1 rounded-sm transition-all ${
              idx <= count ? color : 'bg-slate-800'
            }`}
          />
        ))}
      </div>
      <span className="text-[9px] font-sans text-slate-500 block italic">{text}</span>
    </div>
  );
}

// ==========================================
// 3. REUSABLE: Emergency Alert Banner (Screen-Reader Friendly)
// ==========================================
export function EmergencyAlertBanner({ 
  title, 
  message, 
  active, 
  severity = 'HIGH' 
}: { 
  title: string; 
  message: string; 
  active: boolean; 
  severity?: string;
}) {
  if (!active) return null;
  const isCritical = severity === 'CRITICAL';

  return (
    <div 
      role="alert" 
      aria-live="assertive"
      className={`border-l-4 p-4 rounded-r-xl flex items-start gap-3 shadow-md transition-all ${
        isCritical 
          ? 'bg-rose-500/15 border-rose-500 text-rose-200' 
          : 'bg-amber-500/10 border-amber-500 text-amber-200'
      }`}
    >
      <Flame className={`w-5 h-5 shrink-0 mt-0.5 ${isCritical ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`} />
      <div className="space-y-1">
        <h4 className="text-xs font-bold tracking-wider uppercase font-mono flex items-center gap-1.5">
          <span>🚨 Active Stadium-Wide Warning</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-white/10 rounded font-bold uppercase">{severity}</span>
        </h4>
        <p className="text-xs font-sans leading-relaxed opacity-90">
          <strong>{title}:</strong> {message}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// 4. REUSABLE: Incident Status Card Component
// ==========================================
export function IncidentStatusCard({ 
  incident, 
  isSelected, 
  onClick 
}: { 
  incident: {
    id: string;
    category: string;
    severity: string;
    status: string;
    locationName: string;
    description: string;
    createdAt: string;
  }; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'REPORTED': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'DISPATCHED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'ON_SCENE': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
        isSelected 
          ? 'border-rose-500 bg-rose-950/10 ring-1 ring-rose-500/20' 
          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
      }`}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-slate-500">{incident.id}</span>
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-mono font-extrabold uppercase ${getStatusStyle(incident.status)}`}>
          <span className="w-1 h-1 rounded-full bg-current animate-ping" />
          <span>{incident.status}</span>
        </span>
      </div>
      <h5 className="text-xs font-bold text-slate-200 font-sans mt-2">
        {incident.category.replace('_', ' ')}
      </h5>
      <span className="text-[10px] text-slate-400 block font-sans mt-0.5 flex items-center gap-1">
        <Map className="w-3 h-3 text-slate-500" />
        <span>{incident.locationName}</span>
      </span>
      <p className="text-[11px] text-slate-400 font-sans mt-2 line-clamp-1">
        {incident.description}
      </p>
    </div>
  );
}

// ==========================================
// 5. REUSABLE: Emergency Timeline Component
// ==========================================
export function EmergencyTimeline({ timeline }: { timeline: any[] }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-xs text-slate-500 italic py-4 text-center">
        No active logs recorded in the telemetry.
      </div>
    );
  }

  return (
    <div className="relative border-l border-slate-800 pl-4 ml-2 space-y-4 pt-1" aria-label="Incident Response Log">
      {timeline.map((event, idx) => (
        <div key={event.id || idx} className="relative space-y-1">
          {/* Bullet point */}
          <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-950 border-2 border-amber-500" />
          
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
            <span>BY: {event.operatorId.toUpperCase()}</span>
          </div>
          <div className="text-xs font-bold text-slate-300">
            Status Updated to <span className="text-amber-400">{event.status}</span>
          </div>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            {event.notes}
          </p>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// 6. REUSABLE: Evacuation Route Card Component
// ==========================================
export function EvacuationRouteCard({ 
  recommendation, 
  nearestExit, 
  accessibilityNotes,
  estimatedTime 
}: { 
  recommendation: string; 
  nearestExit: string; 
  accessibilityNotes?: string;
  estimatedTime: string;
}) {
  return (
    <Card className="bg-slate-950 border border-slate-800 p-5 space-y-4 rounded-xl">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-blue-400" />
          <h4 className="text-xs font-extrabold text-slate-200 font-sans uppercase tracking-wider">
            Evacuation Blueprint
          </h4>
        </div>
        <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded text-[10px] text-blue-400 font-mono">
          <Clock className="w-3 h-3" />
          <span>EST. TIME: {estimatedTime}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Recommended Exit Hub:</span>
          <span className="text-sm font-extrabold text-slate-200 font-sans">{nearestExit}</span>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800/60 text-xs text-slate-300 font-sans leading-relaxed">
          {recommendation}
        </div>

        {accessibilityNotes && (
          <div className="bg-blue-950/15 border border-blue-900/40 p-3 rounded-lg flex items-start gap-2.5 text-xs text-blue-300">
            <Accessibility className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-blue-400 block font-bold uppercase">Accessibility Clearance Check:</span>
              <p className="font-sans font-medium">{accessibilityNotes}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ==========================================
// 7. REUSABLE: Safe Route Map Card Component
// ==========================================
export function SafeRouteMapCard({ 
  routeSegments, 
  alternatives 
}: { 
  routeSegments: string; 
  alternatives?: string[] 
}) {
  const steps = routeSegments.split('->').map(s => s.trim());

  return (
    <Card className="bg-slate-950 border border-slate-800 p-5 space-y-4 rounded-xl">
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <Map className="w-5 h-5 text-emerald-400" />
        <h4 className="text-xs font-extrabold text-slate-200 font-sans uppercase tracking-wider">
          AI Calculated Safe Pathways
        </h4>
      </div>

      <div className="space-y-4">
        {/* Step sequence */}
        <div className="space-y-2">
          <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Egress Sequence:</span>
          <div className="flex flex-col md:flex-row md:items-center flex-wrap gap-2 pt-1">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-200">
                  {step}
                </span>
                {idx < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 rotate-90 md:rotate-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic visual pathway representation */}
        <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl space-y-3">
          <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Stadium Spatial Flow Matrix:</span>
          <div className="flex justify-between items-center bg-slate-950 border border-slate-900 p-3 rounded-lg text-[10px] font-mono">
            <span className="text-amber-400">🚨 Sector Bloc</span>
            <span className="text-slate-500">──▶</span>
            <span className="text-emerald-400">🟢 Bypass Loop</span>
            <span className="text-slate-500">──▶</span>
            <span className="text-blue-400">🛡️ Safe Hub</span>
          </div>
        </div>

        {/* Alternative Routes */}
        {alternatives && alternatives.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-900">
            <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Contingency Segments:</span>
            <div className="space-y-1.5">
              {alternatives.map((alt, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="w-4 h-4 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-500 mt-0.5 shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-sans leading-relaxed">{alt}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ==========================================
// 8. REUSABLE: Emergency Recommendation Card Component
// ==========================================
export function EmergencyRecommendationCard({ 
  aiDirective, 
  severity, 
  accessibilityNeeds, 
  isSpeaking, 
  onSpeakToggle 
}: { 
  aiDirective: any; 
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; 
  accessibilityNeeds: string; 
  isSpeaking: boolean; 
  onSpeakToggle: () => void;
}) {
  return (
    <Card className="border-2 border-rose-950/80 bg-rose-950/5 p-6 rounded-2xl space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[9px] font-mono text-rose-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>CRISIS INTELLIGENCE PATH CLEAR</span>
          </span>
          <h3 className="text-lg font-extrabold text-slate-100 tracking-tight font-sans">
            {aiDirective.title || 'Dynamic Tactical Action Blueprint'}
          </h3>
        </div>
        <PriorityBadge priority={severity} />
      </div>

      {/* Accessibility Voice Guidance Button */}
      <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/60">
        <div className="flex items-center gap-2.5">
          {isSpeaking ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-slate-700" />
          )}
          <span className="text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">
            Audio Evacuation Guidance
          </span>
        </div>
        <div>
          {isSpeaking ? (
            <button
              onClick={onSpeakToggle}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950 border border-rose-800 text-[10px] font-mono text-rose-400 rounded-lg hover:text-rose-200 cursor-pointer"
              aria-label="Stop audio alert"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>MUTE ALERTS</span>
            </button>
          ) : (
            <button
              onClick={onSpeakToggle}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-950 border border-blue-800 text-[10px] font-mono text-blue-400 rounded-lg hover:text-blue-200 cursor-pointer"
              aria-label="Vocalize crisis instructions"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>SPEAK DIRECTIVE</span>
            </button>
          )}
        </div>
      </div>

      {/* Decision content */}
      <div className="bg-slate-950 border border-slate-900 rounded-xl p-4.5 space-y-2">
        <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Action Directive:</span>
        <p className="text-xs text-slate-100 leading-relaxed font-sans font-bold">
          {aiDirective.recommendation}
        </p>
      </div>

      {/* Why justification */}
      <div className="text-xs text-slate-300 leading-relaxed font-sans border-t border-slate-800/40 pt-3">
        <strong className="text-slate-200">Tactical Justification:</strong> {aiDirective.reason}
      </div>

      {/* Metrics details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-slate-800/40 pt-4">
        <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 text-center space-y-1">
          <span className="text-[8px] text-slate-500 font-mono block">TRAVERSAL TIME</span>
          <span className="text-sm font-bold text-slate-200 font-mono">
            {String(aiDirective.contextSnapshot?.estimatedTime || aiDirective.estimatedTime || '3 minutes')}
          </span>
        </div>

        <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 text-center space-y-1">
          <span className="text-[8px] text-slate-500 font-mono block">EXPECTED BENEFIT</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">
            {String(aiDirective.estimatedBenefit || aiDirective.benefit || 'Clears bottleneck')}
          </span>
        </div>

        <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 text-center space-y-1">
          <span className="text-[8px] text-slate-500 font-mono block">RELIABILITY CONFIDENCE</span>
          <span className="text-sm font-bold text-blue-400 font-mono">
            {Math.round((aiDirective.confidenceScore || aiDirective.confidence || 0.95) * 100)}%
          </span>
        </div>

        <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 text-center space-y-1">
          <span className="text-[8px] text-slate-500 font-mono block">ACCESSIBILITY CLEARANCE</span>
          <span className="text-[10px] font-sans font-semibold text-amber-400 block truncate">
            {accessibilityNeeds === 'NONE' ? 'Standard concourse' : accessibilityNeeds === 'WHEELCHAIR' ? 'Step-Free ramps clear' : 'Audio Beacon Active'}
          </span>
        </div>
      </div>

      {/* Reasoning pipeline steps */}
      {aiDirective.reasoningDetails && aiDirective.reasoningDetails.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Decision Intelligence Reasoning pipeline:</span>
          <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-900 space-y-2">
            {aiDirective.reasoningDetails.map((stepText: string, index: number) => (
              <div key={index} className="flex items-start gap-2 text-xs text-slate-300 font-sans">
                <ChevronRight className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{stepText}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// ==========================================
// 9. REUSABLE: Emergency Card Component
// ==========================================
export function EmergencyCard({ 
  title, 
  description, 
  activeEmergency, 
  severity, 
  onClick, 
  selected 
}: { 
  title: string; 
  description: string; 
  activeEmergency: string; 
  severity: string; 
  onClick: () => void; 
  selected: boolean;
}) {
  return (
    <Card 
      onClick={onClick}
      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
        selected 
          ? 'bg-rose-950/40 border-rose-600 text-rose-200 ring-1 ring-rose-500/20' 
          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
      }`}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="flex justify-between items-start">
        <span className="text-xs font-extrabold uppercase font-sans tracking-wide">{title}</span>
        <span className="text-[8px] px-1.5 py-0.5 bg-slate-900 text-rose-400 border border-slate-800 rounded font-mono font-bold uppercase">{severity}</span>
      </div>
      <p className="text-[11px] text-slate-400 mt-2 font-sans line-clamp-2 leading-relaxed">
        {description}
      </p>
    </Card>
  );
}

// ==========================================
// 10. REUSABLE: Live Emergency Feed Component
// ==========================================
export function LiveEmergencyFeed({ 
  alerts 
}: { 
  alerts: { id: string; message: string; timestamp: string; type: string }[] 
}) {
  return (
    <Card className="bg-slate-950 border border-slate-800 p-5 space-y-4 rounded-xl">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-rose-500 animate-pulse" />
          <h4 className="text-xs font-extrabold text-slate-200 font-sans uppercase tracking-wider">
            Live Broadcaster Dispatch Feed
          </h4>
        </div>
        <span className="text-[8px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-mono font-bold">
          LIVE
        </span>
      </div>

      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-3 bg-slate-900/60 border border-slate-850 rounded-lg flex items-start gap-2.5 text-xs text-slate-300">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5 animate-ping" />
            <div className="space-y-0.5 flex-1">
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>{alert.type}</span>
                <span>{alert.timestamp}</span>
              </div>
              <p className="font-sans leading-relaxed text-slate-300">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ==========================================
// 11. REUSABLE: Emergency Dashboard Shell Wrapper
// ==========================================
export function EmergencyDashboard({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6" id="fifa-synapse-emergency-dashboard" role="region" aria-label="Emergency Dispatch Console">
      {children}
    </div>
  );
}
