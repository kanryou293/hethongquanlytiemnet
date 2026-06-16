import React, { useEffect } from 'react';
import { X } from 'lucide-react';

function Modal({ isOpen, onClose, title, icon, children, footer, size = 'md' }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-cyber-dark/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-cyber-card border border-cyber-border rounded-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col animate-scale-in`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cyber-border">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 bg-cyber-green/20 rounded-lg text-cyber-green">
                {icon}
              </div>
            )}
            <h2 className="text-2xl font-orbitron font-bold text-cyber-green">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cyber-border rounded transition-colors text-gray-400 hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-cyber-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Modal Footer Buttons
Modal.CancelButton = ({ onClick, children = 'Hủy' }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 bg-cyber-border text-gray-300 rounded font-rajdhani font-semibold hover:bg-cyber-border/70 transition-colors"
  >
    {children}
  </button>
);

Modal.ConfirmButton = ({ onClick, children = 'Xác nhận', disabled = false, loading = false }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className="px-4 py-2 bg-cyber-green text-cyber-dark rounded font-rajdhani font-semibold hover:bg-cyber-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
  >
    {loading && (
      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    )}
    {children}
  </button>
);

export default Modal;
