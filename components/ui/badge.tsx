import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/15 text-primary-dark border border-primary/25',
        accent: 'bg-accent/15 text-accent-dark border border-accent/25',
        nuts: 'bg-nuts/15 text-nuts-dark border border-nuts/25',
        secondary: 'bg-surface-alt text-ink border border-border',
        success: 'bg-accent/15 text-accent-dark border border-accent/25',
        error: 'bg-red-100 text-red-700 border border-red-200',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
