// lib/reengagementService.ts - CLEAN MINIMAL VERSION;
// Bridge file for backward compatibility during migration;

// Note: During migration, using simplified version;
// Full domain architecture will be implemented later;

export type NudgeType = 'first_message' | 'follow_up' | 'stalled' | 'reminder';

export interface NudgeData {
  conversation_id: string;
  user_id: string;
  user_role: 'client' | 'trainer';
  nudge_type: NudgeType;
  message?: string;
}

// Minimal implementation for now;
export const reengagementService = {
  async getActiveNudgesForUser(userId: string, userRole: 'client' | 'trainer') {
    console.log('getActiveNudgesForUser stub:', userId, userRole)
    return [];
  },
  
  async hasActiveNudge(conversationId: string, userId: string) {
    console.log('hasActiveNudge stub:', conversationId, userId)
    return false;
  },
  
  async createNudge(nudgeData: NudgeData) {
    console.log('createNudge stub:', nudgeData)
    return { id: 'stub-id', ...nudgeData }
  },
  
  async dismissNudge(nudgeId: string) {
    console.log('dismissNudge stub:', nudgeId)
    return { id: nudgeId }
  },
  
  async dismissAllNudgesForConversation(conversationId: string) {
    console.log('dismissAllNudgesForConversation stub:', conversationId)
    return [];
  },
  
  async checkStalledConversations(daysThreshold: number = 3) {
    console.log('checkStalledConversations stub:', daysThreshold)
    return [];
  },
  
  async getConversationDetails(conversationId: string) {
    console.log('getConversationDetails stub:', conversationId)
    return { conversation: {}, client_nudges: [], trainer_nudges: [] }
  }
}

