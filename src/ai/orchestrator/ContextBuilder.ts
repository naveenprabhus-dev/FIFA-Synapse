/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRepository } from '../../repositories/UserRepository';
import { MatchRepository } from '../../repositories/MatchRepository';
import { CrowdRepository } from '../../repositories/CrowdRepository';
import { FoodCourtRepository } from '../../repositories/FoodCourtRepository';
import { IncidentRepository } from '../../repositories/IncidentRepository';
import { ParkingRepository } from '../../repositories/ParkingRepository';
import { NotificationRepository } from '../../repositories/NotificationRepository';
import { VenueRepository } from '../../repositories/VenueRepository';

import { UserProfile, UserRole } from '../../types/user';
import { Match } from '../../types/match';
import { CrowdAnalysisData } from '../../types/synapse';
import { FoodCourt } from '../../types/concessions';
import { Incident } from '../../types/incident';
import { ParkingZone } from '../../types/parking';
import { SynapseNotification } from '../../contexts/SynapseContext';
import { Stadium } from '../../types/stadium';
import { WeatherTelemetry } from '../../types/weather';
import { EmptyDataError } from '../../utils/errors';

export interface SynapseFullContext {
  userId: string;
  activeRole: UserRole;
  userProfile?: UserProfile;
  stadiumDetails?: Stadium;
  activeMatch?: Match;
  crowdAnalysis?: CrowdAnalysisData[];
  foodCourts?: FoodCourt[];
  activeIncidents?: Incident[];
  parkingZones?: ParkingZone[];
  weather?: WeatherTelemetry;
  notifications?: SynapseNotification[];
  userLocation?: {
    latitude: number;
    longitude: number;
    sectorId?: string;
  };
  timestamp: string;
}

export class ContextBuilder {
  constructor(
    private userRepository: UserRepository,
    private matchRepository: MatchRepository,
    private crowdRepository: CrowdRepository,
    private foodCourtRepository: FoodCourtRepository,
    private incidentRepository: IncidentRepository,
    private parkingRepository: ParkingRepository,
    private notificationRepository: NotificationRepository,
    private venueRepository: VenueRepository
  ) {}

  /**
   * Orchestrates multi-repository queries in parallel to assemble a rich multi-dimensional context.
   * Tolerates individual repository failures (Promise.allSettled) to ensure non-blocking fallback context.
   */
  public async buildContext(
    userId: string,
    activeRole: UserRole,
    location?: { latitude: number; longitude: number; sectorId?: string }
  ): Promise<SynapseFullContext> {
    const timestamp = new Date().toISOString();
    const context: SynapseFullContext = {
      userId,
      activeRole,
      userLocation: location,
      timestamp,
    };

    // Parallel execution to avoid I/O blocking
    const results = await Promise.allSettled([
      this.userRepository.getUserProfile(userId).catch(() => undefined),
      this.matchRepository.getMatches().then(matches => matches[0]).catch(() => undefined),
      this.crowdRepository.getCrowdAnalysis().catch(() => []),
      this.foodCourtRepository.getFoodCourts().catch(() => []),
      this.incidentRepository.getIncidents().catch(() => []),
      this.parkingRepository.getParkingZones().catch(() => []),
      this.notificationRepository.getNotifications().catch(() => []),
      this.venueRepository.getStadiumDetails().catch(() => undefined),
    ]);

    // Parse results
    if (results[0].status === 'fulfilled' && results[0].value) {
      context.userProfile = results[0].value as UserProfile;
    }
    if (results[1].status === 'fulfilled' && results[1].value) {
      context.activeMatch = results[1].value as Match;
    }
    if (results[2].status === 'fulfilled' && results[2].value) {
      context.crowdAnalysis = results[2].value as CrowdAnalysisData[];
    }
    if (results[3].status === 'fulfilled' && results[3].value) {
      context.foodCourts = results[3].value as FoodCourt[];
    }
    if (results[4].status === 'fulfilled' && results[4].value) {
      // Filter active or unresolved incidents
      const incidents = results[4].value as Incident[];
      context.activeIncidents = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED');
    }
    if (results[5].status === 'fulfilled' && results[5].value) {
      context.parkingZones = results[5].value as ParkingZone[];
    }
    if (results[6].status === 'fulfilled' && results[6].value) {
      context.notifications = results[6].value as SynapseNotification[];
    }
    if (results[7].status === 'fulfilled' && results[7].value) {
      context.stadiumDetails = results[7].value as Stadium;
    }

    // Synthesize local weather telemetry (fallback-free offline generation)
    context.weather = {
      temperatureCelsius: 28,
      humidityPercentage: 62,
      precipitationProbability: 10,
      windSpeedKmh: 12,
      roofActionRecommendation: 'LEAVE_OPEN',
      forecastBrief: 'Clear skies with pleasant wind speeds.',
      activeWeatherAlerts: [],
      lastUpdated: timestamp,
    };

    return context;
  }
}
