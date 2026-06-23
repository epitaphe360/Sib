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

  // Wait for zustand hydration + auth initialization
  useEffect(() => {
    if (readyRef.current) {return;}
    const timer = setTimeout(() => {
      readyRef.current = true;
      setIsReady(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Show spinner while loading (not blank screen)
  if (!isReady || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    );
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
