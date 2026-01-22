import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// --- Org Users ---
export interface OrgUser {
  id: string;
  org_id: string;
  user_id: string;
  email: string;
  role: 'admin' | 'member';
  invited_by?: string;
  invited_at: Date;
  joined_at?: Date;
  status: 'pending' | 'active' | 'revoked';
}

export async function addOrgUser(user: Omit<OrgUser, 'id' | 'invited_at' | 'status'> & { status?: OrgUser['status'] }): Promise<OrgUser | null> {
  // Check seat availability
  const { data: org } = await supabase
    .from('orgs')
    .select('seat_limit')
    .eq('id', user.org_id)
    .single()

  if (!org) return null;

  const { count: activeSeats } = await supabase
    .from('org_users')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', user.org_id)
    .eq('status', 'active')

  if (activeSeats !== null && activeSeats >= org.seat_limit) {
    throw new Error('Seat limit exceeded for this organization')
  }

  const { data, error } = await supabase
    .from('org_users')
    .insert({
      ...user,
      status: user.status || 'pending',
      invited_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding org user:', error)
    return null;
  }
  return data as OrgUser;
}

export async function getOrgUsers(orgId: string): Promise<OrgUser[]> {
  const { data, error } = await supabase
    .from('org_users')
    .select('*')
    .eq('org_id', orgId)
    .order('joined_at', { ascending: false })

  if (error) {
    console.error('Error fetching org users:', error)
    return [];
  }
  return data as OrgUser[];
}

// --- Domain Verifications ---
export interface DomainVerification {
  id: string;
  org_id: string;
  domain: string;
  verification_method: 'email' | 'dns';
  token: string;
  verified_at?: Date;
  created_at: Date;
  created_by?: string;
}

export async function createDomainVerification(verification: Omit<DomainVerification, 'id' | 'verified_at' | 'created_at'>): Promise<DomainVerification | null> {
  const { data, error } = await supabase
    .from('domain_verifications')
    .insert({
      ...verification,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating domain verification:', error)
    return null;
  }
  return data as DomainVerification;
}

export async function verifyDomainToken(domain: string, token: string): Promise<DomainVerification | null> {
  const { data, error } = await supabase
    .from('domain_verifications')
    .select('*')
    .eq('domain', domain)
    .eq('token', token)
    .is('verified_at', null)
    .single()

  if (error || !data) return null;

  // Mark as verified
  const { data: updated } = await supabase
    .from('domain_verifications')
    .update({ verified_at: new Date().toISOString() })
    .eq('id', data.id)
    .select()
    .single()

  return updated as DomainVerification;
}

// --- Join Requests ---
export interface JoinRequest {
  id: string;
  org_id: string;
  user_id: string;
  email: string;
  domain: string;
  requested_at: Date;
  status: 'pending' | 'approved' | 'denied';
  reviewed_by?: string;
  reviewed_at?: Date;
  notes?: string;
}

export async function createJoinRequest(request: Omit<JoinRequest, 'id' | 'requested_at' | 'status'>): Promise<JoinRequest | null> {
  const { data, error } = await supabase
    .from('join_requests')
    .insert({
      ...request,
      requested_at: new Date().toISOString(),
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating join request:', error)
    return null;
  }
  return data as JoinRequest;
}
