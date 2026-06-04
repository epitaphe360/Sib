import React from 'react';
import { CheckCircle, X } from 'lucide-react';

interface FormSuccessBannerProps {
  title: string;
  message: string;
  onDismiss?: () => void;
}

export const FormSuccessBanner: React.FC<FormSuccessBannerProps> = ({
  title,
  message,
  onDismiss,
}) => (
  <div
    role="status"
    aria-live="polite"
    className="rounded-xl border-2 border-success-500 bg-success-50 dark:bg-success-500/10 p-5 mb-6"
  >
    <div className="flex items-start gap-3">
      <CheckCircle className="h-6 w-6 text-success-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold text-success-800 dark:text-success-400">{title}</p>
        <p className="text-sm text-success-700 dark:text-success-300 mt-1">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-success-600 hover:text-success-800 p-1"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  </div>
);

export default FormSuccessBanner;
