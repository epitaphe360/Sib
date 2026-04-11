/**
 * Accessible Button Component - WCAG 2.1 AA Compliant
 * Use this as a reference for all other components
 */

import React, { useCallback } from 'react';
import { clsx } from 'clsx';

export interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  /** Accessible label for screen readers (overrides children if needed) */
  ariaLabel?: string;
  /** Description for screen readers */
  ariaDescribedBy?: string;
  /** Indicates if button controls expanded content */
  ariaExpanded?: boolean;
  /** Indicates if button controls a popup */
  ariaHasPopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
}

const AccessibleButtonComponent: React.FC<AccessibleButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  ariaLabel,
  ariaDescribedBy,
  ariaExpanded,
  ariaHasPopup,
  disabled,
  onClick,
  className,
  type = 'button',
  ...props
}) => {
  // Variant styles
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-400 dark:hover:bg-gray-700 dark:text-gray-300'
  };

  // Size styles
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  // Handle click with loading state
  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }, [isLoading, disabled, onClick]);

  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      className={clsx(
        // Base styles
        'inline-flex items-center justify-center font-medium rounded-lg',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',

        // Variant
        variants[variant],

        // Size
        sizes[size],

        // Disabled state
        isDisabled && 'opacity-50 cursor-not-allowed',

        // Custom className
        className
      )}
      // WCAG 2.1 AA Accessibility attributes
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHasPopup}
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      // Keyboard navigation
      tabIndex={isDisabled ? -1 : 0}
      {...props}
    >
      {/* Loading spinner */}
      {isLoading && (
        <svg
          className={clsx(
            'animate-spin',
            icon && iconPosition === 'left' ? 'mr-2' : '',
            icon && iconPosition === 'right' ? 'ml-2' : 'mr-2',
            size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
          )}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true" /* Hidden from screen readers */
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Icon (left position) */}
      {!isLoading && icon && iconPosition === 'left' && (
        <span className="mr-2" aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Button text */}
      <span>
        {isLoading && loadingText ? loadingText : children}
      </span>

      {/* Icon (right position) */}
      {!isLoading && icon && iconPosition === 'right' && (
        <span className="ml-2" aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Screen reader only loading text */}
      {isLoading && (
        <span className="sr-only">Chargement en cours...</span>
      )}
    </button>
  );
};

// OPTIMIZATION: React.memo to prevent unnecessary re-renders
export const AccessibleButton = React.memo(AccessibleButtonComponent);

// Screen reader only utility class (add to global CSS)
// .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0; }

export default AccessibleButton;
