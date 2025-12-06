import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function generateTrainerEmbedding(trainerData) {
  const keywords = [
    'weight loss', 'muscle gain', 'cardio', 'strength', 'yoga',
    'beginner', 'intermediate', 'advanced', 'rehabilitation',
    'hiit', 'crossfit', 'bodybuilding', 'flexibility', 'nutrition',
    'personal training', 'group fitness', 'one-on-one', 'online coaching'
  ];
  
  const text = `${trainerData.bio || ''} ${trainerData.specialties?.join(' ') || ''}`.toLowerCase();
  const embedding = keywords.map(keyword => text.includes(keyword) ? 1 : 0);
  
  return embedding.map(val => val + Math.random() * 0.3);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { trainer_id, trainer_data } = req.body;
    
    if (!trainer_id || !trainer_data) {
      return res.status(400).json({ error: 'trainer_id and trainer_data required' });
    }

    console.log('🔤 Generating trainer embedding for:', trainer_id);
    
    const embedding = await generateTrainerEmbedding(trainer_data);
    
    // Store in trainer_profiles table
    const { error } = await supabase
      .from('trainer_profiles')
      .update({ 
        vector_embedding: embedding,
        updated_at: new Date().toISOString()
      })
      .eq('id', trainer_id);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to store trainer embedding' });
    }

    console.log('✅ Trainer embedding stored for:', trainer_id);

    res.status(200).json({
      success: true,
      embedding,
      dimension: embedding.length,
      trainer_id,
      note: 'Trainer embedding generated and stored'
    });

  } catch (error) {
    console.error('Trainer embedding error:', error);
    res.status(500).json({ 
      error: 'Trainer embedding failed',
      details: error.message 
    });
  }
}