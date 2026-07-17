/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TokenUsage } from './TokenUsageModel';

export interface AIResponse {
  rawText: string;
  modelName: string;
  tokenUsage?: TokenUsage;
  durationMs: number;
  success: boolean;
  error?: {
    message: string;
    code: string;
  };
}
