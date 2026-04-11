import React from 'react';
import { Loader } from 'lucide-react';
import { Button, buttonVariants } from '../ui/Button';
import { VariantProps } from 'class-variance-authority';
import useAuthStore from '../../store/authStore';
import { toast } from 'sonner';

interface LinkedInAuthButtonProps extends Omit<VariantProps<typeof buttonVariants>, 'variant'> {
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const LinkedInAuthButton: React.FC<LinkedInAuthButtonProps> = ({
  size,
  className = '',
  onSuccess,
  onError
}) => {
  const { loginWithLinkedIn, isLinkedInLoading } = useAuthStore();

  const handleLinkedInLogin = async () => {
    try {
      // Start LinkedIn OAuth flow - will redirect to LinkedIn
      await loginWithLinkedIn();

      // Note: This code may not execute because OAuth redirects the page
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la connexion LinkedIn';
      console.error('Erreur OAuth LinkedIn:', error);

      if (onError) {
        onError(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <Button
      variant="outline"
      size={size}
      className={`w-full bg-[#0077B5] text-white hover:bg-[#005E92] ${className}`}
      onClick={handleLinkedInLogin}
      disabled={isLinkedInLoading}
    >
      {isLinkedInLoading ? (
        <>
          <Loader className="animate-spin h-4 w-4 mr-2" />
          Connexion en cours...
        </>
      ) : (
        <>
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
          Continuer avec LinkedIn
        </>
      )}
    </Button>
  );
};
