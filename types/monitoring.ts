export interface SystemHealthReport {
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    [serviceName: string]: {
      status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
      circuitState?: 'OPEN' | 'HALF_OPEN' | 'CLOSED';
      failuresLastHour?: number;
      latencyMs?: number;
    }
  }
  queues: {
    redis?: { size: number; deadLetter: number }
    memory?: { size: number; deadLetter: number }
  }
  eventsLastHour: number;
  db: { healthy: boolean; latencyMs: number | null }
  redis: { healthy: boolean; latencyMs: number | null }
}
