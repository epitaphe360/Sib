import React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[96px] w-full rounded-lg bg-white border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 leading-relaxed",
          "placeholder:text-neutral-400",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-0 focus-visible:border-primary-600",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50",
          "dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus-visible:border-primary-500",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
