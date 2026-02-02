import { useEffect, useState } from 'react';
import { Lock, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const LOCKOUT_STORAGE_KEY = 'sentinel9-lockout';

interface LockoutOverlayProps {
  isLocked: boolean;
  lockoutEndTime: Date | null;
}

export function LockoutOverlay({ isLocked, lockoutEndTime }: LockoutOverlayProps) {
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    if (!isLocked || !lockoutEndTime) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((lockoutEndTime.getTime() - now.getTime()) / 1000));
      setRemainingTime(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isLocked, lockoutEndTime]);

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md">
      <div className="text-center space-y-8 p-8">
        {/* Animated lock icon */}
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-locked/20 animate-ping" />
          <div className="relative w-full h-full rounded-full border-4 border-locked bg-locked/10 flex items-center justify-center">
            <Lock className="w-16 h-16 text-locked" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="font-orbitron text-3xl font-bold text-locked mb-2">
            SECURITY LOCKDOWN
          </h1>
          <p className="text-muted-foreground">
            Too many failed verification attempts
          </p>
        </div>

        {/* Timer */}
        {remainingTime > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              System will unlock in
            </p>
            <div className="font-mono text-5xl font-bold text-foreground">
              {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
            </div>
          </div>
        )}

        {/* Security info */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Sentinel 9 • Layer 9 Protection Active</span>
        </div>

        {/* Scan lines effect */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 h-px bg-locked/10"
              style={{
                top: `${10 + i * 10}%`,
                animation: `scan ${2 + i * 0.5}s linear infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
