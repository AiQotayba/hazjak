import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
  {
    variants: {
      variant: {
        brand:
          "bg-brand text-white hover:bg-brand-hover shadow-md shadow-brand/20",
        dark: "bg-bg-elevated text-text-base hover:bg-bg-card",
        outline:
          "border border-text-subtle bg-transparent text-text-base hover:border-text-muted",
        ghost: "bg-transparent text-text-muted hover:text-text-base hover:bg-bg-elevated",
        danger: "bg-negative/20 text-negative hover:bg-negative/30",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-[var(--radius-pill)]",
        md: "h-11 px-6 text-sm rounded-[var(--radius-pill)] tracking-wide",
        lg: "h-12 px-8 text-base rounded-[var(--radius-pill)]",
        icon: "h-11 w-11 rounded-full p-0",
      },
    },
    defaultVariants: { variant: "brand", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
