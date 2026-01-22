// domain/conversations/reengagement.types.ts
// Domain types and interfaces for reengagement logic
// PURE TYPES - no infrastructure dependencies
export type NudgeType = 'first_message' | 'follow_up' | 'stalled' | 'reminder'
export interface NudgeData {
  conversation_id: string
  user_id: string
  user_role: 'client' | 'trainer'
  nudge_type: NudgeType
  message?: string
}
export interface NudgeRecord {
  id: string
  conversation_id: string
  user_id: string
  user_role: 'client' | 'trainer'
  nudge_type: NudgeType
  message?: string
  dismissed: boolean
  created_at: string
  updated_at: string
}
export interface ConversationRecord {
  id: string
  client_id: string
  trainer_id: string
  last_message_at?: string
  created_at: string
  updated_at: string
}
// PORT: Interface that domain defines, infrastructure implements
export interface ReengagementRepository {
  getActiveNudgesForUser(userId: string, userRole: 'client' | 'trainer'): Promise<NudgeRecord[]>
  hasActiveNudge(conversationId: string, userId: string): Promise<boolean>
  createNudge(nudgeData: NudgeData): Promise<NudgeRecord>
  dismissNudge(nudgeId: string): Promise<void>
  getConversationDetails(conversationId: string): Promise<ConversationRecord | null>
  getStalledConversations(thresholdHours: number): Promise<ConversationRecord[]>
}

