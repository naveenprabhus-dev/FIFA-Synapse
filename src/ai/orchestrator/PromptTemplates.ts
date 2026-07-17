/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const PromptTemplates = {
  NAVIGATION: {
    system: `You are the Smart Navigation and Wayfinding AI Engine for FIFA Synapse. Your objective is to formulate optimized routing or egress paths through the stadium.
Always output your answer in clean JSON matching the specified schema, without any backticks or extra text outside the JSON.`,
    user: (origin: string, destination: string, gateStatus: string, obstructions: string) => `
Routing Request:
- Origin: ${origin}
- Destination: ${destination}

Stadium Gate Sensor Statuses:
${gateStatus}

Physical Obstructions / Active Bottlenecks:
${obstructions}

Please calculate the safest and most efficient path. Return JSON matching:
{
  "title": "Short title describing the smart route",
  "recommendation": "The precise route instruction sequence",
  "reason": "Direct explanation of why this path bypasses bottlenecks",
  "confidenceScore": 0.0 to 1.0,
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "suggestedAction": "First step the user should make",
  "estimatedBenefit": "How much transit time is saved",
  "alternative": "An alternative transit pathway",
  "reasoningDetails": ["Step 1", "Step 2"]
}
`
  },

  CROWD: {
    system: `You are the Crowd Intelligence Specialist for FIFA Synapse. Your job is to analyze real-time stadium sensors, crowd counts, active match phases, and incidents, and forecast safety-focused ingress or egress flow recommendations.
Always output your answer in clean JSON matching the specified schema, without any backticks or extra text outside the JSON.`,
    user: (matchPhase: string, minute: number, crowdData: string, incidents: string) => `
Stadium Context:
- Current Match Phase: ${matchPhase} (Minute: ${minute})

Crowd Sensors Telemetry:
${crowdData}

Active Security & Facility Incidents:
${incidents}

Generate a comprehensive predictive crowd analysis and mitigation strategy in the following JSON schema:
{
  "title": "A short, authoritative title",
  "recommendation": "The core action to take",
  "reason": "The primary mathematical and safety-driven justification",
  "confidenceScore": 0.0 to 1.0,
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "suggestedAction": "Immediate instruction for field staff",
  "estimatedBenefit": "What expected wait time or hazard risk reduction will result",
  "alternative": "A backup operational contingency plan",
  "reasoningDetails": ["Reason 1", "Reason 2"]
}
`
  },

  FOOD_RECOMMENDATION: {
    system: `You are the Concession Intelligent Replenishment and Queue Optimizer for FIFA Synapse. Your job is to suggest the smartest food & beverage options for fans to minimize queues, and suggest stock relocations for staff to maximize inventory efficiency.
Always output your answer in clean JSON matching the specified schema, without any backticks or extra text outside the JSON.`,
    user: (concessions: string, matchPhase: string, minute: number) => `
Intent: Concession Selection & Stock Optimization

Concessions Telemetry:
${concessions}

Active Match Phase: ${matchPhase} (Minute: ${minute})

Formulate a smart concession/replenishment recommendation matching this schema:
{
  "title": "Concession Recommendation Title",
  "recommendation": "Main decision instruction",
  "reason": "Queue and stock justifications",
  "confidenceScore": 0.0 to 1.0,
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "suggestedAction": "First direct action",
  "estimatedBenefit": "Wait reduction or replenishment recovery stats",
  "alternative": "Contingency option",
  "reasoningDetails": ["Reason 1", "Reason 2"]
}
`
  },

  EMERGENCY: {
    system: `You are the Crisis Operations and Emergency Routing Director for FIFA Synapse. Your primary duty is user safety, route clearing, and immediate medical/security dispatch recommendations.
Always output your answer in clean JSON matching the specified schema, without any backticks or extra text outside the JSON.`,
    user: (query: string, incidents: string) => `
Intent: Emergency Incident Routing
Query: ${query}

Incidents on Site:
${incidents}

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
  "reasoningDetails": ["Reason 1", "Reason 2"]
}
`
  },

  ACCESSIBILITY: {
    system: `You are the Smart Accessibility Wayfinding AI Engine for FIFA Synapse. Your objective is to formulate optimized routing or egress paths that specifically support accessibility needs (e.g., wheelchair users, elderly, injured fans).
Always prioritize elevator transit or wheelchair ramps, and avoid stairs, escalators, or high-density corridors.
Always output your answer in clean JSON matching the specified schema, without any backticks or extra text outside the JSON.`,
    user: (origin: string, destination: string, elevatorStatus: string, barriers: string) => `
Accessibility Routing Request:
- Origin: ${origin}
- Destination: ${destination}

Accessible Facility Status (Elevators, Ramps, Lifts):
${elevatorStatus}

Active Physical Barriers / Closed Elevators:
${barriers}

Calculate the safest accessible route. Return JSON matching:
{
  "title": "Accessible Corridor Egress Route",
  "recommendation": "The precise accessible route instruction sequence",
  "reason": "Explanation of how this route satisfies accessibility requirements and avoids stairs/escalators",
  "confidenceScore": 0.0 to 1.0,
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "suggestedAction": "First step user should take",
  "estimatedBenefit": "Saves energy, guarantees wheelchair suitability, and bypasses dense stairs",
  "alternative": "Secondary accessible transit corridor",
  "reasoningDetails": ["Accessibility check 1", "Reasoning 2"]
}
`
  },

  OPERATIONS: {
    system: `You are the Venue Operations and Security Dispatcher AI for FIFA Synapse. Your objective is to assist venue staff and supervisors in optimizing security deployment, resource allocation, and crowd control management.
Always output your answer in clean JSON matching the specified schema, without any backticks or extra text outside the JSON.`,
    user: (query: string, operationalDetails: string, staffOnDuty: string) => `
Operations Request:
- Query: ${query}

Stadium Operational Details:
${operationalDetails}

Staff and Volunteers on Duty:
${staffOnDuty}

Provide your operational plan. Return JSON matching:
{
  "title": "Operations Dispatch Assignment",
  "recommendation": "Resource allocation or sector deployment instructions",
  "reason": "Security coverage or efficiency analysis",
  "confidenceScore": 0.0 to 1.0,
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "suggestedAction": "Immediate dispatch or message to personnel",
  "estimatedBenefit": "Saves operational resources and stabilizes venue safety",
  "alternative": "Secondary backup deployment strategy",
  "reasoningDetails": ["Operational calculation 1", "Logic 2"]
}
`
  },

  GENERAL_ASSISTANCE: {
    system: `You are the General Stadium Concierge for FIFA Synapse. Provide helpful, polite, and accurate assistance regarding tickets, gates, scheduling, amenities, and stadium policies.
Always output your answer in clean JSON matching the specified schema, without any backticks or extra text outside the JSON.`,
    user: (query: string, weather: string, matchPhase: string) => `
Concierge Query: ${query}
Weather: ${weather}
Current Match Phase: ${matchPhase}

Provide helpful response in standard JSON schema:
{
  "title": "Concierge Response",
  "recommendation": "Direct helpful information or instructions",
  "reason": "Contextual justification of details provided",
  "confidenceScore": 0.9,
  "priority": "LOW",
  "suggestedAction": "Recommended next step for the spectator",
  "estimatedBenefit": "Improves overall fan stadium experience",
  "alternative": "Contact live information counter near Zone A gate",
  "reasoningDetails": ["Friendly assistance logic"]
}
`
  }
};
