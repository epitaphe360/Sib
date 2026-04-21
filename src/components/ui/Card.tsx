import React from 'react';
import { clsx } from 'clsx';

/**
 * SIB 2026 — Card
 * Fond plein (pas de glassmorphism), bordure fine, shadow subtile.
 * Hover: shadow-md (pas de translation sauf via variant `hover`).
 */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  variant?: 'default' | 'elevated' | 'flat' | 'feature';
}

const CardComponent: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  hover = false,
  variant = 'default',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantClasses: Record<string, string> = {
    default: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm',
    elevated: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-md',
    flat: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800',
    feature: 'bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800',
  };

  return (
    <div
      className={clsx(
        'relative rounded-xl overflow-hidden',
        variantClasses[variant],
        paddingClasses[padding],
        'transition-all duration-300 ease-out',
        hover && 'hover:shadow-lg hover:-translate-y-1 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx('flex flex-col space-y-1.5 p-6 pb-4', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={clsx(
      'text-lg font-semibold leading-tight tracking-tight text-neutral-900 dark:text-neutral-100',
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={clsx('text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={clsx('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx('flex items-center gap-3 p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { CardComponent as Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
export default CardComponent;
