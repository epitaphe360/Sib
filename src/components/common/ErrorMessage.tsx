import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Composant réutilisable pour afficher les messages d'erreur
 * Utilisé dans le tableau de bord visiteur et autres composants
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onDismiss,
  className = '' 
}) => {
  const { t } = useTranslation();
  
  return (
    <div className={`mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start ${className}`}>
      <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-red-800 text-sm">{message}</p>
      </div>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="text-red-600 hover:text-red-800 ml-3 flex-shrink-0"
          aria-label={t('common.close_error')}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

interface LoadingMessageProps {
  message?: string;
  className?: string;
}

/**
 * Composant pour afficher un état de chargement
 */
export const LoadingMessage: React.FC<LoadingMessageProps> = ({ 
  message,
  className = ''
}) => {
  const { t } = useTranslation();
  const loadingText = message || t('common.loading');
  
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600">{loadingText}</p>
    </div>
  );
};

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Composant pour afficher un état vide
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && <div className="mb-4 flex justify-center text-gray-400">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
