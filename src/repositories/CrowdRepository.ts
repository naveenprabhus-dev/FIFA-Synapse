/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CrowdAnalysisData } from '../types/synapse';
import { RepositoryError } from '../utils/errors';

export interface CrowdRepository {
  getCrowdAnalysis(): Promise<CrowdAnalysisData[]>;
  getCrowdAnalysisBySector(sectorId: string): Promise<CrowdAnalysisData>;
  updateSectorCrowdData(sectorId: string, data: Partial<CrowdAnalysisData>): Promise<CrowdAnalysisData>;
}

export class MockCrowdRepository implements CrowdRepository {
  private crowdData: CrowdAnalysisData[] = [
    {
      sectorId: 'SEC_A',
      occupancyPercent: 82,
      flowRatePerMin: 124,
      status: 'CRITICAL',
    },
    {
      sectorId: 'SEC_B',
      occupancyPercent: 44,
      flowRatePerMin: 45,
      status: 'OPTIMAL',
    },
    {
      sectorId: 'SEC_C',
      occupancyPercent: 68,
      flowRatePerMin: 88,
      status: 'MODERATE',
    },
  ];

  async getCrowdAnalysis(): Promise<CrowdAnalysisData[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return this.crowdData.map((d) => ({ ...d }));
  }

  async getCrowdAnalysisBySector(sectorId: string): Promise<CrowdAnalysisData> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const data = this.crowdData.find((d) => d.sectorId === sectorId);
    if (!data) {
      throw new RepositoryError(`No crowd analysis for sector: ${sectorId}`, 'CROWD_DATA_NOT_FOUND');
    }
    return { ...data };
  }

  async updateSectorCrowdData(sectorId: string, data: Partial<CrowdAnalysisData>): Promise<CrowdAnalysisData> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = this.crowdData.findIndex((d) => d.sectorId === sectorId);
    if (index === -1) {
      throw new RepositoryError(`Cannot update. Sector not found: ${sectorId}`, 'CROWD_DATA_NOT_FOUND');
    }
    const updated = { ...this.crowdData[index], ...data };
    this.crowdData[index] = updated;
    return { ...updated };
  }
}
