/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseIntent } from '../../types/synapse';
import { ValidationError } from '../../utils/errors';

export class IntentEngine {
  private static KEYWORD_MAP: { intent: SynapseIntent; keywords: string[] }[] = [
    {
      intent: 'EMERGENCY',
      keywords: ['emergency', 'fire', 'smoke', 'panic', 'injury', 'medical', 'police', 'danger', 'hazard', 'evacuate', 'accident', 'hurt'],
    },
    {
      intent: 'ACCESSIBILITY',
      keywords: ['accessibility', 'wheelchair', 'disabled', 'elevator', 'ramp', 'lift', 'stairs', 'mobility', 'handicapped'],
    },
    {
      intent: 'NAVIGATION',
      keywords: ['navigation', 'route', 'exit', 'gate', 'go to', 'egress', 'walk', 'map', 'path', 'direction', 'where is', 'locate'],
    },
    {
      intent: 'FOOD_RECOMMENDATION',
      keywords: ['food', 'concession', 'eat', 'drink', 'hungry', 'beverage', 'beer', 'burger', 'pizza', 'line', 'snack', 'hot dog', 'hotdog', 'cafe', 'restaurant'],
    },
    {
      intent: 'CROWD',
      keywords: ['crowd', 'congested', 'busy', 'crowded', 'density', 'heatmap', 'packed', 'flow', 'congestion', 'queue', 'wait time'],
    },
    {
      intent: 'PARKING',
      keywords: ['parking', 'car', 'drive', 'garage', 'lot', 'park', 'valet', 'vehicle'],
    },
    {
      intent: 'MATCH_INFORMATION',
      keywords: ['match', 'score', 'minute', 'who scored', 'goal', 'kickoff', 'time', 'game', 'france', 'morocco', 'timeline', 'whistle', 'half', 'card', 'foul'],
    },
    {
      intent: 'OPERATIONS',
      keywords: ['operations', 'operator', 'deployment', 'stadium operations', 'volunteer', 'cleaning', 'restroom', 'lost & found', 'lost and found', 'maintenance', 'gate monitoring', 'queue monitoring', 'medical team', 'security deployment', 'dispatch volunteer', 'restroom capacity'],
    },
  ];

  /**
   * Detects the user's intent from the raw input query string.
   * Utilizes keyword classification with a fallback to general assistance.
   */
  public detectIntent(query: string): SynapseIntent {
    if (!query || query.trim() === '') {
      throw new ValidationError('Query input is empty, cannot detect intent', 'EMPTY_QUERY');
    }

    const cleanQuery = query.toLowerCase();

    for (const mapping of IntentEngine.KEYWORD_MAP) {
      for (const word of mapping.keywords) {
        if (cleanQuery.includes(word)) {
          return mapping.intent;
        }
      }
    }

    return 'GENERAL_ASSISTANCE';
  }
}
