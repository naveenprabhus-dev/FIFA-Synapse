/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ParkingZone } from '../types/parking';
import { RepositoryError } from '../utils/errors';

export interface ParkingRepository {
  getParkingZones(): Promise<ParkingZone[]>;
  getParkingZoneById(id: string): Promise<ParkingZone>;
  updateParkingOccupancy(id: string, occupiedCount: number): Promise<ParkingZone>;
}

export class MockParkingRepository implements ParkingRepository {
  private parkingZones: ParkingZone[] = [
    {
      id: 'LOT_A',
      name: 'North VIP Lot A',
      status: 'FILLING_FAST',
      totalCapacity: 500,
      currentOccupiedCount: 450,
      expectedExitMinutesAverage: 20,
      accessibilitySpacesCount: 40,
      accessibilitySpacesOccupied: 38,
      hourlyRate: 15,
    },
    {
      id: 'LOT_B',
      name: 'South Public Lot B',
      status: 'AVAILABLE',
      totalCapacity: 800,
      currentOccupiedCount: 120,
      expectedExitMinutesAverage: 12,
      accessibilitySpacesCount: 60,
      accessibilitySpacesOccupied: 10,
      hourlyRate: 10,
    },
  ];

  async getParkingZones(): Promise<ParkingZone[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return this.parkingZones.map((z) => ({ ...z }));
  }

  async getParkingZoneById(id: string): Promise<ParkingZone> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const zone = this.parkingZones.find((z) => z.id === id);
    if (!zone) {
      throw new RepositoryError(`Parking zone not found: ${id}`, 'PARKING_ZONE_NOT_FOUND');
    }
    return { ...zone };
  }

  async updateParkingOccupancy(id: string, occupiedCount: number): Promise<ParkingZone> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const index = this.parkingZones.findIndex((z) => z.id === id);
    if (index === -1) {
      throw new RepositoryError(`Parking zone not found to update: ${id}`, 'PARKING_ZONE_NOT_FOUND');
    }
    const zone = this.parkingZones[index];
    if (occupiedCount < 0 || occupiedCount > zone.totalCapacity) {
      throw new RepositoryError(`Occupied count ${occupiedCount} out of capacity bounds [0, ${zone.totalCapacity}]`, 'INVALID_CAPACITY_BOUNDS');
    }
    let status: ParkingZone['status'] = 'AVAILABLE';
    const fillPercent = occupiedCount / zone.totalCapacity;
    if (fillPercent >= 1.0) {
      status = 'FULL';
    } else if (fillPercent >= 0.8) {
      status = 'FILLING_FAST';
    }

    const updated = {
      ...zone,
      currentOccupiedCount: occupiedCount,
      status,
    };
    this.parkingZones[index] = updated;
    return { ...updated };
  }
}
