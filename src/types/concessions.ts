/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface QueueTelemetry {
  currentLength: number; // exact count in physical queue
  predictedLength15Min: number; // forecasted count
  predictedLength30Min: number; // forecasted count
  trend: 'STABLE' | 'RISING' | 'FALLING';
  confidenceScore: number; // float 0.0 to 1.0
  estimatedWaitMinutes: number;
  lastUpdated: string; // ISO string
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'FOOD' | 'BEVERAGE' | 'SNACK' | 'MERCHANDISE';
  price: number;
  isAvailable: boolean;
  isHalal: boolean;
  isVegetarian: boolean;
  estimatedPrepTimeSeconds: number;
  stockLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'OUT_OF_STOCK';
}

export interface FoodCourt {
  id: string;
  name: string;
  locationDescription: string;
  status: 'OPEN' | 'CLOSED' | 'REPLENISHING';
  categories: string[]; // e.g. ["PIZZA", "BURGER", "LOCAL_KITCHEN"]
  capacityLimit: number;
  currentCapacityLoad: number; // current seating/standing density load
  popularityScore: number; // 0.0 to 5.0 rating based on visitor flows
  queue: QueueTelemetry;
  menu: MenuItem[];
  accessibilityFriendly: boolean;
}
