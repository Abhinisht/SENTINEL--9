import { useState, useEffect } from 'react';
import { Shield, Lock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { AuditLogModal } from '@/components/audit/AuditLogModal';
import { logAuditEvent } from '@/lib/auditLogger';

const MAX_ATTEMPTS = 3;
const LOCKOUT_TIME = 30;
const DEMO_PASSKEY = 'AEGIS-9';

export default function Login() {
  const navigate = useNavigate();

  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(
    Number(localStorage.getItem('sentinel9-attempts')) || 0
  );
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(
    Number(localStorage.getItem('sentinel9-lockout')) || null
  );
  const [remaining, setRemaining] = useState(0);
  const [showAudit, setShowAudit] = useState(false);

  const isLocked = lockoutUntil !== null && Date.now() < lockoutUntil;

  useEffect(() => {
    if (!isLocked) return;

    const interval = setInterval(() => {
      const seconds = Math.max(
        0,
        Math.ceil((lockoutUntil! - Date.now()) / 1000)
      );
      setRemaining(seconds);

      if (seconds === 0) {
        localStorage.removeItem('sentinel9-lockout');
        localStorage.removeItem('sentinel9-attempts');
        setAttempts(0);
        setLockoutUntil(null);
        setError('');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, lockoutUntil]);

  const handleLogin = () => {
    if (isLocked) return;

    if (passkey === DEMO_PASSKEY) {
      localStorage.setItem('sentinel9-auth', 'true');
      logAuditEvent('LOGIN', 'User successfully logged in', {
        route: '/',
        timestamp: new Date().toISOString(),
      });
      navigate('/');
      return;
    }

    const next = attempts + 1;
    setAttempts(next);
    localStorage.setItem('sentinel9-attempts', String(next));

    logAuditEvent('LOGIN_ATTEMPT', 'Failed login attempt', {
      attempts: next,
      maxAttempts: MAX_ATTEMPTS,
      timestamp: new Date().toISOString(),
    });

    if (next >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_TIME * 1000;
      setLockoutUntil(until);
      localStorage.setItem('sentinel9-lockout', String(until));
      logAuditEvent('LOGIN_LOCKOUT', 'System locked due to too many failed attempts', {
        lockoutDuration: LOCKOUT_TIME,
        timestamp: new Date().toISOString(),
      });
      setError('Too many failed attempts. System locked.');
    } else {
      setError(`Invalid passkey. ${MAX_ATTEMPTS - next} attempts remaining.`);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-panel w-full max-w-md p-8 rounded-xl">
          <div className="flex flex-col items-center mb-6">
            <div
              className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center mb-4 border',
                isLocked
                  ? 'bg-threat/20 border-threat text-threat'
                  : 'bg-primary/20 border-primary text-primary'
              )}
            >
              {isLocked ? <Lock /> : <Shield />}
            </div>

            <h1 className="font-orbitron text-2xl font-bold">Sentinel 9</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Secure Passkey Access
            </p>
          </div>

          <input
            type="password"
            placeholder="Enter Passkey"
            value={passkey}
            onChange={e => setPasskey(e.target.value)}
            disabled={isLocked}
            className="w-full mb-3 px-4 py-3 rounded-md bg-muted/30 border border-border"
          />

          {error && (
            <p className="text-xs text-threat text-center mb-2">{error}</p>
          )}

          {isLocked && (
            <p className="text-xs text-muted-foreground text-center mb-2">
              Try again in <span className="text-threat">{remaining}s</span>
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={isLocked}
            className="w-full py-3 rounded-md bg-primary text-primary-foreground font-medium"
          >
            Authenticate
          </button>

          {/* AUDIT BUTTON */}
          <button
            onClick={() => setShowAudit(true)}
            className="mt-4 w-full flex items-center justify-center gap-2
                       text-xs text-muted-foreground hover:text-primary"
          >
            <FileText className="w-4 h-4" />
            View System Audit Logs
          </button>

          <p className="text-[10px] text-muted-foreground text-center mt-4">
            Demo Passkey: <span className="text-primary">AEGIS-9</span>
          </p>
        </div>
      </div>

      {/* AUDIT MODAL */}
      <AuditLogModal open={showAudit} onClose={() => setShowAudit(false)} />
    </>
  );
}
