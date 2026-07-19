/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VenueRepository } from '../repositories/VenueRepository';
import { FoodCourtRepository } from '../repositories/FoodCourtRepository';
import { ParkingRepository } from '../repositories/ParkingRepository';
import { BathroomTelemetry } from '../types/stadium';
import { FoodCourt } from '../types/concessions';
import { ParkingZone } from '../types/parking';

export class VenueService {
  constructor(
    private venueRepo: VenueRepository,
    private foodCourtRepo: FoodCourtRepository,
    private parkingRepo: ParkingRepository
  ) {}

  async getDashboardSummary(): Promise<{
    stadiumName: string;
    gateOpenCount: number;
    congestedGatesCount: number;
    busyRestrooms: BathroomTelemetry[];
    totalOccupancyPercent: number;
  }> {
    const stadium = await this.venueRepo.getStadiumDetails();
    const gates = stadium.gates;
    const restrooms = stadium.restrooms;
    const sections = stadium.sections;

    const gateOpenCount = gates.filter((g) => g.status === 'OPEN').length;
    const congestedGatesCount = gates.filter((g) => g.congestionIndex >= 0.6).length;
    const busyRestrooms = restrooms.filter((r) => r.queueLength >= 8);

    const totalCap = sections.reduce((sum, s) => sum + s.capacity, 0);
    const currentOcc = sections.reduce((sum, s) => sum + s.currentOccupancy, 0);
    const totalOccupancyPercent = totalCap > 0 ? Math.round((currentOcc / totalCap) * 100) : 0;

    return {
      stadiumName: stadium.name,
      gateOpenCount,
      congestedGatesCount,
      busyRestrooms,
      totalOccupancyPercent,
    };
  }

  async locateShortestFoodCourtQueue(category?: string): Promise<FoodCourt> {
    const foodCourts = await this.foodCourtRepo.getFoodCourts();
    const openCourts = foodCourts.filter((fc) => fc.status === 'OPEN');
    
    let candidates = openCourts;
    if (category) {
      candidates = openCourts.filter((fc) => fc.categories.includes(category));
    }

    if (candidates.length === 0) {
      // If none found with filter, fall back to any open court
      candidates = openCourts;
    }

    // Sort by current queue length ascending
    candidates.sort((a, b) => a.queue.currentLength - b.queue.currentLength);
    return candidates[0];
  }

  async getParkingAvailability(): Promise<{
    zones: ParkingZone[];
    totalSpaces: number;
    totalOccupied: number;
    overallStatus: 'AVAILABLE' | 'FULL_SOON' | 'FULL';
  }> {
    const zones = await this.parkingRepo.getParkingZones();
    const totalSpaces = zones.reduce((sum, z) => sum + z.totalCapacity, 0);
    const totalOccupied = zones.reduce((sum, z) => sum + z.currentOccupiedCount, 0);

    const percentage = totalSpaces > 0 ? totalOccupied / totalSpaces : 0;
    let overallStatus: 'AVAILABLE' | 'FULL_SOON' | 'FULL' = 'AVAILABLE';
    if (percentage >= 0.95) {
      overallStatus = 'FULL';
    } else if (percentage >= 0.8) {
      overallStatus = 'FULL_SOON';
    }

    return { zones, totalSpaces, totalOccupied, overallStatus };
  }
}
