import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  console.log('🔍 ML Debug endpoint called');
  
  try {
    // Check trainer_profiles table structure
    const { data: trainers, error } = await supabase
      .from('trainer_profiles')
      .select('*')
      .limit(5);
    
    // Also check what tables exist
    const { data: allData } = await supabase
      .from('trainer_profiles')
      .select('*', { count: 'exact', head: true });
    
    res.status(200).json({
      success: true,
      trainer_count: allData?.length || 0,
      sample_trainers: trainers || [],
      error: error?.message,
      columns: trainers?.[0] ? Object.keys(trainers[0]) : ['No columns found'],
      note: 'Check if trainer_profiles has data and correct columns'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}