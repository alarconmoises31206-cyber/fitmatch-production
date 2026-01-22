export type AlertStatus = "HEALTHY" | "DEGRADED" | "CRITICAL";

export interface HealthReport {
db: { healthy: boolean }
redis: { healthy: boolean }
queues?: {
memory: { size: number }
}
}

export interface AlertEvaluation {
status: AlertStatus;
issues: string[];
}
