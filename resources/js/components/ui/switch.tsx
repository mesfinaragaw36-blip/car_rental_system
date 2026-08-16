import * as React from "react"

import { cn } from "@/lib/utils"

function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  className,
  ...props
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
} & Omit<React.ComponentProps<"button">, "type" | "onClick" | "disabled" | "role" | "aria-checked">) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      data-state={checked ? "checked" : "unchecked"}
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input",
        className,
      )}
      {...props}
    >
      <span
        data-state={checked ? "checked" : "unchecked"}
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  )
}

export { Switch }
