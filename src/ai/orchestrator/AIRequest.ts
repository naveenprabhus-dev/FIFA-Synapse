/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseIntent } from '../../types/synapse';

export interface AIRequest {
  systemInstruction: string;
  userPrompt: string;
  modelName?: string;
  temperature?: number;
  maxOutputTokens?: number;
  intent?: SynapseIntent;
  requestId?: string;
}
