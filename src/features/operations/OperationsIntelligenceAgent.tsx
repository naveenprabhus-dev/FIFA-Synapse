/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSynapse } from '../../contexts/SynapseContext';
import { UserRole } from '../../types/user';
import { operationsAgent } from '../../services/di';
import { SynapseCoreRecommendation } from '../../types/synapse';
import { OperationalArea, OperationsContextOptions, OperationsRecommendation } from '../../types/operations';
import { Card } from '../../components/ui/Card';
import {
  Users, Radio, Clock, Shield, Activity, Heart, Sparkles, CheckCircle2,
  Trash2, Wrench, AlertTriangle, Play, Square, Volume2, VolumeX, Info, MapPin, RefreshCw
} from 'lucide-react';

import {
  PriorityIndicator,
  OperationsDashboard,
  OperationsCard,
  ResourceStatusCard,
  DeploymentCard,
  OperationalRecommendationCard,
  QueueStatusCard,
  GateStatusCard,
  MaintenanceAlertCard,
  CleaningStatusCard
} from '../../components/operations/OperationsComponents';

// Import our specialized operations services
import { OperationsIntelligenceService } from '../../services/OperationsIntelligenceService';

const operationsService = new OperationsIntelligenceService();

export function OperationsIntelligenceAgent() {
  const { user } = useAuth();
  const { activeRole } = useSynapse();

  // 1. Operational Area Selection
  const [activeArea, setActiveArea] = useState<OperationalArea>('CROWD_MANAGEMENT');

  // 2. Telemetry Simulation States
  const [currentZone, setCurrentZone] = useState<string>('SEC_104');
  const [liveCrowdDensity, setLiveCrowdDensity] = useState<number>(70);
  const [queueLength, setQueueLength] = useState<number>(45);
  const [gateStatus, setGateStatus] = useState<'NORMAL' | 'CONGESTED' | 'CLOSED'>('NORMAL');
  const [volunteerCount, setVolunteerCount] = useState<number>(15);
  const [securityCount, setSecurityCount] = useState<number>(8);
  const [medicalTeamAvailable, setMedicalTeamAvailable] = useState<boolean>(true);
  const [cleaningStatus, setCleaningStatus] = useState<'CLEAN' | 'NEEDS_CLEANING' | 'CRITICAL'>('CLEAN');
  const [parkingAvailability, setParkingAvailability] = useState<number>(40);
  const [weather] = useState<string>('Clear, 27°C, Wind 12km/h');
  const [matchTimeline] = useState<string>('LIVE (78th Minute)');
  const [liveIncidentCount, setLiveIncidentCount] = useState<number>(0);
  const [activeNotificationsCount] = useState<number>(2);

  // 3. AI Recommendation States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiDirective, setAiDirective] = useState<OperationsRecommendation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 4. Speech Synthesis State (Text-To-Speech audio assistance)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Supported operational area presets with descriptions and icons
  const AREA_PRESETS = [
    { id: 'CROWD_MANAGEMENT' as OperationalArea, title: 'Crowd Management', desc: 'Predict movement and sector bypass routes.', icon: Users },
    { id: 'GATE_MONITORING' as OperationalArea, title: 'Gate Monitoring', desc: 'Flow rate throttle and gate redistribution.', icon: Radio },
    { id: 'QUEUE_MONITORING' as OperationalArea, title: 'Queue Monitoring', desc: 'Wait-time mitigation & turnstile guides.', icon: Clock },
    { id: 'VOLUNTEER_DEPLOYMENT' as OperationalArea, title: 'Volunteer Deployment', desc: 'Optimize staff positions & customer guides.', icon: Users },
    { id: 'SECURITY_DEPLOYMENT' as OperationalArea, title: 'Security Deployment', desc: 'Crowd containment & incident safety patrol.', icon: Shield },
    { id: 'CLEANING_OPERATIONS' as OperationalArea, title: 'Cleaning Operations', desc: 'Sanitizer compliance & janitor routing.', icon: Trash2 },
    { id: 'RESTROOM_CAPACITY' as OperationalArea, title: 'Restroom Capacity', desc: 'Monitor queue lengths & cleaning status.', icon: Trash2 },
    { id: 'MEDICAL_TEAM_COORDINATION' as OperationalArea, title: 'Medical Coordination', desc: 'First-aid dispatches & responder tracks.', icon: Heart },
    { id: 'PARKING_STATUS' as OperationalArea, title: 'Parking Status', desc: 'Interstate highway ingress redirection.', icon: MapPin },
    { id: 'LOST_AND_FOUND' as OperationalArea, title: 'Lost & Found', desc: 'Catalog baggage items & sync public logs.', icon: Info },
    { id: 'MAINTENANCE_ALERTS' as OperationalArea, title: 'Maintenance Alerts', desc: 'Compressor health check & sector HVAC fixes.', icon: Wrench }
  ];

  // Dynamic context options payload
  const currentContextOptions: OperationsContextOptions = {
    currentZone,
    liveCrowdDensity,
    queueLength,
    gateStatus,
    volunteerCount,
    securityCount,
    medicalTeamAvailable,
    cleaningStatus,
    parkingAvailability,
    weather,
    matchTimeline,
    liveIncidentCount,
    activeNotificationsCount
  };

  // Run AI analysis loop through Synapse Core integration
  const computeOperationsDirectives = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    stopSpeech();

    // Verification check for invalid resource data or missing configurations
    if (volunteerCount < 0 || securityCount < 0) {
      setErrorMessage('ValidationError: Resource data is invalid. Staff counts must be non-negative.');
      setIsLoading(false);
      return;
    }

    try {
      // Query Synapse Core agent pipeline
      const recommendation = await operationsAgent.getOperationsDirectives(
        user?.uid || 'operations-demonstrator-uid',
        activeRole,
        { latitude: 25.3522, longitude: 51.5311, sectorId: currentZone },
        currentContextOptions
      );

      // Attempt parsing. If response lacks detailed JSON structure, formulate model around recommendation
      const parsedRecommendation: OperationsRecommendation = {
        operationType: activeArea,
        currentSituation: `Crowd density is ${liveCrowdDensity}% in ${currentZone}. Queue backlog is ${queueLength} members. Active incidents: ${liveIncidentCount}.`,
        recommendation: recommendation.recommendation,
        reasoning: recommendation.reasoningDetails || [recommendation.reason],
        priority: recommendation.priority,
        affectedArea: currentZone,
        requiredResources: recommendation.suggestedAction ? [recommendation.suggestedAction] : ['On-duty operations staff'],
        estimatedImpact: recommendation.estimatedBenefit || 'Optimizes resource allocation and minimizes queue waiting times.',
        confidenceScore: recommendation.confidenceScore || 0.90,
        alternativeActions: recommendation.alternative ? [recommendation.alternative] : ['Maintain base patrol configurations.'],
        timestamp: recommendation.timestamp || new Date().toISOString()
      };

      setAiDirective(parsedRecommendation);
    } catch (err) {
      console.error('Failed to query central Synapse Core operations agent:', err);
      setErrorMessage('Central intelligence gateway timeout. Enforcing secure local service recommendations.');
      
      // Fallback directly to the OperationsIntelligenceService local heuristics
      const localFallback = operationsService.getRecommendation(activeArea, currentContextOptions);
      setAiDirective(localFallback);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger evaluation upon state adjustments
  useEffect(() => {
    computeOperationsDirectives();
    return () => {
      stopSpeech();
    };
  }, [
    activeArea, currentZone, liveCrowdDensity, queueLength, gateStatus,
    volunteerCount, securityCount, medicalTeamAvailable, cleaningStatus,
    parkingAvailability, liveIncidentCount, activeRole
  ]);

  // Audio vocalizer toggle
  const handleSpeakToggle = () => {
    if (isSpeaking) {
      stopSpeech();
    } else if (aiDirective) {
      speakRecommendation(aiDirective.recommendation, aiDirective.currentSituation);
    }
  };

  const speakRecommendation = (recommendationText: string, situation: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    const queryText = `Operations assessment for ${activeArea.replace(/_/g, ' ')}. Assessment: ${situation}. Direct Directive: ${recommendationText}`;
    const utterance = new SpeechSynthesisUtterance(queryText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechUtteranceRef.current = utterance;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Render role-specific public UI if role is FAN
  if (activeRole === UserRole.FAN) {
    return (
      <Card className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-blue-400">
          <Activity className="w-5 h-5" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">FAN SECURITY & INFO PORTAL</span>
        </div>
        <h3 className="text-base font-extrabold text-slate-100 uppercase tracking-tight">
          Stadium Operations & Public Announcements
        </h3>
        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          The central stadium coordinator is continuously managing crowd density and transit lines. 
          The public status for your current zone is optimal.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Public Gate Status</span>
            <span className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All Main Gates Clear
            </span>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Advisory Notification</span>
            <p className="text-xs text-slate-400">
              Please use Gate 4 Main Entrance for rapid subway shuttle boarding.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Render organizer or venue staff view with appropriate customization
  const isOrganizer = activeRole === UserRole.ORGANIZER;
  const isStaff = activeRole === UserRole.STAFF;

  return (
    <OperationsDashboard>
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/30 border border-slate-800/80 p-5 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-400">
            <Activity className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase">
              {isOrganizer ? 'SYSTEM ROLE: CONTROL ROOM OVERVIEW' : isStaff ? 'SYSTEM ROLE: VENUE INFRASTRUCTURE STAFF' : 'SYSTEM ROLE: OPERATIONS DISPATCH CENTER'}
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-100 uppercase tracking-tight font-sans">
            AI Operations Intelligence Coordinator
          </h2>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Correlating live queue logs, crowd telemetry, staffing rosters, and facility compliance indicators to optimize smart stadium operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={computeOperationsDirectives}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-900 text-xs font-semibold text-slate-300 rounded-lg border border-slate-800 cursor-pointer"
            aria-label="Re-evaluate Operations Audit"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>RE-EVALUATE TELEMETRY</span>
          </button>
        </div>
      </div>

      {/* Warning banner indicators */}
      <div className="space-y-3" role="alert" aria-live="polite">
        {liveIncidentCount > 0 && (
          <div className="p-4 bg-rose-500/15 border-l-4 border-rose-500 text-rose-200 rounded-r-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold tracking-wider uppercase font-mono">⚠️ ACTIVE OPERATIONS INCIDENT ALERT</h4>
              <p className="text-xs">
                {liveIncidentCount} unresolved field incidents logged in the master queue. Resource coordination priorities are high-priority.
              </p>
            </div>
          </div>
        )}
        {gateStatus === 'CLOSED' && (
          <div className="p-4 bg-rose-500/15 border-l-4 border-rose-500 text-rose-200 rounded-r-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold tracking-wider uppercase font-mono">⚠️ ACCESS PORT CLOSED BLOCKAGE</h4>
              <p className="text-xs">
                Turnstiles at Zone {currentZone.replace('SEC_', '')} are completely CLOSED. Immediate gate redistribution recommended.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Preset selection & Telemetry Controls */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Preset list selection */}
          <Card className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-4">
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-extrabold block mb-1">
                Step 1: Choose Operational Target
              </span>
              <h4 className="text-xs font-extrabold text-slate-200 uppercase font-sans tracking-wide">
                Operational Intelligence Sectors
              </h4>
            </div>

            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {AREA_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setActiveArea(preset.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all w-full flex items-start gap-3 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    activeArea === preset.id
                      ? 'bg-blue-600/10 border-blue-500 text-blue-200 shadow-md shadow-blue-500/5'
                      : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:bg-slate-900/40 hover:text-slate-300'
                  }`}
                >
                  <preset.icon className={`w-4 h-4 shrink-0 mt-0.5 ${activeArea === preset.id ? 'text-blue-400' : 'text-slate-500'}`} />
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold uppercase tracking-wide text-slate-200 leading-tight">
                      {preset.title}
                    </h5>
                    <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                      {preset.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Telemetry Adjusters - Disabled if role lacks edit permissions */}
          <Card className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-extrabold text-slate-200 uppercase font-sans tracking-wide">
                  Live Telemetry Simulators
                </h4>
              </div>
              <span className="text-[9px] font-mono text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.2 border border-blue-500/20 rounded">
                SIM ACTIVE
              </span>
            </div>

            <div className="space-y-4">
              {/* Stadium Zone Selector */}
              <div className="space-y-1.5">
                <label htmlFor="current-zone" className="text-[10px] text-slate-400 font-mono font-bold uppercase block">
                  Operations Focus Zone:
                </label>
                <select
                  id="current-zone"
                  value={currentZone}
                  onChange={(e) => setCurrentZone(e.target.value)}
                  className="w-full bg-slate-950 text-xs text-slate-200 p-2 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="SEC_104">Sector 104 (East Deck)</option>
                  <option value="SEC_108">Sector 108 (North Deck)</option>
                  <option value="SEC_112">Sector 112 (West Deck)</option>
                  <option value="SEC_201">Sector 201 (Upper level)</option>
                </select>
              </div>

              {/* Crowd Density slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="crowd-density" className="text-[10px] text-slate-400 font-mono font-bold uppercase">
                    Zone Crowd Density:
                  </label>
                  <span className="text-[10px] font-mono text-blue-400 font-bold">{liveCrowdDensity}%</span>
                </div>
                <input
                  id="crowd-density"
                  type="range"
                  min="10"
                  max="100"
                  value={liveCrowdDensity}
                  onChange={(e) => setLiveCrowdDensity(Number(e.target.value))}
                  className="w-full accent-blue-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                  aria-valuenow={liveCrowdDensity}
                  aria-valuemin={10}
                  aria-valuemax={100}
                />
              </div>

              {/* Queue Length slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="queue-length" className="text-[10px] text-slate-400 font-mono font-bold uppercase">
                    Turnstile Backlog Queue:
                  </label>
                  <span className="text-[10px] font-mono text-blue-400 font-bold">{queueLength} visitors</span>
                </div>
                <input
                  id="queue-length"
                  type="range"
                  min="0"
                  max="300"
                  value={queueLength}
                  onChange={(e) => setQueueLength(Number(e.target.value))}
                  className="w-full accent-blue-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                  aria-valuenow={queueLength}
                  aria-valuemin={0}
                  aria-valuemax={300}
                />
              </div>

              {/* Gate Status selector */}
              <div className="space-y-1.5">
                <label htmlFor="gate-status" className="text-[10px] text-slate-400 font-mono font-bold uppercase block">
                  Access Gate Mode:
                </label>
                <select
                  id="gate-status"
                  value={gateStatus}
                  onChange={(e) => setGateStatus(e.target.value as any)}
                  className="w-full bg-slate-950 text-xs text-slate-200 p-2 rounded-lg border border-slate-800 focus:outline-none"
                >
                  <option value="NORMAL">NORMAL (Free intake)</option>
                  <option value="CONGESTED">CONGESTED (Pacing required)</option>
                  <option value="CLOSED">CLOSED (Emergency blockage)</option>
                </select>
              </div>

              {/* Staff counts (only editable by operators / organizers) */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label htmlFor="volunteer-count" className="text-[10px] text-slate-400 font-mono font-bold uppercase block">
                    Volunteers:
                  </label>
                  <input
                    id="volunteer-count"
                    type="number"
                    min="0"
                    max="100"
                    value={volunteerCount}
                    onChange={(e) => setVolunteerCount(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-950 text-xs text-slate-200 p-2 rounded-lg border border-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="security-count" className="text-[10px] text-slate-400 font-mono font-bold uppercase block">
                    Security:
                  </label>
                  <input
                    id="security-count"
                    type="number"
                    min="0"
                    max="100"
                    value={securityCount}
                    onChange={(e) => setSecurityCount(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-950 text-xs text-slate-200 p-2 rounded-lg border border-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Medical and Cleaning selectors */}
              <div className="space-y-2 pt-2 border-t border-slate-850">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">
                    Medical Alpha Ready:
                  </span>
                  <button
                    onClick={() => setMedicalTeamAvailable(!medicalTeamAvailable)}
                    className={`px-3 py-1 text-[10px] font-mono font-bold rounded border cursor-pointer uppercase ${
                      medicalTeamAvailable
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {medicalTeamAvailable ? 'YES (Free)' : 'NO (Busy)'}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cleaning-status" className="text-[10px] text-slate-400 font-mono font-bold uppercase block">
                    Sanitation Level:
                  </label>
                  <select
                    id="cleaning-status"
                    value={cleaningStatus}
                    onChange={(e) => setCleaningStatus(e.target.value as any)}
                    className="w-full bg-slate-950 text-xs text-slate-200 p-2 rounded-lg border border-slate-800 focus:outline-none"
                  >
                    <option value="CLEAN">CLEAN (Optimal)</option>
                    <option value="NEEDS_CLEANING">NEEDS CLEANING (Moderate workload)</option>
                    <option value="CRITICAL">CRITICAL (Breach warning)</option>
                  </select>
                </div>
              </div>

              {/* Incident log injector */}
              <div className="space-y-2 pt-2 border-t border-slate-850">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">
                    Live Incident Count:
                  </span>
                  <div className="flex gap-1.5">
                    {[0, 1, 3, 5].map((count) => (
                      <button
                        key={count}
                        onClick={() => setLiveIncidentCount(count)}
                        className={`w-7 h-7 flex items-center justify-center text-xs font-mono font-bold border rounded cursor-pointer ${
                          liveIncidentCount === count
                            ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                            : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 2 columns: Output Display & Directives */}
        <div className="lg:col-span-2 space-y-6">
          {errorMessage && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 font-sans leading-relaxed flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Active AI Recommendation Card */}
          {aiDirective ? (
            <OperationalRecommendationCard
              recommendation={aiDirective}
              isSpeaking={isSpeaking}
              onSpeakToggle={handleSpeakToggle}
            />
          ) : (
            <Card className="border border-slate-850 bg-slate-950 p-12 text-center flex flex-col items-center justify-center space-y-3 rounded-2xl">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm font-sans font-medium text-slate-400">
                AI Coordinator is computing optimal operational directives. Please wait...
              </p>
            </Card>
          )}

          {/* Core Resource Panel */}
          <ResourceStatusCard
            volunteerCount={volunteerCount}
            securityCount={securityCount}
            medicalAvailable={medicalTeamAvailable}
            onAdjust={() => {
              setVolunteerCount(20);
              setSecurityCount(10);
            }}
          />

          {/* Active status logs grid */}
          <div className="space-y-3">
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1 font-bold">
                Live Zone Telemetry Indicators
              </span>
              <h4 className="text-xs font-extrabold text-slate-300 uppercase font-sans tracking-wider">
                System Health Matrices (Focus: Zone {currentZone.replace('SEC_', '')})
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QueueStatusCard
                queueLength={queueLength}
                waitTimeMinutes={Math.max(2, Math.round(queueLength * 0.4))}
                statusLabel={queueLength > 150 ? 'CRITICAL BACKLOG' : queueLength > 80 ? 'HIGH WAIT' : 'NORMAL FLOW'}
              />

              <GateStatusCard
                gateName={`Access gate Sector ${currentZone.replace('SEC_', '')}`}
                gateStatus={gateStatus}
                onToggleStatus={() => {
                  setGateStatus(gateStatus === 'CLOSED' ? 'NORMAL' : 'CLOSED');
                }}
              />

              <CleaningStatusCard
                facilityName={`Restroom concourse block ${currentZone.replace('SEC_', '')}`}
                cleaningStatus={cleaningStatus}
                onTriggerClean={() => {
                  setCleaningStatus('CLEAN');
                }}
              />

              <MaintenanceAlertCard
                equipmentName={`HVAC Air Compressor ${currentZone.replace('SEC_', '')}`}
                status="Normal wear-and-tear air flow levels"
                reportedTime="10:05 AM"
                onResolve={() => {
                  alert('Repairs dispatched to HVAC unit compressor.');
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </OperationsDashboard>
  );
}
export default OperationsIntelligenceAgent;
