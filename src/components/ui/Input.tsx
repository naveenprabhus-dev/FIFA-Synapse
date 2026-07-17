/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { Search } from 'lucide-react';

// ============================================================================
// Input Component
// ============================================================================
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, leftIcon, id, type = 'text', ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-500 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            type={type}
            ref={ref}
            className={`w-full bg-slate-950/60 border rounded-lg px-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-sans transition-all duration-200 ${
              leftIcon ? 'pl-10' : ''
            } ${error ? 'border-rose-500/50 focus:ring-rose-500/20' : 'border-slate-800 focus:border-blue-500/50'} ${className}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props}
          />
        </div>
        {error && (
          <span id={`${id}-error`} className="text-xs text-rose-400 font-sans pl-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ============================================================================
// SearchBar Component
// ============================================================================
export interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className = '', onChange, ...props }, ref) => {
    return (
      <Input
        type="text"
        ref={ref}
        leftIcon={<Search className="w-4 h-4" />}
        className={`${className}`}
        onChange={onChange}
        {...props}
      />
    );
  }
);
SearchBar.displayName = 'SearchBar';

// ============================================================================
// Textarea Component
// ============================================================================
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">
            {label}
          </label>
        )}
        <textarea
          id={id}
          ref={ref}
          className={`w-full bg-slate-950/60 border rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-sans min-h-[100px] resize-y transition-all duration-200 ${
            error ? 'border-rose-500/50 focus:ring-rose-500/20' : 'border-slate-800 focus:border-blue-500/50'
          } ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {error && (
          <span id={`${id}-error`} className="text-xs text-rose-400 font-sans pl-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// ============================================================================
// Select Component
// ============================================================================
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, id, children, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">
            {label}
          </label>
        )}
        <select
          id={id}
          ref={ref}
          className={`w-full bg-slate-950/60 border rounded-lg px-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-sans transition-all duration-200 appearance-none cursor-pointer ${
            error ? 'border-rose-500/50 focus:ring-rose-500/20' : 'border-slate-800 focus:border-blue-500/50'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && (
          <span id={`${id}-error`} className="text-xs text-rose-400 font-sans pl-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

// ============================================================================
// Switch/Toggle Component
// ============================================================================
export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className = '', label, description, checked, id, ...props }, ref) => {
    return (
      <label htmlFor={id} className="flex items-start justify-between cursor-pointer space-x-4 select-none">
        <div className="flex flex-col space-y-0.5">
          <span className="text-sm font-semibold text-slate-200 font-sans leading-none">{label}</span>
          {description && <span className="text-xs text-slate-500 font-sans">{description}</span>}
        </div>
        <div className="relative flex items-center mt-0.5">
          <input
            id={id}
            type="checkbox"
            ref={ref}
            checked={checked}
            className="sr-only peer"
            {...props}
          />
          <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 transition-colors duration-200" />
        </div>
      </label>
    );
  }
);
Switch.displayName = 'Switch';
