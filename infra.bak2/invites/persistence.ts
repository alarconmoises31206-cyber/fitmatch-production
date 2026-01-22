import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface Invite {
  id: string;
  org_name: string;
  org_domain?: string;
  seat_limit: number;
  expires_at: Date;
  created_by: string;
  created_at: Date;
  used: boolean;
  token: string;
}

export interface CreateInviteParams {
  org_name: string;
  org_domain?: string;
  seat_limit?: number;
  created_by: string;
  expires_in_days?: number;
}

/**
 * Creates a new invite in the database with a cryptographically random token.
 */
export async function createInvite(params: CreateInviteParams): Promise<Invite | null> {
  const token = require('crypto').randomBytes(32).toString('hex')
  const expires_at = new Date()
  expires_at.setDate(expires_at.getDate() + (params.expires_in_days || 7))

  const { data, error } = await supabase
    .from('invites')
    .insert({
      org_name: params.org_name,
      org_domain: params.org_domain || null,
      seat_limit: params.seat_limit || 3,
      created_by: params.created_by,
      expires_at: expires_at.toISOString(),
      token: token,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating invite:', error)
    return null;
  }

  return data as Invite;
}

/**
 * Validates an invite token: checks if it exists, is not used, and not expired.
 */
export async function validateInviteToken(token: string): Promise<Invite | null> {
  const { data, error } = await supabase
    .from('invites')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !data) {
    return null;
  }

  return data as Invite;
}

/**
 * Marks an invite as used by its token.
 */
export async function markInviteUsed(token: string): Promise<boolean> {
  const { error } = await supabase
    .from('invites')
    .update({ used: true })
    .eq('token', token)

  return !error;
}
