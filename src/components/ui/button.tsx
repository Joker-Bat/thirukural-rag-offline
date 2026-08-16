import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'chip';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary: 'bg-terracotta-600 hover:bg-terracotta-700 text-white shadow-sm hover:shadow active:bg-terracotta-800 rounded-xl',
      secondary: 'bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl',
      outline: 'border border-stone-300 bg-white/80 hover:bg-stone-100 text-stone-700 rounded-xl shadow-subtle',
      ghost: 'hover:bg-stone-200/60 text-stone-600 hover:text-stone-900 rounded-lg',
      chip: 'border border-stone-300/80 bg-white hover:border-terracotta-500 hover:bg-terracotta-50/50 text-stone-700 hover:text-terracotta-700 rounded-full text-xs font-normal shadow-subtle text-left',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-5 py-3 text-base',
      icon: 'p-2 w-9 h-9',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
