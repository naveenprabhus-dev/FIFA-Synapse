/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CrowdRepository } from '../repositories/CrowdRepository';
import { CrowdAnalysisData } from '../types/synapse';
import { ValidationError } from '../utils/errors';

export class CrowdService {
  constructor(private crowdRepo: CrowdRepository) {}

  async getAllSectorDensities(): Promise<CrowdAnalysisData[]> {
    return this.crowdRepo.getCrowdAnalysis();
  }

  async checkCongestionThresholds(criticalOccupancyPercent = 80): Promise<CrowdAnalysisData[]> {
    const data = await this.crowdRepo.getCrowdAnalysis();
    return data.filter((d) => d.occupancyPercent >= criticalOccupancyPercent || d.status === 'CRITICAL');
  }

  async triggerSmartEvacuationRecommendation(sectorId: string): Promise<string> {
    if (!sectorId) {
      throw new ValidationError('Sector ID must be specified', 'EMPTY_SECTOR_ID');
    }
    const data = await this.crowdRepo.getCrowdAnalysisBySector(sectorId);
    if (data.status === 'CRITICAL') {
      return `ALERT: Sector ${sectorId} occupancy is at ${data.occupancyPercent}%. Recommending alternative route evacuation options immediately.`;
    }
    return `Sector ${sectorId} is stable under nominal capacity load (${data.occupancyPercent}%).`;
  }
}
