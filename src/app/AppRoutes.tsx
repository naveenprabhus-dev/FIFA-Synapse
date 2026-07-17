/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { RoleLayout } from '../layouts/RoleLayout';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';
import { UserRole } from '../types/user';

// Lazy loading our route components (TypeScript safe named-export resolution)
const LandingPage = lazy(() => import('../pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ProfilePage = lazy(() => import('../pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

export function AppRoutes() {
  return (
    <MainLayout>
      <Suspense fallback={<LoadingSpinner fullScreen message="Synthesizing cockpit layout..." />}>
        <Routes>
          {/* ========================================== */}
          {/* Public Routes                              */}
          {/* ========================================== */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/404" element={<NotFoundPage />} />

          {/* ========================================== */}
          {/* Unified Protected Core Spaces             */}
          {/* ========================================== */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleLayout>
                  <DashboardPage />
                </RoleLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* ========================================== */}
          {/* Dedicated Tenant Role-Based Routes         */}
          {/* ========================================== */}
          <Route
            path="/fan"
            element={
              <ProtectedRoute allowedRoles={[UserRole.FAN]}>
                <RoleLayout>
                  <DashboardPage />
                </RoleLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizer"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ORGANIZER]}>
                <RoleLayout>
                  <DashboardPage />
                </RoleLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/operations"
            element={
              <ProtectedRoute allowedRoles={[UserRole.OPERATIONS]}>
                <RoleLayout>
                  <DashboardPage />
                </RoleLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/venue"
            element={
              <ProtectedRoute allowedRoles={[UserRole.STAFF]}>
                <RoleLayout>
                  <DashboardPage />
                </RoleLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback to 404 block */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </MainLayout>
  );
}
