import { useState, useEffect } from 'react';
import { X, Trash2, LogIn, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditLog {
  id: string;
  type: 'LOGIN' | 'LOGOUT' | 'REDIRECT';
  message: string;
  timestamp: string;
  metadata?: {
    route?: string;
    securityState?: string;
    activeModules?: string[];
    failedAttempts?: number;
  };
}

interface AuditLogModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuditLogModal({ open, onClose }: AuditLogModalProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (!open) return;

    const updateLogs = () => setLogs(JSON.parse(localStorage.getItem('sentinel9-audit-logs') || '[]'));
    updateLogs();

    // Poll for updates every 1 second for real-time display
    const interval = setInterval(updateLogs, 1000);

    return () => clearInterval(interval);
  }, [open]);

  const clearLogs = () => {
    localStorage.removeItem('sentinel9-audit-logs');
    setLogs([]);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[85vh] mx-4 glass-panel rounded-xl border border-border overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="font-orbitron text-lg text-primary">
            SYSTEM AUDIT LOGS
          </h2>

          <div className="flex items-center gap-3">
            <button
              onClick={clearLogs}
              className="text-xs text-threat hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-white/20
                         flex items-center justify-center
                         hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)] space-y-4">
          {logs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              No audit logs available
            </p>
          )}

          {logs.slice().reverse().map(log => (
            <div
              key={log.id}
              className={cn(
                'rounded-lg p-4 border',
                log.type === 'LOGOUT' && 'border-threat/40 bg-threat/10',
                log.type === 'LOGIN' && 'border-secure/40 bg-secure/10',
                log.type === 'REDIRECT' && 'border-learning/40 bg-learning/10'
              )}
            >
              {/* TITLE ROW */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {log.type === 'LOGIN' && <LogIn className="w-4 h-4 text-secure" />}
                  {log.type === 'LOGOUT' && <LogOut className="w-4 h-4 text-threat" />}
                  <span className="font-medium text-sm">
                    {log.message}
                  </span>
                </div>

                <span className="text-[10px] text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>

              {/* DETAILS */}
              {log.metadata && (
                <div className="text-xs text-muted-foreground space-y-1">
                  {log.metadata.route && (
                    <div>Route: <span className="text-foreground">{log.metadata.route}</span></div>
                  )}
                  {log.metadata.securityState && (
                    <div>Security State: <span className="text-foreground">{log.metadata.securityState}</span></div>
                  )}
                  {log.metadata.activeModules && (
                    <div>Active Modules: {log.metadata.activeModules.join(', ')}</div>
                  )}
                  {typeof log.metadata.failedAttempts === 'number' && (
                    <div>Failed Attempts: {log.metadata.failedAttempts}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
