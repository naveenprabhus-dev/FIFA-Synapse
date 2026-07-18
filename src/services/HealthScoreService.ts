/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseFullContext } from '../ai/orchestrator/ContextBuilder';

export interface SubsystemHealth {
  score: number;
  status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED' | 'CRITICAL';
  description: string;
}

export interface StadiumHealth {
  overallScore: number;
  status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED' | 'CRITICAL';
  security: SubsystemHealth;
  crowd: SubsystemHealth;
  concessions: SubsystemHealth;
  accessibility: SubsystemHealth;
  transport: SubsystemHealth;
}

export class HealthScoreService {
  /**
   * Calculates a complete, multi-dimensional health report of the stadium.
   */
  public calculateHealth(context: SynapseFullContext): StadiumHealth {
    const security = this.calculateSecurityHealth(context);
    const crowd = this.calculateCrowdHealth(context);
    const concessions = this.calculateConcessionsHealth(context);
    const accessibility = this.calculateAccessibilityHealth(context);
    const transport = this.calculateTransportHealth(context);

    // Weighted average to calculate overall stadium health score
    // Security and Crowd are prioritized higher for crowd-safety and event operations
    const overallScore = Math.round(
      security.score * 0.30 +
      crowd.score * 0.25 +
      concessions.score * 0.15 +
      accessibility.score * 0.15 +
      transport.score * 0.15
    );

    let status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED' | 'CRITICAL' = 'OPTIMAL';
    if (overallScore < 60 || security.status === 'CRITICAL' || crowd.status === 'CRITICAL') {
      status = 'CRITICAL';
    } else if (overallScore < 80 || security.status === 'MODERATE' || crowd.status === 'MODERATE') {
      status = 'MODERATE';
    } else if (overallScore < 90) {
      status = 'MODERATE';
    }

    return {
      overallScore: Math.max(0, Math.min(100, overallScore)),
      status,
      security,
      crowd,
      concessions,
      accessibility,
      transport
    };
  }

  private calculateSecurityHealth(context: SynapseFullContext): SubsystemHealth {
    let score = 100;
    const incidents = context.activeIncidents || [];
    
    // Filter security or medical incidents
    const criticalIncidents = incidents.filter(i => 
      i.severity === 'CRITICAL' || 
      i.category === 'SECURITY_BREACH' || 
      i.category === 'MEDICAL_EMERGENCY'
    );
    const moderateIncidents = incidents.filter(i => 
      (i.severity === 'HIGH' || i.severity === 'MEDIUM') && 
      i.category !== 'SECURITY_BREACH' && 
      i.category !== 'MEDICAL_EMERGENCY'
    );
    const lowIncidents = incidents.filter(i => i.severity === 'LOW');

    score -= criticalIncidents.length * 35;
    score -= moderateIncidents.length * 12;
    score -= lowIncidents.length * 4;

    score = Math.max(0, Math.min(100, score));

    let status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED' | 'CRITICAL' = 'OPTIMAL';
    let description = 'Security perimeter secure. No major incident flags.';

    if (criticalIncidents.length > 0) {
      status = 'CRITICAL';
      description = `Critical alert: ${criticalIncidents.length} active emergency dispatch${criticalIncidents.length > 1 ? 's' : ''} in progress.`;
    } else if (moderateIncidents.length > 0) {
      status = 'MODERATE';
      description = `Moderate operational incidents (${moderateIncidents.length}) under active monitoring.`;
    } else if (lowIncidents.length > 0) {
      status = 'OPTIMAL';
      description = `Minor low-level incidents reporting. Service levels unaffected.`;
    }

    return { score, status, description };
  }

  private calculateCrowdHealth(context: SynapseFullContext): SubsystemHealth {
    let score = 100;
    const crowdData = context.crowdAnalysis || [];
    
    if (crowdData.length === 0) {
      return {
        score: 100,
        status: 'OPTIMAL',
        description: 'Slight crowd density. Pedestrian flows operating under standard safety bounds.'
      };
    }

    const criticalSectors = crowdData.filter(c => c.occupancyPercent >= 90 || c.status === 'CRITICAL');
    const congestedSectors = crowdData.filter(c => (c.occupancyPercent >= 75 && c.occupancyPercent < 90) || c.status === 'CONGESTED');
    const moderateSectors = crowdData.filter(c => c.occupancyPercent >= 50 && c.occupancyPercent < 75);

    score -= criticalSectors.length * 20;
    score -= congestedSectors.length * 10;
    score -= moderateSectors.length * 2;

    score = Math.max(0, Math.min(100, score));

    let status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED' | 'CRITICAL' = 'OPTIMAL';
    let description = 'Egress pathways and spectator stands operating under optimal density thresholds.';

    if (criticalSectors.length > 0) {
      status = 'CRITICAL';
      description = `Severe congestion: ${criticalSectors.length} sector(s) exceeding 90% flow safety caps.`;
    } else if (congestedSectors.length > 0) {
      status = 'CONGESTED';
      description = `${congestedSectors.length} sector(s) reporting elevated crowd bottlenecks.`;
    } else if (moderateSectors.length > 0) {
      status = 'MODERATE';
      description = 'Moderate spectator flow density across mid-tier concourses.';
    }

    return { score, status, description };
  }

  private calculateConcessionsHealth(context: SynapseFullContext): SubsystemHealth {
    let score = 100;
    const foodCourts = context.foodCourts || [];

    if (foodCourts.length === 0) {
      return {
        score: 100,
        status: 'OPTIMAL',
        description: 'Concession sales reporting stable wait times.'
      };
    }

    const highlyCongested = foodCourts.filter(f => f.queue.currentLength > 15 || f.queue.estimatedWaitMinutes > 18);
    const moderatelyCongested = foodCourts.filter(f => f.queue.currentLength > 8 && f.queue.currentLength <= 15);
    const stockAlerts = foodCourts.filter(f => f.currentCapacityLoad >= f.capacityLimit * 0.9); // or inventory limit

    score -= highlyCongested.length * 15;
    score -= moderatelyCongested.length * 6;
    score -= stockAlerts.length * 8;

    score = Math.max(0, Math.min(100, score));

    let status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED' | 'CRITICAL' = 'OPTIMAL';
    let description = 'Average concession service transaction speeds under 5 minutes.';

    if (highlyCongested.length > 0) {
      status = 'CONGESTED';
      description = `Heavy wait times exceeding 18 mins at ${highlyCongested.length} major kiosk${highlyCongested.length > 1 ? 's' : ''}.`;
    } else if (moderatelyCongested.length > 0) {
      status = 'MODERATE';
      description = `Concession lines are moderately rising at ${moderatelyCongested.length} location${moderatelyCongested.length > 1 ? 's' : ''}.`;
    }

    return { score, status, description };
  }

  private calculateAccessibilityHealth(context: SynapseFullContext): SubsystemHealth {
    let score = 100;
    const incidents = context.activeIncidents || [];
    
    // Check for accessibility blockages
    const accessFailures = incidents.filter(i => 
      i.category === 'INFRASTRUCTURE_FAILURE' && 
      (i.description.toLowerCase().includes('elevator') || 
       i.description.toLowerCase().includes('ramp') || 
       i.description.toLowerCase().includes('wheelchair') || 
       i.description.toLowerCase().includes('accessibility'))
    );

    score -= accessFailures.length * 30;
    score = Math.max(0, Math.min(100, score));

    let status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED' | 'CRITICAL' = 'OPTIMAL';
    let description = 'Tactile walkways, ADA elevators, and entry ramp networks fully operational.';

    if (accessFailures.length > 0) {
      status = 'CRITICAL';
      description = `Mobility alert: ${accessFailures.length} active elevator/ramp structural outages registered.`;
    }

    return { score, status, description };
  }

  private calculateTransportHealth(context: SynapseFullContext): SubsystemHealth {
    let score = 100;
    const parking = context.parkingZones || [];

    if (parking.length === 0) {
      return {
        score: 100,
        status: 'OPTIMAL',
        description: 'Transit networks and parking plazas operating smoothly.'
      };
    }

    const fullLots = parking.filter(p => (p.totalCapacity - p.currentOccupiedCount) / p.totalCapacity < 0.10);
    const restrictedLots = parking.filter(p => (p.totalCapacity - p.currentOccupiedCount) / p.totalCapacity < 0.25 && (p.totalCapacity - p.currentOccupiedCount) / p.totalCapacity >= 0.10);

    score -= fullLots.length * 20;
    score -= restrictedLots.length * 8;

    score = Math.max(0, Math.min(100, score));

    let status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED' | 'CRITICAL' = 'OPTIMAL';
    let description = 'Shuttle transport buses and outer parking structures reporting high vacancy.';

    if (fullLots.length > 0) {
      status = 'CRITICAL';
      description = `Parking limits reached: Lot ${fullLots.map(l => l.name).join(', ')} is completely saturated.`;
    } else if (restrictedLots.length > 0) {
      status = 'MODERATE';
      description = `High parking grid volumes at auxiliary Lot ${restrictedLots.map(l => l.name).join(', ')}.`;
    }

    return { score, status, description };
  }
}
