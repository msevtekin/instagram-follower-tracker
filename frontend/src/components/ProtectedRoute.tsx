/**
 * ProtectedRoute Component
 * 
 * Wraps content that requires authentication.
 * Redirects unauthenticated users to login page.
 */

import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthPage } from './Auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!user) {
    return <AuthPage />;
  }

  // Render protected content
  return <>{children}</>;
}

export default ProtectedRoute;
