import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => (
    <label className="flex items-center gap-2 cursor-pointer group" htmlFor={id}>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className={cn(
          'h-5 w-5 rounded border border-outline-variant text-primary focus:ring-2 focus:ring-primary/30 transition-all',
          className,
        )}
        {...props}
      />
      {label && (
        <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface">
          {label}
        </span>
      )}
    </label>
  ),
);
Checkbox.displayName = 'Checkbox';
