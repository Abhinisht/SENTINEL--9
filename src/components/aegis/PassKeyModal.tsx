import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { KeyRound, Timer, AlertTriangle, Lock } from 'lucide-react';

interface PassKeyModalProps {
  isOpen: boolean;
  timer: number;
  maxAttempts: number;
  onSuccess: () => void;     // restart session
  onLockout: () => void;     
  onCancel: () => void;
}

const DEMO_PASSKEY = 'AEGIS9';

export function PassKeyModal({
  isOpen,
  timer,
  maxAttempts,
  onSuccess,
  onLockout,
  onCancel,
}: PassKeyModalProps) {
  const [passKey, setPassKey] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(maxAttempts);
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Reset state on open */
  useEffect(() => {
    if (isOpen) {
      setPassKey('');
      setAttemptsLeft(maxAttempts);
      setError(false);
      inputRef.current?.focus();
    }
  }, [isOpen, maxAttempts]);

  /* Auto lockout when timer reaches 0 */
  useEffect(() => {
    if (isOpen && timer <= 0) {
      onLockout(); // 🔒 Trigger security lockdown
      onCancel();
    }
  }, [isOpen, timer, onLockout, onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!passKey.trim()) return;

    /* ✅ Correct key */
    if (passKey.toUpperCase() === DEMO_PASSKEY) {
      onSuccess(); // 🔥 NO secure popup here
      onCancel(); // Close modal on success
      return;
    }

    /* ❌ Wrong key */
    const nextAttempts = Math.max(0, attemptsLeft - 1);
    setAttemptsLeft(nextAttempts);
    setError(true);
    setIsShaking(true);
    setPassKey('');

    setTimeout(() => setIsShaking(false), 400);

    /* 🔒 Lockout */
    if (nextAttempts <= 0) {
      onLockout();
      onCancel(); // Close modal on lockout
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const urgent = timer <= 30;
  const critical = timer <= 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={cn(
          'relative glass-panel rounded-lg p-8 w-full max-w-md mx-4',
          'border-2 transition-all duration-300',
          critical
            ? 'border-threat glow-red'
            : urgent
            ? 'border-learning'
            : 'border-primary glow-cyan',
          isShaking && 'animate-shake'
        )}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>

          <h3 className="font-orbitron text-xl font-bold">
            Restart Session
          </h3>
          <p className="text-sm text-muted-foreground">
            Enter your PassKey to restart the system session
          </p>
        </div>

        {/* Timer */}
        <div
          className={cn(
            'flex items-center justify-center gap-2 mb-6 py-3 rounded',
            critical
              ? 'bg-threat/20 text-threat'
              : urgent
              ? 'bg-learning/20 text-learning'
              : 'bg-muted text-muted-foreground'
          )}
        >
          <Timer className="w-5 h-5" />
          <span className="font-mono text-2xl font-bold">
            {formatTime(timer)}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="password"
            value={passKey}
            onChange={(e) => {
              setPassKey(e.target.value.toUpperCase());
              setError(false);
            }}
            placeholder="ENTER PASSKEY"
            className={cn(
              'cyber-input text-center text-xl tracking-widest',
              error && 'border-threat focus:ring-threat'
            )}
            maxLength={10}
            autoComplete="off"
          />

          {error && (
            <div className="flex items-center justify-center gap-2 text-threat text-sm">
              <AlertTriangle className="w-4 h-4" />
              Invalid PassKey
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-sm">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span
              className={cn(
                attemptsLeft <= 1 ? 'text-threat' : 'text-muted-foreground'
              )}
            >
              {attemptsLeft} attempt{attemptsLeft !== 1 && 's'} remaining
            </span>
          </div>

          <button
            type="submit"
            disabled={!passKey}
            className="cyber-btn w-full"
          >
            Verify PassKey
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Demo PassKey: <span className="text-primary">AEGIS9</span>
        </p>
      </div>
    </div>
  );
}
