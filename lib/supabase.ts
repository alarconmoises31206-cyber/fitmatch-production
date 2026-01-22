// lib/supabase.ts - PRODUCTION BRIDGE
// Connects pages to infrastructure architecture
// Replaces stub with real database adapter

import { getSupabaseClient } from '../infra/adapters/supabase-client.adapter';
import type { SupabaseClient } from '@supabase/supabase-js';

// Create and export singleton instance for client-side use
let clientInstance: SupabaseClient | null = null;

export function createSupabaseClient(): SupabaseClient {
  if (!clientInstance) {
    clientInstance = getSupabaseClient()
  }
  return clientInstance;
}

// Re-export types for backward compatibility
export type { SupabaseClient }

// Utility functions for common operations (optional, for backward compatibility)
export const supabase = createSupabaseClient()

// This comment will trigger a file change
// Last updated: 20:42:48
