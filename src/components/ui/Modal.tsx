import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }[maxWidth];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${maxWidthClass} bg-[#0b1222] border border-slate-800 rounded-lg shadow-2xl p-6 sm:p-8 text-left transition-all animate-in fade-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-sky-500 rounded-xs" />
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
                {title}
              </h3>
            </div>
            {subtitle && (
              <p className="mt-1 text-xs sm:text-sm text-slate-400 font-normal">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 text-slate-300 text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
