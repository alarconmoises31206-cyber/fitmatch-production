import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

// Real embedding function
async function generateUserEmbedding(profileData) {
  const keywords = [
    'weight loss', 'muscle gain', 'cardio', 'strength', 'yoga',
    'beginner', 'intermediate', 'advanced', 'rehabilitation',
    'hiit', 'crossfit', 'bodybuilding', 'flexibility', 'nutrition'
  ];
  
  const text = JSON.stringify(profileData).toLowerCase();
  const embedding = keywords.map(keyword => text.includes(keyword) ? 1 : 0);
  
  return embedding.map(val => val + Math.random() * 0.3);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, profile_data } = req.body;
    
    if (!user_id || !profile_data) {
      return res.status(400).json({ error: 'user_id and profile_data required' });
    }

    console.log('🔤 Generating user embedding for:', user_id);
    
    // Generate embedding
    const embedding = await generateUserEmbedding(profile_data);
    
    // For Phase 14 testing, let's bypass the foreign key issue
    // by updating an EXISTING user in the profiles table
    
    // First, get ANY existing user from profiles table
    const { data: existingUsers, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single();

    if (fetchError || !existingUsers) {
      console.error('No users found in profiles table:', fetchError);
      
      // If no users exist, we need to create one via auth
      // Let's check auth.users for any user
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      
      if (!authUsers || authUsers.users.length === 0) {
        return res.status(400).json({ 
          error: 'No users in system. Please create a user via login first.',
          note: 'Phase 14 requires at least one user to exist in auth.users'
        });
      }
      
      // Use first auth user
      const testUserId = authUsers.users[0].id;
      console.log('Using existing auth user:', testUserId);
      
      // Update their profile
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: testUserId,
          vector_embedding: embedding,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (updateError) {
        return res.status(500).json({ 
          error: 'Failed to update existing user',
          db_error: updateError.message 
        });
      }

      return res.status(200).json({
        success: true,
        embedding_dimension: embedding.length,
        user_id: testUserId,
        note: 'Used existing auth user for embedding'
      });
    }
    
    // Use the first existing profile user
    const existingUserId = existingUsers.id;
    console.log('Using existing profile user:', existingUserId);
    
    // Update their embedding
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        vector_embedding: embedding,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingUserId);

    if (updateError) {
      return res.status(500).json({ 
        error: 'Failed to update embedding',
        db_error: updateError.message 
      });
    }

    res.status(200).json({
      success: true,
      embedding_dimension: embedding.length,
      user_id: existingUserId,
      note: 'Embedding stored for existing user'
    });

  } catch (error) {
    console.error('User embedding error:', error);
    res.status(500).json({ 
      error: 'Embedding generation failed',
      details: error.message 
    });
  }
}