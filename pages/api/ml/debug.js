import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  console.log('🔍 ML Debug endpoint called');
  
  try {
    // Check trainer_profiles table
    const { data: trainers, error: trainerError } = await supabase
      .from('trainer_profiles')
      .select('*')
      .limit(5);
    
    // Check profiles table
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    // Check client_top_matches
    const { data: matches, error: matchError } = await supabase
      .from('client_top_matches')
      .select('*')
      .limit(5);
    
    res.status(200).json({
      success: true,
      trainer_profiles: {
        count: trainers?.length || 0,
        sample: trainers?.[0] || null,
        error: trainerError?.message,
        columns: trainers?.[0] ? Object.keys(trainers[0]) : []
      },
      profiles: {
        count: profiles?.length || 0,
        sample: profiles?.[0] || null,
        error: profileError?.message
      },
      client_top_matches: {
        count: matches?.length || 0,
        sample: matches?.[0] || null,
        error: matchError?.message
      },
      note: 'Database structure analysis'
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}