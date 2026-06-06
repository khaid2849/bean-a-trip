import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-[var(--border-default)] bg-white dark:bg-sumi-100 px-2.5 py-1 text-sm text-[var(--text-primary)] transition-colors outline-none",
        "placeholder:text-[var(--text-tertiary)]",
        "hover:border-[var(--border-hover)]",
        "focus-visible:border-terracotta focus-visible:ring-1 focus-visible:ring-terracotta/30",
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--text-primary)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-[var(--text-danger)] aria-invalid:ring-1 aria-invalid:ring-[var(--text-danger)]/30",
        className
      )}
      {...props}
    />
  )
}

export { Input }
