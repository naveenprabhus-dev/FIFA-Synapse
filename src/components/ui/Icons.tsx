/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  Shield,
  Users,
  Landmark,
  Compass,
  MapPin,
  AlertTriangle,
  Zap,
  Package,
  Clock,
  Settings,
  Bell,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Search,
} from 'lucide-react';
import { UserRole } from '../../types/user';

/**
 * Reusable icon mapping system for FIFA Synapse to maintain visual consistency.
 * Maps core stadium and platform entities to strict visual tokens.
 */
export const SynapseIcons = {
  // Target roles
  [UserRole.FAN]: User,
  [UserRole.ORGANIZER]: Landmark,
  [UserRole.OPERATIONS]: Shield,
  [UserRole.STAFF]: Users,


  // Domain terms
  Crowd: Users,
  Navigation: Compass,
  Location: MapPin,
  Emergency: AlertTriangle,
  Replenishment: Package,
  ServiceSpeed: Zap,
  Time: Clock,
  Telemetry: Layers,
  Trend: TrendingUp,
  Analytics: BarChart3,
  Calendar: Calendar,

  // UI Utilities
  Settings: Settings,
  Notification: Bell,
  Success: CheckCircle2,
  Error: XCircle,
  Warning: AlertTriangle,
  Help: HelpCircle,
  Exit: LogOut,
  ChevronRight: ChevronRight,
  ChevronLeft: ChevronLeft,
  Search: Search,
};

