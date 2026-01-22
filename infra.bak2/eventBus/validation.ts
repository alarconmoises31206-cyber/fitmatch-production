// /infra/eventBus/validation.ts
import { DomainEventPayload } from "../../domain/events/primitives";
import { log, error, warn, debug } from "../observability/log";

// TODO: Import actual Zod schemas when they are defined
// import { eventSchemas } from "@/domain/events/contracts";

export function validateEventPayload<T extends DomainEventPayload>(
    eventName: string,
    payload: T
): T {
    try {
        debug("[EventValidation] Validating event payload", { 
            eventName 
        })

        // TODO: Implement actual Zod schema validation when schemas are defined
        // For now, just do basic validation
        if (!payload || typeof payload !== 'object') {
            error("[EventValidation] Invalid payload type", { 
                eventName,
                payloadType: typeof payload
            })
            throw new Error(`Invalid payload type for ${eventName}: expected object, got ${typeof payload}`)
        }

        // Basic validation for required fields in known events
        switch (eventName) {
            case 'user.signed_up':
                if (!payload.userId || !payload.email) {
                    throw new Error(`Missing required fields for ${eventName}: userId and email are required`)
                }
                break;
            case 'payment.completed':
                if (!payload.paymentId || !payload.matchId || !payload.amount) {
                    throw new Error(`Missing required fields for ${eventName}: paymentId, matchId, and amount are required`)
                }
                break;
            case 'match.accepted':
                if (!payload.matchId || !payload.trainerId) {
                    throw new Error(`Missing required fields for ${eventName}: matchId and trainerId are required`)
                }
                break;
            case 'trainer.onboarded':
                if (!payload.trainerId || !payload.completedAt) {
                    throw new Error(`Missing required fields for ${eventName}: trainerId and completedAt are required`)
                }
                break;
            case 'match.created':
                if (!payload.matchId || !payload.clientId || !payload.trainerId) {
                    throw new Error(`Missing required fields for ${eventName}: matchId, clientId, and trainerId are required`)
                }
                break;
        }

        debug("[EventValidation] Event payload validation successful", { 
            eventName 
        })
        return payload;
    } catch (errorMsg) {
        error("[EventValidation] Validation error", { 
            eventName, 
            error: errorMsg 
        })
        throw errorMsg;
    }
}
