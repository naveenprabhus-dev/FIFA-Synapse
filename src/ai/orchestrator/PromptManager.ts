/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseIntent } from '../../types/synapse';
import { SynapseFullContext } from './ContextBuilder';
import { PromptTemplates } from './PromptTemplates';
import { AIRequest } from './AIRequest';

export class PromptManager {
  /**
   * Compiles an AIRequest object from SynapseFullContext and user query/options.
   */
  public compileRequest(
    intent: SynapseIntent,
    context: SynapseFullContext,
    options?: Record<string, unknown>
  ): AIRequest {
    const systemInstruction = this.getSystemInstruction(intent);
    const userPrompt = this.compileUserPrompt(intent, context, options);

    return {
      systemInstruction,
      userPrompt,
      intent,
      modelName: 'gemini-3.5-flash', // Default model for standard structured text queries
      temperature: intent === 'EMERGENCY' ? 0.0 : 0.2, // Emergency requires exact determinism
      requestId: `req-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
  }

  private getSystemInstruction(intent: SynapseIntent): string {
    switch (intent) {
      case 'NAVIGATION':
        return PromptTemplates.NAVIGATION.system;
      case 'CROWD':
        return PromptTemplates.CROWD.system;
      case 'FOOD_RECOMMENDATION':
        return PromptTemplates.FOOD_RECOMMENDATION.system;
      case 'EMERGENCY':
        return PromptTemplates.EMERGENCY.system;
      case 'ACCESSIBILITY':
        return PromptTemplates.ACCESSIBILITY.system;
      case 'PARKING':
        // Reuse or adapt standard Navigation with specific parking priority
        return `You are the Smart Stadium Parking Coordinator for FIFA Synapse. Optimize egress flow, prevent gridlocks, and prioritize accessibility parking. Always return JSON matching the specified schema.`;
      case 'MATCH_INFORMATION':
        return `You are the Match Live Analytics & Spectator Assistant for FIFA Synapse. Suggest break times and answer queries in a structured JSON.`;
      case 'GENERAL_ASSISTANCE':
      default:
        return PromptTemplates.GENERAL_ASSISTANCE.system;
    }
  }

  private compileUserPrompt(
    intent: SynapseIntent,
    context: SynapseFullContext,
    options?: Record<string, unknown>
  ): string {
    const query = String(options?.query || 'General Assist Inquiry');

    switch (intent) {
      case 'NAVIGATION': {
        const origin = String(options?.originName || 'Your Current Seat');
        const destination = String(options?.destinationName || 'Closest Gate Exit');
        const gateStatus = context.stadiumDetails?.gates
          ? context.stadiumDetails.gates.map(g => `- Gate ${g.id}: ${g.name} is ${g.status} (${g.congestionIndex * 100}% congested)`).join('\n')
          : 'Gate data unavailable';
        const obstructions = context.activeIncidents && context.activeIncidents.length > 0
          ? context.activeIncidents.map(i => `- BLOCKED: ${i.locationName} due to ${i.category}`).join('\n')
          : 'No path obstructions';
        return PromptTemplates.NAVIGATION.user(origin, destination, gateStatus, obstructions);
      }

      case 'CROWD': {
        const matchPhase = context.activeMatch?.currentPhase || 'LIVE';
        const minute = context.activeMatch?.currentMinute || 0;
        const crowdData = context.crowdAnalysis
          ? context.crowdAnalysis.map(c => `- Sector ${c.sectorId}: ${c.occupancyPercent}% occupancy, ${c.flowRatePerMin} people/min`).join('\n')
          : 'Crowd sensor data empty';
        const incidents = context.activeIncidents && context.activeIncidents.length > 0
          ? context.activeIncidents.map(i => `- [${i.severity}] ${i.category} at ${i.locationName}`).join('\n')
          : 'No active safety incidents';
        return PromptTemplates.CROWD.user(matchPhase, minute, crowdData, incidents);
      }

      case 'FOOD_RECOMMENDATION': {
        const concessions = context.foodCourts
          ? context.foodCourts.map(f => `- ${f.name} (Sector ${f.locationDescription}): status ${f.status}, queue length ${f.queue.currentLength}`).join('\n')
          : 'Concessions data empty';
        const matchPhase = context.activeMatch?.currentPhase || 'LIVE';
        const minute = context.activeMatch?.currentMinute || 0;
        return PromptTemplates.FOOD_RECOMMENDATION.user(concessions, matchPhase, minute);
      }

      case 'EMERGENCY': {
        const incidents = context.activeIncidents && context.activeIncidents.length > 0
          ? context.activeIncidents.map(i => `- [${i.severity}] ${i.category} at ${i.locationName}: ${i.description}`).join('\n')
          : 'No active incidents on record';
        return PromptTemplates.EMERGENCY.user(query, incidents);
      }

      case 'ACCESSIBILITY': {
        const origin = String(options?.originName || 'Your Seat');
        const destination = String(options?.destinationName || 'Gate A');
        const elevatorStatus = context.stadiumDetails?.restrooms
          ? 'Elevators are active. Ramps are clear in all quadrants.'
          : 'No specific elevator telemetry on record.';
        const barriers = context.activeIncidents && context.activeIncidents.length > 0
          ? context.activeIncidents.map(i => `- Barrier: ${i.locationName} is experiencing ${i.category}`).join('\n')
          : 'No active wheelchair barriers reported.';
        return PromptTemplates.ACCESSIBILITY.user(origin, destination, elevatorStatus, barriers);
      }

      case 'PARKING': {
        const parkingData = context.parkingZones
          ? context.parkingZones.map(p => `- Lot ${p.name} (${p.status}): occupied ${p.currentOccupiedCount}/${p.totalCapacity}`).join('\n')
          : 'No parking zones data';
        return `Parking query: ${query}\nParking Zones Details:\n${parkingData}\nGenerate recommendation in JSON format.`;
      }

      case 'MATCH_INFORMATION': {
        const match = context.activeMatch;
        const matchStatus = match
          ? `- Game: ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.homeTeam.score}-${match.awayTeam.score}), Minute: ${match.currentMinute} (${match.currentPhase})`
          : 'No live matches details.';
        return PromptTemplates.GENERAL_ASSISTANCE.user(query, 'Weather is mild.', matchStatus);
      }

      case 'GENERAL_ASSISTANCE':
      default: {
        const weatherStr = context.weather ? `${context.weather.temperatureCelsius}C, ${context.weather.forecastBrief}` : 'Mild weather';
        const matchPhase = context.activeMatch?.currentPhase || 'PRE_MATCH';
        return PromptTemplates.GENERAL_ASSISTANCE.user(query, weatherStr, matchPhase);
      }
    }
  }
}
