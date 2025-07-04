import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const iconButtonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "text-button-black bg-button-bg hover:bg-button-bg-hover",
        destructive: "bg-destructive text-destructive-foreground hover:bg-[--destructive-hover]",
        outline: "border bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "w-8 h-8 rounded-lg",
        default: "w-10 h-10 rounded-lg",
        lg: "w-12 h-12 rounded-xl",
      },
      layout: {
        standalone: "",
        withLabel: "flex-col gap-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      layout: "standalone",
    },
  }
)

interface IconButtonProps extends React.ComponentProps<"button">,
  VariantProps<typeof iconButtonVariants> {
  asChild?: boolean
  icon: React.ReactNode
  label?: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, layout, asChild = false, icon, label, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const hasLabel = !!label

    return (
      <div className={cn(
        "inline-flex",
        hasLabel && "flex-col items-center gap-2"
      )}>
        <Comp
          ref={ref}
          className={cn(
            iconButtonVariants({ 
              variant, 
              size, 
              layout: hasLabel ? "withLabel" : "standalone",
              className 
            })
          )}
          {...props}
        >
          {icon}
        </Comp>
        {label && (
          <span className="text-xs text-foreground">{label}</span>
        )}
      </div>
    )
  }
)

IconButton.displayName = "IconButton"

export { IconButton, iconButtonVariants } 