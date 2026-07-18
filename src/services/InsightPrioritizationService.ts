/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgentInsight } from './RecommendationAggregator';
import { ProactiveNotification } from '../types/proactiveNotification';
import { SynapseFullContext } from '../ai/orchestrator/ContextBuilder';

export interface PrioritizedRecommendation {
  id: string;
  source: string; // e.g. "Emergency Response Agent", "Crowd Intelligence Agent", etc.
  title: string;
  summary: string;
  reasoning: string; // Explanation of WHY this recommendation exists
  recommendedAction: string;
  confidence: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impactBenefit: string;
  status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED' | 'CRITICAL';
  affectedArea: string;
}

export interface PredictedRisk {
  id: string;
  hazard: string;
  probability: number; // 0 to 1
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  timeHorizonMinutes: number; // e.g., 15 mins, 30 mins
  description: string;
  triggerCondition: string;
  mitigationStrategy: string;
}

export class InsightPrioritizationService {
  /**
   * Translates aggregated agent insights and active notifications into a unified list of prioritized,
   * deduplicated recommendation objects.
   */
  public prioritizeInsights(
    insights: Record<string, AgentInsight>,
    notifications: ProactiveNotification[]
  ): PrioritizedRecommendation[] {
    const list: PrioritizedRecommendation[] = [];

    // 1. Process Aggregated Insights first
    Object.entries(insights).forEach(([agentName, insight], index) => {
      // Don't push OPTIMAL insights as action-needed recommendations to keep feed clean
      if (insight.status === 'OPTIMAL') return;

      let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      let impactBenefit = 'Improves general spectator satisfaction.';

      if (insight.status === 'CRITICAL') {
        priority = 'CRITICAL';
        impactBenefit = 'Averts safety hazard, secures immediate crowd protection.';
      } else if (insight.status === 'CONGESTED') {
        priority = 'HIGH';
        impactBenefit = 'Reduces localized dwell times and improves pedestrian routing flow.';
      } else if (insight.status === 'MODERATE') {
        priority = 'MEDIUM';
        impactBenefit = 'Rebalances facility utilization levels before peak thresholds.';
      }

      list.push({
        id: `prioritized-insight-${index}-${Date.now()}`,
        source: agentName,
        title: `${agentName.replace(' Agent', '')} Alert: ${insight.status}`,
        summary: insight.insightSummary,
        reasoning: this.explainWhy(agentName, insight),
        recommendedAction: insight.recommendedAction,
        confidence: insight.confidence,
        priority,
        impactBenefit,
        status: insight.status,
        affectedArea: this.extractAreaFromSummary(insight.insightSummary) || 'Stadium Concourse',
      });
    });

    // 2. Process Proactive Notifications and merge without duplicates
    notifications.forEach((notif) => {
      // Check if there is an existing item from the same agent/source addressing the same area
      const isDuplicate = list.some(item => {
        const sameSource = this.mapNotificationTypeToAgent(notif.type) === item.source;
        const sameArea = item.affectedArea.toLowerCase() === (notif.affectedZone || '').toLowerCase();
        return sameSource && sameArea;
      });

      if (isDuplicate) return; // Deduplicated!

      list.push({
        id: notif.id,
        source: this.mapNotificationTypeToAgent(notif.type),
        title: notif.title,
        summary: notif.summary,
        reasoning: notif.reason || 'Telemetry parameters triggered threshold limit deviations.',
        recommendedAction: notif.recommendation,
        confidence: notif.confidenceScore || 0.85,
        priority: notif.priority as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
        impactBenefit: notif.estimatedBenefit || 'Minimizes friction across event systems.',
        status: notif.priority === 'CRITICAL' ? 'CRITICAL' : notif.priority === 'HIGH' ? 'CONGESTED' : 'MODERATE',
        affectedArea: notif.affectedZone || 'Stadium Perimeter',
      });
    });

    // Sort by priority weight and confidence score
    return list.sort((a, b) => {
      const weightA = this.getPriorityWeight(a.priority) * 10 + a.confidence;
      const weightB = this.getPriorityWeight(b.priority) * 10 + b.confidence;
      return weightB - weightA; // Descending
    });
  }

  /**
   * Forecasts upcoming operational risks based on current trends and stadium parameters.
   */
  public predictOperationalRisks(context: SynapseFullContext): PredictedRisk[] {
    const risks: PredictedRisk[] = [];
    const crowdData = context.crowdAnalysis || [];
    const foodCourts = context.foodCourts || [];
    const parking = context.parkingZones || [];
    const match = context.activeMatch;

    // Risk 1: Egress Crowd Convergence during Match Final Phase
    if (match && match.status === 'LIVE' && match.currentMinute > 75) {
      risks.push({
        id: 'risk-egress-surge',
        hazard: 'Mass Concourse Egress Convergence',
        probability: 0.94,
        impact: 'HIGH',
        timeHorizonMinutes: 90 - match.currentMinute + 5,
        description: `Imminent full-stadium egress of ${crowdData.reduce((acc, curr) => acc + curr.occupancyPercent, 0) / (crowdData.length || 1) > 80 ? '80,000+' : 'spectators'} in the next ${90 - match.currentMinute} minutes. Sector exit corridors will hit peak pressure.`,
        triggerCondition: 'Full-time match whistle coinciding with cold evening temperatures.',
        mitigationStrategy: 'Enable double-door gate releases at Gates A-D and preemptively run shuttle buses on 3-minute loops.'
      });
    }

    // Risk 2: Restroom & Food Court Queue Spike at Half-Time
    if (match && match.status === 'LIVE' && match.currentMinute >= 38 && match.currentMinute <= 45) {
      risks.push({
        id: 'risk-halftime-spike',
        hazard: 'Concourse Queue Overload',
        probability: 0.88,
        impact: 'MEDIUM',
        timeHorizonMinutes: 45 - match.currentMinute + 1,
        description: 'Half-time surge. Up to 35% of match audience will converge on food concessions and restrooms simultaneously.',
        triggerCondition: 'First-half concluding. Fans leaving seats in waves.',
        mitigationStrategy: 'Push mobile food coupons for post-match pickup and deploy volunteer squads to direct lines.'
      });
    }

    // Risk 3: Parking Gridlock on Egress
    const highlyOccupiedParking = parking.filter(p => (p.currentOccupiedCount / p.totalCapacity) > 0.85);
    if (highlyOccupiedParking.length > 0 && match && match.status === 'LIVE' && match.currentMinute > 80) {
      risks.push({
        id: 'risk-parking-gridlock',
        hazard: 'Outer Parking Area Gridlock',
        probability: 0.85,
        impact: 'HIGH',
        timeHorizonMinutes: 15,
        description: `Highly saturated parking lots (${highlyOccupiedParking.map(p => p.name).join(', ')}) will attempt to unload vehicles simultaneously, creating local perimeter congestion.`,
        triggerCondition: 'High vehicle volume attempting merge into single arterial avenue.',
        mitigationStrategy: 'Manually override perimeter traffic lights to green-priority and dispatch parking guides to regulate outbound lanes.'
      });
    }

    // Risk 4: Concession Inventory Stockout
    const inventoryFailing = foodCourts.filter(f => f.queue.currentLength > 12);
    if (inventoryFailing.length >= 2) {
      risks.push({
        id: 'risk-stockout-alert',
        hazard: 'Kiosk Resource Squeeze',
        probability: 0.72,
        impact: 'MEDIUM',
        timeHorizonMinutes: 20,
        description: `Severe transaction strain at hot food points. Demand surge is pacing ahead of replenishment shifts in surrounding Sectors.`,
        triggerCondition: 'Extended queue holding averages above 15 patrons for consecutive 10-minute intervals.',
        mitigationStrategy: 'Redirect staff squads from inactive VIP lounges to back-supply hot items to high-demand concessions.'
      });
    }

    return risks;
  }

  private getPriorityWeight(priority: string): number {
    switch (priority) {
      case 'CRITICAL': return 4;
      case 'HIGH': return 3;
      case 'MEDIUM': return 2;
      case 'LOW': return 1;
      default: return 0;
    }
  }

  private mapNotificationTypeToAgent(type: string): string {
    switch (type) {
      case 'EMERGENCY_ALERT':
      case 'MEDICAL_ALERT':
      case 'SECURITY_ALERT':
        return 'Emergency Response Agent';
      case 'CROWD_WARNING':
        return 'Crowd Intelligence Agent';
      case 'FOOD_COURT_SUGGESTION':
      case 'QUEUE_REDUCTION_SUGGESTION':
        return 'Food Recommendation Agent';
      case 'ACCESSIBILITY_ALERT':
        return 'Accessibility Intelligence Agent';
      case 'PARKING_UPDATE':
      case 'ALTERNATIVE_ROUTE':
        return 'Smart Navigation Agent';
      default:
        return 'Operations Intelligence Agent';
    }
  }

  private explainWhy(agentName: string, insight: AgentInsight): string {
    switch (agentName) {
      case 'Emergency Response Agent':
        return 'Critical reports require active dispatcher resources and immediate bypass route creation.';
      case 'Crowd Intelligence Agent':
        return 'Localized camera sensors registers pedestrian choke points that exceed physical density guidelines.';
      case 'Food Recommendation Agent':
        return 'Transaction logs indicate heavy friction at the main concession hubs while parallel outlets are empty.';
      case 'Accessibility Intelligence Agent':
        return 'Wheelchair and stroller transit depends on uninterrupted mechanical step-free operations.';
      case 'Smart Navigation Agent':
        return 'High transit density compromises inbound safety parameters and escalates vehicular waiting queues.';
      default:
        return 'Standard system performance parameters are monitored for continuous load balancing.';
    }
  }

  private extractAreaFromSummary(summary: string): string | null {
    const sectorMatch = summary.match(/Sector\s+(\w+\d*|\d+)/i);
    if (sectorMatch) return sectorMatch[0];
    
    const lotMatch = summary.match(/Lot\s+(\w+)/i);
    if (lotMatch) return lotMatch[0];

    const zoneMatch = summary.match(/Zone\s+(\w+\d*|\d+)/i);
    if (zoneMatch) return zoneMatch[0];

    return null;
  }
}
