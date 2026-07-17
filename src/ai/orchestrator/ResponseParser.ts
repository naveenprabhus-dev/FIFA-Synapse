/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseCoreRecommendation, SynapseIntent, SynapsePriority } from '../../types/synapse';
import { AppError } from '../../utils/errors';

export class ResponseParser {
  /**
   * Cleans raw AI provider text, parses the JSON payload, and returns a fully structured, strongly typed recommendation model.
   * Tolerates parsing errors by returning a gracefully constructed fallback recommendation.
   */
  public parseResponse(rawText: string, intent: SynapseIntent): SynapseCoreRecommendation {
    const timestamp = new Date().toISOString();
    const id = `rec-core-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
      if (!rawText || rawText.trim() === '') {
        throw new AppError('AI provider returned an empty response string.', 'AI_EMPTY_RESPONSE');
      }

      // 1. Sanitize text by stripping potential markdown code block wrappers
      let cleanedText = rawText.trim();
      
      // Match ```json ... ``` or ``` ... ``` patterns
      const markdownCodeBlockRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;
      const match = cleanedText.match(markdownCodeBlockRegex);
      if (match) {
        cleanedText = match[1].trim();
      }

      // 2. Parse JSON
      const parsed = JSON.parse(cleanedText);

      // 3. Extract and sanitize fields with robust fallback defaults
      const title = String(parsed.title || parsed.action || 'Synapse Action Directive');
      const recommendation = String(parsed.recommendation || parsed.action || 'Maintain normal baseline operational checks.');
      const reason = String(parsed.reason || parsed.justification || 'Baseline metrics are operating within safe bounds.');
      
      let confidenceScore = Number(parsed.confidenceScore ?? parsed.confidence ?? 0.85);
      if (isNaN(confidenceScore) || confidenceScore < 0 || confidenceScore > 1) {
        confidenceScore = 0.85;
      }

      let priority: SynapsePriority = 'LOW';
      const parsedPriority = String(parsed.priority || 'LOW').toUpperCase();
      if (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(parsedPriority)) {
        priority = parsedPriority as SynapsePriority;
      } else if (intent === 'EMERGENCY') {
        priority = 'CRITICAL';
      }

      const suggestedAction = String(parsed.suggestedAction || parsed.actionStep || 'Monitor current sensors and status.');
      const estimatedBenefit = String(parsed.estimatedBenefit || parsed.expectedOutcome || 'Stabilizes venue throughput.');
      const alternative = parsed.alternative ? String(parsed.alternative) : undefined;
      
      let reasoningDetails: string[] | undefined;
      if (Array.isArray(parsed.reasoningDetails)) {
        reasoningDetails = parsed.reasoningDetails.map(String);
      } else if (Array.isArray(parsed.reasoning)) {
        reasoningDetails = parsed.reasoning.map(String);
      }

      return {
        id,
        title,
        recommendation,
        reason,
        confidenceScore,
        priority,
        suggestedAction,
        estimatedBenefit,
        timestamp,
        intent,
        alternative,
        rawResponse: rawText,
        contextSnapshot: parsed,
        reasoningDetails,
      };

    } catch (error) {
      // 4. Graceful Fallback Recovery - never crash the stadium control interface!
      const errorMessage = error instanceof Error ? error.message : 'Unknown parsing failure';
      
      return {
        id,
        title: `Synapse Recovery Directive (${intent})`,
        recommendation: 'Observe surrounding area and follow default steward instructions.',
        reason: `AI Orchestration warning: Automated model output could not be formatted into structured telemetry. Error detail: ${errorMessage}`,
        confidenceScore: 0.5,
        priority: intent === 'EMERGENCY' ? 'CRITICAL' : 'LOW',
        suggestedAction: 'Rely on secondary analog/steward signage or notify venue support.',
        estimatedBenefit: 'Guarantees operational safety and UI rendering during cloud network dropouts.',
        timestamp,
        intent,
        rawResponse: rawText,
      };
    }
  }
}
