/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseFullContext } from '../ai/orchestrator/ContextBuilder';

export interface AgentInsight {
  agentName: string;
  status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED' | 'CRITICAL';
  insightSummary: string;
  recommendedAction: string;
  confidence: number;
}

export class RecommendationAggregator {
  /**
   * Collects insights and pre-analyzes signals from all existing AI domain models and active data streams.
   */
  public aggregateInsights(context: SynapseFullContext): Record<string, AgentInsight> {
    const insights: Record<string, AgentInsight> = {};

    // 1. Crowd Intelligence Agent Insights
    const crowdData = context.crowdAnalysis || [];
    const highDensitySector = crowdData.find(c => c.occupancyPercent >= 90);
    const modDensitySector = crowdData.find(c => c.occupancyPercent >= 75 && c.occupancyPercent < 90);
    
    if (highDensitySector) {
      insights['Crowd Intelligence Agent'] = {
        agentName: 'Crowd Intelligence Agent',
        status: 'CRITICAL',
        insightSummary: `Severe crowd congestion detected in Sector ${highDensitySector.sectorId} (${highDensitySector.occupancyPercent}% occupancy, ${highDensitySector.flowRatePerMin} patrons/min flow).`,
        recommendedAction: `Deploy physical diversion barriers and transition surrounding pedestrian corridors to one-way egress flow.`,
        confidence: 0.95,
      };
    } else if (modDensitySector) {
      insights['Crowd Intelligence Agent'] = {
        agentName: 'Crowd Intelligence Agent',
        status: 'MODERATE',
        insightSummary: `Moderate flow buildup in Sector ${modDensitySector.sectorId} (${modDensitySector.occupancyPercent}% occupancy).`,
        recommendedAction: `Advise incoming fans to use alternative access routes.`,
        confidence: 0.85,
      };
    } else {
      insights['Crowd Intelligence Agent'] = {
        agentName: 'Crowd Intelligence Agent',
        status: 'OPTIMAL',
        insightSummary: 'All sectors operating with fluid pedestrian flow rates and safe under-capacity boundaries.',
        recommendedAction: 'Maintain current crowd patrol patterns.',
        confidence: 0.90,
      };
    }

    // 2. Smart Navigation Agent Insights
    const parkingData = context.parkingZones || [];
    const lowParking = parkingData.find(p => (p.totalCapacity - p.currentOccupiedCount) / p.totalCapacity < 0.15);
    
    if (lowParking) {
      const availableCount = lowParking.totalCapacity - lowParking.currentOccupiedCount;
      insights['Smart Navigation Agent'] = {
        agentName: 'Smart Navigation Agent',
        status: 'CONGESTED',
        insightSummary: `Parking Zone ${lowParking.id} is reaching exhaustion limit (${availableCount} spaces remaining).`,
        recommendedAction: `Divert inbound vehicles to auxiliary Park-and-Ride facilities and guide users to local shuttle bays.`,
        confidence: 0.92,
      };
    } else {
      insights['Smart Navigation Agent'] = {
        agentName: 'Smart Navigation Agent',
        status: 'OPTIMAL',
        insightSummary: 'Egress routes and parking grids reporting normal flow throughput.',
        recommendedAction: 'Direct drivers to standard parking lots.',
        confidence: 0.88,
      };
    }

    // 3. Food Recommendation Agent Insights
    const foodCourts = context.foodCourts || [];
    const busyFood = foodCourts.find(f => f.queue.currentLength > 15);
    const quietFood = foodCourts.find(f => f.queue.currentLength <= 5);
    
    if (busyFood && quietFood) {
      insights['Food Recommendation Agent'] = {
        agentName: 'Food Recommendation Agent',
        status: 'CONGESTED',
        insightSummary: `Heavy wait-times at '${busyFood.name}' (${busyFood.queue.currentLength} in queue). '${quietFood.name}' is highly under-utilized.`,
        recommendedAction: `Promote '${quietFood.name}' to nearby fans with dynamic 15% discount incentives to rebalance demand.`,
        confidence: 0.89,
      };
    } else if (busyFood) {
      insights['Food Recommendation Agent'] = {
        agentName: 'Food Recommendation Agent',
        status: 'MODERATE',
        insightSummary: `Concession queue lines are climbing at ${busyFood.name}.`,
        recommendedAction: `Remind nearby fans of express mobile ordering options.`,
        confidence: 0.82,
      };
    } else {
      insights['Food Recommendation Agent'] = {
        agentName: 'Food Recommendation Agent',
        status: 'OPTIMAL',
        insightSummary: 'Concession service speed is optimal. Dynamic wait averages under 4 minutes across all food nodes.',
        recommendedAction: 'Keep current stock levels active.',
        confidence: 0.87,
      };
    }

    // 4. Emergency Response Agent Insights
    const activeIncidents = context.activeIncidents || [];
    const emergencyIncident = activeIncidents.find(i => i.severity === 'CRITICAL' || i.category === 'MEDICAL_EMERGENCY' || i.category === 'SECURITY_BREACH');
    
    if (emergencyIncident) {
      insights['Emergency Response Agent'] = {
        agentName: 'Emergency Response Agent',
        status: 'CRITICAL',
        insightSummary: `Active ${emergencyIncident.category} incident registered in ${emergencyIncident.locationName} (Severity: ${emergencyIncident.severity}).`,
        recommendedAction: `Dispatch local paramedic and supervisor teams to ${emergencyIncident.locationName} immediately and clear emergency lanes.`,
        confidence: 0.98,
      };
    } else if (activeIncidents.length > 0) {
      insights['Emergency Response Agent'] = {
        agentName: 'Emergency Response Agent',
        status: 'MODERATE',
        insightSummary: `${activeIncidents.length} active low-level incidents reporting.`,
        recommendedAction: `Assign volunteers to monitor incidents and update local sector command.`,
        confidence: 0.85,
      };
    } else {
      insights['Emergency Response Agent'] = {
        agentName: 'Emergency Response Agent',
        status: 'OPTIMAL',
        insightSummary: 'Zero unresolved safety hazards or emergency reports on the dashboard.',
        recommendedAction: 'Maintain baseline stadium patrol checks.',
        confidence: 0.95,
      };
    }

    // 5. Accessibility Intelligence Agent Insights
    // Check if elevator / ramp issues are indicated anywhere in incidents or descriptions
    const accessibilityIssue = activeIncidents.find(i => i.category === 'INFRASTRUCTURE_FAILURE' && (i.description.toLowerCase().includes('elevator') || i.description.toLowerCase().includes('ramp') || i.description.toLowerCase().includes('wheelchair') || i.description.toLowerCase().includes('accessibility')));
    
    if (accessibilityIssue) {
      insights['Accessibility Intelligence Agent'] = {
        agentName: 'Accessibility Intelligence Agent',
        status: 'CRITICAL',
        insightSummary: `Mobility blockage: ${accessibilityIssue.description} in ${accessibilityIssue.locationName}.`,
        recommendedAction: `Re-route step-free navigation coordinates to adjacent Ramp 4 and notify wheel-chair bound ticket holders.`,
        confidence: 0.94,
      };
    } else {
      insights['Accessibility Intelligence Agent'] = {
        agentName: 'Accessibility Intelligence Agent',
        status: 'OPTIMAL',
        insightSummary: 'All ADA elevators, tactile walkways, and mobility ramp systems are fully operational.',
        recommendedAction: 'Maintain standard visual indicators and staff support.',
        confidence: 0.90,
      };
    }

    // 6. Operations Intelligence Agent Insights
    const janitorialNeeded = activeIncidents.find(i => i.category === 'INFRASTRUCTURE_FAILURE' && i.description.toLowerCase().includes('clean'));
    
    if (janitorialNeeded) {
      insights['Operations Intelligence Agent'] = {
        agentName: 'Operations Intelligence Agent',
        status: 'MODERATE',
        insightSummary: `Sanitation backlog: ${janitorialNeeded.description} in ${janitorialNeeded.locationName}.`,
        recommendedAction: `Direct nearest sanitation crew to execute restroom refresh sweeps in Sector ${janitorialNeeded.locationName}.`,
        confidence: 0.88,
      };
    } else {
      insights['Operations Intelligence Agent'] = {
        agentName: 'Operations Intelligence Agent',
        status: 'OPTIMAL',
        insightSummary: 'All volunteers and venue staff shifts are balanced; cleaning sweeps are running on schedule.',
        recommendedAction: 'Enforce standard rotation frequencies.',
        confidence: 0.85,
      };
    }

    return insights;
  }
}
