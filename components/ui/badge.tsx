import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/20 text-primary-light border border-primary/30',
        accent: 'bg-accent/20 text-accent-light border border-accent/30',
        cyan: 'bg-fun-cyan/15 text-fun-cyan-light border border-fun-cyan/25',
        secondary: 'bg-surface-alt text-zinc-300 border border-border',
        success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        error: 'bg-red-500/20 text-red-400 border border-red-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
