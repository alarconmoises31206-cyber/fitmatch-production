import { ALERT_CONFIG } from "../../config/alerts.config";
import type { HealthReport, AlertEvaluation, AlertStatus } from "../../types/alert.types";

export function evaluateHealthForAlerts(report: HealthReport): AlertEvaluation {
const issues: string[] = [];

if (!report.db.healthy) issues.push("DATABASE DOWN")
if (!report.redis.healthy) issues.push("REDIS DOWN")

if (report.queues?.memory?.size > ALERT_CONFIG.rules.queueBacklogThreshold) {
issues.push("QUEUE BACKLOG DETECTED")
}

const critical = issues.length >= 2;
const status: AlertStatus = critical ? "CRITICAL" : issues.length ? "DEGRADED" : "HEALTHY";

return { status, issues }
}
