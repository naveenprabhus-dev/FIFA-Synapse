/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseCore } from '../orchestrator/SynapseCore';
import { SynapseCoreRecommendation } from '../../types/synapse';
import { UserRole } from '../../types/user';

export interface FoodRecommendationOptions {
  categoryFilter?: string;
  searchQuery?: string;
  halalOnly?: boolean;
  vegetarianOnly?: boolean;
  accessibilityRequired?: boolean;
}

export class FoodAgent {
  constructor(private synapseCore: SynapseCore) {}

  /**
   * Suggests the optimal concession option based on real-time queues, location, and user preferences.
   */
  public async getSmartFoodRecommendations(
    userId: string,
    activeRole: UserRole,
    location?: { latitude: number; longitude: number; sectorId?: string },
    options?: FoodRecommendationOptions
  ): Promise<SynapseCoreRecommendation> {
    const query = `Recommend the smartest concession choices. Filters: ${JSON.stringify(options || {})}. Current Sector: ${location?.sectorId || 'Unknown'}`;
    
    return this.synapseCore.getRecommendation(
      query,
      {
        userId,
        activeRole,
        location,
      },
      {
        timeoutMs: 6000,
        ...options,
      } as any
    );
  }
}
