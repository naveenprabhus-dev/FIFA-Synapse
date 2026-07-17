/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProvider, AIProviderResponse } from './AIProvider';
import { CompiledPrompt } from './PromptBuilder';
import { GeminiClient } from './GeminiClient';
import { AIRequest } from './AIRequest';

export class GeminiProvider implements AIProvider {
  // Observability metrics (non-sensitive stadium telemetry metrics)
  private static metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalLatencyMs: 0,
    totalTokensUsed: 0,
  };

  constructor(private client: GeminiClient) {}

  /**
   * Generates structured decision suggestions by utilizing GeminiClient to proxy to server-side Gemini SDK.
   */
  public async generateContent(prompt: CompiledPrompt, timeoutMs: number = 8000): Promise<AIProviderResponse> {
    const startTime = Date.now();
    GeminiProvider.metrics.totalRequests++;

    const request: AIRequest = {
      systemInstruction: prompt.systemInstruction,
      userPrompt: prompt.userPrompt,
      modelName: 'gemini-3.5-flash',
      temperature: 0.2,
    };

    try {
      console.log(`[GeminiProvider] Initializing secure proxy call (Request ID is typed and logged).`);
      
      const response = await this.client.sendPrompt(request, timeoutMs);
      
      const duration = Date.now() - startTime;
      GeminiProvider.metrics.successfulRequests++;
      GeminiProvider.metrics.totalLatencyMs += duration;

      const tokens = response.tokenUsage?.totalTokens || 0;
      GeminiProvider.metrics.totalTokensUsed += tokens;

      console.log(`[GeminiProvider] Secure prompt complete. Duration: ${duration}ms, Tokens: ${tokens}.`);

      return {
        rawText: response.rawText,
        tokensUsed: tokens,
        modelName: response.modelName,
      };

    } catch (error) {
      GeminiProvider.metrics.failedRequests++;
      console.error(`[GeminiProvider] Secure prompt call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Retrieve aggregated provider metrics for the stadium dashboard.
   */
  public static getObservabilityMetrics() {
    const total = this.metrics.totalRequests;
    const successRate = total > 0 ? (this.metrics.successfulRequests / total) * 100 : 100;
    const avgLatency = this.metrics.successfulRequests > 0 
      ? this.metrics.totalLatencyMs / this.metrics.successfulRequests 
      : 0;

    return {
      totalRequests: total,
      successfulRequests: this.metrics.successfulRequests,
      failedRequests: this.metrics.failedRequests,
      successRatePercent: Number(successRate.toFixed(2)),
      avgLatencyMs: Number(avgLatency.toFixed(2)),
      totalTokensUsed: this.metrics.totalTokensUsed,
    };
  }
}
