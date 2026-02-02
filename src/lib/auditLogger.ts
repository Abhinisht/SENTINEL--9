export interface AuditLog {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  data?: Record<string, any>;
}

const STORAGE_KEY = 'sentinel9-audit-logs';

export function logAuditEvent(
  type: string,
  message: string,
  data?: Record<string, any>
) {
  const logs: AuditLog[] = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || '[]'
  );

  const newLog: AuditLog = {
    id: crypto.randomUUID(),
    type,
    message,
    timestamp: new Date().toISOString(),
    data,
  };

  logs.unshift(newLog); // latest on top

  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function getAuditLogs(): AuditLog[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

export function clearAuditLogs() {
  localStorage.removeItem(STORAGE_KEY);
}
