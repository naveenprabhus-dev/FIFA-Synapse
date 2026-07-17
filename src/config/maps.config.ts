/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const MAPS_CONFIG = {
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  version: 'weekly',
  defaultCenter: {
    lat: 47.4133, // Default coords representing a stadium location (e.g., Al Thumama Stadium)
    lng: 8.5283,
  },
  defaultZoom: 16,
  mapId: 'fifa_synapse_stadium_map',
};
