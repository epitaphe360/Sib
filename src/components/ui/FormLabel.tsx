import React, { memo } from 'react';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../hooks/useTranslation';

interface FormLabelProps {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  description?: string;
  error?: string;
  className?: string;
}

/**
 * WCAG 2.1 AA Compliant Form Label
 *
 * Provides accessible labels for form inputs with:
 * - Proper htmlFor association
 * - Required indicator
 * - Optional description (aria-describedby)
 * - Error message support
 *
 * Usage:
 * <FormLabel htmlFor="email" required description="Enter your work email">
 *   Email Address
 * </FormLabel>
 * <Input id="email" aria-required="true" aria-describedby="email-desc email-error" />
 */
export const FormLabel: React.FC<FormLabelProps> = memo(({
  htmlFor,
  children,
  required = false,
  description,
  error,
  className
}) => {
  const { t } = useTranslation();
  const descriptionId = description ? `${htmlFor}-desc` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className={cn('mb-1', className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {children}
        {required && (
          <span className="text-red-600 ml-1" aria-label={t('form.required')}>
            *
          </span>
        )}
      </label>

      {description && (
        <p
          id={descriptionId}
          className="text-xs text-gray-500 mb-1"
        >
          {description}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className="text-xs text-red-600 mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

FormLabel.displayName = 'FormLabel';

/**
 * Generate aria-describedby string for input
 */
export function getAriaDescribedBy(
  inputId: string,
  hasDescription: boolean,
  hasError: boolean
): string | undefined {
  const ids: string[] = [];
  if (hasDescription) ids.push(`${inputId}-desc`);
  if (hasError) ids.push(`${inputId}-error`);
  return ids.length > 0 ? ids.join(' ') : undefined;
}
