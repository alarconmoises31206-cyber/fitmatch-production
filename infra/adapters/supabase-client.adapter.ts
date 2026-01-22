// Temporary stub for smoke test
export const createSupabaseClient = () => ({
  auth: {
    getSession: async () => ({ 
      data: { session: null }, 
      error: null 
    }),
    onAuthStateChange: () => ({ 
      data: { subscription: { unsubscribe: () => {} } },
      unsubscribe: () => {}
    }),
    signInWithPassword: async () => ({ 
      data: { user: null, session: null }, 
      error: null 
    }),
    signOut: async () => ({ error: null })
  },
  from: () => ({ 
    select: () => ({ data: [], error: null }) 
  })
});

export const getSupabaseClientForClient = createSupabaseClient;
export const getSupabaseClient = createSupabaseClient;
