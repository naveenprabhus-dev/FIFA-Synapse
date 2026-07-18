/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OperationalArea, OperationsContextOptions, OperationsRecommendation } from '../types/operations';
import { SynapsePriority } from '../types/synapse';

// ==========================================
// 1. Operations Analysis Service
// ==========================================
export class OperationsAnalysisService {
  public analyzeStadiumLoad(options: OperationsContextOptions): {
    stadiumStatus: string;
    globalPriority: SynapsePriority;
    bottlenecks: string[];
  } {
    const bottlenecks: string[] = [];
    let globalPriority: SynapsePriority = 'LOW';

    if (options.liveCrowdDensity > 85) {
      globalPriority = 'HIGH';
      bottlenecks.push(`Severe congestion detected in ${options.currentZone} (${options.liveCrowdDensity}% density)`);
    }

    if (options.queueLength > 150) {
      globalPriority = 'HIGH';
      bottlenecks.push(`Extreme wait queues at Gate Turnstiles (${options.queueLength} visitor backlog)`);
    }

    if (options.liveIncidentCount > 3) {
      globalPriority = 'CRITICAL';
      bottlenecks.push(`Multiple active incident logs (${options.liveIncidentCount} reported events)`);
    }

    if (options.cleaningStatus === 'CRITICAL') {
      if (globalPriority !== 'CRITICAL') globalPriority = 'MEDIUM';
      bottlenecks.push('Restroom sanitation and cleaning capacity breached in Sector concourses.');
    }

    if (options.gateStatus === 'CLOSED') {
      globalPriority = 'CRITICAL';
      bottlenecks.push(`Key access channel ${options.currentZone} Gate is currently CLOSED.`);
    }

    const stadiumStatus = bottlenecks.length > 0
      ? `ATTENTION: ${bottlenecks.length} active bottlenecks detected in stadium systems.`
      : 'All stadium systems functioning within optimal parameters.';

    return {
      stadiumStatus,
      globalPriority,
      bottlenecks,
    };
  }
}

// ==========================================
// 2. Deployment Recommendation Service
// ==========================================
export class DeploymentRecommendationService {
  public getStaffDeployment(
    area: OperationalArea,
    options: OperationsContextOptions
  ): {
    recommendation: string;
    requiredResources: string[];
    alternativeActions: string[];
    confidence: number;
  } {
    let recommendation = 'Maintain standard operational patrol routes.';
    let requiredResources: string[] = ['2 Concourse Stewards'];
    let alternativeActions: string[] = ['Issue automated wait-time alert via fan app.'];
    let confidence = 0.90;

    if (area === 'VOLUNTEER_DEPLOYMENT') {
      if (options.liveCrowdDensity > 75) {
        recommendation = `Redeploy 10 volunteers from low-congestion Sector 200 to ${options.currentZone} to facilitate active wayfinding guidance.`;
        requiredResources = ['10 Information Volunteers', '2 Concourse Supervisors'];
        alternativeActions = ['Activate dynamic LED guidance banners towards alternative exits.'];
        confidence = 0.88;
      } else {
        recommendation = 'Maintain baseline volunteer greeting layout at main plazas.';
        requiredResources = ['4 Information Volunteers'];
        alternativeActions = ['Pre-position staff near main Food Court concessions.'];
        confidence = 0.95;
      }
    } else if (area === 'SECURITY_DEPLOYMENT') {
      if (options.liveIncidentCount > 0 || options.liveCrowdDensity > 85) {
        recommendation = `Dispatch Security Response Unit Charlie to reinforce zone access gates at ${options.currentZone}.`;
        requiredResources = ['4 Security Officers', '1 Tactical Lead'];
        alternativeActions = ['Pre-emptively close Sector turnstiles to throttle inflow.'];
        confidence = 0.85;
      } else {
        recommendation = 'Keep security units in standard sector patrol configurations.';
        requiredResources = ['2 Patrol Officers'];
        alternativeActions = ['Standby alert for emergency response vehicle lanes.'];
        confidence = 0.94;
      }
    }

    return { recommendation, requiredResources, alternativeActions, confidence };
  }
}

// ==========================================
// 3. Queue Intelligence Service
// ==========================================
export class QueueIntelligenceService {
  public calculateQueueDirectives(options: OperationsContextOptions): {
    recommendation: string;
    estimatedImpact: string;
    confidence: number;
    alternative: string;
  } {
    let recommendation = 'Keep standard queue maze rails aligned.';
    let estimatedImpact = 'Maintains uniform flow rate through standard gate lines.';
    let confidence = 0.92;
    let alternative = 'Open auxiliary card-only fast passes.';

    if (options.queueLength > 100 || options.gateStatus === 'CONGESTED') {
      recommendation = `Divert incoming visitors from ${options.currentZone} to neighboring South Gate where queues are currently under 10 members.`;
      estimatedImpact = 'Reduces gate clearance time by approximately 12 minutes per visitor.';
      confidence = 0.87;
      alternative = 'Instruct volunteers to conduct manual pre-screening checks in queue rails.';
    }

    return { recommendation, estimatedImpact, confidence, alternative };
  }
}

// ==========================================
// 4. Resource Allocation Service
// ==========================================
export class ResourceAllocationService {
  public allocateResources(
    area: OperationalArea,
    options: OperationsContextOptions
  ): {
    recommendation: string;
    requiredResources: string[];
    confidence: number;
  } {
    let recommendation = 'All resource pipelines running with balanced buffers.';
    let requiredResources: string[] = [];
    let confidence = 0.95;

    if (area === 'MEDICAL_TEAM_COORDINATION') {
      if (options.liveIncidentCount > 0 && !options.medicalTeamAvailable) {
        recommendation = 'Immediate cross-deployment of Medical Response Cart 2 from Sector 110 to South Plaza Incident sector.';
        requiredResources = ['1 Paramedic Crew', '1 Emergency Cart'];
        confidence = 0.89;
      } else if (options.liveIncidentCount > 0 && options.medicalTeamAvailable) {
        recommendation = `Dispatch primary on-duty Medical Team Alpha to ${options.currentZone} reported incident node.`;
        requiredResources = ['2 Paramedics', '1 Mobile First-Aid Pack'];
        confidence = 0.94;
      } else {
        recommendation = 'Maintain Medical Units Alpha and Beta at main pitch-side field station.';
        requiredResources = ['2 Ready Medical Units'];
        confidence = 0.98;
      }
    }

    return { recommendation, requiredResources, confidence };
  }
}

// ==========================================
// 5. Maintenance Recommendation Service
// ==========================================
export class MaintenanceRecommendationService {
  public getMaintenanceActions(options: OperationsContextOptions): {
    recommendation: string;
    priority: SynapsePriority;
    requiredResources: string[];
  } {
    let recommendation = 'Maintain standard automated cleaning intervals.';
    let priority: SynapsePriority = 'LOW';
    let requiredResources: string[] = ['1 Sanitation Steward'];

    if (options.cleaningStatus === 'CRITICAL' || options.liveCrowdDensity > 90) {
      recommendation = `Deploy Janitorial Taskforce 4 for rapid restroom sanitization sweep at Sector ${options.currentZone}.`;
      priority = 'HIGH';
      requiredResources = ['3 Sanitation Officers', '1 Chemical Cleaning Unit'];
    } else if (options.cleaningStatus === 'NEEDS_CLEANING') {
      recommendation = `Schedule regular maintenance sweep for restrooms and food court disposal bins in ${options.currentZone}.`;
      priority = 'MEDIUM';
      requiredResources = ['2 Sanitation Stewards'];
    }

    return { recommendation, priority, requiredResources };
  }
}

// ==========================================
// Combined Operations Service Orchestrator
// ==========================================
export class OperationsIntelligenceService {
  private analysisService = new OperationsAnalysisService();
  private deploymentService = new DeploymentRecommendationService();
  private queueService = new QueueIntelligenceService();
  private resourceService = new ResourceAllocationService();
  private maintenanceService = new MaintenanceRecommendationService();

  public getRecommendation(
    area: OperationalArea,
    options: OperationsContextOptions
  ): OperationsRecommendation {
    const analysis = this.analysisService.analyzeStadiumLoad(options);
    const deployment = this.deploymentService.getStaffDeployment(area, options);
    const queue = this.queueService.calculateQueueDirectives(options);
    const resource = this.resourceService.allocateResources(area, options);
    const maintenance = this.maintenanceService.getMaintenanceActions(options);

    // Build unified custom response models based on the operational area
    let currentSituation = `Crowd density is at ${options.liveCrowdDensity}% in ${options.currentZone}. Queue backlog is ${options.queueLength} visitors.`;
    let recommendationText = deployment.recommendation;
    let requiredResources = deployment.requiredResources;
    let alternativeActions = deployment.alternativeActions;
    let priority: SynapsePriority = analysis.globalPriority;
    let estimatedImpact = 'Reduces response overhead and optimizes staff coverage.';
    let confidenceScore = deployment.confidence;

    switch (area) {
      case 'CROWD_MANAGEMENT':
        currentSituation = `Crowd surge level at ${options.liveCrowdDensity}% in ${options.currentZone}. Queue length is ${options.queueLength} guests.`;
        recommendationText = `Activate secondary outer exit corridor gates and redirect high flow from ${options.currentZone}.`;
        requiredResources = ['4 Crowd Control Stewards', 'LED Wayfinding displays'];
        alternativeActions = ['Throttling gate turnstile scan speeds to pace flow.'];
        priority = options.liveCrowdDensity > 85 ? 'HIGH' : 'MEDIUM';
        estimatedImpact = 'Reduces localized crowd density levels by up to 25% within 10 minutes.';
        confidenceScore = 0.91;
        break;

      case 'GATE_MONITORING':
      case 'QUEUE_MONITORING':
        currentSituation = `Current backlog stands at ${options.queueLength} visitors at Gate Turnstiles with ${options.gateStatus} status.`;
        recommendationText = queue.recommendation;
        requiredResources = ['2 Turnstile Technicians', '3 Digital Direction Boards'];
        alternativeActions = [queue.alternative];
        priority = options.queueLength > 120 ? 'HIGH' : 'MEDIUM';
        estimatedImpact = queue.estimatedImpact;
        confidenceScore = queue.confidence;
        break;

      case 'CLEANING_OPERATIONS':
      case 'RESTROOM_CAPACITY':
        currentSituation = `Restroom cleaning priority status: ${options.cleaningStatus}. Current crowd volume: ${options.liveCrowdDensity}%.`;
        recommendationText = maintenance.recommendation;
        requiredResources = maintenance.requiredResources;
        alternativeActions = ['Deploy temporary visual cleaning signage.', 'Redirect to Sector 110 auxiliary restroom blocks.'];
        priority = maintenance.priority;
        estimatedImpact = 'Ensures continuous sanitation compliance and elevates visitor satisfaction scores.';
        confidenceScore = 0.93;
        break;

      case 'MEDICAL_TEAM_COORDINATION':
        currentSituation = `Active incident count: ${options.liveIncidentCount}. Medical Team standby status: ${options.medicalTeamAvailable ? 'AVAILABLE' : 'BUSY'}.`;
        recommendationText = resource.recommendation;
        requiredResources = resource.requiredResources.length > 0 ? resource.requiredResources : ['1 Standby Paramedic'];
        alternativeActions = ['Activate field triage tent.', 'Request municipal backup transport.'];
        priority = options.liveIncidentCount > 0 ? 'HIGH' : 'LOW';
        estimatedImpact = 'Slashes on-scene medical response time to under 90 seconds.';
        confidenceScore = resource.confidence;
        break;

      case 'PARKING_STATUS':
        currentSituation = `Main Stadium parking lots are currently at ${100 - options.parkingAvailability}% capacity.`;
        recommendationText = options.parkingAvailability < 15
          ? 'Route incoming vehicles to secondary Park-and-Ride structures at Metro East.'
          : 'Continue guiding vehicles to available spots in Parking Level 2 and 3.';
        requiredResources = ['4 Traffic Controllers', 'Dynamic VMS Board signs'];
        alternativeActions = ['Open VIP overflow parking section.', 'Activate public shuttle routes.'];
        priority = options.parkingAvailability < 10 ? 'HIGH' : 'LOW';
        estimatedImpact = 'Maintains smooth highway intake speeds and avoids ring-road lockups.';
        confidenceScore = 0.89;
        break;

      case 'LOST_AND_FOUND':
        currentSituation = 'Lost items log shows 5 items outstanding; 2 items successfully returned.';
        recommendationText = 'Synchronize current lost items data to the public visitor app portal.';
        requiredResources = ['1 Lost & Found Clerk'];
        alternativeActions = ['Push notifications to matching seat numbers.'];
        priority = 'LOW';
        estimatedImpact = 'Reduces administrative dispatch query overhead by 40%.';
        confidenceScore = 0.96;
        break;

      case 'MAINTENANCE_ALERTS':
        currentSituation = 'HVAC unit sector 104 reporting minor airflow warning.';
        recommendationText = 'Schedule preventive maintenance check for HVAC compressor sector 104 after halftime rush.';
        requiredResources = ['1 AC Repair Technician'];
        alternativeActions = ['Utilize sector ventilation bypass modes.'];
        priority = 'MEDIUM';
        estimatedImpact = 'Prevents equipment failure during live occupancy.';
        confidenceScore = 0.88;
        break;

      default:
        break;
    }

    return {
      operationType: area,
      currentSituation,
      recommendation: recommendationText,
      reasoning: [
        `System detected zone condition parameters of: Crowd=${options.liveCrowdDensity}%, Queue=${options.queueLength}.`,
        `Identified specific operational constraint matching priority level: ${priority}.`,
        `Calculated recommended action based on real-time stadium resource efficiency models.`
      ],
      priority,
      affectedArea: options.currentZone,
      requiredResources,
      estimatedImpact,
      confidenceScore,
      alternativeActions,
      timestamp: new Date().toISOString()
    };
  }
}
