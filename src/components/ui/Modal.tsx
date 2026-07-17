/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Esc key callback to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Semi-transparent black backdrop with backdrop blur */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full relative z-10 animate-in fade-in zoom-in-95 duration-200"
      >
        <Card className={`${widthClasses[maxWidth]} mx-auto border border-slate-800 bg-slate-900/90 shadow-2xl p-6 flex flex-col max-h-[90vh]`}>
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
            <h3 id="modal-title" className="text-sm font-bold text-slate-100 uppercase tracking-wider font-sans">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg bg-slate-950/40 hover:bg-slate-950 border border-slate-800/50 hover:border-slate-700 transition-colors focus:ring-2 focus:ring-blue-500/50 outline-none cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            {children}
          </div>

          {/* Footer Actions */}
          {footer && (
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800/80 mt-4">
              {footer}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// Confirmation Dialog Variant
// ============================================================================
export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-slate-400 font-sans text-xs sm:text-sm leading-relaxed">{message}</p>
    </Modal>
  );
}
