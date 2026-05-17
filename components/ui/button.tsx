import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-primary to-nuts text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:brightness-110 active:scale-95',
        accent:
          'bg-gradient-to-r from-accent to-accent-light text-white shadow-lg shadow-accent/30 hover:shadow-accent/50 hover:brightness-110 active:scale-95',
        outline:
          'border border-border bg-transparent text-[#EDE0CE] hover:bg-surface-alt hover:border-primary/50',
        ghost:
          'bg-transparent text-muted-foreground hover:bg-surface-alt hover:text-[#EDE0CE]',
        destructive:
          'bg-gradient-to-r from-red-700 to-red-600 text-white hover:brightness-110 shadow-lg shadow-red-700/25',
        secondary:
          'bg-surface-alt text-[#EDE0CE] hover:bg-border border border-border/50',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
