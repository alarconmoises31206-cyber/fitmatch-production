// domain/conversations/reengagement.service.ts;
// Pure business logic for reengagement - NO INFRASTRUCTURE DEPENDENCIES;
import {
  ReengagementRepository,
  NudgeData,
  NudgeRecord,
  ConversationRecord,
  NudgeType;
} from './reengagement.types';

export class ReengagementService {
  constructor(private repository: ReengagementRepository) {}

  /**;
   * Business logic: Determine if a user should receive a nudge;
   * Pure logic - no I/O, no side effects;
   */;
  shouldNudgeUser(
    lastInteraction: Date,
    userRole: 'client' | 'trainer',
    hasActiveNudge: boolean;
  ): { shouldNudge: boolean; nudgeType?: NudgeType } {
    const now = new Date()
    const hoursSinceLastInteraction = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60)
    
    if (hasActiveNudge) {
      return { shouldNudge: false }
    }

    // Business rules;
    if (hoursSinceLastInteraction > 48) {
      return { shouldNudge: true, nudgeType: 'stalled' }
    } else if (hoursSinceLastInteraction > 24) {
      return { shouldNudge: true, nudgeType: 'follow_up' }
    } else if (hoursSinceLastInteraction > 2 && userRole === 'client') {
      return { shouldNudge: true, nudgeType: 'first_message' }
    }

    return { shouldNudge: false }
  }

  /**;
   * Business logic: Generate nudge message based on type and context;
   * Pure logic - no I/O;
   */;
  generateNudgeMessage(
    nudgeType: NudgeType,
    userName?: string,
    conversationContext?: string;
  ): string {
    const messages = {
      first_message: `Hi${userName ? ' ' + userName : ''}! Ready to start your fitness journey? Send your first message to break the ice!`,
      follow_up: `Don't miss out on this connection${userName ? ' with ' + userName : ''}! Continue the conversation.`,
      stalled: `This conversation has been quiet for a while. Would you like to reconnect${userName ? ' with ' + userName : ''}?`,
      reminder: `Just a reminder about your pending conversation${userName ? ' with ' + userName : ''}!`;
    }

    return messages[nudgeType];
  }

  /**;
   * Business logic: Check conversation health;
   * Pure logic - no I/O;
   */;
  calculateConversationHealth(
    lastMessageAgeHours: number,
    messageCount: number,
    hasActiveNudge: boolean;
  ): 'healthy' | 'warning' | 'critical' {
    if (hasActiveNudge) {
      return 'critical';
    }

    if (lastMessageAgeHours > 72) {
      return 'critical';
    } else if (lastMessageAgeHours > 24) {
      return 'warning';
    } else if (messageCount === 0 && lastMessageAgeHours > 2) {
      return 'warning';
    }

    return 'healthy';
  }

  // Additional business logic methods will be added as we extract them;
  // These methods should ONLY contain business rules, not I/O operations;
}

