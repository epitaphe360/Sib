import React from "react"

import { cn } from "@/lib/utils"

/**
 * SIB 2026 — Input
 * Hauteur 40px, bordure fine, focus ring primaire.
 */
const InputComponent = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg bg-white border border-neutral-200 px-3.5 text-sm text-neutral-900",
          "placeholder:text-neutral-400",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-0 focus-visible:border-primary-600",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus-visible:border-primary-500",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
InputComponent.displayName = "Input"

const Input = React.memo(InputComponent)

export { Input }
