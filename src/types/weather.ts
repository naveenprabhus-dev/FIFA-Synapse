/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WeatherTelemetry {
  temperatureCelsius: number;
  humidityPercentage: number;
  precipitationProbability: number;
  windSpeedKmh: number;
  roofActionRecommendation: 'LEAVE_OPEN' | 'CLOSE_ROOF' | 'OPEN_ROOF_POST_RAIN';
  forecastBrief: string;
  activeWeatherAlerts: string[];
  lastUpdated: string; // ISO string
}
