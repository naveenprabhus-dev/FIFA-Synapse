/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MockUserRepository,
  MockMatchRepository,
  MockNotificationRepository,
  MockCrowdRepository,
  MockNavigationRepository,
  MockIncidentRepository,
  MockParkingRepository,
  MockFoodCourtRepository,
  MockVenueRepository,
  MockRecommendationRepository,
  MockSettingsRepository,
} from '../repositories';

import {
  UserService,
  NavigationService,
  NotificationService,
  MatchService,
  CrowdService,
  AccessibilityService,
  OperationsService,
  VenueService,
  RecommendationService,
} from './index';

// Instantiate mock repositories as default implementations
export const userRepository = new MockUserRepository();
export const matchRepository = new MockMatchRepository();
export const notificationRepository = new MockNotificationRepository();
export const crowdRepository = new MockCrowdRepository();
export const navigationRepository = new MockNavigationRepository();
export const incidentRepository = new MockIncidentRepository();
export const parkingRepository = new MockParkingRepository();
export const foodCourtRepository = new MockFoodCourtRepository();
export const venueRepository = new MockVenueRepository();
export const recommendationRepository = new MockRecommendationRepository();
export const settingsRepository = new MockSettingsRepository();

// Inject repositories into services
export const userService = new UserService(userRepository);
export const navigationService = new NavigationService(navigationRepository);
export const notificationService = new NotificationService(notificationRepository);
export const matchService = new MatchService(matchRepository);
export const crowdService = new CrowdService(crowdRepository);
export const accessibilityService = new AccessibilityService(venueRepository, navigationRepository);
export const operationsService = new OperationsService(incidentRepository);
export const venueService = new VenueService(venueRepository, foodCourtRepository, parkingRepository);
export const recommendationService = new RecommendationService(recommendationRepository);

// AI Orchestration Imports
import { IntentEngine } from '../ai/orchestrator/IntentEngine';
import { ContextBuilder } from '../ai/orchestrator/ContextBuilder';
import { DecisionEngine } from '../ai/orchestrator/DecisionEngine';
import { PromptBuilder } from '../ai/orchestrator/PromptBuilder';
import { MockAIProvider } from '../ai/orchestrator/AIProvider';
import { ResponseParser } from '../ai/orchestrator/ResponseParser';
import { SynapseCore } from '../ai/orchestrator/SynapseCore';
import { CrowdAgent } from '../ai/agents/CrowdAgent';
import { RouteAgent } from '../ai/agents/RouteAgent';
import { GeminiClient } from '../ai/orchestrator/GeminiClient';
import { GeminiProvider } from '../ai/orchestrator/GeminiProvider';

// Instantiate AI Orchestration Pipeline Singletons
export const intentEngine = new IntentEngine();
export const contextBuilder = new ContextBuilder(
  userRepository,
  matchRepository,
  crowdRepository,
  foodCourtRepository,
  incidentRepository,
  parkingRepository,
  notificationRepository,
  venueRepository
);
export const decisionEngine = new DecisionEngine();
export const promptBuilder = new PromptBuilder();
export const geminiClient = new GeminiClient();
export const geminiProvider = new GeminiProvider(geminiClient);
export const aiProvider = geminiProvider; // Plug the production Gemini provider directly into Synapse Core
export const responseParser = new ResponseParser();

export const synapseCore = new SynapseCore(
  intentEngine,
  contextBuilder,
  decisionEngine,
  promptBuilder,
  aiProvider,
  responseParser
);

export const crowdAgent = new CrowdAgent(synapseCore);
export const routeAgent = new RouteAgent(synapseCore);

