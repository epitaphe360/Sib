import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * SIB 2026 — Button
 * 4 variantes plates, raffinées, sans gradient.
 * Focus sur la typographie, l'espacement, et les micro-interactions.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-lg font-medium text-sm tracking-tight",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-600",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:translate-y-[1px]",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary-600 text-white shadow-sm hover:bg-primary-700 hover:shadow-md hover:-translate-y-[1px]",
        primary:
          "bg-primary-600 text-white shadow-sm hover:bg-primary-700 hover:shadow-md hover:-translate-y-[1px]",
        secondary:
          "bg-white text-neutral-900 border border-neutral-200 shadow-xs hover:border-neutral-300 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-700",
        outline:
          "bg-transparent text-neutral-900 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 dark:text-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800",
        ghost:
          "bg-transparent text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-neutral-800",
        link:
          "bg-transparent text-primary-600 underline-offset-4 hover:underline p-0 h-auto dark:text-primary-400",
        destructive:
          "bg-danger-500 text-white shadow-sm hover:bg-danger-600 hover:shadow-md hover:-translate-y-[1px]",
        accent:
          "bg-accent-500 text-neutral-900 shadow-sm hover:bg-accent-600 hover:text-white hover:shadow-md hover:-translate-y-[1px]",
      },
      size: {
        default: "h-10 px-5",
        md: "h-10 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-7 text-base",
        xl: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const ButtonComponent = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
ButtonComponent.displayName = "Button";

const Button = React.memo(ButtonComponent);

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };
