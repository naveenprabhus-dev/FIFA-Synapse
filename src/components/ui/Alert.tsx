/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { Card } from './Card';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}: AlertProps) {
  const styles = {
    info: 'border-l-blue-500 bg-blue-950/10 text-blue-300 border border-slate-800',
    success: 'border-l-emerald-500 bg-emerald-950/10 text-emerald-300 border border-slate-800',
    warning: 'border-l-amber-500 bg-amber-950/10 text-amber-300 border border-slate-800',
    error: 'border-l-rose-500 bg-rose-950/10 text-rose-300 border border-slate-800',
  };

  const icons = {
    info: <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />,
  };

  return (
    <div className={`p-4 rounded-xl border-l-4 flex items-start space-x-3 ${styles[variant]} ${className}`}>
      {icons[variant]}
      <div className="flex-1 space-y-1">
        {title && <h5 className="text-xs font-bold uppercase tracking-wider font-sans text-slate-100">{title}</h5>}
        <div className="text-xs leading-relaxed font-sans text-slate-300">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors cursor-pointer"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Toast Component (Single visual element)
// ============================================================================
export interface ToastProps {
  title: string;
  message: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
}

export function Toast({ title, message, variant = 'info', onClose }: ToastProps) {
  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-sm w-full border border-slate-800 bg-slate-900/90 shadow-2xl p-4 flex items-start space-x-3 animate-in slide-in-from-bottom-5 duration-300">
      <Alert variant={variant} title={title} onClose={onClose} className="w-full bg-transparent border-none p-0">
        {message}
      </Alert>
    </Card>
  );
}
