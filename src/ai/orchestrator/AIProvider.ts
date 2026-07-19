/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompiledPrompt } from './PromptBuilder';
import { NetworkError } from '../../utils/errors';

export interface AIProviderResponse {
  rawText: string;
  tokensUsed?: number;
  modelName: string;
}

export interface AIProvider {
  generateContent(prompt: CompiledPrompt, timeoutMs?: number): Promise<AIProviderResponse>;
}

export class MockAIProvider implements AIProvider {
  constructor(
    private simulateLatencyMs: number = 300,
    private forceFailure: boolean = false,
    private forceTimeout: boolean = false
  ) {}

  /**
   * Generates a structured response mimicking Gemini.
   */
  public async generateContent(prompt: CompiledPrompt, timeoutMs: number = 5000): Promise<AIProviderResponse> {
    // 1. Handle simulated timeout checks
    if (this.forceTimeout || (timeoutMs > 0 && this.simulateLatencyMs > timeoutMs)) {
      await new Promise((resolve) => setTimeout(resolve, Math.min(timeoutMs, 1000)));
      throw new NetworkError('AI Provider request timed out during inference.', 'AI_TIMEOUT');
    }

    // Simulate network delay
    if (this.simulateLatencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.simulateLatencyMs));
    }

    // 2. Handle simulated failures
    if (this.forceFailure) {
      throw new NetworkError('AI Provider cluster is currently unavailable. Failing over.', 'AI_PROVIDER_DOWN');
    }

    const cleanPrompt = prompt.userPrompt.toLowerCase();
    let responseObj: Record<string, unknown> = {};

    // 3. Intelligently return mock JSON based on context clues or intent mapping
    if (cleanPrompt.includes('concession') || cleanPrompt.includes('pizza') || cleanPrompt.includes('replenishment')) {
      responseObj = {
        title: 'Heuristic Concession Optimization',
        recommendation: 'Direct Zone B fans to Sector 101 Pizza & Burger Bistro',
        reason: 'Sector 104 concession is congested with an 18-person line (>14 mins wait), whereas Sector 101 has only a 3-person queue (<3 mins wait).',
        confidenceScore: 0.94,
        priority: 'MEDIUM',
        suggestedAction: 'Deploy push notification to Sector 104 fans suggesting Sector 101.',
        estimatedBenefit: 'Reduces user wait time by up to 11 minutes and increases food-court throughput by 12%.',
        alternative: 'Direct fans to Concourse A Merchandise snack stalls',
        reasoningDetails: [
          'Sensor 104 is heavily saturated at halftime.',
          'Direct correlation with sector occupancy ratios.',
          'Maintains balanced revenue distribution across concessions.'
        ]
      };
    } else if (cleanPrompt.includes('lost') || cleanPrompt.includes('child')) {
      responseObj = {
        title: 'Lost Child Protocol Activation',
        recommendation: 'Report description to nearest Gate steward or stadium authority, ensuring surrounding zones remain safe and monitored.',
        reason: 'Missing person protocol is activated to mobilize staff across the target sector.',
        confidenceScore: 0.96,
        priority: 'CRITICAL',
        suggestedAction: 'Mobilize volunteer guards and broadcast description to stewards.',
        estimatedBenefit: 'Enables rapid reunion through comprehensive perimeter controls.',
        alternative: 'Guide search party back to Sector 108 Info Desk.',
        reasoningDetails: [
          'Lost child reports require instant mobilization of authorities.',
          'Physical checks of gates are initiated.'
        ]
      };
    } else if (cleanPrompt.includes('emergency') || cleanPrompt.includes('blocked') || cleanPrompt.includes('medical')) {
      responseObj = {
        title: 'Emergency Safety Route Clearance',
        recommendation: 'Deploy Medic Unit 2 via Elevator A and reroute surrounding crowd through Sector 101 Promenade.',
        reason: 'Escalator core at Sector 104 is reported inoperative due to a power outage, blocking the standard rapid dispatch path.',
        confidenceScore: 0.98,
        priority: 'CRITICAL',
        suggestedAction: 'Activate Emergency Green LED light strip pathway leading around Sector 104 staircase.',
        estimatedBenefit: 'Ensures paramedics reach the critical patient 3 minutes faster than staircase climbing.',
        alternative: 'Dispatch auxiliary volunteer stretcher unit from Gate B.',
        reasoningDetails: [
          'Critical patient reported at Sector 112 Row 14.',
          'Elevator A is operational and accessible-friendly.',
          'Prevents crowding panic in secondary narrow transit lanes.'
        ]
      };
    } else if (cleanPrompt.includes('routing') || cleanPrompt.includes('navigation') || cleanPrompt.includes('gate')) {
      responseObj = {
        title: 'Dynamic Spectator Routing',
        recommendation: 'Reroute Sector 104 egress through Gate B and Concourse A South Corridor.',
        reason: 'Gate A entrance is experiencing peak ingress congestion (index: 0.2 vs Gate B: 0.65, but with higher security clearances).',
        confidenceScore: 0.89,
        priority: 'HIGH',
        suggestedAction: 'Instruct stewards at Sector 104 intersection to point flags toward Gate B.',
        estimatedBenefit: 'Reduces queue dispersal bottleneck duration by 7 minutes.',
        alternative: 'Hold spectators in seat tiers for staggered exits of 3-minute intervals.',
        reasoningDetails: [
          'Spectators seek closest path.',
          'Saves 150 seconds of dense corridor standing.',
          'Maintains Gate B throughput below peak mechanical limits.'
        ]
      };
    } else if (cleanPrompt.includes('crowd') || cleanPrompt.includes('sensor')) {
      responseObj = {
        title: 'Sector 104 Crowding Forecasting',
        recommendation: 'Stagger egress gates opening sequence at Sector 104.',
        reason: 'Local density has breached 3.8 people per square meter near Gate B egress gates.',
        confidenceScore: 0.92,
        priority: 'HIGH',
        suggestedAction: 'Manually override Gate B barrier sequence to 50% flow restriction.',
        estimatedBenefit: 'Prevents crushing hazard and reduces flow convergence risks by 22%.',
        alternative: 'Open secondary safety roll-up gate at sector perimeter.',
        reasoningDetails: [
          'Real-time flowrate hit 124 persons/minute.',
          'Second half of match is in minute 52, showing high early departures.'
        ]
      };
    } else if (cleanPrompt.includes('parking') || cleanPrompt.includes('lot')) {
      responseObj = {
        title: 'Post-Match Parking Routing',
        recommendation: 'Assign incoming VIP vehicles to South Public Lot B.',
        reason: 'North VIP Lot A is filling fast (450/500 spaces occupied) with high risk of immediate saturation.',
        confidenceScore: 0.87,
        priority: 'MEDIUM',
        suggestedAction: 'Instruct digital lane boards to flash LOT B parking guidance.',
        estimatedBenefit: 'Prevents entry loop gridlock at Lot A and saves 9 minutes in parking search time.',
        alternative: 'Open auxiliary dirt lot C for peak overflow.',
        reasoningDetails: [
          'Lot B has 680 available slots.',
          'Lot B offers 60 accessibility spaces.'
        ]
      };
    } else if (cleanPrompt.includes('match') || cleanPrompt.includes('score')) {
      responseObj = {
        title: 'Halftime Concourse Break Opportunity',
        recommendation: 'Take restroom break at West Concourse Sector 104 Restroom 1 during Minute 38.',
        reason: 'Predicted stadium restroom queues peak at Minute 45 (14 mins wait). Current queue wait at Restroom 1 is only 2 minutes.',
        confidenceScore: 0.91,
        priority: 'LOW',
        suggestedAction: 'Walk to West Concourse Restroom 1 immediately.',
        estimatedBenefit: 'Saves 12 minutes in queue times, ensuring return to seat before match second-half kicks off.',
        alternative: 'Utilize lesser-known staff toilet under Level 2.',
        reasoningDetails: [
          'High match interest delays breaks.',
          'Restroom 2 is already busy (12 people in queue).'
        ]
      };
    } else {
      // General Assistance
      responseObj = {
        title: 'Synapse Core Concierge Support',
        recommendation: 'Welcome to Al Bayt Stadium. Please refer to Section 104 Information Kiosks.',
        reason: 'Normal baseline operations. Weather is clear (28C) and gates are operating smoothly.',
        confidenceScore: 0.95,
        priority: 'LOW',
        suggestedAction: 'Visit nearest information desk for printed layouts.',
        estimatedBenefit: 'Provides friendly wayfinding orientation.',
        alternative: 'Rely on mobile GPS pathfinding inside the stadium app.',
        reasoningDetails: ['Weather is favorable.', 'No current incident alert blocks.']
      };
    }

    return {
      rawText: JSON.stringify(responseObj, null, 2),
      tokensUsed: 256,
      modelName: 'mock-gemini-3.5-flash',
    };
  }
}
