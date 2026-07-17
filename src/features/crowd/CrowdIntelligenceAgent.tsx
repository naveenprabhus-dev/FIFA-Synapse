/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSynapse } from '../../contexts/SynapseContext';
import { UserRole } from '../../types/user';
import { synapseCore } from '../../services/di';
import { SectorTelemetry, GateTelemetry, CrowdAlert, CrowdPredictionItem, CrowdRecommendation, SimulationParams } from './types';
import { STADIUM_SECTORS, STADIUM_GATES, INITIAL_ALERTS, MOCK_TIMELINE_PREDICTIONS } from './constants';
import { CongestionCards } from './components/CongestionCards';
import { CrowdHeatmap } from './components/CrowdHeatmap';
import { SectionStatusCards } from './components/SectionStatusCards';
import { QueueForecast } from './components/QueueForecast';
import { CrowdAlerts } from './components/CrowdAlerts';
import { PredictionTimeline } from './components/PredictionTimeline';
import { RecommendationsPanel } from './components/RecommendationsPanel';
import { TrendGraph } from './components/TrendGraph';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { 
  Users, Sliders, AlertTriangle, CloudSun, ShieldCheck, Gamepad2, Info
} from 'lucide-react';

export function CrowdIntelligenceAgent() {
  const { userProfile } = useSynapse();
  const userId = userProfile?.uid || 'demo_user_123';
  const role = userProfile?.role || UserRole.ORGANIZER;

  // 1. Core State
  const [sectors, setSectors] = useState<SectorTelemetry[]>(STADIUM_SECTORS);
  const [gates, setGates] = useState<GateTelemetry[]>(STADIUM_GATES);
  const [alerts, setAlerts] = useState<CrowdAlert[]>(INITIAL_ALERTS);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>('SEC_A');
  const [recommendation, setRecommendation] = useState<CrowdRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // 2. Simulation variables
  const [simulationParams, setSimulationParams] = useState<SimulationParams>({
    matchMinute: 52,
    matchImportance: 'HIGH',
    weather: 'CLEAR',
    escalatorOutage: false,
    hasEmergencyAlert: false,
  });

  // 3. Update local simulation metrics dynamically
  useEffect(() => {
    // Dynamically adjust sectors based on simulation parameters
    setSectors((prevSectors) =>
      prevSectors.map((sec) => {
        let occ = sec.occupancyPercent;
        let flow = sec.flowRatePerMin;
        let speed = sec.walkingSpeedMs;
        let esc = sec.escalatorStatus;
        let status = sec.status;

        // Apply escalator outage
        if (simulationParams.escalatorOutage && sec.id === 'SEC_C') {
          esc = 'OUT_OF_SERVICE';
          occ = Math.min(100, occ + 10);
          flow = Math.max(0, flow - 35);
          speed = Math.max(0.4, speed - 0.3);
        } else if (!simulationParams.escalatorOutage && sec.id === 'SEC_C') {
          esc = 'OPERATIONAL';
        }

        // Apply emergency alert impact
        if (simulationParams.hasEmergencyAlert) {
          occ = Math.min(100, occ + 8);
          flow = Math.min(300, flow + 40);
          speed = Math.max(0.5, speed - 0.2);
        }

        // Halftime logic (around minute 45-50) or post-match egress (minute 90+)
        if (simulationParams.matchMinute >= 40 && simulationParams.matchMinute <= 55) {
          if (sec.id === 'SEC_A') {
            occ = Math.min(100, occ + 5);
            flow = Math.min(250, flow + 20);
          }
        } else if (simulationParams.matchMinute >= 85) {
          occ = Math.min(100, occ + 12);
          flow = Math.min(300, flow + 55);
          speed = Math.max(0.6, speed - 0.15);
        }

        // Determine status
        if (occ >= 80 || esc === 'OUT_OF_SERVICE') {
          status = 'CRITICAL';
        } else if (occ >= 65) {
          status = 'CONGESTED';
        } else if (occ >= 45) {
          status = 'MODERATE';
        } else {
          status = 'OPTIMAL';
        }

        return {
          ...sec,
          occupancyPercent: Math.round(occ),
          flowRatePerMin: Math.round(flow),
          walkingSpeedMs: Number(speed.toFixed(2)),
          escalatorStatus: esc,
          status,
        };
      })
    );

    // Dynamically adjust gates queue based on simulation variables
    setGates((prevGates) =>
      prevGates.map((g) => {
        let q = g.currentQueueLength;
        if (simulationParams.matchMinute >= 85) {
          q = Math.round(q * 1.5);
        } else if (simulationParams.matchMinute >= 40 && simulationParams.matchMinute <= 55) {
          q = Math.round(q * 1.2);
        }
        const wait = q / g.processingRatePerMin;
        return {
          ...g,
          currentQueueLength: q,
          predictedWaitTimeMins: Number(wait.toFixed(1)),
        };
      })
    );
  }, [simulationParams]);

  // 4. Invoke SynapseCore Recommendation
  const fetchCrowdRecommendation = useCallback(async () => {
    setIsLoading(true);
    setErrorText(null);

    // Format simulation telemetry for prompt feeding
    const telemetryString = sectors
      .map(s => `Sector ${s.id}: occupancy ${s.occupancyPercent}%, flow ${s.flowRatePerMin}/min, status ${s.status}, escalators ${s.escalatorStatus}`)
      .join('\n');

    const gatesString = gates
      .map(g => `Gate ${g.id}: queue length ${g.currentQueueLength}, rate ${g.processingRatePerMin}/min, exit allowed: ${g.isExitAllowed}`)
      .join('\n');

    const promptQuery = `
      Perform professional crowd control audit.
      Stadium Telemetry:
      ${telemetryString}
      Gate Telemetry:
      ${gatesString}
      Match State: Minute ${simulationParams.matchMinute}, Intensity ${simulationParams.matchImportance}, Weather ${simulationParams.weather}
      Escalator Outage: ${simulationParams.escalatorOutage ? 'ACTIVE IN SECTOR C' : 'NONE'}
      Emergency Alarm status: ${simulationParams.hasEmergencyAlert ? 'CRITICAL STAMPEDE DANGER' : 'NOMINAL'}
    `;

    try {
      // Direct call through SynapseCore (No direct LLM calls in component)
      const res = await synapseCore.getRecommendation(
        promptQuery,
        {
          userId,
          activeRole: role,
          location: { latitude: 25.3522, longitude: 51.5311, sectorId: selectedSectorId || 'SEC_A' }
        },
        {
          timeoutMs: 6000,
        }
      );

      // Map the SynapseCoreRecommendation model back to CrowdRecommendation schema exactly
      setRecommendation({
        id: res.id,
        summary: res.title || 'Dynamic Spectator Routing Intervention',
        affectedArea: selectedSectorId === 'SEC_A' ? 'Sector A (West Stand)' : selectedSectorId === 'SEC_B' ? 'Sector B (East Stand)' : selectedSectorId === 'SEC_C' ? 'Sector C (North Stand)' : 'Sector D (South Stand)',
        severity: (res.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') || 'LOW',
        confidence: res.confidenceScore ?? 0.90,
        reason: res.reason || 'Saturating flow reported near major concession outlets.',
        suggestedAction: res.suggestedAction || 'Point steward guides toward auxiliary exits.',
        expectedImpact: res.estimatedBenefit || 'Reduces concourse congestion density by 15%.',
        timestamp: new Date().toLocaleTimeString(),
        steps: res.reasoningDetails || ['Analyze local sensory telemetry', 'Perform flowrate balance compute', 'Reroute incoming targets'],
        alternative: res.alternative,
      });

    } catch (err) {
      console.error('[CrowdAgent] Error conducting Synapse consult:', err);
      setErrorText(err instanceof Error ? err.message : 'Timeout during secure cognitive proxy loop.');
    } finally {
      setIsLoading(false);
    }
  }, [sectors, gates, simulationParams, userId, role, selectedSectorId]);

  // Trigger automatically on mount
  useEffect(() => {
    fetchCrowdRecommendation();
  }, []);

  // 5. Actions
  const handleResolveAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleUpdateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
    setSimulationParams((prev) => ({ ...prev, [key]: value }));
  };

  const triggerMockCongestionCrisis = () => {
    setSimulationParams({
      matchMinute: 92,
      matchImportance: 'DERBY',
      weather: 'EXTREME_HEAT',
      escalatorOutage: true,
      hasEmergencyAlert: true,
    });
    // Add critical emergency alert
    const newAlert: CrowdAlert = {
      id: `alert-${Date.now()}`,
      title: 'Structural Crowd Flow Bottleneck',
      location: 'Sector C North Exit Bottleneck',
      severity: 'CRITICAL',
      description: 'Halftime egress block triggered by active escalators shut-down. Crowd backing up over 200m; immediate dispatcher action required.',
      timestamp: new Date().toLocaleTimeString(),
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Controls Dashboard Card */}
      <Card className="p-6 bg-slate-900/30 border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-slate-200 tracking-tight flex items-center gap-2 font-sans uppercase">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>STADIUM ENVIRONMENT SIMULATOR</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-sans">
              Inject real-time stress test parameters to analyze the Crowd Intelligence Agent's response.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={triggerMockCongestionCrisis}
              className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold font-mono text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/10 transition-all cursor-pointer"
              aria-label="Simulate Crowd Congestion Crisis"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>SIMULATE CRISIS</span>
            </button>
            <button
              onClick={() => {
                setSimulationParams({
                  matchMinute: 15,
                  matchImportance: 'NORMAL',
                  weather: 'CLEAR',
                  escalatorOutage: false,
                  hasEmergencyAlert: false,
                });
                setAlerts(INITIAL_ALERTS);
              }}
              className="px-3 py-1.5 text-[10px] font-bold font-mono text-slate-400 hover:text-slate-300 bg-slate-950/60 border border-slate-900 rounded-xl transition-all cursor-pointer"
              aria-label="Reset simulation parameters"
            >
              RESET
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-900/40">
          <div className="space-y-2">
            <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block" htmlFor="match-minute-range">
              Elapsed Match Minute ({simulationParams.matchMinute}')
            </label>
            <div className="flex items-center gap-2">
              <input
                id="match-minute-range"
                type="range"
                min="0"
                max="120"
                value={simulationParams.matchMinute}
                onChange={(e) => handleUpdateParam('matchMinute', Number(e.target.value))}
                className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Match Importance
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(['NORMAL', 'HIGH', 'DERBY'] as const).map((imp) => (
                <button
                  key={imp}
                  onClick={() => handleUpdateParam('matchImportance', imp)}
                  className={`px-2 py-1 text-[8px] font-bold font-mono rounded-lg border transition-all cursor-pointer ${
                    simulationParams.matchImportance === imp
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-300'
                  }`}
                  aria-label={`Set Match Importance to ${imp}`}
                >
                  {imp}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Concourse Escalators Outage
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleUpdateParam('escalatorOutage', false)}
                className={`px-2 py-1 text-[8px] font-bold font-mono rounded-lg border transition-all cursor-pointer ${
                  !simulationParams.escalatorOutage
                    ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-300'
                }`}
                aria-label="No escalator outages"
              >
                NOMINAL (OK)
              </button>
              <button
                onClick={() => handleUpdateParam('escalatorOutage', true)}
                className={`px-2 py-1 text-[8px] font-bold font-mono rounded-lg border transition-all cursor-pointer ${
                  simulationParams.escalatorOutage
                    ? 'bg-red-600/20 border-red-500/40 text-red-300 animate-pulse'
                    : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-300'
                }`}
                aria-label="Trigger escalator outage"
              >
                OUTAGE (ERR)
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Emergency Safety Alert
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleUpdateParam('hasEmergencyAlert', false)}
                className={`px-2 py-1 text-[8px] font-bold font-mono rounded-lg border transition-all cursor-pointer ${
                  !simulationParams.hasEmergencyAlert
                    ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-300'
                }`}
                aria-label="No emergency alert active"
              >
                NOMINAL
              </button>
              <button
                onClick={() => handleUpdateParam('hasEmergencyAlert', true)}
                className={`px-2 py-1 text-[8px] font-bold font-mono rounded-lg border transition-all cursor-pointer ${
                  simulationParams.hasEmergencyAlert
                    ? 'bg-red-600/20 border-red-500/40 text-red-300 animate-pulse'
                    : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-300'
                }`}
                aria-label="Activate Emergency Safety Alert"
              >
                CRITICAL
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* High-Level Congestion Overview Badges */}
      <CongestionCards sectors={sectors} />

      {/* Interactive Heatmap & Section Status Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CrowdHeatmap
          sectors={sectors}
          selectedSectorId={selectedSectorId}
          onSelectSector={setSelectedSectorId}
        />
        <SectionStatusCards
          sectors={sectors}
          selectedSectorId={selectedSectorId}
          onSelectSector={setSelectedSectorId}
        />
      </div>

      {/* Main AI Dispatch Panel & Graphs */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <RecommendationsPanel
            recommendation={recommendation}
            isLoading={isLoading}
            onRefreshAi={fetchCrowdRecommendation}
            errorText={errorText}
          />
          <TrendGraph />
        </div>

        {/* Sidebar Alerts, Forecasts & Timelines */}
        <div className="space-y-6">
          <CrowdAlerts
            alerts={alerts}
            onResolveAlert={handleResolveAlert}
          />
          <QueueForecast gates={gates} />
          <PredictionTimeline predictions={MOCK_TIMELINE_PREDICTIONS} />
        </div>
      </div>
    </div>
  );
}
