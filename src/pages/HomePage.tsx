import { Navigate } from 'react-router-dom';
import { getDefaultHomePageVariant, getHomeRouteForVariant } from '../config/homeVariants';

/** / redirige vers la variante par défaut (VITE_HOME_PAGE_VARIANT ou P1) */
export default function HomePage() {
  return <Navigate to={getHomeRouteForVariant(getDefaultHomePageVariant())} replace />;
}
