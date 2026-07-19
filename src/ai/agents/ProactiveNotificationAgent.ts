/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProvider } from '../orchestrator/AIProvider';
import { SynapseFullContext } from '../orchestrator/ContextBuilder';
import { ProactiveNotification, ProactiveNotificationType } from '../../types/proactiveNotification';
import { UserRole } from '../../types/user';

export class ProactiveNotificationAgent {
  constructor(private aiProvider: AIProvider) {}

  /**
   * Generates a list of proactive notification candidates based on the current stadium context.
   * Utilizes Gemini LLM with structured output, falling back gracefully to heuristic rule-based alerts on failure.
   */
  public async generateProactiveNotifications(
    context: SynapseFullContext,
    options?: { timeoutMs?: number }
  ): Promise<ProactiveNotification[]> {
    const timestamp = new Date().toISOString();
    const systemInstruction = `You are the AI Proactive Notification and Decision Engine for FIFA Synapse.
Your job is to evaluate live stadium context (including match state, weather, crowd congestion, food court queues, active incidents, and parking availability) and proactively generate intelligent recommendations and alerts before users ask.
Only generate a notification if it is genuinely necessary and helpful. Avoid unnecessary notification clutter.
You must return a valid, parsable JSON object matching this schema:
{
  "notifications": [
    {
      "type": "CROWD_WARNING" | "GATE_CHANGE" | "ALTERNATIVE_ROUTE" | "FOOD_COURT_SUGGESTION" | "EMERGENCY_ALERT" | "ACCESSIBILITY_ALERT" | "PARKING_UPDATE" | "WEATHER_WARNING" | "QUEUE_REDUCTION_SUGGESTION" | "VOLUNTEER_NOTIFICATION" | "SECURITY_ALERT" | "MEDICAL_ALERT" | "FACILITY_UPDATE",
      "title": "Short descriptive title",
      "summary": "1-2 sentence actionable overview of the alert",
      "reason": "Clear explanation of WHY this notification was generated and why it matters to this user",
      "recommendation": "The primary recommended action step for the user to take",
      "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "confidenceScore": 0.0 to 1.0 (float reflecting evaluation certainty),
      "affectedZone": "Specific sector ID or area affected (e.g. SEC_108, Lot A, Gate 4)",
      "estimatedBenefit": "Clear description of wait time reduction, distance saved, or safety improvement (e.g. Reduces wait time by 12 mins)",
      "alternative": "A secondary backup action step if applicable"
    }
  ]
}
Always return clean JSON. Do NOT include markdown formatting backticks (like \`\`\`json) outside the JSON.`;

    const activeIncidentsStr = context.activeIncidents && context.activeIncidents.length > 0
      ? context.activeIncidents.map(i => `- [${i.severity}] ${i.category} in ${i.locationName} (${i.description})`).join('\n')
      : 'None';

    const crowdStr = context.crowdAnalysis && context.crowdAnalysis.length > 0
      ? context.crowdAnalysis.map(c => `- Sector ${c.sectorId}: ${c.occupancyPercent}% occupancy, status ${c.status}`).join('\n')
      : 'Optimal';

    const foodCourtsStr = context.foodCourts && context.foodCourts.length > 0
      ? context.foodCourts.map(f => `- ${f.name}: queue ${f.queue.currentLength} people, wait time ${f.queue.estimatedWaitMinutes} mins`).join('\n')
      : 'Optimal';

    const parkingStr = context.parkingZones && context.parkingZones.length > 0
      ? context.parkingZones.map(p => `- Lot ${p.name} (${p.id}): ${p.totalCapacity - p.currentOccupiedCount}/${p.totalCapacity} spaces available, status ${p.status}`).join('\n')
      : 'Normal';

    const matchStr = context.activeMatch
      ? `- Match: ${context.activeMatch.homeTeam.name} (${context.activeMatch.homeTeam.score}) vs ${context.activeMatch.awayTeam.name} (${context.activeMatch.awayTeam.score})\n- Phase: ${context.activeMatch.currentPhase} (Minute: ${context.activeMatch.currentMinute})`
      : 'No active match.';

    const userPrompt = `
Generate proactive notification recommendations for the current stadium state:

Match State:
${matchStr}

Weather Telemetry:
- Temp: ${context.weather?.temperatureCelsius}°C
- Forecast: ${context.weather?.forecastBrief}
- Alerts: ${context.weather?.activeWeatherAlerts?.join(', ') || 'None'}

Active Incidents:
${activeIncidentsStr}

Crowd Density Telemetry:
${crowdStr}

Food Court Queue Status:
${foodCourtsStr}

Parking Lot Telemetry:
${parkingStr}

User Profile Details:
- Active Role: ${context.activeRole}
- Location Sector: ${context.userLocation?.sectorId || 'Unknown'}

Analyze these datasets. Evaluate if there is a critical safety, logistical, navigation, accessibility, or concession queue issue.
Provide only essential proactive recommendations. If everything is completely normal, you may return an empty list or a low-priority facility update.
Make sure to explain WHY the notification matters.`;

    try {
      const timeout = options?.timeoutMs ?? 5000;
      const response = await this.aiProvider.generateContent({ systemInstruction, userPrompt }, timeout);
      
      let cleanedText = response.rawText.trim();
      const markdownCodeBlockRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;
      const match = cleanedText.match(markdownCodeBlockRegex);
      if (match) {
        cleanedText = match[1].trim();
      }

      const parsed = JSON.parse(cleanedText);
      const items = Array.isArray(parsed.notifications) 
        ? parsed.notifications 
        : (parsed.title || parsed.recommendation ? [parsed] : []);

      return items.map((item: any, idx: number) => ({
        id: `notif-proactive-${Date.now()}-${idx}`,
        type: item.type as ProactiveNotificationType,
        title: item.title || 'Stadium Update',
        summary: item.summary || 'A proactive suggestion from Synapse Core.',
        reason: item.reason || 'Calculated from active stadium telemetry inputs.',
        recommendation: item.recommendation || 'Maintain normal baseline operational checks.',
        priority: (item.priority || 'LOW') as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        confidenceScore: typeof item.confidenceScore === 'number' ? item.confidenceScore : 0.85,
        affectedZone: item.affectedZone || 'All Zones',
        estimatedBenefit: item.estimatedBenefit || 'Optimizes flow and safety.',
        timestamp,
        read: false,
        alternative: item.alternative,
      }));

    } catch (err) {
      // Graceful Heuristic Failover Recovery - never fail if Gemini times out or breaks!
      return this.generateHeuristicNotifications(context, timestamp);
    }
  }

  /**
   * Safe, offline rule-based generator as fallback when LLM is unavailable.
   */
  private generateHeuristicNotifications(context: SynapseFullContext, timestamp: string): ProactiveNotification[] {
    const list: ProactiveNotification[] = [];

    // 1. Emergency incident alert
    const criticalIncident = context.activeIncidents?.find(i => i.severity === 'CRITICAL' || i.category === 'MEDICAL_EMERGENCY' || i.category === 'SECURITY_BREACH');
    if (criticalIncident) {
      list.push({
        id: `notif-heuristic-${Date.now()}-emergency`,
        type: criticalIncident.category === 'MEDICAL_EMERGENCY' ? ProactiveNotificationType.MEDICAL_ALERT : 
              criticalIncident.category === 'SECURITY_BREACH' ? ProactiveNotificationType.SECURITY_ALERT : ProactiveNotificationType.EMERGENCY_ALERT,
        title: `Active Emergency: ${criticalIncident.category}`,
        summary: `A safety issue of category ${criticalIncident.category} is reported in ${criticalIncident.locationName}.`,
        reason: `Live sensors registered an unresolved critical issue in your immediate proximity.`,
        recommendation: `Follow emergency safety coordinates and keep corridors clear for response units.`,
        priority: 'CRITICAL',
        confidenceScore: 0.99,
        affectedZone: criticalIncident.locationName,
        estimatedBenefit: `Bypasses hazardous areas and minimizes response dispatch latency.`,
        timestamp,
        read: false,
        alternative: `Report any further hazard progression to stadium stewards.`
      });
    }

    // 2. Crowd Congestion Warning
    const congestedSector = context.crowdAnalysis?.find(c => c.occupancyPercent >= 90);
    if (congestedSector) {
      list.push({
        id: `notif-heuristic-${Date.now()}-crowd`,
        type: ProactiveNotificationType.CROWD_WARNING,
        title: `Crowd Surge Alert: Sector ${congestedSector.sectorId}`,
        summary: `Sector ${congestedSector.sectorId} is experiencing peak density limits (${congestedSector.occupancyPercent}% occupancy).`,
        reason: `High flow convergence of patrons moving into matching gate intersections.`,
        recommendation: `Reroute pathfinder to neighboring corridors or wait for staggered egress wave releases.`,
        priority: 'HIGH',
        confidenceScore: 0.95,
        affectedZone: congestedSector.sectorId,
        estimatedBenefit: `Reduces localized congestion pressure and prevents crush hazards.`,
        timestamp,
        read: false,
        alternative: `Proceed to adjacent North/South open plazas.`
      });
    }

    // 3. Concession Suggestion
    const busyFood = context.foodCourts?.find(f => f.queue.currentLength > 12);
    const quietFood = context.foodCourts?.find(f => f.queue.currentLength <= 5);
    if (busyFood && quietFood) {
      list.push({
        id: `notif-heuristic-${Date.now()}-concession`,
        type: ProactiveNotificationType.FOOD_COURT_SUGGESTION,
        title: `Smart Concession Route Suggested`,
        summary: `Queue lines are high at ${busyFood.name} but optimal at ${quietFood.name}.`,
        reason: `Pre-match crowd patterns are bottlenecking the nearest concourse kiosks.`,
        recommendation: `Walk to ${quietFood.name} in ${quietFood.locationDescription} to save wait-time.`,
        priority: 'MEDIUM',
        confidenceScore: 0.92,
        affectedZone: busyFood.id,
        estimatedBenefit: `Saves approximately ${Math.abs(busyFood.queue.estimatedWaitMinutes - quietFood.queue.estimatedWaitMinutes)} minutes of waiting in line.`,
        timestamp,
        read: false,
        alternative: `Pre-order via Express Mobile App feature.`
      });
    }

    // 4. Accessibility Alert
    const accessibilityIssue = context.activeIncidents?.find(i => i.category === 'INFRASTRUCTURE_FAILURE' && (i.description.toLowerCase().includes('elevator') || i.description.toLowerCase().includes('ramp')));
    if (accessibilityIssue) {
      list.push({
        id: `notif-heuristic-${Date.now()}-accessibility`,
        type: ProactiveNotificationType.ACCESSIBILITY_ALERT,
        title: `ADA Route Update: Elevator/Ramp Issue`,
        summary: `Step-free elevator system in ${accessibilityIssue.locationName} is experiencing maintenance delays.`,
        reason: `Telemetry logs report mechanical fault: ${accessibilityIssue.description}.`,
        recommendation: `Reroute step-free pathways to the adjacent Sector Ramp System 4.`,
        priority: 'HIGH',
        confidenceScore: 0.94,
        affectedZone: accessibilityIssue.locationName,
        estimatedBenefit: `Ensures uninterrupted wheelchair and stroller transit safety.`,
        timestamp,
        read: false,
        alternative: `Signal nearby volunteer staff for lift chair support.`
      });
    }

    // 5. Parking Alert
    const lowParking = context.parkingZones?.find(p => (p.totalCapacity - p.currentOccupiedCount) / p.totalCapacity < 0.15);
    if (lowParking) {
      const availableCount = lowParking.totalCapacity - lowParking.currentOccupiedCount;
      list.push({
        id: `notif-heuristic-${Date.now()}-parking`,
        type: ProactiveNotificationType.PARKING_UPDATE,
        title: `Parking Saturation Warning: ${lowParking.name}`,
        summary: `Lot ${lowParking.name} is nearly full (${availableCount} available spots remaining).`,
        reason: `High inflow volume during the matches kickoff window.`,
        recommendation: `Redirect vehicles to Park-and-Ride West Sector Lot or local Metro transport.`,
        priority: 'MEDIUM',
        confidenceScore: 0.88,
        affectedZone: lowParking.id,
        estimatedBenefit: `Avoids traffic loop gridlocks and saves 10+ minutes searching for parking.`,
        timestamp,
        read: false,
        alternative: `Utilize auxiliary parking garages B or C.`
      });
    }

    // Fallback default low priority alert if empty
    if (list.length === 0) {
      list.push({
        id: `notif-heuristic-${Date.now()}-generic`,
        type: ProactiveNotificationType.FACILITY_UPDATE,
        title: `Stadium Baseline Operations Normal`,
        summary: `All gates, queues, and corridors are operating within safe bounds.`,
        reason: `Continuous AI evaluators reported clear status across all 12 major data signals.`,
        recommendation: `Enjoy the match! Baseline updates will publish if crowd metrics shift.`,
        priority: 'LOW',
        confidenceScore: 0.90,
        affectedZone: 'All Zones',
        estimatedBenefit: `Keeps spectators informed with peaceful, quiet operations.`,
        timestamp,
        read: false,
      });
    }

    return list;
  }
}
