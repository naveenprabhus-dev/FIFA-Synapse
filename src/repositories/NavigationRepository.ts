/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouteOption, NavigationQuery } from '../types/navigation';
import { RepositoryError } from '../utils/errors';

export interface NavigationRepository {
  getRouteOptions(originNodeId: string, destinationNodeId: string): Promise<RouteOption[]>;
  saveNavigationQuery(query: Omit<NavigationQuery, 'id' | 'timestamp'>): Promise<NavigationQuery>;
  getNavigationQueries(): Promise<NavigationQuery[]>;
}

export class MockNavigationRepository implements NavigationRepository {
  private queries: NavigationQuery[] = [];

  private routeOptions: Record<string, RouteOption[]> = {
    'SEC_104-GATE_A': [
      {
        id: 'route-optimal',
        name: 'Optimal Path via Concourse A',
        totalDistanceMeters: 120,
        totalWalkingMinutes: 2,
        crowdDensityScore: 0.2,
        accessibilityFriendly: true,
        waypoints: [
          { name: 'Sector 104 Elevator', latitude: 25.3522, longitude: 51.5311 },
          { name: 'Concourse A North Corridor', latitude: 25.3525, longitude: 51.5315 },
          { name: 'Gate A Entrance', latitude: 25.3528, longitude: 51.5319 },
        ],
      },
      {
        id: 'route-scenic',
        name: 'Alternative via South Ramp',
        totalDistanceMeters: 240,
        totalWalkingMinutes: 5,
        crowdDensityScore: 0.1,
        accessibilityFriendly: true,
        waypoints: [
          { name: 'Sector 104 Escalator', latitude: 25.3522, longitude: 51.5311 },
          { name: 'Outer Ring Promenade', latitude: 25.3515, longitude: 51.5305 },
          { name: 'Gate A South Plaza', latitude: 25.3528, longitude: 51.5319 },
        ],
        hazardNotes: ['Occasional heavy wind at the outer promenade'],
      },
    ],
  };

  async getRouteOptions(originNodeId: string, destinationNodeId: string): Promise<RouteOption[]> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const key = `${originNodeId}-${destinationNodeId}`;
    const reverseKey = `${destinationNodeId}-${originNodeId}`;
    
    const options = this.routeOptions[key] || this.routeOptions[reverseKey];
    if (!options) {
      // Return a default mock route options array instead of throwing, so it is robust
      return [
        {
          id: `route-${originNodeId}-${destinationNodeId}-default`,
          name: 'Direct Transit Corridor',
          totalDistanceMeters: 180,
          totalWalkingMinutes: 3,
          crowdDensityScore: 0.4,
          accessibilityFriendly: true,
          waypoints: [
            { name: `Origin Node ${originNodeId}`, latitude: 25.3522, longitude: 51.5311 },
            { name: `Destination Node ${destinationNodeId}`, latitude: 25.3528, longitude: 51.5319 },
          ],
        },
      ];
    }
    return options.map((o) => ({ ...o }));
  }

  async saveNavigationQuery(query: Omit<NavigationQuery, 'id' | 'timestamp'>): Promise<NavigationQuery> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const newQuery: NavigationQuery = {
      ...query,
      id: `nav-q-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.queries.push(newQuery);
    return newQuery;
  }

  async getNavigationQueries(): Promise<NavigationQuery[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return this.queries.map((q) => ({ ...q }));
  }
}
