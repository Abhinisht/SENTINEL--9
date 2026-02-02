import { useState, useRef, useEffect } from 'react';
import { SecurityState } from '@/types/aegis';
import { cn } from '@/lib/utils';
import { Terminal, Send, Loader2 } from 'lucide-react';

interface CommandInputProps {
  securityState: SecurityState;
  onSubmit: (command: string) => void;
  onChange: (command: string) => void;
  disabled?: boolean;
  isAnalyzing?: boolean;
  connectionState?: 'idle' | 'connecting' | 'connected';
}

export function CommandInput({
  securityState,
  onSubmit,
  onChange,
  disabled,
  isAnalyzing,
  connectionState = 'idle',
}: CommandInputProps) {
  const [command, setCommand] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  // Removed local isAnalyzing assignment since it's now passed as a prop

  const isLocked = disabled || connectionState !== 'connected'; // Disable when locked or not connected

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isLocked) return;

    onSubmit(command);
    setCommand('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCommand(value);
    onChange(value);
  };

  useEffect(() => {
    if (!isLocked && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLocked]);

  return (
    <div className={cn(
      'glass-panel rounded-lg p-4',
      isLocked && 'opacity-50'
    )}>
      <form onSubmit={handleSubmit} className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-primary">
          <Terminal className="w-5 h-5" />
          <span className="font-orbitron text-xs uppercase tracking-wider hidden sm:inline">
            Command
          </span>
        </div>

        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={handleChange}
            disabled={isLocked}
            placeholder={connectionState !== 'connected' ? 'Connect to Layer 9 first...' : isLocked ? 'System locked...' : 'Enter cognitive command...'}
            className={cn(
              'cyber-input w-full pr-12',
              isLocked && 'cursor-not-allowed'
            )}
          />
          
          {/* Typing indicator */}
          {command && !isLocked && (
            <div className="absolute right-14 top-1/2 -translate-y-1/2 flex gap-1">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-100" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-200" />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLocked || !command.trim() || (isAnalyzing ?? false)}
          className={cn(
            'cyber-btn flex items-center gap-2 whitespace-nowrap',
            (isLocked || !command.trim() || connectionState !== 'connected') && 'opacity-40'
          )}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Analyzing...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Verify Intent</span>
            </>
          )}
        </button>
      </form>

      {/* Security state indicator */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className={cn(
            'w-2 h-2 rounded-full',
            securityState === 'secure' && 'bg-secure',
            securityState === 'learning' && 'bg-learning',
            securityState === 'threat' && 'bg-threat',
            securityState === 'locked' && 'bg-locked'
          )} />
          <span className="uppercase tracking-wider">
            Keystroke Analysis Active
          </span>
        </div>
        <span className="text-muted-foreground font-mono">
          Layer 9 • Brain Interface
        </span>
      </div>
    </div>
  );
}

