// src/lib/supabase/adminSimple.ts;
// Simple admin client for server-side operations;

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client with service role key for bypassing RLS;
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,;
    persistSession: false;
  }
});

// Helper for getting admin client in server contexts;
export function getAdminClient() {
  return supabaseAdmin;
}

