/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MapWaypoint {
  name: string;
  latitude: number;
  longitude: number;
}

export interface RouteOption {
  id: string;
  name: string; // e.g., "Optimal Path", "Accessible Elevator Path"
  totalDistanceMeters: number;
  totalWalkingMinutes: number;
  crowdDensityScore: number; // 0.0 to 1.0 (Higher means slower crowd flow)
  accessibilityFriendly: boolean;
  waypoints: MapWaypoint[];
  hazardNotes?: string[];
}

export interface NavigationQuery {
  id: string;
  originNodeId: string;
  destinationNodeId: string;
  optimizedFor: 'SPEED' | 'ACCESSIBILITY' | 'LOW_CROWDS';
  primaryRoute: RouteOption;
  alternativeRoutes: RouteOption[];
  timestamp: string;
}
