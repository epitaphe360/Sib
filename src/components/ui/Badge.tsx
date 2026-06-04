import React from 'react';
import { clsx } from 'clsx';

/**
 * SIB 2026 — Badge
 * Pastilles fines, fond 10% de la couleur fonctionnelle.
 */
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'danger' | 'info' | 'outline' | 'primary' | 'accent';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

const BadgeComponent: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  dot = false,
}) => {
  const baseClasses = 'inline-flex items-center gap-1.5 rounded-full font-medium border transition-colors';

  const variants: Record<string, string> = {
    default:   'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700',
    secondary: 'bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800',
    primary:   'bg-primary-50 text-primary-700 border-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-900/50',
    accent:    'bg-accent-50 text-accent-700 border-accent-100 dark:bg-accent-500/10 dark:text-accent-500 dark:border-accent-500/20',
    success:   'bg-success-50 text-success-600 border-success-100 dark:bg-success-500/10 dark:text-success-500 dark:border-success-500/20',
    warning:   'bg-warning-50 text-warning-600 border-warning-100 dark:bg-warning-500/10 dark:text-warning-500 dark:border-warning-500/20',
    error:     'bg-danger-50 text-danger-600 border-danger-100 dark:bg-danger-500/10 dark:text-danger-500 dark:border-danger-500/20',
    danger:    'bg-danger-50 text-danger-600 border-danger-100 dark:bg-danger-500/10 dark:text-danger-500 dark:border-danger-500/20',
    info:      'bg-info-50 text-info-600 border-info-100 dark:bg-info-500/10 dark:text-info-500 dark:border-info-500/20',
    outline:   'bg-transparent border-current',
  };

  const dotColors: Record<string, string> = {
    default: 'bg-neutral-400',
    secondary: 'bg-neutral-400',
    primary: 'bg-primary-600',
    accent: 'bg-accent-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-danger-500',
    danger: 'bg-danger-500',
    info: 'bg-info-500',
    outline: 'bg-current',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={clsx(baseClasses, variants[variant], sizes[size], className)}>
      {dot && <span className={clsx('h-1.5 w-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
};

export const Badge = React.memo(BadgeComponent);
