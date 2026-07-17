/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ParkingZoneStatus = 'AVAILABLE' | 'FILLING_FAST' | 'FULL' | 'CLOSED';

export interface ParkingZone {
  id: string; // e.g., "PARK_A"
  name: string; // e.g., "Lot A - North Entry"
  status: ParkingZoneStatus;
  totalCapacity: number;
  currentOccupiedCount: number;
  expectedExitMinutesAverage: number;
  accessibilitySpacesCount: number;
  accessibilitySpacesOccupied: number;
  hourlyRate?: number;
}
