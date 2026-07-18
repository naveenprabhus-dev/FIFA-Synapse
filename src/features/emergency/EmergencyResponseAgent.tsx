/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSynapse } from '../../contexts/SynapseContext';
import { emergencyAgent, incidentRepository } from '../../services/di';
import { SynapseCoreRecommendation } from '../../types/synapse';
import { EmergencyType, EmergencyContextOptions } from '../../types/emergency';
import { Incident } from '../../types/incident';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  AlertTriangle, ShieldAlert, Volume2, VolumeX, Flame, Accessibility, 
  Activity, Compass, Clock, Radio, MapPin, Users, CheckCircle2, 
  RefreshCw, Play, Square, Phone, Map, ChevronRight, Info, 
  Lock, Unlock, ShieldCheck, Heart, User, Sparkles, Sliders
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
// 2. REUSABLE: Alert Banner Component (Screen-Reader Friendly)
// ==========================================
export function AlertBanner({ title, message, active }: { title: string; message: string; active: boolean }) {
  if (!active) return null;
  return (
    <div 
      role="alert" 
      aria-live="assertive"
      className="bg-rose-500/15 border-l-4 border-rose-500 p-4 rounded-r-xl flex items-start gap-3 shadow-md"
    >
      <Flame className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-rose-200 tracking-wider uppercase font-mono">
          🚨 Active Stadium-Wide Warning
        </h4>
        <p className="text-xs text-rose-300 font-sans leading-relaxed">
          <strong>{title}:</strong> {message}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// 3. REUSABLE: Incident Status Indicator Component
// ==========================================
export function IncidentStatusIndicator({ status }: { status: string }) {
  const getColors = () => {
    switch (status) {
      case 'REPORTED': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'DISPATCHED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'ON_SCENE': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-extrabold uppercase ${getColors()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
      <span>{status}</span>
    </span>
  );
}

// ==========================================
// 4. REUSABLE: Evacuation Card Component (Step-Free & High Contrast)
// ==========================================
export function EvacuationCard({ 
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
// 5. REUSABLE: Safe Route Segment Visualizer
// ==========================================
export function SafeRouteCard({ 
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
// 6. REUSABLE: Emergency Timeline Card
// ==========================================
export function EmergencyTimeline({ timeline }: { timeline: any[] }) {
  return (
    <Card className="bg-slate-950 border border-slate-800 p-5 space-y-4 rounded-xl">
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <Radio className="w-5 h-5 text-amber-500" />
        <h4 className="text-xs font-extrabold text-slate-200 font-sans uppercase tracking-wider">
          Incident Response Log
        </h4>
      </div>

      <div className="relative border-l border-slate-800 pl-4 ml-2 space-y-4 pt-1">
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
    </Card>
  );
}

// ==========================================
// MAIN COMPONENT: AI Emergency Response Agent
// ==========================================
export function EmergencyResponseAgent() {
  const { user } = useAuth();
  const { activeRole } = useSynapse();

  // 1. Core Simulation & Telemetry States
  const [activeEmergency, setActiveEmergency] = useState<EmergencyType>('FIRE');
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('CRITICAL');
  const [locationSector, setLocationSector] = useState<string>('SEC_104');
  const [nearestMedicalRoom, setNearestMedicalRoom] = useState<string>('Sector 104 Concourse First Aid Station');
  const [nearestExit, setNearestExit] = useState<string>('Gate 4 East Lower Exit Ramp');
  const [crowdDensity, setCrowdDensity] = useState<number>(82);
  const [blockedRoutes, setBlockedRoutes] = useState<string[]>(['Sector 102 Egress Corridor']);
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<'NONE' | 'WHEELCHAIR' | 'BLIND'>('NONE');
  const [elevatorStatus, setElevatorStatus] = useState<'OPERATIONAL' | 'OFFLINE'>('OPERATIONAL');
  
  // 2. Incident Log Database States (simulation)
  const [liveIncidents, setLiveIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // 3. AI Directives State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiDirective, setAiDirective] = useState<SynapseCoreRecommendation | null>(null);

  // 4. Accessibility Screen Reader & Speech Synthesizer State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // 5. Emergency simulation scenario logs
  const [newBlockedInput, setNewBlockedInput] = useState<string>('');

  // Fetch active incidents on mount
  const refreshIncidents = async () => {
    try {
      const incidents = await incidentRepository.getIncidents();
      setLiveIncidents(incidents);
    } catch (err) {
      console.error('Failed to load incident queue telemetry:', err);
    }
  };

  useEffect(() => {
    refreshIncidents();
  }, []);

  // Sync state to the selected scenario type
  const loadScenarioPreset = (type: EmergencyType) => {
    setActiveEmergency(type);
    
    switch (type) {
      case 'FIRE':
        setSeverity('CRITICAL');
        setLocationSector('SEC_112');
        setNearestExit('Gate 2 West Wing Corridor');
        setNearestMedicalRoom('Sector 112 Main Medical Center');
        setCrowdDensity(90);
        setBlockedRoutes(['Gate 4 Stairwell East', 'Sector 112 Concourse Elevators']);
        setElevatorStatus('OFFLINE');
        break;
      case 'MEDICAL_EMERGENCY':
        setSeverity('HIGH');
        setLocationSector('SEC_104');
        setNearestExit('Gate 4 East Lower Exit Ramp');
        setNearestMedicalRoom('Sector 104 Concourse First Aid Station');
        setCrowdDensity(62);
        setBlockedRoutes([]);
        setElevatorStatus('OPERATIONAL');
        break;
      case 'CROWD_STAMPEDE':
        setSeverity('CRITICAL');
        setLocationSector('SEC_108');
        setNearestExit('Gate 1 Plaza North Exit');
        setNearestMedicalRoom('Sector 108 Emergency Cabin');
        setCrowdDensity(96);
        setBlockedRoutes(['North Gate Pedestrian Tunnel']);
        setElevatorStatus('OPERATIONAL');
        break;
      case 'POWER_FAILURE':
        setSeverity('HIGH');
        setLocationSector('SEC_104');
        setNearestExit('Gate 4 East Lower Exit Ramp');
        setNearestMedicalRoom('Sector 104 Concourse First Aid Station');
        setCrowdDensity(74);
        setBlockedRoutes(['All internal down-escalators']);
        setElevatorStatus('OFFLINE');
        break;
      case 'WEATHER_EMERGENCY':
        setSeverity('MEDIUM');
        setLocationSector('SEC_112');
        setNearestExit('Indoor Concourses');
        setNearestMedicalRoom('Sector 112 Main Medical Center');
        setCrowdDensity(45);
        setBlockedRoutes(['All open roof decks']);
        setElevatorStatus('OPERATIONAL');
        break;
      default:
        setSeverity('HIGH');
        break;
    }
  };

  // Re-calculate directive
  const computeAIDirectives = async () => {
    setIsLoading(true);
    // Cancel active TTS speaking
    stopSpeech();

    try {
      const result = await emergencyAgent.getEmergencyDirectives(
        user?.uid || 'spec-tactical-999',
        activeRole,
        {
          latitude: 25.3522,
          longitude: 51.5311,
          sectorId: locationSector,
        },
        {
          emergencyType: activeEmergency,
          locationSector,
          nearestMedicalRoom,
          nearestExit,
          crowdDensityPercent: crowdDensity,
          blockedRoutes,
          accessibilityNeeds,
          elevatorStatus,
          weatherCondition: 'Extreme heat index alert',
          matchState: 'Second Half (Minute 72)',
        }
      );

      setAiDirective(result);
    } catch (err) {
      console.error('Failed to parse AI Emergency plan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger compute whenever filters change
  useEffect(() => {
    computeAIDirectives();
  }, [activeEmergency, severity, locationSector, crowdDensity, blockedRoutes.join(','), accessibilityNeeds, elevatorStatus, activeRole]);

  // Voice Guidance (Text-To-Speech Synthesizer)
  const speakDirectives = () => {
    if (!aiDirective || !window.speechSynthesis) return;

    // Stop current
    window.speechSynthesis.cancel();

    const utteranceText = `Attention: ${activeRole} emergency notice. ${aiDirective.recommendation}. The recommended safe route is ${aiDirective.contextSnapshot?.safeRoute || aiDirective.suggestedAction}. Assistance is located at ${aiDirective.contextSnapshot?.nearestAssistance || 'steward desk'}. Please proceed calmly.`;
    
    const utterance = new SpeechSynthesisUtterance(utteranceText);
    utterance.rate = 0.95; // Speech speed slightly slower for clarity
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    speechUtteranceRef.current = utterance;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Cleanup synthesizer on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Multi-tenant description adapters
  const getRoleHeaderGoal = () => {
    switch (activeRole) {
      case 'FAN':
        return {
          title: 'Fan Personal Evacuation Gateway',
          sub: 'Direct high-contrast exit pathways, step-free access indicators, and real-time medical station directions.'
        };
      case 'ORGANIZER':
        return {
          title: 'Stadium Commander Control Deck',
          sub: 'Broadcasting telemetry controls, crowd flow blocks override, deployment coordinators, and full stadium evacuation status.'
        };
      case 'OPERATIONS':
        return {
          title: 'Incident Dispatcher Control Suite',
          sub: 'Local volunteer alert system, medic task assignments, incident logging dashboard, and zone safety perimeter logs.'
        };
      case 'STAFF':
        return {
          title: 'Venue Operational Support Hub',
          sub: 'Replenishment stock locks, concession fire-gate status, elevator offline diagnostic logs, and physical security support.'
        };
      default:
        return {
          title: 'AI Decision Egress Center',
          sub: 'Stadium contingency mapping.'
        };
    }
  };

  const handleAddBlockedRoute = () => {
    if (newBlockedInput.trim() !== '') {
      setBlockedRoutes(prev => [...prev, newBlockedInput.trim()]);
      setNewBlockedInput('');
    }
  };

  const handleClearBlockedRoutes = () => {
    setBlockedRoutes([]);
  };

  return (
    <div className="space-y-6" id="emergency-response-agent-container">
      
      {/* 1. CRITICAL ALERT BANNER (Accessible role='alert' & Color Independent) */}
      <AlertBanner 
        title={`${activeEmergency.replace('_', ' ')} IN ${locationSector}`}
        message={`Severe incident flagged with ${severity} severity. Avoid congested sectors and blocked routes. Active role dashboard is now synchronized to the AI Evacuation Loop.`}
        active={severity === 'CRITICAL'}
      />

      {/* Multi-Tenant Header banner */}
      <Card className="bg-slate-900/40 border border-slate-800/80 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-rose-400 tracking-tight font-sans uppercase flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>{getRoleHeaderGoal().title}</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            {getRoleHeaderGoal().sub}
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <div className="bg-slate-950/60 border border-rose-950 px-3 py-1.5 rounded-lg text-right text-[10px] font-mono text-rose-400">
            <span>TACTICAL MODE: <strong>{activeRole}</strong></span>
          </div>
          <button
            onClick={computeAIDirectives}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] font-mono text-slate-400 hover:text-slate-200 rounded-lg transition-all cursor-pointer"
            aria-label="Recalculate AI Emergency Plan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-500' : ''}`} />
            <span>RE-CALCULATE</span>
          </button>
        </div>
      </Card>

      {/* 2. EMERGENCY WORKSPACE GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: Real-Time Scenario Simulator Modifiers */}
        <div className="space-y-6 xl:col-span-1">
          
          {/* SCENARIO CHANGER PANEL */}
          <Card className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-slate-200 font-sans uppercase flex items-center gap-2">
              <Sliders className="w-4 h-4 text-rose-500" />
              <span>Emergency Scenario Presets</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Select an emergency preset to simulate a crisis event in the stadium. All telemetry nodes will update dynamically for the AI Decision Intelligence engine.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
              {(['FIRE', 'MEDICAL_EMERGENCY', 'CROWD_STAMPEDE', 'POWER_FAILURE', 'WEATHER_EMERGENCY'] as EmergencyType[]).map(type => (
                <button
                  key={type}
                  onClick={() => loadScenarioPreset(type)}
                  className={`px-3 py-2 text-[10px] font-mono font-bold rounded-xl border text-left flex flex-col justify-between h-14 cursor-pointer transition-all ${
                    activeEmergency === type
                      ? 'bg-rose-950/40 border-rose-600/60 text-rose-200 ring-1 ring-rose-500/20'
                      : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span>{type.replace('_', ' ')}</span>
                  <span className="text-[8px] opacity-60">
                    {type === 'FIRE' || type === 'CROWD_STAMPEDE' ? 'CRITICAL' : 'HIGH'}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* TELEMETRY INPUT CONTROLS */}
          <Card className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-slate-200 font-sans uppercase flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>Incident Parameter Controls</span>
            </h4>

            <div className="space-y-4 pt-1">
              
              {/* Severity Select */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block font-bold">Severity Rating:</span>
                <div className="flex gap-1.5">
                  {(['MEDIUM', 'HIGH', 'CRITICAL'] as const).map(sev => (
                    <button
                      key={sev}
                      onClick={() => setSeverity(sev)}
                      className={`flex-1 py-1 text-[10px] font-mono rounded border cursor-pointer ${
                        severity === sev 
                          ? 'bg-rose-600 border-rose-500 text-white font-bold' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location sector dropdown */}
              <div className="space-y-1.5">
                <label htmlFor="sector-select" className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block font-bold">Location Sector Node:</label>
                <select
                  id="sector-select"
                  value={locationSector}
                  onChange={(e) => setLocationSector(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="SEC_102">Sector 102 (West Concourse)</option>
                  <option value="SEC_104">Sector 104 (North Concourse)</option>
                  <option value="SEC_108">Sector 108 (East Concourse)</option>
                  <option value="SEC_112">Sector 112 (South Concourse)</option>
                </select>
              </div>

              {/* Crowd density slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span className="uppercase font-bold">Crowd Density:</span>
                  <span className={crowdDensity >= 85 ? 'text-rose-400 font-bold' : crowdDensity >= 60 ? 'text-amber-400' : 'text-emerald-400'}>
                    {crowdDensity}% ({crowdDensity >= 85 ? 'CONGESTED' : 'STABLE'})
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={crowdDensity}
                  onChange={(e) => setCrowdDensity(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              {/* Accessibility Settings */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block font-bold">Spectator Accessibility Requirements:</span>
                <div className="flex gap-1.5">
                  {([
                    { key: 'NONE', label: 'Standard' },
                    { key: 'WHEELCHAIR', label: 'Wheelchair' },
                    { key: 'BLIND', label: 'Blind / Audio' }
                  ] as const).map(acc => (
                    <button
                      key={acc.key}
                      onClick={() => setAccessibilityNeeds(acc.key)}
                      className={`flex-1 py-1.5 text-[10px] font-sans font-semibold rounded border cursor-pointer ${
                        accessibilityNeeds === acc.key 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Elevator online status */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block font-bold">Elevator Status:</span>
                <div className="flex gap-1.5">
                  {(['OPERATIONAL', 'OFFLINE'] as const).map(el => (
                    <button
                      key={el}
                      onClick={() => setElevatorStatus(el)}
                      className={`flex-1 py-1 text-[10px] font-mono rounded border cursor-pointer ${
                        elevatorStatus === el 
                          ? el === 'OFFLINE' ? 'bg-amber-600 border-amber-500 text-white font-bold' : 'bg-emerald-600 border-emerald-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {el}
                    </button>
                  ))}
                </div>
              </div>

              {/* Blocked routes editor */}
              <div className="space-y-2 pt-2 border-t border-slate-800/50">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block font-bold">Blocked Route Segments ({blockedRoutes.length}):</span>
                {blockedRoutes.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {blockedRoutes.map((route, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 rounded-lg flex items-center gap-1">
                        <span>{route}</span>
                        <button 
                          onClick={() => setBlockedRoutes(prev => prev.filter((_, idx) => idx !== i))}
                          className="hover:text-rose-400 focus:outline-none cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500 font-sans italic block">All corridor segments are currently open.</span>
                )}

                {/* Add blocked route input */}
                <div className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="e.g. Exit Gate 3 lobby"
                    value={newBlockedInput}
                    onChange={(e) => setNewBlockedInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddBlockedRoute()}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={handleAddBlockedRoute}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-800 rounded-lg cursor-pointer"
                  >
                    ADD
                  </button>
                </div>
                {blockedRoutes.length > 0 && (
                  <button
                    onClick={handleClearBlockedRoutes}
                    className="text-[9px] text-slate-500 hover:text-slate-300 font-mono uppercase block"
                  >
                    CLEAR ALL SEGMENTS
                  </button>
                )}
              </div>

            </div>
          </Card>

        </div>

        {/* Center/Right Hand Column: Active AI Response Intelligence */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* 3. REUSABLE: EMERGENCY TIMELINE / LOG CARD */}
          <Card className="border border-slate-800/60 bg-slate-900/10 p-5 rounded-2xl">
            <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-200 font-sans uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span>Real-Time Incident Logs ({liveIncidents.length})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Select an active stadium telemetry incident to synchronize.
                </p>
              </div>
              <button
                onClick={refreshIncidents}
                className="text-xs text-slate-500 hover:text-slate-300 font-mono flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>REFRESH QUEUE</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
              {liveIncidents.map(inc => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncident(inc);
                      // load presets
                      if (inc.category === 'MEDICAL_EMERGENCY') {
                        loadScenarioPreset('MEDICAL_EMERGENCY');
                      } else {
                        loadScenarioPreset('FIRE');
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-rose-500 bg-rose-950/10 ring-1 ring-rose-500/20' 
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-500">{inc.id}</span>
                      <IncidentStatusIndicator status={inc.status} />
                    </div>
                    <h5 className="text-xs font-bold text-slate-200 font-sans mt-2">
                      {inc.category.replace('_', ' ')}
                    </h5>
                    <span className="text-[10px] text-slate-400 block font-sans mt-1">
                      {inc.locationName}
                    </span>
                    <p className="text-[11px] text-slate-400 font-sans mt-2 line-clamp-1">
                      {inc.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {selectedIncident && (
              <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <h6 className="text-xs font-extrabold text-slate-200">Incident Timeline: {selectedIncident.id}</h6>
                    <span className="text-[10px] text-slate-500 font-mono">Reported: {new Date(selectedIncident.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <button
                    onClick={() => setSelectedIncident(null)}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-mono uppercase cursor-pointer"
                  >
                    DISMISS LOGS
                  </button>
                </div>
                <EmergencyTimeline timeline={selectedIncident.timeline} />
              </div>
            )}
          </Card>

          {/* 4. REUSABLE: LIVE AI RE-COMPUTE / TACTICAL CARD */}
          {isLoading ? (
            <Card className="p-16 border border-slate-800/60 bg-slate-900/10 flex flex-col items-center justify-center space-y-4 rounded-2xl">
              <div className="relative flex h-12 w-12 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-8 w-8 bg-rose-500 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4 text-slate-100 animate-pulse" />
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 text-center animate-pulse tracking-widest uppercase">
                SYNAPSE INTELLIGENCE COMPILING TACTICAL EGRESS ROUTE...
              </p>
            </Card>
          ) : aiDirective ? (
            <div className="space-y-6">
              
              {/* PRIMARY DECISION SUMMARY */}
              <Card className="border-2 border-rose-950/80 bg-rose-950/5 p-6 rounded-2xl space-y-5">
                
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-rose-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                      <span>CRISIS INTELLIGENCE PATH CLEAR</span>
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-100 tracking-tight font-sans">
                      {aiDirective.title}
                    </h3>
                  </div>
                  <PriorityBadge priority={severity} />
                </div>

                {/* ACCESSIBILITY AUDIO PLAYER NARRATOR (Voice Guidance Ready) */}
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
                  <div className="flex items-center gap-2">
                    {isSpeaking ? (
                      <button
                        onClick={stopSpeech}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950 border border-rose-800 text-[10px] font-mono text-rose-400 rounded-lg hover:text-rose-200 cursor-pointer"
                        aria-label="Stop emergency vocalization"
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>MUTE ALERTS</span>
                      </button>
                    ) : (
                      <button
                        onClick={speakDirectives}
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
                  <strong>Tactical Justification:</strong> {aiDirective.reason}
                </div>

                {/* Time saved & Traversal details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-slate-800/40 pt-4">
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 text-center space-y-1">
                    <span className="text-[8px] text-slate-500 font-mono block">TRAVERSAL TIME</span>
                    <span className="text-sm font-bold text-slate-200 font-mono">
                      {String(aiDirective.contextSnapshot?.estimatedTime || '3 minutes')}
                    </span>
                  </div>

                  <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 text-center space-y-1">
                    <span className="text-[8px] text-slate-500 font-mono block">BENEFIT</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {String(aiDirective.estimatedBenefit || 'Clears bottleneck')}
                    </span>
                  </div>

                  <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 text-center space-y-1">
                    <span className="text-[8px] text-slate-500 font-mono block">RELIABILITY CONFIDENCE</span>
                    <span className="text-sm font-bold text-blue-400 font-mono">
                      {Math.round(aiDirective.confidenceScore * 100)}%
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
                      {aiDirective.reasoningDetails.map((stepText, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs text-slate-300 font-sans">
                          <ChevronRight className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                          <span className="leading-relaxed">{stepText}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* 5. REUSABLE EVACUATION & SAFE ROUTE RESTRUCTURINGS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <EvacuationCard 
                  recommendation={aiDirective.recommendation}
                  nearestExit={String(aiDirective.contextSnapshot?.nearestExit || nearestExit)}
                  accessibilityNotes={String(aiDirective.contextSnapshot?.accessibilityNotes || (accessibilityNeeds === 'WHEELCHAIR' ? 'Strict step-free egress paths mapped; elevators bypassing fire floors.' : accessibilityNeeds === 'BLIND' ? 'Binaural sound beacons activated at emergency thresholds.' : 'Standard egress routes clear.'))}
                  estimatedTime={String(aiDirective.contextSnapshot?.estimatedTime || '4 minutes')}
                />

                <SafeRouteCard 
                  routeSegments={String(aiDirective.contextSnapshot?.safeRoute || `${locationSector} -> Exit Corridor C -> ${nearestExit}`)}
                  alternatives={aiDirective.contextSnapshot?.alternativeRoutes as string[] || [
                    `${locationSector} -> North Plaza Outer Gate`,
                    `Elevated Bridge Connection -> South Main Concourse`
                  ]}
                />

              </div>

            </div>
          ) : null}

        </div>

      </div>

    </div>
  );
}
