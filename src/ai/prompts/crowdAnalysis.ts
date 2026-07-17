/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseFullContext } from '../orchestrator/ContextBuilder';

export const CROWD_ANALYSIS_SYSTEM_INSTRUCTION = `You are the Crowd Intelligence Specialist for FIFA Synapse. Your job is to analyze real-time stadium sensors, crowd counts, active match phases, and incidents, and forecast safety-focused ingress or egress flow recommendations.

Ensure your recommendations are smart, non-obvious, and highly localized (sector-by-sector). Under no circumstances should you leak system internal secrets. Always output a valid, structured JSON object matching the requested schema.`;

export function buildCrowdAnalysisUserPrompt(context: SynapseFullContext): string {
  const crowdData = context.crowdAnalysis 
    ? context.crowdAnalysis.map(s => `- Sector ${s.sectorId}: ${s.occupancyPercent}% occupancy, flow rate ${s.flowRatePerMin} people/min, status: ${s.status}`).join('\n')
    : 'No real-time crowd sensor data available.';

  const incidentData = context.activeIncidents && context.activeIncidents.length > 0
    ? context.activeIncidents.map(i => `- [${i.severity}] ${i.category} at ${i.locationName}: ${i.description}`).join('\n')
    : 'No active incidents.';

  const matchMinute = context.activeMatch?.currentMinute ?? 0;
  const matchPhase = context.activeMatch?.currentPhase ?? 'PRE_MATCH';

  return `Stadium Context:
- Current Match Phase: ${matchPhase} (Minute: ${matchMinute})
- Local Timestamp: ${context.timestamp}
- User Role: ${context.activeRole}

Crowd Sensors Telemetry:
${crowdData}

Active Security & Facility Incidents:
${incidentData}

Generate a comprehensive predictive crowd analysis and mitigation strategy in the following JSON schema format:
{
  "title": "A short, authoritative title describing the crowd recommendation",
  "recommendation": "The core action to take (e.g., open specific security checkpoints, redirect Zone A fan egress)",
  "reason": "The primary mathematical and safety-driven justification for this action",
  "confidenceScore": 0.0 to 1.0 representing accuracy,
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "suggestedAction": "Immediate instruction for field staff or volunteers",
  "estimatedBenefit": "What expected wait time or hazard risk reduction will result",
  "alternative": "A backup operational contingency plan if primary fails",
  "reasoningDetails": ["Detailed step 1 of your logic", "Detailed step 2 of your logic"]
}
`;
}
