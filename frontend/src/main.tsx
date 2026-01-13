/**
 * Application Entry Point
 * Sets up React root with all providers
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/shared/lib/auth-context';
import { TenantProvider } from '@/shared/lib/tenant-context';
import { queryClient } from '@/shared/lib/react-query';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import App from './App';
import './index.css';
import './i18n/config';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TenantProvider>
              <App />
            </TenantProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
