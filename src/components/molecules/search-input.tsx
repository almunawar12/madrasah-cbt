import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, ...props }, ref) => (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
      <input
        ref={ref}
        type="search"
        className={cn(
          'w-full pl-9 pr-4 py-2 bg-surface-container-low border-none rounded-full text-sm text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/20 outline-none',
          className,
        )}
        {...props}
      />
    </div>
  ),
);
SearchInput.displayName = 'SearchInput';
