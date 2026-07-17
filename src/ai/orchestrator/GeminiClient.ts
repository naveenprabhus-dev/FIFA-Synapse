/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIRequest } from './AIRequest';
import { AIResponse } from './AIResponse';
import {
  APIError,
  RateLimitError,
  TimeoutError,
  NetworkFailureError,
  MalformedJSONError,
  AIError,
} from './AIError';

export class GeminiClient {
  constructor(
    private apiEndpoint: string = '/api/gemini/generate',
    private maxRetries: number = 3,
    private initialDelayMs: number = 500
  ) {}

  /**
   * Sends a compiled prompt payload to the server-side proxy route `/api/gemini/generate`.
   * Enforces exponential backoff retry policies for rate-limits (429) and network drops.
   */
  public async sendPrompt(request: AIRequest, timeoutMs: number = 8000): Promise<AIResponse> {
    let attempts = 0;
    let delay = this.initialDelayMs;

    while (attempts < this.maxRetries) {
      attempts++;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        });

        clearTimeout(id);

        if (!response.ok) {
          // Handle rate limit error
          if (response.status === 429) {
            if (attempts < this.maxRetries) {
              console.warn(`[GeminiClient] Rate limit (429) detected. Retrying in ${delay}ms... (Attempt ${attempts}/${this.maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, delay));
              delay *= 2; // Exponential backoff
              continue;
            }
            throw new RateLimitError('Gemini API rate limit exceeded. Please wait before requesting again.');
          }

          // Handle generic API error
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
          throw new APIError(`Gemini server API failed: ${errorMsg}`, { status: response.status });
        }

        const data = await response.json();
        
        if (!data || typeof data.rawText !== 'string') {
          throw new MalformedJSONError('Server response was empty or malformed.');
        }

        return data as AIResponse;

      } catch (error) {
        clearTimeout(id);

        // Check if aborted (timeout)
        if (error instanceof Error && error.name === 'AbortError') {
          if (attempts < this.maxRetries) {
            console.warn(`[GeminiClient] Request timed out. Retrying in ${delay}ms... (Attempt ${attempts}/${this.maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
            continue;
          }
          throw new TimeoutError(`Request timed out after ${timeoutMs}ms.`);
        }

        // Retry for general network errors
        if (error instanceof TypeError) {
          if (attempts < this.maxRetries) {
            console.warn(`[GeminiClient] Network failure. Retrying in ${delay}ms... (Attempt ${attempts}/${this.maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
            continue;
          }
          throw new NetworkFailureError('Failed to communicate with the stadium Synapse server. Please check your internet connection.');
        }

        if (error instanceof AIError) {
          throw error;
        }

        throw new APIError(error instanceof Error ? error.message : 'Unknown inference error.');
      }
    }

    throw new NetworkFailureError('Max retries exceeded while processing Synapse recommendation.');
  }
}
