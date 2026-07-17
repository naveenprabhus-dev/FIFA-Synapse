/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TokenUsage {
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
}

export class TokenUsageModel {
  public static calculateTotal(usage?: Partial<TokenUsage>): TokenUsage {
    const promptTokens = usage?.promptTokens || 0;
    const candidatesTokens = usage?.candidatesTokens || 0;
    const totalTokens = usage?.totalTokens || (promptTokens + candidatesTokens);
    return {
      promptTokens,
      candidatesTokens,
      totalTokens,
    };
  }
}
