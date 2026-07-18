/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSynapse } from '../../contexts/SynapseContext';
import { accessibilityAgent } from '../../services/di';
import { SynapseCoreRecommendation } from '../../types/synapse';
import { AccessibilityProfile, AccessibilityContextOptions } from '../../types/accessibility';
import { Card } from '../../components/ui/Card';
import {
  Accessibility, Eye, Heart, Footprints, Sparkles, Sliders,
  RefreshCw, MapPin, Volume2, VolumeX, AlertTriangle, Play, Square,
  Map, HelpCircle, Navigation, ShieldCheck, Info, User
} from 'lucide-react';

import {
  AccessibilityStatusBadge,
  AccessibilityAlertBanner,
  AccessibilityCard,
  AccessibleRouteCard,
  FacilityCard,
  RouteComparisonCard,
  AccessibilityRecommendationCard,
  AccessibilityDashboard
} from '../../components/accessibility/AccessibilityComponents';

// Import our specialized accessibility services
import {
  AccessibilityAnalysisService,
  AccessibleRouteService,
  FacilityRecommendationService,
  AccessibilityScoringService
} from '../../services/AccessibilityService';

// Instantiate our services
const analysisService = new AccessibilityAnalysisService();
const routeService = new AccessibleRouteService();
const facilityService = new FacilityRecommendationService();
const scoringService = new AccessibilityScoringService();

export function AccessibilityIntelligenceAgent() {
  const { user } = useAuth();
  const { activeRole } = useSynapse();

  // 1. Core Profile & Telemetry States
  const [activeProfile, setActiveProfile] = useState<AccessibilityProfile>('WHEELCHAIR');
  const [originSector, setOriginSector] = useState<string>('SEC_104');
  const [destination, setDestination] = useState<string>('Gate 4 Main Entrance');
  const [crowdDensity, setCrowdDensity] = useState<number>(65);
  const [elevatorStatus, setElevatorStatus] = useState<'OPERATIONAL' | 'OFFLINE'>('OPERATIONAL');
  const [rampAvailability, setRampAvailability] = useState<'AVAILABLE' | 'BLOCKED' | 'LIMITED'>('AVAILABLE');
  const [blockedRoutes, setBlockedRoutes] = useState<string[]>([]);
  
  // Custom inputs
  const [newBlockedInput, setNewBlockedInput] = useState<string>('');
  
  // 2. AI Recommendation States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiDirective, setAiDirective] = useState<SynapseCoreRecommendation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 3. Speech Synthesizer State (Text-To-Speech Accessibility aid)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Supported profile list with styling helpers
  const PROFILE_PRESETS = [
    { id: 'WHEELCHAIR' as AccessibilityProfile, title: 'Wheelchair User', desc: 'No stairs. Elevator preference. Zero-barrier paths.', icon: Accessibility },
    { id: 'BLIND' as AccessibilityProfile, title: 'Blind User', desc: 'Continuous tactile tiles, active audio wayfinding tags.', icon: Eye },
    { id: 'LOW_VISION' as AccessibilityProfile, title: 'Low Vision', desc: 'High-contrast signs. Large typography routing.', icon: Eye },
    { id: 'HEARING_IMPAIRED' as AccessibilityProfile, title: 'Hearing Impaired', desc: 'Transcribed visual beacons, prompt alerts on screen.', icon: Volume2 },
    { id: 'SENIOR' as AccessibilityProfile, title: 'Senior Citizen', desc: 'Low-incline gradients, frequent resting bench nodes.', icon: Heart },
    { id: 'TEMPORARY_INJURY' as AccessibilityProfile, title: 'Temporary Injury', desc: 'Short-stride ramps, avoid steep walkways.', icon: Footprints },
    { id: 'STROLLER' as AccessibilityProfile, title: 'Family with Stroller', desc: 'Elevators and wide ramps. Avoid turnstile gates.', icon: Footprints },
    { id: 'NEURODIVERGENT' as AccessibilityProfile, title: 'Neurodivergent', desc: 'Sensory quiet bypasses, low decibel corridors.', icon: Heart }
  ];

  // Calculate local computed states based on selections
  const localAnalysis = analysisService.analyzeProfile(activeProfile, crowdDensity);
  const localRoute = routeService.calculateRoute(activeProfile, originSector, destination, blockedRoutes, elevatorStatus, rampAvailability);
  const localFacilities = facilityService.getNearbyFacilities(activeProfile, originSector);
  const localScore = scoringService.computeConfidence(activeProfile, {
    elevatorStatus,
    rampAvailability,
    crowdDensityPercent: crowdDensity,
    blockedRoutes
  });

  // Fetch / Refresh AI recommendations through Synapse Core pipeline
  const computeAccessibilityDirectives = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    stopSpeech();

    try {
      // Build the contextual options payload
      const options: AccessibilityContextOptions = {
        profileType: activeProfile,
        locationSector: originSector,
        destinationSector: destination,
        crowdDensityPercent: crowdDensity,
        blockedRoutes,
        accessibleRoutes: ['Concourse Elevator Level 1', 'Step-Free East Ramp'],
        elevatorStatus,
        rampAvailability,
        hasAccessibleSeating: true,
        hasAccessibleRestrooms: true,
        hasMedicalStations: true,
        liveAlerts: elevatorStatus === 'OFFLINE' ? ['West Lobby Elevator Offline'] : [],
        weatherConditions: 'Clear, 28°C',
        matchStatus: 'LIVE (Second Half)'
      };

      // Query Synapse Core to run intelligence loop
      const recommendation = await accessibilityAgent.getAccessibilityDirectives(
        user?.uid || 'user-demo-1',
        activeRole,
        { latitude: 25.3522, longitude: 51.5311, sectorId: originSector },
        options
      );

      setAiDirective(recommendation);
    } catch (err) {
      console.error('Failed to resolve Synapse Core direct AI directives:', err);
      setErrorMessage(err instanceof Error ? err.message : 'A dynamic network failure occurred. Relying on offline services.');
      
      // Setup dynamic fallback recommendation object if Gemini fails
      const fallbackRec: SynapseCoreRecommendation = {
        id: `rec-accessibility-fallback-${Date.now()}`,
        title: 'Step-Free Route (Offline Local Backup)',
        recommendation: `Follow the step-free pathway from ${originSector} via ${localRoute.primaryRoute}. Avoid ${elevatorStatus === 'OFFLINE' ? 'elevator lifts' : 'stairs'}.`,
        reason: 'The stadium central AI coordinator encountered a network timeout. Safe local backup wayfinding rules are enforced.',
        confidenceScore: localScore,
        priority: localAnalysis.priority,
        suggestedAction: `Utilize ${localRoute.primaryRoute} and check in with Sector ${originSector.replace('SEC_', '')} access steward.`,
        estimatedBenefit: 'Guarantees WCAG step-free transit under server dropouts.',
        timestamp: new Date().toISOString(),
        intent: 'ACCESSIBILITY',
        reasoningDetails: [
          'Calculated step-free alternatives from local memory nodes.',
          'Detected high crowd density factor and adjusted travel pace metrics.',
          'Verified accessible resting spots and tactile compliance checkpoints.'
        ]
      };
      setAiDirective(fallbackRec);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-run AI analysis whenever core context parameters change
  useEffect(() => {
    computeAccessibilityDirectives();
    return () => {
      stopSpeech();
    };
  }, [activeProfile, originSector, destination, elevatorStatus, rampAvailability, blockedRoutes, crowdDensity, activeRole]);

  // Audio wayfinding speech synthesization
  const handleSpeakToggle = () => {
    if (isSpeaking) {
      stopSpeech();
    } else if (aiDirective) {
      speakRecommendation(aiDirective.recommendation, aiDirective.reason);
    }
  };

  const speakRecommendation = (recommendation: string, justification: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this browser.');
      return;
    }

    window.speechSynthesis.cancel(); // Clear any playing voice

    const textToSpeak = `Wayfinding description for ${activeProfile.replace('_', ' ')}. Action Recommendation: ${recommendation}. Reason: ${justification}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95; // Slightly slower pace for high legibility
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
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Blocked Route simulation list utilities
  const handleAddBlockedRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBlockedInput.trim() && !blockedRoutes.includes(newBlockedInput.trim())) {
      setBlockedRoutes(prev => [...prev, newBlockedInput.trim()]);
      setNewBlockedInput('');
    }
  };

  const handleRemoveBlockedRoute = (route: string) => {
    setBlockedRoutes(prev => prev.filter(r => r !== route));
  };

  return (
    <AccessibilityDashboard>
      {/* Title & Core Intent Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/30 border border-slate-800/80 p-5 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-400">
            <Accessibility className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase">MODULE: COGNITIVE ACCESS & INCLUSION</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-100 uppercase tracking-tight font-sans">
            AI Accessibility Intelligence Agent
          </h2>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Continuously computing step-free routes, tactile paths, sensory quiet zones, and barrier-avoidance wayfinding.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={computeAccessibilityDirectives}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-900 text-xs font-semibold text-slate-300 rounded-lg border border-slate-800 cursor-pointer"
            aria-label="Refresh Accessibility Audit"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>RE-EVALUATE AUDIT</span>
          </button>
        </div>
      </div>

      {/* Dynamic Security Advisory Alerts */}
      <div className="space-y-3">
        <AccessibilityAlertBanner
          title="Elevator Offline Warning"
          message={`Elevator Cab Sector ${originSector.replace('SEC_', '')} is currently offline for mandatory field testing. Alternate skyways are active.`}
          active={elevatorStatus === 'OFFLINE'}
          priority="HIGH"
        />
        <AccessibilityAlertBanner
          title="Stairway Bottleneck Advisory"
          message="High crowd surge in outer Gate 4 East. Visually impaired visitors are advised to defer transit or use alternate Field Gate Loops."
          active={crowdDensity > 80}
          priority="MEDIUM"
        />
        <AccessibilityAlertBanner
          title="Ramp Obstruction Alert"
          message="Wheelchair access ramp Sectors 104-106 is temporarily closed due to construction equipment. Follow blue diversion arrows."
          active={rampAvailability === 'BLOCKED'}
          priority="CRITICAL"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Interactive Presets & Environment Configs */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Select Accessibility Profile */}
          <Card className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-4">
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-extrabold block mb-1">
                Step 1: Choose Visitor Profile
              </span>
              <h4 className="text-xs font-extrabold text-slate-200 uppercase font-sans tracking-wide">
                Supported Accessibility Profiles
              </h4>
            </div>

            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {PROFILE_PRESETS.map((prof) => (
                <AccessibilityCard
                  key={prof.id}
                  title={prof.title}
                  description={prof.desc}
                  icon={prof.icon}
                  isSelected={activeProfile === prof.id}
                  onClick={() => {
                    setActiveProfile(prof.id);
                  }}
                />
              ))}
            </div>
          </Card>

          {/* Environmental parameters & Barrier Simulation */}
          <Card className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-400" />
              <h4 className="text-xs font-extrabold text-slate-200 uppercase font-sans tracking-wide">
                Simulate Telemetry Parameters
              </h4>
            </div>

            <div className="space-y-4">
              {/* Origin Sector Selector */}
              <div className="space-y-1.5">
                <label htmlFor="origin-sector" className="text-[10px] text-slate-400 font-mono font-bold uppercase block">
                  Current Sector:
                </label>
                <select
                  id="origin-sector"
                  value={originSector}
                  onChange={(e) => setOriginSector(e.target.value)}
                  className="w-full bg-slate-950 text-xs text-slate-200 p-2 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="SEC_104">Sector 104 (East Deck)</option>
                  <option value="SEC_108">Sector 108 (North Deck)</option>
                  <option value="SEC_112">Sector 112 (West Deck)</option>
                  <option value="SEC_201">Sector 201 (Upper level)</option>
                </select>
              </div>

              {/* Target Destination Selector */}
              <div className="space-y-1.5">
                <label htmlFor="destination-sector" className="text-[10px] text-slate-400 font-mono font-bold uppercase block">
                  Destination Landmark:
                </label>
                <select
                  id="destination-sector"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-950 text-xs text-slate-200 p-2 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Gate 4 Main Entrance">Gate 4 Plaza Exit</option>
                  <option value="Sensory Chill Cabin">Sensory Retreat Cabin</option>
                  <option value="Sector 112 Wheelchair Deck">Sector 112 Dedicated Deck</option>
                  <option value="VIP Skybox Lounge 2">VIP Skybox Suite</option>
                </select>
              </div>

              {/* Crowd Density Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="crowd-density-slider" className="text-[10px] text-slate-400 font-mono font-bold uppercase">
                    Corridor Crowd Density:
                  </label>
                  <span className="text-[10px] font-mono text-blue-400 font-bold">{crowdDensity}%</span>
                </div>
                <input
                  id="crowd-density-slider"
                  type="range"
                  min="10"
                  max="100"
                  value={crowdDensity}
                  onChange={(e) => setCrowdDensity(Number(e.target.value))}
                  className="w-full accent-blue-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                  aria-valuemin={10}
                  aria-valuemax={100}
                  aria-valuenow={crowdDensity}
                />
              </div>

              {/* Elevator Outage Simulation */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-mono font-bold uppercase block">
                  Elevator Power Grid:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setElevatorStatus('OPERATIONAL')}
                    className={`py-1.5 text-[10px] font-mono font-bold rounded border cursor-pointer uppercase ${
                      elevatorStatus === 'OPERATIONAL'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-950 border-slate-850 text-slate-500'
                    }`}
                  >
                    Online (Normal)
                  </button>
                  <button
                    onClick={() => setElevatorStatus('OFFLINE')}
                    className={`py-1.5 text-[10px] font-mono font-bold rounded border cursor-pointer uppercase ${
                      elevatorStatus === 'OFFLINE'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-slate-950 border-slate-850 text-slate-500'
                    }`}
                  >
                    Offline (Outage)
                  </button>
                </div>
              </div>

              {/* Ramp Availability Simulation */}
              <div className="space-y-1.5">
                <label htmlFor="ramp-select" className="text-[10px] text-slate-400 font-mono font-bold uppercase block">
                  Physical Ramp Access:
                </label>
                <select
                  id="ramp-select"
                  value={rampAvailability}
                  onChange={(e) => setRampAvailability(e.target.value as any)}
                  className="w-full bg-slate-950 text-xs text-slate-200 p-2 rounded-lg border border-slate-800 focus:outline-none"
                >
                  <option value="AVAILABLE">AVAILABLE (Clear & safe)</option>
                  <option value="LIMITED">LIMITED (Construction works)</option>
                  <option value="BLOCKED">BLOCKED (Closed fully)</option>
                </select>
              </div>

              {/* Dynamic barrier list input */}
              <div className="space-y-1.5 pt-2 border-t border-slate-850">
                <label htmlFor="add-barrier" className="text-[10px] text-slate-400 font-mono font-bold uppercase block">
                  Add Active Barrier Obstacle:
                </label>
                <form onSubmit={handleAddBlockedRoute} className="flex gap-2">
                  <input
                    id="add-barrier"
                    type="text"
                    placeholder="e.g. Broken escalators, Sector 104 stairs"
                    value={newBlockedInput}
                    onChange={(e) => setNewBlockedInput(e.target.value)}
                    className="flex-1 bg-slate-950 text-xs text-slate-200 p-2 rounded-lg border border-slate-800 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-lg cursor-pointer"
                  >
                    ADD
                  </button>
                </form>

                {blockedRoutes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {blockedRoutes.map((route, i) => (
                      <span
                        key={i}
                        onClick={() => handleRemoveBlockedRoute(route)}
                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-mono border border-rose-500/20 rounded cursor-pointer"
                        title="Click to remove"
                      >
                        <span>{route}</span>
                        <span className="text-[8px] opacity-65">×</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right 2 Columns: Output Cards & AI Directives */}
        <div className="lg:col-span-2 space-y-6">
          {errorMessage && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 font-sans leading-relaxed flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* AI Decision recommendation display */}
          {aiDirective ? (
            <AccessibilityRecommendationCard
              aiDirective={aiDirective}
              isSpeaking={isSpeaking}
              onSpeakToggle={handleSpeakToggle}
              profileName={activeProfile}
            />
          ) : (
            <Card className="border border-slate-850 bg-slate-950 p-12 text-center flex flex-col items-center justify-center space-y-3 rounded-2xl">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm font-sans font-medium text-slate-400">
                AI Agent is computing optimal pathways. Please wait...
              </p>
            </Card>
          )}

          {/* Route Milestones & Warning indicators */}
          <AccessibleRouteCard
            routeSegments={localRoute.primaryRoute}
            estimatedTime={localRoute.estimatedTime}
            accessibilityWarnings={localRoute.routeWarnings}
          />

          {/* Side-by-side Standard vs Accessible Route Comparison */}
          <RouteComparisonCard
            primaryRoute={localRoute.primaryRoute}
            alternativeRoute={localRoute.alternativeRoute}
            estimatedTime={localRoute.estimatedTime}
            profile={activeProfile}
          />

          {/* List of nearby compliant facilities */}
          <div className="space-y-3.5">
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1 font-bold">
                Nearby Accessibility facilities
              </span>
              <h4 className="text-xs font-extrabold text-slate-300 uppercase font-sans tracking-wider">
                Proximity Mapped Resources (Sector {originSector.replace('SEC_', '')})
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {localFacilities.map((fac, idx) => (
                <FacilityCard
                  key={idx}
                  name={fac.facilityName}
                  distanceMeters={fac.distanceMeters}
                  type={fac.type}
                  rating={fac.accessibilityRating}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AccessibilityDashboard>
  );
}
export default AccessibilityIntelligenceAgent;
