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
        nuts: 'bg-nuts/20 text-nuts-light border border-nuts/30',
        secondary: 'bg-surface-alt text-[#EDE0CE] border border-border',
        success: 'bg-accent/20 text-accent-light border border-accent/30',
        error: 'bg-red-800/30 text-red-300 border border-red-700/40',
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
