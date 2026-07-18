/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseCore } from '../orchestrator/SynapseCore';
import { SynapseCoreRecommendation } from '../../types/synapse';
import { UserRole } from '../../types/user';
import { AccessibilityContextOptions } from '../../types/accessibility';

export class AccessibilityAgent {
  constructor(private synapseCore: SynapseCore) {}

  /**
   * Generates step-free routing, accessibility facility mapping, and profile-specific sensory/wayfinding guidance.
   */
  public async getAccessibilityDirectives(
    userId: string,
    activeRole: UserRole,
    location?: { latitude: number; longitude: number; sectorId?: string },
    options?: AccessibilityContextOptions
  ): Promise<SynapseCoreRecommendation> {
    const profileName = options?.profileType || 'Standard Mobility';
    const query = `Provide comprehensive step-free path and wayfinding recommendations for profile type: ${profileName}. Origin sector: ${location?.sectorId || options?.locationSector || 'Unknown'}. Target destination: ${options?.destinationSector || 'Unknown'}. User role context is ${activeRole}. Elevator status: ${options?.elevatorStatus || 'OPERATIONAL'}. Ramp status: ${options?.rampAvailability || 'AVAILABLE'}.`;

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
