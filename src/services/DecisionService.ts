/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProactiveNotification } from '../types/proactiveNotification';
import { SynapseFullContext } from '../ai/orchestrator/ContextBuilder';
import { ValidationError } from '../utils/errors';

export class DecisionService {
  private static CONFIDENCE_THRESHOLD = 0.70;

  /**
   * Evaluates if a generated proactive notification is necessary, safe, and non-duplicate.
   */
  public shouldPublishNotification(
    proposed: Omit<ProactiveNotification, 'id' | 'timestamp' | 'read'>,
    existingNotifications: ProactiveNotification[]
  ): { shouldPublish: boolean; reason?: string } {
    
    // 1. Validate basic required payload
    if (!proposed.type) {
      throw new ValidationError('Notification Type is missing.', 'MISSING_NOTIFICATION_TYPE');
    }
    if (!proposed.title || proposed.title.trim() === '') {
      throw new ValidationError('Notification Title is missing.', 'MISSING_NOTIFICATION_TITLE');
    }
    if (!proposed.summary || proposed.summary.trim() === '') {
      throw new ValidationError('Notification Summary is missing.', 'MISSING_NOTIFICATION_SUMMARY');
    }

    // 2. Reject low-confidence items to suppress chatter
    if (proposed.confidenceScore < DecisionService.CONFIDENCE_THRESHOLD) {
      return {
        shouldPublish: false,
        reason: `Suppressed: Confidence score (${proposed.confidenceScore}) falls below safety threshold (${DecisionService.CONFIDENCE_THRESHOLD}).`
      };
    }

    // 3. Prevent duplicate notifications
    const DUPLICATE_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes
    const now = Date.now();

    const isDuplicate = existingNotifications.some((existing) => {
      // Check if same type and same affected zone
      const sameType = existing.type === proposed.type;
      const sameZone = existing.affectedZone === proposed.affectedZone;
      const sameTitle = existing.title.toLowerCase().trim() === proposed.title.toLowerCase().trim();
      
      const timeElapsed = now - new Date(existing.timestamp).getTime();
      const withinCooldown = timeElapsed < DUPLICATE_COOLDOWN_MS;

      // Duplicate is found if same type and zone (or same title) within the cooldown window
      return (sameType && sameZone && withinCooldown) || (sameTitle && withinCooldown);
    });

    if (isDuplicate) {
      return {
        shouldPublish: false,
        reason: `Suppressed: Similar notification of type '${proposed.type}' in zone '${proposed.affectedZone}' was already published recently within the 15-minute cooldown window to prevent notification fatigue.`
      };
    }

    return { shouldPublish: true };
  }

  /**
   * Enforces strict validation on full stadium contexts before triggering calculations.
   */
  public validateContext(context: SynapseFullContext): void {
    if (!context) {
      throw new ValidationError('Stadium context is completely missing.', 'MISSING_STADIUM_CONTEXT');
    }
    if (!context.userId) {
      throw new ValidationError('User ID context is missing.', 'MISSING_USER_ID');
    }
    if (!context.activeRole) {
      throw new ValidationError('Active Role context is missing.', 'MISSING_ACTIVE_ROLE');
    }
  }
}
