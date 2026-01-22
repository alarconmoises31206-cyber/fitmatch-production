// /infra/eventHandlers/workflow.handler.ts
import { eventBus } from "../eventBus/index";
import { eventQueue } from "../eventBus/queue";
import { onUserSignedUp } from "../workflows/onUserSignedUp";
import { onPaymentCompleted } from "../workflows/onPaymentCompleted";
import { onMatchAccepted } from "../workflows/onMatchAccepted";
import { onTrainerOnboarded } from "../workflows/onTrainerOnboarded";
import { onMatchCreated } from "../workflows/onMatchCreated";
import { log, debug, error } from "../observability/log";

export function registerWorkflowHandlers() {
    log("[WorkflowHandlers] Registering workflow handlers for async processing...")

    // Subscribe workflows to the async queue
    eventQueue.subscribe(async (message) => {
        const { event } = message;
        
        try {
            debug("[WorkflowHandlers] Processing event from queue", { 
                eventName: event.name, 
                messageId: message.id 
            })

            switch (event.name) {
                case "user.signed_up":
                    await onUserSignedUp(event.payload)
                    break;
                case "payment.completed":
                    await onPaymentCompleted(event.payload)
                    break;
                case "match.accepted":
                    await onMatchAccepted(event.payload)
                    break;
                case "trainer.onboarded":
                    await onTrainerOnboarded(event.payload)
                    break;
                case "match.created":
                    await onMatchCreated(event.payload)
                    break;
                default:
                    debug("[WorkflowHandlers] No workflow handler for event", { 
                        eventName: event.name 
                    })
            }

            debug("[WorkflowHandlers] Queue processing completed", { 
                eventName: event.name, 
                messageId: message.id 
            })
        } catch (errorMsg) {
            error("[WorkflowHandlers] Failed to process event from queue", { 
                eventName: event.name, 
                messageId: message.id,
                error: errorMsg 
            })
            // TODO: Implement retry logic based on message.attempt
            throw errorMsg;
        }
    })

    // Keep existing synchronous registrations for backward compatibility
    // This ensures real-time handlers still work while async processing is added
    eventBus.subscribe("user.signed_up", (event) => {
        debug("[WorkflowHandlers] Synchronous handler triggered", { 
            eventName: event.name 
        })
        // Async processing is handled by queue, but we log it
    })

    eventBus.subscribe("payment.completed", (event) => {
        debug("[WorkflowHandlers] Synchronous handler triggered", { 
            eventName: event.name 
        })
    })

    eventBus.subscribe("match.accepted", (event) => {
        debug("[WorkflowHandlers] Synchronous handler triggered", { 
            eventName: event.name 
        })
    })

    eventBus.subscribe("trainer.onboarded", (event) => {
        debug("[WorkflowHandlers] Synchronous handler triggered", { 
            eventName: event.name 
        })
    })

    eventBus.subscribe("match.created", (event) => {
        debug("[WorkflowHandlers] Synchronous handler triggered", { 
            eventName: event.name 
        })
    })

    log("[WorkflowHandlers] Workflow handlers registered for async processing", {
        handlers: [
            "user.signed_up → onUserSignedUp",
            "payment.completed → onPaymentCompleted",
            "match.accepted → onMatchAccepted",
            "trainer.onboarded → onTrainerOnboarded",
            "match.created → onMatchCreated"
        ]
    })
}
