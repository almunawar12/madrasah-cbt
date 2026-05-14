import * as React from 'react';
import { cn } from '@/lib/utils';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...props }, ref) => (
    <label className="flex items-center gap-2 cursor-pointer group" htmlFor={id}>
      <input
        ref={ref}
        id={id}
        type="radio"
        className={cn(
          'h-4 w-4 border-outline-variant text-primary focus:ring-2 focus:ring-primary/30 transition-all',
          className,
        )}
        {...props}
      />
      {label && (
        <span className="text-sm text-on-surface-variant group-hover:text-on-surface">
          {label}
        </span>
      )}
    </label>
  ),
);
Radio.displayName = 'Radio';
