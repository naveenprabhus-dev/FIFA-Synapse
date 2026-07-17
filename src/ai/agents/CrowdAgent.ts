/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseCore } from '../orchestrator/SynapseCore';
import { SynapseCoreRecommendation } from '../../types/synapse';
import { UserRole } from '../../types/user';

export class CrowdAgent {
  constructor(private synapseCore: SynapseCore) {}

  /**
   * Forecasts crowd density trends and potential bottleneck points in a specific sector.
   */
  public async forecastSectorCrowd(
    sectorId: string,
    userId: string,
    activeRole: UserRole,
    location?: { latitude: number; longitude: number; sectorId?: string }
  ): Promise<SynapseCoreRecommendation> {
    const query = `Analyze real-time crowd congestion sensors and predict bottleneck flow risks for Sector ${sectorId}`;
    
    return this.synapseCore.getRecommendation(
      query,
      {
        userId,
        activeRole,
        location: location ?? (location ? { ...location, sectorId } : { latitude: 25.3522, longitude: 51.5311, sectorId }),
      },
      {
        timeoutMs: 4000,
      }
    );
  }
}
