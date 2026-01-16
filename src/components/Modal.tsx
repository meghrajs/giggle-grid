import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        className={cn(
          'relative z-10 w-full max-w-lg mx-4 p-6 bg-card rounded-3xl shadow-lifted animate-bounce-in',
          className
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors focus-ring"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        {title && (
          <h2 className="text-2xl font-bold mb-4 pr-10">{title}</h2>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
