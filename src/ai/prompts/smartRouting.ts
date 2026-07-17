/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseFullContext } from '../orchestrator/ContextBuilder';

export const SMART_ROUTING_SYSTEM_INSTRUCTION = `You are the Smart Navigation and Wayfinding AI Engine for FIFA Synapse. Your objective is to formulate optimized multi-modal routing or egress paths through the stadium.

You MUST prioritize accessibility requirements (e.g., if a user requires elevator transit or wheelchair access, avoid escalators or high-density stairways). Always output your answer in clean JSON conforming to the requested schema.`;

export function buildSmartRoutingUserPrompt(context: SynapseFullContext, queryOptions?: Record<string, unknown>): string {
  const origin = queryOptions?.originName ?? 'User Current Position';
  const destination = queryOptions?.destinationName ?? 'Closest Stadium Exit';
  const accessibilityNeeded = context.activeRole === 'FAN' && queryOptions?.requiresAccessibility === true;

  const stadiumGates = context.stadiumDetails?.gates
    ? context.stadiumDetails.gates.map(g => `- Gate ${g.id}: ${g.name} is ${g.status} (congestion: ${g.congestionIndex * 100}%, throughput: ${g.averageThroughputPerMinute} people/min)`).join('\n')
    : 'No gate telemetry available.';

  const criticalIncidents = context.activeIncidents && context.activeIncidents.length > 0
    ? context.activeIncidents.map(i => `- BLOCKED LOCATION: ${i.locationName} due to unresolved ${i.category}`).join('\n')
    : 'No physical path blocks.';

  return `Routing Options Request:
- Origin: ${origin}
- Destination: ${destination}
- Accessibility Optimized Needed: ${accessibilityNeeded ? 'YES (Wheelchair, no stairs)' : 'NO'}

Stadium Gate Sensor Statuses:
${stadiumGates}

Physical Obstructions / Active Bottlenecks:
${criticalIncidents}

Please calculate the safest and most efficient path. Provide your recommendation in the following JSON schema:
{
  "title": "Short title describing the smart route (e.g., Gate A Access Corridor)",
  "recommendation": "The precise route instruction sequence",
  "reason": "Direct explanation of why this path bypasses bottlenecks or satisfies accessibility needs",
  "confidenceScore": 0.0 to 1.0 representing routing accuracy,
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "suggestedAction": "First step the user should make",
  "estimatedBenefit": "How much transit time or flight risk is saved (e.g., Saves 5 minutes and bypasses Concourse B queue)",
  "alternative": "An alternative transit pathway if main path becomes congested",
  "reasoningDetails": ["Reasoning step 1 on why this is selected", "Reasoning step 2 on why other routes were rejected"]
}
`;
}
