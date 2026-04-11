import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

const BadgeComponent: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    default: 'bg-SIB-gray-100 text-SIB-gray-800',
    secondary: 'bg-gray-100 text-gray-600 border border-gray-200',
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-SIB-gold/20 text-SIB-dark border border-SIB-gold/30',
    error: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-SIB-primary/10 text-SIB-primary border border-SIB-primary/20',
    outline: 'bg-transparent border border-current'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };

  return (
    <span
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

// OPTIMIZATION: Memo for Badge prevents unnecessary re-renders
export const Badge = React.memo(BadgeComponent);