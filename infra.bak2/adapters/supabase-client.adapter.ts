// infra/adapters/supabase-client.adapter.ts
// Updated to handle RLS permission issues

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { log, error } from "../observability/log";

export type { SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  // Use service role key for server-side operations (bypasses RLS)
  // Fall back to anon key if service key not available
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    error("[SupabaseAdapter] Missing Supabase environment variables", {
      hasUrl: !!supabaseUrl,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })
    throw new Error("Missing Supabase environment variables")
  }

  const usingServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  log("[SupabaseAdapter] Creating Supabase client", {
    url: supabaseUrl.substring(0, 30) + "...",
    keyType: usingServiceKey ? "service_role" : "anon",
    canBypassRLS: usingServiceKey
  })

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })
}

// Function for client-side usage (respects RLS)
export function getSupabaseClientForClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables for client")
  }

  return createSupabaseClient(supabaseUrl, supabaseKey)
}
