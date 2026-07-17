/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FoodCourt, MenuItem, QueueTelemetry } from '../types/concessions';
import { RepositoryError } from '../utils/errors';

export interface FoodCourtRepository {
  getFoodCourts(): Promise<FoodCourt[]>;
  getFoodCourtById(id: string): Promise<FoodCourt>;
  updateMenuItemStock(foodCourtId: string, itemId: string, stockLevel: MenuItem['stockLevel']): Promise<FoodCourt>;
  updateQueueLength(foodCourtId: string, currentLength: number): Promise<FoodCourt>;
}

export class MockFoodCourtRepository implements FoodCourtRepository {
  private foodCourts: FoodCourt[] = [
    {
      id: 'bistro-1',
      name: 'Pizza & Burger Bistro',
      locationDescription: 'West Concourse Sector 104',
      status: 'OPEN',
      categories: ['PIZZA', 'BURGER', 'BEVERAGE'],
      capacityLimit: 120,
      currentCapacityLoad: 88,
      popularityScore: 4.8,
      queue: {
        currentLength: 18,
        predictedLength15Min: 26,
        predictedLength30Min: 32,
        trend: 'RISING',
        confidenceScore: 0.94,
        estimatedWaitMinutes: 14,
        lastUpdated: new Date().toISOString(),
      },
      accessibilityFriendly: true,
      menu: [
        {
          id: 'item-pizza-1',
          name: 'Supreme Pepperoni Pizza slice',
          category: 'FOOD',
          price: 8.5,
          isAvailable: true,
          isHalal: true,
          isVegetarian: false,
          estimatedPrepTimeSeconds: 120,
          stockLevel: 'HIGH',
        },
        {
          id: 'item-burger-1',
          name: 'Classic Halal Cheeseburger',
          category: 'FOOD',
          price: 9.99,
          isAvailable: true,
          isHalal: true,
          isVegetarian: false,
          estimatedPrepTimeSeconds: 180,
          stockLevel: 'MEDIUM',
        },
        {
          id: 'item-coke-1',
          name: 'Diet Coca-Cola 500ml',
          category: 'BEVERAGE',
          price: 3.5,
          isAvailable: true,
          isHalal: true,
          isVegetarian: true,
          estimatedPrepTimeSeconds: 30,
          stockLevel: 'LOW',
        },
      ],
    },
    {
      id: 'merch-1',
      name: 'West Fan Merchandise Hub',
      locationDescription: 'Concourse A Sector 102',
      status: 'OPEN',
      categories: ['MERCHANDISE'],
      capacityLimit: 200,
      currentCapacityLoad: 15,
      popularityScore: 4.2,
      queue: {
        currentLength: 3,
        predictedLength15Min: 5,
        predictedLength30Min: 8,
        trend: 'STABLE',
        confidenceScore: 0.88,
        estimatedWaitMinutes: 3,
        lastUpdated: new Date().toISOString(),
      },
      accessibilityFriendly: true,
      menu: [
        {
          id: 'item-jersey-1',
          name: 'Official FIFA Match Jersey',
          category: 'MERCHANDISE',
          price: 89.99,
          isAvailable: true,
          isHalal: true,
          isVegetarian: true,
          estimatedPrepTimeSeconds: 60,
          stockLevel: 'HIGH',
        },
      ],
    },
  ];

  async getFoodCourts(): Promise<FoodCourt[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return this.foodCourts.map((fc) => ({ ...fc }));
  }

  async getFoodCourtById(id: string): Promise<FoodCourt> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const fc = this.foodCourts.find((f) => f.id === id);
    if (!fc) {
      throw new RepositoryError(`Food court or Concession not found with ID: ${id}`, 'FOOD_COURT_NOT_FOUND');
    }
    return { ...fc };
  }

  async updateMenuItemStock(foodCourtId: string, itemId: string, stockLevel: MenuItem['stockLevel']): Promise<FoodCourt> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const fcIndex = this.foodCourts.findIndex((f) => f.id === foodCourtId);
    if (fcIndex === -1) {
      throw new RepositoryError(`Food court not found: ${foodCourtId}`, 'FOOD_COURT_NOT_FOUND');
    }
    const fc = this.foodCourts[fcIndex];
    const itemIndex = fc.menu.findIndex((m) => m.id === itemId);
    if (itemIndex === -1) {
      throw new RepositoryError(`Menu item ${itemId} not found in food court ${foodCourtId}`, 'MENU_ITEM_NOT_FOUND');
    }

    const updatedMenu = [...fc.menu];
    updatedMenu[itemIndex] = {
      ...updatedMenu[itemIndex],
      stockLevel,
      isAvailable: stockLevel !== 'OUT_OF_STOCK',
    };

    const updatedFoodCourt = {
      ...fc,
      menu: updatedMenu,
    };
    this.foodCourts[fcIndex] = updatedFoodCourt;
    return { ...updatedFoodCourt };
  }

  async updateQueueLength(foodCourtId: string, currentLength: number): Promise<FoodCourt> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const fcIndex = this.foodCourts.findIndex((f) => f.id === foodCourtId);
    if (fcIndex === -1) {
      throw new RepositoryError(`Food court not found: ${foodCourtId}`, 'FOOD_COURT_NOT_FOUND');
    }
    const fc = this.foodCourts[fcIndex];
    if (currentLength < 0) {
      throw new RepositoryError('Queue length cannot be negative', 'INVALID_QUEUE_LENGTH');
    }

    // Estimate wait time based on length: e.g. 45 seconds per person
    const estimatedWaitMinutes = Math.max(1, Math.round((currentLength * 45) / 60));

    const updatedQueue: QueueTelemetry = {
      ...fc.queue,
      currentLength,
      estimatedWaitMinutes,
      lastUpdated: new Date().toISOString(),
    };

    const updatedFoodCourt = {
      ...fc,
      queue: updatedQueue,
    };
    this.foodCourts[fcIndex] = updatedFoodCourt;
    return { ...updatedFoodCourt };
  }
}
