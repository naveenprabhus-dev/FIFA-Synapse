/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StadiumNode } from './types';

export const STADIUM_NODES: StadiumNode[] = [
  {
    id: 'SEC_104',
    name: 'Sector 104 (West General)',
    category: 'SECTOR',
    latitude: 25.3522,
    longitude: 51.5311,
    accessibilityFeatures: ['Elevator 2 Access', 'ADA Ramp W1'],
  },
  {
    id: 'SEC_112',
    name: 'Sector 112 (East Lower Stand)',
    category: 'SECTOR',
    latitude: 25.3535,
    longitude: 51.5325,
    accessibilityFeatures: ['ADA Lift E2'],
  },
  {
    id: 'SEC_120',
    name: 'Sector 120 (South Family Wing)',
    category: 'SECTOR',
    latitude: 25.3510,
    longitude: 51.5305,
    accessibilityFeatures: ['ADA Ramp S3'],
  },
  {
    id: 'SEC_128',
    name: 'Sector 128 (Main VIP Suite)',
    category: 'SECTOR',
    latitude: 25.3525,
    longitude: 51.5295,
    accessibilityFeatures: ['Priority VIP Elevators', 'Ramp W2', 'ADA Assist Desk'],
  },
  {
    id: 'GATE_A',
    name: 'Main Exit Gate A (North Promenade)',
    category: 'GATE',
    latitude: 25.3540,
    longitude: 51.5320,
    accessibilityFeatures: ['Low Threshold Turnstiles', 'Direct Tram Link'],
  },
  {
    id: 'GATE_B',
    name: 'East Gate B Plaza (Metro Station Link)',
    category: 'GATE',
    latitude: 25.3530,
    longitude: 51.5340,
    accessibilityFeatures: ['Metro Escalator Elevator', 'Tactile Paving'],
  },
  {
    id: 'GATE_C',
    name: 'South Gate C (Taxi & Rideshare Link)',
    category: 'GATE',
    latitude: 25.3501,
    longitude: 51.5310,
    accessibilityFeatures: ['Wheelchair Transfer Lane'],
  },
  {
    id: 'VIP_LOUNGE',
    name: 'Presidential VIP Lounge',
    category: 'AMENITY',
    latitude: 25.3528,
    longitude: 51.5298,
    accessibilityFeatures: ['Complete ADA access', 'Direct Elevator Access'],
  },
  {
    id: 'FOOD_COURT_A',
    name: 'Pizza Plaza Food Court (Zone A)',
    category: 'AMENITY',
    latitude: 25.3525,
    longitude: 51.5315,
    accessibilityFeatures: ['Lowered Counters', 'Spacious Seating'],
  },
  {
    id: 'RESTROOM_B',
    name: 'ADA Assisted Restroom (West Quad)',
    category: 'AMENITY',
    latitude: 25.3523,
    longitude: 51.5308,
    accessibilityFeatures: ['Automated Doors', 'Changing Bench', 'Braille Signage'],
  },
  {
    id: 'PARKING_LOT_3',
    name: 'ADA Premium Parking Lot 3',
    category: 'PARKING',
    latitude: 25.3545,
    longitude: 51.5335,
    accessibilityFeatures: ['Reserved Wheelchair Bays', 'Level Access Link'],
  },
];
