import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number; // 0 - 100
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const clamped = Math.min(100, Math.max(0, value));

    return (
      <div
        ref={ref}
        className={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-stone-200', className)}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-terracotta-600 transition-all duration-300 ease-out"
          style={{ transform: `translateX(-${100 - clamped}%)` }}
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';
