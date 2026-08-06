import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-sm rounded-lg font-headline-md text-[16px] transition-all disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary hover:bg-inverse-primary text-on-primary shadow-[0_4px_14px_rgba(173,198,255,0.2)] hover:shadow-[0_6px_20px_rgba(173,198,255,0.3)]",
        secondary:
          "bg-surface-container-high text-on-surface hover:bg-primary/20 hover:text-primary",
        ghost: "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
        destructive: "bg-error-container text-on-error-container hover:bg-error/80",
      },
      size: {
        sm: "px-md py-xs text-[14px]",
        md: "px-md py-sm",
        lg: "w-full py-md",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";
