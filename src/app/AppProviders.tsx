/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SynapseProvider } from '../contexts/SynapseContext';
import { ProactiveNotificationProvider } from '../contexts/ProactiveNotificationContext';
import { AuthProvider } from '../features/auth/AuthContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <AuthProvider>
          <SynapseProvider>
            <ProactiveNotificationProvider>
              <BrowserRouter>{children}</BrowserRouter>
            </ProactiveNotificationProvider>
          </SynapseProvider>
        </AuthProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}


