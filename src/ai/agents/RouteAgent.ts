/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseCore } from '../orchestrator/SynapseCore';
import { SynapseCoreRecommendation } from '../../types/synapse';
import { UserRole } from '../../types/user';

export class RouteAgent {
  constructor(private synapseCore: SynapseCore) {}

  /**
   * Calculates optimized safe pathways between locations.
   */
  public async calculateSmartRoute(
    originName: string,
    destinationName: string,
    requiresAccessibility: boolean,
    userId: string,
    activeRole: UserRole,
    location?: { latitude: number; longitude: number; sectorId?: string }
  ): Promise<SynapseCoreRecommendation> {
    const accessibilityNote = requiresAccessibility ? ' utilizing accessibility corridors, avoiding stairs and high-density corridors' : '';
    const query = `Calculate optimized smart navigation path from ${originName} to ${destinationName}${accessibilityNote}`;

    return this.synapseCore.getRecommendation(
      query,
      {
        userId,
        activeRole,
        location,
      },
      {
        requiresAccessibility,
        destinationName,
        originName,
        timeoutMs: 4000,
      }
    );
  }
}
