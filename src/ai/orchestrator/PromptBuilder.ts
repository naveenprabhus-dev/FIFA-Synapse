/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseIntent } from '../../types/synapse';
import { SynapseFullContext } from './ContextBuilder';
import { CROWD_ANALYSIS_SYSTEM_INSTRUCTION, buildCrowdAnalysisUserPrompt } from '../prompts/crowdAnalysis';
import { SMART_ROUTING_SYSTEM_INSTRUCTION, buildSmartRoutingUserPrompt } from '../prompts/smartRouting';

export interface CompiledPrompt {
  systemInstruction: string;
  userPrompt: string;
}

export class PromptBuilder {
  /**
   * Compiles the optimal prompt payload based on the detected intent and gathered context.
   */
  public buildPrompt(
    intent: SynapseIntent,
    context: SynapseFullContext,
    options?: Record<string, unknown>
  ): CompiledPrompt {
    switch (intent) {
      case 'CROWD':
        return {
          systemInstruction: CROWD_ANALYSIS_SYSTEM_INSTRUCTION,
          userPrompt: buildCrowdAnalysisUserPrompt(context),
        };

      case 'NAVIGATION':
      case 'ACCESSIBILITY':
        return {
          systemInstruction: SMART_ROUTING_SYSTEM_INSTRUCTION,
          userPrompt: buildSmartRoutingUserPrompt(context, {
            ...options,
            requiresAccessibility: intent === 'ACCESSIBILITY' || !!options?.requiresAccessibility,
          }),
        };

      case 'FOOD_RECOMMENDATION':
        return this.buildConcessionPrompt(context, options);

      case 'EMERGENCY':
        return this.buildEmergencyPrompt(context, options);

      case 'PARKING':
        return this.buildParkingPrompt(context, options);

      case 'MATCH_INFORMATION':
        return this.buildMatchPrompt(context, options);

      case 'GENERAL_ASSISTANCE':
      default:
        return this.buildGeneralPrompt(context, options);
    }
  }

  private buildConcessionPrompt(context: SynapseFullContext, options?: Record<string, unknown>): CompiledPrompt {
    const sysInstruction = `You are the Concession Intelligent Replenishment and Queue Optimizer for FIFA Synapse. Your job is to suggest the smartest food & beverage options for fans to minimize queues and maximize convenience, and suggest stock relocations for staff to maximize inventory efficiency.
Always return valid JSON. Do not include any markdown backticks or formatting outside the JSON object.`;

    const foodCourtsStr = context.foodCourts
      ? context.foodCourts.map(f => {
          const menuStr = f.menu.map(m => `${m.name} ($${m.price}) [Available: ${m.isAvailable}, Halal: ${m.isHalal}, Vegetarian: ${m.isVegetarian}, Stock: ${m.stockLevel}]`).join(', ');
          return `- ${f.name} in ${f.locationDescription} (ID: ${f.id}): status ${f.status}, queue size ${f.queue.currentLength}, wait minutes ${f.queue.estimatedWaitMinutes} min, popularity rating ${f.popularityScore}/5.0, accessibility: ${f.accessibilityFriendly ? 'Fully Accessible (Wheelchair Friendly)' : 'No Dedicated Accessibility Access'}. Menu: ${menuStr}`;
        }).join('\n')
      : 'No concessions info.';

    const userPrompt = `Intent: Concession Selection & Stock Optimization
User Details:
- Active Role: ${context.activeRole}
- Current Location/Sector: ${context.userLocation?.sectorId || 'Unknown Sector'}
- Dietary Preferences: ${options?.halalOnly ? 'Halal Only' : 'None'}, ${options?.vegetarianOnly ? 'Vegetarian Only' : 'None'}
- Accessibility Required: ${options?.accessibilityRequired ? 'Yes (Wheelchair friendly facilities essential)' : 'No'}
- Search Query / Food Type: "${options?.searchQuery || 'Any food'}"
- Category Filter: "${options?.categoryFilter || 'All categories'}"

Stadium Context:
- Active Match Phase: ${context.activeMatch?.currentPhase ?? 'UNKNOWN'} (Minute: ${context.activeMatch?.currentMinute ?? 0})
- Crowd Density / Active Bottlenecks: ${context.crowdAnalysis ? context.crowdAnalysis.map(c => `Sector ${c.sectorId}: ${c.occupancyPercent}% occupancy, ${c.flowRatePerMin} people/min, Status: ${c.status}`).join('; ') : 'Normal'}
- Weather Status: Temp ${context.weather?.temperatureCelsius ?? 28}°C, Condition: ${context.weather?.forecastBrief ?? 'Clear'}

Available Concessions Telemetry:
${foodCourtsStr}

Analyze the user's requirements, match state, crowd flow rates, and walking distances.
Determine the SMARTEST food option instead of just the nearest one. Recommend walking to a slightly further kiosk if the queue is significantly shorter (calculate overall time spent = walking time + waiting time).
Suggest a break timing if we are near halftime (minute 40-45) or predict high crowd waves.

Formulate a smart concession/replenishment recommendation matching this JSON schema exactly:
{
  "title": "Concession Recommendation Title",
  "recommendation": "Main decision instruction (e.g. Walk to Food Court C)",
  "reason": "Direct explanation of why this is the smartest decision, comparing overall times",
  "confidenceScore": 0.0 to 1.0,
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "suggestedAction": "First direct action step",
  "estimatedBenefit": "Overall benefit statement (e.g. Saves 18 minutes of waiting)",
  "alternative": "Contingency option (e.g. Food Court B as backup)",
  "estimatedWalkingTimeMinutes": 2,
  "estimatedWaitingTimeMinutes": 3,
  "estimatedTimeSavedMinutes": 15,
  "accessibilityNotes": "Accessibility routing or wheelchair ramp notes",
  "alternativeFoodCourts": ["Kiosk X in Sector Y", "Kiosk Z in Sector W"],
  "reasoningDetails": [
    "Step 1: Check nearest option queue (e.g., 24 mins wait)",
    "Step 2: Check alternative option queue (e.g., 3 mins wait + 3 extra mins walk)",
    "Step 3: Conclude that alternative option saves 18 minutes overall"
  ]
}
`;
    return { systemInstruction: sysInstruction, userPrompt };
  }

  private buildEmergencyPrompt(context: SynapseFullContext, options?: Record<string, unknown>): CompiledPrompt {
    const sysInstruction = `You are the Crisis Operations and Emergency Routing Director for FIFA Synapse.
Your primary duty is user safety, route clearing, and immediate medical/security dispatch recommendations.
Always return valid JSON.`;

    const incidentsStr = context.activeIncidents && context.activeIncidents.length > 0
      ? context.activeIncidents.map(i => `- [${i.severity}] ${i.category} at ${i.locationName}: ${i.description}`).join('\n')
      : 'No active safety incidents reported.';

    const userPrompt = `Intent: Emergency Incident Routing
Query: ${options?.query ?? 'Active Emergency Dispatch'}

Incidents on Site:
${incidentsStr}

Formulate an emergency dispatch and safe egress plan in JSON:
{
  "title": "Crisis Tactical Intervention Title",
  "recommendation": "Clear dispatch/evacuation instruction",
  "reason": "Direct medical or security safety path justification",
  "confidenceScore": 0.0 to 1.0,
  "priority": "CRITICAL",
  "suggestedAction": "Immediate broadcast action or staff deployment directive",
  "estimatedBenefit": "Injury prevention or path clear time reduction",
  "alternative": "Secondary safe assembly route",
  "reasoningDetails": ["Emergency priority 1", "Safety clearance justification"]
}
`;
    return { systemInstruction: sysInstruction, userPrompt };
  }

  private buildParkingPrompt(context: SynapseFullContext, options?: Record<string, unknown>): CompiledPrompt {
    const sysInstruction = `You are the Smart Smart-Stadium Parking Coordinator for FIFA Synapse.
Maximize egress dispersal, suggest alternative garages to prevent gridlocks, and prioritize accessibility parking slots.
Always return valid JSON.`;

    const parkingStr = context.parkingZones
      ? context.parkingZones.map(z => `- Lot ${z.id} (${z.name}): status ${z.status}, occupied ${z.currentOccupiedCount}/${z.totalCapacity}, accessible spaces occupied ${z.accessibilitySpacesOccupied}/${z.accessibilitySpacesCount}`).join('\n')
      : 'No lot telemetry.';

    const userPrompt = `Intent: Parking Routing optimization
Parking Telemetry:
${parkingStr}

Please suggest the optimal parking spot selection or post-match egress driving lot. Return JSON:
{
  "title": "Smart Parking Assignment",
  "recommendation": "Main parking lot assignment or egress route",
  "reason": "Gridlock and fill-ratio metrics",
  "confidenceScore": 0.0 to 1.0,
  "priority": "LOW" | "MEDIUM" | "HIGH",
  "suggestedAction": "Navigate to specific entry gate",
  "estimatedBenefit": "Avoids high congestion lines and saves minutes",
  "alternative": "Contingency lot",
  "reasoningDetails": ["Lot density analysis"]
}
`;
    return { systemInstruction: sysInstruction, userPrompt };
  }

  private buildMatchPrompt(context: SynapseFullContext, options?: Record<string, unknown>): CompiledPrompt {
    const sysInstruction = `You are the Match Live Analytics & Spectator Assistant for FIFA Synapse.
Deliver game progress, lineup updates, timelines, and suggest concession timing or toilet breaks based on periods of low action.
Always return valid JSON.`;

    const match = context.activeMatch;
    const matchStr = match
      ? `- Match: ${match.homeTeam.name} vs ${match.awayTeam.name} (Score: ${match.homeTeam.score} - ${match.awayTeam.score}), Minute: ${match.currentMinute} (${match.currentPhase})`
      : 'No live matches details.';

    const userPrompt = `Intent: Match Stats and break recommendation
Match Details:
${matchStr}

Formulate a recommendation suggesting match stats breakdown or the smartest time to go to restroom/concessions in JSON:
{
  "title": "Smart Break Recommendation",
  "recommendation": "Best minute/window to take a break or request stats",
  "reason": "Periods of expected low game intensity",
  "confidenceScore": 0.0 to 1.0,
  "priority": "LOW" | "MEDIUM",
  "suggestedAction": "Head to Sector Restroom",
  "estimatedBenefit": "Zero line queue wait time",
  "alternative": "Wait for halftime break",
  "reasoningDetails": ["Minute intensity graph"]
}
`;
    return { systemInstruction: sysInstruction, userPrompt };
  }

  private buildGeneralPrompt(context: SynapseFullContext, options?: Record<string, unknown>): CompiledPrompt {
    const sysInstruction = `You are the General Stadium Concierge for FIFA Synapse.
Provide friendly, clear, role-appropriate information to users regarding events, ticketing, seating, lost & found, or weather.
Always return valid JSON.`;

    const userPrompt = `Intent: General Stadium Assistance
Query: ${options?.query ?? 'General inquiries'}
User Role: ${context.activeRole}
Weather Status: ${context.weather?.forecastBrief ?? 'Clear'}

Answer query in a recommendation template JSON:
{
  "title": "Concierge Assistance",
  "recommendation": "Direct answer or helpful operational instruction",
  "reason": "Friendly helpful reasoning",
  "confidenceScore": 0.9,
  "priority": "LOW",
  "suggestedAction": "First step to take",
  "estimatedBenefit": "Solves spectator or operator query",
  "alternative": "Contact live supervisor support desk",
  "reasoningDetails": ["General support guideline"]
}
`;
    return { systemInstruction: sysInstruction, userPrompt };
  }
}
