import { ALERT_CONFIG } from "../../config/alerts.config";
import type { AlertStatus } from "../../types/alert.types";

// In-memory fallback - would be replaced with Redis in production
let lastAlertStatus: AlertStatus = "HEALTHY";
let lastAlertAt = 0;

export function shouldAlert(newStatus: AlertStatus): boolean {
const now = Date.now()
const cooldownExpired = now - lastAlertAt > ALERT_CONFIG.cooldownMinutes * 60000;

if (newStatus !== lastAlertStatus && cooldownExpired) {
lastAlertStatus = newStatus;
lastAlertAt = now;
return true;
}
return false;
}

export function getLastAlertStatus(): AlertStatus {
return lastAlertStatus;
}

export function resetAlertState(): void {
lastAlertStatus = "HEALTHY";
lastAlertAt = 0;
}
