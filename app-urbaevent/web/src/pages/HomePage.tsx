import { Navigate } from 'react-router-dom';
import { ROUTES } from '../lib/routes';

/** / redirige vers la page d'accueil SIB 2026 v4 */
export default function HomePage() {
  return <Navigate to={ROUTES.HOME} replace />;
}
