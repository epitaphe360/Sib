import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../lib/routes';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';

/**
 * OAuth Callback Page
 * Handles the redirect from OAuth providers (Google, LinkedIn)
 * and completes the authentication flow
 */
export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuthStore();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {

        // Handle the OAuth callback and get user data
        await handleOAuthCallback();

        toast.success('Connexion réussie !');

        // Redirect to dashboard after successful authentication
        navigate(ROUTES.DASHBOARD, { replace: true });

      } catch (error: any) {
        console.error('âŒ OAuth callback error:', error);
        setError(error.message || 'Erreur lors de l\'authentification');
        toast.error(error.message || 'Erreur lors de l\'authentification');

        // Redirect to login page after error
        setTimeout(() => {
          navigate(ROUTES.LOGIN, { replace: true });
        }, 3000);
      }
    };

    processOAuthCallback();
  }, [handleOAuthCallback, navigate]);

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


