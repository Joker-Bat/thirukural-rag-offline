import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'terracotta' | 'stone' | 'success' | 'indigo' | 'outline';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'stone', children, ...props }, ref) => {
    const variants = {
      terracotta: 'bg-terracotta-50 text-terracotta-700 border-terracotta-200',
      stone: 'bg-stone-100 text-stone-700 border-stone-200',
      success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      indigo: 'bg-indigoSlate-800 text-white border-indigoSlate-800',
      outline: 'border-stone-300 text-stone-600 bg-transparent',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';
