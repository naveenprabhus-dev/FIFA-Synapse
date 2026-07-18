/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseCore } from '../orchestrator/SynapseCore';
import { SynapseCoreRecommendation } from '../../types/synapse';
import { UserRole } from '../../types/user';
import { OperationsContextOptions } from '../../types/operations';

export class OperationsAgent {
  constructor(private synapseCore: SynapseCore) {}

  /**
   * Evaluates operational status, crowd flows, queue backlogs, gate structures,
   * cleaning conditions, and medical availability to produce AI-directed operations directives.
   */
  public async getOperationsDirectives(
    userId: string,
    activeRole: UserRole,
    location?: { latitude: number; longitude: number; sectorId?: string },
    options?: OperationsContextOptions
  ): Promise<SynapseCoreRecommendation> {
    const query = `Provide comprehensive Operations Intelligence recommendations. Area of interest: ${options?.currentZone || 'Unknown Sector'}. Current Role: ${activeRole}. Crowd density is ${options?.liveCrowdDensity || 0}%, Queue size is ${options?.queueLength || 0} guests, Gate Status is ${options?.gateStatus || 'NORMAL'}. Volunteer count: ${options?.volunteerCount || 0}. Security count: ${options?.securityCount || 0}. Medical availability: ${options?.medicalTeamAvailable ? 'AVAILABLE' : 'BUSY'}. Cleaning status: ${options?.cleaningStatus || 'CLEAN'}.`;

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
