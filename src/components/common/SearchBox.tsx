import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Input } from '../ui/input';

interface SearchBoxProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  placeholder = "Search...",
  value = "",
  onChange,
  onSearch,
  onClear,
  debounceMs = 300,
  className,
  disabled = false,
  autoFocus = false
}) => {
  const [searchValue, setSearchValue] = useState(value);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch && searchValue !== value) {
        onSearch(searchValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchValue, debounceMs, onSearch, value]);

  // Update internal state when external value changes
  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleClear = () => {
    setSearchValue("");
    if (onChange) {
      onChange("");
    }
    if (onClear) {
      onClear();
    }
    if (onSearch) {
      onSearch("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(searchValue);
    }
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      
      <Input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          "pl-10",
          searchValue && "pr-10"
        )}
      />

      {searchValue && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            onClick={handleClear}
            disabled={disabled}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBox;
