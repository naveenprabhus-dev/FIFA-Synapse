/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NavigationRepository } from '../repositories/NavigationRepository';
import { RouteOption, NavigationQuery } from '../types/navigation';
import { ValidationError } from '../utils/errors';

export class NavigationService {
  constructor(private navRepo: NavigationRepository) {}

  async calculateRoutes(
    originNodeId: string,
    destinationNodeId: string,
    optimizedFor: 'SPEED' | 'ACCESSIBILITY' | 'LOW_CROWDS'
  ): Promise<{ primary: RouteOption; alternatives: RouteOption[] }> {
    if (!originNodeId || !destinationNodeId) {
      throw new ValidationError('Origin and destination nodes must be specified', 'INVALID_ROUTE_PARAMS');
    }

    const options = await this.navRepo.getRouteOptions(originNodeId, destinationNodeId);
    if (options.length === 0) {
      throw new ValidationError('No routes found between specified nodes', 'NO_ROUTES_FOUND');
    }

    // Custom filtering / sorting based on optimization parameters
    let sorted = [...options];
    if (optimizedFor === 'ACCESSIBILITY') {
      sorted = sorted.sort((a, b) => {
        if (a.accessibilityFriendly && !b.accessibilityFriendly) return -1;
        if (!a.accessibilityFriendly && b.accessibilityFriendly) return 1;
        return a.totalWalkingMinutes - b.totalWalkingMinutes;
      });
    } else if (optimizedFor === 'LOW_CROWDS') {
      sorted = sorted.sort((a, b) => a.crowdDensityScore - b.crowdDensityScore);
    } else {
      // Optimized for Speed
      sorted = sorted.sort((a, b) => a.totalWalkingMinutes - b.totalWalkingMinutes);
    }

    const primary = sorted[0];
    const alternatives = sorted.slice(1);

    // Persist this search query in background
    await this.navRepo.saveNavigationQuery({
      originNodeId,
      destinationNodeId,
      optimizedFor,
      primaryRoute: primary,
      alternativeRoutes: alternatives,
    });

    return { primary, alternatives };
  }

  async getNavigationHistory(): Promise<NavigationQuery[]> {
    return this.navRepo.getNavigationQueries();
  }
}
