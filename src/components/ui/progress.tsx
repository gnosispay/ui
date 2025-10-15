import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/utils/cn"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
          <ProgressPrimitive.Root
        data-slot="progress"
        className={cn(
          "bg-muted relative h-2 w-full overflow-hidden rounded-full",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className="h-full w-full flex-1 transition-all"
          style={{ 
            transform: `translateX(-${100 - (value || 0)}%)`,
            backgroundColor: "var(--color-brand)"
          }}
        />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
