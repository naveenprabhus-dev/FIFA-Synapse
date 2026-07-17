/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseCoreRecommendation, SynapseIntent } from '../../types/synapse';
import { UserRole } from '../../types/user';
import { ValidationError } from '../../utils/errors';
import { IntentEngine } from './IntentEngine';
import { ContextBuilder } from './ContextBuilder';
import { DecisionEngine } from './DecisionEngine';
import { PromptBuilder } from './PromptBuilder';
import { AIProvider } from './AIProvider';
import { ResponseParser } from './ResponseParser';

export class SynapseCore {
  constructor(
    private intentEngine: IntentEngine,
    private contextBuilder: ContextBuilder,
    private decisionEngine: DecisionEngine,
    private promptBuilder: PromptBuilder,
    private aiProvider: AIProvider,
    private responseParser: ResponseParser
  ) {}

  /**
   * Orchestrates the Synapse Intelligence loop workflow.
   * Takes a user query and returns a robust, explainable decision recommendation model.
   */
  public async getRecommendation(
    query: string,
    contextParams: {
      userId: string;
      activeRole: UserRole;
      location?: { latitude: number; longitude: number; sectorId?: string };
    },
    options?: {
      timeoutMs?: number;
      requiresAccessibility?: boolean;
      destinationName?: string;
      originName?: string;
    }
  ): Promise<SynapseCoreRecommendation> {
    if (!query || query.trim() === '') {
      throw new ValidationError('A query instruction is required to consult Synapse Core.', 'EMPTY_QUERY');
    }

    // 1. Intent Detection
    const intent = this.intentEngine.detectIntent(query);

    // 2. Context Gathering
    const fullContext = await this.contextBuilder.buildContext(
      contextParams.userId,
      contextParams.activeRole,
      contextParams.location
    );

    // 3. Decision Pre-analysis (RBAC, heuristics, bypass assessment)
    const decision = this.decisionEngine.analyzeDecision(intent, fullContext);

    if (decision.isBlockedByPermission) {
      throw new ValidationError(
        `Security Policy: Your role '${contextParams.activeRole}' is not permitted to perform '${intent}' actions.`,
        'RBAC_POLICY_VIOLATION'
      );
    }

    let recommendation: SynapseCoreRecommendation;

    // 4. Execution pathway division
    if (decision.shouldCallLLM) {
      try {
        // Compile system and user prompts
        const compiledPrompt = this.promptBuilder.buildPrompt(intent, fullContext, {
          ...options,
          query,
        });

        // Run Provider inference
        const timeout = options?.timeoutMs ?? 5000;
        const providerResponse = await this.aiProvider.generateContent(compiledPrompt, timeout);

        // Parse result
        recommendation = this.responseParser.parseResponse(providerResponse.rawText, intent);

      } catch (providerError) {
        // Failover recovery - fallback gracefully to direct heuristic decisions
        const errorReason = providerError instanceof Error ? providerError.message : 'Unknown model timeout';
        
        let fallbackAction = 'Observe stadium staff stewards and follow main digital exit boards.';
        if (intent === 'FOOD_RECOMMENDATION' && decision.preComputedMetrics?.nearestConcessionId) {
          fallbackAction = `Proceed to concession '${decision.preComputedMetrics.nearestConcessionId}' as pre-calculated by local queue telemetry.`;
        } else if (intent === 'NAVIGATION' && contextParams.location?.sectorId) {
          fallbackAction = `Exit Sector ${contextParams.location.sectorId} immediately through default local exit channels.`;
        }

        recommendation = {
          id: `rec-fallback-${Date.now()}`,
          title: `Fallback Intelligence Directive (${intent})`,
          recommendation: fallbackAction,
          reason: `AI Orchestration Service temporarily unreachable (${errorReason}). Reverted to offline heuristic backup pathing.`,
          confidenceScore: 0.75,
          priority: decision.suggestedPriority,
          suggestedAction: 'Rely on secondary physical indicators, steward flags, and gate stewards.',
          estimatedBenefit: 'Bypasses server downtime completely and enforces reliable wayfinding guidelines.',
          timestamp: new Date().toISOString(),
          intent,
        };
      }
    } else {
      // 5. Bypass Pathway - Direct heuristic action
      recommendation = {
        id: `rec-direct-${Date.now()}`,
        title: `Dynamic Policy Assignment (${intent})`,
        recommendation: decision.policyNotice || 'Proceed with normal local sector patrol routines.',
        reason: 'Stadium Decision Engine skipped LLM inference latency due to critical time-safety policies.',
        confidenceScore: 1.0,
        priority: decision.suggestedPriority,
        suggestedAction: 'Coordinate with local security commanders or volunteers.',
        estimatedBenefit: 'Guarantees sub-millisecond dispatch times under critical match events.',
        timestamp: new Date().toISOString(),
        intent,
      };
    }

    // Apply calculated priority and pre-inference reasoning to expand explanations
    recommendation.priority = decision.suggestedPriority;
    
    const preReasoning = decision.preInferenceReasoning;
    if (preReasoning.length > 0) {
      recommendation.rawResponse = recommendation.rawResponse ?? 'Inference bypassed by rule-engine.';
      const existingDetails = recommendation.reasoningDetails || [];
      recommendation.reasoningDetails = [...preReasoning, ...existingDetails];
    }

    return recommendation;
  }
}
