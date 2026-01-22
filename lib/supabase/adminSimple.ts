// lib/supabase/adminSimple.ts;
import { createClient } from '@supabase/supabase-js';

// Direct environment variables (no secrets.ts dependency)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Admin client missing environment variables')
}

// Create admin client with service role key;
export const adminSimple = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false;
  }
})

