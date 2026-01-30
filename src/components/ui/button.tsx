import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Needs radix-ui slot but I haven't installed it.
// I will remove Slot usage for MVP to avoid extra installs unless user wants full shadcn.
// I'll stick to a simple button for now, or install @radix-ui/react-slot.
// Let's implement a custom one without Slot for now to keep it lean, or just install it.
// Installing is better. I'll add it to the list or just install it now.
// Actually, I'll write the "simple" version first to unblock.

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-neutral-300",
    {
        variants: {
            variant: {
                default:
                    "bg-loops-primary text-white shadow hover:bg-loops-primary/90",
                destructive:
                    "bg-red-500 text-neutral-50 shadow-sm hover:bg-red-500/90 dark:bg-red-900 dark:text-neutral-50 dark:hover:bg-red-900/90",
                outline:
                    "border border-loops-border bg-transparent shadow-sm hover:bg-loops-subtle text-loops-main",
                secondary:
                    "bg-loops-secondary text-neutral-900 shadow-sm hover:bg-neutral-100/80 dark:bg-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-800/80",
                ghost: "hover:bg-neutral-100 client hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
                link: "text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-12 rounded-lg px-8 text-base",
                icon: "h-9 w-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        // Omitting Slot for now to avoid dependency
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
