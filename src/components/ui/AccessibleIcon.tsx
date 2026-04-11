import React, { memo, useCallback } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AccessibleIconProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
  size?: number;
  asButton?: boolean;
  disabled?: boolean;
}

/**
 * WCAG 2.1 AA Compliant Icon Component
 *
 * Provides accessible icons with:
 * - aria-label for screen readers
 * - Proper button semantics when clickable
 * - Keyboard navigation support
 * - Visual and screen reader text
 *
 * Usage:
 * // As clickable button
 * <AccessibleIcon
 *   icon={TrashIcon}
 *   label="Delete item"
 *   onClick={handleDelete}
 *   asButton
 * />
 *
 * // As decorative with visible label
 * <AccessibleIcon icon={UserIcon} label="User profile" />
 */
export const AccessibleIcon: React.FC<AccessibleIconProps> = memo(({
  icon: Icon,
  label,
  onClick,
  className,
  size = 20,
  asButton = false,
  disabled = false
}) => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  }, [onClick]);

  const iconElement = (
    <Icon
      className={cn('flex-shrink-0', className)}
      size={size}
      aria-hidden="true"
    />
  );

  if (asButton || onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={label}
        className={cn(
          'inline-flex items-center justify-center',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors duration-200',
          className
        )}
      >
        {iconElement}
        <span className="sr-only">{label}</span>
      </button>
    );
  }

  return (
    <span aria-label={label} role="img">
      {iconElement}
      <span className="sr-only">{label}</span>
    </span>
  );
});

AccessibleIcon.displayName = 'AccessibleIcon';
