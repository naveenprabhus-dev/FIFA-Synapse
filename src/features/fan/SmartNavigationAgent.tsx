/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSynapse } from '../../contexts/SynapseContext';
import { synapseCore } from '../../services/di';
import { SynapseCoreRecommendation } from '../../types/synapse';
import { STADIUM_NODES } from './constants';
import { LocationState, NavigationSimulatorState } from './types';
import { LocationCard } from './components/LocationCard';
import { SelectorPanel } from './components/SelectorPanel';
import { RecommendationCard } from './components/RecommendationCard';
import { RouteVisualizer } from './components/RouteVisualizer';
import { MetricsPanel } from './components/MetricsPanel';
import { Compass, AlertTriangle, ShieldCheck, HelpCircle, Activity } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export function SmartNavigationAgent() {
  const { user } = useAuth();
  const { activeRole } = useSynapse();

  // 1. Initial State Definitions
  const [originId, setOriginId] = useState<string>('SEC_104');
  const [destinationId, setDestinationId] = useState<string>('GATE_A');
  const [optimizedFor, setOptimizedFor] = useState<'SPEED' | 'ACCESSIBILITY' | 'LOW_CROWDS'>('SPEED');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<SynapseCoreRecommendation | null>(null);
  const [errorType, setErrorType] = useState<'NONE' | 'NO_ROUTE' | 'CLOSED_ROUTE' | 'MISSING_CONTEXT' | 'PROVIDER_FAILURE' | 'INVALID_RESPONSE'>('NONE');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // 2. Environment Simulator Parameters
  const [simulator, setSimulator] = useState<NavigationSimulatorState>({
    weatherCondition: 'CLEAR',
    matchMinute: 52,
    matchIntensity: 'NORMAL',
    elevatorsActive: true,
    crowdSurgeZone: 'NONE',
    emergencyLockdown: false,
  });

  // Compiled Current Location context state
  const currentLocation: LocationState = {
    sectorId: originId,
    name: STADIUM_NODES.find(n => n.id === originId)?.name || 'Sector 104 (West General)',
    latitude: STADIUM_NODES.find(n => n.id === originId)?.latitude || 25.3522,
    longitude: STADIUM_NODES.find(n => n.id === originId)?.longitude || 51.5311,
    localDensityScore: simulator.crowdSurgeZone === 'ZONE_C' && originId === 'SEC_120' ? 0.85 : 0.22,
    queueTimeMin: simulator.crowdSurgeZone === 'GATE_B' && destinationId === 'GATE_B' ? 22 : 4,
  };

  // 3. Trigger Core Intel Loop Analysis
  const runNavigationAnalysis = async () => {
    setIsLoading(true);
    setRecommendation(null);
    setErrorType('NONE');
    setErrorDetails(null);

    try {
      const originNode = STADIUM_NODES.find((n) => n.id === originId);
      const destNode = STADIUM_NODES.find((n) => n.id === destinationId);

      if (!originNode || !destNode) {
        setErrorType('MISSING_CONTEXT');
        throw new Error('Spatial anchor nodes could not be resolved in the current workspace.');
      }

      // Check Closed Route simulation state
      if (simulator.emergencyLockdown && (originId === 'SEC_120' || destinationId === 'GATE_C')) {
        setErrorType('CLOSED_ROUTE');
        throw new Error(`Critical Lockdown Override: South Quadrant Egress Route is fully closed by safety commanders.`);
      }

      // Compile cognitive prompt query for SynapseCore
      const queryText = `Calculate smart navigation route from origin node "${originNode.name}" (ID: ${originId}) to destination node "${destNode.name}" (ID: ${destinationId}) optimizing specifically for "${optimizedFor}". Current weather is ${simulator.weatherCondition}. Match time is minute ${simulator.matchMinute}. Elevator service is ${simulator.elevatorsActive ? 'FULLY ACTIVE' : 'OUTAGE'}. Active surge zones: ${simulator.crowdSurgeZone}.`;

      console.log('[SmartNavigationAgent] Consulting Synapse Core Intelligence...', queryText);

      const userId = user?.uid || 'temp-spectator-888';
      const synapseResult = await synapseCore.getRecommendation(
        queryText,
        {
          userId,
          activeRole,
          location: {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            sectorId: currentLocation.sectorId,
          }
        },
        {
          timeoutMs: 6000,
          requiresAccessibility: optimizedFor === 'ACCESSIBILITY' || !simulator.elevatorsActive,
          destinationName: destNode.name,
          originName: originNode.name,
        }
      );

      // Analyze response for validity
      if (!synapseResult || !synapseResult.recommendation) {
        setErrorType('INVALID_RESPONSE');
        throw new Error('Synapse Core response text is null or missing expected structure.');
      }

      setRecommendation(synapseResult);

    } catch (err: any) {
      console.error('[SmartNavigationAgent] Recommendation error:', err);
      setErrorDetails(err.message || 'An unknown server exception occurred.');
      
      // If we didn't already explicitly set an error type, default to Provider failure
      if (errorType === 'NONE') {
        setErrorType('PROVIDER_FAILURE');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Run on initial load
  useEffect(() => {
    runNavigationAnalysis();
  }, [originId, destinationId, optimizedFor, simulator.elevatorsActive, simulator.weatherCondition, simulator.crowdSurgeZone, simulator.emergencyLockdown]);

  return (
    <div className="space-y-6" id="smart-navigation-agent-container">
      {/* Overview Intro Banner */}
      <Card className="bg-slate-900/40 border border-slate-800/80 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-slate-100 tracking-tight font-sans uppercase flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-400" />
            <span>Smart Cognitive Wayfinding Agent</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            This module represents the first complete AI decision intelligence suite. Instead of recommending the shortest option, the agent continuously computes crowd density, elevators, emergency zones, and match times to formulate the smartest path.
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <div className="bg-slate-950/60 border border-slate-900 px-3 py-1.5 rounded-lg text-right text-[10px] font-mono text-slate-400">
            <span>MODEL: <strong>GEMINI-3.5-FLASH</strong></span>
          </div>
        </div>
      </Card>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Side: Parameters and Sensors */}
        <div className="space-y-6 xl:col-span-1">
          <LocationCard 
            location={currentLocation} 
            matchMinute={simulator.matchMinute} 
          />
          <SelectorPanel 
            originId={originId}
            setOriginId={setOriginId}
            destinationId={destinationId}
            setDestinationId={setDestinationId}
            optimizedFor={optimizedFor}
            setOptimizedFor={setOptimizedFor}
            simulator={simulator}
            setSimulator={setSimulator}
            onRunAnalysis={runNavigationAnalysis}
            isLoading={isLoading}
          />
        </div>

        {/* Right Side: Recommendation, Waypoints, and Metrics */}
        <div className="xl:col-span-2 space-y-6">
          {isLoading ? (
            <Card className="p-16 border border-slate-800/60 bg-slate-900/20 flex flex-col items-center justify-center space-y-4">
              <div className="relative flex h-12 w-12 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-8 w-8 bg-blue-500 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-slate-100 animate-pulse" />
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 text-center animate-pulse tracking-widest uppercase">
                COMMUNICATING WITH SYNAPSE CORE INTEL LOOP...
              </p>
            </Card>
          ) : errorType !== 'NONE' ? (
            /* Error Display Component with backup directives */
            <Card className="border border-red-900/50 bg-red-950/15 p-6 space-y-4">
              <div className="flex items-start space-x-3 text-red-400">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold uppercase font-sans tracking-wide">
                    Wayfinding Exception: {errorType.replace(/_/g, ' ')}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {errorDetails || 'The requested route calculation could not be processed safely.'}
                  </p>
                </div>
              </div>

              {/* Actionable offline fallback recommendations */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 space-y-2.5">
                <h5 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-extrabold">
                  Offline Steward Directive Backup
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Due to the active obstruction, Synapse Core recommends:
                </p>
                <ul className="text-xs text-slate-400 list-disc pl-5 space-y-1">
                  <li>Follow standard green exit corridor lighting markers in Sector {originId}.</li>
                  <li>Do NOT attempt to transit through Sector 120 or South Gate C.</li>
                  <li>Contact nearest steward/stadium marshal for ADA assistance lifts.</li>
                </ul>
              </div>
            </Card>
          ) : recommendation ? (
            /* Standard Recommendation Card */
            <div className="space-y-6">
              <RecommendationCard recommendation={recommendation} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RouteVisualizer 
                  originId={originId} 
                  destinationId={destinationId} 
                  accessibilityFriendly={optimizedFor === 'ACCESSIBILITY' || simulator.elevatorsActive}
                  crowdDensityScore={currentLocation.localDensityScore}
                />
                <MetricsPanel 
                  simulator={simulator} 
                  densityScore={currentLocation.localDensityScore}
                />
              </div>
            </div>
          ) : (
            <Card className="p-16 border border-slate-800/40 bg-slate-900/10 text-center text-xs text-slate-500 font-mono">
              Please specify origin and destination to retrieve intelligent routing data.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
