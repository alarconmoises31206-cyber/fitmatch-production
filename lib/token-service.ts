// lib/token-service.ts
import { createSupabaseClient } from './supabase';

export async function deductTokens(userId: string, amount: number): Promise<{ success: boolean; remaining?: number; error?: string }> {
  const supabase = createSupabaseClient();
  // Use a transaction via RPC or direct update with condition
  const { data, error } = await supabase
    .rpc('deduct_user_tokens', { user_id: userId, amount });
  if (error) {
    // Fallback: select, check, update
    const { data: wallet } = await supabase
      .from('user_wallets')
      .select('tokens')
      .eq('user_id', userId)
      .single();
    if (!wallet) {
      return { success: false, error: 'Wallet not found' };
    }
    if (wallet.tokens < amount) {
      return { success: false, error: 'Insufficient tokens' };
    }
    const newBalance = wallet.tokens - amount;
    const { error: updateError } = await supabase
      .from('user_wallets')
      .update({ tokens: newBalance })
      .eq('user_id', userId);
    if (updateError) {
      return { success: false, error: updateError.message };
    }
    return { success: true, remaining: newBalance };
  }
  return { success: true, remaining: data };
}

export async function getTokenBalance(userId: string): Promise<number> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from('user_wallets')
    .select('tokens')
    .eq('user_id', userId)
    .single();
  return data?.tokens || 0;
}
