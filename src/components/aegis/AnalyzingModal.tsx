import React from 'react';
import { Loader2 } from 'lucide-react';

interface AnalyzingModalProps {
  isOpen: boolean;
}

export function AnalyzingModal({ isOpen }: AnalyzingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative glass-panel rounded-lg p-6 w-full max-w-sm mx-4 border-2 flex items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <div>
          <div className="font-orbitron text-lg text-foreground">Analyzing Intent...</div>
          <div className="text-sm text-muted-foreground">Running cognitive analysis — please wait</div>
        </div>
      </div>
    </div>
  );
}

export default AnalyzingModal;
