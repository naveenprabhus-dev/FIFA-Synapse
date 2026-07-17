/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VenueRepository } from '../repositories/VenueRepository';
import { NavigationRepository } from '../repositories/NavigationRepository';
import { RouteOption } from '../types/navigation';
import { TransitNode } from '../types/stadium';
import { ValidationError } from '../utils/errors';

export class AccessibilityService {
  constructor(
    private venueRepo: VenueRepository,
    private navRepo: NavigationRepository
  ) {}

  async getAccessibleTransitNodes(): Promise<TransitNode[]> {
    const nodes = await this.venueRepo.getTransitNodes();
    return nodes.filter((n) => n.accessibleReady);
  }

  async getAccessibilityOptimizedRoute(
    originNodeId: string,
    destinationNodeId: string
  ): Promise<RouteOption> {
    if (!originNodeId || !destinationNodeId) {
      throw new ValidationError('Origin and Destination are required', 'EMPTY_PARAMS');
    }

    const options = await this.navRepo.getRouteOptions(originNodeId, destinationNodeId);
    const accessible = options.find((o) => o.accessibilityFriendly);
    if (!accessible) {
      // Find any first option if none is explicitly marked as friendly
      if (options.length > 0) {
        return {
          ...options[0],
          hazardNotes: [...(options[0].hazardNotes || []), 'Warning: No step-free certified routes could be located.'],
        };
      }
      throw new ValidationError('No accessible routes can be calculated', 'NO_ACCESSIBLE_ROUTE_FOUND');
    }
    return accessible;
  }

  async auditElevatorStatus(): Promise<{ operationalCount: number; brokenCount: number; warnings: string[] }> {
    const nodes = await this.venueRepo.getTransitNodes();
    const elevators = nodes.filter((n) => n.type === 'ELEVATOR');
    
    let operationalCount = 0;
    let brokenCount = 0;
    const warnings: string[] = [];

    elevators.forEach((e) => {
      if (e.status === 'OPERATIONAL') {
        operationalCount++;
      } else {
        brokenCount++;
        warnings.push(`Elevator out of order at location: ${e.locationName}. Accessibility options restricted in this zone.`);
      }
    });

    return { operationalCount, brokenCount, warnings };
  }
}
