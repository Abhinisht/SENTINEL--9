import { useEffect, useState } from 'react';
import { AuditLog, getAuditLogs } from '@/lib/auditLogger';

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    setLogs(getAuditLogs());
  }, []);

  return logs;
}
