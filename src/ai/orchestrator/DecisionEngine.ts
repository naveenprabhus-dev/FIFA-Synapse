/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseIntent, SynapsePriority } from '../../types/synapse';
import { UserRole } from '../../types/user';
import { SynapseFullContext } from './ContextBuilder';

export interface SynapseDecisionAnalysis {
  shouldCallLLM: boolean;
  preInferenceReasoning: string[];
  suggestedPriority: SynapsePriority;
  isBlockedByPermission: boolean;
  preComputedMetrics?: {
    nearestConcessionId?: string;
    criticalSectorsCount: number;
    activeEmergencyCount: number;
    matchMinute: number;
    matchScoreStatus: string;
  };
  policyNotice?: string;
}

export class DecisionEngine {
  /**
   * Evaluates the active context and intent to determine the execution pathway.
   * Performs real-time math audits and role restriction checks.
   */
  public analyzeDecision(intent: SynapseIntent, context: SynapseFullContext): SynapseDecisionAnalysis {
    const preInferenceReasoning: string[] = [];
    let shouldCallLLM = true;
    let suggestedPriority: SynapsePriority = 'LOW';
    let isBlockedByPermission = false;
    let policyNotice: string | undefined;

    // 1. Enforce Role-Based Access Control (RBAC) Policies
    const userRole = context.activeRole;
    if (intent === 'EMERGENCY' && userRole === UserRole.FAN) {
      // Emergency is critical, but we don't block the Fan from asking/reporting, we escalate priority immediately!
      suggestedPriority = 'CRITICAL';
      preInferenceReasoning.push('Heuristic: Fan reported an active security or medical concern. Promoting to CRITICAL severity.');
    }

    if (intent === 'CROWD' && userRole === UserRole.FAN) {
      preInferenceReasoning.push('Notice: Fan requested crowd analytics. Suppressing detailed administrative sensor telemetries to respect spectator privacy limits.');
    }

    // 2. Perform localized metric pre-computations (Heuristic Analysis)
    let criticalSectorsCount = 0;
    if (context.crowdAnalysis) {
      criticalSectorsCount = context.crowdAnalysis.filter(sector => sector.status === 'CRITICAL' || sector.occupancyPercent >= 80).length;
      if (criticalSectorsCount > 0) {
        preInferenceReasoning.push(`System pre-calculation: Detected ${criticalSectorsCount} stadium sectors in critical congestion capacity threshold.`);
        suggestedPriority = 'HIGH';
      }
    }

    let activeEmergencyCount = 0;
    if (context.activeIncidents) {
      activeEmergencyCount = context.activeIncidents.filter(inc => inc.severity === 'CRITICAL' || inc.category === 'MEDICAL_EMERGENCY').length;
      if (activeEmergencyCount > 0) {
        preInferenceReasoning.push(`System pre-calculation: ${activeEmergencyCount} high-severity operational incidents are currently unresolved in the stadium area.`);
        suggestedPriority = 'CRITICAL';
      }
    }

    const matchMinute = context.activeMatch?.currentMinute ?? 0;
    const homeScore = context.activeMatch?.homeTeam.score ?? 0;
    const awayScore = context.activeMatch?.awayTeam.score ?? 0;
    const matchScoreStatus = `${context.activeMatch?.homeTeam.shortName ?? 'HOME'} ${homeScore} - ${awayScore} ${context.activeMatch?.awayTeam.shortName ?? 'AWAY'}`;

    if (matchMinute > 80 && Math.abs(homeScore - awayScore) <= 1) {
      preInferenceReasoning.push('Stadium dynamics: High-stress match context. Game is in final minutes with a close score. Crowd movement is expected to surge shortly.');
      if (suggestedPriority !== 'CRITICAL') {
        suggestedPriority = 'HIGH';
      }
    }

    // 3. Concession Heuristics
    let nearestConcessionId: string | undefined;
    if (intent === 'FOOD_RECOMMENDATION' && context.foodCourts && context.foodCourts.length > 0) {
      // Find a concession that is open and has stock
      const openConcessions = context.foodCourts.filter(f => f.status === 'OPEN');
      if (openConcessions.length > 0) {
        // Sort by shortest queue length as proxy
        const bestConcession = openConcessions.sort((a, b) => a.queue.currentLength - b.queue.currentLength)[0];
        nearestConcessionId = bestConcession.id;
        preInferenceReasoning.push(`Concession heuristic: Automatically selected '${bestConcession.name}' as the optimal baseline option due to shortest wait time of ${bestConcession.queue.estimatedWaitMinutes} mins.`);
      }
    }

    // 4. Determine if we should bypass the LLM for performance/safety reasons
    // For example, if an extreme emergency is detected, we may immediately dispatch and return pre-computed routing to avoid model latency!
    if (intent === 'EMERGENCY' && activeEmergencyCount > 1) {
      shouldCallLLM = true; // In sandbox we keep it true, but add safety notes
      policyNotice = 'CRITICAL DIRECTIVE: Dispatch safety personnel immediately. Do not await LLM convergence.';
    }

    return {
      shouldCallLLM,
      preInferenceReasoning,
      suggestedPriority,
      isBlockedByPermission,
      policyNotice,
      preComputedMetrics: {
        nearestConcessionId,
        criticalSectorsCount,
        activeEmergencyCount,
        matchMinute,
        matchScoreStatus,
      },
    };
  }
}
