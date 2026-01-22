// supabaseClient.ts - Clean version
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jllzubbtdbwlnnbqrkdw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsbHp1YmJ0ZGJ3bG5uYnFya2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MjA0MzAsImV4cCI6MjA3OTk5NjQzMH0.fboTKkbTZ1pot0FAcT1EDC5uNLToGcHLEp8jrUM4RrM';

// Create the client instance
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Export the client instance as both default and named
export const supabase = supabaseClient;
export default supabaseClient;

// Also export a function if your code expects it
export const createSupabaseClient = () => supabaseClient
