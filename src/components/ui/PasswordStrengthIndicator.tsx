import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const strength = Object.values(checks).filter(Boolean).length;
  const percentage = (strength / 5) * 100;

  const getStrengthColor = () => {
    if (percentage <= 40) return 'bg-red-500';
    if (percentage <= 60) return 'bg-orange-500';
    if (percentage <= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (percentage <= 40) return 'Faible';
    if (percentage <= 60) return 'Moyen';
    if (percentage <= 80) return 'Bon';
    return 'Excellent';
  };

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Barre de progression */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
          {getStrengthText()}
        </span>
      </div>

      {/* Critères */}
      <div className="space-y-1 text-xs">
        <div data-testid="password-length-check" className={`flex items-center gap-1 ${checks.length ? 'text-green-600' : 'text-gray-500'}`}>
          {checks.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          <span>Au moins 8 caractères</span>
        </div>
        <div data-testid="password-uppercase-check" className={`flex items-center gap-1 ${checks.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
          {checks.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          <span>Une lettre majuscule</span>
        </div>
        <div data-testid="password-lowercase-check" className={`flex items-center gap-1 ${checks.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
          {checks.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          <span>Une lettre minuscule</span>
        </div>
        <div data-testid="password-number-check" className={`flex items-center gap-1 ${checks.number ? 'text-green-600' : 'text-gray-500'}`}>
          {checks.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          <span>Un chiffre</span>
        </div>
        <div data-testid="password-special-check" className={`flex items-center gap-1 ${checks.special ? 'text-green-600' : 'text-gray-500'}`}>
          {checks.special ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          <span>Un caractère spécial (!@#$%^&*...)</span>
        </div>
      </div>
    </div>
  );
};
