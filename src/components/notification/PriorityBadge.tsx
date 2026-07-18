/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Badge } from '../ui/Badge';
import { ProactiveNotificationPriority } from '../../types/proactiveNotification';

interface PriorityBadgeProps {
  priority: ProactiveNotificationPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const getVariant = () => {
    switch (priority) {
      case 'CRITICAL':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
      default:
        return 'neutral';
    }
  };

  const getLabel = () => {
    switch (priority) {
      case 'CRITICAL':
        return 'CRITICAL THREAT';
      case 'HIGH':
        return 'HIGH PRIORITY';
      case 'MEDIUM':
        return 'MEDIUM INFLUENCE';
      case 'LOW':
      default:
        return 'LOW IMPACT';
    }
  };

  const getAriaLabel = () => `Notification Priority is ${getLabel()}`;

  return (
    <Badge
      variant={getVariant()}
      className="tracking-wider uppercase text-[10px] font-semibold px-2 py-0.5 rounded"
      aria-label={getAriaLabel()}
    >
      {getLabel()}
    </Badge>
  );
}
