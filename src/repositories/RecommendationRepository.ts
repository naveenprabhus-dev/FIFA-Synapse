/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseRecommendation } from '../types/synapse';

export interface RecommendationRepository {
  getRecommendation(decisionType: string, context: unknown): Promise<SynapseRecommendation<string>>;
  getSavedRecommendations(): Promise<SynapseRecommendation<string>[]>;
  saveRecommendation(rec: SynapseRecommendation<string>): Promise<SynapseRecommendation<string>>;
}

export class MockRecommendationRepository implements RecommendationRepository {
  private savedRecs: SynapseRecommendation<string>[] = [];

  private recommendations: Record<string, SynapseRecommendation<string>> = {
    'CONCESSION_ROUTING': {
      action: 'Redirect Zone B Egress to Sector 101 Gate A',
      alternative: 'Remain in the local Pizza Bistro line for 14 minutes',
      reasoning: [
        'Gate 4/Sector 104 is heavily congested (>4 people/sqm).',
        'Gate A (120m away) has zero queue wait time.'
      ],
      expectedOutcome: 'Saves approximately 14 minutes in waiting and transit times.',
      confidence: 0.96,
    },
    'STAFF_REPLENISHMENT': {
      action: 'Pre-load transport carts for Sector 104 Beverage Replenishment',
      alternative: 'Wait for stock level to fall below 10%',
      reasoning: [
        'High sales spikes detected during the live half-time window.',
        'Current stock at Sector 104 stands at only 24% capacity.'
      ],
      expectedOutcome: 'Avoids total stockout and improves concession throughput by 18%.',
      confidence: 0.91,
    }
  };

  async getRecommendation(decisionType: string, _context: unknown): Promise<SynapseRecommendation<string>> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const rec = this.recommendations[decisionType];
    if (!rec) {
      // Fallback robust default recommendation so we don't throw blocking errors
      return {
        action: `Maintain current operational routine for ${decisionType}`,
        alternative: 'Escalate to supervisor dispatch controls',
        reasoning: ['Current metrics indicate normal baseline conditions.'],
        expectedOutcome: 'Stabilizes current operations with nominal overhead.',
        confidence: 0.85,
      };
    }
    return { ...rec };
  }

  async getSavedRecommendations(): Promise<SynapseRecommendation<string>[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return this.savedRecs.map((r) => ({ ...r }));
  }

  async saveRecommendation(rec: SynapseRecommendation<string>): Promise<SynapseRecommendation<string>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    this.savedRecs.push({ ...rec });
    return { ...rec };
  }
}
