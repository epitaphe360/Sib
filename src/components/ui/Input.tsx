import React from "react"

import { cn } from "@/lib/utils"

const InputComponent = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-slate-300/85 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm ring-offset-white backdrop-blur-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sib-primary focus-visible:ring-offset-2 focus-visible:border-sib-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-400",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
InputComponent.displayName = "Input"

// OPTIMIZATION: Memo to avoid re-renders on every parent update
const Input = React.memo(InputComponent)

export { Input }
