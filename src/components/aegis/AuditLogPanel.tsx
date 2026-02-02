import { AuditLog } from '@/lib/auditLogger';

export function AuditLogPanel({ logs }: { logs: AuditLog[] }) {
  if (!logs.length) return null;

  return (
    <div className="mt-6 glass-panel p-4 rounded-lg">
      <h3 className="font-orbitron text-sm text-primary mb-3">
        Session Audit Logs
      </h3>

      <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
        {logs.map(log => (
          <div
            key={log.id}
            className="flex justify-between border-b border-white/5 pb-1"
          >
            <span className="text-muted-foreground">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
