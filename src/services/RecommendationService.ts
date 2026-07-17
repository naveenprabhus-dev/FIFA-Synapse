/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RecommendationRepository } from '../repositories/RecommendationRepository';
import { SynapseRecommendation, SynapseContext } from '../types/synapse';
import { ValidationError } from '../utils/errors';

export class RecommendationService {
  constructor(private recommendationRepo: RecommendationRepository) {}

  async getExplainableDecision(
    decisionType: 'CONCESSION_ROUTING' | 'STADIUM_EGRESS' | 'STAFF_REPLENISHMENT' | 'INCIDENT_DISPATCH',
    context: SynapseContext
  ): Promise<SynapseRecommendation<string>> {
    if (!decisionType) {
      throw new ValidationError('Decision type is required to trigger recommendations', 'EMPTY_DECISION_TYPE');
    }
    if (!context || !context.userId) {
      throw new ValidationError('A valid user context is required', 'INVALID_CONTEXT');
    }

    const recommendation = await this.recommendationRepo.getRecommendation(decisionType, context);
    
    // Custom post-processing reasoning expansion if required (orchestration)
    if (recommendation.confidence < 0.5) {
      recommendation.reasoning = [
        ...recommendation.reasoning,
        'Note: Low model confidence score. Human operator override is highly advised.'
      ];
    }

    // Save decision automatically in background for model fine-tuning logs
    await this.recommendationRepo.saveRecommendation(recommendation);

    return recommendation;
  }

  async getHistoricalDecisions(): Promise<SynapseRecommendation<string>[]> {
    return this.recommendationRepo.getSavedRecommendations();
  }
}
