import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../lib/routes';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

/**
 * OAuth Callback Page
 * Handles the redirect from OAuth providers (Google, LinkedIn)
 * and completes the authentication flow
 */
export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleOAuthCallback } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let settled = false;

    // onAuthStateChange se déclenche avec SIGNED_IN une fois que Supabase a traité
    // les tokens du hash URL — fonctionne pour OAuth ET magic links.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (settled || event !== 'SIGNED_IN') return;
      settled = true;
      subscription.unsubscribe();

      try {
        await handleOAuthCallback();
        toast.success('Connexion réussie !');

        // Attendre un tick pour que Zustand propage le state
        await new Promise(resolve => setTimeout(resolve, 100));

        const next = searchParams.get('next');
        const { user } = useAuthStore.getState();

        if (next) {
          navigate(next, { replace: true });
        } else if (user?.type === 'visitor') {
          navigate(ROUTES.VISITOR_DASHBOARD, { replace: true });
        } else if (user?.type === 'admin') {
          navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
        } else if (user?.type === 'partner') {
          navigate(ROUTES.PARTNER_DASHBOARD, { replace: true });
        } else if (user?.type === 'exhibitor') {
          navigate(ROUTES.EXHIBITOR_DASHBOARD, { replace: true });
        } else {
          navigate(ROUTES.VISITOR_DASHBOARD, { replace: true });
        }
      } catch (err: any) {
        console.error('❌ OAuth callback error:', err);
        setError(err.message || "Erreur lors de l'authentification");
        toast.error(err.message || "Erreur lors de l'authentification");
        setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 3000);
      }
    });

    // Timeout de sécurité : 15s max
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        subscription.unsubscribe();
        setError("Délai d'authentification dépassé. Veuillez réessayer.");
        setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 3000);
      }
    }, 15000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [handleOAuthCallback, navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Erreur d'authentification
          </h2>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <p className="text-sm text-gray-500">
            Redirection vers la page de connexion...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <Loader className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Authentification en cours...
        </h2>
        <p className="text-gray-600">
          Veuillez patienter pendant que nous finalisons votre connexion.
        </p>
      </div>
    </div>
  );
}


