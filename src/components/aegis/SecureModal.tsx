import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, X } from 'lucide-react';

interface SecureModalProps {
  isOpen: boolean;
  message?: string;
  onClose: () => void;
}

export function SecureModal({ isOpen, message = 'Intent verified as secure.', onClose }: SecureModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className={cn('relative glass-panel rounded-lg p-6 w-full max-w-md mx-4 border-2')}>
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-secure/10 border-2 border-secure">
            <CheckCircle2 className="w-7 h-7 text-secure" />
          </div>
          <h3 className="font-orbitron text-2xl font-bold text-foreground mb-2">SECURE</h3>
          <p className="text-sm text-muted-foreground mb-4">{message}</p>

          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="cyber-btn"
            >
              Acknowledge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecureModal;
