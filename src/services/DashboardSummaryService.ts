/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseFullContext } from '../ai/orchestrator/ContextBuilder';
import { HealthScoreService, StadiumHealth } from './HealthScoreService';
import { RecommendationAggregator, AgentInsight } from './RecommendationAggregator';
import { InsightPrioritizationService, PrioritizedRecommendation, PredictedRisk } from './InsightPrioritizationService';

export interface CommandCenterSummary {
  health: StadiumHealth;
  insights: Record<string, AgentInsight>;
  recommendations: PrioritizedRecommendation[];
  predictedRisks: PredictedRisk[];
  timestamp: string;
  isSimulatedData: boolean;
}

export class DashboardSummaryService {
  private healthScoreService: HealthScoreService;
  private aggregator: RecommendationAggregator;
  private prioritizer: InsightPrioritizationService;

  constructor(
    healthScoreService?: HealthScoreService,
    aggregator?: RecommendationAggregator,
    prioritizer?: InsightPrioritizationService
  ) {
    this.healthScoreService = healthScoreService || new HealthScoreService();
    this.aggregator = aggregator || new RecommendationAggregator();
    this.prioritizer = prioritizer || new InsightPrioritizationService();
  }

  /**
   * Generates a fully aggregated decision-intelligence report for the stadium commander.
   */
  public generateSummary(context: SynapseFullContext | null | undefined): CommandCenterSummary {
    const timestamp = new Date().toISOString();

    // 1. Handle network/missing telemetry gracefully (Partial Data / Fallback Availability)
    if (!context) {
      return this.generateFallbackSummary('Stadium context payload completely unavailable.');
    }

    try {
      // 2. Compute Stadium Health Score
      const health = this.healthScoreService.calculateHealth(context);

      // 3. Aggregate live agent insights
      const insights = this.aggregator.aggregateInsights(context);

      // 4. Prioritize and Deduplicate Live Recommendations
      const rawNotifications = context.notifications || [];
      // Adapt SynapseNotification type to ProactiveNotification if needed
      const proactiveNotifications = rawNotifications.map(n => ({
        id: n.id,
        type: (n.severity === 'critical' ? 'SECURITY_ALERT' : 'FACILITY_UPDATE') as any,
        title: n.title,
        summary: n.message,
        reason: 'Operational parameter triggers threshold alert.',
        recommendation: '',
        priority: (n.severity === 'critical' ? 'CRITICAL' : n.severity === 'warning' ? 'HIGH' : 'LOW') as any,
        confidenceScore: 0.90,
        affectedZone: '',
        estimatedBenefit: 'Improves general venue operations SLA.',
        timestamp: n.timestamp,
        read: n.read,
      }));

      const recommendations = this.prioritizer.prioritizeInsights(insights, proactiveNotifications);

      // 5. Forecast Upcoming Operational Risks
      const predictedRisks = this.prioritizer.predictOperationalRisks(context);

      return {
        health,
        insights,
        recommendations,
        predictedRisks,
        timestamp,
        isSimulatedData: false,
      };
    } catch (error) {
      console.error('AI Command Center failed to compile live telemetry:', error);
      // Fallback with partial data
      return this.generateFallbackSummary(
        `Operational telemetry degraded: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Safe fail-over mechanism generating logical defaults during complete infrastructure failure.
   */
  private generateFallbackSummary(errorMessage: string): CommandCenterSummary {
    const timestamp = new Date().toISOString();
    return {
      health: {
        overallScore: 50,
        status: 'CRITICAL',
        security: { score: 50, status: 'CRITICAL', description: `Security stream interrupted. ${errorMessage}` },
        crowd: { score: 50, status: 'MODERATE', description: 'Crowd telemetry streams reporting stale feeds.' },
        concessions: { score: 50, status: 'OPTIMAL', description: 'Concession nodes operating on baseline cache.' },
        accessibility: { score: 50, status: 'OPTIMAL', description: 'ADA elevator transits unconfirmed.' },
        transport: { score: 50, status: 'OPTIMAL', description: 'Outer parking sensors degraded.' },
      },
      insights: {
        'Emergency Response Agent': {
          agentName: 'Emergency Response Agent',
          status: 'CRITICAL',
          insightSummary: `Connection failed: ${errorMessage}`,
          recommendedAction: 'Manually dispatch standard radio safety units to check perimeters.',
          confidence: 0.50,
        }
      },
      recommendations: [
        {
          id: `fallback-rec-${Date.now()}`,
          source: 'System Watchdog',
          title: 'Infrastructure Failover Triggered',
          summary: 'The stadium control cockpit has transitioned to local fallback protocols due to telemetry failure.',
          reasoning: 'Critical network/Gemini pipelines are currently unreachable.',
          recommendedAction: 'Enforce standard offline radio protocols and station commanders to manual check-ins.',
          confidence: 0.99,
          priority: 'CRITICAL',
          impactBenefit: 'Ensures operational continuity during signal dropouts.',
          status: 'CRITICAL',
          affectedArea: 'Command Center',
        }
      ],
      predictedRisks: [
        {
          id: 'fallback-risk-offline',
          hazard: 'Inability to track live crowd surge patterns',
          probability: 0.90,
          impact: 'HIGH',
          timeHorizonMinutes: 5,
          description: 'Loss of central live sensor visibility increases incident response latency.',
          triggerCondition: 'Cloud Run connection to telemetry API dropped.',
          mitigationStrategy: 'Enable physical spotters in high-risk zones SEC_108 and SEC_104.'
        }
      ],
      timestamp,
      isSimulatedData: true,
    };
  }
}
