import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { ROUTES } from '../../lib/routes';
import type { User } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: User['type'] | User['type'][];
  redirectTo?: string;
  allowPendingPayment?: boolean;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = ROUTES.LOGIN,
  allowPendingPayment = false
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  const readyRef = useRef(false);

  // Wait ONE tick for zustand hydration - only once
  useEffect(() => {
    if (readyRef.current) return;
    const timer = setTimeout(() => {
      readyRef.current = true;
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Show nothing while loading
  if (!isReady || isLoading) {
    return null;
  }

  // Not authenticated → login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Status checks (synchronous, no async calls)
  const status = user.status;
  if (status && status !== 'active') {
    if (status === 'pending_payment') {
      if (allowPendingPayment) {
        // ALLOWED - render children directly, no verification needed
      } else {
        // Redirect to visitor dashboard (treated as FREE until payment confirmed)
        return <Navigate to={ROUTES.VISITOR_DASHBOARD} replace />;
      }
    } else if (status === 'pending') {
      return <Navigate to={ROUTES.PENDING_ACCOUNT} replace />;
    } else if (status === 'suspended' || status === 'rejected') {
      return <Navigate to={ROUTES.LOGIN} replace />;
    } else {
      return <Navigate to={ROUTES.LOGIN} replace />;
    }
  }

  // Role check (client-side only, synchronous)
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(user.type)) {
      return <Navigate to={ROUTES.FORBIDDEN} replace />;
    }
  }

  return <>{children}</>;
}
