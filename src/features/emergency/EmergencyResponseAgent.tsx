/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSynapse } from '../../contexts/SynapseContext';
import { emergencyAgent, incidentRepository } from '../../services/di';
import { SynapseCoreRecommendation } from '../../types/synapse';
import { EmergencyType } from '../../types/emergency';
import { Incident } from '../../types/incident';
import { Card } from '../../components/ui/Card';
import {
  ShieldAlert, Volume2, VolumeX, Flame, Accessibility, 
  Activity, Compass, Clock, Radio, MapPin, Users, CheckCircle2, 
  RefreshCw, Play, Square, Phone, Map, ChevronRight, Info, 
  Lock, Unlock, ShieldCheck, Heart, User, Sparkles, Sliders
} from 'lucide-react';

import {
  PriorityBadge,
  SeverityIndicator,
  EmergencyAlertBanner,
  IncidentStatusCard,
  EmergencyTimeline,
  EvacuationRouteCard,
  SafeRouteMapCard,
  EmergencyRecommendationCard,
  EmergencyCard,
  LiveEmergencyFeed,
  EmergencyDashboard
} from '../../components/emergency/EmergencyComponents';

export function EmergencyResponseAgent() {
  const { user } = useAuth();
  const { activeRole } = useSynapse();

  // 1. Core Simulation & Telemetry States
  const [activeEmergency, setActiveEmergency] = useState<EmergencyType>('FIRE');
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('CRITICAL');
  const [locationSector, setLocationSector] = useState<string>('SEC_112');
  const [nearestMedicalRoom, setNearestMedicalRoom] = useState<string>('Sector 112 Main Medical Center');
  const [nearestExit, setNearestExit] = useState<string>('Gate 2 West Wing Corridor');
  const [crowdDensity, setCrowdDensity] = useState<number>(90);
  const [blockedRoutes, setBlockedRoutes] = useState<string[]>(['Gate 4 Stairwell East', 'Sector 112 Concourse Elevators']);
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<'NONE' | 'WHEELCHAIR' | 'BLIND'>('NONE');
  const [elevatorStatus, setElevatorStatus] = useState<'OPERATIONAL' | 'OFFLINE'>('OFFLINE');
  
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

  // 6. Broadcast Dispatches
  const [feedAlerts] = useState([
    { id: '1', type: 'DISPATCH', message: 'First Aid personnel dispatched to Sector 104 South Concourse.', timestamp: '10:14 AM' },
    { id: '2', type: 'OVERRIDE', message: 'Gate 4 Lower exits have been remotely unlatched.', timestamp: '10:08 AM' },
    { id: '3', type: 'WEATHER', message: 'Severe heat index reached. Misting fans activated stadium-wide.', timestamp: '09:55 AM' },
    { id: '4', type: 'SECURITY', message: 'Incident response squad deployed to East Gate plaza.', timestamp: '09:42 AM' }
  ]);

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

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeech();
    } else {
      speakDirectives();
    }
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
    <EmergencyDashboard>
      
      {/* 1. CRITICAL ALERT BANNER (Accessible role='alert' & Color Independent) */}
      <EmergencyAlertBanner 
        title={`${activeEmergency.replace('_', ' ')} IN ${locationSector}`}
        message={`Severe incident flagged with ${severity} severity. Avoid congested sectors and blocked routes. Active role dashboard is now synchronized to the AI Evacuation Loop.`}
        active={severity === 'CRITICAL'}
        severity={severity}
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
              <SeverityIndicator severity={severity === 'CRITICAL' ? 'CRITICAL' : severity === 'HIGH' ? 'HIGH' : 'MEDIUM'} />

              {/* Severity manual trigger */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-500 font-mono uppercase block font-bold">Override Severity:</span>
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
                  <IncidentStatusCard
                    key={inc.id}
                    incident={inc as any}
                    isSelected={isSelected}
                    onClick={() => {
                      setSelectedIncident(inc);
                      if (inc.category === 'MEDICAL_EMERGENCY') {
                        loadScenarioPreset('MEDICAL_EMERGENCY');
                      } else {
                        loadScenarioPreset('FIRE');
                      }
                    }}
                  />
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
              <EmergencyRecommendationCard
                aiDirective={aiDirective}
                severity={severity === 'CRITICAL' ? 'CRITICAL' : severity === 'HIGH' ? 'HIGH' : 'MEDIUM'}
                accessibilityNeeds={accessibilityNeeds}
                isSpeaking={isSpeaking}
                onSpeakToggle={toggleSpeech}
              />

              {/* 5. REUSABLE EVACUATION & SAFE ROUTE RESTRUCTURINGS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <EvacuationRouteCard 
                  recommendation={aiDirective.recommendation}
                  nearestExit={String(aiDirective.contextSnapshot?.nearestExit || nearestExit)}
                  accessibilityNotes={String(aiDirective.contextSnapshot?.accessibilityNotes || (accessibilityNeeds === 'WHEELCHAIR' ? 'Strict step-free egress paths mapped; elevators bypassing fire floors.' : accessibilityNeeds === 'BLIND' ? 'Binaural sound beacons activated at emergency thresholds.' : 'Standard egress routes clear.'))}
                  estimatedTime={String(aiDirective.contextSnapshot?.estimatedTime || '4 minutes')}
                />

                <SafeRouteMapCard 
                  routeSegments={String(aiDirective.contextSnapshot?.safeRoute || `${locationSector} -> Exit Corridor C -> ${nearestExit}`)}
                  alternatives={aiDirective.contextSnapshot?.alternativeRoutes as string[] || [
                    `${locationSector} -> North Plaza Outer Gate`,
                    `Elevated Bridge Connection -> South Main Concourse`
                  ]}
                />

              </div>

            </div>
          ) : null}

          {/* 6. REUSABLE BROADCASTER FEED CARD */}
          <LiveEmergencyFeed alerts={feedAlerts} />

        </div>

      </div>

    </EmergencyDashboard>
  );
}
