/**
 * Application Routes
 * Defines all routes for the application
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import MainLayout from './layouts/MainLayout';

// Lazy load feature modules
import { lazy, Suspense } from 'react';

const PeopleModule = lazy(() => import('@/features/people/PeopleModule'));
const OrgModule = lazy(() => import('@/features/org/OrgModule'));
const LeaveModule = lazy(() => import('@/features/leave/LeaveModule'));
const PerformanceModule = lazy(() => import('@/features/performance/PerformanceModule'));
const GamificationModule = lazy(() => import('@/features/gamification/GamificationModule'));
const AIModule = lazy(() => import('@/features/ai/AIModule'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<div>Login Page (TODO)</div>} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/people" replace />} />
        <Route
          path="people/*"
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <PeopleModule />
            </Suspense>
          }
        />
        <Route
          path="org/*"
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <OrgModule />
            </Suspense>
          }
        />
        <Route
          path="leave/*"
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <LeaveModule />
            </Suspense>
          }
        />
        <Route
          path="performance/*"
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <PerformanceModule />
            </Suspense>
          }
        />
        <Route
          path="gamification/*"
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <GamificationModule />
            </Suspense>
          }
        />
        <Route
          path="ai/*"
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <AIModule />
            </Suspense>
          }
        />
        <Route
          path="ess/*"
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <ESSModule />
            </Suspense>
          }
        />
        <Route
          path="mss/*"
          element={
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <MSSModule />
            </Suspense>
          }
        />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Route>
    </Routes>
  );
}
