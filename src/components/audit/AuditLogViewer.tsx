import { useEffect, useState } from 'react';
import { getAuditLogs, clearAuditLogs, AuditLog } from '@/lib/auditLogger';
import { cn } from '@/lib/utils';

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const updateLogs = () => setLogs(getAuditLogs());
    updateLogs();

    // Poll for updates every 1 second for real-time display
    const interval = setInterval(updateLogs, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel rounded-lg p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-orbitron text-sm text-primary tracking-wider">
          SYSTEM AUDIT LOGS
        </h3>
        <button
          onClick={() => {
            clearAuditLogs();
            setLogs([]);
          }}
          className="text-xs text-red-400 hover:text-red-300"
        >
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {logs.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-6">
            No audit logs available
          </div>
        )}

        {logs.map(log => (
          <div
            key={log.id}
            className={cn(
              'border rounded-md p-3 text-xs',
              log.type === 'LOGOUT' && 'border-red-500/30 bg-red-500/5',
              log.type === 'REDIRECT' && 'border-blue-500/30 bg-blue-500/5',
              log.type === 'SECURITY' && 'border-green-500/30 bg-green-500/5',
              !['LOGOUT','REDIRECT','SECURITY'].includes(log.type) &&
                'border-border bg-black/20'
            )}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-[10px] opacity-70">
                {new Date(log.timestamp).toLocaleString()}
              </span>
              <span className="text-[10px] px-2 py-[2px] rounded bg-black/40">
                {log.type}
              </span>
            </div>

            <div className="font-medium text-foreground">
              {log.message}
            </div>

            {log.data && (
              <pre className="mt-2 text-[10px] text-muted-foreground bg-black/30 p-2 rounded overflow-x-auto">
                {JSON.stringify(log.data, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
