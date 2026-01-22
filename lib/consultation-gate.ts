// lib/consultation-gate.ts
import { createSupabaseClient } from './supabase';

export interface ConsultationGateResult {
  allowed: boolean;
  reason?: string;
  state?: string;
  freeMessagesRemaining?: number;
  requiredTokens?: number;
}

export async function checkMessageAllowed(
  conversationId: string,
  senderId: string,
  senderRole: 'client' | 'trainer'
): Promise<ConsultationGateResult> {
  const supabase = createSupabaseClient();
  // Fetch conversation with trainer profile
  const { data: conversation, error } = await supabase
    .from('conversations')
    .select('*, trainer_profiles!inner(free_message_limit, paid_rate_tokens)')
    .eq('id', conversationId)
    .single();
  if (error || !conversation) {
    return { allowed: false, reason: 'Conversation not found' };
  }
  const trainerProfile = conversation.trainer_profiles;
  const state = conversation.consultation_state || 'FREE';
  // Trainer can always reply regardless of state (they are the earner)
  if (senderRole === 'trainer') {
    return { allowed: true, state, freeMessagesRemaining: 0 };
  }
  // Client sending
  if (state === 'ENDED') {
    return { allowed: false, reason: 'Consultation has ended' };
  }
  if (state === 'LOCKED') {
    return { allowed: false, reason: 'Consultation locked, payment required' };
  }
  if (state === 'PAID') {
    // Paid consultation: unlimited messages
    return { allowed: true, state };
  }
  // FREE state
  const freeLimit = trainerProfile.free_message_limit || 3;
  const used = conversation.free_messages_used || 0;
  if (used >= freeLimit) {
    // Exceeded free limit, transition to LOCKED
    await supabase
      .from('conversations')
      .update({ consultation_state: 'LOCKED' })
      .eq('id', conversationId);
    return { allowed: false, reason: 'Free message limit exceeded', state: 'LOCKED' };
  }
  // Increment free_messages_used
  await supabase
    .from('conversations')
    .update({ free_messages_used: used + 1 })
    .eq('id', conversationId);
  const remaining = freeLimit - (used + 1);
  return { allowed: true, state, freeMessagesRemaining: remaining };
}
