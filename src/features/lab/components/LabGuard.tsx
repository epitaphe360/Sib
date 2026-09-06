import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useLabSessionStore } from '../store/labSessionStore';
import { LAB_ROUTES } from '../routes';
import { can, isAdminRole, type LabPermission } from '../rbac';

export function LabGuard({
  children,
  permission,
  portal,
}: {
  children: ReactNode;
  permission?: LabPermission;
  portal: 'admin' | 'client';
}) {
  const { hydrate, isLoading, userId, role } = useLabSessionStore();
  const location = useLocation();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (isLoading && !userId) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-500 text-sm">
        Chargement…
      </div>
    );
  }

  if (!userId) {
    return (
      <Navigate
        to={portal === 'client' ? LAB_ROUTES.CLIENT_LOGIN : LAB_ROUTES.LOGIN}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (portal === 'admin' && !isAdminRole(role)) {
    return <Navigate to={LAB_ROUTES.CLIENT_DASHBOARD} replace />;
  }
  if (portal === 'client' && role !== 'CLIENT') {
    return <Navigate to={LAB_ROUTES.ADMIN_DASHBOARD} replace />;
  }
  if (permission && !can(role, permission)) {
    return <div className="p-8 text-sm text-red-600">Accès refusé.</div>;
  }

  return <>{children}</>;
}
