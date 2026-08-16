import React, { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AccordionItemProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  subtitle,
  children,
  defaultOpen = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('border-t border-stone-200/80 py-2.5 last:border-b-0', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-1 text-left text-xs font-medium text-stone-700 hover:text-stone-950 transition-colors focus:outline-none"
      >
        <div className="flex flex-col">
          <span className="font-semibold text-stone-800">{title}</span>
          {subtitle && <span className="text-[11px] text-stone-500">{subtitle}</span>}
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-stone-400 transition-transform duration-200 shrink-0 ml-2',
            isOpen && 'rotate-180 text-stone-700'
          )}
        />
      </button>
      {isOpen && (
        <div className="pt-2 pb-1 text-xs text-stone-700 font-sans-tamil leading-relaxed animate-in fade-in-50 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};
