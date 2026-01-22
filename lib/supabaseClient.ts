// Temporary stub for smoke test
const supabaseInstance = {
  auth: {
    getSession: async () => ({
      data: { session: null },
      error: null
    }),
    getUser: async () => ({
      data: { user: { id: 'test-user-id' } },
      error: null
    }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
      unsubscribe: () => {}
    }),
    get user() { return null; }
  },
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null })
  })
};

export const supabase = supabaseInstance;
export const createSupabaseClient = () => supabaseInstance;
