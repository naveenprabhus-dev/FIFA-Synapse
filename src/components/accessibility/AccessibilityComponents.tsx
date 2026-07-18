/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  Accessibility, Compass, Clock, Map, ChevronRight, AlertTriangle, Info,
  Sparkles, Volume2, VolumeX, Eye, Flame, ShieldAlert, CheckCircle2,
  Bookmark, Navigation, HelpCircle, EyeOff, Heart, Footprints
} from 'lucide-react';

// ==========================================
// 1. REUSABLE: Accessibility Status Badge (Color-independent)
// ==========================================
export function AccessibilityStatusBadge({ status, label }: { status: 'OPTIMAL' | 'LIMITED' | 'ALERT'; label: string }) {
  const getStyle = () => {
    switch (status) {
      case 'OPTIMAL':
        return { variant: 'success' as const, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'LIMITED':
        return { variant: 'warning' as const, bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'ALERT':
        return { variant: 'error' as const, bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse' };
    }
  };

  const style = getStyle();

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-mono font-extrabold uppercase ${style.bg}`}>
      <span className="w-1 h-1 rounded-full bg-current" />
      <span>{label}</span>
    </span>
  );
}

// ==========================================
// 2. REUSABLE: Accessibility Alert Banner (High-contrast, assertive)
// ==========================================
export function AccessibilityAlertBanner({
  title,
  message,
  active,
  priority = 'HIGH'
}: {
  title: string;
  message: string;
  active: boolean;
  priority?: string;
}) {
  if (!active) return null;
  const isCritical = priority === 'CRITICAL' || priority === 'HIGH';

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
      <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${isCritical ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`} />
      <div className="space-y-1">
        <h4 className="text-xs font-bold tracking-wider uppercase font-mono flex items-center gap-1.5">
          <span>⚠️ ACCESSIBILITY ADVISORY ALERT</span>
          <span className="text-[9px] px-1.5 py-0.2 bg-white/10 rounded font-bold uppercase">{priority}</span>
        </h4>
        <p className="text-xs font-sans leading-relaxed opacity-90">
          <strong>{title}:</strong> {message}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// 3. REUSABLE: Accessibility Profile Card
// ==========================================
export function AccessibilityCard({
  title,
  description,
  icon: Icon,
  isSelected,
  onClick
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border text-left cursor-pointer transition-all w-full flex items-start gap-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isSelected
          ? 'border-blue-500 bg-blue-950/15 text-blue-100 ring-1 ring-blue-500/20'
          : 'border-slate-850 bg-slate-950 text-slate-400 hover:text-slate-200 hover:border-slate-700'
      }`}
      aria-pressed={isSelected}
    >
      <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-900 text-slate-500'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <span className="text-xs font-extrabold uppercase font-sans tracking-wide block">
          {title}
        </span>
        <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
          {description}
        </p>
      </div>
    </button>
  );
}

// ==========================================
// 4. REUSABLE: Accessible Route Card
// ==========================================
export function AccessibleRouteCard({
  routeSegments,
  estimatedTime,
  accessibilityWarnings,
}: {
  routeSegments: string;
  estimatedTime: string;
  accessibilityWarnings: string[];
}) {
  const steps = routeSegments.split('──▶').map(s => s.trim());

  return (
    <Card className="bg-slate-950 border border-slate-850 p-5 space-y-4 rounded-xl">
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-blue-400" />
          <h4 className="text-xs font-extrabold text-slate-200 font-sans uppercase tracking-wider">
            Optimized Step-Free Route
          </h4>
        </div>
        <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded text-[10px] text-blue-400 font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span>TIME: {estimatedTime}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Sequence flow */}
        <div className="space-y-2">
          <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Transit Milestones:</span>
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

        {/* Accessibility route warnings */}
        {accessibilityWarnings.length > 0 && (
          <div className="bg-amber-950/15 border border-amber-900/40 p-3.5 rounded-lg space-y-1.5">
            <span className="text-[9px] font-mono text-amber-400 block font-bold uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Wayfinding Impediments Alert:</span>
            </span>
            <ul className="space-y-1 pl-4 list-disc text-xs text-amber-300">
              {accessibilityWarnings.map((warn, i) => (
                <li key={i} className="font-sans leading-relaxed">{warn}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

// ==========================================
// 5. REUSABLE: Facility Card
// ==========================================
export function FacilityCard({
  name,
  distanceMeters,
  type,
  rating,
}: {
  name: string;
  distanceMeters: number;
  type: string;
  rating: string;
}) {
  return (
    <div className="p-4 rounded-xl border border-slate-850 bg-slate-950 flex items-center justify-between gap-4">
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] px-1.5 py-0.5 bg-slate-900 text-blue-400 border border-slate-800 rounded font-mono font-bold uppercase">
            {type}
          </span>
          <span className="text-[10px] text-slate-500 font-mono font-bold">
            {distanceMeters} METERS
          </span>
        </div>
        <h5 className="text-xs font-bold text-slate-200 font-sans">{name}</h5>
      </div>
      <div className="text-right">
        <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">compliance rating</span>
        <span className="text-xs font-extrabold text-emerald-400 font-sans uppercase">
          {rating}
        </span>
      </div>
    </div>
  );
}

// ==========================================
// 6. REUSABLE: Route Comparison Card
// ==========================================
export function RouteComparisonCard({
  primaryRoute,
  alternativeRoute,
  estimatedTime,
  profile
}: {
  primaryRoute: string;
  alternativeRoute: string;
  estimatedTime: string;
  profile: string;
}) {
  return (
    <Card className="bg-slate-950 border border-slate-850 p-5 space-y-4 rounded-xl">
      <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
        <Map className="w-5 h-5 text-emerald-400" />
        <h4 className="text-xs font-extrabold text-slate-200 font-sans uppercase tracking-wider">
          Route Safety Comparisons
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Standard Route Hazard Info */}
        <div className="p-4 bg-rose-950/10 border border-rose-950/40 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">⚠️ STANDARD STAIR PATH</span>
            <span className="text-[9px] font-mono text-rose-500 font-bold uppercase">not recommended</span>
          </div>
          <p className="text-xs text-rose-300 font-sans leading-relaxed">
            Standard path contains steep stairs, heavy queue bottleneck gates, and high crowding nodes. Accessible flow is highly obstructed.
          </p>
        </div>

        {/* AI Step-Free Alternate */}
        <div className="p-4 bg-emerald-950/10 border border-emerald-950/40 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">♿ STEP-FREE BLUEPATH</span>
            <span className="text-[10px] text-emerald-400 font-mono font-extrabold">{estimatedTime}</span>
          </div>
          <p className="text-xs text-emerald-300 font-sans leading-relaxed">
            Dynamic ramps are fully clear. Elevator doors held on priority access. Low ambient noise loop bypasses crowded corridors.
          </p>
        </div>
      </div>
    </Card>
  );
}

// ==========================================
// 7. REUSABLE: Accessibility Recommendation Card
// ==========================================
export function AccessibilityRecommendationCard({
  aiDirective,
  isSpeaking,
  onSpeakToggle,
  profileName
}: {
  aiDirective: any;
  isSpeaking: boolean;
  onSpeakToggle: () => void;
  profileName: string;
}) {
  return (
    <Card className="border-2 border-blue-950/80 bg-blue-950/5 p-6 rounded-2xl space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>AI ACCESSIBILITY DECISION GATE</span>
          </span>
          <h3 className="text-lg font-extrabold text-slate-100 tracking-tight font-sans uppercase">
            {profileName.replace('_', ' ')} Route Recommendation
          </h3>
        </div>
        <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded text-xs text-blue-400 font-mono font-bold">
          <span>CONFIDENCE: {Math.round((aiDirective.confidenceScore || 0.95) * 100)}%</span>
        </div>
      </div>

      {/* Accessible Voice Reader Tool */}
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
            Voice Guide Assist (Audio Description)
          </span>
        </div>
        <div>
          {isSpeaking ? (
            <button
              onClick={onSpeakToggle}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950 border border-rose-800 text-[10px] font-mono text-rose-400 rounded-lg hover:text-rose-200 cursor-pointer"
              aria-label="Stop audio wayfinding description"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>STOP READING</span>
            </button>
          ) : (
            <button
              onClick={onSpeakToggle}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-950 border border-blue-800 text-[10px] font-mono text-blue-400 rounded-lg hover:text-blue-200 cursor-pointer"
              aria-label="Read accessible route details aloud"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>READ ALOUD</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Directive */}
      <div className="bg-slate-950 border border-slate-900 rounded-xl p-4.5 space-y-2">
        <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">AI Wayfinding Directive:</span>
        <p className="text-xs text-slate-100 leading-relaxed font-sans font-bold">
          {aiDirective.recommendation}
        </p>
      </div>

      {/* Reasoning Justification */}
      <div className="text-xs text-slate-300 leading-relaxed font-sans border-t border-slate-800/40 pt-3">
        <strong className="text-slate-200">Architectural/Inclusion Justification (WHY):</strong> {aiDirective.reason}
      </div>

      {/* Pipeline analysis details */}
      {aiDirective.reasoningDetails && aiDirective.reasoningDetails.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Pipeline Reasoning Verification logs:</span>
          <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-900 space-y-2">
            {aiDirective.reasoningDetails.map((stepText: string, index: number) => (
              <div key={index} className="flex items-start gap-2 text-xs text-slate-300 font-sans">
                <ChevronRight className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
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
// 8. REUSABLE: Accessibility Dashboard Shell
// ==========================================
export function AccessibilityDashboard({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6" id="fifa-synapse-accessibility-dashboard" role="region" aria-label="Accessibility Wayfinding Panel">
      {children}
    </div>
  );
}
