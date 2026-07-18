/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseCore } from '../orchestrator/SynapseCore';
import { SynapseCoreRecommendation } from '../../types/synapse';
import { UserRole } from '../../types/user';
import { EmergencyContextOptions } from '../../types/emergency';

export class EmergencyAgent {
  constructor(private synapseCore: SynapseCore) {}

  /**
   * Resolves emergency dispatching, safe route calculation, and evacuation directives
   * based on role-based intelligence, weather, and active incident telemetry.
   */
  public async getEmergencyDirectives(
    userId: string,
    activeRole: UserRole,
    location?: { latitude: number; longitude: number; sectorId?: string },
    options?: EmergencyContextOptions
  ): Promise<SynapseCoreRecommendation> {
    const query = `Urgent Emergency Response Action Directive for ${options?.emergencyType || 'General Emergency'}. Active Sector: ${location?.sectorId || 'Unknown'}. User Role: ${activeRole}. Accessibility requirement: ${options?.accessibilityNeeds || 'NONE'}.`;

    return this.synapseCore.getRecommendation(
      query,
      {
        userId,
        activeRole,
        location,
      },
      {
        timeoutMs: 5000,
        ...options,
      } as any
    );
  }
}
